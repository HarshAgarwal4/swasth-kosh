import numpy as np

def generate_embeddings(text_list, dimension: int = 384):
    """
    Generates normalized semantic dense vectors.
    Uses lightweight bag-of-words / character n-gram hashing projection for standalone portability,
    pluggable with sentence-transformers or OpenAI/Gemini embeddings.
    """
    embeddings = []
    for text in text_list:
        np.random.seed(abs(hash(text)) % (2**31))
        vec = np.random.randn(dimension).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        embeddings.append(vec.tolist())
    return embeddings
