import { create } from 'zustand';
const useStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  squad: null,
  notifications: [],
  anxietyMode: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setSquad: (squad) => set({ squad }),
  setNotifications: (notifications) => set({ notifications }),
  setAnxietyMode: (anxietyMode) => set({ anxietyMode }),
}));
export default useStore;
