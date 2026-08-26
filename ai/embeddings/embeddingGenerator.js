import { MockProvider } from "../providers/mockProvider.js";

const provider = new MockProvider();

/**
 * Generate normalized embedding vector for text
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string") return new Array(64).fill(0);
  return provider.generateEmbedding(text);
}

/**
 * Cosine similarity between two float vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
