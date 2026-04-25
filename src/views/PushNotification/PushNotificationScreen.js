import React, { useCallback, useEffect, useState } from 'react'
import {
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import Select from 'react-select'
import ConfirmationModal from '../../components/ConfirmationModal'
import { Bell, Edit2, Eye, Send, Trash2 } from 'lucide-react'
import { useHospital } from '../Usecontext/HospitalContext'
import { CustomerData } from '../customerManagement/CustomerManagementAPI'
import { http } from '../../Utils/Interceptors'
import { BASE_URL } from '../../baseUrl'
import Pagination from '../../Utils/Pagination'
import { showCustomToast } from '../../Utils/Toaster'
import { ToastContainer } from 'react-toastify'

const FCMNotification = () => {
  const [title, setTitle]                     = useState('')
  const [body, setBody]                       = useState('')
  const [image, setImage]                     = useState(null)
  const [sendAll, setSendAll]                 = useState(false)
  const [sentNotifications, setSentNotifications] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [loading, setLoading]                 = useState(false)
  const [deleteConfirm, setDeleteConfirm]     = useState(false)
  const [selectedItem, setSelectedItem]       = useState(null)
  const [viewMode, setViewMode]               = useState(false)
  const [isLoading, setIsLoading]             = useState(false)
  const [isEditing, setIsEditing]             = useState(false)
  const [editId, setEditId]                   = useState(null)

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize]       = useState(5)
  const paginatedNotifications = sentNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const totalPages = Math.ceil(sentNotifications.length / pageSize)

  // ── IMAGE ─────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  // ── FETCH NOTIFICATIONS ───────────────────
  const fetchNotifications = async () => {
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    try {
      const res = await http.get(`/priceDropNotification/${clinicId}/${branchId}`)
      if (res.data.success) {
        const dataList = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
        const mapped = dataList.map((n) => {
          let customers = []
          if (n.tokens && Array.isArray(n.tokens)) {
            customers = n.tokens
              .map((token) => customerOptions.find((c) => c.value === token))
              .filter(Boolean)
          } else if (n.customerData && Array.isArray(n.customerData)) {
            customers = n.customerData.map((c) => {
              const name = Object.keys(c)[0]
              const data = c[name]
              return { value: data.customerId || data.patientId || name, label: `${name} (${data.patientId || data.customerId || ''})` }
            })
          }
          return { ...n, selectedCustomers: customers }
        })
        setSentNotifications(mapped)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  // ── FETCH CUSTOMERS ───────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await CustomerData()
      const customers = response || []
      setCustomerOptions(
        customers
          .filter((c) => c.fullName && c.deviceId)
          .map((c) => ({ value: c.deviceId, label: `${c.fullName} (${c.patientId})` })),
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { if (customerOptions.length > 0) fetchNotifications() }, [customerOptions])

  // ── SUBMIT ────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      showCustomToast('Title and Body are required!', 'error')
      return
    }
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    const tokens   = sendAll ? [] : selectedCustomers.map((c) => c.value)
    const payload  = { clinicId, branchId, title, body, image, sendAll, tokens }

    try {
      setIsLoading(true)
      const res = isEditing && editId
        ? await http.put(`${BASE_URL}/pricedrop/${editId}`, payload)
        : await http.post(`${BASE_URL}/pricedrop`, payload)

      if (res.data.success) {
        showCustomToast(isEditing ? 'Updated successfully!' : 'Sent successfully!')
        fetchNotifications()
        setTitle(''); setBody(''); setImage(null)
        setSelectedCustomers([]); setSendAll(false)
        setIsEditing(false); setEditId(null)
      } else {
        showCustomToast('Operation failed!', 'error')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // ── DELETE ────────────────────────────────
  const handleDelete = async () => {
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    try {
      setIsLoading(true)
      const res = await http.delete(
        `${BASE_URL}/deletePriceDropNotification/${clinicId}/${branchId}/${selectedItem}`,
      )
      if (res.data.success) {
        showCustomToast('Notification deleted successfully!')
        fetchNotifications()
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    } finally {
      setIsLoading(false)
      setDeleteConfirm(false)
    }
  }

  // ── EDIT ──────────────────────────────────
  const handleEdit = (n) => {
    setTitle(n.title); setBody(n.body); setImage(n.image || null)
    setSendAll(n.sendAll || false)
    setSelectedCustomers(n.sendAll ? [] : n.selectedCustomers || [])
    setIsEditing(true); setEditId(n._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── VIEW ──────────────────────────────────
  const handleView = (n) => { setSelectedItem(n); setViewMode(true) }

  // ── react-select styles ───────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base, minHeight: '36px', fontSize: '13px',
      borderColor: state.isFocused ? '#185fa5' : '#ced4da',
      borderWidth: '0.5px', borderRadius: '7px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(24,95,165,0.15)' : 'none',
      '&:hover': { borderColor: '#185fa5' },
    }),
    multiValue: (base) => ({ ...base, background: '#e6f1fb', borderRadius: '20px', border: '0.5px solid #b5d4f4' }),
    multiValueLabel: (base) => ({ ...base, color: '#0c447c', fontSize: '11px', fontWeight: '500', padding: '1px 6px' }),
    multiValueRemove: (base) => ({ ...base, color: '#185fa5', borderRadius: '0 20px 20px 0', '&:hover': { background: '#b5d4f4', color: '#042c53' } }),
    option: (base, state) => ({ ...base, fontSize: '13px', backgroundColor: state.isSelected ? '#185fa5' : state.isFocused ? '#e6f1fb' : 'transparent', color: state.isSelected ? '#fff' : '#374151' }),
    placeholder: (base) => ({ ...base, fontSize: '13px', color: '#9ca3af' }),
    menu: (base) => ({ ...base, borderRadius: '7px', border: '0.5px solid #d0dce9', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 9999 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  }

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ───────────────────────── */}
      <div className="fcm-page-header">
        <div className="fcm-page-title-group">
          <div className="fcm-page-icon"><Bell size={20} /></div>
          <div>
            <h4 className="fcm-page-title">Push Notifications</h4>
            <p className="fcm-page-sub">{sentNotifications.length} notification{sentNotifications.length !== 1 ? 's' : ''} sent</p>
          </div>
        </div>
      </div>

      {/* ── COMPOSE FORM ─────────────────────── */}
      <div className="fcm-compose-card">
        <div className="fcm-section-label" style={{ marginBottom: 14 }}>
          {isEditing ? '✏️ Edit Notification' : '📝 Compose Notification'}
        </div>

        <div className="fcm-form-grid">
          {/* Left column */}
          <div className="fcm-form-col">
            <div className="fcm-field">
              <CFormLabel className="fcm-label">Title <span className="fcm-req">*</span></CFormLabel>
              <CFormInput
                className="fcm-input"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="fcm-field">
              <CFormLabel className="fcm-label">Image (Optional)</CFormLabel>
              <CFormInput className="fcm-input" type="file" accept="image/*" onChange={handleImageChange} />
              {image && (
                <img src={image} alt="preview" style={{ width: '100%', borderRadius: 8, marginTop: 8, border: '0.5px solid #d0dce9' }} />
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="fcm-form-col">
            <div className="fcm-field">
              <CFormLabel className="fcm-label">Body <span className="fcm-req">*</span></CFormLabel>
              <CFormTextarea
                className="fcm-input fcm-textarea"
                rows={4}
                placeholder="Enter message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="fcm-field">
              <CFormCheck
                className="fcm-check"
                type="checkbox"
                label="Send to all users"
                checked={sendAll}
                onChange={(e) => setSendAll(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Customer selector */}
        {!sendAll && (
          <div className="fcm-field" style={{ marginTop: 4 }}>
            <CFormLabel className="fcm-label">Select Customers</CFormLabel>
            <Select
              isMulti
              options={customerOptions}
              value={selectedCustomers}
              onChange={(val) => setSelectedCustomers(val || [])}
              isLoading={loading}
              placeholder="Search & select customers..."
              closeMenuOnSelect={false}
              menuPlacement="auto"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 16 }}>
          <button className="fcm-send-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <><span className="spinner-border spinner-border-sm me-2" />{isEditing ? 'Updating...' : 'Sending...'}</>
            ) : (
              <><Send size={14} />{isEditing ? 'Update Notification' : 'Send Notification'}</>
            )}
          </button>
          {isEditing && (
            <button
              className="fcm-cancel-btn"
              onClick={() => { setIsEditing(false); setEditId(null); setTitle(''); setBody(''); setImage(null); setSelectedCustomers([]); setSendAll(false) }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────── */}
      <div className="fcm-table-header">
        <span className="fcm-section-label" style={{ margin: 0 }}>Sent Notifications Log</span>
        <span className="fcm-count-pill">{sentNotifications.length} total</span>
      </div>

      <div className="fcm-table-wrapper">
        <CTable className="fcm-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="fcm-th" style={{ width: 56 }}>#</CTableHeaderCell>
              <CTableHeaderCell className="fcm-th">Title</CTableHeaderCell>
              <CTableHeaderCell className="fcm-th">Body</CTableHeaderCell>
              <CTableHeaderCell className="fcm-th">Date</CTableHeaderCell>
              <CTableHeaderCell className="fcm-th">Image</CTableHeaderCell>
              <CTableHeaderCell className="fcm-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {paginatedNotifications.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={6}>
                  <div className="fcm-empty">
                    <Bell size={40} className="fcm-empty-icon" />
                    <p>No notifications sent yet.</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              paginatedNotifications.map((n, idx) => (
                <CTableRow key={idx} className="fcm-tr">
                  <CTableDataCell className="fcm-td fcm-td-num">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </CTableDataCell>
                  <CTableDataCell className="fcm-td">
                    <span className="fcm-title-cell">{n.title}</span>
                  </CTableDataCell>
                  <CTableDataCell className="fcm-td fcm-muted fcm-body-cell">
                    {n.body}
                  </CTableDataCell>
                  <CTableDataCell className="fcm-td fcm-muted">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </CTableDataCell>
                  <CTableDataCell className="fcm-td">
                    {n.image ? (
                      <img src={n.image} alt="notif" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '0.5px solid #d0dce9' }} />
                    ) : (
                      <span className="fcm-muted">—</span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="fcm-td">
                    <div className="fcm-actions">
                      {can('Push Notification', 'read') && (
                        <button className="fcm-action-btn view" title="View" onClick={() => handleView(n)}>
                          <Eye size={14} />
                        </button>
                      )}
                      {can('Push Notification', 'update') && (
                        <button className="fcm-action-btn edit" title="Edit" onClick={() => handleEdit(n)}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can('Push Notification', 'delete') && (
                        <button
                          className="fcm-action-btn del"
                          title="Delete"
                          onClick={() => { setSelectedItem(n.id); setDeleteConfirm(true) }}
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

      <div className="mt-3 mb-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* ── VIEW MODAL ────────────────────────── */}
      <CModal
        visible={viewMode}
        onClose={() => setViewMode(false)}
        backdrop="static"
        size="lg"
        alignment="center"
        className="fcm-custom-modal"
      >
        <CModalHeader className="fcm-modal-header">
          <CModalTitle className="fcm-modal-title">Notification Details</CModalTitle>
        </CModalHeader>
        <CModalBody className="fcm-modal-body fcm-view-body">
          {selectedItem && (
            <>
              <div className="fcm-detail-grid">
                <div className="fcm-detail-card fcm-full">
                  <span className="fcm-detail-label">Title</span>
                  <span className="fcm-detail-value">{selectedItem.title || '—'}</span>
                </div>
                <div className="fcm-detail-card">
                  <span className="fcm-detail-label">Clinic ID</span>
                  <span className="fcm-detail-value fcm-id-pill">{selectedItem.clinicId || '—'}</span>
                </div>
                <div className="fcm-detail-card">
                  <span className="fcm-detail-label">Branch ID</span>
                  <span className="fcm-detail-value fcm-id-pill">{selectedItem.branchId || '—'}</span>
                </div>
                <div className="fcm-detail-card">
                  <span className="fcm-detail-label">Send All</span>
                  <span className={`fcm-detail-value ${selectedItem.sendAll ? 'fcm-badge-green' : 'fcm-badge-gray'}`}>
                    {selectedItem.sendAll ? 'Yes' : 'No'}
                  </span>
                </div>
                {selectedItem.createdAt && (
                  <div className="fcm-detail-card">
                    <span className="fcm-detail-label">Created At</span>
                    <span className="fcm-detail-value">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                  </div>
                )}
                <div className="fcm-detail-card fcm-full">
                  <span className="fcm-detail-label">Body</span>
                  <span className="fcm-detail-value" style={{ fontWeight: 400, fontSize: 13, color: '#374151' }}>{selectedItem.body || '—'}</span>
                </div>
                {selectedItem.tokens?.length > 0 && (
                  <div className="fcm-detail-card fcm-full">
                    <span className="fcm-detail-label">Tokens</span>
                    <span className="fcm-detail-value" style={{ fontWeight: 400, fontSize: 12, wordBreak: 'break-all', color: '#374151' }}>
                      {selectedItem.tokens.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {selectedItem.image && (
                <>
                  <div className="fcm-section-label">Image Preview</div>
                  <img src={selectedItem.image} alt="Notification" style={{ width: '100%', borderRadius: 8, border: '0.5px solid #d0dce9', marginBottom: 12 }} />
                </>
              )}

              {selectedItem.customerData?.length > 0 && (
                <>
                  <div className="fcm-section-label">Customer Data</div>
                  <div className="fcm-customer-grid">
                    {selectedItem.customerData.map((cust, idx) => {
                      const name    = Object.keys(cust)[0]
                      const details = cust[name]
                      return (
                        <div className="fcm-customer-card" key={idx}>
                          <span className="fcm-cust-name">{name}</span>
                          <span className="fcm-cust-detail">📞 {details.mobileNumber}</span>
                          <span className="fcm-cust-detail">Customer ID: {details.customerId}</span>
                          <span className="fcm-cust-detail">Patient ID: {details.patientId}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="fcm-btn-secondary" onClick={() => setViewMode(false)}>Close</button>
              </div>
            </>
          )}
        </CModalBody>
      </CModal>

      {/* ── DELETE CONFIRMATION ──────────────── */}
      <ConfirmationModal
        isVisible={deleteConfirm}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        isLoading={isLoading}
        confirmText={isLoading ? <><span className="spinner-border spinner-border-sm me-2 text-white" />Deleting...</> : 'Yes, Delete'}
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />

      {/* ── STYLES ──────────────────────────── */}
      <style>{`
        /* Page Header */
        .fcm-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .fcm-page-title-group { display: flex; align-items: center; gap: 12px; }
        .fcm-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center;
          justify-content: center; color: #185fa5; flex-shrink: 0;
        }
        .fcm-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .fcm-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        /* Compose card */
        .fcm-compose-card {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .fcm-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 8px;
        }
        @media (max-width: 640px) { .fcm-form-grid { grid-template-columns: 1fr; } }
        .fcm-form-col { display: flex; flex-direction: column; gap: 12px; }

        /* Fields */
        .fcm-field { display: flex; flex-direction: column; gap: 4px; }
        .fcm-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .fcm-req   { color: #e24b4a; }
        .fcm-input {
          height: 36px; font-size: 13px !important;
          border: 0.5px solid #ced4da !important;
          border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .fcm-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }
        .fcm-textarea { height: auto !important; }
        .fcm-check { font-size: 13px; color: #374151; }

        /* Send button */
        .fcm-send-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 10px 24px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .fcm-send-btn:hover:not(:disabled)  { background: #0c447c; }
        .fcm-send-btn:active:not(:disabled) { transform: scale(0.97); }
        .fcm-send-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .fcm-cancel-btn {
          margin-left: 8px;
          background: #fff; color: #374151;
          border: 0.5px solid #d0dce9; border-radius: 8px;
          padding: 10px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .fcm-cancel-btn:hover { background: #f0f5fb; }

        /* Table section header */
        .fcm-table-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .fcm-section-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .fcm-count-pill {
          background: #e6f1fb; color: #185fa5;
          border: 0.5px solid #b5d4f4; border-radius: 20px;
          font-size: 11px; font-weight: 600; padding: 2px 10px;
        }

        /* Table */
        .fcm-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 4px;
        }
        .fcm-table { margin-bottom: 0 !important; font-size: 13px; }
        .fcm-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .fcm-tr { transition: background 0.12s; }
        .fcm-tr:hover { background: #f0f5fb !important; }
        .fcm-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .fcm-td-num { color: #9ca3af; font-size: 12px; }
        .fcm-muted  { color: #6b7280; }
        .fcm-title-cell { font-weight: 600; color: #0c447c; }
        .fcm-body-cell  { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Actions */
        .fcm-actions { display: flex; gap: 6px; align-items: center; }
        .fcm-action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .fcm-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .fcm-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .fcm-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .fcm-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .fcm-action-btn:active { transform: scale(0.94); }

        /* Empty */
        .fcm-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px; }
        .fcm-empty-icon { color: #d0dce9; }

        /* Modal */
        .fcm-custom-modal .modal-content { border: 0.5px solid #d0dce9 !important; border-radius: 12px !important; overflow: hidden; }
        .fcm-modal-header { background: #185fa5 !important; border-bottom: none !important; padding: 16px 20px !important; }
        .fcm-modal-title  { font-size: 15px !important; font-weight: 700 !important; color: #fff !important; }
        .fcm-custom-modal .btn-close { filter: brightness(0) invert(1); opacity: 0.8; }
        .fcm-modal-body { background: #f7fafd !important; padding: 20px !important; }
        .fcm-view-body  { max-height: 78vh; overflow-y: auto; }

        /* Detail grid */
        .fcm-detail-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 16px; }
        .fcm-full { grid-column: 1 / -1; }
        .fcm-detail-card { background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
        .fcm-detail-label { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
        .fcm-detail-value { font-size: 13px; font-weight: 600; color: #0c447c; word-break: break-word; }
        .fcm-id-pill { background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4; border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; display: inline-block; }
        .fcm-badge-green { background: #eaf3de; color: #3b6d11; border: 0.5px solid #c0dd97; border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; display: inline-block; }
        .fcm-badge-gray  { background: #f3f4f6; color: #6b7280; border: 0.5px solid #d1d5db; border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; display: inline-block; }

        /* Customer grid */
        .fcm-customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px; }
        .fcm-customer-card { background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
        .fcm-cust-name   { font-size: 13px; font-weight: 700; color: #0c447c; }
        .fcm-cust-detail { font-size: 11px; color: #6b7280; }

        /* Buttons */
        .fcm-btn-secondary { background: #fff; color: #374151; border: 0.5px solid #d0dce9; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
        .fcm-btn-secondary:hover { background: #f0f5fb; }
      `}</style>
    </>
  )
}

export default FCMNotification