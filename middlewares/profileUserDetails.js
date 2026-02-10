import User from "../models/userModel.js";

export const Userdetails = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const userDeatils = await User.findById(userId)
      .populate("wallet", "balance")
      .lean();
    res.locals.userDetails = userDeatils;
    next();
  } catch (error) {
    console.error("Profile User Detail middleware error:", error);
    res.locals.userDetails = [];
    next();
  }
};
