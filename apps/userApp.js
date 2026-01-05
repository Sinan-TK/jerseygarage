import express from "express";
import session from "express-session";
import nocache from "nocache";
import passport from "passport";

import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";

const userApp = express();

userApp.use(nocache());

userApp.use(express.json());
userApp.use(express.urlencoded({ extended: true }));

userApp.use(
  session({
    name: "user.sid", // User cookie
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 10, // 10 minutes
      httpOnly: true,
    },
  })
);

userApp.use(passport.initialize());
userApp.use(passport.session());

userApp.use("/", authRoutes);
userApp.use("/user", userRoutes);

export default userApp;
