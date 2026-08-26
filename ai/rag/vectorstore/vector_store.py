import numpy as np

class InMemoryVectorStore:
    def __init__(self):
        self.documents = []
        self.vectors = []

    def add_documents(self, docs_with_embeddings):
        for item in docs_with_embeddings:
            self.documents.append(item["doc"])
            self.vectors.append(item["embedding"])

    def similarity_search(self, query_embedding, top_k: int = 3):
        if not self.vectors:
            return []
        q_vec = np.array(query_embedding, dtype=np.float32)
        doc_vecs = np.array(self.vectors, dtype=np.float32)

        # Cosine similarities
        scores = np.dot(doc_vecs, q_vec)
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            doc = self.documents[idx].copy()
            doc["score"] = float(scores[idx])
            results.append(doc)
        return results

global_vector_store = InMemoryVectorStore()
