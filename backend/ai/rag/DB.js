import { Chroma } from "@langchain/community/vectorstores/chroma";
import embeddingModel from "./embedding.js";

// Native Chroma VectorStore instance connected to ChromaDB collection
const vectorstores = new Chroma(embeddingModel, {
  collectionName: "SilicosisDocs",
  url: process.env.CHROMA_URL || "http://localhost:8000",
});

const retriever = vectorstores.asRetriever({
  searchType: "mmr",
  k: 3,
  searchKwargs: {
    fetchK: 20,
    lambda: 0.5,
  },
});

export { retriever, vectorstores };
export default vectorstores;