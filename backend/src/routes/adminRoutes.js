import express from "express";
import { 
  adminLogin,
  getAllSaccos,
  createSacco,
  getAllMatatus,
  createMatatu,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getDashboardStats
} from "../controllers/adminController.js";

const router = express.Router();

// Admin authentication
router.post("/login", adminLogin);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// Saccos management
router.get("/saccos", getAllSaccos);
router.post("/saccos", createSacco);

// Matatus management
router.get("/matatus", getAllMatatus);
router.post("/matatus", createMatatu);

// Drivers/Conductors management
router.get("/drivers", getAllDrivers);
router.post("/drivers", createDriver);
router.put("/drivers/:id", updateDriver);
router.delete("/drivers/:id", deleteDriver);

export default router;
