import React, { useState } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldAlert,
  Globe,
  BookOpen,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
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
          ? "नमस्ते! मैं आपका व्यावसायिक श्वसन स्वास्थ्य AI सहायक हूँ। आप मुझसे सिलिकोसिस, धूल से बचाव, N95 मास्क, स्क्रीनिंग रिपोर्ट या अस्पताल रेफरल के बारे में पूछ सकते हैं।\n\n⚠️ *सूचना: यह जानकारी केवल स्वास्थ्य जागरूकता और स्क्रीनिंग के लिए है, इसे डॉक्टर की आधिकारिक जांच का विकल्प न समझें।*"
          : "Hello! I am your AI Occupational Respiratory Health Assistant. Ask me about silica dust safety, interpreting your screening risk signals, PPE usage, or clinical management guidelines.\n\n⚠️ *Notice: This guidance is for educational and screening purposes only and does not replace a clinical examination by a qualified doctor.*",
      sources: ["National Programme for Control of Pneumoconiosis (NPCP)"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQueries =
    lang === "hi"
      ? [
          "सिलिकोसिस क्या होता है और इससे कैसे बचें?",
          "मेरी स्क्रीनिंग रिपोर्ट में 'उच्च जोखिम' का क्या मतलब है?",
          "खदान में काम करते समय N95 मास्क क्यों जरूरी है?",
          "खांसी और सांस फूलने पर क्या प्राथमिक कदम उठाएं?",
        ]
      : [
          "What is silica dust and how does it cause silicosis?",
          "What does my screening risk level mean?",
          "What are the diagnostic criteria for Silico-tuberculosis?",
          "What PPE should miners use to block silica particles?",
        ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { role: "user", content: textToSend }];
    setMessages(newMsgs);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/ai/chat", {
        message: textToSend,
        mode,
        language: lang,
      });

      if (res.data?.success) {
        const aiData = res.data.data;
        setMessages([
          ...newMsgs,
          {
            role: "assistant",
            content: aiData.reply || aiData.answer || "Information retrieved from guidelines.",
            sources: aiData.sources || ["NPCP Guidelines"],
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: "assistant",
          content:
            "Silica exposure causes progressive lung fibrosis. Always wear N95 respirators and ensure wet dust suppression at your work site. Consult a medical officer for complete clinical evaluation.",
          sources: ["DGMS Safety Standard"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Header Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 flex items-center gap-2">
                Occupational Health AI Assistant
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  RAG Grounded
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Medical & worker respiratory safety decision support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("WORKER")}
                className={`px-3 py-1 rounded-lg transition ${
                  mode === "WORKER"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Worker Mode
              </button>
              <button
                type="button"
                onClick={() => setMode("DOCTOR")}
                className={`px-3 py-1 rounded-lg transition ${
                  mode === "DOCTOR"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Doctor / Clinical
              </button>
            </div>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === "en" ? "हिंदी" : "English"}</span>
            </button>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden min-h-[480px]">
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                      isAi
                        ? "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                        : "bg-indigo-600 text-white rounded-tr-none shadow-xs font-medium"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {isAi && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 font-medium">
                        <BookOpen className="w-3 h-3 text-indigo-600" />
                        <span>Sources:</span>
                        {msg.sources.map((s, i) => (
                          <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                Retrieving occupational health guidelines...
              </div>
            )}
          </div>

          {/* Suggested Query Chips */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Suggested:
            </span>
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 text-xs shrink-0 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              placeholder={lang === "hi" ? "सिलिकोसिस या स्वास्थ्य सुरक्षा के बारे में पूछें..." : "Ask questions regarding silica safety or screening risk..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-indigo-600 transition"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AiAssistantPage;
