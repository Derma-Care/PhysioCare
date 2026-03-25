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
import SecurityForm from './SecurityForm'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addSecurity, deleteSecurity, getAllSecuritys, updateSecurity } from './SecurityAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const SecurityManagement = () => {
  const [technicians, setTechnicians] = useState([])
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

  // ✅ Load from localStorage on mount
  const [modalData, setModalData] = useState(null) // store username & password
  const [modalTVisible, setModalTVisible] = useState(false)
  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      if (clinicID) {
        const res = await getAllSecuritys(clinicID, branchId) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching lab technicians:', err)
      setTechnicians([])
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTechs()
  }, [])
  // ✅ Save (Add / Edit)

  // const handleSave = async (formData) => {
  //   try {
  //     if (selectedTech) {
  //       await updateSecurity(selectedTech.securityStaffId, formData)
  //       fetchTechs()

  //       // setTechnicians((prev) => [...prev, res.data.data])
  //       showCustomToast('Security updated successfully!', 'success')
  //     } else {
  //       const res = await addSecurity(formData)
  //       await fetchTechs() // refresh from API
  //       console.log(res)
  //       // setModalData({
  //       //   username: res.data.data.userName,
  //       //   password: res.data.data.password,
  //       // })
  //       setModalVisible(false)
  //       // setModalTVisible(true)
  //       showCustomToast('Security added successfully!', 'success')
  //       return res
  //     }
  //   } catch (err) {
  //     // toast.error('❌ Failed to save security.')
  //     console.error('API error:', err)
  //   }
  // }

  const handleSave = async (formData) => {
    try {
      if (selectedTech) {
        await updateSecurity(selectedTech.securityStaffId, formData)
        fetchTechs()
        showCustomToast('Security updated successfully!', 'success')
        return { status: 200, data: { success: true } } // simulate success for update
      } else {
        const res = await addSecurity(formData)
        if (res.status === 201 || (res.status === 200 && res.data?.success)) {
          await fetchTechs()
          showCustomToast('Security added successfully!', 'success')
          setModalVisible(false)
        }
        return res
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // showCustomToast('Conflict: Staff already exists!', 'error')
        setModalVisible(true) // keep modal open
      } else {
        console.error('API error:', err)
        // showCustomToast('Failed to save Other Staff.', 'error')
      }
    }
  }

  // ✅ Delete
  const handleDelete = async (id) => {
    console.log(id)
    try {
       setDelLoading(true)
      await deleteSecurity(id) // ✅ call backend
      setTechnicians((prev) => prev.filter((t) => t.securityStaffId !== id))
      showCustomToast('Security deleted successfully!', 'success')
    } catch (err) {
      // showCustomToast('❌ Failed to delete security.', 'error')
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
    if (!q) return technicians
    return technicians.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, technicians])

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
      {can('Security', 'create') && (
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
            Add Security
          </CButton>
        </div>
      )}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Security Credentials</h5>
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
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Security"
        message="Are you sure you want to delete this Security? This action cannot be undone."
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
          <LoadingIndicator message="Loading security..." />
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
              {/* <CTableHeaderCell>Specialization</CTableHeaderCell> */}
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
                  {/* <CTableDataCell>{tech.specialization || 'NA'}</CTableDataCell> */}

                  <CTableDataCell>{tech.dateOfJoining}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Security', 'read') && (
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
                      {can('Security', 'update') && (
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
                      {can('Security', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            console.log(tech.securityStaffId)
                            setDeleteId(tech.securityStaffId) // store id
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
                  No Security found.
                </CTableDataCell>
              </CTableRow>
              //   <CTableRow>
              //     <CTableDataCell colSpan={5} className="text-center text-muted">
              //       🔍 No technician found matching "<b>{searchQuery}</b>"
              //     </CTableDataCell>
              //   </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
      <div className="mb-3">
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

      <SecurityForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedTech(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        technicians={technicians}
        fetchTechs={fetchTechs}
      />
    </div>
  )
}

export default SecurityManagement
