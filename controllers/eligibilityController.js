import express from "express";
import EligibilityRule from "../models/EligibilityRule.js";

const router = express.Router();

router.post("/recommend", async (req, res) => {
  try {

    const {
      landSize,
      income,
      cropType,
      farmerType,
      district,
      department
    } = req.body;

    let query = {};

    if (department && department !== "all") {
      query.department = department;
    }

    const rules = await EligibilityRule.find(query);

    let results = [];

    for (let rule of rules) {

  let score = 0;
  let totalPossible = 0;

  let reasonsEnglish = [];
  let reasonsTamil = [];

  /* ================= DEPARTMENT ================= */
  if (department && department !== "all") {

    totalPossible += 20;

    if (department === rule.department) {
      score += 20;
      reasonsEnglish.push("Selected department matches scheme");
      reasonsTamil.push("தேர்ந்த துறை திட்டத்துடன் பொருந்துகிறது");
    }
  }

  /* ================= LAND ================= */
  if (rule.minLand != null && rule.maxLand != null) {

    totalPossible += 25;

    if (landSize >= rule.minLand && landSize <= rule.maxLand) {
      score += 25;
      reasonsEnglish.push("Land size matches scheme requirement");
      reasonsTamil.push("நில அளவு பொருந்துகிறது");
    }
  }

  /* ================= INCOME ================= */
  if (rule.minIncome != null && rule.maxIncome != null) {

    totalPossible += 25;

    if (income >= rule.minIncome && income <= rule.maxIncome) {
      score += 25;
      reasonsEnglish.push("Income range matches");
      reasonsTamil.push("வருமான வரம்பு பொருந்துகிறது");
    }
  }

  /* ================= CROP ================= */
  if (rule.allowedCrops?.length) {

    totalPossible += 25;

    if (
      rule.allowedCrops.includes("all") ||
      rule.allowedCrops.includes(cropType?.toLowerCase())
    ) {
      score += 25;
      reasonsEnglish.push("Suitable for selected crop");
      reasonsTamil.push("தேர்ந்த பயிருக்கு ஏற்றது");
    }
  }

  /* ================= DISTRICT ================= */
  if (rule.allowedDistricts?.length) {

    totalPossible += 25;

    if (
      rule.allowedDistricts.includes("all") ||
      rule.allowedDistricts.includes(district)
    ) {
      score += 25;
      reasonsEnglish.push("Scheme available in your district");
      reasonsTamil.push("உங்கள் மாவட்டத்தில் கிடைக்கும்");
    }
  }

  /* ================= FARMER TYPE ================= */
  if (rule.farmerTypes?.length) {

    totalPossible += 10;

    if (
      rule.farmerTypes.includes("all") ||
      rule.farmerTypes.includes(farmerType)
    ) {
      score += 10;
      reasonsEnglish.push("Farmer type matches scheme");
      reasonsTamil.push("விவசாயி வகை பொருந்துகிறது");
    }
  }

  /* ================= NORMALIZE ================= */

  let finalScore = 0;

  if (totalPossible > 0) {
    finalScore = Math.round((score / totalPossible) * 100);
  }

  if (finalScore >= 30) {
    results.push({
      schemeId: rule.schemeId,
      titleEnglish: rule.schemeName,
      titleTamil: rule.schemeName,
      score: finalScore,
      reasonsEnglish,
      reasonsTamil,
      department: rule.department
    });
  }
}


    /* ================= SORT ================= */

    results.sort((a, b) => b.score - a.score);

    res.json(results);

  } catch (err) {
    console.log("Recommendation API Error:", err);

    res.status(500).json({
      error: "Recommendation Error",
      message: err.message
    });
  }
});

export default router;
