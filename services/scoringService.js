export const calculateScore = (rule, input) => {

  let score = 0;
  let reasonsEnglish = [];
  let reasonsTamil = [];

  if (input.landSize >= rule.minLand &&
      input.landSize <= rule.maxLand) {

    score += 25;
    reasonsEnglish.push("Land size eligible");
    reasonsTamil.push("நில அளவு தகுதி உள்ளது");
  }

  if (input.income >= rule.minIncome &&
      input.income <= rule.maxIncome) {

    score += 25;
    reasonsEnglish.push("Income range eligible");
    reasonsTamil.push("வருமான வரம்பு தகுதி உள்ளது");
  }

  if (
    rule.allowedCrops.includes("all") ||
    rule.allowedCrops.includes(input.cropType)
  ) {
    score += 25;
  }

  if (
    rule.allowedDistricts.includes("all") ||
    rule.allowedDistricts.includes(input.district)
  ) {
    score += 25;
  }

  return { score, reasonsEnglish, reasonsTamil };
};
