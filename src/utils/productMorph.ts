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

let active = false
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
  document.documentElement.dataset.vt = 'product'
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
      const hero = ev.newDocument?.querySelector<HTMLImageElement>('[data-vt-hero] img')
      if (hero && !ev.signal.aborted) await decodeWithin(hero, HERO_DECODE_BUDGET_MS)
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
    const { finished } = (e as TransitionBeforeSwapEvent).viewTransition
    finished.then(done, done)
  })

  document.addEventListener('astro:after-swap', () => {
    if (active) document.documentElement.dataset.vt = 'product'
  })
}
