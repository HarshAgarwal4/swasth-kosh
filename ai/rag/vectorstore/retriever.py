from rag.vectorstore.vector_store import global_vector_store
from rag.embeddings.embedding_generator import generate_embeddings

def retrieve_documents(query: str, top_k: int = 3):
    """
    Embeds user query and retrieves top matching context documents.
    """
    query_emb = generate_embeddings([query])[0]
    results = global_vector_store.similarity_search(query_emb, top_k=top_k)
    return results

def rerank_documents(docs, query: str):
    return sorted(docs, key=lambda d: d.get("score", 0), reverse=True)
