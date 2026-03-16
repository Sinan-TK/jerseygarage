export const adminLayout = (req, res, next) => {
  res.locals.admin = req.session.admin;
  res.locals.layout = "admin/layouts/layout";
  next();
};

export const isLoggedIn = (req, res, next) => {
  if (!req.session.admin) {
    return res.redirect("/admin/login");
  }
  next();
};

export const otpVerifyReset = (req, res, next) => {
  if (!req.session?.resetPass) {
    return res.redirect("/admin/login");
  }
  next();
};

export const noMailFound = (req, res, next) => {
  if (!req.session.tempEmail) {
    return res.redirect("/admin/login");
  }
  next();
};
