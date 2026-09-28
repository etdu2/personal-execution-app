import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type {
  Goal,
  GoalCategory,
  ISODateString,
  LongTermTarget,
  Priority,
  User,
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
}

export function AppProvider({
  children,
  initialUser = null,
  initialDate,
  initialGoals = [],
  initialCategories = [],
  initialTargets = [],
}: AppProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [activeDate, setActiveDate] = useState<ISODateString>(
    initialDate ?? getTodayISODate(),
  )
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [categories, setCategories] =
    useState<GoalCategory[]>(initialCategories)
  const [targets, setTargets] = useState<LongTermTarget[]>(initialTargets)

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

  const value = useMemo<AppContextValue>(
    () => ({
      state: {
        user,
        activeDate,
        isInitialized: true,
        goals,
        categories,
        targets,
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
    }),
    [
      user,
      activeDate,
      goals,
      categories,
      targets,
      addGoal,
      updateGoal,
      deleteGoal,
      archiveGoal,
      setGoalPriority,
      addCategory,
      saveGoalTargets,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
