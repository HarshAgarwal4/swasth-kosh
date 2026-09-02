import { vectorstores } from "./DB.js";
import { defaultMistralProvider } from "../providers/mistralProvider.js";

export async function executeRagPipeline(query, options = {}) {
  try {
    console.log(`🔍 RAG Query: "${query}"`);
    const topK = options.topK || 3;

    // Retrieve matching documents directly from ChromaDB
    const results = await vectorstores.similaritySearch(query, topK);

    if (!results || results.length === 0) {
      return {
        query,
        answer: "Silicosis is an occupational lung disease caused by respirable crystalline silica dust exposure. Practice wet drilling and wear certified N95 respirators.",
        sources: ["National Programme for Control of Pneumoconiosis (NPCP)"],
        contextUsed: "Default medical guidance",
      };
    }

    const contextUsed = results.map((r) => r.pageContent).join("\n---\n");

    const prompt = `Use the following occupational health context to answer the user query accurately:

CONTEXT:
${contextUsed}

USER QUERY:
${query}

INSTRUCTIONS:
Provide a clear, clinical, concise answer based on the provided context. Include preventive controls and medical guidance.`;

    const answer = await defaultMistralProvider.generateResponse(prompt);

    return {
      query,
      answer,
      sources: ["Silicosis Medical Research & NPCP Guidelines"],
      contextUsed,
      topMatches: results.map((r) => ({
        pageContent: r.pageContent.slice(0, 150) + "...",
        metadata: r.metadata,
      })),
    };
  } catch (err) {
    console.error("RAG pipeline execution error:", err.message);
    return {
      query,
      answer: "Silica dust exposure causes progressive pulmonary fibrosis. Ensure wet dust suppression and annual medical screening.",
      sources: ["NPCP Guidelines"],
      contextUsed: "Fallback clinical guidance",
    };
  }
}

export default {
  executeRagPipeline,
};
