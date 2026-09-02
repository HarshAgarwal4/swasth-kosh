/**
 * Multi-Factor Risk Calculation Agent
 * Exposure (30%), Symptoms (35%), Spirometry (25%), Audio (10%)
 */
export function analyzeMultiFactorRisk({ exposure = {}, symptoms = {}, spirometry = {}, audio = {} }) {
  const riskFactors = [];
  const signals = [];

  // 1. Exposure Score (0 - 100)
  let expScore = 10;
  const years = Number(exposure.yearsOfExposure) || 0;
  const daily = Number(exposure.dailyHours) || 8;

  if (years >= 15) {
    expScore += 45;
    riskFactors.push({ factor: "Prolonged occupational exposure >= 15 years", category: "EXPOSURE", severity: "HIGH" });
  } else if (years >= 7) {
    expScore += 25;
    riskFactors.push({ factor: "Cumulative dust exposure 7-14 years", category: "EXPOSURE", severity: "MODERATE" });
  }

  if (exposure.dustExposureLevel === "EXTREME") {
    expScore += 30;
    riskFactors.push({ factor: "Extreme silica dust concentration (crushing/dry sandblasting)", category: "EXPOSURE", severity: "HIGH" });
  } else if (exposure.dustExposureLevel === "HEAVY") {
    expScore += 20;
  }

  if (exposure.ppeRegularity === "NEVER" || exposure.ppeRegularity === "RARELY") {
    expScore += 25;
    riskFactors.push({ factor: "Inadequate respiratory PPE compliance (cloth/no mask)", category: "EXPOSURE", severity: "HIGH" });
  }

  if (exposure.hasSandblastingOrDrilling) {
    expScore += 15;
    riskFactors.push({ factor: "Direct dry drilling without water dust suppression", category: "EXPOSURE", severity: "MODERATE" });
  }
  expScore = Math.min(100, expScore);

  // 2. Symptom Score (0 - 100)
  let symScore = 0;
  const coughWeeks = Number(symptoms.coughDurationWeeks) || 0;
  const dyspnea = Number(symptoms.breathlessnessGrade) || 0;

  if (symptoms.coughType === "HEMOPTYSIS_BLOOD") {
    symScore += 50;
    riskFactors.push({ factor: "Hemoptysis / Blood in sputum (🚨 Suspected Silico-TB)", category: "SYMPTOMS", severity: "CRITICAL" });
    signals.push({ type: "RED_FLAG", description: "Blood in sputum detected", severity: "CRITICAL" });
  } else if (symptoms.coughType === "PRODUCTIVE_MUCUS") {
    symScore += 20;
  }

  if (coughWeeks >= 3) {
    symScore += 25;
    riskFactors.push({ factor: `Chronic persistent cough for ${coughWeeks} weeks (> 3 weeks threshold)`, category: "SYMPTOMS", severity: "HIGH" });
  }

  if (dyspnea >= 3) {
    symScore += 35;
    riskFactors.push({ factor: `Severe exertional dyspnea (mMRC Grade ${dyspnea})`, category: "SYMPTOMS", severity: "HIGH" });
  } else if (dyspnea >= 2) {
    symScore += 20;
    riskFactors.push({ factor: `Moderate breathlessness on level ground (mMRC Grade ${dyspnea})`, category: "SYMPTOMS", severity: "MODERATE" });
  }

  if (symptoms.nightSweats) {
    symScore += 20;
    riskFactors.push({ factor: "Drenching night sweats (Mycobacterial coinfection risk)", category: "SYMPTOMS", severity: "HIGH" });
  }
  if (symptoms.chestTightnessOrPain) symScore += 10;
  if (symptoms.unexplainedFatigue) symScore += 10;
  symScore = Math.min(100, symScore);

  // 3. Spirometry Score (0 - 100)
  let spiroScore = 15;
  const fev1 = Number(spirometry.fev1) || 0;
  const ratio = Number(spirometry.fev1FvcRatio) || 0;

  if (ratio > 0 && ratio < 70) {
    spiroScore += 40;
    riskFactors.push({ factor: `Obstructive ventilatory limitation (FEV1/FVC: ${ratio}%)`, category: "SPIROMETRY", severity: "HIGH" });
    signals.push({ type: "AIRFLOW_OBSTRUCTION", description: `FEV1/FVC ratio is ${ratio}% (< 70%)`, severity: "HIGH" });
  }

  if (fev1 > 0 && fev1 < 1.8) {
    spiroScore += 35;
    riskFactors.push({ factor: `Severely reduced FEV1 (${fev1}L)`, category: "SPIROMETRY", severity: "HIGH" });
  } else if (fev1 > 0 && fev1 < 2.5) {
    spiroScore += 15;
  }
  spiroScore = Math.min(100, spiroScore);

  // 4. Audio Score (0 - 100)
  let audScore = 10;
  const classification = audio.classification || audio.aiAnalysis?.classification || "NORMAL";
  if (classification === "CRACKLE") {
    audScore = 80;
    riskFactors.push({ factor: "Fine end-inspiratory crackles detected in acoustic breath analysis", category: "AUDIO", severity: "HIGH" });
  } else if (classification === "WHEEZE") {
    audScore = 65;
    riskFactors.push({ factor: "High-pitch expiratory wheezing sound detected", category: "AUDIO", severity: "MODERATE" });
  }

  // Composite Weighted Score
  const compositeScore = Math.round(
    expScore * 0.30 +
    symScore * 0.35 +
    spiroScore * 0.25 +
    audScore * 0.10
  );

  let overallRiskLevel = "LOW";
  let recommendation = "Maintain baseline annual occupational health surveillance.";
  let hindiRecommendation = "वार्षिक नियमित स्वास्थ्य जांच जारी रखें एवं कार्यस्थल पर प्रमाणित मास्क पहनें।";
  let requiresClinicalReview = false;

  if (compositeScore >= 60 || symScore >= 60 || spiroScore >= 70) {
    overallRiskLevel = "HIGH";
    recommendation = "HIGH RISK: Urgent clinical review recommended. Arrange PA Chest Radiograph (ILO classification) and evaluate for secondary mycobacterial infection.";
    hindiRecommendation = "उच्च जोखिम: तुरंत नजदीकी जिला अस्पताल या सिलिकोसिस बोर्ड में डिजिटल चेस्ट एक्स-रे एवं डॉक्टर से जांच करवाएं।";
    requiresClinicalReview = true;
  } else if (compositeScore >= 35 || symScore >= 35 || spiroScore >= 45) {
    overallRiskLevel = "MODERATE";
    recommendation = "MODERATE RISK: Schedule telemedicine consultation with pulmonary specialist and repeat spirometry in 3-6 months.";
    hindiRecommendation = "मध्यम जोखिम: टेलीमेडिसिन द्वारा डॉक्टर से परामर्श लें और 3-6 महीने में पुनः जांच कराएं।";
    requiresClinicalReview = true;
  }

  return {
    overallRiskLevel,
    overallScore: compositeScore,
    exposureScore: expScore,
    symptomScore: symScore,
    spirometryScore: spiroScore,
    audioScore: audScore,
    riskFactors,
    signals,
    recommendation,
    hindiRecommendation,
    requiresClinicalReview,
    disclaimer: "Medical Safety Notice: This is an AI-assisted occupational screening score and decision support signal. It is NOT a definitive medical diagnosis. Clinical evaluation by a qualified medical officer is required.",
    calculatedAt: new Date(),
  };
}

export default {
  analyzeMultiFactorRisk,
};
