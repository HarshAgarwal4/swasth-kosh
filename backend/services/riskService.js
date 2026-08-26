import { analyzeRiskWithAi } from "./aiService.js";

/**
 * Multi-Factor Occupational Lung Screening Risk Engine
 * Produces LOW, MODERATE, HIGH risk signals with configurable rules.
 */

export function calculateExposureRisk(worker, exposure) {
  let score = 0;
  const factors = [];

  const years = exposure?.yearsOfExposure ?? worker?.yearsOfExposure ?? 0;
  const hours = exposure?.dailyHours ?? worker?.dailyExposureHours ?? 8;
  const ppe = exposure?.ppeRegularity ?? worker?.ppeUsage ?? "SOMETIMES";
  const dustLevel = exposure?.dustExposureLevel ?? "MODERATE";

  // Exposure index calculation
  let dustMultiplier = 1.0;
  if (dustLevel === "EXTREME") dustMultiplier = 1.6;
  else if (dustLevel === "HEAVY") dustMultiplier = 1.3;
  else if (dustLevel === "MODERATE") dustMultiplier = 1.0;
  else dustMultiplier = 0.7;

  let ppeMultiplier = 1.0;
  if (ppe === "ALWAYS") ppeMultiplier = 0.4;
  else if (ppe === "SOMETIMES") ppeMultiplier = 0.8;
  else if (ppe === "RARELY") ppeMultiplier = 1.1;
  else ppeMultiplier = 1.3;

  const cumulativeExposureIndex = (years * (hours / 8)) * dustMultiplier * ppeMultiplier;

  if (cumulativeExposureIndex >= 15) {
    score += 40;
    factors.push({ factor: `Prolonged high-dust occupational exposure (${years} yrs, ~${hours} hrs/day)`, category: "EXPOSURE", severity: "HIGH" });
  } else if (cumulativeExposureIndex >= 7) {
    score += 25;
    factors.push({ factor: `Moderate cumulative occupational exposure (${years} yrs)`, category: "EXPOSURE", severity: "MODERATE" });
  } else if (cumulativeExposureIndex > 2) {
    score += 12;
    factors.push({ factor: `Early occupational dust exposure (${years} yrs)`, category: "EXPOSURE", severity: "LOW" });
  } else {
    score += 5;
  }

  if (exposure?.hasSandblastingOrDrilling) {
    score += 15;
    factors.push({ factor: "High-risk direct drilling / sandblasting activity", category: "EXPOSURE", severity: "HIGH" });
  }

  if (ppe === "NEVER" || ppe === "RARELY") {
    score += 10;
    factors.push({ factor: "Inadequate or absent respiratory PPE usage", category: "EXPOSURE", severity: "HIGH" });
  }

  return {
    score: Math.min(100, score),
    factors,
  };
}

export function calculateSymptomRisk(symptoms) {
  let score = 0;
  const factors = [];

  if (!symptoms) return { score: 0, factors: [] };

  // Cough scoring
  if (symptoms.coughType === "HEMOPTYSIS_BLOOD") {
    score += 35;
    factors.push({ factor: "Cough with hemoptysis (blood in sputum) detected", category: "SYMPTOMS", severity: "CRITICAL" });
  } else if (symptoms.coughDurationWeeks >= 3) {
    score += 20;
    factors.push({ factor: `Chronic persistent cough (> ${symptoms.coughDurationWeeks} weeks)`, category: "SYMPTOMS", severity: "HIGH" });
  } else if (symptoms.coughType === "PRODUCTIVE_MUCUS" || symptoms.coughType === "DRY") {
    score += 10;
    factors.push({ factor: "Active persistent cough reported", category: "SYMPTOMS", severity: "MODERATE" });
  }

  // Dyspnea (Breathlessness) Grade (mMRC scale 0-4)
  const bGrade = Number(symptoms.breathlessnessGrade || 0);
  if (bGrade >= 3) {
    score += 30;
    factors.push({ factor: `Severe breathlessness (Grade ${bGrade}: unable to leave house / breathless on dressing)`, category: "SYMPTOMS", severity: "HIGH" });
  } else if (bGrade === 2) {
    score += 20;
    factors.push({ factor: "Moderate breathlessness (Grade 2: walks slower than peers on level ground)", category: "SYMPTOMS", severity: "MODERATE" });
  } else if (bGrade === 1) {
    score += 10;
    factors.push({ factor: "Mild breathlessness on hurried walking or hill incline", category: "SYMPTOMS", severity: "LOW" });
  }

  // Associated signs
  if (symptoms.chestTightnessOrPain) {
    score += 10;
    factors.push({ factor: "Chest tightness or pleuritic discomfort", category: "SYMPTOMS", severity: "MODERATE" });
  }
  if (symptoms.wheezingOrWhistling) {
    score += 10;
    factors.push({ factor: "Audible wheezing / whistling during respiration", category: "SYMPTOMS", severity: "MODERATE" });
  }
  if (symptoms.unexplainedFatigue || symptoms.unexplainedWeightLoss) {
    score += 8;
    factors.push({ factor: "Constitutional symptoms (unexplained weight loss or chronic fatigue)", category: "SYMPTOMS", severity: "MODERATE" });
  }
  if (symptoms.nightSweats) {
    score += 8;
    factors.push({ factor: "Night sweats reported (suspected TB/silico-tuberculosis risk)", category: "SYMPTOMS", severity: "HIGH" });
  }

  return {
    score: Math.min(100, score),
    factors,
  };
}

