from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AudioAnalysisRequest(BaseModel):
    audioUrl: Optional[str] = None
    audioBase64: Optional[str] = None
    recordingType: Optional[str] = "COUGH"  # COUGH, TRACHEAL_BREATHING, AUSCULTATION
    durationSeconds: Optional[float] = 5.0

class AcousticSignal(BaseModel):
    type: str
    description: str
    severity: str

class AudioAnalysisResponseData(BaseModel):
    status: str
    classification: str  # NORMAL, WHEEZE, CRACKLE, STRIDOR, DIMINISHED_BREATH_SOUNDS
    confidence: float
    signals: List[AcousticSignal]
    features: Optional[Dict[str, Any]] = {}
    modelVersion: str
    analyzedAt: str
    disclaimer: str

class AudioAnalysisResponse(BaseModel):
    success: bool = True
    data: AudioAnalysisResponseData
