import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAdmin: boolean;
  adminUser: string | null;
  setAdmin: (username: string | null) => void;
  logoutAdmin: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminUser: null,
      setAdmin: (username) => set({ isAdmin: !!username, adminUser: username }),
      logoutAdmin: () => set({ isAdmin: false, adminUser: null }),
    }),
    {
      name: 'kanvi-admin-auth',
    }
  )
);
