import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import { Activity, Lock, Mail, ArrowRight } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

const SignupForm = () => {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      role: "WORKER",
      district: "Jaipur",
      state: "Rajasthan",
    },
  });

  const email = watch("email");

  const handleSendOtp = async () => {
    if (!email) {
      setError("email", { type: "manual", message: "Enter email first." });
      return;
    }
    setIsSendingOtp(true);
    try {
      let res = await axios.post("/sendotp", { email });
      if (res.status === 200) {
        if (res.data.status === 1) {
          toast.success("OTP sent to your email!");
          setOtpSent(true);
          clearErrors("email");
        } else {
          toast.error(res.data.msg || "Failed to send OTP");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error while sending OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data) => {
    if (!otpSent) {
      setError("otp", { type: "manual", message: "Please send OTP first." });
      return;
    }
    try {
      let res = await axios.post("/signup", data);
      if (res.status === 200) {
        if (res.data.status === 6) return toast.error("Email already exists");
        if (res.data.status === 2 || res.data.status === 10) return toast.error("Invalid OTP");
        if (res.data.status === 7) return toast.error("Please fill all required fields");
        if (res.data.status === 1) {
          toast.success("Account created successfully!");
          await fetchUser();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating account");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Activity className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create Platform Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Join the Occupational Health & Silicosis Screening Network
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...register("name", { required: "Full name is required" })}
                placeholder="Ramesh Kumar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
              />
              {errors.name && <span className="text-[10px] text-red-600">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="ramesh@mining.org"
                    {...register("email", { required: "Email is required" })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition disabled:opacity-50"
                >
                  {isSendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
              {errors.email && <span className="text-[10px] text-red-600">{errors.email.message}</span>}
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verification OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP from email"
                  {...register("otp", { required: "OTP is required" })}
                  className="w-full py-2.5 px-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                />
                {errors.otp && <span className="text-[10px] text-red-600">{errors.otp.message}</span>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>
              {errors.password && <span className="text-[10px] text-red-600">{errors.password.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  placeholder="e.g. Karauli / Jodhpur"
                  {...register("district")}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Rajasthan"
                  {...register("state")}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>{isSubmitting ? "Registering..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            Already registered?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SignupForm;
