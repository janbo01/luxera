import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { InitialDataContext } from './context/initialData'

// Reconstruct initial data from window globals injected by the SSR server so that
// components using useInitialData() see the same values on the client as they did
// during SSR, preventing React hydration mismatches.
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <InitialDataContext.Provider value={{
      banners: window.__BANNERS_INITIAL__,
      footerCategories: window.__FOOTER_INITIAL__?.categories,
      footerCollections: window.__FOOTER_INITIAL__?.collections,
    }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </InitialDataContext.Provider>
  </StrictMode>,
)
