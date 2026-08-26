import { initializeRagCorpus } from "./rag/documentLoader.js";
import { executeRagPipeline } from "./rag/ragPipeline.js";
import { analyzeMultiFactorRisk } from "./agents/riskAnalysisAgent.js";
import { defaultChatEngine, AiChatbotEngine } from "./chatbot/aiChatbotEngine.js";
import { defaultMistralProvider, MistralProvider } from "./providers/mistralProvider.js";
import { generateEmbedding, cosineSimilarity } from "./embeddings/embeddingGenerator.js";
import { aiConfig } from "./config/aiConfig.js";

// Initialize guideline corpus on startup
initializeRagCorpus().catch((err) => {
  console.warn("[AI Engine] Corpus initialization error:", err.message);
});

export {
  initializeRagCorpus,
  executeRagPipeline,
  analyzeMultiFactorRisk,
  defaultChatEngine,
  AiChatbotEngine,
  defaultMistralProvider,
  MistralProvider,
  generateEmbedding,
  cosineSimilarity,
  aiConfig,
};

export default {
  initializeRagCorpus,
  executeRagPipeline,
  analyzeMultiFactorRisk,
  defaultChatEngine,
  AiChatbotEngine,
  defaultMistralProvider,
  MistralProvider,
  generateEmbedding,
  cosineSimilarity,
  aiConfig,
};
