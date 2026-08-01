// Rewrites ArvanCloud storage URLs through the self-hosted imgproxy instance
// (PUBLIC_IMAGE_CDN) so each <img> downloads a WebP sized to its box instead of
// the multi-hundred-KB original. When the proxy is not configured, or the image
// lives on another host, the original URL is returned untouched — safe to ship
// before the proxy is deployed.

const PROXY_BASE = ((import.meta.env.PUBLIC_IMAGE_CDN as string | undefined) ?? '').replace(
  /\/+$/,
  '',
)

// Hosts whose images imgproxy is allowed to fetch (must match IMGPROXY_ALLOWED_SOURCES).
const RESIZABLE_HOSTS = new Set([
  'image.luxera.ir',
  'image.shoorbaloo.com',
  'luxera-images.hot.ir-central1.arvanstorage.ir',
])

function base64Url(input: string): string {
  const b64 = typeof btoa === 'function' ? btoa(input) : Buffer.from(input).toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function isResizable(url: string): boolean {
  if (!PROXY_BASE) return false
  try {
    return RESIZABLE_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

// imgproxy runs in unsigned (/insecure/) mode — IMGPROXY_ALLOWED_SOURCES on the server
// closes the open-proxy/SSRF hole, but nothing server-side stops a crafted URL from
// asking for absurd dimensions (rs:fill:20000:20000 repeated with random sizes to burn
// worker time and dodge the CDN cache). Clamp here so every URL this module builds is
// within the range the proxy is actually deployed for; 0 stays 0 (source aspect ratio).
const MIN_DIMENSION = 16
const MAX_DIMENSION = 2560

function clampDimension(n: number): number {
  if (n === 0) return 0
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(n)))
}

/**
 * Single resized URL: fits/crops the image to `w`×`h` device pixels as WebP.
 * `h = 0` keeps the source aspect ratio. Use for fixed-size thumbnails.
 */
export function imgUrl(url: string, w: number, h = 0): string {
  if (!isResizable(url)) return url
  return `${PROXY_BASE}/insecure/rs:fill:${clampDimension(w)}:${clampDimension(h)}/${base64Url(url)}.webp`
}

// Hero LCP image config, shared between HeroSlider (the <img>) and the SSR
// preload hint (src/lib/ssr.ts) so the preload scanner selects the exact same
// resized candidate the <img> will request. Keep the two in sync.
export const HERO_LCP = {
  widths: [480, 720, 960, 1280],
  sizes: '(max-width: 767px) calc(100vw - 40px), 45vw',
} as const

export interface ImgSetOptions {
  /** Candidate widths in device pixels, ascending. */
  widths: number[]
  /** Crop ratio (width / height) matching the box, e.g. 1 for a square. 0 = keep source ratio. */
  ratio?: number
  /** The `sizes` attribute describing the box's rendered CSS width. */
  sizes: string
}

/**
 * Props for a responsive <img>: `src` (mid-size fallback), `srcSet` and `sizes`.
 * Spread onto the element: `<img {...imgSet(url, { widths: [320, 640], sizes: '50vw' })} />`
 */
export function imgSet(
  url: string,
  { widths, ratio = 0, sizes }: ImgSetOptions,
): { src: string; srcSet?: string; sizes?: string } {
  if (!isResizable(url)) return { src: url }

  const height = (w: number) => (ratio > 0 ? Math.round(w / ratio) : 0)
  const srcSet = widths.map((w) => `${imgUrl(url, w, height(w))} ${w}w`).join(', ')
  const fallback = widths[Math.min(widths.length - 1, 1)]

  return { src: imgUrl(url, fallback, height(fallback)), srcSet, sizes }
}
