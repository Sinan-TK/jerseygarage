const Admin = require("../models/adminModel");

const isLoggedIn = (req, res, next) => {
  // if (!req.session.Admin) {
  //   return res.redirect("/admin/login");
  // }
  next();
};

const adminExists = (req,res,next) => {
    // if(req.session.Admin){
    //     return res.redirect('/admin/dashboard');
    // }
    next();
}

module.exports = {
  isLoggedIn,
  adminExists,
};
