import React, { useEffect, useRef, useState } from 'react'
import {
  CForm,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { validateField } from '../../../Utils/Validators'
import { emailPattern } from '../../../Constant/Constants'
import FilePreview from '../../../Utils/FilePreview'
import { showCustomToast } from '../../../Utils/Toaster'
import { User, Briefcase, MapPin, CreditCard, FileText, Save, X, RotateCcw } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────
   ⚠️  CRITICAL: emptyForm MUST live outside the component.
   Defining it inside means a new object reference on every render,
   which makes useEffect([initialData]) fire on every keystroke
   → formData resets → only one character survives per keystroke.
───────────────────────────────────────────────────────────────── */
const makeEmptyForm = () => ({
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
  emergencyContact: '',
  permissions: {},
  userName: '',
  password: '',
})

/* ─────────────────────────────────────────────────────────────────
   Sub-components MUST also live outside SecurityForm.
   Defining them inside creates new component types on every render
   → React unmounts/remounts → inputs lose focus after one character.
───────────────────────────────────────────────────────────────── */

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="sf-card">
    <div className="sf-card-header">
      <Icon size={14} className="sf-card-icon" />
      {title}
    </div>
    <div className="sf-card-body">{children}</div>
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="sf-info-row">
    <span className="sf-info-label">{label}</span>
    <span className="sf-info-value">{value || '—'}</span>
  </div>
)

const FormSection = ({ icon: Icon, title, children }) => (
  <div className="sf-section">
    <div className="sf-section-title">
      <Icon size={14} className="sf-section-icon" />
      {title}
    </div>
    <div className="sf-section-body">{children}</div>
  </div>
)

const Field = ({ label, required, error, children }) => (
  <div className="sf-field">
    <label className="sf-label">
      {label}{required && <span className="sf-required">*</span>}
    </label>
    {children}
    {error && <span className="sf-error">{error}</span>}
  </div>
)

