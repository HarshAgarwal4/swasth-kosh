import { executeRagPipeline } from "../rag/ragPipeline.js";
import { defaultMistralProvider } from "../providers/mistralProvider.js";
import { SYSTEM_SAFETY_PROMPT } from "../prompts/systemPrompts.js";
import { buildRagContext } from "../rag/documentLoader.js";

/**
 * Multi-turn Conversational Chatbot Engine powered by LangChain & Mistral AI
 * Target model: mistral-small-2603
 */
export class AiChatbotEngine {
  constructor() {
    this.sessionHistory = new Map();
  }

  async processMessage(sessionId, message, options = {}) {
    const history = this.sessionHistory.get(sessionId) || (options.history ? [...options.history] : []);

    // Retrieve relevant medical guideline context
    const { contextText, sources } = await buildRagContext(message, options.topK || 3);

    const systemPromptWithContext = `
${SYSTEM_SAFETY_PROMPT}

USER MODE: ${options.mode || "WORKER"}
PREFERRED LANGUAGE: ${options.language === "hi" ? "Hindi (हिन्दी)" : "English"}

MEDICAL GUIDELINE CONTEXT:
${contextText || "Standard occupational health and pneumoconiosis prevention guidance applies."}

Provide helpful, clear, and empathetic clinical screening assistance in ${options.language === "hi" ? "Hindi" : "English"}.
`;

    // Process using Mistral AI provider with conversation history
    const reply = await defaultMistralProvider.generateResponse(message, systemPromptWithContext, {
      ...options,
      history,
    });

    history.push({ role: "user", text: message, timestamp: new Date() });
    history.push({ role: "assistant", text: reply, timestamp: new Date() });

    // Sliding window of last 10 messages
    if (history.length > 10) history.splice(0, history.length - 10);
    this.sessionHistory.set(sessionId, history);

    return {
      reply,
      sources: sources && sources.length > 0 ? sources : ["National Programme for Control of Pneumoconiosis (NPCP)"],
      model: defaultMistralProvider.modelName,
      historyLength: history.length,
      timestamp: new Date(),
    };
  }

  clearSession(sessionId) {
    this.sessionHistory.delete(sessionId);
  }
}

export const defaultChatEngine = new AiChatbotEngine();
