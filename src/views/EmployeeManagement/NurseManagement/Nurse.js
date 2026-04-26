import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { Edit2, Eye, Trash2, UserCog } from 'lucide-react'
import PhysioForm from './NurseForm'
import { getAllPhysios, addPhysio, updatePhysio, deletePhysio } from './NurseAPI'
import { useHospital } from '../../Usecontext/HospitalContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import Pagination from '../../../Utils/Pagination'  // ← same Pagination used in CustomerManagement


const PhysioManagement = () => {
  const [physios, setPhysios]                   = useState([])
  const [modalVisible, setModalVisible]         = useState(false)
  const [selectedPhysio, setSelectedPhysio]     = useState(null)
  const [viewMode, setViewMode]                 = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [physioToDelete, setPhysioToDelete]     = useState(null)
  const [isDeleting, setIsDeleting]             = useState(false)

  // ── Pagination state (mirrors CustomerManagement) ─────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const hospitalId = localStorage.getItem('HospitalId')
  const branchId   = localStorage.getItem('branchId')

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const fetchPhysios = async () => {
    try {
      const res = await getAllPhysios(hospitalId, branchId)
      setPhysios(Array.isArray(res.data?.data) ? res.data.data : [])
      setCurrentPage(1) // reset to first page on fresh fetch
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchPhysios() }, [])

  const handleSave = async (data) => {
    try {
      if (selectedPhysio) {
        await updatePhysio(selectedPhysio.therapistId, data)
        await fetchPhysios()
      } else {
        await addPhysio(data)
        await fetchPhysios()
      }
      setModalVisible(false)
      setSelectedPhysio(null)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      await deletePhysio(physioToDelete.therapistId)
      setDeleteModalVisible(false)
      setPhysioToDelete(null)
      fetchPhysios()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Pagination slice ───────────────────────────────────────────────────────
  const totalPages  = Math.ceil(physios.length / rowsPerPage)
  const displayData = physios.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <>
      {/* ── Page Header ── */}
      <div className="pm-page-header">
        <div className="pm-title-group">
          <div className="pm-page-icon">
            <UserCog size={20} />
          </div>
          <div>
            <h4 className="pm-page-title">Therapist Management</h4>
            <p className="pm-page-sub">
              {physios.length} therapist{physios.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {can('Therapist', 'create') && (
          <button
            className="pm-add-btn"
            onClick={() => { setSelectedPhysio(null); setViewMode(false); setModalVisible(true) }}
          >
            + Add Therapist
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="pm-table-wrapper">
        <CTable className="pm-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="pm-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="pm-th" style={{ width: 64 }}>Photo</CTableHeaderCell>
              <CTableHeaderCell className="pm-th">Name</CTableHeaderCell>
              <CTableHeaderCell className="pm-th">Contact</CTableHeaderCell>
              <CTableHeaderCell className="pm-th">Qualification</CTableHeaderCell>
              <CTableHeaderCell className="pm-th">Experience</CTableHeaderCell>
              <CTableHeaderCell className="pm-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {physios.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={7}>
                  <div className="pm-empty">
                    <UserCog size={40} className="pm-empty-icon" />
                    <p>No therapists found.</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              displayData.map((p, index) => (
                <CTableRow key={p.id} className="pm-tr">
                  {/* S.No respects pagination offset */}
                  <CTableDataCell className="pm-td pm-td-num">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </CTableDataCell>

                  <CTableDataCell className="pm-td">
                    <img
                      src={
                        p.documents?.profilePhoto
                          ? `data:image/jpeg;base64,${p.documents.profilePhoto}`
                          : '/assets/images/default-avatar.png'
                      }
                      alt={p.fullName}
                      width="36"
                      height="36"
                      style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #b5d4f4' }}
                    />
                  </CTableDataCell>

                  <CTableDataCell className="pm-td">
                    <span className="pm-name">{p.fullName}</span>
                  </CTableDataCell>

                  <CTableDataCell className="pm-td pm-muted">{p.contactNumber}</CTableDataCell>
                  <CTableDataCell className="pm-td pm-muted">{p.qualification}</CTableDataCell>
                  <CTableDataCell className="pm-td pm-muted">{p.yearsOfExperience} yrs</CTableDataCell>

                  <CTableDataCell className="pm-td">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {can('Therapist', 'read') && (
                        <button
                          className="pm-action-btn pm-view-btn"
                          title="View"
                          onClick={() => {
                            setSelectedPhysio(p)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {can('Therapist', 'update') && (
                        <button
                          className="pm-action-btn pm-edit-btn"
                          title="Edit"
                          onClick={() => {
                            setSelectedPhysio(p)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can('Therapist', 'delete') && (
                        <button
                          className="pm-action-btn pm-delete-btn"
                          title="Delete"
                          onClick={() => {
                            setPhysioToDelete(p)
                            setDeleteModalVisible(true)
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

      {/* ── Pagination (same component + same pattern as CustomerManagement) ── */}
      {physios.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setRowsPerPage(size); setCurrentPage(1) }}
        />
      )}

      {/* ── Form Modal ── */}
      <PhysioForm
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedPhysio(null); setViewMode(false) }}
        onSave={handleSave}
        initialData={selectedPhysio}
        viewMode={viewMode}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmationModal
        isVisible={deleteModalVisible}
        title="Delete Therapist"
        message={
          <>
            This therapist is assigned to sessions. Removing will affect treatment plans.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalVisible(false)
            setPhysioToDelete(null)
          }
        }}
      />

      {/* ── STYLES ── */}
      <style>{`
        .pm-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .pm-title-group { display: flex; align-items: center; gap: 12px; }
        .pm-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center;
          justify-content: center; color: #185fa5; flex-shrink: 0;
        }
        .pm-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .pm-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }
        .pm-add-btn {
          background: #185fa5; color: #fff; border: none; border-radius: 8px;
          padding: 8px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s; white-space: nowrap;
        }
        .pm-add-btn:hover { filter: brightness(0.9); }
        .pm-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 12px;
        }
        .pm-table { margin-bottom: 0 !important; font-size: 13px; }
        .pm-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .pm-tr { transition: background 0.12s; }
        .pm-tr:hover { background: #f0f5fb !important; }
        .pm-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .pm-td-num { color: #9ca3af; font-size: 12px; }
        .pm-muted  { color: #6b7280; }
        .pm-name   { font-weight: 600; font-size: 13px; color: #0c447c; }
        .pm-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border: none; border-radius: 7px;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .pm-action-btn:hover  { filter: brightness(0.88); transform: scale(1.07); }
        .pm-action-btn:active { transform: scale(0.95); }
        .pm-view-btn   { background: #e6f1fb; color: #185fa5; }
        .pm-edit-btn   { background: #eaf3de; color: #3b6d11; }
        .pm-delete-btn { background: #fcebeb; color: #a32d2d; }
        .pm-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .pm-empty-icon { color: #d0dce9; }
      `}</style>
    </>
  )
}

export default PhysioManagement