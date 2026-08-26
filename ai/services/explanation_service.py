def generate_patient_explanation(screening_data, language="en"):
    years = screening_data.get("exposure", {}).get("yearsOfExposure", 0)
    risk_level = screening_data.get("riskAssessment", {}).get("overallRiskLevel", "MODERATE")

    if language == "hi":
        return (
            f"आपकी स्क्रीनिंग रिपोर्ट के अनुसार, आप पिछले {years} वर्षों से धूल के वातावरण में कार्य कर रहे हैं। "
            f"आपकी जांच में जोखिम का स्तर '{risk_level}' पाया गया है। "
            f"यह बीमारी की अंतिम पुष्टि नहीं है, परंतु आगे की जांच (एक्स-रे और डॉक्टर परामर्श) आवश्यक है।"
        )
    return (
        f"Based on your screening assessment and {years} years of occupational exposure, your risk index is '{risk_level}'. "
        f"This is an assistive screening alert. We recommend scheduling a consultation with a chest physician."
    )

def generate_doctor_summary(screening_data):
    worker_code = screening_data.get("worker", {}).get("workerCode", "N/A")
    score = screening_data.get("riskAssessment", {}).get("overallScore", 0)
    level = screening_data.get("riskAssessment", {}).get("overallRiskLevel", "N/A")
    return (
        f"Occupational Health Clinical Summary [Worker ID: {worker_code}]:\n"
        f"• Risk Stratification: {level} ({score}/100)\n"
        f"• Recommended Clinical Pathway: Confirmatory PA Chest Radiograph (ILO standard classification), sputum acid-fast bacilli (AFB) testing to rule out silico-TB, and dynamic spirometry review."
    )
