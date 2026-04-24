const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Fresher', 'Experienced', 'Job Seeker'], default: 'Student' },
  interests: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  experience: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
