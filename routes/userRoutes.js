import express from "express";
import * as userMiddleware from "../middlewares/userMiddleware.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use((req, res, next) => {
  res.locals.layout = "user/layouts/layout";
  next();
});

router.use(authMiddleware.profileIcon);

router.get("/profile",(req,res)=>{
  res.render("user/pages/profile",{
    title:"User Profile",
    pageCSS:"profile",
    showHeader:true,
    showFooter:true,
    pageJS:"profile.js",
  });
})


router.post("/logout",(req,res)=>{
  delete req.session.user;
  res.redirect("/");
})


export default router;
