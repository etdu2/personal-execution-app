import { useState } from 'react'
import {
  AvailabilityScreen,
  DashboardScreen,
  FixedCommitmentsScreen,
  GoalsScreen,
  UserSetupScreen,
} from './screens/index.ts'
import { AppProvider, useApp } from './state/index.ts'

function AppContent() {
  const { state } = useApp()
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'goals' | 'availability' | 'commitments'
  >('dashboard')
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  if (!state.user || isEditingProfile) {
    return (
      <UserSetupScreen
        isEditing={Boolean(state.user)}
        onComplete={() => setIsEditingProfile(false)}
      />
    )
  }

  if (currentView === 'goals') {
    return (
      <GoalsScreen
        onNavigateToDashboard={() => setCurrentView('dashboard')}
      />
    )
  }

  if (currentView === 'availability') {
    return (
      <AvailabilityScreen
        onNavigateToDashboard={() => setCurrentView('dashboard')}
      />
    )
  }

  if (currentView === 'commitments') {
    return (
      <FixedCommitmentsScreen
        onNavigateToDashboard={() => setCurrentView('dashboard')}
      />
    )
  }

  return (
    <DashboardScreen
      onEditProfile={() => setIsEditingProfile(true)}
      onNavigateToGoals={() => setCurrentView('goals')}
      onNavigateToAvailability={() => setCurrentView('availability')}
      onNavigateToCommitments={() => setCurrentView('commitments')}
    />
  )
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App