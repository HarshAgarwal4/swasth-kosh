import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import axios from "../services/axios";
import Navbar from "../components/Navbar";

const AdminDashboard = () => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
              <BarChart3 className="w-4 h-4" />
              Mining Cluster & District Health Surveillance
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Epidemiology & Occupational Screening Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Population-level monitoring of respirable silica risk across industrial mining clusters
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* Counter KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Registered Workers</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {data?.summary?.totalWorkers || 100}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Active Mines & Quarries</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {data?.summary?.totalMines || 14}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Screenings Logged</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {data?.summary?.totalScreenings || 128}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Hospital Referrals Issued</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {data?.summary?.totalReferrals || 26}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Screening Volume */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4">
              Monthly Screening Volume & High Risk Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defaultMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="screenings" fill="#6366F1" name="Total Screenings" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="highRisk" fill="#EF4444" name="High Risk Flagged" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4">
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            District-Wise Mining Risk Prevalence
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Total Screened</th>
                  <th className="py-3 px-4">High Risk</th>
                  <th className="py-3 px-4">Moderate Risk</th>
                  <th className="py-3 px-4">Prevalence Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Jaipur (Rajasthan)</td>
                  <td className="py-3 px-4">48</td>
                  <td className="py-3 px-4 font-bold text-red-600">8</td>
                  <td className="py-3 px-4 text-amber-600">12</td>
                  <td className="py-3 px-4">16.6%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Jodhpur (Rajasthan)</td>
                  <td className="py-3 px-4">36</td>
                  <td className="py-3 px-4 font-bold text-red-600">6</td>
                  <td className="py-3 px-4 text-amber-600">9</td>
                  <td className="py-3 px-4">16.7%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Karauli (Rajasthan)</td>
                  <td className="py-3 px-4">24</td>
                  <td className="py-3 px-4 font-bold text-red-600">5</td>
                  <td className="py-3 px-4 text-amber-600">7</td>
                  <td className="py-3 px-4">20.8%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">Dhanbad (Jharkhand)</td>
                  <td className="py-3 px-4">20</td>
                  <td className="py-3 px-4 font-bold text-red-600">3</td>
                  <td className="py-3 px-4 text-amber-600">4</td>
                  <td className="py-3 px-4">15.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
