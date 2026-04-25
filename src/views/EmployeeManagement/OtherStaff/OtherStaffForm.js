import React, { useEffect, useState } from 'react'
import {
  CForm,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import { actions, features } from '../../../Constant/Features'
import capitalizeWords from '../../../Utils/capitalizeWords'
import UserPermissionModal from '../UserPermissionModal'
import { validateField } from '../../../Utils/Validators'
import FilePreview from '../../../Utils/FilePreview'
import { showCustomToast } from '../../../Utils/Toaster'
import {
  User,
  Briefcase,
  MapPin,
  CreditCard,
  FileText,
  Save,
  X,
  RotateCcw,
} from 'lucide-react'

const OtherStaffForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  viewMode,
  technicians,
  fetchTechs,
}) => {
  const emptyForm = {
    wardBoyId: '',
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
    dateOfJoining: '',
    department: '',
    workExprience: '',
    yearOfExperience: '',
    shiftTimingsOrAvailability: '',
    emergencyContact: '',
    role: 'other staff',
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
    medicalFitnessCertificate: '',
    profilePicture: '',
    basicHealthFirstAidTrainingCertificate: '',
    previousEmploymentHistory: '',
    policeVerification: '',
    policeVerificationCertificate: '',
    userName: '',
    password: '',
    permissions: {},
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
    'fullName', 'dateOfBirth', 'contactNumber', 'governmentId', 'dateOfJoining',
    'profilePicture', 'department', 'clinicId', 'role', 'shiftTimingsOrAvailability',
    'address.houseNo', 'address.street', 'address.city', 'address.state',
    'address.postalCode', 'address.country',
    'bankAccountDetails.accountNumber', 'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName', 'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode', 'bankAccountDetails.panCardNumber',
  ]

  function validateMandatoryFields(data, fields) {
    const missing = []
    for (const field of fields) {
      const keys = field.split('.')
      let value = data
      for (const key of keys) { value = value?.[key] }
      if (!value || String(value).trim() === '') missing.push(field)
    }
    return missing
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
      reader.onerror = (err) => reject(err)
    })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        createdBy: initialData.createdBy || prev.createdBy,
        address: { ...emptyForm.address, ...(initialData.address || {}) },
        bankAccountDetails: { ...emptyForm.bankAccountDetails, ...(initialData.bankAccountDetails || {}) },
        profilePicture: prev.profilePicture || initialData.profilePicture || '',
      }))
    } else {
      setFormData(emptyForm)
    }
  }, [initialData])

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleNestedChange = (parent, field, value) =>
    setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }))

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 250 * 1024) { showCustomToast('File size must be less than 250KB.', 'error'); return }
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
    if (missing.length > 0) { showCustomToast(`Please fill required fields: ${missing.join(', ')}`, 'error'); return }
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const before = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      if ((before ? age - 1 : age) < 18) { showCustomToast('Staff must be at least 18 years old.', 'error'); return }
    }
    if (!/^[6-9]\d{9}$/.test(formData.contactNumber)) { showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error'); return }
    if (formData.contactNumber === formData.emergencyContact) { showCustomToast('Contact Number and Emergency Contact cannot be the same.', 'error'); return }
    if (technicians?.some((t) => t.contactNumber === formData.contactNumber && t.id !== formData.id)) { showCustomToast('Contact number already exists!', 'error'); return }
    if (technicians?.some((t) => t.emailId === formData.emailId && t.id !== formData.id)) { showCustomToast('Email already exists!', 'error'); return }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    try {
      setLoading(true)
      const res = await onSave(formData)
      if (res && (res.status === 201 || (res.status === 200 && res.data?.success))) {
        setFormData(emptyForm)
        onClose()
      }
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => { setShowModal(false); setPreviewFileUrl(null); setIsPreviewPdf(false) }

  // ── Reusable layout components (mirrors FrontDeskForm exactly) ──
  const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="osf-card">
      <div className="osf-card-header">
        <Icon size={15} className="osf-card-icon" />
        <span>{title}</span>
      </div>
      <div className="osf-card-body">{children}</div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div className="osf-info-row">
      <span className="osf-info-label">{label}</span>
      <span className="osf-info-value">{value || '—'}</span>
    </div>
  )

  const FormSection = ({ icon: Icon, title, children }) => (
    <div className="osf-section">
      <div className="osf-section-title">
        <Icon size={14} className="osf-section-icon" />
        {title}
      </div>
      {children}
    </div>
  )

  const Field = ({ label, required, error, children }) => (
    <div className="osf-field">
      <label className="osf-label">
        {label}{required && <span className="osf-required">*</span>}
      </label>
      {children}
      {error && <span className="osf-error">{error}</span>}
    </div>
  )

  return (
    <>
      <ToastContainer />

      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
        {/* ── Header ── */}
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {viewMode ? 'Other Staff Profile' : initialData ? 'Edit Other Staff' : 'Add Other Staff'}
          </CModalTitle>
        </CModalHeader>

        {/* ── Body ── */}
        <CModalBody style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {viewMode ? (
            /* ═══════════════ VIEW MODE ═══════════════ */
            <div>
              {/* Profile Hero */}
              <div className="osf-profile-header">
                <img
                  src={formData.profilePicture || '/assets/images/default-avatar.png'}
                  alt={formData.fullName}
                  className="osf-profile-avatar"
                />
                <div className="osf-profile-info">
                  <h4 className="osf-profile-name">{formData.fullName}</h4>
                  <p className="osf-profile-meta">{formData.emailId}</p>
                  <p className="osf-profile-meta">{formData.contactNumber}</p>
                  {formData.wardBoyId && <span className="osf-badge">ID: {formData.wardBoyId}</span>}
                </div>
              </div>

              <InfoCard icon={User} title="Personal Information">
                <div className="osf-grid-3">
                  <InfoRow label="Full Name"     value={formData.fullName} />
                  <InfoRow label="Email"         value={formData.emailId} />
                  <InfoRow label="Contact"       value={formData.contactNumber} />
                  <InfoRow label="Date of Birth" value={formData.dateOfBirth} />
                  <InfoRow label="Government ID" value={formData.governmentId} />
                  <InfoRow label="Gender"        value={capitalizeWords(formData.gender)} />
                </div>
              </InfoCard>

              <InfoCard icon={Briefcase} title="Work Information">
                <div className="osf-grid-3">
                  <InfoRow label="Date of Joining"   value={formData.dateOfJoining} />
                  <InfoRow label="Department"        value={formData.department} />
                  <InfoRow label="Experience"        value={formData.workExprience} />
                  <InfoRow label="Shift Timings"     value={formData.shiftTimingsOrAvailability} />
                  <InfoRow label="Emergency Contact" value={formData.emergencyContact} />
                </div>
              </InfoCard>

              <InfoCard icon={MapPin} title="Address">
                <p className="osf-info-value" style={{ margin: 0 }}>
                  {[
                    formData.address?.houseNo, formData.address?.street,
                    formData.address?.landmark, formData.address?.city,
                    formData.address?.state, formData.address?.postalCode,
                    formData.address?.country,
                  ].filter(Boolean).join(', ')}
                </p>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Bank Details">
                <div className="osf-grid-3">
                  <InfoRow label="Account Number"  value={formData.bankAccountDetails?.accountNumber} />
                  <InfoRow label="Account Holder"  value={formData.bankAccountDetails?.accountHolderName} />
                  <InfoRow label="IFSC Code"        value={formData.bankAccountDetails?.ifscCode} />
                  <InfoRow label="Bank Name"        value={formData.bankAccountDetails?.bankName} />
                  <InfoRow label="Branch Name"      value={formData.bankAccountDetails?.branchName} />
                  <InfoRow label="PAN Card"         value={formData.bankAccountDetails?.panCardNumber} />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Documents">
                <div className="osf-grid-2">
                  {formData.medicalFitnessCertificate ? (
                    <FilePreview
                      label="Medical Fitness Certificate"
                      type={formData.medicalFitnessCertificateType || 'application/pdf'}
                      data={formData.medicalFitnessCertificate}
                    />
                  ) : (
                    <p className="osf-muted">Not Provided — Medical Fitness Certificate</p>
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
            /* ═══════════════ EDIT / ADD MODE ═══════════════ */
            <CForm>

              {/* Basic Information */}
              <FormSection icon={User} title="Basic Information">
                <div className="osf-row">
                  <div className="osf-col-half">
                    <Field label="Clinic ID">
                      <input className="osf-input osf-input-disabled" value={clinicId} disabled />
                    </Field>
                  </div>
                  <div className="osf-col-half">
                    <Field label="Role">
                      <input className="osf-input osf-input-disabled" value={formData.role} disabled />
                    </Field>
                  </div>
                </div>

                <div className="osf-row">
                  <div className="osf-col-third">
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        className="osf-input"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Gender" required error={errors.gender}>
                      <select
                        className="osf-input"
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
                  <div className="osf-col-third">
                    <Field label="Date of Birth" required error={errors.dateOfBirth}>
                      <input
                        className="osf-input"
                        type="date"
                        value={formData.dateOfBirth}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        onChange={(e) => {
                          handleChange('dateOfBirth', e.target.value)
                          setErrors((p) => ({ ...p, dateOfBirth: validateField('dateOfBirth', e.target.value) }))
                        }}
                      />
                    </Field>
                  </div>
                </div>

                <div className="osf-row">
                  <div className="osf-col-third">
                    <Field label="Contact Number" required error={errors.contactNumber}>
                      <input
                        className="osf-input"
                        type="text"
                        maxLength={10}
                        value={formData.contactNumber}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleChange('contactNumber', e.target.value)
                            setErrors((p) => ({ ...p, contactNumber: validateField(e.target.value, formData, technicians) }))
                          }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Email" error={errors.emailId}>
                      <input
                        className="osf-input"
                        type="email"
                        value={formData.emailId}
                        onChange={(e) => handleChange('emailId', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Government ID (Aadhaar)" required error={errors.governmentId}>
                      <input
                        className="osf-input"
                        maxLength={12}
                        value={formData.governmentId}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleChange('governmentId', e.target.value)
                            setErrors((p) => ({ ...p, governmentId: validateField('governmentId', e.target.value) }))
                          }
                        }}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Work Information */}
              <FormSection icon={Briefcase} title="Work Information">
                <div className="osf-row">
                  <div className="osf-col-third">
                    <Field label="Date of Joining" required error={errors.dateOfJoining}>
                      <input
                        className="osf-input"
                        type="date"
                        value={formData.dateOfJoining}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          handleChange('dateOfJoining', e.target.value)
                          setErrors((p) => ({ ...p, dateOfJoining: validateField('dateOfJoining', e.target.value) }))
                        }}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Department" required error={errors.department}>
                      <input
                        className="osf-input"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                        onBlur={() => setErrors((p) => ({ ...p, department: validateField('department', formData.department, formData, technicians) }))}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Shift Timings" required error={errors.shiftTimingsOrAvailability}>
                      <select
                        className="osf-input"
                        value={formData.shiftTimingsOrAvailability}
                        onChange={(e) => {
                          handleChange('shiftTimingsOrAvailability', e.target.value)
                          setErrors((p) => ({ ...p, shiftTimingsOrAvailability: validateField('shiftTimingsOrAvailability', e.target.value) }))
                        }}
                      >
                        <option value="">Select Shift</option>
                        <option value="06:00-12:00">Morning (06:00 AM – 12:00 PM)</option>
                        <option value="12:00-18:00">Afternoon (12:00 PM – 06:00 PM)</option>
                        <option value="18:00-00:00">Evening (06:00 PM – 12:00 AM)</option>
                        <option value="00:00-06:00">Night (12:00 AM – 06:00 AM)</option>
                        <option value="06:00-15:00">Day Shift (06:00 AM – 03:00 PM)</option>
                        <option value="15:00-00:00">Evening Shift (03:00 PM – 12:00 AM)</option>
                        <option value="21:00-06:00">Night Shift (09:00 PM – 06:00 AM)</option>
                        <option value="06:00-18:00">Long Day (06:00 AM – 06:00 PM)</option>
                        <option value="18:00-06:00">Long Night (06:00 PM – 06:00 AM)</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="osf-row">
                  <div className="osf-col-third">
                    <Field label="Years of Experience">
                      <input
                        className="osf-input"
                        type="number"
                        value={formData.workExprience}
                        onChange={(e) => handleChange('workExprience', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Emergency Contact">
                      <input
                        className="osf-input"
                        type="text"
                        maxLength={10}
                        value={formData.emergencyContact}
                        onChange={(e) => { if (/^\d*$/.test(e.target.value)) handleChange('emergencyContact', e.target.value) }}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Address */}
              <FormSection icon={MapPin} title="Address">
                <div className="osf-row">
                  {Object.keys(formData.address).map((field) => (
                    <div className="osf-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required={field !== 'landmark'}
                        error={errors.address?.[field]}
                      >
                        <input
                          className="osf-input"
                          type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (field === 'postalCode') {
                              if (/^\d*$/.test(value)) handleNestedChange('address', field, value)
                            } else if (['city', 'state', 'country'].includes(field)) {
                              handleNestedChange('address', field, value.replace(/[^A-Za-z\s]/g, ''))
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

              {/* Bank Account Details */}
              <FormSection icon={CreditCard} title="Bank Account Details">
                <div className="osf-row">
                  {Object.keys(formData.bankAccountDetails).map((field) => (
                    <div className="osf-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required
                        error={errors.bankAccountDetails?.[field]}
                      >
                        <input
                          className="osf-input"
                          value={formData.bankAccountDetails[field]}
                          disabled={ifscLoading && (field === 'bankName' || field === 'branchName')}
                          placeholder={ifscLoading && (field === 'bankName' || field === 'branchName') ? 'Fetching...' : ''}
                          maxLength={
                            field === 'accountNumber' ? 20
                              : field === 'panCardNumber' ? 10
                                : field === 'ifscCode' ? 11
                                  : undefined
                          }
                          onChange={async (e) => {
                            let value = e.target.value
                            if (field === 'accountNumber') {
                              if (/^\d*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'accountHolderName') {
                              if (/^[A-Za-z\s]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else {
                              handleNestedChange('bankAccountDetails', field, value)
                            }
                            setErrors((p) => ({ ...p, bankAccountDetails: { ...p.bankAccountDetails, [field]: validateField(field, value, formData) } }))
                          }}
                          onBlur={async () => {
                            const value = formData.bankAccountDetails[field]
                            setErrors((p) => ({ ...p, bankAccountDetails: { ...p.bankAccountDetails, [field]: validateField(field, value, formData) } }))
                            if (field === 'panCardNumber' && value.length === 10)
                              if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) showCustomToast('Invalid PAN format (e.g., ABCDE1234F)', 'error')
                            if (field === 'ifscCode' && value.length === 11) {
                              if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                                showCustomToast('Invalid IFSC format (e.g., HDFC0001234)', 'error')
                                handleNestedChange('bankAccountDetails', 'bankName', '')
                                handleNestedChange('bankAccountDetails', 'branchName', '')
                              } else {
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
                                    showCustomToast('Invalid IFSC code', 'error')
                                    handleNestedChange('bankAccountDetails', 'bankName', '')
                                    handleNestedChange('bankAccountDetails', 'branchName', '')
                                  }
                                } catch {
                                  handleNestedChange('bankAccountDetails', 'bankName', '')
                                  handleNestedChange('bankAccountDetails', 'branchName', '')
                                } finally {
                                  setIfscLoading(false)
                                }
                              }
                            }
                          }}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Documents */}
              <FormSection icon={FileText} title="Documents">
                <div className="osf-row">
                  <div className="osf-col-third">
                    <Field label="Profile Image" required>
                      <input
                        className="osf-input"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (file) { const base64 = await toBase64(file); handleChange('profilePicture', base64) }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="osf-col-third">
                    <Field label="Medical Fitness Certificate">
                      <input className="osf-input" type="file" onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')} />
                    </Field>
                  </div>
                </div>

                <Field label="Previous Employment History">
                  <textarea
                    className="osf-input osf-textarea"
                    rows={3}
                    value={formData.previousEmploymentHistory}
                    onChange={(e) => handleChange('previousEmploymentHistory', e.target.value)}
                    placeholder="Enter previous employment history…"
                  />
                </Field>
              </FormSection>

              <UserPermissionModal
                show={showPModal}
                onClose={() => setShowPModal(false)}
                features={features}
                actions={actions}
                permissions={formData.permissions}
                toggleFeature={toggleFeature}
                toggleAllActions={toggleAllActions}
                togglePermission={togglePermission}
                onSave={() => setShowPModal(false)}
              />
            </CForm>
          )}
        </CModalBody>

        {/* ── Footer ── */}
        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          {viewMode ? (
            <button className="osf-btn-cancel" onClick={onClose}><X size={14} /> Close</button>
          ) : (
            <>
              <button className="osf-btn-cancel" onClick={() => setFormData(emptyForm)}><RotateCcw size={13} /> Clear</button>
              <button className="osf-btn-cancel" onClick={() => { setFormData(emptyForm); onClose() }}><X size={13} /> Cancel</button>
              <button className="osf-btn-save" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-1" role="status" />Saving…</>
                  : <><Save size={13} /> Save</>}
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
          {isPreviewPdf
            ? <iframe src={previewFileUrl} title="PDF Preview" style={{ width: '100%', height: '80vh', border: 'none' }} />
            : <img src={previewFileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />}
        </CModalBody>
      </CModal>

      {/* ── STYLES ── */}
      <style>{`
        /* ── View Mode ── */
        .osf-profile-header {
          display: flex; align-items: center; gap: 16px;
          padding: 16px; background: #f0f5fb;
          border-radius: 10px; margin-bottom: 14px;
        }
        .osf-profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #b5d4f4; flex-shrink: 0; }
        .osf-profile-name   { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0 0 4px; }
        .osf-profile-meta   { font-size: 12px; color: #6b7280; margin: 0 0 2px; }
        .osf-badge          { display: inline-block; background: #185fa5; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; margin-top: 4px; }

        .osf-card { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .osf-card-header {
          display: flex; align-items: center; gap: 8px;
          background: #185fa5; font-size: 12px; font-weight: 600; padding: 9px 14px;
        }
        .osf-card-header, .osf-card-header span, .osf-card-header svg { color: #fff !important; }
        .osf-card-icon { color: #b5d4f4 !important; }
        .osf-card-body { padding: 14px; background: #fff; }

        .osf-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .osf-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .osf-info-row   { display: flex; flex-direction: column; gap: 2px; }
        .osf-info-label { font-size: 11px; font-weight: 600; color: #185fa5; text-transform: uppercase; letter-spacing: 0.3px; }
        .osf-info-value { font-size: 13px; color: #374151; font-weight: 500; }
        .osf-muted      { font-size: 12px; color: #9ca3af; font-style: italic; margin: 0; }

        /* ── Edit Mode ── */
        .osf-section { margin-bottom: 18px; border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; }
        .osf-section-title {
          display: flex; align-items: center; gap: 8px;
          background: #185fa5; color: #fff;
          font-size: 12px; font-weight: 600; padding: 9px 14px;
        }
        .osf-section-icon  { color: #b5d4f4; }
        .osf-section > .osf-row   { padding: 14px; }
        .osf-section > .osf-field { padding: 0 14px 14px; }

        .osf-row       { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 0; }
        .osf-col-third { flex: 1 1 calc(33.333% - 12px); min-width: 160px; }
        .osf-col-half  { flex: 1 1 calc(50% - 12px); min-width: 140px; }

        .osf-field    { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
        .osf-label    { font-size: 11px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 3px; }
        .osf-required { color: #e24b4a; font-size: 11px; }
        .osf-error    { font-size: 11px; color: #e24b4a; margin-top: 2px; }

        .osf-input {
          width: 100%; padding: 7px 10px;
          font-size: 12.5px; color: #374151; background: #fff;
          border: 0.5px solid #d0dce9; border-radius: 7px; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none; -webkit-appearance: none;
        }
        .osf-input:focus         { border-color: #185fa5; box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12); }
        .osf-input-disabled      { background: #f0f5fb !important; color: #9ca3af !important; cursor: not-allowed; }
        .osf-textarea            { resize: vertical; min-height: 70px; }

        .osf-btn-cancel {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .osf-btn-cancel:hover { background: #f3f4f6; }

        .osf-btn-save {
          display: inline-flex; align-items: center; gap: 5px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s;
        }
        .osf-btn-save:hover    { filter: brightness(0.9); }
        .osf-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        .modal-body::-webkit-scrollbar       { width: 5px; }
        .modal-body::-webkit-scrollbar-track { background: #f0f5fb; }
        .modal-body::-webkit-scrollbar-thumb { background: #b5d4f4; border-radius: 10px; }

        @media (max-width: 600px) {
          .osf-col-third, .osf-col-half { flex: 1 1 100%; }
          .osf-grid-3, .osf-grid-2      { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

export default OtherStaffForm