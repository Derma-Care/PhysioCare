import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import {
  CustomerData,
  deleteCustomerData,
  addCustomer,
  updateCustomerData,
} from './CustomerManagementAPI'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Edit2, Eye, Trash2, UserPlus, Users } from 'lucide-react'
import LoadingIndicator from '../../Utils/loader'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useHospital } from '../Usecontext/HospitalContext'
import { emailPattern } from '../../Constant/Constants'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

/* ─────────────────────────────────────────────────────────────
   ⚠️  CRITICAL: These helpers MUST live outside the component.
   Defining them inside causes React to treat them as new
   component types on every render → inputs unmount → focus lost.
───────────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="cm-field">
    <label className="cm-label">
      {label}{required && <span className="cm-req">*</span>}
    </label>
    {children}
    {error && <div className="cm-error">{error}</div>}
  </div>
)

const SectionHead = ({ icon, text }) => (
  <div className="cm-section-head">
    <span className="cm-section-bar" />
    <span className="cm-section-icon">{icon}</span>
    <span className="cm-section-title">{text}</span>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
const CustomerManagement = () => {
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState([])
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentMobile, setCurrentMobile] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const { searchQuery } = useGlobalSearch()
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [postOffices, setPostOffices] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const pincodeTimer = useRef(null)

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const emptyForm = {
    hospitalId: localStorage.getItem('HospitalId') || '',
    hospitalName: localStorage.getItem('HospitalName') || '',
    branchId: localStorage.getItem('branchId') || '',
    customerId: '', title: '', firstName: '', lastName: '',
    fullName: '', mobileNumber: '', gender: '', email: '',
    dateOfBirth: '', referredBy: '', age: '',
    address: {
      houseNo: '', street: '', landmark: '', city: '',
      state: '', country: 'India', postalCode: '',
    },
  }
  const [formData, setFormData] = useState(emptyForm)

  const resetForm = () => {
    setFormData(emptyForm)
    setFormErrors({})
    setSelectedPO(null)
    setPostOffices([])
  }

  const handleNestedChange = (parentKey, childKey, value) => {
    setFormData((prev) => ({ ...prev, [parentKey]: { ...prev[parentKey], [childKey]: value } }))
    setFormErrors((prev) => ({ ...prev, [childKey]: '' }))
  }

  const handlePincodeChange = (value) => {
    if (!/^\d*$/.test(value)) return
    handleNestedChange('address', 'postalCode', value)
    if (pincodeTimer.current) clearTimeout(pincodeTimer.current)
    if (value.length === 6) {
      pincodeTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${value}`)
          const data = await res.json()
          if (data?.[0]?.Status === 'Success') setPostOffices(data[0].PostOffice || [])
          else setPostOffices([])
        } catch { setPostOffices([]) }
      }, 300)
    } else setPostOffices([])
  }

  useEffect(() => () => { if (pincodeTimer.current) clearTimeout(pincodeTimer.current) }, [])

  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await CustomerData()
      setCustomerData(Array.isArray(data) ? data.filter(Boolean) : [])
    } catch { setError('Failed to fetch customer data.'); setCustomerData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const TITLES = ['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Mx.', 'Dr.', 'Prof.', 'Rev.', 'Capt.', 'Col.']

  const handleEditCustomer = (customer) => {
    let formattedDate = ''
    if (customer.dateOfBirth) {
      const dob = customer.dateOfBirth
      if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        const [day, month, year] = dob.split('-')
        formattedDate = `${year}-${month}-${day}`
      } else {
        const d = new Date(dob)
        if (!isNaN(d)) formattedDate = d.toISOString().split('T')[0]
      }
    }

    let title = '', firstName = '', lastName = ''
    if (customer.fullName) {
      const parts = customer.fullName.trim().split(/\s+/)
      // ✅ Check first word against known titles (case-insensitive)
      const firstWord = parts[0]
      const matchedTitle = TITLES.find(
        (t) => t.toLowerCase() === firstWord.toLowerCase()
      )
      if (matchedTitle) {
        title = matchedTitle              // use canonical casing e.g. "Mr." not "mr."
        firstName = parts[1] || ''
        lastName = parts.slice(2).join(' ')
      } else {
        // No title found — entire name goes into firstName + lastName
        title = ''
        firstName = parts[0] || ''
        lastName = parts.slice(1).join(' ')
      }
    }

    setFormData({
      customerId: customer.customerId || '',
      title, firstName, lastName,
      fullName: customer.fullName || '',
      mobileNumber: customer.mobileNumber || '',
      gender: customer.gender || '',
      email: customer.email || '',
      dateOfBirth: formattedDate,
      referredBy: customer.referredBy || '',
      age: customer.age || '',
      hospitalId: localStorage.getItem('HospitalId') || '',
      hospitalName: localStorage.getItem('HospitalName') || '',
      branchId: localStorage.getItem('branchId') || '',
      address: {
        houseNo: customer.address?.houseNo || '',
        street: customer.address?.street || '',
        landmark: customer.address?.landmark || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        country: 'India',
        postalCode: customer.address?.postalCode || '',
      },
    })
    setIsAdding(true); setIsEditing(true)
    setCurrentMobile(customer.mobileNumber)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'referredBy') v = v.replace(/[^a-zA-Z0-9_]/g, '')
    setFormData((p) => ({ ...p, [name]: v }))
    if (formErrors[name]) setFormErrors((p) => { const u = { ...p }; delete u[name]; return u })
  }

  useEffect(() => {
    if (isEditing && formData.address.postalCode) handlePincodeChange(formData.address.postalCode)
  }, [isEditing])

  useEffect(() => {
    if (isEditing && postOffices.length > 0 && formData.address.city) {
      const matched = postOffices.find((po) => po.Name?.toLowerCase() === formData.address.city.toLowerCase())
      if (matched) setSelectedPO(matched)
    }
  }, [isEditing, postOffices, formData.address.city])

  const validateForm = () => {
    const errs = {}
    if (!formData.title.trim()) errs.title = 'Title is required'
    if (!formData.firstName.trim()) errs.firstName = 'First name is required'
    if (!/^[1-9]\d{9}$/.test(formData.mobileNumber)) errs.mobileNumber = 'Valid 10-digit number required'
    if (!emailPattern.test(formData.email)) errs.email = 'Valid email required'
    if (!formData.dateOfBirth.trim()) errs.dateOfBirth = 'Date of birth required'
    else {
      const d = new Date(formData.dateOfBirth)
      if (isNaN(d) || d > new Date()) errs.dateOfBirth = 'Invalid date of birth'
    }
    if (!formData.gender) errs.gender = 'Gender required'
    if (!formData.address.houseNo?.trim()) errs.houseNo = 'House number required'
    if (!formData.address.street?.trim()) errs.street = 'Street required'
    if (!formData.address.city?.trim()) errs.city = 'City required'
    if (!formData.address.state?.trim()) errs.state = 'State required'
    if (!/^\d{6}$/.test(formData.address.postalCode)) errs.postalCode = 'Valid 6-digit PIN required'
    else if (!selectedPO && !formData.address.city?.trim()) errs.postOffice = 'Select a post office'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaveLoading(true)
    try {
      const updated = {
        ...formData,
        fullName: [formData.title, formData.firstName, formData.lastName].filter(Boolean).join(' '),
        hospitalId: localStorage.getItem('HospitalId') || formData.hospitalId,
        hospitalName: localStorage.getItem('HospitalName') || formData.hospitalName,
        branchId: localStorage.getItem('branchId') || formData.branchId,
      }
      if (updated.dateOfBirth) {
        const d = new Date(updated.dateOfBirth)
        if (!isNaN(d)) {
          updated.dateOfBirth = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
        }
      }
      if (isEditing) {
        await updateCustomerData(formData.customerId, updated)
        showCustomToast('Customer updated successfully', 'success')
      } else {
        await addCustomer(updated)
        showCustomToast('Customer added successfully', 'success')
      }
      fetchCustomers(); handleCancel()
    } catch (error) {
      if (error?.response?.status === 409) showCustomToast('Customer already exists with this mobile or email', 'error')
      else showCustomToast('Something went wrong', 'error')
    } finally { setSaveLoading(false) }
  }

  const handleCancel = () => {
    setIsAdding(false); setIsEditing(false); setCurrentMobile(null); resetForm()
  }

  const confirmDeleteCustomer = async () => {
    try {
      setDelLoading(true)
      await deleteCustomerData(customerIdToDelete)
      showCustomToast('Customer deleted successfully', 'success')
      setCustomerData((prev) => prev.filter((c) => c?.customerId !== customerIdToDelete))
    } catch { /* toast handled */ }
    finally { setIsModalVisible(false); setDelLoading(false); setCustomerIdToDelete(null) }
  }

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return customerData
    return customerData.filter((item) => Object.values(item).some((v) => String(v).toLowerCase().includes(q)))
  }, [searchQuery, customerData])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <div className="cm-wrapper">
      <ToastContainer />
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={confirmDeleteCustomer}
        onCancel={() => { setIsModalVisible(false); setCustomerIdToDelete(null) }}
      />

      {/* ── LIST VIEW ── */}
      {!isAdding ? (
        <>
          <div className="cm-page-header">
            <div className="cm-page-title-group">
              <div className="cm-page-icon"><Users size={20} /></div>
              <div>
                <h4 className="cm-page-title">Patient Management</h4>
                <p className="cm-page-sub">{filteredData.length} Patient{filteredData.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>
            {can('Customer Management', 'create') && (
              <button className="cm-add-btn" onClick={() => { setIsAdding(true); resetForm() }}>
                <UserPlus size={15} /> Add New Patient
              </button>
            )}
          </div>

          {loading ? (
            <div className="cm-center"><LoadingIndicator message="Loading customers..." /></div>
          ) : error ? (
            <div className="cm-center cm-error-msg">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="cm-center cm-empty">
              <Users size={48} className="cm-empty-icon" />
              <p>No customers found</p>
            </div>
          ) : (
            <>
              <div className="cm-table-wrapper">
                <CTable hover responsive className="cm-table">
                  <CTableHead>
                    <CTableRow>
                      {['S.No', 'Patient ID', 'Full Name', 'Mobile', 'Gender', 'City', 'Actions'].map((h) => (
                        <CTableHeaderCell key={h} className="cm-th">{h}</CTableHeaderCell>
                      ))}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {displayData.map((customer, index) => (
                      <CTableRow key={customer.mobileNumber || index} className="cm-tr">
                        <CTableDataCell className="cm-td cm-td-num">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </CTableDataCell>
                        <CTableDataCell className="cm-td">
                          <span className="cm-id-pill">{customer?.customerId || '-'}</span>
                        </CTableDataCell>
                        <CTableDataCell className="cm-td cm-td-name">
                          <div className="cm-name-cell">
                            <span>{customer?.fullName || '-'}</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="cm-td">{customer?.mobileNumber || '-'}</CTableDataCell>
                        <CTableDataCell className="cm-td">
                          <span className={`cm-gender-badge ${(customer?.gender || '').toLowerCase()}`}>
                            {customer?.gender || '-'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="cm-td">{customer?.address?.city || '-'}</CTableDataCell>
                        <CTableDataCell className="cm-td">
                          <div className="cm-actions">
                            {can('Customer Management', 'read') && (
                              <button className="cm-action-btn view" title="View"
                                onClick={() => navigate('/patient-management/view', { state: { patientInfo: customer } })}>
                                <Eye size={15} />
                              </button>
                            )}
                            {can('Customer Management', 'update') && (
                              <button className="cm-action-btn edit" title="Edit"
                                onClick={() => handleEditCustomer(customer)}>
                                <Edit2 size={15} />
                              </button>
                            )}
                            {can('Customer Management', 'delete') && (
                              <button className="cm-action-btn delete" title="Delete"
                                onClick={() => { setCustomerIdToDelete(customer?.customerId); setIsModalVisible(true) }}>
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
              {displayData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredData.length / rowsPerPage)}
                  pageSize={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setRowsPerPage}
                />
              )}
            </>
          )}
        </>
      ) : (
        /* ── FORM VIEW ── */
        <div className="cm-form-wrapper">
          <div className="cm-form-header">
            <div className="cm-form-header-left">
              <div className="cm-form-icon"><UserPlus size={18} /></div>
              <div>
                <h4 className="cm-form-title">{isEditing ? 'Edit Patient' : 'Add New Patient'}</h4>
                <p className="cm-form-sub">{isEditing ? 'Update patient information' : 'Fill in the details below'}</p>
              </div>
            </div>
            <button className="cm-cancel-top-btn" onClick={handleCancel}>✕ Cancel</button>
          </div>

          <CForm onSubmit={handleFormSubmit} className="cm-form">

            {/* Section 1 – Personal Info */}
            <SectionHead icon="👤" text="Personal Information" />
            <div className="cm-grid cm-grid-4">
              <Field label="Title" required error={formErrors.title}>
                <CFormSelect name="title" value={formData.title} onChange={handleInputChange}
                  className={`cm-input${formErrors.title ? ' is-invalid' : ''}`}>
                  <option value="">Select title</option>
                  {['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Mx.', 'Dr.', 'Prof.', 'Rev.', 'Capt.', 'Col.'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </CFormSelect>
              </Field>

              <Field label="First Name" required error={formErrors.firstName}>
                <CFormInput
                  name="firstName"
                  value={formData.firstName}
                  className={`cm-input${formErrors.firstName ? ' is-invalid' : ''}`}
                  onChange={(e) =>
                    handleInputChange({ target: { name: 'firstName', value: e.target.value.replace(/[^A-Za-z\s]/g, '') } })
                  }
                  placeholder="First name"
                />
              </Field>

              <Field label="Last Name">
                <CFormInput
                  name="lastName"
                  value={formData.lastName}
                  className="cm-input"
                  onChange={(e) =>
                    handleInputChange({ target: { name: 'lastName', value: e.target.value.replace(/[^A-Za-z\s]/g, '') } })
                  }
                  placeholder="Last name"
                />
              </Field>

              <Field label="Gender" required error={formErrors.gender}>
                <CFormSelect name="gender" value={formData.gender} onChange={handleInputChange}
                  className={`cm-input${formErrors.gender ? ' is-invalid' : ''}`}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </CFormSelect>
              </Field>

              <Field label="Date of Birth" required error={formErrors.dateOfBirth}>
                <CFormInput
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  className={`cm-input${formErrors.dateOfBirth ? ' is-invalid' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    handleInputChange(e)
                    const dob = new Date(e.target.value)
                    if (!isNaN(dob)) {
                      const age = Math.abs(new Date(Date.now() - dob).getUTCFullYear() - 1970)
                      setFormData((p) => ({ ...p, age: age.toString() }))
                    } else {
                      setFormData((p) => ({ ...p, age: '' }))
                    }
                  }}
                />
              </Field>

              <Field label="Age">
                <CFormInput value={formData.age || ''} className="cm-input cm-input-readonly" readOnly placeholder="Auto-calculated" />
              </Field>

              <Field label="Email" required error={formErrors.email}>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  className={`cm-input${formErrors.email ? ' is-invalid' : ''}`}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              </Field>

              <Field label="Mobile Number" required error={formErrors.mobileNumber}>
                <CFormInput
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  maxLength={10}
                  className={`cm-input${formErrors.mobileNumber ? ' is-invalid' : ''}`}
                  onChange={(e) => { if (/^[0-9]*$/.test(e.target.value)) handleInputChange(e) }}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="10-digit number"
                />
              </Field>
            </div>

            <div className="cm-divider" />

            {/* Section 2 – Address */}
            <SectionHead icon="📍" text="Address Details" />
            <div className="cm-grid cm-grid-4">
              <Field label="House / Bldg / Apt" required error={formErrors.houseNo}>
                <CFormInput
                  value={formData.address.houseNo}
                  className={`cm-input${formErrors.houseNo ? ' is-invalid' : ''}`}
                  onChange={(e) => handleNestedChange('address', 'houseNo', e.target.value)}
                  placeholder="Flat / House no."
                />
              </Field>

              <Field label="Postal Code" required error={formErrors.postalCode}>
                <CFormInput
                  value={formData.address.postalCode}
                  maxLength={6}
                  className={`cm-input${formErrors.postalCode ? ' is-invalid' : ''}`}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="6-digit PIN"
                />
              </Field>

              <Field label="Post Office" required error={formErrors.postOffice}>
                <CFormSelect
                  className="cm-input"
                  value={selectedPO?.Name || formData.address.city || ''}
                  onChange={(e) => {
                    const po = postOffices.find((p) => p.Name === e.target.value)
                    setSelectedPO(po)
                    if (po) {
                      handleNestedChange('address', 'city', po.Name || '')
                      handleNestedChange('address', 'state', po.State || '')
                    }
                  }}>
                  <option value="">-- Select Post Office --</option>
                  {postOffices.map((po) => <option key={po.Name} value={po.Name}>{po.Name}</option>)}
                </CFormSelect>
              </Field>

              <Field label="Landmark">
                <CFormInput
                  value={formData.address.landmark}
                  className="cm-input"
                  onChange={(e) => handleNestedChange('address', 'landmark', e.target.value)}
                  placeholder="Nearby landmark"
                />
              </Field>

              <Field label="Street / Road / Lane" required error={formErrors.street}>
                <CFormInput
                  value={formData.address.street}
                  className={`cm-input${formErrors.street ? ' is-invalid' : ''}`}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                  placeholder="Street name"
                />
              </Field>

              <Field label="Village / Town / City" required error={formErrors.city}>
                <CFormInput
                  value={formData.address.city}
                  className={`cm-input${formErrors.city ? ' is-invalid' : ''}`}
                  onChange={(e) => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value))
                      handleNestedChange('address', 'city', e.target.value)
                  }}
                  placeholder="City"
                />
              </Field>

              <Field label="State" required error={formErrors.state}>
                <CFormInput
                  value={formData.address.state}
                  className={`cm-input${formErrors.state ? ' is-invalid' : ''}`}
                  onChange={(e) => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value))
                      handleNestedChange('address', 'state', e.target.value)
                  }}
                  placeholder="State"
                />
              </Field>

              <Field label="Country">
                <CFormInput
                  value={formData.address.country}
                  className="cm-input"
                  onChange={(e) => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value))
                      handleNestedChange('address', 'country', e.target.value)
                  }}
                  placeholder="Country"
                />
              </Field>
            </div>

            <div className="cm-divider" />

            {/* Section 3 – Other */}
            <SectionHead icon="🔗" text="Other Details" />
            <div className="cm-grid cm-grid-4">
              <Field label="Referral Code (optional)" error={formErrors.referredBy}>
                <CFormInput
                  name="referredBy"
                  value={formData.referredBy}
                  className={`cm-input${formErrors.referredBy ? ' is-invalid' : ''}`}
                  onChange={handleInputChange}
                  placeholder="Enter referral code"
                  disabled={isEditing}
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="cm-form-footer">
              <button type="button" className="cm-btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="button" className="cm-btn-secondary" onClick={resetForm}>Reset</button>
              <button type="submit" className="cm-btn-primary" disabled={saveloading}>
                {saveloading && <span className="spinner-border spinner-border-sm me-2" />}
                {saveloading
                  ? (isEditing ? 'Updating...' : 'Saving...')
                  : (isEditing ? 'Update Patient' : 'Save Patient')}
              </button>
            </div>
          </CForm>
        </div>
      )}

      {/* ─── Styles ─── */}
      <style>{`
        .cm-wrapper { padding: 2px 0; font-family: inherit; }

        .cm-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .cm-page-title-group { display: flex; align-items: center; gap: 12px; }
        .cm-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center; justify-content: center;
          color: #185fa5; flex-shrink: 0;
        }
        .cm-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .cm-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        .cm-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 9px 18px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.20);
          transition: background 0.15s, transform 0.1s;
        }
        .cm-add-btn:hover  { background: #0c447c; }
        .cm-add-btn:active { transform: scale(0.98); }

        .cm-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; margin-bottom: 12px;
        }
        .cm-table { margin-bottom: 0; font-size: 13px; }
        .cm-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px; font-weight: 600; padding: 11px 14px !important;
          white-space: nowrap; border: none !important;
        }
        .cm-tr { transition: background 0.12s; }
        .cm-tr:hover { background: #f0f5fb !important; }
        .cm-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .cm-td-num { color: #9ca3af; font-size: 12px; }

        .cm-id-pill {
          background: #e6f1fb; color: #185fa5;
          font-size: 11px; font-weight: 600;
          padding: 2px 8px; border-radius: 20px;
          border: 0.5px solid #b5d4f4; white-space: nowrap;
        }
        .cm-name-cell { display: flex; align-items: center; gap: 9px; }

        .cm-gender-badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 20px; }
        .cm-gender-badge.male   { background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4; }
        .cm-gender-badge.female { background: #fbeaf0; color: #993556; border: 0.5px solid #f4c0d1; }
        .cm-gender-badge.others { background: #f1efe8; color: #5f5e5a; border: 0.5px solid #d3d1c7; }

        .cm-actions { display: flex; gap: 6px; align-items: center; }
        .cm-action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .cm-action-btn.view   { background: #e6f1fb; color: #185fa5; }
        .cm-action-btn.edit   { background: #eaf3de; color: #3b6d11; }
        .cm-action-btn.delete { background: #fcebeb; color: #a32d2d; }
        .cm-action-btn:hover  { filter: brightness(0.92); transform: scale(1.07); }
        .cm-action-btn:active { transform: scale(0.95); }

        .cm-center {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center; min-height: 40vh; gap: 12px;
        }
        .cm-empty      { color: #9ca3af; font-size: 15px; }
        .cm-empty-icon { color: #d0dce9; }
        .cm-error-msg  { color: #a32d2d; font-size: 14px; }

        .cm-form-wrapper {
          background: #fff; border: 0.5px solid #d0dce9;
          border-radius: 12px; overflow: hidden;
        }
        .cm-form-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px; background: #185fa5; flex-wrap: wrap; gap: 12px;
        }
        .cm-form-header-left { display: flex; align-items: center; gap: 12px; }
        .cm-form-icon {
          width: 38px; height: 38px; border-radius: 9px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .cm-form-title { font-size: 16px; font-weight: 600; color: #fff; margin: 0; }
        .cm-form-sub   { font-size: 12px; color: rgba(255,255,255,0.75); margin: 0; }
        .cm-cancel-top-btn {
          background: rgba(255,255,255,0.15); color: #fff;
          border: 0.5px solid rgba(255,255,255,0.30);
          border-radius: 7px; padding: 6px 14px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: background 0.15s;
        }
        .cm-cancel-top-btn:hover { background: rgba(255,255,255,0.25); }

        .cm-form { padding: 20px 22px; background: #f7fafd; }

        .cm-section-head {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 14px; margin-top: 4px;
        }
        .cm-section-bar   { width: 3px; height: 18px; background: #185fa5; border-radius: 2px; flex-shrink: 0; }
        .cm-section-icon  { font-size: 15px; }
        .cm-section-title { font-size: 13px; font-weight: 600; color: #0c447c; }

        .cm-divider { border: none; border-top: 0.5px solid #d0dce9; margin: 18px 0 16px; }

        .cm-grid   { display: grid; gap: 14px; margin-bottom: 4px; }
        .cm-grid-4 { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 900px) { .cm-grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .cm-grid-4 { grid-template-columns: 1fr; } }

        .cm-field { display: flex; flex-direction: column; gap: 4px; }
        .cm-label { font-size: 12px; font-weight: 500; color: #374151; }
        .cm-req   { color: #e24b4a; margin-left: 2px; }
        .cm-error { font-size: 11px; color: #a32d2d; margin-top: 1px; }

        .cm-input {
          width: 100%; height: 36px; padding: 0 10px;
          border: 0.5px solid #ced4da; border-radius: 7px;
          font-size: 13px; color: #374151; background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s; outline: none;
        }
        .cm-input:focus { border-color: #185fa5; box-shadow: 0 0 0 2px rgba(24,95,165,0.15); }
        .cm-input.is-invalid { border-color: #e24b4a !important; }
        .cm-input-readonly { background: #f0f5fb !important; color: #6b7280 !important; cursor: not-allowed; }
        select.cm-input { height: 36px; }
        textarea.cm-input { height: auto; padding: 8px 10px; }

        .cm-form-footer {
          display: flex; justify-content: flex-end; gap: 8px;
          margin-top: 20px; padding-top: 16px; border-top: 0.5px solid #d0dce9;
        }
        .cm-btn-primary {
          display: inline-flex; align-items: center;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 9px 22px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.20);
          transition: background 0.15s, transform 0.1s;
        }
        .cm-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .cm-btn-primary:active:not(:disabled)  { transform: scale(0.98); }
        .cm-btn-primary:disabled               { opacity: 0.6; cursor: not-allowed; }
        .cm-btn-secondary {
          background: #fff; color: #374151;
          border: 0.5px solid #d0dce9; border-radius: 8px;
          padding: 9px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .cm-btn-secondary:hover { background: #f0f5fb; }
      `}</style>
    </div>
  )
}

export default React.memo(CustomerManagement)