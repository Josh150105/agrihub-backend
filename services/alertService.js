import Farmer from "../models/Farmer.js";
import { getWeatherData } from "./weatherService.js";
import { sendSMS } from "./smsService.js";

function buildMessage(farmer, type, weather) {

  const temp = weather.main.temp;
  const wind = weather.wind.speed;
  const condition = weather.weather[0].main;

  const name = farmer.name;
  const crop = farmer.crop;

  // ===================== TAMIL MESSAGES =====================

  const tamilMessages = {

    rain: `
வணக்கம் ${name},

உங்கள் பகுதி வானிலை அறிவிப்பு:

🌧 மழை வாய்ப்பு அதிகம் உள்ளது.

👉 பயிர்: ${crop}

அறிவுரை:
- உரம் இடுவதை தவிர்க்கவும்
- மருந்து தெளிப்பதை தள்ளி வைக்கவும்
- நீர்ப்பாசனத்தை குறைக்கவும்

- AgriHub TN
    `,

    heat: `
வணக்கம் ${name},

🌡 இன்று வெப்பம் அதிகமாக இருக்கும்.

வெப்பநிலை: ${temp}°C  
பயிர்: ${crop}

அறிவுரை:
- காலை / மாலை பாசனம் செய்யவும்
- நிழல் ஏற்பாடு செய்யவும்
- தண்ணீர் அளவை அதிகரிக்கவும்

- AgriHub TN
    `,

    wind: `
வணக்கம் ${name},

💨 காற்று வேகம் அதிகமாக உள்ளது.

காற்று வேகம்: ${wind} m/s  
பயிர்: ${crop}

அறிவுரை:
- பூச்சிக்கொல்லி தெளிக்க வேண்டாம்
- மரங்களை பாதுகாக்கவும்
- பாசனம் குறைக்கவும்

- AgriHub TN
    `
  };


  // ===================== ENGLISH MESSAGES =====================

  const englishMessages = {

    rain: `
Hello ${name},

Weather Alert for your area:

🌧 High chance of Rain today.

Crop: ${crop}

Advisory:
- Avoid fertilizer application
- Postpone pesticide spraying
- Reduce irrigation

- AgriHub TN
    `,

    heat: `
Hello ${name},

🌡 High Temperature Alert.

Temperature: ${temp}°C  
Crop: ${crop}

Advisory:
- Irrigate in morning/evening
- Provide shade
- Increase water supply

- AgriHub TN
    `,

    wind: `
Hello ${name},

💨 High Wind Speed Alert.

Wind Speed: ${wind} m/s  
Crop: ${crop}

Advisory:
- Avoid pesticide spraying
- Protect plants
- Reduce irrigation

- AgriHub TN
    `
  };

  if (farmer.language === "ta") {
    return tamilMessages[type];
  } else {
    return englishMessages[type];
  }

}



export async function runWeatherAlerts() {

  const farmers = await Farmer.find();

  for (let farmer of farmers) {

    const weather = await getWeatherData(farmer.lat, farmer.lon);

    if (!weather) continue;

    const temp = weather.main.temp;
    const wind = weather.wind.speed;
    const condition = weather.weather[0].main;

    let message = "";

    // 🌧 RAIN ALERT
    if (farmer.alertsEnabled.rain && condition === "Rain") {
      message = buildMessage(farmer, "rain", weather);
    }

    // 🌡 HEAT ALERT
    if (farmer.alertsEnabled.heat && temp > 35) {
      message = buildMessage(farmer, "heat", weather);
    }

    // 💨 WIND ALERT
    if (farmer.alertsEnabled.wind && wind > 10) {
      message = buildMessage(farmer, "wind", weather);
    }

    if (message) {
      await sendSMS(farmer.phone, message);
      console.log("Alert sent to:", farmer.phone);
    }

  }

  console.log("✅ All Farmer Alerts Processed Successfully");
}
