def evaluate_exposure(worker_data, exposure_data):
    """
    Computes exposure score based on cumulative dust index, years, daily hours, and PPE compliance.
    """
    score = 0
    factors = []

    years = (
        (exposure_data.yearsOfExposure if exposure_data else None)
        or (worker_data.get("yearsOfExposure") if worker_data else 0)
        or 0
    )
    hours = (
        (exposure_data.dailyHours if exposure_data else None)
        or (worker_data.get("dailyExposureHours") if worker_data else 8)
        or 8
    )
    ppe = (
        (exposure_data.ppeRegularity if exposure_data else None)
        or (worker_data.get("ppeUsage") if worker_data else "SOMETIMES")
        or "SOMETIMES"
    )
    dust_level = (exposure_data.dustExposureLevel if exposure_data else "MODERATE") or "MODERATE"

    dust_mult = {"EXTREME": 1.6, "HEAVY": 1.3, "MODERATE": 1.0, "LOW": 0.7}.get(dust_level, 1.0)
    ppe_mult = {"ALWAYS": 0.4, "SOMETIMES": 0.8, "RARELY": 1.1, "NEVER": 1.3}.get(ppe, 1.0)

    cumulative_index = (years * (hours / 8.0)) * dust_mult * ppe_mult

    if cumulative_index >= 15:
        score += 40
        factors.append({"factor": f"High cumulative occupational dust exposure ({years} yrs, ~{hours} hrs/day)", "category": "EXPOSURE", "severity": "HIGH"})
    elif cumulative_index >= 7:
        score += 25
        factors.append({"factor": f"Moderate cumulative dust exposure ({years} yrs)", "category": "EXPOSURE", "severity": "MODERATE"})
    elif cumulative_index > 2:
        score += 12
        factors.append({"factor": f"Mild dust exposure ({years} yrs)", "category": "EXPOSURE", "severity": "LOW"})
    else:
        score += 5

    if exposure_data and exposure_data.hasSandblastingOrDrilling:
        score += 15
        factors.append({"factor": "Direct high-emission sandblasting or dry-drilling activity", "category": "EXPOSURE", "severity": "HIGH"})

    if ppe in ["NEVER", "RARELY"]:
        score += 10
        factors.append({"factor": "Infrequent or absent respiratory PPE protection", "category": "EXPOSURE", "severity": "HIGH"})

    return min(100, score), factors
