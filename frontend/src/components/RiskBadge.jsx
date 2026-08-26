import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle, Clock } from "lucide-react";

const RiskBadge = ({ level, score, showScore = true, size = "md" }) => {
  const normalized = (level || "LOW").toUpperCase();

  const config = {
    HIGH: {
      bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
      indicator: "bg-red-500",
      icon: AlertTriangle,
      label: "High Risk",
      hindi: "उच्च जोखिम",
    },
    MODERATE: {
      bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      indicator: "bg-amber-500",
      icon: AlertCircle,
      label: "Moderate Risk",
      hindi: "मध्यम जोखिम",
    },
    LOW: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      indicator: "bg-emerald-500",
      icon: CheckCircle,
      label: "Low Risk",
      hindi: "कम जोखिम",
    },
    PENDING_ASSESSMENT: {
      bg: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      indicator: "bg-gray-400",
      icon: Clock,
      label: "Pending",
      hindi: "प्रतीक्षारत",
    },
  }[normalized] || {
    bg: "bg-gray-50 text-gray-700 border-gray-200",
    indicator: "bg-gray-400",
    icon: Clock,
    label: normalized,
    hindi: normalized,
  };

  const Icon = config.icon;
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.bg} ${
        isSmall ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${config.indicator} animate-pulse`} />
      <Icon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <span>{config.label}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="opacity-75 font-normal">({score}/100)</span>
      )}
    </span>
  );
};

export default RiskBadge;
