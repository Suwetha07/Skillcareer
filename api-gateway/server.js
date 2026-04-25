const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

const API_PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shared-secret';

app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  if (req.path === '/login' || req.path === '/register') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

const serviceRoutes = {
  user: process.env.USER_SERVICE_URL || 'http://127.0.0.1:5001',
  career: process.env.CAREER_SERVICE_URL || 'http://127.0.0.1:5002',
  skill: process.env.SKILL_SERVICE_URL || 'http://127.0.0.1:5003',
  roadmap: process.env.ROADMAP_SERVICE_URL || 'http://127.0.0.1:5004',
  content: process.env.CONTENT_SERVICE_URL || 'http://127.0.0.1:5005',
  progress: process.env.PROGRESS_SERVICE_URL || 'http://127.0.0.1:5006',
};

async function proxyRequest(req, res, targetUrl) {
  try {
    const forwardPath = req.originalUrl.replace(req.baseUrl, '') || '/';
    const url = new URL(forwardPath, targetUrl);
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders['content-length'];
    delete forwardHeaders['host'];
    const init = {
      method: req.method,
      headers: { ...forwardHeaders, host: new URL(targetUrl).host },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    };

    const response = await fetch(url.href, init);
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ message: 'Gateway proxy error', error: err.message });
  }
}

Object.entries(serviceRoutes).forEach(([name, url]) => {
  app.use(`/api/${name}`, verifyJwt, (req, res) => proxyRequest(req, res, url));
});

app.listen(API_PORT, () => {
  console.log(`API Gateway running on port ${API_PORT}`);
});
