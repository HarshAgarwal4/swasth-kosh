SCREENING_SUMMARY_TEMPLATE = """
Generate a dual English and Hindi screening summary based on the following multi-factor data:
Worker: {worker}
Exposure: {exposure}
Symptoms: {symptoms}
Spirometry: {spirometry}
Risk Score: {risk_score} / 100 ({risk_level})

Provide clear findings and clinical follow-up advice without diagnostic claims.
"""
