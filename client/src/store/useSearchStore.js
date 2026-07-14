import { create } from 'zustand';
import { getProviders } from '../api/providerAPI';
import { getCategories } from '../api/categoryAPI';

const useSearchStore = create((set) => ({
  providers: [],
  categories: [],
  total: 0,
  pages: 1,
  currentPage: 1,
  isLoading: false,
  filters: {
    search: '',
    category: '',
    providerType: '',
    city: '',
    minRating: '',
    verified: '',
    lat: null,
    lng: null,
    radius: 20,
  },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () =>
    set({
      filters: { search: '', category: '', providerType: '', city: '', minRating: '', verified: '', lat: null, lng: null, radius: 20 },
    }),

  fetchProviders: async (page = 1) => {
    set({ isLoading: true });
    try {
      const state = useSearchStore.getState();
      const params = { page, limit: 12, ...state.filters };
      // Remove empty values
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await getProviders(params);
      set({ providers: data.providers, total: data.total, pages: data.pages, currentPage: page, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await getCategories();
      set({ categories: data.categories });
    } catch {}
  },
}));

export default useSearchStore;
