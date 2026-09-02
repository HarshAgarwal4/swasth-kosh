from langchain_community.vectorstores import Chroma
from langchain_mistralai import MistralAIEmbeddings
from dotenv import load_dotenv
load_dotenv()

embedding_model=MistralAIEmbeddings(model='mistral-embed')

def build_vector_DB(chunks):
    vector_store = Chroma.from_documents(
        documents= chunks,
        embedding=embedding_model,
        persist_directory='ChromaDB'
    )
    return vector_store