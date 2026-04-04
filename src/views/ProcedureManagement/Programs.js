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
import { getExercises } from "../EmployeeManagement/Therapist/TheraphyApi"
import ConfirmationModal from '../../components/ConfirmationModal'
import { useHospital } from "../Usecontext/HospitalContext"
import { Edit2, Eye, Trash2 } from "lucide-react"


export default function Programs() {
  const [list, setList] = useState([])
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [form, setForm] = useState({
    therapyName: "",
    exercisesIds: [],
    consentType: "",
  })

  const [errors, setErrors] = useState({})

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchData()
    fetchExercises()
  }, [])

  const fetchData = async () => {
    const res = await GetSubServices_ByClinicId(localStorage.getItem("HospitalId"))
    setList(res || [])
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)

  }

  const fetchExercises = async () => {
    const clinicId = localStorage.getItem("HospitalId")
    const branchId = localStorage.getItem("branchId")
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
    if (form.exercisesIds.length === 0) err.exercisesIds = "Select at least one"
    if (!form.consentType) err.consentType = "Required"

    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (!validate()) return

    const payload = {
      therapyName: form.therapyName,
      exercisesIds: form.exercisesIds,
      consentType: form.consentType,
    }

    if (editId) {
      await updateServiceData(editId, payload)
    } else {
      await postServiceData(payload)
    }

    resetForm()
    fetchData()
  }

  // ---------------- DELETE ----------------
  const handleConfirmDelete = async () => {
    console.log(serviceIdToDelete)
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      setDelLoading(true)
      const result = await deleteServiceData(serviceIdToDelete, hospitalId)
      console.log('Service deleted:', result)
      showCustomToast('Procedure deleted successfully!', { position: 'top-right' }, 'success')

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
    setForm({
      therapyName: item.therapyName,
      exercises: exerciseOptions.filter((opt) =>
        item.exercises.includes(opt.value)
      ),
      consentType: item.consentType,
    })
    setModal(true)
  }

  // ---------------- RESET ----------------
  const resetForm = () => {
    setForm({
      therapyName: "",
      exercises: [],
      consentType: "",
    })
    setEditId(null)
    setModal(false)
    setErrors({})
  }
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  const handleServiceDelete = async (serviceId) => {
    console.log(serviceId)

    setServiceIdToDelete(serviceId.subServiceId)
    setIsModalVisible(true)
  }
  return (
    <>



      <div>
        <CForm className="d-flex justify-content-end mb-3">
          {/* {can('Therapy Management', 'create') && ( */}
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
          {/* )} */}
        </CForm>
      </div>
      {/* TABLE */}
      <CTable className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Therapy Name</CTableHeaderCell>
            <CTableHeaderCell>No.Of Therapy</CTableHeaderCell>
            {/* <CTableHeaderCell>Consent</CTableHeaderCell> */}
            <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {list.map((item, index) => (
            <CTableRow key={item.id}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{item.therapyName}</CTableDataCell>
              <CTableDataCell>5</CTableDataCell>
              {/* <CTableDataCell>{item.consentType}</CTableDataCell> */}
              <CTableDataCell className="text-end">
                <div className="d-flex justify-content-end gap-2  ">
                  {/* {can('Therapy programs', 'read') && ( */}
                  <button
                    className="actionBtn"
                    onClick={() => setViewService(item)}
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  {/* )}
                  {can('Therapy programs', 'update') && ( */}
                  <button
                    className="actionBtn"
                    onClick={() => handleEdit(item)}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  {/* )}

                  {can('Therapy programs', 'delete') && ( */}
                  <button
                    className="actionBtn"

                    onClick={() => handleServiceDelete(item.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  {/* )} */}
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
          ))}
        </CTableBody>
      </CTable>

      {/* MODAL */}
      <CModal visible={modal} onClose={resetForm} className="custom-modal" backdrop="static" size="lg">
        <CModalHeader>
          <CModalTitle>{editId ? "Edit" : "Add"} Programs</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm>
            <CRow>

              {/* Therapy Name */}
              <CCol md={12}>
                <CFormInput
                  placeholder="Programs Name"
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
                <Select
                  options={exerciseOptions}
                  isMulti
                  isSearchable
                  value={form.exercises}
                  onChange={(val) =>
                    setForm({ ...form, exercises: val })
                  }
                />
                {errors.exercises && (
                  <CFormText className="text-danger">
                    {errors.exercises}
                  </CFormText>
                )}
              </CCol>

              {/* Consent */}
              {/* <CCol md={12} className="mt-3">
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
                {editId ? "Update" : "Save"}
              </CButton>
            </div>

            {/* <CButton className="mt-3" onClick={handleSave}>
              {editId ? "Update" : "Save"}
            </CButton> */}


          </CForm>
        </CModalBody>
      </CModal>
    </>
  )
}