const SecurityForm = ({
  visible,
  onClose,
  onSave,
  initialData,
  viewMode,
  security,
}) => {
  const [formData, setFormData] = useState(makeEmptyForm)
  const [showModal, setShowModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [ifscLoading, setIfscLoading] = useState(false)

  /* ── Scroll-position lock ── */
  const bodyRef = useRef(null)
  const scrollLock = useRef(false)
  const savedScroll = useRef(0)

  const saveScroll = () => {
    if (bodyRef.current) savedScroll.current = bodyRef.current.scrollTop
    scrollLock.current = true
  }

  useEffect(() => {
    if (scrollLock.current && bodyRef.current) {
      bodyRef.current.scrollTop = savedScroll.current
      scrollLock.current = false
    }
  })

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData({
          ...makeEmptyForm(),
          ...initialData,
          address: { ...makeEmptyForm().address, ...(initialData.address || {}) },
          bankAccountDetails: { ...makeEmptyForm().bankAccountDetails, ...(initialData.bankAccountDetails || {}) },
        })
      } else {
        setFormData(makeEmptyForm())
      }
      setErrors({})
      if (bodyRef.current) bodyRef.current.scrollTop = 0
    }
  }, [visible, initialData])

  const mandatoryFields = [
    'fullName', 'dateOfBirth', 'gender', 'contactNumber', 'govermentId', 'dateOfJoining',
    'address.houseNo', 'address.street', 'address.city', 'address.state', 'address.postalCode', 'address.country',
    'bankAccountDetails.accountNumber', 'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName', 'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode', 'bankAccountDetails.panCardNumber',
    'medicalFitnessCertificate', 'profilePicture', 'emergencyContact',
  ]

  const handleChange = (field, value) => {
    saveScroll()
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleNestedChange = (parent, field, value) => {
    saveScroll()
    setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }))
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



  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 250 * 1024) { showCustomToast('File size must be less than 250KB.', 'error'); return }
    const reader = new FileReader()
    reader.onloadend = () => {
      saveScroll()
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result,
        [`${field}Name`]: file.name,
        [`${field}Type`]: file.type,
      }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
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
      govermentId: 'Government ID',
      dateOfJoining: 'Date of Joining',
      department: 'Department',
      shiftTimingsOrAvailability: 'Shift Timings',
      profilePicture: 'Profile Image',
      medicalFitnessCertificate: 'Medical Fitness Certificate',
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

    if (formData.govermentId) {
      if (formData.govermentId.length !== 12) {
        newErrors.govermentId = 'Aadhar ID must be exactly 12 digits.'
        isValid = false
      } else if (/^(.)\1+$/.test(formData.govermentId)) {
        newErrors.govermentId = 'Aadhar ID cannot have all identical digits.'
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
        const before = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        if (before) age--
        if (age < 18) { newErrors.dateOfBirth = 'Security must be at least 18 years old.'; isValid = false }
        if (age >= 100) { newErrors.dateOfBirth = 'Security must be less than 100 years old.'; isValid = false }
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

    if (formData.bankAccountDetails.accountNumber) {
      const accLen = formData.bankAccountDetails.accountNumber.length
      if (accLen < 9 || accLen > 18) {
        if (!newErrors.bankAccountDetails) newErrors.bankAccountDetails = {}
        newErrors.bankAccountDetails.accountNumber = 'Account number must be between 9 and 18 digits.'
        isValid = false
      }
    }

    if (formData.bankAccountDetails.panCardNumber) {
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

    if (security?.some((t) => t.contactNumber === formData.contactNumber && t.securityId !== formData.securityId)) {
      newErrors.contactNumber = 'Contact number already exists!'
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
      const res = await onSave(formData)
      if (res && (res.status === 201 || (res.status === 200 && res.data?.success))) {
        onClose()
        setFormData(makeEmptyForm())
      }
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => { setShowModal(false); setPreviewFileUrl(null); setIsPreviewPdf(false) }

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {viewMode ? 'Security Profile' : initialData ? 'Edit Security Staff' : 'Add Security Staff'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody ref={bodyRef} style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {viewMode ? (
            /* ═══════════════ VIEW MODE ═══════════════ */
            <div>
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
                  <InfoRow label="Full Name" value={formData.fullName} />
                  <InfoRow label="Email" value={formData.emailId} />
                  <InfoRow label="Contact" value={formData.contactNumber} />
                  <InfoRow label="Gender" value={formData.gender} />
                  <InfoRow label="Date of Birth" value={formData.dateOfBirth} />
                  <InfoRow label="Government ID" value={formData.govermentId} />
                </div>
              </InfoCard>

              <InfoCard icon={Briefcase} title="Work Information">
                <div className="sf-inner-grid">
                  <InfoRow label="Date of Joining" value={formData.dateOfJoining} />
                  <InfoRow label="Department" value={formData.department} />
                  <InfoRow label="Shift / Availability" value={formData.shiftTimingsOrAvailability} />
                  <InfoRow label="Police Verification" value={formData.policeVerification} />
                </div>
              </InfoCard>

              <InfoCard icon={MapPin} title="Address">
                <p className="sf-info-value" style={{ margin: 0 }}>
                  {[formData.address?.houseNo, formData.address?.street, formData.address?.landmark, formData.address?.city, formData.address?.state, formData.address?.postalCode, formData.address?.country].filter(Boolean).join(', ')}
                </p>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Bank Details">
                <div className="sf-inner-grid">
                  <InfoRow label="Account Number" value={formData.bankAccountDetails?.accountNumber} />
                  <InfoRow label="Account Holder" value={formData.bankAccountDetails?.accountHolderName} />
                  <InfoRow label="IFSC Code" value={formData.bankAccountDetails?.ifscCode} />
                  <InfoRow label="Bank Name" value={formData.bankAccountDetails?.bankName} />
                  <InfoRow label="Branch Name" value={formData.bankAccountDetails?.branchName} />
                  <InfoRow label="PAN Card" value={formData.bankAccountDetails?.panCardNumber} />
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
              <FormSection icon={User} title="Basic Information">
                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        className="sf-input"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Gender" required error={errors.gender}>
                      <select className="sf-input" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Date of Birth" required error={errors.dateOfBirth}>
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
                          if (/^\d*$/.test(e.target.value)) handleChange('contactNumber', e.target.value)
                        }}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Email" error={errors.emailId}>
                      <input
                        className="sf-input" type="email"
                        value={formData.emailId}
                        onChange={(e) => handleChange('emailId', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Government ID (Aadhaar)" required error={errors.govermentId}>
                      <input
                        className="sf-input" maxLength={12}
                        value={formData.govermentId}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) handleChange('govermentId', e.target.value)
                        }}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              <FormSection icon={Briefcase} title="Work Information">
                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Date of Joining" required error={errors.dateOfJoining}>
                      <input
                        className="sf-input" type="date"
                        value={formData.dateOfJoining}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
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
                  <div className="sf-col-third">
                    <Field label="Emergency Contact" required error={errors.emergencyContact}>
                      <input
                        className="sf-input" type="text" maxLength={10}
                        value={formData.emergencyContact}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) handleChange('emergencyContact', e.target.value)
                        }}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-full">
                    <Field label="Shift Timings / Availability" required error={errors.shiftTimingsOrAvailability}>
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
                          }}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

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
                          maxLength={field === 'accountNumber' ? 18 : field === 'panCardNumber' ? 10 : field === 'ifscCode' ? 11 : field === 'accountHolderName' ? 50 : undefined}
                          onChange={async (e) => {
                            let value = e.target.value
                            if (field === 'accountHolderName') {
                              if (/^[A-Za-z\s]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'accountNumber') {
                              if (/^\d*$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'panCardNumber') {
                              value = value.toUpperCase()
                              if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value)) handleNestedChange('bankAccountDetails', field, value)
                            } else if (field === 'ifscCode') {
                              value = value.toUpperCase()
                              if (/^[A-Z0-9]*$/.test(value)) {
                                handleNestedChange('bankAccountDetails', field, value)
                                if (value.length === 11) {
                                  try {
                                    setIfscLoading(true)
                                    const res = await fetch(`https://ifsc.razorpay.com/${value}`)
                                    if (res.ok) {
                                      const data = await res.json()
                                      handleNestedChange('bankAccountDetails', 'bankName', data.BANK || '')
                                      handleNestedChange('bankAccountDetails', 'branchName', data.BRANCH || '')
                                    }
                                  } catch { handleNestedChange('bankAccountDetails', 'bankName', ''); handleNestedChange('bankAccountDetails', 'branchName', '') }
                                  finally { setIfscLoading(false) }
                                }
                              }
                            } else {
                              handleNestedChange('bankAccountDetails', field, value)
                            }
                          }}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              <FormSection icon={FileText} title="Documents">
                <div className="sf-row">
                  <div className="sf-col-third">
                    <Field label="Profile Image" required error={errors.profilePicture}>
                      <input className="sf-input" type="file" accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (file) { const base64 = await toBase64(file); handleChange('profilePicture', base64) }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="sf-col-third">
                    <Field label="Medical Fitness Certificate" required error={errors.medicalFitnessCertificate}>
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


            </CForm>
          )}
        </CModalBody>

        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          {viewMode ? (
            <button className="sf-btn-cancel" onClick={onClose}><X size={13} /> Close</button>
          ) : (
            <>
              <button type="button" className="sf-btn-cancel" onClick={() => { saveScroll(); setFormData(makeEmptyForm()) }}>
                <RotateCcw size={13} /> Clear
              </button>
              <button type="button" className="sf-btn-cancel" onClick={() => { setFormData(makeEmptyForm()); onClose() }}>
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

export default SecurityForm