
import { useAuth0 } from '@auth0/auth0-react'

import './App.css'
import { CVMainDashboard } from './components/cv-main-dashboard'
import { Welcome } from './components/welcome'

function App() {
  const { isAuthenticated } = useAuth0()
  return (
    <>
      {isAuthenticated ? (
        <CVMainDashboard />
      ) : (
        <Welcome />
      )}
    </>
  )
}

export default App
