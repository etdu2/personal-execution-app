import type {
  DayOfWeek,
  ISODateString,
  ISODateTimeString,
  Priority,
  TimeString,
  TimeWindow,
} from './common.ts'

/**
 * User-defined fixed obligation that blocks execution capacity
 * (e.g., job shift, classes, doctor appointment, family commitment).
 * Completely customizable without any hardcoded assumptions.
 */
export interface FixedCommitment {
  id: string
  userId: string
  title: string
  dayOfWeek: DayOfWeek
  description?: string
  /** Whether this commitment repeats weekly or occurs on a single specific date. */
  isRecurring: boolean
  /** Days of the week on which this commitment repeats (if recurring). */
  recurringDays?: DayOfWeek[]
  /** Specific calendar date if this is a one-off commitment. */
  specificDate?: ISODateString
  startTime: TimeString
  endTime: TimeString
  /** Total commitment duration in minutes. */
  durationMinutes: number
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Daily available time budget and execution capacity for a given date.
 */
export interface DailyAvailableTime {
  id: string
  userId: string
  date: ISODateString
  /** Gross waking/available hours converted to minutes. */
  totalAvailableMinutes: number
  /** Total minutes consumed by fixed commitments on this day. */
  fixedCommitmentMinutes: number
  /** Remaining available minutes dedicated to goal execution. */
  netExecutionCapacityMinutes: number
  /** Discrete windows of time when goal execution can occur. */
  availableWindows?: TimeWindow[]
  /** Expected or reported energy level to guide session intensity. */
  energyLevel?: 'high' | 'medium' | 'low'
  notes?: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Status of a scheduled execution session.
 */
export type PlannedSessionStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'partially_completed'
  | 'missed'
  | 'cancelled'

/**
 * A scheduled session/task planned for execution on a specific date.
 * Planned duration is strictly separated from actual execution duration.
 */
export interface PlannedSession {
  id: string
  userId: string
  goalId: string
  title: string
  description?: string
  priority: Priority
  scheduledDate: ISODateString
  scheduledStartTime?: TimeString
  scheduledEndTime?: TimeString
  /**
   * Planned duration in minutes. Strictly preserved regardless of actual duration.
   */
  plannedDurationMinutes: number
  status: PlannedSessionStatus
  /** Indicates whether this session was generated as part of a recovery plan. */
  isRecoverySession: boolean
  /** Reference to the associated recovery plan, if applicable. */
  recoveryPlanId?: string
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * User-defined baseline available productive hours per day of the week.
 * Maps each DayOfWeek ('monday' through 'sunday') to the number of available hours (0-24).
 */
export type WeeklyAvailability = Record<DayOfWeek, number>
