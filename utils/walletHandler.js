import Wallet from "../models/walletModel.js";

/* =========================
   CREDIT WALLET
========================= */

export const creditWallet = async (
  userId,
  amount,
  reason,
  orderId = null
) => {

  let wallet = await Wallet.findOne({ user: userId });

  // Auto-create (safety)
  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      transactions: []
    });
  }

  wallet.balance += amount;

  wallet.transactions.push({
    type: "credit",
    amount,
    reason,
    orderId
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
  reason,
  orderId = null
) => {

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new Error("WALLET_NOT_FOUND");
  }

  if (wallet.balance < amount) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  wallet.balance -= amount;

  wallet.transactions.push({
    type: "debit",
    amount,
    reason,
    orderId
  });

  await wallet.save();

  return wallet;
};
