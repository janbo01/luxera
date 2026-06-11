import { useEffect } from 'react'
import { getStoreSettings } from '../api/store'
import { deriveThemeCSS } from '../utils/themeTokens'
import { useSettingsStore } from '../store/settingsStore'

export function useStoreTheme() {
  useEffect(() => {
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

        useSettingsStore.getState().setSettings({
          instagram_url: s.instagram_url,
          whatsapp_number: s.whatsapp_number,
          bale_link: s.bale_link,
          ita_link: s.ita_link,
          support_phone: s.support_phone,
          support_landline: s.support_landline,
          store_name: s.store_name,
          tagline: s.tagline,
        })
      })
      .catch(() => {})
  }, [])
}
