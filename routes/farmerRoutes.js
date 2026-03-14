import express from "express";

import {
  registerFarmer,
  getAllFarmers,
  getFarmerByPhone,
  updateAlerts,
  farmerLogin
} from "../controllers/farmerController.js";

const router = express.Router();

// Farmer Registration
router.post("/register", registerFarmer);

// Farmer Login
router.post("/login", farmerLogin);

// Get all farmers (Admin use)
router.get("/", getAllFarmers);

// Get single farmer by phone
router.get("/:phone", getFarmerByPhone);

// Update alerts & crop
router.put("/update/:phone", updateAlerts);

export default router;
