import React, { useEffect, useState } from 'react'
import {
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
import SecurityForm from './SecurityForm'
import { Edit2, Eye, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addSecurity, deleteSecurity, getAllSecuritys, updateSecurity } from './SecurityAPI'
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
  const { searchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [modalTVisible, setModalTVisible] = useState(false)

  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      if (clinicID) {
        const res = await getAllSecuritys(clinicID, branchId)
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching security staff:', err)
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTechs() }, [])

  const handleSave = async (formData) => {
    try {
      if (selectedTech) {
        await updateSecurity(selectedTech.securityStaffId, formData)
        fetchTechs()
        showCustomToast('Security updated successfully!', 'success')
        return { status: 200, data: { success: true } }
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
        setModalVisible(true)
      } else {
        console.error('API error:', err)
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      setDelLoading(true)
      await deleteSecurity(id)
      setTechnicians((prev) => prev.filter((t) => t.securityStaffId !== id))
      showCustomToast('Security deleted successfully!', 'success')
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setIsModalVisible(false)
      setDelLoading(false)
    }
  }

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return technicians
    return technicians.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, technicians])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <>
      {/* ── Page Header ── */}
      <div className="sec-page-header">
        <div className="sec-title-group">
          <div className="sec-page-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="sec-page-title">Security Management</h4>
            <p className="sec-page-sub">
              {technicians.length} security staff{technicians.length !== 1 ? '' : ''} registered
            </p>
          </div>
        </div>

        {can('Security', 'create') && (
          <button className="sec-add-btn" onClick={() => setModalVisible(true)}>
            + Add Security
          </button>
        )}
      </div>

      {/* ── Credentials Modal ── */}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false} alignment="center">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="#185fa5" />
            Security Credentials
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: '20px', fontSize: 13, color: '#374151' }}>
          {modalData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#f0f5fb', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
                <span style={{ color: '#6b7280', minWidth: 80 }}>Username:</span>
                <strong style={{ color: '#0c447c' }}>{modalData.username}</strong>
              </div>
              <div style={{ background: '#f0f5fb', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
                <span style={{ color: '#6b7280', minWidth: 80 }}>Password:</span>
                <strong style={{ color: '#0c447c' }}>{modalData.password}</strong>
              </div>
              <p style={{ marginTop: 6, fontSize: 12, color: '#e24b4a', display: 'flex', alignItems: 'center', gap: 6 }}>
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
            className="sec-modal-primary"
            onClick={() => { setModalTVisible(false); setModalData(null) }}
          >
            Close
          </button>
        </CModalFooter>
      </CModal>

      {/* ── Delete Confirmation ── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Security"
        message="Are you sure you want to delete this security staff? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* ── Table ── */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <LoadingIndicator message="Loading security staff..." />
        </div>
      ) : error ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh', color: 'var(--color-black)' }}>
          {error}
        </div>
      ) : (
        <div className="sec-table-wrapper">
          <CTable className="sec-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="sec-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="sec-th" style={{ width: 64 }}>Photo</CTableHeaderCell>
                <CTableHeaderCell className="sec-th">Name</CTableHeaderCell>
                <CTableHeaderCell className="sec-th">Contact</CTableHeaderCell>
                <CTableHeaderCell className="sec-th">Sex</CTableHeaderCell>
                <CTableHeaderCell className="sec-th">Date Of Joining</CTableHeaderCell>
                <CTableHeaderCell className="sec-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {displayData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={7}>
                    <div className="sec-empty">
                      <ShieldCheck size={40} className="sec-empty-icon" />
                      <p>No security staff found.</p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                displayData.map((tech, index) => (
                  <CTableRow key={tech.securityStaffId || tech.id} className="sec-tr">
                    <CTableDataCell className="sec-td sec-td-num">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </CTableDataCell>

                    <CTableDataCell className="sec-td">
                      <img
                        src={tech.profilePicture || '/assets/images/default-avatar.png'}
                        alt={tech.fullName}
                        width="36"
                        height="36"
                        style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #b5d4f4' }}
                      />
                    </CTableDataCell>

                    <CTableDataCell className="sec-td">
                      <span className="sec-name">{capitalizeWords(tech.fullName)}</span>
                    </CTableDataCell>

                    <CTableDataCell className="sec-td sec-muted">{tech.contactNumber}</CTableDataCell>
                    <CTableDataCell className="sec-td sec-muted">{capitalizeWords(tech.gender)}</CTableDataCell>
                    <CTableDataCell className="sec-td sec-muted">{tech.dateOfJoining}</CTableDataCell>

                    <CTableDataCell className="sec-td">
                      <div style={{ display: 'flex', gap: 6 }}>
                        {can('Security', 'read') && (
                          <button
                            className="sec-action-btn sec-view-btn"
                            title="View"
                            onClick={() => { setSelectedTech(tech); setViewMode(true); setModalVisible(true) }}
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {can('Security', 'update') && (
                          <button
                            className="sec-action-btn sec-edit-btn"
                            title="Edit"
                            onClick={() => { setSelectedTech(tech); setViewMode(false); setModalVisible(true) }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {can('Security', 'delete') && (
                          <button
                            className="sec-action-btn sec-delete-btn"
                            title="Delete"
                            onClick={() => { setDeleteId(tech.securityStaffId); setIsModalVisible(true) }}
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

      <SecurityForm
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedTech(null); setViewMode(false) }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        technicians={technicians}
        fetchTechs={fetchTechs}
      />

      {/* ── STYLES ── */}
      <style>{`
        .sec-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .sec-title-group { display: flex; align-items: center; gap: 12px; }
        .sec-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center;
          justify-content: center; color: #185fa5; flex-shrink: 0;
        }
        .sec-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .sec-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        .sec-add-btn {
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 8px 18px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: filter 0.15s; white-space: nowrap;
        }
        .sec-add-btn:hover { filter: brightness(0.9); }

        .sec-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 12px;
        }
        .sec-table { margin-bottom: 0 !important; font-size: 13px; }

        .sec-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }

        .sec-tr { transition: background 0.12s; }
        .sec-tr:hover { background: #f0f5fb !important; }
        .sec-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .sec-td-num { color: #9ca3af; font-size: 12px; }
        .sec-muted  { color: #6b7280; }
        .sec-name   { font-weight: 600; font-size: 13px; color: #0c447c; }

        .sec-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border: none; border-radius: 7px;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .sec-action-btn:hover  { filter: brightness(0.88); transform: scale(1.07); }
        .sec-action-btn:active { transform: scale(0.95); }
        .sec-view-btn   { background: #e6f1fb; color: #185fa5; }
        .sec-edit-btn   { background: #eaf3de; color: #3b6d11; }
        .sec-delete-btn { background: #fcebeb; color: #a32d2d; }

        .sec-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .sec-empty-icon { color: #d0dce9; }

        .sec-modal-primary {
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 18px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: filter 0.15s;
        }
        .sec-modal-primary:hover { filter: brightness(0.9); }
      `}</style>
    </>
  )
}

export default SecurityManagement