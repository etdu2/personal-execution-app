import type { ISODateString, ISODateTimeString } from './common.ts'
import type { MissedTaskReason } from './execution.ts'

/**
 * Weekly execution summary for a specific goal.
 */
export interface GoalWeeklyReviewSummary {
  goalId: string
  goalTitle: string
  categoryId: string
  minimumHours: number
  targetHours: number
  maximumHours?: number
  plannedMinutes: number
  actualMinutes: number
  targetStatus: 'below_minimum' | 'minimum_met' | 'target_met' | 'ceiling_exceeded'
}

/**
 * Balance analysis showing how actual execution was distributed across life/work categories.
 */
export interface CategoryBalanceSummary {
  categoryId: string
  categoryName: string
  actualMinutes: number
  actualHours: number
  /** Actual proportion of total executed time this week (0-100%). */
  shareOfTotalPercentage: number
  /** Ideal/target allocation percentage set by user, if defined. */
  targetBalancePercentage?: number
}

/**
 * Frequency aggregation of reasons recorded for missed tasks during the week.
 */
export interface MissedReasonFrequency {
  reason: MissedTaskReason
  count: number
}

/**
 * Weekly review and retrospective entity.
 * Serves the core cycle: User executes → System learns → Plan improves.
 */
export interface WeeklyReview {
  id: string
  userId: string
  /** ISO date string for the first day of the reviewed week. */
  weekStartDate: ISODateString
  /** ISO date string for the last day of the reviewed week. */
  weekEndDate: ISODateString
  totalPlannedMinutes: number
  totalActualMinutes: number
  /** Overall execution compliance rate (actual / planned percentage). */
  executionRatePercentage: number
  /** Per-goal execution analysis. */
  goalSummaries: GoalWeeklyReviewSummary[]
  /** Distribution across categories to evaluate balance. */
  categorySummaries: CategoryBalanceSummary[]
  totalMissedTasks: number
  totalRecoveredTasks: number
  /** Frequency breakdown of missed task reasons to diagnose behavioral friction. */
  missedReasonBreakdown: MissedReasonFrequency[]
  /** Qualitative reflection: what worked well. */
  wins?: string
  /** Qualitative reflection: friction, bottlenecks, and unexpected obstacles. */
  challengesAndFriction?: string
  /** Concrete strategic adjustments committed for the upcoming week. */
  adjustmentsForNextWeek?: string
  /**
   * System-generated observational insights derived from execution patterns
   * (e.g. overcommitment warnings, optimal session length findings).
   */
  systemInsights?: string[]
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
