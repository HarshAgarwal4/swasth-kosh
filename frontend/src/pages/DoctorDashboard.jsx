import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Video,
  MessageSquare,
  FileCheck2,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Building,
  PlusCircle,
} from "lucide-react";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import Navbar from "../components/Navbar";
import RiskBadge from "../components/RiskBadge";
import { toast } from "react-toastify";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  const [screenings, setScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [provisionalAction, setProvisionalAction] = useState("ISSUE_REFERRAL");
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scrRes, facRes] = await Promise.all([
        axios.get("/api/screenings"),
        axios.get("/api/facilities"),
      ]);
      if (scrRes.data?.data) setScreenings(scrRes.data.data);
      if (facRes.data?.data) {
        setFacilities(facRes.data.data);
        if (facRes.data.data.length > 0) {
          setSelectedFacilityId(facRes.data.data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedScreening) return;
    try {
      await axios.post(`/api/screenings/${selectedScreening._id}/review`, {
        doctorNotes,
        provisionalAction,
      });

      // If issuing referral
      if (provisionalAction === "ISSUE_REFERRAL" && selectedFacilityId) {
        await axios.post("/api/referrals", {
          workerId: selectedScreening.workerId?._id || selectedScreening.workerId,
          screeningId: selectedScreening._id,
          facilityId: selectedFacilityId,
          urgency: selectedScreening.riskAssessmentId?.overallRiskLevel === "HIGH" ? "URGENT" : "ROUTINE",
          provisionalReason: doctorNotes || "High risk screening alert requiring clinical pulmonary evaluation.",
        });
        toast.success("Digital referral slip issued successfully!");
      } else {
        toast.success("Clinical review recorded.");
      }

      setShowReviewModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit clinical review");
    }
  };

  const filteredScreenings = screenings.filter((scr) => {
    const risk = scr.riskAssessmentId?.overallRiskLevel || "LOW";
    if (riskFilter !== "ALL" && risk !== riskFilter) return false;
    if (searchQuery) {
      const name = scr.workerId?.name || "";
      const code = scr.workerId?.workerCode || scr.screeningCode || "";
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const highRiskCount = screenings.filter((s) => s.riskAssessmentId?.overallRiskLevel === "HIGH").length;
  const modRiskCount = screenings.filter((s) => s.riskAssessmentId?.overallRiskLevel === "MODERATE").length;
  const lowRiskCount = screenings.filter((s) => s.riskAssessmentId?.overallRiskLevel === "LOW").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Portal Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
              <Stethoscope className="w-4 h-4" />
              Medical Officer & Doctor Portal
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Clinical Review & Telemedicine Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review multi-factor AI signals, conduct WebRTC video consults, and approve hospital referrals
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/screening/start")}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Conduct Field Screening
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Total Screened Workers</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{screenings.length}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-900 shadow-xs">
            <span className="text-xs text-red-700 font-semibold">High Risk Cases</span>
            <div className="text-2xl font-extrabold text-red-700 mt-1">{highRiskCount}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 shadow-xs">
            <span className="text-xs text-amber-700 font-semibold">Moderate Risk</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{modRiskCount}</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900 shadow-xs">
            <span className="text-xs text-emerald-700 font-semibold">Low Risk Surveillance</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{lowRiskCount}</div>
          </div>
        </div>

        {/* Screening Patient Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search worker name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600 w-60"
                />
              </div>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk Only</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredScreenings.length} records
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading clinical queue...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Worker & Mine</th>
                    <th className="py-3 px-4">Exposure & Role</th>
                    <th className="py-3 px-4">Risk Stratification</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4 text-right">Clinical Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScreenings.map((scr) => {
                    const worker = scr.workerId || {};
                    const risk = scr.riskAssessmentId || {};
                    return (
                      <tr key={scr._id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{worker.name || "Worker"}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {worker.workerCode} | {scr.mineId?.name || "Mining Quarry"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{worker.jobRole || "Driller"}</div>
                          <div className="text-[11px] text-slate-500">
                            {scr.exposure?.yearsOfExposure || worker.yearsOfExposure || 0} yrs exposure
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <RiskBadge
                            level={risk.overallRiskLevel || "LOW"}
                            score={risk.overallScore}
                            size="sm"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              scr.status === "REVIEWED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {scr.status || "PENDING"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedScreening(scr);
                              setShowReviewModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition"
                          >
                            Review & Notes
                          </button>

                          <button
                            onClick={() => navigate(`/call/telemed-${scr._id}`)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition"
                            title="Start Video Call"
                          >
                            <Video className="w-3.5 h-3.5 inline mr-1" />
                            Call
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Doctor Clinical Review & Referral Modal */}
      {showReviewModal && selectedScreening && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Clinical Signoff: {selectedScreening.workerId?.name} ({selectedScreening.screeningCode})
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Review & Differential Diagnosis Notes
              </label>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="e.g. Advised ILO standard chest PA radiograph to evaluate opacities. Sputum AFB recommended to rule out secondary tuberculosis coinfection."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Provisional Action Plan
              </label>
              <select
                value={provisionalAction}
                onChange={(e) => setProvisionalAction(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="ISSUE_REFERRAL">Issue Digital Referral to District Chest Hospital</option>
                <option value="SCHEDULE_VIDEO_CONSULT">Schedule Follow-up Video Teleconsultation</option>
                <option value="OBSERVATION">Routine Monitoring (Repeat in 6-12 Months)</option>
              </select>
            </div>

            {provisionalAction === "ISSUE_REFERRAL" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designated Referral Healthcare Facility
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900"
                >
                  {facilities.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.address?.district}, {f.address?.state})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Submit Clinical Signoff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
