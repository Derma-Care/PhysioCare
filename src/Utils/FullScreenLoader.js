import React from 'react'
import { CSpinner } from '@coreui/react'
import { COLORS } from '../Constant/Themes'

/**
 * A full-screen overlay loading indicator.
 * @param {string} message - Optional message to display.
 */
const FullScreenLoader = ({ message = 'Processing...' }) => {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(2px)',
  }

  return (
    <div style={containerStyle}>
      <CSpinner color="primary" variant="grow" style={{ width: '3rem', height: '3rem' }} />
      {message && (
        <span
          style={{
            marginTop: '1rem',
            color: COLORS.primary,
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '0.5px',
          }}
        >
          {message}
        </span>
      )}
    </div>
  )
}

export default FullScreenLoader
