import type {
  DayOfWeek,
  Goal,
  GoalCategory,
  GoalDistribution,
  GoalStatus,
  LongTermTarget,
  LongTermTargetHorizon,
  Priority,
  WeeklyGoalTarget,
} from '../types/index.ts'
import { getTodayISODate } from '../utils/index.ts'

/**
 * Standard priority ordering directly mapping to domain Priority union.
 * Lower numerical value represents higher execution priority.
 */
export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

/**
 * All days of the week in standard Monday-to-Sunday progression.
 */
export const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

/**
 * Horizon metadata configuration mapping each domain horizon to its planning tier and description.
 */
export interface HorizonMetadata {
  horizon: LongTermTargetHorizon
  label: string
  tier: 'Long-term' | 'Medium-term' | 'Short-term'
  description: string
}

export const TARGET_HORIZONS: HorizonMetadata[] = [
  {
    horizon: '1_year',
    label: '1-Year Target',
    tier: 'Long-term',
    description: 'Long-term destination and major yearly milestone',
  },
  {
    horizon: '9_months',
    label: '9-Month Target',
    tier: 'Medium-term',
    description: 'Three-quarter progress milestone',
  },
  {
    horizon: '6_months',
    label: '6-Month Target',
    tier: 'Medium-term',
    description: 'Mid-year checkpoint milestone',
  },
  {
    horizon: '3_months',
    label: '3-Month Target',
    tier: 'Medium-term',
    description: 'Quarterly tactical target',
  },
  {
    horizon: 'monthly',
    label: 'Monthly Target',
    tier: 'Short-term',
    description: 'Short-term immediate monthly target',
  },
]

/**
 * Form data representation for a single milestone horizon target.
 */
export interface HorizonTargetFormData {
  title: string
  description: string
  targetDate: string
}

export type HorizonTargetsMap = Record<
  LongTermTargetHorizon,
  HorizonTargetFormData
>

export function createEmptyHorizonTargetsMap(): HorizonTargetsMap {
  return {
    '1_year': { title: '', description: '', targetDate: '' },
    '9_months': { title: '', description: '', targetDate: '' },
    '6_months': { title: '', description: '', targetDate: '' },
    '3_months': { title: '', description: '', targetDate: '' },
    monthly: { title: '', description: '', targetDate: '' },
  }
}

/**
 * Raw form input data for goal creation and modification.
 * Holds string representations prior to domain validation and casting.
 */
export interface GoalFormData {
  title: string
  description: string
  categoryId: string
  newCategoryName: string
  priority: Priority
  status: GoalStatus
  minimumHours: string
  targetHours: string
  maximumHours: string
  preferredDays: DayOfWeek[]
  targetSessionsPerWeek: string
  preferredSessionDurationMinutes: string
  isFlexible: boolean
  startDate: string
  endDate: string
  targets: HorizonTargetsMap
}

/**
 * Validation error messages for each field in the goal form.
 */
export interface GoalValidationErrors {
  title?: string
  categoryId?: string
  minimumHours?: string
  targetHours?: string
  maximumHours?: string
  preferredDays?: string
  startDate?: string
  endDate?: string
  targetErrors?: Partial<
    Record<
      LongTermTargetHorizon,
      {
        title?: string
        targetDate?: string
      }
    >
  >
}

export interface GoalValidationResult {
  isValid: boolean
  errors: GoalValidationErrors
}

/**
 * Sorts goals according to domain Priority hierarchy (critical -> high -> medium -> low),
 * sub-sorting alphabetically by title.
 */
export function sortGoalsByPriority(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const pDiff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]
    if (pDiff !== 0) {
      return pDiff
    }
    return a.title.localeCompare(b.title)
  })
}

/**
 * Constructs initial goal form values, either pre-filled from an existing goal or clean defaults.
 */
