// Card → product page shared-element morph, layered on Astro's ClientRouter view transitions.
//
// The clicked card's photo and the product gallery's main photo share the `product-hero`
// view-transition-name, so the browser morphs one into the other. <html data-vt="product">
// scopes the rest of the page's choreography in index.css to these navigations. Astro replaces
// <html>'s attributes on swap, so it's re-applied in astro:after-swap, before the browser
// captures the new page.
//
// There is deliberately no morph back on Back: the home rails and category grid render their
// cards client-side after hydration, so the card doesn't exist yet when the browser captures
// the restored page.
import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from 'astro:transitions/client'
import { imgSet, type ImgSetOptions } from './cdnImage'

export const HERO_NAME = 'product-hero'

/** The gallery's main <img> candidates — shared so hover-warming fetches the exact same file. */
export const GALLERY_HERO_IMG: ImgSetOptions = {
  widths: [480, 640, 960, 1280],
  sizes: '(max-width: 1024px) 100vw, 45vw',
}

/**
 * Longest the click may wait for the gallery photo to decode before the transition starts.
 * Without it the morph lands on an empty box and the photo pops in after; past this the
 * navigation goes ahead anyway rather than feel stuck on a slow connection.
 */
const HERO_DECODE_BUDGET_MS = 350

/**
 * The morph only runs if it can start this soon after the tap. A shared-element morph moves
 * a box from the card's size to the gallery's, and Chrome counts that as a layout shift
 * unless it happens within 500ms of the input. Slower than this (a slow page fetch), the
 * navigation uses the plain page transition instead.
 */
const MORPH_START_BUDGET_MS = 450

let active = false
let clickedAt = 0
// Bumped per card click, so a transition that ends late can't clear the state of a newer one.
let generation = 0
const warmed = new Set<string>()

const motionOK = () =>
  typeof document !== 'undefined' &&
  'startViewTransition' in document &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The header isn't sticky — it scrolls away with the page. Pinning it (its own layer, held in
// place) only makes sense while it's on screen; pinned from off-screen it would swoop in from
// far above. It's a persisted element, so the mark survives the swap.
const siteHeader = () => document.querySelector<HTMLElement>('.vt-site-header')

function reset() {
  active = false
  delete document.documentElement.dataset.vt
  delete document.documentElement.dataset.vtMorph
  const header = siteHeader()
  if (header) delete header.dataset.vtPin
}

/** Card click: name this card's photo as the hero and hide its overlays before the snapshot. */
export function startProductMorph(card: HTMLElement | null) {
  if (!card || !motionOK()) return
  // Only one element may hold a name at a time — clear any previous holder (e.g. the gallery
  // when opening a related product from a product page).
  document
    .querySelectorAll<HTMLElement>('[data-vt-hero]')
    .forEach((el) => (el.style.viewTransitionName = ''))
  const media = card.querySelector<HTMLElement>('.product-media')
  if (!media) return
  media.style.viewTransitionName = HERO_NAME
  card.dataset.vtLeaving = ''
  const header = siteHeader()
  if (header && header.getBoundingClientRect().bottom > 0) header.dataset.vtPin = ''
  active = true
  generation++
  clickedAt = performance.now()
  document.documentElement.dataset.vt = 'product'
}

/** Too late for the morph: un-name the card so this navigation gets the plain transition. */
function dropMorph() {
  document.querySelectorAll<HTMLElement>('[data-vt-leaving]').forEach((card) => {
    delete card.dataset.vtLeaving
    const media = card.querySelector<HTMLElement>('.product-media')
    if (media) media.style.viewTransitionName = ''
  })
  reset()
}

/**
 * Fetch the gallery-size photo ahead of the click (hover intent / pointer down), so by the
 * time the product page swaps in the image is already in the memory cache.
 */
export function warmProductHero(url: string | undefined) {
  if (!url || warmed.has(url) || !motionOK()) return
  warmed.add(url)
  const { src, srcSet, sizes } = imgSet(url, GALLERY_HERO_IMG)
  const img = new Image()
  if (sizes) img.sizes = sizes
  if (srcSet) img.srcset = srcSet
  img.src = src
}

