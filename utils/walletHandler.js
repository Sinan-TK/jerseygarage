import Wallet from "../models/walletModel.js";
import WalletTransaction from "../models/walletTransactionModel.js";
import statusCode from "../constants/statusCode.js";
import * as Responses from "../utils/responses/user/user.response.js";

/* =========================
   CREDIT WALLET
========================= */

export const creditWallet = async (
  userId,
  amount,
  status,
  reason,
  razorpayOrderId = null,
  orderId = null,
) => {
  let wallet = await Wallet.findOne({ user: userId });

  // Auto-create (safety)
  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
    });
  }

  if (status === "SUCCESS") {
    wallet.balance += amount;
  }

  await WalletTransaction.create({
    user: wallet.user,
    wallet: wallet._id,
    type: "credit",
    amount,
    reason,
    status,
    orderId,
    razorpay: razorpayOrderId ? { orderId: razorpayOrderId } : null,
  });

  await wallet.save();

  return wallet;
};

/* =========================
   DEBIT WALLET
========================= */

export const debitWallet = async (
  userId,
  amount,
  status,
  reason,
  orderId = null,
) => {
  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }

  if (wallet.balance < amount) {
    return { error: Responses.wallet.INSUFFICIENT };
  }

  if (status === "SUCCESS") {
    wallet.balance -= amount;
  }

  await WalletTransaction.create({
    user: wallet.user,
    wallet: wallet._id,
    type: "debit",
    amount,
    reason,
    status,
    orderId,
  });

  await wallet.save();

  return wallet;
};
