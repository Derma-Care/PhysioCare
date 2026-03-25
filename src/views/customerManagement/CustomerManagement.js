import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import {
  CustomerData,
  deleteCustomerData,
  addCustomer,
  CustomerByCustomerId,
  updateCustomerData,
} from './CustomerManagementAPI'

import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import LoadingIndicator from '../../Utils/loader'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useHospital } from '../Usecontext/HospitalContext'
import {
  FaBirthdayCake,
  FaCalendarAlt,
  FaEnvelope,
  FaHashtag,
  FaMapMarkerAlt,
  FaPhone,
  FaTransgender,
  FaUser,
  FaIdBadge,
  FaUserFriends,
  FaGift,
  FaIdCard,
} from 'react-icons/fa'
import { emailPattern } from '../../Constant/Constants'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'
const CustomerManagement = () => {
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState([])
  // const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentMobile, setCurrentMobile] = useState(null)
  const [formattedDisplayDate, setFormattedDisplayDate] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [isAdding, setIsAdding] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewCustomerData, setViewCustomerData] = useState(null)
  const [saveloading, setSaveLoading] = useState(false)

  const [formData, setFormData] = useState({
    hospitalId: localStorage.getItem('HospitalId') || '',
    hospitalName: localStorage.getItem('HospitalName') || '',
    branchId: localStorage.getItem('branchId') || '',
    customerId: '',
    title: '',
    firstName: '',
    lastName: '',
    fullName: '',
    mobileNumber: '',
    gender: '',
    email: '',
    dateOfBirth: '',
    referredBy: '',
    age: '',

    address: {
      // ✅ Always keep this object ready
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
  })

  // ======= state for states + helper refs =======

  const [postOffices, setPostOffices] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const pincodeTimer = useRef(null)

  const resetForm = () => {
    setFormData({
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: '',
      email: '',
      mobileNumber: '',
      gender: '',
      referredBy: '',
      address: {
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
      },
    })
    setFormErrors({})
    setSelectedPO(null) // ✅ reset post office selection
    setPostOffices([]) // ✅ clear post office list
  }

  // ======= nested change handler (if you haven't already) =======
  const handleNestedChange = (parentKey, childKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value,
      },
    }))

    // Clear the error for this field if it exists
    setFormErrors((prev) => ({
      ...prev,
      [childKey]: '', // clear error for this specific field
    }))
  }

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ======= pincode handler with debounce + postal API =======
  const handlePincodeChange = (value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    handleNestedChange('address', 'postalCode', value)

    // Clear previous timer
    if (pincodeTimer.current) clearTimeout(pincodeTimer.current)

    // Only call API when exactly 6 digits
    if (value.length === 6) {
      pincodeTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${value}`)
          if (!res.ok) throw new Error(`pincode API ${res.status}`)
          const data = await res.json()

          if (data?.[0]?.Status === 'Success' && Array.isArray(data[0].PostOffice)) {
            setPostOffices(data[0].PostOffice) // save all PO entries
          } else {
            console.warn('No PostOffice data returned for pincode', value, data)
            setPostOffices([])
          }
        } catch (err) {
          console.warn('Error fetching pincode data:', err)
          setPostOffices([])
        }
      }, 300) // debounce
    } else {
      setPostOffices([]) // clear if PIN < 6 digits
    }
  }

  // clear timer on unmount
  useEffect(() => {
    return () => {
      if (pincodeTimer.current) clearTimeout(pincodeTimer.current)
    }
  }, [])

  const getISODate = (date) => date.toISOString().split('T')[0]

  const centeredMessageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.5rem',
    color: '#808080',
  }

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await CustomerData()
      const safeData = Array.isArray(data)
        ? data.filter((item) => item && typeof item === 'object')
        : []
      setCustomerData(safeData)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customer data.')
      setCustomerData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const capitalizeWords = (str) => {
    if (!str) return ''
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }
  const handleCustomerViewDetails = async (customerId) => {
    try {
      setLoading(true)
      const response = await CustomerByCustomerId(customerId)
      const customer = Array.isArray(response) ? response[0] : response

      setViewCustomerData(customer)
      setIsViewModalVisible(true)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      // showCustomToast('Failed to load customer data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    // const confirmed = window.confirm('Are you sure you want to delete this customer?')
    setCustomerIdToDelete(customerId)
    setIsModalVisible(true)

    try {
      await deleteCustomerData(customerId)
      showCustomToast('Customer deleted successfully', 'success')
      const updatedData = customerData.filter((customer) => customer?.customerId !== customerId)
      setCustomerData(updatedData)
    } catch (error) {
      console.error('Delete failed:', error)
      // showCustomToast('Failed to delete customer', 'error')
    }
  }

  const handleEditCustomer = async (customerId) => {
    try {
      setLoading(true)
      const response = await CustomerByCustomerId(customerId)
      const customer = Array.isArray(response) ? response[0] : response

      // Format date to YYYY-MM-DD for <input type="date">
      let formattedDate = ''
      if (customer.dateOfBirth) {
        const dob = customer.dateOfBirth
        if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
          const [day, month, year] = dob.split('-')
          formattedDate = `${year}-${month}-${day}`
        } else {
          const dateObj = new Date(dob)
          if (!isNaN(dateObj)) {
            const y = dateObj.getFullYear()
            const m = String(dateObj.getMonth() + 1).padStart(2, '0')
            const d = String(dateObj.getDate()).padStart(2, '0')
            formattedDate = `${y}-${m}-${d}`
          }
        }
      }

      let title = ''
      let firstName = ''
      let lastName = ''

      if (customer.fullName) {
        const parts = customer.fullName.trim().split(' ')
        if (parts.length >= 3) {
          title = parts[0]
          firstName = parts[1]
          lastName = parts.slice(2).join(' ') // handles middle/last names
        } else if (parts.length === 2) {
          title = parts[0]
          firstName = parts[1]
        } else if (parts.length === 1) {
          firstName = parts[0]
        }
      }

      setFormData({
        customerId: customer.customerId || '',
        title,
        firstName,
        lastName,
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

      setIsAdding(true)
      setIsEditing(true)
      setCurrentMobile(customer.mobileNumber)
      setViewCustomerData(customer)
      // setIsViewModalVisible(true)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      // showCustomToast('Failed to load customer data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    let newValue = value
    if (name === 'referredBy') {
      // Allow letters, numbers, and underscore
      newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '')
    }

    setFormData({ ...formData, [name]: newValue })

    // Clear error
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  useEffect(() => {
    if (isEditing && formData.address.postalCode) {
      handlePincodeChange(formData.address.postalCode)
    }
  }, [isEditing])
  // ✅ Auto-select PO during edit
  useEffect(() => {
    if (isEditing && postOffices.length > 0 && formData.address.city) {
      const matchedPO = postOffices.find(
        (po) => po.Name?.toLowerCase() === formData.address.city.toLowerCase(),
      )
      if (matchedPO) {
        setSelectedPO(matchedPO)
      }
    }
  }, [isEditing, postOffices, formData.address.city])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    console.log('Submitting form', formData)

    // ✅ Validate the form first
    if (!validateForm()) return
    setSaveLoading(true)
    try {
      const updatedFormData = {
        ...formData,
        // Ensure fullName is combined
        fullName: `${formData.title} ${formData.firstName} ${formData.lastName}`.trim(),
        // Include hospital info from localStorage
        hospitalId: localStorage.getItem('HospitalId') || '',
        hospitalName: localStorage.getItem('HospitalName') || '',
        branchId: localStorage.getItem('branchId') || '',
      }

      // Format DOB to DD-MM-YYYY
      if (updatedFormData.dateOfBirth) {
        const dateObj = new Date(updatedFormData.dateOfBirth)
        if (!isNaN(dateObj)) {
          const day = String(dateObj.getDate()).padStart(2, '0')
          const month = String(dateObj.getMonth() + 1).padStart(2, '0')
          const year = dateObj.getFullYear()
          updatedFormData.dateOfBirth = `${day}-${month}-${year}`
        }
      }

      if (isEditing) {
        // ✅ Update customer
        await updateCustomerData(formData.customerId, updatedFormData)
        showCustomToast('Customer updated successfully', 'success')
      } else {
        // ✅ Add customer
        await addCustomer(updatedFormData)
        showCustomToast('Customer added successfully', 'success')
        setFormData({
          title: '',
          firstName: '',
          lastName: '',
          fullName: '',
          dateOfBirth: '',
          email: '',
          mobileNumber: '',
          gender: '',
          address: {
            houseNo: '',
            postalCode: '',
            street: '',
            landmark: '',
            city: '',
            state: '',
            country: '',
          },
          referredBy: '',
        })
      }

      fetchCustomers()
      handleCancel()
    } catch (error) {
      console.error('Error submitting customer:', error)
      if (error?.response?.status === 409) {
        showCustomToast('Customer already exists with this mobile number or email.', 'error')
      } else {
        showCustomToast('Something went wrong while submitting.', 'error')
      }
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset editing and adding state
    setIsAdding(false)
    setIsEditing(false)
    setCurrentMobile(null)

    // Close view modal only if we are canceling from "view" mode,
    // not when canceling from "edit"
    if (!isEditing) {
      setIsViewing(false)
    }

    // Reset form
    setFormData({
      customerId: '',
      title: '',
      firstName: '',
      lastName: '',
      fullName: '',
      mobileNumber: '',
      gender: '',
      email: '',
      dateOfBirth: '',
      referredBy: '',
      age: '',

      address: {
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
      },
    })
  }

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return customerData
    return customerData.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, customerData])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const formatDateToDDMMYYYY = (dateStr) => {
    const date = new Date(dateStr)
    if (!isNaN(date)) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
    return ''
  }

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      hospitalId: localStorage.getItem('HospitalId') || '',
      hospitalName: localStorage.getItem('HospitalName') || '',
      branchId: localStorage.getItem('branchId') || '',
    }))
  }, []) // run once on mount

  useEffect(() => {
  const postalInput = document.querySelector('input[placeholder="6-digit PIN"]');
  if (!postalInput) return;

  // Run once on mount or when browser autofills value
  const checkAutofill = () => {
    const val = postalInput.value?.trim();
    if (val && val.length === 6) {
      // Ensure formData updates if autofilled value not detected by onChange
      handlePincodeChange(val);
    }
  };

  // Run immediately (for already autofilled fields)
  checkAutofill();

  // Listen for autofill after a short delay
  const interval = setInterval(checkAutofill, 500);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const dateObj = new Date(formData.dateOfBirth)
      if (!isNaN(dateObj)) {
        const day = String(dateObj.getDate()).padStart(2, '0')
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const year = dateObj.getFullYear()
        setFormattedDisplayDate(`${day}-${month}-${year}`)
      } else {
        setFormattedDisplayDate('')
      }
    } else {
      setFormattedDisplayDate('')
    }
  }, [formData.dateOfBirth])

  const confirmDeleteCustomer = async () => {
    try {
      setDelLoading(true)
      await deleteCustomerData(customerIdToDelete)
      showCustomToast('Customer deleted successfully', 'success')

      const updatedData = customerData.filter(
        (customer) => customer?.customerId !== customerIdToDelete,
      )

      setCustomerData(updatedData)
    } catch (error) {
      console.error('Delete failed:', error)
      // showCustomToast('Failed to delete customer', 'error')
    } finally {
      setIsModalVisible(false)
      setDelLoading(false)
      setCustomerIdToDelete(null)
    }
  }

  const validateForm = () => {
    const errors = {}

    // Title
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (/\d/.test(formData.title)) {
      errors.title = 'Title should not contain numbers'
    }

    // First Name
    if (!formData.firstName.trim()) {
      errors.firstName = 'First Name is required'
    } else if (/\d/.test(formData.firstName)) {
      errors.firstName = 'First Name should not contain numbers'
    }

    // Mobile Number
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required'
    } else if (!/^[1-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be 10 digits (starting from 1-9)'
    }

    // Email
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailPattern.test(formData.email)) {
      errors.email = 'Email must be valid and contain at least one letter'
    }

    // Date of Birth
    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = 'Date of Birth is required'
    } else {
      const date = new Date(formData.dateOfBirth)
      const year = date.getFullYear()
      const today = new Date()

      if (isNaN(date)) {
        errors.dateOfBirth = 'Invalid Date of Birth'
      } else if (year.toString().length !== 4) {
        errors.dateOfBirth = 'Year must be 4 digits'
      } else if (date > today) {
        errors.dateOfBirth = 'Date of Birth cannot be in the future'
      } else {
        const oldestAllowedDate = new Date()
        oldestAllowedDate.setFullYear(today.getFullYear() - 120)
        if (date < oldestAllowedDate) {
          errors.dateOfBirth = 'Date of Birth must not be more than 120 years ago'
        }
      }
    }

    // Gender
    if (!formData.gender) {
      errors.gender = 'Gender is required'
    }

    // Referral code (optional, limited characters)
    const referral = formData.referredBy?.trim()
    if (referral && /[^a-zA-Z0-9-_@#]/.test(referral)) {
      errors.referredBy = 'Referral code can only contain letters, numbers, and - _ @ #'
    }

    // ===================== ADDRESS VALIDATION =====================
    const address = formData.address || {}
    if (!address.houseNo?.trim()) errors.houseNo = 'House number is required'
    if (!address.street?.trim()) errors.street = 'Street is required'

    if (!address.city?.trim()) errors.city = 'City is required'
    if (!address.state?.trim()) errors.state = 'State is required'
   // ✅ Smart Post Office validation
if (!address.postalCode?.trim()) {
  errors.postalCode = 'Postal code is required'
} else if (!/^\d{6}$/.test(address.postalCode)) {
  errors.postalCode = 'Postal code must be 6 digits'
} else {
  // ✅ Handle autofill case: if city/state already filled, skip "Select PO" error
  const hasAutoPO =
    address.city?.trim() &&
    address.state?.trim() &&
    postOffices.some(
      (po) =>
        po.Name?.toLowerCase() === address.city.toLowerCase() &&
        po.State?.toLowerCase() === address.state.toLowerCase()
    )

  if (!(selectedPO || hasAutoPO)) {
    errors.postOffice = 'Please select a Post Office'
  }
}


    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  return (
    <>
      {!isAdding ? (
        <>
          <CRow className="d-flex align-items-center mb-3">
            <ToastContainer />

            {can('Customer Management', 'create') && (
              <div
                className="mb-3 w-100"
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignContent: 'end',
                  alignItems: 'end',
                }}
              >
                <CButton
                  style={{
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                  }}
                  onClick={() => {
                    setIsAdding(true)
                    resetForm() // ✅ Reset form including selectedPO and postOffices
                  }}
                >
                  Add New Customer
                </CButton>
              </div>
            )}

            {/* <div className="col-md-3 d-flex justify-content-end">
              <CButton className="btn btn-primary w-auto" onClick={() => setIsAdding(true)}>
                Add New Customer
              </CButton>
            </div> */}
          </CRow>

          <ConfirmationModal
            isVisible={isModalVisible}
            title="Delete Customer"
            message="Are you sure you want to delete this Customer? This action cannot be undone."
            isLoading={delloading}
            confirmText="Yes, Delete"
            cancelText="Cancel"
            confirmColor="danger"
            cancelColor="secondary"
            onConfirm={confirmDeleteCustomer}
            onCancel={() => {
              setIsModalVisible(false)
              setCustomerIdToDelete(null)
            }}
          />

          {loading ? (
            <div className="d-flex justify-content-center align-items-center">
              <LoadingIndicator message="Loading customers..." />
            </div>
          ) : error ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: '50vh', // full screen height

                color: 'var(--color-black)',
              }}
            >
              {error}
            </div>
          ) : filteredData.length === 0 ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: '50vh', // full screen height

                color: 'var(--color-black)',
              }}
            >
              No Customer Data Found
            </div>
          ) : (
            <>
              <CTable hover striped responsive>
                <CTableHead className="pink-table  w-auto">
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Customer Id</CTableHeaderCell>
                    <CTableHeaderCell>Full Name</CTableHeaderCell>
                    <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                    <CTableHeaderCell>Gender</CTableHeaderCell>
                    <CTableHeaderCell>City</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody className="pink-table">
                  {displayData.length > 0 ? (
                    displayData.map((customer, index) => (
                      <CTableRow key={customer.mobileNumber || index}>
                        <CTableDataCell>
                          {' '}
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </CTableDataCell>
                        <CTableDataCell>{customer?.customerId || '-'}</CTableDataCell>
                        <CTableDataCell>{customer?.fullName || '-'}</CTableDataCell>
                        <CTableDataCell>{customer?.mobileNumber || '-'}</CTableDataCell>
                        <CTableDataCell>{customer?.gender || '-'}</CTableDataCell>
                        <CTableDataCell>{customer?.address?.city || '-'}</CTableDataCell>

                        <CTableDataCell className="text-end">
                          <div className="d-flex justify-content-end gap-2  ">
                            {can('Customer Management', 'read') && (
                              <button
                                className="actionBtn"
                                onClick={() => handleCustomerViewDetails(customer?.customerId)}
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                            {can('Customer Management', 'update') && (
                              <button
                                className="actionBtn"
                                onClick={() => handleEditCustomer(customer?.customerId)}
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
                            {can('Customer Management', 'delete') && (
                              <button
                                className="actionBtn"
                                onClick={() => {
                                  setCustomerIdToDelete(customer?.customerId)
                                  setIsModalVisible(true)
                                }}
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted">
                        🔍 No diseases found matching "<b>{searchQuery}</b>"
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
              <CModal
                visible={isViewModalVisible}
                onClose={() => setIsViewModalVisible(false)}
                size="lg"
                scrollable
              >
                <CModalHeader>
                  <CModalTitle>Customer Details</CModalTitle>
                </CModalHeader>
                <CModalBody style={{ color: 'var(--color-black)' }}>
                  {loading ? (
                    <div className="text-center py-5">Loading...</div>
                  ) : viewCustomerData ? (
                    <div className="customer-details-modal">
                      {/* Personal Info */}
                      <CRow className="mb-4">
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaIdCard className="me-2" />
                            Customer ID:
                          </strong>{' '}
                          {viewCustomerData.customerId || 'N/A'}
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaUser className="me-2" />
                            Full Name:
                          </strong>{' '}
                          {viewCustomerData.fullName || 'N/A'}
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaTransgender className="me-2" />
                            Gender:
                          </strong>{' '}
                          {viewCustomerData.gender || 'N/A'}
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaBirthdayCake className="me-2" />
                            DOB:
                          </strong>{' '}
                          {viewCustomerData.dateOfBirth || 'N/A'}
                        </CCol>
                        <CCol md={6}>
                          <strong>
                            <FaCalendarAlt className="me-2" />
                            Age:
                          </strong>{' '}
                          {viewCustomerData.age || 'N/A'} Yrs
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaPhone className="me-2" />
                            Mobile:
                          </strong>{' '}
                          {viewCustomerData.mobileNumber || 'N/A'}
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaEnvelope className="me-2" />
                            Email:
                          </strong>{' '}
                          {viewCustomerData.email || 'N/A'}
                        </CCol>
                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaIdBadge className="me-2" /> Patient ID:
                          </strong>{' '}
                          {viewCustomerData.patientId || 'N/A'}
                        </CCol>

                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaUserFriends className="me-2" /> Referred By:
                          </strong>{' '}
                          {viewCustomerData.referredBy || 'N/A'}
                        </CCol>

                        <CCol md={6} className="mb-2">
                          <strong>
                            <FaGift className="me-2" /> Referral Code:
                          </strong>{' '}
                          {viewCustomerData.referralCode || 'N/A'}
                        </CCol>

                        <CCol md={12}>
                          <strong>
                            <FaMapMarkerAlt className="me-2" />
                            Address:
                          </strong>
                          <p className="ms-4 mb-0">
                            {viewCustomerData.address?.houseNo || ''},{' '}
                            {viewCustomerData.address?.street || ''},{' '}
                            {viewCustomerData.address?.landmark || ''},<br />
                            {viewCustomerData.address?.city || ''},{' '}
                            {viewCustomerData.address?.state || ''},{' '}
                            {viewCustomerData.address?.postalCode || ''},{' '}
                            {viewCustomerData.address?.country || ''}
                          </p>
                        </CCol>
                      </CRow>
                    </div>
                  ) : (
                    <p className="text-center text-muted py-4">No customer data available.</p>
                  )}
                </CModalBody>
                <CModalFooter>
                  <CButton color="secondary" onClick={() => setIsViewModalVisible(false)}>
                    Close
                  </CButton>
                </CModalFooter>
              </CModal>

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
        <>
          <h4 className="mb-4">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h4>
          <CForm onSubmit={handleFormSubmit}>
            <CRow className="mb-3">
              {/* Title Dropdown */}
              <CCol md={3}>
                <CFormLabel>
                  Title <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  invalid={!!formErrors.title}
                >
                  <option value="">Select Title</option>
                  {/* Common Personal Titles */}
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mx.">Mx.</option>

                  {/* Professional Titles */}
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Rev.">Rev.</option>
                  <option value="Sir">Sir.</option>
                  <option value="Dame">Dame.</option>
                  <option value="Lord">Lord</option>
                  <option value="Lady">Lady</option>

                  {/* Other Titles */}
                  <option value="Capt.">Capt.</option>
                  <option value="Col.">Col.</option>
                  <option value="Gen.">Gen.</option>
                  <option value="Hon.">Hon.</option>
                </CFormSelect>
                {formErrors.title && <div className="text-danger small">{formErrors.title}</div>}
              </CCol>

              {/* First Name */}
              <CCol md={3}>
                <CFormLabel>
                  First Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => {
                    // Remove numbers and special characters, allow only letters and spaces
                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                    handleInputChange({ target: { name: 'firstName', value } })
                  }}
                  invalid={!!formErrors.firstName}
                />
                {formErrors.firstName && (
                  <div className="text-danger small">{formErrors.firstName}</div>
                )}
              </CCol>

              {/* Last Name */}
              <CCol md={3}>
                <CFormLabel>Last Name</CFormLabel>
                <CFormInput
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => {
                    // Remove numbers and special characters, allow only letters and spaces
                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                    handleInputChange({ target: { name: 'lastName', value } })
                  }}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Date of Birth <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    handleInputChange(e)
                    const dob = new Date(e.target.value)
                    if (!isNaN(dob)) {
                      const diff = Date.now() - dob.getTime()
                      const ageDt = new Date(diff)
                      const age = Math.abs(ageDt.getUTCFullYear() - 1970)
                      setFormData((prev) => ({ ...prev, age: age.toString() }))
                    } else {
                      setFormData((prev) => ({ ...prev, age: '' }))
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  invalid={!!formErrors.dateOfBirth}
                />
                {formErrors.dateOfBirth && (
                  <div className="text-danger small">{formErrors.dateOfBirth}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              {/* Age (same row, not downside) */}
              <CCol md={3}>
                <CFormLabel>Age</CFormLabel>
                <CFormInput name="age" value={formData.age || ''} readOnly />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Email <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  invalid={!!formErrors.email}
                />
                {formErrors.email && <div className="text-danger small">{formErrors.email}</div>}
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Mobile Number
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value
                    // allow only digits
                    if (/^[0-9]*$/.test(value)) {
                      handleInputChange(e)
                    }
                  }}
                  onPaste={(e) => e.preventDefault()} // block pasting
                  maxLength={10}
                  invalid={!!formErrors.mobileNumber}
                  // disabled={isEditing}
                />

                {formErrors.mobileNumber && (
                  <div className="text-danger small">{formErrors.mobileNumber}</div>
                )}
              </CCol>
              {/* Gender */}
              <CCol md={3}>
                <CFormLabel>
                  Gender <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  invalid={!!formErrors.gender}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </CFormSelect>
                {formErrors.gender && <div className="text-danger small">{formErrors.gender}</div>}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={3}>
                <CFormLabel>
                  House/Bldg./Apt <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.address.houseNo}
                  onChange={(e) => handleNestedChange('address', 'houseNo', e.target.value)}
                  invalid={!!formErrors.houseNo}
                />
                {formErrors.houseNo && (
                  <div className="text-danger small">{formErrors.houseNo}</div>
                )}
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Postal Code <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.address.postalCode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  maxLength={6}
                  placeholder="6-digit PIN"
                  invalid={!!formErrors.postalCode}
                />
                {formErrors.postalCode && (
                  <div className="text-danger small">{formErrors.postalCode}</div>
                )}
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  PO Address <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={selectedPO?.Name || formData.address.city || ''} // ✅ use city for restore
                  onChange={(e) => {
                    const po = postOffices.find((po) => po.Name === e.target.value)
                    setSelectedPO(po)

                    if (po) {
                      handleNestedChange('address', 'city', po.Name || '') // ✅ save PO name as city
                      handleNestedChange('address', 'state', po.State || '')
                    }
                  }}
                >
                  <option value="">-- Select Post Office --</option>
                  {postOffices.map((po) => (
                    <option key={po.Name} value={po.Name}>
                      {po.Name}
                    </option>
                  ))}
                </CFormSelect>

                {formErrors.postOffice && (
                  <div className="text-danger small">{formErrors.postOffice}</div>
                )}
              </CCol>

              <CCol md={3}>
                <CFormLabel>Landmark</CFormLabel>
                <CFormInput
                  value={formData.address.landmark}
                  onChange={(e) => handleNestedChange('address', 'landmark', e.target.value)}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={3}>
                <CFormLabel>
                  Street/Road/Lane <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.address.street}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                  invalid={!!formErrors.street}
                />
                {formErrors.street && <div className="text-danger small">{formErrors.street}</div>}
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Village/Town/City <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.address.city}
                  onChange={(e) => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value))
                      handleNestedChange('address', 'city', e.target.value)
                  }}
                  invalid={!!formErrors.city}
                />
                {formErrors.city && <div className="text-danger small">{formErrors.city}</div>}
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  State <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.address.state}
                  onChange={(e) => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value))
                      handleNestedChange('address', 'state', e.target.value)
                  }}
                  invalid={!!formErrors.state}
                />
                {formErrors.state && <div className="text-danger small">{formErrors.state}</div>}
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Country <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  value={formData.address.country}
                  onChange={(e) => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value))
                      handleNestedChange('address', 'country', e.target.value)
                  }}
                  invalid={!!formErrors.country}
                />
                {formErrors.country && (
                  <div className="text-danger small">{formErrors.country}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={3}>
                <CFormLabel>Referral Code (optional)</CFormLabel>
                <CFormInput
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                  placeholder="Enter referral code"
                  disabled={isEditing}
                  invalid={!!formErrors.referredBy}
                />
                {formErrors.referredBy && (
                  <div className="text-danger small">{formErrors.referredBy}</div>
                )}
              </CCol>
            </CRow>

            <br />
            <div className="d-flex justify-content-end mb-2">
              <CButton color="secondary" className="me-2" onClick={handleCancel}>
                Cancel
              </CButton>
              <CButton
                type="submit"
                color="success"
                style={{ backgroundColor: 'var(--color-black)', color: 'white', border: 'none' }}
                disabled={saveloading}
              >
                {saveloading && (
                  <span className="spinner-border text-white spinner-border-sm ms-2 mx-2"></span>
                )}
                {saveloading
                  ? isEditing
                    ? 'Updating...'
                    : 'Saving...'
                  : isEditing
                    ? 'Update'
                    : 'Submit'}
              </CButton>
            </div>
          </CForm>
          {/* ====== VIEW CUSTOMER MODAL ====== */}
        </>
      )}
    </>
  )
}

export default React.memo(CustomerManagement)
