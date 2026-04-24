const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Category = require('./models/Category');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/career-service';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackCategories = [
  {
    name: 'Programming Languages',
    skills: ['JavaScript', 'Python', 'Java', 'TypeScript'],
    technologies: [
      { name: 'JavaScript', stack: 'Frontend and backend scripting', skills: ['ES6+', 'DOM', 'Async/Await', 'Node basics'], companies: ['Google', 'PayPal', 'Netflix'], roles: ['Frontend Developer', 'Full Stack Developer'] },
      { name: 'Python', stack: 'Automation and backend development', skills: ['Syntax', 'Flask', 'Data handling', 'APIs'], companies: ['Amazon', 'Instagram', 'Spotify'], roles: ['Python Developer', 'Automation Engineer'] },
      { name: 'Java', stack: 'Enterprise application development', skills: ['OOP', 'Spring', 'Microservices', 'JVM'], companies: ['Infosys', 'Oracle', 'Accenture'], roles: ['Java Developer', 'Backend Engineer'] },
      { name: 'TypeScript', stack: 'Typed application engineering', skills: ['Interfaces', 'Generics', 'React TS', 'API typing'], companies: ['Microsoft', 'Asana', 'Slack'], roles: ['Frontend Engineer', 'Full Stack Engineer'] },
    ],
  },
  {
    name: 'Frontend',
    skills: ['React', 'Vue', 'Angular', 'CSS'],
    technologies: [
      { name: 'React', stack: 'Component-driven SPA development', skills: ['Hooks', 'Routing', 'State management', 'API integration'], companies: ['Meta', 'Airbnb', 'Swiggy'], roles: ['React Developer', 'UI Engineer'] },
      { name: 'Vue', stack: 'Lightweight frontend app development', skills: ['Components', 'Pinia', 'Vue Router', 'Composition API'], companies: ['GitLab', 'Alibaba', 'Behance'], roles: ['Vue Developer', 'Frontend Engineer'] },
      { name: 'Angular', stack: 'Enterprise frontend development', skills: ['Components', 'RxJS', 'Services', 'Forms'], companies: ['Google', 'Forbes', 'Upwork'], roles: ['Angular Developer', 'Frontend Engineer'] },
      { name: 'CSS', stack: 'Responsive interface styling', skills: ['Flexbox', 'Grid', 'Animations', 'Responsive layouts'], companies: ['Zomato', 'Adobe', 'TCS'], roles: ['UI Developer', 'Frontend Designer'] },
    ],
  },
  {
    name: 'Backend',
    skills: ['Node.js', 'Express', 'Django', 'Spring Boot'],
    technologies: [
      { name: 'Node.js', stack: 'Event-driven backend APIs', skills: ['Modules', 'Express', 'Auth', 'Testing'], companies: ['LinkedIn', 'Uber', 'Walmart'], roles: ['Node.js Developer', 'Backend Engineer'] },
      { name: 'Express', stack: 'REST API framework', skills: ['Routing', 'Middleware', 'Validation', 'Error handling'], companies: ['Paytm', 'Razorpay', 'Freshworks'], roles: ['API Developer', 'Backend Engineer'] },
      { name: 'Django', stack: 'Rapid Python backend platform', skills: ['ORM', 'Views', 'Auth', 'Django REST'], companies: ['Disqus', 'Pinterest', 'Mozilla'], roles: ['Django Developer', 'Python Backend Engineer'] },
      { name: 'Spring Boot', stack: 'Enterprise Java services', skills: ['REST APIs', 'JPA', 'Security', 'Microservices'], companies: ['Capgemini', 'IBM', 'Cognizant'], roles: ['Spring Boot Developer', 'Java Backend Engineer'] },
    ],
  },
  {
    name: 'Databases',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
    technologies: [
      { name: 'MongoDB', stack: 'Document database systems', skills: ['CRUD', 'Aggregation', 'Schema design', 'Indexing'], companies: ['MongoDB', 'Adobe', 'Bosch'], roles: ['Database Developer', 'Data Engineer'] },
      { name: 'PostgreSQL', stack: 'Relational database systems', skills: ['SQL', 'Joins', 'Indexes', 'Transactions'], companies: ['Flipkart', 'Red Hat', 'PhonePe'], roles: ['SQL Developer', 'Backend Engineer'] },
      { name: 'MySQL', stack: 'Transactional relational databases', skills: ['Queries', 'Normalization', 'Optimization', 'Stored procedures'], companies: ['Booking.com', 'Facebook', 'Zoho'], roles: ['MySQL Developer', 'Database Administrator'] },
      { name: 'Redis', stack: 'Caching and in-memory data', skills: ['Caching', 'Pub/Sub', 'TTL', 'Session storage'], companies: ['GitHub', 'Snap', 'Delivery Hero'], roles: ['Platform Engineer', 'Backend Engineer'] },
    ],
  },
  {
    name: 'Cloud & DevOps',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    technologies: [
      { name: 'Docker', stack: 'Containerized application delivery', skills: ['Dockerfiles', 'Compose', 'Images', 'Networking'], companies: ['Docker', 'Infosys', 'Tata Elxsi'], roles: ['DevOps Engineer', 'Platform Engineer'] },
      { name: 'Kubernetes', stack: 'Container orchestration', skills: ['Pods', 'Services', 'Deployments', 'Autoscaling'], companies: ['Google', 'Red Hat', 'VMware'], roles: ['Cloud Engineer', 'SRE'] },
      { name: 'AWS', stack: 'Cloud infrastructure services', skills: ['EC2', 'S3', 'IAM', 'CloudWatch'], companies: ['Amazon', 'Deloitte', 'Capgemini'], roles: ['Cloud Engineer', 'Solutions Architect'] },
      { name: 'CI/CD', stack: 'Automated delivery workflows', skills: ['Pipelines', 'GitHub Actions', 'Testing', 'Release automation'], companies: ['GitLab', 'Atlassian', 'Accenture'], roles: ['DevOps Engineer', 'Release Engineer'] },
    ],
  },
  {
    name: 'Security',
    skills: ['OWASP', 'Authentication', 'Authorization', 'Network Security'],
    technologies: [
      { name: 'OWASP', stack: 'Application security practices', skills: ['Top 10', 'Threat modeling', 'Secure coding', 'Scanning'], companies: ['EY', 'KPMG', 'Cisco'], roles: ['Security Analyst', 'AppSec Engineer'] },
      { name: 'Authentication', stack: 'Identity and access entry flows', skills: ['JWT', 'OAuth', 'Sessions', 'MFA'], companies: ['Okta', 'Microsoft', 'Salesforce'], roles: ['IAM Engineer', 'Backend Engineer'] },
      { name: 'Authorization', stack: 'Permission and policy systems', skills: ['RBAC', 'Policies', 'Scopes', 'Auditing'], companies: ['Auth0', 'Oracle', 'SAP'], roles: ['Security Engineer', 'Platform Engineer'] },
      { name: 'Network Security', stack: 'Infrastructure protection', skills: ['Protocols', 'TLS', 'Firewalls', 'Monitoring'], companies: ['Palo Alto Networks', 'Fortinet', 'Cisco'], roles: ['Network Security Engineer', 'SOC Analyst'] },
    ],
  },
];
let useFallbackData = false;

function normalizeCategory(category) {
  const fallback = fallbackCategories.find((item) => item.name === category.name);
  return {
    ...category,
    technologies: category.technologies?.length ? category.technologies : fallback?.technologies || [],
    skills: category.skills?.length ? category.skills : fallback?.skills || [],
  };
}

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
    return res.json(categories.map((category) => normalizeCategory(category.toObject ? category.toObject() : category)));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load categories' });
  }
});

app.get('/catalog', async (req, res) => {
  if (useFallbackData) {
    return res.json(fallbackCategories);
  }
  try {
    const categories = await Category.find();
    return res.json(categories.map((category) => normalizeCategory(category.toObject ? category.toObject() : category)));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load catalog' });
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
