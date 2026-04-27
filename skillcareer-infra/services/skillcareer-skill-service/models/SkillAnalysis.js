const mongoose = require('mongoose');

const SkillAnalysisSchema = new mongoose.Schema({
  userSkills: { type: [String], default: [] },
  careerSkills: { type: [String], default: [] },
  matched: { type: [String], default: [] },
  missing: { type: [String], default: [] },
  score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('SkillAnalysis', SkillAnalysisSchema);
