import { create } from 'zustand';
import translations from '../utils/translations';

const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('language') || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  t: (key) => {
    const lang = get().language;
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }
}));

export default useLanguageStore;
