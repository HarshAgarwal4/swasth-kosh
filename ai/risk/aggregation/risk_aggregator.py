from risk.scoring.risk_calculator import calculate_multi_factor_risk

def calculate_exposure_score(worker, exposure):
    res = calculate_multi_factor_risk(worker, exposure, None, None, None)
    return res["exposureScore"]

def calculate_symptom_score(symptoms):
    res = calculate_multi_factor_risk(None, None, symptoms, None, None)
    return res["symptomScore"]

def calculate_spirometry_score(spirometry):
    res = calculate_multi_factor_risk(None, None, None, spirometry, None)
    return res["spirometryScore"]

def calculate_audio_score(audio):
    res = calculate_multi_factor_risk(None, None, None, None, audio)
    return res["audioScore"]

def calculate_combined_score(worker, exposure, symptoms, spirometry, audio):
    return calculate_multi_factor_risk(worker, exposure, symptoms, spirometry, audio)

def determine_risk_level(score):
    if score >= 55:
        return "HIGH"
    elif score >= 28:
        return "MODERATE"
    return "LOW"

def get_risk_factors(risk_result):
    return risk_result.get("riskFactors", [])

def generate_screening_recommendation(risk_level, language="en"):
    if risk_level == "HIGH":
        return "High screening risk detected. Immediate clinical review by a chest physician and confirmatory ILO-standard PA chest radiography is strongly recommended." if language == "en" else "जांच में उच्च जोखिम संकेत मिले हैं। तुरंत फेफड़ा रोग विशेषज्ञ से परामर्श करें एवं एक्स-रे जांच करवाएं।"
    elif risk_level == "MODERATE":
        return "Moderate respiratory screening signals detected. Clinical consultation recommended within 2 to 4 weeks." if language == "en" else "मध्यम जोखिम संकेत पाए गए हैं। 2 से 4 सप्ताह में डॉक्टर से जांच करवाएं।"
    return "Routine occupational health monitoring. Maintain strict PPE usage." if language == "en" else "नियमित स्वास्थ्य निगरानी जारी रखें। कार्यस्थल पर हमेशा N95 मास्क पहनें।"
