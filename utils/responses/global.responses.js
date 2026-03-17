export default  Object.freeze({
  SERVER_ERROR: {
    code: 500,
    message: "Something went wrong. Please try again later!",
  },
  BAD_REQUEST: {
    code: 400,
    message: "Invalid request!",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized access!",
  },
  FORBIDDEN: {
    code: 403,
    message: "You do not have permission to perform this action!",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found!",
  }
});