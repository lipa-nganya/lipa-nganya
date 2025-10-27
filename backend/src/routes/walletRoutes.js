import express from "express";
import { getWalletBalances, getWalletTransactions, transferMoney } from "../controllers/walletController.js";

const router = express.Router();

// Get wallet balances for driver/conductor
router.post("/balances", getWalletBalances);

// Get wallet transactions for driver/conductor
router.post("/transactions", getWalletTransactions);

// Transfer money between wallets
router.post("/transfer", transferMoney);

export default router;
