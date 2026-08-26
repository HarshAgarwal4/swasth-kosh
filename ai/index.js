import { initializeRagCorpus } from "./rag/documentLoader.js";
import { executeRagPipeline } from "./rag/ragPipeline.js";
import { analyzeMultiFactorRisk } from "./agents/riskAnalysisAgent.js";
import { defaultChatEngine } from "./chatbot/aiChatbotEngine.js";
import { generateEmbedding, cosineSimilarity } from "./embeddings/embeddingGenerator.js";

// Auto-initialize guideline corpus
initializeRagCorpus().catch(console.error);

export {
  initializeRagCorpus,
  executeRagPipeline,
  analyzeMultiFactorRisk,
  defaultChatEngine,
  generateEmbedding,
  cosineSimilarity,
};

export default {
  initializeRagCorpus,
  executeRagPipeline,
  analyzeMultiFactorRisk,
  defaultChatEngine,
  generateEmbedding,
  cosineSimilarity,
};
