import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ShieldAlert,
  Stethoscope,
  Video,
  FileCheck2,
  Building,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Bot,
} from "lucide-react";
import { useStore } from "../zustand/store";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const language = useStore((state) => state.language);

  const isHindi = language === "hi";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* Emergency Helpline Strip */}
      <div className="bg-red-700 text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2">
        <PhoneCall className="w-4 h-4 animate-bounce" />
        <span>
          {isHindi
            ? "राष्ट्रीय सिलिकोसिस एवं श्वसन स्वास्थ्य हेल्पलाइन: टोल-फ्री 1800-180-6127 (24x7 आपातकालीन सहायता)"
            : "National Pneumoconiosis & Silicosis Health Helpline: Toll-Free 1800-180-6127 (24x7 Support)"}
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-6">
              <Activity className="w-4 h-4 text-indigo-400" />
              {isHindi ? "एआई-सहायित प्रारंभिक श्वसन जांच प्रणाली" : "AI-Assisted Occupational Respiratory Screening"}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {isHindi ? (
                <>
                  खनन व औद्योगिक श्रमिकों के लिए <span className="text-indigo-400">सिलिकोसिस एवं फेफड़ा सुरक्षा</span>
                </>
              ) : (
                <>
                  Early Lung Screening & Telemedicine for <span className="text-indigo-400">Mining & Industrial Workers</span>
                </>
              )}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              {isHindi
                ? "दूरदराज के खदान क्षेत्रों में कम लागत पर फेफड़ों की जांच, स्पाइरोमेट्री विश्लेषण, ऑडियो खांसी की जांच, टेलीमेडिसिन वीडियो परामर्श और डिजिटल अस्पताल रेफरल।"
                : "Low-cost early respiratory screening, multi-factor AI risk stratification, real-time doctor teleconsultation, and digital hospital referral for workers exposed to silica dust."}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => navigate(user ? "/screening/start" : "/signup")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition"
              >
                {isHindi ? "जांच शुरू करें" : "Start Screening Now"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition"
              >
                <Bot className="w-4 h-4 text-indigo-300" />
                {isHindi ? "AI स्वास्थ्य सहायक से पूछें" : "Ask AI Assistant"}
              </button>
            </div>

            {/* Disclaimer pill */}
            <p className="mt-6 text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isHindi
                  ? "यह प्रणाली स्क्रीनिंग एवं निर्णय सहायता के लिए है। यह आधिकारिक चिकित्सकीय निदान नहीं है।"
                  : "Clinical decision support & screening tool. Not an independent medical diagnosis."}
              </span>
            </p>
          </div>

          {/* Screening Card Preview */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-sm">Automated Risk Analysis</h3>
                  <p className="text-xs text-slate-300">Multi-Factor Clinical Signals</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-indigo-500/30 px-2.5 py-1 rounded-md text-indigo-200">
                PFT + Audio + Exposure
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Occupational Dust Exposure</span>
                <span className="text-xs font-semibold text-amber-300">Index: 68/100 (Elevated)</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Spirometric Flow (FEV1/FVC)</span>
                <span className="text-xs font-semibold text-red-300">62.4% (Obstructive Signal)</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Acoustic Audio Analysis</span>
                <span className="text-xs font-semibold text-emerald-300">Wheeze / Crackle Pattern</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Doctor Telemedicine Queue</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Specialists Available Online
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">
            {isHindi ? "व्यापक स्वास्थ्य सुरक्षा मॉड्यूल" : "Comprehensive Occupational Screening Modules"}
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            {isHindi
              ? "श्रमिकों के पंजीकरण से लेकर वीडियो परामर्श और रेफरल तक, पूर्ण डिजिटल समाधान।"
              : "Integrated workflow from field worker screening to doctor telemedicine and certified referral centers."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              {isHindi ? "1. बहु-घटक स्क्रीनिंग" : "1. Multi-Factor Screening"}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              {isHindi
                ? "धूल संपर्क वर्ष, लक्षण प्रश्नावली, स्पाइरोमेट्री फेफड़ा क्षमता और ऑडियो खांसी रिकॉर्डिंग का समग्र विश्लेषण।"
                : "Step-by-step questionnaire capturing years of exposure, mMRC dyspnea grades, PFT indices, and cough audio."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              {isHindi ? "2. डॉक्टर टेलीमेडिसिन" : "2. Doctor Telemedicine"}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              {isHindi
                ? "वेबरटीसी (WebRTC) द्वारा उच्च गुणवत्ता वाला पीयर-टू-पीयर वीडियो परामर्श एवं रीयल-टाइम चैट।"
                : "Peer-to-peer WebRTC video consultations and real-time chat between remote workers and chest physicians."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">
              {isHindi ? "3. डिजिटल रेफरल व अस्पताल" : "3. Digital Referral & Mapping"}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              {isHindi
                ? "उच्च जोखिम श्रमिकों के लिए नजदीकी जिला अस्पताल एवं सिलिकोसिस बोर्ड का डिजिटल रेफरल स्लिप निर्माण।"
                : "Automatic identification of nearest district chest hospitals and digital referral slip generation."}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">SwasthaKosh</span>
            <span>— Occupational Lung Disease Screening & Telemedicine Platform</span>
          </div>
          <p>© 2026 SwasthaKosh. Designed for Mining & Industrial Workforce Health Safety.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;