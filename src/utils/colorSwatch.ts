export function hexToSwatch(hex: string | undefined | null): string {
  if (!hex) return 'transparent'
  const stops = hex
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (stops.length === 1) return stops[0]
  return `linear-gradient(135deg, ${stops.join(', ')})`
}

export type ColorFamily = 'metal' | 'neutral' | 'colour' | 'multi'

/** Filter-panel group order and labels. */
export const COLOR_FAMILIES: { id: ColorFamily; label: string }[] = [
  { id: 'metal', label: 'فلزی' },
  { id: 'neutral', label: 'خنثی' },
  { id: 'colour', label: 'رنگی' },
  { id: 'multi', label: 'چندرنگ' },
]

/**
 * Groups an admin colour into a shopper-facing family, from its name and hex. Multi-stop
 * hex values are "multi", gold/silver names are "metal", low-saturation, very dark or
 * very light shades (and browns) are "neutral", the rest "colour".
 */
export function colorFamily(name: string, hex: string | undefined | null): ColorFamily {
  const stops = (hex ?? '').split(',').filter((s) => s.trim())
  if (stops.length > 1) return 'multi'
  if (/طلا|نقره|برنز|مسی/.test(name)) return 'metal'
  const m = /^#?([0-9a-f]{6})$/i.exec(stops[0]?.trim() ?? '')
  if (!m) return 'colour'
  const n = parseInt(m[1], 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (max !== min) {
    if (max === r) h = 60 * (((g - b) / (max - min)) % 6)
    else if (max === g) h = 60 * ((b - r) / (max - min) + 2)
    else h = 60 * ((r - g) / (max - min) + 4)
  }
  if (h < 0) h += 360
  const brown = h >= 15 && h <= 45 && l < 0.4
  if (s < 0.15 || l < 0.1 || l > 0.93 || brown) return 'neutral'
  return 'colour'
}
