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

          // const avatar =
          //   profile._json?.picture ||
          //   profile.photos?.[0]?.value ||
          //   "https://res.cloudinary.com/dn6i64qk6/image/upload/v1763988711/user-default-image_ifyyaj.webp";

          // 🟢 1. Check if user already exists by email (normal signup user)
          let existingUser = await User.findOne({ email });

          if (existingUser) {
            // If user signed up normally before, but now using Google login
            if (!existingUser.googleId) {
              existingUser.googleId = profile.id;
              existingUser.is_verified = true; // because Google email verified
              await existingUser.save();
            }
            return done(null, existingUser);
          }

          // 🔵 2. If new Google user, create new record
          let newUser = await User.create({
            googleId: profile.id,
            full_name: profile.displayName,
            email: email,
            avatar:"https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg",
            password_hash: null,
            is_verified: true,
          });

          return done(null, newUser);
        } catch (err) {
          console.log(err);
          return done(err, null);
        }
      }
    )
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
