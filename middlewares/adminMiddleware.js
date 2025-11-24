import Admin from "../models/adminModel.js";

export const isLoggedIn = (req, res, next) => {
  // if (!req.session.Admin) {
  //   return res.redirect("/admin/login");
  // }
  next();
};

export const adminExists = (req,res,next) => {
    // if(req.session.Admin){
    //     return res.redirect('/admin/dashboard');
    // }
    next();
}

// module.exports = {
//   isLoggedIn,
//   adminExists,
// };
