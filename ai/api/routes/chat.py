from fastapi import APIRouter, Depends
from api.schemas.chat_schema import ChatRequest, ChatResponse
from services.chatbot_service import generate_chat_response
from app.dependencies import common_auth_dep

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse, dependencies=[Depends(common_auth_dep)])
def chat_endpoint(request: ChatRequest):
    result = generate_chat_response(
        message=request.message,
        history=request.history,
        mode=request.mode,
        language=request.language,
        user_context=request.userContext,
    )
    return {"success": True, "data": result}
