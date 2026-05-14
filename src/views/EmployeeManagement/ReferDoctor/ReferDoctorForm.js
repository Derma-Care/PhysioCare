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
import { toast } from 'react-toastify'
import { actions, features } from '../../../Constant/Features'
import { validateField } from '../../../Utils/Validators'

import capitalizeWords from '../../../Utils/capitalizeWords'
import { showCustomToast } from '../../../Utils/Toaster'
import { emailPattern } from '../../../Constant/Constants'
import { COLORS } from '../../../Constant/Themes'
import {
  User,
  Briefcase,
  MapPin,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Shield,
  Calendar,
  Activity,
  Award
} from 'lucide-react'

const ReferDoctorForm = ({
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
    hospitalName: localStorage.getItem('HospitalName'),
    fullName: '',
    gender: 'male',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    governmentId: '',
    // getReferralDoctorByReferralId: '',

    // qualificationOrCertifications: '',
    // dateOfJoining: '',
    department: '',
    yearsOfExperience: 0,
    currentHospitalName: '',
    specialization: '',
    medicalRegistrationNumber: '',
    status: 'Active',
    // shiftTimingsOrAvailability: '',
    role: 'referdoctor',
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
    bankAccountNumber: {
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      panCardNumber: '',
    },

    // permissions: emptyPermissions,
    // userName: '',
    // password: '',
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
  // Mandatory fields
  const mandatoryFields = [
    'fullName',
    // 'dateOfBirth',
    'gender',
    'mobileNumber',
    // 'governmentId',
    // 'department',
    'yearsOfExperience',
    // 'currentHospitalName',
    // 'email',
    'status',

    // address fields (Address is @NotNull)
    // 'address.houseNo', // make sure Address DTO has these
    // 'address.street',
    // 'address.city',
    // 'address.state',
    // 'address.postalCode',
    // 'address.country',

    // bank details fields (bankAccountNumber is @NotNull)
    // 'bankAccountNumber.accountNumber',
    // 'bankAccountNumber.accountHolderName',
    // 'bankAccountNumber.bankName',
    // 'bankAccountNumber.branchName',
    // 'bankAccountNumber.ifscCode',
    // 'bankAccountNumber.panCardNumber',

    // extra mandatory fields in ReferDoctorStaffDTO
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
    if (visible) {
      if (initialData) {
        // Format dateOfBirth to YYYY-MM-DD for input[type=date]
        const formattedData = {
          ...initialData,
          dateOfBirth: initialData.dateOfBirth
            ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
            : '',
        }
        setFormData(formattedData)
      } else {
        setFormData(emptyForm)
      }
      setErrors({})
    }
  }, [initialData, visible])

  // 🔹 Handle text inputs (top-level fields)
  const handleChange = (field, value) => {
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

  // 🔹 Save handler
  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    const fieldLabels = {
      fullName: 'Full Name',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      mobileNumber: 'Mobile Number',
      email: 'Email',
      governmentId: 'Government ID',
      yearsOfExperience: 'Years of Experience',
      currentHospitalName: 'Current Hospital Name',
      specialization: 'Specialization',
      medicalRegistrationNumber: 'Medical Registration Number',
      status: 'Status',
      'address.houseNo': 'House Number',
      'address.street': 'Street',
      'address.city': 'City',
      'address.state': 'State',
      'address.postalCode': 'Postal Code',
      'address.country': 'Country',
      'bankAccountNumber.accountNumber': 'Account Number',
      'bankAccountNumber.accountHolderName': 'Account Holder Name',
      'bankAccountNumber.bankName': 'Bank Name',
      'bankAccountNumber.branchName': 'Branch Name',
      'bankAccountNumber.ifscCode': 'IFSC Code',
      'bankAccountNumber.panCardNumber': 'PAN Card Number',
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
        const age = today.getFullYear() - dob.getFullYear()
        const isBeforeBirthday =
          today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        const actualAge = isBeforeBirthday ? age - 1 : age
        if (actualAge < 18) {
          newErrors.dateOfBirth = 'Doctor must be at least 18 years old.'
          isValid = false
        }
        if (actualAge >= 100) {
          newErrors.dateOfBirth = 'Doctor must be less than 100 years old.'
          isValid = false
        }
      }
    }

    if (formData.bankAccountNumber?.accountNumber) {
      const accLen = formData.bankAccountNumber.accountNumber.length
      if (accLen < 9 || accLen > 18) {
        if (!newErrors.bankAccountNumber) newErrors.bankAccountNumber = {}
        newErrors.bankAccountNumber.accountNumber = 'Account number must be between 9 and 18 digits.'
        isValid = false
      }
    }

    if (formData.bankAccountNumber?.panCardNumber) {
      if (formData.bankAccountNumber.panCardNumber.length !== 10) {
        if (!newErrors.bankAccountNumber) newErrors.bankAccountNumber = {}
        newErrors.bankAccountNumber.panCardNumber = 'PAN Card must be exactly 10 characters.'
        isValid = false
      }
    }

    if (formData.mobileNumber && !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Invalid mobile number (must be 10 digits starting 6-9).'
      isValid = false
    }

    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Invalid email address format.'
      isValid = false
    }

    if (technicians?.some((t) => t.mobileNumber === formData.mobileNumber && t.id !== formData.id)) {
      newErrors.mobileNumber = 'Mobile number already exists!'
      isValid = false
    }
    if (technicians?.some((t) => t.emailId === formData.email && t.id !== formData.id)) {
      newErrors.email = 'Email already exists!'
      isValid = false
    }

    setErrors(newErrors)
    if (!isValid) showCustomToast('Please correct the highlighted errors.', 'error')
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // Ensure "Dr. " prefix is added if missing
      const formattedName = formData.fullName.trim();
      const finalFullName = formattedName.toLowerCase().startsWith('dr')
        ? formattedName
        : `Dr. ${formattedName}`;

      const dataToSave = {
        ...formData,
        fullName: finalFullName
      };

      const res = await onSave(dataToSave)
      console.log(res) // Now this will log actual API response
      if (res != undefined) {
        setFormData(emptyForm)
      } else {
        onClose()
      }
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setLoading(false)
    }
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
  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-4">
      <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
        {Icon && <Icon size={18} className="me-2" style={{ color: COLORS.primary }} />}
        <h5 className="mb-0 fw-bold" style={{ color: '#0c447c', fontSize: '1.1rem' }}>{title}</h5>
      </div>
      <div className="row g-3">{children}</div>
    </div>
  )

  const Row = ({ label, value, icon: Icon }) => (
    <div className="d-flex flex-column h-100 p-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="d-flex align-items-center mb-1">
        {Icon && <Icon size={14} className="me-2 text-muted" />}
        <span className="text-muted fw-bold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{value || 'N/A'}</span>
    </div>
  )

  const RowFull = ({ label, value, icon: Icon }) => (
    <div className="col-12">
      <div className="d-flex flex-column p-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="d-flex align-items-center mb-1">
          {Icon && <Icon size={14} className="me-2 text-muted" />}
          <span className="text-muted fw-bold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        </div>
        <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{value || 'N/A'}</span>
      </div>
    </div>
  )

  // 🔹 File Preview with modal trigger
  const FilePreview = ({ label, type, data }) => {
    if (!data) return <p>{label} </p>

    const isImage = type?.startsWith('image/')
    const fileUrl = data.startsWith('data:') ? data : `data:${type};base64,${data}`

    return (
      <div className="bg-white p-3 rounded-md shadow-sm">
        <strong>{label}:</strong>
        <div className="mt-2">
          {isImage ? (
            <img
              src={fileUrl}
              alt={label}
              className="w-32 h-32 object-cover rounded-md border cursor-pointer"
              onClick={() => handlePreview(fileUrl, type)}
            />
          ) : (
            <button
              type="button "
              className=" btn text-blue-600 hover:underline block mx-2"
              onClick={() => handlePreview(fileUrl, type)}
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            >
              Preview
            </button>
          )}
          <a
            href={fileUrl}
            download={label.replace(/\s+/g, '_')}
            className="text-green-600 hover:underline text-sm block  btn"
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
          >
            Download
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <CModal
        visible={visible}
        onClose={onClose}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit ReferDoctor'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewMode ? (
            <div className="container-fluid px-0">
              {/* 🩺 Doctor Header Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #0c447c 0%, #185fa5 100%)', borderRadius: '15px' }}>
                <div className="card-body p-4 text-white">
                  <div className="d-flex align-items-center">
                    <div className="bg-white p-3 rounded-circle me-4 shadow-sm">
                      <User size={40} color="#0c447c" />
                    </div>
                    <div>
                      <h3 className="fw-bold mb-1 text-white">
                        {formData.fullName?.toLowerCase().startsWith('dr') ? formData.fullName : `Dr. ${formData.fullName}`}
                      </h3>
                      <div className="d-flex flex-wrap gap-3 mt-2 text-white">
                        <div className="d-flex align-items-center opacity-75 text-white">
                          <Shield size={14} className="me-1" />
                          <small>ID: {formData.referralId || 'N/A'}</small>
                        </div>
                        <div className="d-flex align-items-center opacity-75 text-white">
                          <Mail size={14} className="me-1" />
                          <small>{formData.email || 'N/A'}</small>
                        </div>
                        <div className="d-flex align-items-center opacity-75 text-white">
                          <Phone size={14} className="me-1" />
                          <small>{formData.mobileNumber || 'N/A'}</small>
                        </div>
                      </div>
                    </div>
                    <div className="ms-auto d-none d-md-block">
                      <span className="badge bg-light text-primary px-3 py-2 rounded-pill fw-bold shadow-sm">
                        {formData.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 👤 Personal Information */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                  <Section title="Personal Information" icon={User}>
                    <div className="col-md-4">
                      <Row label="Full Name" icon={User} value={formData.fullName?.toLowerCase().startsWith('dr') ? formData.fullName : `Dr. ${formData.fullName}`} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Email Address" icon={Mail} value={formData.email} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Contact Number" icon={Phone} value={formData.mobileNumber} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Gender" icon={Activity} value={formData.gender} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Date of Birth" icon={Calendar} value={formData.dateOfBirth} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Government ID" icon={Shield} value={formData.governmentId} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Status" icon={Activity} value={formData.status} />
                    </div>
                  </Section>
                </div>
              </div>

              {/* 🏥 Work Information */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                  <Section title="Work Information" icon={Briefcase}>
                    <div className="col-md-4">
                      <Row label="Department" icon={Briefcase} value={formData.department} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Experience (Years)" icon={Award} value={formData.yearsOfExperience} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Specialization" icon={Award} value={formData.specialization} />
                    </div>
                    <div className="col-md-6">
                      <Row label="Current Hospital" icon={Briefcase} value={formData.currentHospitalName} />
                    </div>
                    <div className="col-md-6">
                      <Row label="Medical Reg. No." icon={Shield} value={formData.medicalRegistrationNumber} />
                    </div>
                  </Section>
                </div>
              </div>

              {/* 📍 Address */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                  <Section title="Location Details" icon={MapPin}>
                    <RowFull
                      label="Full Address"
                      icon={MapPin}
                      value={`${formData.address.houseNo}, ${formData.address.street}, ${formData.address.city}, ${formData.address.state} - ${formData.address.postalCode}, ${formData.address.country}`}
                    />
                  </Section>
                </div>
              </div>

              {/* 💳 Bank Details */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                  <Section title="Bank Account Details" icon={CreditCard}>
                    <div className="col-md-4">
                      <Row label="Account Number" icon={CreditCard} value={formData.bankAccountNumber.accountNumber} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Holder Name" icon={User} value={formData.bankAccountNumber.accountHolderName} />
                    </div>
                    <div className="col-md-4">
                      <Row label="IFSC Code" icon={Shield} value={formData.bankAccountNumber.ifscCode} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Bank Name" icon={Briefcase} value={formData.bankAccountNumber.bankName} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Branch Name" icon={MapPin} value={formData.bankAccountNumber.branchName} />
                    </div>
                    <div className="col-md-4">
                      <Row label="PAN Card" icon={Shield} value={formData.bankAccountNumber.panCardNumber} />
                    </div>
                  </Section>
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
                        value={formData.role || 'referdoctor'}
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
                      // update value
                      handleChange('fullName', e.target.value)

                      // run validation live
                      const err = validateField('fullName', e.target.value)
                      setErrors((prev) => ({ ...prev, fullName: err }))
                    }}
                  />

                  {/* show error below */}
                  {errors.fullName && (
                    <div style={{ color: 'red', fontSize: '12px' }}>{errors.fullName}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Gender <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormSelect
                    value={formData.gender}
                    onChange={(e) => {
                      handleChange('gender', e.target.value)
                      setErrors(p => ({ ...p, gender: e.target.value ? '' : 'Gender is required.' }))
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
                  <CFormLabel>Date of Birth</CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfBirth}
                    max={
                      new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                        .toISOString()
                        .split('T')[0]
                    } // ✅ only allow DOB ≤ today-18yrs
                    onChange={(e) => {
                      handleChange('dateOfBirth', e.target.value)
                      setErrors(p => ({ ...p, dateOfBirth: validateField('dateOfBirth', e.target.value) }))
                    }}
                  />
                  {errors.dateOfBirth && <div className="text-danger mt-1">{errors.dateOfBirth}</div>}
                </div>

                <div className="col-md-4">
                  <CFormLabel>Mobile Number</CFormLabel>
                  <CFormInput
                    type="text"
                    maxLength={10} // ✅ Restrict to 10 digits
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        // Update form data
                        handleChange('mobileNumber', value)

                        // Run live validation
                        const err = validateField('contactNumber', value, formData)
                        setErrors((prev) => ({ ...prev, mobileNumber: err }))
                      }
                    }}
                  />
                  {errors.mobileNumber && (
                    <div className="text-danger mt-1">{errors.mobileNumber}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleChange('email', e.target.value)
                      const err = validateField('emailId', e.target.value)
                      setErrors((prev) => ({ ...prev, email: err }))
                    }}
                  />
                  {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>GovernmentID(AadharCard No)</CFormLabel>
                  <CFormInput
                    maxLength={12}
                    value={formData.governmentId}
                    onChange={(e) => {
                      const value = e.target.value

                      // ✅ Only digits allowed, max 12
                      if (/^\d*$/.test(value)) {
                        // Update form data
                        handleChange('governmentId', value)

                        // Run live validation
                        const err = validateField('governmentId', value, formData)
                        setErrors((prev) => ({ ...prev, governmentId: err }))
                      }
                    }}
                  />
                  {errors.governmentId && (
                    <div className="text-danger mt-1">{errors.governmentId}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <CFormLabel>Medical Registration Number</CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.medicalRegistrationNumber)}
                    onChange={(e) => {
                      const value = e.target.value

                      // Update form data
                      handleChange('medicalRegistrationNumber', value)

                      // Run live validation
                      const err = validateField('medicalRegistrationNumber', value, formData)
                      setErrors((prev) => ({
                        ...prev,
                        medicalRegistrationNumber: err,
                      }))
                    }}
                  />
                  {errors.medicalRegistrationNumber && (
                    <div className="text-danger mt-1">{errors.medicalRegistrationNumber}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Department</CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.department)}
                    onChange={(e) => {
                      const value = e.target.value

                      // Update form data
                      handleChange('department', value)

                      // Run live validation
                      const err = validateField('department', value, formData)
                      setErrors((prev) => ({
                        ...prev,
                        department: err,
                      }))
                    }}
                  />
                  {errors.department && <div className="text-danger mt-1">{errors.department}</div>}
                </div>
                <div className="col-md-4">
                  <CFormLabel>Specialization</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => {
                      const value = e.target.value

                      // Update form data
                      handleChange('specialization', value)

                      // Run live validation
                      const err = validateField('specialization', value, formData)
                      setErrors((prev) => ({
                        ...prev,
                        specialization: err,
                      }))
                    }}
                  />
                  {errors.specialization && (
                    <div className="text-danger mt-1">{errors.specialization}</div>
                  )}
                </div>
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>Current Hospital Name</CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.currentHospitalName)}
                    onChange={(e) => handleChange('currentHospitalName', e.target.value)}
                  />{' '}
                </div>
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>
                    Years of Experience <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('yearsOfExperience', value)

                        // Run live validation
                        const err = validateField('yearsOfExperience', value, formData)
                        setErrors((prev) => ({
                          ...prev,
                          yearsOfExperience: err,
                        }))
                      }
                    }}
                  />
                  {errors.yearsOfExperience && (
                    <div className="text-danger mt-1">{errors.yearsOfExperience}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={formData.status || ''} // empty initially
                    onChange={(e) => {
                      const value = e.target.value
                      handleChange('status', value)

                      // Run live validation
                      const err = validateField('status', value)
                      setErrors((prev) => ({
                        ...prev,
                        status: err,
                      }))
                    }}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </CFormSelect>
                  {/* {errors.status && <div className="text-danger mt-1">{errors.status}</div>} */}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  {/* <CFormLabel>
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
                    <option value="00:00-06:00">Night (12:00 AM – 06:00 AM) – 6 hrs</option>

                    <option value="06:00-15:00">Day Shift (06:00 AM – 03:00 PM) – 9 hrs</option>
                    <option value="15:00-00:00">Evening Shift (03:00 PM – 12:00 AM) – 9 hrs</option>
                    <option value="21:00-06:00">Night Shift (09:00 PM – 06:00 AM) – 9 hrs</option>

                    <option value="06:00-18:00">Long Day (06:00 AM – 06:00 PM) – 12 hrs</option>
                    <option value="18:00-06:00">Long Night (06:00 PM – 06:00 AM) – 12 hrs</option>
                  </CFormSelect> */}
                </div>

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
                        <CFormLabel className="text-capitalize">{field}</CFormLabel>
                        <CFormInput
                          type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (field === 'postalCode') {
                              // Only digits allowed
                              if (/^\d*$/.test(value)) {
                                handleNestedChange('address', field, value)
                                // Live validation
                                const err = validateField(field, value, formData)
                                setErrors((prev) => ({
                                  ...prev,
                                  address: { ...prev.address, [field]: err },
                                }))
                              }
                            } else {
                              handleNestedChange('address', field, value)
                              // Live validation
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
              {Object.keys(formData.bankAccountNumber)
                .reduce((rows, field, index) => {
                  if (index % 3 === 0) rows.push([]) // start new row every 3 fields
                  rows[rows.length - 1].push(field)
                  return rows
                }, [])
                .map((rowFields, rowIndex) => (
                  <div className="row mb-3" key={rowIndex}>
                    {rowFields.map((field) => (
                      <div className="col-md-4" key={field}>
                        <CFormLabel className="text-capitalize">{field}</CFormLabel>
                        <CFormInput
                          value={formData.bankAccountNumber[field]}
                          maxLength={
                            field === 'accountNumber'
                              ? 18
                              : field === 'panCardNumber'
                                ? 10
                                : field === 'ifscCode'
                                  ? 11
                                  : undefined
                          }
                          onChange={async (e) => {
                            let value = e.target.value

                            if (field === 'accountNumber') {
                              if (/^\d*$/.test(value)) {
                                handleNestedChange('bankAccountNumber', field, value)
                                const err = validateField('accountNumber', value, formData)
                                setErrors((prev) => ({
                                  ...prev,
                                  bankAccountNumber: {
                                    ...prev.bankAccountNumber,
                                    accountNumber: err,
                                  },
                                }))
                              }
                              return
                            }

                            if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value)) {
                                handleNestedChange('bankAccountNumber', field, value)
                              }

                              const err = validateField('panCardNumber', value, formData)
                              setErrors((prev) => ({
                                ...prev,
                                bankAccountNumber: {
                                  ...prev.bankAccountNumber,
                                  panCardNumber: err,
                                },
                              }))
                              return
                            }

                            if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (!/^[A-Z0-9]*$/.test(value)) return
                              handleNestedChange('bankAccountNumber', field, value)

                              const err = validateField('ifscCode', value, formData)
                              setErrors((prev) => ({
                                ...prev,
                                bankAccountNumber: { ...prev.bankAccountNumber, ifscCode: err },
                              }))

                              if (value.length === 11 && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                                try {
                                  const res = await fetch(`https://ifsc.razorpay.com/${value}`)
                                  if (res.ok) {
                                    const data = await res.json()
                                    handleNestedChange(
                                      'bankAccountNumber',
                                      'bankName',
                                      data.BANK || '',
                                    )
                                    handleNestedChange(
                                      'bankAccountNumber',
                                      'branchName',
                                      data.BRANCH || '',
                                    )
                                  }
                                } catch {
                                  handleNestedChange('bankAccountNumber', 'bankName', '')
                                  handleNestedChange('bankAccountNumber', 'branchName', '')
                                }
                              } else {
                                handleNestedChange('bankAccountNumber', 'bankName', '')
                                handleNestedChange('bankAccountNumber', 'branchName', '')
                              }
                              return
                            }

                            // Other fields
                            handleNestedChange('bankAccountNumber', field, value)
                          }}
                        />
                        {errors.bankAccountNumber?.[field] && (
                          <div className="text-danger mt-1">{errors.bankAccountNumber[field]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

              {/* 🔹 Documents */}
              {/* <h5 className="mt-3">Documents</h5>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                      Image <span style={{ color: 'red' }}>*</span>
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
                }} */}
              {/* > */}
              {/* <CButton
                  style={{
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                  }}
                  onClick={handleUserPermission}
                >
                  User Permissions
                </CButton> */}
              {/* </div> */}

              {showPModal && (
                <div className="modal fade show d-block" tabIndex="-1">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Set User Permissions</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowPModal(false)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <div className="row">
                          {features.map((feature) => {
                            const isFeatureChecked = !!formData.permissions[feature]
                            const allSelected =
                              isFeatureChecked &&
                              formData.permissions[feature].length === actions.length

                            return (
                              <div key={feature} className="col-md-5 mb-3 border p-2 rounded mx-4">
                                {/* Feature Checkbox */}
                                <div className="d-flex justify-content-between align-items-center">
                                  <label className="fw-bold">
                                    <input
                                      type="checkbox"
                                      checked={isFeatureChecked}
                                      onChange={() => toggleFeature(feature)}
                                    />{' '}
                                    {feature}
                                  </label>

                                  {/* Select All */}
                                  <label>
                                    <input
                                      type="checkbox"
                                      disabled={!isFeatureChecked}
                                      checked={allSelected}
                                      onChange={() => toggleAllActions(feature)}
                                    />{' '}
                                    Select All
                                  </label>
                                </div>

                                {/* Actions */}
                                <div className="d-flex flex-wrap gap-3 mt-2">
                                  {actions.map((action) => (
                                    <label key={action} className="d-flex align-items-center gap-1">
                                      <input
                                        type="checkbox"
                                        disabled={!isFeatureChecked}
                                        checked={
                                          formData.permissions[feature]?.includes(action) || false
                                        }
                                        onChange={() => togglePermission(feature, action)}
                                      />
                                      {action}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowPModal(false)}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowPModal(false)}
                        >
                          Save Permissions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* backdrop */}
              {showPModal && <div className="modal-backdrop fade show"></div>}
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
                style={{ backgroundColor: COLORS.primary, color: 'white' }}
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

export default ReferDoctorForm
