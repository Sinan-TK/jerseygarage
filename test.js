import dotenv from "dotenv";
dotenv.config();

import cloudinary from "./config/cloudinary.js";

cloudinary.api.ping()
  .then(res => console.log("Cloudinary OK:", res))
  .catch(err => console.error("Cloudinary ERROR:", err));
