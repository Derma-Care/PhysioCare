import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import Select from 'react-select'


const PhysioForm = ({ visible, onClose, onSave, initialData, viewMode }) => {
  const isView = viewMode
  const [languageInput, setLanguageInput] = useState('')
  const [expertiseInput, setExpertiseInput] = useState('')
  const [treatmentInput, setTreatmentInput] = useState('')
 const serviceOptions = [
  { value: 'home', label: 'Home' },
  { value: 'clinic', label: 'Clinic' },
]

const specializationOptions = [
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'sports', label: 'Sports' },
]

// const expertiseOptions = [
//   { value: 'knee', label: 'Knee' },
//   { value: 'shoulder', label: 'Shoulder' },
//   { value: 'back', label: 'Back' },
// ]

const treatmentOptions = [
  { value: 'exercise_therapy', label: 'Exercise Therapy' },
  { value: 'manual_therapy', label: 'Manual Therapy' },
  { value: 'electrotherapy', label: 'Electrotherapy' },
]



const dayOptions = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

  const emptyForm = {
   clinicId: localStorage.getItem('HospitalId'),
  branchId: localStorage.getItem('branchId'),
    role: 'physiotherapist',      // ✅ fixed value 
    fullName: '',
    contactNumber: '',
    gender: '',
    dateOfBirth: '',
    qualification: '',
    yearsOfExperience: '',
    services: [],
    specializations: [],
    expertiseAreas: [],
    treatmentTypes: [],
    availability: {
      days: [],
      startTime: '',
      endTime: '',
    },
    bio: '',
    documents: {
      licenseCertificate: '',
      degreeCertificate: '',
      profilePhoto: '',
    },
    languages: [],
    role: 'physiotherapist',
    physioType: '',
  }

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (initialData) setFormData(initialData)
    else setFormData(emptyForm)
  }, [initialData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  const handleAddLanguage = (e) => {
  if (e.key === 'Enter' && languageInput.trim()) {
    e.preventDefault()

    if (!formData.languages.includes(languageInput.trim().toLowerCase())) {
      handleChange('languages', [
        ...formData.languages,
        languageInput.trim().toLowerCase(),
      ])
    }

    setLanguageInput('')
  }
}

const handleRemoveLanguage = (lang) => {
  handleChange(
    'languages',
    formData.languages.filter((l) => l !== lang)
  )
}
const ChipSection = ({ label, items = [], onAdd, isView }) => {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase()

    if (trimmed && !items.includes(trimmed)) {
      onAdd([...items, trimmed])
      setInput('')
    }
  }

  const handleRemove = (indexToRemove) => {
    const updated = items.filter((_, index) => index !== indexToRemove)
    onAdd(updated)
  }

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>

      {/* INPUT + BUTTON */}
      {!isView && (
        <div className="d-flex mb-2">
          <input
            type="text"
            className="form-control me-2"
            placeholder={`Add ${label}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
          />

          <button
            type="button"
            className="btn"
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
      )}

      {/* CHIPS */}
      <div className="d-flex flex-wrap gap-2">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={index}
              className="badge d-flex align-items-center"
              style={{
                padding: '8px 12px',
                borderRadius: '20px',
                backgroundColor: '#e7f1ff',
                color: '#000',
              }}
            >
              <span className="me-2">{item}</span>

              {!isView && (
                <span
                  style={{ cursor: 'pointer', fontSize: '12px' }}
                  onClick={() => handleRemove(index)}
                >
                  ×
                </span>
              )}
            </div>
          ))
        ) : (
          <span className="text-muted">No {label} added</span>
        )}
      </div>
    </div>
  )
}

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{isView ? 'View Physio' : 'Add / Edit Physio'}</CModalTitle>
      </CModalHeader>

      <CModalBody>
          {isView ? (
          <div className="container my-4">

            {/* HEADER */}
            <div className="card p-4 mb-4 shadow-sm border-light">
              <div className="d-flex flex-column flex-md-row align-items-center">

                <div className="text-center me-md-4 mb-3 mb-md-0">
                  <img
                    src={formData.documents?.profilePhoto || '/assets/images/default-avatar.png'}
                    alt={formData.fullName}
                    width="100"
                    height="100"
                    className="rounded-circle border"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className="flex-grow-1 text-center text-md-start">
                  <h4 className="fw-bold">{formData.fullName}</h4>
                  <p><strong>Contact:</strong> {formData.contactNumber}</p>
                  <p><strong>Qualification:</strong> {formData.qualification}</p>
                  <span className="badge bg-secondary">
                    ID: {formData.id || 'N/A'}
                  </span>
                </div>

              </div>
            </div>

            {/* PERSONAL */}
            <div className="card p-3 mb-4 shadow-sm border-light">
              <h5 className="mb-3 border-bottom pb-2">Personal Information</h5>

              <div className="row g-3">
                <div className="col-md-4">
                  <b>Full Name</b><br />{formData.fullName}
                </div>
                <div className="col-md-4">
                  <b>Contact</b><br />{formData.contactNumber}
                </div>
                <div className="col-md-4">
                  <b>Gender</b><br />{formData.gender}
                </div>
                <div className="col-md-4">
                  <b>Date of Birth</b><br />{formData.dateOfBirth}
                </div>
                <div className="col-md-4">
                  <b>Languages</b><br />{formData.languages?.join(', ') || 'N/A'}
                </div>
              </div>
            </div>

            {/* PROFESSIONAL */}
            <div className="card p-3 mb-4 shadow-sm border-light">
              <h5 className="mb-3 border-bottom pb-2">Professional Information</h5>

              <div className="row g-3">
                <div className="col-md-4">
                  <b>Qualification</b><br />{formData.qualification}
                </div>
                <div className="col-md-4">
                  <b>Experience</b><br />{formData.yearsOfExperience} years
                </div>
                <div className="col-md-4">
                  <b>Type</b><br />{formData.physioType}
                </div>
                <div className="col-md-4">
                  <b>Services</b><br />{formData.services?.join(', ') || 'N/A'}
                </div>
                <div className="col-md-4">
                  <b>Specializations</b><br />{formData.specializations?.join(', ') || 'N/A'}
                </div>
                <div className="col-md-4">
                  <b>Expertise</b><br />{formData.expertiseAreas?.join(', ') || 'N/A'}
                </div>
                <div className="col-md-4">
                  <b>Treatments</b><br />{formData.treatmentTypes?.join(', ') || 'N/A'}
                </div>
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className="card p-3 mb-4 shadow-sm border-light">
              <h5 className="mb-3 border-bottom pb-2">Availability</h5>
              <p>
                {formData.availability?.startDay} - {formData.availability?.endDay}
                <br />
                {formData.availability?.startTime} - {formData.availability?.endTime}
              </p>
            </div>

            {/* BIO */}
            <div className="card p-3 mb-4 shadow-sm border-light">
              <h5 className="mb-3 border-bottom pb-2">Bio</h5>
              <p>{formData.bio || 'N/A'}</p>
            </div>

            {/* DOCUMENTS */}
            <div className="card p-3 mb-4 shadow-sm border-light">
              <h5 className="mb-3 border-bottom pb-2">Documents</h5>

              <p>License Certificate: {formData.documents?.licenseCertificate ? 'Uploaded' : 'Not Provided'}</p>
              <p>Degree Certificate: {formData.documents?.degreeCertificate ? 'Uploaded' : 'Not Provided'}</p>
              <p>Profile Photo: {formData.documents?.profilePhoto ? 'Uploaded' : 'Not Provided'}</p>
            </div>

          </div>
        ) : (

       <CForm>

  {/* BASIC */}

<h5 className="mb-3">Basic Information</h5>
<CRow className="mb-3">

  <CCol md={4}>
    <CFormLabel>Clinic ID</CFormLabel>
    <CFormInput
      value={formData.clinicId}
      disabled   // ✅ always disabled
    />
  </CCol>

  <CCol md={4}>
    <CFormLabel>Branch ID</CFormLabel>
    <CFormInput
      value={formData.branchId}
      disabled   // ✅ always disabled
    />
  </CCol>

  <CCol md={4}>
    <CFormLabel>Role</CFormLabel>
    <CFormInput
      value={formData.role}
      disabled   // ✅ always disabled
    />
  </CCol>

</CRow>

<CRow className="mb-3">
  <CCol md={6}>
    <CFormLabel>Full Name</CFormLabel>
    <CFormInput
      value={formData.fullName}
      disabled={isView}
      onChange={(e) => handleChange('fullName', e.target.value)}
    />
  </CCol>

  <CCol md={6}>
    <CFormLabel>Contact Number</CFormLabel>
    <CFormInput
      value={formData.contactNumber}
      disabled={isView}
      onChange={(e) => handleChange('contactNumber', e.target.value)}
    />
  </CCol>
</CRow>

<CRow className="mb-3">
  <CCol md={4}>
    <CFormLabel>Gender</CFormLabel>
    <CFormSelect
      value={formData.gender}
      disabled={isView}
      onChange={(e) => handleChange('gender', e.target.value)}
    >
      <option value="">Select</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </CFormSelect>
  </CCol>

  <CCol md={4}>
    <CFormLabel>Date of Birth</CFormLabel>
    <CFormInput
      type="date"
      value={formData.dateOfBirth}
      disabled={isView}
      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
    />
  </CCol>

  <CCol md={4}>
    <CFormLabel>Qualification</CFormLabel>
    <CFormSelect
      value={formData.qualification}
      disabled={isView}
      onChange={(e) => handleChange('qualification', e.target.value)}
    >
      <option value="">Select</option>
      <option value="BPT">BPT</option>
      <option value="MPT">MPT</option>
    </CFormSelect>
  </CCol>
</CRow>

<CRow className="mb-3">
  <CCol md={6}>
    <CFormLabel>Experience (Years)</CFormLabel>
    <CFormInput
      type="number"
      value={formData.yearsOfExperience}
      disabled={isView}
      onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
    />
  </CCol>

  <CCol md={6}>
    <CFormLabel>Physio Type</CFormLabel>
    <CFormSelect
      value={formData.physioType}
      disabled={isView}
      onChange={(e) => handleChange('physioType', e.target.value)}
    >
      <option value="">Select</option>
      <option value="therapist">Therapist</option>
      <option value="intern">Intern</option>
    </CFormSelect>
  </CCol>
</CRow>

{/* SERVICES */}
<CRow className="mb-3">
  <CCol md={6}>
    <CFormLabel>Services</CFormLabel>
    <Select
      isMulti
      isDisabled={isView}
      options={serviceOptions}
      value={serviceOptions.filter(o => formData.services.includes(o.value))}
      onChange={(selected) =>
        handleChange('services', selected ? selected.map(s => s.value) : [])
      }
    />
  </CCol>

  <CCol md={6}>
    <CFormLabel>Specializations</CFormLabel>
    <Select
      isMulti
      isDisabled={isView}
      options={specializationOptions}
      value={specializationOptions.filter(o => formData.specializations.includes(o.value))}
      onChange={(selected) =>
        handleChange('specializations', selected ? selected.map(s => s.value) : [])
      }
    />
  </CCol>
</CRow>

{/* EXPERTISE */}
<CRow className="mb-3">
 
</CRow>

{/* TREATMENTS */}


{/* AVAILABILITY */}
<h5 className="mt-4 mb-3">Availability</h5>

<CRow className="mb-3">
  <CCol md={6}>
    <CFormLabel>Start Day</CFormLabel>
    <Select
      isDisabled={isView}
      options={dayOptions}
      value={dayOptions.find(o => o.value === formData.availability.startDay)}
      onChange={(selected) =>
        handleNestedChange('availability', 'startDay', selected?.value || '')
      }
    />
  </CCol>

  <CCol md={6}>
    <CFormLabel>End Day</CFormLabel>
    <Select
      isDisabled={isView}
      options={dayOptions}
      value={dayOptions.find(o => o.value === formData.availability.endDay)}
      onChange={(selected) =>
        handleNestedChange('availability', 'endDay', selected?.value || '')
      }
    />
  </CCol>
</CRow>

<CRow className="mb-3">
  <CCol md={6}>
    <CFormLabel>Start Time</CFormLabel>
    <CFormInput
      type="time"
      value={formData.availability.startTime}
      disabled={isView}
      onChange={(e) =>
        handleNestedChange('availability', 'startTime', e.target.value)
      }
    />
  </CCol>

  <CCol md={6}>
    <CFormLabel>End Time</CFormLabel>
    <CFormInput
      type="time"
      value={formData.availability.endTime}
      disabled={isView}
      onChange={(e) =>
        handleNestedChange('availability', 'endTime', e.target.value)
      }
    />
  </CCol>
</CRow>

{/* LANGUAGES */}


{/* BIO */}
<CRow className="mb-3">
  <CCol md={12}>
    <CFormLabel>Profile Description</CFormLabel>
    <CFormTextarea
      rows={3}
      value={formData.bio}
      disabled={isView}
      onChange={(e) => handleChange('bio', e.target.value)}
    />
  </CCol>
</CRow>
<CRow className="mb-3">
  <CCol md={12}>
   <ChipSection
  label="Treatment Type"
  items={formData.treatmentTypes}
  onAdd={(val) => handleChange('treatmentTypes', val)}
  isView={isView}
/>
  </CCol>
</CRow>
<CRow className="mb-3">
  <CCol md={12}>
    <ChipSection
  label="Area of Expertise"
  items={formData.expertiseAreas}
  onAdd={(val) => handleChange('expertiseAreas', val)}
  isView={isView}
/>
  </CCol>
</CRow>
<CRow className="mb-3">
  <CCol md={12}>
    <ChipSection
  label="Languages"
  items={formData.languages}
  onAdd={(val) => handleChange('languages', val)}
  isView={isView}
/>
  </CCol>
</CRow>

{/* DOCUMENTS */}
<h5 className="mt-4 mb-3">Documents</h5>

<CRow className="mb-3">
  <CCol md={4}>
    <CFormLabel>License Certificate</CFormLabel>
    <CFormInput type="file" disabled={isView} />
  </CCol>

  <CCol md={4}>
    <CFormLabel>Degree Certificate</CFormLabel>
    <CFormInput type="file" disabled={isView} />
  </CCol>

  <CCol md={4}>
    <CFormLabel>Profile Photo</CFormLabel>
    <CFormInput type="file" disabled={isView} />
  </CCol>
</CRow>

</CForm>
        )}
      </CModalBody>
      

      <CModalFooter>
        {isView ? (
          <CButton onClick={onClose}>Close</CButton>
        ) : (
          <>
            <CButton onClick={onClose}>Cancel</CButton>
            <CButton onClick={handleSubmit}>Save</CButton>
          </>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default PhysioForm