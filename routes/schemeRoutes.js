import express from "express";
import Scheme from "../models/Scheme.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// ===== PUBLIC ROUTES =====

// Get all schemes
router.get("/", async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// District route must come BEFORE :id
router.get("/district/:name", async (req, res) => {
  try {
    const schemes = await Scheme.find({ department: req.params.name });
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get scheme by id
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===== ADMIN ROUTES =====

// Add new scheme (Protected)
router.post("/", adminAuth, async (req, res) => {
  try {
    const newScheme = new Scheme(req.body);
    await newScheme.save();
    res.json({ message: "Scheme Added Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update scheme (Protected)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const updated = await Scheme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete scheme (Protected)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    res.json({ message: "Scheme deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
