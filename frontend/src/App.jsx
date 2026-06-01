import { useState } from 'react'
import AuthPage     from './pages/AuthPage'
import WelcomeScreen from './pages/WelcomeScreen'
import ChatPage     from './pages/ChatPage'

export default function App() {
  const [screen, setScreen]         = useState('auth')   // 'auth' | 'welcome' | 'chat'
  const [authData, setAuthData]     = useState(null)
  const [locationData, setLocationData] = useState(null)

  function handleAuth(data) {
    setAuthData(data)
    setScreen('welcome')
  }

  function handleStart(data) {
    setLocationData(data)
    setScreen('chat')
  }

  return (
    <div className="h-full">
      {screen === 'auth' && (
        <AuthPage onAuth={handleAuth} />
      )}
      {screen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}
      {screen === 'chat' && (
        <ChatPage
          onReset={() => { setScreen('auth'); setLocationData(null); setAuthData(null) }}
          locationData={locationData}
          hospital={locationData?.hospital}
        />
      )}
    </div>
  )
}