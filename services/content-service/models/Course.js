const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  question: String,
  submission: String,
  score: { type: Number, default: 0 },
  quiz: [{
    prompt: String,
    options: [String],
    answer: String,
  }],
  passed: { type: Boolean, default: false },
}, { _id: false });

const MilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  resources: [String],
  assignment: AssignmentSchema,
  completed: { type: Boolean, default: false },
});

const CourseSchema = new mongoose.Schema({
  skill: { type: String, required: true, unique: true },
  description: String,
  milestones: [MilestoneSchema],
  certificationFlag: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Course', CourseSchema);
