from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Occupational Lung Disease AI Microservice",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
    }
