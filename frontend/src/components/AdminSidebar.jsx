import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  Crown,
  Users,
  FileCheck2,
  FormInput,
  Video,
  MessageSquare,
  ShieldAlert,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Globe,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles,
} from "lucide-react";
import { useStore } from "../zustand/store";

const AdminSidebar = ({ children, activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = useStore((state) => state.user);
  const logoutUser = useStore((state) => state.logoutUser);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const isHindi = language === "hi";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-amber-500/20 text-amber-300 border-amber-400/40";
      case "ADMIN":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-400/40";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600/40";
    }
  };

  const adminServices = [
    { id: "OVERVIEW", label: isHindi ? "ओवरव्यू" : "Overview & Vitals", icon: LayoutDashboard, path: "/admin" },
    { id: "USERS", label: isHindi ? "उपयोगकर्ता निर्देशिका" : "User Directory & Roles", icon: Users, path: "/admin" },
    { id: "APPROVALS", label: isHindi ? "भूमिका स्वीकृति" : "Credential Approvals", icon: FileCheck2, path: "/admin" },
    { id: "FORMS", label: isHindi ? "फॉर्म बिल्डर" : "Dynamic Form Builder", icon: FormInput, path: "/admin" },
    { id: "MEETINGS", label: isHindi ? "टेलीमेड ऑडिट" : "Telemed Audit", icon: Video, path: "/admin" },
    { id: "CHATS", label: isHindi ? "चैट लॉग्स" : "Medical Chat Logs", icon: MessageSquare, path: "/admin" },
    { id: "AUDIT", label: isHindi ? "सुरक्षा लॉग्स" : "Security Audit Logs", icon: ShieldAlert, path: "/admin" },
    { id: "ANALYTICS", label: isHindi ? "एनालिटिक्स रिपोर्ट" : "Epidemiology Analytics", icon: BarChart3, path: "/admin/analytics" },
  ];

  const handleServiceClick = (item) => {
    if (item.path === "/admin/analytics" && location.pathname !== "/admin/analytics") {
      navigate("/admin/analytics");
    } else {
      if (location.pathname !== "/admin") {
        navigate("/admin");
      }
      if (setActiveTab) {
        setActiveTab(item.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* ---------------- MOBILE TOPBAR ---------------- */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Shield className="w-5 h-5 fill-slate-950" />
            </div>
            <span className="font-black text-sm tracking-tight text-white">
              SwasthaKosh <span className="text-amber-400">Admin</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(isHindi ? "en" : "hi")}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white flex items-center gap-1 transition"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{isHindi ? "EN" : "हिन्दी"}</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg bg-slate-800 text-indigo-300 text-xs font-bold border border-slate-700"
            title="Switch to Worker View"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------- MOBILE DRAWER BACKDROP ---------------- */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* ---------------- DEDICATED ADMIN SIDEBAR ---------------- */}
      <aside
        className={`fixed lg:sticky top-0 h-screen bg-slate-900 text-slate-100 flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isMobileOpen ? "left-0 w-72" : "-left-72 lg:left-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Admin Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <Shield className="w-6 h-6 fill-slate-950" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-black text-base tracking-tight text-white block">
                  SwasthaKosh
                </span>
                <span className="text-[10px] text-amber-400 font-extrabold tracking-wider uppercase block">
                  Master Admin Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile Card inside Sidebar */}
        <div className={`p-3 border-b border-slate-800/80 bg-slate-950/60 ${isCollapsed ? "text-center" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : "A"}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1 text-left">
                <div className="text-xs font-bold text-white truncate">{currentUser?.name || "System Admin"}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeStyle(
                      currentUser?.role
                    )}`}
                  >
                    {isSuperAdmin ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-amber-400 inline" /> SUPER ADMIN
                      </span>
                    ) : (
                      currentUser?.role || "ADMIN"
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Services Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none">
          <div>
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {isHindi ? "प्रशासनिक सेवाएं" : "Admin Services"}
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 py-0.2 rounded border border-amber-400/30">
                  Master
                </span>
              </div>
            )}
            <div className="space-y-1">
              {adminServices.map((item) => {
                const Icon = item.icon;
                const active =
                  item.id === "ANALYTICS"
                    ? location.pathname === "/admin/analytics"
                    : location.pathname === "/admin" && activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleServiceClick(item)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                      active
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-slate-950" : "text-amber-400"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Navigation to Worker Dashboard */}
          <div>
            {!isCollapsed && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 block mb-2">
                {isHindi ? "त्वरित स्विच" : "Quick Switch"}
              </span>
            )}
            <button
              onClick={() => navigate("/dashboard")}
              title={isCollapsed ? "Worker Dashboard" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40 transition text-left ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="truncate">{isHindi ? "श्रमिक डैशबोर्ड" : "Worker Dashboard View"}</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(isHindi ? "en" : "hi")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span>{isHindi ? "भाषा" : "Language"}</span>
                <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {isHindi ? "हिंदी" : "English"}
                </span>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logoutUser}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{isHindi ? "लॉगआउट" : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN ADMIN CONTENT CONTAINER ---------------- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export default AdminSidebar;
