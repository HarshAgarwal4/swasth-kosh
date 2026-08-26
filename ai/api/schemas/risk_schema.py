from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ExposureData(BaseModel):
    dustExposureLevel: Optional[str] = "MODERATE"
    yearsOfExposure: Optional[float] = 0
    dailyHours: Optional[float] = 8
    ppeRegularity: Optional[str] = "SOMETIMES"
    worksInClosedSpace: Optional[bool] = False
    hasSandblastingOrDrilling: Optional[bool] = False

class SymptomData(BaseModel):
    coughDurationWeeks: Optional[float] = 0
    coughType: Optional[str] = "NONE"
    breathlessnessGrade: Optional[int] = 0
    chestTightnessOrPain: Optional[bool] = False
    wheezingOrWhistling: Optional[bool] = False
    unexplainedFatigue: Optional[bool] = False
    unexplainedWeightLoss: Optional[bool] = False
    nightSweats: Optional[bool] = False

class SpirometryInput(BaseModel):
    fev1: Optional[float] = None
    fvc: Optional[float] = None
    fev1FvcRatio: Optional[float] = None
    pef: Optional[float] = None
    fev1PercentPredicted: Optional[float] = None
    fvcPercentPredicted: Optional[float] = None
    pattern: Optional[str] = "NORMAL"

class RiskFactor(BaseModel):
    factor: str
    category: str
    severity: str

class ScreeningSignal(BaseModel):
    signal: str
    source: str
    impact: str

class RiskAnalysisRequest(BaseModel):
    worker: Optional[Dict[str, Any]] = None
    exposure: Optional[ExposureData] = None
    symptoms: Optional[SymptomData] = None
    spirometry: Optional[SpirometryInput] = None
    audio: Optional[Dict[str, Any]] = None

class RiskAnalysisResponseData(BaseModel):
    overallRiskLevel: str  # LOW, MODERATE, HIGH
    overallScore: int
    exposureScore: int
    symptomScore: int
    spirometryScore: int
    audioScore: int
    riskFactors: List[RiskFactor]
    screeningSignals: List[ScreeningSignal]
    recommendation: str
    hindiRecommendation: str
    requiresClinicalReview: bool
    disclaimer: str
    engineVersion: str

class RiskAnalysisResponse(BaseModel):
    success: bool = True
    data: RiskAnalysisResponseData
