import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { SYSTEM_SAFETY_PROMPT } from "../prompts/systemPrompts.js";

// Top-level Mistral LLM Instance
export const llm = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY || "",
  model: process.env.MISTRAL_MODEL || "mistral-small-2603",
  temperature: 0.2,
  maxTokens: 1024,
});

export function isMistralConfigured() {
  const key = process.env.MISTRAL_API_KEY;
  return Boolean(key && key.trim().length > 0);
}

export async function generateMistralResponse(userMessage, systemPrompt = SYSTEM_SAFETY_PROMPT, options = {}) {
  const rawHistory = options.history || [];

  if (isMistralConfigured()) {
    try {
      const messages = [new SystemMessage(systemPrompt || SYSTEM_SAFETY_PROMPT)];

      for (const msg of rawHistory) {
        const role = msg.role || (msg.sender === "USER" ? "user" : "assistant");
        const text = msg.text || msg.content || msg.message || "";
        if (role === "user") {
          messages.push(new HumanMessage(text));
        } else if (role === "assistant" || role === "ai") {
          messages.push(new AIMessage(text));
        }
      }

      messages.push(new HumanMessage(userMessage));

      const response = await llm.invoke(messages);
      if (response && response.content) {
        return typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);
      }
    } catch (error) {
      console.warn("Mistral AI chat error, using safety response fallback:", error.message);
    }
  }

  // Safety fallback response
  return `Occupational Silica Safety Guidance:
Silica dust inhalation in sandstone, quartz, and stone cutting mines can cause progressive lung fibrosis (silicosis).
- Wear certified N95 respirators.
- Use wet dust suppression methods.
- Undergo annual spirometry and digital chest X-ray.

⚠️ Medical Safety Disclaimer: Screening decision support only. Not a medical diagnosis.`;
}

export async function generateClinicalSummary(screeningData) {
  const years = screeningData?.exposure?.yearsOfExposure || 0;
  if (isMistralConfigured()) {
    try {
      const text = await generateMistralResponse(
        `Provide a brief 2-sentence clinical summary for a mining worker with ${years} years dust exposure. Include English and Hindi summaries.`,
        SYSTEM_SAFETY_PROMPT
      );
      return {
        englishSummary: text,
        hindiSummary: `श्रमिक को ${years} वर्षों का व्यावसायिक सिलिका धूल जोखिम है। विस्तृत क्लीनिकल जांच की अनुशंसा की जाती है।`,
      };
    } catch (e) {
      console.warn("Summary generation error:", e.message);
    }
  }

  return {
    englishSummary: `Worker presents with ${years} years occupational silica exposure history. Clinical consultation and PA chest radiograph recommended.`,
    hindiSummary: `श्रमिक को ${years} वर्षों का व्यावसायिक सिलिका धूल जोखिम है। विस्तृत क्लीनिकल जांच की अनुशंसा की जाती है।`,
  };
}

export const mistralProvider = {
  isConfigured: isMistralConfigured,
  generateResponse: generateMistralResponse,
  generateSummary: generateClinicalSummary,
};

export const defaultMistralProvider = mistralProvider;

export default llm;
