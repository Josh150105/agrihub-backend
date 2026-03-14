import express from "express";
import mongoose from "mongoose";
import Office from "../models/Office.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= HELPER ================= */

const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ================= GET ALL ================= */

router.get("/", async (req, res) => {
  try {
    const offices = await Office.find().lean();
    return res.status(200).json(offices);
  } catch (err) {
    console.error("GET ALL error:", err);
    return res.status(500).json({ message: "Failed to fetch offices" });
  }
});

/* ================= GET BY DISTRICT + BLOCK ================= */

router.get("/by-block", async (req, res) => {
  try {
    let { district, block } = req.query;

    if (!district || district.trim() === "") {
      return res.status(200).json([]);
    }

    district = escapeRegex(district.trim());

    const query = {
      district: { $regex: `^${district}$`, $options: "i" }
    };

    // 🔥 If block selected
    if (block && block.trim() !== "") {

      block = block.trim();

      // 🔥 District HQ logic
      if (block.toLowerCase() === "district hq") {

        query.$or = [
          { block: { $exists: false } },
          { block: null },
          { block: "" }
        ];

      } else {

        block = escapeRegex(block);

        query.block = {
          $regex: `^${block}$`,
          $options: "i"
        };

      }
    }

    const offices = await Office.find(query).lean();
    return res.status(200).json(offices);

  } catch (err) {
    console.error("BY-BLOCK error:", err);
    return res.status(500).json({ message: "Search failed" });
  }
});

/* ================= GET NEARBY ================= */

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude & Longitude required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const offices = await Office.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude] // [lng, lat]
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 50000
        }
      }
    ]);

    return res.status(200).json(offices);

  } catch (err) {
    console.error("NEARBY error:", err);
    return res.status(500).json({ message: "Nearby search failed" });
  }
});

/* ================= GET ONE ================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid office ID" });
    }

    const office = await Office.findById(id).lean();

    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    return res.status(200).json(office);

  } catch (err) {
    console.error("GET ONE error:", err);
    return res.status(500).json({ message: "Failed to fetch office" });
  }
});

/* ================= ADD ================= */

router.post("/", adminAuth, async (req, res) => {
  try {
    const office = new Office(req.body);
    await office.save();

    return res.status(201).json({
      message: "Office added successfully",
      office
    });

  } catch (err) {
    console.error("ADD error:", err);
    return res.status(500).json({ message: "Failed to add office" });
  }
});

/* ================= UPDATE ================= */

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid office ID" });
    }

    const updated = await Office.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Office not found" });
    }

    return res.status(200).json(updated);

  } catch (err) {
    console.error("UPDATE error:", err);
    return res.status(500).json({ message: "Failed to update office" });
  }
});

/* ================= DELETE ================= */

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid office ID" });
    }

    const deleted = await Office.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Office not found" });
    }

    return res.status(200).json({
      message: "Office deleted successfully"
    });

  } catch (err) {
    console.error("DELETE error:", err);
    return res.status(500).json({ message: "Failed to delete office" });
  }
});

export default router;
