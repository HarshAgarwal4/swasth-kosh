from pydantic import BaseModel
from typing import Optional, Dict, Any

class ScreeningSummaryRequest(BaseModel):
    worker: Optional[Dict[str, Any]] = None
    exposure: Optional[Dict[str, Any]] = None
    symptoms: Optional[Dict[str, Any]] = None
    spirometry: Optional[Dict[str, Any]] = None
    riskAssessment: Optional[Dict[str, Any]] = None

class ScreeningSummaryResponseData(BaseModel):
    englishSummary: str
    hindiSummary: str
    doctorRecommendations: str
    disclaimer: str

class ScreeningSummaryResponse(BaseModel):
    success: bool = True
    data: ScreeningSummaryResponseData
