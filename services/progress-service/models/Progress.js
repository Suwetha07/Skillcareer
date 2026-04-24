const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  completedSkills: { type: [String], default: [] },
  milestoneProgress: [{ skill: String, milestoneId: String, completed: Boolean }],
  assignmentScores: [{ skill: String, milestoneId: String, score: Number }],
  dailyHoursSpent: { type: Number, default: 0 },
  modulesCompleted: { type: Number, default: 0 },
  testsAttended: { type: Number, default: 0 },
  testsPassed: { type: Number, default: 0 },
  testsFailed: { type: Number, default: 0 },
  toolProgress: [{ skill: String, completedPercentage: Number, status: String }],
  progressPercentage: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