export function calculateSpirometryRisk(spirometry) {
  let score = 0;
  const factors = [];

  if (!spirometry || !spirometry.fev1FvcRatio) {
    return { score: 0, factors: [] };
  }

  const ratio = Number(spirometry.fev1FvcRatio);
  const fev1PredictedPercent = Number(spirometry.fev1PercentPredicted || (spirometry.fev1 ? (spirometry.fev1 / 3.2) * 100 : 80));

  if (ratio < 70) {
    // Obstructive pattern
    if (fev1PredictedPercent < 50) {
      score += 45;
      factors.push({ factor: `Severe airflow limitation (FEV1/FVC: ${ratio}%, FEV1 < 50% predicted)`, category: "SPIROMETRY", severity: "HIGH" });
    } else if (fev1PredictedPercent < 70) {
      score += 30;
      factors.push({ factor: `Moderate airflow limitation (FEV1/FVC: ${ratio}%)`, category: "SPIROMETRY", severity: "MODERATE" });
    } else {
      score += 20;
      factors.push({ factor: `Mild obstructive ventilatory defect (FEV1/FVC: ${ratio}%)`, category: "SPIROMETRY", severity: "MODERATE" });
    }
  } else if (spirometry.fvcPercentPredicted && spirometry.fvcPercentPredicted < 80) {
    // Restrictive pattern suspected (typical in parenchymal fibrosis/silicosis)
    score += 30;
    factors.push({ factor: `Possible restrictive pattern (Reduced FVC ${spirometry.fvcPercentPredicted}%, preserved ratio)`, category: "SPIROMETRY", severity: "HIGH" });
  } else {
    score += 5;
    factors.push({ factor: `Normal flow-volume indices (FEV1/FVC: ${ratio}%)`, category: "SPIROMETRY", severity: "NORMAL" });
  }

  return {
    score: Math.min(100, score),
    factors,
  };
}

export function calculateAudioRisk(audio) {
  let score = 0;
  const factors = [];

  if (!audio || !audio.aiAnalysis) {
    return { score: 0, factors: [] };
  }

  const classification = audio.aiAnalysis.classification;
  const confidence = audio.aiAnalysis.confidence || 0.7;

  if (classification === "CRACKLE" || classification === "WHEEZE" || classification === "STRIDOR") {
    score = Math.round(35 * confidence);
    factors.push({
      factor: `Auscultation acoustic abnormality detected (${classification}, confidence: ${Math.round(confidence * 100)}%)`,
      category: "RESPIRATORY_AUDIO",
      severity: "HIGH",
    });
  } else if (classification === "DIMINISHED_BREATH_SOUNDS") {
    score = 20;
    factors.push({ factor: "Diminished breath sounds detected", category: "RESPIRATORY_AUDIO", severity: "MODERATE" });
  } else {
    score = 0;
  }

  return {
    score: Math.min(100, score),
    factors,
  };
}

