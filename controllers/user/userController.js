import { wrapAsync } from "../../utils/wrapAsync.js";

export const cartRender = wrapAsync((req, res) => {
  res.render("user/pages/cart", {
    title: "Cart",
    pageCSS: "cart",
    showHeader: true,
    showFooter: true,
    pageJS: "cart.js",
  });
});
