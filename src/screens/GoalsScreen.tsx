import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Badge, Button, Card, Header } from '../components/index.ts'
import {
  ALL_DAYS_OF_WEEK,
  createGoalCategory,
  createGoalFromFormData,
  getInitialGoalFormData,
  sortGoalsByPriority,
  validateGoalForm,
  type GoalFormData,
  type GoalValidationErrors,
} from '../services/index.ts'
import { useApp } from '../state/index.ts'
import type { DayOfWeek, Goal, Priority } from '../types/index.ts'

export interface GoalsScreenProps {
  onNavigateToDashboard: () => void
}

export function GoalsScreen({ onNavigateToDashboard }: GoalsScreenProps) {
  const {
    state,
    addGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    setGoalPriority,
    addCategory,
  } = useApp()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all')

  const [formData, setFormData] = useState<GoalFormData>(() =>
    getInitialGoalFormData(undefined, state.categories[0]?.id),
  )
  const [errors, setErrors] = useState<GoalValidationErrors>({})

  const handleOpenCreateForm = () => {
    setEditingGoal(null)
    setFormData(getInitialGoalFormData(undefined, state.categories[0]?.id))
    setErrors({})
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData(getInitialGoalFormData(goal))
    setErrors({})
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingGoal(null)
    setErrors({})
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name as keyof GoalValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleDayToggle = (day: DayOfWeek) => {
    setFormData((prev) => {
      const exists = prev.preferredDays.includes(day)
      const nextDays = exists
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day]
      return {
        ...prev,
        preferredDays: nextDays,
      }
    })

    if (errors.preferredDays) {
      setErrors((prev) => ({
        ...prev,
        preferredDays: undefined,
      }))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!state.user) {
      return
    }

    const validation = validateGoalForm(formData, state.categories.length > 0)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    let targetCategoryId = formData.categoryId

    // If user specified a new category name, create it and register in state
    if (formData.newCategoryName.trim()) {
      const newCategory = createGoalCategory(
        formData.newCategoryName.trim(),
        state.user.id,
      )
      addCategory(newCategory)
      targetCategoryId = newCategory.id
    }

    const goal = createGoalFromFormData(
      formData,
      state.user.id,
      targetCategoryId,
      editingGoal ?? undefined,
    )

    if (editingGoal) {
      updateGoal(goal)
    } else {
      addGoal(goal)
    }

    handleCloseForm()
  }

  // Priority sorting & filtering
  const sortedGoals = sortGoalsByPriority(state.goals)
  const displayedGoals = sortedGoals.filter((goal) => {
    if (filterStatus === 'active') return goal.status === 'active'
    if (filterStatus === 'archived') return goal.status === 'archived'
    return true
  })

  const getCategoryName = (categoryId: string): string => {
    const category = state.categories.find((c) => c.id === categoryId)
    return category?.name ?? 'General'
  }

  const getPriorityBadgeVariant = (
    priority: Priority,
  ): 'danger' | 'warning' | 'info' | 'default' => {
    switch (priority) {
      case 'critical':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
    }
  }

  return (
    <main className="dashboard-container">
      <Header
        title="Personal Execution & Balance System"
        subtitle="Step 1: User Defines — Goals, Categories & Priorities"
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
              onClick={handleOpenCreateForm}
            >
              + Create New Goal
            </Button>
          )}
        </div>

        {/* Goal Creation / Editing Form */}
        {isFormOpen && (
          <Card
            title={editingGoal ? 'Edit Goal' : 'Define New Goal'}
            subtitle={
              editingGoal
                ? `Editing target and distribution for "${editingGoal.title}"`
                : 'Set a target objective, assign priority, and define weekly hour targets.'
            }
          >
            <form onSubmit={handleSubmit} className="setup-form" noValidate>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Goal Title <span className="required-mark">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={`form-input ${errors.title ? 'input-error' : ''}`.trim()}
                  placeholder="e.g. Master System Architecture"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                {errors.title && (
                  <p className="form-error-msg">{errors.title}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description <span className="optional-tag">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input form-textarea"
                  placeholder="Context, focus areas, or desired outcome"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group form-col">
                  <label htmlFor="categoryId" className="form-label">
                    Category <span className="required-mark">*</span>
                  </label>
                  {state.categories.length > 0 ? (
                    <select
                      id="categoryId"
                      name="categoryId"
                      className="form-select"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Category or Create New --</option>
                      {state.categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="__new__">+ Create New Category...</option>
                    </select>
                  ) : null}

                  {(state.categories.length === 0 ||
                    formData.categoryId === '__new__') && (
                    <input
                      name="newCategoryName"
                      type="text"
                      className={`form-input ${errors.categoryId ? 'input-error' : ''}`.trim()}
                      placeholder="Enter category name (e.g. Deep Work, Health)"
                      value={formData.newCategoryName}
                      onChange={handleChange}
                      style={{ marginTop: '0.4rem' }}
                    />
                  )}
                  {errors.categoryId && (
                    <p className="form-error-msg">{errors.categoryId}</p>
                  )}
                </div>

                <div className="form-group form-col">
                  <label htmlFor="priority" className="form-label">
                    Priority <span className="required-mark">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="critical">Critical (Highest)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Lowest)</option>
                  </select>
                </div>
              </div>

              {/* Weekly Target Hours */}
              <div className="form-row">
                <div className="form-group form-col">
                  <label htmlFor="minimumHours" className="form-label">
                    Minimum Hours/Week <span className="required-mark">*</span>
                  </label>
                  <input
                    id="minimumHours"
                    name="minimumHours"
                    type="number"
                    min="0"
                    step="0.5"
                    className={`form-input ${errors.minimumHours ? 'input-error' : ''}`.trim()}
                    value={formData.minimumHours}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Floor hours to maintain continuity.</span>
                  {errors.minimumHours && (
                    <p className="form-error-msg">{errors.minimumHours}</p>
                  )}
                </div>

                <div className="form-group form-col">
                  <label htmlFor="targetHours" className="form-label">
                    Target Hours/Week <span className="required-mark">*</span>
                  </label>
                  <input
                    id="targetHours"
                    name="targetHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    className={`form-input ${errors.targetHours ? 'input-error' : ''}`.trim()}
                    value={formData.targetHours}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Primary goal for steady weekly progress.</span>
                  {errors.targetHours && (
                    <p className="form-error-msg">{errors.targetHours}</p>
                  )}
                </div>

                <div className="form-group form-col">
                  <label htmlFor="maximumHours" className="form-label">
                    Max Hours <span className="optional-tag">(Optional)</span>
                  </label>
                  <input
                    id="maximumHours"
                    name="maximumHours"
                    type="number"
                    min="0"
                    step="0.5"
                    className={`form-input ${errors.maximumHours ? 'input-error' : ''}`.trim()}
                    placeholder="None"
                    value={formData.maximumHours}
                    onChange={handleChange}
                  />
                  <span className="form-hint">Ceiling to protect systemic balance.</span>
                  {errors.maximumHours && (
                    <p className="form-error-msg">{errors.maximumHours}</p>
                  )}
                </div>
              </div>

              {/* Distribution Across Selected Days */}
              <div className="form-group">
                <label className="form-label">
                  Preferred Days of Execution <span className="required-mark">*</span>
                </label>
                <div className="days-checkbox-grid">
                  {ALL_DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.preferredDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`day-chip ${isSelected ? 'day-chip-selected' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.substring(0, 3).toUpperCase()}
                      </button>
                    )
                  })}
                </div>
                <span className="form-hint">
                  Distribute effort across selected days rather than requiring every goal every day.
                </span>
                {errors.preferredDays && (
                  <p className="form-error-msg">{errors.preferredDays}</p>
                )}
              </div>

              {/* Session Duration & Flexibility */}
              <div className="form-row">
                <div className="form-group form-col">
                  <label htmlFor="targetSessionsPerWeek" className="form-label">
                    Target Sessions/Week <span className="optional-tag">(Optional)</span>
                  </label>
                  <input
                    id="targetSessionsPerWeek"
                    name="targetSessionsPerWeek"
                    type="number"
                    min="1"
                    max="14"
                    className="form-input"
                    placeholder="e.g. 3"
                    value={formData.targetSessionsPerWeek}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group form-col">
                  <label htmlFor="preferredSessionDurationMinutes" className="form-label">
                    Preferred Session Duration (Min) <span className="optional-tag">(Optional)</span>
                  </label>
                  <input
                    id="preferredSessionDurationMinutes"
                    name="preferredSessionDurationMinutes"
                    type="number"
                    min="15"
                    step="15"
                    className="form-input"
                    placeholder="e.g. 60"
                    value={formData.preferredSessionDurationMinutes}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group form-col">
                  <label htmlFor="status" className="form-label">
                    Goal Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="form-row">
                <div className="form-group form-col">
                  <label htmlFor="startDate" className="form-label">
                    Start Date <span className="required-mark">*</span>
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className={`form-input ${errors.startDate ? 'input-error' : ''}`.trim()}
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                  {errors.startDate && (
                    <p className="form-error-msg">{errors.startDate}</p>
                  )}
                </div>

                <div className="form-group form-col">
                  <label htmlFor="endDate" className="form-label">
                    End Date <span className="optional-tag">(Optional)</span>
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className={`form-input ${errors.endDate ? 'input-error' : ''}`.trim()}
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                  {errors.endDate && (
                    <p className="form-error-msg">{errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" variant="primary">
                  {editingGoal ? 'Save Goal Changes' : 'Create Goal'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Goals List Header and Filters */}
        <div className="goals-section-header">
          <div>
            <h2 className="section-title">Configured Goals</h2>
            <p className="section-subtitle">
              Sorted by Priority hierarchy (Critical → High → Medium → Low)
            </p>
          </div>

          {state.goals.length > 0 && (
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-pill ${filterStatus === 'all' ? 'filter-pill-active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({state.goals.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterStatus === 'active' ? 'filter-pill-active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active ({state.goals.filter((g) => g.status === 'active').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterStatus === 'archived' ? 'filter-pill-active' : ''}`}
                onClick={() => setFilterStatus('archived')}
              >
                Archived ({state.goals.filter((g) => g.status === 'archived').length})
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {state.goals.length === 0 && !isFormOpen && (
          <Card
            title="No Goals Defined Yet"
            subtitle="The Personal Execution & Balance System begins with user-defined objectives."
          >
            <p className="empty-state-text">
              You haven't created any goals yet. Define your first goal with minimum and target
              hours, and assign its preferred days to start building your balanced execution plan.
            </p>
            <div className="card-actions">
              <Button type="button" variant="primary" onClick={handleOpenCreateForm}>
                + Define Your First Goal
              </Button>
            </div>
          </Card>
        )}

        {/* Filtered Empty State */}
        {state.goals.length > 0 && displayedGoals.length === 0 && !isFormOpen && (
          <Card title="No Goals in this Filter" subtitle="Adjust the filter above to view your goals.">
            <p className="empty-state-text">
              No goals match the filter &quot;{filterStatus}&quot;.
            </p>
          </Card>
        )}

        {/* Goals Cards List */}
        <div className="goals-list">
          {displayedGoals.map((goal) => (
            <div key={goal.id} className="goal-card">
              <div className="goal-card-main">
                <div className="goal-header-row">
                  <div className="goal-title-wrap">
                    <h3 className="goal-title">{goal.title}</h3>
                    <span className="goal-category-tag">
                      {getCategoryName(goal.categoryId)}
                    </span>
                  </div>

                  <div className="goal-badges-wrap">
                    <Badge variant={getPriorityBadgeVariant(goal.priority)}>
                      {goal.priority.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        goal.status === 'active'
                          ? 'success'
                          : goal.status === 'archived'
                            ? 'default'
                            : 'warning'
                      }
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </div>

                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}

                <div className="goal-meta-grid">
                  <div className="goal-meta-item">
                    <span className="meta-label">Weekly Hours</span>
                    <span className="meta-val">
                      Min: {goal.weeklyTarget.minimumHours}h | Target: {goal.weeklyTarget.targetHours}h
                      {goal.weeklyTarget.maximumHours !== undefined &&
                        ` | Max: ${goal.weeklyTarget.maximumHours}h`}
                    </span>
                  </div>

                  <div className="goal-meta-item">
                    <span className="meta-label">Preferred Days</span>
                    <span className="meta-val">
                      {goal.distribution.preferredDays
                        .map((d) => d.substring(0, 3).toUpperCase())
                        .join(', ')}
                      {goal.distribution.isFlexible && ' (Flexible)'}
                    </span>
                  </div>

                  {goal.distribution.preferredSessionDurationMinutes && (
                    <div className="goal-meta-item">
                      <span className="meta-label">Session Target</span>
                      <span className="meta-val">
                        {goal.distribution.preferredSessionDurationMinutes} min
                        {goal.distribution.targetSessionsPerWeek &&
                          ` × ${goal.distribution.targetSessionsPerWeek}/wk`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Goal Actions */}
              <div className="goal-card-actions">
                <div className="priority-control">
                  <label htmlFor={`priority-select-${goal.id}`} className="control-label">
                    Priority:
                  </label>
                  <select
                    id={`priority-select-${goal.id}`}
                    value={goal.priority}
                    onChange={(e) =>
                      setGoalPriority(goal.id, e.target.value as Priority)
                    }
                    className="priority-inline-select"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="action-buttons-wrap">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleOpenEditForm(goal)}
                  >
                    Edit
                  </Button>

                  {goal.status === 'archived' ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        updateGoal({
                          ...goal,
                          status: 'active',
                          updatedAt: new Date().toISOString(),
                        })
                      }
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => archiveGoal(goal.id)}
                    >
                      Archive
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
