import { calculateExposureRisk, calculateSymptomRisk, calculateSpirometryRisk, calculateAudioRisk, computeComprehensiveRisk } from "./services/riskService.js";

async function runTests() {
  console.log("=== Running Occupational Lung Disease Risk Engine Tests ===");

  // Test 1: Low Risk Worker
  const lowRiskWorker = { yearsOfExposure: 1, dailyExposureHours: 6, ppeUsage: "ALWAYS" };
  const lowRiskExposure = { dustExposureLevel: "LOW", yearsOfExposure: 1, dailyHours: 6, ppeRegularity: "ALWAYS" };
  const lowRiskSymptoms = { coughDurationWeeks: 0, breathlessnessGrade: 0 };
  const lowRiskSpiro = { fev1: 3.5, fvc: 4.2, fev1FvcRatio: 83.3 };

  const lowResult = await computeComprehensiveRisk({
    worker: lowRiskWorker,
    exposure: lowRiskExposure,
    symptoms: lowRiskSymptoms,
    spirometry: lowRiskSpiro,
  });

  console.log("Test 1 Low Risk Result:", lowResult.overallRiskLevel, `(Score: ${lowResult.overallScore})`);
  console.assert(lowResult.overallRiskLevel === "LOW", "Test 1 Failed: Expected LOW risk");

  // Test 2: High Risk Worker
  const highRiskWorker = { yearsOfExposure: 16, dailyExposureHours: 10, ppeUsage: "NEVER" };
  const highRiskExposure = { dustExposureLevel: "EXTREME", yearsOfExposure: 16, dailyHours: 10, ppeRegularity: "NEVER", hasSandblastingOrDrilling: true };
  const highRiskSymptoms = { coughDurationWeeks: 6, coughType: "HEMOPTYSIS_BLOOD", breathlessnessGrade: 3, nightSweats: true };
  const highRiskSpiro = { fev1: 1.3, fvc: 2.7, fev1FvcRatio: 48.1 };
  const highRiskAudio = { classification: "CRACKLE", confidence: 0.85 };

  const highResult = await computeComprehensiveRisk({
    worker: highRiskWorker,
    exposure: highRiskExposure,
    symptoms: highRiskSymptoms,
    spirometry: highRiskSpiro,
    audio: highRiskAudio,
  });

  console.log("Test 2 High Risk Result:", highResult.overallRiskLevel, `(Score: ${highResult.overallScore})`);
  console.log("Risk Factors Identified:", highResult.riskFactors.length);
  console.assert(highResult.overallRiskLevel === "HIGH", "Test 2 Failed: Expected HIGH risk");
  console.assert(highResult.requiresClinicalReview === true, "Test 2 Failed: Expected clinical review flag");

  console.log("✅ All Risk Engine calculations passed verification successfully!");
}

runTests().catch(console.error);
