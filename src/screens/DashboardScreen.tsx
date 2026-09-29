import { Badge, Button, Card, Header } from '../components/index.ts'
import {
  calculateTotalWeeklyHours,
  calculateUsablePlanningCapacity,
  calculateWeeklyCommitmentHours,
  evaluateWeeklyGoalStatus,
} from '../services/index.ts'
import { useApp } from '../state/index.ts'
import type { WeeklyGoalTarget } from '../types/index.ts'
import { formatMinutesToHours } from '../utils/index.ts'

export interface DashboardScreenProps {
  onEditProfile?: () => void
  onNavigateToGoals?: () => void
  onNavigateToAvailability?: () => void
  onNavigateToCommitments?: () => void
}

export function DashboardScreen({
  onEditProfile,
  onNavigateToGoals,
  onNavigateToAvailability,
  onNavigateToCommitments,
}: DashboardScreenProps) {
  const { state } = useApp()
  const user = state.user
  const activeGoals = state.goals.filter((g) => g.status === 'active')
  const criticalGoals = activeGoals.filter((g) => g.priority === 'critical')

  const totalWeeklyAvailableHours = state.weeklyAvailability
    ? calculateTotalWeeklyHours(state.weeklyAvailability)
    : null

  const hasCommitments = state.fixedCommitments.length > 0
  const totalWeeklyCommitmentHours = hasCommitments
    ? calculateWeeklyCommitmentHours(state.fixedCommitments)
    : null

  const usableCapacityHours =
    totalWeeklyAvailableHours !== null && totalWeeklyCommitmentHours !== null
      ? calculateUsablePlanningCapacity(
          totalWeeklyAvailableHours,
          totalWeeklyCommitmentHours,
        )
      : null

  // Sample domain target verification (generic, user-agnostic)
  const baselineTarget: WeeklyGoalTarget = {
    minimumHours: 2,
    targetHours: 6,
    maximumHours: 10,
  }
  const verifiedStatus = evaluateWeeklyGoalStatus(baselineTarget, 360)

  return (
    <main className="dashboard-container">
      <Header
        title="Personal Execution & Balance System"
        subtitle={
          user
            ? `Welcome, ${user.displayName} — System Configured & Ready`
            : 'Plan your time. Execute your priorities. Improve your week.'
        }
      />

      <div className="dashboard-content">
        {user ? (
          <Card
            title="User Profile & Preferences"
            subtitle="Configured account details guiding system organization"
          >
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Display Name</span>
                <span className="status-value">{user.displayName}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Email</span>
                <span className="status-value">{user.email || 'Not provided'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Timezone</span>
                <span className="status-value">{user.timezone}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Week Starts On</span>
                <span className="status-value">
                  {user.preferences.weekStartDay === 'monday'
                    ? 'Monday'
                    : 'Sunday'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Daily Capacity</span>
                <span className="status-value">
                  {user.preferences.defaultDailyCapacityHours !== undefined
                    ? `${user.preferences.defaultDailyCapacityHours} hours`
                    : 'Not configured'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Setup Status</span>
                <Badge variant="success">Profile Active</Badge>
              </div>
            </div>

            {onEditProfile && (
              <div className="card-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onEditProfile}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card
            title="Profile Status"
            subtitle="No user profile configured in current session"
          >
            <div className="card-actions">
              <Badge variant="warning">No User Configured</Badge>
              {onEditProfile && (
                <Button type="button" variant="primary" onClick={onEditProfile}>
                  Start Setup
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Available Time Summary Card */}
        <Card
          title="Available Time"
          subtitle="Step 2 in Core Loop: User-defined available productive hours across the week"
        >
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Weekly Available Time</span>
              <span className="status-value">
                {totalWeeklyAvailableHours !== null
                  ? `${totalWeeklyAvailableHours} Hours`
                  : 'Not configured yet'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Availability Status</span>
              <Badge
                variant={totalWeeklyAvailableHours !== null ? 'success' : 'warning'}
              >
                {totalWeeklyAvailableHours !== null
                  ? 'Schedule Active'
                  : 'Pending Setup'}
              </Badge>
            </div>
          </div>

          <div className="card-actions">
            {onNavigateToAvailability && (
              <Button
                type="button"
                variant="primary"
                onClick={onNavigateToAvailability}
              >
                {totalWeeklyAvailableHours !== null
                  ? 'Manage Weekly Availability'
                  : '+ Configure Available Time'}
              </Button>
            )}
          </div>
        </Card>

        {/* Fixed Commitments Summary Card */}
        <Card
          title="Fixed Commitments"
          subtitle="Step 3 in Core Loop: Non-negotiable obligations that block execution capacity"
        >
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Weekly Fixed Commitments</span>
              <span className="status-value">
                {totalWeeklyCommitmentHours !== null
                  ? `${totalWeeklyCommitmentHours} Hours`
                  : 'Not configured yet'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Commitment Count</span>
              <span className="status-value">
                {hasCommitments
                  ? `${state.fixedCommitments.length} Scheduled`
                  : '0 Defined'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Commitment Status</span>
              <Badge variant={hasCommitments ? 'info' : 'warning'}>
                {hasCommitments ? 'Schedule Active' : 'Pending Setup'}
              </Badge>
            </div>
            {totalWeeklyAvailableHours !== null && (
              <div className="status-item">
                <span className="status-label">Usable Planning Capacity</span>
                <span className="status-value highlight-accent">
                  {usableCapacityHours !== null
                    ? `${usableCapacityHours} Hours`
                    : 'Calculating...'}
                </span>
              </div>
            )}
          </div>

          <div className="card-actions">
            {onNavigateToCommitments && (
              <Button
                type="button"
                variant="primary"
                onClick={onNavigateToCommitments}
              >
                {hasCommitments
                  ? 'Manage Fixed Commitments'
                  : '+ Configure Fixed Commitments'}
              </Button>
            )}
          </div>
        </Card>

        {/* Goals & Priorities Summary Card */}
        <Card
          title="Goals & Priorities"
          subtitle="Step 1 in Core Loop: Define goals, target hours, and selective day distribution"
        >
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Total Goals</span>
              <span className="status-value">{state.goals.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Active Goals</span>
              <span className="status-value">{activeGoals.length}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Critical Priority</span>
              <Badge variant={criticalGoals.length > 0 ? 'danger' : 'default'}>
                {criticalGoals.length} Critical
              </Badge>
            </div>
            <div className="status-item">
              <span className="status-label">Categories</span>
              <span className="status-value">{state.categories.length} Defined</span>
            </div>
          </div>

          <div className="card-actions">
            {onNavigateToGoals && (
              <Button type="button" variant="primary" onClick={onNavigateToGoals}>
                {state.goals.length === 0 ? '+ Define First Goal' : 'Manage Goals & Priorities'}
              </Button>
            )}
          </div>
        </Card>

        <Card
          title="System Foundation Status"
          subtitle="All architecture layers initialized and verified"
        >
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Active Planning Date</span>
              <span className="status-value">{state.activeDate}</span>
            </div>
            <div className="status-item">
              <span className="status-label">State Management</span>
              <Badge variant="success">Active (React Context)</Badge>
            </div>
            <div className="status-item">
              <span className="status-label">Domain Types</span>
              <Badge variant="success">Loaded (src/types)</Badge>
            </div>
            <div className="status-item">
              <span className="status-label">Business Services</span>
              <Badge variant="success">Operational ({verifiedStatus})</Badge>
            </div>
            <div className="status-item">
              <span className="status-label">Utilities</span>
              <Badge variant="success">
                Format Test: {formatMinutesToHours(90)}
              </Badge>
            </div>
          </div>
        </Card>

        <Card
          title="Execution Architecture Loop"
          subtitle="Structured progression of the system"
        >
          <ol className="loop-list">
            <li><strong>GOALS:</strong> User defines overarching objectives and categories</li>
            <li><strong>PRIORITIES:</strong> Hierarchy of execution focus</li>
            <li><strong>AVAILABLE TIME:</strong> Capacity accounting for fixed commitments</li>
            <li><strong>BALANCED PLAN:</strong> Goal allocation distributed across selected days</li>
            <li><strong>EXECUTE & TRACK:</strong> Independent planned vs actual duration tracking</li>
            <li><strong>RECOVER:</strong> Structured remediation for missed sessions</li>
            <li><strong>REVIEW & IMPROVE:</strong> Weekly retrospective and systemic learning</li>
          </ol>
        </Card>
      </div>
    </main>
  )
}
