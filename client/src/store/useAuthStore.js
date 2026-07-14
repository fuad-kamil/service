import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, registerUser, logoutUser, getMe } from '../api/authAPI';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isInitialized: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await loginUser(credentials);
          localStorage.setItem('accessToken', data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await registerUser(userData);
          localStorage.setItem('accessToken', data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try { await logoutUser(); } catch {}
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null });
      },

      fetchMe: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) { set({ isInitialized: true }); return; }
          const { data } = await getMe();
          set({ user: data.user, isInitialized: true });
        } catch {
          localStorage.removeItem('accessToken');
          set({ user: null, accessToken: null, isInitialized: true });
        }
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);

export default useAuthStore;
