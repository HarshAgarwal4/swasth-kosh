import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Users,
  FileCheck2,
  FormInput,
  Video,
  MessageSquare,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  PlusCircle,
  Save,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  Crown,
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  Sliders,
  Database,
  Sparkles,
  Clock,
  UserCheck,
  BadgeAlert,
  Lock,
  FileText,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Globe,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../services/axios";
import { toast } from "react-toastify";
import { useStore } from "../zustand/store";
import AdminSidebar from "../components/AdminSidebar";

const AdminPanel = () => {
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.user);
  const logoutUser = useStore((state) => state.logoutUser);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const isHindi = language === "hi";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, USERS, APPROVALS, FORMS, MEETINGS, CHATS, AUDIT
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [forms, setForms] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [chats, setChats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [requestStatusFilter, setRequestStatusFilter] = useState("PENDING_REVIEW");

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVE");
  const [adminNotes, setAdminNotes] = useState("");

  // Role Override Modal State
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [newRoleToAssign, setNewRoleToAssign] = useState("WORKER");

  // Form Builder State
  const [selectedFormRole, setSelectedFormRole] = useState("DOCTOR");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    fetchTabData();
  }, [activeTab, userRoleFilter, requestStatusFilter]);

  const fetchTabData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "OVERVIEW") {
        const res = await axios.get("/api/admin/overview");
        if (res.data?.success) setOverview(res.data.data);
      } else if (activeTab === "USERS") {
        const res = await axios.get(`/api/admin/users?role=${userRoleFilter}&search=${userSearch}`);
        if (res.data?.success) setUsers(res.data.data);
      } else if (activeTab === "APPROVALS") {
        const res = await axios.get(`/api/role-requests/admin/list?status=${requestStatusFilter}`);
        if (res.data?.success) setRoleRequests(res.data.data);
      } else if (activeTab === "FORMS") {
        const res = await axios.get("/api/forms/admin/all");
        if (res.data?.success) {
          setForms(res.data.data);
          const current = res.data.data.find((f) => f.role === selectedFormRole);
          if (current) {
            setFormTitle(current.title);
            setFormDescription(current.description || "");
            setFormFields(current.fields || []);
          }
        }
      } else if (activeTab === "MEETINGS") {
        const res = await axios.get("/api/admin/meetings");
        if (res.data?.success) setMeetings(res.data.data);
      } else if (activeTab === "CHATS") {
        const res = await axios.get("/api/admin/chats");
        if (res.data?.success) setChats(res.data.data);
      } else if (activeTab === "AUDIT") {
        const res = await axios.get("/api/admin/audit-logs");
        if (res.data?.success) setAuditLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest) return;
    try {
      const res = await axios.post(`/api/role-requests/admin/${selectedRequest._id}/review`, {
        action: reviewAction,
        adminReviewNotes: adminNotes,
      });
      if (res.data?.success) {
        toast.success(`Application ${reviewAction.toLowerCase()}d successfully! Notification sent.`);
        setSelectedRequest(null);
        setAdminNotes("");
        fetchTabData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting review");
    }
  };

  const handleRoleChangeSubmit = async () => {
    if (!selectedUserToEdit) return;
    try {
      const res = await axios.patch(`/api/admin/users/${selectedUserToEdit._id}/role`, {
        role: newRoleToAssign,
      });
      if (res.data?.success) {
        toast.success(`User role updated to ${newRoleToAssign}`);
        setSelectedUserToEdit(null);
        fetchTabData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleSaveForm = async () => {
    try {
      const res = await axios.post("/api/forms/admin/save", {
        role: selectedFormRole,
        title: formTitle,
        description: formDescription,
        fields: formFields,
      });
      if (res.data?.success) {
        toast.success(`Form template for ${selectedFormRole} saved!`);
        fetchTabData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save form template");
    }
  };

  const addFormField = () => {
    setFormFields([
      ...formFields,
      {
        name: `field_${Date.now()}`,
        label: "New Form Question",
        type: "text",
        isRequired: true,
        options: [],
      },
    ]);
  };

  const removeFormField = (index) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const updateFormField = (index, key, value) => {
    const updated = [...formFields];
    updated[index][key] = value;
    setFormFields(updated);
  };

  const handleFormRoleChange = (role) => {
    setSelectedFormRole(role);
    const existing = forms.find((f) => f.role === role);
    if (existing) {
      setFormTitle(existing.title);
      setFormDescription(existing.description || "");
      setFormFields(existing.fields || []);
    } else {
      setFormTitle(`${role.replace("_", " ")} Application Form`);
      setFormDescription("Provide required credentials and license documentation.");
      setFormFields([]);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-amber-500/20 text-amber-300 border-amber-400/40";
      case "ADMIN":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-400/40";
      case "DOCTOR":
      case "MEDICAL_OFFICER":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
      case "SCREENING_WORKER":
        return "bg-purple-500/20 text-purple-300 border-purple-400/40";
      case "REFERRAL_CENTER":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600/40";
    }
  };

  const tabs = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { id: "USERS", label: "User Directory", icon: Users },
    { id: "APPROVALS", label: "Role Approvals", icon: FileCheck2 },
    { id: "FORMS", label: "Form Builder", icon: FormInput },
    { id: "MEETINGS", label: "Telemed Audit", icon: Video },
    { id: "CHATS", label: "Chat Logs", icon: MessageSquare },
    { id: "AUDIT", label: "Security Logs", icon: ShieldAlert },
  ];

  return (
    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="flex-1 bg-slate-950 text-slate-100 font-sans pb-12">
      {/* ---------------- STANDALONE ADMIN HEADER (Completely separate from main dashboard) ---------------- */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Shield className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white">
                    SwasthaKosh <span className="text-amber-400">Master Admin</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(
                      currentUser?.role
                    )}`}
                  >
                    {isSuperAdmin ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400 inline" /> SUPER ADMIN
                      </span>
                    ) : (
                      currentUser?.role || "ADMIN"
                    )}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  Dedicated Governance & Command Center
                </span>
              </div>
            </Link>
          </div>

          {/* Admin Header Action Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-mono text-[11px]">System: OPERATIONAL</span>
            </div>

            {/* Switch to Analytics Reports */}
            <button
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Epidemiology Analytics</span>
            </button>

            {/* Switch to User View */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
              title="View Worker / Patient Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Worker View</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(isHindi ? "en" : "hi")}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHindi ? "EN" : "हिन्दी"}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchTabData}
              disabled={isLoading}
              className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition font-bold disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Logout */}
            <button
              onClick={logoutUser}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- MAIN ADMIN DASHBOARD BODY ---------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top KPI Metrics Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {overview?.counts?.totalUsers || users.length || "--"}
            </div>
            <div className="text-[10px] text-indigo-300 font-semibold mt-1">
              <span>Registered in platform</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Role Requests</span>
              <FileCheck2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {overview?.counts?.pendingRequests || roleRequests.length || 0}
            </div>
            <div className="text-[10px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
              <BadgeAlert className="w-3 h-3" />
              <span>Requires admin review</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Approval Forms</span>
              <FormInput className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {overview?.counts?.totalForms || forms.length || 4}
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold mt-1">
              <span>Dynamic templates</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Telemed Calls</span>
              <Video className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {overview?.counts?.totalMeetings || meetings.length || 0}
            </div>
            <div className="text-[10px] text-purple-300 font-semibold mt-1">
              <span>Logged consultations</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg relative overflow-hidden group col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Audit Log Events</span>
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {overview?.counts?.auditLogs || auditLogs.length || 0}
            </div>
            <div className="text-[10px] text-cyan-300 font-semibold mt-1">
              <span>Security logs recorded</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  active
                    ? "bg-linear-to-r from-amber-500 to-indigo-600 text-slate-950 font-black shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-slate-950" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ---------------- TAB CONTENT 1: OVERVIEW ---------------- */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Platform Overview Banner */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Dedicated Admin Dashboard
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    SwasthaKosh Master Control Hub
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
                    Independent governance center for user role modifications, credential reviews, dynamic qualification forms, and compliance monitoring.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                    <button
                      onClick={() => setActiveTab("USERS")}
                      className="flex flex-col p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-2xl transition text-left group"
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-indigo-400">
                        Direct Management
                      </span>
                      <span className="text-sm font-black text-white mt-1">Manage Roles</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("APPROVALS")}
                      className="flex flex-col p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-2xl transition text-left group"
                    >
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        Pending Reviews
                      </span>
                      <span className="text-sm font-black text-white mt-1">Review Credential</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("FORMS")}
                      className="flex flex-col p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-2xl transition text-left group col-span-2 sm:col-span-1"
                    >
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        Form Templates
                      </span>
                      <span className="text-sm font-black text-white mt-1">Edit Questions</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* System Infrastructure Vitals Card */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    Infrastructure Vitals
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400">API Gateway</span>
                      <span className="font-mono font-bold text-emerald-400">ONLINE (200 OK)</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400">Database Engine</span>
                      <span className="font-mono font-bold text-emerald-400">MongoDB Atlas</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400">Security Middleware</span>
                      <span className="font-mono font-bold text-indigo-400">JWT + Role RBAC</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400">Active Admin Session</span>
                      <span className="font-mono font-bold text-amber-300 uppercase">
                        {currentUser?.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>SwasthaKosh Core v2.4</span>
                  <span className="text-emerald-400 font-semibold">SSL Secured</span>
                </div>
              </div>
            </div>

            {/* Roles Breakdown Summary Cards */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Workforce & Role Distribution Overview
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { title: "Workers", role: "WORKER", count: overview?.roleBreakdown?.WORKER || 0, color: "text-slate-300" },
                  { title: "Doctors", role: "DOCTOR", count: overview?.roleBreakdown?.DOCTOR || 0, color: "text-emerald-400" },
                  { title: "Medical Officers", role: "MEDICAL_OFFICER", count: overview?.roleBreakdown?.MEDICAL_OFFICER || 0, color: "text-emerald-300" },
                  { title: "Screening Staff", role: "SCREENING_WORKER", count: overview?.roleBreakdown?.SCREENING_WORKER || 0, color: "text-purple-300" },
                  { title: "Referral Centers", role: "REFERRAL_CENTER", count: overview?.roleBreakdown?.REFERRAL_CENTER || 0, color: "text-cyan-300" },
                  { title: "Administrators", role: "ADMIN", count: (overview?.roleBreakdown?.ADMIN || 0) + (overview?.roleBreakdown?.SUPER_ADMIN || 0), color: "text-amber-300" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.title}
                    </span>
                    <span className={`text-xl font-black ${item.color} mt-1 block`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB CONTENT 2: USER DIRECTORY ---------------- */}
        {activeTab === "USERS" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  User Directory & Role Overrides
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Search registered accounts, filter by role, or manually reassign privilege tiers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search name, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={fetchTabData}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                "ALL",
                "WORKER",
                "DOCTOR",
                "MEDICAL_OFFICER",
                "SCREENING_WORKER",
                "REFERRAL_CENTER",
                "ADMIN",
                "SUPER_ADMIN",
              ].map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                    userRoleFilter === role
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {role.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 text-xs">
                        No matching users found in directory.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">
                              {u.name ? u.name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {u.workerCode || u._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border uppercase ${getRoleBadgeStyle(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserToEdit(u);
                              setNewRoleToAssign(u.role);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold rounded-lg transition border border-slate-700"
                          >
                            Change Role
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- TAB CONTENT 3: ROLE APPROVALS ---------------- */}
        {activeTab === "APPROVALS" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-400" />
                  Medical Credential & Role Application Requests
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review incoming applications for Doctors, Medical Officers & Screening Workers. Verify uploaded licenses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["PENDING_REVIEW", "APPROVED", "REJECTED", "ALL"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                      requestStatusFilter === st
                        ? "bg-amber-500 text-slate-950 font-black shadow-md"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {roleRequests.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No applications matching current filter.</p>
                </div>
              ) : (
                roleRequests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-white text-base">{req.applicantName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase ${getRoleBadgeStyle(
                            req.requestedRole
                          )}`}
                        >
                          Applying for: {req.requestedRole}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            req.status === "PENDING_REVIEW"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                              : req.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                              : "bg-red-500/20 text-red-300 border border-red-400/30"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap gap-4 font-mono">
                        <span>Email: {req.applicantEmail}</span>
                        <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      {req.adminReviewNotes && (
                        <div className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl mt-2">
                          <strong>Admin Note:</strong> "{req.adminReviewNotes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setReviewAction("APPROVE");
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                      >
                        Review & Decide
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ---------------- TAB CONTENT 4: DYNAMIC FORM BUILDER ---------------- */}
        {activeTab === "FORMS" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FormInput className="w-5 h-5 text-emerald-400" />
                Dynamic Application Form Builder
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure custom qualification forms for applicants seeking privileged roles.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              {["DOCTOR", "MEDICAL_OFFICER", "SCREENING_WORKER", "REFERRAL_CENTER"].map((r) => (
                <button
                  key={r}
                  onClick={() => handleFormRoleChange(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedFormRole === r
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {r.replace("_", " ")} Form
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Form Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Form Instructions / Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Form Questions / Fields ({formFields.length})</h3>
                  <button
                    onClick={addFormField}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-3">
                  {formFields.map((field, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFormField(idx, "label", e.target.value)}
                          placeholder="Question text..."
                          className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
                        />

                        <select
                          value={field.type}
                          onChange={(e) => updateFormField(idx, "type", e.target.value)}
                          className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                        >
                          <option value="text">Text Input</option>
                          <option value="textarea">Paragraph Text</option>
                          <option value="file">File Upload (PDF/Image)</option>
                          <option value="select">Dropdown Select</option>
                          <option value="checkbox">Checkbox</option>
                        </select>

                        <button
                          onClick={() => removeFormField(idx)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveForm}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save Form Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB CONTENT 5: MEETINGS AUDIT ---------------- */}
        {activeTab === "MEETINGS" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" />
              Telemedicine Consultation Meetings Audit
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Room ID</th>
                    <th className="py-3 px-4">Host Doctor</th>
                    <th className="py-3 px-4">Patient / Worker</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {meetings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        No active or past video consultation records found.
                      </td>
                    </tr>
                  ) : (
                    meetings.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono text-purple-400 font-bold">{m.roomId || m._id}</td>
                        <td className="py-3.5 px-4 text-white font-semibold">{m.doctorId?.name || "Dr. Assigned"}</td>
                        <td className="py-3.5 px-4 text-slate-300">{m.workerId?.name || "Worker"}</td>
                        <td className="py-3.5 px-4 text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- TAB CONTENT 6: CHATS AUDIT ---------------- */}
        {activeTab === "CHATS" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Medical Chat Rooms Audit Log
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Chat ID</th>
                    <th className="py-3 px-4">Participants</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {chats.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-500">
                        No medical chat conversations logged yet.
                      </td>
                    </tr>
                  ) : (
                    chats.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">{c._id}</td>
                        <td className="py-3.5 px-4 text-slate-200">
                          {c.participants?.map((p) => p.name).join(", ") || "Participants"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{new Date(c.updatedAt || c.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- TAB CONTENT 7: SECURITY AUDIT LOGS ---------------- */}
        {activeTab === "AUDIT" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              System Security & Administrative Audit Trail
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Admin User</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-500">
                        No audit log records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/40 font-mono">
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-cyan-300">{log.action}</td>
                        <td className="py-3.5 px-4 text-white">{log.performedBy?.name || "System Admin"}</td>
                        <td className="py-3.5 px-4 text-slate-300">{log.details || "Administrative event logged"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* REVIEW APPLICATION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Review Credential Application
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-white font-bold">{selectedRequest.applicantName}</div>
                <div className="text-slate-400 font-mono">Email: {selectedRequest.applicantEmail}</div>
                <div className="text-indigo-300 font-bold mt-1">Requested Role: {selectedRequest.requestedRole}</div>
              </div>

              {/* Uploaded Documents / Attachments */}
              {selectedRequest.submittedData?.files && selectedRequest.submittedData.files.length > 0 && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1.5">Submitted Credential Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.submittedData.files.map((file, i) => (
                      <a
                        key={i}
                        href={file.url || file}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Document #{i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Toggle */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Decision Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction("APPROVE")}
                    className={`py-2.5 rounded-xl font-bold border transition ${
                      reviewAction === "APPROVE"
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    Approve & Grant Role
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction("REJECT")}
                    className={`py-2.5 rounded-xl font-bold border transition ${
                      reviewAction === "REJECT"
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    Reject Application
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Notes / Email Feedback</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter review notes sent to applicant email..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Submit Final Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE OVERRIDE MODAL */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Override User Role
              </h3>
              <button
                onClick={() => setSelectedUserToEdit(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Target Account: <strong>{selectedUserToEdit.name}</strong> ({selectedUserToEdit.email})
              </p>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Select New Privilege Tier</label>
                <select
                  value={newRoleToAssign}
                  onChange={(e) => setNewRoleToAssign(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 font-mono font-bold"
                >
                  <option value="WORKER">WORKER (Occupational Worker)</option>
                  <option value="DOCTOR">DOCTOR (Physician)</option>
                  <option value="MEDICAL_OFFICER">MEDICAL_OFFICER (Govt / Mine Officer)</option>
                  <option value="SCREENING_WORKER">SCREENING_WORKER (Field Staff)</option>
                  <option value="REFERRAL_CENTER">REFERRAL_CENTER (Hospital Partner)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                  {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN (Master Super Admin)</option>}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedUserToEdit(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChangeSubmit}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
              >
                Update Role Immediately
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminSidebar>
  );
};

export default AdminPanel;
