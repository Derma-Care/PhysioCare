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
import UserPermissionModal from '../UserPermissionModal'
import { validateField } from '../../../Utils/Validators'
import { emailPattern } from '../../../Constant/Constants'
import FilePreview from '../../../Utils/FilePreview'
import { showCustomToast } from '../../../Utils/Toaster'
import { User, Briefcase, MapPin, CreditCard, FileText, ShieldCheck, Save, X, RotateCcw } from 'lucide-react'

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
  const emptyPermissions = {}

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
    dateOfJoining: '',
    department: '',
    shiftTimingsOrAvailability: '',
    role: 'security',
    address: { houseNo: '', street: '', landmark: '', city: '', state: '', postalCode: '', country: 'India' },
    bankAccountDetails: { accountNumber: '', accountHolderName: '', ifscCode: '', bankName: '', branchName: '', panCardNumber: '' },
    medicalFitnessCertificate: '',
    profilePicture: '',
    policeVerification: '',
    previousEmployeeHistory: '',
    traningOrGuardLicense: '',
    permissions: emptyPermissions,
    userName: '',
    password: '',
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
    'fullName', 'dateOfBirth', 'gender', 'contactNumber', 'govermentId', 'dateOfJoining',
    'address.houseNo', 'address.street', 'address.city', 'address.state', 'address.postalCode', 'address.country',
    'bankAccountDetails.accountNumber', 'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName', 'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode', 'bankAccountDetails.panCardNumber',
    'medicalFitnessCertificate',
  ]

  function validateMandatoryFields(formData, mandatoryFields) {
    const missingFields = []
    for (const field of mandatoryFields) {
      const keys = field.split('.')
      let value = formData
      for (const key of keys) value = value?.[key]
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
      if (updated[feature].includes(action)) updated[feature] = updated[feature].filter((a) => a !== action)
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
      setFormData((prev) => ({ ...prev, ...initialData, createdBy: initialData.createdBy || prev.createdBy }))
    } else {
      setFormData(emptyForm)
    }
  }, [initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const error = validateField(field, value, { ...formData, [field]: value }, security)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }))
  }

  const handleBlur = (field, value) => {
    const error = validateField(field, value, formData, security)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result, [`${field}Name`]: file.name, [`${field}Type`]: file.type }))
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
      const isBeforeBirthday = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      if ((isBeforeBirthday ? age - 1 : age) < 18) { showCustomToast('Security must be at least 18 years old.', 'error'); return }
    }
    if (!/^[6-9]\d{9}$/.test(formData.contactNumber)) { showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error'); return }
    if (formData.emailId?.trim() && !emailPattern.test(formData.emailId)) { showCustomToast('Please enter a valid email address.', 'error'); return }
    if (security?.some((t) => t.contactNumber === formData.contactNumber && t.id !== formData.id)) { showCustomToast('Contact number already exists!', 'error'); return }
    if (formData.emailId?.trim() && security?.some((t) => t.emailId === formData.emailId && t.id !== formData.id)) { showCustomToast('Email already exists!', 'error'); return }
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

  // ── View Mode helpers ──
  const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="sf-card">
      <div className="sf-card-header"><Icon size={14} className="sf-card-icon" />{title}</div>
      <div className="sf-card-body">{children}</div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div className="sf-info-row">
      <span className="sf-info-label">{label}</span>
      <span className="sf-info-value">{value || '—'}</span>
    </div>
  )

  // ── Edit Mode helpers ──
  const FormSection = ({ icon: Icon, title, children }) => (
    <div className="sf-section">
      <div className="sf-section-title"><Icon size={14} className="sf-section-icon" />{title}</div>
      <div className="sf-section-body">{children}</div>
    </div>
  )

  const Field = ({ label, required, error, children }) => (
    <div className="sf-field">
      <label className="sf-label">{label}{required && <span className="sf-required">*</span>}</label>
      {children}
      {error && <span className="sf-error">{error}</span>}
    </div>
  )

  return (
    <>
      <ToastContainer />

      {/* ── Main Modal ── */}
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {viewMode ? 'Security Profile' : initialData ? 'Edit Security Staff' : 'Add Security Staff'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {viewMode ? (
            /* ═══════════════ VIEW MODE ═══════════════ */
            <div>
              {/* Profile Header */}
              <div className="sf-profile-header">
                <img
                  src={formData.profilePicture || '/assets/images/default-avatar.png'}
                  alt={formData.fullName}
                  className="sf-profile-avatar"
                />
                <div>
                  <h4 className="sf-profile-name">{formData.fullName}</h4>
                  <p className="sf-profile-meta">{formData.emailId || 'No email'}</p>
                  <p className="sf-profile-meta">{formData.contactNumber}</p>
                  <span className="sf-badge">ID: {formData.securityStaffId}</span>
                </div>
              </div>

              <InfoCard icon={User} title="Personal Information">
                <div className="sf-inner-grid">
                  <InfoRow label="Full Name"     value={formData.fullName} />
                  <InfoRow label="Email"         value={formData.emailId} />
                  <InfoRow label="Contact"       value={formData.contactNumber} />
                  <InfoRow label="Gender"        value={formData.gender} />
                  <InfoRow label="Date of Birth" value={formData.dateOfBirth} />
                  <InfoRow label="Government ID" value={formData.govermentId} />
                </div>
              </InfoCard>

              <InfoCard icon={Briefcase} title="Work Information">
                <div className="sf-inner-grid">
                  <InfoRow label="Date of Joining"       value={formData.dateOfJoining} />
                  <InfoRow label="Department"            value={formData.department} />
                  <InfoRow label="Shift / Availability"  value={formData.shiftTimingsOrAvailability} />
                  <InfoRow label="Police Verification"   value={formData.policeVerification} />
                </div>
              </InfoCard>

              <InfoCard icon={MapPin} title="Address">
                <p className="sf-info-value" style={{ margin: 0 }}>
                  {[formData.address?.houseNo, formData.address?.street, formData.address?.landmark, formData.address?.city, formData.address?.state, formData.address?.postalCode, formData.address?.country].filter(Boolean).join(', ')}
                </p>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Bank Details">
                <div className="sf-inner-grid">
                  <InfoRow label="Account Number"    value={formData.bankAccountDetails?.accountNumber} />
                  <InfoRow label="Account Holder"    value={formData.bankAccountDetails?.accountHolderName} />
                  <InfoRow label="IFSC Code"         value={formData.bankAccountDetails?.ifscCode} />
                  <InfoRow label="Bank Name"         value={formData.bankAccountDetails?.bankName} />
                  <InfoRow label="Branch Name"       value={formData.bankAccountDetails?.branchName} />
                  <InfoRow label="PAN Card"          value={formData.bankAccountDetails?.panCardNumber} />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Documents">
                <div className="sf-grid-2">
                  {formData.traningOrGuardLicense ? (
                    <FilePreview label="Training / Guard License" type={formData.traningOrGuardLicenseType || 'application/pdf'} data={formData.traningOrGuardLicense} />
                  ) : <p className="sf-muted">Not Provided — Training / Guard License</p>}
                  {formData.medicalFitnessCertificate ? (
                    <FilePreview label="Medical Fitness Certificate" type={formData.medicalFitnessCertificateType || 'application/pdf'} data={formData.medicalFitnessCertificate} />
                  ) : <p className="sf-muted">Not Provided — Medical Fitness Certificate</p>}
                </div>
                {formData.previousEmployeeHistory && (
                  <div style={{ marginTop: 12 }}>
                    <InfoRow label="Previous Employment" value={formData.previousEmployeeHistory} />
                  </div>
                )}
              </InfoCard>
            </div>
          ) : (
            /* ═══════════════ EDIT MODE ═══════════════ */
            <CForm>
              {/* Basic Info */}
              <FormSection icon={User} title="Basic Information">
                <div className="sf-row">
                  <div className="sf-col-half">
                    <Field label="Clinic ID" required>
                      <input className="sf-input sf-input-disabled" value={clinicId} disabled />
                    </Field>
                  </div>
                  <div className="sf-col-half">
                    <Field label="Role" required>
                      <input className="sf-input sf-input-disabled" value={formData.role} disabled />
                    </Field>
                  </div>
                </div>

                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        className="sf-input"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                        onBlur={() => handleBlur('fullName', formData.fullName)}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Gender" required>
                      <select className="sf-input" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Date of Birth" required>
                      <input
                        className="sf-input" type="date"
                        value={formData.dateOfBirth}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Contact Number" required error={errors.contactNumber}>
                      <input
                        className="sf-input" type="text" maxLength={10}
                        value={formData.contactNumber}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleChange('contactNumber', e.target.value)
                            setErrors((p) => ({ ...p, contactNumber: validateField('contactNumber', e.target.value, formData, security) }))
                          }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Email" error={errors.emailId}>
                      <input
                        className="sf-input" type="email"
                        value={formData.emailId}
                        onChange={(e) => {
                          handleChange('emailId', e.target.value)
                          setErrors((p) => ({ ...p, emailId: e.target.value && !emailPattern.test(e.target.value) ? 'Invalid email format' : '' }))
                        }}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Government ID (Aadhaar)" required error={errors.govermentId}>
                      <input
                        className="sf-input" maxLength={12}
                        value={formData.govermentId}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleChange('govermentId', e.target.value)
                            setErrors((p) => ({ ...p, govermentId: validateField('governmentId', e.target.value, formData) }))
                          }
                        }}
                        onBlur={() => setErrors((p) => ({ ...p, govermentId: validateField('governmentId', formData.govermentId, formData) }))}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Work Info */}
              <FormSection icon={Briefcase} title="Work Information">
                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Date of Joining" required>
                      <input
                        className="sf-input" type="date"
                        value={formData.dateOfJoining}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Department">
                      <input
                        className="sf-input"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Police Verification">
                      <input
                        className="sf-input"
                        value={formData.policeVerification}
                        onChange={(e) => handleChange('policeVerification', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                <div className="sf-row">
                  <div className="sf-col-full">
                    <Field label="Shift Timings / Availability" required>
                      <select
                        className="sf-input"
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
                      </select>
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Address */}
              <FormSection icon={MapPin} title="Address">
                <div className="sf-row">
                  {Object.keys(formData.address).map((field) => (
                    <div className="sf-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required={field !== 'landmark'}
                        error={errors.address?.[field]}
                      >
                        <input
                          className="sf-input"
                          type="text"
                          maxLength={field === 'postalCode' ? 6 : undefined}
                          value={formData.address[field]}
                          onChange={(e) => {
                            let value = e.target.value
                            if (field === 'postalCode') { if (/^\d*$/.test(value)) handleNestedChange('address', field, value) }
                            else if (['city', 'state', 'country'].includes(field)) { value = value.replace(/[^A-Za-z\s]/g, ''); handleNestedChange('address', field, value) }
                            else handleNestedChange('address', field, value)
                            setErrors((p) => ({ ...p, address: { ...p.address, [field]: validateField(field, value, formData) } }))
                          }}
                          onBlur={() => setErrors((p) => ({ ...p, address: { ...p.address, [field]: validateField(field, formData.address[field], formData) } }))}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Bank Details */}
              <FormSection icon={CreditCard} title="Bank Account Details">
                <div className="sf-row">
                  {Object.keys(formData.bankAccountDetails).map((field) => (
                    <div className="sf-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required
                        error={errors.bankAccountDetails?.[field]}
                      >
                        <input
                          className="sf-input"
                          value={formData.bankAccountDetails[field]}
                          disabled={ifscLoading && (field === 'bankName' || field === 'branchName')}
                          placeholder={ifscLoading && (field === 'bankName' || field === 'branchName') ? 'Fetching...' : ''}
                          maxLength={field === 'accountNumber' ? 20 : field === 'panCardNumber' ? 10 : field === 'ifscCode' ? 11 : field === 'accountHolderName' ? 50 : undefined}
                          onChange={async (e) => {
                            let value = e.target.value
                            let err = ''
                            if (field === 'accountHolderName') {
                              value = value.replace(/[^A-Za-z\s]/g, '')
                              handleNestedChange('bankAccountDetails', field, value)
                              err = !value.trim() ? 'Required.' : ''
                            } else if (field === 'accountNumber') {
                              if (/^\d*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = value ? '' : 'Required.'
                            } else if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = value.length === 10 ? (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value) ? '' : 'Invalid PAN (ABCDE1234F)') : 'PAN must be 10 characters.'
                            } else if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                              err = value.length === 11 ? (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) ? '' : 'Invalid IFSC (HDFC0001234)') : 'IFSC must be 11 characters.'
                            } else {
                              handleNestedChange('bankAccountDetails', field, value)
                              err = value ? '' : 'Required.'
                            }
                            setErrors((p) => ({ ...p, bankAccountDetails: { ...p.bankAccountDetails, [field]: err } }))
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
                                }
                              } catch { handleNestedChange('bankAccountDetails', 'bankName', ''); handleNestedChange('bankAccountDetails', 'branchName', '') }
                              finally { setIfscLoading(false) }
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
                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Profile Image" required>
                      <input className="sf-input" type="file" accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (file) { const base64 = await toBase64(file); handleChange('profilePicture', base64) }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Medical Fitness Certificate" required>
                      <input className="sf-input" type="file" onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')} />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Training / Guard License">
                      <input className="sf-input" type="file" onChange={(e) => handleFileUpload(e, 'traningOrGuardLicense')} />
                    </Field>
                  </div>
                </div>

                <Field label="Previous Employment History">
                  <textarea
                    className="sf-input sf-textarea"
                    rows={3}
                    value={formData.previousEmployeeHistory}
                    onChange={(e) => handleChange('previousEmployeeHistory', e.target.value)}
                    placeholder="Enter previous employment history..."
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

        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          {viewMode ? (
            <button className="sf-btn-cancel" onClick={onClose}><X size={13} /> Close</button>
          ) : (
            <>
              <button type="button" className="sf-btn-cancel" onClick={() => setFormData(emptyForm)}>
                <RotateCcw size={13} /> Clear
              </button>
              <button type="button" className="sf-btn-cancel" onClick={() => { setFormData(emptyForm); onClose() }}>
                <X size={13} /> Cancel
              </button>
              <button type="button" className="sf-btn-save" onClick={handleSubmit} disabled={loading}>
                {loading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" />Saving...</>) : (<><Save size={13} /> Save</>)}
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
        /* Profile header */
        .sf-profile-header { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f0f5fb; border-radius: 10px; margin-bottom: 14px; }
        .sf-profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #b5d4f4; flex-shrink: 0; }
        .sf-profile-name { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0 0 4px; }
        .sf-profile-meta { font-size: 12px; color: #6b7280; margin: 0 0 2px; }
        .sf-badge { display: inline-block; background: #185fa5; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; margin-top: 4px; }

        /* View cards */
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

        /* Edit sections */
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
        .sf-error { font-size: 11px; color: #e24b4a; }

        .sf-input {
          width: 100%; padding: 7px 10px; font-size: 12.5px; color: #374151;
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 7px;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none; -webkit-appearance: none;
        }
        .sf-input:focus { border-color: #185fa5; box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12); }
        .sf-input-disabled { background: #f0f5fb !important; color: #9ca3af !important; cursor: not-allowed; }
        .sf-textarea { resize: vertical; min-height: 70px; }

        /* Footer buttons */
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
        .sf-btn-save:hover { filter: brightness(0.9); }
        .sf-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        @media (max-width: 600px) {
          .sf-col-third, .sf-col-half { flex: 1 1 100%; }
          .sf-inner-grid, .sf-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

export default SecurityForm