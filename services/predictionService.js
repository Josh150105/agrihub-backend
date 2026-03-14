import { SimpleLinearRegression } from "ml-regression-simple-linear";

export function predictFarmerGrowth(dataPoints) {

  const x = dataPoints.map((_, i) => i);
  const y = dataPoints;

  const regression = new SimpleLinearRegression(x, y);

  const nextIndex = dataPoints.length;
  const prediction = regression.predict(nextIndex);

  return Math.round(prediction);
}
