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
import DermaLogo from '../../../assets/images/DermaCare.png' // adjust path if needed
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
const PAPER = '#FBFAF6'
const MIST = '#EEF4F2'
const LINE = 'rgba(14,42,50,0.12)'
const CORAL = '#C1473A'

// Role tabs — order drives the sliding segmented-control indicator's position.
const WORKSPACE_TABS = [
  { key: 'admin', label: 'Super Admin', role: 'admin', tint: TEAL },
  { key: 'administrator', label: 'Clinic Admin', role: 'administrator', tint: AMBER },
  { key: 'receptionist', label: 'Receptionist', role: 'receptionist', tint: '#5B7FA6' },
]

const Login = () => {
  const [activeTab, setActiveTab] = useState('admin') // clinic | doctor
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
    sessionStorage.clear()
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

        // ✅ Store in sessionStorage
        if (HospitalId) {
          sessionStorage.setItem('HospitalId', HospitalId)
          setHospitalId(HospitalId)
        }

        if (HospitalName) {
          sessionStorage.setItem('HospitalName', HospitalName)
        }

        if (token) {
          sessionStorage.setItem('token', token)
        }

        if (role) {
          sessionStorage.setItem('role', role)
        }
        if (branchId) {
          sessionStorage.setItem('branchId', branchId)
        }
        if (staffId) {
          sessionStorage.setItem('staffId', staffId)
        }
        if (staffName) {
          sessionStorage.setItem('staffName', staffName)
        }
        if (branchName) {
          sessionStorage.setItem('branchName', branchName)
        }

        if (payload.accessToken) {
          sessionStorage.setItem('token', payload.accessToken)
        }
        if (payload.mainBranch) {
          sessionStorage.setItem('mainBranch', payload.mainBranch)
        }

        // ✅ Always save THIS device's own FCM token (not the server's returned one).
        // The server may return another device's token if multiple devices share the
        // same account. We must persist our locally generated token so push
        // notifications are delivered to THIS browser only.
        if (fcmToken) {
          sessionStorage.setItem('fcmToken', fcmToken)
          console.log('✅ Saved this device FCM token to sessionStorage:', fcmToken)
        }

        await new Promise((resolve) => setTimeout(resolve, 100))

        if (HospitalId) {
          const hospitalData = payload.hospitalData || {} // logo, name, etc.

          // 1. Set user in context & sessionStorage
          const userData = { name: HospitalName || staffName, role, permissions }
          setUser(userData)
          sessionStorage.setItem('hospitalUser', JSON.stringify(userData))
          sessionStorage.setItem('permissions', JSON.stringify(permissions))

          // 2. Set hospital in context & sessionStorage
          const hospitalContextData = {
            hospitalId: HospitalId,
            hospitalName: HospitalName,
            data: hospitalData,
          }
          setSelectedHospital(hospitalContextData)
          sessionStorage.setItem('selectedHospital', JSON.stringify(hospitalContextData))

          setHospitalId(HospitalId)
          sessionStorage.setItem('HospitalId', HospitalId)
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

  // Same mapping the old <CFormSelect onChange> used — now driven by the segmented tabs.
  const handleWorkspaceSelect = (value) => {
    setActiveTab(value)
    let newRole = value
    if (value === 'admin') {
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
  console.log(activeTab)
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        html, body, #root { height: 100%; }

        * { box-sizing: border-box; }

        @keyframes peFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes peCardRise {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes peTraceDraw {
          from { stroke-dashoffset: 760; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes peTraceGlow {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(226,167,59,0)); }
          50% { filter: drop-shadow(0 0 6px rgba(226,167,59,0.45)); }
        }
        @keyframes peBpmPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes peShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }
        @keyframes peShimmer {
          from { transform: translateX(-130%) skewX(-12deg); }
          to { transform: translateX(230%) skewX(-12deg); }
        }
        @keyframes peBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }

        /* ================= Layout shell ================= */
        .pe-app {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: ${PAPER};
        }
        .pe-scroll { flex: 1; display: flex; flex-direction: column; }

        /* ================= Left: clinical panel ================= */
        .pe-panel {
          background: linear-gradient(175deg, ${INK} 0%, ${TEAL_DEEP} 100%);
          position: relative;
          overflow: hidden;
        }
        .pe-panel-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(243,247,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(243,247,246,0.05) 1px, transparent 1px);
          background-size: 34px 34px;
          pointer-events: none;
        }
        .pe-panel-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 40px 48px;
        }

        .pe-brandmark { display: flex; align-items: center; gap: 10px; }
        .pe-brandmark img { width: 34px; height: 34px; border-radius: 8px; }
        .pe-brandmark-text {
         
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.3px;
          color: rgba(243,247,246,0.9);
        }
        /* Logo stays pinned to the viewport's top-right corner at every breakpoint */
        /* Logo stays pinned to the top-right corner */
.pe-brand-link {
  position: fixed;
  top: 10px;
  left: 49.5%;
  transform: translateX(-50%);
  margin-left: -24px; /* Move slightly into the blue panel */
  z-index: 1000;
  cursor: pointer;
  text-decoration: none;
}

.pe-brand-link img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #ffffff;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
  transition: transform .2s ease;
}

