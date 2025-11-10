const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// POST /api/ngo/feedback - send confirmation email to logged-in user's email
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { location, ngo, message } = req.body || {};
    if (!location || !message) {
      return res.status(400).json({ message: 'Location and message are required.' });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
    if (!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && FROM_EMAIL)) {
      return res.status(200).json({ message: 'Feedback received. Email service not configured, but request saved.' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const to = req.user.email;
    const subject = 'BlooMee — We received your request';
    const text = `Hello,\n\nWe’ve received your message and will respond soon with more details.\n\nLocation: ${location}\nNGO (if any): ${ngo || 'N/A'}\nMessage: ${message}\n\nWith love,\nBlooMee Team`;

    await transporter.sendMail({ from: FROM_EMAIL, to, subject, text });
    return res.json({ message: 'Feedback received. Confirmation email sent.' });
  } catch (err) {
    console.error('NGO feedback mail error:', err);
    return res.status(500).json({ message: 'Failed to process feedback.' });
  }
});

module.exports = router;
// Dummy endpoint to simulate M-Pesa success (no-op)
router.post('/dummy-mpesa', (req, res) => {
  res.json({ ok: true });
});


