import Admin from "../../models/adminModel.js";
import Order from "../../models/orderModel.js";
import * as adminConstants from "../../constants/adminConstants.js";
import * as Responses from "../../utils/responses/admin/admin.response.js";

// =============================================================================
// 1. ADMIN LOGIN SERVICE
// =============================================================================

export const adminLoginLogic = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return { error: Responses.adminLogin.ADMIN_NOT_FOUND };
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return { error: Responses.adminLogin.INVALID_PASSWORD };
  }

  return {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatar,
    },
  };
};

// =============================================================================
// 2. ADMIN DASHBOARD FILTER
// =============================================================================

export const adminDashboardFilter = async ({ filter }) => {
  let groupBy;
  let labels = [];
  let matchStage = {};
  const now = new Date();

  if (filter === adminConstants.dashboardFilter.week) {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    matchStage = { createdAt: { $gte: start } };
    groupBy = { $dayOfWeek: "$createdAt" };

    labels = adminConstants.dashboardLabels.week;
  } else if (filter === adminConstants.dashboardFilter.month) {
    const start = new Date(now.getFullYear(), 0, 1);
    matchStage = { createdAt: { $gte: start } };
    groupBy = { $month: "$createdAt" };

    labels = adminConstants.dashboardLabels.month;
  } else if (filter === adminConstants.dashboardFilter.year) {
    const startYear = now.getFullYear() - 5;
    const start = new Date(startYear, 0, 1);
    matchStage = { createdAt: { $gte: start } };
    groupBy = { $year: "$createdAt" };

    labels = Array.from({ length: 6 }, (_, i) => String(startYear + i));
  } else {
    return { error: Responses.dashboard.INVALID_FILTER };
  }

  const result = await Order.aggregate([
    {
      $match: {
        ...matchStage,
        paymentStatus: { $in: ["Paid", "Refunded"] },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenue = [];
  const orders = [];

  if (filter === adminConstants.dashboardFilter.week) {
    const filled = Array(7).fill(0);
    const filledOrders = Array(7).fill(0);

    result.forEach((r) => {
      filled[r._id - 1] = r.revenue;
      filledOrders[r._id - 1] = r.orders;
    });

    revenue.push(...filled);
    orders.push(...filledOrders);
  } else if (filter === adminConstants.dashboardFilter.month) {
    const filled = Array(12).fill(0);
    const filledOrders = Array(12).fill(0);

    result.forEach((r) => {
      filled[r._id - 1] = r.revenue;
      filledOrders[r._id - 1] = r.orders;
    });

    revenue.push(...filled);
    orders.push(...filledOrders);
  } else if (filter === adminConstants.dashboardFilter.year) {
    const startYear = now.getFullYear() - 5;
    const filled = Array(6).fill(0);
    const filledOrders = Array(6).fill(0);

    result.forEach((r) => {
      const idx = r._id - startYear;
      if (idx >= 0 && idx < 6) {
        filled[idx] = r.revenue;
        filledOrders[idx] = r.orders;
      }
    });

    revenue.push(...filled);
    orders.push(...filledOrders);
  }

  return {
    success: true,
    labels,
    revenue,
    orders,
  };
};
