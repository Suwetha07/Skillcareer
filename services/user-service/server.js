const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user-service';
const JWT_SECRET = process.env.JWT_SECRET || 'shared-secret';
const USE_IN_MEMORY_FALLBACK = process.env.USE_IN_MEMORY_FALLBACK === 'true';
const fallbackUsers = [];
let useFallbackData = false;

app.use(cors());
app.use(express.json());

async function initializeDataSource() {
  if (!MONGO_URI && USE_IN_MEMORY_FALLBACK) {
    useFallbackData = true;
    console.log('User Service running with fallback in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('User Service MongoDB connected');
  } catch (err) {
    if (!USE_IN_MEMORY_FALLBACK) {
      console.error('User Service failed to connect to MongoDB.');
      console.error('Start MongoDB or set USE_IN_MEMORY_FALLBACK=true to run without it.');
      console.error(err.message);
      process.exit(1);
    }
    useFallbackData = true;
    console.warn('MongoDB unavailable. User Service running with fallback in-memory data.');
    console.warn(err.message);
  }
}

initializeDataSource().catch((err) => {
  useFallbackData = true;
  console.warn('Failed to initialize data source. User Service running with fallback in-memory data.');
  console.warn(err.message);
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, interests, skills, experience } = req.body;
    if (useFallbackData) {
      const existing = fallbackUsers.find((item) => item.email === email);
      if (existing) return res.status(409).json({ message: 'Email already exists' });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: randomUUID(),
        name,
        email,
        phone: phone || '',
        password: hashedPassword,
        role,
        interests: interests || [],
        skills: skills || [],
        experience,
      };
      fallbackUsers.push(user);
      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, interests: user.interests }, token });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone: phone || '', password: hashedPassword, role, interests: interests || [], skills: skills || [], experience });
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, interests: user.interests }, token });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (useFallbackData) {
      const user = fallbackUsers.find((item) => item.email === email);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, interests: user.interests, skills: user.skills, experience: user.experience }, token });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, interests: user.interests, skills: user.skills, experience: user.experience }, token });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Login failed' });
  }
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/profile', authenticate, async (req, res) => {
  if (useFallbackData) {
    const user = fallbackUsers.find((item) => item._id === req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  }
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.put('/profile/update', authenticate, async (req, res) => {
  const { role, interests, skills, experience, name } = req.body;
  if (useFallbackData) {
    const user = fallbackUsers.find((item) => item._id === req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    user.interests = interests;
    user.skills = skills;
    user.experience = experience;
    user.name = name;
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  }
  const updated = await User.findByIdAndUpdate(req.user.userId, { role, interests, skills, experience, name }, { new: true }).select('-password');
  res.json(updated);
});

app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
