from fastapi import FastAPI
from RAG.Retriver import build_retriever
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

retriever = build_retriever()

@app.get('/')
def main():
    print('Hello world')
    return 'HELLO'

@app.get('/chunks')
def get_context(query : str):
    try:
        docs = retriever.invoke(query)
        context = "\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        print(e)
        return e