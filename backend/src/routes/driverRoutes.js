import express from "express";
import { sendDriverOTP, verifyDriverOTP, setupPin } from "../controllers/driverController.js";

const router = express.Router();

// Send OTP for driver authentication
router.post("/send-driver-otp", sendDriverOTP);

// Verify driver OTP
router.post("/verify-driver-otp", verifyDriverOTP);

// Setup PIN for driver/conductor
router.post("/setup-pin", setupPin);

export default router;
