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

const WHITE: [number, number, number] = [255, 255, 255]
const BLACK: [number, number, number] = [0, 0, 0]

function lighten(hex: string, t: number): string {
  return blend(hex, WHITE, t)
}
function darken(hex: string, t: number): string {
  return blend(hex, BLACK, t)
}
/** Mix two colours: t=0 → a, t=1 → b. */
function mix(a: string, b: string, t: number): string {
  return blend(a, hexToRgb(b), t)
}

function luminance(hex: string): number {
  return hexToRgb(hex).reduce((sum, c, i) => {
    const s = c / 255
    const lin = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    return sum + lin * [0.2126, 0.7152, 0.0722][i]
  }, 0)
}

/** WCAG 2.x contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * Returns `color` untouched when it already reaches `min` contrast against every surface in
 * `against`; otherwise nudges it away from the page (darker on light themes, lighter on dark
 * ones) in 2% steps — the smallest correction that makes it readable, so the admin's hue and
 * character survive. This is what keeps ANY admin-chosen palette legible: the five stored
 * colours are intent, the tokens below are guaranteed.
 */
function ensureContrast(
  color: string,
  against: string[],
  min: number,
  towardDark: boolean,
): string {
  const worst = (c: string) => Math.min(...against.map((s) => contrastRatio(c, s)))
  if (worst(color) >= min) return color
  for (let t = 0.02; t <= 1; t += 0.02) {
    const c = towardDark ? darken(color, t) : lighten(color, t)
    if (worst(c) >= min) return c
  }
  return towardDark ? '#000000' : '#ffffff'
}

// Contrast targets (WCAG): body copy AAA-ish, interactive/accent text AA.
const MIN_INK = 7
const MIN_TEXT = 4.5

// Expand the 5 stored colours into the full set of --lx-* CSS variables.
//
//   bg      page background            → --lx-bg, bg-2, surface, surface-2, plate
//   text    body ink                   → --lx-ink, ink-2, muted, rule
//   accent  primary action ("plum")    → buttons, links, focus, selected states
//   brand   brand metal ("copper")     → kickers, stars, prices, decorative strokes
//   light   highlight ("gold")         → badges and soft fills
//
// Roles that carry text (ink, muted, plum, copper, sale, ok) are corrected until they read at
// ≥4.5:1 on bg, bg-2 AND surface, so `text-bg` on top of a `bg-plum`/`bg-copper` fill is always
// legible too. Variants (hover/dark) move in the theme's own direction: deeper on light themes,
// brighter on dark ones, so a hover state never sinks into a dark page.
// Returns a minified CSS string ready to inject as a <style> block.
export function deriveThemeCSS(
  bg: string,
  brand: string,
  accent: string,
  light: string,
  text: string,
): string {
  const lightBg = luminance(bg) > 0.5
  const deepen = (c: string, t: number) => (lightBg ? darken(c, t) : lighten(c, t))

  const bg2 = lightBg ? darken(bg, 0.06) : lighten(bg, 0.04)
  const surface = lightBg ? lighten(bg, 0.4) : lighten(bg, 0.06)
  const surface2 = lightBg ? darken(bg, 0.08) : lighten(bg, 0.09)
  const plate = lightBg ? darken(bg, 0.12) : lighten(bg, 0.13)
  const surfaces = [bg, bg2, surface]

  const ink = ensureContrast(text, surfaces, MIN_INK, lightBg)
  const [tr, tg, tb] = hexToRgb(ink)
  // Secondary text steps toward the page colour, then is re-checked so it never goes faint.
  const ink2 = ensureContrast(mix(ink, bg, 0.15), surfaces, MIN_INK, lightBg)
  const muted = ensureContrast(mix(ink, bg, 0.42), surfaces, MIN_TEXT, lightBg)

  const plum = ensureContrast(accent, surfaces, MIN_TEXT, lightBg)
  const copper = ensureContrast(brand, surfaces, MIN_TEXT, lightBg)
  const sale = ensureContrast(deepen(copper, 0.08), surfaces, MIN_TEXT, lightBg)
  // Dark text sits on gold fills (limited badge) — keep that pairing readable.
  const gold = ensureContrast(light, [ink], MIN_TEXT, !lightBg)
  // Success green: deep emerald on light themes, bright teal on dark ones, both ≥4.5:1.
  const ok = ensureContrast(lightBg ? '#16744a' : '#00B896', surfaces, MIN_TEXT, lightBg)

  const [ar, ag, ab] = hexToRgb(plum)

  const tokens: [string, string][] = [
    ['--lx-bg', bg],
    ['--lx-bg-2', bg2],
    ['--lx-surface', surface],
    ['--lx-surface-2', surface2],
    ['--lx-plate', plate],
    ['--lx-ink', ink],
    ['--lx-ink-2', ink2],
    ['--lx-muted', muted],
    ['--lx-rule', `rgba(${tr},${tg},${tb},${lightBg ? 0.1 : 0.14})`],
    ['--lx-plum', plum],
    ['--lx-plum-2', deepen(plum, 0.12)],
    ['--lx-plum-dark', deepen(plum, 0.25)],
    ['--lx-copper', copper],
    ['--lx-copper-2', deepen(copper, 0.12)],
    ['--lx-copper-dark', deepen(copper, 0.25)],
    ['--lx-gold', gold],
    // Tints are mixed from the page colour toward the brand (not toward white), so they sit
    // in the same family as the background on light AND dark themes.
    ['--lx-dust-rose', mix(bg, brand, lightBg ? 0.28 : 0.3)],
    ['--lx-dust-rose-light', mix(bg, brand, lightBg ? 0.16 : 0.18)],
    ['--lx-petal', mix(bg, brand, lightBg ? 0.09 : 0.1)],
    ['--lx-overlay', `rgba(${ar},${ag},${ab},0.50)`],
    ['--lx-sale', sale],
    ['--lx-ok', ok],
  ]

  const body = tokens.map(([k, v]) => `${k}:${v}`).join(';')
  // color-scheme makes native controls, scrollbars and autofill follow the theme.
  return `:root,[data-theme]{${body};color-scheme:${lightBg ? 'light' : 'dark'}}`
}
