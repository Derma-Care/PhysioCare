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
import AdminForm from './AdminForm'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addAdmin, getAllAdmins, UpdateAdmin, DeleteAdmin } from './AdminAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const AdminManagement = () => {
  const [admins, setAdmins] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [pageSize, setPageSize] = useState(5)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Load from localStorage on mount
  const [modalData, setModalData] = useState(null) // store username & password
  const [modalTVisible, setModalTVisible] = useState(false)
  const clinicID = localStorage.getItem('HospitalId')
  const branchID=localStorage.getItem('branchId')
  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      const branchID = localStorage.getItem('branchId')
      if (clinicID,branchID) {
        const res = await getAllAdmins(clinicID,branchID) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setAdmins(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching oratorys:', err)
      setAdmins([])
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchAdmins()
  }, [])

const handleSave = async (formData) => {
  try {
    setLoading(true)
    let res

    if (selectedAdmin && selectedAdmin.adminId) {
      // UPDATE existing admin
      res = await UpdateAdmin(clinicID, selectedAdmin.adminId, formData)

      if (res.status === 200 && res.data?.success) {
        showCustomToast('Admin updated successfully!', 'success')
        await fetchAdmins()
        setModalVisible(false)
      } else {
        showCustomToast(res.data?.message || 'Failed to update admin.', 'error')
      }
    } else {
      // ADD new admin
      res = await addAdmin(formData)

      if (res.status === 201 || (res.status === 200 && res.data?.success)) {
        await fetchAdmins()

        // Show credentials only for new admin
        setModalData({
          username: res.data.data?.userName,
          password: res.data.data?.password,
        })
        setModalTVisible(true)

        showCustomToast('Admin added successfully!', 'success')
        setModalVisible(false)
      } else {
        showCustomToast(res.data?.message || 'Failed to add admin.', 'error')
      }
    }
  } catch (err) {
    const backendMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to save admin.'
    showCustomToast(backendMessage, 'error')
    console.error('API error:', err)
  } finally {
    setLoading(false)
  }
}

  // Delete
  const handleDelete = async (clinicID, adminId) => {
    try {
      setDelLoading(true)
      await DeleteAdmin(clinicID, adminId) // call backend
      setAdmins((prev) => prev.filter((t) => t.adminId !== adminId))
      showCustomToast('Admin deleted successfully!', 'success')
    } catch (err) {
      // showCustomToast('Failed to delete admin.', 'error')
      console.error('Delete error:', err)
    } finally {
      setDelLoading(false)
      setIsModalVisible(false) // close modal after action
    }
    // setDelLoading(false)
  }
  //permission
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  //search
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return admins
    return admins.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, admins])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  //decode image
  const decodeImage = (data) => {
    try {
      // First decode the outer layer (the backend double-encoded it)
      const decoded = atob(data)
      // Now decoded string itself already includes 'data:image/jpeg;base64,...'
      return decoded
    } catch (e) {
      console.error('Error decoding image:', e)
      return '/assets/images/avatars/oratory.png'
    }
  }

  return (
    <div>
      {can('Administrator', 'create') && (
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
            Add Admin
          </CButton>
        </div>
      )}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Admin Credentials</h5>
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
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(clinicID,deleteId)} // ✅ pass id here
        onCancel={() => setIsModalVisible(false)} //  just close modal
      />

      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading admin..." />
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
              <CTableHeaderCell>Email Id</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((admin, index) => (
                <CTableRow key={admin.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {admin.profilePicture ? (
                      <img
                        src={admin.profilePicture} //  use directly, no decodeImage()
                        alt={admin.fullName}
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

                  <CTableDataCell>{capitalizeWords(admin.fullName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(admin.contactNumber)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(admin.gender)}</CTableDataCell>
                  <CTableDataCell>{admin.emailId || 'NA'}</CTableDataCell>

                  <CTableDataCell>{admin.dateOfJoining}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Administrator', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Administrator', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Administrator', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(admin.adminId) // store id
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
                  No Admin found.
                </CTableDataCell>
              </CTableRow>
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
      <AdminForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedAdmin(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedAdmin}
        viewMode={viewMode}
        admins={admins}
        fetchAdmins={fetchAdmins}
      />
    </div>
  )
}

export default AdminManagement
