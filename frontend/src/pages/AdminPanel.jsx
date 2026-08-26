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
} from "lucide-react";
import axios from "../services/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const AdminPanel = () => {
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
        toast.success(`Application ${reviewAction.toLowerCase()}d successfully`);
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
        toast.success("Approval form template saved!");
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Administrative Governance & Role Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">SwasthaKosh Master Admin Panel</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage workforce roles, review doctor credential requests, configure dynamic forms, and monitor clinical consultations.
            </p>
          </div>

          <button
            onClick={fetchTabData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition text-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto gap-1">
          {[
            { id: "OVERVIEW", label: "Dashboard Overview", icon: Activity },
            { id: "USERS", label: "Users & Roles", icon: Users },
            { id: "APPROVALS", label: "Role Approvals", icon: FileCheck2 },
            { id: "FORMS", label: "Dynamic Form Builder", icon: FormInput },
            { id: "MEETINGS", label: "Consultation Meetings", icon: Video },
            { id: "CHATS", label: "Chat Moderation", icon: MessageSquare },
            { id: "AUDIT", label: "Audit Logs", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Total Registered Users</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{overview?.totalUsers || 0}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Verified Doctors / Medical</span>
                <div className="text-2xl font-extrabold text-indigo-600 mt-1">{overview?.totalDoctors || 0}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Pending Role Approvals</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{overview?.pendingRoleRequests || 0}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Active Consultations</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">{overview?.activeMeetings || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & ROLES */}
        {activeTab === "USERS" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchTabData()}
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600 w-64"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Roles</option>
                  <option value="WORKER">Workers Only</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="MEDICAL_OFFICER">Medical Officers</option>
                  <option value="SCREENING_WORKER">Screening Staff</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-slate-500">Total: {users.length} Users</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Location / Org</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u._id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-slate-400">{u.phone || "No phone"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            u.role === "DOCTOR" || u.role === "MEDICAL_OFFICER"
                              ? "bg-indigo-100 text-indigo-800"
                              : u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{u.district ? `${u.district}, ${u.state || ""}` : "Rajasthan"}</div>
                        <div className="text-[11px] text-slate-400">{u.organization || "Independent"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserToEdit(u);
                            setNewRoleToAssign(u.role);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition"
                        >
                          Override Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROLE APPROVALS QUEUE */}
        {activeTab === "APPROVALS" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="PENDING_FORM">Waiting for Form Submission</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {roleRequests.length} Applications
              </span>
            </div>

            {roleRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No role change requests in this status.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Requested Role</th>
                      <th className="py-3 px-4">Submitted Credentials</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roleRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{req.userId?.name}</div>
                          <div className="text-[11px] text-slate-500">{req.userId?.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {req.requestedRole}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {req.submittedFormData ? (
                            <div className="text-[11px]">
                              {Object.entries(req.submittedFormData)
                                .slice(0, 2)
                                .map(([k, v]) => (
                                  <div key={k}>
                                    <strong>{k}:</strong> {String(v)}
                                  </div>
                                ))}
                              {req.attachments?.length > 0 && (
                                <span className="text-emerald-600 font-bold">
                                  📎 {req.attachments.length} attachment(s)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Form not filled yet</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : req.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setReviewAction("APPROVE");
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition"
                          >
                            Review & Signoff
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DYNAMIC FORM BUILDER */}
        {activeTab === "FORMS" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Custom Role Approval Forms</h3>
                <p className="text-xs text-slate-500">
                  Configure custom fields and documents required when workers apply for privileged roles
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedFormRole}
                  onChange={(e) => {
                    const r = e.target.value;
                    setSelectedFormRole(r);
                    const found = forms.find((f) => f.role === r);
                    if (found) {
                      setFormTitle(found.title);
                      setFormDescription(found.description || "");
                      setFormFields(found.fields || []);
                    } else {
                      setFormTitle(`${r.replace("_", " ")} Credential Verification Form`);
                      setFormDescription("");
                      setFormFields([]);
                    }
                  }}
                  className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="DOCTOR">Doctor / Pulmonologist</option>
                  <option value="MEDICAL_OFFICER">District Medical Officer</option>
                  <option value="SCREENING_WORKER">Screening Operator</option>
                  <option value="REFERRAL_CENTER">Chest Hospital / Board</option>
                </select>

                <button
                  onClick={handleSaveForm}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Form Schema
                </button>
              </div>
            </div>

            {/* Form Meta */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Form Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Form Questions / Input Fields ({formFields.length})
                </span>
                <button
                  onClick={addFormField}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Field
                </button>
              </div>

              {formFields.map((field, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Field Label / Question"
                      value={field.label}
                      onChange={(e) => updateFormField(idx, "label", e.target.value)}
                      className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    />

                    <select
                      value={field.type}
                      onChange={(e) => updateFormField(idx, "type", e.target.value)}
                      className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown Select</option>
                      <option value="textarea">Textarea (Long Text)</option>
                      <option value="file">File Upload (Certificate/PDF)</option>
                      <option value="checkbox">Declaration Checkbox</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) => updateFormField(idx, "isRequired", e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span>Required Field</span>
                    </label>
                  </div>

                  <button
                    onClick={() => removeFormField(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-end sm:self-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONSULTATION MEETINGS */}
        {activeTab === "MEETINGS" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Scheduled & Active Telemedicine Consultations</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Appointment Code</th>
                    <th className="py-3 px-4">Patient / Worker</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Room ID</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {meetings.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{m.appointmentCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{m.workerId?.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-900">Dr. {m.doctorId?.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{new Date(m.scheduledAt).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{m.roomId || "Pending"}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            m.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.status === "COMPLETED"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: CHAT MODERATION */}
        {activeTab === "CHATS" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Active Consultation Conversation Channels</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Channel ID</th>
                    <th className="py-3 px-4">Participants</th>
                    <th className="py-3 px-4">Message Count</th>
                    <th className="py-3 px-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chats.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{c._id}</td>
                      <td className="py-3.5 px-4 text-slate-800">
                        {c.participants?.map((p) => p.name).join(" & ") || "Consultation"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600">{c.messageCount || 0} messages</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(c.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === "AUDIT" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Security & Compliance Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-700">{log.action}</td>
                      <td className="py-3 px-4 text-slate-800">{log.userId?.name || "System"}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Credential Review: {selectedRequest.userId?.name} ({selectedRequest.requestedRole})
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Submitted Form Responses:</h4>
              {selectedRequest.submittedFormData ? (
                Object.entries(selectedRequest.submittedFormData).map(([k, v]) => (
                  <div key={k}>
                    <strong className="text-slate-700">{k}:</strong> {String(v)}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No form data</div>
              )}

              {selectedRequest.attachments?.length > 0 && (
                <div className="pt-2">
                  <strong className="text-slate-700 block mb-1">Attached Documents / Licenses:</strong>
                  <div className="space-y-1">
                    {selectedRequest.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline text-xs mr-3"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Review Decision</label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="APPROVE">Approve & Upgrade Role</option>
                <option value="REJECT">Reject Application</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Notes / Feedback to Applicant</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Credentials verified with State Medical Registry. Approved."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Submit Signoff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Override Modal */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Direct Role Override: {selectedUserToEdit.name}</h3>
            <p className="text-xs text-slate-500">Only Admin can directly assign or change privileged roles.</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select New Role</label>
              <select
                value={newRoleToAssign}
                onChange={(e) => setNewRoleToAssign(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="WORKER">Worker</option>
                <option value="SCREENING_WORKER">Screening Operator</option>
                <option value="DOCTOR">Doctor / Pulmonologist</option>
                <option value="MEDICAL_OFFICER">District Medical Officer</option>
                <option value="REFERRAL_CENTER">Chest Hospital / Silicosis Board</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedUserToEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChangeSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
