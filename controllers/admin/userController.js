import User from "../../models/userModel.js";
import Order from "../../models/orderModel.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";
import sendResponse from "../../utils/sendResponse.js";
import wrapAsync from "../../utils/wrapAsync.js";
import paginate from "../../utils/pagination.js";

// ======================================================================
// 1.USER LISTING
// ======================================================================

export const getUsers = (req, res) => {
  res.render("admin/pages/user", {
    title: "Users",
    showLayout: true,
    cssFile: "/css/admin/user.css",
    pageJS: "user.js",
  });
};

// ======================================================================
// 2. BLOCK & UNBLOCK USER
// ======================================================================

export const statusAction = wrapAsync(async (req, res) => {
  const { action, id } = req.params;

  if (!action || !id) {
    return sendResponse(res, Responses.userRes.INVALID);
  }

  if (action !== "block" && action !== "unblock") {
    return sendResponse(res,Responses.userRes.INVALID_ACTION);
  }

  const user = await User.findById(id);

  if (!user) {
    return sendResponse(res, Responses.userRes.USER_NOT_FOUND);
  }

  if (action === "block") {
    if (user.is_blocked) {
      return sendResponse(res, Responses.userRes.ALREADY_BLOCKED);
    }

    user.is_blocked = true;
    user.save();

    return sendResponse(res, {
      ...Responses.userStatus.USER_BLOCK,
      data: user,
    });
  } else {
    if (!user.is_blocked) {
      return sendResponse(res, Responses.userRes.ALREADY_BLOCKED);
    }

    user.is_blocked = false;
    user.save();

    return sendResponse(res, {
      ...Responses.userStatus.USER_UNBLOCK,
      data: user,
    });
  }
});

// ======================================================================
// 3.USER DATA
// ======================================================================

export const userData = wrapAsync(async (req, res) => {
  const page = req.query.page || 1;
  const search = req.query.search || "";
  const status = req.query.status || "all";

  const filter = {};

  if (search) {
    filter.$or = [
      { full_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "blocked") filter.is_blocked = true;
  if (status === "active") filter.is_blocked = false;

  const result = await paginate(User, page, 5, filter);

  const shapedUsers = await Promise.all(
    result.data.map(async (user) => {
      const orderCount = await Order.countDocuments({ user_id: user._id });

      const totalSpentResult = await Order.aggregate([
        {
          $match: {
            user_id: user._id,
            paymentStatus: "Paid",
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$totalPrice" },
          },
        },
      ]);

      return {
        ...user,
        orderCount: orderCount || 0,
        totalSpent: totalSpentResult[0]?.totalSpent || 0,
      };
    }),
  );

  return sendResponse(res, {
    code: 200,
    message: "Users data rendered",
    data: {
      users: shapedUsers,
      pagination: result.meta,
    },
  });
});
