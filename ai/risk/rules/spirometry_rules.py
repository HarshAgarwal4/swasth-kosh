def evaluate_spirometry(spirometry):
    """
    Evaluates ventilatory defect based on FEV1/FVC ratio and percentage predicted values.
    """
    score = 0
    factors = []

    if not spirometry or (spirometry.fev1FvcRatio is None and spirometry.fev1 is None):
        return 0, []

    ratio = spirometry.fev1FvcRatio
    if ratio is None and spirometry.fev1 and spirometry.fvc:
        ratio = round((spirometry.fev1 / spirometry.fvc) * 100, 1)

    fev1_pred = spirometry.fev1PercentPredicted or (round((spirometry.fev1 / 3.2) * 100, 1) if spirometry.fev1 else 85)

    if ratio and ratio < 70:
        if fev1_pred < 50:
            score += 45
            factors.append({"factor": f"Severe airflow limitation (FEV1/FVC: {ratio}%, FEV1 < 50% pred)", "category": "SPIROMETRY", "severity": "HIGH"})
        elif fev1_pred < 70:
            score += 30
            factors.append({"factor": f"Moderate airflow limitation (FEV1/FVC: {ratio}%)", "category": "SPIROMETRY", "severity": "MODERATE"})
        else:
            score += 20
            factors.append({"factor": f"Mild obstructive ventilatory defect (FEV1/FVC: {ratio}%)", "category": "SPIROMETRY", "severity": "MODERATE"})
    elif spirometry.fvcPercentPredicted and spirometry.fvcPercentPredicted < 80:
        score += 30
        factors.append({"factor": f"Suspected restrictive pattern (FVC {spirometry.fvcPercentPredicted}% pred)", "category": "SPIROMETRY", "severity": "HIGH"})
    else:
        score += 5
        factors.append({"factor": f"Normal spirometric ventilation index (FEV1/FVC: {ratio or 80}%)", "category": "SPIROMETRY", "severity": "NORMAL"})

    return min(100, score), factors
