import numpy as np

def normalize_audio(audio_signal: np.ndarray) -> np.ndarray:
    """
    Peak normalizes the acoustic waveform to [-1.0, 1.0].
    """
    if len(audio_signal) == 0:
        return audio_signal
    max_val = np.max(np.abs(audio_signal))
    if max_val > 0:
        return audio_signal / max_val
    return audio_signal
