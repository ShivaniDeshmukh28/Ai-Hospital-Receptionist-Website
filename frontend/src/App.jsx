import { useState } from 'react'
import WelcomeScreen from './pages/WelcomeScreen'
import ChatPage from './pages/ChatPage'



export default function App() {
  const [started, setStarted]           = useState(false)
  const [locationData, setLocationData] = useState(null)

  function handleStart(data) {
    setLocationData(data)
    setStarted(true)
  }

  return (
    <div className="h-full">
      {started
        ? <ChatPage
            onReset={() => { setStarted(false); setLocationData(null) }}
            locationData={locationData}
          />
        : <WelcomeScreen onStart={handleStart} />
      }
    </div>
  )
}

