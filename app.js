import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import nocache from "nocache";
import passport from "passport";

// ESM fix for __dirname
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config imports
import connectDB from "./config/database.js";
import toastHandler from "./middlewares/toastHandler.js";
import googlePassportConfig from "./config/passport.js";
googlePassportConfig();   // <-- REQUIRED


// Routes imports
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(nocache());

// 🧩 Database connection
connectDB();

// 🧩 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public"), { maxAge: 0 }));

app.use(expressLayouts);

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 10 }, // 10 min
  })
);

// 🧩 View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("view cache", false);

app.use(toastHandler);

app.use(passport.initialize());
app.use(passport.session());

// 🧩 Routes
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/", authRoutes);

// 🧩 Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
