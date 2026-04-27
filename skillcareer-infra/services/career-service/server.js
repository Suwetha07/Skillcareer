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
    skills: ['JavaScript', 'Python', 'Java', 'TypeScript', 'Go'],
    technologies: [
      { name: 'JavaScript', stack: 'Frontend and backend scripting', skills: ['ES6+', 'DOM', 'Async/Await', 'Node basics', 'Testing'], companies: ['Google', 'PayPal', 'Netflix'], roles: ['Frontend Developer', 'Full Stack Developer'] },
      { name: 'Python', stack: 'Automation and backend development', skills: ['Syntax', 'Flask', 'Data handling', 'APIs', 'Automation'], companies: ['Amazon', 'Instagram', 'Spotify'], roles: ['Python Developer', 'Automation Engineer'] },
      { name: 'Java', stack: 'Enterprise application development', skills: ['OOP', 'Spring', 'Microservices', 'JVM', 'Concurrency'], companies: ['Infosys', 'Oracle', 'Accenture'], roles: ['Java Developer', 'Backend Engineer'] },
      { name: 'TypeScript', stack: 'Typed application engineering', skills: ['Interfaces', 'Generics', 'React TS', 'API typing', 'Tooling'], companies: ['Microsoft', 'Asana', 'Slack'], roles: ['Frontend Engineer', 'Full Stack Engineer'] },
      { name: 'Go', stack: 'High-performance systems and services', skills: ['Goroutines', 'Interfaces', 'REST APIs', 'CLI tools', 'Profiling'], companies: ['Uber', 'Cloudflare', 'TCS'], roles: ['Go Developer', 'Platform Engineer'] },
    ],
  },
  {
    name: 'Frontend',
    skills: ['React', 'Vue', 'Angular', 'CSS', 'Next.js'],
    technologies: [
      { name: 'React', stack: 'Component-driven SPA development', skills: ['Hooks', 'Routing', 'State management', 'API integration', 'Testing Library'], companies: ['Meta', 'Airbnb', 'Swiggy'], roles: ['React Developer', 'UI Engineer'] },
      { name: 'Vue', stack: 'Lightweight frontend app development', skills: ['Components', 'Pinia', 'Vue Router', 'Composition API', 'Forms'], companies: ['GitLab', 'Alibaba', 'Behance'], roles: ['Vue Developer', 'Frontend Engineer'] },
      { name: 'Angular', stack: 'Enterprise frontend development', skills: ['Components', 'RxJS', 'Services', 'Forms', 'NgRx'], companies: ['Google', 'Forbes', 'Upwork'], roles: ['Angular Developer', 'Frontend Engineer'] },
      { name: 'CSS', stack: 'Responsive interface styling', skills: ['Flexbox', 'Grid', 'Animations', 'Responsive layouts', 'Accessibility'], companies: ['Zomato', 'Adobe', 'TCS'], roles: ['UI Developer', 'Frontend Designer'] },
      { name: 'Next.js', stack: 'React framework for production web apps', skills: ['App Router', 'SSR', 'API routes', 'Auth', 'Performance'], companies: ['Vercel', 'HashiCorp', 'Razorpay'], roles: ['Next.js Developer', 'Frontend Engineer'] },
    ],
  },
  {
    name: 'Backend',
    skills: ['Node.js', 'Express', 'Django', 'Spring Boot', 'Laravel'],
    technologies: [
      { name: 'Node.js', stack: 'Event-driven backend APIs', skills: ['Modules', 'Express', 'Auth', 'Testing', 'Caching'], companies: ['LinkedIn', 'Uber', 'Walmart'], roles: ['Node.js Developer', 'Backend Engineer'] },
      { name: 'Express', stack: 'REST API framework', skills: ['Routing', 'Middleware', 'Validation', 'Error handling', 'Swagger'], companies: ['Paytm', 'Razorpay', 'Freshworks'], roles: ['API Developer', 'Backend Engineer'] },
      { name: 'Django', stack: 'Rapid Python backend platform', skills: ['ORM', 'Views', 'Auth', 'Django REST', 'Admin'], companies: ['Disqus', 'Pinterest', 'Mozilla'], roles: ['Django Developer', 'Python Backend Engineer'] },
      { name: 'Spring Boot', stack: 'Enterprise Java services', skills: ['REST APIs', 'JPA', 'Security', 'Microservices', 'Messaging'], companies: ['Capgemini', 'IBM', 'Cognizant'], roles: ['Spring Boot Developer', 'Java Backend Engineer'] },
      { name: 'Laravel', stack: 'Modern PHP application framework', skills: ['MVC', 'Eloquent ORM', 'Queues', 'Auth', 'Blade'], companies: ['Accenture', 'Zoho', 'Freelancer'], roles: ['Laravel Developer', 'PHP Backend Engineer'] },
    ],
  },
  {
    name: 'Databases',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch'],
    technologies: [
      { name: 'MongoDB', stack: 'Document database systems', skills: ['CRUD', 'Aggregation', 'Schema design', 'Indexing', 'Replication'], companies: ['MongoDB', 'Adobe', 'Bosch'], roles: ['Database Developer', 'Data Engineer'] },
      { name: 'PostgreSQL', stack: 'Relational database systems', skills: ['SQL', 'Joins', 'Indexes', 'Transactions', 'Performance tuning'], companies: ['Flipkart', 'Red Hat', 'PhonePe'], roles: ['SQL Developer', 'Backend Engineer'] },
      { name: 'MySQL', stack: 'Transactional relational databases', skills: ['Queries', 'Normalization', 'Optimization', 'Stored procedures', 'Backups'], companies: ['Booking.com', 'Facebook', 'Zoho'], roles: ['MySQL Developer', 'Database Administrator'] },
      { name: 'Redis', stack: 'Caching and in-memory data', skills: ['Caching', 'Pub/Sub', 'TTL', 'Session storage', 'Streams'], companies: ['GitHub', 'Snap', 'Delivery Hero'], roles: ['Platform Engineer', 'Backend Engineer'] },
      { name: 'Elasticsearch', stack: 'Search and analytics engine', skills: ['Index design', 'Full-text search', 'Aggregations', 'Kibana', 'Scaling'], companies: ['Elastic', 'Swiggy', 'Meesho'], roles: ['Search Engineer', 'Data Platform Engineer'] },
    ],
  },
  {
    name: 'Cloud & DevOps',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    technologies: [
      { name: 'Docker', stack: 'Containerized application delivery', skills: ['Dockerfiles', 'Compose', 'Images', 'Networking', 'Optimization'], companies: ['Docker', 'Infosys', 'Tata Elxsi'], roles: ['DevOps Engineer', 'Platform Engineer'] },
      { name: 'Kubernetes', stack: 'Container orchestration', skills: ['Pods', 'Services', 'Deployments', 'Autoscaling', 'Helm'], companies: ['Google', 'Red Hat', 'VMware'], roles: ['Cloud Engineer', 'SRE'] },
      { name: 'AWS', stack: 'Cloud infrastructure services', skills: ['EC2', 'S3', 'IAM', 'CloudWatch', 'Lambda'], companies: ['Amazon', 'Deloitte', 'Capgemini'], roles: ['Cloud Engineer', 'Solutions Architect'] },
      { name: 'CI/CD', stack: 'Automated delivery workflows', skills: ['Pipelines', 'GitHub Actions', 'Testing', 'Release automation', 'Rollback plans'], companies: ['GitLab', 'Atlassian', 'Accenture'], roles: ['DevOps Engineer', 'Release Engineer'] },
      { name: 'Terraform', stack: 'Infrastructure as code automation', skills: ['Modules', 'State management', 'Providers', 'Workspaces', 'Provisioning'], companies: ['HashiCorp', 'Thoughtworks', 'EPAM'], roles: ['Platform Engineer', 'Infrastructure Engineer'] },
    ],
  },
  {
    name: 'Security',
    skills: ['OWASP', 'Authentication', 'Authorization', 'Network Security', 'SIEM'],
    technologies: [
      { name: 'OWASP', stack: 'Application security practices', skills: ['Top 10', 'Threat modeling', 'Secure coding', 'Scanning', 'Dependency checks'], companies: ['EY', 'KPMG', 'Cisco'], roles: ['Security Analyst', 'AppSec Engineer'] },
      { name: 'Authentication', stack: 'Identity and access entry flows', skills: ['JWT', 'OAuth', 'Sessions', 'MFA', 'SSO'], companies: ['Okta', 'Microsoft', 'Salesforce'], roles: ['IAM Engineer', 'Backend Engineer'] },
      { name: 'Authorization', stack: 'Permission and policy systems', skills: ['RBAC', 'Policies', 'Scopes', 'Auditing', 'Access reviews'], companies: ['Auth0', 'Oracle', 'SAP'], roles: ['Security Engineer', 'Platform Engineer'] },
      { name: 'Network Security', stack: 'Infrastructure protection', skills: ['Protocols', 'TLS', 'Firewalls', 'Monitoring', 'Zero trust'], companies: ['Palo Alto Networks', 'Fortinet', 'Cisco'], roles: ['Network Security Engineer', 'SOC Analyst'] },
      { name: 'SIEM', stack: 'Centralized security event monitoring', skills: ['Log ingestion', 'Correlation rules', 'Dashboards', 'Incident response', 'Alert tuning'], companies: ['Splunk', 'Rapid7', 'Wipro'], roles: ['SOC Analyst', 'Detection Engineer'] },
    ],
  },
  {
    name: 'Mobile Development',
    skills: ['Android', 'iOS', 'Flutter', 'React Native', 'Kotlin Multiplatform'],
    technologies: [
      { name: 'Android', stack: 'Native Android application development', skills: ['Kotlin', 'Jetpack', 'Navigation', 'Room DB', 'Testing'], companies: ['Google', 'PhonePe', 'Flipkart'], roles: ['Android Developer', 'Mobile Engineer'] },
      { name: 'iOS', stack: 'Native iPhone and iPad app development', skills: ['Swift', 'UIKit', 'SwiftUI', 'Core Data', 'XCTest'], companies: ['Apple', 'Zomato', 'Paytm'], roles: ['iOS Developer', 'Mobile Engineer'] },
      { name: 'Flutter', stack: 'Cross-platform mobile UI toolkit', skills: ['Widgets', 'State management', 'Animations', 'REST integration', 'Firebase'], companies: ['BMW', 'Dream11', 'Nagarro'], roles: ['Flutter Developer', 'Cross-Platform Engineer'] },
      { name: 'React Native', stack: 'JavaScript-based native mobile apps', skills: ['Components', 'Navigation', 'Native modules', 'State management', 'Debugging'], companies: ['Meta', 'Shopify', 'CRED'], roles: ['React Native Developer', 'Mobile App Engineer'] },
      { name: 'Kotlin Multiplatform', stack: 'Shared business logic across platforms', skills: ['Shared modules', 'Coroutines', 'Networking', 'Serialization', 'Platform interop'], companies: ['Netflix', 'Touchlab', 'Booking.com'], roles: ['Mobile Platform Engineer', 'KMM Developer'] },
    ],
  },
  {
    name: 'Data Science & AI',
    skills: ['Pandas', 'Machine Learning', 'Deep Learning', 'MLOps', 'Generative AI'],
    technologies: [
      { name: 'Pandas', stack: 'Data analysis and transformation workflows', skills: ['DataFrames', 'Cleaning', 'Merging', 'Time series', 'Visualization prep'], companies: ['Infosys', 'Fractal', 'Mu Sigma'], roles: ['Data Analyst', 'Analytics Engineer'] },
      { name: 'Machine Learning', stack: 'Predictive model development', skills: ['Scikit-learn', 'Feature engineering', 'Model evaluation', 'Pipelines', 'Deployment basics'], companies: ['Amazon', 'Turing', 'Tiger Analytics'], roles: ['ML Engineer', 'Data Scientist'] },
      { name: 'Deep Learning', stack: 'Neural-network based AI systems', skills: ['PyTorch', 'TensorFlow', 'CNNs', 'Transformers', 'Model tuning'], companies: ['NVIDIA', 'OpenAI', 'MathCo'], roles: ['AI Engineer', 'Deep Learning Engineer'] },
      { name: 'MLOps', stack: 'Operationalizing machine learning pipelines', skills: ['Model registry', 'Feature stores', 'Monitoring', 'CI/CD for ML', 'Experiment tracking'], companies: ['Databricks', 'H2O.ai', 'TCS'], roles: ['MLOps Engineer', 'ML Platform Engineer'] },
      { name: 'Generative AI', stack: 'LLM and prompt-driven product development', skills: ['Prompting', 'Embeddings', 'RAG', 'Evaluation', 'Guardrails'], companies: ['OpenAI', 'Cohere', 'Accenture'], roles: ['GenAI Engineer', 'Applied AI Engineer'] },
    ],
  },
  {
    name: 'Testing & QA',
    skills: ['Manual Testing', 'Selenium', 'Cypress', 'Playwright', 'API Testing'],
    technologies: [
      { name: 'Manual Testing', stack: 'Structured quality validation and defect reporting', skills: ['Test cases', 'Bug reports', 'Regression testing', 'UAT', 'Test plans'], companies: ['Infosys', 'Wipro', 'Cognizant'], roles: ['QA Analyst', 'Test Engineer'] },
      { name: 'Selenium', stack: 'Web automation testing framework', skills: ['WebDriver', 'Locators', 'Page objects', 'Grid', 'Cross-browser testing'], companies: ['Thoughtworks', 'Zoho', 'TCS'], roles: ['Automation Tester', 'QA Engineer'] },
      { name: 'Cypress', stack: 'Modern frontend testing workflow', skills: ['E2E tests', 'Fixtures', 'Intercepts', 'Assertions', 'CI integration'], companies: ['BrowserStack', 'Freshworks', 'Postman'], roles: ['SDET', 'Frontend QA Engineer'] },
      { name: 'Playwright', stack: 'Fast browser automation for reliable testing', skills: ['Multi-browser', 'Tracing', 'Locators', 'API mocks', 'Parallel runs'], companies: ['Microsoft', 'Razorpay', 'Swiggy'], roles: ['Test Automation Engineer', 'SDET'] },
      { name: 'API Testing', stack: 'Backend contract and behavior validation', skills: ['Postman', 'REST assertions', 'Auth flows', 'Performance checks', 'Mock servers'], companies: ['Postman', 'Paytm', 'Capgemini'], roles: ['API Tester', 'QA Automation Engineer'] },
    ],
  },
  {
    name: 'Design & Product',
    skills: ['Figma', 'UI Design', 'UX Research', 'Product Management', 'Design Systems'],
    technologies: [
      { name: 'Figma', stack: 'Collaborative product design and prototyping', skills: ['Auto layout', 'Components', 'Variants', 'Prototypes', 'Developer handoff'], companies: ['Adobe', 'PhonePe', 'Myntra'], roles: ['Product Designer', 'UI Designer'] },
      { name: 'UI Design', stack: 'Visual interface design for digital products', skills: ['Typography', 'Color systems', 'Layouts', 'Accessibility', 'Responsive design'], companies: ['Zomato', 'Adobe', 'PayPal'], roles: ['UI Designer', 'Visual Designer'] },
      { name: 'UX Research', stack: 'User behavior discovery and validation', skills: ['User interviews', 'Surveys', 'Usability testing', 'Personas', 'Journey maps'], companies: ['Microsoft', 'IBM', 'Nielsen Norman Group'], roles: ['UX Researcher', 'Product Researcher'] },
      { name: 'Product Management', stack: 'Product strategy and execution leadership', skills: ['Roadmapping', 'Prioritization', 'Metrics', 'Stakeholder communication', 'Discovery'], companies: ['Google', 'Atlassian', 'Freshworks'], roles: ['Product Manager', 'Associate Product Manager'] },
      { name: 'Design Systems', stack: 'Reusable UI foundations and governance', skills: ['Tokens', 'Component libraries', 'Documentation', 'Accessibility', 'Cross-team adoption'], companies: ['Salesforce', 'Airbnb', 'Razorpay'], roles: ['Design Systems Designer', 'Product Designer'] },
    ],
  },
  {
    name: 'Data Engineering',
    skills: ['Apache Spark', 'Kafka', 'Airflow', 'dbt', 'Snowflake'],
    technologies: [
      { name: 'Apache Spark', stack: 'Distributed data processing at scale', skills: ['RDDs', 'DataFrames', 'Spark SQL', 'Batch jobs', 'Performance tuning'], companies: ['Databricks', 'Amazon', 'Walmart'], roles: ['Data Engineer', 'Big Data Engineer'] },
      { name: 'Kafka', stack: 'Streaming data pipelines and event systems', skills: ['Topics', 'Consumers', 'Producers', 'Streams', 'Schema registry'], companies: ['Confluent', 'Swiggy', 'LinkedIn'], roles: ['Streaming Data Engineer', 'Platform Engineer'] },
      { name: 'Airflow', stack: 'Workflow orchestration for data pipelines', skills: ['DAGs', 'Scheduling', 'Operators', 'Retries', 'Monitoring'], companies: ['Astronomer', 'Flipkart', 'Infosys'], roles: ['Data Engineer', 'ETL Developer'] },
      { name: 'dbt', stack: 'Transformation workflows inside the warehouse', skills: ['Models', 'Tests', 'Macros', 'Lineage', 'Documentation'], companies: ['dbt Labs', 'Meesho', 'NielsenIQ'], roles: ['Analytics Engineer', 'Data Transformation Engineer'] },
      { name: 'Snowflake', stack: 'Cloud-native data warehousing platform', skills: ['Warehouses', 'ELT', 'Security', 'Sharing', 'Optimization'], companies: ['Snowflake', 'Deloitte', 'Accenture'], roles: ['Data Warehouse Engineer', 'Cloud Data Engineer'] },
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'career-service', datastore: useFallbackData ? 'memory' : 'mongodb' });
});

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('Career Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Career Service MongoDB connected');
    await Promise.all(
      fallbackCategories.map((category) =>
        Category.findOneAndUpdate(
          { name: category.name },
          category,
          { upsert: true, new: true, setDefaultsOnInsert: true },
        ),
      ),
    );
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

