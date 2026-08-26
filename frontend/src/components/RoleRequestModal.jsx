import React, { useState } from "react";
import { Shield, Send, CheckCircle2, AlertCircle, Sparkles, X, Mail } from "lucide-react";
import axios from "../services/axios";
import { toast } from "react-toastify";
import { useStore } from "../zustand/store";

const RoleRequestModal = ({ isOpen, onClose }) => {
  const user = useStore((state) => state.user);
  const [requestedRole, setRequestedRole] = useState("DOCTOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  if (!isOpen) return null;

  const handleInitiate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/role-requests/initiate", { requestedRole });
      if (res.data?.success) {
        setSuccessInfo(res.data.data);
        toast.success("Role application initiated! Check your email.");
      } else {
        toast.error(res.data?.message || "Failed to initiate request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting role request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!successInfo ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">Request Professional Role Change</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your account currently has <span className="font-bold text-slate-800 uppercase">[{user?.role || "WORKER"}]</span> permissions. Elevating to a verified professional role requires medical credential review.
            </p>

            <form onSubmit={handleInitiate} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Requested Role
                </label>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                >
                  <option value="DOCTOR">Doctor / Pulmonologist (MD/MBBS)</option>
                  <option value="MEDICAL_OFFICER">District Medical Officer (Health Dept)</option>
                  <option value="SCREENING_WORKER">Screening Operator / Field Staff</option>
                  <option value="REFERRAL_CENTER">Designated Chest Hospital / Silicosis Board</option>
                  <option value="ADMIN">Mine / Safety Administrator</option>
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
                <strong>Next Step:</strong> Upon clicking submit, a secure email link with your role verification form will be dispatched to <strong>{user?.email}</strong>.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Initiating..." : "Submit & Send Form Link"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Mail className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Verification Link Sent!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              We have dispatched a secure link to <strong>{user?.email}</strong>. You can open the link from your email, or complete the form directly below.
            </p>

            <div className="pt-3 flex flex-col gap-2">
              <a
                href={successInfo.secureLink}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition text-center"
              >
                Open Verification Form Now →
              </a>
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleRequestModal;
