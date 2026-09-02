import load_document from "./doc_loader.js";
import create_chunks from "./chunks.js";
import { vectorstores } from "./DB.js";
import path from "path";
import fs from "fs";

async function create_database(docPath = "./SilicosisDoc.pdf") {
  try {
    const resolvedPath = path.resolve(docPath);
    console.log(`\n🚀 Starting RAG Database Creation for: ${resolvedPath}`);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Target document file not found: ${resolvedPath}`);
    }

    console.log("📄 Step 1: Loading Document...");
    const docs = await load_document(resolvedPath);
    console.log(`   Loaded ${docs.length} document pages successfully.`);

    console.log("✂️ Step 2: Splitting Document into Chunks...");
    const chunks = await create_chunks(docs);
    console.log(`   Created ${chunks.length} text chunks.`);

    console.log("💾 Step 3: Storing Chunks & Embeddings directly into ChromaDB...");
    await vectorstores.addDocuments(chunks);
    console.log(`   Added ${chunks.length} chunks directly to ChromaDB collection 'SilicosisDocs'.`);

    console.log(`\n✅ Database Creation Complete!\n`);
    return true;
  } catch (err) {
    console.error("❌ Error creating database:", err.message);
    throw err;
  }
}

// Auto-run when executed directly via Node CLI
create_database("./SilicosisDoc.pdf").catch((err) => {
  console.error("Database generation failed:", err.message);
});

export default create_database;