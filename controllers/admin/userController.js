import User from "../../models/userModel.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";
import sendResponse from "../../utils/sendResponse.js";
import wrapAsync from "../../utils/wrapAsync.js";
import paginate from "../../utils/pagination.js";

export const getUsers = wrapAsync(async (req, res) => {
  let page = req.query.page || 1;

  const result = await paginate(User, page, 5);

  res.render("admin/pages/user", {
    title: "Users",
    showLayout: true,
    cssFile: "/css/admin/user.css",
    users: result.data,
    pagination: result.meta,
    pageJS: "user.js",
  });
});

// ======================================================================
// 4. BLOCK USER
// ======================================================================
export const blockUser = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { is_blocked: true },
    { new: true },
  );

  return sendResponse(res, {
    ...Responses.userStatus.USER_BLOCK,
    data: updatedUser,
  });
});

// ======================================================================
// 5. UNBLOCK USER
// ======================================================================
export const unblockUser = wrapAsync(async (req, res) => {
  const id = req.params.id;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { is_blocked: false },
    { new: true },
  );

  return sendResponse(res, {
    ...Responses.userStatus.USER_UNBLOCK,
    data: updatedUser,
  });
});

// ======================================================================
// 6.SEARCH USER
// ======================================================================

export const searchUser = wrapAsync(async (req, res) => {
  let page = req.query.page || 1;
  const search = req.query.searchContent || "";
  const status = req.query.userStatus || "all";

  let filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "blocked") filter.is_blocked = true;
  if (status === "active") filter.is_blocked = false;

  const result = await paginate(User, page, 5, filter);

  res.render("admin/pages/user", {
    title: "Users",
    showLayout: true,
    cssFile: "/css/admin/user.css",
    users: result.data,
    pagination: result.meta,
    userStatus: req.query.userStatus || "all",
    searchContent: req.query.searchContent,
    pageJS: "user.js",
  });
});
