import React, { useState } from "react";
import { WifiOff, RefreshCw, Check } from "lucide-react";
import { useStore } from "../zustand/store";
import { syncPendingScreenings } from "../services/indexedDb";
import { toast } from "react-toastify";

const OfflineBanner = () => {
  const isOnline = useStore((state) => state.isOnline);
  const pendingSyncCount = useStore((state) => state.pendingSyncCount);
  const checkPendingSync = useStore((state) => state.checkPendingSync);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.warning("Cannot sync while offline. Please connect to internet.");
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncPendingScreenings();
      if (res.success) {
        toast.success(`Successfully synchronized ${res.count} offline screening(s) to cloud database!`);
        await checkPendingSync();
      } else {
        toast.error(res.error || "Sync failed");
      }
    } catch (e) {
      toast.error(e.message || "Failed to sync offline data");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-sm z-50 sticky top-0">
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-5 h-5 animate-pulse text-amber-200" />
            <span>
              <strong>Offline Mode Active:</strong> Screenings will be safely saved locally on this device and synced when connected.
            </span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5 text-emerald-300" />
            <span>
              <strong>Online:</strong> You have <strong>{pendingSyncCount}</strong> pending offline screening record(s) ready for cloud synchronization.
            </span>
          </>
        )}
      </div>

      {pendingSyncCount > 0 && isOnline && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 bg-white text-amber-900 font-semibold px-3 py-1 rounded-lg text-xs hover:bg-amber-50 active:scale-95 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing Records..." : `Sync Now (${pendingSyncCount})`}
        </button>
      )}
    </div>
  );
};

export default OfflineBanner;
