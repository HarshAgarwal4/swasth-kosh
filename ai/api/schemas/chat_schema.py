from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    role: str = Field(..., description="user | assistant | system")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    mode: Optional[str] = "WORKER"  # WORKER, DOCTOR, MEDICAL_OFFICER, ADMIN
    language: Optional[str] = "en"  # en, hi
    userContext: Optional[Dict[str, Any]] = {}

class ChatResponseData(BaseModel):
    reply: str
    sources: Optional[List[str]] = []
    mode: str
    confidence: Optional[float] = 0.95
    disclaimer: str

class ChatResponse(BaseModel):
    success: bool = True
    data: ChatResponseData
