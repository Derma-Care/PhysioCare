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
import { useHospital } from '../../Usecontext/HospitalContext'
import UserPermissionModal from '../UserPermissionModal'
import { validateField } from '../../../Utils/Validators'
import { emailPattern } from '../../../Constant/Constants'
import FilePreview from '../../../Utils/FilePreview'
import { showCustomToast } from '../../../Utils/Toaster'


const NurseForm = ({ visible, onClose, onSave, initialData, viewMode, nurses, fetchNurses }) => {
  const emptyPermissions = {} // ✅ no feature is selected by default
  // const { user } = useHospital()


  const emptyForm = {
    hospitalId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    branchName: localStorage.getItem('branchName'),
    hospitalName: localStorage.getItem('HospitalName'),
    fullName: '',
  createdBy: localStorage.getItem('staffId') || 'admin',

  
    gender: '',
    dateOfBirth: '',
    nurseContactNumber: '',
    emailId: '',
    governmentId: '',
    qualifications: '',
    dateOfJoining: '',
    department: '',
    yearsOfExperience: '',
    monthlyPaidLeaves: '',
    // specialization: '',
    shiftTimingOrAvailability: '',
    role: 'nurse',
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
    medicalFitnessCertificate: '',
    profilePicture: '',
    nursingLicense: '',
    nursingDegreeOrDiplomaCertificate: '',
    nursingCouncilRegistration: '',
    previousEmploymentHistory: '',
    // experienceCertificates: '',
    vaccinationStatus: '',
    // insuranceOrESIdetails: {
    //   policyOrEsiNumber: '',
    //   providerName: '',
    //   type: '',
    //   status: '',
    // },

    permissions: emptyPermissions,
  }

  // 🔹 State
  const [formData, setFormData] = useState(emptyForm)
  const [clinicId, setClinicID] = useState(localStorage.getItem('HospitalId'))
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [errors, setErrors] = useState({})
  const [ifscLoading, setIfscLoading] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)

  //search
  // Mandatory fields
  const mandatoryFields = [
    'fullName',
    'gender',
    'dateOfBirth',
    'nurseContactNumber',
    'emailId',
    'governmentId',
    'dateOfJoining',
    'department',
    'yearsOfExperience',
    'hospitalId',
    'vaccinationStatus',
    'profilePicture',
    'role',
    'nursingLicense',
    'nursingCouncilRegistration',
    'nursingDegreeOrDiplomaCertificate',
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
      setFormData(initialData)
    } else {
      setFormData(emptyForm)
    }
  }, [initialData])

  // 🔹 Handle text inputs (top-level fields)
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Run validation on each change
    const error = validateField(field, value, { ...formData, [field]: value }, nurses)

    setErrors((prev) => ({ ...prev, [field]: error }))
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
      showCustomToast('File size must be less than 250KB.', 'error')
      return // do not proceed
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result, // Full Data URL
        // [`${field}Name`]: file.name,
        // [`${field}Type`]: file.type, // image/png, application/pdf, etc.
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

    // ✅ Age validation
    if (formData.dob) {
      const dob = new Date(formData.dob)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())

      const actualAge = isBeforeBirthday ? age - 1 : age

      if (actualAge < 18) {
        showCustomToast('Nurse must be at least 18 years old.', 'error')
        return
      }
    }

    // ✅ Mobile validation (10 digits, starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/ // corrected (was 5-9 before!)
    if (!mobileRegex.test(formData.nurseContactNumber)) {
      showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error')
      return
    }

    // ✅ Emergency contact and Nurse contact must not be same
    if (formData.nurseContactNumber === formData.emergencyContactNumber) {
      showCustomToast('Nurse Contact Number and Emergency Contact cannot be the same.', 'error')
      return
    }

    // ✅ Email validation

    const email = formData.emailId.trim()
    if (!emailPattern.test(email)) {
      showCustomToast('Please enter a valid email address.', 'error')
      return
    }

    // ✅ Check duplicate contact number
    const duplicateContact = nurses?.some(
      (t) => t.nurseContactNumber === formData.nurseContactNumber && t.id !== formData.id,
    )
    if (duplicateContact) {
      showCustomToast('Contact number already exists!', 'error')
      return
    }

    // ✅ Check duplicate email
    const duplicateEmail = nurses?.some((t) => t.email === formData.emailId && t.id !== formData.id)
    if (duplicateEmail) {
      showCustomToast('Email already exists!', 'error')
      return
    }
    return true
  }

  // 🔹 Save handler
  const handleSubmit = async () => {
    if (Object.keys(formData.permissions).length === 0) {
      showCustomToast('Please assign at least one user permission before saving.', 'error')
      return
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

    // console.log('Saving nurse data:', formData)
    // onSave(formData)
    // setFormData(emptyForm)
    // onClose()
  }

  const handleUserPermission = () => {
    const isValid = validateForm()

    if (!isValid) return
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
        onClose={() => {
          setFormData(emptyForm) // ✅ reset on close
          onClose()
        }}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit  Nurse'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewMode ? (
            // ✅ VIEW MODE

            <div className="container my-4">
              {/* Profile Header */}
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
                      <strong>Email:</strong> {formData.emailId}
                    </p>
                    <p className="mb-1 text-muted">
                      <strong>Contact:</strong> {formData.nurseContactNumber}
                    </p>
                    <span className="badge bg-secondary mt-2">ID: {formData.nurseId}</span>
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
                    <Row label="Contact" value={formData.nurseContactNumber} />
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
                    <Row label="Experience" value={formData.yearsOfExperience} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Qualifications" value={formData.qualifications} />
                  </div>
                  <div className="col-md-4">
                    <Row
                      label="Nursing Council Registration"
                      value={formData.nursingCouncilRegistration}
                    />
                  </div>
                  <div className="col-md-4">
                    <Row label="Shift Timings" value={formData.shiftTimingOrAvailability} />
                  </div>
                  
                  <div className="col-md-4">
                    <Row label="Emergency Contact" value={formData.emergencyContactNumber} />
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
                  {formData.qualificationOrCertifications != '' ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Qualification/Nursing Certificate"
                        type={formData.nursingDegreeOrDiplomaCertificateType || 'application/pdf'}
                        data={formData.nursingDegreeOrDiplomaCertificate}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6">Not Provided Qualification/Nursing Certificate</p>
                  )}
                  {formData.medicalFitnessCertificate != '' ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Medical Fitness Certificate"
                        type={formData.medicalFitnessCertificate || 'application/pdf'}
                        data={formData.medicalFitnessCertificate}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6">Not Provided Medical Fitness Certificate</p>
                  )}
                  {formData.nursingLicense != '' ? (
                    <div className="col-md-6">
                      <FilePreview
                        label="Nursing License"
                        type={formData.nursingLicense || 'application/pdf'}
                        data={formData.nursingLicense}
                      />
                    </div>
                  ) : (
                    <p className="col-md-6">Nursing License not provided</p>
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
          Clinic ID <span style={{ color: 'red' }}>*</span>
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
        const value = e.target.value
        if (/^[A-Za-z\s]*$/.test(value)) {
          handleChange('fullName', value)
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
      onChange={(e) => {
        const value = e.target.value
        handleChange('gender', value)
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

{/* SECOND ROW */}
<div className="row mb-3">
  <div className="col-md-4">
    <CFormLabel>
      Date of Birth <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      type="date"
      value={formData.dateOfBirth}
      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
        .toISOString()
        .split('T')[0]}
      onChange={(e) => {
        const value = e.target.value
        handleChange('dateOfBirth', value)
        const err = validateField('dateOfBirth', value)
        setErrors((prev) => ({ ...prev, dateOfBirth: err }))
      }}
    />
    {errors.dateOfBirth && <div className="text-danger mt-1">{errors.dateOfBirth}</div>}
  </div>

  <div className="col-md-4">
    <CFormLabel>
      Contact Number <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      type="text"
      maxLength={10}
      value={formData.nurseContactNumber}
      onChange={(e) => {
        const value = e.target.value
        if (/^\d*$/.test(value)) {
          handleChange('nurseContactNumber', value)
          const err = validateField('nurseContactNumber', value, formData, nurses)
          setErrors((prev) => ({ ...prev, nurseContactNumber: err }))
        }
      }}
    />
    {errors.nurseContactNumber && (
      <div className="text-danger mt-1">{errors.nurseContactNumber}</div>
    )}
  </div>

  <div className="col-md-4">
    <CFormLabel>
      Qualifications <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      type="text"
      value={formData.qualifications}
      onChange={(e) => {
        const value = e.target.value
        handleChange('qualifications', value)
        const err = validateField('qualifications', value, formData, nurses)
        setErrors((prev) => ({ ...prev, qualifications: err }))
      }}
    />
    {errors.qualifications && <div className="text-danger mt-1">{errors.qualifications}</div>}
  </div>
</div>

{/* THIRD ROW */}
<div className="row mb-3">
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
        const err = validateField('emailId', value)
        setErrors((prev) => ({ ...prev, emailId: err }))
      }}
    />
    {errors.emailId && <div className="text-danger mt-1">{errors.emailId}</div>}
  </div>

  <div className="col-md-4">
    <CFormLabel>
      Government ID (Aadhar Card No) <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      maxLength={12}
      value={formData.governmentId}
      onChange={(e) => {
        const value = e.target.value
        if (/^\d*$/.test(value)) {
          handleChange('governmentId', value)
          const error = validateField('governmentId', value)
          setErrors((prev) => ({ ...prev, governmentId: error }))
        }
      }}
    />
    {errors.governmentId && <div className="text-danger mt-1">{errors.governmentId}</div>}
  </div>

  <div className="col-md-4">
    <CFormLabel>
      Nursing Council Registration No <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      type="text"
      maxLength={20}
      value={formData.nursingCouncilRegistration}
      onChange={(e) => {
        const value = e.target.value
        handleChange('nursingCouncilRegistration', value)
        const error = validateField('nursingCouncilRegistration', value)
        setErrors((prev) => ({ ...prev, nursingCouncilRegistration: error }))
      }}
    />
    {errors.nursingCouncilRegistration && (
      <div className="text-danger mt-1">{errors.nursingCouncilRegistration}</div>
    )}
  </div>
</div>

{/* FOURTH ROW */}
<div className="row mb-3">
  <div className="col-md-4">
    <CFormLabel>
      Date of Joining <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      type="date"
      value={formData.dateOfJoining}
      max={new Date().toISOString().split('T')[0]}
      onChange={(e) => {
        const value = e.target.value
        handleChange('dateOfJoining', value)
        const error = validateField('dateOfJoining', value)
        setErrors((prev) => ({ ...prev, dateOfJoining: error }))
      }}
    />
    {errors.dateOfJoining && <div className="text-danger mt-1">{errors.dateOfJoining}</div>}
  </div>

  <div className="col-md-4">
    <CFormLabel>
      Department <span style={{ color: 'red' }}>*</span>
    </CFormLabel>
    <CFormInput
      value={formData.department}
      onChange={(e) => {
        const value = e.target.value
        handleChange('department', value)
        const error = validateField('department', value)
        setErrors((prev) => ({ ...prev, department: error }))
      }}
    />
    {errors.department && <div className="text-danger mt-1">{errors.department}</div>}
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
        const error = validateField('yearsOfExperience', value)
        setErrors((prev) => ({ ...prev, yearsOfExperience: error }))
      }}
    />
    {errors.yearsOfExperience && (
      <div className="text-danger mt-1">{errors.yearsOfExperience}</div>
    )}
  </div>
