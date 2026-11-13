// The inline script <HydrateReader /> emits. Kept in a module so BaseLayout can register
// its CSP hash in its own frontmatter, which runs before the response headers are sent.
export const READER_JS = `function __hydrate() {
  document.querySelectorAll('script[type="application/json"][data-hydrate]').forEach((el) => {
    try {
      window[el.dataset.hydrate] = JSON.parse(el.textContent || 'null')
    } catch {}
  })
}
__hydrate()
document.addEventListener('astro:page-load', __hydrate)`
