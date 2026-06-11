import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { Palette, Density, HeroVariant } from '../types'

interface UIState {
  palette: Palette
  density: Density
  heroVariant: HeroVariant
  isLoginOpen: boolean
  loginMessage: string | null
  setPalette: (palette: Palette) => void
  setDensity: (density: Density) => void
  setHeroVariant: (heroVariant: HeroVariant) => void
  openLogin: (message?: string) => void
  closeLogin: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      palette: 'white',
      density: 'balanced',
      heroVariant: 'default',
      isLoginOpen: false,
      loginMessage: null,
      setPalette: (palette) => set({ palette }),
      setDensity: (density) => set({ density }),
      setHeroVariant: (heroVariant) => set({ heroVariant }),
      openLogin: (message) => set({ isLoginOpen: true, loginMessage: message ?? null }),
      closeLogin: () => set({ isLoginOpen: false, loginMessage: null }),
    }),
    {
      name: STORAGE_KEYS.ui,
      partialize: (state) => ({
        palette: state.palette,
        density: state.density,
        heroVariant: state.heroVariant,
      }),
    },
  ),
)
