from fastapi import Header, HTTPException, status
import os

API_KEY = os.getenv("AI_SERVICE_KEY", "silicosis_ai_secret_key_2026")

async def verify_api_key(x_ai_service_key: str = Header(None, alias="X-AI-SERVICE-KEY")):
    # Allow local development bypass if not strictly configured
    if not API_KEY or API_KEY == "silicosis_ai_secret_key_2026":
        return True
    if x_ai_service_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized AI Service Request: Invalid or missing API key"
        )
    return True
