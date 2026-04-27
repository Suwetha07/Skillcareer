const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  role: String,
  interests: [String],
  targetTechnology: String,
  targetCategory: String,
  missingSkills: [String],
  level: String,
  dailyStudyTime: Number,
  completionTarget: Number,
  structured: [{
    skill: String,
    level: String,
    phase: String,
    durationDays: Number,
    order: Number,
    sessions: Number,
    subtopics: [String],
  }],
  schedule: [{ day: Number, skill: String, topic: String, date: String }],
  totalDays: Number,
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', RoadmapSchema);
