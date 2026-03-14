import express from "express";
import Farmer from "../models/Farmer.js";

const router = express.Router();

// Farmer Login
router.post("/login", async (req, res) => {

  const { phone } = req.body;

  const farmer = await Farmer.findOne({ phone });

  if (!farmer) {
    return res.json({ success: false, message: "Farmer not found" });
  }

  res.json({ success: true, farmer });
});


// Get Farmer Profile
router.get("/:id", async (req, res) => {

  const farmer = await Farmer.findById(req.params.id);

  res.json(farmer);
});


// Update Farmer Profile
router.put("/:id", async (req, res) => {

  await Farmer.findByIdAndUpdate(req.params.id, req.body);

  res.json({ message: "Profile Updated Successfully" });
});

export default router;
