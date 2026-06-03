import { create } from 'zustand'

interface SettingsState {
  instagram_url: string
  whatsapp_number: string
  bale_link: string
  ita_link: string
  support_phone: string
  support_landline: string
  store_name: string
  tagline: string
  setSettings: (s: Partial<Omit<SettingsState, 'setSettings'>>) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  instagram_url: '',
  whatsapp_number: '',
  bale_link: '',
  ita_link: '',
  support_phone: '',
  support_landline: '',
  store_name: '',
  tagline: '',
  setSettings: (s) => set(s),
}))
