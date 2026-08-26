/**
 * Abstract Base Provider for LLM integrations
 */
export class BaseProvider {
  constructor(config = {}) {
    this.config = config;
  }

  async generateResponse(prompt, systemPrompt = "", options = {}) {
    throw new Error("generateResponse() must be implemented by provider subclasses");
  }
}
