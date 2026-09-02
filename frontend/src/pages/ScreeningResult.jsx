import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Video,
  MessageSquare,
  Building2,
  PhoneCall,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Download,
  Share2,
} from "lucide-react";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import SidebarLayout from "../components/SidebarLayout";
import RiskBadge from "../components/RiskBadge";

const ScreeningResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  const [screening, setScreening] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScreening = async () => {
      try {
        const res = await axios.get(`/api/screenings/${id}`);
        if (res.data?.success) {
          setScreening(res.data.data);
        }
      } catch (err) {
        console.error("Screening fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScreening();
  }, [id]);

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-16">
          Loading screening risk evaluation...
        </div>
      </SidebarLayout>
    );
  }

  if (!screening) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex items-center justify-center p-6 text-center py-16">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Screening Not Found</h3>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const risk = screening.riskAssessmentId || {};
  const worker = screening.workerId || {};
  const riskLevel = risk.overallRiskLevel || "LOW";
  const overallScore = risk.overallScore || 0;

  return (
    <SidebarLayout>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {isHindi ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
          </button>

          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-lg">
            ID: {screening.screeningCode}
          </span>
        </div>

        {/* Hero Result Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl ${
            riskLevel === "HIGH"
              ? "bg-linear-to-br from-red-900 via-red-950 to-slate-900"
              : riskLevel === "MODERATE"
              ? "bg-linear-to-br from-amber-900 via-amber-950 to-slate-900"
              : "bg-linear-to-br from-emerald-900 via-emerald-950 to-slate-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300 block mb-1">
                {isHindi ? "श्वसन स्क्रीनिंग परिणाम" : "Respiratory Screening Assessment"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
                <span>{riskLevel} RISK</span>
                <span className="text-xl font-normal opacity-80">({overallScore}/100)</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-xl leading-relaxed">
                {isHindi && risk.hindiRecommendation
                  ? risk.hindiRecommendation
                  : risk.recommendation || "Maintain occupational dust surveillance."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 sm:min-w-48">
              <Link
                to={`/call/telemed-${screening._id}`}
                className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition active:scale-95 text-center"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                {isHindi ? "वीडियो परामर्श शुरू करें" : "Book Video Consult"}
              </Link>

              <Link
                to={`/chat`}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition text-center"
              >
                <MessageSquare className="w-4 h-4 text-indigo-300" />
                {isHindi ? "डॉक्टर से चैट करें" : "Talk to Doctor"}
              </Link>

              <Link
                to="/referrals"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition text-center"
              >
                <Building2 className="w-4 h-4 text-amber-300" />
                {isHindi ? "अस्पताल रेफरल देखें" : "View Referral Slip"}
              </Link>
            </div>
          </div>
        </div>

        {/* Multi-Factor Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Occupational Exposure</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {risk.exposureScore ?? 40} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${risk.exposureScore ?? 40}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Symptom Severity</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {risk.symptomScore ?? 35} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${risk.symptomScore ?? 35}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Spirometry Ventilatory</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {risk.spirometryScore ?? 25} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full"
                style={{ width: `${risk.spirometryScore ?? 25}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Acoustic Audio AI</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {risk.audioScore ?? 15} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${risk.audioScore ?? 15}%` }}
              />
            </div>
          </div>
        </div>

        {/* Why? Risk Factors Identified */}
        {risk.riskFactors && risk.riskFactors.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {isHindi ? "पहचाने गए मुख्य जोखिम कारक (Why?)" : "Key Risk Factors Detected"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {risk.riskFactors.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">{item.factor}</span>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5 font-mono">
                      Category: {item.category} | Severity: {item.severity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Medical Disclaimer */}
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5 text-amber-950 text-xs">
          <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Medical Safety & Legal Notice
          </div>
          <p className="leading-relaxed">
            {risk.disclaimer ||
              "This is an AI-assisted occupational screening score and decision support signal. It is NOT a medical diagnosis of silicosis or any respiratory disease. Clinical evaluation by a qualified medical officer is required."}
          </p>
        </div>
      </main>
    </SidebarLayout>
  );
};

export default ScreeningResult;
