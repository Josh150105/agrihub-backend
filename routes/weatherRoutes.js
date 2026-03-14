import express from "express";
import { getForecast } from "../services/weatherService.js";
import { getWeatherAdvisory } from "../controllers/weatherController.js";

const router = express.Router();

router.get("/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude required"
      });
    }

    const data = await getForecast(lat, lon);

    if (!data || !data.success) {
      return res.status(500).json({
        success: false,
        message: "Weather fetch failed"
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// 🔥 THIS LINE WAS MISSING
router.get("/advisory", getWeatherAdvisory);


export default router;
