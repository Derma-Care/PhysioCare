import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const BackButton = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [hovered, setHovered] = useState(false)

  // Hide in main pages
  const hideRoutes = [
    '/',
    '/login',
    '/dashboard',
    '/therapist',
  ]

  if (hideRoutes.includes(location.pathname)) {
    return null
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard')
    }
  }

  // Better page names
  const routeNames = {
    '/appointments': 'Appointments',
    '/appointment-details': 'Appointment Details',
    '/patients': 'Patients',
    '/staff': 'Staff',
    '/sessions': 'Sessions',
    '/billing': 'Billing',
    '/reports': 'Reports',
  }

  // Get previous route name
  const previousPath = location.state?.from || '/dashboard'

  const previousScreenName =
    routeNames[previousPath] || 'Previous Page'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <button
        onClick={handleBack}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: 'none',
          background: 'transparent',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={22} />
      </button>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: '32px',
            background: '#1e293b',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          {previousScreenName}
        </div>
      )}
    </div>
  )
}

export default BackButton
