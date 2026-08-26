import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from risk.scoring.risk_calculator import calculate_multi_factor_risk
from api.schemas.risk_schema import ExposureData, SymptomData, SpirometryInput

def test_low_risk_scenario():
    exposure = ExposureData(yearsOfExposure=1, dailyHours=6, ppeRegularity="ALWAYS", dustExposureLevel="LOW")
    symptoms = SymptomData(coughDurationWeeks=0, breathlessnessGrade=0)
    spirometry = SpirometryInput(fev1=3.4, fvc=4.1, fev1FvcRatio=82.9)
    result = calculate_multi_factor_risk({}, exposure, symptoms, spirometry, {})
    assert result["overallRiskLevel"] == "LOW"
    assert result["overallScore"] < 28

def test_high_risk_scenario():
    exposure = ExposureData(yearsOfExposure=18, dailyHours=10, ppeRegularity="NEVER", dustExposureLevel="EXTREME", hasSandblastingOrDrilling=True)
    symptoms = SymptomData(coughDurationWeeks=6, coughType="HEMOPTYSIS_BLOOD", breathlessnessGrade=3, nightSweats=True)
    spirometry = SpirometryInput(fev1=1.4, fvc=2.8, fev1FvcRatio=50.0)
    result = calculate_multi_factor_risk({}, exposure, symptoms, spirometry, {"classification": "CRACKLE", "confidence": 0.85})
    assert result["overallRiskLevel"] == "HIGH"
    assert result["requiresClinicalReview"] is True
    assert len(result["riskFactors"]) > 0
