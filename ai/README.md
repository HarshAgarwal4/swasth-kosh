# Occupational Lung Disease AI Microservice

This microservice provides AI decision support, acoustic respiratory sound screening, multi-factor silicosis risk analysis, and RAG knowledge retrieval for the Silicosis Screening & Telemedicine Platform.

## Core Modules
- **Risk Engine (`/api/risk/analyze`)**: Multi-factor occupational risk calculation combining cumulative exposure, mMRC dyspnea & cough indices, spirometric airflow patterns, and auscultation acoustic signals.
- **Respiratory Audio (`/api/audio/analyze`)**: Feature extraction (MFCCs, spectral centroid, ZCR) and pattern classification (normal, wheezes, crackles, stridor).
- **RAG & Chatbot (`/api/chat`, `/api/rag/query`)**: Context-grounded assistant with English and Hindi support, citing NPCP and ILO occupational health standards with strict medical disclaimer safety guards.
- **Chest Radiography Placeholder (`/xray`)**: Modular structure ready for ILO pneumoconiosis classification model integration.

## Medical Safety Disclaimer
All outputs are screening risk indicators and clinical decision support aids. They are **NOT** medical diagnoses of silicosis or tuberculosis.

## Running the Service
```bash
cd ai
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
