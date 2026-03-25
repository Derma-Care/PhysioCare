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
  deleteTestData,
  postTestData,
  TestData,
  TestDataById,
  updateTestData,
} from './TestsManagementAPI'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import capitalizeWords from '../../Utils/capitalizeWords'
import LoadingIndicator from '../../Utils/loader'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

const TestsManagement = () => {
  // const [searchQuery, setSearchQuery] = useState('')
  const [test, setTest] = useState([])
  // const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewTest, setViewTest] = useState(null)
  const [editTestMode, setEditTestMode] = useState(false)
  const [testToEdit, setTestToEdit] = useState(null)
  const [errors, setErrors] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [testIdToDelete, setTestIdToDelete] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [delloading, setDelLoading] = useState(false)

  const [newTest, setNewTest] = useState({
    testName: '',
    hospitalId: '',
    description: '',
    purpose: '',
  })
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)
  const hospitalId = localStorage.getItem('HospitalId')

  const normalizeTests = (data) =>
    data.map((item) => ({
      ...item,
      id: item.id || item._id, // fallback
    }))

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await TestData()
      setTest(normalizeTests(response.data))
    } catch (error) {
      setError('Failed to fetch test data.')
    } finally {
      setLoading(false)
    }
  }
  const fetchDataById = async (hospitalId) => {
    setLoading(true)
    try {
      const response = await TestDataById(hospitalId)
      setTest(normalizeTests(response.data)) // ❌ no .reverse()
    } catch (error) {
      setError('Failed to fetch test data.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTestData(testIdToDelete, hospitalIdToDelete)
      showCustomToast('Test deleted successfully!', { position: 'top-right' }, 'success')
      // fetchData()
      fetchDataById(hospitalId)
    } catch (error) {
      // showCustomToast('Failed to delete test.', 'error')
      console.error('Delete error:', error)
    } finally {
      setDelLoading(false)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setTestIdToDelete(null)
    setHospitalIdToDelete(null)
    setIsModalVisible(false)
  }

  useEffect(() => {
    // fetchData()
    fetchDataById(hospitalId)
  }, [hospitalId])

  // useEffect(() => {
  //   const trimmedQuery = searchQuery.toLowerCase().trim()
  //   if (!trimmedQuery) {
  //     setFilteredData([])
  //     return
  //   }
  //   const filtered = test.filter((t) => t.testName?.toLowerCase().includes(trimmedQuery))
  //   setFilteredData(filtered)
  // }, [searchQuery, test])

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return test
    return test.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, test])

  const validateForm = () => {
    const newErrors = {}
    if (!newTest.testName.trim()) newErrors.testName = 'Test name is required.'
    if (!newTest.hospitalId.trim()) newErrors.hospitalId = 'Hospital ID is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const handleEditClick = (test) => {
    setSelectedTest({
      ...test, // includes testId
      hospitalId,
    })
    setModalVisible(true)
  }
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id)

  const nameRegex = /^[A-Za-z0-9\s.\-()\/']+$/

  const handleAddTest = async () => {
    console.log(newTest.testName)
    if (!newTest.testName.trim()) {
      setErrors({ testName: 'Test name is required.' })
      return
    }
    if (!nameRegex.test(newTest.testName.trim())) {
      setErrors({
        testName: "Only alphabets, numbers, spaces, and limited symbols (.-()/') are allowed.",
      })
      return
    }

    const duplicate = test.some(
      (t) => t.testName.trim().toLowerCase() === newTest.testName.trim().toLowerCase(),
    )
    if (duplicate) {
      showCustomToast(
        `Duplicate test name,Add another test - ${newTest.testName} already exists!`,
        'error',
        {
          position: 'top-right',
        },
        
      )
      setModalVisible(false)
      return
    }

    try {
      setSaveLoading(true)
      const payload = {
        testName: newTest.testName,
        hospitalId: hospitalId,
        description: newTest.description,
        purpose: newTest.purpose,
      }

      await postTestData(payload)
      showCustomToast('Test added successfully!', 'success')
      fetchDataById(hospitalId)
      setModalVisible(false)
      setNewTest({ testName: '', description: '', purpose: '' })
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'An unexpected error occurred.'
      // showCustomToast(`Error adding test: ${errorMessage}`, { position: 'top-right' }, 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleTestEdit = (test) => {
    setTestToEdit(test) // test should have `id` and `hospitalId`
    setEditTestMode(true)
  }

  const handleUpdateTest = async () => {
    if (!testToEdit?.testName?.trim()) {
      setErrors({ testName: 'Test name is required.' })
      // toast.error('Test name cannot be empty!', { position: 'top-right' })
      return
    }
    if (!nameRegex.test(testToEdit.testName.trim())) {
      setErrors({ testName: 'Only alphabets, spaces, and "." are allowed.' })
      return
    }

    // ✅ Duplicate check before update
    const duplicate = test.some(
      (t) =>
        t.testName.trim().toLowerCase() === testToEdit.testName.trim().toLowerCase() &&
        t.id !== testToEdit.id,
    )
    if (duplicate) {
      showCustomToast(`Duplicate test name - ${testToEdit.testName} already exists!`, 'error', {
        position: 'top-right',
      })
      return
    }

    try {
      setSaveLoading(true)
      const { id: testId, hospitalId } = testToEdit
      await updateTestData(testToEdit, testId, hospitalId)
      showCustomToast('Test updated successfully!', 'success')
      setEditTestMode(false)
      // fetchData()
      fetchDataById(hospitalId)
    } catch (error) {
      console.error('Update error:', error)
      // showCustomToast('Failed to update test.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleTestDelete = (test) => {
    setTestIdToDelete(test.testId || test.id || test._id) // depending on your API structure
    setHospitalIdToDelete(test.hospitalId)
    setIsModalVisible(true)
  }

  // const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
  //   return (
  //     <CModal visible={isVisible} onClose={onCancel} backdrop="static">
  //       <CModalHeader>
  //         <CModalTitle>Confirmation</CModalTitle>
  //       </CModalHeader>
  //       <CModalBody>{message}</CModalBody>
  //       <CModalFooter>
  //         <CButton color="secondary" onClick={onCancel}>
  //           Cancel
  //         </CButton>
  //         <CButton color="danger" onClick={onConfirm}>
  //           Confirm
  //         </CButton>
  //       </CModalFooter>
  //     </CModal>
  //   )
  // }
  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // const displayData = filteredData.length
  //   ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  //   : test.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <div>
      <ToastContainer />
      <CForm className="d-flex justify-content-between mb-3">
        {/* <CInputGroup className="mb-3" style={{ width: '300px', marginLeft: '40px' }}>
          <CFormInput
            type="text"
            placeholder="Search by Test Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup> */}
        {can('Tests', 'create') && (
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
              Add Test
            </CButton>
          </div>
        )}
        {/* <CButton
          color="info"
          className="text-white"
          style={{ marginRight: '100px' }}
          onClick={() => setModalVisible(true)}
        >
          Add Test
        </CButton> */}
      </CForm>

      {viewTest && (
        <CModal
          visible={!!viewTest}
          onClose={() => setViewTest(null)}
          backdrop="static"
          alignment="center"
        >
          <CModalHeader>
            <CModalTitle>Test Details</CModalTitle>
          </CModalHeader>
          <CModalBody style={{ color: 'var(--color-black)' }}>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Test Name:</strong>
              </CCol>
              <CCol sm={8}>{viewTest.testName}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Description:</strong>
              </CCol>
              <CCol sm={8}>{viewTest.description}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Purpose:</strong>
              </CCol>
              <CCol sm={8}>{viewTest.purpose || 'NA'}</CCol>
            </CRow>
          </CModalBody>
        </CModal>
      )}

      <CModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setNewTest({ testName: '', hospitalId: '', description: '', purpose: '' }) // reset form
          setErrors({})
        }}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Add New Test</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>
              Test Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              name="testName"
              value={newTest.testName}
              onChange={(e) => {
                const value = e.target.value
                setNewTest({ ...newTest, testName: value })
                if (errors.testName) {
                  setErrors((prev) => ({ ...prev, testName: '' }))
                }
              }}
              className={`mb-2 ${errors.testName ? 'is-invalid' : ''}`}
            />
            {errors.testName && (
              <div className="invalid-feedback" style={{ color: 'red' }}>
                {errors.testName}
              </div>
            )}

            <h6>Description</h6>
            <CFormInput
              type="text"
              name="description"
              value={newTest.description}
              onChange={(e) => {
                const value = e.target.value
                setNewTest({ ...newTest, description: value })

                // Clear error for this field as the user types
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: '' }))
                }
              }}
              // placeholder="Enter description"
              className={(errors.description ? 'is-invalid' : '', 'mb-3')}
            />
            <h6>Purpose</h6>
            <CFormInput
              type="text"
              name="purpose"
              value={newTest.purpose}
              onChange={(e) => {
                const value = e.target.value
                setNewTest({ ...newTest, purpose: value })

                // Clear error for this field as the user types
                if (errors.purpose) {
                  setErrors((prev) => ({ ...prev, purpose: '' }))
                }
              }}
              // placeholder="Enter purpose"
              className={errors.purpose ? 'is-invalid' : ''}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() =>
              setNewTest({
                testName: '',
                hospitalId: '',
                description: '',
                purpose: '',
              })
            }
          >
            Reset
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)' }}
            className="text-white"
            onClick={handleAddTest}
            disabled={saveloading}
          >
            {saveloading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={editTestMode} onClose={() => setEditTestMode(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Edit Test</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>
              Test Name<span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              value={testToEdit?.testName || ''}
              onChange={(e) => {
                setTestToEdit({ ...testToEdit, testName: e.target.value })
                if (errors.testName) {
                  setErrors({ ...errors, testName: '' })
                }
              }}
            />
            {errors.testName && (
              <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
                {errors.testName}
              </p>
            )}
            <h6>Description</h6>
            <CFormInput
              type="text"
              value={testToEdit?.description || ''}
              onChange={(e) => setTestToEdit({ ...testToEdit, description: e.target.value })}
            />
            <h6>purpose</h6>
            <CFormInput
              type="text"
              value={testToEdit?.purpose || ''}
              onChange={(e) => setTestToEdit({ ...testToEdit, purpose: e.target.value })}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          {/* <CButton color="info" className="text-white" onClick={handleUpdateTest}>
            Update
          </CButton> */}
          <CButton color="secondary" onClick={() => setEditTestMode(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)' }}
            className="text-white"
            onClick={handleUpdateTest}
            disabled={saveloading} // Disable while loading
          >
            {saveloading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Doctor"
        message="Are you sure you want to delete this test? This action cannot be undone."
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
          <LoadingIndicator message="Loading Test..." />
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
              <CTableHeaderCell>Test Name</CTableHeaderCell>
              <CTableHeaderCell>Description</CTableHeaderCell>
              <CTableHeaderCell>Purpose</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((test, index) => (
                <CTableRow key={test.id}>
                  <CTableDataCell style={{ paddingLeft: '40px' }}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </CTableDataCell>
                  <CTableDataCell>{test.testName}</CTableDataCell>
                  <CTableDataCell>{test.description || 'NA'}</CTableDataCell>
                  <CTableDataCell>{test.purpose || 'NA'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Tests', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => setViewTest(test)}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Tests', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setTestToEdit(test)
                            setEditTestMode(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Tests', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => handleTestDelete(test)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                  {/* <CTableDataCell>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '140px' }}>
                    <div
                      onClick={() => setViewTest(test)}
                      style={{ color: 'green', cursor: 'pointer' }}
                    >
                      View
                    </div>
                    <div
                      onClick={() => {
                        setTestToEdit(test)
                        setEditTestMode(true)
                      }}
                      style={{ color: 'blue', cursor: 'pointer' }}
                    >
                      Edit
                    </div>
                    <div
                      onClick={() => handleTestDelete(test)}
                      style={{ color: 'red', cursor: 'pointer' }}
                    >
                      Delete
                    </div>
                  </div>
                </CTableDataCell> */}
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-center text-muted">
                  🔍 No tests found matching "<b>{searchQuery}</b>"
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

export default TestsManagement
