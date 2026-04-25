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

import { Edit2, Eye, Trash2, MonitorCheck, AlertTriangle } from 'lucide-react'
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
        const res = await getAllFrontDeskAPI(clinicID, branchId)
        setReceptionist(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching lab receptionist:', err)
      setReceptionist([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechs()
  }, [])

  const handleSave = async (formData) => {
    try {
      let res
      if (selectedTech) {
        res = await updateFrontDeskAPI(selectedTech.id, formData)
        fetchTechs()
      } else {
        res = await addFrontDeskAPI(formData)
      }

      if (res.data?.statusCode === 201 || (res.data?.statusCode === 200 && res.data?.success)) {
        await fetchTechs()
        if (!selectedTech) {
          setModalData({
            username: res.data.data?.userName,
            password: res.data.data?.password,
          })
          setModalTVisible(true)
        }
        showCustomToast('Receptionist added successfully!', 'success')
        setModalVisible(false)
        return res
      }

      showCustomToast(res.data?.message || 'Failed to save receptionist.', 'error')
      return res
    } catch (err) {
      console.error('API error:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDelLoading(true)
      await deleteFrontDeskAPI(id)
      setReceptionist((prev) => prev.filter((t) => t.id !== id))
      showCustomToast('Receptionist deleted successfully!', 'success')
    } catch (err) {
      showCustomToast('❌ Failed to delete receptionist.', 'error')
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
    if (!q) return receptionist
    return receptionist.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, receptionist])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <>
      {/* ── Page Header ── */}
      <div className="fd-page-header">
        <div className="fd-title-group">
          <div className="fd-page-icon">
            <MonitorCheck size={20} />
          </div>
          <div>
            <h4 className="fd-page-title">Front Desk Management</h4>
            <p className="fd-page-sub">
              {receptionist.length} receptionist{receptionist.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {can('FrontDesk', 'create') && (
          <button className="fd-add-btn" onClick={() => setModalVisible(true)}>
            + Add Receptionist
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
            <MonitorCheck size={18} color="#185fa5" />
            Receptionist Credentials
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
            className="fd-modal-primary"
            onClick={() => {
              setModalTVisible(false)
              setModalData(null)
            }}
          >
            Close
          </button>
        </CModalFooter>
      </CModal>

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Receptionist"
        message="Are you sure you want to delete this receptionist? This action cannot be undone."
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
          <LoadingIndicator message="Loading receptionists..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '50vh', color: 'var(--color-black)' }}
        >
          {error}
        </div>
      ) : (
        <div className="fd-table-wrapper">
          <CTable className="fd-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="fd-th" style={{ width: 56 }}>
                  S.No
                </CTableHeaderCell>
                <CTableHeaderCell className="fd-th" style={{ width: 64 }}>
                  Photo
                </CTableHeaderCell>
                <CTableHeaderCell className="fd-th">Name</CTableHeaderCell>
                <CTableHeaderCell className="fd-th">Contact</CTableHeaderCell>
                <CTableHeaderCell className="fd-th">Sex</CTableHeaderCell>
                <CTableHeaderCell className="fd-th">Qualification</CTableHeaderCell>
                <CTableHeaderCell className="fd-th">Date Of Joining</CTableHeaderCell>
                <CTableHeaderCell className="fd-th" style={{ width: 120 }}>
                  Actions
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {displayData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={8}>
                    <div className="fd-empty">
                      <MonitorCheck size={40} className="fd-empty-icon" />
                      <p>No receptionist found.</p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                displayData.map((tech, index) => (
                  <CTableRow key={tech.id} className="fd-tr">
                    <CTableDataCell className="fd-td fd-td-num">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </CTableDataCell>

                    <CTableDataCell className="fd-td">
                      <img
                        src={tech.profilePicture || '/assets/images/default-avatar.png'}
                        alt={tech.fullName}
                        width="36"
                        height="36"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #b5d4f4',
                        }}
                      />
                    </CTableDataCell>

                    <CTableDataCell className="fd-td">
                      <span className="fd-name">{capitalizeWords(tech.fullName)}</span>
                    </CTableDataCell>

                    <CTableDataCell className="fd-td fd-muted">
                      {tech.contactNumber}
                    </CTableDataCell>

                    <CTableDataCell className="fd-td fd-muted">
                      {capitalizeWords(tech.gender)}
                    </CTableDataCell>

                    <CTableDataCell className="fd-td fd-muted">
                      {tech.qualification || 'NA'}
                    </CTableDataCell>

                    <CTableDataCell className="fd-td fd-muted">
                      {tech.dateOfJoining}
                    </CTableDataCell>

                    <CTableDataCell className="fd-td">
                      <div style={{ display: 'flex', gap: 6 }}>
                        {can('FrontDesk', 'read') && (
                          <button
                            className="fd-action-btn fd-view-btn"
                            title="View"
                            onClick={() => {
                              setSelectedTech(tech)
                              setViewMode(true)
                              setModalVisible(true)
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {can('FrontDesk', 'update') && (
                          <button
                            className="fd-action-btn fd-edit-btn"
                            title="Edit"
                            onClick={() => {
                              setSelectedTech(tech)
                              setViewMode(false)
                              setModalVisible(true)
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {can('FrontDesk', 'delete') && (
                          <button
                            className="fd-action-btn fd-delete-btn"
                            title="Delete"
                            onClick={() => {
                              setDeleteId(tech.id)
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
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
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

      {/* ── STYLES ── */}
      <style>{`
        /* Page Header */
        .fd-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .fd-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .fd-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .fd-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .fd-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* Add button */
        .fd-add-btn {
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.15s;
          white-space: nowrap;
        }
        .fd-add-btn:hover { filter: brightness(0.9); }

        /* Table wrapper */
        .fd-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .fd-table { margin-bottom: 0 !important; font-size: 13px; }

        /* Table header */
        .fd-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }

        /* Table rows */
        .fd-tr { transition: background 0.12s; }
        .fd-tr:hover { background: #f0f5fb !important; }
        .fd-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .fd-td-num { color: #9ca3af; font-size: 12px; }
        .fd-muted { color: #6b7280; }

        /* Name */
        .fd-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }

        /* Action buttons */
        .fd-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          flex-shrink: 0;
        }
        .fd-action-btn:hover  { filter: brightness(0.88); transform: scale(1.07); }
        .fd-action-btn:active { transform: scale(0.95); }

        .fd-view-btn   { background: #e6f1fb; color: #185fa5; }
        .fd-edit-btn   { background: #eaf3de; color: #3b6d11; }
        .fd-delete-btn { background: #fcebeb; color: #a32d2d; }

        /* Empty state */
        .fd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .fd-empty-icon { color: #d0dce9; }

        /* Modal buttons */
        .fd-modal-cancel {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fd-modal-cancel:hover { background: #f3f4f6; }

        .fd-modal-primary {
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.15s;
        }
        .fd-modal-primary:hover { filter: brightness(0.9); }
      `}</style>
    </>
  )
}

export default FrontDeskManagement