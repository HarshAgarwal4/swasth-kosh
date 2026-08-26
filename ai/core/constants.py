"""
Occupational Respiratory Screening Constants & Risk Thresholds
"""

RISK_LEVEL_LOW = "LOW"
RISK_LEVEL_MODERATE = "MODERATE"
RISK_LEVEL_HIGH = "HIGH"

DISCLAIMER_TEXT = (
    "This is an AI-assisted occupational screening score and decision support signal. "
    "It is NOT a medical diagnosis of silicosis or any respiratory disease. "
    "Clinical evaluation by a qualified medical officer is required."
)

AUDIO_CLASSES = ["NORMAL", "WHEEZE", "CRACKLE", "STRIDOR", "DIMINISHED_BREATH_SOUNDS"]

SUPPORTED_LANGUAGES = ["en", "hi"]

DEFAULT_EMBEDDING_DIM = 384
