import mongoose from "mongoose";

const FarmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  district: String,
  block: String,

  lat: Number,
  lon: Number,

  crop: {
    type: String,
    default: "paddy"
  },

  language: {
    type: String,
    enum: ["ta", "en"],
    default: "ta"
  },

  alertsEnabled: {
    rain: { type: Boolean, default: true },
    wind: { type: Boolean, default: true },
    heat: { type: Boolean, default: true }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Farmer", FarmerSchema);
