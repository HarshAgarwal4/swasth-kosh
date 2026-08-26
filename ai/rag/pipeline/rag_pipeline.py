from rag.loaders.document_loader import load_documents
from rag.chunking.text_chunker import chunk_document
from rag.embeddings.embedding_generator import generate_embeddings
from rag.vectorstore.vector_store import global_vector_store
from rag.vectorstore.retriever import retrieve_documents
from prompts.system_prompt import DISCLAIMER_SUFFIX_EN, DISCLAIMER_SUFFIX_HI

def index_default_knowledge():
    """
    Initializes and populates vector index with occupational safety & silicosis screening guidelines.
    """
    default_docs = [
        {
            "id": "guideline_npcp_01",
            "title": "National Programme for Prevention and Control of Silicosis Guidelines",
            "content": (
                "Silicosis is a progressive, irreversible fibrotic lung disease caused by the inhalation of respirable crystalline silica (RCS) dust. "
                "High-risk sectors include sandstone quarrying, quartz grinding, stone crushing, agate cutting, and foundry works. "
                "Primary prevention includes wet drilling, ventilation hoods, and certified N95 respirators. "
                "Early screening indicators comprise chronic cough, exertional dyspnea (mMRC scale), reduction in FEV1/FVC ratio, and nodular opacities on chest radiography."
            ),
            "source": "Ministry of Labour & Employment / DGMS Standard Protocol",
        },
        {
            "id": "guideline_ilo_radiography_02",
            "title": "ILO International Classification of Radiographs of Pneumoconioses",
            "content": (
                "ILO radiographic standards define small rounded opacities (p, q, r types) and irregular opacities (s, t, u types). "
                "Profusion categories range from 0/- to 3/+. Progressive Massive Fibrosis (PMF) is characterized by large opacities greater than 10mm (Category A, B, C). "
                "Workers suspected of Category 1/1 profusion must receive pulmonary evaluation and silicosis board review."
            ),
            "source": "ILO International Classification Guidelines 2022",
        },
        {
            "id": "guideline_spirometry_pft_03",
            "title": "Occupational Spirometry Interpretation Protocol",
            "content": (
                "Periodic spirometry measures Forced Expiratory Volume in 1 second (FEV1), Forced Vital Capacity (FVC), and the FEV1/FVC ratio. "
                "An FEV1/FVC ratio below 0.70 (or below lower limit of normal) indicates an obstructive defect. "
                "A symmetrical reduction in FVC with normal FEV1/FVC ratio suggests a restrictive ventilatory defect, requiring full plethysmography or HRCT chest correlation."
            ),
            "source": "Occupational Health & Safety Guidelines (DGMS / ATS)",
        },
        {
            "id": "guideline_worker_safety_hindi_04",
            "title": "खदान एवं पत्थर पिसाई उद्योग सुरक्षा निर्देश (Hindi)",
            "content": (
                "सिलिका धूल से फेफड़ों में सिलिकोसिस नामक बीमारी होती है। इससे बचाव के मुख्य उपाय: "
                "1. हमेशा N95 या प्रमाणित डस्ट मास्क पहनें। 2. गीली ड्रिलिंग (Wet Drilling) का उपयोग करें ताकि धूल न उड़े। "
                "3. यदि 3 हफ्ते से ज्यादा खांसी या सांस फूलने की समस्या हो तो तुरंत अस्पताल में जांच करवाएं। "
                "4. धूम्रपान और बीड़ी का सेवन बंद करें क्योंकि यह धूल के नुकसान को दोगुना कर देता है।"
            ),
            "source": "राष्ट्रीय व्यावसायिक स्वास्थ्य संस्थान (NIOH) दिशानिर्देश",
        }
    ]

    loaded_from_disk = load_documents("data/documents")
    all_docs = default_docs + loaded_from_disk

    indexed_items = []
    for doc in all_docs:
        chunks = chunk_document(doc["content"], chunk_size=200, overlap=30)
        chunk_embeddings = generate_embeddings(chunks)
        for chunk, emb in zip(chunks, chunk_embeddings):
            indexed_items.append({
                "doc": {
                    "id": doc["id"],
                    "title": doc["title"],
                    "content": chunk,
                    "source": doc["source"],
                },
                "embedding": emb,
            })

    global_vector_store.add_documents(indexed_items)
    print(f"Indexed {len(indexed_items)} chunks into in-memory vector store.")

def build_rag_context(query: str, top_k: int = 3):
    retrieved = retrieve_documents(query, top_k=top_k)
    context_text = "\n\n".join([f"[{d['source']}]: {d['content']}" for d in retrieved])
    sources = list(set([d["source"] for d in retrieved]))
    return context_text, retrieved, sources

def generate_rag_response(query: str, language: str = "en"):
    context_text, retrieved, sources = build_rag_context(query)
    
    if language == "hi" or any(ord(char) > 2300 and ord(char) < 2400 for char in query):
        answer = (
            "सिलिका धूल और कार्यस्थल सुरक्षा दिशानिर्देशों के अनुसार, धूल भरे वातावरण में काम करने वाले श्रमिकों को "
            "नियमित रूप से N95 मास्क का उपयोग करना चाहिए और पानी के छिड़काव वाली ड्रिलिंग का पालन करना चाहिए। "
            "यदि खांसी या सांस लेने में तकलीफ हो, तो तुरंत फेफड़ा विशेषज्ञ से जांच (स्पाइरोमेट्री और एक्स-रे) कराएं।"
            + DISCLAIMER_SUFFIX_HI
        )
    else:
        answer = (
            f"Based on occupational health protocols, respirable crystalline silica (RCS) exposure requires proactive surveillance. "
            f"Key recommendations include maintaining certified N95 respiratory protection, engineering dust suppression (wet cutting), "
            f"and periodic clinical spirometry.\n\n"
            f"Reference context highlights:\n{context_text[:300]}..."
            + DISCLAIMER_SUFFIX_EN
        )

    return {
        "answer": answer,
        "retrievedContexts": retrieved,
        "sourceCitations": sources,
        "disclaimer": "AI RAG system answers are for educational purposes and do not replace certified medical consultation.",
    }
