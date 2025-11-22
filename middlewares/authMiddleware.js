const User = require("../models/userModel");

const isLoggedIn = (req, res, next) => {
  // if (req.session.userId) {
  //   return res.redirect("/");
  // }
  next();
};

const isMailFound = (req, res, next) => {
  // if (!req.session.tempEmail) {
  //   return res.redirect("/");
  // }
  next();
};

// const registerPage = (req,res,next) => {
//     if(!req.session.tempEmail){
        
//     }
// }

const isNotLoggedIn = (req, res, next) => {
  // if (req.session.userId) {
  //   return res.redirect("/");
  // }
  next();
};

module.exports = {
  isLoggedIn,
  isNotLoggedIn,
  isMailFound,
};
