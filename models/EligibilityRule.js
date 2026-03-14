import mongoose from "mongoose";

const eligibilitySchema = new mongoose.Schema({
  schemeId: String,
  schemeName: String,
  department: String,

  minLand: Number,
  maxLand: Number,

  minIncome: Number,
  maxIncome: Number,

  allowedCrops: [String],
  allowedDistricts: [String],
  allowedCategories: [String],
  farmerTypes: [String],

  keywords: [String]
});

export default mongoose.model("EligibilityRule", eligibilitySchema);