.pe-brand-link:hover img {
  transform: scale(1.08);
}

@media (max-width: 767.98px) {
  .pe-brand-link {
    top: max(10px, env(safe-area-inset-top));
    right: max(10px, env(safe-area-inset-right));
  }

  .pe-brand-link img {
    width: 30px;
    height: 30px;
    border-radius: 7px;
  }
}
        .pe-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 460px;
        }
        .pe-eyebrow {
         
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${AMBER};
          opacity: 0;
          animation: peFadeUp 0.6s ease-out 0.05s forwards;
        }
        .pe-heading {
         
          font-weight: 700;
          color: #F3F7F6;
          letter-spacing: -0.5px;
          font-size: clamp(1.9rem, 1.4rem + 2vw, 2.9rem);
          line-height: 1.08;
          margin: 10px 0 6px;
          opacity: 0;
          animation: peFadeUp 0.6s ease-out 0.15s forwards;
        }
        .pe-tagline {
          font-size: 14.5px;
          color: rgba(243,247,246,0.62);
          line-height: 1.6;
          max-width: 360px;
          margin-bottom: 30px;
          opacity: 0;
          animation: peFadeUp 0.6s ease-out 0.25s forwards;
        }

        /* Signature: live vitals trace */
        .pe-vitals {
          border: 1px solid rgba(243,247,246,0.12);
          background: rgba(243,247,246,0.03);
          border-radius: 14px;
          padding: 18px 20px 14px;
          opacity: 0;
          animation: peFadeUp 0.6s ease-out 0.35s forwards;
        }
        .pe-vitals-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .pe-vitals-label {
          
          font-size: 10.5px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(243,247,246,0.45);
        }
        .pe-vitals-bpm {
          display: flex;
          align-items: baseline;
          gap: 5px;
          
        }
        .pe-vitals-bpm-num {
          font-size: 20px;
          font-weight: 600;
          color: ${AMBER};
          animation: peBpmPulse 1.15s ease-in-out infinite;
        }
        .pe-vitals-bpm-unit {
          font-size: 10px;
          color: rgba(243,247,246,0.4);
          letter-spacing: 0.5px;
        }
        .pe-trace-path {
          stroke: ${AMBER};
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 760;
          animation: peTraceDraw 1.8s ease-out 0.5s both, peTraceGlow 2.6s ease-in-out 2.3s infinite;
        }
        .pe-trace-dot { fill: #F3F7F6; }

        .pe-feature-list {
          list-style: none;
          margin: 22px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
          opacity: 0;
          animation: peFadeUp 0.6s ease-out 0.45s forwards;
        }
        .pe-feature-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(243,247,246,0.72);
        }
        .pe-feature-tick {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid rgba(226,167,59,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pe-feature-tick::after {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${AMBER};
        }

        .pe-panel-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 22px;
          margin-top: 22px;
          border-top: 1px solid rgba(243,247,246,0.12);
          font-size: 11.5px;
          color: rgba(243,247,246,0.55);
        }
        .pe-panel-footer a { color: rgba(243,247,246,0.65); text-decoration: none; }
        .pe-panel-footer a:hover { color: #F3F7F6; }

        .pe-brand-mobile {
          display: none;
        }

        /* ================= Right: auth card ================= */
        .pe-authcol {
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${PAPER};
        }
        .pe-card {
          background: #FFFFFF;
          border: 1px solid ${LINE};
          border-radius: 16px;
          box-shadow: 0 20px 44px rgba(14,42,50,0.10);
          animation: peCardRise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pe-card-title {
         
          font-weight: 700;
          color: ${INK};
          font-size: clamp(1.3rem, 1.15rem + 0.4vw, 1.5rem);
        }
        .pe-card-sub {
          color: ${INK};
          opacity: 0.55;
          font-size: 13px;
        }

        .pe-error-banner {
          background: rgba(193,71,58,0.07);
          border: 1px solid rgba(193,71,58,0.25);
          color: ${CORAL};
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          padding: 9px 12px;
          animation: peShake 0.45s ease;
        }

        /* Segmented workspace control */
        .pe-segmented {
          position: relative;
          display: flex;
          background: ${MIST};
          border-radius: 11px;
          padding: 4px;
          gap: 2px;
        }
        .pe-segmented-indicator {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          width: calc(33.333% - 4px);
          border-radius: 8px;
          background: #FFFFFF;
          box-shadow: 0 2px 6px rgba(14,42,50,0.14);
          transition: transform 0.32s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .pe-seg-btn {
          position: relative;
          z-index: 1;
          flex: 1 1 0;
          appearance: none;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 4px;
          
          font-size: clamp(10.5px, 10px + 0.3vw, 12.5px);
          font-weight: 600;
          color: rgba(14,42,50,0.48);
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.2s ease;
        }
        .pe-seg-btn.active { color: ${INK}; }
        .pe-seg-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.4;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .pe-seg-btn.active .pe-seg-dot { opacity: 1; transform: scale(1.2); }

        .pe-field-label {
         
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: ${INK};
          opacity: 0.5;
        }
        .pe-field-hint {
          font-size: 11px;
          color: ${INK};
          opacity: 0.38;
        }

        .pe-input-group .input-group-text {
          background: #FFFFFF;
          border: none;
          border-bottom: 1.5px solid ${LINE};
          border-radius: 0;
          padding-left: 2px;
        }
        .pe-input-group .form-control {
          border: none;
          border-bottom: 1.5px solid ${LINE};
          border-radius: 0;
          background: #FFFFFF;
          padding: 9px 4px;
          font-size: 14.5px;
          box-shadow: none !important;
          transition: border-color 0.2s ease;
        }
        .pe-input-group:focus-within .input-group-text,
        .pe-input-group:focus-within .form-control {
          border-color: ${TEAL};
        }
        .pe-field-error {
          font-size: 11.5px;
          color: ${CORAL};
          font-weight: 500;
          margin-top: 4px;
          opacity: 0;
          animation: peFadeUp 0.25s ease-out forwards;
        }

        .pe-link {
          font-weight: 600;
          font-size: 12.5px;
          color: ${INK};
          opacity: 0.65;
          text-decoration: none;
          transition: color 0.2s, opacity 0.2s;
        }
        .pe-link:hover { color: ${TEAL}; opacity: 1; }

        .pe-submit {
          position: relative;
          overflow: hidden;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-weight: 600;
          font-size: 15px;
          transition: transform 0.15s ease, box-shadow 0.25s ease;
          box-shadow: 0 6px 16px rgba(14,42,50,0.2);
        }
        .pe-submit::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-130%) skewX(-12deg);
        }
        .pe-submit:not(:disabled):hover::after { animation: peShimmer 0.85s ease; }
        .pe-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(14,42,50,0.28); }
        .pe-submit:disabled { opacity: 0.85; animation: peBreathe 1.3s ease-in-out infinite; }

        .pe-row { opacity: 0; animation: peFadeUp 0.4s ease-out forwards; }
        .pe-row.r1 { animation-delay: 0.12s; }
        .pe-row.r2 { animation-delay: 0.2s; }
        .pe-row.r3 { animation-delay: 0.28s; }
        .pe-row.r4 { animation-delay: 0.36s; }
        .pe-row.r5 { animation-delay: 0.44s; }

        /* ================= Responsive ================= */
        @media (max-width: 767.98px) {
          .pe-brand-mobile {
            display: flex;
            align-items: center;
            padding: 16px 56px 16px 20px; /* right padding clears the fixed logo */
            background: linear-gradient(120deg, ${TEAL_DEEP} 0%, ${INK} 100%);
            flex-shrink: 0;
          }
          .pe-brand-mobile span {
            
            font-weight: 600;
            font-size: 14px;
            color: #F3F7F6;
          }
        }
        @media (min-width: 768px) {
          .pe-panel-inner { padding-top: 70px; } /* clears the fixed logo on desktop */
        }
        /* Tablets: both columns are visible side-by-side but tighter than desktop */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .pe-panel-inner { padding: 70px 26px 26px; }
          .pe-tagline { max-width: none; }
          .pe-feature-list li { font-size: 12px; }
          .pe-authcol { padding: 24px 16px !important; }
        }
        @media (min-width: 992px) {
          .pe-panel, .pe-card { height: auto; }
          .pe-scroll { justify-content: center; }
          .pe-authcol { padding: 32px !important; }
        }
        @media (min-width: 1400px) {
          .pe-panel-inner { padding-left: 64px; padding-right: 64px; }
        }
        /* Small phones: keep the segmented control and card comfortable */
        @media (max-width: 380px) {
          .pe-seg-btn { font-size: 9.5px; padding: 8px 2px; letter-spacing: 0; }
          .pe-card-title { font-size: 1.2rem; }
          .pe-card { border-radius: 14px; }
          .pe-authcol { padding: 20px 12px !important; }
        }
        @supports (padding: max(0px)) {
          .pe-safe-top { padding-top: max(0px, env(safe-area-inset-top)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pe-heading, .pe-tagline, .pe-eyebrow, .pe-vitals, .pe-feature-list,
          .pe-card, .pe-row, .pe-trace-path, .pe-vitals-bpm-num,
          .pe-submit:hover, .pe-submit:disabled {
            animation: none !important;
          }
          .pe-heading, .pe-tagline, .pe-eyebrow, .pe-vitals, .pe-feature-list, .pe-row {
            opacity: 1 !important;
          }
        }
      `}</style>

      <div className="pe-app pe-safe-top">


        <div className="pe-scroll">
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <CContainer fluid className="p-0">

              <a
                href="https://chiselontechnologies.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Chiselon Technologies"
                className='pe-brand-link'
              >
                <img src={DermaLogo} alt="Chiselon Technologies" />
              </a>
              <CRow className="g-0">




                {/* LEFT: clinical brand panel — desktop/tablet only */}
                <CCol
                  md={6}
                  className="d-none d-md-flex pe-panel"
                  style={{ minHeight: '100vh' }}
                >
                  <div className="pe-panel-grid" />
                  <div className="pe-panel-inner">
                    <div className="pe-hero">
                      <span className="pe-eyebrow">Clinic Management Suite</span>
                      <h3 className="pe-heading">PhysioElite</h3>
                      <p className="pe-tagline"><em>Every patient, appointment and outcome — all in one place.</em></p>

                      <div className="pe-vitals">
                        <div className="pe-vitals-head">
                          <span className="pe-vitals-label">Live system status</span>
                          {/* <span className="pe-vitals-bpm">
                            <span className="pe-vitals-bpm-num">72</span>
                            <span className="pe-vitals-bpm-unit">bpm avg. response</span>
                          </span> */}
                        </div>
                        <svg width="100%" height="52" viewBox="0 0 420 52">
                          <path
                            id="peTracePath"
                            className="pe-trace-path"
                            d="M0,30 L60,30 L78,30 L92,10 L108,48 L124,18 L140,38 L158,30 L230,30 L246,14 L260,44 L276,30 L420,30"
                          />
                          <circle r="4" className="pe-trace-dot">
                            <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
                              <mpath href="#peTracePath" />
                            </animateMotion>
                          </circle>
                        </svg>
                      </div>

                      <ul className="pe-feature-list">
                        <li><span className="pe-feature-tick" />Clinic &amp; branch management</li>
                        <li><span className="pe-feature-tick" />Patient records &amp; appointments</li>
                        <li><span className="pe-feature-tick" />Billing, payments &amp; analytics</li>
                        <li><span className="pe-feature-tick" />Role-based secure access</li>
                      </ul>
                    </div>

                    <div className="pe-panel-footer">
                      <span className="d-inline-flex align-items-center gap-2 text-white">
                        <CIcon icon={cilShieldAlt} />
                        Secure by design
                      </span>
                      <span className="text-white">© {new Date().getFullYear()} Chiselon Technologies</span>
                      <a href="https://chiselontechnologies.com" target="_blank" rel="noreferrer" className="text-white">
                        About us
                      </a>
                    </div>
                  </div>
                </CCol>

                {/* Mobile brand strip */}
                <CCol xs={12} className="pe-brand-mobile">
                  <span>PhysioElite</span>
                </CCol>

                {/* RIGHT: auth card */}
                <CCol md={6} className="pe-authcol px-3 py-4">
                  <CCard className="pe-card border-0 w-100" style={{ maxWidth: 420, borderRadius: 16 }}>
                    <CCardBody className="p-4 p-md-5">
                      <h3 className="pe-card-title text-center mb-1">PhysioElite Portal</h3>
                      <p className="pe-card-sub text-center mb-4">Select your workspace to sign in</p>

                      {errorMessage && (
                        <div className="pe-error-banner text-center mb-3">{errorMessage}</div>
                      )}

                      {['admin', 'administrator', 'receptionist'].includes(activeTab) && (
                        <CForm onSubmit={handleClinicLogin} noValidate>
                          {/* segmented workspace selector — same onChange logic as before */}
                          <div className="pe-segmented mb-4">
                            <span
                              className="pe-segmented-indicator"
                              style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
                            />
                            {WORKSPACE_TABS.map((tab) => (
                              <button
                                key={tab.key}
                                type="button"
                                className={`pe-seg-btn${activeTab === tab.key ? ' active' : ''}`}
                                onClick={() => handleWorkspaceSelect(tab.key)}
                              >
                                <span className="pe-seg-dot" style={{ background: tab.tint }} />
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          <div className="pe-row r1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="pe-field-label mb-0">Username</label>
                              <span className="pe-field-hint">Required</span>
                            </div>
                            <CInputGroup className="pe-input-group mb-1">
                              <CInputGroupText>
                                <CIcon icon={cilUser} style={{ color: INK, opacity: 0.55 }} />
                              </CInputGroupText>
                              <CFormInput
                                placeholder="Enter User Name/ID"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value.trim())}
                              />
                            </CInputGroup>
                            {fieldErrors.userName && (
                              <div className="pe-field-error">{fieldErrors.userName}</div>
                            )}
                          </div>

                          <div className="pe-row r2 mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="pe-field-label mb-0">Password</label>
                              <span
                                className="pe-field-hint"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowPassword((s) => !s)}
                              >
                                {showPassword ? 'Hide' : 'Show'}
                              </span>
                            </div>
                            <CInputGroup className="pe-input-group mb-1">
                              <CInputGroupText
                                onClick={() => setShowPassword((s) => !s)}
                                style={{ cursor: 'pointer' }}
                              >
                                <CIcon
                                  icon={showPassword ? cilLockUnlocked : cilLockLocked}
                                  style={{ color: INK, opacity: 0.55 }}
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
                              <div className="pe-field-error">{fieldErrors.password}</div>
                            )}
                          </div>

                          <div className="d-flex justify-content-between mt-3 pe-row r3">
                            <a
                              href="#"
                              className="pe-link"
                              onClick={(e) => {
                                e.preventDefault()
                                setShowForgotModal(true)
                              }}
                            >
                              Forgot password?
                            </a>
                            <a
                              href="#"
                              className="pe-link"
                              onClick={(e) => {
                                e.preventDefault()
                                setShowResetModal(true)
                              }}
                            >
                              Reset password?
                            </a>
                          </div>

                          <div className="pe-row r4">
                            <CButton
                              type="submit"
                              disabled={isLoading}
                              className="pe-submit w-100 mt-4"
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
        </div>

        {/* Reset Modal */}
        <CModal visible={showResetModal} onClose={() => setShowResetModal(false)} className="custom-modal" backdrop="static">
          <CModalHeader>
            <CModalTitle>Reset Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ResetPassword onClose={() => setShowResetModal(false)} role={activeTab} />
          </CModalBody>
        </CModal>

        {/* Forgot Password Modal */}
        <CModal visible={showForgotModal} onClose={() => setShowForgotModal(false)} className="custom-modal" backdrop="static">
          <CModalHeader>
            <CModalTitle>Forgot Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ForgotPassword onClose={() => setShowForgotModal(false)} role={activeTab.toUpperCase()} initialMobile={userName} />
          </CModalBody>
        </CModal>
      </div>
    </>
  )
}

export default Login
