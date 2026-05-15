import React, { useState, useEffect } from 'react'
import {
  CFormCheck,
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CButton,
  CCard,
  CCardBody,
} from '@coreui/react'
import { RefreshCw } from 'lucide-react'

import { GetClinicBranches, getDoctorByClinicIdData } from '../Doctors/DoctorAPI'
import { useNavigate } from 'react-router-dom'
import { getAllReferDoctors } from '../EmployeeManagement/ReferDoctor/ReferDoctorAPI'
import Select from 'react-select'
import { CategoryData } from '../ProcedureManagement/ProcedureManagementAPI'
import { BASE_URL } from '../../baseUrl'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'

import { followUPBooking, postBooking } from '../../APIs/BookServiceAPi'
import { bookingUpdate } from './appointmentAPI'
import { addCustomer } from '../customerManagement/CustomerManagementAPI'
import { showCustomToast } from '../../Utils/Toaster'
import imageCompression from 'browser-image-compression'
import BodyAssessment from './BodyAssessment'
import { COLORS } from '../../Constant/Themes'

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'visit', label: 'Visit Type' },
  { id: 'contact', label: 'Contact Info' },
  { id: 'booking', label: 'Booking Details' },
  { id: 'slots', label: 'Available Slots' },
  { id: 'medical', label: 'Medical History' },
  { id: 'payment', label: 'Payment' },
  { id: 'assessment', label: 'Pain Assessment' },
]

const FS = '13px'

const inputStyle = (hasErr) => ({
  fontSize: FS, height: '34px', padding: '4px 10px',
  borderColor: hasErr ? '#dc3545' : undefined,
})
const selectStyle = (hasErr) => ({
  fontSize: FS, height: '34px', padding: '4px 8px',
  borderColor: hasErr ? '#dc3545' : undefined,
})
const textareaStyle = (hasErr) => ({
  fontSize: FS, padding: '6px 10px', minHeight: '80px',
  borderColor: hasErr ? '#dc3545' : undefined,
})
const labelStyle = {
  color: COLORS.primary, fontSize: '12px', fontWeight: '500',
  marginBottom: '3px', display: 'block',
}
const sectionHeadStyle = {
  fontSize: FS, fontWeight: '600',
  borderBottom: '1px solid var(--color-bgcolor)',
  paddingBottom: '6px', marginBottom: '14px', color: COLORS.primary,
}
const errStyle = { fontSize: '11px', color: '#dc3545', marginTop: '3px', marginBottom: 0 }

const rsStyles = {
  control: (b) => ({ ...b, minHeight: '34px', height: '34px', fontSize: FS }),
  valueContainer: (b) => ({ ...b, padding: '0 8px' }),
  indicatorsContainer: (b) => ({ ...b, height: '34px' }),
  option: (b) => ({ ...b, fontSize: FS }),
  placeholder: (b) => ({ ...b, fontSize: FS }),
  singleValue: (b) => ({ ...b, fontSize: FS }),
  input: (b) => ({ ...b, fontSize: FS }),
}

const activityOptions = ['Sedentary', 'Moderate', 'Active', 'Athlete']
const reasonOptions = ['Chronic Pain', 'Sports Rehab', 'Neuro Rehab', 'Others']

const ErrMsg = ({ msg }) => msg ? <p style={errStyle}>{msg}</p> : null

