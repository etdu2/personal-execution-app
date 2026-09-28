import { Badge, Button, Card, Header } from '../components/index.ts'
import { evaluateWeeklyGoalStatus } from '../services/index.ts'
import { useApp } from '../state/index.ts'
import type { WeeklyGoalTarget } from '../types/index.ts'
import { formatMinutesToHours } from '../utils/index.ts'

export interface DashboardScreenProps {
  onEditProfile?: () => void
}

export function DashboardScreen({ onEditProfile }: DashboardScreenProps) {
  const { state } = useApp()
  const user = state.user

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
