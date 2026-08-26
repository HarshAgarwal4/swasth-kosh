from fastapi import APIRouter, Depends
from api.schemas.rag_schema import RAGQueryRequest, RAGQueryResponse
from services.rag_service import handle_rag_query
from app.dependencies import common_auth_dep

router = APIRouter(prefix="/api/rag", tags=["RAG"])

@router.post("/query", response_model=RAGQueryResponse, dependencies=[Depends(common_auth_dep)])
def rag_query_endpoint(request: RAGQueryRequest):
    result = handle_rag_query(query=request.query, language=request.language, top_k=request.top_k or 3)
    return {"success": True, "data": result}