// ─────────────────────────────────────────────────────────────────────────────
const BookAppointmentModal = ({ visible, onClose, editData }) => {
  const navigate = useNavigate()
  const { selectedHospital, doctorData } = useHospital()
  const [isManualAddress, setIsManualAddress] = useState(false)

  const [currentTab, setCurrentTab] = useState(0)
  const [visitType, setVisitType] = useState('first')
  const [appointmentType] = useState('services')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [showAllSlots, setShowAllSlots] = useState(false)
  const [loadingFee, setLoadingFee] = useState(false)

  const [branches, setBranches] = useState([])
  const [doctors, setDoctors] = useState([])
  const [referDoctor, setReferDoctor] = useState([])
  const [postOffices, setPostOffices] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)

  const [originalConsultationFee, setOriginalConsultationFee] = useState('')
  const [activityLevels, setActivityLevels] = useState([])
  const [otherReason, setOtherReason] = useState('')

  const [part, setPart] = useState([])
  const [theraphyQuestions, setTheraphyQuestions] = useState({})
  const [markedImage, setMarkedImage] = useState('')

  const [onboardToCustomer, setOnboardToCustomer] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // ── Initial state factory ─────────────────────────────────────────────────
  const getInitialBookingDetails = () => ({
    branchId: localStorage.getItem('branchId') || '',
    branchname: localStorage.getItem('branchName') || '',
    clinicId: localStorage.getItem('HospitalId') || '',
    clinicName: localStorage.getItem('HospitalName') || '',
    clinicAddress: selectedHospital?.data?.address || '',
    title: '', customerId: '', patientId: '',
    categoryName: '', categoryId: '',
    servicename: '', serviceId: '',
    subServiceName: '', subServiceId: '',
    previousInjuries: '', currentMedications: '', allergies: '',
    occupation: '', activityLevels: [], reasonforVisit: '',
    insuranceProvider: '', policyNumber: '',
    doctorId: '', doctorName: '', doctorDeviceId: '', doctorRefCode: '',
    consultationType: 'Services & Treatments',
    consultationFee: [],
    consultationExpiration: selectedHospital?.data?.consultationExpiration || '',
    paymentType: '', partAmount: '', visitType: 'first', servicecost: '',
    bookingFor: 'Self', name: '', patientAddress: '',
    patientMobileNumber: '', mobileNumber: '',
    age: '', gender: '', dob: '',
    symptomsDuration: '', unit: '', problem: '',
    foc: 'Paid', focReason: '', attachments: [],
    freeFollowUps: selectedHospital?.data?.freeFollowUps || '',
    consentFormPdf: '', customerDeviceId: '',
    serviceDate: '', servicetime: '',
    referredByType: '', referredByName: '',
    address: {
      houseNo: '', street: '', landmark: '',
      city: '', state: '', postalCode: '', country: 'India',
    },
  })

  const [bookingDetails, setBookingDetails] = useState(getInitialBookingDetails)

  // ── Slot filtering / sorting ──────────────────────────────────────────────
  const now = new Date()

  // Inject editData's date into slotsForSelectedDate if missing
  let adjustedSlotsForDate = [...(slotsForSelectedDate || [])]
  if (editData && editData.serviceDate) {
    const hasDate = adjustedSlotsForDate.find(s => new Date(s.day || s.date).toDateString() === new Date(editData.serviceDate).toDateString())
    if (!hasDate) {
      adjustedSlotsForDate.push({
        date: editData.serviceDate,
        day: editData.serviceDate,
        availableSlots: [{ slot: editData.servicetime || editData.time, slotbooked: false }]
      })
    } else {
      // make sure the specific slot is in the date's availableSlots
      const dateEntry = adjustedSlotsForDate.find(s => new Date(s.day || s.date).toDateString() === new Date(editData.serviceDate).toDateString())
      const hasSlot = dateEntry.availableSlots?.find(s => s.slot === (editData.servicetime || editData.time))
      if (!hasSlot && (editData.servicetime || editData.time)) {
        if (!dateEntry.availableSlots) dateEntry.availableSlots = []
        dateEntry.availableSlots.push({ slot: editData.servicetime || editData.time, slotbooked: false })
      }
    }
  }

  const slotsToShow = adjustedSlotsForDate
    .filter((s) => new Date(s.day || s.date).toDateString() === new Date(selectedDate).toDateString())
    .flatMap((s) => s.availableSlots || [])
    .filter((slotObj) => {
      const slotDate = new Date(selectedDate)
      const [time, meridian] = (slotObj.slot || '').split(' ')
      if (!time || !meridian) return true
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      slotDate.setHours(hours, minutes, 0, 0)

      if (editData && new Date(selectedDate).toDateString() === new Date(editData.serviceDate).toDateString() && slotObj.slot === (editData.servicetime || editData.time)) {
        return true
      }
      return new Date(selectedDate).toDateString() === now.toDateString() ? slotDate > now : true
    })

  const sortedSlots = [...slotsToShow].sort((a, b) => {
    const parse = (s) => {
      const [time, m] = s.slot.split(' ')
      let [h, min] = time.split(':').map(Number)
      if (m === 'PM' && h !== 12) h += 12
      if (m === 'AM' && h === 12) h = 0
      return h * 60 + min
    }
    return parse(a) - parse(b)
  })
  const visibleSlots = showAllSlots ? sortedSlots : sortedSlots.slice(0, 12)

  const visibleTabs = React.useMemo(() => TABS.filter((t) => {
    if (visitType === 'followup' && ['contact', 'medical', 'payment', 'assessment'].includes(t.id)) return false
    return true
  }), [visitType])
  const progressPct = Math.round(((currentTab + 1) / visibleTabs.length) * 100)

  // ── Derived State ─────────────────────────────────────────────────────────
  const isFollowupStatus = visitType === 'followup' && Number(selectedBooking?.freeFollowUpsLeft || 0) > 0

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { setOnboardToCustomer(!selectedBooking?.customerId) }, [selectedBooking])

  useEffect(() => {
    if (!visible) return
    GetClinicBranches(localStorage.getItem('HospitalId'))
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        setBranches(list.map((b) => ({ branchId: b.branchId || b.id, branchName: b.branchName || b.name })))
      }).catch(() => setBranches([]))
    getAllReferDoctors(localStorage.getItem('HospitalId'))
      .then((res) => setReferDoctor(res.data?.data || [])).catch(() => setReferDoctor([]))
    CategoryData().then().catch()
  }, [visible])

  const [loadingDoctors, setLoadingDoctors] = useState(false)

  const fetchDoctors = async () => {
    if (!bookingDetails.branchId) {
      setDoctors([])
      return
    }
    setLoadingDoctors(true)
    try {
      const clinicId = localStorage.getItem('HospitalId')
      const res = await getDoctorByClinicIdData(clinicId, bookingDetails.branchId)
      if (res && res.data) {
        setDoctors(res.data)
      } else {
        setDoctors([])
      }
    } catch (err) {
      setDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    const tabId = visibleTabs[currentTab]?.id
    if (tabId === 'booking') {
      fetchDoctors()
    }
  }, [bookingDetails.branchId, currentTab, visibleTabs])

  useEffect(() => {
    setBookingDetails((p) => ({ ...p, activityLevels }))
  }, [activityLevels])

  useEffect(() => {
    if (visible && editData) {
      const parts = (editData.patientAddress || '').split(',')
      const docId = editData.doctorId || ''
      const fullName = editData.name || ''

      // Split Title and Name
      const TITLES = ['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.', 'Rev.', 'Capt.', 'Col.']
      let title = '', name = fullName
      const firstSpace = fullName.trim().indexOf(' ')
      if (firstSpace !== -1) {
        const potentialTitle = fullName.trim().substring(0, firstSpace)
        if (TITLES.some(t => t.toLowerCase() === potentialTitle.toLowerCase())) {
          title = potentialTitle
          name = fullName.trim().substring(firstSpace + 1)
        }
      }

      // ── Parse combined symptomsDuration like "2 Days" → { symptomsDuration: "2", unit: "Days" }
      let parsedDuration = editData.symptomsDuration || ''
      let parsedUnit = editData.unit || ''
      if (parsedDuration && !parsedUnit) {
        const match = parsedDuration.match(/^(\d+)\s+(.+)$/)
        if (match) { parsedDuration = match[1]; parsedUnit = match[2] }
      }

      setBookingDetails({
        ...getInitialBookingDetails(),
        ...editData,
        title: editData.title || title,
        name: name,
        dob: editData.dob || editData.dateOfBirth || '',
        symptomsDuration: parsedDuration,
        unit: parsedUnit,
        address: {
          houseNo: parts[0]?.trim() || '', street: parts[1]?.trim() || '',
          landmark: parts[2]?.trim() || '', city: parts[3]?.trim() || '',
          state: parts[4]?.trim() || '', postalCode: parts[5]?.trim() || '',
          country: parts[6]?.trim() || 'India',
        },
      })

      if (editData.serviceDate) {
        setSelectedDate(editData.serviceDate)
      }

      setVisitType(editData.visitType || 'first')
      setMarkedImage(editData.partImage || '')
      setTheraphyQuestions(editData.theraphyAnswers || {})
      setPart(editData.parts || [])

      if (docId) fetchSlots(docId)
      setCurrentTab(1)
    } else if (visible && !editData) {
      handleFullReset()
    }
  }, [editData, visible])

  useEffect(() => {
    if (!selectedBooking) return
    const parts = (selectedBooking.patientAddress || '').split(',')
    const docId = selectedBooking.doctorId || ''

    setBookingDetails((p) => ({
      ...p,
      name: selectedBooking.name || '',
      patientId: selectedBooking.patientId || '',
      dob: selectedBooking.dob || '',
      age: selectedBooking.age || '',
      gender: selectedBooking.gender || '',
      patientMobileNumber: selectedBooking.mobileNumber || '',
      branchId: selectedBooking.branchId || p.branchId,
      branchname: selectedBooking.branchname || p.branchname,
      doctorId: docId || p.doctorId,
      doctorName: selectedBooking.doctorName || p.doctorName,
      doctorDeviceId: selectedBooking.doctorDeviceId || p.doctorDeviceId,
      foc: isFollowupStatus ? 'FOC' : p.foc,
      consultationFee: isFollowupStatus ? 0 : p.consultationFee,
      address: {
        houseNo: parts[0]?.trim() || '', street: parts[1]?.trim() || '',
        landmark: parts[2]?.trim() || '', city: parts[3]?.trim() || '',
        state: parts[4]?.trim() || '', postalCode: parts[5]?.trim() || '',
        country: parts[6]?.trim() || 'India',
      },
    }))

    if (docId) {
      fetchSlots(docId)
    }
  }, [selectedBooking, isFollowupStatus])

  // ── Error helpers ─────────────────────────────────────────────────────────
  const clearErr = (key) => setErrors((p) => { const e = { ...p }; delete e[key]; return e })
  const setErr = (key, msg) => setErrors((p) => ({ ...p, [key]: msg }))

  // ── Field handlers ────────────────────────────────────────────────────────
  const handleBookingChange = (e) => {
    const { name, value } = e.target
    setBookingDetails((prev) => {
      const u = { ...prev }
      if (name === 'patientMobileNumber') {
        let v = value.replace(/\D/g, '')
        if (v.startsWith('0')) v = v.slice(1)
        u[name] = v; u.mobileNumber = v
      } else if (name === 'name') {
        u[name] = value.replace(/\d/g, '')
      } else {
        u[name] = value
      }
      if (name === 'dob' && value) {
        const today = new Date(), dob = new Date(value)
        let age = today.getFullYear() - dob.getFullYear()
        if (
          today.getMonth() - dob.getMonth() < 0 ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        ) age--
        u.age = age >= 1 ? age : 0
        if (age > 120) setErr('dob', 'Age cannot be more than 120 years')
        else if (age < 0) setErr('dob', 'Invalid DOB')
        else clearErr('dob')
      }
      if (name === 'age' && value) {
        const d = new Date(); d.setFullYear(new Date().getFullYear() - parseInt(value))
        u.dob = d.toISOString().split('T')[0]
      }
      return u
    })

    setErrors((prev) => {
      const e = { ...prev }
      if (name === 'title' && value) delete e.title
      if (name === 'name' && value?.trim()) delete e.name
      if (name === 'gender' && value) delete e.gender
      if (name === 'dob' && value) delete e.dob
      if (name === 'age' && value) delete e.age
      if (name === 'problem' && value?.trim()) delete e.problem
      if (name === 'symptomsDuration' && value) delete e.symptomsDuration
      if (name === 'unit' && value) delete e.unit
      if (name === 'paymentType' && value) delete e.paymentType
      if (name === 'patientMobileNumber') {
        const v = value.replace(/\D/g, '').replace(/^0/, '')
        if (/^[6-9]\d{9}$/.test(v)) delete e.patientMobileNumber
        else if (!v) e.patientMobileNumber = 'Mobile required'
        else e.patientMobileNumber = 'Invalid mobile number'
      }
      return e
    })
  }

  const handleNestedChange = async (section, field, value) => {
    setBookingDetails((p) => ({ ...p, [section]: { ...p[section], [field]: value } }))
    // Clear address field errors as soon as a value is entered
    if (section === 'address') {
      setErrors((p) => {
        if (!p.address) return p
        const addrErrs = { ...p.address }
        if (value?.trim()) delete addrErrs[field]
        return { ...p, address: addrErrs }
      })
    }
    if (section === 'address' && field === 'postalCode') {
      if (/^\d{6}$/.test(value)) {
        try {
          const data = await (await fetch(`https://api.postalpincode.in/pincode/${value}`)).json()
          if (data[0].Status === 'Success') {
            const po = data[0].PostOffice[0]
            setBookingDetails((p) => ({
              ...p, address: { ...p.address, city: po.District, state: po.State, postalCode: value },
            }))
            setPostOffices(data[0].PostOffice)
            setIsManualAddress(false)
            // Auto-cleared city/state errors since API filled them
            setErrors((p) => {
              const addrErrs = { ...(p.address || {}) }
              delete addrErrs.city; delete addrErrs.state
              return { ...p, address: addrErrs }
            })
          } else {
            setPostOffices([])
            setIsManualAddress(true)
          }
        } catch {
          setIsManualAddress(true)
        }
      } else {
        setIsManualAddress(false)
      }
    }
  }

  const handleFeeTypeChange = (e) => {
    const v = e.target.value
    setBookingDetails((p) => ({
      ...p, foc: v,
      consultationFee: v === 'FOC' ? 0 : originalConsultationFee || 0,
      focReason: v === 'FOC' ? p.focReason : '',
    }))
    if (v !== 'FOC') clearErr('focReason')
  }

  const fetchSlots = async (doctorId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/getDoctorSlots/${localStorage.getItem('HospitalId')}/${bookingDetails.branchId}/${doctorId}`
      )
      setSlotsForSelectedDate(res.data.success ? res.data.data : [])
    } catch { setSlotsForSelectedDate([]) }
  }

  const convertToBase64 = async (image) => {
    const toB64 = (blob) => new Promise((res, rej) => {
      const r = new FileReader(); r.readAsDataURL(blob)
      r.onloadend = () => res(r.result.split(',')[1]); r.onerror = rej
    })
    try {
      if (!image) return ''
      if (typeof image === 'string') {
        if (image.startsWith('data:image')) return image.split(',')[1]
        if (image.startsWith('http') || image.startsWith('/')) return await toB64(await (await fetch(image)).blob())
        // It's already a raw base64 string
        return image
      }
      if (image instanceof File || image instanceof Blob) return await toB64(image)
      return ''
    } catch { return '' }
  }

  const handlePartClick = async (data) => {
    let actualData = data
    if (Array.isArray(data.answerData)) actualData = data.answerData[0]
    const base64Image = data.image ? await convertToBase64(data.image) : ''
    setPart(actualData.parts || [])
    setMarkedImage(base64Image)
    setTheraphyQuestions(actualData.answerData || {})
    setErrors((p) => { const e = { ...p }; delete e.part; delete e.markedImage; return e })
  }

  // ── Per-tab reset ─────────────────────────────────────────────────────────
  const handleTabReset = () => {
    const tabId = visibleTabs[currentTab]?.id
    setErrors({})
    if (tabId === 'visit') {
      setVisitType('first')
      setSelectedBooking(null)
      setBookingDetails((p) => ({ ...p, visitType: 'first' }))
    }
    if (tabId === 'contact') {
      setPostOffices([]); setSelectedPO(null)
      setBookingDetails((p) => ({
        ...p,
        title: '', name: '', dob: '', age: '', gender: '',
        patientMobileNumber: '', mobileNumber: '',
        address: { houseNo: '', street: '', landmark: '', city: '', state: '', postalCode: '', country: 'India' },
      }))
    }
    if (tabId === 'booking') {
      setOriginalConsultationFee('')
      setSlotsForSelectedDate([]); setSelectedDate(''); setSelectedSlots([])
      setBookingDetails((p) => ({
        ...p,
        branchId: '', branchname: '',
        doctorId: '', doctorName: '', doctorDeviceId: '',
        consultationFee: 0, foc: 'Paid', focReason: '',
        serviceDate: '', servicetime: '',
      }))
    }
    if (tabId === 'slots') {
      setSelectedDate(''); setSelectedSlots([]); setShowAllSlots(false)
      setBookingDetails((p) => ({ ...p, serviceDate: '', servicetime: '' }))
    }
    if (tabId === 'medical') {
      setActivityLevels([]); setOtherReason('')
      setBookingDetails((p) => ({
        ...p,
        problem: '', symptomsDuration: '', unit: '',
        previousInjuries: '', currentMedications: '', allergies: '',
        occupation: '', reasonforVisit: '', activityLevels: [],
        insuranceProvider: '', policyNumber: '', attachments: [],
      }))
    }
    if (tabId === 'payment') {
      setBookingDetails((p) => ({
        ...p, paymentType: '', doctorRefCode: '', referredByType: '', referredByName: '',
      }))
    }
    if (tabId === 'assessment') {
      setPart([]); setMarkedImage(''); setTheraphyQuestions({})
      setOnboardToCustomer(false)
    }
  }

  // ── Full reset ────────────────────────────────────────────────────────────
  const handleFullReset = () => {
    setBookingDetails(getInitialBookingDetails())
    setVisitType('first'); setSelectedBooking(null)
    setSlotsForSelectedDate([]); setSelectedSlots([]); setSelectedDate(new Date().toISOString().split('T')[0])
    setShowAllSlots(false); setActivityLevels([]); setOtherReason('')
    setPart([]); setTheraphyQuestions({}); setMarkedImage('')
    setErrors({}); setCurrentTab(0)
    setPostOffices([]); setSelectedPO(null); setOriginalConsultationFee('')
  }

  // ── Per-tab validation ────────────────────────────────────────────────────
  const validateTab = (tabId) => {
    const e = {}

    if (tabId === 'visit') {
      // No required fields on visit-type tab
    }

    if (tabId === 'contact') {
      if (!selectedBooking && !editData) {
        if (!bookingDetails.title) e.title = 'Select title'
        if (!bookingDetails.name?.trim()) e.name = 'Name is required'
        if (!bookingDetails.dob && !bookingDetails.age) e.dob = 'DOB or Age required'
        if (!bookingDetails.gender) e.gender = 'Select gender'
        if (!bookingDetails.patientMobileNumber) e.patientMobileNumber = 'Mobile required'
        else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber))
          e.patientMobileNumber = 'Invalid mobile number'
        // Address fields
        const addr = bookingDetails.address || {}
        const addrErrs = {}
        if (!addr.houseNo?.trim()) addrErrs.houseNo = 'House No. is required'
        if (!addr.street?.trim()) addrErrs.street = 'Street is required'
        if (!addr.postalCode) addrErrs.postalCode = 'Postal code required'
        // City & State are mandatory only when API couldn't auto-fill (manual address mode)
        if (isManualAddress && !addr.city?.trim()) addrErrs.city = 'City is required'
        if (isManualAddress && !addr.state?.trim()) addrErrs.state = 'State is required'
        if (Object.keys(addrErrs).length > 0) e.address = addrErrs
      }
    }

    if (tabId === 'booking') {
      if (!bookingDetails.branchId) e.branchname = 'Select branch'
      if (!bookingDetails.doctorId) e.doctorName = 'Select doctor'
      if (bookingDetails.foc === 'FOC' && !bookingDetails.focReason?.trim()) e.focReason = 'Enter FOC reason'
    }

    if (tabId === 'slots') {
      if (!bookingDetails.servicetime) e.slot = 'Select a time slot'
    }

    if (tabId === 'medical') {
      if (appointmentType?.toLowerCase().trim() !== 'services') {
        if (!bookingDetails.problem?.trim()) e.problem = 'Problem required'
        if (!bookingDetails.symptomsDuration) e.symptomsDuration = 'Duration required'
        if (!bookingDetails.unit) e.unit = 'Select unit'
      }
    }

    if (tabId === 'payment') {
      if (!bookingDetails.paymentType) e.paymentType = 'Select payment type'
    }

    // assessment tab — optional, no required fields

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Full (submit-time) validation ─────────────────────────────────────────
  const validate = () => {
    const e = {}
    const isEditMode = !!editData

    // ── Patient info: only for new bookings ──────────────────────────────────
    if (!isEditMode && !selectedBooking) {
      if (!bookingDetails.title) e.title = 'Select title'
      if (!bookingDetails.name?.trim()) e.name = 'Name is required'
      if (!bookingDetails.dob) e.dob = 'DOB required'
      if (!bookingDetails.gender) e.gender = 'Select gender'
      if (!bookingDetails.patientMobileNumber) e.patientMobileNumber = 'Mobile required'
      else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber))
        e.patientMobileNumber = 'Invalid mobile number'
    }

    // ── Medical info: required unless service type ───────────────────────────
    if (appointmentType?.toLowerCase().trim() !== 'services') {
      if (!bookingDetails.problem?.trim()) e.problem = 'Problem required'
      if (!bookingDetails.symptomsDuration) e.symptomsDuration = 'Duration required'
      if (!bookingDetails.unit) e.unit = 'Select unit'
    }

    // ── FOC reason ───────────────────────────────────────────────────────────
    if (bookingDetails.foc === 'FOC' && !bookingDetails.focReason?.trim()) e.focReason = 'Enter FOC reason'

    // ── Branch & Doctor ──────────────────────────────────────────────────────
    if (!bookingDetails.branchId) e.branchname = 'Select branch'
    if (!bookingDetails.doctorId) e.doctorName = 'Select doctor'

    // ── Slot: required for new bookings; in edit mode the slot is pre-filled ─
    if (!isEditMode) {
      if (!bookingDetails.servicetime) e.slot = 'Select slot'
    }

    // ── Payment: required for new bookings; edit mode may have legacy records ─
    if (!isEditMode) {
      if (!bookingDetails.paymentType) e.paymentType = 'Select payment type'
    }

    // ── Address: only for new (non-existing-patient) bookings ────────────────
    if (!isEditMode && !selectedBooking) {
      const addr = bookingDetails.address || {}
      const addrErrs = {}
      if (!addr.houseNo?.trim()) addrErrs.houseNo = 'House No. is required'
      if (!addr.street?.trim()) addrErrs.street = 'Street is required'
      if (!addr.postalCode) addrErrs.postalCode = 'Postal code required'
      if (isManualAddress && !addr.city?.trim()) addrErrs.city = 'City is required'
      if (isManualAddress && !addr.state?.trim()) addrErrs.state = 'State is required'
      if (Object.keys(addrErrs).length > 0) e.address = addrErrs
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit handlers ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      showCustomToast('Please fix the errors before submitting.', 'error')
      return
    }
    try {
      setSaveLoading(true)
      // ✅ Exclude unit, address, serviceDate from the spread so they don't bleed into payloads
      const { unit, address, serviceDate: _serviceDate, ...rest } = bookingDetails
      const combinedName = `${bookingDetails.title}${bookingDetails.name}`
      // ✅ Guard: only combine if both parts have actual values
      const durNum = (bookingDetails.symptomsDuration || '').toString().trim()
      const durUnit = (unit || '').trim()
      const combinedDuration = durNum && durUnit ? `${durNum} ${durUnit}` : durNum || ''
      let customerData = null

      if (!selectedBooking && !editData && onboardToCustomer) {
        try {
          const d = new Date(bookingDetails.dob)
          const r = await addCustomer({
            fullName: combinedName, mobileNumber: bookingDetails.mobileNumber, gender: bookingDetails.gender,
            dateOfBirth: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`,
            age: bookingDetails.age,
            hospitalId: localStorage.getItem('HospitalId') || '',
            hospitalName: localStorage.getItem('HospitalName') || '',
            branchId: localStorage.getItem('branchId') || '',
            address,
          })
          customerData = r?.data?.data
        } catch (customerErr) {
          const msg =
            customerErr?.response?.data?.message ||
            customerErr?.response?.data?.error ||
            'Mobile number already exists. Please search for the existing patient.'
          showCustomToast(msg, 'error')
          setSaveLoading(false)
          return
        }
      }

      if (editData) {
        await bookingUpdate({
          ...rest,
          bookingId: editData.bookingId,
          name: combinedName,
          symptomsDuration: combinedDuration,
          // ✅ Preserve the original booking date & time — do NOT allow these to change in edit mode
          serviceDate: editData.serviceDate,
          servicetime: editData.servicetime || editData.time,
          patientAddress: `${address.houseNo}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`,
          attachments: bookingDetails.attachments?.map((f) => f.base64?.split(',')[1] || f).filter(Boolean) || [],
          partImage: markedImage,
          theraphyAnswers: theraphyQuestions,
          parts: part,
          reasonForVisit: bookingDetails.reasonforVisit === 'Others' ? otherReason : bookingDetails.reasonforVisit,
          dob: bookingDetails.dob,
          dateOfBirth: bookingDetails.dob,
          listOfConsultationFee: [{ consulationFee: Number(bookingDetails.consultationFee || 0) }],
        })
      } else {
        await postBooking({
          ...rest,
          name: combinedName,
          symptomsDuration: combinedDuration,
          // ✅ Use the user-selected date for new bookings
          serviceDate: selectedDate,
          patientAddress: `${address.houseNo}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`,
          customerId: selectedBooking?.customerId || customerData?.customerId || '',
          patientId: selectedBooking?.patientId || customerData?.patientId || '',
          attachments: bookingDetails.attachments?.map((f) => f.base64.split(',')[1]) || [],
          partImage: markedImage, theraphyAnswers: theraphyQuestions, parts: part,
          reasonForVisit: bookingDetails.reasonforVisit === 'Others' ? otherReason : bookingDetails.reasonforVisit,
          dob: bookingDetails.dob,
          dateOfBirth: bookingDetails.dob,
          listOfConsultationFee: [{ consulationFee: Number(bookingDetails.consultationFee || 0) }],
        })
      }

      // ✅ Correct order: close → reset → toast → navigate
      onClose()
      handleFullReset()
      showCustomToast('Booking submitted successfully!', 'success')
      navigate('/dashboard')

    } catch (err) {
      console.error(err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to submit booking.'
      showCustomToast(msg, 'error')
    } finally {
      setSaveLoading(false)
    }
  }


  const handleFollowUpSubmit = async () => {
    if (!selectedBooking) {
      showCustomToast('Please select a booking!', 'error')
      return
    }
    try {
      setSaveLoading(true)
      await followUPBooking({
        bookingId: selectedBooking.bookingId, doctorId: selectedBooking.doctorId,
        visitType: 'follow-up', mobileNumber: selectedBooking.mobileNumber,
        serviceDate: selectedDate, servicetime: bookingDetails.servicetime,
        patientId: selectedBooking.patientId, bookingFor: selectedBooking.bookingFor,
        partImage: markedImage, theraphyAnswers: theraphyQuestions, parts: part,
        listOfConsultationFee: [{ consulationFee: Number(bookingDetails.consultationFee || 0) }],
      })

      // ✅ Correct order: close → reset → toast → navigate
      onClose()
      handleFullReset()
      showCustomToast('Follow-up booking submitted successfully!', 'success')
      navigate('/dashboard')

    } catch (err) {
      console.error(err)
      showCustomToast('Failed to submit follow-up booking.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const goNext = () => {
    const currentTabId = visibleTabs[currentTab]?.id
    if (!validateTab(currentTabId)) {
      showCustomToast('Please fill in all required fields before proceeding.', 'error')
      return
    }
    setCurrentTab((t) => Math.min(t + 1, visibleTabs.length - 1))
  }
  const goPrev = () => setCurrentTab((t) => Math.max(t - 1, 0))

  // Guard direct tab clicks — allow going back freely, validate before jumping forward
  const handleTabClick = (idx) => {
    if (idx <= currentTab) {
      setErrors({})
      setCurrentTab(idx)
      return
    }
    // Validate every tab between current and target
    for (let i = currentTab; i < idx; i++) {
      const tabId = visibleTabs[i]?.id
      if (!validateTab(tabId)) {
        showCustomToast('Please fill in all required fields before jumping ahead.', 'error')
        setCurrentTab(i)
        return
      }
    }
    setCurrentTab(idx)
  }

  const { minDate, maxDate } = React.useMemo(() => {
    const today = new Date()
    const maxDate = today.toISOString().split('T')[0]
    const min = new Date()
    min.setFullYear(today.getFullYear() - 120)
    return { minDate: min.toISOString().split('T')[0], maxDate }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // TAB CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const renderTab = () => {
    const tabId = visibleTabs[currentTab]?.id

    // ── 1. VISIT TYPE ─────────────────────────────────────────────────────
    if (tabId === 'visit') return (
      <div>
        <p style={sectionHeadStyle}>Visit Type</p>
        <CRow className="mb-3">
          <CCol md={6} style={{ color: COLORS.primary }}>
            <CFormCheck type="radio" label={<span style={{ color: COLORS.primary }}>First Visit</span>} name="visitTypeRadio" value="first"
              checked={visitType === 'first'} style={{ fontSize: FS, color: COLORS.primary }}
              onChange={() => {
                setVisitType('first')
                setBookingDetails((p) => ({
                  ...p, visitType: 'first',
                  foc: 'Paid',
                  consultationFee: originalConsultationFee || 0,
                }))
                setSlotsForSelectedDate([]); setSelectedDate(new Date().toISOString().split('T')[0]); setSelectedSlots([])
              }} />
          </CCol>
          <CCol md={6} style={{ color: COLORS.primary }}>
            <CFormCheck type="radio" label={<span style={{ color: COLORS.primary }}>Follow-Up</span>} name="visitTypeRadio" value="followup"
              checked={visitType === 'followup'} style={{ fontSize: FS, color: COLORS.primary }}
              onChange={() => {
                setVisitType('followup')
                setBookingDetails((p) => ({
                  ...p, visitType: 'followup',
                  foc: (Number(selectedBooking?.freeFollowUpsLeft || 0) > 0) ? 'FOC' : p.foc,
                  consultationFee: (Number(selectedBooking?.freeFollowUpsLeft || 0) > 0) ? 0 : p.consultationFee,
                }))
                setSlotsForSelectedDate([]); setSelectedDate(new Date().toISOString().split('T')[0]); setSelectedSlots([])
              }} />
          </CCol>
        </CRow>
        <BookingSearch
          visitType={visitType}
          fetchSlots={fetchSlots}
          onSelectBooking={(b) => setSelectedBooking(b)}
        />
      </div>
    )

    // ── 2. CONTACT INFO ───────────────────────────────────────────────────
    if (tabId === 'contact') return (
      <div>
        <p style={sectionHeadStyle}>Contact Information</p>
        {!selectedBooking ? (
          <CRow className="g-3">
            <CCol md={2}>
              <CFormLabel style={labelStyle}>Title <span className="text-danger">*</span></CFormLabel>
              <CFormSelect name="title" value={bookingDetails.title} onChange={handleBookingChange} style={selectStyle(errors.title)}>
                <option value="">Title</option>
                {['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.'].map((t) => <option key={t}>{t}</option>)}
              </CFormSelect>
              <ErrMsg msg={errors.title} />
            </CCol>
            <CCol md={6}>
              <CFormLabel style={labelStyle}>Name <span className="text-danger">*</span></CFormLabel>
              <CFormInput name="name" value={bookingDetails.name || ''} onChange={handleBookingChange}
                minLength={3} maxLength={50} style={inputStyle(errors.name)} />
              <ErrMsg msg={errors.name} />
            </CCol>
            <CCol md={4}>
              <CFormLabel style={labelStyle}>Date of Birth</CFormLabel>
              <CFormInput type="date" name="dob" value={bookingDetails.dob || ''}
                onChange={handleBookingChange} min={minDate} max={maxDate}
                style={inputStyle(errors.dob)} />
              <ErrMsg msg={errors.dob} />
            </CCol>
            <CCol md={2}>
              <CFormLabel style={labelStyle}>Age <span className="text-danger">*</span></CFormLabel>
              <CFormInput type="number" name="age" value={bookingDetails.age || ''}
                onChange={handleBookingChange}
                style={inputStyle(errors.age)} />
              <ErrMsg msg={errors.age} />
            </CCol>
            <CCol md={4}>
              <CFormLabel style={labelStyle}>Gender <span className="text-danger">*</span></CFormLabel>
              <CFormSelect name="gender" value={bookingDetails.gender || ''} onChange={handleBookingChange} style={selectStyle(errors.gender)}>
                <option value="">Select Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </CFormSelect>
              <ErrMsg msg={errors.gender} />
            </CCol>
            <CCol md={6}>
              <CFormLabel style={labelStyle}>Mobile Number <span className="text-danger">*</span></CFormLabel>
              <CFormInput type="tel" name="patientMobileNumber" value={bookingDetails.patientMobileNumber || ''}
                onChange={handleBookingChange} maxLength={10} style={inputStyle(errors.patientMobileNumber)} />
              <ErrMsg msg={errors.patientMobileNumber} />
            </CCol>

            <CCol md={12}>
              <p style={{ ...sectionHeadStyle, marginTop: '8px' }}>Address</p>
              <CRow className="g-3">
                {['houseNo', 'street', 'landmark'].map((field) => {
                  const isRequired = field === 'houseNo' || field === 'street'
                  const fieldLabel = field === 'houseNo' ? 'House No' : field === 'street' ? 'Street' : 'Landmark'
                  return (
                    <CCol md={4} key={field}>
                      <CFormLabel style={labelStyle}>
                        {fieldLabel} {isRequired && <span className="text-danger">*</span>}
                      </CFormLabel>
                      <CFormInput
                        value={bookingDetails.address?.[field] || ''}
                        style={inputStyle(errors.address?.[field])}
                        onChange={(e) => handleNestedChange('address', field, e.target.value)}
                      />
                      {isRequired && <ErrMsg msg={errors.address?.[field]} />}
                    </CCol>
                  )
                })}
                <CCol md={4}>
                  <CFormLabel style={labelStyle}>Postal Code <span className="text-danger">*</span></CFormLabel>
                  <CFormInput type="text" maxLength={6} value={bookingDetails.address?.postalCode || ''}
                    style={inputStyle(errors.address?.postalCode)}
                    onChange={(e) => {
                      handleNestedChange('address', 'postalCode', e.target.value)
                      if (e.target.value.length === 6)
                        fetch(`https://api.postalpincode.in/pincode/${e.target.value}`)
                          .then((r) => r.json())
                          .then((d) => { if (d[0].Status === 'Success') setPostOffices(d[0].PostOffice) })
                      else setPostOffices([])
                    }} />
                  <ErrMsg msg={errors.address?.postalCode} />
                </CCol>
                {postOffices.length > 0 && (
                  <CCol md={4}>
                    <CFormLabel style={labelStyle}>PO Address</CFormLabel>
                    <CFormSelect value={selectedPO?.Name || ''} style={selectStyle(false)}
                      onChange={(e) => {
                        const po = postOffices.find((p) => p.Name === e.target.value)
                        setSelectedPO(po)
                        if (po) {
                          handleNestedChange('address', 'city', po.Block || '')
                          handleNestedChange('address', 'state', po.State || '')
                        }
                      }}>
                      <option value="">-- Select Post Office --</option>
                      {postOffices.map((po) => (
                        <option key={po.Name} value={po.Name}>{po.Name.toUpperCase()}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                )}
                <CCol md={4}>
                  <CFormLabel style={labelStyle}>
                    City {isManualAddress && <span className="text-danger">*</span>}
                  </CFormLabel>
                  <CFormInput
                    value={bookingDetails.address?.city || ''}
                    readOnly={!isManualAddress}
                    onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    style={inputStyle(isManualAddress && errors.address?.city)}
                  />
                  {isManualAddress && <ErrMsg msg={errors.address?.city} />}
                </CCol>
                <CCol md={4}>
                  <CFormLabel style={labelStyle}>
                    State {isManualAddress && <span className="text-danger">*</span>}
                  </CFormLabel>
                  <CFormInput
                    value={bookingDetails.address?.state || ''}
                    readOnly={!isManualAddress}
                    onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                    style={inputStyle(isManualAddress && errors.address?.state)}
                  />
                  {isManualAddress && <ErrMsg msg={errors.address?.state} />}
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        ) : (
          <div className="p-3" style={{ background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ margin: 0, fontWeight: '600', fontSize: FS, color: COLORS.primary }}>{selectedBooking.name}</p>
            <p style={{ margin: 0, fontSize: FS, color: '#555' }}>
              {selectedBooking.mobileNumber} · {selectedBooking.gender} · Age {selectedBooking.age}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{selectedBooking.patientAddress}</p>
          </div>
        )}
      </div>
    )

    // ── 3. BOOKING DETAILS ────────────────────────────────────────────────
    if (tabId === 'booking') return (
      <div>
        <p style={sectionHeadStyle}>Patient & Booking Details</p>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Branch <span className="text-danger">*</span></CFormLabel>
            <CFormSelect name="branchId" value={bookingDetails.branchId || ''} style={selectStyle(errors.branchname)}
              onChange={(e) => {
                const b = branches.find((br) => br.branchId === e.target.value)
                setBookingDetails((p) => ({
                  ...p, branchId: b?.branchId || '', branchname: b?.branchName || '',
                  doctorId: '', doctorName: '', consultationFee: 0, servicetime: '', serviceDate: '',
                }))
                setSlotsForSelectedDate([]); setSelectedDate(new Date().toISOString().split('T')[0]); setSelectedSlots([])
                if (e.target.value) clearErr('branchname')
              }}>
              <option value="">Select Branch</option>
              {branches.map((b) => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
            </CFormSelect>
            <ErrMsg msg={errors.branchname} />
          </CCol>

          <CCol md={6}>
            <CFormLabel style={labelStyle} className="d-flex align-items-center justify-content-between">
              <span>Doctor <span className="text-danger">*</span></span>
              <RefreshCw size={16}
                onClick={fetchDoctors}
                style={{ cursor: 'pointer', color: COLORS.primary }}
                className={loadingDoctors ? 'spin' : ''} />
            </CFormLabel>
            <CFormSelect name="doctorName" value={bookingDetails.doctorId || ''} disabled={loadingFee || loadingDoctors}
              style={selectStyle(errors.doctorName)}
              onChange={async (e) => {
                const id = e.target.value
                const doc = doctors.find((d) => d.doctorId === id)
                if (!doc) {
                  setBookingDetails((p) => ({ ...p, doctorId: '', doctorName: '', doctorDeviceId: '', consultationFee: 0 }))
                  return
                }
                setBookingDetails((p) => ({
                  ...p, doctorId: doc.doctorId, doctorName: doc.doctorName,
                  doctorDeviceId: doc.doctorDeviceId,
                  consultationFee: (p.foc === 'FOC' || isFollowupStatus) ? 0 : doc.doctorFees.inClinicFee || 0,
                }))
                setOriginalConsultationFee(doc.doctorFees.inClinicFee || 0)
                if (id) clearErr('doctorName')
                setLoadingFee(true)
                try { await fetchSlots(id) } catch { } finally { setLoadingFee(false) }
              }}>
              <option value="">{loadingDoctors ? 'Loading...' : 'Select Doctor'}</option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorId}
                  disabled={!d.doctorAvailabilityStatus}
                  style={{ color: d.doctorAvailabilityStatus ? 'inherit' : '#aaa', fontSize: FS }}>
                  {d.doctorName}{!d.doctorAvailabilityStatus ? ' (Not Available)' : ''}
                </option>
              ))}
            </CFormSelect>
            <ErrMsg msg={errors.doctorName} />
          </CCol>

          <CCol md={6}>
            <CFormLabel style={labelStyle}>Consultation Fee</CFormLabel>
            <CFormInput type="number" value={bookingDetails.consultationFee || 0} disabled style={inputStyle(false)} />
          </CCol>
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Fee Type <span className="text-danger">*</span></CFormLabel>
            <CFormSelect value={bookingDetails.foc} onChange={handleFeeTypeChange} style={selectStyle(false)}>
              <option value="Paid">Paid</option>
              <option value="FOC">FOC (Free of Consultation)</option>
            </CFormSelect>
          </CCol>
          {bookingDetails.foc === 'FOC' && (
            <CCol md={12}>
              <CFormLabel style={labelStyle}>Reason for FOC <span className="text-danger">*</span></CFormLabel>
              <CFormInput value={bookingDetails.focReason || ''} placeholder="Enter reason"
                style={inputStyle(errors.focReason)}
                onChange={(e) => {
                  setBookingDetails((p) => ({ ...p, focReason: e.target.value }))
                  e.target.value?.trim() ? clearErr('focReason') : setErr('focReason', 'Enter FOC reason')
                }} />
              <ErrMsg msg={errors.focReason} />
            </CCol>
          )}
        </CRow>
      </div>
    )

    // ── 4. SLOTS ──────────────────────────────────────────────────────────
    if (tabId === 'slots') return (
      <div>
        {editData && (
          <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #d0dce9' }}>
            <h6 style={{ color: '#185fa5', marginBottom: '8px' }}>Current Appointment Time</h6>
            <div className="d-flex gap-4">
              <div><strong>Date:</strong> {editData.serviceDate || editData.date || 'N/A'}</div>
              <div><strong>Time:</strong> {editData.servicetime || editData.time || 'N/A'}</div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280' }}>
              * If you want to change the date or time, you can select new dates and slots below.
            </p>
          </div>
        )}
        <p style={sectionHeadStyle}>Available Slots</p>
        <div className="d-flex gap-2 flex-wrap mb-3">
          {(slotsForSelectedDate || [])
            .map((s) => s.day || s.date)
            .filter((d) => {
              const t = new Date(); t.setHours(0, 0, 0, 0)
              const dt = new Date(d); dt.setHours(0, 0, 0, 0)
              if (editData && new Date(editData.serviceDate).toDateString() === dt.toDateString()) return true
              return dt >= t
            })
            .sort((a, b) => new Date(a) - new Date(b))
            .map((dateValue, idx) => {
              const dateObj = new Date(dateValue)
              const isSelected = new Date(selectedDate).toDateString() === dateObj.toDateString()
              return (
                <CButton key={idx}
                  onClick={() => {
                    const fd = dateObj.toISOString().split('T')[0]
                    setSelectedDate(fd); setSelectedSlots([])
                    setBookingDetails((p) => ({ ...p, serviceDate: fd, servicetime: '' }))
                    clearErr('slot')
                  }}
                  style={{
                    backgroundColor: isSelected ? COLORS.primary : 'white',
                    color: isSelected ? '#fff' : COLORS.primary,
                    border: '1px solid var(--color-bgcolor)',
                    minWidth: '80px', fontSize: FS,
                  }}>
                  <div style={{ fontSize: FS, fontWeight: '600', color: isSelected ? '#fff' : COLORS.primary }}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '11px', color: isSelected ? '#fff' : COLORS.primary }}>
                    {dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </div>
                </CButton>
              )
            })}
        </div>

        <CCard className="mb-3">
          <CCardBody>
            {slotsToShow.length === 0
              ? <p className="text-center" style={{ color: COLORS.primary, fontSize: FS, margin: 0 }}>
                No available slots for this date
              </p>
              : <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '6px' }}>
                  {visibleSlots.map((slotObj, i) => {
                    const isBooked = slotObj.slotbooked
                    const isSel = selectedSlots.includes(slotObj.slot)
                    return (
                      <div key={i}
                        onClick={() => {
                          if (isBooked) return
                          setSelectedSlots([slotObj.slot])
                          setBookingDetails((p) => ({ ...p, servicetime: slotObj.slot }))
                          clearErr('slot')
                        }}
                        style={{
                          padding: '6px 4px', textAlign: 'center', fontSize: '12px',
                          border: `1px solid ${isBooked ? '#f8d7da' : isSel ? COLORS.primary : '#ddd'}`,
                          borderRadius: '5px', cursor: isBooked ? 'not-allowed' : 'pointer',
                          backgroundColor: isBooked ? '#f8d7da' : isSel ? COLORS.primary : '#fff',
                          color: isBooked ? '#842029' : isSel ? '#fff' : COLORS.primary,
                          fontWeight: isSel ? '600' : '400',
                        }}>
                        {slotObj.slot}
                      </div>
                    )
                  })}
                </div>
                {sortedSlots.length > 12 && (
                  <div className="text-center mt-2">
                    <CButton color="secondary" size="sm" style={{ fontSize: FS }}
                      onClick={() => setShowAllSlots(!showAllSlots)}>
                      {showAllSlots ? 'Show Less' : 'Show More'}
                    </CButton>
                  </div>
                )}
              </>
            }
          </CCardBody>
        </CCard>
        <ErrMsg msg={errors.slot} />
      </div>
    )

    // ── 5. MEDICAL HISTORY ────────────────────────────────────────────────
    if (tabId === 'medical') return (
      <div>
        <p style={sectionHeadStyle}>Medical & Lifestyle History</p>
        <CRow className="g-3">
          <CCol md={5}>
            <CFormLabel style={labelStyle}>
              Patient Complaints {appointmentType?.toLowerCase() !== 'services' && <span className="text-danger">*</span>}
            </CFormLabel>
            <CFormTextarea name="problem" value={bookingDetails.problem} onChange={handleBookingChange}
              minLength={5} maxLength={300} style={textareaStyle(errors.problem)} />
            <ErrMsg msg={errors.problem} />
          </CCol>
          <CCol md={4}>
            <CFormLabel style={labelStyle}>
              Symptoms Duration {appointmentType?.toLowerCase() !== 'services' && <span className="text-danger">*</span>}
            </CFormLabel>
            <CFormInput type="text" name="symptomsDuration" value={bookingDetails.symptomsDuration}
              style={inputStyle(errors.symptomsDuration)}
              onChange={(e) => {
                setBookingDetails((p) => ({ ...p, symptomsDuration: e.target.value.replace(/\D/g, '') }))
                e.target.value ? clearErr('symptomsDuration') : setErr('symptomsDuration', 'Duration required')
              }} />
            <ErrMsg msg={errors.symptomsDuration} />
          </CCol>
          <CCol md={3}>
            <CFormLabel style={labelStyle}>
              Unit {appointmentType?.toLowerCase() !== 'services' && <span className="text-danger">*</span>}
            </CFormLabel>
            <CFormSelect name="unit" value={bookingDetails.unit || ''} onChange={handleBookingChange} style={selectStyle(errors.unit)}>
              <option value="">Select Unit</option>
              {['Day', 'Week', 'Month', 'Year'].map((u) => <option key={u}>{u}</option>)}
            </CFormSelect>
            <ErrMsg msg={errors.unit} />
          </CCol>

          {['previousInjuries', 'currentMedications', 'allergies', 'occupation'].map((field) => (
            <CCol md={4} key={field}>
              <CFormLabel style={labelStyle} className="text-capitalize">
                {field.replace(/([A-Z])/g, ' $1')}
              </CFormLabel>
              <CFormInput name={field} value={bookingDetails[field] || ''} onChange={handleBookingChange} style={inputStyle(false)} />
            </CCol>
          ))}

          <CCol md={12}>
            <CFormLabel style={labelStyle}>Reason for Visit</CFormLabel>
            <div className="d-flex gap-3 flex-wrap mt-1">
              {reasonOptions.map((item) => (
                <div key={item} className="d-flex align-items-center gap-1">
                  <input type="radio" name="reasonforVisit" value={item}
                    checked={bookingDetails.reasonforVisit === item}
                    onChange={() => setBookingDetails((p) => ({ ...p, reasonforVisit: item }))} />
                  <label style={{ ...labelStyle, marginBottom: 0 }}>{item}</label>
                </div>
              ))}
            </div>
          </CCol>
          {bookingDetails.reasonforVisit === 'Others' && (
            <CCol md={6}>
              <CFormLabel style={labelStyle}>Enter Reason <span className="text-danger">*</span></CFormLabel>
              <CFormInput placeholder="Enter custom reason" value={otherReason}
                style={inputStyle(false)} onChange={(e) => setOtherReason(e.target.value)} />
            </CCol>
          )}

          <CCol md={12}>
            <CFormLabel style={labelStyle}>Activity Level</CFormLabel>
            <div className="d-flex gap-3 flex-wrap mt-1">
              {activityOptions.map((level) => (
                <div key={level} className="d-flex align-items-center gap-1">
                  <input type="checkbox" value={level} checked={activityLevels.includes(level)}
                    onChange={() => setActivityLevels((p) =>
                      p.includes(level) ? p.filter((l) => l !== level) : [...p, level]
                    )} />
                  <label style={{ ...labelStyle, marginBottom: 0 }}>{level}</label>
                </div>
              ))}
            </div>
          </CCol>

          <CCol md={12}><p style={{ ...sectionHeadStyle, marginTop: '8px' }}>Insurance Info</p></CCol>
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Insurance Provider</CFormLabel>
            <CFormInput name="insuranceProvider" value={bookingDetails.insuranceProvider || ''}
              onChange={handleBookingChange} style={inputStyle(false)} />
          </CCol>
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Policy Number</CFormLabel>
            <CFormInput name="policyNumber" value={bookingDetails.policyNumber || ''}
              onChange={handleBookingChange} style={inputStyle(false)} />
          </CCol>

          <CCol md={6}>
            <p style={{ ...sectionHeadStyle, marginTop: '8px' }}>Previous Medical Records (Optional)</p>
            <CFormInput type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style={{ fontSize: FS }}
              onChange={async (e) => {
                const newFiles = Array.from(e.target.files)
                if (newFiles.length + (bookingDetails.attachments?.length || 0) > 6) {
                  showCustomToast('Maximum 6 files allowed.', 'error'); e.target.value = ''; return
                }
                const processed = await Promise.all(newFiles.map(async (file) => {
                  let f = file
                  if (file.size > 250 * 1024 && file.type.startsWith('image/'))
                    try {
                      f = await imageCompression(file, { maxSizeMB: 0.25, maxWidthOrHeight: 1920, useWebWorker: true })
                    } catch { }
                  const base64 = await new Promise((res, rej) => {
                    const r = new FileReader(); r.readAsDataURL(f)
                    r.onload = () => res(r.result); r.onerror = rej
                  })
                  return { name: file.name, base64 }
                }))
                setBookingDetails((p) => ({ ...p, attachments: [...(p.attachments || []), ...processed] }))
              }} />
            {bookingDetails.attachments?.map((file, i) => (
              <div key={i} className="d-flex align-items-center mt-1 gap-2" style={{ fontSize: FS }}>
                <span>{file.name}</span>
                <button type="button"
                  style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', lineHeight: 1 }}
                  onClick={() => setBookingDetails((p) => ({
                    ...p, attachments: p.attachments.filter((_, idx) => idx !== i),
                  }))}>×</button>
              </div>
            ))}
          </CCol>
        </CRow>
      </div>
    )

    // ── 6. PAYMENT ────────────────────────────────────────────────────────
    if (tabId === 'payment') return (
      <div>
        <p style={sectionHeadStyle}>Payment Details</p>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Payment Type <span className="text-danger">*</span></CFormLabel>
            <CFormSelect name="paymentType" value={bookingDetails.paymentType} style={selectStyle(errors.paymentType)}
              onChange={(e) => {
                setBookingDetails((p) => ({ ...p, paymentType: e.target.value }))
                e.target.value ? clearErr('paymentType') : setErr('paymentType', 'Select payment type')
              }}>
              <option value="">Select Payment Type</option>
              {['Cash', 'Card', 'UPI', 'Not Paid'].map((t) => <option key={t}>{t}</option>)}
            </CFormSelect>
            <ErrMsg msg={errors.paymentType} />
          </CCol>
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Referred By</CFormLabel>
            <Select styles={rsStyles}
              value={
                referDoctor.find((d) => d.referralId === bookingDetails.doctorRefCode) ||
                (bookingDetails.doctorRefCode === 'OTHER' ? { referralId: 'OTHER', fullName: 'Others' } : null)
              }
              getOptionLabel={(o) => o.referralId === 'OTHER'
                ? 'Others'
                : `${o.fullName} - ${o.mobileNumber}`
              }
              getOptionValue={(o) => o.referralId}
              onChange={(sel) => {
                const v = sel ? sel.referralId : ''
                setBookingDetails((p) => ({
                  ...p, doctorRefCode: v,
                  referredByType: v === 'OTHER' ? '' : p.referredByType,
                  referredByName: v === 'OTHER' ? '' : p.referredByName,
                }))
              }}
              options={[...referDoctor, { referralId: 'OTHER', fullName: 'Others' }]}
              placeholder="Select or search..." isSearchable />
          </CCol>
          {bookingDetails.doctorRefCode === 'OTHER' && (
            <>
              <CCol md={6}>
                <CFormLabel style={labelStyle}>Referred By Type</CFormLabel>
                <CFormSelect value={bookingDetails.referredByType || ''} style={selectStyle(false)}
                  onChange={(e) => setBookingDetails((p) => ({ ...p, referredByType: e.target.value }))}>
                  <option value="">Select Type</option>
                  {['Friend', 'Family', 'Facebook', 'Instagram', 'Google', 'Advertisement', 'Other'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel style={labelStyle}>Referred Person Name</CFormLabel>
                <CFormInput value={bookingDetails.referredByName || ''} style={inputStyle(false)}
                  onChange={(e) => setBookingDetails((p) => ({ ...p, referredByName: e.target.value }))} />
              </CCol>
            </>
          )}
        </CRow>
      </div>
    )

    // ── 7. PAIN ASSESSMENT ────────────────────────────────────────────────
    if (tabId === 'assessment') return (
      <div>
        <p style={sectionHeadStyle}>Pain Assessment</p>
        <BodyAssessment onPartClick={handlePartClick} initialSelected={part} initialAnswers={theraphyQuestions} initialImage={markedImage} />
        <ErrMsg msg={errors.part} />
        {markedImage && (
          <div className="mt-2">
            <CFormLabel style={labelStyle}>Marked Area Preview</CFormLabel>
            <img src={`data:image/png;base64,${markedImage}`} width={180} alt="preview"
              style={{ display: 'block', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
        )}
        {/* <ErrMsg msg={errors.markedImage} /> */}
        {(!selectedBooking || !selectedBooking.customerId) && !editData && (
          <div className="form-check mt-3">
            <input className="form-check-input" type="checkbox" id="onboardCheckbox"
              checked={onboardToCustomer} onChange={(e) => setOnboardToCustomer(e.target.checked)} />
            <label className="form-check-label" htmlFor="onboardCheckbox"
              style={{ ...labelStyle, marginBottom: 0 }}>
              Onboard as new customer
            </label>
          </div>
        )}
      </div>
    )

    return null
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (


    <COffcanvas placement="end" visible={visible} onHide={onClose} className="w-75" backdrop="static">
      <COffcanvasHeader style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <COffcanvasTitle style={{ fontSize: '14px', fontWeight: '600', color: COLORS.primary }}>
          📅 Book Appointment
        </COffcanvasTitle>
        <button className="btn-close" onClick={onClose} />
      </COffcanvasHeader>

      <COffcanvasBody style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>

        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid #eee', backgroundColor: '#fafafa', padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {visibleTabs.map((tab, idx) => {
              const isActive = idx === currentTab
              const isComplete = idx < currentTab
              return (
                <button key={tab.id} onClick={() => handleTabClick(idx)}
                  style={{
                    padding: '9px 12px', fontSize: FS,
                    fontWeight: isActive ? '600' : '400',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--color-bgcolor)' : '2px solid transparent',
                    background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
                    color: isActive ? COLORS.primary : isComplete ? '#555' : '#aaa',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                  {isComplete
                    ? <span style={{ fontSize: '10px', color: '#4caf50', fontWeight: '700' }}>✓</span>
                    : <span style={{ fontSize: '11px', color: isActive ? COLORS.primary : '#bbb' }}>{idx + 1}.</span>
                  }
                  {tab.label}
                </button>
              )
            })}
          </div>
          {/* Progress bar */}
          <div style={{ height: '3px', background: '#eee', marginTop: '-2px' }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: COLORS.primary, transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {renderTab()}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid #eee', padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: '#fafafa', flexShrink: 0,
        }}>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Step {currentTab + 1} of {visibleTabs.length}
          </span>

          <div className="d-flex gap-2 align-items-center">
            {/* Cancel */}
            <CButton color="secondary" size="sm"
              style={{ fontSize: FS, padding: '4px 14px' }}
              onClick={() => { handleFullReset(); onClose() }}>
              Cancel
            </CButton>

            {/* Reset current tab */}
            <CButton size="sm"
              title={`Reset "${visibleTabs[currentTab]?.label}" fields only`}
              style={{
                fontSize: FS, padding: '4px 14px',
                backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffc107',
              }}
              onClick={handleTabReset}>
              🔄 Reset
            </CButton>

            {/* Back */}
            {currentTab > 0 && (
              <CButton size="sm"
                style={{
                  fontSize: FS, padding: '4px 14px',
                  backgroundColor: '#f0f0f0', color: '#555', border: '1px solid #ccc',
                }}
                onClick={goPrev}>
                ← Back
              </CButton>
            )}

            {/* Next / Submit */}
            {currentTab < visibleTabs.length - 1 ? (
              <CButton size="sm"
                style={{
                  fontSize: FS, padding: '4px 14px',
                  backgroundColor: COLORS.primary, color: '#fff', border: 'none',
                }}
                onClick={goNext}>
                Next →
              </CButton>
            ) : (
              <CButton size="sm" disabled={saveloading}
                style={{
                  fontSize: FS, padding: '4px 14px',
                  backgroundColor: COLORS.primary, color: '#fff', border: 'none',
                }}
                onClick={visitType === 'followup' ? handleFollowUpSubmit : handleSubmit}>
                {saveloading ? 'Submitting…' : '✓ Submit'}
              </CButton>
            )}
          </div>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  )
}

export default BookAppointmentModal