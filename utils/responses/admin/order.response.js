import statusCode from "../../../constants/statusCode.js";

export const orderRes = Object.freeze({
  NOT_FOUND: {
    code: statusCode.CLIENT.NOT_FOUND,
    message: "Order not found",
  },
  INVALID_STATUS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid order status",
  },
  NON_CANCELLABLE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Order cannot be cancelled at this stage",
  },
  INVALID_PAY_STATUS: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid payment status",
  },
  CANNOT_CHANGE_REFUNDED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Payment is already refunded. Status cannot be changed.",
  },
  CANNOT_CHANGE_CANCELLED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Payment is already failed. Status cannot be changed.",
  },
  CANNOT_CHANGE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Cannot change payment status from Paid to Pending",
  },
  SOMETHING_WRONG: {
    code: statusCode.CLIENT.FORBIDDEN,
    message: "Something went wrong",
  },
  RETURN_REQ_NOT_FOUND: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Return request not found",
  },
  RETURN_ALREADY_PROCCESSED: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Return request already processed",
  },
  INVALID_TYPE: {
    code: statusCode.CLIENT.BAD_REQUEST,
    message: "Invalid type",
  },
});
