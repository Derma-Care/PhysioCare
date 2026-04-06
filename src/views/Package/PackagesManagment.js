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
          <CButton onClick={() => setModal(true)}>Add Package</CButton>
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
          <CModalTitle>{editId ? "Edit" : "Add"} Package</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            <CRow>
              <CCol md={12}>
                <CFormLabel>Package Name *</CFormLabel>
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
                <CFormLabel>Programs *</CFormLabel>
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
                <CFormLabel>Offer Type *</CFormLabel>
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
                <CFormLabel>Discount *</CFormLabel>
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
                <CFormLabel>Start Date *</CFormLabel>
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
                <CFormLabel>End Date *</CFormLabel>
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

            <div className="text-end mt-3">
              <CButton onClick={handleSave}>
                {editId ? "Update" : "Save"}
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>
      <CModal visible={viewModal} onClose={() => setViewModal(false)}>
  <CModalHeader>
    <CModalTitle>Package Details</CModalTitle>
  </CModalHeader>

  <CModalBody>
    {selectedPackage && (
      <div className="d-flex flex-column gap-2">

        <div><strong>Package Name:</strong> {selectedPackage.packageName}</div>
<div>
  <strong>Programs:</strong>{" "}
  {selectedPackage.programs?.length
    ? selectedPackage.programs.map(p => p.programName).join(", ")
    : selectedPackage.programIds?.join(", ")}
</div>

        <div>
          <strong>No. of Programs:</strong> {selectedPackage.noOfPrograms}
        </div>

        <div>
          <strong>Discount:</strong> {selectedPackage.discountPercentage}%
        </div>

        <div>
          <strong>Offer Type:</strong>{" "}
          {selectedPackage.offerType}
        </div>

        <div>
          <strong>Start Date:</strong> {selectedPackage.startOfferDate}
        </div>

        <div>
          <strong>End Date:</strong> {selectedPackage.endOfferDate}
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