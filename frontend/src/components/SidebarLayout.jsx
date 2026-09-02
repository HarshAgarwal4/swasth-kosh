import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  User,
  LogOut,
  Bell,
  MessageSquare,
  Video,
  Shield,
  FileText,
  Stethoscope,
  Building2,
  BarChart3,
  Bot,
  Globe,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Lock,
} from "lucide-react";
import { useStore } from "../zustand/store";
import axios from "../services/axios";
import RoleRequestModal from "./RoleRequestModal";

export const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useStore((state) => state.user);
  const logoutUser = useStore((state) => state.logoutUser);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const notifications = useStore((state) => state.notifications);
  const unreadCount = useStore((state) => state.unreadNotificationsCount);
  const fetchNotifications = useStore((state) => state.fetchNotifications);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const role = user?.role || "WORKER";
  const isDoctor = role === "DOCTOR" || role === "MEDICAL_OFFICER";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isHindi = language === "hi";

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleNotificationClick = async (notif) => {
    try {
      await axios.patch(`/api/notifications/${notif._id}/read`);
      await fetchNotifications();
    } catch (e) {}
    setShowNotifications(false);
  };

  // Navigation Items
  const coreLinks = [
    { label: isHindi ? "डैशबोर्ड" : "Dashboard", path: "/dashboard", icon: Activity },
    { label: isHindi ? "श्वसन स्क्रीनिंग" : "Lung Screening", path: "/screening/start", icon: FileText },
    ...(!isDoctor && !isAdmin
      ? [{ label: isHindi ? "डॉक्टर खोजें" : "Find Doctors", path: "/find-doctors", icon: Stethoscope }]
      : []),
    { label: isHindi ? "परामर्श अपॉइंटमेंट" : "Consultations", path: "/appointments", icon: Video },
    ...(isDoctor
      ? [{ label: isHindi ? "डॉक्टर पोर्टल" : "Doctor Portal", path: "/doctor/dashboard", icon: Stethoscope }]
      : []),
    { label: isHindi ? "चिकित्सक चैट" : "Medical Chat", path: "/chat", icon: MessageSquare },
    { label: isHindi ? "अस्पताल रेफरल" : "Referral Centers", path: "/referrals", icon: Building2 },
  ];

  const aiLinks = [
    {
      label: isHindi ? "AI स्वास्थ्य सहायक" : "AI Health Assistant",
      path: "/ai-assistant",
      icon: Bot,
      highlight: true,
      badge: "Mistral AI",
    },
  ];

  // ONLY visible for ADMIN and SUPER_ADMIN (Single option: Admin Panel)
  const adminLinks = isAdmin
    ? [
        { label: isHindi ? "एडमिन पैनल" : "Admin Panel", path: "/admin", icon: Shield },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      {/* ---------------- MOBILE TOPBAR (Visible on < lg) ---------------- */}
      <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              SwasthaKosh
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(isHindi ? "en" : "hi")}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white flex items-center gap-1 transition"
          >
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>{isHindi ? "EN" : "हिन्दी"}</span>
          </button>

          {/* Notifications */}
          {user && (
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-white rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Avatar */}
          {user ? (
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-xs font-bold px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* ---------------- MOBILE DRAWER BACKDROP ---------------- */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* ---------------- SIDEBAR (Desktop & Mobile Drawer) ---------------- */}
      <aside
        className={`fixed lg:sticky top-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isMobileOpen ? "left-0 w-72" : "-left-72 lg:left-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-base tracking-tight text-white block">
                  SwasthaKosh
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase block">
                  Occupational Lung Care
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close for Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        {user ? (
          <div className={`p-3 border-b border-slate-800/80 bg-slate-950/40 ${isCollapsed ? "text-center" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden flex-1 text-left">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 uppercase">
                      {role.replace("_", " ")}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role elevation request button for workers */}
            {!isCollapsed && role === "WORKER" && (
              <button
                onClick={() => setShowRoleModal(true)}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[11px] font-bold rounded-lg transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Apply for Doctor / Staff Role</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 border-b border-slate-800">
            {!isCollapsed ? (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex-1 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Register
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg"
                title="Login"
              >
                In
              </button>
            )}
          </div>
        )}

        {/* Navigation Links Scroll Area */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none">
          {/* 1. Core Health Services */}
          <div>
            {!isCollapsed && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 block mb-2">
                {isHindi ? "स्वास्थ्य सेवाएं" : "Health Services"}
              </span>
            )}
            <div className="space-y-1">
              {coreLinks.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. AI Intelligence */}
          <div>
            {!isCollapsed && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 block mb-2">
                {isHindi ? "एआई व निर्णय सहायता" : "AI Intelligence"}
              </span>
            )}
            <div className="space-y-1">
              {aiLinks.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-mono font-bold bg-indigo-500/30 text-indigo-200 px-1.5 py-0.2 rounded border border-indigo-400/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. Administration (ONLY visible for ADMIN & SUPER_ADMIN) */}
          {isAdmin && adminLinks.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {isHindi ? "प्रशासन" : "Administration"}
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 py-0.2 rounded border border-amber-400/30">
                    Restricted
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        active
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                          : "text-amber-200/80 hover:text-white hover:bg-slate-800/80"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-amber-400" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
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
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 flex justify-between items-center">
                <span>{isHindi ? "भाषा" : "Language"}</span>
                <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {isHindi ? "हिंदी" : "English"}
                </span>
              </div>
            )}
          </button>

          {/* Notifications Button */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
                title="Notifications"
              >
                <div className="relative shrink-0">
                  <Bell className="w-4 h-4 text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 flex justify-between items-center">
                    <span>{isHindi ? "सूचनाएं" : "Notifications"}</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.2 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Notifications Popup Menu */}
              {showNotifications && (
                <div className="absolute bottom-12 left-0 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    <span className="text-[10px] text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.isRead ? "bg-indigo-50/50 font-semibold" : "text-slate-600"
                          }`}
                        >
                          <div className="text-slate-900">{n.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout Button */}
          {user && (
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
          )}
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Emergency Helpline Ribbon */}
        <div className="bg-red-700 text-white px-4 py-1.5 text-[11px] font-semibold text-center flex items-center justify-center gap-2 shadow-xs shrink-0">
          <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
          <span>
            {isHindi
              ? "राष्ट्रीय सिलिकोसिस एवं श्वसन स्वास्थ्य हेल्पलाइन: 1800-180-6127 (24x7 निःशुल्क सहायता)"
              : "National Occupational Pneumoconiosis Helpline: Toll-Free 1800-180-6127 (24x7 Support)"}
          </span>
        </div>

        {/* Content Outlet */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>

      {/* Role Request Modal */}
      <RoleRequestModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} />
    </div>
  );
};

export default SidebarLayout;
