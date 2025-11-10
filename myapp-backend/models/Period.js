const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // associate with user
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  symptoms: { type: [String], default: [] },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Period', periodSchema);