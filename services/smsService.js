import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.FAST2SMS_API_KEY;

export async function sendSMS(phone, message) {
  try {

    const res = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        numbers: phone
      },
      {
        headers: {
          authorization: API_KEY
        }
      }
    );

    console.log("SMS Sent to:", phone);
    return res.data;

  } catch (err) {
    console.log("SMS Error:", err.message);
  }
}
