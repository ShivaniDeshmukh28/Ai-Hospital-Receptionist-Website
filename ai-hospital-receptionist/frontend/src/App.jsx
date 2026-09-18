import { useState } from 'react'
import AuthPage        from './pages/AuthPage'
import WelcomeScreen   from './pages/WelcomeScreen'
import LocationPopup   from './components/LocationPopup'
import DashboardLayout from './pages/DashboardLayout'
import SymptomGuidanceCard from './components/SymptomGuidanceCard'

export default function App() {
  const [screen, setScreen]             = useState('auth')
  const [user, setUser]                 = useState(null)
  const [locationData, setLocationData] = useState(null)
  const [triageData, setTriageData]     = useState(null)

  function handleAuth(data) {
    const normalizedUser = {
      name    : data.name || data.email?.split('@')[0] || 'User',
      email   : data.email   || '',
      phone   : data.phone   || '',
      provider: data.provider || 'email',
      skipped : data.skipped  || false,
    }
    setUser(normalizedUser)
    setScreen('welcome')
  }

  function handleStart() {
    // Welcome button clicked → go to location picker
    setScreen('location')
  }

  function handleLocationComplete(data) {
    setLocationData(data)
    setScreen('dashboard')
  }

  function handleLocationSkip() {
    setLocationData(null)
    setScreen('dashboard')
  }

  function handleReset() {
    setScreen('auth')
    setUser(null)
    setLocationData(null)
    setTriageData(null)
  }

  return (
    <div className="h-full">
      {screen === 'auth' && (
        <AuthPage onAuth={handleAuth} />
      )}

      {screen === 'welcome' && (
        <WelcomeScreen
          onStart={handleStart}
          user={user}
          onLogout={handleReset}
        />
      )}

      {screen === 'location' && (
        <LocationPopup
          onComplete={handleLocationComplete}
          onSkip={handleLocationSkip}
          user={user}
          onLogout={handleReset}
        />
      )}

      {screen === 'triage' && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <SymptomGuidanceCard
            guidanceData={triageData}
            onProceed={() => setScreen('dashboard')}
          />
        </div>
      )}

      {screen === 'dashboard' && (
        <DashboardLayout
          onReset={handleReset}
          locationData={locationData}
          hospital={locationData?.hospital}
          user={user}
          onUpdateUser={setUser}
          triageData={triageData}
          onSetTriageData={setTriageData}
        />
      )}
    </div>
  )
}