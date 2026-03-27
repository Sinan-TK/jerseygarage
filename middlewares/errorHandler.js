import sendResponse from "../utils/sendResponse.js";
import globalResponses from "../utils/responses/global.responses.js";
import statusCode from "../constants/statusCode.js";

export const PageNotFound = (req, res, next) => {
  res.status(statusCode.CLIENT.NOT_FOUND).render("user/pages/404", {
    title: "404 Page not found",
    pageCSS: "404",
    showHeader: true,
    showFooter: true,
    pageJS: "",
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("-----|| Error Handler:", err);

  const statusCode =
    err.statusCode ||
    err.status ||
    err.code ||
    globalResponses.SERVER_ERROR.code;

  if (statusCode === statusCode.CLIENT.NOT_FOUND) {
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return sendResponse(res, {
        code: statusCode.CLIENT.NOT_FOUND,
        message: err.message || "Page not found",
      });
    }

    return res.status(statusCode.CLIENT.NOT_FOUND).render("user/pages/404", {
      title: "404 Page not found",
      pageCSS: "404",
      showHeader: true,
      showFooter: true,
      pageJS: "",
    });
  }

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
