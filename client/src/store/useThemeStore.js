import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('theme') || 'dark', // Default to dark as per original layout
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    
    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    set({ theme: nextTheme });
  },
  initTheme: () => {
    const currentTheme = get().theme;
    const root = window.document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
}));

export default useThemeStore;
