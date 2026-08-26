import React, { useEffect, useState } from "react";
import {
  Building2,
  Phone,
  MapPin,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  ExternalLink,
} from "lucide-react";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import Navbar from "../components/Navbar";

const ReferralsPage = () => {
  const user = useStore((state) => state.user);
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  const [referrals, setReferrals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [districtFilter, setDistrictFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [districtFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [refRes, facRes] = await Promise.all([
        axios.get("/api/referrals"),
        axios.get(`/api/facilities${districtFilter ? `?district=${districtFilter}` : ""}`),
      ]);
      if (refRes.data?.data) setReferrals(refRes.data.data);
      if (facRes.data?.data) setFacilities(facRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-2">
              <Building2 className="w-4 h-4" />
              Tertiary & District Pulmonary Referral Network
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isHindi ? "डिजिटल रेफरल एवं स्वास्थ्य केंद्र" : "Digital Referrals & Designated Healthcare Facilities"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Empaneled Silicosis Boards, District Chest Clinics, and Tertiary Respiratory Centers
            </p>
          </div>
        </div>

        {/* Digital Referral Slips Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            {isHindi ? "जारी किए गए डिजिटल रेफरल स्लिप" : "Issued Digital Referral Slips"}
          </h2>

          {referrals.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
              No medical referral slips issued yet. High-risk screening flags will generate referrals here.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {referrals.map((ref) => (
                <div
                  key={ref._id}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {ref.referralCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ref.urgency === "URGENT" || ref.urgency === "EMERGENCY"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ref.urgency}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{ref.workerId?.name}</h4>
                    <p className="text-xs text-slate-500">
                      ID: {ref.workerId?.workerCode} | Phone: {ref.workerId?.phone || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div>
                      <strong className="text-slate-700">Referred Center:</strong>{" "}
                      {ref.facilityId?.name || "District Chest Hospital"}
                    </div>
                    <div>
                      <strong className="text-slate-700">Reason:</strong> {ref.provisionalReason}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Status: <strong className="text-emerald-700">{ref.status}</strong>
                    </span>
                    <span className="text-slate-400">
                      Date: {new Date(ref.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empaneled Facilities Directory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {isHindi ? "समीपस्थ स्वास्थ्य केंद्र एवं सिलिकोसिस बोर्ड" : "Designated Chest Hospitals & Silicosis Boards"}
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter by district (e.g. Jaipur, Jodhpur)..."
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600 w-56"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {facilities.map((fac) => (
              <div
                key={fac._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{fac.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {fac.address?.line}, {fac.address?.district}, {fac.address?.state} - {fac.address?.pincode}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-700">
                    {fac.facilityType?.replace("_", " ")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {fac.facilitiesAvailable?.hasChestXray && (
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Chest X-Ray (PA)
                    </span>
                  )}
                  {fac.facilitiesAvailable?.hasFullPFTLab && (
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      ✓ PFT / Spirometry Lab
                    </span>
                  )}
                  {fac.facilitiesAvailable?.hasSilicosisBoard && (
                    <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                      ★ Certified Silicosis Board
                    </span>
                  )}
                  {fac.facilitiesAvailable?.hasPulmonologist && (
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Chest Physician
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{fac.contactPhone || "+91 1800-180-6127"}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{fac.nodalOfficerName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralsPage;
