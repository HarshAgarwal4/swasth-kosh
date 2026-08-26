from risk.scoring.risk_calculator import calculate_multi_factor_risk

def compute_risk_service(payload):
    return calculate_multi_factor_risk(
        worker=payload.worker,
        exposure=payload.exposure,
        symptoms=payload.symptoms,
        spirometry=payload.spirometry,
        audio=payload.audio,
    )
