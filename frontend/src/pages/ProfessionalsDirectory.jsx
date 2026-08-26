import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Search,
  MapPin,
  Building,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Video,
  Send,
  X,
} from "lucide-react";
import axios from "../services/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const ProfessionalsDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [consultationType, setConsultationType] = useState("VIDEO_CALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [districtFilter]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/appointments/professionals?search=${search}&district=${districtFilter}`);
      if (res.data?.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !scheduledAt || !chiefComplaint) {
      toast.warning("Please fill all required booking fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/appointments", {
        doctorId: selectedDoctor._id,
        scheduledAt,
        chiefComplaint,
        consultationType,
      });

      if (res.data?.success) {
        toast.success("Consultation requested! Once the doctor accepts, private video call and chat will be unlocked.");
        setSelectedDoctor(null);
        setChiefComplaint("");
        setScheduledAt("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
              <Stethoscope className="w-4 h-4" />
              Verified Telemedicine Directory
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Find Verified Pulmonologists & Medical Officers
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consult certified occupational chest physicians via private appointment-gated video and chat
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by doctor name, hospital, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDoctors()}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
            />
          </div>

          <input
            type="text"
            placeholder="Filter by district (e.g. Jaipur, Jodhpur)..."
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full sm:w-60 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
          />

          <button
            onClick={fetchDoctors}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Search
          </button>
        </div>

        {/* Doctor Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading verified doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No Doctors Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or district filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shadow-xs">
                        {doc.name[0]?.toUpperCase() || "D"}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>Dr. {doc.name}</span>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" title="Verified Professional" />
                        </h3>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          {doc.qualification || "MD / Pulmonologist"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.organization || "District Chest Clinic"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.district ? `${doc.district}, ${doc.state || ""}` : "Rajasthan"}</span>
                    </div>
                    {doc.registrationNumber && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Reg: {doc.registrationNumber}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Request Consultation</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Appointment Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
                <Video className="w-4 h-4" />
                Book Telemedicine Session
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Consult Dr. {selectedDoctor.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDoctor.qualification} • {selectedDoctor.organization || "Chest Clinic"}
              </p>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Date & Time Slot
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Consultation Mode
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="VIDEO_CALL">WebRTC HD Video Consultation</option>
                  <option value="TEXT_CHAT">Private 1-on-1 Medical Chat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chief Complaint / Respiratory Symptoms
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your symptoms, years of dust exposure, or questions regarding your screening report..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-[11px] text-indigo-950 leading-relaxed">
                🔒 <strong>Privacy Gating:</strong> Private chat and video consultation access are activated immediately when the doctor confirms your requested slot.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending Request..." : "Submit Consultation Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalsDirectory;
