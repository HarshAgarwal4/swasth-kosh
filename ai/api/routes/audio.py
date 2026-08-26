from fastapi import APIRouter, Depends
from api.schemas.audio_schema import AudioAnalysisRequest, AudioAnalysisResponse
from services.audio_service import process_and_analyze_audio
from app.dependencies import common_auth_dep

router = APIRouter(prefix="/api/audio", tags=["Audio"])

@router.post("/analyze", response_model=AudioAnalysisResponse, dependencies=[Depends(common_auth_dep)])
def audio_analyze_endpoint(request: AudioAnalysisRequest):
    result = process_and_analyze_audio(
        audio_url=request.audioUrl,
        recording_type=request.recordingType or "COUGH",
        duration_seconds=request.durationSeconds or 5.0,
    )
    return {"success": True, "data": result}
