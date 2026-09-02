from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size = 800,
    chunk_overlap = 150
)

def create_chunks(docs):
    chunks = splitter.split_documents(docs)
    return chunks