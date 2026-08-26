from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from rag.embeddings.embedding_generator import generate_embeddings
from app.dependencies import common_auth_dep

router = APIRouter(prefix="/api/embeddings", tags=["Embeddings"])

class EmbeddingRequest(BaseModel):
    texts: List[str]

@router.post("", dependencies=[Depends(common_auth_dep)])
def embeddings_endpoint(request: EmbeddingRequest):
    vectors = generate_embeddings(request.texts)
    return {"success": True, "embeddings": vectors}
