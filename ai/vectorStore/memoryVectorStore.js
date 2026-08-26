import { generateEmbedding, cosineSimilarity } from "../embeddings/embeddingGenerator.js";

/**
 * In-Memory Vector Store for RAG Guideline Documents
 */
export class MemoryVectorStore {
  constructor() {
    this.documents = [];
  }

  async addDocuments(docs = []) {
    for (const doc of docs) {
      const vector = await generateEmbedding(doc.text);
      this.documents.push({
        id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        text: doc.text,
        metadata: doc.metadata || {},
        vector,
      });
    }
  }

  async similaritySearch(queryText, topK = 3) {
    if (!queryText || this.documents.length === 0) return [];
    const queryVector = await generateEmbedding(queryText);

    const scored = this.documents.map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.vector),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  count() {
    return this.documents.length;
  }

  clear() {
    this.documents = [];
  }
}

export const defaultVectorStore = new MemoryVectorStore();
