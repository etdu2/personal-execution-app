import { useState } from 'react'
import {
  AvailabilityScreen,
  DashboardScreen,
  GoalsScreen,
  UserSetupScreen,
} from './screens/index.ts'
import { AppProvider, useApp } from './state/index.ts'

function AppContent() {
  const { state } = useApp()
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'goals' | 'availability'
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

  return (
    <DashboardScreen
      onEditProfile={() => setIsEditingProfile(true)}
      onNavigateToGoals={() => setCurrentView('goals')}
      onNavigateToAvailability={() => setCurrentView('availability')}
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