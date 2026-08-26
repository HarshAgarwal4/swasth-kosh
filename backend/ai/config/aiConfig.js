export const aiConfig = {
  provider: process.env.AI_PROVIDER || "mistral", // 'mistral', 'mock'
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY || "",
    model: process.env.MISTRAL_MODEL || "mistral-small-2603",
    temperature: 0.2,
    maxTokens: 1024,
  },
  rag: {
    chunkSize: 300,
    chunkOverlap: 40,
    topK: 3,
    similarityThreshold: 0.25,
  },
  riskWeights: {
    exposure: 0.30,
    symptoms: 0.35,
    spirometry: 0.25,
    audio: 0.10,
  },
  safety: {
    enforceDisclaimer: true,
    blockDefinitiveDiagnosis: true,
  },
};
