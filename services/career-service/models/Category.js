const mongoose = require('mongoose');

const TechnologySchema = new mongoose.Schema({
  name: { type: String, required: true },
  stack: { type: String, default: '' },
  skills: { type: [String], default: [] },
  companies: { type: [String], default: [] },
  roles: { type: [String], default: [] },
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  skills: { type: [String], default: [] },
  technologies: { type: [TechnologySchema], default: [] },
});

module.exports = mongoose.model('Category', CategorySchema);
