import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;


// 🌦 5 DAY FORECAST FUNCTION
export async function getForecast(lat, lon) {
  try {

    if (!API_KEY) {
      throw new Error("OpenWeather API Key Missing");
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    const res = await axios.get(url);

    const data = res.data;

    if (!data || !data.list) {
      throw new Error("Invalid response from weather API");
    }

    // GROUP DATA BY DATE
    const daily = {};

    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];

      if (!daily[date]) {
        daily[date] = [];
      }

      daily[date].push(item);
    });

    // CREATE 5 DAY SUMMARY
    const summary = Object.keys(daily)
      .slice(0, 5)
      .map(date => {

        const items = daily[date];

        const avgTemp =
          items.reduce((a, b) => a + b.main.temp, 0) / items.length;

        const condition = items[0].weather[0].description.toLowerCase();

        return {
          date,
          avgTemp: parseFloat(avgTemp.toFixed(1)),
          condition
        };
      });

    return {
      success: true,
      forecast: summary
    };

  } catch (err) {

    console.log("Weather API Error:", err.message);

    return {
      success: false,
      forecast: []
    };
  }
}



// 🌤 CURRENT WEATHER FOR ADVISORY
export async function getWeatherData(lat, lon) {
  try {

    if (!API_KEY) {
      throw new Error("OpenWeather API Key Missing");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    const res = await axios.get(url);

    return res.data;

  } catch (err) {
    console.log("Current Weather API Error:", err.message);
    return null;
  }
}
