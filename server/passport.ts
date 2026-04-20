import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Dynamic callback URL based on environment
  const callbackURL = process.env.GOOGLE_AUTH_CALLBACK_URL || (
    process.env.NODE_ENV === "production"
      ? "https://certxa.com/api/auth/google/callback"
      : `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails![0].value;
          const googleId = profile.id;

          let user = await storage.findUserByGoogleId(googleId);

          if (!user) {
            user = await storage.findUserByEmail(email);

            if (user) {
              // Link Google account to existing email account
              user = await storage.updateUser(user.id, { googleId });
            } else {
              user = await storage.createUser({
                email,
                googleId,
                firstName: profile.displayName.split(" ")[0],
                lastName: profile.displayName.split(" ").slice(1).join(" "),
                password: "", // Create a dummy password for OAuth users
                profileImageUrl: profile.photos?.[0]?.value,
                onboardingCompleted: false,
              });
            }
          }

          if (!user) {
            throw new Error("Failed to create or retrieve user");
          }

          return done(null, user);
        } catch (err) {
          return done(err as any, null);
        }
      },
    ),
  );
} else {
  console.warn("Google OAuth not configured in passport.ts: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

export default passport;
