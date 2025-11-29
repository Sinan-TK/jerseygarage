
export const adminLayout = (req, res, next) => {
  res.locals.layout = "admin/layouts/layout"; 
  next();
};

export const userLayout = (req, res, next) => {
  res.locals.layout = "admin/layouts/layout"; 
  next();
};