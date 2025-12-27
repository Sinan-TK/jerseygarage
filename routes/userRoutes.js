import express from "express";
import * as userMiddleware from "../middlewares/userMiddleware.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/user/userController.js";
import { userLayout } from "../middlewares/layoutMiddleware.js";
import { sidebarData } from "../middlewares/sidebarMiddleware.js";
import { Userdetails } from "../middlewares/profileUserDetails.js";

const router = express.Router();

router.use(userLayout);

router.use(sidebarData);

router.use(Userdetails);

router.use(authMiddleware.profileIcon);


router.get("/profile",(req,res)=>{
  res.render("user/layouts/profilelayout",{
    title:"User Profile",
    pageCSS:"profile",
    view:"profile",
    profile:true,
    showHeader:true,
    showFooter:true,
    pageJS:"profile.js",
  });
})

router.get("/cart", userController.cartRender);

router.post("/logout",(req,res)=>{
  delete req.session.user;
  res.redirect("/");
})


export default router;
