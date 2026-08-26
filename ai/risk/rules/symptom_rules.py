def evaluate_symptoms(symptoms):
    """
    Computes respiratory symptom index based on cough duration/type, mMRC dyspnea grade, and red flag signs.
    """
    score = 0
    factors = []

    if not symptoms:
        return 0, []

    # Cough type & duration
    if symptoms.coughType == "HEMOPTYSIS_BLOOD":
        score += 35
        factors.append({"factor": "Cough with blood-streaked sputum (hemoptysis) reported", "category": "SYMPTOMS", "severity": "CRITICAL"})
    elif symptoms.coughDurationWeeks >= 3:
        score += 20
        factors.append({"factor": f"Chronic persistent cough (> {int(symptoms.coughDurationWeeks)} weeks)", "category": "SYMPTOMS", "severity": "HIGH"})
    elif symptoms.coughType in ["PRODUCTIVE_MUCUS", "DRY"]:
        score += 10
        factors.append({"factor": "Persistent active cough reported", "category": "SYMPTOMS", "severity": "MODERATE"})

    # Breathlessness Grade (0-4)
    b_grade = int(symptoms.breathlessnessGrade or 0)
    if b_grade >= 3:
        score += 30
        factors.append({"factor": f"Severe dyspnea (mMRC Grade {b_grade}: breathless during light activities)", "category": "SYMPTOMS", "severity": "HIGH"})
    elif b_grade == 2:
        score += 20
        factors.append({"factor": "Moderate dyspnea (mMRC Grade 2: stops for breath after ~100m on level ground)", "category": "SYMPTOMS", "severity": "MODERATE"})
    elif b_grade == 1:
        score += 10
        factors.append({"factor": "Mild exertional breathlessness", "category": "SYMPTOMS", "severity": "LOW"})

    # Associated findings
    if symptoms.chestTightnessOrPain:
        score += 10
        factors.append({"factor": "Chest tightness or pleuritic pain reported", "category": "SYMPTOMS", "severity": "MODERATE"})
    if symptoms.wheezingOrWhistling:
        score += 10
        factors.append({"factor": "Respiratory wheezing sounds noted during breathing", "category": "SYMPTOMS", "severity": "MODERATE"})
    if symptoms.unexplainedFatigue or symptoms.unexplainedWeightLoss:
        score += 8
        factors.append({"factor": "Constitutional decline (chronic fatigue or unintended weight loss)", "category": "SYMPTOMS", "severity": "MODERATE"})
    if symptoms.nightSweats:
        score += 8
        factors.append({"factor": "Night sweats reported (suspected TB/silico-tuberculosis risk)", "category": "SYMPTOMS", "severity": "HIGH"})

    return min(100, score), factors
