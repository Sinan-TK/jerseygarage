export const sendResponse = (
  res,
  {
    code = 200,
    message = "",
    data = null,
    redirect = null,
    redirectToFrontend = null,
  } = {}
) => {
  // Auto-success logic
  const success = code < 400;

  // Backend redirect
  if (redirect) {
    return res.redirect(code === 200 ? 302 : code, redirect);
  }

  // JSON output
  return res.status(code).json({
    success,
    message,
    ...(data && { data }),
    ...(redirectToFrontend && { redirect: redirectToFrontend }),
  });
};
