import express from "express";
import Alert from "../models/Alert.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const alerts = await Alert.find();
  res.json(alerts);
});

router.post("/", async (req, res) => {
  const alert = new Alert(req.body);
  await alert.save();
  res.json({ message: "Alert Added" });
});

export default router;
