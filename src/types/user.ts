import type { ISODateTimeString } from './common.ts'

/**
 * User-configurable settings and scheduling preferences.
 */
export interface UserPreferences {
  /** First day of the planning week (typically Monday or Sunday). */
  weekStartDay: 'monday' | 'sunday'
  /** User's primary IANA timezone identifier (e.g., "America/New_York", "UTC"). */
  timezone: string
  /** Standard daily target capacity in hours (optional default). */
  defaultDailyCapacityHours?: number
}

/**
 * Represents the account holder in the Personal Execution & Balance System.
 * All personal attributes and identity markers are user-defined.
 */
export interface User {
  id: string
  displayName: string
  email?: string
  timezone: string
  preferences: UserPreferences
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}
