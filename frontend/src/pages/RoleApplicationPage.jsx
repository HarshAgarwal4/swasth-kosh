import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Building,
  User,
} from "lucide-react";
import axios from "../services/axios";
import { toast } from "react-toastify";
import SidebarLayout from "../components/SidebarLayout";

const RoleApplicationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [token]);

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/role-requests/token/${token}`);
      if (res.data?.success) {
        setApplication(res.data.data);
        setFormData(res.data.data.submittedFormData || {});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired application link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append("formData", JSON.stringify(formData));

      files.forEach((file) => {
        dataPayload.append("files", file);
      });

      const res = await axios.post(`/api/role-requests/token/${token}/submit`, dataPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setIsSuccess(true);
        toast.success("Credentials submitted for Admin Review!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-16">
          Loading verification form...
        </div>
      </SidebarLayout>
    );
  }

  if (!application) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex items-center justify-center p-6 text-center py-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg max-w-md w-full">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-lg">Invalid or Expired Link</h3>
            <p className="text-xs text-slate-500 mt-1">
              This application link may have expired or been used. Please log in to your dashboard to request a new link.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const formFields = application.form?.fields || [];
  const requestedRole = application.requestedRole;

  return (
    <SidebarLayout>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Official Credential Verification
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {requestedRole.replace("_", " ")} Application
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Applicant: <strong>{application.user?.name}</strong> ({application.user?.email})
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {isSuccess || application.status === "PENDING_REVIEW" ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Application Under Review</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your credentials and documentation for the role of <strong>{requestedRole}</strong> have been submitted to the SwasthaKosh Medical Administration. You will receive an email once approved.
                </p>
                <div className="pt-4">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    <span>Return to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-xs text-slate-500 border-b pb-4">
                  Please fill out the verified details required by medical regulatory standards. All submitted licenses are checked against State Medical Councils and DGMS registries.
                </div>

                {/* Dynamic Field Renderer */}
                <div className="space-y-4">
                  {formFields.map((field) => {
                    const val = formData[field.name] || "";

                    if (field.type === "file") {
                      return (
                        <div key={field.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                          </label>
                          {field.helpText && <p className="text-[11px] text-slate-500 mb-2">{field.helpText}</p>}
                          <div className="mt-2 flex items-center gap-3">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    }

                    if (field.type === "select") {
                      return (
                        <div key={field.name}>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            value={val}
                            required={field.isRequired}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                          >
                            <option value="">-- Select Option --</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === "checkbox") {
                      return (
                        <label
                          key={field.name}
                          className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs text-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={!!val}
                            required={field.isRequired}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded mt-0.5"
                          />
                          <span>{field.label}</span>
                        </label>
                      );
                    }

                    if (field.type === "textarea") {
                      return (
                        <div key={field.name}>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                          </label>
                          <textarea
                            rows={3}
                            value={val}
                            required={field.isRequired}
                            placeholder={field.placeholder || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={field.name}>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {field.label} {field.isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          value={val}
                          required={field.isRequired}
                          placeholder={field.placeholder || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitting ? "Submitting Application..." : "Submit for Admin Review"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </SidebarLayout>
  );
};

export default RoleApplicationPage;
