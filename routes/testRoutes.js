import express from "express";
import Farmer from "../models/Farmer.js";
import { getWeatherData } from "../services/weatherService.js";
import { sendSMS } from "../services/smsService.js";

const router = express.Router();

// 🔥 SEND INSTANT ALERT TO GIVEN PHONE
router.get("/sendAlert/:phone", async (req, res) => {

  const farmer = await Farmer.findOne({ phone: req.params.phone });

  if (!farmer) {
    return res.json({ message: "Farmer not found" });
  }

  const weather = await getWeatherData(farmer.lat, farmer.lon);

  const msg =
    farmer.language === "ta"
      ? `வணக்கம் ${farmer.name}, உங்கள் பதிவு வெற்றிகரமாக முடிந்தது. இனிமேல் வானிலை அறிவிப்புகள் இந்த எண்ணுக்கு வரும் - AgriHub`
      : `Hello ${farmer.name}, Registration successful. You will receive weather alerts on this number - AgriHub`;

  await sendSMS(farmer.phone, msg);

  res.json({
    success: true,
    message: "Test SMS Sent"
  });

});

export default router;
