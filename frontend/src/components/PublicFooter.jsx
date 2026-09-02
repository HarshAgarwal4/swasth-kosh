import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  Building,
  ExternalLink,
  HeartHandshake,
  FileText,
} from "lucide-react";
import { useStore } from "../zustand/store";

const PublicFooter = () => {
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800">
      {/* Emergency Helpline Banner */}
      <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-600 text-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 animate-bounce" />
            <div>
              <span className="font-bold text-sm">
                {isHindi ? "24x7 सिलिकोसिस एवं श्वसन स्वास्थ्य हेल्पलाइन:" : "24x7 National Occupational Health Helpline:"}
              </span>{" "}
              <span className="font-mono font-extrabold text-amber-100 text-base ml-1">1800-180-6127 / 104</span>
            </div>
          </div>
          <span className="text-xs bg-black/20 px-3 py-1 rounded-full font-semibold">
            {isHindi ? "निःशुल्क सरकारी सहायता व परामर्श" : "Toll-Free Health Guidance & Welfare Assistance"}
          </span>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Swastha<span className="text-indigo-400">Kosh</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              {isHindi
                ? "खनन व पत्थर उद्योग श्रमिकों के लिए एआई-सहायित श्वसन स्क्रीनिंग, स्पाइरोमेट्री विश्लेषण, टेलीमेडिसिन एवं जिला अस्पताल रेफरल का एकीकृत राष्ट्रीय डिजिटल मंच।"
                : "National integrated occupational health platform providing AI multi-factor respiratory risk screening, spirometry airflow assessment, acoustic cough triage, and direct hospital referral for vulnerable workforce."}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Compliant with ILO Geneva & MoHFW Standards</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isHindi ? "प्लेटफॉर्म लिंक्स" : "Platform Navigation"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/screening/start" className="hover:text-indigo-400 transition">
                  {isHindi ? "श्वसन स्क्रीनिंग शुरू करें" : "Start Screening"}
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-indigo-400 transition">
                  {isHindi ? "एआई स्वास्थ्य सहायक" : "AI Assistant (Mistral)"}
                </Link>
              </li>
              <li>
                <Link to="/professionals" className="hover:text-indigo-400 transition">
                  {isHindi ? "डॉक्टर एवं विशेषज्ञ खोजें" : "Find Pulmonologists"}
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="hover:text-indigo-400 transition">
                  {isHindi ? "नामित अस्पताल नेटवर्क" : "Designated Hospitals"}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition">
                  {isHindi ? "पोर्टल लॉगिन" : "Portal Login"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical & Welfare Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isHindi ? "कल्याणकारी नीतियां" : "Policies & Guidelines"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#standards" className="hover:text-indigo-400 transition">
                  ILO Chest Radiograph Standards
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-indigo-400 transition">
                  Rajasthan Silicosis Policy 2019
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-indigo-400 transition">
                  NTEP Silico-TB Guidelines
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-indigo-400 transition">
                  DGMS Mining Health Directives
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-indigo-400 transition">
                  Palanhar & Disability Welfare
                </a>
              </li>
            </ul>
          </div>

          {/* Nodal Centers & Contacts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isHindi ? "नोडल केंद्र व संपर्क" : "Nodal Support"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Jaipur, Jodhpur, Karauli & Mining Clusters, Rajasthan</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>support@swasthakosh.gov.in</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>+91 141-2227181 (Nodal Desk)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-10 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} SwasthaKosh. All rights reserved. Occupational Silicosis Care Initiative.</p>
          <div className="flex items-center gap-6">
            <span>Safety & Clinical Governance</span>
            <span>HIPAA/NDHM Aligned</span>
            <span>Data Encryption Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
