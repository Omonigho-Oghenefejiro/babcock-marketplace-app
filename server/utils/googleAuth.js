const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const isBabcockEmail = (email) => String(email || '').toLowerCase().includes('babcock.edu.ng');

const configured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (configured && !passport._strategies.google) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'https://babcock-marketplace-app-production.up.railway.app'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email || !isBabcockEmail(email)) {
            return done(null, false, { message: 'Only Babcock email addresses are allowed.' });
          }

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          user = new User({
            fullName: profile.displayName,
            email,
            googleId: profile.id,
            profileImage: profile.photos?.[0]?.value,
            isVerified: true,
            campusRole: 'student',
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = {
  isGoogleAuthConfigured: configured,
};