function decodeWithin(source: HTMLImageElement, ms: number): Promise<unknown> {
  const img = new Image()
  const sizes = source.getAttribute('sizes')
  const srcset = source.getAttribute('srcset')
  if (sizes) img.sizes = sizes
  if (srcset) img.srcset = srcset
  img.src = source.getAttribute('src') ?? ''
  return Promise.race([
    img.decode().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ])
}

const HERO_GROUP = `::view-transition-group(${HERO_NAME})`
/** The photo's glide — index.css used to carry these on the group's CSS animation. */
const HERO_GLIDE = { duration: 560, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' }

/**
 * The photo morph, as transform + clip-path. The browser's own morph animates the group's
 * width and height, and Chrome reports every frame of that as a layout shift once the click
 * is more than 500ms old (always, on a slow connection). index.css switches that animation
 * off (html[data-vt-morph]), so the box sits at the gallery's final size from the first
 * frame; here it starts scaled down to cover the card (uniformly — no stretching), clipped
 * to the card's shape, and glides into place. The old snapshot is drawn object-fit: contain,
 * which at the first frame is exactly that clipped card window.
 */
function morphByTransform(card: DOMRect | null) {
  const root = document.documentElement
  const to = getComputedStyle(root, HERO_GROUP)
  const nw = parseFloat(to.width)
  const nh = parseFloat(to.height)
  let n: DOMMatrix | null = null
  try {
    n = new DOMMatrix(to.transform)
  } catch {
    /* no morph, the photo just fades in place */
  }
  // Only a plain move is handled; anything else simply crossfades in place.
  if (!card || !n || n.a !== 1 || n.d !== 1 || n.b || n.c) return
  if (![card.width, card.height, nw, nh].every((v) => v > 0)) return
  const s = Math.max(card.width / nw, card.height / nh)
  const ix = (nw - card.width / s) / 2
  const iy = (nh - card.height / s) / 2
  const radius = parseFloat(to.borderTopLeftRadius) || 0
  root.animate(
    [
      {
        transformOrigin: '0 0',
        transform: `translate(${card.x - s * ix}px, ${card.y - s * iy}px) scale(${s})`,
        clipPath: `inset(${iy}px ${ix}px round ${radius / s}px)`,
      },
      {
        transformOrigin: '0 0',
        transform: `translate(${n.e}px, ${n.f}px)`,
        clipPath: `inset(0px 0px round ${radius}px)`,
      },
    ],
    { pseudoElement: HERO_GROUP, ...HERO_GLIDE, fill: 'both' },
  )
}

/** True between a card click and the end of its morph (ScrollToTop leaves these alone). */
export const isProductMorphActive = () => active

let installed = false

/** Wire the router listeners once (called from the persisted AppShell). */
export function installProductMorph() {
  if (installed || typeof document === 'undefined') return
  installed = true

  document.addEventListener('astro:before-preparation', (e) => {
    // Any navigation not started by a card click (links, Back) gets the default transition.
    if (!active || !motionOK()) return reset()
    const ev = e as TransitionBeforePreparationEvent
    const load = ev.loader
    ev.loader = async () => {
      await load()
      const left = () => MORPH_START_BUDGET_MS - (performance.now() - clickedAt)
      const hero = ev.newDocument?.querySelector<HTMLImageElement>('[data-vt-hero] img')
      if (hero && !ev.signal.aborted && left() > 0) {
        await decodeWithin(hero, Math.min(HERO_DECODE_BUDGET_MS, left()))
      }
      if (left() <= 0) dropMorph()
    }
  })

  document.addEventListener('astro:before-swap', (e) => {
    if (!active) return
    // finished settles (or rejects) when the transition ends, is skipped or aborted — reset on
    // either outcome, unless another card click has taken over since.
    const mine = generation
    const done = () => {
      if (generation === mine) reset()
    }
    const { finished, ready } = (e as TransitionBeforeSwapEvent).viewTransition
    // The old page is still in place: its card photo's box is what the browser just
    // captured, and where the morph starts.
    const card =
      document
        .querySelector<HTMLElement>('[data-vt-leaving] .product-media')
        ?.getBoundingClientRect() ?? null
    ready.then(
      () => morphByTransform(card),
      () => {},
    )
    finished.then(done, done)
  })

  document.addEventListener('astro:after-swap', () => {
    if (!active) return
    document.documentElement.dataset.vt = 'product'
    document.documentElement.dataset.vtMorph = ''
  })
}
