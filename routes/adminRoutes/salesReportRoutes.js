import express from "express";
import * as salesReportController from "../../controllers/admin/salesReportController.js";
import * as adminMiddleware from "../../middlewares/admin/adminMiddleware.js";

const router = express.Router();

router.get("/", salesReportController.salesReportPage);

router.get("/data", salesReportController.getSalesReport);

router.get("/products", salesReportController.productDatas);

router.get("/download/excel", salesReportController.downloadSalesExcel);

router.get("/download/pdf", salesReportController.downloadSalesPDF);

export default router;
