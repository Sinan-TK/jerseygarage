require('dotenv').config();

const express = require("express");
const path = require('path');
const expressLayouts = require("express-ejs-layouts"); 
const session = require("express-session");
const connectDB = require('./config/database');
const passport = require("passport");
const toastHandler = require("./middlewares/toastHandler");
const nocache = require('nocache');

require("./config/passport")();

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(nocache());

// 🧩 Database connection
connectDB();

// 🧩 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static(path.join(__dirname, "public"),{ maxAge:0 })); // serve static files
app.use(expressLayouts);
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 10 }  // 10 min
}));


// 🧩 View engine setup
app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.set('view cache', false);

app.use(toastHandler);
app.use(passport.initialize());
app.use(passport.session());

// 🧩 Routes
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/", authRoutes);



// 🧩 Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("server is running");
});