<div className="row mb-6">



</div>
</div>


              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Shift Timings / Availability <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.shiftTimingOrAvailability}
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('shiftTimingOrAvailability', value)

                      const error = validateField('shiftTimingOrAvailability', value)
                      setErrors((prev) => ({ ...prev, shiftTimingOrAvailability: error }))
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

                  {errors.shiftTimingOrAvailability && (
                    <div className="text-danger mt-1">{errors.shiftTimingOrAvailability}</div>
                  )}
                </div>
                

                <div className="col-md-4">
                  <CFormLabel>Emergency Contact</CFormLabel>

                  <CFormInput
                    type="text"
                    inputMode="numeric"
                    maxLength={10} // Restrict to 10 digits
                    value={formData.emergencyContactNumber}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('emergencyContactNumber', value)
                      }
                    }}
                  />
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
                 <div className="col-md-4">
  <CFormLabel>
    Monthly Paid Leaves <span style={{ color: 'red' }}>*</span>
  </CFormLabel>

  <CFormInput
    type="number"
    value={formData.monthlyPaidLeaves}
    onChange={(e) => {
      const value = e.target.value
      handleChange('monthlyPaidLeaves', value)
      const error = validateField('monthlyPaidLeaves', value)
      setErrors((prev) => ({ ...prev, monthlyPaidLeaves: error }))
    }}
    min={0}
  />

  {errors.monthlyPaidLeaves && (
    <div className="text-danger mt-1">
      {errors.monthlyPaidLeaves}
    </div>
  )}
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
            {/* Show * except for 'landmark' */}
            {field !== 'landmark' && <span style={{ color: 'red' }}> *</span>}
                        </CFormLabel>
                        <CFormInput
                          type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value

                            // Postal Code: digits only
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
                            // City, State, Country: letters + spaces only
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
                            // Other fields: accept anything
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
                {/* Profile Image */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>
                    Profile Image <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        // ✅ Convert to Base64
                        const base64 = await toBase64(file)

                        // ✅ Validate using validators.js
                        const error = validateField('profilePicture', base64)
                        if (error) {
                          showCustomToast(error, 'error') // show error message
                          return // do not save invalid file
                        }

                        // ✅ Save valid file
                        handleChange('profilePicture', base64)
                      }
                    }}
                  />
                </div>

                {/* Nursing License */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>
                    Nursing License Certificate <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput type="file" onChange={(e) => handleFileUpload(e, 'nursingLicense')} />
                </div>

                {/* Medical Fitness Certificate */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>Medical Fitness Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')}
                  />
                </div>

                {/* Qualification / Certifications */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>
                    Qualification/Nursing Certificate<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'nursingDegreeOrDiplomaCertificate')}
                  />
                </div>
              </div>

              <CFormLabel>Previous Employment History</CFormLabel>
              <CFormTextarea
                rows={3} // you can adjust height
                value={formData.previousEmploymentHistory} // updated field name
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
              <CButton color="secondary" onClick={onClose}>
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

export default NurseForm
