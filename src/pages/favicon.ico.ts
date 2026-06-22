import type { APIRoute } from 'astro'

export const GET: APIRoute = () =>
  new Response(null, {
    status: 301,
    headers: {
      Location: '/favicon.svg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
