import { createContext } from 'react'
import type { ISODateString, User } from '../types/index.ts'

export interface AppState {
  user: User | null
  activeDate: ISODateString
  isInitialized: boolean
}

export interface AppContextValue {
  state: AppState
  setActiveDate: (date: ISODateString) => void
  setUser: (user: User | null) => void
}

export const AppContext = createContext<AppContextValue | undefined>(undefined)
