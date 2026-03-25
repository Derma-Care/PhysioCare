import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { ToastContainer } from 'react-toastify'
import { HospitalProvider } from './views/Usecontext/HospitalContext'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

import ProtectedRoute from './components/ProtectedRoute'
import { injectTheme } from './Constant/Themes'
import SupplierApp from './components/PharmacyManagement/Reorder/SupplierApp'
import { listenNotification } from './firebase'
import { LogoLoader } from './Utils/LogoLoder'

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    injectTheme()
  }, [])

  useEffect(() => {
    setColorMode('light')
  }, [])

  useEffect(() => {
    listenNotification()
  }, [])

  return (
    <Suspense fallback={<LogoLoader />}>
    {/* <Suspense> */}
      <Routes>
        {/* ✅ Lowercase redirect for consistency */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/500" element={<Page500 />} />
        <Route path="/supplier-Dashboard" element={<SupplierApp />} />

        {/* Protected routes - catch all */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <DefaultLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
