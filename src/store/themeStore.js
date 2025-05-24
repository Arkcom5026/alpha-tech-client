// 📁 src/store/themeStore.js
import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDark;
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return { isDark: newTheme };
    }),
}));

export default useThemeStore;
