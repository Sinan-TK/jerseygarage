export const orderRes = Object.freeze({
  NOT_FOUND: {
    code: 404,
    message: "Order not found",
  },
  INVALID_STATUS: {
    code: 400,
    message: "Invalid order status",
  },
  NON_CANCELLABLE: {
    code: 400,
    message: "Order cannot be cancelled at this stage",
  },
  INVALID_PAY_STATUS: {
    code: 400,
    message: "Invalid payment status",
  },
  CANNOT_CHANGE_REFUNDED: {
    code: 400,
    message: "Payment is already refunded. Status cannot be changed.",
  },
  CANNOT_CHANGE_CANCELLED: {
    code: 400,
    message: "Payment is already failed. Status cannot be changed.",
  },
  CANNOT_CHANGE: {
    code: 400,
    message: "Cannot change payment status from Paid to Pending",
  },
  SOMETHING_WRONG: {
    code: 403,
    message: "Something went wrong",
  },
  RETURN_REQ_NOT_FOUND: {
    code: 400,
    message: "Return request not found",
  },
  RETURN_ALREADY_PROCCESSED: {
    code: 400,
    message: "Return request already processed",
  },
  INVALID_TYPE: {
    code: 400,
    message: "Invalid type",
  },
});
