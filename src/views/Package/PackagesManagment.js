import React, { useEffect, useState } from "react"
import {
  CButton,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CFormText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormLabel,
} from "@coreui/react"
import Select from "react-select"
import ConfirmationModal from "../../components/ConfirmationModal"
import { useHospital } from "../Usecontext/HospitalContext"
import { Edit2, Eye, Trash2 } from "lucide-react"
import {
  addTherapy,
  deleteTherapy,
  getTherapiesService,
  getTherapiesServicebytherapyId,
  updateTherapy,
} from "./PackagesAPI"
import { getProgramService } from "../ProcedureManagement/ProgramApi"

export default function PackagesManagement() {
  const [list, setList] = useState([])
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [viewModal, setViewModal] = useState(false)
const [selectedPackage, setSelectedPackage] = useState(null)

  const [form, setForm] = useState({
  packageName: "",
  programIds: [],
  programs: [],
  offerType: "",
  startOfferDate: "",
  endOfferDate: "",
  discountPercentage: "",
})

  const [errors, setErrors] = useState({})

  const { user } = useHospital()
  const can = (feature, action) =>
    user?.permissions?.[feature]?.includes(action)

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchPrograms()
     fetchData()
  }, [])
 const handleView = async (item) => {
  try {
    const clinicId = localStorage.getItem("HospitalId")
    const branchId = localStorage.getItem("branchId")

    const packageId = item.packageId // ✅ FIX

    console.log("Package ID:", packageId)

    const res = await getTherapiesServicebytherapyId(
      packageId,   // ✅ pass correct id
      clinicId,
      branchId
    )

    setSelectedPackage(res?.data?.data)
    setViewModal(true)

  } catch (err) {
    console.log("VIEW ERROR:", err.response?.data)
  }
}

  

 const fetchPrograms = async () => {
  try {
    const hospitalId = localStorage.getItem("HospitalId")
    const branchId = localStorage.getItem("branchId")

    const res = await getProgramService(hospitalId, branchId)

    console.log("Programs:", res?.data?.data)

    const options = (res?.data?.data || []).map((item) => ({
      value: item.id,          // ✅ program id
      label: item.programName, // ✅ program name
    }))

    setExerciseOptions(options)
  } catch (error) {
    console.error("Error fetching programs:", error)
  }
}
const fetchData = async () => {
  try {
    const clinicId = localStorage.getItem("HospitalId")
    const branchId = localStorage.getItem("branchId")

    console.log("Fetching with:", clinicId, branchId)

    const res = await getTherapiesService(clinicId, branchId)

    console.log("API Response:", res.data)

    setList(res?.data?.data || [])
  } catch (err) {
    console.log("GET ERROR:", err.response?.data)
  }
}

  // ---------------- VALIDATION ----------------
 const validate = () => {
  let err = {}

  if (!form.packageName.trim()) err.packageName = "Required"

  if (form.programIds.length === 0)
    err.programIds = "Select at least one"

  if (!form.offerType) err.offerType = "Required"

  if (form.discountPercentage === "") {
    err.discountPercentage = "Required"
  } else if (Number(form.discountPercentage) < 0) {
    err.discountPercentage = "Cannot be negative"
  }

  if (!form.startOfferDate) err.startOfferDate = "Required"
  if (!form.endOfferDate) err.endOfferDate = "Required"

  if (
    form.startOfferDate &&
    form.endOfferDate &&
    new Date(form.endOfferDate) < new Date(form.startOfferDate)
  ) {
    err.endOfferDate = "End date must be after start date"
  }

  setErrors(err)
  return Object.keys(err).length === 0
}


  // ---------------- SAVE ----------------
 const handleSave = async () => {

  const payload = {
    clinicId: localStorage.getItem("HospitalId"),
    branchId: localStorage.getItem("branchId"),
    packageName: form.packageName,
    programIds: form.programIds,
    offerType: form.offerType,
    startOfferDate: form.startOfferDate,
    endOfferDate: form.endOfferDate,
    discountPercentage: Number(form.discountPercentage), // ✅ FIX
  }

  try {
    console.log("FINAL PAYLOAD:", payload) // ✅ log BEFORE API

    if (editId) {
      await updateTherapy(editId, payload)
    } else {
      await addTherapy(payload)
    }

    console.log("SUCCESS ✅")

    resetForm()
    fetchData()

  } catch (err) {
    console.log("ERROR RESPONSE ❌:", err.response?.data)
  }
}

  // ---------------- EDIT ----------------
