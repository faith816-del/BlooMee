const express = require('express');
const router = express.Router();
const Period = require('../models/Period');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new period entry (auth required)
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, symptoms, notes } = req.body || {};

    if (!startDate || !endDate) return res.status(400).json({ message: 'Start and end dates are required.' });
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return res.status(400).json({ message: 'Invalid date format.' });
    if (e < s) return res.status(400).json({ message: 'End date must be after start date.' });

    let sym = [];
    if (Array.isArray(symptoms)) sym = symptoms.map(x => String(x).trim()).filter(Boolean);
    else if (typeof symptoms === 'string') sym = symptoms.split(',').map(x => x.trim()).filter(Boolean);

    const period = new Period({ userId, startDate: s, endDate: e, symptoms: sym, notes: notes ? String(notes) : '' });
    await period.save();
    return res.status(201).json({ message: 'Period entry saved', data: period });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save period entry' });
  }
});

// Get all period entries for the logged-in user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const periods = await Period.find({ userId: req.user.userId }).sort({ startDate: -1 });
    return res.status(200).json(periods);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch period entries' });
  }
});

// Predict next period for logged-in user
router.get('/predict', authMiddleware, async (req, res) => {
  try {
    const periods = await Period.find({ userId: req.user.userId }).sort({ startDate: 1 });
    if (!periods.length) {
      return res.json({ nextStart: null, nextEnd: null, message: 'No data yet' });
    }
    // Compute average cycle length (days between consecutive start dates)
    let gaps = [];
    for (let i = 1; i < periods.length; i++) {
      const prev = new Date(periods[i - 1].startDate);
      const cur = new Date(periods[i].startDate);
      gaps.push((cur - prev) / (1000 * 60 * 60 * 24));
    }
    const avgCycle = gaps.length ? Math.round(gaps.reduce((a,b)=>a+b,0) / gaps.length) : 28;
    // Avg duration
    const durations = periods.map(p => (new Date(p.endDate) - new Date(p.startDate)) / (1000*60*60*24)).filter(n => n>0);
    const avgDur = durations.length ? Math.max(1, Math.round(durations.reduce((a,b)=>a+b,0) / durations.length)) : 5;
    const last = periods[periods.length - 1];
    const lastStart = new Date(last.startDate);
    const nextStart = new Date(lastStart.getTime() + avgCycle * 24 * 60 * 60 * 1000);
    const nextEnd = new Date(nextStart.getTime() + avgDur * 24 * 60 * 60 * 1000);
    return res.json({ nextStart, nextEnd, avgCycle, avgDur });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to predict next period' });
  }
});

module.exports = router;