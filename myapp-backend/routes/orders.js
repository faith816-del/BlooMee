const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Mock orders; in real app, fetch from DB
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sample = [
      { id: 'ORD-1001', productName: 'BlooEase UltraThin Cotton Pad', status: 'Delivered', date: '2025-10-01' },
      { id: 'ORD-1002', productName: 'HerbalGlow Rose Strawberry Soap', status: 'Processing', date: '2025-10-20' },
      { id: 'ORD-1003', productName: 'LunaBloom Regular Cotton Pad', status: 'Shipped', date: '2025-11-01' },
    ];
    res.json({ orders: sample });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

module.exports = router;


