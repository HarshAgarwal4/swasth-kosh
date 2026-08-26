import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  ShieldAlert,
} from "lucide-react";
import { useStore } from "../zustand/store";
import axios from "../services/axios";
import RoleRequestModal from "./RoleRequestModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore((state) => state.user);
  const logoutUser = useStore((state) => state.logoutUser);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const notifications = useStore((state) => state.notifications);
  const unreadCount = useStore((state) => state.unreadNotificationsCount);
  const fetchNotifications = useStore((state) => state.fetchNotifications);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const role = user?.role || "WORKER";
  const isDoctor = role === "DOCTOR" || role === "MEDICAL_OFFICER";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const handleNotificationClick = async (notif) => {
    try {
      await axios.patch(`/api/notifications/${notif._id}/read`);
      await fetchNotifications();
    } catch (e) {}
    setShowNotifications(false);
  };

  const navLinks = [
    { label: language === "hi" ? "डैशबोर्ड" : "Dashboard", path: "/dashboard", icon: Activity },
    { label: language === "hi" ? "स्क्रीनिंग" : "Screening", path: "/screening/start", icon: FileText },
    ...(!isDoctor && !isAdmin ? [{ label: language === "hi" ? "डॉक्टर खोजें" : "Find Doctors", path: "/find-doctors", icon: Stethoscope }] : []),
    { label: language === "hi" ? "परामर्श अपॉइंटमेंट" : "Consultations", path: "/appointments", icon: Video },
    ...(isDoctor ? [{ label: language === "hi" ? "डॉक्टर पोर्टल" : "Doctor Portal", path: "/doctor/dashboard", icon: Stethoscope }] : []),
    { label: language === "hi" ? "चैट" : "Chat", path: "/chat", icon: MessageSquare },
    { label: language === "hi" ? "AI सहायक" : "AI Assistant", path: "/ai-assistant", icon: Bot },
    { label: language === "hi" ? "रेफरल" : "Referrals", path: "/referrals", icon: Building2 },
    ...(isAdmin ? [
      { label: language === "hi" ? "एडमिन पैनल" : "Admin Panel", path: "/admin", icon: Shield },
      { label: language === "hi" ? "एनालिटिक्स" : "Analytics", path: "/admin/analytics", icon: BarChart3 }
    ] : []),
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="font-bold text-lg text-slate-900 leading-none block">
                    SwasthaKosh
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 block">
                    Occupational Lung Care
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            {user && (
              <nav className="hidden lg:flex items-center space-x-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        active
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Action Icons & Profile */}
            <div className="flex items-center gap-2.5">
              {/* Language Toggle */}
              <button
                type="button"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === "en" ? "हिंदी" : "English"}</span>
              </button>

              {user ? (
                <>
                  {/* Role Elevation Button for non-doctors */}
                  {role === "WORKER" && (
                    <button
                      onClick={() => setShowRoleModal(true)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 transition"
                      title="Apply for Doctor or Screening Staff Role"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-700" />
                      <span>Apply for Role</span>
                    </button>
                  )}

                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800">Notifications</span>
                          <span className="text-[11px] text-slate-500">{unreadCount} unread</span>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
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
                                  !n.isRead ? "bg-indigo-50/40 font-semibold" : "text-slate-600"
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

                  {/* User Pill & Role Badge */}
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-28">
                        {user.name}
                      </div>
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-800 uppercase">
                        {role.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={logoutUser}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-xs font-semibold px-3.5 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              {user && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {showMobileMenu && user && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Role Request Modal */}
      <RoleRequestModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} />
    </>
  );
};

export default Navbar;