// utils/responses.js

export const adminLogin = Object.freeze({
  ADMIN_NOT_FOUND: {
    code: 404,
    message: "Admin not found!",
  },
  INVALID_PASSWORD: {
    code: 401,
    message: "Invalid password!",
  },
  LOGIN_SUCCESS: {
    code: 200,
    message: "Login successful!",
    redirectToFrontend:"/admin/dashboard"
  },
});

export const userStatus = Object.freeze({
  USER_BLOCK:{
    code: 200,
    message: "User blocked successfully!",
  },
  USER_UNBLOCK:{
    code: 200,
    message: "user unblocked successfully!",
  }
});