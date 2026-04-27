const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Progress = require('./models/Progress');

const app = express();
const PORT = process.env.PORT || 5006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/progress-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackProgress = new Map();
let useFallbackData = false;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'progress-service', datastore: useFallbackData ? 'memory' : 'mongodb' });
});

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('Progress Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Progress Service MongoDB connected');
  } catch (err) {
    if (!USE_IN_MEMORY_FALLBACK) {
      console.error('Progress Service failed to connect to MongoDB.');
      console.error('Start MongoDB or set USE_IN_MEMORY_FALLBACK=true to run without it.');
      console.error(err.message);
      process.exit(1);
    }
    useFallbackData = true;
    console.warn('MongoDB unavailable. Progress Service running with fallback in-memory data.');
    console.warn(err.message);
  }
}

initializeDataSource().catch((err) => {
  useFallbackData = true;
  console.warn('Failed to initialize data source. Progress Service running with fallback in-memory data.');
  console.warn(err.message);
});

app.post('/update', async (req, res) => {
  const {
    userId,
    completedSkills = [],
    milestoneProgress = [],
    assignmentScores = [],
    dailyHoursSpent = 0,
    modulesCompleted = 0,
    testsAttended = 0,
    testsPassed = 0,
    testsFailed = 0,
    toolProgress = [],
  } = req.body;
  const totalMilestones = milestoneProgress.length;
  const completedMilestones = milestoneProgress.filter(item => item.completed).length;
  const progressPercentage = totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  if (useFallbackData) {
    const progress = {
      userId,
      completedSkills,
      milestoneProgress,
      assignmentScores,
      dailyHoursSpent,
      modulesCompleted,
      testsAttended,
      testsPassed,
      testsFailed,
      toolProgress,
      progressPercentage,
    };
    fallbackProgress.set(userId, progress);
    return res.json(progress);
  }
  const progress = await Progress.findOneAndUpdate(
    { userId },
    { completedSkills, milestoneProgress, assignmentScores, dailyHoursSpent, modulesCompleted, testsAttended, testsPassed, testsFailed, toolProgress, progressPercentage },
    { upsert: true, new: true }
  );
  res.json(progress);
});

app.get('/:userId', async (req, res) => {
  if (useFallbackData) {
    const progress = fallbackProgress.get(req.params.userId);
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    return res.json(progress);
  }
  const progress = await Progress.findOne({ userId: req.params.userId });
  if (!progress) return res.status(404).json({ message: 'Progress not found' });
  res.json(progress);
});

app.listen(PORT, () => console.log(`Progress Service running on port ${PORT}`));

