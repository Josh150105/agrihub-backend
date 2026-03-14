import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  title: String,
  message: String,
  category: String,
  date: {
    type: String,
    default: new Date().toISOString().slice(0,10)
  }
});

export default mongoose.model("Alert", AlertSchema);
