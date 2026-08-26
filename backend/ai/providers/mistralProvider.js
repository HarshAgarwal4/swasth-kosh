import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { BaseProvider } from "./baseProvider.js";
import { aiConfig } from "../config/aiConfig.js";
import { SYSTEM_SAFETY_PROMPT } from "../prompts/systemPrompts.js";

/**
 * Mistral AI Provider using LangChain (@langchain/mistralai)
 * Target model: mistral-small-2603
 */
export class MistralProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || process.env.MISTRAL_API_KEY || aiConfig.mistral.apiKey;
    this.modelName = config.model || process.env.MISTRAL_MODEL || aiConfig.mistral.model || "mistral-small-2603";
    this.temperature = config.temperature ?? aiConfig.mistral.temperature ?? 0.2;
    this.maxTokens = config.maxTokens ?? aiConfig.mistral.maxTokens ?? 1024;

    this.client = null;
    if (this.apiKey) {
      try {
        this.client = new ChatMistralAI({
          apiKey: this.apiKey,
          model: this.modelName,
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        });
      } catch (err) {
        console.warn("[MistralProvider] LangChain ChatMistralAI init warning:", err.message);
      }
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates a conversational or RAG response using LangChain ChatMistralAI
   */
  async generateResponse(userMessage, systemPrompt = SYSTEM_SAFETY_PROMPT, options = {}) {
    const rawHistory = options.history || [];

    if (this.client || this.isConfigured()) {
      try {
        if (!this.client) {
          this.client = new ChatMistralAI({
            apiKey: this.apiKey,
            model: this.modelName,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
          });
        }

        const messages = [new SystemMessage(systemPrompt || SYSTEM_SAFETY_PROMPT)];

        // Format multi-turn conversation history
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

        const response = await this.client.invoke(messages);
        if (response && response.content) {
          return typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);
        }
      } catch (error) {
        console.warn("[MistralProvider] ChatMistralAI error, falling back to clinical safety rule engine:", error.message);
      }
    }

    // Graceful clinical decision support fallback
    return this.generateClinicalFallback(userMessage, options);
  }

  /**
   * Generates structured screening summary in English & Hindi using LangChain ChatMistralAI
   */
  async generateSummary(screeningContext) {
    if (this.client || this.isConfigured()) {
      try {
        if (!this.client) {
          this.client = new ChatMistralAI({
            apiKey: this.apiKey,
            model: this.modelName,
            temperature: 0.1,
          });
        }

        const prompt = [
          new SystemMessage(SYSTEM_SAFETY_PROMPT),
          new HumanMessage(
            `Based on the following worker screening data, generate a concise 2-sentence clinical summary in English and in Hindi.\n\nScreening Data:\n${JSON.stringify(
              screeningContext,
              null,
              2
            )}\n\nFormat your output as a JSON object with keys "englishSummary" and "hindiSummary".`
          ),
        ];

        const res = await this.client.invoke(prompt);
        const text = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (err) {
        console.warn("[MistralProvider] Summary generation fallback:", err.message);
      }
    }

    const years = screeningContext?.exposure?.yearsOfExposure || 0;
    return {
      englishSummary: `Worker presents with ${years} years occupational silica exposure history. Screening risk stratification completed. Clinical consultation and baseline ILO PA chest radiograph recommended.`,
      hindiSummary: `श्रमिक को ${years} वर्षों का व्यावसायिक सिलिका धूल जोखिम है। विस्तृत क्लीनिकल जांच एवं डिजिटल चेस्ट एक्स-रे कराने की अनुशंसा की जाती है।`,
    };
  }

  /**
   * Deterministic clinical decision support rule engine fallback for offline mode
   */
  generateClinicalFallback(userMessage, options = {}) {
    const p = (userMessage || "").toLowerCase();
    const isHindi = options.language === "hi" || /सिलिकोसिस|फेफड़ा|खांसी|मास्क|खदान|धूल|बलगम|सांस/.test(userMessage);

    if (isHindi) {
      if (p.includes("मास्क") || p.includes("बचाव") || p.includes("ppe") || p.includes("सुरक्षा")) {
        return "खदान और स्टोन क्रशर क्षेत्र में काम करते समय हमेशा प्रमाणित N95 या P100 डस्ट रेस्पिरेटर मास्क पहनें। साधारण कपड़ा सिलिका के सूक्ष्म धूल कणों को नहीं रोक सकता। कार्यस्थल पर गीली ड्रिलिंग (Wet Drilling) का उपयोग अनिवार्य है।\n\n⚠️ सूचना: यह केवल स्वास्थ्य सुरक्षा परामर्श है, चिकित्सकीय जांच नहीं।";
      }
      if (p.includes("लक्षण") || p.includes("खांसी") || p.includes("सांस") || p.includes("खून")) {
        return "सिलिकोसिस के मुख्य लक्षण हैं: 3 सप्ताह से अधिक समय तक खांसी, काम करते समय सांस फूलना (Dyspnea), सीने में जकड़न। यदि बलगम में खून (Hemoptysis) आता है तो तत्काल नजदीकी जिला अस्पताल या सिलिकोसिस बोर्ड में संपर्क करें।\n\n⚠️ सूचना: यह केवल स्वास्थ्य सुरक्षा परामर्श है, चिकित्सकीय जांच नहीं।";
      }
      return "सिलिकोसिस एक व्यावसायिक फेफड़ों की बीमारी है जो हवा में मौजूद सिलिका धूल के फेफड़ों में जमा होने से होती है। बचाव ही इसका सबसे प्रभावी उपाय है। नियमित स्पाइरोमेट्री जांच और डिजिटल चेस्ट एक्स-रे करवाएं।\n\n⚠️ सूचना: यह केवल स्वास्थ्य सुरक्षा परामर्श है, चिकित्सकीय जांच नहीं।";
    }

    if (p.includes("fev1") || p.includes("spirometry") || p.includes("ratio") || p.includes("pft")) {
      return "An FEV1/FVC ratio below 70% is the standard clinical threshold for obstructive ventilatory limitation. In dust-exposed workers, combined restrictive and obstructive deficits indicate progressive pulmonary parenchymal involvement. Clinical correlation with PA chest radiograph (ILO standard) is strongly recommended.\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
    }

    if (p.includes("mask") || p.includes("ppe") || p.includes("prevention") || p.includes("safety")) {
      return "Primary prevention of silicosis requires engineering controls at source (continuous water spray wet-drilling, local exhaust ventilation) combined with certified N95 particulate respirators. Simple cloth masks do not filter respirable crystalline silica (<5 microns).\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
    }

    if (p.includes("symptom") || p.includes("cough") || p.includes("breath") || p.includes("blood")) {
      return "Key occupational respiratory red flags include: chronic progressive cough (>3 weeks), exertional dyspnea (mMRC Grade 2+), nocturnal fever/sweats (suspected Silico-TB coinfection), and chest tightness. Immediate chest physician evaluation is indicated.\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
    }

    return "Crystalline silica dust inhalation leads to alveolar macrophage activation and progressive interstitial fibrosis. Early screening combining exposure quantification, mMRC dyspnea scoring, spirometric airflow indices, and acoustic cough analysis enables timely occupational intervention.\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
  }
}

export const defaultMistralProvider = new MistralProvider();
