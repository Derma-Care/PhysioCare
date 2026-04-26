import React from 'react'
import { CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

/* ─── Shared button tokens (same as FollowupDashboard / DoctorDetailsPage) ── */
const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '7px 22px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  border: 'none',
  minWidth: '110px',
  transition: 'opacity 0.15s ease',
  lineHeight: '1.5',
}

const ConfirmationModal = ({
  isVisible,
  message,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'danger',   // 'danger' | 'primary' | 'success'
  cancelColor = 'secondary',
  isLoading = false,
}) => {
  /* Map confirmColor prop → actual hex */
  const confirmBg =
    confirmColor === 'danger'  ? '#dc2626' :
    confirmColor === 'success' ? '#16a34a' :
    'var(--color-bgcolor)'   // primary / default

  return (
    <CModal
      visible={isVisible}
      onClose={onCancel}
      alignment="center"
      backdrop="static"
    >
      {/* ── Header ── */}
      <CModalHeader
        style={{
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 20px',
          backgroundColor: '#ffffff',
        }}
        closeButton
      >
        <CModalTitle
          style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Coloured icon pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor:
                confirmColor === 'danger'  ? '#fee2e2' :
                confirmColor === 'success' ? '#dcfce7' :
                '#dbeafe',
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            {confirmColor === 'danger'  ? '⚠' :
             confirmColor === 'success' ? '✓'  : 'ℹ'}
          </span>
          {title}
        </CModalTitle>
      </CModalHeader>

      {/* ── Body ── */}
      <CModalBody
        style={{
          padding: '24px 24px 20px',
          backgroundColor: '#ffffff',
          textAlign: 'center',
        }}
      >
        {/* Decorative icon circle */}
       
        <p
          style={{
            fontSize: '14px',
            color: '#1e293b',
            fontWeight: '500',
            margin: 0,
            lineHeight: '1.6',
          }}
        >
          {message}
        </p>

        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '8px',
            marginBottom: 0,
          }}
        >
          This action cannot be undone.
        </p>
      </CModalBody>

      {/* ── Footer ── */}
      <CModalFooter
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '14px 20px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        {/* Cancel */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          style={{
            ...btnBase,
            backgroundColor: '#e2e8f0',
            color: '#475569',
            opacity: isLoading ? 0.55 : 1,
          }}
          onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.55' : '1' }}
        >
          {cancelText}
        </button>

        {/* Confirm */}
        <button
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            ...btnBase,
            backgroundColor: confirmBg,
            color: '#ffffff',
            opacity: isLoading ? 0.75 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.75' : '1' }}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                style={{ width: '13px', height: '13px', borderWidth: '2px' }}
              />
              Deleting...
            </>
          ) : (
            confirmText
          )}
        </button>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmationModal