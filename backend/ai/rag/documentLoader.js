import { defaultVectorStore } from "../vectorStore/memoryVectorStore.js";

export const MEDICAL_GUIDELINE_CORPUS = [
  {
    id: "npcp_silicosis_01",
    title: "National Programme for Control of Pneumoconiosis - Clinical Guidelines",
    text: "Silicosis is an irreversible fibrotic lung disease caused by the inhalation of respirable crystalline silica particles (PM4 / PM2.5). Chronic exposure of 5+ years in sandstone quarries, quartz mills, and stone-crushing operations poses severe occupational risk. Prevention through certified N95 respirators, wet drilling, and dust extraction is mandatory under DGMS occupational safety standards.",
    metadata: { source: "NPCP MoHFW India", category: "Exposure & Prevention" },
  },
  {
    id: "ilo_radiography_02",
    title: "ILO International Classification of Radiographs of Pneumoconiosis",
    text: "Posteroanterior (PA) chest radiographs remain the standard screening tool. Diagnostic hallmarks include small rounded opacities (p, q, r types) predominantly in the upper lung zones. Progressive massive fibrosis (PMF) is characterized by conglomerate masses larger than 1cm. Radiographic evaluation must always be correlated with occupational exposure history.",
    metadata: { source: "ILO Geneva Standard", category: "Diagnostics" },
  },
  {
    id: "spirometry_guidelines_03",
    title: "Pulmonary Function Testing in Pneumoconiosis",
    text: "Spirometric screening evaluates ventilatory function. An FEV1/FVC ratio below 70% signifies obstructive airway defect. A proportional reduction in both FEV1 and FVC with a preserved ratio suggests restrictive impairment common in progressive silicotic parenchymal fibrosis. Workers with FEV1 below 60% predicted should be placed on medical leave and referred to the District Silicosis Board.",
    metadata: { source: "ATS/ERS Guidelines", category: "Pulmonary Function" },
  },
  {
    id: "silico_tb_triage_04",
    title: "Silico-Tuberculosis Clinical Management and Coinfection Protocol",
    text: "Workers with silicosis have a 3- to 30-fold increased risk of developing pulmonary tuberculosis due to impaired alveolar macrophage clearing. Presence of hemoptysis, unexplained rapid weight loss, fever, or night sweats requires urgent sputum AFB smear / CBNAAT testing and immediate digital referral to a designated chest clinic.",
    metadata: { source: "RNTCP / NTEP Guidelines", category: "Silico-TB Triage" },
  },
  {
    id: "hindi_worker_guideline_05",
    title: "खदान एवं स्टोन क्रशर श्रमिकों हेतु स्वास्थ्य सुरक्षा नियम",
    text: "पत्थर की खदानों में काम करने वाले श्रमिकों को धूल से बचाव के लिए हमेशा N95 मास्क पहनना चाहिए। 3 सप्ताह से अधिक खांसी रहने पर तुरंत फेफड़ों की जांच और स्पाइरोमेट्री कराएं। राज्य सरकार के सिलिकोसिस पोर्टल पर पंजीकृत होकर डिजिटल प्रमाण पत्र प्राप्त करें।",
    metadata: { source: "राजस्थान सिलिकोसिस नीति", category: "श्रमिक सुरक्षा" },
  },
];

/**
 * Splits text into overlapping chunks
 */
export function chunkText(text, chunkSize = 300, overlap = 40) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

/**
 * Initializes the vector store with medical guidelines
 */
export async function initializeRagCorpus() {
  if (defaultVectorStore.count() > 0) return;
  const docsToLoad = [];
  for (const item of MEDICAL_GUIDELINE_CORPUS) {
    const chunks = chunkText(item.text, 80, 15);
    chunks.forEach((c, idx) => {
      docsToLoad.push({
        id: `${item.id}_chunk_${idx}`,
        text: c,
        metadata: { ...item.metadata, title: item.title },
      });
    });
  }
  await defaultVectorStore.addDocuments(docsToLoad);
  console.log(`[RAG Engine] Indexed ${defaultVectorStore.count()} medical guideline chunks.`);
}

/**
 * Context Builder: Augments prompts with top retrieved guideline chunks
 */
export async function buildRagContext(queryText, topK = 3) {
  const matches = await defaultVectorStore.similaritySearch(queryText, topK);
  if (!matches || matches.length === 0) {
    return {
      contextText: "",
      sources: ["National Programme for Control of Pneumoconiosis (NPCP)"],
    };
  }

  const contextText = matches.map((m) => `[Source: ${m.metadata?.title || "Guideline"}]\n${m.text}`).join("\n\n");
  const sources = [...new Set(matches.map((m) => m.metadata?.source || m.metadata?.title))];

  return { contextText, sources };
}
