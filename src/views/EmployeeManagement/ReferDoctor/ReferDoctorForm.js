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
import '../sf-styles.css'

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
    clinicId: sessionStorage.getItem('HospitalId'),
    branchId: sessionStorage.getItem('branchId'),
    hospitalName: sessionStorage.getItem('HospitalName'),
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
  const [clinicId, setClinicID] = useState(sessionStorage.getItem('HospitalId'))

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
    // 'gender',
    // 'mobileNumber',
    // 'emergencyContact',
    // 'yearsOfExperience',
    // 'status',

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
    if (field === 'specialization' || field === 'currentHospitalName') {
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

    // 1. Mandatory field: fullName
    if (!formData.fullName || formData.fullName.trim() === '') {
      newErrors.fullName = 'Full Name is required.'
      isValid = false
    } else if (formData.fullName.trim().length < 3 || formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full Name must be between 3 and 50 characters.'
      isValid = false
    }

    // 2. Format validations for optional fields (if filled)
    if (formData.governmentId) {
      if (!/^[2-9][0-9]{11}$/.test(formData.governmentId)) {
        newErrors.governmentId = 'Government ID (Aadhaar) must be 12 digits and cannot start with 0 or 1.'
        isValid = false
      } else if (/^(\d)\1{11}$/.test(formData.governmentId)) {
        newErrors.governmentId = 'Government ID (Aadhaar) cannot have all identical digits.'
        isValid = false
      }
    }

    if (formData.dateOfBirth) {
      const todayStr = new Date().toISOString().split('T')[0]
      if (formData.dateOfBirth > todayStr) {
        newErrors.dateOfBirth = 'Date of Birth cannot be in the future.'
        isValid = false
      } else {
        const dob = new Date(formData.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        const isBeforeBirthday =
          today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        const actualAge = isBeforeBirthday ? age - 1 : age
        if (actualAge < 21) {
          newErrors.dateOfBirth = 'Doctor must be at least 21 years old.'
          isValid = false
        } else if (actualAge >= 100) {
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

    if (formData.bankAccountNumber?.ifscCode) {
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankAccountNumber.ifscCode)) {
        if (!newErrors.bankAccountNumber) newErrors.bankAccountNumber = {}
        newErrors.bankAccountNumber.ifscCode = 'Invalid IFSC format (e.g., HDFC0001234).'
        isValid = false
      }
    }

    if (formData.mobileNumber) {
      if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Invalid mobile number (must be 10 digits starting 6-9).'
        isValid = false
      } else if (technicians?.some((t) => (t.mobileNumber === formData.mobileNumber || t.contactNumber === formData.mobileNumber) && t.id !== formData.id)) {
        newErrors.mobileNumber = 'Mobile number already exists!'
        isValid = false
      }
    }

    if (formData.email) {
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Invalid email address format.'
        isValid = false
      } else if (technicians?.some((t) => (t.email === formData.email || t.emailId === formData.email) && t.id !== formData.id)) {
        newErrors.email = 'Email already exists!'
        isValid = false
      }
    }

    if (formData.address?.postalCode && formData.address.postalCode.length !== 6) {
      if (!newErrors.address) newErrors.address = {}
      newErrors.address.postalCode = 'Postal code must be 6 digits.'
      isValid = false
    }

    if (formData.emergencyContact) {
      if (formData.emergencyContact.length !== 10 || !/^[6-9]/.test(formData.emergencyContact)) {
        newErrors.emergencyContact = 'Emergency contact must be 10 digits starting with 6-9.'
        isValid = false
      } else if (formData.mobileNumber && formData.emergencyContact === formData.mobileNumber) {
        newErrors.emergencyContact = 'Emergency contact cannot be the same as contact number.'
        isValid = false
      }
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
      const finalFullName = formattedName;

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

  // Reuse SecurityForm styles/components for consistent look
  const Section = ({ title, icon: Icon, children }) => (
    <div className="sf-card">
      <div className="sf-card-header">
        {Icon && <Icon size={14} className="sf-card-icon" />}
        {title}
      </div>
      <div className="sf-card-body">{children}</div>
    </div>
  )

  const getInitials = (name) => {
    if (!name) return ''
    const hasDr = /^dr\.?\s+/i.test(name)
    const cleaned = name.replace(/^dr\.?\s+/i, '').trim()
    const parts = cleaned.split(/\s+/).filter(Boolean)

    if (hasDr) {
      // First initial is 'D' for Dr, second is first letter of actual name (if available)
      const second = parts[0] ? parts[0][0].toUpperCase() : 'R'
      return ('D' + second).toUpperCase()
    }

    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const FormSectionHeading = ({ icon: Icon, title }) => (
    <div className="sf-section-title" style={{ marginBottom: '8px' }}>
      {Icon && <Icon size={14} className="sf-section-icon" />}
      {title}
    </div>
  )

  const Row = ({ label, value, icon: Icon }) => (
    <div className="sf-info-row">
      <span className="sf-info-label">{label}</span>
      <span className="sf-info-value">{value || 'N/A'}</span>
    </div>
  )

  const RowFull = ({ label, value, icon: Icon }) => (
    <div className="col-12">
      <div className="sf-info-row">
        <span className="sf-info-label">{label}</span>
        <span className="sf-info-value">{value || 'N/A'}</span>
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
        backdrop="static">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {viewMode ? 'Doctor Information' : 'Add / Edit Refer Doctor'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ fontSize: '0.80rem' }}>
          {viewMode ? (
            <div className="container-fluid px-0">
              {/* 🩺 Doctor Header (sf-profile-header) */}
              <div className="sf-profile-header">
                <div className="sf-profile-avatar">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt={formData.fullName} />
                  ) : (
                    <div className="sf-initials">{getInitials(formData.fullName)}</div>
                  )}
                </div>
                <div>
                  <h3 className="sf-profile-name">
                    {formData.fullName?.toLowerCase() ? formData.fullName : ` ${formData.fullName}`}
                  </h3>
                  <p className="sf-profile-meta">{formData.email || 'N/A'}</p>
                  <p className="sf-profile-meta">{formData.mobileNumber || 'N/A'}</p>
                </div>
                <div className="ms-auto d-none d-md-block">
                  <span className="sf-badge">{formData.status || 'Active'}</span>
                </div>
              </div>

              {/* 👤 Personal Information */}
              <Section title="Personal Information" icon={User}>
                <div className="sf-inner-grid">
                  <Row label="Full Name" icon={User} value={formData.fullName?.toLowerCase() ? formData.fullName : ` ${formData.fullName}`} />
                  <Row label="Email Address" icon={Mail} value={formData.email} />
                  <Row label="Contact Number" icon={Phone} value={formData.mobileNumber} />
                  <Row label="Gender" icon={Activity} value={formData.gender} />
                  <Row label="Date of Birth" icon={Calendar} value={formData.dateOfBirth} />
                  <Row label="Government ID" icon={Shield} value={formData.governmentId} />
                  <Row label="Status" icon={Activity} value={formData.status} />
                </div>
              </Section>

              {/* 🏥 Work Information */}
              <Section title="Work Information" icon={Briefcase}>
                <div className="sf-inner-grid">
                  <Row label="Department" icon={Briefcase} value={formData.department} />
                  <Row label="Experience (Years)" icon={Award} value={formData.yearsOfExperience} />
                  <Row label="Specialization" icon={Award} value={formData.specialization} />
                  <Row label="Current Hospital" icon={Briefcase} value={formData.currentHospitalName} />
                  <Row label="Medical Reg. No." icon={Shield} value={formData.medicalRegistrationNumber} />
                </div>
              </Section>

              {/* 📍 Address */}
              <Section title="Location Details" icon={MapPin}>
                <div className="sf-inner-grid">
                  <RowFull
                    label="Full Address"
                    icon={MapPin}
                    value={`${formData.address.houseNo || ''}${formData.address.street ? ', ' + formData.address.street : ''}${formData.address.city ? ', ' + formData.address.city : ''}${formData.address.state ? ', ' + formData.address.state : ''}${formData.address.postalCode ? ' - ' + formData.address.postalCode : ''}${formData.address.country ? ', ' + formData.address.country : ''}`}
                  />
                </div>
              </Section>

              {/* 💳 Bank Details */}
              <Section title="Bank Account Details" icon={CreditCard}>
                <div className="sf-inner-grid">
                  <Row label="Account Number" icon={CreditCard} value={formData.bankAccountNumber.accountNumber} />
                  <Row label="Holder Name" icon={User} value={formData.bankAccountNumber.accountHolderName} />
                  <Row label="IFSC Code" icon={Shield} value={formData.bankAccountNumber.ifscCode} />
                  <Row label="Bank Name" icon={Briefcase} value={formData.bankAccountNumber.bankName} />
                  <Row label="Branch Name" icon={MapPin} value={formData.bankAccountNumber.branchName} />
                  <Row label="PAN Card" icon={Shield} value={formData.bankAccountNumber.panCardNumber} />
                </div>
              </Section>

            </div>
          ) : (
            // ✅ EDIT MODE
            <CForm>
              {/* 🔹 Basic Info */}
              <div className="sf-section">
                <div className="sf-section-title">
                  <User size={14} className="sf-section-icon" />
                  Basic Information
                </div>
                <div className="sf-section-body">

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="row">
                        <div className="col-md-5">
                          <CFormLabel>ClinicID</CFormLabel>
                          <CFormInput
                            className="sf-input"
                            value={clinicId}
                            disabled
                            onChange={(e) => handleChange('clinicId', e.target.value)}
                          />
                        </div>
                        <div className="col-md-7">
                          <CFormLabel>Role</CFormLabel>
                          <CFormInput
                            className="sf-input"
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
                        className="sf-input"
                        value={formData.fullName}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^A-Za-z\s.]/g, '')
                          handleChange('fullName', value)
                          const err = validateField('fullName', value)
                          setErrors((prev) => ({ ...prev, fullName: err }))
                        }}
                      />

                      {/* show error below */}
                      {errors.fullName && (
                        <div style={{ color: 'red', fontSize: '12px' }}>{errors.fullName}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Gender</CFormLabel>
                      <CFormSelect
                        className="sf-input"
                        value={formData.gender}
                        onChange={(e) => {
                          handleChange('gender', e.target.value)
                          setErrors((p) => ({ ...p, gender: '' }))
                        }}
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
                      <CFormLabel>Date of Birth</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        type="date"
                        value={formData.dateOfBirth}
                        max={
                          new Date(new Date().setFullYear(new Date().getFullYear() - 21))
                            .toISOString()
                            .split('T')[0]
                        }
                        onChange={(e) => {
                          const value = e.target.value
                          handleChange('dateOfBirth', value)
                          if (!value) {
                            setErrors((p) => ({ ...p, dateOfBirth: '' }))
                          } else {
                            const todayStr = new Date().toISOString().split('T')[0]
                            if (value > todayStr) {
                              setErrors((p) => ({ ...p, dateOfBirth: 'Date of Birth cannot be in the future.' }))
                            } else {
                              const dob = new Date(value)
                              const today = new Date()
                              let age = today.getFullYear() - dob.getFullYear()
                              const isBeforeBirthday =
                                today.getMonth() < dob.getMonth() ||
                                (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
                              if (isBeforeBirthday) age--
                              if (age < 21) {
                                setErrors((p) => ({ ...p, dateOfBirth: 'Doctor must be at least 21 years old.' }))
                              } else if (age >= 100) {
                                setErrors((p) => ({ ...p, dateOfBirth: 'Doctor must be less than 100 years old.' }))
                              } else {
                                setErrors((p) => ({ ...p, dateOfBirth: '' }))
                              }
                            }
                          }
                        }}
                      />
                      {errors.dateOfBirth && <div className="text-danger mt-1">{errors.dateOfBirth}</div>}
                    </div>

                    <div className="col-md-4">
                      <CFormLabel>Mobile Number </CFormLabel>
                      <CFormInput
                        className="sf-input"
                        type="text"
                        maxLength={10}
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            handleChange('mobileNumber', value)
                            if (!value) {
                              setErrors((prev) => ({ ...prev, mobileNumber: '' }))
                            } else {
                              let err = ''
                              if (!/^[6-9]\d{9}$/.test(value)) {
                                err = 'Invalid mobile number (must be 10 digits starting 6-9).'
                              } else if (technicians?.some((t) => (t.mobileNumber === value || t.contactNumber === value) && t.id !== formData.id)) {
                                err = 'Mobile number already exists!'
                              }
                              setErrors((prev) => ({ ...prev, mobileNumber: err }))
                            }
                          }
                        }}
                      />
                      {errors.mobileNumber && (
                        <div style={{ color: 'red', fontSize: '12px' }}>{errors.mobileNumber}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Email</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          const value = e.target.value
                          handleChange('email', value)
                          if (!value) {
                            setErrors((prev) => ({ ...prev, email: '' }))
                          } else {
                            let err = ''
                            if (!emailPattern.test(value)) {
                              err = 'Invalid email address format.'
                            } else if (technicians?.some((t) => (t.email === value || t.emailId === value) && t.id !== formData.id)) {
                              err = 'Email already exists!'
                            }
                            setErrors((prev) => ({ ...prev, email: err }))
                          }
                        }}
                      />
                      {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <CFormLabel>GovernmentID(AadharCard No)</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        maxLength={12}
                        value={formData.governmentId}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            handleChange('governmentId', value)
                            if (!value) {
                              setErrors((prev) => ({ ...prev, governmentId: '' }))
                            } else {
                              let err = ''
                              if (!/^[2-9][0-9]{11}$/.test(value)) {
                                err = 'Government ID (Aadhaar) must be 12 digits and cannot start with 0 or 1.'
                              } else if (/^(\d)\1{11}$/.test(value)) {
                                err = 'Government ID (Aadhaar) cannot have all identical digits.'
                              }
                              setErrors((prev) => ({ ...prev, governmentId: err }))
                            }
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
                        className="sf-input"
                        value={capitalizeWords(formData.medicalRegistrationNumber)}
                        onChange={(e) => {
                          const value = e.target.value
                          handleChange('medicalRegistrationNumber', value)
                          if (!value) {
                            setErrors((prev) => ({ ...prev, medicalRegistrationNumber: '' }))
                          } else {
                            let err = ''
                            if (!/^[A-Za-z0-9\-\/]+$/.test(value)) {
                              err = 'Medical Registration Number contains invalid characters.'
                            } else if (value.length < 3 || value.length > 20) {
                              err = 'Medical Registration Number must be between 3 and 20 characters.'
                            }
                            setErrors((prev) => ({ ...prev, medicalRegistrationNumber: err }))
                          }
                        }}
                      />
                      {errors.medicalRegistrationNumber && (
                        <div className="text-danger mt-1">{errors.medicalRegistrationNumber}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Department</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        value={capitalizeWords(formData.department)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                          handleChange('department', value)
                          if (!value) {
                            setErrors((prev) => ({ ...prev, department: '' }))
                          } else {
                            let err = ''
                            if (value.length < 2 || value.length > 50) {
                              err = 'Department must be between 2 and 50 characters.'
                            }
                            setErrors((prev) => ({ ...prev, department: err }))
                          }
                        }}
                      />
                      {errors.department && <div className="text-danger mt-1">{errors.department}</div>}
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Specialization</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => {
                          const value = e.target.value
                          handleChange('specialization', value)
                          if (!value) {
                            setErrors((prev) => ({ ...prev, specialization: '' }))
                          } else {
                            let err = ''
                            if (value.length < 2 || value.length > 50) {
                              err = 'Specialization must be between 2 and 50 characters.'
                            }
                            setErrors((prev) => ({ ...prev, specialization: err }))
                          }
                        }}
                      />
                      {errors.specialization && (
                        <div className="text-danger mt-1">{errors.specialization}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Current Hospital Name</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        value={capitalizeWords(formData.currentHospitalName)}
                        onChange={(e) => handleChange('currentHospitalName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Years of Experience</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            handleChange('yearsOfExperience', value)
                            if (!value) {
                              setErrors((prev) => ({ ...prev, yearsOfExperience: '' }))
                            } else {
                              let err = ''
                              if (parseInt(value) < 0) {
                                err = 'Years of Experience cannot be negative.'
                              } else if (parseInt(value) > 50) {
                                err = 'Years of Experience seems too high.'
                              }
                              setErrors((prev) => ({ ...prev, yearsOfExperience: err }))
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <CFormLabel>Status</CFormLabel>
                      <CFormSelect
                        className="sf-input"
                        value={formData.status || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          handleChange('status', value)
                          setErrors((prev) => ({ ...prev, status: '' }))
                        }}
                      >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </CFormSelect>
                    </div>
                    <div className="col-md-4">
                      <CFormLabel>Emergency Contact</CFormLabel>
                      <CFormInput
                        className="sf-input"
                        type="text"
                        maxLength={10}
                        value={formData.emergencyContact}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            handleChange('emergencyContact', value)
                            if (!value) {
                              setErrors((prev) => ({ ...prev, emergencyContact: '' }))
                            } else {
                              let err = ''
                              if (value.length !== 10) {
                                err = 'Emergency contact must be 10 digits.'
                              } else if (!/^[6-9]/.test(value)) {
                                err = 'Emergency contact must start with 6, 7, 8, or 9.'
                              } else if (formData.mobileNumber && value === formData.mobileNumber) {
                                err = 'Emergency contact cannot be the same as contact number.'
                              }
                              setErrors((prev) => ({ ...prev, emergencyContact: err }))
                            }
                          }
                        }}
                      />
                      {errors.emergencyContact && (
                        <div style={{ color: 'red', fontSize: '12px' }}>{errors.emergencyContact}</div>
                      )}
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

                </div>
              </div>
              {/* 🔹 Address */}
              <div className="sf-section">
                <div className="sf-section-title">
                  <MapPin size={14} className="sf-section-icon" />
                  Address
                </div>
                <div className="sf-section-body">

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
                              className="sf-input"
                              type="text"
                              maxLength={field === 'postalCode' ? 6 : undefined}
                              value={formData.address[field]}
                              onChange={(e) => {
                                let value = e.target.value
                                if (field === 'postalCode') {
                                  if (/^\d*$/.test(value)) {
                                    handleNestedChange('address', field, value)
                                    let err = ''
                                    if (value && value.length !== 6) {
                                      err = 'Postal code must be 6 digits.'
                                    }
                                    setErrors((prev) => ({
                                      ...prev,
                                      address: { ...prev.address, [field]: err },
                                    }))
                                  }
                                } else {
                                  handleNestedChange('address', field, value)
                                  setErrors((prev) => ({
                                    ...prev,
                                    address: { ...prev.address, [field]: '' },
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

                </div>
              </div>
              {/* 🔹 Bank Details */}
              <div className="sf-section">
                <div className="sf-section-title">
                  <CreditCard size={14} className="sf-section-icon" />
                  Bank Account Details
                </div>
                <div className="sf-section-body">
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
                              className="sf-input"
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
                                    let err = ''
                                    if (value && (value.length < 9 || value.length > 18)) {
                                      err = 'Account number must be between 9 and 18 digits.'
                                    }
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
                                  let err = ''
                                  if (value && value.length !== 10) {
                                    err = 'PAN Card must be 10 characters.'
                                  }
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

                                  let err = ''
                                  if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                                    err = 'Invalid IFSC format (e.g., HDFC0001234).'
                                  }
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

                </div>
              </div>
              {/* 🔹 Documents */}
              {/* <h5 className="mt-3">Documents</h5>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                      Image <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    className="sf-input"
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
                    className="sf-input"
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')}
                  />
                </div>

                <div className="col-md-4">
                  <CFormLabel>Teaining Guard License</CFormLabel>
                  <CFormInput
                    className="sf-input"
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'qualificationOrCertifications')}
                  />
                </div>
              </div>

              <CFormLabel>Previous Employment History</CFormLabel>
              <CFormTextarea
                className="sf-input sf-textarea"
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
            <button className="sf-btn-cancel" onClick={onClose}>Close</button>
          ) : (
            <>
              <button type="button" className="sf-btn-cancel" onClick={() => setFormData(emptyForm)}>
                Clear
              </button>
              <button type="button" className="sf-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="sf-btn-save" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving...</>
                ) : (
                  'Save'
                )}
              </button>
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
      {/* ── STYLES (copied from SecurityForm) ── */}
      <style>{`
        .sf-profile-header { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f0f5fb; border-radius: 10px; margin-bottom: 14px; }
        .sf-profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #b5d4f4; flex-shrink: 0; }
        .sf-profile-name { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0 0 4px; }
        .sf-profile-meta { font-size: 12px; color: #6b7280; margin: 0 0 2px; }
        .sf-badge { display: inline-block; background: #185fa5; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; margin-top: 4px; }

        .sf-card { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .sf-card-header { display: flex; align-items: center; gap: 8px; background: #185fa5; color: #fff; font-size: 12px; font-weight: 600; padding: 9px 14px; }
        .sf-card-icon { color: #b5d4f4; }
        .sf-card-body { padding: 14px; background: #fff; }
        .sf-inner-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 24px; }
        .sf-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .sf-info-row { display: flex; flex-direction: column; gap: 2px; }
        .sf-info-label { font-size: 10.5px; font-weight: 600; color: #185fa5; text-transform: uppercase; letter-spacing: 0.3px; }
        .sf-info-value { font-size: 13px; color: #374151; font-weight: 500; }
        .sf-muted { font-size: 12px; color: #9ca3af; font-style: italic; margin: 0; }

        .sf-section { margin-bottom: 18px; border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; }
        .sf-section-title { display: flex; align-items: center; gap: 8px; background: #185fa5; color: #fff; font-size: 12px; font-weight: 600; padding: 9px 14px; }
        .sf-section-icon { color: #b5d4f4; }
        .sf-section-body { padding: 14px; }

        .sf-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 0; }
        .sf-col-third { flex: 1 1 calc(33.333% - 12px); min-width: 150px; }
        .sf-col-half  { flex: 1 1 calc(50% - 12px); min-width: 140px; }
        .sf-col-full  { flex: 1 1 100%; }

        .sf-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
        .sf-label { font-size: 11px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 3px; }
        .sf-required { color: #e24b4a; font-size: 11px; }
        .sf-error { font-size: 11px; color: #e24b4a; margin-top: 2px; }

        .sf-input {
          width: 100%; padding: 7px 10px; font-size: 12.5px; color: #374151;
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 7px;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none; -webkit-appearance: none;
        }
        .sf-input:focus { border-color: #185fa5; box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12); }
        .sf-input-disabled { background: #f0f5fb !important; color: #9ca3af !important; cursor: not-allowed; }
        .sf-textarea { resize: vertical; min-height: 70px; }

        .sf-btn-cancel {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .sf-btn-cancel:hover { background: #f3f4f6; }

        .sf-btn-save {
          display: inline-flex; align-items: center; gap: 5px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s;
        }
        .sf-btn-save:hover:not(:disabled) { filter: brightness(0.9); }
        .sf-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 600px) {
          .sf-col-third, .sf-col-half { flex: 1 1 100%; }
          .sf-inner-grid, .sf-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

export default ReferDoctorForm
