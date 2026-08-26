import { create } from 'zustand';
import axios from '../services/axios';
import { toast } from 'react-toastify';
import { getPendingOfflineScreenings } from '../services/indexedDb';

export const useStore = create((set, get) => ({
  user: null,
  isLoading: true,
  language: localStorage.getItem("silicosis_lang") || "en",
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  notifications: [],
  unreadNotificationsCount: 0,
  activeCall: null,

  setLanguage: (lang) => {
    localStorage.setItem("silicosis_lang", lang);
    set({ language: lang });
  },

  setIsOnline: (status) => set({ isOnline: status }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
  setActiveCall: (call) => set({ activeCall: call }),

  setIsLoading: (data) => set({ isLoading: data }),
  setUser: (data) => set({ user: data }),

  fetchUser: async () => {
    try {
      let r = await axios.post('/me');
      if (r.status === 200) {
        if (r.data.status === 0) return;
        if (r.data.status === 1) {
          set({ user: r.data.user });
          get().fetchNotifications();
          get().checkPendingSync();
          return;
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await axios.get('/api/notifications');
      if (res.data?.success) {
        set({
          notifications: res.data.data,
          unreadNotificationsCount: res.data.unreadCount || 0,
        });
      }
    } catch (err) {
      console.warn("Notifications fetch:", err.message);
    }
  },

  checkPendingSync: async () => {
    try {
      const pending = await getPendingOfflineScreenings();
      set({ pendingSyncCount: pending?.length || 0 });
    } catch (err) {
      console.warn("Offline check:", err.message);
    }
  },

  logoutUser: async () => {
    try {
      await axios.post('/logout');
      set({ user: null, notifications: [] });
      toast.success("Logged out successfully");
    } catch (err) {
      set({ user: null });
    }
  },
}));