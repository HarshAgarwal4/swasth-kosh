import numpy as np

def generate_spectrogram(audio_signal: np.ndarray, n_fft: int = 512, hop_length: int = 256):
    """
    Computes Short-Time Fourier Transform (STFT) magnitude spectrogram.
    """
    if len(audio_signal) < n_fft:
        # Pad with zeros
        audio_signal = np.pad(audio_signal, (0, n_fft - len(audio_signal)))

    # Compute basic STFT spectrogram with numpy
    num_frames = 1 + (len(audio_signal) - n_fft) // hop_length
    frames = np.lib.stride_tricks.as_strided(
        audio_signal,
        shape=(num_frames, n_fft),
        strides=(audio_signal.strides[0] * hop_length, audio_signal.strides[0])
    )
    window = np.hanning(n_fft)
    windowed = frames * window
    fft_result = np.fft.rfft(windowed, axis=1)
    magnitude = np.abs(fft_result)
    return magnitude
