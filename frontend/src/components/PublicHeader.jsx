import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Globe,
  Menu,
  X,
  ArrowRight,
  Shield,
  Stethoscope,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useStore } from "../zustand/store";
import axios from "../services/axios";
import { toast } from "react-toastify";

const PublicHeader = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHindi = language === "hi";

  const handleLogout = async () => {
    try {
      await axios.get("/logout");
      setUser(null);
      toast.success(isHindi ? "सफलतापूर्वक लॉगआउट किया गया" : "Logged out successfully");
      navigate("/");
    } catch (e) {
      setUser(null);
      navigate("/");
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    if (user.role === "DOCTOR" || user.role === "MEDICAL_OFFICER") return "/doctor/dashboard";
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return "/admin";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition duration-300">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Swastha<span className="text-indigo-400">Kosh</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block -mt-0.5">
                {isHindi ? "सिलिकोसिस एवं श्वसन स्वास्थ्य पोर्टल" : "Occupational Silicosis Health Platform"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition">
              {isHindi ? "विशेषताएं" : "Features"}
            </a>
            <a href="#ai-engine" className="hover:text-white transition flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {isHindi ? "एआई जोखिम विश्लेषण" : "AI Risk Engine"}
            </a>
            <a href="#workflow" className="hover:text-white transition">
              {isHindi ? "कार्यप्रणाली" : "How It Works"}
            </a>
            <a href="#standards" className="hover:text-white transition">
              {isHindi ? "चिकित्सीय मानक" : "Standards"}
            </a>
            <Link to="/ai-assistant" className="hover:text-white transition">
              {isHindi ? "एआई सहायक" : "AI Assistant"}
            </Link>
            <a href="#faq" className="hover:text-white transition">
              {isHindi ? "सामान्य प्रश्न" : "FAQ"}
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(isHindi ? "en" : "hi")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isHindi ? "English" : "हिन्दी"}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition"
                >
                  <span>{isHindi ? "डैशबोर्ड खोलें" : "Go to Dashboard"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  {isHindi ? "लॉग इन" : "Sign In"}
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition"
                >
                  <span>{isHindi ? "रजिस्टर करें" : "Get Started"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLanguage(isHindi ? "en" : "hi")}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 sm:hidden"
            >
              {isHindi ? "EN" : "हिन्दी"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-4 px-2 space-y-3 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-800 transition"
              >
                {isHindi ? "विशेषताएं" : "Features"}
              </a>
              <a
                href="#ai-engine"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {isHindi ? "एआई जोखिम विश्लेषण" : "AI Risk Engine"}
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-800 transition"
              >
                {isHindi ? "कार्यप्रणाली" : "How It Works"}
              </a>
              <a
                href="#standards"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-800 transition"
              >
                {isHindi ? "चिकित्सीय मानक" : "Standards"}
              </a>
              <Link
                to="/ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-800 transition text-indigo-300 font-bold"
              >
                {isHindi ? "एआई स्वास्थ्य सहायक" : "AI Assistant"}
              </Link>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-800 transition"
              >
                {isHindi ? "सामान्य प्रश्न (FAQ)" : "FAQ"}
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                  >
                    {isHindi ? "डैशबोर्ड खोलें" : "Go to Dashboard"} ({user.role})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-slate-800 text-red-400 font-bold text-xs"
                  >
                    {isHindi ? "लॉग आउट" : "Logout"}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700"
                  >
                    {isHindi ? "लॉग इन" : "Sign In"}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                  >
                    {isHindi ? "रजिस्टर करें" : "Get Started"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
