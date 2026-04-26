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

import { GetClinicBranches } from '../Doctors/DoctorAPI'
import { useNavigate } from 'react-router-dom'
import { getAllReferDoctors } from '../EmployeeManagement/ReferDoctor/ReferDoctorAPI'
import Select from 'react-select'
import { CategoryData } from '../ProcedureManagement/ProcedureManagementAPI'
import { BASE_URL } from '../../baseUrl'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
import BookingSearch from '../widgets/BookingSearch '
import { followUPBooking, postBooking } from '../../APIs/BookServiceAPi'
import { addCustomer } from '../customerManagement/CustomerManagementAPI'
import { showCustomToast } from '../../Utils/Toaster'
import imageCompression from 'browser-image-compression'
import BodyAssessment from './BodyAssessment'

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

// ─── Single font-size token — change here to update everywhere ─────────────────
const FS = '13px'

// ─── Reusable style factories ─────────────────────────────────────────────────
const inputStyle = (hasErr) => ({
  fontSize: FS,
  height: '34px',
  padding: '4px 10px',
  borderColor: hasErr ? '#dc3545' : undefined,
})
const selectStyle = (hasErr) => ({
  fontSize: FS,
  height: '34px',
  padding: '4px 8px',
  borderColor: hasErr ? '#dc3545' : undefined,
})
const textareaStyle = (hasErr) => ({
  fontSize: FS,
  padding: '6px 10px',
  minHeight: '80px',
  borderColor: hasErr ? '#dc3545' : undefined,
})
const labelStyle = {
  color: 'var(--color-bgcolor)',
  fontSize: '12px',
  fontWeight: '500',
  marginBottom: '3px',
  display: 'block',
}
const sectionHeadStyle = {
  fontSize: FS,
  fontWeight: '600',
  borderBottom: '1px solid var(--color-bgcolor)',
  paddingBottom: '6px',
  marginBottom: '14px',
  color: 'var(--color-bgcolor)',
}
const errStyle = { fontSize: '11px', color: '#dc3545', marginTop: '3px', marginBottom: 0 }

// react-select consistent sizing
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

// Small helper so error messages are one-liners
const ErrMsg = ({ msg }) => msg ? <p style={errStyle}>{msg}</p> : null

