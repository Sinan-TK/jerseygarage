const express = require('express');
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const router = express.Router();

// router.set('layout', 'admin/layouts/layout');
router.use((req, res, next) => {
  res.locals.layout = "admin/layouts/layout"; 
  next();
});

router.get("/login",adminMiddleware.adminExists, adminController.renderLoginPage);

router.post("/login", adminController.loginAdmin);

router.get("/dashboard",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/users",adminMiddleware.isLoggedIn, adminController.getUsers);

router.patch("/users/block/:id",adminMiddleware.isLoggedIn, adminController.blockUser);

router.patch("/users/unblock/:id",adminMiddleware.isLoggedIn, adminController.unblockUser);

router.get("/categories",adminMiddleware.isLoggedIn,adminController.getCategories)

router.post("/categories/add",adminController.addCategory);

router.patch("/categories/unblock/:id",adminMiddleware.isLoggedIn, adminController.unblockCategory );

router.patch("/categories/block/:id",adminMiddleware.isLoggedIn, adminController.blockCategory );

router.patch("/categories/edit/:id", adminController.editCategory);

router.get("/products",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/categories",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/offers",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/orders",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/payments",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/refunds",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get("/reviews",adminMiddleware.isLoggedIn,adminController.featureNotAvailable);

router.get('/logout', adminController.logOut );

router.get('/users/search', adminController.searchUser);

router.get('/categories/search', adminController.searchCategory);

// router.get('/featureNotAvailable',adminController.featureNotAvailable);

module.exports = router;
