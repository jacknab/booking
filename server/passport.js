const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // TODO: replace with your DB logic
        let user = await findUserByEmail(email);

        if (!user) {
          user = await createUser({
            email,
            name: profile.displayName,
            googleId: profile.id,
            provider: "google",
          });
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
