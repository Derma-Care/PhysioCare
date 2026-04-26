import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
} from '@coreui/react'
import Select from 'react-select'
import {
  UserCog, X, User, Briefcase, Clock, FileText,
  Layers, Save,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────
   ⚠️  CRITICAL: These helpers MUST live outside PhysioForm.
   Defining them inside causes React to treat them as NEW
   component types on every render → inputs unmount/remount
   on every keystroke → focus is lost after one character.
───────────────────────────────────────────────────────────── */

const ChipSection = ({ label, items = [], onAdd, isView }) => {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const t = input.trim().toLowerCase()
    if (t && !items.includes(t)) { onAdd([...items, t]); setInput('') }
  }

  const handleRemove = (i) => onAdd(items.filter((_, idx) => idx !== i))

  return (
    <div>
      {!isView && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            className="pf-input"
            placeholder={`Add ${label}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
          />
          <button type="button" className="pf-chip-add-btn" onClick={handleAdd}>Add</button>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.length
          ? items.map((item, i) => (
              <span key={i} className="pf-chip">
                {item}
                {!isView && (
                  <button type="button" className="pf-chip-remove" onClick={() => handleRemove(i)}>
                    <X size={11} />
                  </button>
                )}
              </span>
            ))
          : <span style={{ color: '#9ca3af', fontSize: 12 }}>No {label} added</span>}
      </div>
    </div>
  )
}

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="pf-card">
    <div className="pf-card-header">
      <Icon size={14} className="pf-card-icon" />{title}
    </div>
    <div className="pf-card-body">{children}</div>
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="pf-info-row">
    <span className="pf-info-label">{label}</span>
    <span className="pf-info-value">{value || '—'}</span>
  </div>
)

const FormSection = ({ icon: Icon, title, children }) => (
  <div className="pf-section">
    <div className="pf-section-title">
      <Icon size={14} className="pf-section-icon" />{title}
    </div>
    <div className="pf-section-body">{children}</div>
  </div>
)

const Field = ({ label, error, required, children }) => (
  <div className="pf-field">
    <label className="pf-label">
      {label}{required && <span className="pf-required">*</span>}
    </label>
    {children}
    {error && <span className="pf-error">{error}</span>}
  </div>
)

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
const PhysioForm = ({ visible, onClose, onSave, initialData, viewMode }) => {
  const isView = viewMode

  const serviceOptions = [
    { value: 'home',   label: 'Home'   },
    { value: 'clinic', label: 'Clinic' },
  ]
  const specializationOptions = [
    { value: 'orthopedic',   label: 'Orthopedic'   },
    { value: 'neurological', label: 'Neurological'  },
    { value: 'sports',       label: 'Sports'        },
  ]
  const dayOptions = [
    { value: 'monday',    label: 'Mon' },
    { value: 'tuesday',   label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday',  label: 'Thu' },
    { value: 'friday',    label: 'Fri' },
    { value: 'saturday',  label: 'Sat' },
    { value: 'sunday',    label: 'Sun' },
  ]

  const emptyForm = {
    clinicId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    role: 'physiotherapist',
    fullName: '', contactNumber: '', emailId: '',
    gender: '', dateOfBirth: '', qualification: '',
    yearsOfExperience: '', services: [], specializations: [],
    expertiseAreas: [], treatmentTypes: [],
    availability: { days: [], startTime: '', endTime: '', startDay: '', endDay: '' },
    bio: '',
    documents: { licenseCertificate: '', degreeCertificate: '', profilePhoto: '' },
    languages: [], physioType: '',
  }

  const [formData, setFormData] = useState(emptyForm)
  const [errors,   setErrors]   = useState({})

  const validateForm = () => {
    const e = {}
    if (!formData.fullName?.trim()) e.fullName = 'Full name is required'
    if (!/^[6-9]\d{9}$/.test(formData.contactNumber || '')) e.contactNumber = 'Enter valid 10-digit number'
    if (!formData.gender) e.gender = 'Select gender'
    if (!formData.dateOfBirth) {
      e.dateOfBirth = 'Select DOB'
    } else {
      const maxDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())
      if (new Date(formData.dateOfBirth) > maxDate) e.dateOfBirth = 'Age must be at least 18 years'
    }
    if (!formData.qualification)      e.qualification      = 'Select qualification'
    if (!formData.yearsOfExperience)  e.yearsOfExperience  = 'Enter experience'
    if (!formData.physioType)         e.physioType         = 'Select physio type'
    if (!formData.services?.length)      e.services         = 'Select at least one service'
    if (!formData.specializations?.length) e.specializations = 'Select specialization'
    const a = formData.availability || {}
    if (!a.startDay)  e.startDay  = 'Select start day'
    if (!a.endDay)    e.endDay    = 'Select end day'
    if (!a.startTime) e.startTime = 'Select start time'
    if (!a.endTime)   e.endTime   = 'Select end time'
    if (a.startTime && a.endTime && a.startTime >= a.endTime) e.endTime = 'End time must be after start time'
    if (!formData.bio?.trim())             e.bio           = 'Enter profile description'
    if (!formData.treatmentTypes?.length)  e.treatmentTypes = 'Add treatment type'
    if (!formData.expertiseAreas?.length)  e.expertiseAreas = 'Add expertise'
    if (!formData.languages?.length)       e.languages      = 'Add language'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  useEffect(() => {
    setFormData(initialData ? { ...emptyForm, ...initialData } : emptyForm)
    setErrors({})
  }, [initialData, visible])

  const handleChange       = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))
  const handleNestedChange = (parent, field, value) =>
    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }))

  const convertToBase64 = async (image) => {
    try {
      if (typeof image === 'string' && image.startsWith('data:image')) return image.split(',')[1]
      if (image instanceof File || image instanceof Blob) {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(image)
          reader.onloadend = () => resolve(reader.result.split(',')[1])
          reader.onerror   = reject
        })
      }
      return ''
    } catch { return '' }
  }

  const handleFileChange = async (field, file) => {
    if (!file) return
    const base64 = await convertToBase64(file)
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [field]: base64 } }))
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    const { startDay, endDay, startTime, endTime } = formData.availability
    const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
    const si = dayOrder.indexOf(startDay), ei = dayOrder.indexOf(endDay)
    const selectedDays = si <= ei
      ? dayOrder.slice(si, ei + 1)
      : [...dayOrder.slice(si), ...dayOrder.slice(0, ei + 1)]
    onSave({ ...formData, availability: { days: selectedDays, startTime, endTime } })
  }

  // ── react-select shared props ─────────────────────────────────────────────
  const selectPortalProps = {
    menuPortalTarget: document.body,
    menuPosition: 'fixed',
    styles: {
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      control: (base, state) => ({
        ...base,
        fontSize: 13,
        minHeight: 36,
        borderColor: state.isFocused ? '#185fa5' : '#d0dce9',
        borderWidth: '0.5px',
        borderRadius: 8,
        boxShadow: 'none',
        '&:hover': { borderColor: '#185fa5' },
      }),
      option: (base, state) => ({
        ...base,
        fontSize: 13,
        backgroundColor: state.isSelected ? '#185fa5' : state.isFocused ? '#f0f5fb' : '#fff',
        color: state.isSelected ? '#fff' : '#374151',
      }),
      multiValue:       (base) => ({ ...base, background: '#e6f1fb', borderRadius: 20 }),
      multiValueLabel:  (base) => ({ ...base, color: '#0c447c', fontSize: 12 }),
      multiValueRemove: (base) => ({ ...base, color: '#185fa5', ':hover': { background: '#b5d4f4', color: '#0c447c' } }),
      menu:             (base) => ({ ...base, fontSize: 13 }),
      placeholder:      (base) => ({ ...base, fontSize: 13, color: '#9ca3af' }),
    },
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">

      {/* ── Header ── */}
      <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '14px 20px' }}>
        <CModalTitle style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: '#e6f1fb', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#185fa5',
          }}>
            <UserCog size={17} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>
            {isView ? 'Therapist Profile' : initialData ? 'Edit Therapist' : 'Add Therapist'}
          </span>
        </CModalTitle>
      </CModalHeader>

      {/* ── Body ── */}
      <CModalBody style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto' }}>

        {/* ═══════════════ VIEW MODE ═══════════════ */}
        {isView ? (
          <>
            <div className="pf-profile-header">
              <img
                src={
                  formData.documents?.profilePhoto
                    ? `data:image/jpeg;base64,${formData.documents.profilePhoto}`
                    : '/assets/images/default-avatar.png'
                }
                alt={formData.fullName}
                className="pf-profile-avatar"
              />
              <div>
                <div className="pf-profile-name">{formData.fullName || '—'}</div>
                <div className="pf-profile-sub">
                  {formData.qualification}
                  {formData.yearsOfExperience ? ` · ${formData.yearsOfExperience} yrs exp` : ''}
                </div>
                <span className="pf-badge">ID: {formData.therapistId || 'N/A'}</span>
              </div>
            </div>

            <InfoCard icon={User} title="Personal Information">
              <div className="pf-inner-grid">
                <InfoRow label="Full Name"    value={formData.fullName} />
                <InfoRow label="Contact"      value={formData.contactNumber} />
                <InfoRow label="Email"        value={formData.emailId} />
                <InfoRow label="Gender"       value={formData.gender} />
                <InfoRow label="Date of Birth" value={formData.dateOfBirth} />
                <InfoRow label="Languages"    value={formData.languages?.join(', ')} />
              </div>
            </InfoCard>

            <InfoCard icon={Briefcase} title="Professional Information">
              <div className="pf-inner-grid">
                <InfoRow label="Qualification"   value={formData.qualification} />
                <InfoRow label="Experience"      value={formData.yearsOfExperience ? `${formData.yearsOfExperience} years` : ''} />
                <InfoRow label="Type"            value={formData.physioType} />
                <InfoRow label="Services"        value={formData.services?.join(', ')} />
                <InfoRow label="Specializations" value={formData.specializations?.join(', ')} />
                <InfoRow label="Expertise Areas" value={formData.expertiseAreas?.join(', ')} />
                <InfoRow label="Treatment Types" value={formData.treatmentTypes?.join(', ')} />
              </div>
            </InfoCard>

            <InfoCard icon={Clock} title="Availability">
              <div className="pf-inner-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <InfoRow
                  label="Working Days"
                  value={formData.availability?.days?.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                />
                <InfoRow
                  label="Timings"
                  value={
                    formData.availability?.startTime && formData.availability?.endTime
                      ? `${formData.availability.startTime} – ${formData.availability.endTime}`
                      : ''
                  }
                />
              </div>
            </InfoCard>

            <InfoCard icon={Layers} title="Bio">
              <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.7 }}>
                {formData.bio || '—'}
              </p>
            </InfoCard>

            <InfoCard icon={FileText} title="Documents">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'License Certificate', key: 'licenseCertificate' },
                  { label: 'Degree Certificate',  key: 'degreeCertificate'  },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <div className="pf-info-label" style={{ marginBottom: 6 }}>{label}</div>
                    {formData.documents?.[key]
                      ? <iframe
                          src={`data:application/pdf;base64,${formData.documents[key]}`}
                          width="100%" height="220px"
                          style={{ borderRadius: 8, border: '0.5px solid #d0dce9' }}
                        />
                      : <span style={{ fontSize: 13, color: '#9ca3af' }}>Not provided</span>
                    }
                  </div>
                ))}
              </div>
            </InfoCard>
          </>

        ) : (
        /* ═══════════════ EDIT MODE ═══════════════ */
          <CForm>

            <FormSection icon={UserCog} title="System Info">
              <div className="pf-row">
                <div className="pf-col-third">
                  <Field label="Clinic ID">
                    <input className="pf-input pf-input-disabled" value={formData.clinicId} disabled />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Branch ID">
                    <input className="pf-input pf-input-disabled" value={formData.branchId} disabled />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Role">
                    <input className="pf-input pf-input-disabled" value={formData.role} disabled />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection icon={User} title="Basic Information">
              <div className="pf-row">
                <div className="pf-col-third">
                  <Field label="Full Name" required error={errors.fullName}>
                    <input className="pf-input" value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)} />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Contact Number" required error={errors.contactNumber}>
                    <input className="pf-input" value={formData.contactNumber} maxLength={10}
                      onChange={(e) => handleChange('contactNumber', e.target.value)} />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Email" error={errors.emailId}>
                    <input className="pf-input" value={formData.emailId}
                      onChange={(e) => handleChange('emailId', e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="pf-row">
                <div className="pf-col-third">
                  <Field label="Gender" required error={errors.gender}>
                    <select className="pf-input" value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Date of Birth" required error={errors.dateOfBirth}>
                    <input type="date" className="pf-input" value={formData.dateOfBirth}
                      max={new Date(new Date().getFullYear()-18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                      min="1950-01-01"
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Qualification" required error={errors.qualification}>
                    <select className="pf-input" value={formData.qualification}
                      onChange={(e) => handleChange('qualification', e.target.value)}>
                      <option value="">Select</option>
                      <option value="BPT">BPT</option>
                      <option value="MPT">MPT</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="pf-row">
                <div className="pf-col-half">
                  <Field label="Experience (Years)" required error={errors.yearsOfExperience}>
                    <input type="number" className="pf-input" value={formData.yearsOfExperience}
                      onChange={(e) => handleChange('yearsOfExperience', e.target.value)} />
                  </Field>
                </div>
                <div className="pf-col-half">
                  <Field label="Physio Type" required error={errors.physioType}>
                    <select className="pf-input" value={formData.physioType}
                      onChange={(e) => handleChange('physioType', e.target.value)}>
                      <option value="">Select</option>
                      <option value="therapist">Therapist</option>
                      <option value="intern">Intern</option>
                    </select>
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection icon={Briefcase} title="Services & Specializations">
              <div className="pf-row">
                <div className="pf-col-half">
                  <Field label="Services" required error={errors.services}>
                    <Select
                      isMulti
                      options={serviceOptions}
                      value={serviceOptions.filter(o => formData.services.includes(o.value))}
                      onChange={(sel) => handleChange('services', sel ? sel.map(s => s.value) : [])}
                      {...selectPortalProps}
                    />
                  </Field>
                </div>
                <div className="pf-col-half">
                  <Field label="Specializations" required error={errors.specializations}>
                    <Select
                      isMulti
                      options={specializationOptions}
                      value={specializationOptions.filter(o => formData.specializations.includes(o.value))}
                      onChange={(sel) => handleChange('specializations', sel ? sel.map(s => s.value) : [])}
                      {...selectPortalProps}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection icon={Clock} title="Availability">
              <div className="pf-row">
                <div className="pf-col-half">
                  <Field label="Start Day" required error={errors.startDay}>
                    <Select
                      options={dayOptions}
                      value={dayOptions.find(o => o.value === formData.availability.startDay) || null}
                      onChange={(sel) => handleNestedChange('availability', 'startDay', sel?.value || '')}
                      {...selectPortalProps}
                    />
                  </Field>
                </div>
                <div className="pf-col-half">
                  <Field label="End Day" required error={errors.endDay}>
                    <Select
                      options={dayOptions}
                      value={dayOptions.find(o => o.value === formData.availability.endDay) || null}
                      onChange={(sel) => handleNestedChange('availability', 'endDay', sel?.value || '')}
                      {...selectPortalProps}
                    />
                  </Field>
                </div>
              </div>
              <div className="pf-row">
                <div className="pf-col-half">
                  <Field label="Start Time" required error={errors.startTime}>
                    <input type="time" className="pf-input"
                      value={formData.availability.startTime}
                      onChange={(e) => handleNestedChange('availability', 'startTime', e.target.value)} />
                  </Field>
                </div>
                <div className="pf-col-half">
                  <Field label="End Time" required error={errors.endTime}>
                    <input type="time" className="pf-input"
                      value={formData.availability.endTime}
                      onChange={(e) => handleNestedChange('availability', 'endTime', e.target.value)} />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection icon={Layers} title="Profile Details">
              <div className="pf-row">
                <div className="pf-col-full">
                  <Field label="Profile Description" required error={errors.bio}>
                    <textarea className="pf-input pf-textarea" rows={3} value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      placeholder="Enter profile description..." />
                  </Field>
                </div>
              </div>
              <div className="pf-row">
                <div className="pf-col-full">
                  <Field label="Treatment Types" required error={errors.treatmentTypes}>
                    {/* Pass isView as a prop — ChipSection is now OUTSIDE this component */}
                    <ChipSection
                      label="Treatment Type"
                      items={formData.treatmentTypes}
                      onAdd={(val) => handleChange('treatmentTypes', val)}
                      isView={isView}
                    />
                  </Field>
                </div>
              </div>
              <div className="pf-row">
                <div className="pf-col-full">
                  <Field label="Area of Expertise" required error={errors.expertiseAreas}>
                    <ChipSection
                      label="Area of Expertise"
                      items={formData.expertiseAreas}
                      onAdd={(val) => handleChange('expertiseAreas', val)}
                      isView={isView}
                    />
                  </Field>
                </div>
              </div>
              <div className="pf-row">
                <div className="pf-col-full">
                  <Field label="Languages" required error={errors.languages}>
                    <ChipSection
                      label="Languages"
                      items={formData.languages}
                      onAdd={(val) => handleChange('languages', val)}
                      isView={isView}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection icon={FileText} title="Documents">
              <div className="pf-row">
                <div className="pf-col-third">
                  <Field label="License Certificate">
                    <input type="file" className="pf-input"
                      onChange={(e) => handleFileChange('licenseCertificate', e.target.files[0])} />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Degree Certificate">
                    <input type="file" className="pf-input"
                      onChange={(e) => handleFileChange('degreeCertificate', e.target.files[0])} />
                  </Field>
                </div>
                <div className="pf-col-third">
                  <Field label="Profile Photo">
                    <input type="file" className="pf-input"
                      onChange={(e) => handleFileChange('profilePhoto', e.target.files[0])} />
                  </Field>
                </div>
              </div>
            </FormSection>

          </CForm>
        )}
      </CModalBody>

      {/* ── Footer ── */}
      <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
        {isView ? (
          <button className="pf-btn-cancel" onClick={onClose}><X size={13} /> Close</button>
        ) : (
          <>
            <button className="pf-btn-cancel" onClick={onClose}><X size={13} /> Cancel</button>
            <button className="pf-btn-save"   onClick={handleSubmit}><Save size={13} /> Save Therapist</button>
          </>
        )}
      </CModalFooter>

      {/* ── Styles ── */}
      <style>{`
        .pf-profile-header {
          display: flex; align-items: center; gap: 16px;
          padding: 16px; background: #f0f5fb; border-radius: 10px; margin-bottom: 14px;
        }
        .pf-profile-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          object-fit: cover; border: 2px solid #b5d4f4; flex-shrink: 0;
        }
        .pf-profile-name { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0 0 4px; }
        .pf-profile-sub  { font-size: 12px; color: #6b7280; margin: 0 0 6px; }
        .pf-badge {
          display: inline-block; background: #185fa5; color: #fff;
          font-size: 11px; font-weight: 600; padding: 2px 10px;
          border-radius: 20px; margin-top: 2px;
        }
        .pf-card { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
        .pf-card-header {
          display: flex; align-items: center; gap: 8px;
          background: #185fa5; color: #fff;
          font-size: 12px; font-weight: 600; padding: 9px 14px;
        }
        .pf-card-icon { color: #b5d4f4; }
        .pf-card-body  { padding: 14px; background: #fff; }
        .pf-inner-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px; }
        .pf-info-row   { display: flex; flex-direction: column; gap: 2px; }
        .pf-info-label {
          font-size: 10.5px; font-weight: 600; color: #185fa5;
          text-transform: uppercase; letter-spacing: 0.3px;
        }
        .pf-info-value { font-size: 13px; color: #374151; font-weight: 500; }
        .pf-section { margin-bottom: 18px; border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; }
        .pf-section-title {
          display: flex; align-items: center; gap: 8px;
          background: #185fa5; color: #fff;
          font-size: 12px; font-weight: 600; padding: 9px 14px;
        }
        .pf-section-icon { color: #b5d4f4; }
        .pf-section-body { padding: 14px; }
        .pf-row      { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 0; }
        .pf-col-third { flex: 1 1 calc(33.333% - 12px); min-width: 150px; }
        .pf-col-half  { flex: 1 1 calc(50% - 12px);     min-width: 140px; }
        .pf-col-full  { flex: 1 1 100%; }
        .pf-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
        .pf-label {
          font-size: 11px; font-weight: 600; color: #374151;
          display: flex; align-items: center; gap: 3px;
        }
        .pf-required { color: #e24b4a; font-size: 11px; }
        .pf-error    { font-size: 11px; color: #e24b4a; }
        .pf-input {
          width: 100%; padding: 7px 10px; font-size: 12.5px; color: #374151;
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 7px;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none; -webkit-appearance: none;
        }
        .pf-input:focus {
          border-color: #185fa5;
          box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12);
        }
        .pf-input-disabled {
          background: #f0f5fb !important; color: #9ca3af !important; cursor: not-allowed;
        }
        .pf-textarea { resize: vertical; min-height: 70px; }
        .pf-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: #e6f1fb; color: #0c447c;
          border: 0.5px solid #b5d4f4; border-radius: 20px;
          padding: 4px 10px; font-size: 12px; font-weight: 500;
        }
        .pf-chip-remove {
          background: none; border: none; color: #185fa5;
          cursor: pointer; display: flex; align-items: center;
          padding: 0; line-height: 1; transition: color 0.12s;
        }
        .pf-chip-remove:hover { color: #a32d2d; }
        .pf-chip-add-btn {
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 14px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          white-space: nowrap; transition: filter 0.15s;
        }
        .pf-chip-add-btn:hover { filter: brightness(0.9); }
        .pf-btn-cancel {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 7px 16px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .pf-btn-cancel:hover { background: #f3f4f6; }
        .pf-btn-save {
          display: inline-flex; align-items: center; gap: 5px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 18px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: filter 0.15s;
        }
        .pf-btn-save:hover   { filter: brightness(0.9); }
        .pf-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
        @media (max-width: 600px) {
          .pf-col-third, .pf-col-half { flex: 1 1 100%; }
          .pf-inner-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </CModal>
  )
}

export default PhysioForm