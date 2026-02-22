import Category from "../../models/categoryModel.js";
import Offer from "../../models/offerModel.js";
import Product from "../../models/productModel.js";
import wrapAsync from "../../utils/wrapAsync.js";
import sendResponse from "../../utils/sendResponse.js";

import offerSchema from "../../validators/offerValidator.js";
import paginate from "../../utils/pagination.js";
import { ObjectId } from "mongodb";
import * as Responses from "../../utils/responses/admin/offer.response.js";

//

//

export const couponPage = wrapAsync(async (req, res) => {
  res.render("admin/pages/coupons", {
    title: "Coupons",
    showLayout: true,
    cssFile: "/css/admin/coupons.css",
    pageJS: "coupons.js",
  });
});
