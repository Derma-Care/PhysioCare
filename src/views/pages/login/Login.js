import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked, cilShieldAlt } from '@coreui/icons'
import axios from 'axios'
import { BASE_URL, SBASE_URL } from '../../../baseUrl'
import { useHospital } from '../../Usecontext/HospitalContext'
import ResetPassword from '../../../views/Resetpassword'
import ForgotPassword from '../../../views/ForgotPassword'
import { http, httpPublic } from '../../../Utils/Interceptors'
// import DermaLogo from '../../../assets/images/DermaCare.png' // adjust path if needed
// import medicalBg from 'src/assets/images/medical_bg.jpg'
import { COLORS } from '../../../Constant/Themes'
import { toast, ToastContainer } from 'react-toastify'
import { showCustomToast } from '../../../Utils/Toaster'
import { getFCMToken } from '../../../firebase'

// ---- Design tokens (visual only — no logic lives here) ----
const INK = '#0E2A32'
const TEAL = COLORS.sideColor
const TEAL_DEEP = COLORS.primary
const AMBER = '#E2A73B'
const MIST = '#F3F7F6'
const CORAL = '#C1473A'

// Role tabs, styled like colour-coded folder dividers on a patient chart.
// Order here also drives the sliding tab indicator's position.
const WORKSPACE_TABS = [
  { key: 'clinic', label: 'Super Admin', role: 'admin', tint: TEAL },
  { key: 'administrator', label: 'Clinic Admin', role: 'administrator', tint: AMBER },
  { key: 'receptionist', label: 'Receptionist', role: 'receptionist', tint: '#5B7FA6' },
]

