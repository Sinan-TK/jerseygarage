import Category from "../models/categoryModel.js";

export const sidebarData = async (req, res, next) => {
  try {
    const categories = await Category.find({ is_active: true })
      .select("name")
      .lean();

    res.locals.sideBarCategories = categories;
    next();
  } catch (error) {
    console.error("Sidebar middleware error:", error);
    res.locals.categories = [];
    next();
  }
};
