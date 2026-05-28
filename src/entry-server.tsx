import { renderToReadableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

export async function render(url: string) {
  let didError = false

  const stream = await renderToReadableStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
    {
      onError(error) {
        didError = true
        console.error(error)
      },
    },
  )

  // Wait for all Suspense boundaries (including React.lazy routes) to resolve
  await stream.allReady

  if (didError) throw new Error('SSR render failed')

  const html = await new Response(stream).text()
  return { html }
}
