import express from "express";
import session from "express-session";
import nocache from "nocache";

import adminRoutes from "../routes/adminRoutes/adminRoutes.js";

const adminApp = express();

// ADMIN SESSION
adminApp.use(
  session({
    name: "admin.sid",
    secret: process.env.ADMIN_SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
      path: "/admin",
    },
  })
);

// ROUTES
adminApp.use("/", adminRoutes);

export default adminApp;
