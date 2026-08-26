import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "../services/axios";
import { toast } from "react-toastify";
import { useStore } from "../zustand/store";
import { Activity, Lock, Mail, ArrowRight, Stethoscope, User, Shield } from "lucide-react";
import Navbar from "../components/Navbar";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "DOCTOR" || user.role === "MEDICAL_OFFICER") {
        navigate("/doctor/dashboard");
      } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate("/admin/analytics");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      let res = await axios.post("/login", data);
      if (res.status === 200) {
        if (res.data.status === 5 || res.data.status === 9 || res.data.status === 10) {
          return toast.error("Invalid email or password");
        }
        if (res.data.status === 7) return toast.error("All fields are required");
        if (res.data.status === 1) {
          toast.success("Login successful!");
          await fetchUser();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server connection error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Activity className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Portal Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access worker screenings, telemedicine, and referral records
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  placeholder="name@mininghealth.gov.in"
                  {...register("email", { required: "Email is required" })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;