import { buildRagContext } from "./documentLoader.js";
import { MockProvider } from "../providers/mockProvider.js";
import { SYSTEM_SAFETY_PROMPT } from "../prompts/systemPrompts.js";

const defaultProvider = new MockProvider();

/**
 * End-to-end RAG pipeline
 */
export async function executeRagPipeline(userQuery, options = {}) {
  const { contextText, sources } = await buildRagContext(userQuery, options.topK || 3);

  const promptWithContext = `
${SYSTEM_SAFETY_PROMPT}

MEDICAL GUIDELINE CONTEXT:
${contextText || "Standard occupational health guidance applies."}

USER QUERY (${options.language === "hi" ? "Hindi" : "English"}):
${userQuery}

Provide a factual, grounded response based on the guidelines above. Enforce the non-diagnostic disclaimer.
`;

  const reply = await defaultProvider.generateResponse(userQuery, promptWithContext, options);

  return {
    answer: reply,
    sources,
    contextUsed: contextText,
    timestamp: new Date(),
  };
}
