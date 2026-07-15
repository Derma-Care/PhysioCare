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
import DermaLogo from 'src/assets/images/DermaCare.png' // adjust path if needed
import medicalBg from 'src/assets/images/medical_bg.jpg'
import { COLORS } from '../../../Constant/Themes'
import { toast, ToastContainer } from 'react-toastify'
import { showCustomToast } from '../../../Utils/Toaster'
import { getFCMToken } from '../../../firebase'

// Local accent used only for design details (focus rings, badges, hero line).
// Does not replace COLORS.primary anywhere logic-relevant.
const ACCENT = '#0FA98A'

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

  return (
    // Outer container uses flex column and full viewport height to allow sticky footer without overflow
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

       

        @keyframes floatBubble {
          0% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(15px) scale(1.05); }
          66% { transform: translateY(15px) translateX(-15px) scale(0.95); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 340; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes glowDot {
          0%, 100% { opacity: 0.4; r: 3.2; }
          50% { opacity: 1; r: 4.4; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gentlePop {
          0% { opacity: 0; transform: scale(0.94) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-120%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes badgePulseRing {
          0% { box-shadow: 0 0 0 0 rgba(15,169,138,0.28); }
          100% { box-shadow: 0 0 0 8px rgba(15,169,138,0); }
        }
        @keyframes shakeErr {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }
        @keyframes logoBreathe {
          0%, 100% { filter: drop-shadow(0 6px 18px rgba(27,79,138,0.18)); }
          50% { filter: drop-shadow(0 10px 26px rgba(15,169,138,0.28)); }
        }

        .derma-bg {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          overflow: hidden;
          background-color: #F4F9F8;
        }
        .derma-grid-texture {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(27,79,138,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(27,79,138,0.05) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, #000 40%, transparent 100%);
          mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, #000 40%, transparent 100%);
          pointer-events: none;
        }
        .bg-shape-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(27,79,138,0.07) 0%, transparent 70%);
          top: -200px;
          left: -150px;
          animation: floatBubble 12s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-shape-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(15,169,138,0.08) 0%, transparent 70%);
          bottom: -150px;
          right: -100px;
          animation: floatBubble 15s ease-in-out infinite reverse;
          pointer-events: none;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(14px) !important;
          -webkit-backdrop-filter: blur(14px) !important;
          border: 1px solid rgba(255, 255, 255, 0.7) !important;
          box-shadow: 0 20px 48px rgba(27, 79, 138, 0.10) !important;
          border-radius: 20px !important;
          overflow: hidden;
          animation: gentlePop 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .derma-link {
          font-weight: 600;
          font-size: 13px;
          transition: color 0.2s, text-shadow 0.2s;
        }
        .derma-link:hover {
          color: ${ACCENT} !important;
          text-shadow: 0 0 8px rgba(15,169,138,0.2);
        }
        .login-feature-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(27,79,138,0.12);
          color: ${COLORS.primary};
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1px;
          transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
          opacity: 0;
          animation: fadeUp 0.5s ease-out forwards;
        }
        .login-feature-badge:nth-of-type(1) { animation-delay: 0.55s; }
        .login-feature-badge:nth-of-type(2) { animation-delay: 0.68s; }
        .login-feature-badge:nth-of-type(3) { animation-delay: 0.81s; }
        .login-feature-badge:hover {
          background: rgba(255,255,255,0.9);
          border-color: rgba(15,169,138,0.35);
          transform: translateX(4px);
          animation: badgePulseRing 1.1s ease-out;
        }
        .login-feature-badge .badge-emoji {
          display: inline-flex;
          transition: transform 0.35s ease;
        }
        .login-feature-badge:hover .badge-emoji {
          transform: scale(1.18) rotate(-6deg);
        }
        .derma-hero-fade { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }
        .derma-hero-fade.d1 { animation-delay: 0.05s; }
        .derma-hero-fade.d2 { animation-delay: 0.18s; }
        .derma-hero-fade.d3 { animation-delay: 0.3s; }
        .derma-hero-fade.d4 { animation-delay: 0.42s; }

        .derma-input-group .input-group-text {
          background: #F6FAF9;
          border-right: none;
          border-color: rgba(27,79,138,0.18);
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .derma-input-group .form-control {
          border-left: none;
          border-color: rgba(27,79,138,0.18);
          padding-top: 11px;
          padding-bottom: 11px;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .derma-input-group .form-control:focus {
          box-shadow: 0 0 0 3px rgba(15,169,138,0.15);
          border-color: ${ACCENT};
        }
        .derma-input-group:focus-within .input-group-text {
          border-color: ${ACCENT};
          background: #EBFAF6;
        }
        .derma-form-row {
          opacity: 0;
          animation: fadeUp 0.45s ease-out forwards;
        }
        .derma-select-wrap { animation-delay: 0.15s; }
        .derma-user-row { animation-delay: 0.25s; }
        .derma-pass-row { animation-delay: 0.35s; }
        .derma-links-row { animation-delay: 0.45s; }
        .derma-submit-row { animation-delay: 0.55s; }

        .derma-select {
          border-color: rgba(27,79,138,0.18) !important;
          padding-top: 11px;
          padding-bottom: 11px;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .derma-select:focus {
          box-shadow: 0 0 0 3px rgba(15,169,138,0.15) !important;
          border-color: ${ACCENT} !important;
        }
        .derma-submit-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
        }
        .derma-submit-btn:not(:disabled):hover {
          box-shadow: 0 8px 22px rgba(27,79,138,0.28) !important;
        }
        .derma-submit-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-120%) skewX(-15deg);
        }
        .derma-submit-btn:not(:disabled):hover::after {
          animation: shimmerSweep 0.9s ease;
        }
        .derma-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${ACCENT};
        }
        .derma-error-banner {
          animation: shakeErr 0.45s ease;
        }
        .derma-logo-img {
          animation: logoBreathe 4.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-shape-1, .bg-shape-2, .login-feature-badge, .derma-hero-fade,
          .derma-form-row, .glass-card, .derma-logo-img, .derma-submit-btn::after,
          .login-feature-badge:hover { animation: none !important; }
          .login-feature-badge, .derma-hero-fade, .derma-form-row { opacity: 1 !important; }
        }
      `}</style>

      {/* <ToastContainer /> */}
      <div
        className="d-flex flex-column min-vh-100 derma-bg"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Signature texture layer: faint clinical grid, masked to a soft vignette */}
        <div className="derma-grid-texture" style={{ zIndex: 0 }} />
        <div className="bg-shape-1" />
        <div className="bg-shape-2" />

        {/* All content sits above the background */}
        <div className="flex-grow-1 d-flex justify-content-center align-content-center align-items-center " style={{ position: 'relative', zIndex: 2 }}>
          <CContainer fluid className="p-0 h-100   align-content-center align-items-center">
            {/* Use h-100 on the row so it occupies the available height (minus footer) */}
            <CRow className="g-0 h-100">
              {/* LEFT: Brand / Hero */}
              <CCol
                md={6}
                className="d-none d-md-flex flex-column justify-content-center derma-hero px-5 py-4"
              >
                <div />
                <div className="text-center px-3" style={{ color: COLORS.primary }}>
                  <img
                    src={DermaLogo}
                    alt="Derma Care"
                    className="mb-4 derma-hero-fade d1 derma-logo-img"
                    style={{ width: 112, height: 'auto' }}
                  />
                  <span className="derma-eyebrow derma-hero-fade d1">Clinic Management System</span>
                  <h2 className="derma-display fw-600 mt-2 mb-3 derma-hero-fade d2" style={{ color: COLORS.primary, fontSize: '2.4rem' }}>
                    Welcome to CCMS
                  </h2>

                  {/* Signature element: a heartbeat monitor line that draws in, then a
                      glowing pulse travels along it — the vital sign of the system */}
                  <svg
                    width="280"
                    height="46"
                    viewBox="0 0 280 46"
                    className="derma-hero-fade d3"
                    style={{ margin: '0 auto 22px', display: 'block' }}
                    aria-hidden="true"
                  >
                    <polyline
                      points="0,23 70,23 88,23 100,6 114,40 128,14 140,30 154,23 172,23 280,23"
                      fill="none"
                      stroke={ACCENT}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="340"
                      style={{ animation: 'drawLine 1.4s ease-out 0.5s both' }}
                    />
                    <circle r="3.6" fill={ACCENT} style={{ animation: 'glowDot 1.6s ease-in-out 2s infinite' }}>
                      <animateMotion
                        dur="3.4s"
                        begin="2s"
                        repeatCount="indefinite"
                        path="M0,23 70,23 88,23 100,6 114,40 128,14 140,30 154,23 172,23 280,23"
                      />
                    </circle>
                  </svg>

                  <p className="mb-4 derma-hero-fade d4" style={{ opacity: 0.85, color: COLORS.primary, fontSize: '15px' }}>
                    Chiselon Clinic Management System
                  </p>

                  <div className="d-flex flex-column gap-2 mt-2" style={{ maxWidth: 320, margin: '0 auto' }}>
                    <div className="login-feature-badge">
                      <span className="badge-emoji" style={{ fontSize: 18 }}>🏥</span> Clinic &amp; Branch Management
                    </div>
                    <div className="login-feature-badge">
                      <span className="badge-emoji" style={{ fontSize: 18 }}>📊</span> Advanced Analytics Dashboard
                    </div>
                    <div className="login-feature-badge">
                      <span className="badge-emoji" style={{ fontSize: 18 }}>🔒</span> Role-Based Secure Access
                    </div>
                    {/* <div className="login-feature-badge">
                      <span style={{ fontSize: 18 }}>🤖</span> AI-Powered Insights
                    </div> */}
                  </div>
                </div>
              </CCol>

              {/* RIGHT: Card + Tabs + Form */}
              <CCol md={6} className="d-flex align-items-center justify-content-center  md-5">
                <CCard className="shadow-lg border-0 glass-card w-100" style={{ maxWidth: 440 }}>
                  <CCardBody className="p-4 p-md-5">
                    <h3 className="derma-display text-center fw-600 mb-2" style={{ color: COLORS.primary, fontSize: '1.7rem' }}>
                      CCMS Portal
                    </h3>
                    <p className="text-center mb-4" style={{ color: COLORS.primary, opacity: 0.75, fontSize: '14px' }}>
                      Please choose your workspace to continue
                    </p>


                    {/* Error message */}
                    {errorMessage && (
                      <div
                        className="text-center py-2 mb-3 derma-error-banner"
                        style={{
                          background: 'rgba(220,53,69,0.08)',
                          border: '1px solid rgba(220,53,69,0.25)',
                          color: '#b02a37',
                          borderRadius: 10,
                          fontSize: 13.5,
                          fontWeight: 500,
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}
                    {/* <h6 className='text-center'>{role === "admin" ? "Admin Login" : "Receptionist Login"}</h6> */}
                    {/* CLINIC TAB */}
                    {['clinic', 'administrator', 'receptionist'].includes(activeTab) && (
                      <CForm onSubmit={handleClinicLogin} noValidate>
                        <div className="derma-form-row derma-select-wrap">
                          <label className="mb-1" style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, opacity: 0.7 }}>
                            Workspace
                          </label>
                          <CFormSelect
                            value={activeTab}
                            onChange={(e) => {
                              const value = e.target.value
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
                            }}
                            className="derma-select mb-3" style={{ color: COLORS.primary }}
                          >
                            <option value="clinic">Super Admin</option>
                            <option value="administrator">Clinic Admin</option>
                            <option value="receptionist">Receptionist</option>
                          </CFormSelect>
                        </div>

                        <div className="derma-form-row derma-user-row">
                          <CInputGroup className="derma-input-group mb-2">
                            <CInputGroupText>
                              <CIcon icon={cilUser} style={{ color: COLORS.primary }} />
                            </CInputGroupText>

                            <CFormInput
                              placeholder="Username"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value.trim())}
                            />
                          </CInputGroup>
                        </div>

                        <div className="derma-form-row derma-pass-row">
                          <CInputGroup className="derma-input-group mt-3 mb-2">
                            <CInputGroupText
                              onClick={() => setShowPassword((s) => !s)}
                              style={{ cursor: "pointer" }}
                            >
                              <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} style={{ color: COLORS.primary }} />
                            </CInputGroupText>

                            <CFormInput
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value.trim())}
                            />
                          </CInputGroup>
                        </div>

                        <div
                          className="d-flex justify-content-between mt-2 derma-form-row derma-links-row"
                          style={{ color: COLORS.primary }}
                        >
                          <a
                            style={{ color: COLORS.primary, opacity: 0.85 }}
                            href="#"
                            className="text-decoration-none derma-link"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowForgotModal(true)
                            }}
                          >
                            Forgot password?
                          </a>
                          <a
                            style={{ color: COLORS.primary, opacity: 0.85 }}
                            href="#"
                            className="text-decoration-none derma-link"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowResetModal(true)
                            }}
                          >
                            Reset password?
                          </a>
                        </div>

                        <div className="derma-form-row derma-submit-row">
                          <CButton
                            type="submit"
                            disabled={isLoading}
                            className="derma-submit-btn w-100 mt-4 border-0"
                            style={{
                              background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2468b8 100%)`,
                              color: "white",
                              padding: '12px',
                              fontWeight: 600,
                              fontSize: 15,
                              borderRadius: '12px',
                              boxShadow: '0 4px 14px rgba(27,79,138,0.25)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(0)' }}
                          >
                            {isLoading ? <CSpinner size="sm" style={{ color: "white" }} /> : "Login"}
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


        {/* Sticky Footer */}
        <footer
          className="d-flex justify-content-around small py-2 opacity-75 mt-auto"
          style={{ color: COLORS.primary, backgroundColor: 'rgba(248,249,250,0.9)', position: 'relative', zIndex: 2, fontSize: 12.5, animation: 'fadeIn 0.8s ease-out 0.6s both' }}
        >
          <span
            className="d-inline-flex align-items-center gap-2"
            style={{ color: COLORS.primary }}
          >
            <CIcon icon={cilShieldAlt} /> Secure by design
          </span>
          <span style={{ color: COLORS.primary }}>
            © {new Date().getFullYear()} Chiselon Technologies
          </span>
          <a
            href="https://chiselontechnologies.com"
            target="_blank"
            style={{ color: COLORS.primary }}
            rel="noreferrer"
          >
            About Chiselon Technologies
          </a>
        </footer>

        {/* Reset Modal */}
        <CModal visible={showResetModal} onClose={() => setShowResetModal(false)} className='custom-modal' backdrop="static">
          <CModalHeader>
            <CModalTitle>Reset Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ResetPassword onClose={() => setShowResetModal(false)} />
          </CModalBody>
          {/* <CModalFooter>
            <CButton color="secondary" onClick={() => setShowResetModal(false)}>
              Close
            </CButton>
          </CModalFooter> */}
        </CModal>

        {/* Forgot Password Modal */}
        <CModal visible={showForgotModal} onClose={() => setShowForgotModal(false)} className='custom-modal' backdrop="static">
          <CModalHeader>
            <CModalTitle>Forgot Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ForgotPassword onClose={() => setShowForgotModal(false)} />
          </CModalBody>
          {/* <CModalFooter>
            <CButton color="secondary" onClick={() => setShowForgotModal(false)}>
              Close
            </CButton>
          </CModalFooter> */}
        </CModal>
      </div >
    </>
  )
}

export default Login