// ─────────────────────────────────────────────────────────────────────────────
const BookAppointmentModal = ({ visible, onClose }) => {
  const navigate = useNavigate()
  const { selectedHospital, doctorData } = useHospital()

  const [currentTab, setCurrentTab] = useState(0)

  const [visitType, setVisitType] = useState('first')
  const [appointmentType] = useState('services')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
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
    address: { houseNo: '', street: '', landmark: '', city: '', state: '', postalCode: '', country: 'India' },
  })

  const [bookingDetails, setBookingDetails] = useState(getInitialBookingDetails)

  // ── Slot filtering / sorting ──────────────────────────────────────────────
  const now = new Date()
  const slotsToShow = (slotsForSelectedDate || [])
    .filter((s) => new Date(s.day || s.date).toDateString() === new Date(selectedDate).toDateString())
    .flatMap((s) => s.availableSlots || [])
    .filter((slotObj) => {
      const slotDate = new Date(selectedDate)
      const [time, meridian] = slotObj.slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      slotDate.setHours(hours, minutes, 0, 0)
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

  const visibleTabs = TABS.filter((t) => {
    if (visitType === 'followup' && ['contact', 'medical', 'payment'].includes(t.id)) return false
    return true
  })
  const progressPct = Math.round(((currentTab + 1) / visibleTabs.length) * 100)

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

  useEffect(() => {
    if (!bookingDetails.branchId || !doctorData?.data) { setDoctors([]); return }
    setDoctors(doctorData.data.filter((d) => d.branchId === bookingDetails.branchId))
  }, [bookingDetails.branchId, doctorData])

  useEffect(() => {
    setBookingDetails((p) => ({ ...p, activityLevels }))
  }, [activityLevels])

  useEffect(() => {
    if (!selectedBooking) return
    const parts = (selectedBooking.patientAddress || '').split(',')
    setBookingDetails((p) => ({
      ...p,
      name: selectedBooking.name || '',
      patientId: selectedBooking.patientId || '',
      dob: selectedBooking.dob || '',
      age: selectedBooking.age || '',
      gender: selectedBooking.gender || '',
      patientMobileNumber: selectedBooking.mobileNumber || '',
      address: {
        houseNo: parts[0]?.trim() || '', street: parts[1]?.trim() || '',
        landmark: parts[2]?.trim() || '', city: parts[3]?.trim() || '',
        state: parts[4]?.trim() || '', postalCode: parts[5]?.trim() || '',
        country: parts[6]?.trim() || 'India',
      },
    }))
  }, [selectedBooking])

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

        if (age > 120) {
          setErr('dob', 'Age cannot be more than 120 years')
        } else if (age < 0) {
          setErr('dob', 'Invalid DOB')
        } else {
          clearErr('dob')
        }
      }
      if (name === 'age' && value) {
        const d = new Date(); d.setFullYear(new Date().getFullYear() - parseInt(value))
        u.dob = d.toISOString().split('T')[0]
      }
      return u
    })

    // clear errors as user types valid values
    setErrors((prev) => {
      const e = { ...prev }
      if (name === 'name') { value?.trim() ? delete e.name : (e.name = 'Name is required') }
      if (name === 'patientMobileNumber') {
        const v = value.replace(/\D/g, '').replace(/^0/, '')
        if (!v) e.patientMobileNumber = 'Mobile required'
        else if (!/^[6-9]\d{9}$/.test(v)) e.patientMobileNumber = 'Invalid mobile number'
        else delete e.patientMobileNumber
      }
      if (name === 'gender') { value ? delete e.gender : (e.gender = 'Select gender') }
      if (name === 'dob') { value ? delete e.dob : (e.dob = 'DOB required') }
      if (name === 'problem') { value?.trim() ? delete e.problem : (e.problem = 'Problem required') }
      if (name === 'symptomsDuration') { value ? delete e.symptomsDuration : (e.symptomsDuration = 'Duration required') }
      if (name === 'unit') { value ? delete e.unit : (e.unit = 'Select unit') }
      return e
    })
  }

  const handleNestedChange = async (section, field, value) => {
    setBookingDetails((p) => ({ ...p, [section]: { ...p[section], [field]: value } }))
    if (section === 'address' && field === 'postalCode') {
      if (value) setErrors((p) => { const e = { ...p }; if (e.address) delete e.address.postalCode; return e })
      if (/^\d{6}$/.test(value)) {
        try {
          const data = await (await fetch(`https://api.postalpincode.in/pincode/${value}`)).json()
          if (data[0].Status === 'Success') {
            const po = data[0].PostOffice[0]
            setBookingDetails((p) => ({ ...p, address: { ...p.address, city: po.District, state: po.State, postalCode: value } }))
            setPostOffices(data[0].PostOffice)
          }
        } catch { }
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
      if (typeof image === 'string' && image.startsWith('data:image')) return image.split(',')[1]
      if (image instanceof File || image instanceof Blob) return await toB64(image)
      if (typeof image === 'string') return await toB64(await (await fetch(image)).blob())
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

  // ── Per-tab reset — stays on current tab ──────────────────────────────────
  const handleTabReset = () => {
    const tabId = visibleTabs[currentTab]?.id
    setErrors({})   // clear only this tab's errors

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

  // ── Full reset used on cancel / after submit ───────────────────────────────
  const handleFullReset = () => {
    setBookingDetails(getInitialBookingDetails())
    setVisitType('first'); setSelectedBooking(null)
    setSlotsForSelectedDate([]); setSelectedSlots([]); setSelectedDate('')
    setShowAllSlots(false); setActivityLevels([]); setOtherReason('')
    setPart([]); setTheraphyQuestions({}); setMarkedImage('')
    setErrors({}); setCurrentTab(0)
    setPostOffices([]); setSelectedPO(null); setOriginalConsultationFee('')
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!bookingDetails.name?.trim()) e.name = 'Name is required'
    if (!selectedBooking && !bookingDetails.dob) e.dob = 'DOB required'
    if (!bookingDetails.gender) e.gender = 'Select gender'
    if (!bookingDetails.patientMobileNumber) e.patientMobileNumber = 'Mobile required'
    else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber))
      e.patientMobileNumber = 'Invalid mobile number'
    if (appointmentType?.toLowerCase().trim() !== 'services') {
      if (!bookingDetails.problem?.trim()) e.problem = 'Problem required'
      if (!bookingDetails.symptomsDuration) e.symptomsDuration = 'Duration required'
      if (!bookingDetails.unit) e.unit = 'Select unit'
    }
    if (bookingDetails.foc === 'FOC' && !bookingDetails.focReason?.trim()) e.focReason = 'Enter FOC reason'
    if (!bookingDetails.branchId) e.branchname = 'Select branch'
    if (!bookingDetails.doctorId) e.doctorName = 'Select doctor'
    if (!bookingDetails.servicetime) e.slot = 'Select slot'
    if (!bookingDetails.paymentType) e.paymentType = 'Select payment type'
    if (!part || part.length === 0) e.part = 'Select body part'
    if (!markedImage) e.markedImage = 'Mark image required'
    if (!bookingDetails.address?.postalCode) e.address = { postalCode: 'Postal code required' }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) { showCustomToast('Please fix the errors before submitting.', 'error'); return }
    try {
      setSaveLoading(true)
      const { unit, address, ...rest } = bookingDetails
      const combinedName = `${bookingDetails.title}${bookingDetails.name}`
      const combinedDuration = `${bookingDetails.symptomsDuration} ${unit}`
      let customerData = null
      if (!selectedBooking && onboardToCustomer) {
        const d = new Date(bookingDetails.dob)
        const r = await addCustomer({
          fullName: combinedName, mobileNumber: bookingDetails.mobileNumber, gender: bookingDetails.gender,
          dateOfBirth: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`,
          age: bookingDetails.age,
          hospitalId: localStorage.getItem('HospitalId') || '', hospitalName: localStorage.getItem('HospitalName') || '',
          branchId: localStorage.getItem('branchId') || '', address,
        })
        customerData = r?.data?.data
      }
      await postBooking({
        ...rest, name: combinedName, symptomsDuration: combinedDuration,
        patientAddress: `${address.houseNo}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`,
        customerId: selectedBooking?.customerId || customerData?.customerId || '',
        patientId: selectedBooking?.patientId || customerData?.patientId || '',
        attachments: bookingDetails.attachments?.map((f) => f.base64.split(',')[1]) || [],
        partImage: markedImage, theraphyAnswers: theraphyQuestions, parts: part,
        reasonForVisit: bookingDetails.reasonforVisit === 'Others' ? otherReason : bookingDetails.reasonforVisit,
        listOfConsultationFee: [{ consulationFee: Number(bookingDetails.consultationFee || 0) }],
      })
      showCustomToast('Booking submitted successfully!')
      handleFullReset()
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      console.error(err); showCustomToast('Failed to submit booking.', 'error')
    } finally { setSaveLoading(false) }
  }

  const handleFollowUpSubmit = async () => {
    if (!selectedBooking) { showCustomToast('Please select a booking!', 'error'); return }
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
      showCustomToast('Follow-up booking submitted successfully!', 'success')
      handleFullReset()
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      console.error(err); showCustomToast('Failed to submit follow-up booking', 'error')
    } finally { setSaveLoading(false) }
  }

  const goNext = () => setCurrentTab((t) => Math.min(t + 1, visibleTabs.length - 1))
  const goPrev = () => setCurrentTab((t) => Math.max(t - 1, 0))

  const { minDate, maxDate } = React.useMemo(() => {
    const today = new Date()
    const maxDate = today.toISOString().split('T')[0]

    const min = new Date()
    min.setFullYear(today.getFullYear() - 120)

    return {
      minDate: min.toISOString().split('T')[0],
      maxDate,
    }
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
          <CCol md={6}>
            <CFormCheck type="radio" label="First Visit" name="visitTypeRadio" value="first"
              checked={visitType === 'first'}
              style={{ fontSize: FS }}
              onChange={() => {
                setVisitType('first')
                setBookingDetails((p) => ({ ...p, visitType: 'first' }))
                setSlotsForSelectedDate([]); setSelectedDate(''); setSelectedSlots([])
              }} />
          </CCol>
          <CCol md={6}>
            <CFormCheck type="radio" label="Follow-Up" name="visitTypeRadio" value="followup"
              checked={visitType === 'followup'}
              style={{ fontSize: FS }}
              onChange={() => {
                setVisitType('followup')
                setBookingDetails((p) => ({ ...p, visitType: 'followup' }))
                setSlotsForSelectedDate([]); setSelectedDate(''); setSelectedSlots([])
              }} />
          </CCol>
        </CRow>
        <BookingSearch visitType={visitType} fetchSlots={fetchSlots} onSelectBooking={(b) => setSelectedBooking(b)} />
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
              <CFormSelect name="title" value={bookingDetails.title} onChange={handleBookingChange} style={selectStyle(false)}>
                <option value="">Title</option>
                {['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.'].map((t) => <option key={t}>{t}</option>)}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel style={labelStyle}>Name <span className="text-danger">*</span></CFormLabel>
              <CFormInput name="name" value={bookingDetails.name || ''} onChange={handleBookingChange}
                minLength={3} maxLength={50} style={inputStyle(errors.name)} />
              <ErrMsg msg={errors.name} />
            </CCol>
            <CCol md={4}>
              <CFormLabel style={labelStyle}>Date of Birth <span className="text-danger">*</span></CFormLabel>
              <CFormInput
                type="date"
                name="dob"
                value={bookingDetails.dob || ''}
                onChange={handleBookingChange}
                min={minDate}
                max={maxDate}
                onInvalid={(e) => e.target.setCustomValidity('Enter valid DOB (max age 120)')}
                onInput={(e) => e.target.setCustomValidity('')}
                style={inputStyle(errors.dob)}
              />
              <ErrMsg msg={errors.dob} />
            </CCol>
            <CCol md={2}>
              <CFormLabel style={labelStyle}>Age</CFormLabel>
              <CFormInput type="number" value={bookingDetails.age || 0} disabled readOnly style={inputStyle(false)} />
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
                {['houseNo', 'street', 'landmark'].map((field) => (
                  <CCol md={4} key={field}>
                    <CFormLabel style={labelStyle} className="text-capitalize">{field}</CFormLabel>
                    <CFormInput value={bookingDetails.address?.[field] || ''} style={inputStyle(false)}
                      onChange={(e) => handleNestedChange('address', field, e.target.value)} />
                  </CCol>
                ))}
                <CCol md={4}>
                  <CFormLabel style={labelStyle}>Postal Code</CFormLabel>
                  <CFormInput type="text" maxLength={6} value={bookingDetails.address?.postalCode || ''}
                    style={inputStyle(errors.address?.postalCode)}
                    onChange={(e) => {
                      handleNestedChange('address', 'postalCode', e.target.value)
                      if (e.target.value.length === 6)
                        fetch(`https://api.postalpincode.in/pincode/${e.target.value}`)
                          .then((r) => r.json()).then((d) => { if (d[0].Status === 'Success') setPostOffices(d[0].PostOffice) })
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
                        if (po) { handleNestedChange('address', 'city', po.Block || ''); handleNestedChange('address', 'state', po.State || '') }
                      }}>
                      <option value="">-- Select Post Office --</option>
                      {postOffices.map((po) => <option key={po.Name} value={po.Name}>{po.Name.toUpperCase()}</option>)}
                    </CFormSelect>
                  </CCol>
                )}
                <CCol md={4}>
                  <CFormLabel style={labelStyle}>City</CFormLabel>
                  <CFormInput value={bookingDetails.address?.city || ''} readOnly style={inputStyle(false)} />
                </CCol>
                <CCol md={4}>
                  <CFormLabel style={labelStyle}>State</CFormLabel>
                  <CFormInput value={bookingDetails.address?.state || ''} readOnly style={inputStyle(false)} />
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        ) : (
          <div className="p-3" style={{ background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ margin: 0, fontWeight: '600', fontSize: FS, color: 'var(--color-bgcolor)' }}>{selectedBooking.name}</p>
            <p style={{ margin: 0, fontSize: FS, color: '#555' }}>{selectedBooking.mobileNumber} · {selectedBooking.gender} · Age {selectedBooking.age}</p>
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
                setBookingDetails((p) => ({ ...p, branchId: b?.branchId || '', branchname: b?.branchName || '', doctorId: '', doctorName: '', consultationFee: 0, servicetime: '', serviceDate: '' }))
                setSlotsForSelectedDate([]); setSelectedDate(''); setSelectedSlots([])
                if (e.target.value) clearErr('branchname')
              }}>
              <option value="">Select Branch</option>
              {branches.map((b) => <option key={b.branchId} value={b.branchId}>{b.branchName}</option>)}
            </CFormSelect>
            <ErrMsg msg={errors.branchname} />
          </CCol>

          <CCol md={6}>
            <CFormLabel style={labelStyle}>Doctor <span className="text-danger">*</span></CFormLabel>
            <CFormSelect name="doctorName" value={bookingDetails.doctorId || ''} disabled={loadingFee}
              style={selectStyle(errors.doctorName)}
              onChange={async (e) => {
                const id = e.target.value
                const doc = doctors.find((d) => d.doctorId === id)
                if (!doc) { setBookingDetails((p) => ({ ...p, doctorId: '', doctorName: '', doctorDeviceId: '', consultationFee: 0 })); return }
                setBookingDetails((p) => ({
                  ...p, doctorId: doc.doctorId, doctorName: doc.doctorName, doctorDeviceId: doc.doctorDeviceId,
                  consultationFee: p.foc === 'FOC' ? 0 : doc.doctorFees.inClinicFee || 0,
                }))
                setOriginalConsultationFee(doc.doctorFees.inClinicFee || 0)
                if (id) clearErr('doctorName')
                setLoadingFee(true)
                try { await fetchSlots(id) } catch { } finally { setLoadingFee(false) }
              }}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorId} disabled={!d.doctorAvailabilityStatus}
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
        <p style={sectionHeadStyle}>Available Slots</p>
        <div className="d-flex gap-2 flex-wrap mb-3">
          {(slotsForSelectedDate || [])
            .map((s) => s.day || s.date)
            .filter((d) => { const t = new Date(); t.setHours(0, 0, 0, 0); const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt >= t })
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
                    backgroundColor: isSelected ? 'var(--color-bgcolor)' : 'white',
                    color: isSelected ? '#fff' : 'var(--color-bgcolor)',       // ✅ blue when unselected
                    border: '1px solid var(--color-bgcolor)',
                    minWidth: '80px',
                    fontSize: FS,
                  }}>
                  <div style={{ fontSize: FS, fontWeight: '600', color: isSelected ? '#fff' : 'var(--color-bgcolor)' }}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '11px', color: isSelected ? '#fff' : 'var(--color-bgcolor)' }}>
                    {dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </div>
                </CButton>
              )
            })}
        </div>

        <CCard className="mb-3">
          <CCardBody>
            {slotsToShow.length === 0
              ? <p className="text-center" style={{ color: 'var(--color-bgcolor)', fontSize: FS, margin: 0 }}>No available slots for this date</p>
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
                          border: `1px solid ${isBooked ? '#f8d7da' : isSel ? 'var(--color-bgcolor)' : '#ddd'}`,
                          borderRadius: '5px', cursor: isBooked ? 'not-allowed' : 'pointer',
                          backgroundColor: isBooked ? '#f8d7da' : isSel ? 'var(--color-bgcolor)' : '#fff',
                          color: isBooked ? '#842029' : isSel ? '#fff' : 'var(--color-bgcolor)',
                          fontWeight: isSel ? '600' : '400',
                        }}>
                        {slotObj.slot}
                      </div>
                    )
                  })}
                </div>
                {sortedSlots.length > 12 && (
                  <div className="text-center mt-2">
                    <CButton color="secondary" size="sm" style={{ fontSize: FS }} onClick={() => setShowAllSlots(!showAllSlots)}>
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
              <CFormLabel style={labelStyle} className="text-capitalize">{field.replace(/([A-Z])/g, ' $1')}</CFormLabel>
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
                    onChange={() => setActivityLevels((p) => p.includes(level) ? p.filter((l) => l !== level) : [...p, level])} />
                  <label style={{ ...labelStyle, marginBottom: 0 }}>{level}</label>
                </div>
              ))}
            </div>
          </CCol>

          <CCol md={12}><p style={{ ...sectionHeadStyle, marginTop: '8px' }}>Insurance Info</p></CCol>
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Insurance Provider</CFormLabel>
            <CFormInput name="insuranceProvider" value={bookingDetails.insuranceProvider || ''} onChange={handleBookingChange} style={inputStyle(false)} />
          </CCol>
          <CCol md={6}>
            <CFormLabel style={labelStyle}>Policy Number</CFormLabel>
            <CFormInput name="policyNumber" value={bookingDetails.policyNumber || ''} onChange={handleBookingChange} style={inputStyle(false)} />
          </CCol>

          <CCol md={6}>
            <p style={{ ...sectionHeadStyle, marginTop: '8px' }}>Attachments</p>
            <CFormInput type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style={{ fontSize: FS }}
              onChange={async (e) => {
                const newFiles = Array.from(e.target.files)
                if (newFiles.length + (bookingDetails.attachments?.length || 0) > 6) {
                  showCustomToast('Maximum 6 files allowed.', 'error'); e.target.value = ''; return
                }
                const processed = await Promise.all(newFiles.map(async (file) => {
                  let f = file
                  if (file.size > 250 * 1024 && file.type.startsWith('image/'))
                    try { f = await imageCompression(file, { maxSizeMB: 0.25, maxWidthOrHeight: 1920, useWebWorker: true }) } catch { }
                  const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.readAsDataURL(f); r.onload = () => res(r.result); r.onerror = rej })
                  return { name: file.name, base64 }
                }))
                setBookingDetails((p) => ({ ...p, attachments: [...(p.attachments || []), ...processed] }))
              }} />
            {bookingDetails.attachments?.map((file, i) => (
              <div key={i} className="d-flex align-items-center mt-1 gap-2" style={{ fontSize: FS }}>
                <span>{file.name}</span>
                <button type="button" style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', lineHeight: 1 }}
                  onClick={() => setBookingDetails((p) => ({ ...p, attachments: p.attachments.filter((_, idx) => idx !== i) }))}>×</button>
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
              value={referDoctor.find((d) => d.referralId === bookingDetails.doctorRefCode) || (bookingDetails.doctorRefCode === 'OTHER' ? { referralId: 'OTHER', fullName: 'Others' } : null)}
              getOptionLabel={(o) => o.referralId === 'OTHER' ? 'Others' : `${o.fullName} - (${o.address?.street || ''}, ${o.address?.city || ''})`}
              getOptionValue={(o) => o.referralId}
              onChange={(sel) => {
                const v = sel ? sel.referralId : ''
                setBookingDetails((p) => ({ ...p, doctorRefCode: v, referredByType: v === 'OTHER' ? '' : p.referredByType, referredByName: v === 'OTHER' ? '' : p.referredByName }))
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
                  {['Friend', 'Family', 'Facebook', 'Instagram', 'Google', 'Advertisement', 'Other'].map((t) => <option key={t}>{t}</option>)}
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
        <BodyAssessment onPartClick={handlePartClick} />
        <ErrMsg msg={errors.part} />
        {markedImage && (
          <div className="mt-2">
            <CFormLabel style={labelStyle}>Marked Area Preview</CFormLabel>
            <img src={`data:image/png;base64,${markedImage}`} width={180} alt="preview"
              style={{ display: 'block', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
        )}
        <ErrMsg msg={errors.markedImage} />
        {(!selectedBooking || !selectedBooking.customerId) && (
          <div className="form-check mt-3">
            <input className="form-check-input" type="checkbox" id="onboardCheckbox"
              checked={onboardToCustomer} onChange={(e) => setOnboardToCustomer(e.target.checked)} />
            <label className="form-check-label" htmlFor="onboardCheckbox"
              style={{ ...labelStyle, marginBottom: 0 }}>
              Customer Registration
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
    <COffcanvas placement="end" visible={visible} onHide={onClose} className="w-50" backdrop="static">
      <COffcanvasHeader style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <COffcanvasTitle style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-bgcolor)' }}>
          📅 Book Appointment
        </COffcanvasTitle>
        <button className="btn-close" onClick={onClose} />
      </COffcanvasHeader>

      <COffcanvasBody style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>

        {/* Tab bar */}
        <div style={{ borderBottom: '1px solid #eee', backgroundColor: '#fafafa', padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {visibleTabs.map((tab, idx) => {
              const isActive = idx === currentTab
              const isComplete = idx < currentTab
              return (
                <button key={tab.id} onClick={() => setCurrentTab(idx)}
                  style={{
                    padding: '9px 12px',
                    fontSize: FS,           /* ← same 13px token */
                    fontWeight: isActive ? '600' : '400',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--color-bgcolor)' : '2px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    color: isActive ? 'var(--color-bgcolor)' : isComplete ? '#555' : '#aaa',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                  {isComplete
                    ? <span style={{ fontSize: '10px', color: '#4caf50', fontWeight: '700' }}>✓</span>
                    : <span style={{ fontSize: '11px', color: isActive ? 'var(--color-bgcolor)' : '#bbb' }}>{idx + 1}.</span>
                  }
                  {tab.label}
                </button>
              )
            })}
          </div>
          {/* Progress bar */}
          <div style={{ height: '3px', background: '#eee', marginTop: '-2px' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-bgcolor)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {renderTab()}
        </div>

        {/* Footer */}
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

            {/* Reset — ONLY clears current tab, does NOT change tab */}
            <CButton size="sm"
              title={`Reset "${visibleTabs[currentTab]?.label}" fields only`}
              style={{ fontSize: FS, padding: '4px 14px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}
              onClick={handleTabReset}>
              🔄 Reset
            </CButton>

            {/* Back */}
            {currentTab > 0 && (
              <CButton size="sm"
                style={{ fontSize: FS, padding: '4px 14px', backgroundColor: '#f0f0f0', color: '#555', border: '1px solid #ccc' }}
                onClick={goPrev}>
                ← Back
              </CButton>
            )}

            {/* Next / Submit */}
            {currentTab < visibleTabs.length - 1 ? (
              <CButton size="sm"
                style={{ fontSize: FS, padding: '4px 14px', backgroundColor: 'var(--color-bgcolor)', color: '#fff', border: 'none' }}
                onClick={goNext}>
                Next →
              </CButton>
            ) : (
              <CButton size="sm" disabled={saveloading}
                style={{ fontSize: FS, padding: '4px 14px', backgroundColor: 'var(--color-bgcolor)', color: '#fff', border: 'none' }}
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