
import { useKeycloak } from '@react-keycloak/web'
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
import { CheckoutSuccessPage } from './components/plans/checkout-success'
import { CheckoutCancelPage } from './components/plans/checkout-cancel'
import { ExportPdf } from './components/export-pdf'
import TailoredCVs from './components/tailored-cvs'
import { Onboarding } from './components/onboarding'
import { Dashboard } from './components/dashboard'

function App() {
  const { keycloak, initialized } = useKeycloak();
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    if (initialized && keycloak?.authenticated) {
      setHasToken(false);
      const token = keycloak.token;
      if (token) {
        cvsService.setAuthToken(token);
        userService.setAuthToken(token);
        setHasToken(true);
      }
    }
  }, [initialized, keycloak]);

  if (!initialized) {
    return <div>Authenticating...</div>;
  }
  if (!keycloak?.authenticated || !hasToken) {
    return (<Welcome />);
  }
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cv-data" element={<CVData />} />
      <Route path="/tailor-cv" element={<TailorCV />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
      <Route path="/checkout-cancel" element={<CheckoutCancelPage />} />
      <Route path="/export-pdf" element={<ExportPdf />} />
      <Route path="/tailored-cvs" element={<TailoredCVs />} />
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  )
 
}

export default App
