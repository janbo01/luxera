import { useEffect } from 'react'
import { getStoreSettings } from '../api/store'
import { deriveThemeCSS } from '../utils/themeTokens'

export function useStoreTheme() {
  useEffect(() => {
    getStoreSettings()
      .then((s) => {
        const css = deriveThemeCSS(s.theme_bg, s.theme_brand, s.theme_accent, s.theme_light, s.theme_text)
        let el = document.getElementById('lx-theme') as HTMLStyleElement | null
        if (!el) {
          el = document.createElement('style')
          el.id = 'lx-theme'
          document.head.appendChild(el)
        }
        el.textContent = css
      })
      .catch(() => {})
  }, [])
}
