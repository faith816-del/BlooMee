const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5500/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // create new user if not found
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "", // no password for Google users
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;