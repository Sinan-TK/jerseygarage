import User from "../models/userModel.js";

export const isLoggedIn = (req, res, next) => {
  // if (req.session.userId) {
  //   return res.redirect("/");
  // }
  next();
};

export const isMailFound = (req, res, next) => {
  // if (!req.session.tempEmail) {
  //   return res.redirect("/");
  // }
  next();
};

// const registerPage = (req,res,next) => {
//     if(!req.session.tempEmail){
        
//     }
// }

export const isNotLoggedIn = (req, res, next) => {
  // if (req.session.userId) {
  //   return res.redirect("/");
  // }
  next();
};

// module.exports = {
//   isLoggedIn,
//   isNotLoggedIn,
//   isMailFound,
// };
