import EligibilityRule from "../models/EligibilityRule.js";

export const recommendSchemes = async (req, res) => {
  try {

    const {
      landSize,
      income,
      cropType,
      farmerType,
      district,
      category,
      department,
      budget
    } = req.body;

    // Basic validation
    if (!landSize || !income) {
      return res.status(400).json({
        message: "Land size and income required"
      });
    }

    // 🔥 STEP 1 – DEPARTMENT BASED HARD FILTER
    let query = {};

    if (department && department !== "all") {
      query.department = department;
    }

    // Fetch only relevant department rules
    const rules = await EligibilityRule.find(query);

    let results = [];

    for (let rule of rules) {

      let score = 0;

      let reasonsEnglish = [];
      let reasonsTamil = [];

      // 🔥 WEIGHT BASED SCORING SYSTEM

      // 1) LAND SIZE – 30%
      if (landSize >= rule.minLand && landSize <= rule.maxLand) {
        score += 30;
        reasonsEnglish.push("Land size matches scheme requirement");
        reasonsTamil.push("நில அளவு திட்ட விதிமுறைக்கு பொருந்துகிறது");
      } else {
        continue; // Hard filter
      }

      // 2) INCOME – 25%
      if (income >= rule.minIncome && income <= rule.maxIncome) {
        score += 25;
        reasonsEnglish.push("Income eligibility matched");
        reasonsTamil.push("வருமான தகுதி பொருந்துகிறது");
      } else {
        continue;
      }

      // 3) CROP TYPE – 20%
      if (
        rule.allowedCrops.includes("all") ||
        rule.allowedCrops.includes(cropType)
      ) {
        score += 20;
        reasonsEnglish.push("Suitable for selected crop");
        reasonsTamil.push("தேர்ந்த பயிருக்கு ஏற்றது");
      }

      // 4) DISTRICT – 10%
      if (
        rule.allowedDistricts.includes("all") ||
        rule.allowedDistricts.includes(district)
      ) {
        score += 10;
        reasonsEnglish.push("Available in your district");
        reasonsTamil.push("உங்கள் மாவட்டத்தில் கிடைக்கும்");
      }

      // 5) FARMER TYPE – 10%
      if (
        rule.farmerTypes.includes("all") ||
        rule.farmerTypes.includes(farmerType)
      ) {
        score += 10;
        reasonsEnglish.push("Farmer type eligible");
        reasonsTamil.push("விவசாயி வகை தகுதி உள்ளது");
      }

      // 6) CATEGORY – 5%
      if (
        rule.allowedCategories.includes("all") ||
        rule.allowedCategories.includes(category)
      ) {
        score += 5;
        reasonsEnglish.push("Category eligibility matched");
        reasonsTamil.push("வகை தகுதி பொருந்துகிறது");
      }

      // 🔥 BUDGET INTELLIGENCE
      if (budget === "low" && income < 200000) {
        score += 5;
      }

      // Minimum threshold
      if (score >= 40) {
        results.push({
          schemeId: rule.schemeId,
          titleEnglish: rule.schemeName,
          titleTamil: rule.schemeName,
          department: rule.department,
          score,
          reasonsEnglish,
          reasonsTamil
        });
      }
    }

    // Sort best first
    results.sort((a, b) => b.score - a.score);

    return res.json(results);

  } catch (err) {
    console.log("Recommendation Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
