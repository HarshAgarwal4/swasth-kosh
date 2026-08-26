import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rag.pipeline.rag_pipeline import index_default_knowledge, generate_rag_response

def test_rag_pipeline():
    index_default_knowledge()
    res = generate_rag_response("What PPE should miners wear for silica dust?")
    assert "answer" in res
    assert len(res["retrievedContexts"]) > 0
    assert "disclaimer" in res
