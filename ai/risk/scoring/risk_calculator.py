from risk.rules.exposure_rules import evaluate_exposure
from risk.rules.symptom_rules import evaluate_symptoms
from risk.rules.spirometry_rules import evaluate_spirometry
from risk.rules.risk_rules import evaluate_audio

def calculate_multi_factor_risk(worker, exposure, symptoms, spirometry, audio):
    """
    Synthesizes multi-factor sub-scores into an aggregated occupational lung risk assessment.
    """
    exp_score, exp_factors = evaluate_exposure(worker, exposure)
    symp_score, symp_factors = evaluate_symptoms(symptoms)
    spiro_score, spiro_factors = evaluate_spirometry(spirometry)
    aud_score, aud_factors = evaluate_audio(audio)

    # Weighted calculation
    overall_score = min(
        100,
        int(round(
            exp_score * 0.30 +
            symp_score * 0.35 +
            spiro_score * 0.25 +
            aud_score * 0.10
        ))
    )

    if overall_score >= 55 or symp_score >= 50 or spiro_score >= 40:
        risk_level = "HIGH"
        rec = "High screening risk detected. Immediate clinical review by a chest physician and confirmatory ILO-standard PA chest radiography is strongly recommended."
        hindi_rec = "जांच में उच्च जोखिम संकेत मिले हैं। तुरंत फेफड़ा रोग विशेषज्ञ (छाती रोग चिकित्सक) से परामर्श करें एवं एक्स-रे जांच करवाएं।"
        requires_review = True
    elif overall_score >= 28 or symp_score >= 20 or exp_score >= 35:
        risk_level = "MODERATE"
        rec = "Moderate respiratory screening signals detected. Clinical consultation recommended within 2 to 4 weeks. Review dust suppression at worksite."
        hindi_rec = "मध्यम जोखिम संकेत पाए गए हैं। 2 से 4 सप्ताह में डॉक्टर से जांच करवाएं और धूल से बचाव के उपाय बढ़ाएं।"
        requires_review = True
    else:
        risk_level = "LOW"
        rec = "Routine occupational health monitoring. Maintain strict PPE usage and repeat screening in 12 months."
        hindi_rec = "नियमित स्वास्थ्य निगरानी जारी रखें। कार्यस्थल पर हमेशा N95 मास्क पहनें एवं 12 महीने बाद पुनः जांच करवाएं।"
        requires_review = False

    all_factors = exp_factors + symp_factors + spiro_factors + aud_factors

    signals = [
        {"signal": f"Cumulative Exposure Index: {exp_score}/100", "source": "Occupational Exposure", "impact": "ELEVATED" if exp_score > 25 else "ACCEPTABLE"},
        {"signal": f"Symptom Severity Index: {symp_score}/100", "source": "Symptoms Assessment", "impact": "ELEVATED" if symp_score > 25 else "ACCEPTABLE"},
        {"signal": f"Ventilatory Function Index: {spiro_score}/100", "source": "Spirometry", "impact": "ABNORMAL" if spiro_score > 20 else "NORMAL"},
        {"signal": f"Audio Acoustic Signal: {aud_score}/100", "source": "Respiratory Audio", "impact": "SIGNAL_DETECTED" if aud_score > 0 else "CLEAR"},
    ]

    return {
        "overallRiskLevel": risk_level,
        "overallScore": overall_score,
        "exposureScore": exp_score,
        "symptomScore": symp_score,
        "spirometryScore": spiro_score,
        "audioScore": aud_score,
        "riskFactors": all_factors,
        "screeningSignals": signals,
        "recommendation": rec,
        "hindiRecommendation": hindi_rec,
        "requiresClinicalReview": requires_review,
        "disclaimer": "This is an AI-assisted occupational screening score and decision support signal. It is NOT a medical diagnosis of silicosis or any respiratory disease. Clinical evaluation by a qualified medical officer is required.",
        "engineVersion": "fastapi_rule_v1.0"
    }
