from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RAGQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    top_k: Optional[int] = 3

class RAGDocument(BaseModel):
    id: str
    title: str
    content: str
    source: str
    score: Optional[float] = None

class RAGQueryResponseData(BaseModel):
    answer: str
    retrievedContexts: List[RAGDocument]
    sourceCitations: List[str]
    disclaimer: str

class RAGQueryResponse(BaseModel):
    success: bool = True
    data: RAGQueryResponseData
