import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark' | 'system'
type LanguageCode = 'en' | 'vi'

type SettingState = {
  isMenuCollapsed: boolean
  theme: ThemeMode
  language: LanguageCode

  setMenuCollapsed: (value: boolean) => void
  setTheme: (theme: ThemeMode) => void
  setLanguage: (lang: LanguageCode) => void
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      isMenuCollapsed: false,
      theme: 'light',
      language: 'en',

      setMenuCollapsed: (value) => set({ isMenuCollapsed: value }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
        name: 'setting-storage',
        partialize: (state) => ({
            isMenuCollapsed: state.isMenuCollapsed,
            theme: state.theme,
            language: state.language,
        }),
    }
  )
)
