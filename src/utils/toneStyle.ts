import type { CSSProperties } from 'react'

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function toneStyle(tone: string | undefined): CSSProperties {
  if (!tone?.includes('#')) return {}
  const stops = tone
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (stops.length === 0) return {}
  const bg = stops.length === 1 ? stops[0] : `linear-gradient(160deg, ${stops.join(', ')})`
  const color = hexLuminance(stops[0]) > 0.5 ? 'var(--color-ink)' : 'var(--color-bg)'
  return { background: bg, color }
}

export function toneClass(tone: string | undefined, prefix: string): string {
  if (tone?.includes('#')) return ''
  return tone ? `${prefix}--${tone}` : ''
}
