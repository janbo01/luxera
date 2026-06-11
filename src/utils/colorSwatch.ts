export function hexToSwatch(hex: string | undefined | null): string {
  if (!hex) return 'transparent'
  const stops = hex
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (stops.length === 1) return stops[0]
  return `linear-gradient(135deg, ${stops.join(', ')})`
}
