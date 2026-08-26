from rag.pipeline.rag_pipeline import generate_rag_response

def handle_rag_query(query: str, language: str = "en", top_k: int = 3):
    return generate_rag_response(query, language=language)
