import User from "../models/userModel.js";

export const Userdetails = async (req, res, next) => {
  try {
    // console.log(req.session.user.id);
    const userId = req.session.user.id;
    
    const userDeatils = await User.findById(userId).lean();
    res.locals.userDetails = userDeatils;
    next();
  } catch (error) {
    console.error("Profile User Detail middleware error:", error);
    res.locals.userDetails = [];
    next();
  }
};
