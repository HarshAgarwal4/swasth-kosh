from fastapi import APIRouter, Depends
from api.schemas.screening_schema import ScreeningSummaryRequest, ScreeningSummaryResponse
from services.explanation_service import generate_patient_explanation, generate_doctor_summary
from app.dependencies import common_auth_dep

router = APIRouter(prefix="/api/screening", tags=["Screening"])

@router.post("/summary", response_model=ScreeningSummaryResponse, dependencies=[Depends(common_auth_dep)])
def screening_summary_endpoint(request: ScreeningSummaryRequest):
    data_dict = request.dict()
    en_sum = generate_patient_explanation(data_dict, language="en")
    hi_sum = generate_patient_explanation(data_dict, language="hi")
    doc_sum = generate_doctor_summary(data_dict)
    return {
        "success": True,
        "data": {
            "englishSummary": en_sum,
            "hindiSummary": hi_sum,
            "doctorRecommendations": doc_sum,
            "disclaimer": "AI screening summary is assistive and requires clinical signoff by an occupational health officer.",
        },
    }
