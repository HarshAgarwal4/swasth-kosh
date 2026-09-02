import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  User,
  CheckCircle,
  XCircle,
  Stethoscope,
  PlusCircle,
  FileText,
  AlertCircle,
  Search,
} from "lucide-react";
import axios from "../services/axios";
import { toast } from "react-toastify";
import { useStore } from "../zustand/store";
import SidebarLayout from "../components/SidebarLayout";

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const isDoctor = ["DOCTOR", "MEDICAL_OFFICER", "ADMIN"].includes(user?.role);

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Doctor Clinical Notes Modal
  const [selectedAptForNotes, setSelectedAptForNotes] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState([{ medicine: "", dosage: "", duration: "" }]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/appointments");
      if (res.data?.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, reason = "") => {
    try {
      const res = await axios.patch(`/api/appointments/${id}/status`, {
        status,
        rejectionReason: reason,
      });
      if (res.data?.success) {
        toast.success(`Appointment ${status.toLowerCase()}ed!`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update appointment");
    }
  };

  const handleSaveClinicalNotes = async () => {
    if (!selectedAptForNotes) return;
    try {
      const res = await axios.patch(`/api/appointments/${selectedAptForNotes._id}/status`, {
        status: "COMPLETED",
        clinicalNotes,
        prescriptions: prescriptions.filter((p) => p.medicine),
      });
      if (res.data?.success) {
        toast.success("Consultation completed with clinical notes!");
        setSelectedAptForNotes(null);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save notes");
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <SidebarLayout>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
              <Calendar className="w-4 h-4" />
              Telemedicine Consultations
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isDoctor ? "Doctor Clinical Consultations Queue" : "My Scheduled Telemedicine Appointments"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Private 1-on-1 video calls and chat are activated when appointments are in Accepted status
            </p>
          </div>

          {!isDoctor && (
            <button
              onClick={() => navigate("/find-doctors")}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Book New Doctor
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs w-max gap-1">
          {["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading consultations...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No Appointments Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {isDoctor ? "You have no consultation requests in this queue." : "Book a consultation with a certified doctor."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredAppointments.map((apt) => {
              const partner = isDoctor ? apt.workerId : apt.doctorId;
              const isAccepted = apt.status === "ACCEPTED";
              const isPending = apt.status === "PENDING";
              const isCompleted = apt.status === "COMPLETED";

              return (
                <div
                  key={apt._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {apt.appointmentCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isAccepted
                            ? "bg-emerald-100 text-emerald-800"
                            : isPending
                            ? "bg-amber-100 text-amber-800"
                            : isCompleted
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {partner?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {isDoctor ? partner?.name : `Dr. ${partner?.name}`}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {partner?.organization || partner?.district || "Occupational Health"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{new Date(apt.scheduledAt).toLocaleString()}</span>
                      </div>
                      <div>
                        <strong>Chief Complaint:</strong> {apt.chiefComplaint}
                      </div>
                    </div>

                    {apt.clinicalNotes && (
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-950">
                        <strong>Doctor Clinical Summary:</strong> {apt.clinicalNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* If Doctor and Pending */}
                    {isDoctor && isPending && (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => handleUpdateStatus(apt._id, "ACCEPTED")}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          Accept Consultation
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, "REJECTED", "Doctor unavailable")}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* If Accepted: Gated Video Call & Private Chat Enabled */}
                    {isAccepted && (
                      <div className="flex items-center gap-2 w-full">
                        <Link
                          to={`/call/${apt.roomId || `telemed-${apt._id}`}`}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition text-center flex items-center justify-center gap-1.5"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Call</span>
                        </Link>

                        <Link
                          to="/chat"
                          className="py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Private Chat</span>
                        </Link>

                        {isDoctor && (
                          <button
                            onClick={() => setSelectedAptForNotes(apt)}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                          >
                            Signoff Notes
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Doctor Signoff Modal */}
      {selectedAptForNotes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Complete Consultation: {selectedAptForNotes.workerId?.name}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Examination Notes & Advice
              </label>
              <textarea
                rows={4}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Prescription advice, diagnostic test recommendations..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedAptForNotes(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClinicalNotes}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Complete & Save Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default AppointmentsPage;
