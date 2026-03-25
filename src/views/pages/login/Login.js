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
import { http, httpPublic } from '../../../Utils/Interceptors'
import DermaLogo from 'src/assets/images/DermaCare.png' // adjust path if needed
import { COLORS } from '../../../Constant/Themes'
import { toast, ToastContainer } from 'react-toastify'
import { showCustomToast } from '../../../Utils/Toaster'
import { getFCMToken } from '../../../firebase'

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
      // ✅ get FCM token first
      await Notification.requestPermission()
      const fcmToken = await getFCMToken()
      console.log(fcmToken)
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

        // if (token) localStorage.setItem('token', token)
        // localStorage.setItem('role', role)

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
          navigate('/dashboard') // immediately navigates to dashboard with context updated
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
      <ToastContainer />
      <div className="d-flex flex-column min-vh-100 derma-bg">
        {/* Main content - will grow and keep footer at bottom */}
        <div className="flex-grow-1 d-flex justify-content-center align-content-center align-items-center ">
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
                    className="mb-4"
                    style={{ width: 120, height: 'auto' }}
                  />
                  <h2 className="fw-bold mb-3" style={{ color: COLORS.primary }}>
                    Welcome to Derma Care
                  </h2>
                  <p className="lead mb-4" style={{ opacity: 0.95, color: COLORS.primary }}>
                    Manage dermatology operations seamlessly — appointments, records, billing &
                    more.
                  </p>

                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <span className="badge" style={{ color: COLORS.primary }}>
                      HIPAA-ready
                    </span>
                    <span className="badge" style={{ color: COLORS.primary }}>
                      e-Prescriptions
                    </span>
                    <span className="badge" style={{ color: COLORS.primary }}>
                      Smart Scheduling
                    </span>
                  </div>
                </div>
              </CCol>

              {/* RIGHT: Card + Tabs + Form */}
              <CCol md={6} className="d-flex align-items-center justify-content-center  md-5">
                <CCard className="shadow-lg border-0 glass-card w-100" style={{ maxWidth: 460 }}>
                  <CCardBody className="p-4 p-md-5">
                    <h3 className="text-center fw-bold mb-3" style={{ color: COLORS.primary }}>
                      Derma Portal
                    </h3>
                    <p className="text-center mb-4" style={{ color: COLORS.primary }}>
                      Please choose your workspace to continue
                    </p>

                    {/* Tabs */}
                    <CNav variant="pills" className="justify-content-center gap-2 mb-4">
                      <CNavItem>
                        <CNavLink
                          active={activeTab === 'clinic'}
                          onClick={() => setActiveTab('clinic')}
                          style={{
                            backgroundColor: activeTab === 'clinic' ? COLORS.primary : COLORS.white,
                            color: activeTab === 'clinic' ? COLORS.white : COLORS.primary,
                            border: `1px solid ${COLORS.primary}`,
                            borderRadius: '8px',
                            fontWeight: '500',
                            padding: '8px 16px',
                            cursor: 'pointer',
                          }}
                        >
                          Clinic
                        </CNavLink>
                      </CNavItem>

                      <CNavItem>
                        <CNavLink
                          active={activeTab === 'doctor'}
                          onClick={() =>
                            (window.location.href = 'https://doctorweb.aesthetech.life')
                          }
                          style={{
                            backgroundColor: activeTab === 'doctor' ? COLORS.primary : COLORS.white,
                            color: activeTab === 'doctor' ? COLORS.white : COLORS.primary,
                            border: `1px solid ${COLORS.primary}`,
                            borderRadius: '8px',
                            fontWeight: '500',
                            padding: '8px 16px',
                            cursor: 'pointer',
                          }}
                        >
                          Doctor
                        </CNavLink>
                      </CNavItem>
                    </CNav>

                    {/* Error message */}
                    {errorMessage && (
                      <div className="alert alert-danger text-center py-2 mb-3">{errorMessage}</div>
                    )}

                    {/* CLINIC TAB */}
                    {activeTab === 'clinic' && (
                      <CForm onSubmit={handleClinicLogin} noValidate>
                        {/* Role */}
                        <CFormSelect
                          className="mb-3"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="nurse">Nurse</option>
                          <option value="lab_technician">Lab Technician</option>
                          <option value="pharmacist">Pharmacist</option>
                          {/* <option value="wardBoy">Ward Boy / Attendant</option>
                        <option value="security">Security Staff</option> */}
                        </CFormSelect>

                        {/* Username */}
                        <CInputGroup className="mb-2">
                          <CInputGroupText>
                            <CIcon icon={cilUser} />
                          </CInputGroupText>
                          <CFormInput
                            placeholder="Username"
                            value={userName}
                            onChange={(e) => {
                              setUserName(e.target.value)
                              if (fieldErrors.userName)
                                setFieldErrors((p) => ({ ...p, userName: '' }))
                            }}
                            aria-invalid={!!fieldErrors.userName}
                            autoComplete="username"
                          />
                        </CInputGroup>
                        {fieldErrors.userName && (
                          <small className="text-danger">{fieldErrors.userName}</small>
                        )}

                        {/* Password */}
                        <CInputGroup className="mt-3 mb-2">
                          <CInputGroupText
                            onClick={() => setShowPassword((s) => !s)}
                            style={{ cursor: 'pointer' }}
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                          </CInputGroupText>
                          <CFormInput
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              if (fieldErrors.password)
                                setFieldErrors((p) => ({ ...p, password: '' }))
                            }}
                            aria-invalid={!!fieldErrors.password}
                            autoComplete="current-password"
                          />
                        </CInputGroup>
                        {fieldErrors.password && (
                          <small className="text-danger">{fieldErrors.password}</small>
                        )}

                        <div
                          className="d-flex justify-content-between mt-2"
                          style={{ color: COLORS.primary }}
                        >
                          <a
                            style={{ color: COLORS.primary }}
                            href="#"
                            className="text-decoration-none derma-link"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowResetModal(true)
                            }}
                          >
                            Forgot password?
                          </a>
                        </div>

                        <CButton
                          type="submit"
                          disabled={isLoading}
                          className="w-100 mt-4 derma-btn"
                          style={{ backgroundColor: COLORS.primary, color: 'white' }}
                        >
                          {isLoading ? <CSpinner size="sm" /> : 'Login'}
                        </CButton>
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
          style={{ color: COLORS.primary, backgroundColor: '#f8f9fa' }}
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
        <CModal visible={showResetModal} onClose={() => setShowResetModal(false)}>
          <CModalHeader>
            <CModalTitle>Reset Password</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <ResetPassword onClose={() => setShowResetModal(false)} />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowResetModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </div>
    </>
  )
}

export default Login
