import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  PlusCircle,
  Video,
  MessageSquare,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useStore } from "../zustand/store";
import axios from "../services/axios";
import SidebarLayout from "../components/SidebarLayout";
import OfflineBanner from "../components/OfflineBanner";
import RiskBadge from "../components/RiskBadge";

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  const [screenings, setScreenings] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [screeningsRes, referralsRes] = await Promise.all([
        axios.get("/api/screenings"),
        axios.get("/api/referrals"),
      ]);

      if (screeningsRes.data?.success) {
        setScreenings(screeningsRes.data.data || []);
      }
      if (referralsRes.data?.success) {
        setReferrals(referralsRes.data.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const latestScreening = screenings[0] || null;
  const currentRisk = latestScreening?.riskAssessmentId?.overallRiskLevel || "LOW";
  const currentScore = latestScreening?.riskAssessmentId?.overallScore || 15;

  return (
    <SidebarLayout>
      <OfflineBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isHindi ? "व्यावसायिक फेफड़ा स्वास्थ्य निगरानी" : "Active Occupational Surveillance"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {isHindi ? `नमस्ते, ${user?.name || "श्रमिक"}` : `Welcome, ${user?.name || "Worker"}`} 👋
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                {isHindi
                  ? "अपनी नियमित श्वसन जांच पूरी करें, जोखिम स्तर ट्रैक करें और चिकित्सकों से संपर्क में रहें।"
                  : "Track your respiratory health index, start new screenings, and access telemedicine consultations."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 border border-amber-300/40"
                >
                  <Shield className="w-4 h-4 fill-slate-950" />
                  {isHindi ? "एडमिन पैनल" : "Admin Panel"}
                </button>
              )}

              <button
                onClick={() => navigate("/screening/start")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                {isHindi ? "नई जांच शुरू करें" : "Start New Screening"}
              </button>

              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition"
              >
                <Bot className="w-4 h-4 text-indigo-300" />
                {isHindi ? "AI सहायक" : "AI Assistant"}
              </button>
            </div>
          </div>
        </div>

        {/* ADMIN / SUPER ADMIN DEDICATED ADMIN PANEL OPTION BANNER */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/40 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono tracking-wider uppercase">
                      {user?.role === "SUPER_ADMIN" ? "Super Admin Access" : "Admin Governance"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {isHindi ? "स्वास्थ्यकोश एडमिन पैनल" : "SwasthaKosh Admin Panel"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    {isHindi
                      ? "उपयोगकर्ता भूमिकाएं प्रबंधित करें, डॉक्टर क्रेडेंशियल अनुरोधों की समीक्षा करें, और प्लेटफ़ॉर्म एनालिटिक्स देखें।"
                      : "Access workforce governance, review medical credential applications, manage dynamic forms, and monitor platform audit logs."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition active:scale-95 shrink-0"
              >
                <Shield className="w-5 h-5 fill-slate-950" />
                <span>{isHindi ? "एडमिन पैनल में जाएं" : "Go to Admin Panel"}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Health Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Current Risk Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              {isHindi ? "वर्तमान स्क्रीनिंग जोखिम" : "Current Screening Risk"}
            </span>
            <div className="flex items-center justify-between">
              <RiskBadge level={currentRisk} score={currentScore} size="md" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              {latestScreening
                ? `Last evaluated: ${new Date(latestScreening.createdAt).toLocaleDateString()}`
                : "No screening records yet"}
            </p>
          </div>

          {/* Telemedicine Access */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              {isHindi ? "टेलीकंसल्टेशन डॉक्टर" : "Telemedicine Consult"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">Dr. On Call</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <Link
              to="/call/telemed-lobby"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-3"
            >
              <span>{isHindi ? "वीडियो कॉल शुरू करें" : "Join Consultation"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Referrals Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              {isHindi ? "अस्पताल रेफरल स्लिप" : "Referral Center"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">
                {referrals.length > 0 ? `${referrals.length} Active` : "None"}
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <Link
              to="/referrals"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-3"
            >
              <span>{isHindi ? "रेफरल विवरण देखें" : "View Facilities"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Realtime Chat */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              {isHindi ? "चिकित्सक चैट" : "Medical Chat"}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">Messages</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <Link
              to="/chat"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-3"
            >
              <span>{isHindi ? "चैट रूम खोलें" : "Open Chat Room"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Screening History & Longitudinal Records */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isHindi ? "श्वसन स्क्रीनिंग इतिहास" : "Screening & Longitudinal Records"}
              </h2>
              <p className="text-xs text-slate-500">
                {isHindi
                  ? "समय के साथ आपके फेफड़ों की क्षमता एवं जोखिम स्कोर में बदलाव"
                  : "Track changes in risk score and clinical signals over time"}
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading screening records...</div>
          ) : screenings.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-semibold text-sm text-slate-800">No Screening History Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Complete a guided 5-minute respiratory questionnaire to generate your baseline risk profile.
              </p>
              <button
                onClick={() => navigate("/screening/start")}
                className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                Start First Screening
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Screening ID</th>
                    <th className="py-3 px-4">Worker / Subject</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Signals / Recommendation</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {screenings.map((scr) => (
                    <tr key={scr._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {scr.screeningCode || scr._id.slice(-6)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {scr.workerId?.name || user?.name || "Worker"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {scr.workerId?.workerCode || "WRK-MINE"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(scr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge
                          level={scr.riskAssessmentId?.overallRiskLevel || "LOW"}
                          score={scr.riskAssessmentId?.overallScore}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {scr.riskAssessmentId?.recommendation || "Evaluation recorded"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/screening/${scr._id}/result`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-lg border border-slate-200 hover:border-indigo-300 transition"
                        >
                          View Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Safety & Prevention Guideline Card */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 sm:p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            {isHindi ? "कार्यस्थल पर सुरक्षा निर्देश" : "Occupational Safety Guidelines"}
          </h3>
          <ul className="text-xs text-slate-700 space-y-1.5">
            <li>• <strong>Certified N95 Respirator:</strong> Always wear a tight-fitting N95 mask in crusher and drilling zones.</li>
            <li>• <strong>Wet Drilling:</strong> Ensure continuous water spraying to suppress silica dust at source.</li>
            <li>• <strong>Medical Assessment:</strong> If you experience cough lasting &gt; 3 weeks, arrange clinical review immediately.</li>
          </ul>
        </div>
      </main>
    </SidebarLayout>
  );
};

export default Dashboard;