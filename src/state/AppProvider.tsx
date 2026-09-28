import { useMemo, useState, type ReactNode } from 'react'
import type { ISODateString, User } from '../types/index.ts'
import { getTodayISODate } from '../utils/index.ts'
import { AppContext, type AppContextValue } from './context.ts'

export interface AppProviderProps {
  children: ReactNode
  initialUser?: User | null
  initialDate?: ISODateString
}

export function AppProvider({
  children,
  initialUser = null,
  initialDate,
}: AppProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [activeDate, setActiveDate] = useState<ISODateString>(
    initialDate ?? getTodayISODate(),
  )

  const value = useMemo<AppContextValue>(
    () => ({
      state: {
        user,
        activeDate,
        isInitialized: true,
      },
      setActiveDate,
      setUser,
    }),
    [user, activeDate],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
