import express from "express";
import { sendOTP, verifyOTP } from "../controllers/authController.js";

const router = express.Router();

// Send OTP via SMS
router.post("/send-otp", sendOTP);

// Verify OTP
router.post("/verify-otp", verifyOTP);

export default router;
