import { executeRagPipeline } from "../rag/ragPipeline.js";

/**
 * Multi-turn Conversational Chatbot Engine
 */
export class AiChatbotEngine {
  constructor() {
    this.sessionHistory = new Map();
  }

  async processMessage(sessionId, message, options = {}) {
    const history = this.sessionHistory.get(sessionId) || [];

    const ragResult = await executeRagPipeline(message, options);

    history.push({ role: "user", text: message, timestamp: new Date() });
    history.push({ role: "assistant", text: ragResult.answer, timestamp: new Date() });

    // Keep sliding window of last 10 messages
    if (history.length > 10) history.splice(0, history.length - 10);
    this.sessionHistory.set(sessionId, history);

    return {
      reply: ragResult.answer,
      sources: ragResult.sources,
      historyLength: history.length,
      timestamp: new Date(),
    };
  }

  clearSession(sessionId) {
    this.sessionHistory.delete(sessionId);
  }
}

export const defaultChatEngine = new AiChatbotEngine();
