import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Upload, CheckCircle, AlertCircle, Clock } from "lucide-react";
import axios from "../services/axios";
import { toast } from "react-toastify";

const MAX_RECORDING_SECONDS = 10;

const AudioRecorder = ({ workerId, screeningId, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingType, setRecordingType] = useState("COUGH");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setRecordingSeconds(0);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAnalysisResult(null);

      // 10-second automatic timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied or unavailable: " + err.message);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!audioBlob && !audioUrl) {
      toast.warning("Please record respiratory audio first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append("audio", audioBlob, "respiratory_sound.wav");
      }
      if (workerId) {
        formData.append("workerId", workerId);
      }
      if (screeningId) {
        formData.append("screeningId", screeningId);
      }
      formData.append("recordingType", recordingType);
      formData.append("durationSeconds", (recordingSeconds || 10).toString());

      // Directly send audio file buffer to backend for AI evaluation (NO Cloudinary)
      const res = await axios.post("/api/audio/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setAnalysisResult(res.data.aiAnalysis || res.data.data?.aiAnalysis);
        toast.success("Audio evaluation complete!");
        if (onAnalysisComplete) {
          onAnalysisComplete(res.data.data);
        }
      } else {
        toast.error("Analysis failed: " + (res.data?.message || "Unknown error"));
      }
    } catch (err) {
      toast.error("Evaluation error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            Respiratory Sound / Cough Acoustic Recording
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Record <strong>up to 10 seconds</strong> of deep coughs or respiratory sound for backend AI evaluation.
          </p>
        </div>

        <select
          value={recordingType}
          onChange={(e) => setRecordingType(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
        >
          <option value="COUGH">Deep Voluntary Cough</option>
          <option value="TRACHEAL_BREATHING">Tracheal Breath Sound</option>
          <option value="FORCED_EXPIRATION">Forced Expiratory Breath</option>
        </select>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 bg-white rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition active:scale-95 shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Start Recording (Max 10s)
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs transition animate-pulse"
            >
              <Square className="w-4 h-4 text-red-400 fill-red-400" />
              Stop Recording ({recordingSeconds}s / 10s)
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-ping" />
              <span>Recording... ({recordingSeconds}s / 10s max)</span>
            </div>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-3">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              type="button"
              onClick={togglePlayback}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? "Pause" : "Play Preview"}
            </button>

            <button
              type="button"
              onClick={handleUploadAndAnalyze}
              disabled={isUploading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? "Evaluating Audio..." : "Send to Backend for Evaluation"}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              Backend Acoustic Assessment: {analysisResult.classification}
            </span>
            <span className="text-xs font-bold text-indigo-700">
              Confidence: {Math.round((analysisResult.confidence || 0.85) * 100)}%
            </span>
          </div>

          {analysisResult.signals && analysisResult.signals.length > 0 && (
            <ul className="mt-2 text-xs text-slate-700 space-y-1">
              {analysisResult.signals.map((sig, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{sig.description}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[11px] text-slate-500 mt-2 italic">
            * Recorded {recordingSeconds || 10} seconds of acoustic audio analyzed directly on backend (Cloudinary disabled).
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
