import express from "express";
import { sendDriverOTP, verifyDriverOTP } from "../controllers/driverController.js";

const router = express.Router();

// Send OTP for driver authentication
router.post("/send-driver-otp", sendDriverOTP);

// Verify driver OTP
router.post("/verify-driver-otp", verifyDriverOTP);

export default router;
