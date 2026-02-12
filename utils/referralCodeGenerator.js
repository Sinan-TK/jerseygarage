import crypto from "crypto";
import User from "../models/userModel.js";

/* =========================
   GENERATE BASE CODE
========================= */

const generateCode = (name = "") => {
  const prefix = name.replace(/\s+/g, "").substring(0, 4).toUpperCase();

  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return prefix + random;
};

/* =========================
   CREATE UNIQUE CODE
========================= */

export const createUniqueReferralCode = async (name) => {
  let code;
  let exists = true;

  while (exists) {
    code = generateCode(name);

    exists = await User.exists({
      referralCode: code,
    });
  }

  return code;
};