const handleEdit = (item) => {
  setEditId(item.packageId) // ✅ FIX

  const selectedPrograms = (item.programIds || [])
    .map((id) => exerciseOptions.find((opt) => opt.value === id))
    .filter(Boolean)

  setForm({
    packageName: item.packageName || "",
    programs: selectedPrograms,
    programIds: item.programIds || [],
    offerType: item.offerType || "",
    startOfferDate: item.startOfferDate || "",
    endOfferDate: item.endOfferDate || "",
    discountPercentage: item.discountPercentage || "",
  })

  setModal(true)
}

  // ---------------- DELETE ----------------
  const handleServiceDelete = (id) => {
    setServiceIdToDelete(id)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTherapy(serviceIdToDelete, localStorage.getItem("HospitalId"))
      fetchData()
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  // ---------------- RESET ----------------
  const resetForm = () => {
  setForm({
    packageName: "",
    programIds: [],
    programs: [],
    offerType: "",
    startOfferDate: "",
    endOfferDate: "",
    discountPercentage: "",
  })
  setEditId(null)
  setModal(false)
  setErrors({})
}

  return (
    <>
      {/* Add Button */}
      <div className="d-flex justify-content-end mb-3">
        {can("Therapy Management", "create") && (
         <CButton
  onClick={() => setModal(true)}
  style={{
    backgroundColor: 'var(--color-black)',
    color: 'white'
  }}
>
  + Add Package
</CButton>
        )}
      </div>

      {/* TABLE */}
      <CTable className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Package Name</CTableHeaderCell>
            <CTableHeaderCell>Program Names</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {list.map((item, index) => (
            <CTableRow key={item.id}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{item.packageName}</CTableDataCell>
              <CTableDataCell>
  {item.programs?.map(p => p.programName).join(", ")}
</CTableDataCell>

 <CTableDataCell className="d-flex gap-2">
  {/* VIEW */}
  <CButton
    size="sm"
    className="actionBtn"
    style={{
      backgroundColor: 'var(--color-bgcolor)',
      color: 'var(--color-black)'
    }}
    onClick={() => handleView(item)}
  >
    <Eye size={18} />
  </CButton>

  {/* EDIT */}
  <CButton
    size="sm"
    className="actionBtn"
    style={{
      backgroundColor: 'var(--color-bgcolor)',
      color: 'var(--color-black)'
    }}
    onClick={() => handleEdit(item)}
  >
    <Edit2 size={18} />
  </CButton>

  {/* DELETE */}
  <CButton
    size="sm"
    className="actionBtn"
    style={{
      backgroundColor: 'var(--color-bgcolor)',
      color: 'var(--color-black)'
    }}
    onClick={() => {
      setServiceIdToDelete(item.packageId)
      setIsModalVisible(true)
    }}
  >
    <Trash2 size={18} />
  </CButton>
</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* MODAL */}
      <CModal visible={modal} onClose={resetForm} className="custom-modal"  backdrop="static" alignment="center">
        <CModalHeader>
          <CModalTitle  style={{
    color: 'var(--color-black)',
  }}>{editId ? "Edit" : "Add"} Package</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Package Name <span className="text-danger">*</span></CFormLabel>
                <CFormInput
                  value={form.packageName}
                  onChange={(e) =>
                    setForm({ ...form, packageName: e.target.value })
                  }
                />
                <CFormText className="text-danger">
                  {errors.packageName}
                </CFormText>
              </CCol>

              <CCol md={12} className="mt-3">
                <CFormLabel>Programs <span className="text-danger">*</span></CFormLabel>
               <Select
  options={exerciseOptions}
  isMulti
  value={form.programs}
  onChange={(val) =>
    setForm({
      ...form,
      programs: val,
      programIds: val.map((v) => v.value),
    })
  }
/>
                <CFormText className="text-danger">
                  {errors.programIds}
                </CFormText>
              </CCol>

              <CCol md={6} className="mt-3">
                <CFormLabel>Offer Type <span className="text-danger">*</span></CFormLabel>
               <CFormInput
  value={form.offerType}
  onChange={(e) =>
  setForm({
    ...form,
    offerType: e.target.value.toUpperCase(), // ✅ force uppercase
  })
}
/>
              </CCol>

              <CCol md={6} className="mt-3">
                <CFormLabel>Discount  <span className="text-danger">*</span></CFormLabel>
               <CFormInput
  type="number"
  value={form.discountPercentage}
  onChange={(e) =>
    setForm({
      ...form,
      discountPercentage: Math.max(0, e.target.value),
    })
  }
/>
              </CCol>

              <CCol md={6} className="mt-3">
                <CFormLabel>Start Date <span className="text-danger">*</span></CFormLabel>
              <CFormInput
  type="date"
  value={form.startOfferDate}
  onChange={(e) =>
    setForm({
      ...form,
      startOfferDate: e.target.value,
    })
  }
/>
              </CCol>

              <CCol md={6} className="mt-3">
                <CFormLabel>End Date <span className="text-danger">*</span></CFormLabel>
               <CFormInput
  type="date"
  value={form.endOfferDate}
  onChange={(e) =>
    setForm({
      ...form,
      endOfferDate: e.target.value,
    })
  }
/>
              </CCol>
            </CRow>

           <div className="d-flex justify-content-end gap-2 mt-3">
  
  {/* Cancel */}
 <CButton
  onClick={resetForm}
 color="secondary"
>
  Cancel
</CButton>

  {/* Save / Update */}
  <CButton
    onClick={handleSave}
    style={{
      backgroundColor: 'var(--color-bgcolor)',
      color: 'var(--color-black)',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 14px'
    }}
  >
    {editId ? "Update" : "Save"}
  </CButton>

</div>
          </CForm>
        </CModalBody>
      </CModal>
  <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg">
  <CModalHeader
    style={{
      color: 'var(--color-black)',
      borderBottom: '1px solid var(--color-border)',
    }}
  >
    <CModalTitle style={{ fontWeight: '600' }}>Package Details</CModalTitle>
  </CModalHeader>

 <CModalBody style={{ backgroundColor: 'var(--color-bg-light)' }}>
    {selectedPackage && (
      <div className="d-flex flex-column gap-3">

        {/* PACKAGE INFO */}
     <div className="accordion" id="packageAccordion">

  <div
    className="accordion-item"
    style={{
      border: '1px solid var(--color-border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}
  >

    {/* HEADER */}
    <h2 className="accordion-header">
      <button
        className="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#packageDetails"
         style={{
    backgroundColor: 'var(--color-bgcolor)',
    color: 'var(--color-black)',
    fontWeight: '600',
    border: 'none',
  }}
      >
        {selectedPackage.packageName}
      </button>
    </h2>

    {/* BODY */}
    <div
      id="packageDetails"
      className="accordion-collapse collapse"
      data-bs-parent="#packageAccordion"
      
    >
      <div
        className="accordion-body"
        style={{
          padding: '12px 16px',
          fontSize: '14px',
          lineHeight: '1.9',
        }}
      >

        <div style={{ minWidth: '130px' }}>
          <span style={{ minWidth: '130px' }}>Programs:</span>
          <span>{selectedPackage.noOfPrograms}</span>
        </div>

        <div style={{ minWidth: '130px' }}>
          <span style={{ minWidth: '130px'}}>
            Discount:
          </span>
          <span >
            {selectedPackage.discountPercentage}%
          </span>
        </div>

        <div style={{ minWidth: '130px' }}>
          <span style={{ minWidth: '130px' }}>
            Offer Type:
          </span>
          <span>
            {selectedPackage.offerType}
          </span>
        </div>

        <div >
          <span style={{ minWidth: '130px' }}>Start Date:</span>
          <span>{selectedPackage.startOfferDate}</span>
        </div>

        <div>
          <span style={{ minWidth: '130px' }}>End Date:</span>
          <span>{selectedPackage.endOfferDate}</span>
        </div>

      </div>
    </div>

  </div>
</div>

        {/* PROGRAM ACCORDION */}
        <div className="accordion" id="programAccordion">

          {Array.isArray(selectedPackage.programs) &&
            selectedPackage.programs.map((program, pIndex) => (
              <div className="accordion-item" key={pIndex}>

                {/* PROGRAM HEADER */}
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#program-${pIndex}`}
                     style={{
    backgroundColor: 'var(--color-bgcolor)',
    color: 'var(--color-black)',
    fontWeight: '600',
    border: 'none',
  }}
                  >
                    {pIndex + 1}. {program.programName}
                  </button>
                </h2>

                {/* PROGRAM BODY */}
                <div
                  id={`program-${pIndex}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#programAccordion"
                >
                  <div className="accordion-body">

                    {/* THERAPY ACCORDION */}
                    <div className="accordion" id={`therapyAccordion-${pIndex}`}>

                      {Array.isArray(program.therophyData) &&
                        program.therophyData.map((therapy, tIndex) => (
                          <div className="accordion-item" key={tIndex}>

                            {/* THERAPY HEADER */}
                            <h2 className="accordion-header">
                              <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#therapy-${pIndex}-${tIndex}`}
                                style={{
  backgroundColor: 'var(--color-bg-light)',
  color: 'var(--color-black)',
}}
                              >
                                {tIndex + 1}. {therapy.therapyName}
                              </button>
                            </h2>

                            {/* THERAPY BODY */}
                            <div
                              id={`therapy-${pIndex}-${tIndex}`}
                              className="accordion-collapse collapse"
                              data-bs-parent={`#therapyAccordion-${pIndex}`}
                            >
                              <div className="accordion-body">

                                {/* EXERCISES TABLE */}
                                {Array.isArray(therapy.exercises) &&
                                therapy.exercises.length > 0 ? (
                                  <CTable bordered responsive size="sm">
                                    <CTableHead>
                                      <CTableRow>
                                        <CTableHeaderCell>#</CTableHeaderCell>
                                        <CTableHeaderCell>Name</CTableHeaderCell>
                                        <CTableHeaderCell>Session</CTableHeaderCell>
                                        <CTableHeaderCell>Frequency</CTableHeaderCell>
                                        <CTableHeaderCell>Sets</CTableHeaderCell>
                                        <CTableHeaderCell>Reps</CTableHeaderCell>
                                        <CTableHeaderCell>Price</CTableHeaderCell>
                                      </CTableRow>
                                    </CTableHead>

                                    <CTableBody>
                                      {therapy.exercises.map((ex, i) => (
                                        <CTableRow key={i}>
                                          <CTableDataCell>{i + 1}</CTableDataCell>

                                          <CTableDataCell>
                                            <strong>{ex.name}</strong>
                                            <br />
                                            <small className="text-muted">
                                              {ex.notes}
                                            </small>
                                          </CTableDataCell>

                                          <CTableDataCell>{ex.session || '-'}</CTableDataCell>
                                          <CTableDataCell>{ex.frequency || '-'}</CTableDataCell>
                                          <CTableDataCell>{ex.sets || '-'}</CTableDataCell>
                                          <CTableDataCell>{ex.repetitions || '-'}</CTableDataCell>

                                          <CTableDataCell>
                                            ₹{ex.totalPrice || 0}
                                          </CTableDataCell>
                                        </CTableRow>
                                      ))}
                                    </CTableBody>
                                  </CTable>
                                ) : (
                                  <div className="text-center text-muted">
                                    No Exercises Available
                                  </div>
                                )}

                              </div>
                            </div>

                          </div>
                        ))}

                    </div>

                  </div>
                </div>

              </div>
            ))}

        </div>

      </div>
    )}
  </CModalBody>
</CModal>

      {/* DELETE MODAL */}
    <ConfirmationModal
  isVisible={isModalVisible}
  message="Are you sure you want to delete this package?"
  onConfirm={handleConfirmDelete}
  onCancel={() => setIsModalVisible(false)}
/>
    </>
  )
}