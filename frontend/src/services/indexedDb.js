import { openDB } from "idb";
import axios from "./axios";

const DB_NAME = "silicosis_offline_db";
const STORE_SCREENINGS = "pending_screenings";
const STORE_WORKERS = "cached_workers";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_SCREENINGS)) {
        db.createObjectStore(STORE_SCREENINGS, { keyPath: "offlineId", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_WORKERS)) {
        db.createObjectStore(STORE_WORKERS, { keyPath: "_id" });
      }
    },
  });
}

export async function saveOfflineScreening(screeningData) {
  const db = await getDB();
  const item = {
    ...screeningData,
    offlineCreated: true,
    offlineTimestamp: new Date().toISOString(),
  };
  const id = await db.add(STORE_SCREENINGS, item);
  return id;
}

export async function getPendingOfflineScreenings() {
  const db = await getDB();
  return await db.getAll(STORE_SCREENINGS);
}

export async function deleteOfflineScreening(offlineId) {
  const db = await getDB();
  return await db.delete(STORE_SCREENINGS, offlineId);
}

export async function syncPendingScreenings() {
  const pending = await getPendingOfflineScreenings();
  if (!pending || pending.length === 0) {
    return { count: 0, message: "No pending screenings to sync" };
  }

  try {
    const res = await axios.post("/api/screenings/sync-offline", { screenings: pending });
    if (res.data?.success) {
      // Clear synced items
      const db = await getDB();
      const tx = db.transaction(STORE_SCREENINGS, "readwrite");
      await tx.store.clear();
      await tx.done;
      return { count: pending.length, success: true, results: res.data.results };
    }
    return { count: 0, success: false, error: res.data?.message };
  } catch (err) {
    console.error("Sync error:", err);
    return { count: 0, success: false, error: err.message };
  }
}
