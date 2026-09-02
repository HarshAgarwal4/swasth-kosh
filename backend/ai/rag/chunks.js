import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

async function create_chunks(docs) {
  try {
    const chunks = await splitter.splitDocuments(docs);
    return chunks;
  } catch (err) {
    console.error("Error creating chunks:", err.message);
    throw err;
  }
}

export default create_chunks;