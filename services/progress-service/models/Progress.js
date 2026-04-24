const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  completedSkills: { type: [String], default: [] },
  milestoneProgress: [{ skill: String, milestoneId: String, completed: Boolean }],
  assignmentScores: [{ skill: String, milestoneId: String, score: Number }],
  progressPercentage: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
