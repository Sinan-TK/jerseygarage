
export const adminLayout = (req, res, next) => {
  res.locals.admin = req.session.admin;
  res.locals.layout = "admin/layouts/layout"; 
  next();
};
