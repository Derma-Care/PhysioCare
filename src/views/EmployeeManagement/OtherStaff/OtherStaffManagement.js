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
import OtherStaffForm from './OtherStaffForm'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import {
  addOtherStaff,
  deleteOtherStaff,
  getAllOtherStaffs,
  updateOtherStaff,
} from './OtherStaffAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const OtherStaffManagement = () => {
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
        const res = await getAllOtherStaffs(clinicID, branchId) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching Other Staff:', err)
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

  const handleSave = async (formData) => {
    try {
      if (selectedTech) {
        const res = await updateOtherStaff(selectedTech.wardBoyId, formData)
        await fetchTechs()
        showCustomToast('Other Staff updated successfully!', 'success')
        return { status: 200, data: { success: true } } // simulate success for update
      } else {
        const res = await addOtherStaff(formData)
        if (res.status === 201 || (res.status === 200 && res.data?.success)) {
          await fetchTechs()
          showCustomToast('Other Staff added successfully!', 'success')
           setModalVisible(false)
        }
        return res
      }
    } catch (err) {
      if (err.response?.status === 409) {
        showCustomToast(err.response?.message || 'Conflict: Staff already exists!', 'error')
        // showCustomToast('Conflict: Staff already exists!', 'error')
        setModalVisible(true) // keep modal open
      } else {
        console.error('API error:', err)
        showCustomToast('Failed to save Other Staff.', 'error')
      }
    }
  }

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
            setDelLoading(true)
      await deleteOtherStaff(id) // ✅ call backend
      setTechnicians((prev) => prev.filter((t) => t.id !== id))
      showCustomToast('Other Staff deleted successfully!', 'success')
      fetchTechs()
    } catch (err) {
      // showCustomToast('❌ Failed to delete Other Staff.', 'error')
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
      {can('OtherStaff', 'create') && (
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
            Add Other Staff
          </CButton>
        </div>
      )}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>OtherStaff Credentials</h5>
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
        title="Delete Other Staff"
        message="Are you sure you want to delete this Other staff? This action cannot be undone."
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
          <LoadingIndicator message="Loading Other Staff..." />
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
              <CTableHeaderCell>Department</CTableHeaderCell>
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
                  <CTableDataCell>{tech.department || 'NA'}</CTableDataCell>

                  <CTableDataCell>{tech.dateOfJoining}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('OtherStaff', 'read') && (
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
                      {can('OtherStaff', 'update') && (
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
                      {can('OtherStaff', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(tech.wardBoyId) // store id
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
                  No Staff found.
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
      {displayData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}
      <OtherStaffForm
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

export default OtherStaffManagement
