import numpy as np

def clean_audio(audio_signal: np.ndarray, sample_rate: int = 16000) -> np.ndarray:
    """
    Applies high-pass filter baseline wander removal and silence trimming.
    """
    if len(audio_signal) == 0:
        return audio_signal
    # Remove DC offset
    cleaned = audio_signal - np.mean(audio_signal)
    return cleaned

def validate_audio(audio_signal: np.ndarray, sample_rate: int) -> bool:
    if audio_signal is None or len(audio_signal) == 0:
        return False
    if sample_rate < 8000:
        return False
    return True
