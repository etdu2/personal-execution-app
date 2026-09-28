import type { ISODateString } from '../types/index.ts'

/**
 * Formats a duration given in integer minutes into a readable string (e.g., "1h 30m" or "45m").
 */
export function formatMinutesToHours(minutes: number): string {
  if (minutes <= 0) {
    return '0m'
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  }
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Converts hours to integer minutes.
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60)
}

/**
 * Calculates execution compliance rate as a percentage rounded to one decimal place.
 */
export function calculateExecutionPercentage(
  plannedMinutes: number,
  actualMinutes: number,
): number {
  if (plannedMinutes <= 0) {
    return actualMinutes > 0 ? 100 : 0
  }
  const percentage = (actualMinutes / plannedMinutes) * 100
  return Math.round(percentage * 10) / 10
}

/**
 * Returns today's calendar date as an ISO date string (YYYY-MM-DD).
 */
export function getTodayISODate(): ISODateString {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
