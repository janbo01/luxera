import { createContext, useContext } from 'react'

export interface ServerInitialData {
  product?: unknown
  collection?: unknown
  collections?: unknown
  categoryProducts?: unknown
  categoryResolvedId?: string | null
}

const InitialDataContext = createContext<ServerInitialData>({})

export { InitialDataContext }

export function useInitialData(): ServerInitialData {
  return useContext(InitialDataContext)
}
