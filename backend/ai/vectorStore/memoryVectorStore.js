import { cosineSimilarity, generateEmbedding } from "../embeddings/embeddingGenerator.js";

/**
 * Memory Vector Store for Medical Guideline Retrieval
 */
export class MemoryVectorStore {
  constructor() {
    this.documents = [];
  }

  async addDocument({ id, text, metadata = {} }) {
    const embedding = await generateEmbedding(text);
    this.documents.push({
      id: id || `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      text,
      metadata,
      embedding,
    });
  }

  async addDocuments(docs) {
    for (const doc of docs) {
      await this.addDocument(doc);
    }
  }

  async similaritySearch(query, topK = 3) {
    if (this.documents.length === 0) return [];
    const queryEmbedding = await generateEmbedding(query);

    const scored = this.documents.map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
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
