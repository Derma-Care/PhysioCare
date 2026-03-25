import React, { useEffect, useState } from 'react'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CFormText,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormSelect,
  CHeader,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  clinicData,
  postClinicData,
  updateServiceData,
  // deleteServiceData,
} from './registrationAPI'
import { showCustomToast } from '../../Utils/Toaster'

const ClinicRegistration = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [clinic, setClinic] = useState([])
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [editServiceMode, setEditServiceMode] = useState(false)
  const [pricingError, setPricingError] = useState('')
  const [serviceToEdit, setServiceToEdit] = useState({
    serviceImage: '',
    viewImage: '',
  })
  const [newClinic, setNewClinic] = useState({
    categoryName: '',
    categoryId: '',
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [errors, setErrors] = useState({
    serviceName: '',
    categoryName: '',
    description: '',
    pricing: '',
    status: '',
    includes: '',
    tax: '',
    minTime: '',
    discount: '',
    readyPeriod: '',
    preparation: '',
    viewDescription: '',
    serviceImage: '',
    bannerImage: '',
  })

  const [editErrors, setEditErrors] = useState({})

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const serviceResponse = await clinicData()
      console.log(serviceResponse.data)
      setClinic(serviceResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()

      if (!trimmedQuery) {
        setFilteredData([])
        return
      }

      const filtered = clinic.filter((item) => {
        const serviceNameMatch = item.serviceName?.toLowerCase().includes(trimmedQuery)
        const categoryNameMatch = item.categoryName?.toLowerCase().includes(trimmedQuery)

        return serviceNameMatch || categoryNameMatch
      })

      setFilteredData(filtered)
    }

    handleSearch()
  }, [searchQuery, clinic])

  const columns = [
    {
      name: 'Clinic Name',
      selector: (row) => row.clinicName,
      sortable: true,
      width: '200px',
    },
    {
      name: 'Mobile Number',
      selector: (row) => row.mobileNumber,
      width: '180px',
    },
    {
      name: 'Area',
      selector: (row) => row.clinicAddress.area,
      width: '180px',
    },
    {
      name: 'Opening Time',
      selector: (row) => row.openingTime,
      width: '180px',
    },
    {
      name: 'Closing Time',
      selector: (row) => row.closingTime,
      width: '180px',
    },

    {
      name: 'Actions',
      cell: (row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '230px',
          }}
        >
          <CButton
            color="primary"
            onClick={() => setViewService(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            View
          </CButton>
          <CButton
            color="primary"
            onClick={() => handleServiceEdit(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            Edit
          </CButton>
          <CButton
            color="danger"
            onClick={() => handleServiceDelete(row.mobileNumber)}
            style={{ width: '80px' }}
          >
            Delete
          </CButton>

          <ConfirmationModal
            isVisible={isModalVisible}
            message="Are you sure you want to delete this service?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      ),
      width: '150px',
      headerStyle: { textAlign: 'center' },
    },
  ]

  const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    return (
      <CModal visible={isVisible} onClose={onCancel}>
        <CHeader style={{ marginLeft: '200px' }}> !Alert</CHeader>
        <CModalBody style={{ textAlign: 'center' }}>{message}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onCancel}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={onConfirm}>
            Confirm
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }

  //   const validateForm = () => {
  //     const newErrors = {}

  //     if (!newClinic.serviceName) {
  //       newErrors.serviceName = 'Service name is required.'
  //     }

  //     if (!newService.categoryName) {
  //       newErrors.categoryName = 'Category is required.'
  //     }

  //     if (!newService.description) {
  //       newErrors.description = 'Description must be between 1 and 100 words.'
  //     }

  //     if (!newService.pricing) {
  //       newErrors.pricing = 'Pricing is required.'
  //     } else if (isNaN(newService.pricing)) {
  //       newErrors.pricing = 'Pricing must be a valid number.'
  //     } else if (parseFloat(newService.pricing) < 0) {
  //       newErrors.pricing = 'Pricing cannot be a negative number.'
  //     }

  //     if (!newService.status) {
  //       newErrors.status = 'Status is required.'
  //     }

  //     if (!newService.includes) {
  //       newErrors.includes = 'Includes must be between 1 and 100 words.'
  //     }

  //     if (!newService.discount && newService.discount !== 0) {
  //       newErrors.discount = 'Discount is required.'
  //     } else if (parseFloat(newService.discount) < 0) {
  //       newErrors.discount = 'Discount cannot be a negative number.'
  //     }
  //     if (!newService.tax && newService.tax !== 0) {
  //       newErrors.tax = 'tax is required.'
  //     } else if (parseFloat(newService.tax) < 0) {
  //       newErrors.tax = 'tax cannot be a negative number.'
  //     }
  //     if (!newService.minTime) {
  //       newErrors.minTime = 'Minimum time is required.'
  //     } else {
  //       const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  //       if (!timeRegex.test(newService.minTime)) {
  //         newErrors.minTime = 'Minimum time must be in HH:mm format.'
  //       }
  //     }

  //     if (!newService.readyPeriod) {
  //       newErrors.readyPeriod = 'Ready period must be between 1 and 1000 words.'
  //     }

  //     if (!newService.preparation) {
  //       newErrors.preparation = 'Preparation must be between 1 and 100 words.'
  //     }

  //     if (!newService.viewDescription) {
  //       newErrors.viewDescription = 'View description must be between 1 and 1000 words.'
  //     }

  //     if (!newService.serviceImage) {
  //       newErrors.serviceImage = 'Please upload a service image.'
  //     }

  //     if (!newService.viewImage) {
  //       newErrors.bannerImage = 'Please upload a banner image.'
  //     }

  //     if (!newService.categoryId) {
  //       newErrors.categoryId = 'Please select a valid category.'
  //     }

  //     setErrors(newErrors)
  //     return Object.keys(newErrors).length === 0
  //   }

  const handleAddService = async () => {
    if (!validateForm()) return
    setModalVisible(false)

    try {
      const payload = {
        serviceName: newClinic.serviceName,
        categoryName: newClinic.categoryName,
        categoryId: newClinic.categoryId,
        description: newClinic.description,
        pricing: newClinic.pricing,
        discount: newClinic.discount,
        tax: newClinic.tax,
        minTime: newClinic.minTime,
        status: newClinic.status,
        includes: newClinic.includes,
        readyPeriod: newClinic.readyPeriod,
        preparation: newClinic.preparation,
        categoryId: newClinic.categoryId,
        serviceImage: newClinic.serviceImage,
        viewImage: newClinic.viewImage,
        viewDescription: newClinic.viewDescription,
      }

      const response = await postServiceData(payload)
      showCustomToast('newClinic Added successfully!', { position: 'top-right' },'success')

      fetchData()
      console.log('newClinic added successfully:', response)
    } catch (error) {
      console.error('Error adding newClinic:', error)
      alert('Failed to add newClinic.')
    }

    setNewClinic({
      serviceName: '',
      categoryName: '',
      description: '',
      pricing: '',
      discount: 0,
      minTime: '',
      tax: 0,
      status: '',
      includes: '',
      readyPeriod: '',
      preparation: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      categoryId: '',
    })
  }

  const generateTimeOptions = () => {
    const times = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        times.push(`${hour}:${minute}`)
      }
    }
    return times
  }

  const handleServiceEdit = (newClinic) => {
    setServiceToEdit(newClinic)
    setEditServiceMode(true)
  }

  const handleServiceFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewClinic((prevService) => ({
          ...prevService,
          serviceImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewClinic((prevService) => ({
          ...prevService,
          viewImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const today = new Date().toISOString().split('T')[0]

    if (!newClinic.clinicName?.trim()) {
      newErrors.clinicName = 'Clinic Name is required.'
    } else if (newClinic.clinicName.length > 100) {
      newErrors.clinicName = 'Clinic Name cannot exceed 100 characters.'
    }

    if (!newClinic.registrationNumber?.trim()) {
      newErrors.registrationNumber = 'Registration Number is required.'
    } else if (!/^[a-zA-Z0-9]+$/.test(newClinic.registrationNumber)) {
      newErrors.registrationNumber = 'Registration Number must be alphanumeric.'
    } else if (newClinic.registrationNumber.length > 15) {
      newErrors.registrationNumber = 'Max 15 characters allowed.'
    }

    if (!newClinic.typeOfClinic?.trim()) {
      newErrors.typeOfClinic = 'Please select a Clinic Type.'
    }

    if (!newClinic.clinicLogo) {
      newErrors.clinicLogo = 'Clinic Logo is required.'
    } else {
      const allowedTypes = ['image/jpeg', 'image/png']
      if (!allowedTypes.includes(newClinic.clinicLogo.type)) {
        newErrors.clinicLogo = 'Only JPG/PNG files are allowed.'
      } else if (newClinic.clinicLogo.size > 2 * 1024 * 1024) {
        newErrors.clinicLogo = 'File size cannot exceed 2MB.'
      }
    }

    if (newClinic.establishedYear) {
      const currentYear = new Date().getFullYear()
      const yearValue = parseInt(newClinic.establishedYear, 10)

      if (isNaN(yearValue) || yearValue < 1900 || yearValue > currentYear) {
        newErrors.establishedYear = `Year must be between 1900 and ${currentYear}.`
      }
    }

    if (!newClinic.clinicAddress?.trim()) {
      newErrors.clinicAddress = 'Clinic Address is required.'
    } else if (newClinic.clinicAddress.length > 250) {
      newErrors.clinicAddress = 'Max 250 characters allowed.'
    }

    if (!newClinic.country?.trim()) {
      newErrors.country = 'Country is required.'
    }

    if (!newClinic.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.'
    } else if (!/^\d{10,15}$/.test(newClinic.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number must be 10-15 digits.'
    }

    if (!newClinic.emailAddress?.trim()) {
      newErrors.emailAddress = 'Email Address is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(newClinic.emailAddress)) {
      newErrors.emailAddress = 'Invalid Email format.'
    }

    if (!newClinic.website?.trim()) {
      newErrors.website = 'Website URL is required.'
    } else if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(newClinic.website)) {
      newErrors.website = 'Enter a valid URL (e.g., https://example.com).'
    }

    if (!newClinic.listOfService?.trim()) {
      newErrors.listOfService = 'Please select at least one service.'
    }

    if (!newClinic.openingTime || !newClinic.closingTime) {
      newErrors.operatingHours = 'Both Opening and Closing hours are required.'
    } else if (newClinic.openingTime >= newClinic.closingTime) {
      newErrors.operatingHours = 'Closing time must be after opening time.'
    }

    if (!newClinic.emergencyService) {
      newErrors.emergencyService = 'Please select Yes or No.'
    }

    if (!newClinic.OwnerName?.trim()) {
      newErrors.OwnerName = 'Owner Name is required.'
    } else if (newClinic.OwnerName.length > 50) {
      newErrors.OwnerName = 'Max 50 characters allowed.'
    }

    if (!newClinic.contactNumber?.trim()) {
      newErrors.contactNumber = 'Admin Contact Number is required.'
    } else if (!/^\d{10,15}$/.test(newClinic.contactNumber)) {
      newErrors.contactNumber = 'Contact Number must be 10-15 digits.'
    }

    if (!newClinic.GovernmentIdProof) {
      newErrors.GovernmentIdProof = 'Government ID Proof is required.'
    } else {
      const allowedIDTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedIDTypes.includes(newClinic.GovernmentIdProof.type)) {
        newErrors.GovernmentIdProof = 'Only JPG, PNG, or PDF files are allowed.'
      } else if (newClinic.GovernmentIdProof.size > 2 * 1024 * 1024) {
        newErrors.GovernmentIdProof = 'File size cannot exceed 2MB.'
      }
    }

    if (!newClinic.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License Number is required.'
    } else if (!/^[a-zA-Z0-9]+$/.test(newClinic.licenseNumber)) {
      newErrors.licenseNumber = 'License Number must be alphanumeric.'
    } else if (newClinic.licenseNumber.length > 20) {
      newErrors.licenseNumber = 'Max 20 characters allowed.'
    }

    if (!newClinic.issuingAuthority?.trim()) {
      newErrors.issuingAuthority = 'Issuing Authority is required.'
    } else if (newClinic.issuingAuthority.length > 50) {
      newErrors.issuingAuthority = 'Max 50 characters allowed.'
    }

    if (!newClinic.issuingExpiryDate) {
      newErrors.issuingExpiryDate = 'License Expiry Date is required.'
    } else if (newClinic.issuingExpiryDate <= today) {
      newErrors.issuingExpiryDate = 'License Expiry Date must be in the future.'
    }

    if (!newClinic.documentUpload) {
      newErrors.documentUpload = 'License Document is required.'
    } else {
      const allowedDocTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedDocTypes.includes(newClinic.documentUpload.type)) {
        newErrors.documentUpload = 'Only JPG, PNG, or PDF files are allowed.'
      } else if (newClinic.documentUpload.size > 5 * 1024 * 1024) {
        newErrors.documentUpload = 'File size cannot exceed 5MB.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateService = async () => {
    // if (!validateForm()) {
    //   return
    // }
    try {
      const updatedService = {
        ...serviceToEdit,
      }

      console.log('Updating service with ID:', serviceToEdit.clinicId)

      const updatedResponse = await updateServiceData(serviceToEdit.clinicId, updatedService)

      console.log('Updated service:', updatedResponse)

      setEditServiceMode(false)
      showCustomToast('Service Updated successfully!', { position: 'top-right' },'success')

      fetchData()
    } catch (error) {
      console.error('Error updating service:', error)
    //  showCustomToast('Failed to update service. Please try again.', { position: 'top-right' },'error')
    }
  }


  const handleEditBannerFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewClinic((prevService) => ({
          ...prevService,
          viewImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleServiceDelete = async (serviceId) => {
    setServiceIdToDelete(serviceId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteServiceData(serviceIdToDelete)
      console.log('Service deleted:', result)
      showCustomToast('Service deleted successfully!', { position: 'top-right' },'success')

      fetchData()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
    console.log('Service deletion canceled')
  }
  const handleChange = (e) => {
    const { name, value } = e.target

    setNewClinic((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }

  const AddCancel = () => {
    setNewClinic({
      serviceName: '',
      categoryName: '',
      description: '',
      pricing: '',
      discount: 0,
      tax: 0,
      minTime: '',
      status: '',
      includes: '',
      readyPeriod: '',
      preparation: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      categoryId: '',
    })
    setModalVisible(false)

    setErrors({})
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />

      <div>
        <CForm className="d-flex justify-content-end mb-3">
          <CInputGroup className="mb-3" style={{ marginRight: '20px', width: '400px' }}>
            <CFormInput
              type="text"
              placeholder="Search by ServiceName, Category"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '40px' }}
            />
            <CInputGroupText style={{ height: '40px' }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
          <CButton color="primary" style={{ height: '40px' }} onClick={() => setModalVisible(true)}>
            Clinic Registration
          </CButton>
        </CForm>
      </div>

      {viewService && (
        <CModal visible={!!viewService} onClose={() => setViewService(null)} size="lg">
          <CModalHeader>
            <CModalTitle style={{ textAlign: 'center', width: '100%' }}>Clinic Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CCol sm={4}>
                <strong>RegistrationNumber :</strong>
              </CCol>
              <CCol sm={8}>{viewService.registeredNumber}</CCol>
            </CRow>
            {/* Service Name */}
            <CRow>
              <CCol sm={4}>
                <strong>Clinic Name :</strong>
              </CCol>
              <CCol sm={8}>{viewService.clinicName}</CCol>
            </CRow>

            {/* Category Name */}
            <CRow>
              <CCol sm={4}>
                <strong>Mobile Number :</strong>
              </CCol>
              <CCol sm={8}>{viewService.mobileNumber}</CCol>
            </CRow>

            {/* Pricing */}
            <CRow>
              <CCol sm={4}>
                <strong>Opening Time :</strong>
              </CCol>
              <CCol sm={8}>{viewService.openingTime}</CCol>
            </CRow>

            {/* Discount */}
            <CRow>
              <CCol sm={4}>
                <strong>Closing Time :</strong>
              </CCol>
              <CCol sm={8}>{viewService.closingTime}</CCol>
            </CRow>

            <CRow>
              <CCol sm={4}>
                <strong>Clinic Address :</strong>
              </CCol>
              <CCol sm={8}>
                {viewService.clinicAddress.houseNo},{viewService.clinicAddress.street},
                {viewService.clinicAddress.area},{viewService.clinicAddress.city},
                {viewService.clinicAddress.pincode},{viewService.clinicAddress.state}
              </CCol>
            </CRow>

            <CRow>
              <CCol sm={4}>
                <strong>Clinic Available Services:</strong>
              </CCol>
              <CCol sm={4}>
                {viewService.clinicAvailableServices &&
                viewService.clinicAvailableServices.length > 0 ? (
                  viewService.clinicAvailableServices.map((service, index) => (
                    <div key={index}>{service.serviceName}</div>
                  ))
                ) : (
                  <span>No services available</span>
                )}
              </CCol>
            </CRow>

            {/* <CRow>
              <CCol sm={4}>
                <strong>Banner Image :</strong>
              </CCol>
              <CCol sm={8}>
                {viewService.viewImage ? (
                  <img
                    src={`data:image/png;base64,${viewService.viewImage}`}
                    alt="Banner"
                    style={{ width: '150px', height: 'auto' }}
                  />
                ) : (
                  <span>No banner image available</span>
                )}
              </CCol>
            </CRow> */}
          </CModalBody>
          <CModalFooter></CModalFooter>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
            Registration For Clinics
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Registration Number <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Registration Number"
                  value={newClinic.registrationNumber || ''}
                  name="registrationNumber"
                  onChange={handleChange}
                  maxLength={15}
                />
                {errors.registrationNumber && (
                  <CFormText className="text-danger">{errors.registrationNumber}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Clinic Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Enter Clinic Name"
                  value={newClinic.clinicName || ''}
                  name="clinicName"
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.clinicName && (
                  <CFormText className="text-danger">{errors.clinicName}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Type of Clinic <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  name="typeOfClinic"
                  value={newClinic.typeOfClinic || ''}
                  onChange={handleChange}
                  aria-label="Select Type"
                  disabled
                >
                  <option value="">Select Type of Clinic</option>
                  {[
                    'General Clinic',
                    'Dental Clinic',
                    'Pediatric Clinic',
                    'Gynecology Clinic',
                    'Cardiology Clinic',
                    'Dermatology Clinic',
                    'Orthopedic Clinic',
                    'ENT Clinic',
                    'Psychiatry Clinic',
                    'Ophthalmology Clinic',
                  ].map((clinic, index) => (
                    <option key={index} value={clinic}>
                      {clinic}
                    </option>
                  ))}
                  
                </CFormSelect>

                {errors.typeOfClinic && (
                  <CFormText className="text-danger">{errors.typeOfClinic}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>
                  Clinic Logo <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleBannerFileChange} disabled />
                {errors.clinicLogo && (
                  <CFormText className="text-danger">{errors.clinicLogo}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Established Year <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  name="establishedYear"
                  value={newClinic.establishedYear || ''}
                  onChange={handleChange}
                  disabled
                >
                  <option value="">Select Year</option>
                  {[...Array(new Date().getFullYear() - 1899).keys()].map((i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </CFormSelect>
                {errors.establishedYear && (
                  <CFormText className="text-danger">{errors.establishedYear}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>
                  Clinic Address <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Clinic Address"
                  value={newClinic.clinicAddress || ''}
                  name="clinicAddress"
                  onChange={handleChange}
                  maxLength={250}
                  disabled
                />
                {errors.clinicAddress && (
                  <CFormText className="text-danger">{errors.clinicAddress}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  House No <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Registration Number"
                  value={newClinic.registrationNumber || ''}
                  name="registrationNumber"
                  onChange={handleChange}
                  maxLength={15}
                />
                {errors.registrationNumber && (
                  <CFormText className="text-danger">{errors.registrationNumber}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Street <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="street"
                  value={newClinic.street || ''}
                  name="street"
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.street && (
                  <CFormText className="text-danger">{errors.street}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                Area <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Area"
                  value={newClinic.area || ''}
                  name="area"
                  onChange={handleChange}
                  maxLength={15}
                />
                {errors.area && (
                  <CFormText className="text-danger">{errors.area}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  City <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="city"
                  value={newClinic.city || ''}
                  name="city"
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.city && (
                  <CFormText className="text-danger">{errors.city}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Pin Code <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="PinCode"
                  value={newClinic.pincode || ''}
                  name="pincode"
                  onChange={handleChange}
                  maxLength={15}
                />
                {errors.pinCode && (
                  <CFormText className="text-danger">{errors.pinCode}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  State <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="state"
                  value={newClinic.state || ''}
                  name="state"
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.state && (
                  <CFormText className="text-danger">{errors.state}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Country <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Country"
                  value={newClinic.country || ''}
                  name="country"
                  onChange={handleChange}
                />
                {errors.country && <CFormText className="text-danger">{errors.country}</CFormText>}
              </CCol>
              <CCol md={6}>
                <h6>
                  Phone Number <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="tel"
                  placeholder="mobileNumber"
                  value={newClinic.mobileNumber || ''}
                  name="phoneNumber"
                  onChange={handleChange}
                  maxLength={10}
                />
                {errors.mobileNumber && (
                  <CFormText className="text-danger">{errors.mobileNumber}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Email Address <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Email Address"
                  value={newClinic.emailAddress || ''}
                  name="Email Address"
                  onChange={handleChange}
                />
                {errors.emailAddress && (
                  <CFormText className="text-danger">{errors.emailAddress}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Website <span style={{ color: 'red' }}>(must be a valid URL) *</span>
                </h6>
                <CFormInput
                  type="url"
                  placeholder="https://example.com"
                  value={newClinic.website || ''}
                  name="website"
                  onChange={handleChange}
                  pattern="https?://.+"
                  disabled
                />
                {errors.website && <CFormText className="text-danger">{errors.website}</CFormText>}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  List of Services <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  name="listOfService"
                  value={newClinic.listOfService || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Service</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="Dental Care">Dental Care</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="ENT">ENT (Ear, Nose, Throat)</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Ophthalmology">Ophthalmology (Eye Care)</option>
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Laboratory Services">Laboratory Services</option>
                  <option value="Vaccination">Vaccination</option>
                </CFormSelect>

                {errors.listOfService && (
                  <CFormText className="text-danger">{errors.listOfService}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>
                  Operating Hours <span style={{ color: 'red' }}>*</span>
                </h6>
                <div className="d-flex">
                  <CFormInput
                    type="time"
                    value={newClinic.openingTime || ''}
                    name="openingTime"
                    onChange={handleChange}
                    required
                  />
                  <span className="mx-2">to</span>
                  <CFormInput
                    type="time"
                    value={newClinic.closingTime || ''}
                    name="closingTime"
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.operatingHours && (
                  <CFormText className="text-danger">{errors.operatingHours}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Emergency Service <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  name="emergencyService"
                  value={newClinic.emergencyService || ''}
                  onChange={handleChange}
                  aria-label="Select Emergency Service"
                  disabled
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </CFormSelect>

                {errors.emergencyService && (
                  <CFormText className="text-danger">{errors.emergencyService}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>
                  Owner Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Owner Name"
                  value={newClinic.OwnerName || ''}
                  name="Owner Name"
                  onChange={handleChange}
                  maxLength={50}
                  disabled
                />
                {errors.OwnerName && (
                  <CFormText className="text-danger">{errors.OwnerName}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Contact Number(Admin) <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Contact Number"
                  value={newClinic.contactNumber || ''}
                  name="Contact Number"
                  onChange={handleChange}
                  minLength={10}
                  maxLength={15}
                  disabled
                />
                {errors.contactNumber && (
                  <CFormText className="text-danger">{errors.contactNumber}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Government ID Proof <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleBannerFileChange} disabled />
                {errors.GovernmentIdProof && (
                  <CFormText className="text-danger">{errors.GovernmentIdProof}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  License Number <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="License Number"
                  value={newClinic.licenseNumber || ''}
                  name="licenseNumber"
                  onChange={handleChange}
                  maxLength={20}
                  disabled
                />
                {errors.licenseNumber && (
                  <CFormText className="text-danger">{errors.licenseNumber}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Issuing Authority <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Issuing Authority"
                  value={newClinic.issuingAuthority || ''}
                  name="Issuing Authority"
                  onChange={handleChange}
                  maxLength={50}
                  disabled
                />
                {errors.issuingAuthority && (
                  <CFormText className="text-danger">{errors.issuingAuthority}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  License Expiry Date <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="date"
                  placeholder="License Expiry Date"
                  value={newClinic.issuingExpiryDate || ''}
                  name="issuingExpiryDate"
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled
                />
                {errors.issuingExpiryDate && (
                  <CFormText className="text-danger">{errors.issuingExpiryDate}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  License Document Upload <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleServiceFileChange} disabled required />
                {errors.documentUpload && (
                  <CFormText className="text-danger">{errors.documentUpload}</CFormText>
                )}
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddService}>
            Register
          </CButton>
          <CButton color="secondary" onClick={AddCancel}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={editServiceMode} onClose={() => setEditServiceMode(false)}>
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>Edit Service</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Registration Number</h6>
                <CFormInput
                  type="text"
                  placeholder="registrationNumber"
                  value={serviceToEdit?.registeredNumber || ''}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <h6>Clinic Name</h6>
                <CFormInput
                  type="text"
                  placeholder="donarName"
                  value={serviceToEdit?.clinicName || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, clinicName: e.target.value })
                  }
                  disabled
                />
                {editErrors.clinicName && (
                  <CFormText className="text-danger">{editErrors.clinicName}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Mobile Number</h6>
                <CFormInput
                  type="number"
                  placeholder="mobileNumber"
                  value={serviceToEdit?.mobileNumber || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, mobileNumber: e.target.value })
                  }
                />
                {editErrors.mobileNumber && (
                  <CFormText className="text-danger">{editErrors.mobileNumber}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>Opening Time</h6>
                <CFormInput
                  type="time"
                  placeholder="openingTime"
                  value={serviceToEdit?.openingTime ? serviceToEdit?.openingTime.slice(0, 5) : ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, openingTime: e.target.value })
                  }
                />
                {editErrors.openingTime && (
                  <CFormText className="text-danger">{editErrors.openingTime}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Closing Time</h6>
                <CFormInput
                  type="time"
                  placeholder="closingTime"
                  value={serviceToEdit?.closingTime ? serviceToEdit?.closingTime.slice(0, 5) : ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, closingTime: e.target.value })
                  }
                />
                {editErrors.closingTime && (
                  <CFormText className="text-danger">{editErrors.closingTime}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>House No</h6>
                <CFormInput
                  type="text"
                  placeholder="House No"
                  value={serviceToEdit?.clinicAddress?.houseNo || ''}
                  onChange={(e) =>
                    setServiceToEdit((prev) => ({
                      ...prev,
                      clinicAddress: {
                        ...prev?.clinicAddress,
                        houseNo: e.target.value,
                      },
                    }))
                  }
                />
                {editErrors?.houseNo && (
                  <CFormText className="text-danger">{editErrors.houseNo}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Street</h6>
                <CFormInput
                  type="text"
                  placeholder="Street"
                  value={serviceToEdit?.clinicAddress?.street || ''}
                  onChange={(e) =>
                    setServiceToEdit((prev) => ({
                      ...prev,
                      clinicAddress: {
                        ...(prev?.clinicAddress || {}),
                        street: e.target.value,
                      },
                    }))
                  }
                />
                {editErrors?.street && (
                  <CFormText className="text-danger">{editErrors.street}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>Area</h6>
                <CFormInput
                  type="text"
                  placeholder="area"
                  value={serviceToEdit?.clinicAddress?.area || ''}
                  onChange={(e) =>
                    setServiceToEdit((prev) => ({
                      ...prev,
                      clinicAddress: {
                        ...(prev?.clinicAddress || {}),
                        street: e.target.value,
                      },
                    }))
                  }
                />
                {editErrors.minTime && (
                  <CFormText className="text-danger">{editErrors.minTime}</CFormText>
                )}
              </CCol>
            </CRow>

            {/* Additional Fields */}
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>City</h6>
                <CFormInput
                  type="text"
                  placeholder="city"
                  value={serviceToEdit?.clinicAddress?.city || ''}
                  onChange={(e) =>
                    setServiceToEdit((prev) => ({
                      ...prev,
                      clinicAddress: {
                        ...prev?.clinicAddress,
                        city: e.target.value,
                      },
                    }))
                  }
                />
                {editErrors.city && (
                  <CFormText className="text-danger">{editErrors.city}</CFormText>
                )}
              </CCol>
              <CCol>
                <h6>PinCode</h6>
                <CFormInput
                  type="number"
                  placeholder="PinCode"
                  value={serviceToEdit?.clinicAddress?.pincode || ''}
                  onChange={(e) =>
                    setServiceToEdit((prev) => ({
                      ...prev,
                      clinicAddress: {
                        ...prev?.clinicAddress,
                        pincode: e.target.value,
                      },
                    }))
                  }
                />
                {editErrors.pincode && (
                  <CFormText className="text-danger">{editErrors.pincode}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>State</h6>
                <CFormInput
                  type="text"
                  placeholder="State"
                  value={serviceToEdit?.clinicAddress?.state || ''}
                  onChange={(e) =>
                    serviceToEdit((prev) => ({
                      ...prev,
                      clinicAddress: {
                        ...prev?.clinicAddress,
                        state: e.target.value,
                      },
                    }))
                  }
                />
                {editErrors.state && (
                  <CFormText className="text-danger">{editErrors.state}</CFormText>
                )}
              </CCol>
              {/* <CCol md={6}>
                <h6>View Description</h6>
                <CFormInput
                  type="text"
                  placeholder="View Description"
                  value={serviceToEdit?.viewDescription || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, viewDescription: e.target.value })
                  }
                />
                {editErrors.viewDescription && (
                  <CFormText className="text-danger">{editErrors.viewDescription}</CFormText>
                )}
              </CCol> */}
            </CRow>

            {/* File Upload */}
            {/* <CRow className="mb-4">
              <CCol md={6}>
                <h6>Service Image</h6>
                <CFormInput type="file" onChange={handleEditServiceFileChange} />
              </CCol>
              <CCol md={6}>
                <h6>Banner Image</h6>
                <CFormInput type="file" onChange={handleEditBannerFileChange} />
              </CCol>
            </CRow> */}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateService}>
            Update
          </CButton>
          <CButton color="secondary" onClick={() => setEditServiceMode(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {loading ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px', fontSize: '1.5rem' }}
        >
          Loading...
        </div>
      ) : error ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px', fontSize: '1.5rem' }}
        >
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData.length > 0 ? filteredData : clinic}
          pagination
          highlightOnHover
          pointerOnHover
        />
      )}
    </div>
  )
}

export default ClinicRegistration
