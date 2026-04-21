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
import { Edit2, Eye, Trash2 } from "lucide-react"
import { getTherapiesService } from "./TherapyServiceApi"
import LoadingIndicator from "../../Utils/loader"
import { addProgram, deleteProgram, getProgramService, getProgramServicebyProgramId, updateProgram } from "./ProgramApi"
import { showCustomToast } from "../../Utils/Toaster"

import { useGlobalSearch } from "../Usecontext/GlobalSearchContext"
export default function Programs() {
  const [list, setList] = useState([])
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const { searchQuery } = useGlobalSearch()
  const [viewData, setViewData] = useState(null)
  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")
  const [form, setForm] = useState({
    therapyName: "",

    exercises: [],        // ✅ required
    exercisesIds: [],

  })

  const [errors, setErrors] = useState({})

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchData()
    fetchExercises()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const HospitalId = localStorage.getItem("HospitalId")
      const branchId = localStorage.getItem("branchId")
      const res = await getProgramService(HospitalId, branchId)
      console.log("Services", res)
      setList(res?.data?.data || [])
    } catch (error) {
      console.error("Error fetching services:", error)

      // const res = await GetSubServices_ByClinicId(localStorage.getItem("HospitalId"))
    } finally {
      setLoading(false)
    }
    // setList(res || [])
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)

  }
  const handleView = async (id) => {
    try {
      setViewModal(true)
      setViewLoading(true)

      const clinicId = localStorage.getItem("HospitalId")
      const branchId = localStorage.getItem("branchId")

      const res = await getProgramServicebyProgramId(id, clinicId, branchId)
      // 🔥 OR use specific API if available: getProgramById(id)

      const data = res?.data?.data

      setViewData(data)

    } catch (err) {
      console.log("view error", err)
    } finally {
      setViewLoading(false)
    }
  }

  const fetchExercises = async () => {

    const res = await getTherapiesService(clinicId, branchId)
    console.log("Exercises", res.data.data)
    // convert to react-select format
    const data = res.data.data || []
    const options = data.map((item) => ({
      value: item.id,
      label: item.therapyName,
    }))

    setExerciseOptions(options)
  }

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let err = {}

    if (!form.therapyName) err.therapyName = "Required"
    if (form.exercisesIds.length === 0) {
      err.exercisesIds = "Select at least one"
    }


    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ---------------- SAVE ----------------

  const handleSave = async () => {
    if (!validate()) return

    try {
      setSaveLoading(true)

      const payload = {
        clinicId: clinicId,
        branchId: branchId,
        programName: form.therapyName,
        therophyIds: form.exercisesIds,

      }



      if (editId) {
        await updateProgram(editId, payload)
        showCustomToast("Program updated successfully!", { position: "top-right" }, "success")

      } else {
        await addProgram(payload)
        showCustomToast("Program added successfully!", { position: "top-right" }, "success")

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
    try {
      setDelLoading(true)

      console.log("Deleting:", serviceIdToDelete)

      await deleteProgram(serviceIdToDelete)

      // ✅ update UI instantly
      setList(prev => prev.filter(item => item.id !== serviceIdToDelete))

      // ✅ SHOW TOAST HERE
      showCustomToast(
        "Program deleted successfully!",
        { position: "top-right" },
        "success"
      )

      // optional refresh
      fetchData()

    } catch (error) {
      console.error(error)

      // ❌ ERROR TOAST
      showCustomToast(
        "Failed to delete program",
        { position: "top-right" },
        "error"
      )

    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  // ---------------- EDIT ----------------
  const handleEdit = (item) => {
    setEditId(item.id)

    // ✅ extract IDs from API
    const selectedIds = (item.therophy || []).map(t => t.theraphyId)

    // ✅ match with dropdown options
    const selected = exerciseOptions.filter(opt =>
      selectedIds.includes(opt.value)
    )

    setForm({
      therapyName: item.programName,
      exercises: selected,
      exercisesIds: selected.map(s => String(s.value))
    })

    setModal(true)
  }

  // ---------------- RESET ----------------
  const resetForm = () => {
    setForm({
      therapyName: "",
      exercises: [],

    })
    setEditId(null)
    setModal(false)
    setErrors({})
  }
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)

  const handleServiceDelete = (id) => {
    setServiceIdToDelete(id)
    setIsModalVisible(true)
  }

  if (loading) {
    return (
      <LoadingIndicator />
    )
  }
  const filteredList = list.filter((item) => {
    const search = searchQuery.toLowerCase()

    if (!search) return true

    return (
      (item.id || "").toString().toLowerCase().includes(search) ||
      (item.programName || "").toLowerCase().includes(search) ||
      (item.theraphyCount || "").toString().includes(search) ||
      (item.therophy || [])
        .map((t) => t.therapyName?.toLowerCase())
        .join(" ")
        .includes(search)
    )
  })
  return (
    <>



      <div>
        <CForm className="d-flex justify-content-end mb-3">
          {can('Program Management', 'create') && (
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
                Add Programs
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
            <CTableHeaderCell>Program Name</CTableHeaderCell>
            <CTableHeaderCell>No.Of Therapy</CTableHeaderCell>
            {/* <CTableHeaderCell>Consent</CTableHeaderCell> */}
            <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>

          {
            filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.programName}</CTableDataCell>
                  <CTableDataCell>{item.theraphyCount}</CTableDataCell>
                  {/* <CTableDataCell>{item.consentType}</CTableDataCell> */}
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Program Management', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => handleView(item.id)}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Program Management', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}

                      {can('Program Management', 'delete') && (
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
                  No Program Found
                </CTableDataCell>
              </CTableRow>
            )

          }
        </CTableBody>
      </CTable>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Procedure"
        message="Are you sure you want to delete this procedure? This action cannot be undone."
        confirmText={
          delloading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2 text-white"
                role="status"
              />
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
      <CModal visible={modal} onClose={resetForm} className={`custom-modal ${dropdownOpen ? "expand-modal" : ""}`} backdrop="static" size="lg">
        <CModalHeader>
          <CModalTitle>{editId ? "Edit" : "Add"} Programs</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            <CRow>

              {/* Therapy Name */}
              <CCol md={12}>
                <CFormLabel className="fw-bold">Program Name</CFormLabel>
                <CFormInput
                  placeholder="Program Name"
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
                <CFormLabel className="fw-bold">Select  Therapy</CFormLabel>

                <Select
                  options={exerciseOptions}
                  isMulti
                  isSearchable
                  value={form.exercises}

                  hideSelectedOptions={false}
                  closeMenuOnSelect={false}
                  isClearable={false}   // ✅ prevent accidental clear

                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setDropdownOpen(false)}

                  styles={{
                    menuList: (base) => ({
                      ...base,
                      maxHeight: 200,
                      overflowY: "auto"
                    })
                  }}

                  onChange={(val) => {
                    setForm((prev) => ({
                      ...prev,
                      exercises: val || [],
                      exercisesIds: val ? val.map((v) => String(v.value)) : [],
                    }))
                  }}
                />

                {errors.exercisesIds && (
                  <CFormText className="text-danger">
                    {errors.exercisesIds}
                  </CFormText>
                )}
              </CCol>


            </CRow>

            <div className="d-flex gap-2 justify-content-end">

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
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg" backdrop="static" className="custom-modal">
        <CModalHeader>
          <CModalTitle>Program Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {viewLoading ? (
            <div className="text-center p-4">
              <LoadingIndicator />
            </div>
          ) : viewData ? (
            <>
              {/* PROGRAM TITLE */}
              <div className="mb-4">
                <h4 style={{ fontWeight: '700', color: 'var(--color-black)' }}>{viewData.programName}</h4>
                <hr />
              </div>

              {/* THERAPIES */}
              {viewData.therophyData?.map((therapy, index) => (
                <div
                  key={therapy.id}
                  className="mb-3 shadow-sm rounded"
                  style={{
                    border: '1px solid #eee',
                    overflow: 'hidden',
                  }}
                >
                  {/* HEADER */}
                  <div
                    data-bs-toggle="collapse"
                    data-bs-target={`#therapy-${index}`}
                    style={{
                      padding: '12px 15px',
                      cursor: 'pointer',
                      backgroundColor: "var(--color-bgcolor)",
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: '600',
                    }}
                  >
                    <span>
                      {index + 1}. {therapy.therapyName}
                    </span>

                    <span style={{ fontSize: '12px', color: 'var(--color-black)' }}>
                      Click to expand
                    </span>
                  </div>

                  {/* BODY */}
                  <div
                    id={`therapy-${index}`}
                    className="collapse"
                    style={{ background: '#fff' }}
                  >
                    <div className="p-3">

                      {therapy.exercises?.length > 0 ? (
                        <CTable
                          bordered
                          hover
                          responsive
                          style={{ fontSize: '13px' }}
                        >
                          <CTableHead color="light" className="pink-table">
                            <CTableRow>
                              <CTableHeaderCell>#</CTableHeaderCell>
                              <CTableHeaderCell>Exercise</CTableHeaderCell>
                              <CTableHeaderCell>Session</CTableHeaderCell>
                              <CTableHeaderCell>Frequency</CTableHeaderCell>
                              <CTableHeaderCell>Sets</CTableHeaderCell>
                              <CTableHeaderCell>Reps</CTableHeaderCell>
                              <CTableHeaderCell>Price</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>

                          <CTableBody>
                            {therapy.exercises.map((ex, i) => (
                              <CTableRow key={ex.id}>
                                <CTableDataCell>{i + 1}</CTableDataCell>
                                <CTableDataCell>
                                  <strong>{ex.name}</strong>
                                </CTableDataCell>
                                <CTableDataCell>{ex.session || '-'}</CTableDataCell>
                                <CTableDataCell>{ex.frequency || '-'}</CTableDataCell>
                                <CTableDataCell>{ex.sets || '-'}</CTableDataCell>
                                <CTableDataCell>{ex.repetitions || '-'}</CTableDataCell>
                                <CTableDataCell style={{ fontWeight: '600' }}>
                                  ₹{ex.totalPrice || 0}
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      ) : (
                        <div className="text-center text-muted py-3">
                          No Exercises Available
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center p-4 text-muted">No Data</div>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}