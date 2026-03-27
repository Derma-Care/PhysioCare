/* eslint-disable react/jsx-key */
import React, { useState } from 'react'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CRow,
  CCol,
} from '@coreui/react'

import { Eye, Edit2, Trash2 } from 'lucide-react'
import TreatmentPackageForm from './TreatmentPackageForm'

const TreatmentPackages = () => {
  const [packages, setPackages] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
const [deleteId, setDeleteId] = useState(null)

  // SAVE
  const handleSave = (data) => {
    if (selectedPackage) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === selectedPackage.id ? { ...p, ...data } : p,
        ),
      )
    } else {
      setPackages((prev) => [
        ...prev,
        { ...data, id: Date.now().toString() },
      ])
    }

    setModalVisible(false)
    setSelectedPackage(null)
  }

  // DELETE
  const confirmDelete = () => {
  setPackages(packages.filter((p) => p.id !== deleteId))
  setDeleteModal(false)
  setDeleteId(null)
}

  // VIEW FIELD COMPONENT
  const Field = ({ label, value }) => (
    <div className="mb-2">
      <strong>{label}</strong>
      <div>{value || 'Not Provided'}</div>
    </div>
  )

  return (
    <>
      {/* ADD BUTTON */}
      <div className="d-flex justify-content-end mb-3">
        <CButton
        style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
          onClick={() => {

            setSelectedPackage(null)
            setViewMode(false)
            setModalVisible(true)
          }}
        >
           Add Package
        </CButton>
      </div>

      {/* TABLE */}
      <CTable bordered className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Sessions</CTableHeaderCell>
            <CTableHeaderCell>Price</CTableHeaderCell>
            <CTableHeaderCell>Validity</CTableHeaderCell>
            <CTableHeaderCell className="text-center">
              Actions
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {packages.map((pkg) => (
            <CTableRow key={pkg.id}>
              <CTableDataCell>{pkg.name}</CTableDataCell>
              <CTableDataCell>{pkg.sessions}</CTableDataCell>
              <CTableDataCell>₹{pkg.price}</CTableDataCell>
              <CTableDataCell>{pkg.validity} days</CTableDataCell>

              <CTableDataCell className="text-center">
                <div className="d-flex justify-content-center gap-2">

                  {/* VIEW */}
                  <button
                    className="actionBtn"
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setViewMode(true)
                      setModalVisible(true)
                    }}
                  >
                    <Eye size={18} />
                  </button>

                  {/* EDIT */}
                  <button
                    className="actionBtn"
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setViewMode(false)
                      setModalVisible(true)
                    }}
                  >
                    <Edit2 size={18} />
                  </button>

                  {/* DELETE */}
                  <button
                    className="actionBtn"
                   onClick={() => {
  setDeleteId(pkg.id)
  setDeleteModal(true)
}}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* MODAL */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" backdrop="static">
        <CModalHeader>
          {viewMode
            ? 'Package Details'
            : selectedPackage
            ? 'Edit Package'
            : 'Add Package'}
        </CModalHeader>

        <CModalBody>
          {viewMode ? (
            // ✅ VIEW MODE (NO INPUTS)
          <div>

  {/* ================= BASIC ================= */}
  <h6>Basic Information</h6>
  <CRow>
    <CCol md={6}>
      <Field label="Package Name" value={selectedPackage?.packageName} />
    </CCol>
  </CRow>

  <Field label="Description" value={selectedPackage?.description} />

  {/* ================= PRICING ================= */}
  <h6 className="mt-3">Pricing</h6>
  <CRow>
    <CCol md={3}>
      <Field label="Price" value={`₹${selectedPackage?.packagePrice}`} />
    </CCol>

    <CCol md={3}>
      <Field label="Discount" value={`${selectedPackage?.discount}%`} />
    </CCol>

    <CCol md={3}>
      <Field label="GST" value={`${selectedPackage?.gst}%`} />
    </CCol>

    <CCol md={3}>
      <Field label="Other Taxes" value={`${selectedPackage?.otherTaxes}%`} />
    </CCol>
  </CRow>

  {/* ================= PAYMENT ================= */}
  <h6 className="mt-3">Payment</h6>
  <Field label="Payment Type" value={selectedPackage?.paymentType} />

  {/* ================= OFFER ================= */}
  <h6 className="mt-3">Offer</h6>
  <CRow>
    <CCol md={6}>
      <Field label="Start Date" value={selectedPackage?.offerStartDate || 'N/A'} />
    </CCol>

    <CCol md={6}>
      <Field label="End Date" value={selectedPackage?.offerEndDate || 'N/A'} />
    </CCol>
  </CRow>

  {/* ================= THERAPIES ================= */}
  <h6 className="mt-3">Therapies</h6>

  {selectedPackage?.therapies?.length ? (
    selectedPackage.therapies.map((t, i) => (
      <div key={i} className="border p-2 mb-2 rounded">

        <CRow>
          <CCol md={3}>
            <Field label="Therapy Name" value={t.name} />
          </CCol>

          <CCol md={3}>
            <Field label="Sessions" value={t.sessions} />
          </CCol>

          <CCol md={3}>
            <Field label="Duration" value={`${t.sessionDuration} mins`} />
          </CCol>

          <CCol md={3}>
            <Field label="Validity" value={`${t.validity} days`} />
          </CCol>
        </CRow>

      </div>
    ))
  ) : (
    <p>No therapies added</p>
  )}

</div>
          ) : (
            // ✅ FORM MODE
            <TreatmentPackageForm
              data={selectedPackage}
              onSave={handleSave}
              viewMode={false}
            />
          )}
        </CModalBody>
      </CModal>
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
  <CModalHeader>Confirm Delete</CModalHeader>

  <CModalBody>
    <p>Are you sure you want to delete this package?</p>

    <div className="d-flex justify-content-end gap-2 mt-3">
      <CButton
        color="secondary"
        onClick={() => setDeleteModal(false)}
      >
        Cancel
      </CButton>

      <CButton color="danger" onClick={confirmDelete}>
        Yes, Delete
      </CButton>
    </div>
  </CModalBody>
</CModal>
    </>
  )
}

export default TreatmentPackages