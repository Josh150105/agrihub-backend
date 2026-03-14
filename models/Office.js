import mongoose from "mongoose";

const officeSchema = new mongoose.Schema({
  nameEnglish: String,
  nameTamil: String,

  addressEnglish: String,
  addressTamil: String,

  phone: String,

  district: String,

  block: {
    type: String,
    default: "District HQ"
  },

  type: {
    type: String,
    enum: ["Agriculture", "Veterinary", "Horticulture", "Fisheries"],
    default: "Agriculture"
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],   // [longitude, latitude]
      required: true
    }
  }
});

officeSchema.index({ location: "2dsphere" });

const Office = mongoose.model("Office", officeSchema);

export default Office;
