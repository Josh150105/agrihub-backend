import { getWeatherData } from "../services/weatherService.js";

function generateAdvisory(weather, crop) {

  const temp = weather.main.temp;
  const rain = weather.weather[0].main;
  const wind = weather.wind.speed;

  let advisoryTamil = "";
  let advisoryEnglish = "";

  if (rain === "Rain") {
    advisoryTamil = "மழை வாய்ப்பு அதிகம். உரம் இடுவதை தள்ளி வைக்கவும்.";
    advisoryEnglish = "High chance of rain. Postpone fertilizer application.";
  }

  else if (temp > 35) {
    advisoryTamil = "வெப்பம் அதிகம். பாசனம் செய்ய பரிந்துரை.";
    advisoryEnglish = "High temperature. Irrigation recommended.";
  }

  else if (wind > 10) {
    advisoryTamil = "காற்று வேகம் அதிகம். பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும்.";
    advisoryEnglish = "High wind speed. Avoid pesticide spraying.";
  }

  else {
    advisoryTamil = "வானிலை சாதாரணமாக உள்ளது. வழக்கமான விவசாய பணிகளை செய்யலாம்.";
    advisoryEnglish = "Weather is normal. Continue regular farming activities.";
  }

  return { advisoryTamil, advisoryEnglish };
}



export async function getWeatherAdvisory(req, res) {

  const { lat, lon, cropType } = req.query;

  console.log("Received Lat Lon:", lat, lon);

  if (!lat || !lon) {
    return res.status(400).json({ message: "Location required" });
  }

  const weather = await getWeatherData(lat, lon);

  console.log("Weather API Raw Output:", weather);

  if (!weather) {
    return res.status(500).json({ message: "Weather fetch failed" });
  }

  const advice = generateAdvisory(weather, cropType);

  res.json({
    temperature: weather.main.temp,
    humidity: weather.main.humidity,
    windSpeed: weather.wind.speed,
    condition: weather.weather[0].main,

    advisoryTamil: advice.advisoryTamil,
    advisoryEnglish: advice.advisoryEnglish
  });
}
