import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Button, Card, Header } from '../components/index.ts'
import {
  calculateCommitmentDurationHours,
  calculateCommitmentDurationMinutes,
  calculateDailyCommitmentHours,
  calculateTotalWeeklyHours,
  calculateUsablePlanningCapacity,
  calculateWeeklyCommitmentHours,
  createCommitmentFromFormData,
  formatCommitmentDurationDisplay,
  formatDayName,
  getInitialCommitmentFormData,
  getOrderedDaysOfWeek,
  validateCommitmentForm,
  type CommitmentFormData,
  type CommitmentValidationErrors,
} from '../services/index.ts'
import { useApp } from '../state/index.ts'
import type { DayOfWeek, FixedCommitment } from '../types/index.ts'

export interface FixedCommitmentsScreenProps {
  onNavigateToDashboard: () => void
}

export function FixedCommitmentsScreen({
  onNavigateToDashboard,
}: FixedCommitmentsScreenProps) {
  const {
    state,
    addFixedCommitment,
    updateFixedCommitment,
    deleteFixedCommitment,
  } = useApp()

  const userId = state.user?.id ?? 'default_user'
  const weekStartDay = state.user?.preferences.weekStartDay ?? 'monday'
  const orderedDays = getOrderedDaysOfWeek(weekStartDay)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCommitment, setEditingCommitment] =
    useState<FixedCommitment | null>(null)
  const [formData, setFormData] = useState<CommitmentFormData>(() =>
    getInitialCommitmentFormData(undefined, orderedDays[0]),
  )
  const [errors, setErrors] = useState<CommitmentValidationErrors>({})

  const totalWeeklyCommitmentsHours = calculateWeeklyCommitmentHours(
    state.fixedCommitments,
  )

  const totalWeeklyAvailableHours = state.weeklyAvailability
    ? calculateTotalWeeklyHours(state.weeklyAvailability)
    : null

  const usableCapacityHours =
    totalWeeklyAvailableHours !== null
      ? calculateUsablePlanningCapacity(
          totalWeeklyAvailableHours,
          totalWeeklyCommitmentsHours,
        )
      : null

  // Real-time calculation of duration for form times
  const formDurationMinutes = calculateCommitmentDurationMinutes(
    formData.startTime,
    formData.endTime,
  )
  const formDurationHours = calculateCommitmentDurationHours(
    formData.startTime,
    formData.endTime,
  )
  const formDurationDisplay = formatCommitmentDurationDisplay(formDurationMinutes)

  const handleOpenAddForm = (defaultDay?: DayOfWeek) => {
    setEditingCommitment(null)
    setFormData(
      getInitialCommitmentFormData(undefined, defaultDay ?? orderedDays[0]),
    )
    setErrors({})
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (commitment: FixedCommitment) => {
    setEditingCommitment(commitment)
    setFormData(getInitialCommitmentFormData(commitment))
    setErrors({})
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCommitment(null)
    setErrors({})
  }

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof CommitmentValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validation = validateCommitmentForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const commitment = createCommitmentFromFormData(
      formData,
      userId,
      editingCommitment ?? undefined,
    )

    if (editingCommitment) {
      updateFixedCommitment(commitment)
    } else {
      addFixedCommitment(commitment)
    }

    handleCloseForm()
  }

  const handleDelete = (id: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the commitment "${title}"?`,
    )
    if (confirmed) {
      deleteFixedCommitment(id)
      if (editingCommitment?.id === id) {
        handleCloseForm()
      }
    }
  }

  return (
    <main className="dashboard-container">
      <Header
        title="Personal Execution & Balance System"
        subtitle="Step 3: Fixed Commitments — Define recurring obligations that block available execution time"
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

          {!isFormOpen && (
            <Button
              type="button"
              variant="primary"
              onClick={() => handleOpenAddForm()}
            >
              + Add Commitment
            </Button>
          )}
        </div>

        {/* Weekly Capacity & Commitment Summary Banner */}
        <div className="commitments-capacity-banner">
          <div className="capacity-metric">
            <span className="capacity-metric-label">
              Total Weekly Fixed Commitments
            </span>
            <span className="capacity-metric-value">
              {totalWeeklyCommitmentsHours} Hours
            </span>
            <span className="capacity-metric-desc">
              {state.fixedCommitments.length}{' '}
              {state.fixedCommitments.length === 1
                ? 'obligation defined'
                : 'obligations defined'}
            </span>
          </div>

          {totalWeeklyAvailableHours !== null && (
            <>
              <div className="capacity-divider" />
              <div className="capacity-metric">
                <span className="capacity-metric-label">
                  Gross Available Time
                </span>
                <span className="capacity-metric-value">
                  {totalWeeklyAvailableHours} Hours
                </span>
                <span className="capacity-metric-desc">
                  Defined in Weekly Availability
                </span>
              </div>

              <div className="capacity-divider" />
              <div className="capacity-metric">
                <span className="capacity-metric-label">
                  Usable Planning Capacity
                </span>
                <span className="capacity-metric-value highlight">
                  {usableCapacityHours} Hours
                </span>
                <span className="capacity-metric-desc">
                  Capacity available for goal execution
                </span>
              </div>
            </>
          )}
        </div>

        {/* Commitment Add / Edit Form */}
        {isFormOpen && (
          <Card
            title={
              editingCommitment
                ? 'Edit Fixed Commitment'
                : 'Add Fixed Commitment'
            }
            subtitle="Recurring commitments (e.g. classes, job shifts, personal routines) are blocked out so the engine never schedules execution sessions over them."
          >
            <form onSubmit={handleSubmit} className="setup-form" noValidate>
              <div className="form-group">
                <label htmlFor="commitment-title" className="form-label">
                  Commitment Title <span className="required-mark">*</span>
                </label>
                <input
                  id="commitment-title"
                  type="text"
                  name="title"
                  className={`form-input ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g. Work Shift, University Lecture, Family Dinner"
                  value={formData.title}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.title && (
                  <span className="form-error-msg">{errors.title}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label htmlFor="commitment-day" className="form-label">
                    Day of the Week <span className="required-mark">*</span>
                  </label>
                  <select
                    id="commitment-day"
                    name="dayOfWeek"
                    className="form-select"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                  >
                    {orderedDays.map((day) => (
                      <option key={day} value={day}>
                        {formatDayName(day)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-col">
                  <label htmlFor="commitment-start" className="form-label">
                    Start Time <span className="required-mark">*</span>
                  </label>
                  <input
                    id="commitment-start"
                    type="time"
                    name="startTime"
                    className={`form-input ${errors.startTime ? 'input-error' : ''}`}
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                  {errors.startTime && (
                    <span className="form-error-msg">{errors.startTime}</span>
                  )}
                </div>

                <div className="form-col">
                  <label htmlFor="commitment-end" className="form-label">
                    End Time <span className="required-mark">*</span>
                  </label>
                  <input
                    id="commitment-end"
                    type="time"
                    name="endTime"
                    className={`form-input ${errors.endTime ? 'input-error' : ''}`}
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                  {errors.endTime && (
                    <span className="form-error-msg">{errors.endTime}</span>
                  )}
                </div>
              </div>

              {/* Calculated Duration Display */}
              <div className="commitment-duration-preview">
                <span className="duration-preview-label">Calculated Duration:</span>
                {formDurationMinutes > 0 ? (
                  <span className="duration-preview-value">
                    {formDurationDisplay} ({formDurationHours} {formDurationHours === 1 ? 'hour' : 'hours'})
                  </span>
                ) : (
                  <span className="duration-preview-invalid">
                    Invalid range (End time must be after start time)
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="commitment-description" className="form-label">
                  Description <span className="optional-tag">(Optional)</span>
                </label>
                <textarea
                  id="commitment-description"
                  name="description"
                  className="form-textarea"
                  rows={2}
                  placeholder="Optional notes or location details"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingCommitment ? 'Update Commitment' : 'Save Commitment'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Commitments List grouped by Day */}
        <div className="commitments-section-header">
          <div>
            <h2 className="section-title">Recurring Weekly Schedule</h2>
            <p className="section-subtitle">
              Commitments grouped by day of week and chronological start time
            </p>
          </div>
        </div>

        {state.fixedCommitments.length === 0 ? (
          <Card
            title="No Fixed Commitments Configured"
            subtitle="Plan with precision by adding your non-negotiable obligations"
          >
            <p className="empty-state-text">
              Fixed commitments are regular, recurring time blocks that take priority
              in your week — such as employment hours, classes, religious services,
              or family commitments. The engine respects these blocks and guarantees
              no goal execution sessions will be scheduled during these windows.
            </p>
            <div className="card-actions">
              <Button
                type="button"
                variant="primary"
                onClick={() => handleOpenAddForm()}
              >
                + Add Your First Commitment
              </Button>
            </div>
          </Card>
        ) : (
          <div className="commitments-days-list">
            {orderedDays.map((day) => {
              const dayCommitments = state.fixedCommitments
                .filter((c) => c.dayOfWeek === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))

              const dailyTotalHours = calculateDailyCommitmentHours(
                state.fixedCommitments,
                day,
              )

              return (
                <div key={day} className="day-commitments-block">
                  <div className="day-commitments-header">
                    <div className="day-header-title-wrap">
                      <span className="day-header-name">
                        {formatDayName(day)}
                      </span>
                      {day === 'saturday' || day === 'sunday' ? (
                        <span className="weekend-tag">Weekend</span>
                      ) : null}
                    </div>

                    <div className="day-header-summary">
                      <span className="day-total-badge">
                        {dailyTotalHours > 0
                          ? `${dailyTotalHours} hrs fixed`
                          : 'No fixed commitments'}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleOpenAddForm(day)}
                        className="btn-add-mini"
                      >
                        + Add
                      </Button>
                    </div>
                  </div>

                  {dayCommitments.length === 0 ? (
                    <div className="day-empty-row">
                      <span>No commitments scheduled for {formatDayName(day)}.</span>
                    </div>
                  ) : (
                    <div className="commitments-cards-grid">
                      {dayCommitments.map((commitment) => (
                        <div key={commitment.id} className="commitment-card">
                          <div className="commitment-card-main">
                            <div className="commitment-card-title-row">
                              <span className="commitment-title">
                                {commitment.title}
                              </span>
                              <Badge variant="info">
                                {formatCommitmentDurationDisplay(
                                  commitment.durationMinutes,
                                )}
                              </Badge>
                            </div>

                            <div className="commitment-time-row">
                              <span className="commitment-time-range">
                                🕒 {commitment.startTime} – {commitment.endTime}
                              </span>
                              <span className="commitment-decimal-hours">
                                (
                                {Math.round(
                                  (commitment.durationMinutes / 60) * 100,
                                ) / 100}{' '}
                                hrs)
                              </span>
                            </div>

                            {commitment.description && (
                              <p className="commitment-description">
                                {commitment.description}
                              </p>
                            )}
                          </div>

                          <div className="commitment-card-actions">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleOpenEditForm(commitment)}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() =>
                                handleDelete(commitment.id, commitment.title)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
