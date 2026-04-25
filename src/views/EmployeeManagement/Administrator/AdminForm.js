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
import { emailPattern } from '../../../Constant/Constants'
import { showCustomToast } from '../../../Utils/Toaster'
import {
  User, Briefcase, MapPin, CreditCard, FileText,
  Save, X, RotateCcw, UserCog,
} from 'lucide-react'

const AdminForm = ({ visible, onClose, onSave, initialData, viewMode, admins, fetchAdmins }) => {
  const emptyPermissions = {}

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
    department: '',
    yearOfExperience: '',
    role: 'Administrator',
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
    profilePicture: '',
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
    'fullName', 'gender', 'dateOfBirth', 'contactNumber', 'emailId',
    'governmentId', 'dateOfJoining', 'department', 'clinicId',
    'profilePicture', 'role', 'emergencyContact',
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
      for (const key of keys) { value = value?.[key]; if (value === undefined || value === null) break }
      if (value === undefined || value === null || String(value).trim() === '') missingFields.push(field)
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
    if (initialData) setFormData(initialData)
    else setFormData(emptyForm)
  }, [initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    const error = validateField(field, value, { ...formData, [field]: value }, admins)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }))
  }

  const handleBlur = (field, value) => {
    const error = validateField(field, value, formData, admins)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 250 * 1024) { showCustomToast('File size must be less than 250KB.', 'error'); return }
    const reader = new FileReader()
    reader.onloadend = () => setFormData((prev) => ({ ...prev, [field]: reader.result }))
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const missing = validateMandatoryFields(formData, mandatoryFields)
    if (missing.length > 0) { showCustomToast(`Please fill required fields: ${missing.join(', ')}`, 'error'); return false }
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age -= 1
      if (age < 18) { showCustomToast('Admin must be at least 18 years old.', 'error'); return false }
    }
    if (!/^[6-9]\d{9}$/.test(formData.contactNumber)) { showCustomToast('Contact number must be 10 digits and start with 6-9.', 'error'); return false }
    if (formData.contactNumber === formData.emergencyContact) { showCustomToast('Contact Number and Emergency Contact cannot be the same.', 'error'); return false }
    if (!emailPattern.test(formData.emailId)) { showCustomToast('Please enter a valid email address.', 'error'); return false }
    if (admins?.some((t) => t.contactNumber === formData.contactNumber && t.id !== formData.id)) { showCustomToast('Contact number already exists!', 'error'); return false }
    if (admins?.some((t) => t.emailId === formData.emailId && t.id !== formData.id)) { showCustomToast('Email already exists!', 'error'); return false }
    return true
  }

  const handleSubmit = async () => {
    const isValid = validateForm()
    if (!isValid) return
    if (Object.keys(formData.permissions).length === 0) {
      showCustomToast('Please assign at least one user permission before saving.', 'error')
      return
    }
    try {
      setLoading(true)
      const res = await onSave(formData)
      if (res != undefined) { setFormData(emptyForm); onClose() }
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

  const handleCloseModal = () => { setShowModal(false); setPreviewFileUrl(null); setIsPreviewPdf(false) }

  // ── View Mode helpers ──
  const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="af-card">
      <div className="af-card-header"><Icon size={14} className="af-card-icon" />{title}</div>
      <div className="af-card-body">{children}</div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div className="af-info-row">
      <span className="af-info-label">{label}</span>
      <span className="af-info-value">{value || '—'}</span>
    </div>
  )

  // ── Edit Mode helpers ──
  const FormSection = ({ icon: Icon, title, children }) => (
    <div className="af-section">
      <div className="af-section-title"><Icon size={14} className="af-section-icon" />{title}</div>
      <div className="af-section-body">{children}</div>
    </div>
  )

  const Field = ({ label, required, error, children }) => (
    <div className="af-field">
      <label className="af-label">{label}{required && <span className="af-required">*</span>}</label>
      {children}
      {error && <span className="af-error">{error}</span>}
    </div>
  )

  return (
    <>
      <ToastContainer />

      {/* ── Main Modal ── */}
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {viewMode ? 'Admin Profile' : initialData ? 'Edit Admin' : 'Add Admin'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {viewMode ? (
            /* ═══════════════ VIEW MODE ═══════════════ */
            <div>
              {/* Profile Header */}
              <div className="af-profile-header">
                <img
                  src={formData.profilePicture || '/assets/images/default-avatar.png'}
                  alt={formData.fullName}
                  className="af-profile-avatar"
                />
                <div>
                  <h4 className="af-profile-name">{formData.fullName}</h4>
                  <p className="af-profile-meta">{formData.emailId || 'No email'}</p>
                  <p className="af-profile-meta">{formData.contactNumber}</p>
                  <span className="af-badge">ID: {formData.adminId}</span>
                </div>
              </div>

              <InfoCard icon={User} title="Personal Information">
                <div className="af-inner-grid">
                  <InfoRow label="Full Name"     value={formData.fullName} />
                  <InfoRow label="Email"         value={formData.emailId} />
                  <InfoRow label="Contact"       value={formData.contactNumber} />
                  <InfoRow label="Gender"        value={formData.gender} />
                  <InfoRow label="Date of Birth" value={formData.dateOfBirth} />
                  <InfoRow label="Government ID" value={formData.governmentId} />
                </div>
              </InfoCard>

              <InfoCard icon={Briefcase} title="Work Information">
                <div className="af-inner-grid">
                  <InfoRow label="Date of Joining"   value={formData.dateOfJoining} />
                  <InfoRow label="Department"         value={formData.department} />
                  <InfoRow label="Years of Experience" value={formData.yearOfExperience} />
                  <InfoRow label="Emergency Contact"  value={formData.emergencyContact} />
                </div>
              </InfoCard>

              <InfoCard icon={MapPin} title="Address">
                <p className="af-info-value" style={{ margin: 0 }}>
                  {[
                    formData.address?.houseNo, formData.address?.street,
                    formData.address?.landmark, formData.address?.city,
                    formData.address?.state, formData.address?.postalCode,
                    formData.address?.country,
                  ].filter(Boolean).join(', ')}
                </p>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Bank Details">
                <div className="af-inner-grid">
                  <InfoRow label="Account Number"    value={formData.bankAccountDetails?.accountNumber} />
                  <InfoRow label="Account Holder"    value={formData.bankAccountDetails?.accountHolderName} />
                  <InfoRow label="IFSC Code"         value={formData.bankAccountDetails?.ifscCode} />
                  <InfoRow label="Bank Name"         value={formData.bankAccountDetails?.bankName} />
                  <InfoRow label="Branch Name"       value={formData.bankAccountDetails?.branchName} />
                  <InfoRow label="PAN Card"          value={formData.bankAccountDetails?.panCardNumber} />
                </div>
              </InfoCard>

              <InfoCard icon={FileText} title="Documents">
                <div className="af-grid-2">
                  {formData.qualificationOrCertifications ? (
                    <FilePreview
                      label="Qualification / Certifications"
                      type={formData.qualificationOrCertificationsType}
                      data={formData.qualificationOrCertifications}
                    />
                  ) : (
                    <p className="af-muted">Not Provided — Qualification / Certifications</p>
                  )}
                </div>
              </InfoCard>
            </div>
          ) : (
            /* ═══════════════ EDIT MODE ═══════════════ */
            <CForm>
              {/* Basic Info */}
              <FormSection icon={User} title="Basic Information">
                <div className="af-row">
                  <div className="af-col-half">
                    <Field label="Clinic ID" required>
                      <input className="af-input af-input-disabled" value={clinicId} disabled />
                    </Field>
                  </div>
                  <div className="af-col-half">
                    <Field label="Role" required>
                      <input className="af-input af-input-disabled" value={formData.role} disabled />
                    </Field>
                  </div>
                </div>

                <div className="af-row">
                  <div className="af-col-third">
                    <Field label="Full Name" required error={errors.fullName}>
                      <input
                        className="af-input"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        onBlur={() => handleBlur('fullName', formData.fullName)}
                      />
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Gender" required error={errors.gender}>
                      <select className="af-input" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Date of Birth" required error={errors.dateOfBirth}>
                      <input
                        className="af-input" type="date"
                        value={formData.dateOfBirth}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                <div className="af-row">
                  <div className="af-col-third">
                    <Field label="Contact Number" required error={errors.contactNumber}>
                      <input
                        className="af-input" type="text" maxLength={10}
                        value={formData.contactNumber}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) handleChange('contactNumber', e.target.value)
                        }}
                      />
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Email" required error={errors.emailId}>
                      <input
                        className="af-input" type="email"
                        value={formData.emailId}
                        onChange={(e) => handleChange('emailId', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Government ID (Aadhaar)" required error={errors.governmentId}>
                      <input
                        className="af-input" maxLength={12}
                        value={formData.governmentId}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) handleChange('governmentId', e.target.value)
                        }}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Work Info */}
              <FormSection icon={Briefcase} title="Work Information">
                <div className="af-row">
                  <div className="af-col-third">
                    <Field label="Date of Joining" required error={errors.dateOfJoining}>
                      <input
                        className="af-input" type="date"
                        value={formData.dateOfJoining}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Department" required error={errors.department}>
                      <input
                        className="af-input"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Years of Experience">
                      <input
                        className="af-input" type="number"
                        value={formData.yearOfExperience}
                        onChange={(e) => handleChange('yearOfExperience', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                <div className="af-row">
                  <div className="af-col-third">
                    <Field label="Emergency Contact" required>
                      <input
                        className="af-input" type="text" maxLength={10}
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
                <div className="af-row">
                  {Object.keys(formData.address).map((field) => (
                    <div className="af-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required={field !== 'landmark'}
                        error={errors.address?.[field]}
                      >
                        <input
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
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Bank Details */}
              <FormSection icon={CreditCard} title="Bank Account Details">
                <div className="af-row">
                  {Object.keys(formData.bankAccountDetails).map((field) => (
                    <div className="af-col-third" key={field}>
                      <Field
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                        required
                        error={errors.bankAccountDetails?.[field]}
                      >
                        <input
                          className="af-input"
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
                      </Field>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* Documents */}
              <FormSection icon={FileText} title="Documents">
                <div className="af-row">
                  <div className="af-col-third">
                    <Field label="Profile Image" required>
                      <input
                        className="af-input" type="file" accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const base64 = await toBase64(file)
                            const error = validateField('profilePicture', base64)
                            if (error) { showCustomToast(error, 'error'); return }
                            handleChange('profilePicture', base64)
                          }
                        }}
                      />
                    </Field>
                  </div>
                  <div className="af-col-third">
                    <Field label="Qualification / Certifications">
                      <input
                        className="af-input" type="file"
                        onChange={(e) => handleFileUpload(e, 'qualificationOrCertifications')}
                      />
                    </Field>
                  </div>
                </div>

                {/* User Permissions Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="af-btn-permission" onClick={handleUserPermission}>
                    <UserCog size={13} /> User Permissions
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
                  onSave={() => { console.log('Saved Permissions', formData.permissions); setShowPModal(false) }}
                />
              </FormSection>
            </CForm>
          )}
        </CModalBody>

        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          {viewMode ? (
            <button className="af-btn-cancel" onClick={onClose}><X size={13} /> Close</button>
          ) : (
            <>
              <button type="button" className="af-btn-cancel" onClick={() => setFormData(emptyForm)}>
                <RotateCcw size={13} /> Clear
              </button>
              <button type="button" className="af-btn-cancel" onClick={() => { setFormData(emptyForm); onClose() }}>
                <X size={13} /> Cancel
              </button>
              <button type="button" className="af-btn-save" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? (<><span className="spinner-border spinner-border-sm me-1" role="status" />Saving...</>)
                  : (<><Save size={13} /> Save</>)}
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
        .af-profile-header { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f0f5fb; border-radius: 10px; margin-bottom: 14px; }
        .af-profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #b5d4f4; flex-shrink: 0; }
        .af-profile-name { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0 0 4px; }
        .af-profile-meta { font-size: 12px; color: #6b7280; margin: 0 0 2px; }
        .af-badge { display: inline-block; background: #185fa5; color: #fff; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; margin-top: 4px; }

        /* View cards */
        .af-card { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .af-card-header { display: flex; align-items: center; gap: 8px; background: #185fa5; color: #fff; font-size: 12px; font-weight: 600; padding: 9px 14px; }
        .af-card-icon { color: #b5d4f4; }
        .af-card-body { padding: 14px; background: #fff; }
        .af-inner-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 24px; }
        .af-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .af-info-row { display: flex; flex-direction: column; gap: 2px; }
        .af-info-label { font-size: 10.5px; font-weight: 600; color: #185fa5; text-transform: uppercase; letter-spacing: 0.3px; }
        .af-info-value { font-size: 13px; color: #374151; font-weight: 500; }
        .af-muted { font-size: 12px; color: #9ca3af; font-style: italic; margin: 0; }

        /* Edit sections */
        .af-section { margin-bottom: 18px; border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; }
        .af-section-title { display: flex; align-items: center; gap: 8px; background: #185fa5; color: #fff; font-size: 12px; font-weight: 600; padding: 9px 14px; }
        .af-section-icon { color: #b5d4f4; }
        .af-section-body { padding: 14px; }

        .af-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 0; }
        .af-col-third { flex: 1 1 calc(33.333% - 12px); min-width: 150px; }
        .af-col-half  { flex: 1 1 calc(50% - 12px); min-width: 140px; }
        .af-col-full  { flex: 1 1 100%; }

        .af-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
        .af-label { font-size: 11px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 3px; }
        .af-required { color: #e24b4a; font-size: 11px; }
        .af-error { font-size: 11px; color: #e24b4a; }

        .af-input {
          width: 100%; padding: 7px 10px; font-size: 12.5px; color: #374151;
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 7px;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none; -webkit-appearance: none;
        }
        .af-input:focus { border-color: #185fa5; box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12); }
        .af-input-disabled { background: #f0f5fb !important; color: #9ca3af !important; cursor: not-allowed; }

        /* Footer buttons */
        .af-btn-cancel {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .af-btn-cancel:hover { background: #f3f4f6; }

        .af-btn-save {
          display: inline-flex; align-items: center; gap: 5px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 18px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s;
        }
        .af-btn-save:hover { filter: brightness(0.9); }
        .af-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }

        .af-btn-permission {
          display: inline-flex; align-items: center; gap: 5px;
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s;
        }
        .af-btn-permission:hover { filter: brightness(0.93); }

        @media (max-width: 600px) {
          .af-col-third, .af-col-half { flex: 1 1 100%; }
          .af-inner-grid, .af-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

export default AdminForm