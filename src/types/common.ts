/**
 * Core primitive types and shared domain values for the Personal Execution & Balance System.
 */

/**
 * ISO 8601 calendar date string formatted as YYYY-MM-DD (e.g., "2026-09-28").
 */
export type ISODateString = string

/**
 * ISO 8601 timestamp string with timezone (e.g., "2026-09-28T09:30:00.000Z").
 */
export type ISODateTimeString = string

/**
 * 24-hour time string formatted as HH:mm (e.g., "08:00", "17:30").
 */
export type TimeString = string

/**
 * Days of the week in standard lower-case representation.
 */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/**
 * Priority levels for goals, sessions, and tasks.
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low'

/**
 * A discrete time window within a single calendar day.
 */
export interface TimeWindow {
  startTime: TimeString
  endTime: TimeString
}
