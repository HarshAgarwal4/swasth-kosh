import { buildRagContext } from "./documentLoader.js";
import { defaultMistralProvider } from "../providers/mistralProvider.js";
import { SYSTEM_SAFETY_PROMPT } from "../prompts/systemPrompts.js";

/**
 * End-to-end RAG pipeline using LangChain ChatMistralAI (mistral-small-2603)
 */
export async function executeRagPipeline(userQuery, options = {}) {
  const { contextText, sources } = await buildRagContext(userQuery, options.topK || 3);

  const promptWithContext = `
${SYSTEM_SAFETY_PROMPT}

MEDICAL OCCUPATIONAL GUIDELINE CONTEXT:
${contextText || "Standard occupational health and pneumoconiosis prevention guidance applies."}

USER QUERY (${options.language === "hi" ? "Hindi" : "English"}):
${userQuery}

Instructions:
1. Provide a factual, grounded response based on the medical guidelines above.
2. If the user asks in Hindi, answer in clear Hindi. If in English, answer in English.
3. Enforce the non-diagnostic screening disclaimer at the end.
`;

  const reply = await defaultMistralProvider.generateResponse(userQuery, promptWithContext, options);

  return {
    answer: reply,
    sources,
    contextUsed: contextText,
    model: defaultMistralProvider.modelName,
    timestamp: new Date(),
  };
}
