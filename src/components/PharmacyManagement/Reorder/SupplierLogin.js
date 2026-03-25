import React, { useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CButton,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormLabel,
} from '@coreui/react'
import { supplierUsers } from '../../PharmacyManagement/Reorder/dummyProductData'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilLockUnlocked, cilUser } from '@coreui/icons'
import { setTimeout } from 'core-js'
import axios from 'axios'
import { wifiUrl } from '../../../baseUrl'
import { showCustomToast } from '../../../Utils/Toaster'

// eslint-disable-next-line react/prop-types
const SupplierLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const handleLogin = async () => {
    let newErrors = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    try {
      const response = await axios.post(
        `${wifiUrl}/api/pharmacy/supplier/supplierLogin`,
        {
          userName: username,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      console.log(response.data)
      const data = response.data
      if (data.status == 200) {
        // send supplierId or full response
        showCustomToast(
          data.message || `Login successful. Welcome back, ${data.data.supplierName}.`,
          'success',
        )
        onLogin(data.data)
      } else {
        setError(data.message || 'Invalid Credentials')
        setTimeout(() => setError(''), 2000)
      }
    } catch (error) {
      console.error(error)
      setError('Something went wrong')
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Layer */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage:
            "url('https://img.freepik.com/free-photo/pills-dark-environment_23-2151438412.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(6px)', // ✅ blur effect
          transform: 'scale(1.1)', // prevents blur edges
          zIndex: -1,
        }}
      />
      <div
        style={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={4}>
              <CCard
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                }}
                className="shadow-lg"
              >
                <CCardBody>
                  <h3 className="text-center mb-1 text-white">Supplier Portal</h3>

                  <p className="text-center mb-4 text-white">Login to manage pharmacy orders</p>

                  {error && <CAlert color="danger">{error}</CAlert>}

                  <CForm>
                    {/* Username */}
                    <CFormLabel>Username</CFormLabel>
                    <CInputGroup className="mb-2">
                      <CFormInput
                        placeholder="Enter Username"
                        value={username}
                        invalid={!!errors.username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          setErrors({ ...errors, username: '' })
                        }}
                      />
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                    </CInputGroup>

                    {errors.username && (
                      <div className="text-danger small mb-3">{errors.username}</div>
                    )}

                    {/* Password */}
                    <CFormLabel>Password</CFormLabel>
                    <CInputGroup className="mb-2">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        value={password}
                        invalid={!!errors.password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setErrors({ ...errors, password: '' })
                        }}
                      />

                      <CInputGroupText
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                      </CInputGroupText>
                    </CInputGroup>

                    {errors.password && (
                      <div className="text-danger small mb-3">{errors.password}</div>
                    )}

                    <CButton
                      className="w-100 mt-2"
                      style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                      onClick={handleLogin}
                    >
                      Login
                    </CButton>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </div>
  )
}

export default SupplierLogin
// <CContainer>
//     <CRow className="justify-content-center">
//       <CCol md={4}>
//         <CCard
//           style={{
//             background: 'rgba(255, 255, 255, 0.3)',
//             backdropFilter: 'blur(2px)',
//             WebkitBackdropFilter: 'blur(5px)',
//             borderRadius: '15px',
//             border: '1px solid rgba(255,255,255,0.3)',
//             color: '#fff',
//           }}
//           className="shadow-lg"
//         >
//           <CCardBody>
//             <h3 className="text-center mb-1 text-white">Supplier Portal</h3>

//             <p className="text-center mb-4 text-white">Login to manage pharmacy orders</p>

//             {error && <CAlert color="danger">{error}</CAlert>}

//             <CForm>
//               {/* Username */}
//               <CInputGroup className="mb-3">
//                 <CFormInput
//                   placeholder="Enter Username"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                 />
//                 <CInputGroupText>
//                   <CIcon icon={cilUser} />
//                 </CInputGroupText>
//               </CInputGroup>

//               {/* Password */}
//               <CInputGroup className="mb-3">
//                 <CFormInput
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Enter Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />

//                 <CInputGroupText
//                   style={{ cursor: 'pointer' }}
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
//                 </CInputGroupText>
//               </CInputGroup>

//               <CButton color="primary" className="w-100">
//                 Login
//               </CButton>
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   </CContainer>
