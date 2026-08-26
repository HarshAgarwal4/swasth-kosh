import numpy as np
from audio.preprocessing.spectrogram import generate_spectrogram

def extract_audio_features(audio_signal: np.ndarray, sample_rate: int = 16000):
    """
    Extracts acoustic feature descriptors: Spectral Centroid, Energy, and Zero Crossing Rate.
    """
    if len(audio_signal) == 0:
        return {
            "zeroCrossingRate": 0.0,
            "spectralCentroidMean": 0.0,
            "energyRms": 0.0,
            "mfccSummary": [0.0] * 13,
        }

    # Zero-crossing rate
    zcr = float(np.mean(np.abs(np.diff(np.sign(audio_signal)))) / 2)

    # RMS energy
    rms = float(np.sqrt(np.mean(audio_signal**2)))

    # Spectral centroid approximation
    spec = generate_spectrogram(audio_signal)
    freqs = np.linspace(0, sample_rate / 2, spec.shape[1])
    spec_sum = np.sum(spec, axis=1) + 1e-10
    spectral_centroid = float(np.mean(np.sum(spec * freqs, axis=1) / spec_sum))

    # Placeholder 13-band MFCC summary vector
    mfcc_summary = [float(round(val, 4)) for val in np.linspace(-12.0, 15.0, 13)]

    return {
        "zeroCrossingRate": round(zcr, 4),
        "spectralCentroidMean": round(spectral_centroid, 2),
        "energyRms": round(rms, 4),
        "mfccSummary": mfcc_summary,
    }
