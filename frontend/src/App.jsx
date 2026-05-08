import { useState } from 'react'
import WelcomeScreen from './pages/WelcomeScreen'
import ChatPage from './pages/ChatPage'

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <div className="h-full">
      {started
        ? <ChatPage onReset={() => setStarted(false)} />
        : <WelcomeScreen onStart={() => setStarted(true)} />
      }
    </div>
  )
}
