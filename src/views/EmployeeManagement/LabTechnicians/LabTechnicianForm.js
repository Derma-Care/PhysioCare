import React, { useEffect, useState } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import { toast, ToastContainer } from 'react-toastify'
import { actions, features } from '../../../Constant/Features'
import capitalizeWords from '../../../Utils/capitalizeWords'
import UserPermissionModal from '../UserPermissionModal'
import { validateField } from '../../../Utils/Validators'
import FilePreview from '../../../Utils/FilePreview'
import { emailPattern } from '../../../Constant/Constants'
import { showCustomToast } from '../../../Utils/Toaster'
const LabTechnicianForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  viewMode,
  technicians,
  fetchTechs,
}) => {
  const emptyPermissions = {} // ✅ no feature is selected by default

  const emptyForm = {
    clinicId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    branchName: localStorage.getItem('branchName'),
    hospitalName: localStorage.getItem('HospitalName'),
    createdBy: localStorage.getItem('staffId') || 'admin',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    emailId: '',
    governmentId: '',
    qualificationOrCertifications: '',
    dateOfJoining: '',
    departmentOrAssignedLab: '',
    yearOfExperience: '',
    specialization: '',
    shiftTimingsOrAvailability: '',
    role: 'lab_technician',
    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    emergencyContact: '',
    bankAccountDetails: {
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      panCardNumber: '',
    },
    medicalFitnessCertificate: '',
    profilePicture: '',

    labLicenseOrRegistration: '',
    vaccinationStatus: 'Fully Vaccinated',
    previousEmploymentHistory: '',
    permissions: emptyPermissions,
    userName: '',
    password: '',
  }

  // 🔹 State
  const [formData, setFormData] = useState(emptyForm)
  const [clinicId, setClinicID] = useState(localStorage.getItem('HospitalId'))
  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [ifscLoading, setIfscLoading] = useState(false)

  // Mandatory fields
  const mandatoryFields = [
    'fullName',
    'gender',
    'dateOfBirth',
    'contactNumber',
    'emailId',
    'governmentId',
    'dateOfJoining',
    'departmentOrAssignedLab',
    'emergencyContact',
    'yearOfExperience',
    'clinicId',
    'vaccinationStatus',
    'profilePicture',
    'role',
    // address fields
    'address.houseNo',
    'address.street',
    'address.city',
    'address.state',
    'address.postalCode',
    'address.country',

    // bank details fields
    'bankAccountDetails.accountNumber',
    'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName',
    'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode',
    'bankAccountDetails.panCardNumber',
  ]

  function validateMandatoryFields(formData, mandatoryFields) {
    const missingFields = []

    for (const field of mandatoryFields) {
      const keys = field.split('.')
      let value = formData

      for (const key of keys) {
        value = value?.[key]
        if (value === undefined || value === null) break
      }

      // ✅ Avoid false negatives like 0 or false (which are valid values)
      if (value === undefined || value === null || String(value).trim() === '') {
        missingFields.push(field)
      }
    }

    return missingFields
  }

  // Toggle feature
  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }

      if (updated[feature]) {
        delete updated[feature] // remove completely when unchecked
      } else {
        updated[feature] = [] // add with no actions when checked
      }

      return { ...prev, permissions: updated }
    })
  }

  // Toggle one action
  const togglePermission = (feature, action) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }
      if (!updated[feature]) updated[feature] = []

      if (updated[feature].includes(action)) {
        updated[feature] = updated[feature].filter((a) => a !== action)
      } else {
        updated[feature] = [...updated[feature], action]
      }

      return { ...prev, permissions: updated }
    })
  }

  // Select All actions
  const toggleAllActions = (feature) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }

      if (!updated[feature]) {
        updated[feature] = [...actions] // select all
      } else if (updated[feature].length === actions.length) {
        updated[feature] = [] // unselect all
      } else {
        updated[feature] = [...actions] // select all
      }

      return { ...prev, permissions: updated }
    })
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file) // ✅ Converts file to base64 with data:image/... prefix
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  useEffect(() => {
    if (visible) {
      if (initialData) setFormData(initialData)
      else setFormData(emptyForm)
      setErrors({})
    }
  }, [initialData, visible])

  // 🔹 Handle text inputs (top-level fields)
  const handleChange = (field, value) => {
    if (field === 'departmentOrAssignedLab') {
      value = value.replace(/[^A-Za-z\s]/g, '')
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
    if (errors[parent]?.[field] || errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        if (newErrors[parent]) {
          newErrors[parent] = { ...newErrors[parent] }
          delete newErrors[parent][field]
        }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // 🔹 File upload → Base64
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    // ✅ Check file size (bytes → KB)
    if (file.size > 250 * 1024) {
      showCustomToast('File size must be less than 250KB.', 'error')
      return // do not proceed
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result, // Full Data URL
      }))
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    const fieldLabels = {
      fullName: 'Full Name',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      contactNumber: 'Contact Number',
      emailId: 'Email',
      governmentId: 'Government ID',
      dateOfJoining: 'Date of Joining',
      yearOfExperience: 'Years of Experience',
      vaccinationStatus: 'Vaccination Status',
      profilePicture: 'Profile Image',
      emergencyContact: 'Emergency Contact',
      'address.houseNo': 'House Number',
      'address.street': 'Street',
      'address.city': 'City',
      'address.state': 'State',
      'address.postalCode': 'Postal Code',
      'address.country': 'Country',
      'bankAccountDetails.accountNumber': 'Account Number',
      'bankAccountDetails.accountHolderName': 'Account Holder Name',
      'bankAccountDetails.bankName': 'Bank Name',
      'bankAccountDetails.branchName': 'Branch Name',
      'bankAccountDetails.ifscCode': 'IFSC Code',
      'bankAccountDetails.panCardNumber': 'PAN Card Number',
    }

    mandatoryFields.forEach((field) => {
      let value = formData
      field.split('.').forEach((key) => { value = value?.[key] })
      if (!value || String(value).trim() === '') {
        isValid = false
        const label = fieldLabels[field] || field
        if (field.includes('.')) {
          const [parent, child] = field.split('.')
          if (!newErrors[parent]) newErrors[parent] = {}
          newErrors[parent][child] = `${label} is required.`
        } else {
          newErrors[field] = `${label} is required.`
        }
      }
    })

    if (formData.governmentId) {
      if (formData.governmentId.length !== 12) {
        newErrors.governmentId = 'Aadhar ID must be exactly 12 digits.'
        isValid = false
      } else if (/^(.)\1+$/.test(formData.governmentId)) {
        newErrors.governmentId = 'Aadhar ID cannot have all identical digits.'
        isValid = false
      }
    }

    const todayStr = new Date().toISOString().split('T')[0]


    if (formData.dateOfBirth) {
      if (formData.dateOfBirth > todayStr) {
        newErrors.dateOfBirth = 'Date of Birth cannot be in the future.'
        isValid = false
      } else {
        const dob = new Date(formData.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        if (
          today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        )
          age -= 1
        if (age < 18) {
          newErrors.dateOfBirth = 'Technician must be at least 18 years old.'
          isValid = false
        }
        if (age >= 100) {
          newErrors.dateOfBirth = 'Technician must be less than 100 years old.'
          isValid = false
        }
      }
    }

    if (formData.dateOfJoining) {
      if (formData.dateOfJoining > todayStr) {
        newErrors.dateOfJoining = 'Joining Date cannot be in the future.'
        isValid = false
      } else {
        const joinDate = new Date(formData.dateOfJoining)
        const fifteenYearsAgo = new Date()
        fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15)
        if (joinDate < fifteenYearsAgo) {
          newErrors.dateOfJoining = 'Joining Date cannot be more than 15 years ago.'
          isValid = false
        }
      }
    }

    if (formData.bankAccountDetails?.accountNumber) {
      const accLen = formData.bankAccountDetails.accountNumber.length
      if (accLen < 9 || accLen > 18) {
        if (!newErrors.bankAccountDetails) newErrors.bankAccountDetails = {}
        newErrors.bankAccountDetails.accountNumber = 'Account number must be between 9 and 18 digits.'
        isValid = false
      }
    }

    if (formData.bankAccountDetails?.panCardNumber) {
      if (formData.bankAccountDetails.panCardNumber.length !== 10) {
        if (!newErrors.bankAccountDetails) newErrors.bankAccountDetails = {}
        newErrors.bankAccountDetails.panCardNumber = 'PAN Card must be exactly 10 characters.'
        isValid = false
      }
    }

    if (formData.contactNumber && !/^[6-9]\d{9}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Invalid contact number (must be 10 digits starting 6-9).'
      isValid = false
    }

    if (formData.emailId && !emailPattern.test(formData.emailId)) {
      newErrors.emailId = 'Invalid email address format.'
      isValid = false
    }

    if (formData.contactNumber && formData.emergencyContact && formData.contactNumber === formData.emergencyContact) {
      newErrors.emergencyContact = 'Emergency contact cannot be same as contact number.'
      isValid = false
    }

    if (technicians?.some((t) => t.contactNumber === formData.contactNumber && t.id !== formData.id)) {
      newErrors.contactNumber = 'Contact number already exists!'
      isValid = false
    }
    if (technicians?.some((t) => t.emailId === formData.emailId && t.id !== formData.id)) {
      newErrors.emailId = 'Email already exists!'
      isValid = false
    }

    setErrors(newErrors)
    if (!isValid) showCustomToast('Please correct the highlighted errors.', 'error')
    return isValid
  }

  const handleSubmit = async () => {
    if (Object.keys(formData.permissions).length === 0) {
      showCustomToast('Please assign at least one user permission before saving.', 'error')
      return
    }

    // ✅ 8️⃣ If everything passed → Save technician
    try {
      setLoading(true)
      const res = await onSave(formData)
      console.log(res) // Now this will log actual API response
      if (res != undefined) {
        setFormData(emptyForm)
      }
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserPermission = () => {
    const isValid = validateForm()
    if (!isValid) return

    console.log(formData)
    setShowPModal(true)
  }

  // 🔹 Close Preview Modal
  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewFileUrl(null)
    setIsPreviewPdf(false)
  }

  // const handlePreview = (fileUrl, type) => {
  //   setPreviewFileUrl(fileUrl)
  //   setIsPreviewPdf(type?.includes('pdf'))
  //   setShowModal(true)
  // }

  //decode image
  const decodeImage = (data) => {
    try {
      // decode base64 string into normal string
      return atob(data)
    } catch {
      return null
    }
  }

  // 🔹 Small reusable info component
  const Section = ({ title, children }) => (
    <div>
      <h5 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h5>
      <div className="grid grid-cols-3 gap-4">{children}</div>
    </div>
  )

  const Row = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-gray-600 fw-bold">{label}</p>
      <p className="text-base text-gray-900 text-break">{value || 'N/A'}</p>
    </div>
  )

  const RowFull = ({ label, value }) => (
    <div className="col-span-3">
      {label && <p className="text-sm font-medium text-gray-600 fw-bold">{label}</p>}
      <p className="text-base text-gray-900 text-break">{value || 'N/A'}</p>
    </div>
  )

  // 🔹 File Preview with modal trigger
  // const FilePreview = ({ label, type, data }) => {
  //   if (!data) return <p>{label} </p>

  //   const isImage = type?.startsWith('image/')
  //   const fileUrl = data.startsWith('data:') ? data : `data:${type};base64,${data}`

  //   return (
  //     <div className="bg-white p-3 rounded-md shadow-sm">
  //       <strong>{label}:</strong>
  //       <div className="mt-2">
  //         {isImage ? (
  //           <img
  //             src={fileUrl}
  //             alt={label}
  //             className="w-32 h-32 object-cover rounded-md border cursor-pointer"
  //             onClick={() => handlePreview(fileUrl, type)}
  //           />
  //         ) : (
  //           <button
  //             type="button "
  //             className=" btn text-blue-600 hover:underline block mx-2"
  //             onClick={() => handlePreview(fileUrl, type)}
  //             style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
  //           >
  //             Preview
  //           </button>
  //         )}
  //         <a
  //           href={fileUrl}
  //           download={label.replace(/\s+/g, '_')}
  //           className="text-green-600 hover:underline text-sm block  btn"
  //           style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
  //         >
  //           Download
  //         </a>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      {/* <ToastContainer /> */}
      <CModal
        visible={visible}
        onClose={onClose}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {viewMode ? 'Personal Information' : 'Add / Edit Lab Technician'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewMode ? (
            // ✅ VIEW MODE

            <div className="container my-4">
              {/* Profile Header */}
              <div className="card p-4 mb-4 shadow-sm border-light">
                <div className="d-flex flex-column flex-md-row align-items-center">
                  {/* Profile Image */}
                  <div className="text-center me-md-4 mb-3 mb-md-0">
                    <img
                      src={formData.profilePicture || '/assets/images/default-avatar.png'}
                      alt={formData.fullName}
                      width="100"
                      height="100"
                      className="rounded-circle border"
                      style={{ objectFit: 'cover', borderColor: '#ccc' }}
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="flex-grow-1 text-center text-md-start">
                    <h4 className="fw-bold mb-1" style={{ color: '#7e3a93' }}>
                      {formData.fullName}
                    </h4>
                    <p className="text-muted mb-1">
                      <strong>Email:</strong> {formData.emailId}
                    </p>
                    <p className="text-muted mb-1">
                      <strong>Contact:</strong> {formData.contactNumber}
                    </p>
                    <div>
                      <span className="badge bg-secondary mt-2">ID: {formData.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Personal Information</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <Row label="Full Name" value={formData.fullName} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Email" value={formData.emailId} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Contact" value={formData.contactNumber} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Gender" value={formData.gender} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Date of Birth" value={formData.dateOfBirth} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Government ID" value={formData.governmentId} />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Work Information</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <Row label="Date of Joining" value={formData.dateOfJoining} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Department/Lab" value={formData.departmentOrAssignedLab} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Lab License" value={formData.labLicenseOrRegistration} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Experience" value={formData.yearOfExperience} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Emergency Contact" value={formData.emergencyContact} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Shift Timings" value={formData.shiftTimingsOrAvailability} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Specialization" value={formData.specialization} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Address</h5>
                <RowFull
                  value={`${formData.address.houseNo}, ${formData.address.street}, ${formData.address.city}, ${formData.address.state} - ${formData.address.postalCode}, ${formData.address.country}`}
                />
              </div>

              {/* Bank Details */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Bank Details</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <Row label="Account Number" value={formData.bankAccountDetails.accountNumber} />
                  </div>
                  <div className="col-md-4">
                    <Row
                      label="Account Holder Name"
                      value={formData.bankAccountDetails.accountHolderName}
                    />
                  </div>
                  <div className="col-md-4">
                    <Row label="IFSC Code" value={formData.bankAccountDetails.ifscCode} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Bank Name" value={formData.bankAccountDetails.bankName} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Branch Name" value={formData.bankAccountDetails.branchName} />
                  </div>
                  <div className="col-md-4">
                    <Row label="PAN Card" value={formData.bankAccountDetails.panCardNumber} />
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Documents</h5>
                <div className="row g-3">
                  {formData.qualificationOrCertifications ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Qualification / Certifications"
                        type={formData.qualificationOrCertificationsType}
                        data={formData.qualificationOrCertifications}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6 text-muted">
                      Not Provided Qualification / Certifications
                    </p>
                  )}
                  {formData.medicalFitnessCertificate ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Medical Fitness Certificate"
                        type={formData.medicalFitnessCertificateType || 'application/pdf'}
                        data={formData.medicalFitnessCertificate}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6 text-muted">Not Provided Medical Fitness Certificate</p>
                  )}
                </div>
              </div>

              {/* Other Information */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Other Information</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Row label="Vaccination Status" value={formData.vaccinationStatus} />
                  </div>
                  <div className="col-md-6">
                    <RowFull
                      label="Previous Employment"
                      value={formData.previousEmploymentHistory}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ✅ EDIT MODE
            <CForm>
              {/* 🔹 Basic Info */}
              <h5>Basic Information</h5>

              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="row">
                    <div className="col-md-5">
                      <CFormLabel>
                        ClinicID <span style={{ color: 'red' }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        value={clinicId}
                        disabled
                        onChange={(e) => handleChange('clinicId', e.target.value)}
                      />
                    </div>
                    <div className="col-md-7">
                      <CFormLabel>
                        Role <span style={{ color: 'red' }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        value={formData.role}
                        disabled
                        onChange={(e) => handleChange('role', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Full Name <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    value={formData.fullName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      handleChange('fullName', value)

                      // Run validation from your validators file
                      const error = validateField('fullName', value)

                      // Update errors state for live feedback
                      setErrors((prev) => ({ ...prev, fullName: error }))
                    }}
                  />
                  {errors.fullName && <div className="text-danger mt-1">{errors.fullName}</div>}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Gender <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.gender}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('gender', value)

                      // Live validation
                      const error = value ? '' : 'Gender is required.'
                      setErrors((prev) => ({ ...prev, gender: error }))
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </CFormSelect>

                  {errors.gender && <div className="text-danger mt-1">{errors.gender}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Date of Birth <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfBirth}
                    max={
                      new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                        .toISOString()
                        .split('T')[0]
                    } // only allow DOB ≤ today-18yrs
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('dateOfBirth', value)

                      // Live validation using your validators file
                      const err = validateField('dateOfBirth', value)
                      setErrors((prev) => ({ ...prev, dateOfBirth: err }))
                    }}
                  />
                  {errors.dateOfBirth && (
                    <div className="text-danger mt-1">{errors.dateOfBirth}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Contact Number <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    maxLength={10} // Restrict to 10 digits
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('contactNumber', value)

                        // Live validation using your existing function
                        const err = validateField('contactNumber', value, formData, technicians)
                        setErrors((prev) => ({ ...prev, contactNumber: err }))
                      }
                    }}
                  />
                  {errors.contactNumber && (
                    <div className="text-danger mt-1">{errors.contactNumber}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Email <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('emailId', value)

                      // Run live validation
                      const err = validateField('emailId', value)
                      setErrors((prev) => ({ ...prev, emailId: err }))
                    }}
                  />
                  {errors.emailId && <div className="text-danger mt-1">{errors.emailId}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    GovernmentID(AadharCard No) <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    maxLength={12}
                    value={formData.governmentId}
                    onChange={(e) => {
                      const value = e.target.value
                      // ✅ Only numbers allowed, max 12
                      if (/^\d*$/.test(value)) {
                        handleChange('governmentId', value)

                        // Run live validation
                        const err = validateField('governmentId', value)
                        setErrors((prev) => ({ ...prev, governmentId: err }))
                      }
                    }}
                  />
                  {errors.governmentId && (
                    <div className="text-danger mt-1">{errors.governmentId}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <CFormLabel>Lab License / Registration</CFormLabel>
                  <CFormInput
                    value={formData.labLicenseOrRegistration}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('labLicenseOrRegistration', value)

                      // Run live validation using your validator file
                      const err = validateField('labLicenseOrRegistration', value)
                      setErrors((prev) => ({ ...prev, labLicenseOrRegistration: err }))
                    }}
                  />
                  {errors.labLicenseOrRegistration && (
                    <div className="text-danger mt-1">{errors.labLicenseOrRegistration}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Date of Joining <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfJoining}
                    max={new Date().toISOString().split('T')[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('dateOfJoining', value)

                      const err = validateField('dateOfJoining', value)
                      setErrors((prev) => ({ ...prev, dateOfJoining: err }))
                    }}
                  />
                  {errors.dateOfJoining && (
                    <div className="text-danger mt-1">{errors.dateOfJoining}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>Department / Assigned Lab</CFormLabel>
                  <CFormInput
                    value={formData.departmentOrAssignedLab}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      handleChange('departmentOrAssignedLab', value)

                      // run live validation
                      const err = validateField('departmentOrAssignedLab', value)
                      setErrors((prev) => ({ ...prev, departmentOrAssignedLab: err }))
                    }}
                  />
                  {errors.departmentOrAssignedLab && (
                    <div className="text-danger mt-1">{errors.departmentOrAssignedLab}</div>
                  )}
                </div>
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>
                    Years of Experience <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.yearOfExperience}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('yearOfExperience', value)

                      // run live validation
                      const err = validateField('yearOfExperience', value)
                      setErrors((prev) => ({ ...prev, yearOfExperience: err }))
                    }}
                  />
                  {errors.yearOfExperience && (
                    <div className="text-danger mt-1">{errors.yearOfExperience}</div>
                  )}
                </div>
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>Specialization</CFormLabel>
                  <CFormInput
                    value={formData.specialization}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('specialization', value)

                      const err = validateField('specialization', value)
                      setErrors((prev) => ({ ...prev, specialization: err }))
                    }}
                  />
                  {errors.specialization && (
                    <div className="text-danger mt-1">{errors.specialization}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Shift Timings / Availability <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.shiftTimingsOrAvailability}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('shiftTimingsOrAvailability', value)

                      const err = value ? '' : 'Shift Timing / Availability is required.'
                      setErrors((prev) => ({
                        ...prev,
                        shiftTimingsOrAvailability: err,
                      }))
                    }}
                  >
                    <option value="">Select Shift</option>
                    <option value="06:00-12:00">Morning (06:00 AM – 12:00 PM) – 6 hrs</option>
                    <option value="12:00-18:00">Afternoon (12:00 PM – 06:00 PM) – 6 hrs</option>
                    <option value="18:00-00:00">Evening (06:00 PM – 12:00 AM) – 6 hrs</option>
                    <option value="00:00-06:00">Night (12:00 AM – 06:00 AM) – 6 hrs</option>
                    <option value="06:00-15:00">Day Shift (06:00 AM – 03:00 PM) – 9 hrs</option>
                    <option value="15:00-00:00">Evening Shift (03:00 PM – 12:00 AM) – 9 hrs</option>
                    <option value="21:00-06:00">Night Shift (09:00 PM – 06:00 AM) – 9 hrs</option>
                    <option value="06:00-18:00">Long Day (06:00 AM – 06:00 PM) – 12 hrs</option>
                    <option value="18:00-06:00">Long Night (06:00 PM – 06:00 AM) – 12 hrs</option>
                  </CFormSelect>
                  {errors.shiftTimingsOrAvailability && (
                    <div className="text-danger mt-1">{errors.shiftTimingsOrAvailability}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <CFormLabel>Emergency Contact <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    maxLength={10}
                    value={formData.emergencyContact}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleChange('emergencyContact', e.target.value)
                      }
                    }}
                  />
                  {errors.emergencyContact && <div className="text-danger mt-1">{errors.emergencyContact}</div>}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Vaccination Status <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.vaccinationStatus}
                    onChange={(e) => handleChange('vaccinationStatus', e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Not Vaccinated">Not Vaccinated</option>
                    <option value="Partially Vaccinated">Partially Vaccinated</option>
                    <option value="Fully Vaccinated">Fully Vaccinated</option>
                  </CFormSelect>
                </div>
              </div>

              {/* 🔹 Address */}
              <h5 className="mt-3">Address</h5>

              {Object.keys(formData.address)
                .reduce((rows, field, index) => {
                  if (index % 3 === 0) rows.push([]) // start new row every 3 fields
                  rows[rows.length - 1].push(field)
                  return rows
                }, [])
                .map((rowFields, rowIndex) => (
                  <div className="row mb-3" key={rowIndex}>
                    {rowFields.map((field) => (
                      <div className="col-md-4" key={field}>
                        <CFormLabel className="text-capitalize">
                          {field}
                          {field !== 'landmark' && <span style={{ color: 'red' }}>*</span>}
                        </CFormLabel>
                        <CFormInput
                          className="af-input" type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (field === 'postalCode') {
                              if (/^\d*$/.test(value)) handleNestedChange('address', field, value)
                            } else {
                              handleNestedChange('address', field, value)
                            }
                            setErrors((p) => ({ ...p, address: { ...p.address, [field]: validateField(field, value, formData) } }))
                          }}
                        />
                        {errors.address?.[field] && <div className="text-danger mt-1">{errors.address[field]}</div>}
                      </div>
                    ))}
                  </div>
                ))}

              {/* 🔹 Bank Details */}
              <h5 className="mt-3">Bank Account Details</h5>
              {Object.keys(formData.bankAccountDetails)
                .reduce((rows, field, index) => {
                  if (index % 3 === 0) rows.push([]) // start new row every 3 fields
                  rows[rows.length - 1].push(field)
                  return rows
                }, [])
                .map((rowFields, rowIndex) => (
                  <div className="row mb-3" key={rowIndex}>
                    {rowFields.map((field) => (
                      <div className="col-md-4" key={field}>
                        <CFormLabel className="text-capitalize">
                          {field} <span style={{ color: 'red' }}>*</span>
                        </CFormLabel>
                        <CFormInput
                          className="af-input"
                          value={formData.bankAccountDetails[field]}
                          disabled={ifscLoading && (field === 'bankName' || field === 'branchName')}
                          placeholder={ifscLoading && (field === 'bankName' || field === 'branchName') ? 'Fetching...' : ''}
                          maxLength={
                            field === 'accountNumber' ? 18
                              : field === 'panCardNumber' ? 10
                                : field === 'ifscCode' ? 11
                                  : undefined
                          }
                          onChange={async (e) => {
                            let value = e.target.value
                            let err = ''
                            if (field === 'accountHolderName') {
                              value = value.replace(/[^A-Za-z\s]/g, '')
                              handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'accountNumber') {
                              if (/^\d*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = value.length === 10 ? (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value) ? '' : 'Invalid PAN (ABCDE1234F)') : ''
                            } else if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else {
                              handleNestedChange('bankAccountDetails', field, value)
                            }
                            setErrors((p) => ({ ...p, bankAccountDetails: { ...p.bankAccountDetails, [field]: err || validateField(field, value, formData) } }))
                          }}
                          onBlur={async () => {
                            const value = formData.bankAccountDetails[field]
                            if (field === 'ifscCode' && value.length === 11 && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                              try {
                                setIfscLoading(true)
                                handleNestedChange('bankAccountDetails', 'bankName', 'Fetching...')
                                handleNestedChange('bankAccountDetails', 'branchName', 'Fetching...')
                                const res = await fetch(`https://ifsc.razorpay.com/${value}`)
                                if (res.ok) {
                                  const data = await res.json()
                                  handleNestedChange('bankAccountDetails', 'bankName', data.BANK || '')
                                  handleNestedChange('bankAccountDetails', 'branchName', data.BRANCH || '')
                                } else {
                                  handleNestedChange('bankAccountDetails', 'bankName', '')
                                  handleNestedChange('bankAccountDetails', 'branchName', '')
                                  showCustomToast('Invalid IFSC code', 'error')
                                }
                              } catch {
                                handleNestedChange('bankAccountDetails', 'bankName', '')
                                handleNestedChange('bankAccountDetails', 'branchName', '')
                              } finally {
                                setIfscLoading(false)
                              }
                            }
                          }}
                        />
                        {errors.bankAccountDetails?.[field] && <div className="text-danger mt-1">{errors.bankAccountDetails[field]}</div>}
                      </div>
                    ))}
                  </div>
                ))}

              {/* 🔹 Documents */}
              <h5 className="mt-3">Documents</h5>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Profile Image <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profilePicture')}
                  />
                  {errors.profilePicture && <div className="text-danger mt-1">{errors.profilePicture}</div>}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Medical Fitness Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')}
                  />
                </div>

                <div className="col-md-4">
                  <CFormLabel>Qualification / Certifications</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'qualificationOrCertifications')}
                  />
                </div>
              </div>

              <CFormLabel>Previous Employment History</CFormLabel>
              <CFormTextarea
                rows={3} // you can adjust height
                value={formData.previousEmploymentHistory}
                onChange={(e) => handleChange('previousEmploymentHistory', e.target.value)}
                placeholder="Enter previous employment history"
              />

              <div
                className="mb-3 w-100 mt-4"
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
                  onClick={handleUserPermission}
                >
                  User Permissions
                </CButton>
              </div>
              <UserPermissionModal
                show={showPModal}
                onClose={() => setShowPModal(false)}
                features={features}
                actions={actions}
                permissions={formData.permissions}
                toggleFeature={toggleFeature}
                toggleAllActions={toggleAllActions}
                togglePermission={togglePermission}
                onSave={() => {
                  console.log('Saved Permissions', formData.permissions)
                  setShowPModal(false)
                }}
              />
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          {viewMode ? (
            <CButton color="secondary" onClick={onClose}>
              Close
            </CButton>
          ) : (
            <>
              <CButton
                style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
                onClick={() => setFormData(emptyForm)}
              >
                Clear
              </CButton>
              <CButton
                color="secondary"
                onClick={() => {
                  setFormData(emptyForm)
                  onClose()
                }}
              >
                Cancel
              </CButton>
              <CButton
                style={{
                  backgroundColor: 'var(--color-black)',
                  color: 'white',
                }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2 text-white"
                      role="status"
                    />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </CButton>
            </>
          )}
        </CModalFooter>
      </CModal>

      {/* 🔹 Preview Modal */}
      <CModal visible={showModal} onClose={handleCloseModal} size="xl">
        <CModalHeader onClose={handleCloseModal}>
          <strong>{isPreviewPdf ? 'PDF Preview' : 'Image Preview'}</strong>
        </CModalHeader>
        <CModalBody className="text-center">
          {isPreviewPdf ? (
            <iframe
              src={previewFileUrl}
              title="PDF Preview"
              style={{ width: '100%', height: '80vh', border: 'none' }}
            />
          ) : (
            <img
              src={previewFileUrl}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
            />
          )}
        </CModalBody>
      </CModal>

      {/* 🔹 Permissions */}
    </>
  )
}

export default LabTechnicianForm
