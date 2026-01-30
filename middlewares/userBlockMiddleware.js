import User from "../models/userModel.js";

export const checkBlockedUser = async (req, res, next) => {
  try {
    if (!req.session.user?.id) return next();

    const user = await User.findById(req.session.user.id)
      .select("is_blocked");

    if (!user || user.is_blocked) {
      return req.session.destroy(() => {  
        res.redirect("/login?blocked=true");
      });
    }

    // User is active → continue
    next();

  } catch (error) {
    console.error("checkBlockedUser error:", error);
    res.status(500).send("Server Error");
  }
};

