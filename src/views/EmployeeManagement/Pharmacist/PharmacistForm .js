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
import { emailPattern } from '../../../Constant/Constants'
import FilePreview from '../../../Utils/FilePreview'
import { showCustomToast } from '../../../Utils/Toaster'

const PharmacistForm = ({
  visible,
  onClose,
  onSave,
  editData,
  initialData,
  viewMode,
  pharmacists,
  fetchTechs,
}) => {
  const emptyPermissions = {} // ✅ no feature is selected by default

  const emptyForm = {
    hospitalId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    branchName: localStorage.getItem('branchName'),
    hospitalName: localStorage.getItem('HospitalName'),
    createdBy: localStorage.getItem('staffId') || 'admin',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    emailID: '',
    governmentId: '',
    dpharmaOrBPharmaCertificate: '',
    shiftTimingsOrAvailability: '',

    experienceCertificates: '',
    statePharmacyCouncilRegistration: '',
    dateOfJoining: '',
    department: '',
    qualification: '',
    yearsOfExperience: '',
    // specialization: '',
    role: 'pharmacist',
    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    emergencyContactNumber: '',
    bankAccountDetails: {
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      panCardNumber: '',
    },
    profilePicture: '',

    pharmacyLicense: '',
    previousEmploymentHistory: '',
    permissions: emptyPermissions,
  }

  // 🔹 State
  const [formData, setFormData] = useState(emptyForm)
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('HospitalId'))
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [pharmacist, setPharmacist] = useState([]) // ✅ correct name
  const [errors, setErrors] = useState({})
  const [ifscLoading, setIfscLoading] = useState(false)
  // Mandatory fields
  const mandatoryFields = [
    'fullName',
    'gender',
    'dateOfBirth',
    'contactNumber',
    'emailID',
    'governmentId',
    'dateOfJoining',
    'department',
    'hospitalId',
    'profilePicture',
    'role',
    'qualification',
    'yearsOfExperience',
    'shiftTimingsOrAvailability',
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
        ...prev,
        ...initialData,
        address: { ...emptyForm.address, ...(initialData.address || {}) },
        bankAccountDetails: {
          ...emptyForm.bankAccountDetails,
          ...(initialData.bankAccountDetails || {}),
        },
        permissions: { ...emptyPermissions, ...(initialData.permissions || {}) },
      }))
    } else {
      setFormData(emptyForm)
    }
  }, [initialData])

  // 🔹 Handle text inputs (top-level fields)
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 🔹 Handle nested objects (address, bankAccountDetails)
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  // 🔹 File upload → Base64
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    // ✅ Check file size (bytes → KB)
    if (file.size > 250 * 1024) {
      showCustomToast('File size must be less than 250KB.', 'error', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return // do not proceed
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result, // Full Data URL
        [`${field}Name`]: file.name,
        [`${field}Type`]: file.type, // image/png, application/pdf, etc.
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
        showCustomToast('Pharmacist must be at least 18 years old.', 'error')
        return
      }
    }

    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.contactNumber)) {
      showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error')
      return
    }

    // ✅ Email validation

    if (!emailPattern.test(formData.emailID)) {
      showCustomToast('Please enter a valid email address.', 'error')
      return
    }

    const duplicateContact = pharmacists?.some(
      (t) => t.contactNumber === formData.contactNumber && t.pharmacistId !== formData.pharmacistId,
    )
    if (duplicateContact) {
      showCustomToast('Contact number already exists!', 'error')
      return
    }

    const duplicateEmail = pharmacists?.some(
      (t) => t.emailID === formData.emailID && t.pharmacistId !== formData.pharmacistId,
    )
    if (duplicateEmail) {
      showCustomToast('Email already exists!', 'error')
      return
    }
    return true
  }

  // 🔹 Save handler
  const handleSubmit = async () => {
    if (!formData.pharmacistId) {
      const hasAtLeastOnePermission = Object.values(formData.permissions || {}).some((value) => {
        if (Array.isArray(value)) return value.length > 0
        return Boolean(value)
      })

      if (!hasAtLeastOnePermission) {
        showCustomToast('Please assign at least one user permission before saving.', 'error')
        return
      }
    }

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

    // Save
    // console.log('Saving pharmacist data:', formData)
    // onSave(formData)
    // if (!formData.pharmacistId) setFormData(emptyForm)
    // onClose()
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

  const handlePreview = (fileUrl, type) => {
    setPreviewFileUrl(fileUrl)
    setIsPreviewPdf(type?.includes('pdf'))
    setShowModal(true)
  }
  const previewPdf = (base64String) => {
    if (!base64String) return
    const pdfData = `data:application/pdf;base64,${base64String.split(',')[1] || base64String}`
    setPreviewFileUrl(pdfData)
    setIsPreviewPdf(true)
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
          <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit Pharmacist '}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewMode ? (
            // ✅ VIEW MODE
            <div className="container my-4">
              <div className="card p-4 mb-4 shadow-sm border-light">
                <div className="d-flex flex-column flex-md-row align-items-center">
                  {/* Avatar */}
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
                    <h4 className="mb-2 fw-bold" style={{ color: '#7e3a93' }}>
                      {formData.fullName}
                    </h4>
                    <p className="mb-1 text-muted">
                      <strong>Email:</strong> {formData.emailID}
                    </p>
                    <p className="mb-1 text-muted">
                      <strong>Contact:</strong> {formData.contactNumber}
                    </p>
                    <span className="badge bg-secondary mt-2">ID: {formData.pharmacistId}</span>
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
                    <Row label="Email" value={formData.emailID} />
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
                    <Row label="Department" value={formData.department} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Qualification" value={formData.qualification} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Emergency Contact" value={formData.emergencyContactNumber} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Shift Timings" value={formData.shiftTimingsOrAvailability} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Pharmacy License" value={formData.pharmacyLicense} />
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
                  {formData.dpharmaOrBPharmaCertificate ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="D Pharma / B Pharma Certificate"
                        type={formData.dpharmaOrBPharmaCertificateType || 'application/pdf'}
                        data={formData.dpharmaOrBPharmaCertificate}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6">Not Provided D Pharma / B Pharma Certificate</p>
                  )}

                  {formData.statePharmacyCouncilRegistration ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="State Pharmacy Council Registration"
                        type={formData.statePharmacyCouncilRegistrationType || 'application/pdf'}
                        data={formData.statePharmacyCouncilRegistration}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6">Not Provided State Pharmacy Council Registration</p>
                  )}

                  {formData.experienceCertificates ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Experience Certificates"
                        type={formData.experienceCertificatesType || 'application/pdf'}
                        data={formData.experienceCertificates}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6">Not Provided Experience Certificates</p>
                  )}
                </div>
              </div>

              {/* Other Information */}
              <div className="card p-3 mb-4 shadow-sm border-light">
                <h5 className="mb-3 border-bottom pb-2">Other Information</h5>
                <div className="row g-3">
                  <div className="col-md-12">
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
                        value={hospitalId}
                        disabled
                        onChange={(e) => handleChange('hospitalId', e.target.value)}
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
                      const value = e.target.value

                      // Allow only letters and spaces
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        handleChange('fullName', value)

                        // Run validation
                        const error = validateField('fullName', value)
                        setErrors((prev) => ({ ...prev, fullName: error }))
                      }
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
                    maxLength={10} // Restrict to 10 digits
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('contactNumber', value)

                        // Live validation using your existing function
                        const err = validateField('contactNumber', value, formData, pharmacists)
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
                    value={formData.emailID}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('emailID', value)

                      // Run live validation
                      const err = validateField('emailID', value)
                      setErrors((prev) => ({ ...prev, emailID: err }))
                    }}
                  />
                  {errors.emailID && <div className="text-danger mt-1">{errors.emailID}</div>}
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
                  <CFormLabel>Pharmacy License</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.pharmacyLicense}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('pharmacyLicense', value)

                      // ✅ Inline validation
                      const error = validateField('pharmacyLicense', value)
                      setErrors((prev) => ({ ...prev, pharmacyLicense: error })) // store error in state
                    }}
                  />
                  {errors.pharmacyLicense && (
                    <div className="text-danger mt-1">{errors.pharmacyLicense}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Date of Joining <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfJoining}
                    max={new Date().toISOString().split('T')[0]} // ✅ disables future dates // today + 3 months
                    onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>
                    Department<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    value={formData.department}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only letters and spaces

                      handleChange('department', value)

                      // Run validation
                      const error = validateField('department', value)
                      setErrors((prev) => ({ ...prev, department: error }))
                    }}
                  />
                  {errors.department && <div className="text-danger mt-1">{errors.department}</div>}
                </div>

                <div className="col-md-4">
                  {' '}
                  <CFormLabel>
                    Qualification<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    value={formData.qualification}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only letters and spaces
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        handleChange('qualification', value)
                        const error = validateField('qualification', value)
                        setErrors((prev) => ({ ...prev, qualification: error }))
                      }
                    }}
                  />
                  {errors.qualification && (
                    <div className="text-danger mt-1">{errors.qualification}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Emergency Contact</CFormLabel>

                  <CFormInput
                    type="text"
                    maxLength={10}
                    value={formData.emergencyContactNumber}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('emergencyContactNumber', value)
                      }
                      // Validate on change
                    }}
                  />
                  {errors.emergencyContactNumber && (
                    <small className="text-danger">{errors.emergencyContactNumber}</small>
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

                      const error = validateField('shiftTimingsOrAvailability', value)
                      setErrors((prev) => ({ ...prev, shiftTimingsOrAvailability: error }))
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
                  <CFormLabel>
                    Years of Experience <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('yearsOfExperience', value)

                      // ✅ Validate using switch case
                      const error = validateField('yearsOfExperience', value)
                      setErrors((prev) => ({ ...prev, yearsOfExperience: error }))
                    }}
                  />
                  {errors.yearsOfExperience && (
                    <div className="text-danger mt-1">{errors.yearsOfExperience}</div>
                  )}
                </div>
                {/* <div className="col-md-4">
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
                </div> */}
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
                              if (/^\d*$/.test(value)) {
                                handleNestedChange('address', field, value)
                                const err = validateField(field, value, formData)
                                setErrors((prev) => ({
                                  ...prev,
                                  address: { ...prev.address, [field]: err },
                                }))
                              }
                            }
                            // City, State, Country → letters and spaces only
                            else if (field === 'city' || field === 'state' || field === 'country') {
                              if (/^[A-Za-z\s]*$/.test(value)) {
                                handleNestedChange('address', field, value)
                                const err = validateField(field, value, formData)
                                setErrors((prev) => ({
                                  ...prev,
                                  address: { ...prev.address, [field]: err },
                                }))
                              }
                            }
                            // Other fields → accept anything
                            else {
                              handleNestedChange('address', field, value)
                              const err = validateField(field, value, formData)
                              setErrors((prev) => ({
                                ...prev,
                                address: { ...prev.address, [field]: err },
                              }))
                            }
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
                                  : undefined
                          }
                          onChange={async (e) => {
                            let value = e.target.value

                            // Account Number → only digits
                            if (field === 'accountNumber') {
                              if (/^\d*$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                            }
                            // PAN → uppercase, specific format
                            else if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                            }
                            // IFSC → uppercase, alphanumeric
                            else if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                            }
                            // Account Holder Name → letters and spaces only
                            else if (field === 'accountHolderName') {
                              if (/^[A-Za-z\s]*$/.test(value))
                                handleNestedChange('bankAccountDetails', field, value)
                            }
                            // Other fields → accept anything
                            else {
                              handleNestedChange('bankAccountDetails', field, value)
                            }

                            // Live validation
                            const error = validateField(field, value, formData)
                            setErrors((prev) => ({
                              ...prev,
                              bankAccountDetails: {
                                ...prev.bankAccountDetails,
                                [field]: error,
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

                            // IFSC validation
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
                {/* Profile Picture */}
                <div className="col-md-4">
                  <CFormLabel>
                    Profile Picture
                    <span className="text-danger">*</span>
                  </CFormLabel>
                  {/* {formData.profilePicture && (
                    <div className="mb-2">
                      <img
                        src={formData.profilePicture}
                        alt="Profile"
                        width="80"
                        height="80"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                      <br />
                      <a
                        href={formData.profilePicture}
                        download="profile-picture"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  )} */}
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const base64 = await toBase64(file)
                        handleChange('profilePicture', base64) // update state
                      }
                    }}
                  />
                </div>

                {/* State Pharmacy Council Registration */}
                <div className="col-md-4">
                  <CFormLabel>DPharma/BPharma Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'dpharmaOrBPharmaCertificate')}
                  />
                </div>
                <div className="col-md-4">
                  <CFormLabel>State Pharmacy Council Registration Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'statePharmacyCouncilRegistration')}
                  />
                </div>

                {/* D Pharma / B Pharma Certificate */}
              </div>
              <div className="col-md-4">
                <CFormLabel>Experience Certificate</CFormLabel>
                <CFormInput
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'experienceCertificates')}
                />
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

export default PharmacistForm
