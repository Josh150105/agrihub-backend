import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  res.json([]); // temporary
});

export default router;
