import type { ISODateString, ISODateTimeString } from './common.ts'

/**
 * Logged execution session representing real time spent by the user.
 * Actual duration is strictly separated from planned duration.
 */
export interface ActualExecutionSession {
  id: string
  userId: string
  goalId: string
  /** Reference to the planned session that triggered this execution, if applicable. */
  plannedSessionId?: string
  startedAt: ISODateTimeString
  endedAt: ISODateTimeString
  /**
   * Actual executed duration in minutes.
   * Strictly maintained separately from planned duration.
   */
  actualDurationMinutes: number
  /** User notes on execution progress and outcomes. */
  notes?: string
  /** Optional subjective focus rating (1 = fragmented, 5 = deep flow). */
  focusRating?: 1 | 2 | 3 | 4 | 5
  /** Optional subjective energy rating (1 = exhausted, 5 = peak energy). */
  energyRating?: 1 | 2 | 3 | 4 | 5
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Standard categorized causes for missing or abandoning a planned task.
 * Supports systemic learning to diagnose failure modes without judgment.
 */
export type MissedTaskReason =
  | 'work_or_study_responsibility'
  | 'unexpected_event'
  | 'tiredness'
  | 'distraction'
  | 'procrastination'
  | 'task_too_large'
  | 'did_not_understand_task'
  | 'other'

/**
 * Historical record of a planned session that was not completed as scheduled.
 */
export interface MissedTaskRecord {
  id: string
  userId: string
  plannedSessionId: string
  goalId: string
  missedDate: ISODateString
  /** The duration originally scheduled for this task. */
  plannedDurationMinutes: number
  /** The primary categorized reason why the task was missed. */
  reason: MissedTaskReason
  /** User-provided context or explanation for why the session did not happen. */
  reasonDetails?: string
  /** Linked recovery plan ID, if a recovery workflow has been initiated. */
  recoveryPlanId?: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Lifecycle status of a task recovery plan.
 */
export type RecoveryStatus =
  | 'pending'
  | 'rescheduled'
  | 'in_progress'
  | 'completed'
  | 'abandoned'

/**
 * Structured recovery action plan for handling missed work.
 * Preserves context on why the task was missed, what scope remains,
 * and how/when it is rescheduled to avoid silent debt accumulation.
 */
export interface RecoveryPlan {
  id: string
  userId: string
  missedTaskId: string
  goalId: string
  /** Categorized reason explaining why the original session was missed. */
  reason: MissedTaskReason
  /** Clear summary of why the task was missed. */
  reasonSummary: string
  /** Scope and description of remaining work that still needs to be done. */
  remainingWorkDescription: string
  /** Estimated duration in minutes needed to complete the remaining work. */
  remainingDurationMinutes: number
  /** Title or scope of the rescheduled recovery task. */
  rescheduledWorkTitle: string
  /** Scheduled calendar date targeted for recovery. */
  recoveryDate: ISODateString
  /** Reference to the new PlannedSession created to execute this recovery. */
  rescheduledSessionId?: string
  /** Execution status of the recovery commitment. */
  status: RecoveryStatus
  /** Timestamp when recovery was completed, if applicable. */
  completedAt?: ISODateTimeString
  notes?: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
