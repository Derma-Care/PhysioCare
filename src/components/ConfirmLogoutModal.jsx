import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'
import { COLORS } from '../Constant/Themes'

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
        <CModalTitle style={{ color: COLORS.primary }}>{title}</CModalTitle>
      </CModalHeader>

      <CModalBody style={{ color: COLORS.primary }}>{message}</CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          {cancelText}
        </CButton>

        <CButton color={confirmColor} onClick={onConfirm} className="text-white">
          {confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
export default ConfirmModal
