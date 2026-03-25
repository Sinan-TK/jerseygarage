import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

export default () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;

          // Handles all 3 cases in one query:
          // 1. Existing Google user → returns them
          // 2. Existing normal-signup user → links googleId
          // 3. Brand new user → creates them
          const user = await User.findOneAndUpdate(
            { email },
            {
              $set: {
                googleId,
                is_verified: true,
              },
              $setOnInsert: {
                full_name: profile.displayName,
                email,
                avatar:
                  "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg",
                password_hash: null,
              },
            },
            { upsert: true, new: true },
          );

          return done(null, user);
        } catch (err) {
          console.log(err);
          return done(err, null);
        }
      },
    ),
  );

  // Save user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Retrieve user from session
  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
