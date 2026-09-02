import React from "react";
import FullScreenLoader from "../pages/Loading";
import { useStore } from "../zustand/store";
import { Navigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = useStore((state) => state.user);
  const isLoading = useStore((state) => state.isLoading);

  if (isLoading) return <FullScreenLoader />;
  if (!user && !isLoading) return <Navigate to="/login" replace />;

  return children;
};

const AdminRoute = ({ children }) => {
  const user = useStore((state) => state.user);
  const isLoading = useStore((state) => state.isLoading);
  const navigate = useNavigate();

  if (isLoading) return <FullScreenLoader />;
  if (!user && !isLoading) return <Navigate to="/login" replace />;

  const isAdminUser = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This section is strictly restricted to <strong>Administrator</strong> and <strong>Super Administrator</strong> roles. Your current account role is <span className="font-mono font-bold text-red-600 uppercase">[{user.role}]</span>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export { ProtectedRoute, AdminRoute };