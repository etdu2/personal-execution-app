import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Button, Card, Header } from '../components/index.ts'
import {
  createUserFromFormData,
  getInitialUserProfileFormData,
  validateUserProfileForm,
  type UserProfileFormData,
  type UserProfileValidationErrors,
} from '../services/index.ts'
import { useApp } from '../state/index.ts'

export interface UserSetupScreenProps {
  onComplete?: () => void
  isEditing?: boolean
}

export function UserSetupScreen({
  onComplete,
  isEditing = false,
}: UserSetupScreenProps) {
  const { state, setUser } = useApp()

  const [formData, setFormData] = useState<UserProfileFormData>(() =>
    getInitialUserProfileFormData(state.user),
  )
  const [errors, setErrors] = useState<UserProfileValidationErrors>({})

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for field once edited
    if (errors[name as keyof UserProfileValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateUserProfileForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const updatedUser = createUserFromFormData(formData, state.user)
    setUser(updatedUser)
    onComplete?.()
  }

  return (
    <main className="dashboard-container">
      <Header
        title="Personal Execution & Balance System"
        subtitle={
          isEditing
            ? 'Edit your profile and scheduling preferences'
            : 'Initial Profile Setup — Step 1: User Defines'
        }
      />

      <div className="dashboard-content">
        <Card
          title={isEditing ? 'Update Profile' : 'Configure Your Profile'}
          subtitle={
            isEditing
              ? 'Modify your display information and planning preferences.'
              : 'Before the system can organize your plan, define your basic profile and preferences.'
          }
        >
          <div className="setup-badge-row">
            <Badge variant={isEditing ? 'info' : 'warning'}>
              {isEditing ? 'Editing Profile' : 'Profile Required'}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="setup-form" noValidate>
            <div className="form-group">
              <label htmlFor="displayName" className="form-label">
                Display Name <span className="required-mark">*</span>
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                className={`form-input ${errors.displayName ? 'input-error' : ''}`.trim()}
                placeholder="Enter your name or handle"
                value={formData.displayName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              {errors.displayName && (
                <p className="form-error-msg">{errors.displayName}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`.trim()}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="form-error-msg">{errors.email}</p>}
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label htmlFor="timezone" className="form-label">
                  Timezone <span className="required-mark">*</span>
                </label>
                <input
                  id="timezone"
                  name="timezone"
                  type="text"
                  className={`form-input ${errors.timezone ? 'input-error' : ''}`.trim()}
                  placeholder="e.g. UTC, America/New_York"
                  value={formData.timezone}
                  onChange={handleChange}
                  required
                />
                <span className="form-hint">
                  IANA timezone identifier for scheduling and calendar math.
                </span>
                {errors.timezone && (
                  <p className="form-error-msg">{errors.timezone}</p>
                )}
              </div>

              <div className="form-group form-col">
                <label htmlFor="weekStartDay" className="form-label">
                  Week Starts On <span className="required-mark">*</span>
                </label>
                <select
                  id="weekStartDay"
                  name="weekStartDay"
                  className="form-select"
                  value={formData.weekStartDay}
                  onChange={handleChange}
                >
                  <option value="monday">Monday (Standard)</option>
                  <option value="sunday">Sunday</option>
                </select>
                <span className="form-hint">
                  First day used for weekly review cycles and target hours.
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="defaultDailyCapacityHours" className="form-label">
                Default Daily Target Capacity (Hours){' '}
                <span className="optional-tag">(Optional)</span>
              </label>
              <input
                id="defaultDailyCapacityHours"
                name="defaultDailyCapacityHours"
                type="number"
                min="1"
                max="24"
                step="0.5"
                className={`form-input ${errors.defaultDailyCapacityHours ? 'input-error' : ''}`.trim()}
                placeholder="8"
                value={formData.defaultDailyCapacityHours}
                onChange={handleChange}
              />
              <span className="form-hint">
                Baseline daily hours allocated toward execution.
              </span>
              {errors.defaultDailyCapacityHours && (
                <p className="form-error-msg">
                  {errors.defaultDailyCapacityHours}
                </p>
              )}
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary">
                {isEditing ? 'Save Changes' : 'Complete Setup'}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onComplete}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
