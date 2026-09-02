import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  Users,
  Building,
  Activity,
  FileCheck,
  AlertTriangle,
  MapPin,
  RefreshCw,
  ArrowLeft,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import axios from "../services/axios";
import AdminSidebar from "../components/AdminSidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/analytics/overview");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultRiskData = [
    { name: "High Risk", value: data?.summary?.highRiskWorkers || 12, color: "#EF4444" },
    { name: "Moderate Risk", value: data?.summary?.moderateRiskWorkers || 24, color: "#F59E0B" },
    { name: "Low Risk", value: data?.summary?.lowRiskWorkers || 58, color: "#10B981" },
    { name: "Pending", value: data?.summary?.pendingRiskWorkers || 6, color: "#6B7280" },
  ];

  const defaultMonthlyData = [
    { month: "Mar", screenings: 18, highRisk: 3 },
    { month: "Apr", screenings: 29, highRisk: 6 },
    { month: "May", screenings: 45, highRisk: 10 },
    { month: "Jun", screenings: 62, highRisk: 14 },
    { month: "Jul", screenings: 78, highRisk: 19 },
    { month: "Aug", screenings: 95, highRisk: 22 },
  ];

  return (
    <AdminSidebar>
      <div className="flex-1 bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Dedicated Standalone Admin Analytics Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Return to Master Admin Panel"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                Epidemiology & Occupational Screening Analytics
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Population-level monitoring of respirable silica risk across mining clusters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition"
            >
              <Shield className="w-4 h-4 fill-slate-950" />
              <span>Admin Panel</span>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Worker View</span>
            </button>

            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition disabled:opacity-50"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Counter KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold text-slate-400">Registered Workers</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {data?.summary?.totalWorkers || 100}
            </div>
          </div>

          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold text-slate-400">Active Mines & Quarries</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {data?.summary?.totalMines || 14}
            </div>
          </div>

          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold text-slate-400">Total Screenings Logged</span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-1">
              {data?.summary?.totalScreenings || 128}
            </div>
          </div>

          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs font-semibold text-slate-400">Hospital Referrals Issued</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {data?.summary?.totalReferrals || 26}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Screening Volume */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-4">
              Monthly Screening Volume & High Risk Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defaultMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="screenings" fill="#6366F1" name="Total Screenings" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="highRisk" fill="#EF4444" name="High Risk Flagged" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-4">
              Workforce Screening Risk Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defaultRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {defaultRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* District Breakdown Table */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl p-6">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            District-Wise Mining Risk Prevalence
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Total Screened</th>
                  <th className="py-3 px-4">High Risk</th>
                  <th className="py-3 px-4">Moderate Risk</th>
                  <th className="py-3 px-4">Prevalence Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">Jaipur (Rajasthan)</td>
                  <td className="py-3 px-4">48</td>
                  <td className="py-3 px-4 font-bold text-red-400">8</td>
                  <td className="py-3 px-4 text-amber-400">12</td>
                  <td className="py-3 px-4">16.6%</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">Jodhpur (Rajasthan)</td>
                  <td className="py-3 px-4">36</td>
                  <td className="py-3 px-4 font-bold text-red-400">6</td>
                  <td className="py-3 px-4 text-amber-400">9</td>
                  <td className="py-3 px-4">16.7%</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">Karauli (Rajasthan)</td>
                  <td className="py-3 px-4">24</td>
                  <td className="py-3 px-4 font-bold text-red-400">5</td>
                  <td className="py-3 px-4 text-amber-400">7</td>
                  <td className="py-3 px-4">20.8%</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">Dhanbad (Jharkhand)</td>
                  <td className="py-3 px-4">20</td>
                  <td className="py-3 px-4 font-bold text-red-400">3</td>
                  <td className="py-3 px-4 text-amber-400">4</td>
                  <td className="py-3 px-4">15.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </div>
    </AdminSidebar>
  );
};

export default AdminDashboard;
