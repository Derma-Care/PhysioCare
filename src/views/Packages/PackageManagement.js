/* eslint-disable react/jsx-key */
import React, { useState,useEffect } from 'react'
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
  CModalTitle,
} from '@coreui/react'

import { Eye, Edit2, Trash2 } from 'lucide-react'
import TreatmentPackageForm from '././TreatmentPackageForm'
import {
  getAllPackages,
  addPackage,
  updatePackage,
  deletePackage
} from './TreatmentPackageAPI'

const TreatmentPackages = () => {
  const [packages, setPackages] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
const [deleteId, setDeleteId] = useState(null)
const [therapyOptions, setTherapyOptions] = useState([])


const clinicId = localStorage.getItem('HospitalId')
const branchId = localStorage.getItem('branchId')

const fetchPackages = async () => {
  try {
    const res = await getAllPackages()
    console.log(res.data.data)

    const packages = res.data.data || []

    const therapies = packages.flatMap(pkg => pkg.therapies || [])

    const uniqueTherapies = [
      ...new Map(therapies.map(t => [t.name, t])).values()
    ]

    setTherapyOptions(uniqueTherapies)
    setPackages(packages)
  } catch (err) {
    console.error(err)
  }
}


useEffect(() => {
  fetchPackages()
}, [])

  // SAVE
 const handleSave = async (data) => {
  try {
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')

    const payload = {
      ...data,
      clinicId,
      branchId,
    }

    if (selectedPackage?.id) {
      // ✅ UPDATE
      await updatePackage(selectedPackage.id, payload)
    } else {
      // ✅ ADD
      await addPackage(payload)
    }

    await fetchPackages()

    setModalVisible(false)
    setSelectedPackage(null)
  } catch (err) {
    console.error('Save failed:', err)
  }
}
  // DELETE
 const confirmDelete = async () => {
  try {
    await deletePackage(deleteId)

    setDeleteModal(false)
    setDeleteId(null)

    fetchPackages()
  } catch (err) {
    console.error(err)
  }
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
           Add Program
        </CButton>
      </div>

      {/* TABLE */}
      <CTable bordered className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Program Price</CTableHeaderCell>
            <CTableHeaderCell>Discount %</CTableHeaderCell>
            <CTableHeaderCell>Discounted Price</CTableHeaderCell>
            <CTableHeaderCell>Final Price <br/> <small>(including Tax)</small></CTableHeaderCell>
            <CTableHeaderCell className="text-center">
              Actions
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {packages.map((pkg,index) => (
            <CTableRow key={pkg.id}>
              <CTableDataCell>{index+1}</CTableDataCell>
              <CTableDataCell>{pkg.packageName}</CTableDataCell>
              <CTableDataCell>₹ {pkg.packagePrice}</CTableDataCell>
              <CTableDataCell>₹ {pkg.discount || 'N/A'}</CTableDataCell>
             <CTableDataCell>
  ₹ {Number(pkg.afterDiscountPrice || 0).toFixed(2)}
</CTableDataCell>

<CTableDataCell>
  ₹ {Number(pkg.finalPrice || 0).toFixed(2)}
</CTableDataCell>

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
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" backdrop="static" className='custom-modal'>
        {/* <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit Receptionist'}</CModalTitle> */}
       
       <CModalHeader>
  <CModalTitle
    style={{
      fontSize: "22px",
      fontWeight: "700", // bold
      color: "var(--color-black)",
   
    }}
  >
    {viewMode
      ? "Program Details"
      : selectedPackage
      ? "Edit Program"
      : "Add Program"}
  </CModalTitle>
</CModalHeader>

        <CModalBody>
          {viewMode ? (
    <div className="p-3">

  {/* ================= BASIC ================= */}
  <div className="mb-4">
    <h6 className="fw-bold mb-3" >
      Basic Information
    </h6>

    <CRow className="mb-2">
      <CCol md={6}>
        <Field label="Program Name" value={selectedPackage?.packageName} />
      </CCol>
    </CRow>

    <Field label="Description" value={selectedPackage?.description} />
  </div>

  {/* ================= PRICING ================= */}
  <div className="mb-4">
    <h6 className="fw-bold mb-3" >
      Pricing Details
    </h6>

    <CRow className="g-3">
      <CCol md={3}>
        <Field label="Price" value={`₹ ${selectedPackage?.packagePrice}`} />
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
  </div>

  {/* ================= PAYMENT ================= */}
  <div className="mb-4">
    <h6 className="fw-bold mb-3" >
      Payment Details
    </h6>

    <Field label="Payment Type" value={selectedPackage?.paymentType} />
  </div>

  {/* ================= OFFER ================= */}
  <div className="mb-4">
    <h6 className="fw-bold mb-3" >
      Offer Period
    </h6>

    <CRow className="g-3">
      <CCol md={6}>
        <Field label="Start Date" value={selectedPackage?.offerStartDate || 'N/A'} />
      </CCol>

      <CCol md={6}>
        <Field label="End Date" value={selectedPackage?.offerEndDate || 'N/A'} />
      </CCol>
    </CRow>
  </div>

  {/* ================= THERAPIES ================= */}
  <div className="mb-3">
    <h6 className="fw-bold mb-3">
      Therapies Included
    </h6>

    {selectedPackage?.therapies?.length ? (
      selectedPackage.therapies.map((t, i) => (
        <div
          key={i}
          className="border rounded p-3 mb-3"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <CRow className="g-3">
            <CCol md={3}>
              <Field label="Therapy" value={t.name} />
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
      <p className="text-muted">No therapies added</p>
    )}
  </div>

</div>
          ) : (
            // ✅ FORM MODE
            <TreatmentPackageForm
              data={selectedPackage}
              onSave={handleSave}
              viewMode={false}
              therapyOptions={therapyOptions} 
              onCancel={false}
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