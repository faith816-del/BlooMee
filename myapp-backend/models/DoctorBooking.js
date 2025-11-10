const mongoose = require("mongoose");

const DoctorBookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  doctor: { type: String, required: true },
  concern: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DoctorBooking", DoctorBookingSchema);