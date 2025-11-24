export default (req, res, next) => {
  if (req.session && req.session.toast) {
    res.locals.toast = req.session.toast;
    delete req.session.toast;
  } else {
    res.locals.toast = null;
  }
  next();
};