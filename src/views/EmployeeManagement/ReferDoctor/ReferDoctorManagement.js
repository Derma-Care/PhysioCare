import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import ReferDoctorForm from './ReferDoctorForm.js'
import { Edit2, Eye, Trash2, UserRoundPlus, PlusCircle } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords.js'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext.js'
import ConfirmationModal from '../../../components/ConfirmationModal.js'
import LoadingIndicator from '../../../Utils/loader.js'
import {
  addReferDoctor,
  deleteReferDoctor,
  getAllReferDoctors,
  updateReferDoctor,
} from './ReferDoctorAPI.js'
import { ToastContainer } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext.js'
import { showCustomToast } from '../../../Utils/Toaster.js'
import Pagination from '../../../Utils/Pagination.js'

const ReferDoctorManagement = () => {
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

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ── FETCH ────────────────────────────────────
  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      if (clinicID) {
        const res = await getAllReferDoctors(clinicID)
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching refer doctors:', err)
      setTechnicians([])
      setError('Failed to load refer doctors.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTechs() }, [])

  // ── SAVE ─────────────────────────────────────
  const handleSave = async (formData) => {
    try {
      if (selectedTech) {
        await updateReferDoctor(selectedTech.id, formData)
        showCustomToast('Refer Doctor updated successfully!', 'success')
      } else {
        await addReferDoctor(formData)
        showCustomToast('Refer Doctor added successfully!', 'success')
      }
      fetchTechs()
      setModalVisible(false)
    } catch (err) {
      console.error('API error:', err)
    }
  }

  // ── DELETE ───────────────────────────────────
  const handleDelete = async (id) => {
    try {
      setDelLoading(true)
      await deleteReferDoctor(id)
      setTechnicians((prev) => prev.filter((t) => t.id !== id))
      showCustomToast('Refer Doctor deleted successfully!', 'success')
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setIsModalVisible(false)
      setDelLoading(false)
    }
  }

  // ── FILTER + PAGINATE ─────────────────────────
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return technicians
    return technicians.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, technicians])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // ── ADDRESS FORMATTER ─────────────────────────
  const formatAddress = (addr) => {
    if (!addr) return '—'
    const parts = [
      addr.houseNo, addr.street, addr.landmark,
      addr.city, addr.state, addr.country,
      addr.postalCode ? `- ${addr.postalCode}` : '',
    ].filter(Boolean)
    return parts.join(', ') || '—'
  }

  if (loading) return <LoadingIndicator message="Loading Refer Doctors..." />

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ─────────────────────────── */}
      <div className="rd-page-header">
        <div className="rd-page-title-group">
          <div className="rd-page-icon">
            <UserRoundPlus size={20} />
          </div>
          <div>
            <h4 className="rd-page-title">Refer Doctor Management</h4>
            <p className="rd-page-sub">
              {filteredData.length} refer doctor{filteredData.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        {can('Refer Doctor', 'create') && (
          <button
            className="rd-add-btn"
            onClick={() => { setSelectedTech(null); setViewMode(false); setModalVisible(true) }}
          >
            <PlusCircle size={15} />
            Add Refer Doctor
          </button>
        )}
      </div>

      {/* ── TABLE ────────────────────────────────── */}
      {error ? (
        <div className="rd-empty">
          <UserRoundPlus size={40} className="rd-empty-icon" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="rd-table-wrapper">
          <CTable className="rd-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="rd-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="rd-th">Name</CTableHeaderCell>
                <CTableHeaderCell className="rd-th">Contact</CTableHeaderCell>
                <CTableHeaderCell className="rd-th">Address</CTableHeaderCell>
                <CTableHeaderCell className="rd-th">Clinic Name</CTableHeaderCell>
                <CTableHeaderCell className="rd-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {displayData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={6}>
                    <div className="rd-empty">
                      <UserRoundPlus size={40} className="rd-empty-icon" />
                      <p>
                        {searchQuery
                          ? `No refer doctors found matching "${searchQuery}"`
                          : 'No refer doctors found'}
                      </p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                displayData.map((tech, index) => (
                  <CTableRow key={tech.id} className="rd-tr">
                    <CTableDataCell className="rd-td rd-td-num">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </CTableDataCell>

                    <CTableDataCell className="rd-td">
                      <span className="rd-name">{capitalizeWords(tech.fullName)}</span>
                    </CTableDataCell>

                    <CTableDataCell className="rd-td rd-muted">
                      {tech.mobileNumber || '—'}
                    </CTableDataCell>

                    <CTableDataCell className="rd-td rd-muted rd-address">
                      {formatAddress(tech.address)}
                    </CTableDataCell>

                    <CTableDataCell className="rd-td">
                      {tech.currentHospitalName ? (
                        <span className="rd-clinic-badge">{tech.currentHospitalName}</span>
                      ) : '—'}
                    </CTableDataCell>

                    <CTableDataCell className="rd-td">
                      <div className="rd-actions">
                        {can('Refer Doctor', 'read') && (
                          <button
                            className="rd-action-btn view"
                            title="View"
                            onClick={() => { setSelectedTech(tech); setViewMode(true); setModalVisible(true) }}
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {can('Refer Doctor', 'update') && (
                          <button
                            className="rd-action-btn edit"
                            title="Edit"
                            onClick={() => { setSelectedTech(tech); setViewMode(false); setModalVisible(true) }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {can('Refer Doctor', 'delete') && (
                          <button
                            className="rd-action-btn del"
                            title="Delete"
                            onClick={() => { setDeleteId(tech.id); setIsModalVisible(true) }}
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

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="mt-3 mb-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        </div>
      )}

      {/* ── REFER DOCTOR FORM MODAL ──────────────── */}
      <ReferDoctorForm
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedTech(null); setViewMode(false) }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        technicians={technicians}
        fetchTechs={fetchTechs}
      />

      {/* ── DELETE CONFIRMATION ──────────────────── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Refer Doctor"
        message="Are you sure you want to delete this Refer Doctor? This action cannot be undone."
        isLoading={delloading}
        confirmText={
          delloading ? (
            <><span className="spinner-border spinner-border-sm me-2 text-white" />Deleting...</>
          ) : 'Yes, Delete'
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* ── STYLES ──────────────────────────────── */}
      <style>{`
        /* Page Header */
        .rd-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .rd-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rd-page-icon {
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
        .rd-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .rd-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .rd-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .rd-add-btn:hover  { background: #0c447c; }
        .rd-add-btn:active { transform: scale(0.97); }

        /* Table */
        .rd-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .rd-table { margin-bottom: 0 !important; font-size: 13px; }
        .rd-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }
        .rd-tr { transition: background 0.12s; }
        .rd-tr:hover { background: #f0f5fb !important; }
        .rd-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .rd-td-num { color: #9ca3af; font-size: 12px; }
        .rd-muted   { color: #6b7280; }
        .rd-address { font-size: 12px; max-width: 260px; }

        /* Name */
        .rd-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }

        /* Clinic badge */
        .rd-clinic-badge {
          background: #eaf3de;
          color: #3b6d11;
          border: 0.5px solid #c0dd97;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          white-space: nowrap;
        }

        /* Actions */
        .rd-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .rd-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          flex-shrink: 0;
        }
        .rd-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .rd-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .rd-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .rd-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .rd-action-btn:active { transform: scale(0.94); }

        /* Empty state */
        .rd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .rd-empty-icon { color: #d0dce9; }
      `}</style>
    </>
  )
}

export default ReferDoctorManagement