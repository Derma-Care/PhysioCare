import React, { useCallback, useEffect, useState } from 'react'
import {
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CFormCheck,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CAlert,
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
import ConfirmationModal from '../../components/ConfirmationModal'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { useHospital } from '../Usecontext/HospitalContext'
import { CustomerData } from '../customerManagement/CustomerManagementAPI'
import { http } from '../../Utils/Interceptors'
import { BASE_URL } from '../../baseUrl'
import Pagination from '../../Utils/Pagination'
import { showCustomToast } from '../../Utils/Toaster'
import { ToastContainer } from 'react-toastify'
import '../Style/CustomModal.css'
const FCMNotification = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState(null)
  const [sendAll, setSendAll] = useState(false)
  const [responseLog, setResponseLog] = useState(null)
  const [responseMessage, setResponseMessage] = useState(null)
  const [sentNotifications, setSentNotifications] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const paginatedNotifications = sentNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )
  const totalPages = Math.ceil(sentNotifications.length / pageSize)

  // 🖼 Handle image
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  // Fetch notifications
const fetchNotifications = async () => {
  const clinicId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')

  try {
    const res = await http.get(`/priceDropNotification/${clinicId}/${branchId}`)
    if (res.data.success) {
      const dataList = Array.isArray(res.data.data) ? res.data.data : [res.data.data]

      const mapped = dataList.map((n) => {
        let selectedCustomers = []

        // If tokens exist, use them
        if (n.tokens && Array.isArray(n.tokens)) {
          selectedCustomers = n.tokens
            .map((token) => customerOptions.find((c) => c.value === token))
            .filter(Boolean)
        }

        // If tokens are null, extract from customerData
        else if (n.customerData && Array.isArray(n.customerData)) {
          selectedCustomers = n.customerData.map((c) => {
            const name = Object.keys(c)[0]
            const data = c[name]
            return {
              value: data.customerId || data.patientId || name,
              label: `${name} (${data.patientId || data.customerId || ''})`,
            }
          })
        }

        return {
          ...n,
          selectedCustomers,
        }
      })

      setSentNotifications(mapped)
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}


  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await CustomerData()
      const customers = response || []
      const options = customers
        .filter((c) => c.fullName && c.deviceId)
        .map((c) => ({
          value: c.deviceId,
          label: `${c.fullName} (${c.patientId})`,
        }))
      setCustomerOptions(options)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

 useEffect(() => {
  if (customerOptions.length > 0) {
    fetchNotifications()
  }
}, [customerOptions])


  // Submit form (send or update)
  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      showCustomToast(`Title and Body are required!`, 'error')

      return
    }

    const clinicId = localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    const tokens = sendAll ? [] : selectedCustomers.map((c) => c.value)

    const payload = {
      clinicId,
      branchId,
      title,
      body,
      image,
      sendAll,
      tokens,
    }

    try {
      setIsLoading(true)
      let res
      if (isEditing && editId) {
        // 🔄 Update existing (PUT)
        res = await http.put(`${BASE_URL}/pricedrop/${editId}`, payload)
      } else {
        // 🆕 Send new (POST)
        res = await http.post(`${BASE_URL}/pricedrop`, payload)
      }

      if (res.data.success) {
        showCustomToast(`${isEditing ? 'Updated successfully!' : 'Sent successfully!'}`)
        // setResponseLog({ success: })
        fetchNotifications()
        // Reset form
        setTitle('')
        setBody('')
        setImage(null)
        setSelectedCustomers([])
        setSendAll(false)
        setIsEditing(false)
        setEditId(null)
      } else {
        showCustomToast(`Operation failed!`, 'error')
        // setResponseLog({ error: 'Operation failed!' })
      }
    } catch (error) {
      // showCustomToast(`${error.message}`, 'error')
      // setResponseLog({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete notification
 const handleDelete = async () => {
  const clinicId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')

 

  try {
    // Optional: show a loading state
    setIsLoading(true)

    const res = await http.delete(
      `${BASE_URL}/deletePriceDropNotification/${clinicId}/${branchId}/${selectedItem}`
    )

    if (res.data.success) {
      showCustomToast('Notification deleted successfully!')
      fetchNotifications()
    } 
    // else {
    //   showCustomToast('Failed to delete notification', 'error')
    // }
  } catch (error) {
    console.error('Error deleting notification:', error)
    // showCustomToast('Error while deleting notification', 'error')
  } finally {
    setIsLoading(false)
    setDeleteConfirm(false)
  
  }
}


  // Load notification into form for editing
  const handleEdit = (n) => {
    setTitle(n.title)
    setBody(n.body)
    setImage(n.image || null)
    setSendAll(n.sendAll || false)
   setSelectedCustomers(n.sendAll ? [] : n.selectedCustomers || [])

    setIsEditing(true)
    setEditId(n._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // View notification
  const handleView = (n) => {
    setSelectedItem(n)
    setViewMode(true)
  }

  return (
    <div className="container mt-1" style={{ maxWidth: '900px' }}>
      <ToastContainer />
      {/* Form */}
      <CCard className="shadow-sm border-0 mb-4" style={{ color: 'var(--color-black)' }}>
        <CCardBody>
          <CRow>
            <CCol md={5}>
              <CFormLabel>Title</CFormLabel>
              <CFormInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Title..."
              />

              <CFormLabel className="mt-3">Image (Optional)</CFormLabel>
              <CFormInput type="file" accept="image/*" onChange={handleImageChange} />
              {image && (
                <img
                  src={image}
                  alt="preview"
                  style={{ width: '100%', borderRadius: 8, marginTop: 10 }}
                />
              )}
            </CCol>
            <CCol md={7}>
              <CFormLabel>Body</CFormLabel>
              <CFormTextarea
                rows="4"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter Message..."
              />

              <CFormCheck
                className="mt-3"
                type="checkbox"
                label="Send to all users"
                checked={sendAll}
                onChange={(e) => setSendAll(e.target.checked)}
              />
            </CCol>
          </CRow>
          {!sendAll && (
            <div className="mt-3">
              <CFormLabel>Select Customers</CFormLabel>
              <Select
                isMulti
                options={customerOptions}
                value={selectedCustomers}
                onChange={(selected) => setSelectedCustomers(selected || [])}
                isLoading={loading}
                placeholder="🔍 Search & Select Customers..."
                closeMenuOnSelect={false}
                menuPlacement="auto"
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#ccc',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#999' },
                  }),
                  option: (base, { isFocused, isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected ? '#000' : isFocused ? '#f1f1f1' : 'white',
                    color: isSelected ? 'white' : 'var(--color-black)',
                    cursor: 'pointer',
                  }),
                }}
              />
            </div>
          )}

          {responseLog && (
            <CAlert color={responseLog.error ? 'danger' : 'success'} className="mt-3">
              {responseLog.error || responseLog.success}
            </CAlert>
          )}

          <CButton
            className="mt-4 w-100"
            onClick={handleSubmit}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
                {isEditing ? 'Updating...' : 'Sending...'}
              </>
            ) : (
              <>{isEditing ? '💾 Update Notification' : '🚀 Send Notification'}</>
            )}
          </CButton>
        </CCardBody>
      </CCard>

      {/* Table */}
      <CCard className="mb-2">
        <CCardHeader className="bg-light">
          <h6 className="mb-0">📋 Sent Notifications Log</h6>
        </CCardHeader>
        <CCardBody>
          {responseMessage && (
            <CAlert color={responseMessage.error ? 'danger' : 'success'}>
              {responseMessage.error || responseMessage.success}
            </CAlert>
          )}

          <CTable bordered hover responsive align="middle">
            <CTableHead>
              <CTableRow className="pink-table  w-auto">
                <CTableHeaderCell style={{ width: '5%' }}>#</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '20%' }}>Title</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '40%' }}>Body</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Image</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody className="pink-table">
              {paginatedNotifications.map((n, idx) => (
                <CTableRow key={idx}>
                  <CTableDataCell>{(currentPage - 1) * pageSize + idx + 1}</CTableDataCell>
                  <CTableDataCell>{n.title}</CTableDataCell>
                  <CTableDataCell>{n.body}</CTableDataCell>
                  <CTableDataCell>{new Date().toLocaleString()}</CTableDataCell>
                  <CTableDataCell>
                    {n.image ? (
                      <img src={n.image} alt="notif" style={{ width: 50, borderRadius: 5 }} />
                    ) : (
                      '-'
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {can('Push Notification', 'read') && (
                        <button className="actionBtn" title="View" onClick={() => handleView(n)}>
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Push Notification', 'update') && (
                        <button className="actionBtn" title="Edit" onClick={() => handleEdit(n)}>
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Push Notification', 'delete') && (
                        <button
                          className="actionBtn"
                          title="Delete"
                          onClick={() => {
    setSelectedItem(n.id)      // store the selected item
    setDeleteConfirm(true)  // show confirmation modal
  }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Pagination */}
          <div className="mt-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CCardBody>
      </CCard>

      {/* View Modal */}
      <CModal
        visible={viewMode}
        onClose={() => setViewMode(false)}
        backdrop="static"
        className="custom-modal"
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>View Notification</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selectedItem && (
            <>
              <div className="row mb-3" style={{ color: 'var(-color-black)' }}>
                <div className="col-md-4 mb-2">
                  <strong>Clinic ID:</strong> {selectedItem.clinicId || '—'}
                </div>
                <div className="col-md-4 mb-2">
                  <strong>Branch ID:</strong> {selectedItem.branchId || '—'}
                </div>
                <div className="col-md-4 mb-2">
                  <strong>Title:</strong> {selectedItem.title || '—'}
                </div>

                <div className="col-md-4 mb-2">
                  <strong>Body:</strong> {selectedItem.body || '—'}
                </div>
                <div className="col-md-4 mb-2">
                  <strong>Send All:</strong> {selectedItem.sendAll ? 'Yes' : 'No'}
                </div>
                <div className="col-md-4 mb-2">
                  <strong>Tokens:</strong>{' '}
                  {selectedItem.tokens ? selectedItem.tokens.join(', ') : '—'}
                </div>
              </div>

              {selectedItem.image && (
                <div className="mb-4">
                  <strong>Image:</strong>
                  <img
                    src={selectedItem.image}
                    alt="Notification Preview"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      marginTop: '5px',
                      border: '2px solid var(--main-color)',
                    }}
                  />
                </div>
              )}

              {/* ✅ Customer Data Grid */}
              {selectedItem.customerData && selectedItem.customerData.length > 0 && (
                <div>
                  <h6 className="mb-3" style={{ color: 'var(--main-color)' }}>
                    Customer Data:
                  </h6>

                  <div className="customer-grid">
                    {selectedItem.customerData.map((cust, idx) => {
                      const name = Object.keys(cust)[0]
                      const details = cust[name]
                      return (
                        <div className="customer-card" key={idx}>
                          <div className="col-item">
                            <strong style={{ color: 'var(--main-color)' }}>{name}</strong>
                            <p>📞 {details.mobileNumber}</p>
                          </div>
                          <div className="col-item">
                            <strong>Customer ID:</strong>
                            <p>{details.customerId}</p>
                          </div>
                          <div className="col-item">
                            <strong>Patient ID:</strong>
                            <p>{details.patientId}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedItem.createdAt && (
                <p className="mt-3">
                  <strong>Created At:</strong> {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewMode(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
  <ConfirmationModal
  isVisible={deleteConfirm}
  title="Delete Notification"
  message={`Are you sure you want to delete this notification? This action cannot be undone.`}
  isLoading={isLoading}
  confirmText="Yes, Delete"
  cancelText="Cancel"
  confirmColor="danger"
  cancelColor="secondary"
  onConfirm={handleDelete}
  onCancel={() => setDeleteConfirm(false)}
/>


    </div>
  )
}

export default FCMNotification
