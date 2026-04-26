import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { Modal, Button } from 'react-bootstrap'
import './Doctor.css'
import Select from 'react-select'
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormCheck,
  CInputGroup,
  CListGroup,
  CListGroupItem,
  CRow,
  CCol,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
  CImage,
} from '@coreui/react'
import { format, addDays, startOfToday } from 'date-fns'
import { FaTrash } from 'react-icons/fa'
import { BASE_URL } from '../../baseUrl'
import capitalizeWords from '../../Utils/capitalizeWords'
import { useNavigate } from 'react-router-dom'
import { useHospital } from '../Usecontext/HospitalContext'
import { GetClinicBranches, handleDeleteToggle } from '../Doctors/DoctorAPI'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCustomerByMobile } from '../customerManagement/CustomerManagementAPI'
import { ToastContainer } from 'react-toastify'
import { COLORS, FONT_SIZES } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'
import ConfirmationModal from '../../components/ConfirmationModal'
import { http } from '../../Utils/Interceptors'
import {
  CategoryData,
  getSubServiceById,
  serviceData,
  serviceDataH,
  subServiceData,
} from '../ProcedureManagement/ProcedureManagementAPI'
import { fetchDoctorSlots } from '../../APIs/GenerateSlots'
import { showCustomToast } from '../../Utils/Toaster'

/* ─── Design Tokens (all hard-coded — no CSS variable for text) ─── */
const t = {
  primary: 'var(--color-bgcolor)',
  white: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  surface: '#f8fafc',
  border: '#e2e8f0',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  radius: '10px',
  radiusSm: '6px',
  shadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
}

/* ─── Reusable mini-components ──────────────────────────────────── */

/** Uniform section heading with coloured icon square */
const SectionHeading = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
    <span style={{
      width: '4px', height: '20px', borderRadius: '2px',
      backgroundColor: 'var(--color-bgcolor)', display: 'inline-block', flexShrink: 0,
    }} />
    <h6 style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: t.text, letterSpacing: '0.02em' }}>
      {title}
    </h6>
  </div>
)

/** Label + value pair for view mode */
const InfoRow = ({ label, value }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ fontSize: '11px', color: t.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
      {label}
    </div>
    <div style={{ fontSize: '13px', color: t.text, fontWeight: '500' }}>
      {value || '—'}
    </div>
  </div>
)

/** Shared action button */
const Btn = ({ onClick, children, variant = 'primary', style = {}, disabled = false, size = 'md' }) => {
  const pad = size === 'sm' ? '4px 12px' : '6px 18px'
  const bg = variant === 'danger' ? t.danger
    : variant === 'secondary' ? '#e2e8f0'
      : variant === 'outline' ? 'transparent'
        : 'var(--color-bgcolor)'
  const color = variant === 'secondary' ? t.text : variant === 'outline' ? 'var(--color-bgcolor)' : '#fff'
  const border = variant === 'outline' ? '1px solid var(--color-bgcolor)' : 'none'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: pad, borderRadius: t.radiusSm, fontSize: '12px',
        fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
        border, color, backgroundColor: bg,
        opacity: disabled ? 0.55 : 1,
        boxShadow: variant === 'outline' ? 'none' : t.shadow,
        transition: 'opacity .15s',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

/** Divider */
const Divider = () => <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: '20px 0' }} />

/** Form field wrapper */
const FormField = ({ label, children, error }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ fontSize: '11px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>
      {label}
    </label>
    {children}
    {error && <small style={{ color: t.danger, fontSize: '11px', marginTop: '3px', display: 'block' }}>{error}</small>}
  </div>
)

