import wrapAsync from "../../utils/wrapAsync.js";


export const orderPageRender = wrapAsync((req, res) => {
  res.render("admin/pages/orders", {
    title: "Orders",
    showLayout: true,
    cssFile: "/css/admin/orders.css",
    // errorMessage: "",
    pageJS: "orders.js",
  });
});

export const orderDetailsPageRender = wrapAsync((req, res) => {
  res.render("admin/pages/orderdetails", {
    title: "Order Details",
    showLayout: true,
    cssFile: "/css/admin/orderdetails.css",
    // errorMessage: "",
    pageJS: "orderdetails.js",
  });
});