import type { DayOfWeek, WeeklyAvailability } from '../types/index.ts'

/**
 * Controlled string representations of daily availability form inputs.
 */
export type WeeklyAvailabilityFormData = Record<DayOfWeek, string>

/**
 * Validation error messages mapped by DayOfWeek.
 */
export type WeeklyAvailabilityValidationErrors = Partial<
  Record<DayOfWeek, string>
>

export interface WeeklyAvailabilityValidationResult {
  isValid: boolean
  errors: WeeklyAvailabilityValidationErrors
}

/**
 * Returns days of the week in order based on user's planning start day preference.
 */
export function getOrderedDaysOfWeek(
  weekStartDay: 'monday' | 'sunday',
): DayOfWeek[] {
  if (weekStartDay === 'sunday') {
    return [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
  }
  return [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]
}

/**
 * Formats a DayOfWeek identifier into capitalized presentation string (e.g. "Monday").
 */
export function formatDayName(day: DayOfWeek): string {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

/**
 * Builds initial form data from existing availability or default capacity.
 */
export function getInitialAvailabilityFormData(
  availability: WeeklyAvailability | null,
  defaultHours?: number,
): WeeklyAvailabilityFormData {
  const fallback =
    defaultHours !== undefined && defaultHours > 0 ? String(defaultHours) : '0'

  if (availability) {
    return {
      monday: String(availability.monday),
      tuesday: String(availability.tuesday),
      wednesday: String(availability.wednesday),
      thursday: String(availability.thursday),
      friday: String(availability.friday),
      saturday: String(availability.saturday),
      sunday: String(availability.sunday),
    }
  }

  return {
    monday: fallback,
    tuesday: fallback,
    wednesday: fallback,
    thursday: fallback,
    friday: fallback,
    saturday: fallback,
    sunday: fallback,
  }
}

/**
 * Validates weekly availability form inputs according to domain rules:
 * - Must be valid numeric values.
 * - Cannot be negative (>= 0).
 * - Cannot exceed 24 hours per day (<= 24).
 * - Decimal hours supported (e.g. 2.5).
 */
export function validateAvailabilityForm(
  data: WeeklyAvailabilityFormData,
): WeeklyAvailabilityValidationResult {
  const errors: WeeklyAvailabilityValidationErrors = {}
  const days: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  for (const day of days) {
    const rawVal = data[day]?.trim()

    if (rawVal === '' || rawVal === undefined) {
      errors[day] = 'Available hours are required (enter 0 if unavailable).'
      continue
    }

    const num = Number(rawVal)

    if (Number.isNaN(num) || !Number.isFinite(num)) {
      errors[day] = 'Please enter a valid numeric value.'
      continue
    }

    if (num < 0) {
      errors[day] = 'Available hours cannot be negative.'
      continue
    }

    if (num > 24) {
      errors[day] = 'Available hours cannot exceed 24 hours in a single day.'
      continue
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Calculates total weekly available hours from domain WeeklyAvailability entity.
 */
export function calculateTotalWeeklyHours(
  availability: WeeklyAvailability,
): number {
  const sum =
    availability.monday +
    availability.tuesday +
    availability.wednesday +
    availability.thursday +
    availability.friday +
    availability.saturday +
    availability.sunday

  return Math.round(sum * 100) / 100
}

/**
 * Calculates total weekly hours from raw form data in real-time.
 */
export function calculateTotalHoursFromFormData(
  data: WeeklyAvailabilityFormData,
): number {
  let sum = 0
  const days: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  for (const day of days) {
    const rawVal = data[day]?.trim()
    const num = Number(rawVal)
    if (!Number.isNaN(num) && num > 0 && num <= 24) {
      sum += num
    }
  }

  return Math.round(sum * 100) / 100
}

/**
 * Transforms validated form data into a domain WeeklyAvailability entity.
 */
export function parseAvailabilityFormData(
  data: WeeklyAvailabilityFormData,
): WeeklyAvailability {
  return {
    monday: Number(data.monday) || 0,
    tuesday: Number(data.tuesday) || 0,
    wednesday: Number(data.wednesday) || 0,
    thursday: Number(data.thursday) || 0,
    friday: Number(data.friday) || 0,
    saturday: Number(data.saturday) || 0,
    sunday: Number(data.sunday) || 0,
  }
}
