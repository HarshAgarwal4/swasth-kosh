from langchain_community.vectorstores import Chroma
from RAG.vector_store import embedding_model
from dotenv import load_dotenv

load_dotenv()

def build_retriever():
    vector_store = Chroma(
        embedding_function=embedding_model,
        persist_directory='ChromaDB'
    )
    return vector_store.as_retriever(
        search_type = 'mmr',
        search_kwargs = {
            "k" : 4,
            'fetch_k': 10,
            'lambda_mult': 0.5
        }
    )