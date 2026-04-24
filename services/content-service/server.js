const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const Course = require('./models/Course');

const app = express();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const skillResourceMap = {
  'JavaScript': ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 'https://javascript.info/'],
  'Python': ['https://docs.python.org/3/tutorial/', 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', 'https://realpython.com/'],
  'Java': ['https://docs.oracle.com/javase/tutorial/', 'https://www.youtube.com/watch?v=eIrMbAQSU34', 'https://spring.io/guides'],
  'TypeScript': ['https://www.typescriptlang.org/docs/', 'https://www.youtube.com/watch?v=30LWjhZzg50', 'https://www.totaltypescript.com/'],
  'React': ['https://react.dev/learn', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 'https://roadmap.sh/react'],
  'Node.js': ['https://nodejs.org/en/learn', 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'https://expressjs.com/'],
  'MongoDB': ['https://www.mongodb.com/docs/', 'https://www.youtube.com/watch?v=ofme2o29ngU', 'https://www.mongodb.com/developer/'],
  'Docker': ['https://docs.docker.com/get-started/', 'https://www.youtube.com/watch?v=Gjnup-PuquQ', 'https://www.freecodecamp.org/news/what-is-docker/'],
  'Kubernetes': ['https://kubernetes.io/docs/home/', 'https://www.youtube.com/watch?v=X48VuDVv0do', 'https://roadmap.sh/kubernetes'],
  'AWS': ['https://docs.aws.amazon.com/', 'https://www.youtube.com/watch?v=ulprqHHWlng', 'https://aws.amazon.com/getting-started/'],
};
const fallbackCourses = [];
let useFallbackData = false;

function createQuiz(skill, stage) {
  return [
    {
      prompt: `${skill}: choose the best concept for ${stage.toLowerCase()}.`,
      options: [`${skill} basics`, `${skill} painting`, `${skill} cooking`, `${skill} gaming`],
      answer: `${skill} basics`,
    },
    {
      prompt: `Which option is most relevant to ${skill}?`,
      options: ['CLI and configuration', 'Gardening tools', 'Movie editing', 'Sports training'],
      answer: 'CLI and configuration',
    },
  ];
}

function buildCourse(skill) {
  const resources = skillResourceMap[skill] || [
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} tutorial`)}`,
    `https://roadmap.sh/search?q=${encodeURIComponent(skill)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${skill} documentation`)}`,
  ];
  const stages = ['Foundation Level', 'Implementation Level', 'Project Level'];
  return {
    _id: `course-${skill.toLowerCase().replace(/\s+/g, '-')}`,
    skill,
    description: `${skill} course catalogue with guided videos, documentation, milestones, and assessment checkpoints.`,
    milestones: stages.map((stage, index) => ({
      _id: randomUUID(),
      title: `${skill} ${stage}`,
      description: `Reach ${stage.toLowerCase()} proficiency in ${skill} with focused practice and milestone evaluation.`,
      order: index + 1,
      resources,
      assignment: {
        question: `MCQ assessment for ${skill} ${stage}`,
        submission: '',
        score: 0,
        quiz: createQuiz(skill, stage),
        passed: false,
      },
      completed: false,
    })),
    certificationFlag: false,
  };
}

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
      const seedCourse = buildCourse('Docker');
      await Course.create({
        skill: seedCourse.skill,
        description: seedCourse.description,
        milestones: seedCourse.milestones.map(({ _id, ...milestone }) => milestone),
        certificationFlag: seedCourse.certificationFlag,
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
    const course = buildCourse(req.params.skill);
    return res.json(course.milestones);
  }
  const course = await Course.findOne({ skill: req.params.skill });
  if (!course) return res.json(buildCourse(req.params.skill).milestones);
  res.json(course.milestones);
});

app.get('/by-skill', async (req, res) => {
  const skill = req.query.skill;
  if (!skill) return res.status(400).json({ message: 'Skill is required' });
  if (useFallbackData) {
    return res.json(buildCourse(skill));
  }
  const course = await Course.findOne({ skill });
  if (!course) return res.json(buildCourse(skill));
  res.json(course);
});

app.get('/:skill', async (req, res) => {
  if (useFallbackData) {
    return res.json(buildCourse(req.params.skill));
  }
  const course = await Course.findOne({ skill: req.params.skill });
  if (!course) return res.json(buildCourse(req.params.skill));
  res.json(course);
});

app.post('/assignment/submit', async (req, res) => {
  const { skill, milestoneId, submission, userId, answers = [] } = req.body;
  if (useFallbackData) {
    const course = buildCourse(skill);
    const milestone = course.milestones.find((item) => item._id === milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    milestone.assignment.submission = submission;
    const correctAnswers = milestone.assignment.quiz.filter((item) => answers.includes(item.answer)).length;
    const score = milestone.assignment.quiz.length ? Math.round((correctAnswers / milestone.assignment.quiz.length) * 100) : 0;
    milestone.assignment.score = score;
    milestone.assignment.passed = score >= 60;
    milestone.completed = score >= 60;
    return res.json({ score, milestoneId, skill, userId, completed: score >= 60, passed: score >= 60 });
  }
  const course = await Course.findOne({ skill });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const milestone = course.milestones.id(milestoneId);
  if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
  milestone.assignment.submission = submission;
  const quiz = milestone.assignment.quiz || [];
  const correctAnswers = quiz.filter((item) => answers.includes(item.answer)).length;
  const score = quiz.length ? Math.round((correctAnswers / quiz.length) * 100) : 0;
  milestone.assignment.score = score;
  milestone.assignment.passed = score >= 60;
  milestone.completed = score >= 60;
  await course.save();
  res.json({ score, milestoneId, skill, completed: score >= 60, passed: score >= 60 });
});

app.listen(PORT, () => console.log(`Content Service running on port ${PORT}`));
