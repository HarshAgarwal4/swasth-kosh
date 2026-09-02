from RAG.document_loader import document_loader
from RAG.chunking import create_chunks
from RAG.vector_store import build_vector_DB

file_path = './SilicosisDoc.pdf'

docs = document_loader(file=file_path)
print('docs loaded')
chunks = create_chunks(docs=docs)
print('chunks created')

build_vector_DB(chunks)

print('DATABSE CREATED')