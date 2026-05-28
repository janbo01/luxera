import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'

const isProd = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 3000
const root = process.cwd()

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'none'",
}

async function createServer() {
  const app = express()

  app.use((_req, res, next) => {
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
    next()
  })

  if (!isProd) {
    const { createServer: createVite } = await import('vite')
    const vite = await createVite({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)

    app.use('*', async (req, res) => {
      const url = req.originalUrl
      try {
        let template = fs.readFileSync(path.join(root, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
        const { html: appHtml } = await render(url)
        const html = template.replace('<!--app-html-->', appHtml)
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
      } catch (e) {
        vite.ssrFixStacktrace(e as Error)
        console.error(e)
        res.status(500).end((e as Error).message)
      }
    })
  } else {
    const clientDir = path.join(root, 'dist', 'client')

    app.use(
      '/assets',
      express.static(path.join(clientDir, 'assets'), {
        maxAge: '1y',
        immutable: true,
      }),
    )
    app.use(express.static(clientDir, { index: false }))

    const entryUrl = pathToFileURL(
      path.join(root, 'dist', 'server', 'entry-server.js'),
    ).href
    const { render } = await import(entryUrl)
    const template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8')

    app.use('*', async (req, res) => {
      const url = req.originalUrl
      try {
        const { html: appHtml } = await render(url)
        const html = template.replace('<!--app-html-->', appHtml)
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
      } catch (e) {
        console.error(e)
        res.status(500).end((e as Error).message)
      }
    })
  }

  return app
}

createServer().then((app) => {
  app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`)
  })
})
