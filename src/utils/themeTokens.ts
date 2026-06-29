function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

function blend(hex: string, to: [number, number, number], t: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + (to[0] - r) * t, g + (to[1] - g) * t, b + (to[2] - b) * t)
}

function lighten(hex: string, t: number): string {
  return blend(hex, [255, 255, 255], t)
}
function darken(hex: string, t: number): string {
  return blend(hex, [0, 0, 0], t)
}

function luminance(hex: string): number {
  return hexToRgb(hex).reduce((sum, c, i) => {
    const s = c / 255
    const lin = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    return sum + lin * [0.2126, 0.7152, 0.0722][i]
  }, 0)
}

// Expand 5 brand colors into the full set of --lx-* CSS variables.
// Returns a minified CSS string ready to inject as a <style> block.
export function deriveThemeCSS(
  bg: string,
  brand: string,
  accent: string,
  light: string,
  text: string,
): string {
  const lightBg = luminance(bg) > 0.5
  const lightText = luminance(text) > 0.5
  const [tr, tg, tb] = hexToRgb(text)
  const [ar, ag, ab] = hexToRgb(accent)

  const tokens: [string, string][] = [
    ['--lx-bg', bg],
    ['--lx-bg-2', lightBg ? darken(bg, 0.06) : lighten(bg, 0.04)],
    ['--lx-surface', lightBg ? lighten(bg, 0.4) : lighten(bg, 0.06)],
    ['--lx-surface-2', lightBg ? darken(bg, 0.08) : lighten(bg, 0.09)],
    ['--lx-plate', lightBg ? darken(bg, 0.12) : lighten(bg, 0.13)],
    ['--lx-ink', text],
    ['--lx-ink-2', lightText ? darken(text, 0.15) : lighten(text, 0.15)],
    ['--lx-muted', lightText ? darken(text, 0.38) : lighten(text, 0.38)],
    ['--lx-rule', `rgba(${tr},${tg},${tb},0.10)`],
    ['--lx-plum', accent],
    ['--lx-plum-2', darken(accent, 0.12)],
    ['--lx-plum-dark', darken(accent, 0.25)],
    ['--lx-copper', brand],
    ['--lx-copper-2', darken(brand, 0.12)],
    ['--lx-copper-dark', darken(brand, 0.25)],
    ['--lx-gold', light],
    ['--lx-dust-rose', lighten(brand, 0.6)],
    ['--lx-dust-rose-light', lighten(brand, 0.75)],
    ['--lx-petal', lighten(brand, 0.85)],
    ['--lx-overlay', `rgba(${ar},${ag},${ab},0.50)`],
    ['--lx-sale', darken(brand, 0.08)],
    // Deep emerald on light themes for AA-readable success text; bright teal on dark themes.
    ['--lx-ok', lightBg ? '#16744a' : '#00B896'],
  ]

  const body = tokens.map(([k, v]) => `${k}:${v}`).join(';')
  return `:root,[data-theme]{${body}}`
}
