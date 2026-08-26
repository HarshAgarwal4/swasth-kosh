import { BaseProvider } from "./baseProvider.js";

/**
 * Intelligent Mock Provider for offline/zero-dependency environments
 */
export class MockProvider extends BaseProvider {
  async generateResponse(prompt, systemPrompt = "", options = {}) {
    const p = prompt.toLowerCase();

    // Hindi responses
    if (options.language === "hi" || /सिलिकोसिस|फेफड़ा|खांसी|मास्क|खदान/.test(prompt)) {
      if (p.includes("मास्क") || p.includes("बचाव") || p.includes("ppe")) {
        return "खदान और स्टोन क्रशर क्षेत्र में काम करते समय हमेशा प्रमाणित N95 या P100 डस्ट रेस्पिरेटर मास्क पहनें। कपड़े या तौलिए का गमछा सिलिका के सूक्ष्म धूल कणों को नहीं रोक सकता। कार्यस्थल पर गीली ड्रिलिंग (Wet Drilling) का उपयोग करें।\n\n⚠️ सूचना: यह केवल स्वास्थ्य सुरक्षा परामर्श है, चिकित्सकीय जांच नहीं।";
      }
      if (p.includes("लक्षण") || p.includes("खांसी") || p.includes("सांस")) {
        return "सिलिकोसिस के मुख्य लक्षण हैं: 3 सप्ताह से अधिक समय तक खांसी, काम करते समय सांस फूलना (Dyspnea), सीने में दर्द और लगातार कमजोरी। यदि बलगम में खून आता है तो तत्काल नजदीकी जिला अस्पताल या सिलिकोसिस बोर्ड में संपर्क करें।\n\n⚠️ सूचना: यह केवल स्वास्थ्य सुरक्षा परामर्श है, चिकित्सकीय जांच नहीं।";
      }
      return "सिलिकोसिस एक व्यावसायिक फेफड़ों की बीमारी है जो हवा में मौजूद सिलिका धूल के फेफड़ों में जमा होने से होती है। बचाव ही इसका सबसे प्रभावी उपाय है। नियमित स्पाइरोमेट्री जांच और डिजिटल चेस्ट एक्स-रे करवाएं।\n\n⚠️ सूचना: यह केवल स्वास्थ्य सुरक्षा परामर्श है, चिकित्सकीय जांच नहीं।";
    }

    // English responses
    if (p.includes("fev1") || p.includes("spirometry") || p.includes("ratio") || p.includes("pft")) {
      return "An FEV1/FVC ratio below 70% is the standard clinical threshold for obstructive ventilatory limitation. In dust-exposed workers, combined restrictive and obstructive deficits indicate progressive pulmonary parenchymal involvement. Clinical correlation with PA chest radiograph (ILO standard) is strongly recommended.\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
    }

    if (p.includes("mask") || p.includes("ppe") || p.includes("prevention") || p.includes("safety")) {
      return "Primary prevention of silicosis requires engineering controls at source (continuous water spray wet-drilling, local exhaust ventilation) combined with certified N95 or particulate respirators. Simple cloth masks do not filter respirable crystalline silica (<5 microns).\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
    }

    if (p.includes("symptom") || p.includes("cough") || p.includes("breath")) {
      return "Key occupational respiratory red flags include: chronic progressive cough (>3 weeks), exertional dyspnea (mMRC Grade 2+), nocturnal fever/sweats (suspected Silico-TB coinfection), and chest tightness. Immediate chest physician evaluation is indicated.\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
    }

    return "Crystalline silica dust inhalation leads to alveolar macrophage activation and progressive interstitial fibrosis. Early screening combining exposure quantification, mMRC dyspnea scoring, spirometric airflow indices, and acoustic cough analysis enables timely occupational intervention.\n\n⚠️ Medical Disclaimer: Screening decision support only. Not a definitive medical diagnosis.";
  }

  async generateEmbedding(text) {
    // Generate deterministic 64-dimensional float vector for semantic search
    const vector = new Array(64).fill(0);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      vector[i % 64] += (code * 0.01) % 1.0;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((val) => val / magnitude);
  }
}
