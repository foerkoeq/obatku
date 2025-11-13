// ============================================================================
// STORE PROVIDER COMPONENT
// ============================================================================
// This component wraps the application with Jotai Provider for state management

import { Provider } from 'jotai'
import { ReactNode } from 'react'

interface StoreProviderProps {
  children: ReactNode
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <Provider>{children}</Provider>
}

