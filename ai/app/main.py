from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from api.routes import health, chat, rag, audio, risk, screening, embeddings
from rag.pipeline.rag_pipeline import index_default_knowledge

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Assisted Occupational Lung Disease Early Screening & Decision Support Microservice",
)

# CORS middleware for local and production communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(rag.router)
app.include_router(audio.router)
app.include_router(risk.router)
app.include_router(screening.router)
app.include_router(embeddings.router)

@app.on_event("startup")
async def on_startup():
    print("Initializing Silicosis Screening Knowledge Base...")
    try:
        index_default_knowledge()
    except Exception as e:
        print(f"Knowledge indexing warning: {e}")

@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "docs": "/docs",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.ai_host, port=settings.ai_port, reload=True)
