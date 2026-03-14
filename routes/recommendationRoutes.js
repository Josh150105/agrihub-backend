import express from "express";
import EligibilityRule from "../models/EligibilityRule.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {

    const {
      landSize,
      income,
      cropType,
      district,
      farmerType,
      department   // NEW
    } = req.body;

    // 🔥 MAIN FIX – Department Based Query
    let query = {};

    if (department && department !== "all") {
      query.department = department;
    }

    const rules = await EligibilityRule.find(query);

    let recommendations = [];

    rules.forEach(rule => {

      let score = 0;
      let reasons = [];

      // LAND CHECK
      if (
        landSize >= rule.minLand &&
        landSize <= rule.maxLand
      ) {
        score += 20;
        reasons.push("Land size matches");
      }

      // INCOME CHECK
      if (
        income >= rule.minIncome &&
        income <= rule.maxIncome
      ) {
        score += 20;
        reasons.push("Income range matches");
      }

      // CROP CHECK
      if (
        rule.allowedCrops.includes("all") ||
        rule.allowedCrops.includes(cropType)
      ) {
        score += 20;
        reasons.push("Crop type suitable");
      }

      // DISTRICT CHECK
      if (
        rule.allowedDistricts.includes("all") ||
        rule.allowedDistricts.includes(district)
      ) {
        score += 20;
        reasons.push("District eligibility matched");
      }

      // FARMER TYPE CHECK
      if (
        rule.farmerTypes.includes("all") ||
        rule.farmerTypes.includes(farmerType)
      ) {
        score += 20;
        reasons.push("Farmer category suitable");
      }

      if (score >= 40) {
        recommendations.push({
          schemeId: rule.schemeId,
          schemeName: rule.schemeName,
          department: rule.department,
          score,
          reasons
        });
      }

    });

    // BEST MATCH FIRST
    recommendations.sort((a, b) => b.score - a.score);

    res.json(recommendations);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Recommendation Error" });
  }
});

export default router;
