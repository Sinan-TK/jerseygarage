import statusCode from "../../constants/statusCode.js";

export default Object.freeze({
  SERVER_ERROR: {
    code: statusCode.SERVER.INTERNAL_SERVER_ERROR,
    message: "Something went wrong. Please try again later!",
  },
  BAD_REQUEST: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid request!",
  },
  UNAUTHORIZED: {
    code: statusCode.CLIENT.UNAUTHORIZED,
    message: "Unauthorized access!",
  },
  FORBIDDEN: {
    code: statusCode.CLIENT.FORBIDDEN,
    message: "You do not have permission to perform this action!",
  },
  NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Resource not found!",
  },
});
