import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  CModalFooter,
} from '@coreui/react'
import Select from 'react-select'
import { AlertTriangle, Bell, Edit2, Eye, Send, Trash2 } from 'lucide-react'
import { useHospital } from '../Usecontext/HospitalContext'
import { CustomerData } from '../customerManagement/CustomerManagementAPI'
import { http } from '../../Utils/Interceptors'
import { BASE_URL } from '../../baseUrl'
import Pagination from '../../Utils/Pagination'
import { showCustomToast } from '../../Utils/Toaster'
import { ToastContainer } from 'react-toastify'

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Converts ANY image value the backend might return into a usable <img src>.
 * Returns null when there is genuinely no image so the table shows "—".
 */
const toImgSrc = (raw) => {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string') return null
  const t = raw.trim()
  if (!t || t === 'null' || t === 'undefined') return null
  if (t.startsWith('data:'))   return t                               // already data-URL
  if (t.startsWith('http://') || t.startsWith('https://')) return t  // CDN / S3 URL
  if (t.startsWith('/'))       return t                               // relative URL
  return `data:image/jpeg;base64,${t}`                               // raw base64
}

/** Strips data-URL prefix so the backend receives a plain base64 string */
const stripDataUrl = (dataUrl) =>
  dataUrl ? dataUrl.replace(/^data:image\/[^;]+;base64,/, '') : null

