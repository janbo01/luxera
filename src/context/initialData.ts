import { createContext, useContext } from 'react'
import type { ApiBanner } from '../api/store'

export interface ServerInitialData {
  product?: unknown
  collection?: unknown
  collections?: unknown
  categoryProducts?: unknown
  categoryResolvedId?: string | null
  banners?: ApiBanner[]
}

const InitialDataContext = createContext<ServerInitialData>({})

export { InitialDataContext }

export function useInitialData(): ServerInitialData {
  return useContext(InitialDataContext)
}
