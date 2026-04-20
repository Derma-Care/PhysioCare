import React, { useEffect, useState } from "react"
import {
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
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



import {
  serviceData,
  CategoryData,
  postServiceData,
  updateServiceData,
  deleteServiceData,
  subServiceData,
  GetSubServices_ByClinicId,
} from './ProcedureManagementAPI'

import ConfirmationModal from '../../components/ConfirmationModal'
import { useHospital } from "../Usecontext/HospitalContext"
import { Edit2, Eye, Loader, Trash2 } from "lucide-react"
import { addTherapy, deleteTherapy, getExercises, getTherapiesService, getTherapiesServicebytherapyId, updateTherapy } from "./TherapyServiceApi"
import LoadingIndicator from "../../Utils/loader"
import { showCustomToast } from "../../Utils/Toaster"
import { useGlobalSearch } from "../Usecontext/GlobalSearchContext"

export default function TherapyManagement() {
  const [list, setList] = useState([])
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [viewModal, setViewModal] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewData, setViewData] = useState([])
  const [saveLoading, setSaveLoading] = useState(false)
  const [form, setForm] = useState({
    therapyName: "",
    exercisesIds: [],
    exercises: [],
    // consentType: "",
  })
  const { searchQuery } = useGlobalSearch()
  const [errors, setErrors] = useState({})
  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")
  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchData()
    fetchExercises()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getTherapiesService(localStorage.getItem("HospitalId"), localStorage.getItem("branchId"))
      console.log("Therapies", res.data)
      setList(res?.data?.data || [])

    } catch (error) {
      console.log("fetchData error", error)

    } finally {
      setLoading(false)
    }

  }

  // const fetchexecersiceData = async (id) => {
  //   try {
  //     setLoading(true)
  //     const res = await getTherapiesServicebytherapyId(id, clinicId, branchId)
  //     console.log("getTherapiesServicebytherapyId", res.data)
  //     setList(res?.data?.data || [])

  //   } catch (error) {
  //     console.log("fetchData error", error)

  //   } finally {
  //     setLoading(false)
  //   }

  // }
  const [viewTherapy, setViewTherapy] = useState(null)

  const handleView = async (id) => {
    try {
      setViewModal(true)
      setViewLoading(true)

      const res = await getTherapiesServicebytherapyId(id, clinicId, branchId)

      const data = res?.data?.data
      setViewTherapy(data)

    } catch (err) {
      console.log("view error", err)
    } finally {
      setViewLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)

  }
  if (loading) {
    return (
      <LoadingIndicator />
    )
  }

  const fetchExercises = async () => {

    const res = await getExercises(clinicId, branchId)
    console.log("Exercises", res.data.data)
    // convert to react-select format
    const data = res.data.data || []
    const options = data.map((item) => ({
      value: item.therapyExercisesId,
      label: item.name,
    }))

    setExerciseOptions(options)
  }

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let err = {}

    if (!form.therapyName) err.therapyName = "Required"
    if (form.exercisesIds.length === 0)
      err.exercisesIds = "Select at least one"
    // if (!form.consentType) err.consentType = "Required"

    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (!validate()) return

    try {
      setSaveLoading(true)

      const payload = {
        clinicId: localStorage.getItem("HospitalId"),
        branchId: localStorage.getItem("branchId"),
        therapyName: form.therapyName,
        exerciseIds: form.exercisesIds,
        // consentType: form.consentType,
      }

      if (editId) {
        await updateTherapy(editId, payload)
        showCustomToast("Therapy updated successfully!", { position: "top-right" }, "success")
      } else {
        await addTherapy(payload)
        showCustomToast("Therapy added successfully!", { position: "top-right" }, "success")
      }

      resetForm()
      fetchData()

    } catch (error) {
      console.error(error)

      showCustomToast("Something went wrong!", { position: "top-right" }, "error")

    } finally {
      setSaveLoading(false)
    }
  }

  // ---------------- DELETE ----------------
  const handleConfirmDelete = async () => {
    console.log(serviceIdToDelete)
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      setDelLoading(true)
      const result = await deleteTherapy(serviceIdToDelete, hospitalId)
      console.log('Service deleted:', result)
      showCustomToast('Therapy deleted successfully!', { position: 'top-right' }, 'success')

      fetchData()
    } catch (error) {
      console.error('Error deleting Procedure:', error)
    } finally {
      setDelLoading(false)
    }
    setIsModalVisible(false)
  }

  // ---------------- EDIT ----------------
  const handleEdit = (item) => {
    setEditId(item.id)

    // ✅ FIX: map exerciseId correctly
    const selectedExercises = exerciseOptions.filter((opt) =>
      (item.exercises || []).map(e => e.exerciseId).includes(opt.value)
    )

    setForm({
      therapyName: item.therapyName,
      exercises: selectedExercises,
      exercisesIds: selectedExercises.map(e => String(e.value)),
      // consentType: String(item.consentType),
    })

    setModal(true)
  }

  // ---------------- RESET ----------------
  const resetForm = () => {
    setForm({
      therapyName: "",
      exercises: [],
      // consentType: "",
    })
    setEditId(null)
    setModal(false)
    setErrors({})
  }
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  const handleServiceDelete = (id) => {
    setServiceIdToDelete(id)
    setIsModalVisible(true)
  }
  const filteredList = list.filter((item) => {
    const search = searchQuery.toLowerCase()

    if (!search) return true

    return (
      (item.id || "").toString().toLowerCase().includes(search) ||
      (item.therapyName || "").toLowerCase().includes(search) ||
      (item.noExerciseIdCount || "").toString().includes(search)
    )
  })
  return (
    <>



      <div>
        <CForm className="d-flex justify-content-end mb-3">
          {can('Therapy Management', 'create') && (
            <div
              className=" w-100"
              style={{
                display: 'flex',
                justifyContent: 'end',
                alignContent: 'end',
                alignItems: 'end',
              }}
            >
              <CButton
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
                onClick={() => setModal(true)}
              >
                Add Therapy
              </CButton>
            </div>
          )}
        </CForm>
      </div>
      {/* TABLE */}
      <CTable className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Therapy Name</CTableHeaderCell>
            <CTableHeaderCell>No.Of Exercises</CTableHeaderCell>
            {/* <CTableHeaderCell>Consent</CTableHeaderCell> */}
            <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <CTableRow key={item.id}>
                {/* <CTableDataCell>{item.id}</CTableDataCell> */}
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{item.therapyName}</CTableDataCell>
                <CTableDataCell>{item.noExerciseIdCount}</CTableDataCell>
                {/* <CTableDataCell>{item.consentType}</CTableDataCell> */}
                <CTableDataCell className="text-end">
                  <div className="d-flex justify-content-end gap-2  ">
                    {can('Therapy Management', 'read') && (
                      <button
                        className="actionBtn"
                        onClick={() => handleView(item.id)}
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {can('Therapy Management', 'update') && (
                      <button
                        className="actionBtn"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}

                    {can('Therapy Management', 'delete') && (
                      <button
                        className="actionBtn"

                        onClick={() => handleServiceDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                  </div>
                </CTableDataCell>
                {/* <CTableDataCell>
                <CButton size="sm" onClick={() => handleEdit(item)}>
                  Edit
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </CButton>
              </CTableDataCell> */}
              </CTableRow>
            ))) : (
            <CTableRow>
              <CTableDataCell colSpan={4} className="text-center">
                No therapies Found
              </CTableDataCell>
            </CTableRow>
          )

          }
        </CTableBody>
      </CTable>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Therapy"
        message="Are you sure you want to delete this therapy?"
        confirmText={
          delloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-white" />
              Deleting...
            </>
          ) : (
            'Yes, Delete'
          )
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* MODAL */}
      <CModal visible={modal} onClose={resetForm} className={`custom-modal ${dropdownOpen ? "expand-modal" : ""}`} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editId ? "Edit" : "Add"} Therapy</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            <CRow>

              {/* Therapy Name */}
              <CCol md={12}>
                <CFormLabel className="fw-bold">Therapy Name</CFormLabel>
                <CFormInput
                  placeholder="Therapy Name"
                  value={form.therapyName}
                  onChange={(e) =>
                    setForm({ ...form, therapyName: e.target.value })
                  }
                />
                {errors.therapyName && (
                  <CFormText className="text-danger">
                    {errors.therapyName}
                  </CFormText>
                )}
              </CCol>

              {/* Exercise */}
              <CCol md={12} className="mt-3">
                <CFormLabel className="fw-bold">Select Exercises</CFormLabel>
                <Select
                  options={exerciseOptions}
                  isMulti
                  isSearchable

                  value={form.exercises}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setDropdownOpen(false)}
                  styles={{
                    menuList: (base) => ({
                      ...base,
                      maxHeight: 200,   // 5 items
                      overflowY: "auto"
                    })
                  }}
                  onChange={(val) => {
                    setForm({
                      ...form,
                      exercises: val, // UI
                      exercisesIds: val ? val.map((v) => String(v.value)) : [], // API
                    })
                  }}
                />
                {errors.exercisesIds && (
                  <CFormText className="text-danger">
                    {errors.exercisesIds}
                  </CFormText>
                )}
              </CCol>

              {/* Consent */}
              {/* <CCol md={12} className="mt-3">
                <CFormLabel className="fw-bold">Consent Type</CFormLabel>
                <CFormSelect
                  value={form.consentType}
                  onChange={(e) =>
                    setForm({ ...form, consentType: e.target.value })
                  }
                >
                  <option value="">Select Consent</option>
                  <option value="1">Generic</option>
                  <option value="2">Therapy</option>
                </CFormSelect>
                {errors.consentType && (
                  <CFormText className="text-danger">
                    {errors.consentType}
                  </CFormText>
                )}
              </CCol> */}

            </CRow>

            <div className="d-flex gap-2 justify-content-end">
              {/* <CButton onClick={() => setIsModalVisible(false)} color="secondary">
                Cancel
              </CButton> */}
              <CButton className="mt-3 ms-2" color="secondary" onClick={resetForm}>
                Cancel
              </CButton>

              <CButton
                onClick={handleSave}
                style={{
                  backgroundColor: 'var(--color-bgcolor)',
                  color: 'var(--color-black)',
                }}
                className="mt-3 ms-2"
              >
                {saveLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {editId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  editId ? "Update" : "Save"
                )}
              </CButton>
            </div>

            {/* <CButton className="mt-3" onClick={handleSave}>
              {editId ? "Update" : "Save"}
            </CButton> */}


          </CForm>
        </CModalBody>
      </CModal>
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="xl" backdrop="static" className="custom-modal">
        <CModalHeader>
          <CModalTitle>Therapy Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {viewLoading ? (
            <LoadingIndicator message="Loading..." />
          ) : viewTherapy ? (
            <>
              {/* 🔹 Therapy Info */}
              <div className="mb-3">
                <h5>Therapy Name: {viewTherapy.therapyName}</h5>
                <div><strong>Therapy ID: </strong>{viewTherapy.id}</div>
                <div><strong>No. of Exercises: </strong>{viewTherapy.noExerciseIdCount}</div>
                {/* <div><strong>Consent Type: </strong>{viewTherapy.consentType}</div> */}
              </div>

              {/* 🔹 Exercise Table */}
              <CTable bordered responsive hover className="pink-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Image</CTableHeaderCell>
                    <CTableHeaderCell>Video</CTableHeaderCell>
                    <CTableHeaderCell>Session</CTableHeaderCell>
                    {/* <CTableHeaderCell>Duration</CTableHeaderCell> */}
                    <CTableHeaderCell>Frequency</CTableHeaderCell>
                    <CTableHeaderCell>Sets</CTableHeaderCell>
                    <CTableHeaderCell>Reps</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>GST</CTableHeaderCell>
                    <CTableHeaderCell>Other Tax</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {viewTherapy.exercises?.map((ex, i) => (
                    <CTableRow key={ex.id}>
                      <CTableDataCell>{i + 1}</CTableDataCell>

                      <CTableDataCell>{ex.name}</CTableDataCell>

                      {/* Image */}
                      <CTableDataCell>
                        {ex.image ? (
                          <img
                            src={atob(ex.image)}
                            width="50"
                            height="50"
                            style={{ objectFit: "cover", borderRadius: "6px" }}
                          />
                        ) : (
                          "-"
                        )}
                      </CTableDataCell>

                      {/* Video */}
                      <CTableDataCell>
                        {ex.video ? (
                          <a
                            href={atob(ex.video)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "blue" }}
                          >
                            ▶ View
                          </a>
                        ) : (
                          "-"
                        )}
                      </CTableDataCell>

                      <CTableDataCell>{ex.session}</CTableDataCell>
                      {/* <CTableDataCell>{ex.duration || "-"}</CTableDataCell> */}
                      <CTableDataCell>{ex.frequency}</CTableDataCell>
                      <CTableDataCell>{ex.sets}</CTableDataCell>
                      <CTableDataCell>{ex.repetitions}</CTableDataCell>

                      {/* Pricing */}
                      <CTableDataCell>₹{ex.pricePerSession}</CTableDataCell>
                      <CTableDataCell>{ex.gst}%</CTableDataCell>
                      <CTableDataCell>{ex.otherTax}%</CTableDataCell>
                      <CTableDataCell>₹{ex.totalPrice}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </>
          ) : (
            <p className="text-center">No Data</p>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}