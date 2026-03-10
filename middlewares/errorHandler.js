import sendResponse from "../utils/sendResponse.js";
import globalResponses from "../utils/responses/global.responses.js";

export const PageNotFound = (req, res, next) => {
  res.status(404).render("user/pages/404", {
    title: "404 Page not found",
    pageCSS: "404",
    showHeader:true,
    showFooter:true,
    pageJS:""
  });
};

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
