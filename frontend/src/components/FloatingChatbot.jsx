import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  Globe,
  RotateCcw,
  BookOpen,
  User,
  Maximize2,
  Minimize2,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "../services/axios";
import { useStore } from "../zustand/store";

export const FloatingChatbot = () => {
  const user = useStore((state) => state.user);
  const globalLang = useStore((state) => state.language);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState(
    user?.role === "DOCTOR" || user?.role === "MEDICAL_OFFICER" ? "DOCTOR" : "WORKER"
  );
  const [lang, setLang] = useState(globalLang || "en");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        (globalLang === "hi")
          ? "नमस्ते! मैं आपका व्यावसायिक स्वास्थ्य AI सहायक हूँ (Mistral AI)। आप मुझसे सिलिकोसिस, N95 मास्क, फेफड़ा सुरक्षा या अपनी जांच रिपोर्ट के बारे में पूछ सकते हैं।\n\n⚠️ *सूचना: यह केवल स्वास्थ्य जागरूकता और स्क्रीनिंग सहायता है, आधिकारिक चिकित्सकीय निदान नहीं।*"
          : "Hello! I am your AI Occupational Health Assistant (powered by Mistral AI). Ask me anything about silica dust protection, interpreting screening risk scores, or medical guidelines.\n\n⚠️ *Notice: This is screening and clinical decision support, not a definitive diagnosis.*",
      sources: ["National Programme for Control of Pneumoconiosis (NPCP)"],
      model: "mistral-small-2603",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync with global language if changed
  useEffect(() => {
    if (globalLang) setLang(globalLang);
  }, [globalLang]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === "hi" ? "hi-IN" : "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === "hi" ? "आपका ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता।" : "Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-US";
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-To-Speech reader
  const speakMessage = (text, idx) => {
    if (!window.speechSynthesis) return;

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting characters for clean speech
    const cleanText = text.replace(/[*#_`>]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIdx(null);
    setMessages([
      {
        role: "assistant",
        content:
          lang === "hi"
            ? "वार्तालाप रीसेट कर दिया गया है। आप मुझसे सिलिकोसिस, सुरक्षा नियम या जांच स्कोर के बारे में कोई भी प्रश्न पूछ सकते हैं।"
            : "Conversation cleared. How can I assist you with occupational health guidelines and silica safety today?",
        sources: ["NPCP Guidelines"],
        model: "mistral-small-2603",
      },
    ]);
  };

  const suggestedQueries =
    lang === "hi"
      ? [
          "सिलिकोसिस के मुख्य लक्षण क्या हैं?",
          "खदान में N95 मास्क क्यों पहनना चाहिए?",
          "उच्च स्क्रीनिंग स्कोर आने पर क्या करें?",
          "बलगम में खून आने पर क्या कदम उठाएं?",
        ]
      : [
          "What are the early symptoms of silicosis?",
          "Why is N95 respirator mandatory in stone crushing?",
          "What to do if my screening risk is HIGH?",
          "How to rule out Silico-TB coinfection?",
        ];

  const handleSend = async (customQuery) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: "user", content: textToSend };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!customQuery) setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/ai/chat", {
        message: textToSend,
        mode,
        language: lang,
        history: updatedHistory.slice(-6).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      });

      if (res.data?.success) {
        const aiData = res.data.data;
        setMessages([
          ...updatedHistory,
          {
            role: "assistant",
            content: aiData.reply || "Information retrieved from guidelines.",
            sources: aiData.sources || ["NPCP Guidelines"],
            model: aiData.model || "mistral-small-2603",
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content:
            "Silica exposure leads to chronic pulmonary fibrosis. Always wear certified N95 respirators and ensure wet dust suppression. Consult a physician for formal clinical evaluation.",
          sources: ["DGMS Safety Standard"],
          model: "mistral-small-2603",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 active:scale-95 cursor-pointer border border-indigo-400/30"
          aria-label="Open AI Health Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold block leading-tight">AI Health Assistant</span>
            <span className="text-[10px] text-indigo-200 block font-mono">Mistral Small</span>
          </div>
        </button>
      )}

      {/* Expandable Chat Dialog Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "w-[92vw] sm:w-[650px] h-[85vh] max-h-[800px]"
              : "w-[92vw] sm:w-[420px] h-[580px] max-h-[90vh]"
          }`}
        >
          {/* Header Bar */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-white">AI Health Assistant</h3>
                  <span className="text-[9px] font-mono bg-indigo-500/30 text-indigo-200 px-1.5 py-0.2 rounded border border-indigo-400/20">
                    mistral-small-2603
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {lang === "hi" ? "व्यावसायिक श्वसन स्वास्थ्य परामर्श" : "Occupational Lung Safety & RAG"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switch */}
              <button
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Toggle Language (English / Hindi)"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px]">{lang === "en" ? "हिन्दी" : "EN"}</span>
              </button>

              {/* Reset History */}
              <button
                onClick={clearChat}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Expand / Minimize */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition hidden sm:block"
                title={isExpanded ? "Restore Size" : "Expand Window"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-red-500/20 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector Sub-bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-indigo-600" />
              Mode:
            </span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                onClick={() => setMode("WORKER")}
                className={`px-2.5 py-0.5 rounded-md transition ${
                  mode === "WORKER" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Worker Safety
              </button>
              <button
                onClick={() => setMode("DOCTOR")}
                className={`px-2.5 py-0.5 rounded-md transition ${
                  mode === "DOCTOR" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Doctor / Clinical
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAi
                        ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                        : "bg-indigo-600 text-white rounded-tr-none shadow-xs font-medium"
                    }`}
                  >
                    <div className="prose prose-xs max-w-none prose-p:my-1 prose-headings:my-1.5 prose-strong:text-slate-900 prose-ul:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {isAi && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                        {/* Guideline Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span className="font-semibold">{msg.sources[0]}</span>
                          </div>
                        )}

                        {/* Action Buttons: TTS & Copy */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => speakMessage(msg.content, idx)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition"
                            title={speakingIdx === idx ? "Stop Audio" : "Read Aloud"}
                          >
                            {speakingIdx === idx ? (
                              <VolumeX className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition"
                            title="Copy Response"
                          >
                            {copiedIdx === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span className="text-[11px] font-semibold text-slate-600">
                  {lang === "hi" ? "Mistral AI दिशानिर्देशों का विश्लेषण कर रहा है..." : "Mistral AI evaluating medical guidelines..."}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Suggested Query Chips */}
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-500 shrink-0 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 text-[10px] shrink-0 font-medium transition active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice Input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={
                lang === "hi"
                  ? "सिलिकोसिस या स्वास्थ्य सुरक्षा के बारे में पूछें..."
                  : "Ask regarding silica safety, masks or report..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-600 transition placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
