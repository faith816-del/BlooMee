const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  provider: { type: String, default: 'local' },
  coins: { type: Number, default: 0 },
  address: {
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    street: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  hasSeenOnboarding: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);