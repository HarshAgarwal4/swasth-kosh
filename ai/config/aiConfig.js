export const aiConfig = {
  provider: process.env.AI_PROVIDER || "mock", // 'gemini', 'openai', 'mock'
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    temperature: 0.2,
    maxOutputTokens: 1024,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    maxTokens: 1024,
  },
  rag: {
    chunkSize: 500,
    chunkOverlap: 50,
    topK: 3,
    similarityThreshold: 0.35,
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
