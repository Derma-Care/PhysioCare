import React, { useEffect, useState } from 'react'
import {
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
import { User, Briefcase, MapPin, CreditCard, FileText, ShieldCheck, Eye, Save, X, RotateCcw } from 'lucide-react'

const FrontDeskForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  viewMode,
  receptionist,
  technicians,
  fetchTechs,
}) => {
  const emptyPermissions = {}

  const emptyForm = {
    clinicId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    branchName: localStorage.getItem('branchName'),
    hospitalName: localStorage.getItem('HospitalName'),
    createdBy: localStorage.getItem('staffId') || 'admin',
    fullName: '',
    dateOfBirth: '',
    contactNumber: '',
    qualification: '',
    governmentId: '',
    dateOfJoining: '',
    department: '',
    emergencyContact: '',
    profilePicture: '',
    emailId: '',
    graduationCertificate: '',
    computerSkillsProof: '',
    previousEmploymentHistory: '',
    role: 'receptionist',
    gender: '',
    yearOfExperience: '',
    vaccinationStatus: '',
    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    bankAccountDetails: {
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      panCardNumber: '',
    },
    permissions: emptyPermissions,
  }

  const [formData, setFormData] = useState(emptyForm)
  const [clinicId] = useState(localStorage.getItem('HospitalId'))
  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [ifscLoading, setIfscLoading] = useState(false)

  const mandatoryFields = [
    'fullName', 'dateOfBirth', 'contactNumber', 'emailId', 'governmentId',
    'dateOfJoining', 'department', 'qualification', 'clinicId', 'profilePicture', 'role',
    'address.houseNo', 'address.street', 'address.city', 'address.state',
    'address.postalCode', 'address.country',
    'bankAccountDetails.accountNumber', 'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName', 'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode', 'bankAccountDetails.panCardNumber',
  ]

  function validateMandatoryFields(formData, mandatoryFields) {
    const missingFields = []
    for (const field of mandatoryFields) {
      const keys = field.split('.')
      let value = formData
      for (const key of keys) { value = value?.[key] }
      if (!value || String(value).trim() === '') missingFields.push(field)
    }
    return missingFields
  }

  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }
      if (updated[feature]) delete updated[feature]
      else updated[feature] = []
      return { ...prev, permissions: updated }
    })
  }

  const togglePermission = (feature, action) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }
      if (!updated[feature]) updated[feature] = []
      if (updated[feature].includes(action))
        updated[feature] = updated[feature].filter((a) => a !== action)
      else updated[feature] = [...updated[feature], action]
      return { ...prev, permissions: updated }
    })
  }

  const toggleAllActions = (feature) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }
      if (!updated[feature]) updated[feature] = [...actions]
      else if (updated[feature].length === actions.length) updated[feature] = []
      else updated[feature] = [...actions]
      return { ...prev, permissions: updated }
    })
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        createdBy: initialData.createdBy || prev.createdBy,
      }))
    } else {
      setFormData(emptyForm)
    }
  }, [initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const error = validateField(field, value, { ...formData, [field]: value }, technicians)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 250 * 1024) {
      showCustomToast('File size must be less than 250KB.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result,
        [`${field}Name`]: file.name,
        [`${field}Type`]: file.type,
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
      if ((isBeforeBirthday ? age - 1 : age) < 18) {
        showCustomToast('Technician must be at least 18 years old.', 'error')
        return
      }
    }
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.contactNumber)) {
      showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error')
      return
    }
    if (formData.contactNumber === formData.emergencyContact) {
      showCustomToast('Contact Number and Emergency Contact cannot be the same.', 'error')
      return
    }
    if (!emailPattern.test(formData.emailId)) {
      showCustomToast('Please enter a valid email address.', 'error')
      return
    }
    const duplicateContact = receptionist?.some(
      (t) => t.contactNumber === formData.contactNumber && t.id !== formData.id,
    )
    if (duplicateContact) { showCustomToast('Contact number already exists!', 'error'); return }
    const duplicateEmail = receptionist?.some(
      (t) => t.emailId === formData.emailId && t.id !== formData.id,
    )
    if (duplicateEmail) { showCustomToast('Email already exists!', 'error'); return }
    return true
  }

  const handleSubmit = async () => {
    if (Object.keys(formData.permissions).length === 0) {
      showCustomToast('Please assign at least one user permission before saving.', 'error')
      return
    }
    if (loading) return
    try {
      setLoading(true)
      const res = await onSave(formData)
      if (res?.data?.data != null) {
        onClose()
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
    setShowPModal(true)
  }

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

  // ── View Mode helpers ──
  const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="fdf-card">
      <div className="fdf-card-header">
        <Icon size={15} className="fdf-card-icon" />
        <span>{title}</span>
      </div>
      <div className="fdf-card-body">{children}</div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div className="fdf-info-row">
      <span className="fdf-info-label">{label}</span>
      <span className="fdf-info-value">{value || '—'}</span>
    </div>
  )

  // ── Edit Mode helpers ──
  const FormSection = ({ icon: Icon, title, children }) => (
    <div className="fdf-section">
      <div className="fdf-section-title">
        <Icon size={14} className="fdf-section-icon" />
        {title}
      </div>
      {children}
    </div>
  )

  const Field = ({ label, required, error, children }) => (
    <div className="fdf-field">
      <label className="fdf-label">
        {label}
        {required && <span className="fdf-required">*</span>}
      </label>
      {children}
      {error && <span className="fdf-error">{error}</span>}
    </div>
  )

  return (
    <>
      <ToastContainer />

      {/* ── Main Modal ── */}
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {viewMode ? 'Receptionist Profile' : initialData ? 'Edit Receptionist' : 'Add Receptionist'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {viewMode ? (
            /* ═══════════════ VIEW MODE ═══════════════ */
            <div>
              {/* Profile Header */}
              <div className="fdf-profile-header">
                <img
                  src={formData.profilePicture || '/assets/images/default-avatar.png'}
                  alt={formData.fullName}
                  className="fdf-profile-avatar"
                />
                <div className="fdf-profile-info">
                  <h4 className="fdf-profile-name">{formData.fullName}</h4>
                  <p className="fdf-profile-meta">{formData.emailId}</p>
                  <p className="fdf-profile-meta">{formData.contactNumber}</p>
                  <span className="fdf-badge">ID: {formData.id}</span>
                </div>
              </div>

              <InfoCard icon={User} title="Personal Information">
                <div className="fdf-grid-3">
                  <InfoRow label="Full Name" value={formData.fullName} />
                  <InfoRow label="Email" value={formData.emailId} />
                  <InfoRow label="Contact" value={formData.contactNumber} />
                  <InfoRow label="Date of Birth" value={formData.dateOfBirth} />
                  <InfoRow label="Government ID" value={formData.governmentId} />
                  <InfoRow label="Gender" value={capitalizeWords(formData.gender)} />
                </div>
              </InfoCard>

              <InfoCard icon={Briefcase} title="Work Information">
                <div className="fdf-grid-3">
                  <InfoRow label="Date of Joining" value={formData.dateOfJoining} />
                  <InfoRow label="Department" value={formData.department} />
                  <InfoRow label="Qualification" value={formData.qualification} />
                  <InfoRow label="Emergency Contact" value={formData.emergencyContact} />
                  <InfoRow label="Experience" value={formData.yearOfExperience} />
                  <InfoRow label="Vaccination" value={formData.vaccinationStatus} />
                </div>
              </InfoCard>

              <InfoCard icon={MapPin} title="Address">
                <p className="fdf-info-value" style={{ margin: 0 }}>
                  {[
                    formData.address?.houseNo,
                    formData.address?.street,
                    formData.address?.landmark,
                    formData.address?.city,
                    formData.address?.state,
                    formData.address?.postalCode,
                    formData.address?.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Bank Details">
                <div className="fdf-grid-3">
                  <InfoRow label="Account Number" value={formData.bankAccountDetails?.accountNumber} />
                  <InfoRow label="Account Holder" value={formData.bankAccountDetails?.accountHolderName} />
                  <InfoRow label="IFSC Code" value={formData.bankAccountDetails?.ifscCode} />
                  <InfoRow label="Bank Name" value={formData.bankAccountDetails?.bankName} />
                  <InfoRow label="Branch Name" value={formData.bankAccountDetails?.branchName} />
                  <InfoRow label="PAN Card" value={formData.bankAccountDetails?.panCardNumber} />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Documents">
                <div className="fdf-grid-2">
                  {formData.graduationCertificate ? (
                    <FilePreview
                      label="Graduation Certificate"
                      type={formData.graduationCertificateType}
                      data={formData.graduationCertificate}
                    />
                  ) : (
                    <p className="fdf-muted">Not Provided — Graduation Certificate</p>
                  )}
                  {formData.computerSkillsProof ? (
                    <FilePreview
                      label="Computer Skills Proof"
                      type={formData.computerSkillsProofType || 'application/pdf'}
                      data={formData.computerSkillsProof}
                    />
                  ) : (
                    <p className="fdf-muted">Not Provided — Computer Skills Proof</p>
                  )}
                </div>
                {formData.previousEmploymentHistory && (
                  <div style={{ marginTop: 12 }}>
                    <InfoRow label="Previous Employment" value={formData.previousEmploymentHistory} />
                  </div>
                )}
              </InfoCard>
            </div>
          ) : (
            /* ═══════════════ EDIT MODE ═══════════════ */
            <CForm>
              {/* Basic Info */}
              <FormSection icon={User} title="Basic Information">
                <div className="fdf-row">
                  <div className="fdf-col-half">
                    <Field label="Clinic ID" required>
                      <input className="fdf-input fdf-input-disabled" value={clinicId} disabled />
                    </Field>
                  </div>
                  <div className="fdf-col-half">
                    <Field label="Role" required>
                      <input className="fdf-input fdf-input-disabled" value={formData.role} disabled />
                    </Field>
                  </div>
                </div>

                <div className="fdf-row">
                  <div className="fdf-col-third">
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        className="fdf-input"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Gender" required>
                      <select
                        className="fdf-input"
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Date of Birth" required>
                      <input
                        className="fdf-input"
                        type="date"
                        value={formData.dateOfBirth}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                <div className="fdf-row">
                  <div className="fdf-col-third">
                    <Field label="Contact Number" required error={errors.contactNumber}>
                      <input
                        className="fdf-input"
                        type="text"
                        maxLength={10}
                        value={formData.contactNumber}
                        onChange={(e) => {
                          const v = e.target.value
                          if (/^\d*$/.test(v)) {
                            handleChange('contactNumber', v)
                            const err = validateField('contactNumber', v, formData, receptionist)
                            setErrors((p) => ({ ...p, contactNumber: err }))
                          }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Email" required error={errors.emailId}>
                      <input
                        className="fdf-input"
                        type="email"
                        value={formData.emailId}
                        onChange={(e) => {
                          handleChange('emailId', e.target.value)
                          setErrors((p) => ({ ...p, emailId: validateField('emailId', e.target.value, formData) }))
                        }}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Government ID (Aadhaar)" required error={errors.governmentId}>
                      <input
                        className="fdf-input"
                        maxLength={12}
                        value={formData.governmentId}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleChange('governmentId', e.target.value)
                            setErrors((p) => ({ ...p, governmentId: validateField('governmentId', e.target.value, formData) }))
                          }
                        }}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Work Info */}
              <FormSection icon={Briefcase} title="Work Information">
                <div className="fdf-row">
                  <div className="fdf-col-third">
                    <Field label="Date of Joining" required error={errors.dateOfJoining}>
                      <input
                        className="fdf-input"
                        type="date"
                        value={formData.dateOfJoining}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          handleChange('dateOfJoining', e.target.value)
                          setErrors((p) => ({ ...p, dateOfJoining: validateField('dateOfJoining', e.target.value, formData) }))
                        }}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Department" required error={errors.department}>
                      <input
                        className="fdf-input"
                        value={formData.department}
                        onChange={(e) => {
                          handleChange('department', e.target.value)
                          setErrors((p) => ({ ...p, department: validateField('department', e.target.value) }))
                        }}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Vaccination Status" required error={errors.vaccinationStatus}>
                      <select
                        className="fdf-input"
                        value={formData.vaccinationStatus}
                        onChange={(e) => {
                          handleChange('vaccinationStatus', e.target.value)
                          setErrors((p) => ({ ...p, vaccinationStatus: e.target.value ? '' : 'Required.' }))
                        }}
                      >
                        <option value="">Select Status</option>
                        <option value="Not Vaccinated">Not Vaccinated</option>
                        <option value="Partially Vaccinated">Partially Vaccinated</option>
                        <option value="Fully Vaccinated">Fully Vaccinated</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="fdf-row">
                  <div className="fdf-col-third">
                    <Field label="Qualification" required>
                      <input
                        className="fdf-input"
                        value={formData.qualification}
                        onChange={(e) => handleChange('qualification', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Years of Experience" required error={errors.yearOfExperience}>
                      <input
                        className="fdf-input"
                        type="number"
                        value={formData.yearOfExperience}
                        onChange={(e) => {
                          handleChange('yearOfExperience', e.target.value)
                          setErrors((p) => ({ ...p, yearOfExperience: validateField('yearOfExperience', e.target.value) }))
                        }}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Emergency Contact">
                      <input
                        className="fdf-input"
                        type="text"
                        maxLength={10}
                        value={formData.emergencyContact}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) handleChange('emergencyContact', e.target.value)
                        }}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Address */}
              <FormSection icon={MapPin} title="Address">
                <div className="fdf-row">
                  {Object.keys(formData.address).map((field) => (
                    <div className="fdf-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required={field !== 'landmark'}
                        error={errors.address?.[field]}
                      >
                        <input
                          className="fdf-input"
                          type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (field === 'postalCode') {
                              if (/^\d*$/.test(value)) handleNestedChange('address', field, value)
                            } else if (['city', 'state', 'country'].includes(field)) {
                              value = value.replace(/[^A-Za-z\s]/g, '')
                              handleNestedChange('address', field, value)
                            } else {
                              handleNestedChange('address', field, value)
                            }
                            setErrors((p) => ({ ...p, address: { ...p.address, [field]: validateField(field, value, formData) } }))
                          }}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Bank Details */}
              <FormSection icon={CreditCard} title="Bank Account Details">
                <div className="fdf-row">
                  {Object.keys(formData.bankAccountDetails).map((field) => (
                    <div className="fdf-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required
                        error={errors.bankAccountDetails?.[field]}
                      >
                        <input
                          className="fdf-input"
                          value={formData.bankAccountDetails[field]}
                          disabled={ifscLoading && (field === 'bankName' || field === 'branchName')}
                          placeholder={ifscLoading && (field === 'bankName' || field === 'branchName') ? 'Fetching...' : ''}
                          maxLength={
                            field === 'accountNumber' ? 20
                              : field === 'panCardNumber' ? 10
                                : field === 'ifscCode' ? 11
                                  : field === 'accountHolderName' ? 50
                                    : undefined
                          }
                          onChange={async (e) => {
                            let value = e.target.value
                            let err = ''
                            if (field === 'accountHolderName') {
                              if (/^[A-Za-z\s]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = !value.trim() ? 'Required.' : !/^[A-Za-z\s]+$/.test(value) ? 'Letters only.' : ''
                            }
                            if (field === 'accountNumber') {
                              if (/^\d*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = value ? '' : 'Required.'
                            }
                            if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = value.length === 10 ? (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value) ? '' : 'Invalid PAN (ABCDE1234F)') : 'PAN must be 10 characters.'
                            }
                            if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              if (value.length === 11) {
                                err = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) ? '' : 'Invalid IFSC (HDFC0001234)'
                                if (!err) {
                                  try {
                                    const res = await fetch(`https://ifsc.razorpay.com/${value}`)
                                    if (res.ok) {
                                      const data = await res.json()
                                      handleNestedChange('bankAccountDetails', 'bankName', data.BANK || '')
                                      handleNestedChange('bankAccountDetails', 'branchName', data.BRANCH || '')
                                    }
                                  } catch {
                                    handleNestedChange('bankAccountDetails', 'bankName', '')
                                    handleNestedChange('bankAccountDetails', 'branchName', '')
                                  }
                                }
                              } else {
                                err = 'IFSC must be 11 characters.'
                              }
                            }
                            if (!['accountNumber', 'panCardNumber', 'ifscCode', 'accountHolderName'].includes(field)) {
                              handleNestedChange('bankAccountDetails', field, value)
                              err = value ? '' : 'Required.'
                            }
                            setErrors((p) => ({ ...p, bankAccountDetails: { ...p.bankAccountDetails, [field]: err } }))
                          }}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Documents */}
              <FormSection icon={FileText} title="Documents">
                <div className="fdf-row">
                  <div className="fdf-col-third">
                    <Field label="Profile Image" required>
                      <input
                        className="fdf-input"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const base64 = await toBase64(file)
                            handleChange('profilePicture', base64)
                          }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Graduation Certificate">
                      <input
                        className="fdf-input"
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'graduationCertificate')}
                      />
                    </Field>
                  </div>
                  <div className="fdf-col-third">
                    <Field label="Computer Skills Proof">
                      <input
                        className="fdf-input"
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'computerSkillsProof')}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Previous Employment History">
                  <textarea
                    className="fdf-input fdf-textarea"
                    rows={3}
                    value={formData.previousEmploymentHistory}
                    onChange={(e) => handleChange('previousEmploymentHistory', e.target.value)}
                    placeholder="Enter previous employment history..."
                  />
                </Field>
              </FormSection>

              {/* Permissions Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="fdf-perm-btn" onClick={handleUserPermission}>
                  <ShieldCheck size={14} />
                  User Permissions
                </button>
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
                onSave={() => { setShowPModal(false) }}
              />
            </CForm>
          )}
        </CModalBody>

        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          {viewMode ? (
            <button className="fdf-btn-cancel" onClick={onClose}>
              <X size={14} /> Close
            </button>
          ) : (
            <>
              <button
                type="button"
                className="fdf-btn-cancel"
                onClick={() => setFormData(emptyForm)}
              >
                <RotateCcw size={13} /> Clear
              </button>
              <button
                type="button"
                className="fdf-btn-cancel"
                onClick={() => { setFormData(emptyForm); onClose() }}
              >
                <X size={13} /> Cancel
              </button>
              <button
                type="button"
                className="fdf-btn-save"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Saving...
                  </>
                ) : (
                  <><Save size={13} /> Save</>
                )}
              </button>
            </>
          )}
        </CModalFooter>
      </CModal>

      {/* ── File Preview Modal ── */}
      <CModal visible={showModal} onClose={handleCloseModal} size="xl">
        <CModalHeader onClose={handleCloseModal} style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 14, fontWeight: 600, color: '#0c447c' }}>
            {isPreviewPdf ? 'PDF Preview' : 'Image Preview'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          {isPreviewPdf ? (
            <iframe src={previewFileUrl} title="PDF Preview" style={{ width: '100%', height: '80vh', border: 'none' }} />
          ) : (
            <img src={previewFileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />
          )}
        </CModalBody>
      </CModal>

      {/* ── STYLES ── */}
      <style>{`
        /* ── View Mode ── */
        .fdf-profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f0f5fb;
          border-radius: 10px;
          margin-bottom: 14px;
        }
        .fdf-profile-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #b5d4f4;
          flex-shrink: 0;
        }
        .fdf-profile-name {
          font-size: 16px;
          font-weight: 700;
          color: #0c447c;
          margin: 0 0 4px;
        }
        .fdf-profile-meta {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 2px;
        }
        .fdf-badge {
          display: inline-block;
          background: #185fa5;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 20px;
          margin-top: 4px;
        }

        .fdf-card {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 12px;
        }
     .fdf-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #185fa5;
  color: #fff;   /* 👈 THIS controls the text color */
  font-size: 12px;
  font-weight: 600;
  padding: 9px 14px;
}
  .fdf-card-header,
.fdf-card-header span,
.fdf-card-header svg {
  color: #ffffff !important;
}
        .fdf-card-icon { color: #b5d4f4; }
        .fdf-card-body {
          padding: 14px;
          background: #fff;
        }

        .fdf-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .fdf-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .fdf-info-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fdf-info-label {
          font-size: 11px;
          font-weight: 600;
          color: #185fa5;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .fdf-info-value {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }
        .fdf-muted {
          font-size: 12px;
          color: #9ca3af;
          font-style: italic;
          margin: 0;
        }

        /* ── Edit Mode ── */
        .fdf-section {
          margin-bottom: 18px;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
        }
        .fdf-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #185fa5;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 9px 14px;
        }
        .fdf-section-icon { color: #b5d4f4; }
        .fdf-section > *:not(.fdf-section-title) { padding: 14px; }
        .fdf-section > .fdf-row { padding: 14px; }

        .fdf-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 0;
        }
        .fdf-col-third { flex: 1 1 calc(33.333% - 12px); min-width: 160px; }
        .fdf-col-half  { flex: 1 1 calc(50% - 12px); min-width: 140px; }

        .fdf-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }
        .fdf-label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .fdf-required { color: #e24b4a; font-size: 11px; }
        .fdf-error { font-size: 11px; color: #e24b4a; margin-top: 2px; }

        .fdf-input {
          width: 100%;
          padding: 7px 10px;
          font-size: 12.5px;
          color: #374151;
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 7px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
          -webkit-appearance: none;
        }
        .fdf-input:focus {
          border-color: #185fa5;
          box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12);
        }
        .fdf-input-disabled {
          background: #f0f5fb !important;
          color: #9ca3af !important;
          cursor: not-allowed;
        }
        .fdf-textarea { resize: vertical; min-height: 70px; }

        /* Permissions button */
        .fdf-perm-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, filter 0.15s;
        }
        .fdf-perm-btn:hover { background: #d0e6f7; }

        /* Footer buttons */
        .fdf-btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fdf-btn-cancel:hover { background: #f3f4f6; }

        .fdf-btn-save {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.15s;
        }
        .fdf-btn-save:hover  { filter: brightness(0.9); }
        .fdf-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Scrollbar */
        .modal-body::-webkit-scrollbar { width: 5px; }
        .modal-body::-webkit-scrollbar-track { background: #f0f5fb; }
        .modal-body::-webkit-scrollbar-thumb { background: #b5d4f4; border-radius: 10px; }

        @media (max-width: 600px) {
          .fdf-col-third, .fdf-col-half { flex: 1 1 100%; }
          .fdf-grid-3, .fdf-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

export default FrontDeskForm