// ─────────────────────────────────────────────────────────────
// BLANK FORM — single source of truth for "empty compose state"
// Using ONE state object means resetForm() is always atomic.
// ─────────────────────────────────────────────────────────────
const BLANK = {
  title:             '',
  body:              '',
  image:             null,   // dataURL string while composing, null = no image
  sendAll:           false,
  selectedCustomers: [],
  isEditing:         false,
  editId:            null,
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const FCMNotification = () => {

  // ── Consolidated form state ─────────────────────────────
  const [form, setForm] = useState(BLANK)
  const fileInputRef    = useRef(null)        // lets us reset <input type="file">
  const setF = (patch) => setForm(prev => ({ ...prev, ...patch }))

  // ── Data ────────────────────────────────────────────────
  const [sentNotifications, setSentNotifications] = useState([])
  const [customerOptions, setCustomerOptions]     = useState([])
  const [loading, setLoading]                     = useState(false)

  // ── Delete modal ────────────────────────────────────────
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [notifToDelete, setNotifToDelete]           = useState(null)  // { id, title }

  // ── View modal ──────────────────────────────────────────
  const [viewItem, setViewItem] = useState(null)
  const [viewMode, setViewMode] = useState(false)

  // ── Loading spinner ─────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false)

  // ── Permissions ─────────────────────────────────────────
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ── Pagination ──────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize]       = useState(5)
  const paginatedNotifications = sentNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const totalPages = Math.ceil(sentNotifications.length / pageSize)

  // ───────────────────────────────────────────────────────
  // RESET FORM — atomically wipes every field + file input
  // ───────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(BLANK)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ───────────────────────────────────────────────────────
  // IMAGE CHANGE
  // ───────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setF({ image: reader.result })
    reader.readAsDataURL(file)
  }

  // ───────────────────────────────────────────────────────
  // FETCH CUSTOMERS
  // ───────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const response  = await CustomerData()
      const customers = response || []
      setCustomerOptions(
        customers
          .filter((c) => c.fullName && c.deviceId)
          .map((c) => ({ value: c.deviceId, label: `${c.fullName} (${c.patientId})` })),
      )
    } catch (err) {
      console.error('[FCM] fetchCustomers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ───────────────────────────────────────────────────────
  // FETCH NOTIFICATIONS
  // Normalises the image into `_normImage` at load time so
  // every render (table row, edit form, view modal) uses the
  // same resolved value without re-computing.
  // ───────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    try {
      const res = await http.get(`/priceDropNotification/${clinicId}/${branchId}`)
      if (res.data.success) {
        const dataList = Array.isArray(res.data.data) ? res.data.data : [res.data.data]

        // ── DEBUG: open browser DevTools → Console to see exact field names ──
        if (dataList.length > 0) {
          console.log('[FCM] API keys on first item:', Object.keys(dataList[0]))
          const rawImgSample =
            dataList[0].image ?? dataList[0].imageUrl ?? dataList[0].imageData ?? ''
          console.log('[FCM] Raw image value (first 100 chars):', String(rawImgSample).slice(0, 100))
        }

        const mapped = dataList.map((n) => {
          // Resolve customers
          let customers = []
          if (n.tokens && Array.isArray(n.tokens)) {
            customers = n.tokens
              .map((token) => customerOptions.find((c) => c.value === token))
              .filter(Boolean)
          } else if (n.customerData && Array.isArray(n.customerData)) {
            customers = n.customerData.map((c) => {
              const name = Object.keys(c)[0]
              const data = c[name]
              return {
                value: data.customerId || data.patientId || name,
                label: `${name} (${data.patientId || data.customerId || ''})`,
              }
            })
          }

          // ── Resolve image from whichever field name backend uses ──
          const rawImage =
            n.image            ??
            n.imageUrl         ??
            n.imageData        ??
            n.img              ??
            n.notificationImage ??
            null

          return { ...n, _normImage: rawImage, selectedCustomers: customers }
        })

        setSentNotifications(mapped)
      }
    } catch (err) {
      console.error('[FCM] fetchNotifications:', err)
    }
  }, [customerOptions])

  useEffect(() => { fetchCustomers() },     [fetchCustomers])
  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // ───────────────────────────────────────────────────────
  // SUBMIT (create or update)
  // ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      showCustomToast('Title and Body are required!', 'error')
      return
    }
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    const tokens   = form.sendAll ? [] : form.selectedCustomers.map((c) => c.value)

    const payload = {
      clinicId,
      branchId,
      title:   form.title,
      body:    form.body,
      image:   stripDataUrl(form.image),
      sendAll: form.sendAll,
      tokens,
    }

    try {
      setIsLoading(true)
      const res = form.isEditing && form.editId
        ? await http.put(`${BASE_URL}/pricedrop/${form.editId}`, payload)
        : await http.post(`${BASE_URL}/pricedrop`, payload)

      if (res.data.success) {
        showCustomToast(form.isEditing ? 'Updated successfully!' : 'Sent successfully!')
        resetForm()
        fetchNotifications()
      } else {
        showCustomToast('Operation failed!', 'error')
      }
    } catch (err) {
      console.error('[FCM] handleSubmit:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // ───────────────────────────────────────────────────────
  // DELETE
  // ───────────────────────────────────────────────────────
  const handleDeleteClick = (n) => {
    setNotifToDelete({ id: n._id || n.id, title: n.title })
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!notifToDelete) return
    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    try {
      setIsLoading(true)
      const res = await http.delete(
        `${BASE_URL}/deletePriceDropNotification/${clinicId}/${branchId}/${notifToDelete.id}`,
      )
      if (res.data.success) {
        showCustomToast('Notification deleted successfully!')
        resetForm()            // ✅ always wipe form — covers "deleted row was being edited"
        fetchNotifications()
      } else {
        showCustomToast('Delete failed!', 'error')
      }
    } catch (err) {
      console.error('[FCM] confirmDelete:', err)
    } finally {
      setIsLoading(false)
      setDeleteModalVisible(false)
      setNotifToDelete(null)
    }
  }

  // ───────────────────────────────────────────────────────
  // EDIT — populate form from selected row
  // ───────────────────────────────────────────────────────
  const handleEdit = (n) => {
    const imgSrc = toImgSrc(n._normImage)
    console.log('[FCM] handleEdit — _normImage:', String(n._normImage ?? '').slice(0, 80))
    console.log('[FCM] handleEdit — resolved src:', imgSrc ? imgSrc.slice(0, 60) : null)

    setForm({
      title:             n.title  || '',
      body:              n.body   || '',
      image:             imgSrc,                             // null if no image
      sendAll:           n.sendAll || false,
      selectedCustomers: n.sendAll ? [] : (n.selectedCustomers || []),
      isEditing:         true,
      editId:            n._id || n.id,
    })

    if (fileInputRef.current) fileInputRef.current.value = ''  // clear file input label
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ───────────────────────────────────────────────────────
  // VIEW
  // ───────────────────────────────────────────────────────
  const handleView = (n) => { setViewItem(n); setViewMode(true) }

  // ───────────────────────────────────────────────────────
  // react-select styles
  // ───────────────────────────────────────────────────────
  const selectStyles = {
    control: (b, s) => ({
      ...b, minHeight: '36px', fontSize: '13px',
      borderColor: s.isFocused ? '#185fa5' : '#ced4da',
      borderWidth: '0.5px', borderRadius: '7px',
      boxShadow: s.isFocused ? '0 0 0 2px rgba(24,95,165,0.15)' : 'none',
      '&:hover': { borderColor: '#185fa5' },
    }),
    multiValue:       (b) => ({ ...b, background: '#e6f1fb', borderRadius: '20px', border: '0.5px solid #b5d4f4' }),
    multiValueLabel:  (b) => ({ ...b, color: '#0c447c', fontSize: '11px', fontWeight: '500', padding: '1px 6px' }),
    multiValueRemove: (b) => ({ ...b, color: '#185fa5', borderRadius: '0 20px 20px 0', '&:hover': { background: '#b5d4f4', color: '#042c53' } }),
    option: (b, s) => ({ ...b, fontSize: '13px', backgroundColor: s.isSelected ? '#185fa5' : s.isFocused ? '#e6f1fb' : 'transparent', color: s.isSelected ? '#fff' : '#374151' }),
    placeholder: (b) => ({ ...b, fontSize: '13px', color: '#9ca3af' }),
    menu:        (b) => ({ ...b, borderRadius: '7px', border: '0.5px solid #d0dce9', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 9999 }),
    menuPortal:  (b) => ({ ...b, zIndex: 9999 }),
  }

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer />

      {/* ── Page Header ──────────────────────────────── */}
      <div className="fcm-page-header">
        <div className="fcm-page-title-group">
          <div className="fcm-page-icon"><Bell size={20} /></div>
          <div>
            <h4 className="fcm-page-title">Push Notifications</h4>
            <p className="fcm-page-sub">
              {sentNotifications.length} notification{sentNotifications.length !== 1 ? 's' : ''} sent
            </p>
          </div>
        </div>
      </div>

      {/* ── COMPOSE / EDIT FORM ──────────────────────── */}
      <div className="fcm-compose-card">
        <div className="fcm-section-label" style={{ marginBottom: 14 }}>
          {form.isEditing ? '✏️ Edit Notification' : '📝 Compose Notification'}
        </div>

        <div className="fcm-form-grid">
          {/* Left */}
          <div className="fcm-form-col">
            <div className="fcm-field">
              <CFormLabel className="fcm-label">Title <span className="fcm-req">*</span></CFormLabel>
              <CFormInput
                className="fcm-input"
                placeholder="Enter title..."
                value={form.title}
                onChange={(e) => setF({ title: e.target.value })}
              />
            </div>

            <div className="fcm-field">
              <CFormLabel className="fcm-label">Image (Optional)</CFormLabel>
              <CFormInput
                className="fcm-input"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              {/* ✅ Preview — shown whenever form.image has a value (from file pick OR edit load) */}
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, marginTop: 8, border: '0.5px solid #d0dce9' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
          </div>

          {/* Right */}
          <div className="fcm-form-col">
            <div className="fcm-field">
              <CFormLabel className="fcm-label">Body <span className="fcm-req">*</span></CFormLabel>
              <CFormTextarea
                className="fcm-input fcm-textarea"
                rows={4}
                placeholder="Enter message..."
                value={form.body}
                onChange={(e) => setF({ body: e.target.value })}
              />
            </div>

            <div className="fcm-field">
              <CFormCheck
                className="fcm-check"
                type="checkbox"
                label="Send to all users"
                checked={form.sendAll}
                onChange={(e) => setF({ sendAll: e.target.checked })}
              />
            </div>
          </div>
        </div>

        {/* Customer selector */}
        {!form.sendAll && (
          <div className="fcm-field" style={{ marginTop: 4 }}>
            <CFormLabel className="fcm-label">Select Customers</CFormLabel>
            <Select
              isMulti
              options={customerOptions}
              value={form.selectedCustomers}
              onChange={(val) => setF({ selectedCustomers: val || [] })}
              isLoading={loading}
              placeholder="Search & select customers..."
              closeMenuOnSelect={false}
              menuPlacement="auto"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="fcm-send-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? <><span className="spinner-border spinner-border-sm me-2" />{form.isEditing ? 'Updating...' : 'Sending...'}</>
              : <><Send size={14} />{form.isEditing ? 'Update Notification' : 'Send Notification'}</>
            }
          </button>
          {form.isEditing && (
            <button className="fcm-cancel-btn" onClick={resetForm}>Cancel Edit</button>
          )}
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────── */}
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
              paginatedNotifications.map((n, idx) => {
                // ✅ Use pre-resolved _normImage — never null-checks on raw fields here
                const imgSrc = toImgSrc(n._normImage)

                return (
                  <CTableRow key={n._id || idx} className="fcm-tr">
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

                    {/* ✅ Image cell */}
                    <CTableDataCell className="fcm-td">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt="notif"
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '0.5px solid #d0dce9', display: 'block' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'inline'
                          }}
                        />
                      ) : null}
                      <span className="fcm-muted" style={{ display: imgSrc ? 'none' : 'inline' }}>—</span>
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
                          <button className="fcm-action-btn del" title="Delete" onClick={() => handleDeleteClick(n)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )
              })
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

      {/* ── VIEW MODAL ───────────────────────────────── */}
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
          {viewItem && (() => {
            const viewImg = toImgSrc(viewItem._normImage)
            return (
              <>
                <div className="fcm-detail-grid">
                  <div className="fcm-detail-card fcm-full">
                    <span className="fcm-detail-label">Title</span>
                    <span className="fcm-detail-value">{viewItem.title || '—'}</span>
                  </div>
                  <div className="fcm-detail-card">
                    <span className="fcm-detail-label">Clinic ID</span>
                    <span className="fcm-detail-value fcm-id-pill">{viewItem.clinicId || '—'}</span>
                  </div>
                  <div className="fcm-detail-card">
                    <span className="fcm-detail-label">Branch ID</span>
                    <span className="fcm-detail-value fcm-id-pill">{viewItem.branchId || '—'}</span>
                  </div>
                  <div className="fcm-detail-card">
                    <span className="fcm-detail-label">Send All</span>
                    <span className={`fcm-detail-value ${viewItem.sendAll ? 'fcm-badge-green' : 'fcm-badge-gray'}`}>
                      {viewItem.sendAll ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {viewItem.createdAt && (
                    <div className="fcm-detail-card">
                      <span className="fcm-detail-label">Created At</span>
                      <span className="fcm-detail-value">{new Date(viewItem.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="fcm-detail-card fcm-full">
                    <span className="fcm-detail-label">Body</span>
                    <span className="fcm-detail-value" style={{ fontWeight: 400, fontSize: 13, color: '#374151' }}>
                      {viewItem.body || '—'}
                    </span>
                  </div>
                  {viewItem.tokens?.length > 0 && (
                    <div className="fcm-detail-card fcm-full">
                      <span className="fcm-detail-label">Tokens</span>
                      <span className="fcm-detail-value" style={{ fontWeight: 400, fontSize: 12, wordBreak: 'break-all', color: '#374151' }}>
                        {viewItem.tokens.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {viewImg && (
                  <>
                    <div className="fcm-section-label" style={{ marginBottom: 8 }}>Image Preview</div>
                    <img
                      src={viewImg}
                      alt="Notification"
                      style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 8, border: '0.5px solid #d0dce9', marginBottom: 12 }}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </>
                )}

                {viewItem.customerData?.length > 0 && (
                  <>
                    <div className="fcm-section-label" style={{ marginBottom: 8 }}>Customer Data</div>
                    <div className="fcm-customer-grid">
                      {viewItem.customerData.map((cust, i) => {
                        const name    = Object.keys(cust)[0]
                        const details = cust[name]
                        return (
                          <div className="fcm-customer-card" key={i}>
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
            )
          })()}
        </CModalBody>
      </CModal>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────── */}
      <CModal
        visible={deleteModalVisible}
        onClose={() => { setDeleteModalVisible(false); setNotifToDelete(null) }}
        alignment="center"
      >
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#e24b4a" />
            Confirm Delete
          </CModalTitle>
        </CModalHeader>

        <CModalBody style={{ padding: '20px', fontSize: 13, color: '#374151' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: '#0c447c' }}>{notifToDelete?.title}</strong>?
          <br />
          <span style={{ color: '#9ca3af', fontSize: 12, marginTop: 6, display: 'block' }}>
            This action cannot be undone.
          </span>
        </CModalBody>

        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          <button
            className="fcm-cancel-btn"
            style={{ marginLeft: 0 }}
            onClick={() => { setDeleteModalVisible(false); setNotifToDelete(null) }}
          >
            Cancel
          </button>
          <button className="fcm-delete-btn" onClick={confirmDelete} disabled={isLoading}>
            {isLoading
              ? <><span className="spinner-border spinner-border-sm me-2 text-white" />Deleting...</>
              : 'Delete'
            }
          </button>
        </CModalFooter>
      </CModal>

      {/* ── STYLES ──────────────────────────────────────── */}
      <style>{`
        .fcm-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .fcm-page-title-group { display: flex; align-items: center; gap: 12px; }
        .fcm-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center;
          justify-content: center; color: #185fa5; flex-shrink: 0;
        }
        .fcm-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .fcm-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }
        .fcm-compose-card {
          background: #fff; border: 0.5px solid #d0dce9;
          border-radius: 12px; padding: 20px; margin-bottom: 20px;
        }
        .fcm-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px;
        }
        @media (max-width: 640px) { .fcm-form-grid { grid-template-columns: 1fr; } }
        .fcm-form-col { display: flex; flex-direction: column; gap: 12px; }
        .fcm-field    { display: flex; flex-direction: column; gap: 4px; }
        .fcm-label    { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .fcm-req      { color: #e24b4a; }
        .fcm-input {
          height: 36px; font-size: 13px !important;
          border: 0.5px solid #ced4da !important; border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .fcm-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }
        .fcm-textarea { height: auto !important; }
        .fcm-check    { font-size: 13px; color: #374151; }
        .fcm-send-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #185fa5; color: #fff; border: none; border-radius: 8px;
          padding: 10px 24px; font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2); transition: background 0.15s, transform 0.1s;
        }
        .fcm-send-btn:hover:not(:disabled)  { background: #0c447c; }
        .fcm-send-btn:active:not(:disabled) { transform: scale(0.97); }
        .fcm-send-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .fcm-cancel-btn {
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .fcm-cancel-btn:hover { background: #f0f5fb; }
        .fcm-delete-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #e24b4a; color: #fff; border: none; border-radius: 8px;
          padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .fcm-delete-btn:hover:not(:disabled) { background: #b91c1c; }
        .fcm-delete-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .fcm-table-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
        }
        .fcm-section-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .fcm-count-pill {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px;
        }
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
        .fcm-td-num     { color: #9ca3af; font-size: 12px; }
        .fcm-muted      { color: #6b7280; }
        .fcm-title-cell { font-weight: 600; color: #0c447c; }
        .fcm-body-cell  { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fcm-actions    { display: flex; gap: 6px; align-items: center; }
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
        .fcm-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .fcm-empty-icon { color: #d0dce9; }
        .fcm-custom-modal .modal-content { border: 0.5px solid #d0dce9 !important; border-radius: 12px !important; overflow: hidden; }
        .fcm-modal-header { background: #185fa5 !important; border-bottom: none !important; padding: 16px 20px !important; }
        .fcm-modal-title  { font-size: 15px !important; font-weight: 700 !important; color: #fff !important; }
        .fcm-custom-modal .btn-close { filter: brightness(0) invert(1); opacity: 0.8; }
        .fcm-modal-body   { background: #f7fafd !important; padding: 20px !important; }
        .fcm-view-body    { max-height: 78vh; overflow-y: auto; }
        .fcm-detail-grid  { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 16px; }
        .fcm-full { grid-column: 1 / -1; }
        .fcm-detail-card {
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px;
          padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
        }
        .fcm-detail-label { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
        .fcm-detail-value { font-size: 13px; font-weight: 600; color: #0c447c; word-break: break-word; }
        .fcm-id-pill {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; display: inline-block;
        }
        .fcm-badge-green {
          background: #eaf3de; color: #3b6d11; border: 0.5px solid #c0dd97;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; display: inline-block;
        }
        .fcm-badge-gray {
          background: #f3f4f6; color: #6b7280; border: 0.5px solid #d1d5db;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; display: inline-block;
        }
        .fcm-customer-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px; margin-bottom: 12px;
        }
        .fcm-customer-card {
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px;
          padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;
        }
        .fcm-cust-name   { font-size: 13px; font-weight: 700; color: #0c447c; }
        .fcm-cust-detail { font-size: 11px; color: #6b7280; }
        .fcm-btn-secondary {
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 9px 18px; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: background 0.15s;
        }
        .fcm-btn-secondary:hover { background: #f0f5fb; }
      `}</style>
    </>
  )
}

export default FCMNotification