const Login = () => {
  const [activeTab, setActiveTab] = useState('clinic') // clinic | doctor
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)

  // const { fetchHospitalDetails,selectedHospital } = useHospital()
  const { selectedHospital, setUser, setHospitalId, setSelectedHospital, fetchAllData } =
    useHospital()
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    if (!userName.trim()) errors.userName = 'Username is required'
    if (!password.trim()) errors.password = 'Password is required'
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    // ✅ Clear storage when login page loads
    localStorage.clear()
  }, [])

  const handleClinicLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setErrorMessage('')

    try {
      // ✅ get FCM token first (this device's own token)
      await Notification.requestPermission()
      const fcmToken = await getFCMToken()
      console.log('📱 This device FCM token:', fcmToken)
      let res
      const loginBody = {
        userName,
        password,
        role,
        fcmToken: fcmToken || '',
        deviceType: 'web',
      }

      // ✅ Call correct API based on role
      if (role.toLowerCase() === 'admin') {
        const resposnse = await http.post(`/clinicLogin`, loginBody, {
          headers: { 'Content-Type': 'application/json' },
        })
        res = resposnse
      } else {
        const resposnse = await http.post(`/loginUsingRoles`, loginBody, {
          headers: { 'Content-Type': 'application/json' },
        })
        res = resposnse.data
      }

      console.log('✅ Login API response:', res.data)

      // ✅ Success check
      if (res?.status === 200) {
        const payload = res.data
        if (!payload) {
          showCustomToast(res?.message || 'Invalid login response', 'error')
          return
        }

        const HospitalId = payload.hospitalId
        const HospitalName = payload.hospitalName
        const staffId = payload.staffId
        const staffName = payload.staffName
        const token = payload.accessToken
        const permissions = payload.permissions
        const branchId = payload.branchId
        const branchName = payload.branchName
        console.log(HospitalId, HospitalName, selectedHospital, role)

        // ✅ Store in localStorage
        if (HospitalId) {
          localStorage.setItem('HospitalId', HospitalId)
          setHospitalId(HospitalId)
        }

        if (HospitalName) {
          localStorage.setItem('HospitalName', HospitalName)
        }

        if (token) {
          localStorage.setItem('token', token)
        }

        if (role) {
          localStorage.setItem('role', role)
        }
        if (branchId) {
          localStorage.setItem('branchId', branchId)
        }
        if (staffId) {
          localStorage.setItem('staffId', staffId)
        }
        if (staffName) {
          localStorage.setItem('staffName', staffName)
        }
        if (branchName) {
          localStorage.setItem('branchName', branchName)
        }

        if (payload.accessToken) {
          localStorage.setItem('token', payload.accessToken)
        }

        // ✅ Always save THIS device's own FCM token (not the server's returned one).
        // The server may return another device's token if multiple devices share the
        // same account. We must persist our locally generated token so push
        // notifications are delivered to THIS browser only.
        if (fcmToken) {
          localStorage.setItem('fcmToken', fcmToken)
          console.log('✅ Saved this device FCM token to localStorage:', fcmToken)
        }

        await new Promise((resolve) => setTimeout(resolve, 100))

        if (HospitalId) {
          const hospitalData = payload.hospitalData || {} // logo, name, etc.

          // 1. Set user in context & localStorage
          const userData = { name: HospitalName || staffName, role, permissions }
          setUser(userData)
          localStorage.setItem('hospitalUser', JSON.stringify(userData))
          localStorage.setItem('permissions', JSON.stringify(permissions))

          // 2. Set hospital in context & localStorage
          const hospitalContextData = {
            hospitalId: HospitalId,
            hospitalName: HospitalName,
            data: hospitalData,
          }
          setSelectedHospital(hospitalContextData)
          localStorage.setItem('selectedHospital', JSON.stringify(hospitalContextData))

          setHospitalId(HospitalId)
          localStorage.setItem('HospitalId', HospitalId)
          await fetchAllData(HospitalId)
          showCustomToast(res.data?.message || 'Login successful!', 'success')

          navigate('/dashboard')
        }
      }
    } catch (err) {
      console.error('Login error:', err)

      const backendMessage = err?.response?.data?.message

      if (backendMessage) {
        if (backendMessage.toLowerCase().includes('username')) {
          setErrorMessage('Invalid username. Please try again.')
          // showCustomToast('Invalid username. Please try again.', 'error')
        } else if (backendMessage.toLowerCase().includes('password')) {
          setErrorMessage('Invalid password. Please try again.')
          // showCustomToast('Invalid password. Please try again.', 'error')
        } else {
          setErrorMessage(backendMessage)
          // showCustomToast(backendMessage, 'error')
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.')
        // showCustomToast('An unexpected error occurred. Please try again later.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Same mapping the old <CFormSelect onChange> used — now driven by the folder tabs.
  const handleWorkspaceSelect = (value) => {
    setActiveTab(value)
    let newRole = value
    if (value === 'clinic') {
      newRole = 'admin'
    } else if (value === 'receptionist') {
      newRole = 'receptionist'
    } else if (value === 'administrator') {
      newRole = 'administrator'
    }
    setRole(newRole)
    console.log('Role to send:', newRole)
  }

  const activeIndex = WORKSPACE_TABS.findIndex((t) => t.key === activeTab)
  const activeTint = WORKSPACE_TABS[activeIndex]?.tint || TEAL

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        html, body, #root { height: 100%; }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ambientDrift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-2%, 1.5%); }
          100% { transform: translate(0, 0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -14px) scale(1.06); }
          66% { transform: translate(-8px, 10px) scale(0.95); }
        }
        @keyframes waveSweep {
          from { stroke-dashoffset: 620; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes wavePulseDot {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(26px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tabGlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shakeErr {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }
        @keyframes stampPress {
          0% { transform: scale(1); }
          40% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes clipShine {
          0%, 100% { filter: drop-shadow(0 2px 4px rgba(14,42,50,0.25)); }
          50% { filter: drop-shadow(0 4px 8px rgba(20,107,94,0.28)); }
        }
        @keyframes logoBreathe {
          0%, 100% { filter: drop-shadow(0 4px 10px rgba(0,0,0,0.18)); transform: scale(1); }
          50% { filter: drop-shadow(0 8px 18px rgba(226,167,59,0.35)); transform: scale(1.03); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-130%) skewX(-15deg); }
          100% { transform: translateX(230%) skewX(-15deg); }
        }
        @keyframes spinGlow {
          0% { box-shadow: 0 0 0 0 rgba(226,167,59,0.35); }
          100% { box-shadow: 0 0 0 10px rgba(226,167,59,0); }
        }
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(226,167,59,0.25), inset 0 0 0 1px rgba(226,167,59,0.45); }
          50% { box-shadow: 0 0 14px 2px rgba(226,167,59,0.22), inset 0 0 0 1px rgba(226,167,59,0.6); }
        }

        * { box-sizing: border-box; }

   .cc-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}
     .cc-scroll {
  flex: 1;
  display: flex;
  flex-direction: column;
}
        .cc-tex {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(14,42,50,0.055) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.6;
          animation: ambientDrift 22s ease-in-out infinite;
          pointer-events: none;
        }

        /* ---- Brand panel (left on desktop, top strip on mobile) ---- */
        .cc-brand {
          background: linear-gradient(135deg, ${TEAL_DEEP} 0%, ${INK} 55%, ${TEAL_DEEP} 100%);
          background-size: 220% 220%;
          animation: gradientShift 14s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .cc-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
        }
        .cc-orb.o1 { width: 480px; height: 480px; top: -180px; right: -140px; background: radial-gradient(circle, rgba(226,167,59,0.12) 0%, transparent 70%); animation: floatSlow 16s ease-in-out infinite; }
        .cc-orb.o2 { width: 360px; height: 360px; bottom: -140px; left: -100px; background: radial-gradient(circle, rgba(20,107,94,0.35) 0%, transparent 70%); animation: floatSlow 20s ease-in-out infinite reverse; }
        .cc-orb.o3 { width: 10px; height: 10px; top: 22%; left: 18%; background: ${AMBER}; opacity: 0.5; animation: floatSlow 9s ease-in-out infinite, wavePulseDot 3s ease-in-out infinite; }
        .cc-orb.o4 { width: 7px; height: 7px; top: 62%; left: 72%; background: #F3F7F6; opacity: 0.4; animation: floatSlow 11s ease-in-out infinite reverse, wavePulseDot 4s ease-in-out infinite; }
        .cc-orb.o5 { width: 5px; height: 5px; top: 78%; left: 30%; background: ${AMBER}; opacity: 0.6; animation: floatSlow 7s ease-in-out infinite, wavePulseDot 2.4s ease-in-out infinite; }

        /* ---- Brand highlight badge: the one thing every viewer should read first ---- */
        .cc-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 16px 8px 10px;
          border-radius: 999px;
          background: rgba(226,167,59,0.08);
          animation: badgeGlow 3.2s ease-in-out infinite;
        }
        .cc-brand-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${AMBER};
          flex-shrink: 0;
          animation: wavePulseDot 1.8s ease-in-out infinite;
        }
        .cc-brand-badge-text {
         
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.8px;
          color: ${AMBER};
          white-space: nowrap;
        }

        .cc-heading {
         
          font-weight: 700;
          color: #F3F7F6;
          letter-spacing: -0.5px;
          font-size: clamp(1.2rem, 1rem + 1.6vw, 2.4rem);
          line-height: 1.12;
        }
        .cc-sub {
          color: rgba(243,247,246,0.68);
          font-size: clamp(12.5px, 12px + 0.2vw, 14.5px);
          line-height: 1.55;
        }
        .cc-fade { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }
        .cc-fade.d1 { animation-delay: 0.05s; }
        .cc-fade.d2 { animation-delay: 0.18s; }
        .cc-fade.d3 { animation-delay: 0.32s; }
        .cc-fade.d4 { animation-delay: 0.46s; }

        .cc-wave-path {
          stroke: ${AMBER};
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 620;
          animation: waveSweep 2.1s ease-out 0.4s both;
        }

        .cc-annotation {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(243,247,246,0.14);
          background: rgba(243,247,246,0.04);
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          opacity: 0;
          animation: fadeUp 0.5s ease-out forwards;
        }
        .cc-annotation:nth-of-type(1) { animation-delay: 0.6s; }
        .cc-annotation:nth-of-type(2) { animation-delay: 0.72s; }
        .cc-annotation:nth-of-type(3) { animation-delay: 0.84s; }
        .cc-annotation:hover {
          background: rgba(243,247,246,0.08);
          border-color: rgba(226,167,59,0.35);
          transform: translateX(3px);
        }
        .cc-annotation-tag {
         
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: ${AMBER};
          border: 1px solid rgba(226,167,59,0.4);
          border-radius: 4px;
          padding: 2px 6px;
          flex-shrink: 0;
        }
        .cc-annotation-text {
          font-size: 11px;
          color: rgba(243,247,246,0.88);
          font-weight: 500;
          text-align: center;
        
        }

        .cc-logo { animation: logoBreathe 4.5s ease-in-out infinite; }

        .cc-brand-mobile { display: none; }

        /* ---- Chart card ---- */
        .cc-chart-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid rgba(14,42,50,0.08);
          box-shadow: 0 24px 56px rgba(14,42,50,0.16);
          position: relative;
          animation: cardRise 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cc-clip {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 64px;
          height: 26px;
          border-radius: 6px;
          background: linear-gradient(160deg, #C7CFCE 0%, #8E9C9A 100%);
          animation: clipShine 3.6s ease-in-out infinite;
        }
        .cc-clip::after {
          content: '';
          position: absolute;
          inset: 6px 14px;
          border-radius: 3px;
          background: #FFFFFF;
        }

        .cc-title {
       
          font-weight: 700;
          color: ${INK};
          font-size: clamp(1.35rem, 1.2rem + 0.5vw, 1.6rem);
        }
        .cc-field-label {
     
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: ${INK};
          opacity: 0.55;
        }
        .cc-field-hint {
          font-size: 11px;
          color: ${INK};
          opacity: 0.4;
          font-weight: 500;
        }

        /* folder-tab workspace selector w/ sliding pill indicator + role colour dot */
        .cc-tabs {
          position: relative;
          display: flex;
          gap: 4px;
          border-bottom: 1px solid rgba(14,42,50,0.1);
          margin-bottom: 20px;
        }
        .cc-tab-btn {
          flex: 1 1 0;
          appearance: none;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 6px 11px;
        
          font-size: clamp(11px, 10.5px + 0.3vw, 13px);
          font-weight: 600;
          color: rgba(14,42,50,0.5);
          border-radius: 8px 8px 0 0;
          position: relative;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease;
          opacity: 0;
          animation: tabGlideIn 0.4s ease-out forwards;
          white-space: nowrap;
        }
        .cc-tab-btn:nth-of-type(1) { animation-delay: 0.1s; }
        .cc-tab-btn:nth-of-type(2) { animation-delay: 0.18s; }
        .cc-tab-btn:nth-of-type(3) { animation-delay: 0.26s; }
        .cc-tab-btn:hover { color: ${INK}; background: rgba(14,42,50,0.03); }
        .cc-tab-btn.active { color: ${INK}; }
        .cc-tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.45;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .cc-tab-btn.active .cc-tab-dot { opacity: 1; transform: scale(1.15); }
        .cc-tab-indicator {
          position: absolute;
          bottom: -1px;
          height: 2.5px;
          border-radius: 2px;
          width: calc(33.333% - 8px);
          transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1), background 0.3s ease;
        }

        .cc-input-group .input-group-text {
          background: ${MIST};
          border-right: none;
          border-color: rgba(14,42,50,0.16);
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .cc-input-group .form-control {
          border-left: none;
          border-color: rgba(14,42,50,0.16);
          padding-top: 11px;
          padding-bottom: 11px;
          font-size: 14.5px;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .cc-input-group .form-control:focus {
          box-shadow: 0 0 0 3px rgba(20,107,94,0.16);
          border-color: ${TEAL};
        }
        .cc-input-group:focus-within .input-group-text {
          border-color: ${TEAL};
          background: #EAF3F1;
        }
        .cc-field-error {
          font-size: 11.5px;
          color: ${CORAL};
          font-weight: 500;
          margin-top: 4px;
          opacity: 0;
          animation: fadeUp 0.25s ease-out forwards;
        }

        .cc-row { opacity: 0; animation: fadeUp 0.45s ease-out forwards; }
        .cc-row.r1 { animation-delay: 0.2s; }
        .cc-row.r2 { animation-delay: 0.3s; }
        .cc-row.r3 { animation-delay: 0.4s; }
        .cc-row.r4 { animation-delay: 0.5s; }

        .cc-link {
     
          font-weight: 600;
          font-size: 12.5px;
          color: ${INK};
          opacity: 0.7;
          transition: color 0.2s, opacity 0.2s;
        }
        .cc-link:hover { color: ${TEAL}; opacity: 1; }

        .cc-submit {
          position: relative;
          overflow: hidden;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-weight: 600;
          font-size: 15px;
          transition: transform 0.15s ease, box-shadow 0.25s ease, background 0.3s ease;
          box-shadow: 0 6px 16px rgba(14,42,50,0.22);
        }
        .cc-submit::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-130%) skewX(-15deg);
        }
        .cc-submit:not(:disabled):hover::after { animation: shimmerSweep 0.9s ease; }
        .cc-submit:not(:disabled):active { animation: stampPress 0.28s ease; }
        .cc-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(14,42,50,0.3); }
        .cc-submit:disabled { animation: spinGlow 1.4s ease-out infinite; }

        .cc-error-banner {
          animation: shakeErr 0.45s ease;
        
        }

        /* ---- Responsive: tablets & phones ---- */
        @media (max-width: 767.98px) {
          .cc-brand-mobile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            background: linear-gradient(120deg, ${TEAL_DEEP} 0%, ${INK} 100%);
            background-size: 200% 200%;
            animation: gradientShift 14s ease-in-out infinite;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
          }
          .cc-brand-mobile .cc-brand-badge { padding: 6px 12px 6px 8px; }
          .cc-brand-mobile .cc-brand-badge-text { font-size: 10px; letter-spacing: 0.5px; }
        }
        @media (max-width: 380px) {
          .cc-chart-card { border-radius: 14px; }
          .cc-tab-btn { font-size: 10.5px; }
        }