export function getInitialGoalFormData(
  existingGoal?: Goal,
  defaultCategoryId?: string,
  existingTargets?: LongTermTarget[],
): GoalFormData {
  const initialTargetsMap = createEmptyHorizonTargetsMap()

  if (existingTargets) {
    for (const target of existingTargets) {
      if (initialTargetsMap[target.horizon]) {
        initialTargetsMap[target.horizon] = {
          title: target.title,
          description: target.description ?? '',
          targetDate: target.targetDate ?? '',
        }
      }
    }
  }

  if (existingGoal) {
    return {
      title: existingGoal.title,
      description: existingGoal.description ?? '',
      categoryId: existingGoal.categoryId,
      newCategoryName: '',
      priority: existingGoal.priority,
      status: existingGoal.status,
      minimumHours: String(existingGoal.weeklyTarget.minimumHours),
      targetHours: String(existingGoal.weeklyTarget.targetHours),
      maximumHours:
        existingGoal.weeklyTarget.maximumHours !== undefined
          ? String(existingGoal.weeklyTarget.maximumHours)
          : '',
      preferredDays: existingGoal.distribution.preferredDays,
      targetSessionsPerWeek:
        existingGoal.distribution.targetSessionsPerWeek !== undefined
          ? String(existingGoal.distribution.targetSessionsPerWeek)
          : '',
      preferredSessionDurationMinutes:
        existingGoal.distribution.preferredSessionDurationMinutes !== undefined
          ? String(existingGoal.distribution.preferredSessionDurationMinutes)
          : '',
      isFlexible: existingGoal.distribution.isFlexible,
      startDate: existingGoal.startDate,
      endDate: existingGoal.endDate ?? '',
      targets: initialTargetsMap,
    }
  }

  return {
    title: '',
    description: '',
    categoryId: defaultCategoryId ?? '',
    newCategoryName: '',
    priority: 'medium',
    status: 'active',
    minimumHours: '2',
    targetHours: '5',
    maximumHours: '',
    preferredDays: ['monday', 'wednesday', 'friday'],
    targetSessionsPerWeek: '3',
    preferredSessionDurationMinutes: '60',
    isFlexible: true,
    startDate: getTodayISODate(),
    endDate: '',
    targets: initialTargetsMap,
  }
}

/**
 * Validates a goal form and its target time requirements against domain rules.
 */
