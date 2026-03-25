import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DataTable from 'react-data-table-component'
import {
  deleteTreatmentData,
  postTreatmentData,
  TreatmentData,
  TreatmentDataById,
  updateTreatmentData,
} from './TreatmentsManagementAPI'
import capitalizeWords from '../../Utils/capitalizeWords'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../components/ConfirmationModal'
import LoadingIndicator from '../../Utils/loader'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

const TreatmentsManagement = () => {
  // const [searchQuery, setSearchQuery] = useState('')
  const [treatment, setTreatment] = useState([])
  // const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [error, setError] = useState(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [viewTreatment, setViewTreatment] = useState(null)
  const [editTreatmentMode, setEditTreatmentMode] = useState(false)
  const [treatmentToEdit, setTreatmentToEdit] = useState(null)
  const [errors, setErrors] = useState({})

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [treatmentIdToDelete, setTreatmentIdToDelete] = useState(null)
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)

  const [newTreatment, setNewTreatment] = useState({ treatmentName: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const hospitalId = localStorage.getItem('HospitalId')
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // Normalize API data to have consistent IDs
  const normalizeTreatments = (data) =>
    data.map((item) => ({
      ...item,
      id: item.id || item._id,
    }))

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await TreatmentData()
      setTreatment(normalizeTreatments(response.data))
    } catch (error) {
      setError('Failed to fetch treatment data.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDataBy_HId = async (hospitalId) => {
    setLoading(true)
    try {
      const response = await TreatmentDataById(hospitalId)
      setTreatment(normalizeTreatments(response.data))
    } catch (error) {
      setError('Failed to fetch treatment data.')
    } finally {
      setLoading(false)
    }
  }
  const { searchQuery, setSearchQuery } = useGlobalSearch()

  // ✅ Apply global search filtering

  useEffect(() => {
    // fetchData()
    fetchDataBy_HId(hospitalId)
  }, [])

  // Search filter
  // useEffect(() => {
  //   const trimmedQuery = searchQuery.toLowerCase().trim()
  //   if (!trimmedQuery) {
  //     setFilteredData([])
  //     return
  //   }
  //   const filtered = treatment.filter((t) =>
  //     t.treatmentName?.toLowerCase().startsWith(trimmedQuery),
  //   )
  //   setFilteredData(filtered)
  // }, [searchQuery, treatment])

  // Delete confirm
  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTreatmentData(treatmentIdToDelete, hospitalIdToDelete)
      showCustomToast('Treatment deleted successfully!', { position: 'top-right' }, 'success')
      // fetchData()
      fetchDataBy_HId(hospitalId)
    } catch (error) {
      // showCustomToast('Failed to delete treatment.', 'error')
      console.error('Delete error:', error)
    } finally {
      setDelLoading(false)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setTreatmentIdToDelete(null)
    setHospitalIdToDelete(null)
    setIsModalVisible(false)
  }
  const nameRegex = /^[A-Za-z0-9\s.\-()\/']+$/

  // Add treatment
  const handleAddTreatment = async () => {
    const trimmedName = newTreatment.treatmentName.trim()

    // 🔹 Validation
    if (!trimmedName) {
      setErrors({ treatmentName: 'Treatment name is required.' })
      return
    }
    if (!nameRegex.test(trimmedName)) {
      setErrors({
        treatmentName: "Only alphabets, numbers, spaces, and limited symbols (.-()/') are allowed",
      })
      return
    }

    // 🔹 Duplicate check (case-insensitive)
    const duplicate = treatment.some(
      (t) => t.treatmentName.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
    if (duplicate) {
      showCustomToast(`Duplicate treatment name - "${trimmedName}" already exists!`, 'error', {
        position: 'top-right',
      })
      return
    }

    try {
      setSaveLoading(true)
      const payload = {
        treatmentName: trimmedName,
        hospitalId: hospitalId,
      }

      const response = await postTreatmentData(payload)

      // 🔹 Add new treatment at top
      const newTreatmentRow = {
        id: response.data.id || response.id,
        treatmentName: response.data.treatmentName || trimmedName,
        hospitalId: response.data.hospitalId || hospitalId,
      }
      setTreatment((prev) => [...prev, newTreatmentRow]) // new last

      showCustomToast('Treatment added successfully!', 'success')
      setModalVisible(false)
      setNewTreatment({ treatmentName: '' })
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'An unexpected error occurred.'
      // showCustomToast(`Error adding treatment: ${errorMessage}`, { position: 'top-right' }, 'error')
    } finally {
      setSaveLoading(false)
    }
  }
  const handleUpdateTreatment = async () => {
    const { id: treatmentId, hospitalId, treatmentName } = treatmentToEdit
    const trimmedName = treatmentName?.trim()

    // 🔹 Validation
    if (!trimmedName) {
      setErrors({ treatmentName: 'Treatment name is required.' })
      return
    }
    if (!nameRegex.test(trimmedName)) {
      setErrors({ treatmentName: 'Only alphabets, spaces, and "." are allowed.' })
      return
    }

    // 🔹 Duplicate check (ignore the one being edited)
    const duplicate = treatment.some(
      (t) =>
        t.id !== treatmentId && t.treatmentName.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
    if (duplicate) {
      showCustomToast(`Duplicate treatment name - "${trimmedName}" already exists!`, 'error', {
        position: 'top-right',
      })
      return
    }

    try {
      setSaveLoading(true)
      await updateTreatmentData(
        { treatmentName: trimmedName, hospitalId: hospitalId },
        treatmentId,
        hospitalId,
      )

      showCustomToast('Treatment updated successfully!', 'success')

      // 🔹 Update state immediately (no need to refetch)
      setTreatment((prev) =>
        prev.map((t) => (t.id === treatmentId ? { ...t, treatmentName: trimmedName } : t)),
      )

      setEditTreatmentMode(false)
    } catch (error) {
      console.error('Update error:', error)
      // showCustomToast('Failed to update treatment.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  // Edit treatment
  const handleTreatmentEdit = (treatment) => {
    setTreatmentToEdit(treatment)
    setEditTreatmentMode(true)
  }

  // Delete handler
  const handleTreatmentDelete = (treatment) => {
    setTreatmentIdToDelete(treatment.treatmentId || treatment.id || treatment._id)
    setHospitalIdToDelete(treatment.hospitalId)
    setIsModalVisible(true)
  }

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return treatment
    return treatment.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, treatment])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // const displayData = filteredData.length
  //   ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  //   : treatment.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <div>
      {/* <ToastContainer /> */}
      <CForm className="d-flex justify-content-between mb-3">
        {can('Treatments', 'create') && (
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
              onClick={() => setModalVisible(true)}
            >
              Add Treatment
            </CButton>
          </div>
        )}

        {/* <CButton
          color="info"
          className="text-white"
          style={{ marginRight: '100px' }}
          onClick={() => setModalVisible(true)}
        >
          Add Treatment
        </CButton> */}
      </CForm>

      {viewTreatment && (
        <CModal
          visible={!!viewTreatment}
          onClose={() => setViewTreatment(null)}
          backdrop="static"
          alignment="center"
        >
          <CModalHeader>
            <CModalTitle>Treatment Details</CModalTitle>
          </CModalHeader>
          <CModalBody style={{ color: 'var(--color-black)' }}>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Treatment Name:</strong>
              </CCol>
              <CCol sm={8}>{viewTreatment.treatmentName}</CCol>
            </CRow>
            {/* <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Hospital ID:</strong>
              </CCol>
              <CCol sm={8}>{viewTreatment.hospitalId}</CCol>
            </CRow> */}
          </CModalBody>
        </CModal>
      )}

      {/* Add Modal */}
      <CModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setNewTreatment({ treatmentName: '' }) // reset form
          setErrors({})
        }}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Add New Treatment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm
            onSubmit={(e) => {
              e.preventDefault() // ✅ stop form from auto-closing
              handleAddTreatment() // call your add handler manually
            }}
          >
            <h6>
              Treatment Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              name="treatmentName"
              value={newTreatment.treatmentName}
              onChange={(e) => {
                const value = e.target.value
                setNewTreatment({ ...newTreatment, treatmentName: value })
                if (errors.treatmentName) {
                  setErrors((prev) => ({ ...prev, treatmentName: '' }))
                }
              }}
              placeholder="Enter Treatment Name"
              className={`mb-3 ${errors.treatmentName ? 'is-invalid' : ''}`}
            />
            {errors.treatmentName && (
              <div className="invalid-feedback" style={{ color: 'red' }}>
                {errors.treatmentName}
              </div>
            )}
            <CModalFooter>
              <CButton color="secondary" onClick={() => setNewTreatment({ treatmentName: '' })}>
                Reset
              </CButton>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>
                Cancel
              </CButton>
              <CButton
                type="submit" // ✅ triggers form submit (handled above)
                style={{ backgroundColor: 'var(--color-black)' }}
                className="text-white"
                disabled={saveloading}
              >
                {saveloading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2 text-white"
                      role="status"
                    />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Edit Modal */}
      <CModal
        visible={editTreatmentMode}
        onClose={() => setEditTreatmentMode(false)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Edit Treatment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>
              Treatment Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              value={treatmentToEdit?.treatmentName || ''}
              onChange={(e) => {
                setTreatmentToEdit({ ...treatmentToEdit, treatmentName: e.target.value })
                if (errors.treatmentName) {
                  setErrors((prev) => ({ ...prev, treatmentName: '' }))
                }
              }}
              className={`${errors.treatmentName ? 'is-invalid' : ''}`}
            />
            {errors.treatmentName && (
              <div className="invalid-feedback" style={{ color: 'red' }}>
                {errors.treatmentName}
              </div>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          {/* <CButton color="info" className="text-white" onClick={handleUpdateTreatment}>
            Update
          </CButton> */}
          <CButton color="secondary" onClick={() => setEditTreatmentMode(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)' }}
            className="text-white"
            onClick={handleUpdateTreatment}
            disabled={saveloading}
          >
            {saveloading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
                Updating...
              </>
            ) : (
              'Update'
            )}
            {/* {saveloading ? "Updating..." : "Update"}  */}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation */}

      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Treatment"
        message="Are you sure you want to delete this treatment? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading treatments..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            height: '50vh', // full screen height

            color: 'var(--color-black)',
          }}
        >
          {error}
        </div>
      ) : (
        <CTable striped hover responsive>
          <CTableHead className="pink-table">
            <CTableRow>
              <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
              <CTableHeaderCell>Treatment Name</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((treatment, index) => (
                <CTableRow key={treatment.id}>
                  <CTableDataCell style={{ paddingLeft: '40px' }}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </CTableDataCell>
                  <CTableDataCell>{treatment.treatmentName}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {/* {can('Treatments', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => setViewTreatment(treatment)}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )} */}

                      {can('Treatments', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setTreatmentToEdit(treatment)
                            setEditTreatmentMode(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Treatments', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => handleTreatmentDelete(treatment)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-center text-muted">
                  🔍 No diseases found treatment "<b>{searchQuery}</b>"
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
      {/* Pagination Controls */}
      {displayData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}
    </div>
  )
}
export default TreatmentsManagement
