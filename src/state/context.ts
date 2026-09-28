import { createContext } from 'react'
import type {
  Goal,
  GoalCategory,
  ISODateString,
  Priority,
  User,
} from '../types/index.ts'

export interface AppState {
  user: User | null
  activeDate: ISODateString
  isInitialized: boolean
  goals: Goal[]
  categories: GoalCategory[]
}

export interface AppContextValue {
  state: AppState
  setActiveDate: (date: ISODateString) => void
  setUser: (user: User | null) => void
  addGoal: (goal: Goal) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (goalId: string) => void
  archiveGoal: (goalId: string) => void
  setGoalPriority: (goalId: string, priority: Priority) => void
  addCategory: (category: GoalCategory) => void
}

export const AppContext = createContext<AppContextValue | undefined>(undefined)
