def chunk_document(text: str, chunk_size: int = 500, overlap: int = 50):
    """
    Splits text into sliding window semantic chunks.
    """
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i : i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks
