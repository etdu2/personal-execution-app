import { createContext } from 'react'
import type {
  Goal,
  GoalCategory,
  ISODateString,
  LongTermTarget,
  Priority,
  User,
  WeeklyAvailability,
} from '../types/index.ts'

export interface AppState {
  user: User | null
  activeDate: ISODateString
  isInitialized: boolean
  goals: Goal[]
  categories: GoalCategory[]
  targets: LongTermTarget[]
  weeklyAvailability: WeeklyAvailability | null
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
  saveGoalTargets: (goalId: string, targets: LongTermTarget[]) => void
  setWeeklyAvailability: (availability: WeeklyAvailability) => void
}

export const AppContext = createContext<AppContextValue | undefined>(undefined)
