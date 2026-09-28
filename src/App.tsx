import { useState } from 'react'
import { DashboardScreen, UserSetupScreen } from './screens/index.ts'
import { AppProvider, useApp } from './state/index.ts'

function AppContent() {
  const { state } = useApp()
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  if (!state.user || isEditingProfile) {
    return (
      <UserSetupScreen
        isEditing={Boolean(state.user)}
        onComplete={() => setIsEditingProfile(false)}
      />
    )
  }

  return <DashboardScreen onEditProfile={() => setIsEditingProfile(true)} />
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App