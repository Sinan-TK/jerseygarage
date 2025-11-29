import { sendResponse } from "../utils/sendResponse.js";
import { globalResponses } from "../utils/responses/global.responses.js";

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error Handler:", err);

  return sendResponse(res, {
    code: err.statusCode || 500,
    message: err.message || globalResponses.SERVER_ERROR.message,
  });
};
