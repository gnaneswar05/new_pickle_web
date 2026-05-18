import { create } from 'zustand';

interface SettingsState {
  logoUrl: string | null;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  logoUrl: null,
  fetchSettings: async () => {
    if (get().logoUrl) return; // Already fetched
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.defaultProductImage) {
        set({ logoUrl: data.defaultProductImage });
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  }
}));
