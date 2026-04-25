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
  'JavaScript': {
    foundation: [
      { label: 'JavaScript Basics', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction' },
      { label: 'ES6+ Essentials', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
      { label: 'Variables, Arrays, and Functions', url: 'https://javascript.info/first-steps' },
    ],
    implementation: [
      { label: 'Synchronous vs Asynchronous JavaScript', url: 'https://javascript.info/event-loop' },
      { label: 'Promises and Async/Await', url: 'https://javascript.info/async' },
      { label: 'Working with Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' },
    ],
    project: [
      { label: 'DOM Project Walkthrough', url: 'https://www.youtube.com/watch?v=0ik6X4DJKCc' },
      { label: 'Build a Small JavaScript App', url: 'https://javascript30.com/' },
      { label: 'JavaScript Best Practices', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_went_wrong' },
    ],
  },
  'Python': {
    foundation: [
      { label: 'Python Basics', url: 'https://docs.python.org/3/tutorial/introduction.html' },
      { label: 'Data Types and Control Flow', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
      { label: 'Functions and Modules', url: 'https://realpython.com/defining-your-own-python-function/' },
    ],
    implementation: [
      { label: 'File Handling', url: 'https://docs.python.org/3/tutorial/inputoutput.html' },
      { label: 'APIs with Python', url: 'https://realpython.com/api-integration-in-python/' },
      { label: 'Error Handling', url: 'https://realpython.com/python-exceptions/' },
    ],
    project: [
      { label: 'Mini Python Project', url: 'https://realpython.com/tutorials/projects/' },
      { label: 'Automation Practice', url: 'https://automatetheboringstuff.com/' },
      { label: 'Python Best Practices', url: 'https://realpython.com/python-pep8/' },
    ],
  },
  'React': {
    foundation: [
      { label: 'React Components', url: 'https://react.dev/learn/your-first-component' },
      { label: 'JSX and Props', url: 'https://react.dev/learn/passing-props-to-a-component' },
      { label: 'State Basics', url: 'https://react.dev/learn/state-a-components-memory' },
    ],
    implementation: [
      { label: 'Effects and Data Fetching', url: 'https://react.dev/learn/synchronizing-with-effects' },
      { label: 'Routing Basics', url: 'https://reactrouter.com/en/main/start/tutorial' },
      { label: 'Forms and Controlled Inputs', url: 'https://react.dev/reference/react-dom/components/input' },
    ],
    project: [
      { label: 'Build a React Project', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
      { label: 'Project Structure and Reuse', url: 'https://react.dev/learn/thinking-in-react' },
      { label: 'React Performance Basics', url: 'https://react.dev/learn/render-and-commit' },
    ],
  },
  'Node.js': {
    foundation: [
      { label: 'Node.js Basics', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs' },
      { label: 'Modules and NPM', url: 'https://nodejs.org/en/learn/command-line/an-introduction-to-the-npm-package-manager' },
      { label: 'File System and CLI', url: 'https://nodejs.org/en/learn/manipulating-files/working-with-files-in-nodejs' },
    ],
    implementation: [
      { label: 'HTTP and Express Basics', url: 'https://expressjs.com/' },
      { label: 'Async Patterns in Node.js', url: 'https://nodejs.org/en/learn/asynchronous-work/asynchronous-flow-control' },
      { label: 'Authentication Flow', url: 'https://nodejs.org/en/learn/getting-started/security-best-practices' },
    ],
    project: [
      { label: 'Build a REST API', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4' },
      { label: 'Testing and Validation', url: 'https://nodejs.org/en/learn/test-runner/using-nodejs-test-runner' },
      { label: 'Deployment Basics', url: 'https://nodejs.org/en/learn/getting-started/nodejs-with-docker' },
    ],
  },
  'Docker': {
    foundation: [
      { label: 'Docker Basics', url: 'https://docs.docker.com/get-started/' },
      { label: 'Images and Containers', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ' },
      { label: 'Docker CLI Practice', url: 'https://www.freecodecamp.org/news/what-is-docker/' },
    ],
    implementation: [
      { label: 'Dockerfiles', url: 'https://docs.docker.com/build/concepts/dockerfile/' },
      { label: 'Docker Compose', url: 'https://docs.docker.com/compose/' },
      { label: 'Container Networking', url: 'https://docs.docker.com/network/' },
    ],
    project: [
      { label: 'Containerize an App', url: 'https://docs.docker.com/get-started/workshop/' },
      { label: 'Debugging Containers', url: 'https://docs.docker.com/reference/cli/docker/container/logs/' },
      { label: 'Docker Best Practices', url: 'https://docs.docker.com/develop/dev-best-practices/' },
    ],
  },
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
  const resourceSet = skillResourceMap[skill] || {
    foundation: [
      { label: `${skill} Basics`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} basics`)}` },
      { label: `${skill} Official Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} official documentation`)}` },
      { label: `${skill} Core Concepts`, url: `https://roadmap.sh/search?q=${encodeURIComponent(skill)}` },
    ],
    implementation: [
      { label: `${skill} Practical Implementation`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} implementation tutorial`)}` },
      { label: `${skill} Intermediate Guide`, url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} intermediate guide`)}` },
      { label: `${skill} Hands-on Walkthrough`, url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} hands on walkthrough`)}` },
    ],
    project: [
      { label: `${skill} Project Tutorial`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} project tutorial`)}` },
      { label: `${skill} Real Project Examples`, url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} project examples`)}` },
      { label: `${skill} Best Practices`, url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} best practices`)}` },
    ],
  };
  const stages = ['Foundation Level', 'Implementation Level', 'Project Level'];
  const stageKeys = ['foundation', 'implementation', 'project'];
  return {
    _id: `course-${skill.toLowerCase().replace(/\s+/g, '-')}`,
    skill,
    description: `${skill} course catalogue with guided videos, documentation, milestones, and assessment checkpoints.`,
    milestones: stages.map((stage, index) => ({
      _id: randomUUID(),
      title: `${skill} ${stage}`,
      description: `Reach ${stage.toLowerCase()} proficiency in ${skill} with focused practice and milestone evaluation.`,
      order: index + 1,
      resources: resourceSet[stageKeys[index]] || [],
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
