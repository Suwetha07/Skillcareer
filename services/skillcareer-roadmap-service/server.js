const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const Roadmap = require('./models/Roadmap');

const app = express();
const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roadmap-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackRoadmaps = [];
let useFallbackData = false;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'roadmap-service', datastore: useFallbackData ? 'memory' : 'mongodb' });
});

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('Roadmap Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Roadmap Service MongoDB connected');
  } catch (err) {
    if (!USE_IN_MEMORY_FALLBACK) {
      console.error('Roadmap Service failed to connect to MongoDB.');
      console.error('Start MongoDB or set USE_IN_MEMORY_FALLBACK=true to run without it.');
      console.error(err.message);
      process.exit(1);
    }
    useFallbackData = true;
    console.warn('MongoDB unavailable. Roadmap Service running with fallback in-memory data.');
    console.warn(err.message);
  }
}

initializeDataSource().catch((err) => {
  useFallbackData = true;
  console.warn('Failed to initialize data source. Roadmap Service running with fallback in-memory data.');
  console.warn(err.message);
});

const skillDurations = { beginner: 7, intermediate: 14, advanced: 21 };
const topicLibrary = {
  'JavaScript': ['Variables and scope', 'Functions and array methods', 'Async programming', 'DOM patterns'],
  'Python': ['Syntax and data structures', 'Functions and modules', 'File handling', 'APIs and scripting'],
  'Java': ['OOP basics', 'Collections', 'Spring intro', 'REST services'],
  'TypeScript': ['Types and interfaces', 'Generics', 'Type narrowing', 'React integration'],
  'React': ['Components and props', 'State and hooks', 'Routing', 'API integration'],
  'Vue': ['Vue components', 'Composition API', 'State flow', 'Routing'],
  'Angular': ['Components', 'Services and DI', 'RxJS basics', 'Routing'],
  'CSS': ['Layouts', 'Flexbox and Grid', 'Responsive design', 'Animations'],
  'Node.js': ['Runtime and modules', 'Express APIs', 'Authentication', 'Deployment'],
  'Express': ['Routing', 'Middleware', 'Validation', 'Error handling'],
  'Django': ['Project setup', 'Models and ORM', 'Views and APIs', 'Auth'],
  'Spring Boot': ['Project setup', 'REST controllers', 'Data layer', 'Security'],
  'MongoDB': ['Documents and collections', 'CRUD', 'Aggregation', 'Indexing'],
  'PostgreSQL': ['Schema design', 'Queries and joins', 'Indexes', 'Transactions'],
  'MySQL': ['Relational modeling', 'CRUD', 'Optimization', 'Stored routines'],
  'Redis': ['Caching', 'Data structures', 'Pub/Sub', 'Session storage'],
  'Docker': ['Containers', 'Dockerfiles', 'Compose', 'Optimization'],
  'Kubernetes': ['Pods and deployments', 'Services', 'Config and secrets', 'Scaling'],
  'AWS': ['Core services', 'IAM', 'Compute and storage', 'Monitoring'],
  'CI/CD': ['Pipelines', 'Testing gates', 'Deploy flows', 'Release strategy'],
  'OWASP': ['Top 10', 'Common vulnerabilities', 'Secure coding', 'Testing'],
  'Authentication': ['Sessions and tokens', 'OAuth basics', 'MFA', 'Access control'],
  'Authorization': ['RBAC', 'Permissions', 'Policy design', 'Audit trails'],
  'Network Security': ['Protocols', 'Encryption', 'Firewalls', 'Threat detection'],
};

app.post('/generate', async (req, res) => {
  const { role, interests, targetTechnology, targetCategory, missingSkills, score, dailyStudyTime = 2, completionTarget = 80 } = req.body;
  const level = score >= 80 ? 'advanced' : score >= 50 ? 'intermediate' : 'beginner';
  const roadmap = missingSkills.map((skill, index) => ({
    skill,
    level,
    phase: index % 3 === 0 ? 'Foundations' : index % 3 === 1 ? 'Applied' : 'Mastery',
    durationDays: skillDurations[level] || 10,
    subtopics: topicLibrary[skill] || [`${skill} fundamentals`, `${skill} implementation`, `${skill} practice project`, `${skill} interview prep`],
  }));
  const structured = roadmap.map((item, index) => ({
    ...item,
    order: index + 1,
    sessions: Math.max(1, Math.ceil(item.durationDays * 60 / dailyStudyTime || 1)),
  }));
  const days = structured.reduce((sum, item) => sum + item.durationDays, 0);
  const schedule = [];
  let currentDay = 1;
  structured.forEach(item => {
    for (let i = 0; i < item.durationDays; i += 1) {
      schedule.push({ day: currentDay, skill: item.skill, topic: item.phase });
      currentDay += 1;
    }
  });
  if (useFallbackData) {
    const roadmapDoc = {
      _id: randomUUID(),
      role,
      interests,
      targetTechnology,
      targetCategory,
      missingSkills,
      level,
      dailyStudyTime,
      completionTarget,
      structured,
      schedule,
      totalDays: days,
    };
    fallbackRoadmaps.push(roadmapDoc);
    return res.json(roadmapDoc);
  }
  const roadmapDoc = await Roadmap.create({ role, interests, targetTechnology, targetCategory, missingSkills, level, dailyStudyTime, completionTarget, structured, schedule, totalDays: days });
  res.json(roadmapDoc);
});

app.post('/schedule', async (req, res) => {
  const { roadmapId, startDate } = req.body;
  if (useFallbackData) {
    const roadmap = fallbackRoadmaps.find((item) => item._id === roadmapId);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    roadmap.schedule = roadmap.schedule.map((entry, index) => ({
      ...entry,
      date: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + index)).toISOString().split('T')[0],
    }));
    return res.json(roadmap);
  }
  const roadmap = await Roadmap.findById(roadmapId);
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
  const schedule = roadmap.schedule.map((entry, index) => ({
    ...entry,
    date: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + index)).toISOString().split('T')[0],
  }));
  roadmap.schedule = schedule;
  await roadmap.save();
  res.json(roadmap);
});

app.listen(PORT, () => console.log(`Roadmap Service running on port ${PORT}`));