export function validateGoalForm(
  data: GoalFormData,
  hasExistingCategories: boolean,
): GoalValidationResult {
  const errors: GoalValidationErrors = {}
  const targetErrors: GoalValidationErrors['targetErrors'] = {}

  const trimmedTitle = data.title.trim()
  if (!trimmedTitle) {
    errors.title = 'Goal title is required.'
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Goal title must be at least 2 characters.'
  }

  // Category validation: either an existing category is selected or a new one is typed
  if (!data.categoryId && !data.newCategoryName.trim()) {
    errors.categoryId = hasExistingCategories
      ? 'Please select a category or enter a new one.'
      : 'Please enter a category name for this goal.'
  }

  // Weekly hours validation:
  // 1. minimum hours cannot be negative and must be valid
  const minHours = Number(data.minimumHours)
  if (!data.minimumHours.trim() || Number.isNaN(minHours) || minHours < 0) {
    errors.minimumHours = 'Minimum hours must be a valid number (>= 0).'
  }

  // 2. target hours must be positive and >= minimum hours
  const targetHours = Number(data.targetHours)
  if (!data.targetHours.trim() || Number.isNaN(targetHours) || targetHours <= 0) {
    errors.targetHours = 'Target hours must be a valid positive number.'
  } else if (!Number.isNaN(minHours) && targetHours < minHours) {
    errors.targetHours = 'Target hours cannot be less than minimum hours.'
  }

  // 3. maximum hours (optional): cannot be less than target hours
  if (data.maximumHours.trim()) {
    const maxHours = Number(data.maximumHours)
    if (Number.isNaN(maxHours) || maxHours <= 0) {
      errors.maximumHours = 'Maximum hours must be a valid positive number.'
    } else if (!Number.isNaN(targetHours) && maxHours < targetHours) {
      errors.maximumHours = 'Maximum hours cannot be less than target hours.'
    }
  }

  // Distribution validation
  if (data.preferredDays.length === 0) {
    errors.preferredDays = 'Please select at least one preferred day.'
  }

  // Dates validation
  if (!data.startDate.trim()) {
    errors.startDate = 'Start date is required.'
  }

  if (data.endDate.trim() && data.startDate.trim()) {
    if (data.endDate < data.startDate) {
      errors.endDate = 'End date cannot be earlier than start date.'
    }
  }

  // Horizon Targets validation
  for (const item of TARGET_HORIZONS) {
    const horizonData = data.targets[item.horizon]
    if (horizonData) {
      const targetTitle = horizonData.title.trim()
      const targetDate = horizonData.targetDate.trim()

      if (targetTitle && targetTitle.length < 2) {
        targetErrors[item.horizon] = {
          ...targetErrors[item.horizon],
          title: 'Target title must be at least 2 characters if provided.',
        }
      }

      if (targetDate && data.startDate.trim() && targetDate < data.startDate.trim()) {
        targetErrors[item.horizon] = {
          ...targetErrors[item.horizon],
          targetDate: 'Target date cannot be earlier than goal start date.',
        }
      }
    }
  }

  if (Object.keys(targetErrors).length > 0) {
    errors.targetErrors = targetErrors
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Creates a new user-defined GoalCategory entity.
 */
export function createGoalCategory(name: string, userId: string): GoalCategory {
  const now = new Date().toISOString()
  return {
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    name: name.trim(),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Constructs a domain Goal entity from validated form data.
 */
export function createGoalFromFormData(
  data: GoalFormData,
  userId: string,
  resolvedCategoryId: string,
  existingGoal?: Goal,
): Goal {
  const now = new Date().toISOString()

  const weeklyTarget: WeeklyGoalTarget = {
    minimumHours: Number(data.minimumHours),
    targetHours: Number(data.targetHours),
    maximumHours: data.maximumHours.trim()
      ? Number(data.maximumHours)
      : undefined,
  }

  const distribution: GoalDistribution = {
    preferredDays: data.preferredDays,
    targetSessionsPerWeek: data.targetSessionsPerWeek.trim()
      ? Number(data.targetSessionsPerWeek)
      : undefined,
    preferredSessionDurationMinutes:
      data.preferredSessionDurationMinutes.trim()
        ? Number(data.preferredSessionDurationMinutes)
        : undefined,
    isFlexible: data.isFlexible,
  }

  return {
    id:
      existingGoal?.id ??
      `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    categoryId: resolvedCategoryId,
    title: data.title.trim(),
    description: data.description.trim() || undefined,
    priority: data.priority,
    weeklyTarget,
    distribution,
    status: data.status,
    startDate: data.startDate.trim(),
    endDate: data.endDate.trim() || undefined,
    createdAt: existingGoal?.createdAt ?? now,
    updatedAt: now,
  }
}

/**
 * Creates or updates domain LongTermTarget entities from validated form data for a given goal.
 */
export function createTargetsFromFormData(
  data: GoalFormData,
  userId: string,
  goalId: string,
  existingTargets: LongTermTarget[] = [],
): LongTermTarget[] {
  const now = new Date().toISOString()
  const result: LongTermTarget[] = []

  for (const item of TARGET_HORIZONS) {
    const horizonData = data.targets[item.horizon]
    if (!horizonData) {
      continue
    }

    const trimmedTitle = horizonData.title.trim()
    const existing = existingTargets.find(
      (t) => t.goalId === goalId && t.horizon === item.horizon,
    )

    if (trimmedTitle) {
      result.push({
        id:
          existing?.id ??
          `target_${Date.now()}_${item.horizon}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        goalId,
        horizon: item.horizon,
        title: trimmedTitle,
        description: horizonData.description.trim() || undefined,
        targetDate: horizonData.targetDate.trim() || undefined,
        status: existing?.status ?? 'not_started',
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      })
    }
  }

  return result
}
