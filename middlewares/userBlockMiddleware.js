import User from "../models/userModel.js";

export const checkBlockedUser = async (req, res, next) => {
  if (!req.session.user?.id) return next();
  const user = await User.findById(req.session.user.id).select("is_blocked");

  if (!user || user.is_blocked) {
    req.session.destroy(() => {
      return res.redirect("/login?blocked=true");
    });
  } else {
    next();
  }
};