export async function computeComprehensiveRisk({ worker, exposure, symptoms, spirometry, audio }) {
  // Check if AI service is available for hybrid evaluation
  const aiResult = await analyzeRiskWithAi({
    worker,
    exposure,
    symptoms,
    spirometry,
    audio,
  });

  if (aiResult?.success && aiResult?.data) {
    return aiResult.data;
  }

  // Local Rule-Based Risk Engine computation
  const expRisk = calculateExposureRisk(worker, exposure);
  const sympRisk = calculateSymptomRisk(symptoms);
  const spiroRisk = calculateSpirometryRisk(spirometry);
  const audRisk = calculateAudioRisk(audio);

  // Weighted combination
  // Exposure 30%, Symptoms 35%, Spirometry 25%, Audio 10%
  const overallScore = Math.min(
    100,
    Math.round(
      expRisk.score * 0.3 +
      sympRisk.score * 0.35 +
      spiroRisk.score * 0.25 +
      audRisk.score * 0.1
    )
  );

  let overallRiskLevel = "LOW";
  let recommendation = "Routine occupational health monitoring. Maintain strict PPE usage and repeat screening in 12 months.";
  let hindiRecommendation = "नियमित स्वास्थ्य निगरानी जारी रखें। कार्यस्थल पर हमेशा N95 मास्क पहनें एवं 12 महीने बाद पुनः जांच करवाएं।";
  let requiresClinicalReview = false;

  if (overallScore >= 55 || sympRisk.score >= 50 || spiroRisk.score >= 40) {
    overallRiskLevel = "HIGH";
    recommendation = "High screening risk detected. Immediate clinical review by a chest physician and confirmatory ILO-standard PA chest radiography is strongly recommended.";
    hindiRecommendation = "जांच में उच्च जोखिम संकेत मिले हैं। तुरंत फेफड़ा रोग विशेषज्ञ (छाती रोग चिकित्सक) से परामर्श करें एवं एक्स-रे जांच करवाएं।";
    requiresClinicalReview = true;
  } else if (overallScore >= 28 || sympRisk.score >= 20 || expRisk.score >= 35) {
    overallRiskLevel = "MODERATE";
    recommendation = "Moderate respiratory screening signals detected. Clinical consultation recommended within 2 to 4 weeks. Review dust suppression at worksite.";
    hindiRecommendation = "मध्यम जोखिम संकेत पाए गए हैं। 2 से 4 सप्ताह में डॉक्टर से जांच करवाएं और धूल से बचाव के उपाय बढ़ाएं।";
    requiresClinicalReview = true;
  }

  const allFactors = [
    ...expRisk.factors,
    ...sympRisk.factors,
    ...spiroRisk.factors,
    ...audRisk.factors,
  ];

  const screeningSignals = [
    { signal: `Cumulative Exposure Index: ${expRisk.score}/100`, source: "Occupational Exposure", impact: expRisk.score > 25 ? "ELEVATED" : "ACCEPTABLE" },
    { signal: `Symptom Severity Index: ${sympRisk.score}/100`, source: "Symptoms Assessment", impact: sympRisk.score > 25 ? "ELEVATED" : "ACCEPTABLE" },
    { signal: `Ventilatory Function Index: ${spiroRisk.score}/100`, source: "Spirometry", impact: spiroRisk.score > 20 ? "ABNORMAL" : "NORMAL" },
    { signal: `Audio Acoustic Signal: ${audRisk.score}/100`, source: "Respiratory Audio", impact: audRisk.score > 0 ? "SIGNAL_DETECTED" : "CLEAR" },
  ];

  return {
    overallRiskLevel,
    overallScore,
    exposureScore: expRisk.score,
    symptomScore: sympRisk.score,
    spirometryScore: spiroRisk.score,
    audioScore: audRisk.score,
    riskFactors: allFactors,
    screeningSignals,
    recommendation,
    hindiRecommendation,
    requiresClinicalReview,
    disclaimer:
      "This is an AI-assisted occupational screening score and decision support signal. It is NOT a medical diagnosis of silicosis or any respiratory disease. Clinical evaluation by a qualified medical officer is required.",
    engineVersion: "rule_v1.0_fallback",
  };
}
