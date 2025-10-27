import express from "express";
import { 
  getCustomers, 
  createOrFindCustomer, 
  getCustomerPayments, 
  verifyGoogleToken,
  updateCustomer
} from "../controllers/customerController.js";

const router = express.Router();

// Get all customers
router.get("/", getCustomers);

// Create or find customer by phone number
router.post("/create-or-find", createOrFindCustomer);

// Get customer payment history
router.get("/:customerId/payments", getCustomerPayments);

// Update customer profile
router.put("/:customerId", updateCustomer);

// Verify Google authentication token
router.post("/auth/google", verifyGoogleToken);

export default router;
