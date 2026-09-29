import type { DayOfWeek, FixedCommitment } from '../types/index.ts'
import { getOrderedDaysOfWeek } from './availabilityService.ts'

/**
 * Controlled string representations of commitment form inputs.
 */
export interface CommitmentFormData {
  title: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  description: string
}

/**
 * Validation error messages for fixed commitment inputs.
 */
export interface CommitmentValidationErrors {
  title?: string
  dayOfWeek?: string
  startTime?: string
  endTime?: string
  description?: string
}

export interface CommitmentValidationResult {
  isValid: boolean
  errors: CommitmentValidationErrors
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Converts a 24-hour time string ("HH:mm") into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(TIME_REGEX)
  if (!match) {
    return 0
  }
  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  return hours * 60 + minutes
}

/**
 * Calculates duration in integer minutes between start and end times.
 */
export function calculateCommitmentDurationMinutes(
  startTime: string,
  endTime: string,
): number {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)
  return Math.max(0, end - start)
}

/**
 * Calculates duration in decimal hours (e.g. 1.5) rounded to two decimal places.
 */
export function calculateCommitmentDurationHours(
  startTime: string,
  endTime: string,
): number {
  const minutes = calculateCommitmentDurationMinutes(startTime, endTime)
  return Math.round((minutes / 60) * 100) / 100
}

/**
 * Formats a duration in minutes into a concise human-readable string (e.g. "1h 30m" or "45m").
 */
export function formatCommitmentDurationDisplay(durationMinutes: number): string {
  if (durationMinutes <= 0) {
    return '0m'
  }
  const hours = Math.floor(durationMinutes / 60)
  const mins = durationMinutes % 60

  if (hours === 0) {
    return `${mins}m`
  }
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}m`
}

/**
 * Calculates total fixed commitment hours for a given day of the week.
 */
export function calculateDailyCommitmentHours(
  commitments: FixedCommitment[],
  day: DayOfWeek,
): number {
  const dayMinutes = commitments
    .filter((c) => c.dayOfWeek === day)
    .reduce((sum, c) => sum + c.durationMinutes, 0)

  return Math.round((dayMinutes / 60) * 100) / 100
}

/**
 * Calculates total fixed commitment hours across the entire week.
 */
export function calculateWeeklyCommitmentHours(
  commitments: FixedCommitment[],
): number {
  const totalMinutes = commitments.reduce(
    (sum, c) => sum + c.durationMinutes,
    0,
  )
  return Math.round((totalMinutes / 60) * 100) / 100
}

/**
 * Calculates usable planning capacity without mutating availability:
 * Available Time - Fixed Commitment Time = Usable Planning Capacity.
 * Enforces non-negative boundary.
 */
export function calculateUsablePlanningCapacity(
  availableHours: number,
  commitmentHours: number,
): number {
  return Math.max(0, Math.round((availableHours - commitmentHours) * 100) / 100)
}

/**
 * Sorts commitments chronologically by day of week progression, then by start time.
 */
export function sortCommitmentsByDayAndTime(
  commitments: FixedCommitment[],
  weekStartDay: 'monday' | 'sunday' = 'monday',
): FixedCommitment[] {
  const dayOrder = getOrderedDaysOfWeek(weekStartDay)
  const dayRankMap: Record<DayOfWeek, number> = {} as Record<DayOfWeek, number>
  dayOrder.forEach((day, index) => {
    dayRankMap[day] = index
  })

  return [...commitments].sort((a, b) => {
    const dayDiff = (dayRankMap[a.dayOfWeek] ?? 0) - (dayRankMap[b.dayOfWeek] ?? 0)
    if (dayDiff !== 0) {
      return dayDiff
    }
    return a.startTime.localeCompare(b.startTime)
  })
}

/**
 * Builds initial form data from an existing commitment or sensible defaults.
 */
export function getInitialCommitmentFormData(
  existing?: FixedCommitment,
  defaultDay: DayOfWeek = 'monday',
): CommitmentFormData {
  if (existing) {
    return {
      title: existing.title,
      dayOfWeek: existing.dayOfWeek,
      startTime: existing.startTime,
      endTime: existing.endTime,
      description: existing.description ?? '',
    }
  }

  return {
    title: '',
    dayOfWeek: defaultDay,
    startTime: '09:00',
    endTime: '10:00',
    description: '',
  }
}

/**
 * Validates fixed commitment form inputs according to domain rules.
 */
export function validateCommitmentForm(
  data: CommitmentFormData,
): CommitmentValidationResult {
  const errors: CommitmentValidationErrors = {}

  const trimmedTitle = data.title.trim()
  if (!trimmedTitle) {
    errors.title = 'Commitment title is required.'
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Title must be at least 2 characters.'
  }

  if (!data.startTime.trim() || !TIME_REGEX.test(data.startTime.trim())) {
    errors.startTime = 'Please enter a valid start time (HH:mm).'
  }

  if (!data.endTime.trim() || !TIME_REGEX.test(data.endTime.trim())) {
    errors.endTime = 'Please enter a valid end time (HH:mm).'
  }

  if (!errors.startTime && !errors.endTime) {
    const startMins = parseTimeToMinutes(data.startTime)
    const endMins = parseTimeToMinutes(data.endTime)

    if (endMins <= startMins) {
      errors.endTime = 'End time must be later than start time.'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Constructs a domain FixedCommitment entity from validated form data.
 */
export function createCommitmentFromFormData(
  data: CommitmentFormData,
  userId: string,
  existing?: FixedCommitment,
): FixedCommitment {
  const now = new Date().toISOString()
  const durationMinutes = calculateCommitmentDurationMinutes(
    data.startTime,
    data.endTime,
  )

  return {
    id:
      existing?.id ??
      `fix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title: data.title.trim(),
    dayOfWeek: data.dayOfWeek,
    description: data.description.trim() || undefined,
    isRecurring: true,
    startTime: data.startTime.trim(),
    endTime: data.endTime.trim(),
    durationMinutes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}
