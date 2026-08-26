def evaluate_audio(audio_data):
    """
    Evaluates acoustic respiratory signals (crackles, wheezes, stridor).
    """
    score = 0
    factors = []

    if not audio_data:
        return 0, []

    classification = audio_data.get("classification") or audio_data.get("aiAnalysis", {}).get("classification") or "NORMAL"
    confidence = audio_data.get("confidence") or audio_data.get("aiAnalysis", {}).get("confidence") or 0.8

    if classification in ["CRACKLE", "WHEEZE", "STRIDOR"]:
        score = int(round(35 * confidence))
        factors.append({
            "factor": f"Acoustic lung sound signal ({classification}, conf: {int(round(confidence*100))}%)",
            "category": "RESPIRATORY_AUDIO",
            "severity": "HIGH"
        })
    elif classification == "DIMINISHED_BREATH_SOUNDS":
        score = 20
        factors.append({
            "factor": "Diminished breath sounds detected",
            "category": "RESPIRATORY_AUDIO",
            "severity": "MODERATE"
        })

    return min(100, score), factors
