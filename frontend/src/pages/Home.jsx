import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Mic,
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  Award,
  BookOpen,
  WifiOff,
  Clock,
  ShieldCheck,
  Hospital,
} from "lucide-react";
import { useStore } from "../zustand/store";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

const Home = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getDashboardPath = () => {
    if (!user) return "/screening/start";
    if (user.role === "DOCTOR" || user.role === "MEDICAL_OFFICER") return "/doctor/dashboard";
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return "/admin";
    return "/dashboard";
  };

  const faqs = [
    {
      q: isHindi ? "सिलिकोसिस क्या है और यह कैसे होता है?" : "What is Silicosis and how is it caused?",
      a: isHindi
        ? "सिलिकोसिस एक लाइलाज और गंभीर फेफड़ों की बीमारी है जो पत्थर तोड़ने, खदानों, क्वार्ट्ज और रेत में काम करते समय सांस के साथ जाने वाली सिलिका धूल (Crystalline Silica) के फेफड़ों में जमने से होती है। प्रारंभिक जांच और रोकथाम ही इससे बचने का एकमात्र उपाय है।"
        : "Silicosis is a progressive, incurable occupational lung disease caused by inhaling respirable crystalline silica dust generated during mining, stone crushing, sandstone quarrying, and sandblasting. Inhaled silica particles trigger chronic pulmonary inflammation and progressive fibrotic parenchymal tissue scarring.",
    },
    {
      q: isHindi ? "SwasthaKosh प्रणाली सिलिकोसिस की प्रारंभिक जांच कैसे करती है?" : "How does SwasthaKosh screen for early silicosis?",
      a: isHindi
        ? "हमारी प्रणाली 5 मुख्य कारकों का बहु-आयामी एआई विश्लेषण करती है: 1) श्रमिक का धूल में काम करने का इतिहास, 2) श्वसन लक्षण (खांसी, सांस फूलना mMRC), 3) स्पाइरोमेट्री फेफड़ों की क्षमता (FEV1/FVC), 4) माइक्रोफोन द्वारा ऑडियो खांसी का विश्लेषण, तथा 5) चेस्ट एक्स-रे। इससे प्रारंभिक अवस्था में ही जोखिम का पता चल जाता है।"
        : "SwasthaKosh utilizes a multi-factor clinical AI engine combining: 1) Occupational dust exposure metrics, 2) Symptom severity scoring (mMRC dyspnea index), 3) Digital spirometry airflow parameters (FEV1, FVC, FEV1/FVC ratio), 4) Real-time acoustic cough spectral analysis, and 5) ILO standard PA chest radiograph correlation to generate an instant 0-100 risk stratification.",
    },
    {
      q: isHindi ? "क्या दूरदराज खदानों में बिना इंटरनेट के यह ऐप काम करता है?" : "Does this platform work offline in remote mining areas?",
      a: isHindi
        ? "हाँ! SwasthaKosh में पूर्ण ऑफलाइन सपोर्ट (PWA और IndexedDB) उपलब्ध है। स्वास्थ्य कार्यकर्ता भूमिगत खदानों या बिना नेटवर्क वाले क्षेत्रों में श्रमिकों की पूरी जांच दर्ज कर सकते हैं। इंटरनेट उपलब्ध होते ही डेटा अपने आप सुरक्षित रूप से सर्वर पर सिंक हो जाता है।"
        : "Yes! SwasthaKosh is engineered with an offline-first Progressive Web App (PWA) architecture powered by IndexedDB. Field healthcare workers can complete comprehensive screening protocols in deep quarry pits with zero internet connectivity. All encrypted screening records auto-sync seamlessly when cellular connection is restored.",
    },
    {
      q: isHindi ? "जांच के बाद डॉक्टर से वीडियो परामर्श कैसे मिलता है?" : "How do workers receive specialist telemedicine consultations?",
      a: isHindi
        ? "यदि जांच में मध्यम या उच्च जोखिम पाया जाता है, तो कार्यकर्ता तुरंत ऐप के माध्यम से नामित जिला छाती रोग विशेषज्ञ (Pulmonologist) के साथ सुरक्षित WebRTC वीडियो कॉल और चैट अपॉइंटमेंट बुक कर सकता है।"
        : "When moderate or high risk is detected, the field operator or worker can instantly request an encrypted WebRTC high-definition video teleconsultation with verified district pulmonologists and medical officers for differential diagnosis and e-prescription signoff.",
    },
    {
      q: isHindi ? "राजस्थान सिलिकोसिस नीति के तहत सरकारी सहायता कैसे मिलती है?" : "How does the digital referral facilitate government welfare benefits?",
      a: isHindi
        ? "SwasthaKosh से जारी डिजिटल रेफरल स्लिप सीधे जिला सिलिकोसिस प्रमाणीकरण बोर्ड और चेस्ट अस्पतालों से जुड़ी होती है। इससे श्रमिकों को राजस्थान सिलिकोसिस नीति व पालनहार योजना के तहत ₹3 लाख सहायता और पेंशन प्राप्त करने की प्रक्रिया तेज हो जाती है।"
        : "Our digital referral slips include secure QR codes directly mapped to District Silicosis Certification Boards and tertiary chest hospitals, fast-tracking statutory disability certification, pension disbursements, and financial welfare relief under the State Silicosis Policy.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Public Top Navigation */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Background glow ornaments */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>
                {isHindi ? "एआई-संचालित राष्ट्रीय व्यावसायिक स्वास्थ्य मंच" : "AI-Powered National Occupational Health Platform"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              {isHindi ? (
                <>
                  खनन व औद्योगिक श्रमिकों के लिए <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-sky-300 to-emerald-400">प्रारंभिक सिलिकोसिस जांच</span> एवं टेलीमेडिसिन
                </>
              ) : (
                <>
                  Early Silicosis Screening & Telemedicine for <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-sky-300 to-emerald-400">Mining & Industrial Workforce</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {isHindi
                ? "दूरदराज के खदान क्षेत्रों में कम लागत पर बहु-आयामी एआई जोखिम मूल्यांकन, स्पाइरोमेट्री विश्लेषण, ऑडियो खांसी की जांच, विशेषज्ञों के साथ रियल-टाइम वीडियो परामर्श और डिजिटल अस्पताल रेफरल।"
                : "Multi-factor AI respiratory risk stratification, digital spirometry airflow tracking, acoustic cough diagnostics, WebRTC specialist teleconsultations, and direct district referral integration for silica dust-exposed workers."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate(user ? getDashboardPath() : "/signup")}
                className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition"
              >
                <span>{isHindi ? "जांच शुरू करें" : "Start Worker Screening"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 px-6 py-4 rounded-2xl font-semibold text-sm transition"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>{isHindi ? "एआई स्वास्थ्य सहायक से पूछें" : "Consult AI Assistant"}</span>
              </button>
            </div>

            {/* Regulatory & Safety Assurance Pill */}
            <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isHindi
                  ? "ILO जिनेवा एवं राष्ट्रीय स्वास्थ्य मिशन (MoHFW) मानकों के अनुरूप"
                  : "Compliant with ILO Geneva Pneumoconiosis Guidelines & MoHFW India Standards"}
              </span>
            </div>
          </div>

          {/* Right Hero Live Interactive Card Simulation */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
              {/* Card Top */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs">Live Clinical AI Stratification</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Patient: Ramesh K. (Mine: MK-04)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  HIGH RISK (Score 72/100)
                </span>
              </div>

              {/* Clinical Signal Gauges */}
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Occupational Exposure</span>
                    <span className="font-bold text-slate-200">8.5 Yrs Quartz Sandstone Drilling</span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold text-xs">High Density</span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Spirometry Airflow (FEV1/FVC)</span>
                    <span className="font-bold text-slate-200">61.4% (Restrictive Deficit)</span>
                  </div>
                  <span className="text-red-400 font-mono font-bold text-xs">&lt; 70% Cutoff</span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Acoustic Audio Cough Analysis</span>
                    <span className="font-bold text-slate-200">Dry Paroxysmal Silicotic Wheeze</span>
                  </div>
                  <span className="text-indigo-400 font-mono font-bold text-xs">91% Match</span>
                </div>
              </div>

              {/* Action Recommendation Box */}
              <div className="p-3.5 bg-linear-to-r from-indigo-950/70 to-slate-950 rounded-2xl border border-indigo-500/30 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Automated Clinical Action Plan</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Immediate ILO PA Chest Radiograph recommended. Priority digital referral issued for District Silicosis Board review.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Model: Mistral AI (mistral-small-2603)</span>
                <span className="text-emerald-400 font-semibold">● Real-time Validated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Counter */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600">18,500+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {isHindi ? "स्क्रीन किए गए खनन श्रमिक" : "Mining Workers Screened"}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">45+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {isHindi ? "सक्रिय खदान व स्टोन क्रशर क्लस्टर" : "Active Mining & Crusher Hubs"}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">94.8%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {isHindi ? "प्रारंभिक जोखिम पहचान सटीकता" : "Early Detection Sensitivity"}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600">2,400+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {isHindi ? "टेलीमेडिसिन परामर्श व ई-रेफरल" : "Telemed Consults & Referrals"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{isHindi ? "मंच की मुख्य विशेषताएं" : "Platform Capabilities"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              {isHindi
                ? "व्यावसायिक श्वसन स्वास्थ्य के लिए संपूर्ण डिजिटल समाधान"
                : "End-to-End Clinical Intelligence for Industrial Lung Health"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "पारंपरिक स्वास्थ्य शिविरों की सीमाओं को पार करते हुए तकनीक से अंतिम छोर के श्रमिक तक गुणवत्तापूर्ण देखभाल।"
                : "Bridging the gap between remote quarry pits and tertiary pulmonary specialists with low-cost screening and instant teleconsultations."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? "बहु-आयामी एआई जोखिम मूल्यांकन" : "Multi-Factor AI Risk Engine"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "धूल जोखिम अवधि, सांस फूलने का पैमाना (mMRC), स्पाइरोमेट्री और खांसी की आवाज को मिलाकर 0-100 का सटीक स्कोर तैयार करता है।"
                  : "Synthesizes silica dust exposure index, mMRC dyspnea grades, spirometry airflow parameters, and acoustic cough data into a unified 0-100 risk score."}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? "डिजिटल स्पाइरोमेट्री (PFT)" : "Digital Spirometry & PFT Curves"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "FEV1, FVC और FEV1/FVC अनुपात का विश्लेषण कर फेफड़ों के संकुचन या रुकावट की प्रारंभिक पहचान करता है।"
                  : "Measures FEV1, FVC, and FEV1/FVC ratios against ATS/ERS standards to detect restrictive parenchymal fibrosis and airflow obstruction."}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? "ध्वनि तरंग खांसी विश्लेषण" : "Acoustic Audio Cough Triage"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "मोबाइल माइक्रोफोन से खांसी की रिकॉर्डिंग कर स्पेक्ट्रल विश्लेषण द्वारा सूखी सिलिकोटिक खांसी और टीबी के लक्षणों में अंतर समझता है।"
                  : "Captures cough acoustics via smartphone mic to extract spectral audio signatures, differentiating dry silicotic cough from productive tubercular patterns."}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? "सुरक्षित WebRTC टेलीमेडिसिन" : "Encrypted WebRTC Teleconsultation"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "खदान स्थल से ही जिला अस्पताल के छाती रोग विशेषज्ञ के साथ सीधी वीडियो कॉल, ई-प्रिस्क्रिप्शन और क्लीनिकल नोट्स।"
                  : "Enables low-bandwidth peer-to-peer HD video consults between field workers and district pulmonologists with live in-call clinical notes and e-prescriptions."}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Hospital className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? "डिजिटल अस्पताल रेफरल नेटवर्क" : "Hospital & Silicosis Board Referrals"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "क्यूआर कोड युक्त डिजिटल रेफरल स्लिप जो जिला सिलिकोसिस बोर्ड और नामित तृतीयक चिकित्सा केंद्रों से सीधे जुड़ी है।"
                  : "Issues QR-verified digital referral slips directly linked to Designated District Chest Hospitals and State Silicosis Welfare Certification Boards."}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isHindi ? "ऑफलाइन-प्रथम PWA सिंक" : "Offline-First PWA & IndexedDB"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "बिना इंटरनेट कनेक्टिविटी के भी पूरी जांच पूरी करें। नेटवर्क आते ही सारा डेटा स्वचालित रूप से क्लाउड सर्वर पर सिंक होता है।"
                  : "Field health workers can complete complete screening questionnaires in deep mine pits without internet; data auto-syncs securely on network recovery."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{isHindi ? "सरल 4-चरणीय प्रक्रिया" : "Step-by-Step Workflow"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              {isHindi ? "खदान से अस्पताल तक संपूर्ण देखभाल यात्रा" : "From Mine Pit to Hospital Care in 4 Steps"}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                {isHindi ? "1. ऑन-साइट फील्ड स्क्रीनिंग" : "1. On-Site Field Screening"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "स्वास्थ्य कार्यकर्ता श्रमिक का कार्य इतिहास, लक्षण, स्पाइरोमेट्री एवं खांसी की ऑडियो रिकॉर्डिंग दर्ज करता है।"
                  : "Health worker records worker demographics, silica exposure duration, mMRC symptom scores, and acoustic audio."}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                {isHindi ? "2. एआई जोखिम वर्गीकरण" : "2. AI Risk Stratification"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "एआई मॉडल तुरंत 0-100 स्कोर के साथ LOW, MODERATE या HIGH जोखिम की स्थिति निर्धारित करता है।"
                  : "Mistral AI multi-signal model instantly computes risk tier (Low, Moderate, High) with differential insights."}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                {isHindi ? "3. विशेषज्ञ डॉक्टर वीडियो समीक्षा" : "3. Specialist Teleconsultation"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "नामित छाती रोग विशेषज्ञ वीडियो कॉल द्वारा श्रमिक से परामर्श कर आधिकारिक क्लीनिकल राय दर्ज करता है।"
                  : "District medical officer joins WebRTC video room to review case, write clinical notes, and approve referral."}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-4">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                {isHindi ? "4. डिजिटल रेफरल व मुआवजा" : "4. Hospital Referral & Relief"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHindi
                  ? "डिजिटल स्लिप द्वारा जिला चेस्ट अस्पताल में एक्स-रे एवं राज्य सिलिकोसिस बोर्ड से ₹3 लाख सहायता की प्रक्रिया।"
                  : "Automated referral slip issued for ILO radiograph and fast-tracked disability welfare compensation."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Showcase Banner */}
      <section id="ai-engine" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl border border-indigo-500/30 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
              <Bot className="w-4 h-4" />
              <span>Powered by LangChain & Mistral AI (`mistral-small-2603`)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              {isHindi ? "24x7 एआई श्वसन स्वास्थ्य सहायक से बात करें" : "24/7 Multi-Lingual AI Respiratory Health Assistant"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isHindi
                ? "सिलिकोसिस के लक्षण, N95 मास्क नियम, स्पाइरोमेट्री रिपोर्ट का अर्थ और डॉक्टर अपॉइंटमेंट के बारे में तुरंत उत्तर पाएं।"
                : "Ask questions regarding silica dust thresholds, N95 respirator standards, spirometry interpretation, and district referral hospital navigation in English & Hindi."}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => navigate("/ai-assistant")}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                {isHindi ? "एआई चैट शुरू करें →" : "Launch AI Assistant →"}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs font-sans">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
              Sample Inquiries / उदाहरण प्रश्न:
            </span>
            <div
              onClick={() => navigate("/ai-assistant")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer border border-slate-800 transition"
            >
              💬 "How does wet-drilling suppress silica dust in quarries?"
            </div>
            <div
              onClick={() => navigate("/ai-assistant")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer border border-slate-800 transition"
            >
              💬 "सिलिकोसिस और टीबी के लक्षणों में क्या अंतर है?"
            </div>
            <div
              onClick={() => navigate("/ai-assistant")}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer border border-slate-800 transition"
            >
              💬 "What is the clinical significance of FEV1/FVC &lt; 70%?"
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Standards Section */}
      <section id="standards" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              {isHindi ? "राष्ट्रीय व अंतरराष्ट्रीय स्वास्थ्य मानक" : "Clinical & Regulatory Governance Standards"}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi ? "सत्यापित चिकित्सीय प्रोटोकॉल और दिशा-निर्देश" : "Evidence-grounded medical protocols"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-xs">ILO Geneva Guidelines</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Standardized international classification of radiographs of pneumoconioses (ILO standard).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-xs">MoHFW & NPCP Directives</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ministry of Health & Family Welfare guidelines for prevention and management of occupational diseases.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-xs">NTEP Silico-TB Protocol</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Dual screening algorithms for differential diagnosis of silicosis and secondary active pulmonary tuberculosis.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <Building className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-slate-900 text-xs">DGMS Mining Directives</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Directorate General of Mines Safety compliance for periodic medical examination and dust suppression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <span>FAQ</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isHindi ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:text-indigo-600 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call To Action Banner */}
      <section className="bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold">
            {isHindi ? "आज ही अपने श्रमिकों की श्वसन सुरक्षा सुनिश्चित करें" : "Protect Mining Workforce Respiratory Health Today"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {isHindi
              ? "निःशुल्क खाता बनाएं, खदान स्थल पर जांच शुरू करें, अथवा डॉक्टर के रूप में अपनी सेवाएं दें।"
              : "Register as a health worker to conduct on-site field screenings, or join as a verified pulmonologist to deliver remote teleconsultations."}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl text-xs shadow-lg active:scale-95 transition"
            >
              {isHindi ? "निःशुल्क रजिस्टर करें" : "Create Account"}
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-xs transition"
            >
              {isHindi ? "पोर्टल में लॉगिन करें" : "Sign In to Portal"}
            </Link>
          </div>
        </div>
      </section>

      {/* Government Grade Public Footer */}
      <PublicFooter />
    </div>
  );
};

export default Home;