/* ─── Main Component ────────────────────────────────────────────── */
const DoctorDetailsPage = () => {
  const [categoryOptions, setCategoryOptions] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [delloading, setDelLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedSubServices, setSelectedSubServices] = useState([])
  const [saveloading, setSaveLoading] = useState(false)
  const [enabledTypes, setEnabledTypes] = useState({ inClinic: false, online: false, serviceTreatment: false })

  const { state } = useLocation()
  const [doctorData, setDoctorData] = useState(state?.doctor || {})
  const { fetchHospitalDetails, selectedHospital, fetchDoctors, user } = useHospital()
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState(1)
  const minDate = format(startOfToday(), 'yyyy-MM-dd')
  const maxDate = format(addDays(startOfToday(), 14), 'yyyy-MM-dd')
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [slotsData, setSlotsData] = useState([])
  const [allSlots, setAllSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [ratingComments, setRatingComments] = useState([])
  const [visible, setVisible] = useState(false)
  const [visibleSlot, setVisibleSlot] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [timeSlots, setTimeSlots] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(state?.doctor || {})
  const [interval, setInterval] = useState(30)
  const [slots, setSlots] = useState([])
  const [customerDetails, setCustomerDetails] = useState({})
  const [days, setDays] = useState([])
  const [ratings, setRatings] = useState(null)
  const [branchOptions, setBranchOptions] = useState([])
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [selectedSlots, setSelectedSlots] = useState([])
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deleteMode, setDeleteMode] = useState(null)
  const [isSubServiceComplete, setIsSubServiceComplete] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const handleEditToggle = () => setIsEditing(!isEditing)
  const role = localStorage.getItem('role')
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const handleDateClick = (dateObj, index) => {
    setSelectedDate(format(dateObj.date, 'yyyy-MM-dd'))
    setSelectedDateIndex(index)
  }

  const handleDeleteToggleE = async (id) => {
    setDelLoading(true)
    setShowModal(false)
    const isDeleted = await handleDeleteToggle(id)
    if (isDeleted) {
      navigate('/employee-management/doctor')
      fetchDoctors()
      showCustomToast('Doctor deleted successfully', 'success')
    } else {
      setDelLoading(false)
    }
  }

  const buildConsultationPayload = (availableConsultations = []) => ({
    serviceAndTreatments: availableConsultations.includes('Services & Treatments') ? 3 : 0,
    inClinic: availableConsultations.includes('In-Clinic') ? 1 : 0,
    videoOrOnline: availableConsultations.includes('Video/Online') ? 2 : 0,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!doctorData?.doctorId) fetchDoctor()
  }, [doctorData?.doctorId])

  const fetchDoctor = async () => {
    try {
      const res = await http.get(`/getDoctorById/${doctorData?.doctorId}`)
      setDoctorData(res.data)
      setFormData(res.data)
    } catch (err) {
      console.error('Error fetching doctor', err)
    }
  }

  const generateTimeSlots = (interval = 30, isToday = false) => {
    const slots = []
    const start = new Date()
    const now = new Date()
    start.setHours(7, 0, 0, 0)
    const end = new Date()
    end.setHours(20, 0, 0, 0)
    while (start <= end) {
      const formatted = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      if (!isToday || start > now) slots.push(formatted)
      start.setMinutes(start.getMinutes() + interval)
    }
    return slots
  }

  const [availableSlots, setAvailableSlots] = useState(generateTimeSlots())
  const [selectedToDelete, setSelectedToDelete] = useState([])

  const openModal = () => setVisibleSlot(true)

  const handleUpdate = async () => {
    try {
      setSaveLoading(true)
      const payload = {
        ...formData,
        consultation: buildConsultationPayload(formData.availableConsultations),
        branches: formData.branch?.map(b => ({ branchId: b.branchId, branchName: b.branchName })) || [],
        category: formData.category || [],
        subCategory: formData.subCategory ? { subCategoryId: formData.subCategory.subCategoryId, subCategoryName: formData.subCategory.subCategoryName } : null,
        service: formData.services?.map(s => ({ serviceId: s.serviceId, serviceName: s.serviceName })) || [],
      }
      const res = await http.put(`/updateDoctor/${doctorData.doctorId}`, payload)
      if (res.data.success) {
        setDoctorData(res.data.updatedDoctor)
        setFormData(res.data.updatedDoctor)
        setIsEditing(false)
        navigate('/employee-management/doctor')
        await fetchDoctors()
        showCustomToast(res.data.message || 'Doctor updated successfully', 'success')
      } else {
        showCustomToast('Failed to update doctor', 'error')
      }
    } catch (err) {
      console.error('Update error:', err)
    } finally {
      setSaveLoading(false)
    }
  }

  const toggleType = (type) => {
    setEnabledTypes(prev => {
      const updated = { ...prev, [type]: !prev[type] }
      const consultations = []
      if (updated.serviceTreatment) consultations.push('Services & Treatments')
      if (updated.inClinic) consultations.push('In-Clinic')
      if (updated.online) consultations.push('Video/Online')
      setFormData(prevForm => ({ ...prevForm, availableConsultations: consultations }))
      return updated
    })
  }

  useEffect(() => {
    if (doctorData && !isEditing) {
      setFormData({
        ...doctorData,
        branch: doctorData.branches?.map(b => ({ branchId: b.branchId || b.id, branchName: b.branchName || b.name })) || [],
      })
    }
  }, [doctorData, isEditing])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    fetchSlots(today)
  }, [])

  useEffect(() => {
    const generateUpcomingDays = () => {
      const localToday = new Date()
      localToday.setHours(0, 0, 0, 0)
      const fullDayList = []
      for (let i = 0; i < 15; i++) {
        const date = new Date(localToday)
        date.setDate(localToday.getDate() + i)
        fullDayList.push({ date, dayLabel: format(date, 'EEE'), dateLabel: format(date, 'dd MMM') })
      }
      setDays(fullDayList)
    }
    generateUpcomingDays()
  }, [])

  const handleAddSlot = async () => {
    const newSlots = selectedSlots.filter(slot => !slotsData.some(e => e.slot === slot && e.date === selectedDate))
    if (newSlots.length === 0) { alert('No new slots to add!'); return }
    const payload = {
      doctorId: doctorData?.doctorId,
      date: selectedDate,
      availableSlots: newSlots.map(slot => ({ slot, slotbooked: false })),
    }
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      const res = await http.post(`/addDoctorSlots/${hospitalId}/${branchId}/${doctorData.doctorId}`, payload)
      if (res.data.success) {
        showCustomToast('Slots added successfully', 'success')
        setVisibleSlot(false)
        setVisible(false)
        setSelectedSlots([])
        fetchSlots()
      }
    } catch (err) {
      console.error(err)
      alert('Error adding slots')
    }
  }

  const slotsForSelectedDate =
    (Array.isArray(allSlots) ? allSlots.find(sd => sd.date === selectedDate) : null)?.availableSlots || []

  const fetchSlots = async () => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      const response = await http.get(`/getDoctorSlots/${hospitalId}/${branchId}/${doctorData.doctorId}`)
      if (response.data.success) setAllSlots(response.data.data)
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDoctorRatings = async () => {
      try {
        const response = await http.get(`/getAverageRatingsByDoctorId/${doctorData.doctorId}`)
        if (!response.data.success) { setError('Failed to fetch ratings'); return }
        const ratingData = response.data.data
        setRatings(ratingData)
        const mobileNumbers = [...new Set(ratingData.comments?.map(c => c.customerMobileNumber) || [])]
        const customers = {}
        await Promise.all(mobileNumbers.map(async number => {
          try {
            const res = await getCustomerByMobile(number)
            customers[number] = res?.data?.fullName || number
          } catch (err) { customers[number] = number }
        }))
        setCustomerDetails(customers)
      } catch (err) {
        setError('Error fetching ratings: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctorRatings()
  }, [])

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])
  }

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

  function formatTimeAgo(dateString) {
    const [datePart, timePart, meridian] = dateString.split(' ')
    const [day, month, year] = datePart.split('-').map(Number)
    let [hours, minutes, seconds] = timePart.split(':').map(Number)
    if (meridian === 'PM' && hours !== 12) hours += 12
    if (meridian === 'AM' && hours === 12) hours = 0
    const date = new Date(year, month - 1, day, hours, minutes, seconds)
    const diff = Math.floor((new Date() - date) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff} minute${diff > 1 ? 's' : ''} ago`
    const hoursDiff = Math.floor(diff / 60)
    if (hoursDiff < 24) return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`
    const days = Math.floor(hoursDiff / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  useEffect(() => {
    if (doctorData?.doctorId) fetchSlots()
  }, [doctorData?.doctorId])

  if (!doctorData) return <p style={{ color: t.text }}>No doctor data found.</p>

  const validateForm = () => {
    let newErrors = {}
    if (!/^[a-zA-Z0-9]+$/.test(formData.doctorLicence?.trim())) newErrors.doctorLicence = 'License must be alphanumeric.'
    if (!/^[A-Za-z\s.]+$/.test(formData.doctorName)) newErrors.doctorName = 'Name should contain only letters, spaces, and dots.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.doctorEmail?.trim())) newErrors.doctorEmail = 'Enter a valid email address.'
    if (!/^[A-Za-z\s]+$/.test(formData.qualification?.trim())) newErrors.qualification = 'Qualification should contain only letters.'
    if (!/^[A-Za-z\s]+$/.test(formData.specialization?.trim())) newErrors.specialization = 'Specialization should contain only letters.'
    if (!/^\d+$/.test(formData.experience?.trim())) newErrors.experience = 'Experience should contain only numbers.'
    if (formData.languages && !formData.languages.every(lang => /^[A-Za-z\s]+$/.test(lang))) newErrors.languages = 'Languages should contain only letters.'
    if (!/^[6-9]\d{9}$/.test(formData.doctorMobileNumber?.trim())) newErrors.doctorMobileNumber = 'Contact must be a 10-digit number starting with 6-9.'
    if (!formData.gender) newErrors.gender = 'Please select gender.'
    if (!/^[A-Za-z,\s\-]+$/.test(formData.availableDays)) newErrors.availableDays = 'Days should contain only letters, commas, spaces, and hyphens.'
    if (formData.availableTimes?.trim() === '') newErrors.availableTimes = 'Please enter available timings.'
    if (!/^\d+$/.test(formData.doctorFees?.inClinicFee)) newErrors.inClinicFee = 'In-Clinic Fee should contain only numbers.'
    if (!/^\d+$/.test(formData.doctorFees?.vedioConsultationFee)) newErrors.vedioConsultationFee = 'Video Consultation Fee should contain only numbers.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateWithValidation = async () => {
    if (validateForm()) await handleUpdate()
  }

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')
        const response = await GetClinicBranches(clinicId)
        const branches = response?.data || []
        setBranchOptions(branches.map(b => ({ value: b.branchId || b.id, label: b.branchName || b.name })))
      } catch (err) {
        console.error('Error fetching branches:', err)
        setBranchOptions([])
      }
    }
    fetchBranches()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryData()
        const categories = res?.data || []
        setCategoryOptions(categories.map(c => ({ value: c.categoryId, label: c.categoryName })))
      } catch (err) {
        setCategoryOptions([])
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryChange = async (selectedCategories) => {
    setSelectedCategory(selectedCategories)
    if (!selectedCategories || selectedCategories.length === 0) {
      setServiceOptions([]); setSubServiceOptions([]); setSelectedServices([]); setSelectedSubServices([])
      setFormData(prev => ({ ...prev, category: [], services: [], subServices: [] }))
      return
    }
    try {
      const allServicesMap = new Map(serviceOptions.map(s => [s.value, s]))
      for (let cat of selectedCategories) {
        const res = await serviceData(cat.value)
        const services = res?.data || []
        services.forEach(s => { if (!allServicesMap.has(s.serviceId)) allServicesMap.set(s.serviceId, { value: s.serviceId, label: s.serviceName }) })
      }
      const formattedServices = Array.from(allServicesMap.values())
      setServiceOptions(formattedServices)
      const filteredSelectedServices = selectedServices.filter(s => formattedServices.some(fs => fs.value === s.value))
      setSelectedServices(filteredSelectedServices)
      const filteredSubServices = selectedSubServices.filter(ss => filteredSelectedServices.some(s => (ss.serviceId ? ss.serviceId === s.value : true)))
      setSelectedSubServices(filteredSubServices)
      setFormData(prev => ({
        ...prev,
        category: selectedCategories.map(c => ({ categoryId: c.value, categoryName: c.label })),
        services: filteredSelectedServices.map(s => ({ serviceId: s.value, serviceName: s.label })),
        subServices: filteredSubServices.map(ss => ({ subServiceId: ss.value, subServiceName: ss.label })),
      }))
    } catch (err) {
      setServiceOptions([])
    }
  }

  useEffect(() => {
    if (selectedServices.length > 0) {
      setFormData(prev => ({ ...prev, services: selectedServices.map(s => ({ serviceId: s.value, serviceName: s.label })) }))
    }
  }, [selectedServices])

  useEffect(() => {
    if (selectedSubServices.length > 0) {
      setFormData(prev => ({ ...prev, subServices: selectedSubServices.map(ss => ({ subServiceId: ss.value, subServiceName: ss.label })) }))
    }
  }, [selectedSubServices])

  useEffect(() => {
    const prefillData = async () => {
      if (!doctorData) return
      const selectedCats = doctorData.category.map(c => ({ value: c.categoryId, label: c.categoryName }))
      setSelectedCategory(selectedCats)
      const allServicesMap = new Map()
      for (let cat of doctorData.category) {
        const res = await serviceData(cat.categoryId)
        const services = res?.data || []
        services.forEach(s => { if (!allServicesMap.has(s.serviceId)) allServicesMap.set(s.serviceId, { value: s.serviceId, label: s.serviceName, categoryId: cat.categoryId }) })
      }
      setServiceOptions(Array.from(allServicesMap.values()))
      const selectedSvcs = doctorData.service.map(s => ({ value: s.serviceId, label: s.serviceName }))
      setSelectedServices(selectedSvcs)
      const subRes = await Promise.all(selectedSvcs.map(s => subServiceData(s.value)))
      const allSubservices = subRes.flatMap(res => res?.data?.[0]?.subServices || [])
      const selectedSubSvc = doctorData.subServices
        .filter(ss => allSubservices.some(s => s.subServiceId === ss.subServiceId))
        .map(ss => ({ value: ss.subServiceId, label: ss.subServiceName, serviceId: allSubservices.find(s => s.subServiceId === ss.subServiceId)?.serviceId }))
      setSubServiceOptions(allSubservices.map(ss => ({ value: ss.subServiceId, label: ss.subServiceName, serviceId: ss.serviceId })))
      setSelectedSubServices(selectedSubSvc)
    }
    prefillData()
  }, [doctorData])

  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval)
    setSlots([])
    setTimeSlots([])
    setSelectedSlots([])
  }

  const handleServiceChange = async (selectedSvc) => {
    const uniqueServices = Array.from(new Map(selectedSvc.map(s => [s.value, s])).values())
    setSelectedServices(uniqueServices)
    const newServiceIds = uniqueServices.map(s => s.value)
    const subRes = await Promise.all(newServiceIds.map(id => subServiceData(id)))
    const newSubservices = subRes.flatMap(res => res?.data?.[0]?.subServices || []).map(ss => ({ value: ss.subServiceId, label: ss.subServiceName, serviceId: ss.serviceId }))
    const mergedSubMap = new Map([...subServiceOptions.map(s => [s.value, s]), ...newSubservices.map(s => [s.value, s])])
    setSubServiceOptions(Array.from(mergedSubMap.values()))
    const filteredSubServices = selectedSubServices.filter(ss => mergedSubMap.has(ss.value))
    setSelectedSubServices(filteredSubServices)
    setFormData(prev => ({
      ...prev,
      services: uniqueServices.map(s => ({ serviceId: s.value, serviceName: s.label })),
      subServices: filteredSubServices.map(ss => ({ subServiceId: ss.value, subServiceName: ss.label })),
    }))
  }

  const handleGenerate = async () => {
    if (!selectedHospital?.data?.openingTime || !selectedHospital?.data?.closingTime) return
    const doctorId = doctorData?.doctorId
    const branchId = localStorage.getItem('branchId')
    const date = selectedDate
    const intervaltime = interval
    const availableTimes = doctorData?.availableTimes || ''
    const [start, end] = availableTimes.split('-').map(time => time.trim())
    const generatedSlots = await fetchDoctorSlots(doctorId, branchId, date, intervaltime, start, end)
    if (!generatedSlots || generatedSlots.length === 0) {
      setSlots([]); setTimeSlots([]); setSelectedSlots([])
      showCustomToast('Timing not available for this doctor', 'error')
      return
    }
    setSlots(generatedSlots)
    setTimeSlots(generatedSlots)
    setSelectedSlots([])
    showCustomToast(`Generated ${generatedSlots.length} slots`, 'success')
  }

  const checkSubServiceDetails = async (ids) => {
    let incomplete = false
    const hospitalId = localStorage.getItem('HospitalId')
    for (const id of ids) {
      const data = await getSubServiceById(hospitalId, id)
      if (!data || !data.price || !data.finalCost) { incomplete = true; break }
    }
    setIsSubServiceComplete(!incomplete)
  }

  useEffect(() => {
    if (!doctorData) return
    setEnabledTypes({
      inClinic: Number(doctorData?.doctorFees?.inClinicFee) > 0,
      online: Number(doctorData?.doctorFees?.vedioConsultationFee) > 0,
      serviceTreatment: (Array.isArray(doctorData?.subServices) && doctorData.subServices.length > 0) || (Array.isArray(doctorData?.service) && doctorData.service.length > 0),
    })
  }, [doctorData, isEditing])

  /* ─── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px', color: t.text }}>
      <ToastContainer />

      {/* ── PAGE TITLE BAR ── */}
      <div style={{
        backgroundColor: 'var(--color-bgcolor)',
        borderRadius: t.radius,
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        boxShadow: t.shadowMd,
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>DOCTOR MANAGEMENT</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
            {capitalizeWords(doctorData.doctorName || '')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {doctorData.doctorPicture && (
            <img
              src={doctorData.doctorPicture}
              alt="Doctor"
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
            />
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>ID</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{doctorData.doctorId}</div>
          </div>
        </div>
      </div>

      {/* ── MAIN CARD ── */}
      <div style={{
        backgroundColor: '#fff',
        color: t.text,
        borderRadius: t.radius,
        boxShadow: t.shadow,
        border: `1px solid ${t.border}`,
        overflow: 'hidden',
      }}>
        {/* ── TABS ── */}
        <div style={{
          display: 'flex',
          gap: '0',
          borderBottom: `1px solid ${t.border}`,
          backgroundColor: t.surface,
          padding: '0 20px',
        }}>
          {[{ key: 1, label: 'Doctor Slots' }, { key: 2, label: 'Doctor Profile' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveKey(tab.key)}
              style={{
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: activeKey === tab.key ? '700' : '500',
                color: activeKey === tab.key ? 'var(--color-bgcolor)' : t.textMuted,
                background: 'none',
                border: 'none',
                borderBottom: activeKey === tab.key ? '2px solid var(--color-bgcolor)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all .15s',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1 — DOCTOR SLOTS
        ══════════════════════════════════════════════════════════ */}
        {activeKey === 1 && (
          <div style={{ padding: '20px 24px' }}>
            <SectionHeading title="Select Date" />

            {/* Date strip */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {days.map((dayObj, idx) => {
                const isSelected = selectedDate === format(dayObj.date, 'yyyy-MM-dd')
                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(dayObj, idx)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: t.radiusSm,
                      border: `1px solid ${isSelected ? 'var(--color-bgcolor)' : t.border}`,
                      backgroundColor: isSelected ? '#1e3a8a' : '#fff',
                      color: isSelected ? '#ffffff' : t.text,
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: isSelected ? '700' : '500',
                      minWidth: '52px',
                      textAlign: 'center',
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{ color: isSelected ? '#ffffff' : t.text }}>{dayObj.dayLabel}</div>
                    <div style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.85)' : t.textMuted }}>{dayObj.dateLabel}</div>
                  </button>
                )
              })}
            </div>

            <Divider />
            <SectionHeading title={`Available Slots — ${selectedDate}`} />

            {/* Slot grid */}
            <div style={{
              border: `1px solid ${t.border}`,
              borderRadius: t.radius,
              padding: '16px',
              backgroundColor: t.surface,
              marginBottom: '16px',
            }}>
              {loading ? (
                <LoadingIndicator message="Loading slots..." />
              ) : slotsForSelectedDate.length === 0 ? (
                <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>No available slots for this date.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '8px' }}>
                  {slotsForSelectedDate.map((slotObj, i) => {
                    const isSelected = selectedSlots.includes(slotObj.slot)
                    const isBooked = slotObj?.slotbooked
                    const now = new Date()
                    const slotTime = new Date(`${selectedDate} ${slotObj.slot}`)
                    const todayCheck = format(now, 'yyyy-MM-dd') === selectedDate
                    const isPastTime = !todayCheck || slotTime > now
                    return isPastTime && (
                      <div
                        key={i}
                        onClick={() => {
                          if (isBooked) return
                          setSelectedSlots(prev => isSelected ? prev.filter(s => s !== slotObj.slot) : [...prev, slotObj.slot])
                        }}
                        title={isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                        style={{
                          padding: '8px 4px',
                          borderRadius: t.radiusSm,
                          textAlign: 'center',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          border: `1px solid ${isSelected ? '#1e3a8a' : isBooked ? '#fca5a5' : t.border}`,
                          /* ✅ FIX: isSelected checked FIRST so white text always wins on dark bg */
                          backgroundColor: isSelected ? '#1e3a8a' : isBooked ? '#fee2e2' : '#fff',
                          color: isSelected ? '#ffffff' : isBooked ? t.danger : t.text,
                          opacity: isBooked ? 0.8 : 1,
                          transition: 'all .15s',
                          userSelect: 'none',
                        }}
                      >
                        {slotObj?.slot}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Slot legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { color: '#fff', border: t.border, text: t.text, label: 'Available' },
                { color: '#1e3a8a', border: '#1e3a8a', text: '#fff', label: 'Selected' },
                { color: '#fee2e2', border: '#fca5a5', text: t.danger, label: 'Booked' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: t.textMuted }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: item.color, border: `1px solid ${item.border}`, display: 'inline-block' }} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Slot action buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Btn variant="outline" onClick={openModal}>+ Add Slot</Btn>
              <Btn
                variant="outline"
                disabled={selectedSlots.length === 0}
                onClick={() => {
                  if (selectedSlots.length === 0) { showCustomToast('Please select slot(s) to delete.', 'error'); return }
                  setDeleteMode('selected')
                  setShowDeleteConfirmModal(true)
                }}
              >
                Delete Selected ({selectedSlots.length})
              </Btn>
              <Btn
                onClick={() => { setDeleteMode('all'); setShowDeleteConfirmModal(true) }}
              >
                Delete All for Date
              </Btn>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2 — DOCTOR PROFILE
        ══════════════════════════════════════════════════════════ */}
        {activeKey === 2 && (
          <div style={{ padding: '20px 24px' }}>

            {/* ── Edit mode: Category / Service / Sub-service ── */}
            {isEditing && (
              <>
                <SectionHeading title="Services & Procedures" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <FormField label="Category">
                    <Select isMulti options={categoryOptions} value={selectedCategory} onChange={handleCategoryChange} placeholder="Select Category" />
                  </FormField>
                  <FormField label="Services">
                    <Select isMulti options={serviceOptions} value={selectedServices} onChange={handleServiceChange} placeholder="Select Service(s)" />
                  </FormField>
                </div>
                <FormField label="Procedures">
                  <Select
                    isMulti
                    options={subServiceOptions}
                    value={selectedSubServices}
                    onChange={ss => {
                      setSelectedSubServices(ss)
                      setFormData(prev => ({ ...prev, subServices: ss.map(s => ({ subServiceId: s.value, subServiceName: s.label })) }))
                      checkSubServiceDetails(ss.map(opt => opt.value))
                    }}
                    placeholder="Select Procedures"
                  />
                </FormField>
                {!isSubServiceComplete && (
                  <div style={{ fontSize: '12px', color: t.danger, marginBottom: '12px', padding: '8px 12px', background: '#fee2e2', borderRadius: t.radiusSm }}>
                    Some selected Procedures are missing price or final cost details.{' '}
                    <a href="/procedure-Management" style={{ color: 'var(--color-bgcolor)', fontWeight: '600' }}>Add Procedure details →</a>
                  </div>
                )}
                <Divider />

                {/* Image upload in edit mode */}
                <SectionHeading title="Profile Photo" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                    border: `2px solid ${t.border}`, backgroundColor: t.surface,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {formData.doctorPicture
                      ? <img src={formData.doctorPicture} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '11px', color: t.textMuted }}>Preview</span>
                    }
                  </div>
                  <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: t.radiusSm, border: `1px solid ${t.border}`, backgroundColor: '#fff', fontSize: '12px', fontWeight: '600', color: t.text }}>
                    Choose Image
                    <input type="file" accept="image/*" className="d-none" onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) { showCustomToast('File size exceeds 2 MB!', 'error'); e.target.value = ''; return }
                      try {
                        const base64 = await toBase64(file)
                        setFormData(prev => ({ ...prev, doctorPicture: base64 }))
                        e.target.value = ''
                      } catch (err) { e.target.value = '' }
                    }} />
                  </label>
                  <span style={{ fontSize: '11px', color: t.textMuted }}>JPG/PNG, max 2 MB</span>
                </div>
                <Divider />
              </>
            )}

            {/* ── Basic Info Grid ── */}
            <SectionHeading title="Doctor Information" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {/* Left col */}
              <div>
                <FormField label="License No" error={errors.doctorLicence}>
                  {isEditing
                    ? <CFormInput value={formData.doctorLicence} onChange={e => { const c = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); setFormData(p => ({ ...p, doctorLicence: c })); setErrors(p => ({ ...p, doctorLicence: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.doctorLicence || '—'}</div>
                  }
                </FormField>

                <FormField label="Name" error={errors.doctorName}>
                  {isEditing
                    ? <CFormInput value={formData.doctorName} onChange={e => { const c = e.target.value.replace(/[^A-Za-z\s.]/g, ''); setFormData(p => ({ ...p, doctorName: c })); setErrors(p => ({ ...p, doctorName: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.doctorName || '—'}</div>
                  }
                </FormField>

                <FormField label="Email" error={errors.doctorEmail}>
                  {isEditing
                    ? <CFormInput value={formData.doctorEmail} onChange={e => { setFormData(p => ({ ...p, doctorEmail: e.target.value })); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setErrors(p => ({ ...p, doctorEmail: 'Enter a valid email.' })); else setErrors(p => ({ ...p, doctorEmail: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.doctorEmail || '—'}</div>
                  }
                </FormField>

                <FormField label="Qualification" error={errors.qualification}>
                  {isEditing
                    ? <CFormInput value={formData.qualification} onChange={e => { const c = e.target.value.replace(/[^A-Za-z\s]/g, ''); setFormData(p => ({ ...p, qualification: c })); setErrors(p => ({ ...p, qualification: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.qualification || '—'}</div>
                  }
                </FormField>

                <FormField label="Specialization" error={errors.specialization}>
                  {isEditing
                    ? <CFormInput value={formData.specialization} onChange={e => { const c = e.target.value.replace(/[^A-Za-z\s]/g, ''); setFormData(p => ({ ...p, specialization: c })); setErrors(p => ({ ...p, specialization: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.specialization || '—'}</div>
                  }
                </FormField>

                <FormField label="Experience" error={errors.experience}>
                  {isEditing
                    ? <CFormInput value={formData.experience} onChange={e => { const c = e.target.value.replace(/[^0-9]/g, ''); setFormData(p => ({ ...p, experience: c })); setErrors(p => ({ ...p, experience: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.experience ? `${doctorData.experience} Years` : '—'}</div>
                  }
                </FormField>
              </div>

              {/* Right col */}
              <div>
                <FormField label="Languages Known" error={errors.languages}>
                  {isEditing
                    ? <CFormInput value={formData.languages?.join(', ') || ''} onChange={e => { const c = e.target.value.replace(/[^A-Za-z,\s]/g, ''); setFormData(p => ({ ...p, languages: c.split(',').map(l => l.trim()) })); setErrors(p => ({ ...p, languages: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.languages?.join(', ') || '—'}</div>
                  }
                </FormField>

                <FormField label="Contact" error={errors.doctorMobileNumber}>
                  {isEditing
                    ? <CFormInput value={formData.doctorMobileNumber} onChange={e => { const c = e.target.value.replace(/[^0-9]/g, ''); setFormData(p => ({ ...p, doctorMobileNumber: c })); setErrors(p => ({ ...p, doctorMobileNumber: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.doctorMobileNumber || '—'}</div>
                  }
                </FormField>

                <FormField label="Gender" error={errors.gender}>
                  {isEditing
                    ? <select className="form-select" style={{ fontSize: '13px' }} value={formData.gender} onChange={e => { setFormData(p => ({ ...p, gender: e.target.value })); setErrors(p => ({ ...p, gender: '' })) }}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.gender || '—'}</div>
                  }
                </FormField>

                <FormField label="Available Days" error={errors.availableDays}>
                  {isEditing
                    ? <CFormInput value={formData.availableDays} onChange={e => { const c = e.target.value.replace(/[^A-Za-z,\s\-]/g, ''); setFormData(p => ({ ...p, availableDays: c })); setErrors(p => ({ ...p, availableDays: '' })) }} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.availableDays || '—'}</div>
                  }
                </FormField>

                <FormField label="Available Timings" error={errors.availableTimes}>
                  {isEditing
                    ? <CFormInput name="availableTimes" value={formData.availableTimes} onChange={handleInputChange} style={{ fontSize: '13px' }} />
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.availableTimes || '—'}</div>
                  }
                </FormField>

                <FormField label="Branch">
                  {isEditing
                    ? <>
                      <Select isMulti options={branchOptions} value={branchOptions.filter(opt => Array.isArray(formData.branch) && formData.branch.some(b => b.branchId?.toString() === opt.value?.toString()))} onChange={selected => { const updatedBranches = selected.map(opt => ({ branchId: opt.value, branchName: opt.label })); setFormData(p => ({ ...p, branch: updatedBranches })) }} placeholder="Select branches..." />
                      {Array.isArray(formData.branch) && formData.branch.length > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: t.textMuted }}>
                          {formData.branch.map((b, idx) => <span key={idx} style={{ display: 'inline-block', background: t.surface, border: `1px solid ${t.border}`, borderRadius: '4px', padding: '2px 8px', marginRight: '4px', marginTop: '4px' }}>{b.branchName}</span>)}
                        </div>
                      )}
                    </>
                    : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>
                      {Array.isArray(doctorData.branches) && doctorData.branches.length > 0
                        ? doctorData.branches.map(b => b.branchName).join(', ')
                        : 'No branches assigned'}
                    </div>
                  }
                </FormField>
              </div>
            </div>

            <Divider />

            {/* ── Fees ── */}
            <SectionHeading title="Consultation Fees" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginBottom: '8px' }}>
              <FormField label="In-Clinic Fee (₹)" error={errors.inClinicFee}>
                {isEditing
                  ? <CFormInput value={formData?.doctorFees?.inClinicFee || ''} onChange={e => { const c = e.target.value.replace(/[^0-9]/g, ''); setFormData(p => ({ ...p, doctorFees: { ...p.doctorFees, inClinicFee: c } })); setErrors(p => ({ ...p, inClinicFee: '' })) }} style={{ fontSize: '13px' }} />
                  : <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-bgcolor)', padding: '4px 0' }}>₹{formData?.doctorFees?.inClinicFee || 'N/A'}</div>
                }
              </FormField>
              <FormField label="Video Consultation Fee (₹)" error={errors.vedioConsultationFee}>
                {isEditing
                  ? <CFormInput value={formData?.doctorFees?.vedioConsultationFee || ''} onChange={e => { const c = e.target.value.replace(/[^0-9]/g, ''); setFormData(p => ({ ...p, doctorFees: { ...p.doctorFees, vedioConsultationFee: c } })); setErrors(p => ({ ...p, vedioConsultationFee: '' })) }} style={{ fontSize: '13px' }} />
                  : <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-bgcolor)', padding: '4px 0' }}>₹{formData?.doctorFees?.vedioConsultationFee || 'N/A'}</div>
                }
              </FormField>
            </div>

            <Divider />

            {/* ── Misc text fields ── */}
            <SectionHeading title="Additional Information" />
            <FormField label="Association / Membership">
              {isEditing
                ? <CFormInput value={formData.associationsOrMemberships} onChange={e => { const c = e.target.value.replace(/[^A-Za-z\s]/g, ''); setFormData(p => ({ ...p, associationsOrMemberships: c })) }} style={{ fontSize: '13px' }} />
                : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.associationsOrMemberships || '—'}</div>
              }
            </FormField>

            <FormField label="Profile Description">
              {isEditing
                ? <CFormInput name="profileDescription" value={formData.profileDescription} onChange={e => setFormData(p => ({ ...p, profileDescription: e.target.value }))} style={{ fontSize: '13px' }} />
                : <div style={{ fontSize: '13px', color: t.text, fontWeight: '500', padding: '4px 0' }}>{doctorData.profileDescription || '—'}</div>
              }
            </FormField>

            <FormField label="Area of Expertise">
              {isEditing
                ? <>
                  <CFormTextarea rows={4} style={{ resize: 'vertical', fontSize: '13px' }} placeholder="• Enter area of focus..." value={formData.focusAreas?.join('\n') || ''} onChange={e => setFormData(p => ({ ...p, focusAreas: e.target.value.split('\n').map(l => l.trimStart().startsWith('•') ? l.trim() : `• ${l.trim()}`).filter(l => l !== '•') }))} />
                  <small style={{ fontSize: '11px', color: t.textMuted }}>Type each point on a new line. Bullets added automatically.</small>
                </>
                : <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {Array.isArray(formData?.focusAreas) && formData.focusAreas.length > 0
                    ? formData.focusAreas.map((area, idx) => <li key={idx} style={{ fontSize: '13px', color: t.text, marginBottom: '2px' }}>{area.replace(/^•\s*/, '')}</li>)
                    : <li style={{ fontSize: '13px', color: t.textMuted, listStyle: 'none', marginLeft: '-16px' }}>No focus areas listed</li>
                  }
                </ul>
              }
            </FormField>

            <FormField label="Achievements">
              {isEditing
                ? <>
                  <CFormTextarea rows={4} style={{ resize: 'vertical', fontSize: '13px' }} placeholder="• Enter achievement..." value={formData.highlights?.join('\n') || ''} onChange={e => setFormData(p => ({ ...p, highlights: e.target.value.split('\n').map(l => l.trimStart().startsWith('•') ? l.trim() : `• ${l.trim()}`).filter(Boolean) }))} />
                  <small style={{ fontSize: '11px', color: t.textMuted }}>Press Enter for each new achievement.</small>
                </>
                : <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {Array.isArray(formData?.highlights) && formData.highlights.length > 0
                    ? formData.highlights.map((item, idx) => <li key={idx} style={{ fontSize: '13px', color: t.text, marginBottom: '2px' }}>{item.replace(/^•\s*/, '')}</li>)
                    : <li style={{ fontSize: '13px', color: t.textMuted, listStyle: 'none', marginLeft: '-16px' }}>No achievements added</li>
                  }
                </ul>
              }
            </FormField>

            <Divider />

            {/* ── Signature ── */}
            <SectionHeading title="Doctor Signature" />
            <FormField label="Signature" error={errors.doctorSignature}>
              {isEditing && (
                <CFormInput
                  type="file"
                  accept="image/jpeg, image/png"
                  style={{ fontSize: '13px', marginBottom: '10px' }}
                  onChange={e => {
                    const file = e.target.files[0]
                    if (!file) return
                    if (!['image/jpeg', 'image/png'].includes(file.type)) { setErrors(p => ({ ...p, doctorSignature: 'Only JPG and PNG images are allowed' })); return }
                    if (file.size > 200 * 1024) { setErrors(p => ({ ...p, doctorSignature: 'File size must be less than 200 KB' })); return }
                    const reader = new FileReader()
                    reader.onloadend = () => { setFormData(p => ({ ...p, doctorSignature: reader.result })); setErrors(p => ({ ...p, doctorSignature: '' })) }
                    reader.readAsDataURL(file)
                  }}
                  invalid={!!errors.doctorSignature}
                />
              )}
              <div style={{
                width: '160px', height: '80px', border: `1px solid ${t.border}`, borderRadius: t.radiusSm,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', backgroundColor: t.surface,
              }}>
                {(formData.doctorSignature || doctorData.doctorSignature)
                  ? <img src={formData.doctorSignature || doctorData.doctorSignature} alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '11px', color: t.textMuted }}>No signature uploaded</span>
                }
              </div>
            </FormField>

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${t.border}` }}>
              {isEditing ? (
                <>
                  <Btn variant="secondary" onClick={handleEditToggle}>Cancel</Btn>
                  <Btn disabled={saveloading || !isSubServiceComplete} onClick={handleUpdateWithValidation}>
                    {saveloading ? <><span className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }} />Updating...</> : 'Update'}
                  </Btn>
                </>
              ) : (
                <>
                  {can('Doctors', 'delete') && (
                    <Btn variant="danger" onClick={handleShow}>Delete</Btn>
                  )}
                  {can('Doctors', 'update') && (
                    <Btn onClick={handleEditToggle}>Edit</Btn>
                  )}
                </>
              )}
            </div>

            <ConfirmationModal
              isVisible={showModal}
              title="Delete Doctor"
              message="This doctor has active appointments. Deleting will impact patient schedules."
              confirmText={delloading ? <><span className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }} />Deleting...</> : 'Yes, Delete'}
              cancelText="Cancel"
              confirmColor="danger"
              cancelColor="secondary"
              onConfirm={() => handleDeleteToggleE(doctorData.doctorId)}
              onCancel={handleClose}
            />
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL — Add Slots
      ══════════════════════════════════════════════════════════ */}
      <CModal
        visible={visibleSlot}
        onClose={() => { setVisibleSlot(false); setSlots([]); setTimeSlots([]); setSelectedSlots([]) }}
        size="lg"
        backdrop="static"
      >
        <CModalHeader style={{ borderBottom: `1px solid ${t.border}`, padding: '14px 20px' }}>
          <CModalTitle style={{ fontSize: '14px', fontWeight: '700', color: t.text }}>
            Select Available Time Slots — {selectedDate}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: '20px' }}>
          {/* Interval selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[10, 20, 30].map(min => (
              <label key={min} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', color: t.text, cursor: 'pointer' }}>
                <input type="radio" value={min} checked={interval === min} onChange={() => handleIntervalChange(min)} style={{ accentColor: 'var(--color-bgcolor)' }} />
                {min} min
              </label>
            ))}
            <Btn onClick={handleGenerate}>Generate Slots</Btn>
          </div>

          {/* Select All */}
          {slots.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-bgcolor)', marginBottom: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ accentColor: 'var(--color-bgcolor)' }}
                checked={selectedSlots.length === slots.filter(s => s.available).length && slots.filter(s => s.available).length > 0}
                onChange={e => { if (e.target.checked) setSelectedSlots(slots.filter(s => s.available).map(s => s.slot)); else setSelectedSlots([]) }}
              />
              Select All Available Slots
            </label>
          )}

          {/* Slot grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {slots.map((slotObj, i) => {
              const isSelected = selectedSlots.includes(slotObj.slot)
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!slotObj.available) { showCustomToast(slotObj.reason ? `Cannot book: ${slotObj.reason}` : 'This slot is unavailable', 'warning'); return }
                    toggleSlot(slotObj.slot)
                  }}
                  style={{
                    width: '76px', height: '34px', fontSize: '11px', fontWeight: '600',
                    borderRadius: t.radiusSm, border: 'none', cursor: slotObj.available ? 'pointer' : 'not-allowed',
                    /* ✅ FIX: isSelected checked FIRST so white text always wins */
                    backgroundColor: isSelected ? '#1e3a8a' : !slotObj.available ? '#e2e8f0' : '#64748b',
                    color: isSelected ? '#ffffff' : !slotObj.available ? t.textMuted : '#fff',
                    opacity: !slotObj.available ? 0.6 : 1,
                  }}
                >
                  {slotObj.slot}
                </button>
              )
            })}
          </div>
          {slots.length === 0 && <p style={{ color: t.textMuted, fontSize: '13px' }}>Click "Generate Slots" to see available time slots.</p>}
        </CModalBody>
        <CModalFooter style={{ borderTop: `1px solid ${t.border}`, padding: '12px 20px', gap: '8px' }}>
          <Btn variant="secondary" onClick={() => setVisibleSlot(false)}>Cancel</Btn>
          <Btn disabled={selectedSlots.length === 0} onClick={handleAddSlot}>
            Save Slots ({selectedSlots.length})
          </Btn>
        </CModalFooter>
      </CModal>

      {/* ══════════════════════════════════════════════════════════
          MODAL — Confirm Delete Slots
      ══════════════════════════════════════════════════════════ */}
      <CModal visible={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} alignment="center">
        <CModalHeader closeButton style={{ borderBottom: `1px solid ${t.border}`, padding: '14px 20px' }}>
          <CModalTitle style={{ fontSize: '14px', fontWeight: '700', color: t.text }}>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: '20px', fontSize: '13px', color: t.text }}>
          {deleteMode === 'selected'
            ? <p>Are you sure you want to delete <strong>{selectedSlots.length}</strong> selected slot(s) for <strong>{selectedDate}</strong>?</p>
            : <p>Are you sure you want to delete <strong>ALL</strong> slots for <strong>{selectedDate}</strong>?</p>
          }
        </CModalBody>
        <CModalFooter style={{ borderTop: `1px solid ${t.border}`, padding: '12px 20px', gap: '8px' }}>
          <Btn variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={async () => {
            const branchid = localStorage.getItem('branchId')
            try {
              if (deleteMode === 'selected') {
                for (const slot of selectedSlots) {
                  await http.delete(`/doctorId/${doctorData?.doctorId}/branchId/${branchid}/date/${selectedDate}/slot/${slot}`)
                }
                showCustomToast('Selected slots deleted successfully.', 'success')
                setSelectedSlots([])
              } else if (deleteMode === 'all') {
                await http.delete(`/delete-by-date/${doctorData?.doctorId}/${branchid}/${selectedDate}`)
                showCustomToast(`All slots for ${selectedDate} deleted.`, 'success')
                setSelectedSlots([])
              }
              fetchSlots()
            } catch (err) {
              showCustomToast('Failed to delete slots.', 'error')
            } finally {
              setShowDeleteConfirmModal(false)
            }
          }}>
            Confirm Delete
          </Btn>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DoctorDetailsPage