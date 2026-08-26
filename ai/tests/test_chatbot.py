import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.chatbot_service import generate_chat_response

def test_worker_chatbot_response():
    res = generate_chat_response("What does my high risk score mean?", mode="WORKER", language="en")
    assert "reply" in res
    assert "disclaimer" in res
    assert res["mode"] == "WORKER"

def test_hindi_chatbot_response():
    res = generate_chat_response("सिलिकोसिस क्या होता है?", mode="WORKER", language="hi")
    assert "reply" in res
    assert "धूल" in res["reply"] or "सिलिका" in res["reply"]
