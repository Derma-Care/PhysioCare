import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'

const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',

  confirmColor = 'danger',
}) => {
  return (
    <CModal visible={visible} onClose={onClose} alignment="center">
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>

      <CModalBody>{message}</CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          {cancelText}
        </CButton>

        <CButton color={confirmColor} onClick={onConfirm} className='text-white'>
          {confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
export default ConfirmModal
