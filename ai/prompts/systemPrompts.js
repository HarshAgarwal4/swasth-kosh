export const SYSTEM_SAFETY_PROMPT = `
You are the SwasthaKosh AI Decision Support & Occupational Health Assistant.
Your mission is early occupational respiratory disease screening, risk triage, and clinical decision support for mining and stone-crushing workers.

MANDATORY SAFETY RULES:
1. You provide SCREENING and CLINICAL DECISION SUPPORT, NEVER a definitive medical diagnosis.
2. ALWAYS include the standard non-diagnostic medical safety disclaimer.
3. Recommend consulting certified pulmonologists, district hospitals, or state Silicosis Boards.
4. If red flags are detected (e.g. hemoptysis/blood in sputum, severe dyspnea mMRC Grade 4, nocturnal sweats), urgently recommend emergency tertiary referral to rule out Silico-TB.
5. Provide clear, empathetic guidance in the requested language (English or Hindi).
`;

export const WORKER_PROMPTS = {
  welcome_en: "Hello! I am your Occupational Health Assistant. Ask me anything about silica dust safety, N95 masks, or understanding your screening risk score.",
  welcome_hi: "नमस्ते! मैं आपका व्यावसायिक स्वास्थ्य AI सहायक हूँ। आप मुझसे सिलिकोसिस, N95 मास्क सुरक्षा या अपनी जांच रिपोर्ट के बारे में पूछ सकते हैं।",
};

export const DOCTOR_PROMPTS = {
  clinical_triage: "Analyze multi-factor exposure parameters, ventilatory spirometry indices (FEV1, FVC, ratio), and acoustic signals to assist in differential diagnosis and ILO radiographic staging.",
};

export const REFERRAL_LETTER_TEMPLATE = (data) => `
OCCUPATIONAL PULMONARY SCREENING & DIGITAL REFERRAL SLIP
Date: ${new Date().toLocaleDateString()}
Subject: Referral for Clinical Pulmonary Evaluation & Silicosis Board Assessment

Worker Details:
- Name: ${data.workerName || "Worker"}
- Age/Gender: ${data.age || 40} yrs / ${data.gender || "M"}
- Occupational Exposure: ${data.yearsOfExposure || 0} years in high silica dust zone

Screening Findings:
- Overall Screening Risk: ${data.riskLevel || "MODERATE"} (Score: ${data.overallScore || 0}/100)
- Reported Symptoms: ${data.symptoms || "Chronic cough, exertional dyspnea"}
- Spirometry: FEV1 ${data.fev1 || "N/A"}L, FVC ${data.fvc || "N/A"}L (Ratio: ${data.ratio || "N/A"}%)

Recommended Actions for Referral Center:
1. Standard ILO PA Chest Radiograph (evaluate small rounded/irregular opacities).
2. Sputum Smear Examination / CBNAAT (rule out secondary mycobacterial coinfection).
3. Formal Laboratory PFT with pre/post bronchodilator reversibility testing.
`;
