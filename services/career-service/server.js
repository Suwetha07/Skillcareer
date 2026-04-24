const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Category = require('./models/Category');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackCategories = [
  { name: 'Programming Languages', skills: ['JavaScript', 'Python', 'Java', 'TypeScript'] },
  { name: 'Frontend', skills: ['React', 'Vue', 'Angular', 'CSS'] },
  { name: 'Backend', skills: ['Node.js', 'Express', 'Django', 'Spring Boot'] },
  { name: 'Databases', skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'] },
  { name: 'Cloud & DevOps', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
  { name: 'Security', skills: ['OWASP', 'Authentication', 'Authorization', 'Network Security'] },
];
let useFallbackData = false;

app.use(cors());
app.use(express.json());

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('Career Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Career Service MongoDB connected');
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.create(fallbackCategories);
    }
  } catch (err) {
    if (!USE_IN_MEMORY_FALLBACK) {
      console.error('Career Service failed to connect to MongoDB.');
      console.error('Start MongoDB or set USE_IN_MEMORY_FALLBACK=true to run without it.');
      console.error(err.message);
      process.exit(1);
    }
    useFallbackData = true;
    console.warn('MongoDB unavailable. Career Service running with fallback in-memory data.');
    console.warn(err.message);
  }
}

initializeDataSource().catch((err) => {
  useFallbackData = true;
  console.warn('Failed to initialize data source. Career Service running with fallback in-memory data.');
  console.warn(err.message);
});

app.get('/categories', async (req, res) => {
  if (useFallbackData) {
    return res.json(fallbackCategories);
  }
  try {
    const categories = await Category.find();
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load categories' });
  }
});

app.get('/skills/:category', async (req, res) => {
  if (useFallbackData) {
    const category = fallbackCategories.find((item) => item.name === req.params.category);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json(category.skills);
  }
  try {
    const category = await Category.findOne({ name: req.params.category });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.json(category.skills);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load skills' });
  }
});

app.listen(PORT, () => console.log(`Career Service running on port ${PORT}`));
