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
import { validateFormData, validateField } from '../../../Utils/Validators'
import { emailPattern } from '../../../Constant/Constants'
import FilePreview from '../../../Utils/FilePreview'
import { showCustomToast } from '../../../Utils/Toaster'


const SecurityForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  viewMode,
  technicians,
  security,
  fetchTechs,
}) => {
  const emptyPermissions = {} // ✅ no feature is selected by default

  const emptyForm = {
    clinicId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    branchName: localStorage.getItem('branchName'),
    hospitalName: localStorage.getItem('HospitalName'),
    fullName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    createdBy: localStorage.getItem('staffId') || 'admin',
    emailId: '',
    govermentId: '',
    // qualificationOrCertifications: '',
    dateOfJoining: '',
    department: '',
    // yearOfExperience: '',
    // department:'',
    // specialization: '',
    shiftTimingsOrAvailability: '',
    role: 'security',
    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    // emergencyContact: '',
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

    policeVerification: '',
    // vaccinationStatus: 'Fully Vaccinated',
    previousEmployeeHistory: '',
    traningOrGuardLicense: '',
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
    'dateOfBirth',
    'gender',
    'contactNumber',
    'govermentId',
    'dateOfJoining',

    // address fields (Address is @NotNull)
    'address.houseNo', // make sure Address DTO has these
    'address.street',
    'address.city',
    'address.state',
    'address.postalCode',
    'address.country',

    // bank details fields (BankAccountDetails is @NotNull)
    'bankAccountDetails.accountNumber',
    'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName',
    'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode',
    'bankAccountDetails.panCardNumber',

    // extra mandatory fields in SecurityStaffDTO

    'medicalFitnessCertificate', // @NotBlank
  ]

  function validateMandatoryFields(formData, mandatoryFields) {
    const missingFields = []

    for (const field of mandatoryFields) {
      const keys = field.split('.')
      let value = formData

      for (const key of keys) {
        value = value?.[key]
      }

      if (!value || String(value).trim() === '') {
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
  if (initialData) {
    setFormData((prev) => ({
      ...prev,          // keep createdBy
      ...initialData,   // overwrite rest
      createdBy: initialData.createdBy || prev.createdBy,
    }))
  } else {
    setFormData(emptyForm)
  }
}, [initialData])


  // 🔹 Handle text inputs (top-level fields)
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Run validation on each change
    const error = validateField(field, value, { ...formData, [field]: value }, security)

    setErrors((prev) => ({ ...prev, [field]: error }))
  }
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }
  const handleBlur = (field, value) => {
    const error = validateField(field, value, formData, security)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  // 🔹 File upload → Base64
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result, // ✅ Full Data URL (with type prefix)
        [`${field}Name`]: file.name,
        [`${field}Type`]: file.type, // ✅ Actual file MIME type (image/png, application/pdf, etc.)
      }))
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const missing = validateMandatoryFields(formData, mandatoryFields)

    if (missing.length > 0) {
      showCustomToast(`Please fill required fields: ${missing.join(', ')}`, 'error')
      return
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())

      const actualAge = isBeforeBirthday ? age - 1 : age

      if (actualAge < 18) {
        showCustomToast('Security must be at least 18 years old.', 'error')
        return
      }
    }

    // ✅ Mobile validation (10 digits, starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.contactNumber)) {
      showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error')
      return
    }

    // ✅ Email validation

    // ✅ Email is OPTIONAL
