import React, { useState } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cilSettings, cilAccountLogout, cilHospital } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import '../header/AppHear.css'
import ConfirmModal from '../ConfirmLogoutModal'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { selectedHospital } = useHospital()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('HospitalId')
    localStorage.removeItem('HospitalName')
    localStorage.clear()
    navigate('/login')
  }

  const hospitalLogo = selectedHospital?.data?.hospitalLogo
  const hospitalName = selectedHospital?.data?.name || 'Hospital'

  const isValidLogo =
    hospitalLogo &&
    hospitalLogo !== 'null' &&
    hospitalLogo !== 'undefined' &&
    hospitalLogo.trim() !== ''

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle caret={false} className="py-0 pe-0">
          {isValidLogo ? (
            <img
              src={
                hospitalLogo.startsWith('data:')
                  ? hospitalLogo
                  : `data:image/jpeg;base64,${hospitalLogo}`
              }
              alt={hospitalName}
              width={40}
              height={40}
              style={{
                borderRadius: '50%',
                cursor: 'pointer',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CIcon icon={cilHospital} size="lg" />
            </div>
          )}
        </CDropdownToggle>

        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownItem>
            <CIcon icon={cilSettings} className="me-2" />
            Settings
          </CDropdownItem>

          <CDropdownItem onClick={() => setShowLogoutModal(true)}>
            <CIcon icon={cilAccountLogout} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
      <ConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false)
          handleLogout()
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout from the Clinic Portal?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        confirmColor="danger"
      />
    </>
  )
}

export default AppHeaderDropdown
