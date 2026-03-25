import React, { useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const PackageManagement = () => {
  const [packages, setPackages] = useState([
    { id: 1, name: 'Skin Care Basic', price: 2999, duration: '30 Days' },
    { id: 2, name: 'Hair Treatment Pro', price: 4999, duration: '45 Days' },
  ])
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setPackages((prev) => [...prev, { id: Date.now(), ...formData }])
    setFormData({ name: '', price: '', duration: '' })
    setShowModal(false)
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <strong>Package Management</strong>
        <CButton color="primary" onClick={() => setShowModal(true)}>
          Add Package
        </CButton>
        <CButton color="primary" onClick={() => navigate('/attendance')}>
          Attendance
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Package Name</CTableHeaderCell>
              <CTableHeaderCell>Price (₹)</CTableHeaderCell>
              <CTableHeaderCell>Duration</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {packages.map((pkg) => (
              <CTableRow key={pkg.id}>
                <CTableDataCell>{pkg.name}</CTableDataCell>
                <CTableDataCell>{pkg.price}</CTableDataCell>
                <CTableDataCell>{pkg.duration}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      {/* Add Package Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Package</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            <CFormInput
              label="Package Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="mb-3"
            />
            <CFormInput
              label="Duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
            />
          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSave}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default PackageManagement
