from fastapi import APIRouter, Depends
from api.schemas.risk_schema import RiskAnalysisRequest, RiskAnalysisResponse
from services.risk_service import compute_risk_service
from app.dependencies import common_auth_dep

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])

@router.post("/analyze", response_model=RiskAnalysisResponse, dependencies=[Depends(common_auth_dep)])
def analyze_risk_endpoint(request: RiskAnalysisRequest):
    result = compute_risk_service(request)
    return {"success": True, "data": result}
