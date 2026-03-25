import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CRow,
  CTooltip,
  CForm,
  CFormInput,
  CFormSelect,
  CFormCheck,
} from '@coreui/react'
import { DocsExample } from 'src/components'
const VerticallyCentered = () => {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <CButton color="primary" onClick={() => setVisible(!visible)}>
        EDIT
      </CButton>
      <CModal
        size="lg"
        alignment="center"
        scrollable
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Modal title</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormInput type="email" id="inputEmail4" label="FullName" />
            </CCol>
            <CCol md={6}>
              <CFormInput type="password" id="inputPassword4" label="Mobile Number" />
            </CCol>
            <CCol md={6}>
              <CFormInput type="password" id="inputPassword4" label="Email" />
            </CCol>
            <CCol xs={6}>
              <CFormInput id="inputAddress" label="Gender"  />
            </CCol>
            <CCol xs={6}>
              <CFormInput id="inputAddress" label="Age"  />
            </CCol>
            
           
            <CCol md={6}>
              <CFormInput id="inputCity" label="Blood Group" />
            </CCol>
            <CCol md={6}>
              <CFormSelect id="inputState" label="Status">
                <option>Choose...</option>
                <option>...</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormInput id="inputZip" label="Zip" />
            </CCol>
            
          
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary">Update</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
export default VerticallyCentered
