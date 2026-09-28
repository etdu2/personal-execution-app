import type { DayOfWeek, ISODateString, ISODateTimeString, Priority } from './common.ts'

/**
 * User-defined category for classifying goals and measuring life/work balance.
 * (e.g., Deep Work, Health, Personal Projects, Craft — completely defined by the user).
 */
export interface GoalCategory {
  id: string
  userId: string
  name: string
  description?: string
  /** Color code in hex format (e.g., "#4F46E5") for visual grouping. */
  colorHex?: string
  /**
   * Optional target balance percentage (0-100) representing desired share of total effort.
   */
  targetBalancePercentage?: number
  isActive: boolean
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Supported planning horizons for long-term target milestones.
 */
export type LongTermTargetHorizon =
  | '1_year'
  | '9_months'
  | '6_months'
  | '3_months'
  | 'monthly'

/**
 * A milestone or target connected to a goal across defined time horizons.
 */
export interface LongTermTarget {
  id: string
  userId: string
  goalId: string
  horizon: LongTermTargetHorizon
  title: string
  description?: string
  targetDate?: ISODateString
  status: 'not_started' | 'in_progress' | 'achieved' | 'abandoned'
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Weekly target allocation boundaries for a goal.
 * Minimum hours ensure continuity; target hours represent ideal execution;
 * optional maximum hours guard against burnout and protect systemic balance.
 */
export interface WeeklyGoalTarget {
  /** Minimum hours per week required to maintain momentum. */
  minimumHours: number
  /** Primary target hours per week for steady progress. */
  targetHours: number
  /** Optional upper ceiling to guard against overcommitment and protect balance. */
  maximumHours?: number
}

/**
 * Defines how effort for a goal should be distributed across the week.
 * Supports distributing a goal across selected days rather than requiring every goal every day.
 */
export interface GoalDistribution {
  /** Specific days of the week when this goal is preferred to be scheduled. */
  preferredDays: DayOfWeek[]
  /** Optional target number of sessions per week (e.g., 3 sessions). */
  targetSessionsPerWeek?: number
  /** Preferred duration in minutes for a single session of this goal (e.g., 90 minutes). */
  preferredSessionDurationMinutes?: number
  /** Whether the system may schedule on non-preferred days if capacity requires flexibility. */
  isFlexible: boolean
}

/**
 * Lifecycle status of a goal.
 */
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

/**
 * Core Goal entity representing an ongoing priority or objective.
 */
export interface Goal {
  id: string
  userId: string
  categoryId: string
  title: string
  description?: string
  priority: Priority
  weeklyTarget: WeeklyGoalTarget
  distribution: GoalDistribution
  status: GoalStatus
  startDate: ISODateString
  endDate?: ISODateString
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
