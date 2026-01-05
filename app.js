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
googlePassportConfig(); // REQUIRED

// Routes imports
import adminRoutes from "./routes/adminRoutes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

//session apps user and admin
import userApp from "./apps/userApp.js";
import adminApp from "./apps/adminApp.js";

// Global Middleware
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(nocache());

//Database connection
connectDB();

//Body & Static Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: 0 }));
app.use(expressLayouts);

//View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("view cache", false);

//Toast
app.use(toastHandler);

// ========================================
// ROUTES
// ========================================
app.use("/admin", adminApp);
app.use("/", userApp);

// Error Handler
app.use(errorHandler);

// 🧩 Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `-----------------Server running on port ${PORT}----------------`
  );
});