if (formData.emailId && formData.emailId.trim() !== '') {
  if (!emailPattern.test(formData.emailId)) {
    showCustomToast('Please enter a valid email address.', 'error')
    return
  }
}


    // ✅ Check duplicate contact number
    const duplicateContact = security?.some(
      (t) => t.contactNumber === formData.contactNumber && t.id !== formData.id,
    )
    if (duplicateContact) {
      showCustomToast('Contact number already exists!', 'error')
      return
    }

    // ✅ Check duplicate email
    if (formData.emailId && formData.emailId.trim() !== '') {
  const duplicateEmail = security?.some(
    (t) => t.emailId === formData.emailId && t.id !== formData.id,
  )

  if (duplicateEmail) {
    showCustomToast('Email already exists!', 'error')
    return
  }
}

    return true
  }

  // 🔹 Save handler
  const handleSubmit = async () => {
    const isValid = validateForm()
    if (!isValid) {
      console.warn('⚠️ Validation failed. Please check required fields.')
      return
    }

    try {
      setLoading(true)
      const res = await onSave(formData) // call handleSave directly

      // Only clear form & close modal if API returned success
      if (res && (res.status === 201 || (res.status === 200 && res.data?.success))) {
        setFormData(emptyForm)
        onClose()
      }
      // If conflict (409) or failure, modal stays open
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUserPermission = () => {
    const missing = validateMandatoryFields(formData, mandatoryFields)

    if (missing.length > 0) {
      showCustomToast(`Please fill required fields: ${missing.join(', ')}`, 'error')
      return
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())

      const actualAge = isBeforeBirthday ? age - 1 : age

      if (actualAge < 18) {
        showCustomToast('Technician must be at least 18 years old.', 'error')
        return
      }
    }

    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.contactNumber)) {
      showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error')
      return
    }

    // ✅ Email validation

    if (!emailPattern.test(formData.emailId)) {
      showCustomToast('Please enter a valid email address.', 'error')
      return
    }

    const duplicateContact = security?.some(
      (t) => t.contactNumber === formData.contactNumber && t.id !== formData.id,
    )
    if (duplicateContact) {
      showCustomToast('Contact number already exists!', 'error')
      return
    }

    const duplicateEmail = security?.some(
      (t) => t.emailId === formData.emailId && t.id !== formData.id,
    )
    if (duplicateEmail) {
      showCustomToast('Email already exists!', 'error')
      return
    }
    console.log(formData)
    setShowPModal(true)
  }

  // 🔹 Close Preview Modal
  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewFileUrl(null)
    setIsPreviewPdf(false)
  }

  const handlePreview = (fileUrl, type) => {
    setPreviewFileUrl(fileUrl)
    setIsPreviewPdf(type?.includes('pdf'))
    setShowModal(true)
  }

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
      <ToastContainer />
      <CModal
        visible={visible}
        onClose={onClose}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit Security'}</CModalTitle>
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
                      <span className="badge bg-secondary mt-2">
                        ID: {formData.securityStaffId}
                      </span>
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
                    <Row label="Government ID" value={formData.govermentId} />
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
                    <Row label="Department" value={formData.department} />
                  </div>
                  <div className="col-md-4">
                    <Row
                      label="shiftTimingsOrAvailability"
                      value={formData.shiftTimingsOrAvailability}
                    />
                  </div>
                  {/* Add more work info if required */}
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
                  {formData.traningOrGuardLicense ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Training / Guard License"
                        type={formData.traningOrGuardLicenseType || 'application/pdf'}
                        data={formData.traningOrGuardLicense}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6 text-muted">Not Provided Training / Guard License</p>
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
                    <Row label="Police Verification" value={formData.policeVerification} />
                  </div>
                  {/* <div className="col-md-6"><Row label="Vaccination Status" value={formData.vaccinationStatus} /></div> */}
                  <div className="col-md-6">
                    <RowFull label="Previous Employment" value={formData.previousEmployeeHistory} />
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
                      // Remove numbers and special characters immediately
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      handleChange('fullName', value)
                    }}
                    onBlur={() => handleBlur('fullName', formData.fullName)}
                  />

                  {errors.fullName && <div className="text-danger mt-1">{errors.fullName}</div>}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Gender <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </CFormSelect>
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
                    } // ✅ only allow DOB ≤ today-18yrs
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Contact Number <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    maxLength={10} // ✅ Restrict to 10 digits
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value
                      // ✅ Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('contactNumber', value)
                        // ✅ Live validation
                        const err = validateField('contactNumber', value, formData, security)
                        setErrors((prev) => ({ ...prev, contactNumber: err }))
                      }
                    }}
                  />
                  {errors.contactNumber && (
                    <div className="text-danger mt-1">{errors.contactNumber}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('emailId', value)
                      // ✅ Live validation
                     let err = ''
if (value && !emailPattern.test(value)) {
  err = 'Invalid email format'
}
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
                    value={formData.govermentId}
                    onChange={(e) => {
                      const value = e.target.value
                      // ✅ Only numbers allowed
                      if (/^\d*$/.test(value)) {
                        handleChange('govermentId', value)

                        // ✅ Live validation using validators.js
                        const error = validateField('governmentId', value, formData)
                        setErrors((prev) => ({ ...prev, govermentId: error }))
                      }
                    }}
                    onBlur={() => {
                      // Validate when user leaves the field
                      const error = validateField('governmentId', formData.govermentId, formData)
                      setErrors((prev) => ({ ...prev, govermentId: error }))
                    }}
                  />

                  {/* Show error */}
                  {errors.govermentId && (
                    <div className="text-danger mt-1">{errors.govermentId}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <CFormLabel>Police Verification</CFormLabel>
                  <CFormInput
                    value={formData.policeVerification}
                    onChange={(e) => {
                      handleChange('policeVerification', e.target.value)

                      // ✅ Live validation
                      const error = validateField('policeVerification', e.target.value, formData)
                      setErrors((prev) => ({
                        ...prev,
                        policeVerification: error,
                      }))
                    }}
                    onBlur={() => {
                      // ✅ Validation on leaving the field
                      const error = validateField(
                        'policeVerification',
                        formData.policeVerification,
                        formData,
                      )
                      setErrors((prev) => ({
                        ...prev,
                        policeVerification: error,
                      }))
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Department 
                  </CFormLabel>
                  <CFormInput
                    value={formData.department}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                      handleChange('department', value)

                      // Live validation while typing
                      const error = validateField('department', value, formData)
                      setErrors((prev) => ({
                        ...prev,
                        department: error,
                      }))
                    }}
                    onBlur={() => {
                      // Validate when user leaves the field
                      const error = validateField('department', formData.department, formData)
                      setErrors((prev) => ({
                        ...prev,
                        department: error,
                      }))
                    }}
                  />

                  {/* {errors.department && <div className="text-danger mt-1">{errors.department}</div>} */}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Date of Joining <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfJoining}
                    max={new Date().toISOString().split('T')[0]} // today + 3 months
                    onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Shift Timings / Availability <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.shiftTimingsOrAvailability}
                    onChange={(e) => handleChange('shiftTimingsOrAvailability', e.target.value)}
                  >
                    <option value="">Select Shift</option>

                    <option value="06:00-12:00">Morning (06:00 AM – 12:00 PM) – 6 hrs</option>
                    <option value="12:00-18:00">Afternoon (12:00 PM – 06:00 PM) – 6 hrs</option>
                    <option value="18:00-00:00">Evening (06:00 PM – 12:00 AM) – 6 hrs</option>
                    <option value="0:00-06:00">Night (12:00 AM – 06:00 AM) – 6 hrs</option>

                    <option value="06:00-15:00">Day Shift (06:00 AM – 03:00 PM) – 9 hrs</option>
                    <option value="15:00-00:00">Evening Shift (03:00 PM – 12:00 AM) – 9 hrs</option>
                    <option value="21:00-06:00">Night Shift (09:00 PM – 06:00 AM) – 9 hrs</option>

                    <option value="06:00-18:00">Long Day (06:00 AM – 06:00 PM) – 12 hrs</option>
                    <option value="18:00-06:00">Long Night (06:00 PM – 06:00 AM) – 12 hrs</option>
                  </CFormSelect>
                </div>
              </div>

              <div className="row mb-3">
                {/* <div className="col-md-4">
                  {' '}
                  <CFormLabel>Medical Fitness Certificate</CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.medicalFitnessCertificate)}
                    onChange={(e) => handleChange('departmentOrAssignedLab', e.target.value)}
                  />{' '}
                </div> */}
                {/* <div className="col-md-4">
                  {' '}
                  <CFormLabel>
                    Years of Experience <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.yearOfExperience}
                    onChange={(e) => handleChange('yearOfExperience', e.target.value)}
                  />
                </div> */}
                <div className="col-md-4">
                  {' '}
                  {/* <CFormLabel>Specialization</CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.specialization)}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                  /> */}
                </div>
              </div>

              <div className="row mb-3">
                {/* <div className="col-md-4">
                  <CFormLabel>Emergency Contact</CFormLabel>

                  <CFormInput
                    type="text"
                    maxLength={10} // ✅ Restrict to 10 digits
                    value={formData.emergencyContact}
                    onChange={(e) => {
                      const value = e.target.value
                      // ✅ Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('emergencyContact', e.target.value)
                      }
                    }}
                  />
                </div> */}
                <div className="col-md-4">
                  {/* <CFormLabel>
                    Vaccination Status <span style={{ color: 'red' }}>*</span>
                  </CFormLabel> */}
                  {/* <CFormSelect
                    value={formData.vaccinationStatus}
                    onChange={(e) => handleChange('vaccinationStatus', e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Not Vaccinated">Not Vaccinated</option>
                    <option value="Partially Vaccinated">Partially Vaccinated</option>
                    <option value="Fully Vaccinated">Fully Vaccinated</option>
                  </CFormSelect> */}
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
                          type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value

                            // Postal Code → only digits
                            if (field === 'postalCode') {
                              if (/^\d*$/.test(value)) handleNestedChange('address', field, value)
                            }
                            // City, State, Country → letters and spaces only
                            else if (['city', 'state', 'country'].includes(field)) {
                              value = value.replace(/[^A-Za-z\s]/g, '')
                              handleNestedChange('address', field, value)
                            }
                            // Other fields → normal
                            else {
                              handleNestedChange('address', field, value)
                            }

                            // Live validation
                            const error = validateField(field, value, formData)
                            setErrors((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                [field]: error,
                              },
                            }))
                          }}
                          onBlur={() => {
                            const error = validateField(field, formData.address[field], formData)
                            setErrors((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                [field]: error,
                              },
                            }))
                          }}
                        />
                        {errors.address?.[field] && (
                          <div className="text-danger mt-1">{errors.address[field]}</div>
                        )}
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
                          value={formData.bankAccountDetails[field]}
                          disabled={ifscLoading && (field === 'bankName' || field === 'branchName')}
                          placeholder={
                            ifscLoading && (field === 'bankName' || field === 'branchName')
                              ? 'Fetching...'
                              : ''
                          }
                          maxLength={
                            field === 'accountNumber'
                              ? 20
                              : field === 'panCardNumber'
                                ? 10
                                : field === 'ifscCode'
                                  ? 11
                                  : field === 'accountHolderName'
                                    ? 50
                                    : undefined
                          }
                          onChange={async (e) => {
                            let value = e.target.value
                            let err = ''

                            // Account Holder Name → letters and spaces only
                            if (field === 'accountHolderName') {
                              value = value.replace(/[^A-Za-z\s]/g, '') // remove numbers & special chars
                              handleNestedChange('bankAccountDetails', field, value)

                              if (!value.trim()) err = 'Account Holder Name is required.'
                              else if (value.length < 3 || value.length > 50)
                                err = 'Account Holder Name must be between 3 and 50 characters.'
                            }

                            // Account Number → digits only
                            else if (field === 'accountNumber') {
                              if (/^\d*$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                              err = value ? '' : 'Account Number is required.'
                            }

                            // PAN → uppercase, correct format
                            else if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                              if (value.length === 10) {
                                const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
                                err = panRegex.test(value) ? '' : 'Invalid PAN format (ABCDE1234F)'
                              } else err = 'PAN must be 10 characters.'
                            }

                            // IFSC → uppercase, correct format
                            else if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                              if (value.length === 11) {
                                const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
                                err = ifscRegex.test(value)
                                  ? ''
                                  : 'Invalid IFSC format (HDFC0001234)'
                              } else err = 'IFSC must be 11 characters.'
                            }

                            // Other fields → required
                            else {
                              handleNestedChange('bankAccountDetails', field, value)
                              err = value ? '' : `${field} is required.`
                            }

                            setErrors((prev) => ({
                              ...prev,
                              bankAccountDetails: {
                                ...prev.bankAccountDetails,
                                [field]: err,
                              },
                            }))
                          }}
                          onBlur={async () => {
                            const value = formData.bankAccountDetails[field]
                            const error = validateField(field, value, formData)
                            setErrors((prev) => ({
                              ...prev,
                              bankAccountDetails: {
                                ...prev.bankAccountDetails,
                                [field]: error,
                              },
                            }))

                            // PAN validation
                            if (field === 'panCardNumber' && value.length === 10) {
                              const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
                              if (!panRegex.test(value))
                                showCustomToast('Invalid PAN format (e.g., ABCDE1234F)', 'error')
                            }

                            // IFSC validation & fetch bank/branch names
                            if (field === 'ifscCode' && value.length === 11) {
                              const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
                              if (!ifscRegex.test(value)) {
                                showCustomToast('Invalid IFSC format (e.g., HDFC0001234)', 'error')
                                handleNestedChange('bankAccountDetails', 'bankName', '')
                                handleNestedChange('bankAccountDetails', 'branchName', '')
                              } else {
                                try {
                                  // ✅ Show loading in UI
                                  setIfscLoading(true)
                                  handleNestedChange(
                                    'bankAccountDetails',
                                    'bankName',
                                    'Fetching...',
                                  )
                                  handleNestedChange(
                                    'bankAccountDetails',
                                    'branchName',
                                    'Fetching...',
                                  )

                                  const res = await fetch(`https://ifsc.razorpay.com/${value}`)
                                  if (res.ok) {
                                    const data = await res.json()
                                    handleNestedChange(
                                      'bankAccountDetails',
                                      'bankName',
                                      data.BANK || '',
                                    )
                                    handleNestedChange(
                                      'bankAccountDetails',
                                      'branchName',
                                      data.BRANCH || '',
                                    )
                                  } else {
                                    showCustomToast('Invalid IFSC code', 'error')
                                    handleNestedChange('bankAccountDetails', 'bankName', '')
                                    handleNestedChange('bankAccountDetails', 'branchName', '')
                                  }
                                } catch (err) {
                                  // showCustomToast('Error fetching bank details', 'error')
                                  handleNestedChange('bankAccountDetails', 'bankName', '')
                                  handleNestedChange('bankAccountDetails', 'branchName', '')
                                } finally {
                                  // ✅ Hide loading
                                  setIfscLoading(false)
                                }
                              }
                            }
                          }}
                        />
                        {errors.bankAccountDetails?.[field] && (
                          <div className="text-danger mt-1">{errors.bankAccountDetails[field]}</div>
                        )}
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
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const base64 = await toBase64(file)
                        handleChange('profilePicture', base64) // store in formData
                      }
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Medical Fitness Certificate <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')}
                  />
                </div>

                <div className="col-md-4">
                  <CFormLabel>Teaining Guard License</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'traningOrGuardLicense')}
                  />
                </div>
              </div>

              <CFormLabel>Previous Employment History</CFormLabel>
              <CFormTextarea
                rows={3} // you can adjust height
                value={formData.previousEmployeeHistory}
                onChange={(e) => handleChange('previousEmployeeHistory', e.target.value)}
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
                {/* <CButton
                  style={{
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                  }}
                  onClick={handleUserPermission}
                >
                  User Permissions
                </CButton> */}
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
                style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
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

export default SecurityForm
