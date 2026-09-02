from langchain_mistralai import MistralAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

model = MistralAIEmbeddings(model='mistral-embed')

print(model.embed_query('What is hlo'))