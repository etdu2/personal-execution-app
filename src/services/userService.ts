import type { User, UserPreferences } from '../types/index.ts'

/**
 * Raw form input data for user setup and profile configuration.
 * Form inputs represent raw unparsed string values prior to domain validation.
 */
export interface UserProfileFormData {
  displayName: string
  email: string
  timezone: string
  weekStartDay: 'monday' | 'sunday'
  defaultDailyCapacityHours: string
}

/**
 * Field-level validation error messages.
 */
export interface UserProfileValidationErrors {
  displayName?: string
  email?: string
  timezone?: string
  defaultDailyCapacityHours?: string
}

/**
 * Result of validating user profile form data.
 */
export interface UserProfileValidationResult {
  isValid: boolean
  errors: UserProfileValidationErrors
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Detects the runtime client IANA timezone, falling back to UTC.
 */
export function detectDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Returns default form values, optionally populated from an existing user.
 */
export function getInitialUserProfileFormData(
  user?: User | null,
): UserProfileFormData {
  if (user) {
    return {
      displayName: user.displayName,
      email: user.email ?? '',
      timezone: user.timezone,
      weekStartDay: user.preferences.weekStartDay,
      defaultDailyCapacityHours:
        user.preferences.defaultDailyCapacityHours !== undefined
          ? String(user.preferences.defaultDailyCapacityHours)
          : '',
    }
  }

  return {
    displayName: '',
    email: '',
    timezone: detectDefaultTimezone(),
    weekStartDay: 'monday',
    defaultDailyCapacityHours: '8',
  }
}

/**
 * Validates user profile form input against domain constraints.
 */
export function validateUserProfileForm(
  data: UserProfileFormData,
): UserProfileValidationResult {
  const errors: UserProfileValidationErrors = {}

  const trimmedName = data.displayName.trim()
  if (!trimmedName) {
    errors.displayName = 'Display name is required.'
  } else if (trimmedName.length < 2) {
    errors.displayName = 'Display name must be at least 2 characters.'
  } else if (trimmedName.length > 50) {
    errors.displayName = 'Display name cannot exceed 50 characters.'
  }

  const trimmedEmail = data.email.trim()
  if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.'
  }

  const trimmedTimezone = data.timezone.trim()
  if (!trimmedTimezone) {
    errors.timezone = 'Timezone is required.'
  }

  const trimmedCapacity = data.defaultDailyCapacityHours.trim()
  if (trimmedCapacity) {
    const hoursNum = Number(trimmedCapacity)
    if (Number.isNaN(hoursNum) || !Number.isFinite(hoursNum)) {
      errors.defaultDailyCapacityHours = 'Capacity must be a valid number.'
    } else if (hoursNum <= 0 || hoursNum > 24) {
      errors.defaultDailyCapacityHours =
        'Daily capacity must be between 1 and 24 hours.'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Builds a valid domain User object from validated form data.
 */
export function createUserFromFormData(
  data: UserProfileFormData,
  existingUser?: User | null,
): User {
  const now = new Date().toISOString()
  const trimmedCapacity = data.defaultDailyCapacityHours.trim()
  const parsedCapacity = trimmedCapacity ? Number(trimmedCapacity) : undefined

  const preferences: UserPreferences = {
    weekStartDay: data.weekStartDay,
    timezone: data.timezone.trim(),
    defaultDailyCapacityHours: parsedCapacity,
  }

  return {
    id: existingUser?.id ?? `usr_${Date.now()}`,
    displayName: data.displayName.trim(),
    email: data.email.trim() || undefined,
    timezone: data.timezone.trim(),
    preferences,
    createdAt: existingUser?.createdAt ?? now,
    updatedAt: now,
  }
}
