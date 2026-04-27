const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const SkillAnalysis = require('./models/SkillAnalysis');

const app = express();
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skill-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackAnalyses = [];
let useFallbackData = false;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'skill-service', datastore: useFallbackData ? 'memory' : 'mongodb' });
});

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('Skill Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Skill Service MongoDB connected');
  } catch (err) {
    if (!USE_IN_MEMORY_FALLBACK) {
      console.error('Skill Service failed to connect to MongoDB.');
      console.error('Start MongoDB or set USE_IN_MEMORY_FALLBACK=true to run without it.');
      console.error(err.message);
      process.exit(1);
    }
    useFallbackData = true;
    console.warn('MongoDB unavailable. Skill Service running with fallback in-memory data.');
    console.warn(err.message);
  }
}

initializeDataSource().catch((err) => {
  useFallbackData = true;
  console.warn('Failed to initialize data source. Skill Service running with fallback in-memory data.');
  console.warn(err.message);
});

app.post('/analyze', async (req, res) => {
  const { userSkills, careerSkills, targetTechnology, targetCategory, stack } = req.body;
  const matched = userSkills.filter(skill => careerSkills.includes(skill));
  const missing = careerSkills.filter(skill => !userSkills.includes(skill));
  const score = Math.round((matched.length / careerSkills.length) * 100);
  const level = score >= 80 ? 'advanced' : score >= 50 ? 'intermediate' : 'beginner';
  if (useFallbackData) {
    const analysis = { _id: randomUUID(), userSkills, careerSkills, targetTechnology, targetCategory, stack, matched, missing, score, level };
    fallbackAnalyses.push(analysis);
    return res.json({ matched, missing, score, level, targetTechnology, targetCategory, stack, analysisId: analysis._id });
  }
  const analysis = await SkillAnalysis.create({ userSkills, careerSkills, matched, missing, score });
  res.json({ matched, missing, score, level, targetTechnology, targetCategory, stack, analysisId: analysis._id });
});

app.listen(PORT, () => console.log(`Skill Service running on port ${PORT}`));

