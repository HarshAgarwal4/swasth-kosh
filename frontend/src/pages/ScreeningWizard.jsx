import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  User,
  Shield,
  Stethoscope,
  Activity,
  Mic,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Save,
} from "lucide-react";
import axios from "../services/axios";
import { useStore } from "../zustand/store";
import { saveOfflineScreening } from "../services/indexedDb";
import { toast } from "react-toastify";
import SidebarLayout from "../components/SidebarLayout";
import OfflineBanner from "../components/OfflineBanner";
import AudioRecorder from "../components/AudioRecorder";

const ScreeningWizard = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const isOnline = useStore((state) => state.isOnline);
  const checkPendingSync = useStore((state) => state.checkPendingSync);
  const language = useStore((state) => state.language);
  const isHindi = language === "hi";

  const [currentStep, setCurrentStep] = useState(1);
  const [mines, setMines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioData, setAudioData] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      // Step 1: Worker / Subject
      name: user?.name || "Ramesh Sharma",
      age: 42,
      gender: "MALE",
      phone: user?.phone || "+91 9876543210",
      mineId: "",
      jobRole: "DRILLER",

      // Step 2: Exposure
      yearsOfExposure: 14,
      dailyHours: 8,
      dustExposureLevel: "HEAVY",
      ppeRegularity: "SOMETIMES",
      hasSandblastingOrDrilling: true,
      worksInClosedSpace: false,

      // Step 3: Symptoms
      coughDurationWeeks: 4,
      coughType: "PRODUCTIVE_MUCUS",
      breathlessnessGrade: 2,
      chestTightnessOrPain: true,
      wheezingOrWhistling: true,
      unexplainedFatigue: true,
      nightSweats: false,

      // Step 4: Spirometry
      fev1: 2.1,
      fvc: 3.4,
      fev1FvcRatio: 61.8,
      pef: 380,
    },
  });

  const fev1Val = watch("fev1");
  const fvcVal = watch("fvc");

  useEffect(() => {
    if (fev1Val && fvcVal && Number(fvcVal) > 0) {
      const calculated = Math.round((Number(fev1Val) / Number(fvcVal)) * 100 * 10) / 10;
      setValue("fev1FvcRatio", calculated);
    }
  }, [fev1Val, fvcVal, setValue]);

  useEffect(() => {
    // Fetch mines & workers
    const fetchMetadata = async () => {
      try {
        const [mRes, wRes] = await Promise.all([
          axios.get("/api/mines"),
          axios.get("/api/workers"),
        ]);
        if (mRes.data?.data) setMines(mRes.data.data);
        if (wRes.data?.data) {
          setWorkers(wRes.data.data);
          if (wRes.data.data.length > 0) {
            setSelectedWorkerId(wRes.data.data[0]._id);
            setValue("mineId", wRes.data.data[0].mineId?._id || wRes.data.data[0].mineId || "");
          }
        }
      } catch (e) {
        console.warn("Mines fetch warning:", e.message);
      }
    };
    fetchMetadata();
  }, [setValue]);

  const onFinalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      let workerIdToUse = selectedWorkerId;

      // If creating worker on the fly
      if (!workerIdToUse) {
        let mineIdToUse = formData.mineId || mines[0]?._id;
        if (!mineIdToUse) {
          // Fallback create mine if none exists
          const newMine = await axios.post("/api/mines", {
            name: "Jaipur Sandstone Quarry Unit 4",
            organization: "Rajasthan Mining Corp",
            location: { district: "Jaipur", state: "Rajasthan" },
          });
          mineIdToUse = newMine.data?.data?._id;
        }

        const workerRes = await axios.post("/api/workers", {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          phone: formData.phone,
          mineId: mineIdToUse,
          jobRole: formData.jobRole,
          yearsOfExposure: Number(formData.yearsOfExposure),
          dailyExposureHours: Number(formData.dailyHours),
          ppeUsage: formData.ppeRegularity,
        });
        workerIdToUse = workerRes.data?.data?._id;
      }

      const screeningPayload = {
        workerId: workerIdToUse,
        mineId: formData.mineId || mines[0]?._id,
        exposure: {
          dustExposureLevel: formData.dustExposureLevel,
          yearsOfExposure: Number(formData.yearsOfExposure),
          dailyHours: Number(formData.dailyHours),
          ppeRegularity: formData.ppeRegularity,
          hasSandblastingOrDrilling: !!formData.hasSandblastingOrDrilling,
          worksInClosedSpace: !!formData.worksInClosedSpace,
        },
        symptoms: {
          coughDurationWeeks: Number(formData.coughDurationWeeks),
          coughType: formData.coughType,
          breathlessnessGrade: Number(formData.breathlessnessGrade),
          chestTightnessOrPain: !!formData.chestTightnessOrPain,
          wheezingOrWhistling: !!formData.wheezingOrWhistling,
          unexplainedFatigue: !!formData.unexplainedFatigue,
          nightSweats: !!formData.nightSweats,
        },
        spirometryData: {
          fev1: Number(formData.fev1),
          fvc: Number(formData.fvc),
          fev1FvcRatio: Number(formData.fev1FvcRatio),
          pef: Number(formData.pef),
        },
        audioData: audioData || {
          audioUrl: "local_audio_stream",
          durationSeconds: 10,
          recordingType: "COUGH",
          aiAnalysis: {
            status: "COMPLETED",
            classification: "NORMAL",
            confidence: 0.88,
          },
        },
      };

      if (!isOnline) {
        // Save to IndexedDB
        await saveOfflineScreening(screeningPayload);
        await checkPendingSync();
        toast.info("Offline: Screening saved securely on device. Will auto-sync when online.");
        navigate("/dashboard");
        return;
      }

      // Online submission
      const res = await axios.post("/api/screenings", screeningPayload);
      if (res.data?.success) {
        toast.success("Multi-factor Screening complete!");
        navigate(`/screening/${res.data.data._id}/result`);
      } else {
        toast.error("Screening error: " + (res.data?.message || "Failed"));
      }
    } catch (err) {
      console.error("Screening submit error:", err);
      // Fallback save offline
      await saveOfflineScreening(formData);
      await checkPendingSync();
      toast.warning("Saved offline due to network interruption.");
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: isHindi ? "श्रमिक विवरण" : "Worker Profile", icon: User },
    { num: 2, title: isHindi ? "धूल संपर्क" : "Dust Exposure", icon: Shield },
    { num: 3, title: isHindi ? "श्वसन लक्षण" : "Symptoms", icon: AlertTriangle },
    { num: 4, title: isHindi ? "स्पाइरोमेट्री" : "Spirometry (PFT)", icon: Activity },
    { num: 5, title: isHindi ? "ऑडियो खांसी" : "Acoustic Audio", icon: Mic },
    { num: 6, title: isHindi ? "समीक्षा व जोखिम" : "Review & Submit", icon: FileText },
  ];

  return (
    <SidebarLayout>
      <OfflineBanner />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Wizard Stepper Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs mb-8">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="flex items-center gap-2 min-w-max">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-sm"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-indigo-900 font-bold" : "text-slate-500"
                    }`}
                  >
                    {s.num}. {s.title}
                  </span>
                  {s.num < steps.length && <div className="w-6 h-0.5 bg-slate-200 mx-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit(onFinalSubmit)}>
            {/* STEP 1: Worker Demographics */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    {isHindi ? "चरण 1: श्रमिक की व्यक्तिगत जानकारी" : "Step 1: Worker Demographic Profile"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select existing registered worker or enter new mining worker details
                  </p>
                </div>

                {workers.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Existing Registered Worker (Optional)
                    </label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => {
                        setSelectedWorkerId(e.target.value);
                        const found = workers.find((w) => w._id === e.target.value);
                        if (found) {
                          setValue("name", found.name);
                          setValue("age", found.age);
                          setValue("gender", found.gender);
                          setValue("phone", found.phone || "");
                          setValue("yearsOfExposure", found.yearsOfExposure || 5);
                          setValue("dailyHours", found.dailyExposureHours || 8);
                          setValue("jobRole", found.jobRole || "DRILLER");
                          setValue("mineId", found.mineId?._id || found.mineId || "");
                        }
                      }}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="">-- Create or Enter New Worker --</option>
                      {workers.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.workerCode}) - {w.location?.district || "Mining Zone"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      {...register("age", { required: true, min: 14, max: 90 })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      {...register("gender")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    >
                      <option value="MALE">Male (पुरुष)</option>
                      <option value="FEMALE">Female (महिला)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role</label>
                    <select
                      {...register("jobRole")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    >
                      <option value="DRILLER">Driller (ड्रिलर)</option>
                      <option value="CRUSHER_OPERATOR">Crusher Operator (क्रशर ऑपरेटर)</option>
                      <option value="LOADER_UNLOADER">Loader / Unloader (लोडर)</option>
                      <option value="CUTTER_POLISHER">Stone Cutter / Polisher (पत्थर कटर)</option>
                      <option value="TRANSPORT_DRIVER">Transport Driver</option>
                      <option value="OTHER_DUST_EXPOSED">Other Dust Exposed Work</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Occupational Exposure */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    {isHindi ? "चरण 2: कार्यस्थल पर धूल संपर्क का इतिहास" : "Step 2: Occupational Exposure Questionnaire"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Quantify cumulative respirable silica exposure and PPE protection factors
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Years in Dusty Work (धूल में काम के कुल वर्ष)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      {...register("yearsOfExposure", { required: true, min: 0 })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Average Daily Working Hours (प्रतिदिन कार्य के घंटे)
                    </label>
                    <input
                      type="number"
                      {...register("dailyHours", { required: true, min: 1, max: 24 })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Workplace Dust Concentration Level
                    </label>
                    <select
                      {...register("dustExposureLevel")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    >
                      <option value="EXTREME">Extreme (Crushing & Dry Sandblasting Zone)</option>
                      <option value="HEAVY">Heavy (Open Quartz / Sandstone Quarry)</option>
                      <option value="MODERATE">Moderate (Material Handling)</option>
                      <option value="LOW">Low (Ventilated Workshop / Peripheral)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Respiratory Mask / PPE Compliance
                    </label>
                    <select
                      {...register("ppeRegularity")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    >
                      <option value="ALWAYS">Always Wears Certified N95 Mask</option>
                      <option value="SOMETIMES">Sometimes / Intermittent</option>
                      <option value="RARELY">Rarely (Uses Cloth / Towel)</option>
                      <option value="NEVER">Never Wears PPE</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      {...register("hasSandblastingOrDrilling")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span>Performs direct dry drilling or sandblasting without water suppression</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      {...register("worksInClosedSpace")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span>Works in poorly ventilated or underground closed enclosure</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Respiratory Symptoms */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-indigo-600" />
                    {isHindi ? "चरण 3: श्वसन लक्षण प्रश्नावली" : "Step 3: Respiratory Symptom Checklist"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Standardized symptom questionnaire including mMRC dyspnea grades & red flags
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cough Duration in Weeks (खांसी की अवधि - सप्ताह)
                    </label>
                    <input
                      type="number"
                      {...register("coughDurationWeeks", { min: 0 })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cough Type (खांसी का प्रकार)
                    </label>
                    <select
                      {...register("coughType")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    >
                      <option value="NONE">No Cough (कोई खांसी नहीं)</option>
                      <option value="DRY">Dry Irritant Cough (सूखी खांसी)</option>
                      <option value="PRODUCTIVE_MUCUS">Productive Sputum / Mucus (बलगम वाली खांसी)</option>
                      <option value="HEMOPTYSIS_BLOOD">🚨 Blood-Streaked Sputum (बलगम में खून - Hemoptysis)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    mMRC Breathlessness / Dyspnea Grade (सांस फूलने का स्तर)
                  </label>
                  <select
                    {...register("breathlessnessGrade")}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                  >
                    <option value="0">Grade 0: Not troubled with breathlessness except with strenuous exercise</option>
                    <option value="1">Grade 1: Troubled by shortness of breath when hurrying on level ground or hill</option>
                    <option value="2">Grade 2: Walks slower than peers on level ground or stops for breath</option>
                    <option value="3">Grade 3: Stops for breath after walking ~100 meters on level ground</option>
                    <option value="4">Grade 4: Too breathless to leave the house or breathless when dressing</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input type="checkbox" {...register("chestTightnessOrPain")} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Chest Tightness or Discomfort (सीने में जकड़न या दर्द)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input type="checkbox" {...register("wheezingOrWhistling")} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Wheezing / Whistling Breathing Sound (सांस में सीटी की आवाज)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input type="checkbox" {...register("unexplainedFatigue")} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Severe Unexplained Fatigue (अत्यधिक थकान व कमजोरी)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input type="checkbox" {...register("nightSweats")} className="w-4 h-4 rounded text-indigo-600" />
                    <span>Night Sweats (रात में अत्यधिक पसीना - Suspected Silico-TB)</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: Spirometry Measurements */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    {isHindi ? "चरण 4: स्पाइरोमेट्री (फेफड़ा क्षमता माप)" : "Step 4: Spirometry Ventilatory Indices"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter pulmonary function parameters from handheld or portable screening spirometer
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      FEV1 (Forced Expiratory Volume in 1 sec, Liters)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("fev1", { required: true, min: 0.5, max: 7.0 })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      FVC (Forced Vital Capacity, Liters)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("fvc", { required: true, min: 0.5, max: 8.0 })}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Calculated FEV1 / FVC Ratio (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register("fev1FvcRatio", { required: true })}
                      className={`w-full py-2.5 px-3 border rounded-xl text-sm font-bold ${
                        watch("fev1FvcRatio") < 70
                          ? "bg-amber-50 border-amber-300 text-amber-900"
                          : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                    {watch("fev1FvcRatio") < 70 && (
                      <p className="text-[11px] text-amber-700 font-semibold mt-1">
                        ⚠️ Value &lt; 70% indicates potential airflow limitation / obstruction.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PEF (Peak Expiratory Flow, L/min)
                    </label>
                    <input
                      type="number"
                      {...register("pef")}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Respiratory Audio Capture */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-indigo-600" />
                    {isHindi ? "चरण 5: ऑडियो खांसी / श्वसन ध्वनि रिकॉर्डिंग" : "Step 5: Respiratory Audio & Acoustic Screening"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Record breath sounds or deep voluntary coughs to detect wheeze and crackle signals
                  </p>
                </div>

                <AudioRecorder
                  workerId={selectedWorkerId}
                  onAnalysisComplete={(data) => setAudioData(data)}
                />
              </div>
            )}

            {/* STEP 6: Review & Final Risk Submission */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    {isHindi ? "चरण 6: सारांश समीक्षा एवं एआई जोखिम गणना" : "Step 6: Review & Submit Screening"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verify entered parameters before computing multi-factor risk stratification
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-2">Worker & Mine:</span>
                    <div>Name: <strong>{watch("name")}</strong> ({watch("age")} yrs, {watch("gender")})</div>
                    <div>Role: <strong>{watch("jobRole")}</strong></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-2">Exposure Index:</span>
                    <div>Duration: <strong>{watch("yearsOfExposure")} years</strong> (~{watch("dailyHours")} hrs/day)</div>
                    <div>Dust Level: <strong>{watch("dustExposureLevel")}</strong> | PPE: {watch("ppeRegularity")}</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-2">Symptoms Reported:</span>
                    <div>Cough: <strong>{watch("coughType")}</strong> ({watch("coughDurationWeeks")} weeks)</div>
                    <div>Dyspnea mMRC: <strong>Grade {watch("breathlessnessGrade")}</strong></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-2">Spirometry Measurements:</span>
                    <div>FEV1 / FVC: <strong>{watch("fev1")}L / {watch("fvc")}L</strong></div>
                    <div>Ratio: <strong>{watch("fev1FvcRatio")}%</strong> (PEF: {watch("pef") || 380} L/min)</div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Medical Safety Disclaimer:</strong> This platform is designed for early occupational screening and risk prioritization. Generated scores do not replace certified clinical examinations.
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isHindi ? "पिछला" : "Previous"}
                </button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                >
                  {isHindi ? "अगला चरण" : "Next Step"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Calculating Multi-Factor Risk..." : isHindi ? "जोखिम स्कोर गणना करें" : "Calculate & Generate Risk Result"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </SidebarLayout>
  );
};

export default ScreeningWizard;
