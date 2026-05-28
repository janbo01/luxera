import { renderToReadableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { InitialDataContext, type ServerInitialData } from './context/initialData'

export async function render(url: string, initialData: ServerInitialData = {}) {
  let didError = false

  const stream = await renderToReadableStream(
    <InitialDataContext.Provider value={initialData}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </InitialDataContext.Provider>,
    {
      onError(error) {
        didError = true
        // eslint-disable-next-line no-console
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
