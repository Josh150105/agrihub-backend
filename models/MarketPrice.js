import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  district: String,
  market: String,
  crop: String,
  price: String,
  arrivalDate: String
});

export default mongoose.model("MarketPrice", priceSchema);
