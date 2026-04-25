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
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import AdminForm from './AdminForm'
import { Edit2, Eye, Trash2, UserCog, AlertTriangle } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addAdmin, getAllAdmins, UpdateAdmin, DeleteAdmin } from './AdminAPI'
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
  const { searchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [modalTVisible, setModalTVisible] = useState(false)

  const clinicID = localStorage.getItem('HospitalId')
  const branchID = localStorage.getItem('branchId')

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      if (clinicID && branchID) {
        const res = await getAllAdmins(clinicID, branchID)
        setAdmins(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching admins:', err)
      setAdmins([])
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
        res = await UpdateAdmin(clinicID, selectedAdmin.adminId, formData)
        if (res.status === 200 && res.data?.success) {
          showCustomToast('Admin updated successfully!', 'success')
          await fetchAdmins()
          setModalVisible(false)
        } else {
          showCustomToast(res.data?.message || 'Failed to update admin.', 'error')
        }
      } else {
        res = await addAdmin(formData)
        if (res.status === 201 || (res.status === 200 && res.data?.success)) {
          await fetchAdmins()
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
        err.response?.data?.message || err.response?.data?.error || 'Failed to save admin.'
      showCustomToast(backendMessage, 'error')
      console.error('API error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clinicID, adminId) => {
    try {
      setDelLoading(true)
      await DeleteAdmin(clinicID, adminId)
      setAdmins((prev) => prev.filter((t) => t.adminId !== adminId))
      showCustomToast('Admin deleted successfully!', 'success')
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return admins
    return admins.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, admins])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <>
      {/* ── Page Header ── */}
      <div className="adm-page-header">
        <div className="adm-title-group">
          <div className="adm-page-icon">
            <UserCog size={20} />
          </div>
          <div>
            <h4 className="adm-page-title">Admin Management</h4>
            <p className="adm-page-sub">
              {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {can('Administrator', 'create') && (
          <button className="adm-add-btn" onClick={() => setModalVisible(true)}>
            + Add Admin
          </button>
        )}
      </div>

      {/* ── Credentials Modal ── */}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false} alignment="center">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#0c447c',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <UserCog size={18} color="#185fa5" />
            Admin Credentials
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: '20px', fontSize: 13, color: '#374151' }}>
          {modalData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  background: '#f0f5fb',
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <span style={{ color: '#6b7280', minWidth: 80 }}>Username:</span>
                <strong style={{ color: '#0c447c' }}>{modalData.username}</strong>
              </div>
              <div
                style={{
                  background: '#f0f5fb',
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <span style={{ color: '#6b7280', minWidth: 80 }}>Password:</span>
                <strong style={{ color: '#0c447c' }}>{modalData.password}</strong>
              </div>
              <p
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: '#e24b4a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <AlertTriangle size={13} />
                Please save these credentials securely. They will not be shown again.
              </p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </CModalBody>
        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px' }}>
          <button
            className="adm-modal-primary"
            onClick={() => {
              setModalTVisible(false)
              setModalData(null)
            }}
          >
            Close
          </button>
        </CModalFooter>
      </CModal>

      {/* ── Delete Confirmation ── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(clinicID, deleteId)}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* ── Table ── */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <LoadingIndicator message="Loading admins..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '50vh', color: 'var(--color-black)' }}
        >
          {error}
        </div>
      ) : (
        <div className="adm-table-wrapper">
          <CTable className="adm-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="adm-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="adm-th" style={{ width: 64 }}>Photo</CTableHeaderCell>
                <CTableHeaderCell className="adm-th">Name</CTableHeaderCell>
                <CTableHeaderCell className="adm-th">Contact</CTableHeaderCell>
                <CTableHeaderCell className="adm-th">Sex</CTableHeaderCell>
                <CTableHeaderCell className="adm-th">Email Id</CTableHeaderCell>
                <CTableHeaderCell className="adm-th">Date Of Joining</CTableHeaderCell>
                <CTableHeaderCell className="adm-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {displayData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={8}>
                    <div className="adm-empty">
                      <UserCog size={40} className="adm-empty-icon" />
                      <p>No admin found.</p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                displayData.map((admin, index) => (
                  <CTableRow key={admin.adminId || admin.id} className="adm-tr">
                    <CTableDataCell className="adm-td adm-td-num">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </CTableDataCell>

                    <CTableDataCell className="adm-td">
                      <img
                        src={admin.profilePicture || '/assets/images/default-avatar.png'}
                        alt={admin.fullName}
                        width="36"
                        height="36"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #b5d4f4',
                        }}
                      />
                    </CTableDataCell>

                    <CTableDataCell className="adm-td">
                      <span className="adm-name">{capitalizeWords(admin.fullName)}</span>
                    </CTableDataCell>

                    <CTableDataCell className="adm-td adm-muted">{admin.contactNumber}</CTableDataCell>
                    <CTableDataCell className="adm-td adm-muted">{capitalizeWords(admin.gender)}</CTableDataCell>
                    <CTableDataCell className="adm-td adm-muted">{admin.emailId || 'NA'}</CTableDataCell>
                    <CTableDataCell className="adm-td adm-muted">{admin.dateOfJoining}</CTableDataCell>

                    <CTableDataCell className="adm-td">
                      <div style={{ display: 'flex', gap: 6 }}>
                        {can('Administrator', 'read') && (
                          <button
                            className="adm-action-btn adm-view-btn"
                            title="View"
                            onClick={() => {
                              setSelectedAdmin(admin)
                              setViewMode(true)
                              setModalVisible(true)
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {can('Administrator', 'update') && (
                          <button
                            className="adm-action-btn adm-edit-btn"
                            title="Edit"
                            onClick={() => {
                              setSelectedAdmin(admin)
                              setViewMode(false)
                              setModalVisible(true)
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {can('Administrator', 'delete') && (
                          <button
                            className="adm-action-btn adm-delete-btn"
                            title="Delete"
                            onClick={() => {
                              setDeleteId(admin.adminId)
                              setIsModalVisible(true)
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </div>
      )}

      {displayData.length > 0 && (
        <div className="mb-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        </div>
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

      {/* ── STYLES ── */}
      <style>{`
        .adm-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .adm-title-group { display: flex; align-items: center; gap: 12px; }
        .adm-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center;
          justify-content: center; color: #185fa5; flex-shrink: 0;
        }
        .adm-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .adm-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        .adm-add-btn {
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 8px 18px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: filter 0.15s; white-space: nowrap;
        }
        .adm-add-btn:hover { filter: brightness(0.9); }

        .adm-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 12px;
        }
        .adm-table { margin-bottom: 0 !important; font-size: 13px; }

        .adm-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }

        .adm-tr { transition: background 0.12s; }
        .adm-tr:hover { background: #f0f5fb !important; }
        .adm-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .adm-td-num { color: #9ca3af; font-size: 12px; }
        .adm-muted  { color: #6b7280; }
        .adm-name   { font-weight: 600; font-size: 13px; color: #0c447c; }

        .adm-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border: none; border-radius: 7px;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .adm-action-btn:hover  { filter: brightness(0.88); transform: scale(1.07); }
        .adm-action-btn:active { transform: scale(0.95); }
        .adm-view-btn   { background: #e6f1fb; color: #185fa5; }
        .adm-edit-btn   { background: #eaf3de; color: #3b6d11; }
        .adm-delete-btn { background: #fcebeb; color: #a32d2d; }

        .adm-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .adm-empty-icon { color: #d0dce9; }

        .adm-modal-primary {
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 18px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: filter 0.15s;
        }
        .adm-modal-primary:hover { filter: brightness(0.9); }
      `}</style>
    </>
  )
}

export default AdminManagement