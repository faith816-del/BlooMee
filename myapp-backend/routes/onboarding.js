const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ correct import

// ✅ Route: mark onboarding as completed
router.put("/complete", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // mark onboarding as seen
    user.hasSeenOnboarding = true;
    await user.save();

    res.json({ message: "Onboarding completed", user });
  } catch (error) {
    console.error("Error updating onboarding:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;