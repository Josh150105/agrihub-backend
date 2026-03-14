import mongoose from "mongoose";


const schemeSchema = new mongoose.Schema({
  titleEnglish: String,
  titleTamil: String,

  descriptionEnglish: String,
  descriptionTamil: String,

  benefitsEnglish: String,
  benefitsTamil: String,

  eligibilityEnglish: String,
  eligibilityTamil: String,

  department: String
});

export default mongoose.model("Scheme", schemeSchema);
