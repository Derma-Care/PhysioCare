import React, { useEffect, useState } from 'react'
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
  CModalFooter,
} from '@coreui/react'

import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import {
  getAllFrontDeskAPI,
  addFrontDeskAPI,
  updateFrontDeskAPI,
  deleteFrontDeskAPI,
} from './FrontDeskAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import FrontDeskForm from './FrontDeskForm'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const FrontDeskManagement = () => {
  const [receptionist, setReceptionist] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTech, setSelectedTech] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
    const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [modalData, setModalData] = useState(null) // store username & password
  const [modalTVisible, setModalTVisible] = useState(false)

  // ✅ Load from localStorage on mount

  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      if (clinicID) {
        const res = await getAllFrontDeskAPI(clinicID, branchId) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setReceptionist(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching lab receptionist:', err)
      setReceptionist([])
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTechs()
  }, [])
  // ✅ Save (Add / Edit)

  const handleSave = async (formData) => {
    try {
      let res
      if (selectedTech) {
        res = await updateFrontDeskAPI(selectedTech.id, formData)
        // showCustomToast('Receptionist updated successfully!','success')
        fetchTechs()

        // setReceptionist((prev) => [...prev, res.data.data])
      } else {
        res = await addFrontDeskAPI(formData)
      }

      if (res.data?.statusCode === 201 || (res.data?.statusCode === 200 && res.data?.success)) {
        await fetchTechs()

        // ✅ If new technician, show credentials modal
        if (!selectedTech) {
          setModalData({
            username: res.data.data?.userName,
            password: res.data.data?.password,
          })
          setModalTVisible(true)
        }
        showCustomToast('Receptionist added successfully!', 'success')
        // showToast(res.data?.message || 'Technician saved successfully!')

        setModalVisible(false)
        return res
      }

      console.log(res)

      // ❌ Backend responded but with an error (e.g. status 409)
      showCustomToast(res.data?.message || 'Failed to save receptionist.', 'error')
      return res
      //   await fetchTechs() // refresh from API
      //   console.log(res)
      //   setModalData({
      //     username: res.data.data.userName,
      //     password: res.data.data.password,
      //   })
      //   setModalVisible(false)
      //   setModalTVisible(true)
      //   toast.success('Receptionist added successfully!')
      // }
      // showToast(res.data?.message || 'Failed to save receptionist.')
      // setModalVisible(false)
      // setSelectedTech(null)
    } catch (err) {
      // showCustomToast('❌ Failed to save receptionist.', 'error')
      console.error('API error:', err)
    }
  }

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
           setDelLoading(true)
      await deleteFrontDeskAPI(id) // ✅ call backend
      setReceptionist((prev) => prev.filter((t) => t.id !== id))
      showCustomToast('Receptionist deleted successfully!', 'success')
    } catch (err) {
      showCustomToast('❌ Failed to delete receptionist.', 'error')
      console.error('Delete error:', err)
    } finally {
      setIsModalVisible(false) // close modal after action
      setDelLoading(false)
    }
  }
  //permission
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  //search
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return receptionist
    return receptionist.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, receptionist])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  //decode image
  const decodeImage = (data) => {
    try {
      // decode base64 string into normal string
      return atob(data)
    } catch {
      return null
    }
  }

  return (
    <div>
      {can('FrontDesk', 'create') && (
        <div
          className="mb-3 w-100"
          style={{ display: 'flex', justifyContent: 'end', alignContent: 'end', alignItems: 'end' }}
        >
          <CButton
            style={{
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}
            onClick={() => setModalVisible(true)}
          >
            Add Receptionist
          </CButton>
        </div>
      )}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Receptionist Credentials</h5>
        </CModalHeader>
        <CModalBody>
          {modalData ? (
            <div>
              <p>
                <strong>Username:</strong> {modalData.username}
              </p>
              <p>
                <strong>Password:</strong> {modalData.password}
              </p>
              <small className="text-danger">
                ⚠️ Please save these credentials securely. They will not be shown again.
              </small>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            onClick={() => {
              setModalTVisible(false)
              setModalData(null)
            }} // ✅ Correct state
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete receptionist"
        message="Are you sure you want to delete this receptionist? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)} // ✅ pass id here
        onCancel={() => setIsModalVisible(false)} // ✅ just close modal
      />
      {/* <CButton color="primary" onClick={() => setModalVisible(true)}>
  
      </CButton> */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading receptionist..." />
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
        <CTable className="mt-3" striped hover responsive>
          <CTableHead>
            <CTableRow className="pink-table  w-auto">
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Photo</CTableHeaderCell> {/* 👈 New Column */}
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Sex</CTableHeaderCell>
              <CTableHeaderCell>Qualification</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((tech, index) => (
                <CTableRow key={tech.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {tech.profilePicture ? (
                      <img
                        src={tech.profilePicture} // ✅ decode first
                        alt={tech.fullName}
                        width="40"
                        height="40"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/images/default-avatar.png"
                        alt="No profile"
                        width="40"
                        height="40"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                    )}
                  </CTableDataCell>

                  <CTableDataCell>{capitalizeWords(tech.fullName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.contactNumber)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.gender)}</CTableDataCell>
                  <CTableDataCell>{tech.qualification || 'NA'}</CTableDataCell>

                  <CTableDataCell>{tech.dateOfJoining}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('FrontDesk', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(tech)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('FrontDesk', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(tech)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('FrontDesk', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(tech.id) // store id
                            setIsModalVisible(true) // show confirmation modal
                          }}
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
                <CTableDataCell
                  colSpan="9"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No receptionist found.
                </CTableDataCell>
              </CTableRow>
              //   <CTableRow>
              //     <CTableDataCell colSpan={5} className="text-center text-muted">
              //       🔍 No receptionist found matching "<b>{searchQuery}</b>"
              //     </CTableDataCell>
              //   </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
      {displayData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
        // <div className="d-flex justify-content-end mt-3" style={{ marginRight: '40px' }}>
        //   {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, index) => (
        //     <CButton
        //       key={index}
        //       style={{
        //         backgroundColor: currentPage === index + 1 ? 'var(--color-black)' : '#fff',
        //         color: currentPage === index + 1 ? '#fff' : 'var(--color-black)',
        //         border: '1px solid #ccc',
        //         borderRadius: '5px',
        //         cursor: 'pointer',
        //       }}
        //       className="ms-2"
        //       onClick={() => setCurrentPage(index + 1)}
        //     >
        //       {index + 1}
        //     </CButton>
        //   ))}
        // </div>
      )}
      <FrontDeskForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedTech(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        receptionist={receptionist}
        fetchTechs={fetchTechs}
      />
    </div>
  )
}

export default FrontDeskManagement
