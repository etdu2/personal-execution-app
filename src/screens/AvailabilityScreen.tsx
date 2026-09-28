import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Button, Card, Header } from '../components/index.ts'
import {
  calculateTotalHoursFromFormData,
  formatDayName,
  getInitialAvailabilityFormData,
  getOrderedDaysOfWeek,
  parseAvailabilityFormData,
  validateAvailabilityForm,
  type WeeklyAvailabilityFormData,
  type WeeklyAvailabilityValidationErrors,
} from '../services/index.ts'
import { useApp } from '../state/index.ts'
import type { DayOfWeek } from '../types/index.ts'

export interface AvailabilityScreenProps {
  onNavigateToDashboard: () => void
}

export function AvailabilityScreen({
  onNavigateToDashboard,
}: AvailabilityScreenProps) {
  const { state, setWeeklyAvailability } = useApp()

  const defaultHours = state.user?.preferences.defaultDailyCapacityHours
  const weekStartDay = state.user?.preferences.weekStartDay ?? 'monday'
  const orderedDays = getOrderedDaysOfWeek(weekStartDay)

  const [formData, setFormData] = useState<WeeklyAvailabilityFormData>(() =>
    getInitialAvailabilityFormData(state.weeklyAvailability, defaultHours),
  )
  const [errors, setErrors] = useState<WeeklyAvailabilityValidationErrors>({})

  // Real-time calculated total weekly hours based on form entries
  const currentTotalWeeklyHours = calculateTotalHoursFromFormData(formData)

  const handleChange = (day: DayOfWeek, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    setFormData((prev) => ({
      ...prev,
      [day]: val,
    }))

    if (errors[day]) {
      setErrors((prev) => ({
        ...prev,
        [day]: undefined,
      }))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateAvailabilityForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const domainAvailability = parseAvailabilityFormData(formData)
    setWeeklyAvailability(domainAvailability)
    onNavigateToDashboard()
  }

  const handleCancel = () => {
    onNavigateToDashboard()
  }

  return (
    <main className="dashboard-container">
      <Header
        title="Personal Execution & Balance System"
        subtitle="Step 2: Available Time — Configure available productive hours per day"
      />

      <div className="dashboard-content">
        <div className="navigation-bar">
          <Button
            type="button"
            variant="secondary"
            onClick={onNavigateToDashboard}
          >
            ← Back to Dashboard
          </Button>
        </div>

        <Card
          title="Weekly Available Productive Time"
          subtitle="Define how many hours you are normally available for productive execution on each day of the week."
        >
          {/* Real-time Total Hours Banner */}
          <div className="availability-total-banner">
            <div className="total-banner-left">
              <span className="total-banner-label">
                Total Weekly Available Time
              </span>
              <span className="total-banner-value">
                {currentTotalWeeklyHours} Hours
              </span>
            </div>
            <div className="total-banner-right">
              <Badge variant={currentTotalWeeklyHours > 0 ? 'success' : 'warning'}>
                {state.weeklyAvailability ? 'Configured' : 'New Configuration'}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="availability-form" noValidate>
            <div className="availability-days-grid">
              {orderedDays.map((day) => {
                const dayError = errors[day]
                const rawValue = formData[day]

                return (
                  <div key={day} className="day-availability-card">
                    <div className="day-card-header">
                      <span className="day-name">{formatDayName(day)}</span>
                      {day === 'saturday' || day === 'sunday' ? (
                        <span className="weekend-tag">Weekend</span>
                      ) : null}
                    </div>

                    <div className="day-input-group">
                      <label htmlFor={`hours-${day}`} className="sr-only">
                        {formatDayName(day)} available hours
                      </label>
                      <div className="day-input-wrapper">
                        <input
                          id={`hours-${day}`}
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          className={`form-input day-number-input ${dayError ? 'input-error' : ''}`.trim()}
                          placeholder="0"
                          value={rawValue}
                          onChange={(e) => handleChange(day, e)}
                        />
                        <span className="hours-unit-tag">hrs</span>
                      </div>

                      {dayError && (
                        <p className="form-error-msg day-error">{dayError}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary">
                Save Availability
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
