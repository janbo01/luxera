import { useEffect } from 'react'
import { getStoreSettings, type ApiStoreSettings } from '../api/store'
import { deriveThemeCSS } from '../utils/themeTokens'
import { useSettingsStore } from '../store/settingsStore'

declare global {
  interface Window {
    __SETTINGS_INITIAL__?: Partial<ApiStoreSettings>
  }
}

function applySocialSettings(s: Partial<ApiStoreSettings>) {
  useSettingsStore.getState().setSettings({
    instagram_url: s.instagram_url ?? '',
    whatsapp_number: s.whatsapp_number ?? '',
    bale_link: s.bale_link ?? '',
    ita_link: s.ita_link ?? '',
    support_phone: s.support_phone ?? '',
    support_landline: s.support_landline ?? '',
    store_name: s.store_name ?? '',
    tagline: s.tagline ?? '',
  })
}

export function useStoreTheme() {
  useEffect(() => {
    const injected = typeof window !== 'undefined' ? window.__SETTINGS_INITIAL__ : undefined
    if (injected && Object.keys(injected).length > 0) {
      // BaseLayout already injected byte-identical theme CSS as <style id="lx-theme">
      // from the same cached settings (fetchThemeStyleTag) — only sync the store.
      applySocialSettings(injected)
      return
    }

    getStoreSettings()
      .then((s) => {
        const css = deriveThemeCSS(
          s.theme_bg,
          s.theme_brand,
          s.theme_accent,
          s.theme_light,
          s.theme_text,
        )
        let el = document.getElementById('lx-theme') as HTMLStyleElement | null
        if (!el) {
          el = document.createElement('style')
          el.id = 'lx-theme'
          document.head.appendChild(el)
        }
        el.textContent = css
        applySocialSettings(s)
      })
      .catch(() => {})
  }, [])
}
