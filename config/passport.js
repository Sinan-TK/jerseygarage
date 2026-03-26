import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import { createUniqueReferralCode } from "../utils/referralCodeGenerator.js";
import Wallet from "../models/walletModel.js";

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

          // Existing user
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            if (!existingUser.googleId) {
              existingUser.googleId = googleId;
              existingUser.is_verified = true;
              await existingUser.save();
            }
            
            if (!existingUser.wallet) {
              const wallet = await Wallet.create({ user: existingUser._id });
              existingUser.wallet = wallet._id;
              await existingUser.save();
            }

            return done(null, existingUser);
          }

          // New Google user
          const referral_code = await createUniqueReferralCode(profile.displayName);

          const newUser = await User.create({
            googleId,
            full_name: profile.displayName,
            email,
            avatar:
              "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg",
            password_hash: null,
            is_verified: true,
            referral_code,
          });

          const wallet = await Wallet.create({ user: newUser._id });
          newUser.wallet = wallet._id;
          await newUser.save();

          console.log("working")
          return done(null, newUser);
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
