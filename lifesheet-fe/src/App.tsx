
import { useAuth0 } from '@auth0/auth0-react'

import './App.css'
import { CVMainDashboard } from './components/cv-main-dashboard'
import { Welcome } from './components/welcome'
import { useEffect, useState } from 'react'
import cvsService from './services/cvs-service'
import userService from './services/user-service'
import { tr } from 'react-day-picker/locale'

function App() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [hasToken, setHasToken] = useState(false)
  useEffect(() => {
    if (isAuthenticated) {
      setHasToken(false)
      getAccessTokenSilently()
        .then(token => {
          console.log('Access token received:', token)
          cvsService.setAuthToken(token)
          userService.setAuthToken(token)
          setHasToken(true)
        })
        .catch(error => {
          console.error('Error getting access token:', error)
        })
        
    }
  }, [isAuthenticated, getAccessTokenSilently])
if( isAuthenticated && !hasToken) {
  return <div>Authenticating...</div>
}

  return (
    <>
 
      {
        hasToken ? (
          
          <CVMainDashboard />
          
        ) : (
          <Welcome />
        )}
    </>
  )
}

export default App
