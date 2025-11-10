const express = require("express");
const passport = require("passport");
const router = express.Router();

// === GOOGLE AUTH ===

// 1️⃣ User clicks "Continue with Google"
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2️⃣ Google redirects back here
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { user, token } = req.user;
    // Redirect to frontend with token in query
    res.redirect(`http://localhost:5500/myapp-frontend/home.html?token=${token}`);
  }
);

// === FACEBOOK AUTH ===

// 1️⃣ User clicks "Continue with Facebook"
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// 2️⃣ Facebook redirects back here
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const { user, token } = req.user;
    // Redirect to frontend with token
    res.redirect(`http://localhost:5500/myapp-frontend/home.html?token=${token}`);
  }
);

module.exports = router;