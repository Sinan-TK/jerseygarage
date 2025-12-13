import { sendResponse } from "../utils/sendResponse.js";
import { globalResponses } from "../utils/responses/global.responses.js";

export const errorHandler = (err, req, res, next) => {
  console.error("-----|| Error Handler:", err);

  const statusCode =
    err.statusCode ||
    err.status ||
    err.code ||
    globalResponses.SERVER_ERROR.code;

  const responseMessage =
    err.message ||
    Object.values(globalResponses).find((r) => r.code === statusCode)
      ?.message ||
    globalResponses.SERVER_ERROR.message;

  return sendResponse(res, {
    code: statusCode,
    message: responseMessage,
  });
};
