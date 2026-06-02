import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { Palette, Density, HeroVariant } from '../types'
import { DEFAULT_THEME, type ThemeId } from '../themes'

interface UIState {
  theme: ThemeId
  palette: Palette
  density: Density
  heroVariant: HeroVariant
  isLoginOpen: boolean
  loginMessage: string | null
  setTheme: (theme: ThemeId) => void
  setPalette: (palette: Palette) => void
  setDensity: (density: Density) => void
  setHeroVariant: (heroVariant: HeroVariant) => void
  openLogin: (message?: string) => void
  closeLogin: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      palette: 'white',
      density: 'balanced',
      heroVariant: 'default',
      isLoginOpen: false,
      loginMessage: null,
      setTheme: (theme) => set({ theme }),
      setPalette: (palette) => set({ palette }),
      setDensity: (density) => set({ density }),
      setHeroVariant: (heroVariant) => set({ heroVariant }),
      openLogin: (message) => set({ isLoginOpen: true, loginMessage: message ?? null }),
      closeLogin: () => set({ isLoginOpen: false, loginMessage: null }),
    }),
    {
      name: STORAGE_KEYS.ui,
      partialize: (state) => ({
        theme: state.theme,
        palette: state.palette,
        density: state.density,
        heroVariant: state.heroVariant,
      }),
    }
  )
)
