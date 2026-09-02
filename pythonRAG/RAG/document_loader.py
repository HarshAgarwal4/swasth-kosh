from langchain_community.document_loaders import PyPDFLoader

def document_loader(file):
    loader = PyPDFLoader(file_path=file)
    docs = loader.load()
    return docs