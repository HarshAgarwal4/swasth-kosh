import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";

async function load_document(docPath) {
  try {
    if (!fs.existsSync(docPath)) {
      throw new Error(`Document file not found at path: ${docPath}`);
    }
    const loader = new PDFLoader(docPath);
    const docs = await loader.load();
    return docs;
  } catch (err) {
    console.error("Error in loading document:", err.message);
    throw err;
  }
}

export default load_document;