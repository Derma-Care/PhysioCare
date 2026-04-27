import React, { useEffect, useState } from 'react'
import DoctorCard from './Doctorcard'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import sendDermaCareOnboardingEmail from '../../Utils/Emailjs'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CCol,
  CFormLabel,
  CFormCheck,
} from '@coreui/react'
import Select from 'react-select'
import { getservice } from '../../baseUrl'
import {
  serviceDataH,
  CategoryData,
  subServiceData,
  getSubServiceById,
} from '../ProcedureManagement/ProcedureManagementAPI'
import LoadingIndicator from '../../Utils/loader'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserDoctor, faPlus } from '@fortawesome/free-solid-svg-icons'
import { http } from '../../Utils/Interceptors'
import { GetClinicBranches } from './DoctorAPI'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'
import { emailPattern } from '../../Constant/Constants'

/* ─── Brand token ─────────────────────────────── */
const B = {
  600: '#185fa5',
  800: '#0c447c',
  50: '#e6f1fb',
  100: '#b5d4f4',
  400: '#378add',
}

const DoctorManagement = () => {
  const {
    doctorData,
    errorMessage,
    setDoctorData,
    fetchDoctorDetails,
  } = useHospital()

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const [modalVisible, setModalVisible] = useState(false)
  const [monthlyLeaves, setMonthlyLeaves] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState('')

  const [newService, setNewService] = useState({ serviceName: '', serviceId: '' })
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedSubService, setSelectedSubService] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [serviceOptionsFormatted, setServiceOptionsFormatted] = useState([])
  const [category, setCategory] = useState([])
  const [branchOptions, setBranchOptions] = useState([])
  const [branchLoading, setBranchLoading] = useState(false)
  const [isSubServiceComplete, setIsSubServiceComplete] = useState(true)
  const [formErrors, setFormErrors] = useState({})
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [startDay, setStartDay] = useState('')
  const [endDay, setEndDay] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [enabledTypes, setEnabledTypes] = useState({
    inClinic: false, online: false, serviceTreatment: false,
  })

  const initialForm = {
    doctorPicture: null,
    doctorLicence: '',
    doctorMobileNumber: '',
    doctorEmail: '',
    doctorName: '',
    service: [],
    subServices: [],
    specialization: '',
    gender: '',
    experience: '',
    qualification: '',
    associationsOrMemberships: '',
    branch: [],
    availableDays: '',
    availableTimes: '',
    profileDescription: '',
    doctorSignature: null,
    doctorSignatureFileName: null,
    doctorFees: { inClinicFee: '', vedioConsultationFee: '' },
    focusAreas: [],
    languages: [],
    highlights: [],
    availableConsultations: [],
    consultation: { inClinic: 0, videoOrOnline: 0, serviceAndTreatments: 0 },
  }
  const [form, setForm] = useState(initialForm)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const times = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
    '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM',
  ]

  /* ─── helpers ──────────────────────────────────── */
  const clearFieldError = (field) =>
    setFormErrors((prev) => { const u = { ...prev }; delete u[field]; return u })

  const toggleType = (type) => {
    setEnabledTypes((prev) => {
      const updated = { ...prev, [type]: !prev[type] }
      const consultations = []
      if (updated.serviceTreatment) consultations.push('Services & Treatments')
      if (updated.inClinic) consultations.push('In-Clinic')
      if (updated.online) consultations.push('Video/Online')
      setForm((f) => ({ ...f, availableConsultations: consultations }))
      return updated
    })
  }

  const availableDays = (value, type) => {
    if (type === 'start') {
      setStartDay(value)
      setForm((f) => ({ ...f, availableDays: `${value} - ${endDay || ''}`.trim() }))
    } else {
      setEndDay(value)
      setForm((f) => ({ ...f, availableDays: `${startDay || ''} - ${value}`.trim() }))
    }
  }

  const handleTimeChange = (value, type) => {
    if (type === 'start') {
      setStartTime(value)
      setForm((f) => ({ ...f, availableTimes: `${value} - ${endTime || ''}`.trim() }))
    } else {
      setEndTime(value)
      setForm((f) => ({ ...f, availableTimes: `${startTime || ''} - ${value}`.trim() }))
    }
  }

  const fetchSubServices = async (serviceIds) => {
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) return
    try {
      const all = await Promise.all(serviceIds.map((id) => subServiceData(id)))
      const flat = all.flatMap((r) => (r.data || []).flatMap((b) => b.subServices || []))
      setSubServiceOptions(flat)
    } catch { setSubServiceOptions([]) }
  }

  const handleChanges = async (e) => {
    const { name, value } = e.target
    if (name === 'categoryId') {
      setNewService((p) => ({ ...p, categoryId: value, serviceId: [], serviceName: [] }))
      try {
        const all = await Promise.all(value.map((id) => http.get(`/${getservice}/${id}`)))
        const merged = all.flatMap((r) => r.data?.data || [])
        setServiceOptions(merged)
        setServiceOptionsFormatted(merged.map((s) => ({ label: s.serviceName, value: s.serviceId })))
      } catch {
        setServiceOptions([])
        setServiceOptionsFormatted([])
      }
    }
  }

  const fetchData = async () => {
    try {
      const catRes = await CategoryData()
      if (Array.isArray(catRes.data)) setCategory(catRes.data)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const fetchAll = async () => {
      const clinicId = localStorage.getItem('HospitalId')
      try {
        setLoading(true)
        await fetchData()
        setBranchLoading(true)
        const res = await GetClinicBranches(clinicId)
        const branches = res.data || []
        setBranchOptions(branches.map((b) => ({ value: b.branchId || b.id || b.name, label: b.branchName || b.name })))
      } catch { setShowErrorMessage('Failed to fetch data') }
      finally { setLoading(false); setBranchLoading(false) }
    }
    fetchAll()
  }, [])

  const categoryOptions = category.map((c) => ({ value: c.categoryId, label: c.categoryName }))

  const checkSubServiceDetails = async (ids) => {
    const hospitalId = localStorage.getItem('HospitalId')
    for (const id of ids) {
      const data = await getSubServiceById(hospitalId, id)
      if (!data || !data.price || !data.finalCost) { setIsSubServiceComplete(false); return }
    }
    setIsSubServiceComplete(true)
  }

  /* ─── Validation ────────────────────────────────── */
  const validateDoctorForm = () => {
    const errs = {}
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const cvt = (t) => {
      const [raw, mod] = t.split(' ')
      let [h, m] = raw.split(':').map(Number)
      if (mod === 'PM' && h !== 12) h += 12
      if (mod === 'AM' && h === 12) h = 0
      return h * 60 + m
    }

    if (!newService.categoryId?.length) errs.categoryId = 'Select at least one category'
    if (!selectedServices.length) errs.serviceId = 'Select at least one service'
    if (!selectedSubService.length) errs.subServiceName = 'Select at least one procedure'
    if (!form.doctorName.trim()) errs.doctorName = 'Doctor name is required'
    if (!form.doctorLicence.trim()) errs.doctorLicence = 'License number is required'
    if (!/^[6789]\d{9}$/.test(form.doctorMobileNumber)) errs.doctorMobileNumber = 'Enter valid 10-digit number starting with 6-9'
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(form.doctorEmail)) errs.doctorEmail = 'Enter a valid email'
    if (!form.experience || isNaN(form.experience) || form.experience < 0) errs.experience = 'Enter valid experience'
    if (!form.qualification.trim()) errs.qualification = 'Qualification is required'
    if (!form.specialization.trim()) errs.specialization = 'Specialization is required'
    if (!form.profileDescription.trim()) errs.profileDescription = 'Profile description is required'
    if (enabledTypes.inClinic && (!form.doctorFees.inClinicFee || Number(form.doctorFees.inClinicFee) <= 0)) errs.inClinicFee = 'Enter valid in-clinic fee'
    if (enabledTypes.online && (!form.doctorFees.vedioConsultationFee || Number(form.doctorFees.vedioConsultationFee) <= 0)) errs.vedioConsultationFee = 'Enter valid video fee'
    if (!form.doctorPicture) errs.doctorPicture = 'Profile picture is required'
    if (!form.doctorSignature) errs.doctorSignature = 'Doctor signature is required'
    if (!startDay) errs.startDay = 'Start day required'
    if (!endDay) errs.endDay = 'End day required'
    if (startDay && endDay && dayOrder.indexOf(startDay) > dayOrder.indexOf(endDay)) errs.endDay = 'End day cannot be before start day'
    if (!startTime || !endTime) errs.availableTimes = 'Start and end times required'
    else if (cvt(startTime) >= cvt(endTime)) errs.availableTimes = 'Start time must be before end time'
    if (!form.gender) errs.gender = 'Please select gender'
    if (!form.branch?.length) errs.branch = 'Select at least one branch'

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ─── Submit ─────────────────────────────────────── */
  const handleSubmit = async () => {
    const isDuplicate = doctorData?.data?.some((d) => d.doctorLicence === form.doctorLicence.trim())
    if (isDuplicate) { setFormErrors((p) => ({ ...p, doctorLicence: 'License number already exists' })); return }
    if (isSaving) return
    setIsSaving(true)
    if (!validateDoctorForm()) { setIsSaving(false); return }

    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const hospitalName = localStorage.getItem('HospitalName')
      const validIds = subServiceOptions.map((s) => s.subServiceId)
      const selectedSubServiceObjects = subServiceOptions
        .filter((s) => selectedSubService.includes(s.subServiceId) && validIds.includes(s.subServiceId))
        .map((s) => ({ subServiceId: s.subServiceId, subServiceName: s.subServiceName }))

      const mobileExists = doctorData.data?.some((d) => d.doctorMobileNumber === form.doctorMobileNumber)
      const emailExists = doctorData.data?.some((d) => d.doctorEmail === form.doctorEmail)
      if (mobileExists) { showCustomToast('Mobile number already exists', 'error'); setIsSaving(false); return }
      if (emailExists) { showCustomToast('Email already exists', 'error'); setIsSaving(false); return }

      setSaveLoading(true)
      const payload = {
        branchId: localStorage.getItem('branchId'),
        createdBy: localStorage.getItem('staffId') || 'admin',
        hospitalId,
        doctorPicture: form.doctorPicture,
        doctorSignature: form.doctorSignature,
        doctorName: form.doctorName,
        doctorMobileNumber: form.doctorMobileNumber,
        doctorEmail: form.doctorEmail,
        doctorLicence: form.doctorLicence,
        category: categoryOptions.filter((c) => newService.categoryId.includes(c.value)).map((c) => ({ categoryId: c.value, categoryName: c.label })),
        service: selectedServices.map((s) => ({ serviceId: s.serviceId, serviceName: s.serviceName })),
        subServices: selectedSubServiceObjects,
        gender: form.gender,
        experience: form.experience,
        qualification: form.qualification,
        associationsOrMemberships: form.associationsOrMemberships,
        branches: form.branch,
        specialization: form.specialization,
        availableDays: form.availableDays,
        availableTimes: form.availableTimes,
        profileDescription: form.profileDescription,
        focusAreas: form.focusAreas,
        languages: form.languages,
        highlights: form.highlights,
        doctorFees: { inClinicFee: form.doctorFees.inClinicFee, vedioConsultationFee: form.doctorFees.vedioConsultationFee },
        consultation: {
          serviceAndTreatments: form.availableConsultations.includes('Services & Treatments') ? 3 : 0,
          inClinic: form.availableConsultations.includes('In-Clinic') ? 1 : 0,
          videoOrOnline: form.availableConsultations.includes('Video/Online') ? 2 : 0,
        },
      }

      const response = await http.post(`/addDoctor`, payload, { headers: { 'Content-Type': 'application/json' } })

      if (response.data?.status === 201) {
        const newDoctor = response.data.data?.doctor ?? payload
        setDoctorData((prev) => ({ ...prev, data: [...(prev?.data || []), newDoctor] }))
        await sendDermaCareOnboardingEmail({
          name: form.doctorName, email: form.doctorEmail,
          password: response.data.data?.temporaryPassword,
          userID: response.data.data?.username, clinicName: hospitalName,
        })
        showCustomToast(response.data.message || 'Doctor added successfully', 'success')
        resetForm()
        setModalVisible(false)
      } else throw new Error(response.data?.message || 'Failed to add doctor')
    } catch (error) {
      showCustomToast(error?.response?.data?.message || 'Something went wrong', 'error')
    } finally { setIsSaving(false); setSaveLoading(false) }
  }

  const resetForm = () => {
    setForm(initialForm)
    setSelectedServices([])
    setSelectedSubService([])
    setSubServiceOptions([])
    setServiceOptionsFormatted([])
    setFormErrors({})
    setNewService({ categoryId: [], serviceId: [], serviceName: [], subServiceId: [] })
    setStartDay(''); setEndDay(''); setStartTime(''); setEndTime('')
    setEnabledTypes({ inClinic: false, online: false, serviceTreatment: false })
    setIsSubServiceComplete(true)
    setMonthlyLeaves('')
  }

  /* ─── Chip input ────────────────────────────────── */
  const ChipSection = ({ label, items, onAdd, onlyAlpha = false }) => {
    const [input, setInput] = useState('')
    const handleAdd = () => {
      const t = input.trim()
      if (!t) return
      if (onlyAlpha && !/^[A-Za-z\s]+$/.test(t)) {
        showCustomToast(`Only alphabets allowed in ${label}`, 'error'); return
      }
      if (!items.includes(t)) onAdd([...items, t])
      setInput('')
    }
    return (
      <div className="chip-section">
        <label className="dm-label">{label}</label>
        <div className="chip-input-row">
          <CFormInput
            className="dm-chip-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={`Add ${label}`}
          />
          <button className="dm-add-chip-btn" type="button" onClick={handleAdd}>Add</button>
        </div>
        <div className="chip-list">
          {items.map((item, i) => (
            <div key={i} className="chip">
              {item}
              <span className="chip-remove" onClick={() => onAdd(items.filter((_, idx) => idx !== i))}>×</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ─── Global search filter ─────────────────────── */
  const { searchQuery } = useGlobalSearch()
  const normalize = (s) => s?.toString().toLowerCase() || ''
  const filteredDoctors = (Array.isArray(doctorData?.data) ? doctorData.data : []).filter((d) => {
    if (!searchQuery.trim()) return true
    return (
      normalize(d.doctorName).includes(normalize(searchQuery)) ||
      normalize(d.qualification).includes(normalize(searchQuery)) ||
      normalize(d.doctorId).includes(normalize(searchQuery)) ||
      normalize(d.specialization).includes(normalize(searchQuery)) ||
      normalize(d.doctorMobileNumber).includes(normalize(searchQuery))
    )
  })
  const totalDoctors = filteredDoctors.length
  const totalPages = Math.ceil(totalDoctors / pageSize)
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  /* ─── Section header component ─────────────────── */
  const SectionHeading = ({ text }) => (
    <div className="dm-section-heading">
      <span className="dm-section-bar" />
      <h5 className="dm-section-title">{text}</h5>
    </div>
  )

  /* ─── Error helper ──────────────────────────────── */
  const Err = ({ field }) =>
    formErrors[field] ? <div className="dm-error">{formErrors[field]}</div> : null

  return (
    <div className="dm-wrapper">
      <ToastContainer />

      {/* Add Doctor button */}
      {can('Doctors', 'create') && (
        <div className="dm-top-bar">
          <button className="dm-add-btn" onClick={() => { setFormErrors({}); setModalVisible(true) }}>
            <FontAwesomeIcon icon={faUserDoctor} />
            <span>Add Doctor</span>
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="dm-center"><LoadingIndicator message="Loading doctors..." /></div>
      ) : errorMessage ? (
        <div className="dm-center"><p>{errorMessage}</p></div>
      ) : !doctorData?.data ? null
        : doctorData.data.length === 0 ? (
          <div className="dm-center">
            <div className="dm-empty-state">
              <FontAwesomeIcon icon={faUserDoctor} className="dm-empty-icon" />
              <p>No doctors found.</p>
              {can('Doctors', 'create') && (
                <button className="dm-add-btn" onClick={() => { setFormErrors({}); setModalVisible(true) }}>
                  <FontAwesomeIcon icon={faPlus} /> Add First Doctor
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {filteredDoctors.length > 0 ? (
              paginatedDoctors.map((doctor, i) => <DoctorCard key={i} doctor={doctor} />)
            ) : (
              <div className="dm-center"><p>No doctors match your search.</p></div>
            )}
            {totalDoctors > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </div>
        )}

      {/* ─── Modal ──────────────────────────────── */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" backdrop="static">
        <CModalHeader className="dm-modal-header">
          <div className="dm-modal-title-row">
            <div className="dm-modal-icon">
              <FontAwesomeIcon icon={faUserDoctor} />
            </div>
            <strong>Add New Doctor</strong>
          </div>
        </CModalHeader>

        <CModalBody className="dm-modal-body">

          {/* Section 1: Category / Service */}
          <SectionHeading text="Category & Service" />
          <CRow className="g-3 mb-2">
            <CCol md={6}>
              <label className="dm-label">Category Name <span className="req">*</span></label>
              <Select
                isMulti
                options={categoryOptions}
                value={categoryOptions.filter((o) => newService.categoryId?.includes(o.value))}
                onChange={(sel) => {
                  handleChanges({ target: { name: 'categoryId', value: sel.map((o) => o.value) } })
                  if (sel.length) clearFieldError('categoryId')
                }}
                placeholder="Select category"
                classNamePrefix="dm-select"
              />
              <Err field="categoryId" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Service Name <span className="req">*</span></label>
              <Select
                isMulti
                options={serviceOptionsFormatted}
                value={serviceOptionsFormatted.filter((o) => selectedServices.some((s) => s.serviceId === o.value))}
                onChange={(sel) => {
                  const objs = serviceOptions.filter((s) => sel.some((x) => x.value === s.serviceId))
                  setSelectedServices(objs)
                  fetchSubServices(objs.map((s) => s.serviceId))
                  if (objs.length) clearFieldError('serviceId')
                }}
                placeholder="Select service"
                classNamePrefix="dm-select"
              />
              <Err field="serviceId" />
            </CCol>
            <CCol md={12}>
              <label className="dm-label">Procedure Name <span className="req">*</span></label>
              <Select
                isMulti
                options={subServiceOptions.map((s) => ({ label: s.subServiceName, value: s.subServiceId }))}
                value={subServiceOptions.filter((o) => selectedSubService.includes(o.subServiceId)).map((o) => ({ label: o.subServiceName, value: o.subServiceId }))}
                onChange={(sel) => {
                  const ids = sel.map((o) => o.value)
                  setSelectedSubService(ids)
                  checkSubServiceDetails(ids)
                  if (ids.length) clearFieldError('subServiceName')
                }}
                placeholder="Select procedures"
                classNamePrefix="dm-select"
              />
              <Err field="subServiceName" />
            </CCol>
          </CRow>

          <div className="dm-divider" />

          {/* Section 2: Doctor Details */}
          <SectionHeading text="Doctor Details" />
          <CRow className="g-3 mb-2">
            <CCol md={6}>
              <label className="dm-label">Doctor Name <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                value={form.doctorName}
                onChange={(e) => {
                  let v = e.target.value.replace(/[0-9]/g, '')
                  const w = v.startsWith('Dr.') ? v : `Dr. ${v}`
                  setForm((p) => ({ ...p, doctorName: w }))
                  if (w.length > 3) clearFieldError('doctorName')
                }}
                invalid={!!formErrors.doctorName}
                placeholder="Dr. Full Name"
              />
              <Err field="doctorName" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">License Number <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                value={form.doctorLicence}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^A-Za-z0-9\s/.-]/g, '')
                  setForm((p) => ({ ...p, doctorLicence: v }))
                  const isDup = doctorData?.data?.some((d) => d.doctorLicence === v.trim())
                  setFormErrors((p) => ({ ...p, doctorLicence: isDup ? 'License already exists' : '' }))
                }}
                invalid={!!formErrors.doctorLicence}
                placeholder="License number"
              />
              <Err field="doctorLicence" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Gender <span className="req">*</span></label>
              <CFormSelect
                className={`dm-select-native ${formErrors.gender ? 'is-invalid' : ''}`}
                value={form.gender}
                onChange={(e) => {
                  setForm((p) => ({ ...p, gender: e.target.value }))
                  clearFieldError('gender')
                }}
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </CFormSelect>
              <Err field="gender" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Experience (years) <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                type="number"
                value={form.experience}
                onChange={(e) => {
                  if (/^\d{0,2}$/.test(e.target.value)) {
                    setForm((p) => ({ ...p, experience: e.target.value }))
                    clearFieldError('experience')
                  }
                }}
                invalid={!!formErrors.experience}
                placeholder="Years"
              />
              <Err field="experience" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Qualification <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                value={form.qualification}
                onChange={(e) => {
                  const v = e.target.value.replace(/[0-9]/g, '')
                  setForm((p) => ({ ...p, qualification: v }))
                  if (v.trim().length >= 2) clearFieldError('qualification')
                }}
                invalid={!!formErrors.qualification}
                placeholder="e.g. MBBS, MD"
              />
              <Err field="qualification" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Specialization <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                value={form.specialization}
                onChange={(e) => {
                  const v = e.target.value.replace(/[0-9]/g, '')
                  setForm((p) => ({ ...p, specialization: v }))
                  if (v.trim().length >= 2) clearFieldError('specialization')
                }}
                invalid={!!formErrors.specialization}
                placeholder="e.g. Cardiology"
              />
              <Err field="specialization" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Monthly Paid Leaves</label>
              <CFormInput
                className="dm-input"
                type="number"
                value={monthlyLeaves}
                onChange={(e) => setMonthlyLeaves(e.target.value)}
                min={0}
                placeholder="0"
              />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">
                Profile Picture <span className="req">*</span>
              </label>
              <div className="dm-upload-box">
                <CFormInput
                  type="file"
                  accept="image/jpeg, image/png"
                  className="dm-file-input"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    if (!['image/jpeg', 'image/png'].includes(file.type)) {
                      setFormErrors((p) => ({ ...p, doctorPicture: 'Only JPG/PNG allowed' }))
                      return
                    }
                    if (file.size > 2 * 1024 * 1024) {
                      setFormErrors((p) => ({ ...p, doctorPicture: 'Max 2 MB' }))
                      return
                    }
                    const r = new FileReader()
                    r.onloadend = () => {
                      setForm((p) => ({ ...p, doctorPicture: r.result }))
                      clearFieldError('doctorPicture')
                    }
                    r.readAsDataURL(file)
                  }}
                />
                {form.doctorPicture && (
                  <div className="dm-image-preview">
                    <img src={form.doctorPicture} alt="Preview" />
                  </div>
                )}
              </div>
              <Err field="doctorPicture" />
            </CCol>
            <CCol md={12}>
              <label className="dm-label">Profile Description <span className="req">*</span></label>
              <CFormTextarea
                className="dm-textarea"
                rows={3}
                value={form.profileDescription}
                onChange={(e) => {
                  const v = e.target.value.replace(/[0-9]/g, '')
                  setForm((p) => ({ ...p, profileDescription: v }))
                  if (v.trim().length >= 10) clearFieldError('profileDescription')
                }}
                invalid={!!formErrors.profileDescription}
                placeholder="Brief professional summary..."
              />
              <Err field="profileDescription" />
            </CCol>
          </CRow>

          <div className="dm-divider" />

          {/* Section 3: Working Schedule */}
          <SectionHeading text="Working Schedule" />
          <CRow className="g-3 mb-2">
            {[['startDay', 'Start Day', 'start'], ['endDay', 'End Day', 'end']].map(([field, lbl, type]) => (
              <CCol md={6} key={field}>
                <label className="dm-label">{lbl} <span className="req">*</span></label>
                <CFormSelect
                  className="dm-select-native"
                  value={field === 'startDay' ? startDay : endDay}
                  onChange={(e) => {
                    availableDays(e.target.value, type)
                    clearFieldError(field)
                  }}
                >
                  <option value="">Select day</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </CFormSelect>
                <Err field={field} />
              </CCol>
            ))}
            {[['startTime', 'Start Time', 'start'], ['endTime', 'End Time', 'end']].map(([field, lbl, type]) => (
              <CCol md={6} key={field}>
                <label className="dm-label">{lbl} <span className="req">*</span></label>
                <CFormSelect
                  className="dm-select-native"
                  value={field === 'startTime' ? startTime : endTime}
                  onChange={(e) => {
                    handleTimeChange(e.target.value, type)
                    clearFieldError('availableTimes')
                  }}
                >
                  <option value="">Select time</option>
                  {times.map((t) => <option key={t} value={t}>{t}</option>)}
                </CFormSelect>
              </CCol>
            ))}
            {formErrors.availableTimes && (
              <CCol md={12}><div className="dm-error">{formErrors.availableTimes}</div></CCol>
            )}
          </CRow>

          <div className="dm-divider" />

          {/* Section 4: Consultation & Contact */}
          <SectionHeading text="Consultations & Contact" />
          <div className="dm-consult-types">
            <strong className="dm-label">Consultation Type</strong>
            <div className="dm-check-row">
              {[
                ['serviceTreatment', 'Services & Treatments'],
                ['inClinic', 'In-Clinic Consultation'],
                ['online', 'Online Consultation'],
              ].map(([key, lbl]) => (
                <label key={key} className="dm-check-label">
                  <input type="checkbox" checked={enabledTypes[key]} onChange={() => toggleType(key)} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>
          <CRow className="g-3 mb-2">
            {enabledTypes.inClinic && (
              <CCol md={6}>
                <label className="dm-label">In-Clinic Fee (₹) <span className="req">*</span></label>
                <CFormInput
                  className="dm-input"
                  type="number"
                  value={form.doctorFees.inClinicFee}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, doctorFees: { ...p.doctorFees, inClinicFee: e.target.value } }))
                    if (Number(e.target.value) > 0) clearFieldError('inClinicFee')
                  }}
                  placeholder="Amount in ₹"
                />
                <Err field="inClinicFee" />
              </CCol>
            )}
            {enabledTypes.online && (
              <CCol md={6}>
                <label className="dm-label">Online Fee (₹) <span className="req">*</span></label>
                <CFormInput
                  className="dm-input"
                  type="number"
                  value={form.doctorFees.vedioConsultationFee}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, doctorFees: { ...p.doctorFees, vedioConsultationFee: e.target.value } }))
                    if (Number(e.target.value) > 0) clearFieldError('vedioConsultationFee')
                  }}
                  placeholder="Amount in ₹"
                />
                <Err field="vedioConsultationFee" />
              </CCol>
            )}
            <CCol md={6}>
              <label className="dm-label">Contact Number <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                type="tel"
                maxLength={10}
                value={form.doctorMobileNumber}
                onChange={(e) => {
                  if (/^\d{0,10}$/.test(e.target.value)) {
                    setForm((p) => ({ ...p, doctorMobileNumber: e.target.value }))
                    if (e.target.value.length === 10) clearFieldError('doctorMobileNumber')
                  }
                }}
                invalid={!!formErrors.doctorMobileNumber}
                placeholder="10-digit mobile"
              />
              <Err field="doctorMobileNumber" />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Email Address <span className="req">*</span></label>
              <CFormInput
                className="dm-input"
                type="email"
                value={form.doctorEmail}
                onChange={(e) => {
                  setForm((p) => ({ ...p, doctorEmail: e.target.value }))
                  if (emailPattern.test(e.target.value.trim())) clearFieldError('doctorEmail')
                }}
                invalid={!!formErrors.doctorEmail}
                placeholder="doctor@email.com"
              />
              <Err field="doctorEmail" />
            </CCol>
          </CRow>

          <div className="dm-divider" />

          {/* Section 5: Additional Details */}
          <SectionHeading text="Additional Details" />
          <CRow className="g-3 mb-2">
            <CCol md={6}>
              <label className="dm-label">Association / Membership</label>
              <CFormInput
                className="dm-input"
                value={form.associationsOrMemberships}
                onChange={(e) => setForm((p) => ({ ...p, associationsOrMemberships: e.target.value.replace(/[0-9]/g, '') }))}
                placeholder="e.g. IMA Member"
              />
            </CCol>
            <CCol md={6}>
              <label className="dm-label">Branch <span className="req">*</span></label>
              <Select
                isMulti
                options={branchOptions}
                value={branchOptions.filter((o) => Array.isArray(form.branch) && form.branch.some((b) => b.branchId === o.value))}
                onChange={(sel) => {
                  setForm((p) => ({ ...p, branch: sel.map((o) => ({ branchId: o.value, branchName: o.label })) }))
                  if (sel.length) clearFieldError('branch')
                }}
                placeholder="Select branches"
                classNamePrefix="dm-select"
              />
              <Err field="branch" />
            </CCol>
          </CRow>

          <div style={{ marginTop: 12 }}>
            <ChipSection label="Area of Expertise" items={form.focusAreas}
              onAdd={(items) => { const v = items.filter((i) => !/^\d+$/.test(i.trim())); setForm((p) => ({ ...p, focusAreas: v })) }} />
            <ChipSection label="Languages Known" items={form.languages} onlyAlpha
              onAdd={(items) => { const v = items.filter((i) => /^[A-Za-z\s]+$/.test(i.trim())); setForm((p) => ({ ...p, languages: v })) }} />
            <ChipSection label="Achievements / Awards" items={form.highlights}
              onAdd={(items) => { const v = items.filter((i) => !/^\d+$/.test(i.trim())); setForm((p) => ({ ...p, highlights: v })) }} />
          </div>

          {/* Signature */}
          <div className="dm-signature-row">
            <div style={{ flex: 1 }}>
              <label className="dm-label">
                Doctor Signature (for E-Prescription) <span className="req">*</span>
              </label>
              <div className="dm-file-input-row">
                <CButton color="secondary" size="sm"
                  onClick={() => document.getElementById('sig-file-input').click()}>
                  Choose File
                </CButton>
                <span className="dm-filename">{form.doctorSignatureFileName || 'No file selected'}</span>
              </div>
              <input
                id="sig-file-input"
                type="file"
                accept="image/jpeg, image/png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  if (!['image/jpeg', 'image/png'].includes(file.type)) { setFormErrors((p) => ({ ...p, doctorSignature: 'Only JPG/PNG allowed' })); return }
                  if (file.size > 250 * 1024) { setFormErrors((p) => ({ ...p, doctorSignature: 'Max 250 KB' })); return }
                  const r = new FileReader()
                  r.onloadend = () => {
                    setForm((p) => ({ ...p, doctorSignature: r.result, doctorSignatureFileName: file.name }))
                    clearFieldError('doctorSignature')
                  }
                  r.readAsDataURL(file)
                }}
              />
              <Err field="doctorSignature" />
            </div>
            <div className="dm-sig-preview">
              {form.doctorSignature
                ? <img src={form.doctorSignature} alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span className="dm-sig-placeholder">No signature</span>}
            </div>
          </div>

        </CModalBody>

        <CModalFooter className="dm-modal-footer">
          <button className="dm-btn-secondary" onClick={resetForm}>Reset</button>
          <button className="dm-btn-secondary" onClick={() => { resetForm(); setModalVisible(false) }}>Cancel</button>
          <button className="dm-btn-primary" onClick={handleSubmit} disabled={isSaving || saveloading}>
            {(isSaving || saveloading)
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              : 'Save Doctor'}
          </button>
        </CModalFooter>
      </CModal>

      {/* ─── Styles ─────────────────────────────── */}
      <style>{`
        .dm-wrapper { padding: 4px 0; }

        /* Top bar */
        .dm-top-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
        .dm-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #185fa5;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(24,95,165,0.20);
        }
        .dm-add-btn span,
        .dm-add-btn svg { color: #ffffff; }
        .dm-add-btn:hover { background: #0c447c; }
        .dm-add-btn:active { transform: scale(0.98); }

        /* Empty state */
        .dm-center { display: flex; justify-content: center; align-items: center; min-height: 40vh; }
        .dm-empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #5f6e80; }
        .dm-empty-icon { font-size: 48px; color: #b5d4f4; }

        /* Modal */
        .dm-modal-header {
          background: #185fa5;
          border-bottom: none;
          padding: 14px 20px;
        }
        .dm-modal-title-row {
          display: flex; align-items: center; gap: 10px; color: #fff;
        }
        .dm-modal-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: #fff;
        }
        .dm-modal-header strong { font-size: 16px; color: #fff; }
        .dm-modal-body { padding: 20px 24px; background: #f7fafd; }
        .dm-modal-footer {
          background: #fff; border-top: 0.5px solid #d0dce9;
          padding: 12px 20px; display: flex; gap: 8px; justify-content: flex-end;
        }

        /* Section heading */
        .dm-section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; margin-top: 4px; }
        .dm-section-bar { width: 3px; height: 20px; background: #185fa5; border-radius: 2px; flex-shrink: 0; }
        .dm-section-title { font-size: 14px; font-weight: 600; color: #0c447c; margin: 0; }
        .dm-divider { border: none; border-top: 0.5px solid #d0dce9; margin: 18px 0 16px; }

        /* Labels */
        .dm-label { font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 4px; }
        .req { color: #e24b4a; margin-left: 2px; }
        .dm-error { font-size: 12px; color: #a32d2d; margin-top: 3px; }

        /* ── ALL text inputs: unified 13px ───────────── */
        .dm-input,
        .dm-modal-body input[type="text"],
        .dm-modal-body input[type="number"],
        .dm-modal-body input[type="email"],
        .dm-modal-body input[type="tel"],
        .dm-modal-body input[type="file"] {
          font-size: 13px !important;
          color: #374151 !important;
        }
        .dm-input::placeholder,
        .dm-modal-body input::placeholder {
          font-size: 12px !important;
          color: #9ca3af !important;
        }

        /* Native selects (CFormSelect) */
        .dm-select-native,
        .dm-modal-body select {
          font-size: 13px !important;
          color: #374151 !important;
          border: 1px solid #ced4da;
          border-radius: 6px;
          min-height: 36px;
          padding: 4px 10px;
        }
        .dm-select-native option {
          color: #374151 !important;
          font-size: 13px !important;
        }

        /* Textarea */
        .dm-textarea {
          font-size: 13px !important;
          color: #374151 !important;
        }
        .dm-textarea::placeholder {
          font-size: 12px !important;
          color: #9ca3af !important;
        }

        /* Buttons */
        .dm-btn-primary {
          background: #185fa5; color: #fff; border: none;
          padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          display: inline-flex; align-items: center;
        }
        .dm-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .dm-btn-primary:active:not(:disabled)  { transform: scale(0.98); }
        .dm-btn-primary:disabled               { opacity: 0.6; cursor: not-allowed; }
        .dm-btn-secondary {
          background: #fff; color: #374151;
          border: 0.5px solid #d0dce9; border-radius: 8px;
          padding: 8px 16px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .dm-btn-secondary:hover { background: #f0f5fb; }

        /* Consultation checkboxes */
        .dm-consult-types { margin-bottom: 14px; }
        .dm-check-row { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 8px; }
        .dm-check-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #374151; cursor: pointer;
        }
        .dm-check-label input[type="checkbox"] { accent-color: #185fa5; width: 15px; height: 15px; }

        /* Chip section */
        .chip-section { margin-bottom: 14px; }
        .chip-input-row { display: flex; gap: 8px; margin-top: 4px; margin-bottom: 8px; }
        .dm-add-chip-btn {
          background: #185fa5; color: #fff; border: none;
          padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
        }
        .dm-add-chip-btn:hover { background: #0c447c; }
        .chip-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #e6f1fb; color: #0c447c;
          border: 0.5px solid #b5d4f4; border-radius: 20px;
          padding: 3px 10px; font-size: 12px; font-weight: 500;
        }
        .chip-remove {
          cursor: pointer; font-size: 14px; line-height: 1;
          color: #185fa5; font-weight: 700;
        }
        .chip-remove:hover { color: #a32d2d; }

        /* Chip input */
        .dm-chip-input { font-size: 13px !important; color: #374151 !important; }
        .dm-chip-input::placeholder { font-size: 12px !important; color: #9ca3af !important; }

        /* Signature */
        .dm-signature-row { display: flex; gap: 16px; align-items: flex-start; margin-top: 14px; }
        .dm-file-input-row {
          display: flex; align-items: center; gap: 10px;
          border: 0.5px solid #d0dce9; border-radius: 6px;
          padding: 5px 10px; background: #fff; margin-top: 4px;
        }
        .dm-filename { font-size: 12px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dm-sig-preview {
          width: 140px; height: 80px; flex-shrink: 0;
          border: 0.5px dashed #b5d4f4; border-radius: 6px;
          background: #f7fafd; display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .dm-sig-placeholder { font-size: 11px; color: #b5d4f4; }

        /* File upload box */
        .dm-upload-box { display: flex; flex-direction: column; gap: 10px; }
        .dm-file-input { padding: 6px; font-size: 13px !important; }
        .dm-image-preview img {
          width: 80px; height: 80px; object-fit: cover;
          border-radius: 50%; border: 2px solid #e5e7eb;
        }

        /* ══════════════════════════════════════════════
           REACT-SELECT OVERRIDES — ALL FIXED
        ══════════════════════════════════════════════ */

        /* Control box */
        .dm-select__control {
          border: 1px solid #ced4da !important;
          border-radius: 6px !important;
          min-height: 36px !important;
          font-size: 13px !important;
          background: #fff !important;
        }
        .dm-select__control--is-focused {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }

        /* Placeholder */
        .dm-select__placeholder {
          font-size: 12px !important;
          color: #9ca3af !important;
        }

        /* Typed input text */
        .dm-select__input-container,
        .dm-select__input {
          font-size: 13px !important;
          color: #374151 !important;
        }

        /* Single value */
        .dm-select__single-value {
          font-size: 13px !important;
          color: #374151 !important;
        }

        /* Multi-value tags */
        .dm-select__multi-value {
          background: #e6f1fb !important;
          border-radius: 4px !important;
        }
        .dm-select__multi-value__label {
          color: #0c447c !important;
          font-size: 12px !important;
        }
        .dm-select__multi-value__remove:hover {
          background: #b5d4f4 !important;
          color: #0c447c !important;
        }

        /* Dropdown menu */
        .dm-select__menu {
          border: 1px solid #d0dce9 !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 16px rgba(24,95,165,0.12) !important;
          z-index: 9999 !important;
        }
        .dm-select__menu-list {
          padding: 4px !important;
        }

        /* Dropdown options — THE KEY FIX */
        .dm-select__option {
          font-size: 13px !important;
          color: #374151 !important;          /* dark readable text — was invisible */
          background: transparent !important;
          border-radius: 4px !important;
          padding: 7px 10px !important;
          cursor: pointer !important;
        }
        .dm-select__option--is-focused {
          background: #e6f1fb !important;     /* light blue hover */
          color: #0c447c !important;           /* dark blue on hover */
        }
        .dm-select__option--is-selected {
          background: #185fa5 !important;     /* brand blue when selected */
          color: #ffffff !important;           /* white text when selected */
        }
        .dm-select__option--is-selected.dm-select__option--is-focused {
          background: #0c447c !important;     /* darker on selected+hover */
          color: #ffffff !important;
        }

        /* No-options message */
        .dm-select__no-options-message,
        .dm-select__no-options {
          font-size: 13px !important;
          color: #9ca3af !important;
        }

        /* Indicator icons */
        .dm-select__indicator-separator { background: #d0dce9 !important; }
        .dm-select__dropdown-indicator { color: #6b7280 !important; }
        .dm-select__dropdown-indicator:hover { color: #185fa5 !important; }
        .dm-select__clear-indicator { color: #6b7280 !important; }
        .dm-select__clear-indicator:hover { color: #a32d2d !important; }
      `}</style>
    </div>
  )
}

export default DoctorManagement