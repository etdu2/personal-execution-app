import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type {
  Goal,
  GoalCategory,
  ISODateString,
  LongTermTarget,
  Priority,
  User,
  WeeklyAvailability,
} from '../types/index.ts'
import { getTodayISODate } from '../utils/index.ts'
import { AppContext, type AppContextValue } from './context.ts'

export interface AppProviderProps {
  children: ReactNode
  initialUser?: User | null
  initialDate?: ISODateString
  initialGoals?: Goal[]
  initialCategories?: GoalCategory[]
  initialTargets?: LongTermTarget[]
  initialWeeklyAvailability?: WeeklyAvailability | null
}

export function AppProvider({
  children,
  initialUser = null,
  initialDate,
  initialGoals = [],
  initialCategories = [],
  initialTargets = [],
  initialWeeklyAvailability = null,
}: AppProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [activeDate, setActiveDate] = useState<ISODateString>(
    initialDate ?? getTodayISODate(),
  )
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [categories, setCategories] =
    useState<GoalCategory[]>(initialCategories)
  const [targets, setTargets] = useState<LongTermTarget[]>(initialTargets)
  const [weeklyAvailability, setWeeklyAvailabilityState] =
    useState<WeeklyAvailability | null>(initialWeeklyAvailability)

  const addGoal = useCallback((goal: Goal) => {
    setGoals((prev) => [...prev, goal])
  }, [])

  const updateGoal = useCallback((updatedGoal: Goal) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
    )
  }, [])

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
    setTargets((prev) => prev.filter((t) => t.goalId !== goalId))
  }, [])

  const archiveGoal = useCallback((goalId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, status: 'archived', updatedAt: new Date().toISOString() }
          : g,
      ),
    )
  }, [])

  const setGoalPriority = useCallback(
    (goalId: string, priority: Priority) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, priority, updatedAt: new Date().toISOString() }
            : g,
        ),
      )
    },
    [],
  )

  const addCategory = useCallback((category: GoalCategory) => {
    setCategories((prev) => {
      if (prev.some((c) => c.id === category.id)) {
        return prev
      }
      return [...prev, category]
    })
  }, [])

  const saveGoalTargets = useCallback(
    (goalId: string, newTargets: LongTermTarget[]) => {
      setTargets((prev) => {
        const withoutGoal = prev.filter((t) => t.goalId !== goalId)
        return [...withoutGoal, ...newTargets]
      })
    },
    [],
  )

  const setWeeklyAvailability = useCallback(
    (availability: WeeklyAvailability) => {
      setWeeklyAvailabilityState(availability)
    },
    [],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      state: {
        user,
        activeDate,
        isInitialized: true,
        goals,
        categories,
        targets,
        weeklyAvailability,
      },
      setActiveDate,
      setUser,
      addGoal,
      updateGoal,
      deleteGoal,
      archiveGoal,
      setGoalPriority,
      addCategory,
      saveGoalTargets,
      setWeeklyAvailability,
    }),
    [
      user,
      activeDate,
      goals,
      categories,
      targets,
      weeklyAvailability,
      addGoal,
      updateGoal,
      deleteGoal,
      archiveGoal,
      setGoalPriority,
      addCategory,
      saveGoalTargets,
      setWeeklyAvailability,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
