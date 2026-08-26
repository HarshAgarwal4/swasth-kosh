import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldAlert,
  Globe,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  RotateCcw,
  Download,
  Stethoscope,
  Info,
  Layers,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import Navbar from "../components/Navbar";

const AiAssistantPage = () => {
  const user = useStore((state) => state.user);
  const globalLang = useStore((state) => state.language);

  const [mode, setMode] = useState(
    user?.role === "DOCTOR" || user?.role === "MEDICAL_OFFICER" ? "DOCTOR" : "WORKER"
  );
  const [lang, setLang] = useState(globalLang || "en");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        lang === "hi"
          ? "नमस्ते! मैं आपका व्यावसायिक श्वसन स्वास्थ्य AI सहायक हूँ (Mistral AI `mistral-small-2603` द्वारा संचालित)। आप मुझसे सिलिकोसिस, धूल से बचाव, N95 मास्क, स्पाइरोमेट्री रिपोर्ट, या Silico-TB लक्षणों के बारे में पूछ सकते हैं।\n\n⚠️ *सूचना: यह प्रणाली स्क्रीनिंग और क्लीनिकल निर्णय सहायता के लिए है। यह आधिकारिक चिकित्सकीय निदान का विकल्प नहीं है।*"
          : "Hello! I am your AI Occupational Respiratory Health Assistant powered by Mistral AI (`mistral-small-2603`). Ask me about silica dust exposure safety, interpreting screening risk scores, PPE protocols, or clinical decision support.\n\n⚠️ *Notice: This guidance is for screening and decision support only and does not replace a clinical examination by a qualified physician.*",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === "hi" ? "hi-IN" : "en-US";

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
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

  const speakMessage = (text, idx) => {
    if (!window.speechSynthesis) return;

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`>]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
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
            : "Conversation reset. How can I help you regarding respiratory health guidelines today?",
        sources: ["NPCP Guidelines"],
        model: "mistral-small-2603",
      },
    ]);
  };

  const exportConversation = () => {
    const textData = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}\n\n`)
      .join("----------------------------------------\n\n");
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SwasthaKosh_AI_Consultation_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const topicQueries =
    lang === "hi"
      ? [
          { label: "सिलिकोसिस क्या है?", query: "सिलिकोसिस क्या होता है और यह कैसे होता है?" },
          { label: "N95 मास्क नियम", query: "खदान एवं स्टोन क्रशर में कौन सा मास्क पहनना चाहिए?" },
          { label: "उच्च जोखिम पर क्या करें?", query: "मेरी स्क्रीनिंग में उच्च जोखिम (HIGH RISK) आने पर क्या करना चाहिए?" },
          { label: "बलगम में खून (Silico-TB)", query: "खांसी के साथ खून आने पर क्या प्राथमिक कदम उठाएं?" },
          { label: "स्पाइरोमेट्री FEV1/FVC", query: "स्पाइरोमेट्री जांच में FEV1/FVC अनुपात का क्या अर्थ है?" },
        ]
      : [
          { label: "What is Silicosis?", query: "What is crystalline silica dust and how does silicosis develop?" },
          { label: "N95 PPE Guidelines", query: "What respiratory PPE is mandatory for stone crushing and mining?" },
          { label: "High Risk Actions", query: "What are the immediate clinical steps if a worker has HIGH risk score?" },
          { label: "Silico-TB Red Flags", query: "What are the key clinical indicators of Silico-Tuberculosis coinfection?" },
          { label: "PFT Spirometry Ratio", query: "How to interpret FEV1/FVC ratio below 70% in silica-exposed workers?" },
        ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = { role: "user", content: textToSend };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!queryText) setInput("");
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
            content: aiData.reply || "Guideline information retrieved.",
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
            "Silica exposure causes progressive lung fibrosis. Always wear N95 respirators and ensure wet dust suppression at your work site. Consult a medical officer for complete clinical evaluation.",
          sources: ["DGMS Safety Standard"],
          model: "mistral-small-2603",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-4">
        {/* Top Intelligence Banner */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 text-white flex items-center justify-center shadow-md">
              <Bot className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white">
                  {lang === "hi" ? "व्यावसायिक स्वास्थ्य AI सहायक" : "Occupational Health AI Assistant"}
                </h1>
                <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20 font-bold">
                  mistral-small-2603
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === "hi"
                  ? "LangChain + Mistral AI द्वारा संचालित RAG क्लिनिकल निर्णय सहायता"
                  : "LangChain + Mistral AI powered RAG Occupational Decision Support"}
              </p>
            </div>
          </div>

          {/* Controls: Mode, Language, Clear, Export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-white/10 p-1 rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/10">
              <button
                type="button"
                onClick={() => setMode("WORKER")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  mode === "WORKER"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Worker Mode
              </button>
              <button
                type="button"
                onClick={() => setMode("DOCTOR")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  mode === "DOCTOR"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Doctor / Clinical
              </button>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-300" />
              <span>{lang === "en" ? "हिंदी" : "English"}</span>
            </button>

            {/* Clear Chat */}
            <button
              type="button"
              onClick={clearChat}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Export Chat */}
            <button
              type="button"
              onClick={exportConversation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition"
              title="Download Conversation Transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Quick Topic Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {lang === "hi" ? "त्वरित विषय:" : "Quick Topics:"}
          </span>
          {topicQueries.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(t.query)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-medium shrink-0 transition shadow-xs active:scale-95 flex items-center gap-1"
            >
              <span>{t.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden min-h-[520px]">
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl sm:max-w-3xl p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAi
                        ? "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                        : "bg-indigo-600 text-white rounded-tr-none shadow-xs font-medium"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-strong:text-slate-900 prose-ul:my-1.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {isAi && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 font-medium">
                        {/* Guideline Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Sources:</span>
                            {msg.sources.map((s, i) => (
                              <span key={i} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold text-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Read Aloud & Copy */}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => speakMessage(msg.content, idx)}
                            className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-600 hover:text-indigo-600 transition flex items-center gap-1"
                            title={speakingIdx === idx ? "Stop Audio" : "Read Aloud"}
                          >
                            {speakingIdx === idx ? (
                              <>
                                <VolumeX className="w-4 h-4 text-red-600 animate-pulse" />
                                <span className="text-[10px] text-red-600 font-bold">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4" />
                                <span className="text-[10px]">Listen</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-600 hover:text-indigo-600 transition flex items-center gap-1"
                            title="Copy Response"
                          >
                            {copiedIdx === idx ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                <span>
                  {lang === "hi" ? "Mistral AI दिशानिर्देशों से उत्तर तैयार कर रहा है..." : "Mistral AI evaluating occupational guidelines & generating response..."}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white border-t border-slate-200 flex gap-2.5 items-center"
          >
            {/* Voice Dictation */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl border transition ${
                isListening
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice Dictation"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder={
                lang === "hi"
                  ? "सिलिकोसिस, मास्क सुरक्षा या अपनी जांच रिपोर्ट के बारे में पूछें..."
                  : "Ask questions regarding silica safety, masks, spirometry or screening risk..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none focus:border-indigo-600 transition placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AiAssistantPage;