@media (min-width:992px){

    .cc-brand,
    .cc-chart-card{
        height:auto;
    }

    .cc-scroll{
        justify-content:center;
    }

}
        @supports (padding: max(0px)) {
          .cc-safe-bottom { padding-bottom: max(10px, env(safe-area-inset-bottom)); }
          .cc-safe-top { padding-top: max(0px, env(safe-area-inset-top)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-tex, .cc-fade, .cc-annotation, .cc-chart-card, .cc-clip, .cc-orb,
          .cc-tab-btn, .cc-row, .cc-submit:hover, .cc-wave-path, .cc-brand,
          .cc-brand-mobile, .cc-logo, .cc-submit:disabled, .cc-brand-badge,
          .cc-brand-badge-dot { animation: none !important; }
          .cc-fade, .cc-annotation, .cc-tab-btn, .cc-row { opacity: 1 !important; }
        }
      `}</style>

      <div className="cc-app cc-safe-top">
        {/* Mobile-only compact brand strip — the Chiselon name stays visible on phones too */}
        {/* <div className="cc-brand-mobile">
          <img src={DermaLogo} alt="Derma Care" style={{ width: 30, height: 'auto' }} className="cc-logo" />
          <span className="cc-brand-badge">
            <span className="cc-brand-badge-dot" />
            <span className="cc-brand-badge-text">CHISELON CLINIC MANAGEMENT SYSTEM</span>
          </span>
        </div> */}

        <div className="cc-scroll">
          <div className="cc-tex" style={{ zIndex: 0 }} />

          <div
            className="d-flex justify-content-center align-items-center flex-grow-1"
            style={{ position: 'relative', zIndex: 2 }}
          >
            <CContainer fluid className="p-0  ">
              <CRow className="g-0 ">
                {/* LEFT: brand / chart-room panel — desktop/tablet only */}
                <CCol md={6} className="d-none d-md-flex flex-column justify-content-center cc-brand px-5 py-4" style={{ minHeight: '100vh' }}>
                  <div className="cc-orb o1" />
                  <div className="cc-orb o2" />
                  <div className="cc-orb o3" />
                  <div className="cc-orb o4" />
                  <div className="cc-orb o5" />
                  <div />
                  <div className="px-3" style={{ position: 'relative', zIndex: 1 }}>
                    {/* <img
                      src={DermaLogo}
                      alt="Derma Care"
                      className="mb-4 cc-fade d1 cc-logo"
                      style={{ width: 96, height: 'auto' }}
                    /> */}

                    {/* Highlight: the Chiselon CMS name gets its own glowing badge,
                        so it's the first thing read — not just small eyebrow text */}
                    {/* <span className="cc-brand-badge cc-fade d1">
                      <span className="cc-brand-badge-dot" />
                      <span className="cc-brand-badge-text">CHISELON CLINIC MANAGEMENT SYSTEM</span>
                    </span> */}

                    {/* <h2 className="cc-heading mt-3 mb-3 cc-fade d2">
                      Every chart,<br />one console.
                    </h2> */}



                    <h3 className="cc-heading mt-3 mb-3 cc-fade d2">
                      Complete Clinic Management,
                      <br />
                      All in One Place.
                    </h3>
                    <svg
                      width="100%"
                      height="48"
                      viewBox="0 0 420 48"
                      className="cc-fade d3"
                      style={{ display: 'block', marginBottom: 26, maxWidth: 360 }}
                      aria-hidden="true"
                    >
                      <polyline
                        className="cc-wave-path"
                        points="0,24 60,24 78,24 92,7 108,41 124,14 140,32 158,24 190,24 230,24 246,10 260,36 276,24 420,24"
                      />
                    </svg>
                    <p
                      className="cc-sub cc-fade d4 mb-4"
                      style={{
                        maxWidth: "520px",
                        lineHeight: "1.8",
                        fontSize: "15px",
                        color: "rgba(243,247,246,0.82)",
                      }}
                    >
                      Streamline your entire healthcare workflow with a unified platform for
                      patient records, appointment scheduling, billing, doctor management,
                      and insightful analytics—designed to
                      improve efficiency, security, and patient care.
                    </p>

                    {/* <div className="d-flex flex-wrap gap-2 mb-4">
                      <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                        👨‍⚕️ Patient Management
                      </span>

                      <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                        📅 Smart Appointments
                      </span>

                      <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                        💳 Billing & Payments
                      </span>

                      <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                        📊 Analytics
                      </span>

                      <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                        🔒 Secure Access
                      </span>
                    </div> */}

                    <CRow className="g-2 mt-1" style={{ maxWidth: 480 }}>
                      <CCol xs={12} sm={6} lg={4}>
                        <div className="cc-annotation h-100">

                          <span className="cc-annotation-text">Clinic Management</span>
                        </div>
                      </CCol>

                      <CCol xs={12} sm={6} lg={4}>
                        <div className="cc-annotation h-100">

                          <span className="cc-annotation-text">Analytics Dashboard</span>
                        </div>
                      </CCol>

                      <CCol xs={12} sm={6} lg={4}>
                        <div className="cc-annotation h-100">

                          <span className="cc-annotation-text">Secure Access</span>
                        </div>
                      </CCol>

                      <CCol xs={12} sm={6} lg={4}>
                        <div className="cc-annotation h-100">

                          <span className="cc-annotation-text">Patient Management</span>
                        </div>
                      </CCol>

                      <CCol xs={12} sm={6} lg={4}>
                        <div className="cc-annotation h-100">

                          <span className="cc-annotation-text">Appointments</span>
                        </div>
                      </CCol>

                      <CCol xs={12} sm={6} lg={4}>
                        <div className="cc-annotation h-100">

                          <span className="cc-annotation-text">Billing & Payments</span>
                        </div>
                      </CCol>
                    </CRow>
                  </div>
                  <div
                    className="mt-auto pt-4"
                    style={{
                      position: "relative",
                      zIndex: 1,
                      borderTop: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <div className="d-flex flex-row gap-3 text-center justify-content-between" style={{ fontSize: "10px" }}>
                      <span className="d-inline-flex justify-content-center align-items-center gap-2 text-white">
                        <CIcon icon={cilShieldAlt} />
                        Secure by Design
                      </span>

                      <span className="text-white">
                        © {new Date().getFullYear()} Chiselon Technologies
                      </span>

                      <a
                        href="https://chiselontechnologies.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-white text-decoration-none"
                      >
                        About Chiselon Technologies
                      </a>
                    </div>
                  </div>
                </CCol>

                {/* RIGHT: chart card + form */}
                <CCol md={6} className="d-flex align-items-center justify-content-center px-3 py-3 py-md-4">
                  <CCard className="cc-chart-card border-0 w-100" style={{
                    maxWidth: 430,
                    borderRadius: 18
                  }}>
                    <div className="cc-clip d-none d-md-block" />
                    <CCardBody className="p-4 p-md-5 pt-4 pt-md-5">
                      <h3 className="cc-title text-center mb-1">CCMS Portal</h3>
                      <p className="text-center mb-4" style={{ color: INK, opacity: 0.6, fontSize: '13.5px' }}>
                        Select your workspace to sign in
                      </p>

                      {errorMessage && (
                        <div
                          className="text-center py-2 mb-3 cc-error-banner"
                          style={{
                            background: 'rgba(193,71,58,0.08)',
                            border: '1px solid rgba(193,71,58,0.25)',
                            color: CORAL,
                            borderRadius: 10,
                            fontSize: 13.5,
                            fontWeight: 500,
                          }}
                        >
                          {errorMessage}
                        </div>
                      )}

                      {['clinic', 'administrator', 'receptionist'].includes(activeTab) && (
                        <CForm onSubmit={handleClinicLogin} noValidate>
                          {/* folder-tab workspace selector — replaces the old dropdown,
                              same onChange logic, now visualised with a sliding pill
                              plus a colour dot per role for faster recognition */}
                          <div className="cc-tabs">
                            {WORKSPACE_TABS.map((tab) => (
                              <button
                                key={tab.key}
                                type="button"
                                className={`cc-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                                onClick={() => handleWorkspaceSelect(tab.key)}
                              >
                                <span className="cc-tab-dot" style={{ background: tab.tint }} />
                                {tab.label}
                              </button>
                            ))}
                            <span
                              className="cc-tab-indicator"
                              style={{
                                background: activeTint,
                                transform: `translateX(calc(${activeIndex} * (100% + 12px)))`,
                                left: 4,
                              }}
                            />
                          </div>

                          <div className="cc-row r1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="cc-field-label mb-0">Username</label>
                              <span className="cc-field-hint">Required</span>
                            </div>
                            <CInputGroup className="cc-input-group mb-1">
                              <CInputGroupText>
                                <CIcon icon={cilUser} style={{ color: INK, opacity: 0.6 }} />
                              </CInputGroupText>
                              <CFormInput
                                placeholder="Enter Your Id"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value.trim())}
                              />
                            </CInputGroup>
                            {fieldErrors.userName && (
                              <div className="cc-field-error">{fieldErrors.userName}</div>
                            )}
                          </div>

                          <div className="cc-row r2 mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="cc-field-label mb-0">Password</label>
                              <span className="cc-field-hint">{showPassword ? 'Hide' : 'Show'}</span>
                            </div>
                            <CInputGroup className="cc-input-group mb-1">
                              <CInputGroupText
                                onClick={() => setShowPassword((s) => !s)}
                                style={{ cursor: 'pointer' }}
                              >
                                <CIcon
                                  icon={showPassword ? cilLockUnlocked : cilLockLocked}
                                  style={{ color: INK, opacity: 0.6 }}
                                />
                              </CInputGroupText>
                              <CFormInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.trim())}
                              />
                            </CInputGroup>
                            {fieldErrors.password && (
                              <div className="cc-field-error">{fieldErrors.password}</div>
                            )}
                          </div>

                          <div className="d-flex justify-content-between mt-3 cc-row r3">
                            <a
                              href="#"
                              className="cc-link text-decoration-none"
                              onClick={(e) => {
                                e.preventDefault()
                                setShowForgotModal(true)
                              }}
                            >
                              Forgot password?
                            </a>
                            <a
                              href="#"
                              className="cc-link text-decoration-none"
                              onClick={(e) => {
                                e.preventDefault()
                                setShowResetModal(true)
                              }}
                            >
                              Reset password?
                            </a>
                          </div>

                          <div className="cc-row r4">
                            <CButton
                              type="submit"
                              disabled={isLoading}
                              className="cc-submit w-100 mt-4"
                              style={{ color: 'white', background: `linear-gradient(135deg, ${activeTint} 0%, ${INK} 130%)` }}
                            >
                              {isLoading ? <CSpinner size="sm" style={{ color: 'white' }} /> : 'Sign in'}
                            </CButton>
                          </div>
                        </CForm>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CContainer>
          </div>

          {/* <footer
            className="d-flex flex-wrap justify-content-around small py-2 cc-safe-bottom"
            style={{
              color: INK,
              opacity: 0.7,
              backgroundColor: 'rgba(243,247,246,0.9)',
              position: 'relative',
              zIndex: 2,
              fontSize: 12.5,
              animation: 'fadeIn 0.8s ease-out 0.6s both',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <span className="d-inline-flex align-items-center gap-2">
              <CIcon icon={cilShieldAlt} /> Secure by design
            </span>
            <span>© {new Date().getFullYear()} Chiselon Technologies</span>
            <a href="https://chiselontechnologies.com" target="_blank" style={{ color: INK }} rel="noreferrer">
              About Chiselon Technologies
            </a>
          </footer> */}
        </div>

        {/* Reset Modal */}
        <CModal visible={showResetModal} onClose={() => setShowResetModal(false)} className="custom-modal" backdrop="static">
          <CModalHeader>
            <CModalTitle>Reset Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ResetPassword onClose={() => setShowResetModal(false)} />
          </CModalBody>
        </CModal>

        {/* Forgot Password Modal */}
        <CModal visible={showForgotModal} onClose={() => setShowForgotModal(false)} className="custom-modal" backdrop="static">
          <CModalHeader>
            <CModalTitle>Forgot Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ForgotPassword onClose={() => setShowForgotModal(false)} />
          </CModalBody>
        </CModal>
      </div>
    </>
  )
}

export default Login