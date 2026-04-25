import React, { useEffect, useState } from 'react'
import {
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormText,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
} from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  deleteTestData,
  postTestData,
  TestData,
  TestDataById,
  updateTestData,
} from './TestsManagementAPI'
import { Edit2, Eye, FlaskConical, PlusCircle, Trash2 } from 'lucide-react'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import LoadingIndicator from '../../Utils/loader'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

const emptyTest = { testName: '', description: '', purpose: '' }

const TestsManagement = () => {
  const [test, setTest] = useState([])
  const [loading, setLoading] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [error, setError] = useState(null)

  // Add modal
  const [addModal, setAddModal] = useState(false)
  const [newTest, setNewTest] = useState(emptyTest)

  // Edit modal
  const [editModal, setEditModal] = useState(false)
  const [testToEdit, setTestToEdit] = useState(null)

  // View modal
  const [viewTest, setViewTest] = useState(null)

  const [errors, setErrors] = useState({})

  // Delete
  const [isDeleteVisible, setIsDeleteVisible] = useState(false)
  const [testIdToDelete, setTestIdToDelete] = useState(null)
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)
  const [delloading, setDelLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { searchQuery } = useGlobalSearch()
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const hospitalId = localStorage.getItem('HospitalId')

  const nameRegex = /^[A-Za-z0-9\s.\-()\/']+$/

  // ── FETCH ─────────────────────────────────────
  const normalizeTests = (data) => data.map((item) => ({ ...item, id: item.id || item._id }))

  const fetchDataById = async (hId) => {
    setLoading(true)
    try {
      const response = await TestDataById(hId)
      setTest(normalizeTests(response.data))
    } catch {
      setError('Failed to fetch test data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDataById(hospitalId) }, [hospitalId])

  // ── FILTER + PAGINATE ─────────────────────────
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return test
    return test.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, test])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // ── ADD ───────────────────────────────────────
  const handleAddTest = async () => {
    if (!newTest.testName.trim()) {
      setErrors({ testName: 'Test name is required.' })
      return
    }
    if (!nameRegex.test(newTest.testName.trim())) {
      setErrors({ testName: "Only alphabets, numbers, spaces, and .-()/'' are allowed." })
      return
    }
    const duplicate = test.some(
      (t) => t.testName.trim().toLowerCase() === newTest.testName.trim().toLowerCase(),
    )
    if (duplicate) {
      showCustomToast(`"${newTest.testName}" already exists!`, 'error', { position: 'top-right' })
      setAddModal(false)
      return
    }
    try {
      setSaveLoading(true)
      await postTestData({ testName: newTest.testName, hospitalId, description: newTest.description, purpose: newTest.purpose })
      showCustomToast('Test added successfully!', 'success')
      fetchDataById(hospitalId)
      setAddModal(false)
      setNewTest(emptyTest)
      setErrors({})
    } catch {
      showCustomToast('Error adding test.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── UPDATE ────────────────────────────────────
  const handleUpdateTest = async () => {
    if (!testToEdit?.testName?.trim()) {
      setErrors({ testName: 'Test name is required.' })
      return
    }
    if (!nameRegex.test(testToEdit.testName.trim())) {
      setErrors({ testName: 'Only alphabets, spaces, and "." are allowed.' })
      return
    }
    const duplicate = test.some(
      (t) =>
        t.testName.trim().toLowerCase() === testToEdit.testName.trim().toLowerCase() &&
        t.id !== testToEdit.id,
    )
    if (duplicate) {
      showCustomToast(`"${testToEdit.testName}" already exists!`, 'error', { position: 'top-right' })
      return
    }
    try {
      setSaveLoading(true)
      await updateTestData(testToEdit, testToEdit.id, testToEdit.hospitalId)
      showCustomToast('Test updated successfully!', 'success')
      setEditModal(false)
      fetchDataById(hospitalId)
    } catch {
      showCustomToast('Failed to update test.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── DELETE ────────────────────────────────────
  const handleTestDelete = (t) => {
    setTestIdToDelete(t.testId || t.id || t._id)
    setHospitalIdToDelete(t.hospitalId)
    setIsDeleteVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTestData(testIdToDelete, hospitalIdToDelete)
      showCustomToast('Test deleted successfully!', 'success', { position: 'top-right' })
      fetchDataById(hospitalId)
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDelLoading(false)
      setIsDeleteVisible(false)
    }
  }

  // ── RENDER ────────────────────────────────────
  if (loading) return <LoadingIndicator message="Loading Tests..." />

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ─────────────────────────── */}
      <div className="ts-page-header">
        <div className="ts-page-title-group">
          <div className="ts-page-icon">
            <FlaskConical size={20} />
          </div>
          <div>
            <h4 className="ts-page-title">Tests Management</h4>
            <p className="ts-page-sub">
              {filteredData.length} test{filteredData.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        {can('Tests', 'create') && (
          <button className="ts-add-btn" onClick={() => { setNewTest(emptyTest); setErrors({}); setAddModal(true) }}>
            <PlusCircle size={15} />
            Add Test
          </button>
        )}
      </div>

      {/* ── TABLE ───────────────────────────────── */}
      {error ? (
        <div className="ts-empty"><FlaskConical size={40} className="ts-empty-icon" /><p>{error}</p></div>
      ) : (
        <div className="ts-table-wrapper">
          <CTable className="ts-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="ts-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="ts-th">Test Name</CTableHeaderCell>
                <CTableHeaderCell className="ts-th">Description</CTableHeaderCell>
                <CTableHeaderCell className="ts-th">Purpose</CTableHeaderCell>
                <CTableHeaderCell className="ts-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {displayData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5}>
                    <div className="ts-empty">
                      <FlaskConical size={40} className="ts-empty-icon" />
                      <p>
                        {searchQuery
                          ? `No tests found matching "${searchQuery}"`
                          : 'No tests found'}
                      </p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                displayData.map((t, index) => (
                  <CTableRow key={t.id} className="ts-tr">
                    <CTableDataCell className="ts-td ts-td-num">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </CTableDataCell>
                    <CTableDataCell className="ts-td">
                      <span className="ts-test-name">{t.testName}</span>
                    </CTableDataCell>
                    <CTableDataCell className="ts-td ts-muted">{t.description || '—'}</CTableDataCell>
                    <CTableDataCell className="ts-td ts-muted">{t.purpose || '—'}</CTableDataCell>
                    <CTableDataCell className="ts-td">
                      <div className="ts-actions">
                        {can('Tests', 'read') && (
                          <button className="ts-action-btn view" title="View" onClick={() => setViewTest(t)}>
                            <Eye size={14} />
                          </button>
                        )}
                        {can('Tests', 'update') && (
                          <button
                            className="ts-action-btn edit"
                            title="Edit"
                            onClick={() => { setTestToEdit(t); setErrors({}); setEditModal(true) }}
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {can('Tests', 'delete') && (
                          <button className="ts-action-btn del" title="Delete" onClick={() => handleTestDelete(t)}>
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
      {displayData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}

      {/* ── ADD MODAL ────────────────────────────── */}
      <CModal
        visible={addModal}
        onClose={() => { setAddModal(false); setNewTest(emptyTest); setErrors({}) }}
        backdrop="static"
        alignment="center"
        className="ts-custom-modal"
      >
        <CModalHeader className="ts-modal-header">
          <CModalTitle className="ts-modal-title">Add New Test</CModalTitle>
        </CModalHeader>
        <CModalBody className="ts-modal-body">
          <CForm>
            <CRow className="g-3">
              <CCol md={12}>
                <div className="ts-field">
                  <CFormLabel className="ts-label">Test Name <span className="ts-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ts-input${errors.testName ? ' is-invalid' : ''}`}
                    placeholder="e.g. Complete Blood Count"
                    value={newTest.testName}
                    onChange={(e) => { setNewTest({ ...newTest, testName: e.target.value }); setErrors({ ...errors, testName: '' }) }}
                  />
                  <CFormText className="ts-err-msg">{errors.testName}</CFormText>
                </div>
              </CCol>
              <CCol md={12}>
                <div className="ts-field">
                  <CFormLabel className="ts-label">Description</CFormLabel>
                  <CFormInput
                    className="ts-input"
                    placeholder="Brief description..."
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  />
                </div>
              </CCol>
              <CCol md={12}>
                <div className="ts-field">
                  <CFormLabel className="ts-label">Purpose</CFormLabel>
                  <CFormInput
                    className="ts-input"
                    placeholder="What is this test for?"
                    value={newTest.purpose}
                    onChange={(e) => setNewTest({ ...newTest, purpose: e.target.value })}
                  />
                </div>
              </CCol>
            </CRow>

            <div className="ts-modal-footer">
              <button type="button" className="ts-btn-ghost" onClick={() => setNewTest(emptyTest)}>
                Reset
              </button>
              <button type="button" className="ts-btn-secondary" onClick={() => { setAddModal(false); setErrors({}) }}>
                Cancel
              </button>
              <button type="button" className="ts-btn-primary" onClick={handleAddTest} disabled={saveloading}>
                {saveloading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                ) : 'Save Test'}
              </button>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* ── EDIT MODAL ───────────────────────────── */}
      <CModal
        visible={editModal}
        onClose={() => { setEditModal(false); setErrors({}) }}
        backdrop="static"
        alignment="center"
        className="ts-custom-modal"
      >
        <CModalHeader className="ts-modal-header">
          <CModalTitle className="ts-modal-title">Edit Test</CModalTitle>
        </CModalHeader>
        <CModalBody className="ts-modal-body">
          <CForm>
            <CRow className="g-3">
              <CCol md={12}>
                <div className="ts-field">
                  <CFormLabel className="ts-label">Test Name <span className="ts-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ts-input${errors.testName ? ' is-invalid' : ''}`}
                    value={testToEdit?.testName || ''}
                    onChange={(e) => { setTestToEdit({ ...testToEdit, testName: e.target.value }); setErrors({ ...errors, testName: '' }) }}
                  />
                  <CFormText className="ts-err-msg">{errors.testName}</CFormText>
                </div>
              </CCol>
              <CCol md={12}>
                <div className="ts-field">
                  <CFormLabel className="ts-label">Description</CFormLabel>
                  <CFormInput
                    className="ts-input"
                    value={testToEdit?.description || ''}
                    onChange={(e) => setTestToEdit({ ...testToEdit, description: e.target.value })}
                  />
                </div>
              </CCol>
              <CCol md={12}>
                <div className="ts-field">
                  <CFormLabel className="ts-label">Purpose</CFormLabel>
                  <CFormInput
                    className="ts-input"
                    value={testToEdit?.purpose || ''}
                    onChange={(e) => setTestToEdit({ ...testToEdit, purpose: e.target.value })}
                  />
                </div>
              </CCol>
            </CRow>

            <div className="ts-modal-footer">
              <button type="button" className="ts-btn-secondary" onClick={() => { setEditModal(false); setErrors({}) }}>
                Cancel
              </button>
              <button type="button" className="ts-btn-primary" onClick={handleUpdateTest} disabled={saveloading}>
                {saveloading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Updating...</>
                ) : 'Update Test'}
              </button>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* ── VIEW MODAL ───────────────────────────── */}
      <CModal
        visible={!!viewTest}
        onClose={() => setViewTest(null)}
        backdrop="static"
        alignment="center"
        className="ts-custom-modal"
      >
        <CModalHeader className="ts-modal-header">
          <CModalTitle className="ts-modal-title">Test Details</CModalTitle>
        </CModalHeader>
        <CModalBody className="ts-modal-body">
          {viewTest && (
            <>
              <div className="ts-summary-grid">
                <div className="ts-summary-card" style={{ gridColumn: '1 / -1' }}>
                  <span className="ts-summary-label">Test Name</span>
                  <span className="ts-summary-value">{viewTest.testName}</span>
                </div>
                <div className="ts-summary-card">
                  <span className="ts-summary-label">Test ID</span>
                  <span className="ts-summary-value ts-id-pill">{viewTest.id}</span>
                </div>
                <div className="ts-summary-card">
                  <span className="ts-summary-label">Purpose</span>
                  <span className="ts-summary-value">{viewTest.purpose || '—'}</span>
                </div>
              </div>

              <div className="ts-section-label">Description</div>
              <div className="ts-notes-box">{viewTest.description || '—'}</div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="ts-btn-secondary" onClick={() => setViewTest(null)}>Close</button>
              </div>
            </>
          )}
        </CModalBody>
      </CModal>

      {/* ── DELETE CONFIRMATION ──────────────────── */}
      <ConfirmationModal
        isVisible={isDeleteVisible}
        title="Delete Test"
        message="Are you sure you want to delete this test? This action cannot be undone."
        isLoading={delloading}
        confirmText={
          delloading ? (
            <><span className="spinner-border spinner-border-sm me-2 text-white" />Deleting...</>
          ) : 'Yes, Delete'
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteVisible(false)}
      />

      {/* ── STYLES ──────────────────────────────── */}
      <style>{`
        /* Page Header */
        .ts-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .ts-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ts-page-icon {
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
        .ts-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .ts-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .ts-add-btn {
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
        .ts-add-btn:hover  { background: #0c447c; }
        .ts-add-btn:active { transform: scale(0.97); }

        /* Table */
        .ts-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .ts-table { margin-bottom: 0 !important; font-size: 13px; }
        .ts-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }
        .ts-tr { transition: background 0.12s; }
        .ts-tr:hover { background: #f0f5fb !important; }
        .ts-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .ts-td-num { color: #9ca3af; font-size: 12px; }
        .ts-muted { color: #6b7280; }

        /* Name */
        .ts-test-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }

        /* Actions */
        .ts-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .ts-action-btn {
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
        .ts-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .ts-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .ts-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .ts-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .ts-action-btn:active { transform: scale(0.94); }

        /* Empty */
        .ts-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .ts-empty-icon { color: #d0dce9; }

        /* Modal */
        .ts-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .ts-modal-header {
          background: #185fa5 !important;
          border-bottom: none !important;
          padding: 16px 20px !important;
        }
        .ts-modal-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #fff !important;
        }
        .ts-custom-modal .btn-close {
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        .ts-modal-body {
          background: #f7fafd !important;
          padding: 20px !important;
        }

        /* Form */
        .ts-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 4px;
        }
        .ts-label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 2px;
        }
        .ts-req { color: #e24b4a; }
        .ts-err-msg {
          font-size: 11px;
          color: #a32d2d !important;
          margin-top: 2px;
          min-height: 16px;
        }
        .ts-input {
          height: 36px;
          font-size: 13px !important;
          border: 0.5px solid #ced4da !important;
          border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .ts-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }
        .ts-input.is-invalid { border-color: #e24b4a !important; }

        /* Modal footer */
        .ts-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 0.5px solid #d0dce9;
        }
        .ts-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 22px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
        }
        .ts-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .ts-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .ts-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .ts-btn-secondary {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ts-btn-secondary:hover { background: #f0f5fb; }
        .ts-btn-ghost {
          background: transparent;
          color: #6b7280;
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.15s;
        }
        .ts-btn-ghost:hover { color: #374151; }

        /* View modal cards */
        .ts-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .ts-summary-card {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ts-summary-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .ts-summary-value {
          font-size: 14px;
          font-weight: 700;
          color: #0c447c;
        }
        .ts-id-pill {
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          display: inline-block;
        }
        .ts-section-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .ts-notes-box {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #374151;
          min-height: 40px;
          margin-bottom: 4px;
        }
      `}</style>
    </>
  )
}

export default TestsManagement