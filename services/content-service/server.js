const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const Course = require('./models/Course');

const app = express();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackCourses = [
  {
    _id: 'course-docker',
    skill: 'Docker',
    description: 'Learn Docker fundamentals, images, containers, and orchestration for modern cloud-native development.',
    milestones: [
      {
        _id: randomUUID(),
        title: 'Basics',
        description: 'Understand container concepts, Docker installation, and basic commands.',
        order: 1,
        resources: [
          'https://www.youtube.com/watch?v=Gjnup-PuquQ',
          'https://docs.docker.com/get-started/',
          'https://www.freecodecamp.org/news/what-is-docker/'
        ],
        assignment: { question: 'Describe the difference between a Docker image and a container.', submission: '', score: 0 },
        completed: false,
      },
      {
        _id: randomUUID(),
        title: 'Images & Containers',
        description: 'Build Dockerfiles, manage images, and run containers for projects.',
        order: 2,
        resources: [
          'https://www.youtube.com/watch?v=fqMOX6JJhGo',
          'https://docs.docker.com/engine/reference/builder/',
          'https://www.digitalocean.com/community/tutorials/how-to-build-docker-images'
        ],
        assignment: { question: 'Write a short Dockerfile to create an image for a Node.js app.', submission: '', score: 0 },
        completed: false,
      },
      {
        _id: randomUUID(),
        title: 'Advanced Orchestration',
        description: 'Learn Docker Compose, networks, and multi-container workflows.',
        order: 3,
        resources: [
          'https://www.youtube.com/watch?v=Qw9zlE3t8Ko',
          'https://docs.docker.com/compose/',
          'https://www.freecodecamp.org/news/docker-compose-explained/'
        ],
        assignment: { question: 'Explain how Docker Compose simplifies multi-container applications.', submission: '', score: 0 },
        completed: false,
      },
    ],
    certificationFlag: false,
  },
];
let useFallbackData = false;

app.use(cors());
app.use(express.json());

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('Content Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Content Service MongoDB connected');
    const count = await Course.countDocuments();
    if (count === 0) {
      await Course.create({
        skill: fallbackCourses[0].skill,
        description: fallbackCourses[0].description,
        milestones: fallbackCourses[0].milestones.map(({ _id, ...milestone }) => milestone),
        certificationFlag: fallbackCourses[0].certificationFlag,
      });
    }
  } catch (err) {
    if (!USE_IN_MEMORY_FALLBACK) {
      console.error('Content Service failed to connect to MongoDB.');
      console.error('Start MongoDB or set USE_IN_MEMORY_FALLBACK=true to run without it.');
      console.error(err.message);
      process.exit(1);
    }
    useFallbackData = true;
    console.warn('MongoDB unavailable. Content Service running with fallback in-memory data.');
    console.warn(err.message);
  }
}

initializeDataSource().catch((err) => {
  useFallbackData = true;
  console.warn('Failed to initialize data source. Content Service running with fallback in-memory data.');
  console.warn(err.message);
});

app.get('/milestones/:skill', async (req, res) => {
  if (useFallbackData) {
    const course = fallbackCourses.find((item) => item.skill === req.params.skill);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.json(course.milestones);
  }
  const course = await Course.findOne({ skill: req.params.skill });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course.milestones);
});

app.get('/:skill', async (req, res) => {
  if (useFallbackData) {
    const course = fallbackCourses.find((item) => item.skill === req.params.skill);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.json(course);
  }
  const course = await Course.findOne({ skill: req.params.skill });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

app.post('/assignment/submit', async (req, res) => {
  const { skill, milestoneId, submission, userId } = req.body;
  if (useFallbackData) {
    const course = fallbackCourses.find((item) => item.skill === skill);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const milestone = course.milestones.find((item) => item._id === milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    milestone.assignment.submission = submission;
    const score = submission && submission.length > 20 ? 90 : 70;
    milestone.assignment.score = score;
    milestone.completed = true;
    return res.json({ score, milestoneId, skill, userId, completed: true });
  }
  const course = await Course.findOne({ skill });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const milestone = course.milestones.id(milestoneId);
  if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
  milestone.assignment.submission = submission;
  const score = submission && submission.length > 20 ? 90 : 70;
  milestone.assignment.score = score;
  milestone.completed = true;
  await course.save();
  res.json({ score, milestoneId, skill, completed: true });
});

app.listen(PORT, () => console.log(`Content Service running on port ${PORT}`));
