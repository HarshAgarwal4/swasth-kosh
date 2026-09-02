import { MistralAIEmbeddings } from "@langchain/mistralai";

const embeddingModel = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export default embeddingModel;