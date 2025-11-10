const express = require("express");
const router = express.Router();
const DoctorBooking = require("../models/DoctorBooking");
const nodemailer = require("nodemailer");

// POST route to save doctor booking
router.post("/", async (req, res) => {
  try {
    const { fullName, phoneNumber, email, doctor, concern } = req.body || {};

    if (!fullName || !phoneNumber || !email || !doctor || !concern) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const name = String(fullName).trim();
    const phone = String(phoneNumber).trim();
    const mail = String(email).trim();
    const doc = String(doctor).trim();
    const desc = String(concern).trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
    if (!emailOk) return res.status(400).json({ message: "Please provide a valid email address." });

    if (phone.length < 7) return res.status(400).json({ message: "Please provide a valid phone number." });

    const newBooking = new DoctorBooking({
      fullName: name,
      phoneNumber: phone,
      email: mail,
      doctor: doc,
      concern: desc,
    });

    await newBooking.save();

    // Attempt email confirmation if SMTP is configured
    try {
      const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
      if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && FROM_EMAIL) {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        const subject = "BlooMee Appointment Confirmation";
        const text = `Hello ${name},\n\nYour appointment request has been received. A doctor will email you with further details.\n\nDoctor: ${doc}\nConcern: ${desc}\nPhone: ${phone}\n\nThank you,\nBlooMee Team`;

        await transporter.sendMail({ from: FROM_EMAIL, to: mail, subject, text });
      }
    } catch (mailErr) {
      console.error("Email send failed:", mailErr.message);
      // Do not fail booking on email error
    }

    res.status(201).json({ message: "Appointment booked successfully. You will receive an email from the doctor with further explanation." });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Server error saving booking." });
  }
});

module.exports = router;