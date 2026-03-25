import React from 'react'
import { Navigate } from 'react-router-dom'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { CSpinner } from '@coreui/react'
import { Oval } from 'react-loader-spinner'
import logo from '../assets/images/DermaCare.png'
import { motion } from 'framer-motion'
import { LogoLoader } from '../Utils/LogoLoder'
const ProtectedRoute = ({ children }) => {
  const { loading, selectedHospital } = useHospital()
  const hospitalId = localStorage.getItem('HospitalId')

 if (loading) {
  return  <LogoLoader/>
     
}

  // ✅ Just check localStorage
  const isAuthenticated = !!hospitalId && (selectedHospital !== null || selectedHospital !== '')

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
