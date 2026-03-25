import React from 'react'
import { CSpinner } from '@coreui/react'

// eslint-disable-next-line react/prop-types
const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '50vh', // full screen height

        color: 'var(--color-black)',
      }}
    >
      <CSpinner size="sm" className="me-2" />
      <span>{message}</span>
    </div>
  )
}

export default LoadingIndicator
