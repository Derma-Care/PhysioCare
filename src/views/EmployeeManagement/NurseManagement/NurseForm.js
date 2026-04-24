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
    emailId: '',
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
    physioType: '',
  }

  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!/^[6-9]\d{9}$/.test(formData.contactNumber || '')) {
      newErrors.contactNumber = 'Enter valid 10-digit number'
    }

    if (!formData.gender) {
      newErrors.gender = 'Select gender'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Select DOB'
    } else {
      const selectedDOB = new Date(formData.dateOfBirth)
      const maxDate = new Date(
        new Date().getFullYear() - 18,
        new Date().getMonth(),
        new Date().getDate()
      )

      if (selectedDOB > maxDate) {
        newErrors.dateOfBirth = 'Age must be at least 18 years'
      }
    }

    if (!formData.qualification) {
      newErrors.qualification = 'Select qualification'
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Enter experience'
    }

    if (!formData.physioType) {
      newErrors.physioType = 'Select physio type'
    }

    if (!formData.services?.length) {
      newErrors.services = 'Select at least one service'
    }

    if (!formData.specializations?.length) {
      newErrors.specializations = 'Select specialization'
    }

    const a = formData.availability || {}

    if (!a.startDay) newErrors.startDay = 'Select start day'
    if (!a.endDay) newErrors.endDay = 'Select end day'
    if (!a.startTime) newErrors.startTime = 'Select start time'
    if (!a.endTime) newErrors.endTime = 'Select end time'

    if (a.startTime && a.endTime && a.startTime >= a.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    if (!formData.bio?.trim()) {
      newErrors.bio = 'Enter profile description'
    }

    if (!formData.treatmentTypes?.length) {
      newErrors.treatmentTypes = 'Add treatment type'
    }

    if (!formData.expertiseAreas?.length) {
      newErrors.expertiseAreas = 'Add expertise'
    }

    if (!formData.languages?.length) {
      newErrors.languages = 'Add language'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
      })
    }
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
  const convertToBase64 = async (image) => {
    try {
      // ✅ already base64
      if (typeof image === "string" && image.startsWith("data:image")) {
        return image.split(",")[1]
      }

      // ✅ File / Blob
      if (image instanceof File || image instanceof Blob) {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(image)
          reader.onloadend = () => resolve(reader.result.split(",")[1])
          reader.onerror = reject
        })
      }

      // ✅ URL / blob URL
      if (typeof image === "string") {
        const res = await fetch(image)
        const blob = await res.blob()

        return await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => resolve(reader.result.split(",")[1])
          reader.onerror = reject
        })
      }

      return ""
    } catch (err) {
      console.error("Base64 error:", err)
      return ""
    }
  }
  const handleFileChange = async (field, file) => {
    if (!file) return

    const base64 = await convertToBase64(file)

    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: base64, // ✅ base64 string
      },
    }))
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
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'white', border: 'none' }}
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
    if (!validateForm()) return

    const { startDay, endDay, startTime, endTime } = formData.availability

    const dayOrder = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]

    const startIndex = dayOrder.indexOf(startDay)
    const endIndex = dayOrder.indexOf(endDay)

    let selectedDays = []

    if (startIndex <= endIndex) {
      selectedDays = dayOrder.slice(startIndex, endIndex + 1)
    } else {
      // handle wrap (e.g. Fri → Mon)
      selectedDays = [
        ...dayOrder.slice(startIndex),
        ...dayOrder.slice(0, endIndex + 1),
      ]
    }

    const payload = {
      ...formData,
      availability: {
        days: selectedDays,
        startTime,
        endTime,
      },
    }

    onSave(payload)
  }
  return (
    <CModal visible={visible} onClose={onClose} size="lg" className='custom-modal' backdrop="static">
      <CModalHeader>
        <CModalTitle style={{ color: 'var(--color-blue)' }}>{isView ? 'View Therapist' : 'Add / Edit Therapist'}</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {isView ? (
          <div className="container my-4">

            {/* HEADER */}
            <div className="card p-4 mb-4 shadow-sm border-light">
              <div className="d-flex flex-column flex-md-row align-items-center">

                <div className="text-center me-md-4 mb-3 mb-md-0">
                  <img
                    src={
                      formData.documents?.profilePhoto
                        ? `data:image/jpeg;base64,${formData.documents.profilePhoto}`
                        : '/assets/images/default-avatar.png'
                    }
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
                    ID: {formData.therapistId || 'N/A'}
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
                  <b>Email</b><br />{formData.emailId}
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
                {formData.availability?.days?.length > 0
                  ? formData.availability.days
                    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                    .join(', ')
                  : 'N/A'}
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

              <p><b>License Certificate:</b></p>
              {formData.documents?.licenseCertificate ? (
                <iframe
                  src={`data:application/pdf;base64,${formData.documents.licenseCertificate}`}
                  width="100%"
                  height="300px"
                />
              ) : (
                <p>Not Provided</p>
              )}
              <p><b>Degree Certificate:</b></p>
              {formData.documents?.degreeCertificate ? (
                <iframe
                  src={`data:application/pdf;base64,${formData.documents.degreeCertificate}`}
                  width="100%"
                  height="300px"
                />
              ) : (
                <p>Not Provided</p>
              )}

            </div>

          </div>
        ) : (

          <CForm>

            {/* BASIC */}

            {/* <h5 className="mb-3">Basic Information</h5> */}
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
              <CCol md={4}>
                <CFormLabel>Full Name</CFormLabel>
                <CFormInput
                  value={formData.fullName}
                  disabled={isView}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  invalid={!!errors.fullName}
                />
                {errors.fullName && <div className="text-danger small">{errors.fullName}</div>}
              </CCol>

              <CCol md={4}>
                <CFormLabel>Contact Number</CFormLabel>
                <CFormInput
                  value={formData.contactNumber}
                  disabled={isView}
                  maxLength={10}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  invalid={!!errors.contactNumber}
                />
                {errors.contactNumber && (
                  <div className="text-danger small">{errors.contactNumber}</div>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel>Email </CFormLabel>
                <CFormInput
                  value={formData.emailId}
                  disabled={isView}
                  onChange={(e) => handleChange('emailId', e.target.value)}
                  invalid={!!errors.emailId}
                />
                {errors.emailId && (
                  <div className="text-danger small">{errors.emailId}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Gender</CFormLabel>
                <CFormSelect
                  value={formData.gender}
                  disabled={isView}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  invalid={!!errors.gender}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </CFormSelect>
                {errors.gender && <div className="text-danger small">{errors.gender}</div>}
              </CCol>

              <CCol md={4}>
                <CFormLabel>Date of Birth</CFormLabel>

                <CFormInput
                  type="date"
                  value={formData.dateOfBirth}
                  disabled={isView}
                  max={
                    new Date(
                      new Date().getFullYear() - 18,
                      new Date().getMonth(),
                      new Date().getDate()
                    )
                      .toISOString()
                      .split('T')[0]
                  }
                  min="1950-01-01"  // optional (to avoid very old dates)
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  invalid={!!errors.dateOfBirth}
                />

                {errors.dateOfBirth && (
                  <div className="text-danger small">{errors.dateOfBirth}</div>
                )}
              </CCol>

              <CCol md={4}>
                <CFormLabel>Qualification</CFormLabel>
                <CFormSelect
                  value={formData.qualification}
                  disabled={isView}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                  invalid={!!errors.qualification}
                >
                  <option value="">Select</option>
                  <option value="BPT">BPT</option>
                  <option value="MPT">MPT</option>
                </CFormSelect>
                {errors.qualification && <div className="text-danger small">{errors.qualification}</div>}
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
                  invalid={!!errors.yearsOfExperience}
                />
                {errors.yearsOfExperience && (
                  <div className="text-danger small">{errors.yearsOfExperience}</div>
                )}
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
                {errors.services && <div className="text-danger small">{errors.services}</div>}
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
                {errors.specializations && <div className="text-danger small">{errors.specializations}</div>}
              </CCol>
            </CRow>





            {/* AVAILABILITY */}
            {/* <h5 className="mt-4 mb-3">Availability</h5> */}

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
                {errors.startDay && <div className="text-danger small">{errors.startDay}</div>}
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
                {errors.endDay && <div className="text-danger small">{errors.endDay}</div>}
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
                {errors.startTime && <div className="text-danger small">{errors.startTime}</div>}
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
                {errors.endTime && <div className="text-danger small">{errors.endTime}</div>}
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
                {errors.bio && <div className="text-danger small">{errors.bio}</div>}
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
                {errors.treatmentTypes && <div className="text-danger small">{errors.treatmentTypes}</div>}
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
                {errors.expertiseAreas && <div className="text-danger small">{errors.expertiseAreas}</div>}
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
                {errors.languages && <div className="text-danger small">{errors.languages}</div>}
              </CCol>
            </CRow>

            {/* DOCUMENTS */}
            {/* <h5 className="mt-4 mb-3">Documents</h5> */}

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>License Certificate</CFormLabel>
                <CFormInput
                  type="file"
                  disabled={isView}
                  onChange={(e) =>
                    handleFileChange('licenseCertificate', e.target.files[0])
                  }
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>Degree Certificate</CFormLabel>
                <CFormInput
                  type="file"
                  disabled={isView}
                  onChange={(e) =>
                    handleFileChange('degreeCertificate', e.target.files[0])
                  }
                />
              </CCol>

              <CCol md={4}>
                <CFormLabel>Profile Photo</CFormLabel>
                <CFormInput
                  type="file"
                  disabled={isView}
                  onChange={(e) =>
                    handleFileChange('profilePhoto', e.target.files[0])
                  }
                />
              </CCol>
            </CRow>

          </CForm>
        )}
      </CModalBody>


      <CModalFooter>
        {isView ? (
          <CButton
            onClick={onClose}
            style={{
              backgroundColor: "var(--btn-secondary-bg)",
              color: "var(--btn-secondary-text)",
              border: "none",
              fontWeight: "600",
              padding: "6px 16px",
            }}
          >
            Close
          </CButton>
        ) : (
          <div className="d-flex gap-2">
            <CButton onClick={onClose} color="secondary">
              Cancel
            </CButton>

            <CButton
              onClick={handleSubmit}
              style={{
                backgroundColor: 'var(--color-bgcolor)',
                color: 'var(--color-black)',
              }}
            >
              Save
            </CButton>
          </div>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default PhysioForm