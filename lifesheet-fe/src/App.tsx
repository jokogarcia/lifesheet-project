
import { useAuth0 } from '@auth0/auth0-react'
import { Routes, Route } from 'react-router-dom'

import './App.css'
import { CVData } from './components/cv-data'
import { Welcome } from './components/welcome'
import { useEffect, useState } from 'react'
import cvsService from './services/cvs-service'
import userService from './services/user-service'
import { TailorCV } from './components/tailor-cv'
import { PlansPage } from './components/plans/plans-page'
import { CheckoutPage } from './components/plans/checkout-page'
import { ExportPdf } from './components/export-pdf'
import TailoredCVs from './components/tailored-cvs'
import { Onboarding } from './components/onboarding'
import { Dashboard } from './components/dashboard'

function App() {
  const { isAuthenticated, getAccessTokenSilently, isLoading:isAuthLoading, logout } = useAuth0()
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
          console.warn('Error getting access token. Logging out...', error)
          logout({ logoutParams: { returnTo: window.location.origin } });
        })
        
    }
  }, [isAuthenticated, getAccessTokenSilently])

if( isAuthenticated && !hasToken || isAuthLoading) {
  return <div>Authenticating...</div>
}
  if(!hasToken) {
    return (<Welcome />)
  }
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cv-data" element={<CVData />} />
      <Route path="/tailor-cv" element={<TailorCV />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/export-pdf" element={<ExportPdf />} />
      <Route path="/tailored-cvs" element={<TailoredCVs />} />
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  )
 
}

export default App
