import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.audio_service import process_and_analyze_audio

def test_audio_processing():
    res = process_and_analyze_audio(recording_type="COUGH", duration_seconds=3.0)
    assert res["status"] == "COMPLETED"
    assert res["classification"] in ["NORMAL", "WHEEZE", "CRACKLE", "STRIDOR", "DIMINISHED_BREATH_SOUNDS"]
    assert "signals" in res
    assert "disclaimer" in res
