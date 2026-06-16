import type { APIRoute } from 'astro'
import { generateSitemapXml } from '../lib/ssr'

export const GET: APIRoute = async () => {
  const xml = await generateSitemapXml()
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
