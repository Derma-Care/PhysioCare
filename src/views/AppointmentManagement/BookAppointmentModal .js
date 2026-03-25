import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormCheck,
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CFormText,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CButton,
  CCard,
  CCardBody,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

import { GetClinicBranches,getDoctorByClinicIdData } from '../Doctors/DoctorAPI'
import { useNavigate } from 'react-router-dom'
import { getAllReferDoctors } from '../EmployeeManagement/ReferDoctor/ReferDoctorAPI'
import Select from 'react-select'

// 🔍 Filter doctors based on search input

// import fetchHospital from '../Usecontext/HospitalContext'

import {
  CategoryData,
  serviceData,
  subServiceData,
  getSubServiceById,
} from '../ProcedureManagement/ProcedureManagementAPI'
import { BASE_URL, subservice, wifiUrl } from '../../baseUrl'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
// import { getInProgressBookings, getInProgressfollowupBookings } from '../../APIs/GetFollowUpApi'
import { toast } from 'react-toastify'
import BookingSearch from '../widgets/BookingSearch '
import LoadingIndicator from '../../Utils/loader'
import { postBooking } from '../../APIs/BookServiceAPi'

import { DoctorData } from '../Doctors/DoctorAPI'
import { addCustomer } from '../customerManagement/CustomerManagementAPI'
import { showCustomToast } from '../../Utils/Toaster'
import imageCompression from 'browser-image-compression'
import { GetdoctorsByClinicIdData } from './appointmentAPI'
const BookAppointmentModal = ({ visible, onClose }) => {
  const [visitType, setVisitType] = useState('first')
  const [appointmentType, setAppointmentType] = useState('services') // services / inclinic / online
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctorData, setDoctorData] = useState([]) // initialize as empty array
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [sloading, setSLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [loadingFee, setLoadingFee] = useState(false)
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [referDoctor, setReferDoctor] = useState([])

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [mvisible, setMVisible] = useState(false)

  const [showAllSlots, setShowAllSlots] = useState(false)
  const [subServiceInfo, setSubServiceInfo] = useState(null)
  const [selectedSubServiceInfo, setSelectedSubServiceInfo] = useState(null)

  const { fetchHospital, selectedHospital } = useHospital()
  const [postOffices, setPostOffices] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const pincodeTimer = useRef(null)

  // dropdown lists
  const [categories, setCategories] = useState([])
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [procedures, setProcedures] = useState([]) // for sub-services
  const [loading, setLoading] = useState([])

  const [services, setServices] = useState([])
  const [subServices, setSubServices] = useState([])
  const [branches, setBranches] = useState([])
  const [doctors, setDoctors] = useState([])
  const [allSlots, setAllSlots] = useState([]) // initialize as empty array
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  // selected values
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedSubService, setSelectedSubService] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [consuationFee, setConsuationFee] = useState(0)
  const [servicesConsultation, setServicesConsultation] = useState(0)
  const [onboardToCustomer, setOnboardToCustomer] = useState(false)

  const type = appointmentType.trim().toLowerCase()

  const initialBookingDetails = {
    branchId: localStorage.getItem('branchId') || '',
    branchname: localStorage.getItem('branchName') || '',
    clinicId: localStorage.getItem('HospitalId') || '',
    clinicName: localStorage.getItem('HospitalName') || '',
    clinicAddress: selectedHospital.data.address,
    title: '',
    categoryName: '',
    categoryId: '',
    servicename: '',
    serviceId: '',
    subServiceName: '',
    subServiceId: '',

    doctorId: '',
    doctorName: '',
    doctorDeviceId: '',
    doctorRefCode: '',

    consultationType: 'Services & Treatments',
    consultationFee: '',
    consultationExpiration: selectedHospital.data.consultationExpiration,
    paymentType: '',
    visitType: 'first',
    servicecost: '',

    bookingFor: 'Self',
    name: '',
    patientAddress: '',
    patientMobileNumber: '',
    mobileNumber: '',
    age: '',
    gender: '',
    symptomsDuration: '',
    problem: '',
    foc: '',

    attachments: [],
    freeFollowUps: selectedHospital.data.freeFollowUps,
    consentFormPdf: '',
    customerId: '',
    customerDeviceId: '',

    serviceDate: '',
    servicetime: '',

    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',

      country: 'India',
    },
  }
  const [bookingDetails, setBookingDetails] = useState(initialBookingDetails)
const [originalConsultationFee, setOriginalConsultationFee] = useState('');

  const [errors, setErrors] = useState({})

  // const handlePatientFollowupSearch = async () => {
  //   if (!patientSearch.trim()) {
  //     toast.error('Please enter a valid Patient ID / Name / Mobile')
  //     alert('Please enter a valid Patient ID / Name / Mobile')
  //     return
  //   }

  //   setSLoading(true)
  //   try {
  //     const res = await getInProgressfollowupBookings(patientSearch)
  //     console.log(patientSearch)
  //     setBookingData(res.data.data || [])
  //     console.log(res.data.data)
  //   } catch (err) {
  //     console.error('Error fetching bookings:', err)
  //     setBookingData([])
  //   } finally {
  //     setSLoading(false)
  //   }
  // }

  //   const handlePatientSearch = async () => {
  //   if (!patientSearch.trim()) {
  //     toast.error('Please enter a valid Patient ID / Name / Mobile')
  //     alert('Please enter a valid Patient ID / Name / Mobile')
  //     return
  //   }

  //   setSLoading(true)
  //   try {
  //     const res = await getBookingsByPatientId(patientSearch)
  //     console.log(patientSearch)
  //     setBookingData(res.data.data || [])
  //     console.log(res.data.data)
  //   } catch (err) {
  //     console.error('Error fetching bookings:', err)
  //     setBookingData([])
  //   } finally {
  //     setSLoading(false)
  //   }
  // }

  // const handleSelectBooking = (booking) => {
  //   setSelectedBooking(booking)
  //   setMVisible(true)
  // }

  const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    if (isNaN(d)) return null
    return d.toISOString().split('T')[0] // 'yyyy-mm-dd'
  }
  // 'yyyy-mm-dd'

  // useEffect(() => {
  //   if (!patientSearch) return

  //   getInProgressBookings(patientSearch)
  //     .then((res) => {
  //       setBookingData(res.data.data) // ✅ because response structure has { data: [...] }
  //     })
  //     .catch((err) => {
  //       console.error('Error fetching bookings:', err)
  //     })
  //     .finally(() => setLoading(false))
  // }, [patientSearch])

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryData()
        console.log('Categories API response:', res.data)

        const categoriesList = Array.isArray(res.data) ? res.data : []
        setCategories(categoriesList)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      }
    }

    fetchCategories()
  }, []) // fetch once on mount

  // ✅ Fetch Services when Category changes
  useEffect(() => {
    if (!selectedCategory) {
      setServices([])
      setSelectedService('')
      setSubServices([])
      setSelectedSubService('')
      return
    }

    const fetchServices = async () => {
      try {
        const res = await serviceData(selectedCategory)
        console.log('Services API response for category:', selectedCategory, res.data)

        const servicesList = Array.isArray(res.data) ? res.data : []
        setServices(servicesList)

        // Reset downstream selections
        setSelectedService('')
        setSubServices([])
        setSelectedSubService('')
      } catch (err) {
        console.error('Error fetching services:', err)
        setServices([])
        setSubServices([])
        setSelectedService('')
        setSelectedSubService('')
      }
    }

    fetchServices()
  }, [selectedCategory])
  // ✅ Fetch SubServices when Service changes

  useEffect(() => {
    console.log('useEffect triggered with service ID:', selectedService)

    if (!selectedService) {
      setSubServices([])
      setSelectedSubService('')
      return
    }

    const fetchSubServices = async () => {
      try {
        const res = await subServiceData(selectedService)
        console.log('API response for service ID:', selectedService, res.data)

        const blocks = Array.isArray(res.data) ? res.data : []
        const allSubServices = blocks.flatMap((block) => block.subServices || [])

        setSubServices(allSubServices)
        setSelectedSubService('')
      } catch (err) {
        console.error('Error fetching sub-services:', err)
        setSubServices([])
        setSelectedSubService('')
      }
    }

    fetchSubServices()
  }, [selectedService])

  useEffect(() => {
    if (!selectedSubService) {
      setSubServices([])
      setBookingDetails((prev) => ({
        ...prev,
        // consultationFee: 0,
        discountAmount: 0,
        discountPercentage: 0,
        totalFee: 0,
      }))
      return
    }

    const fetchSubServiceInfo = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')

        const url = `${BASE_URL}/getSubService/${clinicId}/${selectedSubService}`
        console.log('Fetching sub-service info from URL:', url)

        const res = await axios.get(url)
        console.log('Sub-service API response:', res.data)

        // ✅ Extract first object from array
        const subServiceInfo = res.data?.data || {}
        // setSubServices(subServiceInfo)
        setServicesConsultation(subServiceInfo.price)
        // ✅ Update booking details from API fields
        if (bookingDetails.consultationType.toLowerCase().includes('service')) {
          setBookingDetails((prev) => ({
            ...prev,
            subServiceId: subServiceInfo.subServiceId,
            subServiceName: subServiceInfo.subServiceName,
         consultationFee: prev.foc === 'FOC' ? 0 : subServiceInfo.consultationFee || 0,

            servicecost: subServiceInfo.price,
            discountAmount: subServiceInfo.discountedCost || 0,
            discountPercentage: subServiceInfo.discountPercentage || 0,
           totalFee: subServiceInfo.finalCost,
          }))
          setOriginalConsultationFee(subServiceInfo.consultationFee || 0)
        }
        // setBookingDetails((prev) => ({
        //   ...prev,
        //   servicecost: subServiceInfo.price,
        //   discountAmount: subServiceInfo.discountedCost || 0,
        //   discountPercentage: subServiceInfo.discountPercentage || 0,
        //   totalFee: subServiceInfo.finalCost, // Adjust formula as needed
        // }))

        // Optional: store the subservice info
      } catch (err) {
        console.error('Error fetching sub-service info:', err)
        setSubServices([])
        setBookingDetails((prev) => ({
          ...prev,
          consultationFee: '',
          servicecost: '',
          discountAmount: '',
          discountPercentage: '',
          totalFee: '',
        }))
      }
    }

    fetchSubServiceInfo()
  }, [selectedSubService])

  const now = new Date() // current time

  // Filter slots for selected date and remove past slots for today
  const slotsToShow = (slotsForSelectedDate || [])
    .filter(
      (s) => new Date(s.day || s.date).toDateString() === new Date(selectedDate).toDateString(),
    )
    .flatMap((s) => s.availableSlots || []) // default to [] if undefined

    .filter((slotObj) => {
      const slotDate = new Date(selectedDate)
      const [time, meridian] = slotObj.slot.split(' ') // "09:30 AM"
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      slotDate.setHours(hours, minutes, 0, 0)

      // Only remove past slots for today
      const isToday = new Date(selectedDate).toDateString() === now.toDateString()
      if (isToday) return slotDate > now
      return true
    })

  // Sort slots by time
  const sortedSlots = slotsToShow.sort((a, b) => {
    const parseTime = (slot) => {
      const [time, meridian] = slot.slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    }
    return parseTime(a) - parseTime(b)
  })

  // Only show first 12 slots unless "show all" is clicked
  const visibleSlots = showAllSlots ? sortedSlots : sortedSlots.slice(0, 12)

  // ✅ Fetch Branches (when modal opens)
  useEffect(() => {
    if (!visible) return

    const fetchBranches = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')
        const response = await GetClinicBranches(clinicId)
        const branchList = Array.isArray(response.data) ? response.data : []
        const formattedBranches = branchList.map((b) => ({
          branchId: b.branchId || b.id,
          branchName: b.branchName || b.name,
        }))
        setBranches(formattedBranches)
      } catch {
        setBranches([])
      }
    }

    fetchBranches()
  }, [visible])

  // ✅ Example: Fetch Doctors when Branch & SubService are chosen
  // ✅ Fetch Doctors when Branch & SubService are chosen

  useEffect(() => {
    fetchDoctors()
  }, [appointmentType, bookingDetails.branchId, selectedSubService])

  const fetchDoctors = async () => {
  setLoadingDoctors(true)

  try {
    let doctorsList = []

    if (appointmentType !== 'services') {

      const clinicId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')

      if (!clinicId || !branchId) {
        console.warn('Missing clinicId or branchId')
        setDoctors([])
        return
      }

      const response = await getDoctorByClinicIdData(clinicId, branchId)

      doctorsList = Array.isArray(response?.data)
        ? response.data
        : []
    }
    else if (
      appointmentType === 'services' && bookingDetails.branchId && selectedSubService
    ) {
      const clinicId = localStorage.getItem('HospitalId')
      const branchId = bookingDetails.branchId
      const subServiceId = selectedSubService

      const url = `${BASE_URL}/doctors/${clinicId}/${branchId}/${subServiceId}`
      const response = await axios.get(url)

      doctorsList = Array.isArray(response?.data?.data)
        ? response.data.data
        : []
    } else {
      doctorsList = []
    }

    setDoctors(doctorsList)
    
  } catch (err) {
    console.error("Error fetching doctors:", err)
    setDoctors([])
  } finally {
    setLoadingDoctors(false)
  }
}


  const fetchSlots = async (doctorId) => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      // const branchId = localStorage.getItem('branchId')
      // const branchId = bookingDetails.branchId

      const response = await axios.get(
        `${BASE_URL}/getDoctorSlots/${hospitalId}/${bookingDetails.branchId}/${doctorId}`,
      )

      if (response.data.success) {
        console.log('Fetched Slots Data:', response.data.data) // ✅ Check console
        setSlotsForSelectedDate(response.data.data)
      } else {
        setSlotsForSelectedDate([])
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setSlotsForSelectedDate([])
    } finally {
      setLoadingSlots(false)
    }
  }
  //refer doctors
  const fetchRefferrDoctor = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      if (clinicID) {
        const res = await getAllReferDoctors(clinicID) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setReferDoctor(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching lab technicians:', err)
      setTechnicians([])
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchRefferrDoctor()
  }, [])
 const handleFeeTypeChange = async (e) => {
  const selectedType = e.target.value
  const hospitalId = localStorage.getItem('HospitalId')
  const { subServiceId, subServiceName, consultationType } = bookingDetails

  try {
    // 1 = FOC, 2 = Paid
    const feeTypeCode = selectedType === 'FOC' ? 1 : 2

    

    const url = `${BASE_URL}/calculateAmountByConsultationType/${hospitalId}/${subServiceId}/${subServiceName}/${feeTypeCode}`

    const response = await axios.get(url, {
      params: { feeType: feeTypeCode },
    })

    console.log('Fee API response:', response.data)

    setBookingDetails((prev) => ({
      ...prev,
      foc: selectedType,
      consultationFee:
        selectedType === 'FOC' ? 0 : response.data?.data?.consultationFee || 0,
        totalFee:
  
    (response.data?.data?.finalCost ?? 0),
    }))
  } catch (error) {
    console.error('Error calculating fee amount:', error)
  }
}
useEffect(() => {
  if (bookingDetails.subServiceId && bookingDetails.subServiceName && bookingDetails.consultationType) {
    // Fetch the default Paid amount (feeType = 2)
    handleFeeTypeChange('Paid', bookingDetails, setBookingDetails)
  }
}, [bookingDetails.subServiceId, bookingDetails.subServiceName, bookingDetails.consultationType])



  // Watch for appointmentType changes and reset related fields

  // Fetch available slots for a doctor

  const handleBookingChange = (e) => {
    const { name, value } = e.target

    setBookingDetails((prev) => {
      let updatedDetails = { ...prev }

      // ✅ Remove alphabets from mobile number
      if (name === 'patientMobileNumber') {
        let sanitizedValue = value.replace(/\D/g, '') // remove all non-digits

        // Ignore leading 0
        if (sanitizedValue.startsWith('0')) sanitizedValue = sanitizedValue.slice(1)

        updatedDetails[name] = sanitizedValue

        // Sync mobileNumber if you have a separate field
        updatedDetails.mobileNumber = sanitizedValue
      } else if (name === 'name') {
        // Remove digits from name
        updatedDetails[name] = value.replace(/\d/g, '')
      } else {
        updatedDetails[name] = value
      }

      // ✅ DOB → Age
      if (name === 'dob' && value) {
        const today = new Date()
        const dob = new Date(value)
        let age = today.getFullYear() - dob.getFullYear()
        const m = today.getMonth() - dob.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
        updatedDetails.age = age >= 1 ? age : 0
      }

      // ✅ Age → DOB
      if (name === 'age' && value) {
        const today = new Date()
        const dob = new Date()
        dob.setFullYear(today.getFullYear() - parseInt(value))
        updatedDetails.dob = dob.toISOString().split('T')[0] // YYYY-MM-DD
      }

      // ✅ Combine symptoms duration and unit
      if (name === 'symptomsDuration' || name === 'unit') {
        updatedDetails[name] = value
      }

      return updatedDetails
    })

    // ✅ Real-time validation
    setErrors((prev) => {
      const updatedErrors = { ...prev }

      switch (name) {
        case 'name':
          if (!value || value.trim() === '') updatedErrors[name] = 'Name is required'
          else delete updatedErrors[name]
          break

        case 'patientMobileNumber':
          if (!value) updatedErrors[name] = 'Mobile number is required'
          else if (!/^[6-9]\d{9}$/.test(value))
            updatedErrors[name] = 'Enter a valid 10-digit mobile number starting with 6-9'
          else delete updatedErrors[name]
          break

        case 'gender':
          if (!value) updatedErrors.gender = 'Please select gender'
          else delete updatedErrors.gender
          break

        case 'appointmentType':
          if (!value || value.trim() === '') updatedErrors[name] = 'Please select appointment type'
          else delete updatedErrors[name]
          break

        case 'dob':
        case 'age':
          delete updatedErrors.dob
          delete updatedErrors.age
          break

        default:
          break
      }

      return updatedErrors
    })
  }
  useEffect(() => {
    setBookingDetails((prev) => ({
      ...prev,
      slot: '', // reset only slot
      // consultationFee stays as is
    }))
  }, [bookingDetails.doctorId])

  const handleNestedChange = async (section, field, value) => {
    // Update bookingDetails
    setBookingDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))

    // Real-time validation
    setErrors((prev) => {
      const updatedErrors = { ...prev }
      if (section === 'address') {
        if (!updatedErrors.address) updatedErrors.address = {}

        if (field === 'postalCode') {
          if (/^\d{6}$/.test(value)) {
            delete updatedErrors.address[field]
          } else {
            updatedErrors.address[field] = 'Postal code must be 6 digits'
          }
        } else {
          if (value.trim() !== '') delete updatedErrors.address[field]
        }

        if (Object.keys(updatedErrors.address).length === 0) delete updatedErrors.address
      }
      return updatedErrors
    })

    // Fetch city/state/PO from postal code API
    if (section === 'address' && field === 'postalCode' && /^\d{6}$/.test(value)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`)
        const data = await res.json()

        if (data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0]
          const city = postOffice.District
          const state = postOffice.State
          const po = postOffice.Name // Post Office name

          setBookingDetails((prev) => ({
            ...prev,
            [section]: {
              ...prev[section],
              city,
              state,
              po,
              postalCode: value,
            },
          }))
        } else {
          setBookingDetails((prev) => ({
            ...prev,
            [section]: {
              ...prev[section],
              city: '',
              state: '',
              po: '',
              postalCode: value,
            },
          }))
        }
      } catch (err) {
        console.error('Error fetching postal info:', err)
        setBookingDetails((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            city: '',
            state: '',
            po: '',
            postalCode: value,
          },
        }))
      }
    } else if (field === 'postalCode') {
      // Clear city/state/PO if postal code invalid
      setBookingDetails((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          city: '',
          state: '',
          po: '',
        },
      }))
    }
  }
  const handlePostalCodeChange = (value) => {
    handleNestedChange('address', 'postalCode', value)

    if (value.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0].Status === 'Success' && data[0].PostOffice) {
            setPostOffices(data[0].PostOffice)
            setSelectedPO(null) // reset previous selection
          } else {
            setPostOffices([])
          }
        })
        .catch((err) => {
          console.error('Postal API error:', err)
          setPostOffices([])
        })
    } else {
      setPostOffices([])
    }
  }

  const validate = () => {
    const newErrors = {}

    // Visit Type
    if (!visitType) newErrors.visitType = 'Please select visit type'

    // Appointment Type (required only for first visit)

    // if (appointmentType)
    //   newErrors.appointmentType = 'Please select appointment type'

    // Contact Info (only for new patients)
    if (!selectedBooking && visitType !== 'followup') {
      const name = bookingDetails.name?.trim() || ''

      if (!name) {
        newErrors.name = 'Name is required'
      } else if (name.length < 3) {
        newErrors.name = 'Name must be at least 3 characters'
      } else if (!/^[A-Za-z\s]+$/.test(name)) {
        // Only letters and spaces
        newErrors.name = 'Name can only contain letters'
      } else {
        delete newErrors.name
      }

      if (!bookingDetails.dob) newErrors.dob = 'Date of Birth is required'

      if (!bookingDetails.gender) {
        newErrors.gender = 'Please select gender'
      }

      setErrors(newErrors)

      if (!bookingDetails.patientMobileNumber) {
        newErrors.patientMobileNumber = 'Mobile number is required'
      } else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber)) {
        newErrors.patientMobileNumber = 'Enter a valid 10-digit mobile number starting with 6-9'
      } else {
        delete newErrors.patientMobileNumber
      }
      if (!bookingDetails.problem?.trim()) {
        errors.problem = 'Symptoms/Problem is required.'
      } else if (bookingDetails.problem.trim().length < 5) {
        errors.problem = 'Symptoms/Problem must be at least 5 characters.'
      }

      if (!bookingDetails.symptomsDuration) {
        errors.symptomsDuration = 'Symptoms duration is required.'
      }

      if (!bookingDetails.unit) {
        errors.unit = 'Please select a duration unit.'
      }

      // Address validations
      const addressErrors = {}
      const addressFields = bookingDetails.address || {}

      for (let field in addressFields) {
        if (field === 'landmark') continue // ✅ Landmark is optional

        if (!addressFields[field] || addressFields[field].trim() === '') {
          addressErrors[field] = `${field} is required`
        } else if (field === 'postalCode' && !/^\d{6}$/.test(addressFields[field])) {
          addressErrors[field] = 'Postal code must be 6 digits'
        }
      }

      if (Object.keys(addressErrors).length > 0) newErrors.address = addressErrors
    }
    // Services (if service appointment)
    if (visitType !== 'followup' && appointmentType?.includes('service')) {
      if (!selectedCategory) newErrors.selectedCategory = 'Select a category'
      if (!selectedService) newErrors.selectedService = 'Select a service'
      if (!selectedSubService) newErrors.selectedSubService = 'Select a procedure'
    }

    // Branch & Doctor
    if (visitType !== 'followup') {
      if (!bookingDetails.branchId) newErrors.branchname = 'Select a branch'
      if (!bookingDetails.doctorId) newErrors.doctorName = 'Select a doctor'
    }

    // Slots
    if (visitType !== 'followup' && selectedSlots.length === 0)
      newErrors.slot = 'Please select a time slot'

    // Payment
    if (visitType !== 'followup' && !bookingDetails.paymentType)
      newErrors.paymentType = 'Select payment type'

    // Symptoms (optional)
    if (
      bookingDetails.problem &&
      (bookingDetails.problem.length < 5 || bookingDetails.problem.length > 300)
    )
      newErrors.problem = 'Problem description must be 5-300 characters'

    if (
      bookingDetails.symptomsDuration &&
      (bookingDetails.symptomsDuration < 1 || bookingDetails.symptomsDuration > 365)
    )
      newErrors.symptomsDuration = 'Duration must be between 1 and 365'

    // Doctor Referral Code (optional)

    if (appointmentType?.toLowerCase().trim() === 'inclinic') {
      // Symptoms/Problem
      if (!bookingDetails.problem?.trim()) {
        newErrors.problem = 'Symptoms/Problem is required'
      } else if (bookingDetails.problem.trim().length < 5) {
        newErrors.problem = 'Symptoms/Problem must be at least 5 characters'
      } else {
        delete newErrors.problem
      }

      // Symptoms Duration
      if (!bookingDetails.symptomsDuration) {
        newErrors.symptomsDuration = 'Symptoms duration is required'
      } else if (bookingDetails.symptomsDuration < 1 || bookingDetails.symptomsDuration > 365) {
        newErrors.symptomsDuration = 'Duration must be between 1 and 365'
      } else {
        delete newErrors.symptomsDuration
      }

      // Unit
      if (!bookingDetails.unit) {
        newErrors.unit = 'Please select a duration unit'
      } else {
        delete newErrors.unit
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAppointmentTypeChange = (type) => {
    setBookingDetails((prev) => ({
      ...prev,
      consultationType: type,
      consultationFee: type.toLowerCase().includes('service')
        ? subServiceInfo.consultationFee || 0
        : consuationFee || 0, // doctor fee for other types
    }))
  }
  console.log(onboardToCustomer)

  const handleSubmit = async () => {
    console.log(selectedBooking)
    const combinedSymptomsDuration = `${bookingDetails.symptomsDuration} ${bookingDetails.unit}`
    const combinedName = `${bookingDetails.title}${bookingDetails.name}`
    console.log('Payload without slot:', combinedSymptomsDuration)
    console.log('Payload without combinedName:', combinedName)
    console.log('Validating bookingDetails...', bookingDetails)

    if (!validate()) {
      // showCustomToast('Please fix the errors before submitting.', 'error')
      return
    }

    try {
      // Build payload explicitly, excluding 'slot'
      const { unit, address, slot, ...rest } = bookingDetails

      const payloadToSend = {
        ...rest,
        name: combinedName,
        symptomsDuration: combinedSymptomsDuration,
        patientAddress: `${address.houseNo}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`,
        attachments: bookingDetails.attachments?.map((f) => f.base64.split(',')[1]) || [],
      }

      console.log('Payload without slot:', payloadToSend)

      const res = await postBooking(payloadToSend)

      // If onboarding is enabled, register the patient as a customer
      if (selectedBooking == null && onboardToCustomer) {
        const updatedFormData = {
          fullName: combinedName,
          mobileNumber: bookingDetails.mobileNumber,
          gender: bookingDetails.gender,
          dateOfBirth: bookingDetails.dob,

          address: {
            houseNo: address.houseNo,
            street: address.street,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            country: address.country,
            postalCode: address.postalCode,
          },
          age: bookingDetails.age,
          hospitalId: localStorage.getItem('HospitalId') || '',
          hospitalName: localStorage.getItem('HospitalName') || '',
          branchId: localStorage.getItem('branchId') || '',
        }

        // Format DOB to DD-MM-YYYY
        if (updatedFormData.dateOfBirth) {
          const dateObj = new Date(updatedFormData.dateOfBirth)
          if (!isNaN(dateObj)) {
            const day = String(dateObj.getDate()).padStart(2, '0')
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const year = dateObj.getFullYear()
            updatedFormData.dateOfBirth = `${day}-${month}-${year}`
          }
        }

        await addCustomer(updatedFormData)
        showCustomToast('Booking & Patient registered successfully!')
      } else {
        showCustomToast('Booking submitted successfully!')
      }

      console.log('Booking submitted successfully:', res.data)

      // Reset form
      setBookingDetails(initialBookingDetails)

      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      console.error('Error submitting booking:', err)
      if (err.response?.data?.message) showCustomToast(err.response.data.message, 'error')
      else if (err.message?.includes('timeout'))
        showCustomToast('Request timed out. Please try again.', 'error')
      else showCustomToast('Failed to submit booking. Please try again.', 'error')
    }
  }

  const handleServicesSubmit = () => {
    if (validate()) {
      console.log('Submitting Services Appointment:', bookingDetails)
      // Call your API for services appointment
    }
  }

  const handleInClinicSubmit = () => {
    if (validate()) {
      console.log('Submitting In-Clinic Appointment:', bookingDetails)
      // Call your API for in-clinic appointment
    }
  }

  const handleFollowUpSubmit = async (followupData) => {
    if (!followupData) {
      showCustomToast('Please select a booking before submitting!', 'error')
      return
    }

    const payload = {
      bookingId: followupData.bookingId,
      doctorId: followupData.doctorId,
      visitType: 'follow-up',
      mobileNumber: followupData.mobileNumber,
      serviceDate: selectedDate,
      servicetime: bookingDetails.servicetime,
      patientId: followupData.patientId,
      bookingFor: followupData.bookingFor,
    }

    console.log('📦 Follow-up Payload:', payload)

    try {
      const res = await postBooking(payload)
      console.log('✅ Follow-up Response:', res)
      showCustomToast('Follow-up booking submitted successfully!', 'success')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      console.error('❌ Follow-up Error:', err)
      // showCustomToast('Failed to submit follow-up booking', 'error')
    }
  }

  useEffect(() => {
    if (selectedBooking) {
      setBookingDetails((prev) => ({
        ...prev,
        name: selectedBooking.name || '',
        patientId: selectedBooking.patientId || '',
        dob: selectedBooking.dob || '',
        age: selectedBooking.age || '',
        gender: selectedBooking.gender || '',
        patientMobileNumber: selectedBooking.mobileNumber || '',
        // followupsLeft: selectedBooking.followupsLeft || '',
        // freeFollowupsLeft: selectedBooking.freeFollowupsLeft || '',
        address: selectedBooking.patientAddress,
      }))
    }
  }, [selectedBooking, setBookingDetails])

  console.log(`appointmenttype ${appointmentType}`)
  return (
    <COffcanvas
      placement="end"
      visible={visible}
      onHide={onClose}
      className="w-50"
      backdrop="static"
    >
      <COffcanvasHeader>
        <COffcanvasTitle>📅 Book Appointment</COffcanvasTitle>
        <button className="btn-close" onClick={onClose}></button>
      </COffcanvasHeader>

      <COffcanvasBody>
        {/* SECTION: Visit Type */}
        <h6 className="mb-3 border-bottom pb-2">Visit Type</h6>
        <CRow className="mb-4">
          <CCol md={6}>
            <CFormCheck
              type="radio"
              label="First Visit"
              name="visitTypeRadio"
              value="first"
              checked={visitType === 'first'}
              onChange={() => {
                setVisitType('first')
                setBookingDetails((prev) => ({ ...prev, visitType: 'first' }))
                setSlotsForSelectedDate([]) // reset date slots

                setSelectedDate('') // reset selected date
                setSelectedSlots([])
              }}
            />
          </CCol>
          <CCol md={6}>
            <CFormCheck
              type="radio"
              label="Follow-Up"
              name="visitTypeRadio"
              value="followup"
              checked={visitType === 'followup'}
              onChange={() => {
                setVisitType('followup')
                setBookingDetails((prev) => ({ ...prev, visitType: 'followup' }))
                setSlotsForSelectedDate([]) // reset date slots

                setSelectedDate('') // reset selected date
                setSelectedSlots([])
              }}
            />
          </CCol>
        </CRow>

        {/* SECTION: Appointment Type */}
        {visitType !== 'followup' && (
          <div>
            <h6 className="mb-3 border-bottom pb-2">Appointment Type</h6>
            <CRow className="mb-4">
              <CCol md={6}>
                <CFormCheck
                  type="radio"
                  label="Services & Treatment"
                  name="appointmentTypeRadio"
                  value="services"
                  checked={appointmentType === 'services'}
                  onChange={(e) => {
                    // handleAppointmentTypeChange(e.target.value)
                    setAppointmentType('services')
                    setBookingDetails((prev) => ({
                      ...prev,
                      consultationType: 'Services & Treatments',
                    }))
                  }}
                />
              </CCol>
              <CCol md={6}>
                <CFormCheck
                  type="radio"
                  label="In-Clinic"
                  name="appointmentTypeRadio"
                  value="inclinic"
                  checked={appointmentType === 'inclinic'}
                  onChange={(e) => {
                    fetchDoctors()
                    // handleAppointmentTypeChange(e.target.value)
                    setAppointmentType('inclinic')
                    setBookingDetails((prev) => ({
                      ...prev,
                      consultationType: 'In-Clinic Consultation',
                    }))
                  }}
                />
              </CCol>
              {/* <CCol md={4}>
                <CFormCheck
                  type="radio"
                  label="Online"
                  name="appointmentTypeRadio"
                  value="online"
                  checked={appointmentType === 'Online Consultation'}
                  onChange={(e) => {
                    // handleAppointmentTypeChange(e.target.value)
                    setAppointmentType('online')
                    setBookingDetails((prev) => ({ ...prev, consultationType: 'online' }))
                  }}
                />
              </CCol> */}
            </CRow>
            {errors.appointmentType && (
              <div className="text-danger mb-3">{errors.appointmentType}</div>
            )}
          </div>
        )}

        <BookingSearch
          visitType={visitType}
          fetchSlots={fetchSlots}
          onSelectBooking={(booking) => setSelectedBooking(booking)}
        />

        <div>
          {/* 🔹 Editable form only if no patient selected */}
          {!selectedBooking && visitType !== 'followup' && (
            <div>
              <h6 className="mb-3 border-bottom pb-2">Contact Information</h6>
              <CRow className="mb-4">
                {/* Name */}

                <CCol md={2}>
                  <CFormLabel style={{ color: 'var(--color-black)' }}>
                    Title <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    name="title"
                    value={bookingDetails.title}
                    onChange={handleBookingChange}
                    invalid={!!errors.title}
                  >
                    <option value="">Select Title</option>
                    {/* Common Personal Titles */}
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss">Miss.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mx.">Mx.</option>

                    {/* Professional Titles */}
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Rev.">Rev.</option>
                    <option value="Sir">Sir.</option>
                    <option value="Dame">Dame.</option>
                    <option value="Lord">Lord</option>
                    <option value="Lady">Lady</option>

                    {/* Other Titles */}
                    <option value="Capt.">Capt.</option>
                    <option value="Col.">Col.</option>
                    <option value="Gen.">Gen.</option>
                    <option value="Hon.">Hon.</option>
                  </CFormSelect>
                  {errors.title && <div className="text-danger small">{errors.title}</div>}
                </CCol>
                <CCol md={6} className="mb-3">
                  <CFormLabel style={{ color: 'var(--color-black)' }}>
                    Name <span className="text-danger">*</span>
                  </CFormLabel>

                  <CFormInput
                    name="name"
                    value={bookingDetails.name || ''}
                    onChange={handleBookingChange}
                    minLength={3}
                    maxLength={50}
                  />
                  {errors.name && <p className="text-danger">{errors.name}</p>}
                </CCol>

                {/* DOB */}
                <CCol md={4} className="mb-3">
                  <CFormLabel style={{ color: 'var(--color-black)' }}>
                    Date of Birth <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    name="dob"
                    value={bookingDetails.dob || ''}
                    onChange={handleBookingChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dob && <p className="text-danger">{errors.dob}</p>}
                </CCol>

                {/* Age */}
                <CCol md={2} className="mb-3">
                  <CFormLabel style={{ color: 'var(--color-black)' }}>Age</CFormLabel>
                  <CFormInput
                    type="number"
                    name="age"
                    value={bookingDetails.age || 0}
                    disabled
                    onChange={handleBookingChange}
                    min={0}
                    max={99}
                    readOnly
                  />
                  {errors.age && <p className="text-danger">{errors.age}</p>}
                </CCol>

                {/* Gender */}
                <CCol md={4} className="mb-3">
                  <CFormLabel style={{ color: 'var(--color-black)' }}>
                    Gender <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    name="gender"
                    value={bookingDetails.gender || ''}
                    onChange={handleBookingChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                  {errors.gender && <p className="text-danger">{errors.gender}</p>}
                </CCol>

                {/* Mobile Number */}
                <CCol md={6} className="mb-3">
                  <CFormLabel style={{ color: 'var(--color-black)' }}>
                    Mobile Number <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="tel"
                    name="patientMobileNumber"
                    value={bookingDetails.patientMobileNumber || ''}
                    onChange={handleBookingChange}
                    maxLength={10}
                  />
                  {errors.patientMobileNumber && (
                    <p className="text-danger">{errors.patientMobileNumber}</p>
                  )}
                </CCol>

                {/* Address */}
                <CCol md={12}>
                  <h6 className="mb-3 border-bottom pb-2">Address</h6>
                  {(() => {
                    const address = bookingDetails.address || {}

                    const firstFields = ['houseNo', 'street', 'landmark'].filter(
                      (f) => f in address,
                    )
                    const secondFields = ['postalCode', 'po', 'city', 'state'].filter(
                      (f) => f in address,
                    )
                    const allFields = [...firstFields, ...secondFields]

                    const rows = []
                    allFields.forEach((field, index) => {
                      if (index % 3 === 0) rows.push([])
                      rows[rows.length - 1].push(field)
                    })

                    return rows.map((rowFields, rowIndex) => (
                      <CRow className="mb-3" key={rowIndex}>
                        {rowFields.map((field) => (
                          <CCol md={4} key={field}>
                            <CFormLabel
                              style={{ color: 'var(--color-black)' }}
                              className="text-capitalize"
                            >
                              {field === 'po' ? 'PO Address' : field}{' '}
                              {field !== 'landmark' && <span className="text-danger">*</span>}
                            </CFormLabel>

                            {field === 'po' ? (
                              <CFormSelect
                                value={selectedPO?.Name || ''}
                                onChange={(e) => {
                                  const po = postOffices.find((po) => po.Name === e.target.value)
                                  setSelectedPO(po)
                                  if (po) {
                                    handleNestedChange('address', 'city', po.Block || '')
                                    handleNestedChange('address', 'state', po.State || '')
                                  }
                                }}
                                required
                              >
                                <option value="">-- Select Post Office --</option>
                                {postOffices.map((po) => (
                                  <option key={po.Name} value={po.Name}>
                                    {po.Name.toUpperCase()}
                                  </option>
                                ))}
                              </CFormSelect>
                            ) : field === 'postalCode' ? (
                              <CFormInput
                                type="text"
                                value={address[field] || ''}
                                maxLength={6}
                                onChange={(e) => handlePostalCodeChange(e.target.value)}
                                required
                              />
                            ) : (
                              <CFormInput
                                type="text"
                                value={address[field] || ''}
                                readOnly={field === 'city' || field === 'state'}
                                onChange={(e) =>
                                  handleNestedChange('address', field, e.target.value)
                                }
                                required={field !== 'landmark'}
                              />
                            )}

                            {errors.address?.[field] && (
                              <div className="text-danger mt-1">{errors.address[field]}</div>
                            )}
                          </CCol>
                        ))}
                      </CRow>
                    ))
                  })()}
                </CCol>
              </CRow>
            </div>
          )}

          {/* 🔹 Show read-only data if patient selected */}
          {/* {selectedBooking && (
            <div>
              <h6 className="mb-3 border-bottom pb-2">Patient Information</h6>
              <p>
                <strong>Name:</strong> {bookingDetails.name}
              </p>
              <p>
                <strong>Patient ID:</strong> {bookingDetails.patientId}
              </p>
              <p>
                <strong>DOB:</strong> {bookingDetails.dob}
              </p>
              <p>
                <strong>Age:</strong> {bookingDetails.age}
              </p>
              <p>
                <strong>Gender:</strong> {bookingDetails.gender}
              </p>
              <p>
                <strong>Mobile:</strong> {bookingDetails.patientMobileNumber}
              </p>
              <p>
                <strong>Address:</strong> {selectedBooking.patientAddress}
              </p>
            </div>
          )} */}
        </div>

        {/* SECTION: Services Selection */}
        {visitType !== 'followup' && appointmentType.includes('service') && (
          <>
            <h6 className="mb-3 border-bottom pb-2">Select Service</h6>
            <CRow className="mb-4">
              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Category Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={selectedCategory}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    const selectedObj = categories.find((cat) => cat.categoryId === selectedId)

                    setSelectedCategory(selectedId)

                    setBookingDetails((prev) => ({
                      ...prev,
                      categoryId: selectedObj?.categoryId || '',
                      categoryName: selectedObj?.categoryName || '',
                    }))

                    // Remove error when selected
                    setErrors((prev) => ({ ...prev, selectedCategory: '' }))
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.selectedCategory && (
                  <div className="text-danger mt-1">{errors.selectedCategory}</div>
                )}
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Service <span className="text-danger">*</span>
                </CFormLabel>

                <CFormSelect
                  value={selectedService}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    const selectedObj = services.find((service) => service.serviceId === selectedId)

                    console.log('Selected service:', selectedObj)

                    setSelectedService(selectedId)

                    // ✅ Update bookingDetails for backend
                    setBookingDetails((prev) => ({
                      ...prev,
                      serviceId: selectedObj?.serviceId || '',
                      servicename: selectedObj?.serviceName || '',
                    }))

                    // ✅ Optional: clear subservices when service changes
                    setSelectedSubService('')
                    setSubServices([])

                    // ✅ Clear error when valid selection made
                    setErrors((prev) => ({
                      ...prev,
                      selectedService: selectedId ? '' : 'Please select a service',
                    }))
                  }}
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.selectedService && (
                  <div className="text-danger mt-1">{errors.selectedService}</div>
                )}
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Procedure Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  value={selectedSubService}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    const selectedObj = subServices.find((sub) => sub.subServiceId === selectedId)

                    setSelectedSubService(selectedId)

                    // ✅ Update bookingDetails with sub-service info
                    setBookingDetails((prev) => ({
                      ...prev,
                      subServiceId: selectedObj?.subServiceId || '',
                      subServiceName: selectedObj?.subServiceName || '',
                    }))

                    // ✅ Real-time validation clearing / setting
                    setErrors((prev) => ({
                      ...prev,
                      selectedSubService: selectedId ? '' : 'Please select a procedure name',
                    }))
                  }}
                  disabled={!selectedService || !subServices || subServices.length === 0}
                >
                  <option value="">Select Sub-Service</option>
                  {subServices && subServices.length > 0 ? (
                    subServices.map((sub) => (
                      <option key={sub.subServiceId} value={sub.subServiceId}>
                        {sub.subServiceName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No sub-services available
                    </option>
                  )}
                </CFormSelect>

                {/* ✅ Error message below */}
                {errors.selectedSubService && (
                  <div className="text-danger mt-1">{errors.selectedSubService}</div>
                )}
              </CCol>
            </CRow>
          </>
        )}

        {/* SECTION: Patient & Booking Details */}
        {visitType !== 'followup' && (
          <div>
            <h6 className="mb-3 border-bottom pb-2">Patient & Booking Details</h6>
            <CRow className="mb-4">
              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Branch <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="branchId"
                  value={bookingDetails.branchId || ''}
                  onChange={(e) => {
                    const selectedBranch = branches.find(
                      (branch) => branch.branchId === e.target.value,
                    )
                    setBookingDetails((prev) => ({
                      ...prev,
                      branchId: selectedBranch?.branchId || '',
                      branchname: selectedBranch?.branchName || '',
                    }))
                  }}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.branchname && (
                  <CFormText className="text-danger">{errors.branchname}</CFormText>
                )}

                {errors.branchname && <div className="text-danger">{errors.branchname}</div>}
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Doctor Name <span className="text-danger">*</span>
                </CFormLabel>

                {loadingDoctors ? (
                  <div className="text-center py-2" style={{ color: 'var(--color-black)' }}>
                    Loading doctors...
                  </div>
                ) : (
                  <CFormSelect
                    name="doctorName"
                    value={bookingDetails.doctorId || ''}
                    onChange={async (e) => {
                      const selectedDoctorId = e.target.value
                      const selectedDoctor = doctors.find((d) => d.doctorId === selectedDoctorId)

                      // ✅ Real-time validation clearing / setting
                      setErrors((prev) => ({
                        ...prev,
                        doctorName: selectedDoctorId ? '' : 'Please select a doctor name',
                      }))

                      if (!selectedDoctor) {
                        // Clear doctor-related details if user resets to "Select Doctor"
                        setBookingDetails((prev) => ({
                          ...prev,
                          doctorId: '',
                          doctorName: '',
                          doctorDeviceId: '',
                          consultationFee: 0,
                        }))
                        return
                      }

                      // ✅ Update booking details
                      setBookingDetails((prev) => ({
                        ...prev,
                        doctorId: selectedDoctor.doctorId,
                        doctorName: selectedDoctor.doctorName,
                        doctorDeviceId: selectedDoctor.doctorDeviceId,
                        ...(appointmentType?.toLowerCase() === 'inclinic' && {
                          consultationFee: selectedDoctor.doctorFees.inClinicFee || 0,
                        }),
                      }))

                      // ✅ Clear previous slots if needed
                      setSlots([])

                      // ✅ Fetch available slots for selected doctor
                      setLoadingFee(true)
                      try {
                        await fetchSlots(selectedDoctorId)
                      } catch (err) {
                        console.error('Error fetching slots:', err)
                      } finally {
                        setLoadingFee(false)
                      }
                    }}
                    disabled={loadingDoctors || loadingFee}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => {
                      // Determine which fee to show
                      let fee
                      if (
                        bookingDetails.consultationType?.toLowerCase().includes('service') &&
                        bookingDetails.subServiceId
                      ) {
                        fee = bookingDetails.consultationFee || 0
                      } else {
                        fee =
                          appointmentType?.toLowerCase() === 'inclinic'
                            ? doc.doctorFees.inClinicFee
                            : doc.doctorFees.vedioConsultationFee
                      }

                      return (
                        <option
                          key={doc.doctorId}
                          value={doc.doctorId}
                          disabled={!doc.doctorAvailabilityStatus}
                          style={{ color: doc.doctorAvailabilityStatus ? 'inherit' : '#aaa' }}
                        >
                          {doc.doctorName} - ₹{fee}
                          {!doc.doctorAvailabilityStatus ? ' (Not Available)' : ''}
                        </option>
                      )
                    })}
                  </CFormSelect>
                )}

                {errors.doctorName && <div className="text-danger mt-1">{errors.doctorName}</div>}
              </CCol>
            </CRow>
          </div>
        )}

        {/* SECTION: Consultation & Payment */}
        {visitType !== 'followup' && appointmentType.includes('service') && (
          <>
            <h6 className="mb-3 border-bottom pb-2">Consultation & Payment</h6>
            <CRow className="mb-4 g-3">
              {/* Consultation Fee */}
              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Consultation Fee <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput type="number" value={bookingDetails.consultationFee || 0} disabled />
              </CCol>
              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Service & Treatment Cost<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput type="number" value={bookingDetails.servicecost || 0} disabled />
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Discounted Amount <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput type="number" value={bookingDetails.discountAmount || 0} disabled />
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Discount(%) <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput type="number" value={bookingDetails.discountPercentage || 0} disabled />
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Total Amount <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput type="number" value={bookingDetails.totalFee || 0} disabled />
              </CCol>
              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Consultation Fee Type <span className="text-danger">*</span>
                </CFormLabel>
               <CFormSelect
  value={bookingDetails.foc || 'Paid'}
  onChange={handleFeeTypeChange}
>
  <option value="">-- Select Fee Type --</option>
  <option value="FOC">FOC (Free of Consultation)</option>
  <option value="Paid">Paid</option>
</CFormSelect>

              </CCol>
            </CRow>
          </>
        )}

        {/* ==================== Available Slots ==================== */}
        <h6 className="mb-3 border-bottom pb-2">Available Slots</h6>
        <CCol md={12}>
          <div>
            {/* Date Buttons */}
            <div className="d-flex gap-2 flex-wrap mb-3">
              {(slotsForSelectedDate || [])
                .map((s) => s.day || s.date)
                .filter((d) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const dateObj = new Date(d)
                  dateObj.setHours(0, 0, 0, 0)
                  return dateObj >= today // remove past dates
                })
                .sort((a, b) => new Date(a) - new Date(b))
                .map((dateValue, idx) => {
                  const dateObj = new Date(dateValue)
                  const isSelected =
                    new Date(selectedDate).toDateString() === dateObj.toDateString()
                  const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                  const dateLabel = dateObj.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                  })

                  return (
                    <CButton
                      key={idx}
                      onClick={() => {
                        const formattedDate = dateObj.toISOString().split('T')[0]

                        setSelectedDate(formattedDate)
                        setSelectedSlots([]) // clear old slot
                        setBookingDetails((prev) => ({
                          ...prev,
                          serviceDate: formattedDate,
                          servicetime: '',
                        }))

                        // ✅ Clear slot error if user selected a valid date
                        setErrors((prev) => ({
                          ...prev,
                          slot: '', // clear slot-related error on date select
                        }))
                      }}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-black)' : '#fff',
                        color: isSelected ? '#fff' : 'var(--color-black)',
                        border: '1px solid var(--color-black)',
                        minWidth: '80px',
                      }}
                    >
                      <div style={{ fontSize: '14px' }}>{dayLabel}</div>
                      <div style={{ fontSize: '12px' }}>{dateLabel}</div>
                    </CButton>
                  )
                })}
            </div>

            {/* Time Slots */}
            <div className="slot-grid mt-3">
              <CCard className="mb-4">
                <CCardBody className="w-100">
                  {slotsToShow.length === 0 ? (
                    <p className="text-center" style={{ color: 'var(--color-black)' }}>
                      No available slots for this date
                    </p>
                  ) : (
                    <>
                      <div
                        className="slots-container"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, 1fr)',
                          gap: '5px',
                        }}
                      >
                        {visibleSlots.map((slotObj, i) => {
                          const slotLabel = slotObj.slot
                          const isBooked = slotObj.slotbooked
                          const isSelectedSlot = selectedSlots.includes(slotLabel)

                          return (
                            <div
                              key={i}
                              style={{ cursor: 'pointer' ,color:"var(--color-black)"}}
                              className={`slot-item text-center border rounded px-2 py-1 transition-all duration-200
                        ${isBooked ? 'bg-danger text-white cursor-not-allowed opacity-60' : ''}
                        ${isSelectedSlot && !isBooked ? 'bg-primary text-white' : ''}
                        ${!isSelectedSlot && !isBooked ? 'bg-light   hover:bg-gray-200 cursor-pointer' : ''}`}
                              onClick={() => {
                                if (isBooked) return

                                // Single selection
                                setSelectedSlots([slotLabel])

                                // Update booking details
                                setBookingDetails((prev) => ({
                                  ...prev,
                                  servicetime: slotLabel,
                                }))

                                // ✅ Real-time error clearing on slot select
                                setErrors((prev) => ({
                                  ...prev,
                                  slot: '', // clear slot validation instantly
                                }))
                              }}
                            >
                              {slotLabel}
                            </div>
                          )
                        })}
                      </div>

                      {/* Show More / Less */}
                      {slotsToShow.length > 12 && (
                        <div className="text-center mt-2">
                          <CButton
                            color="secondary"
                            size="sm"
                            onClick={() => setShowAllSlots(!showAllSlots)}
                          >
                            {showAllSlots ? 'Show Less' : 'Show More'}
                          </CButton>
                        </div>
                      )}
                    </>
                  )}
                </CCardBody>
              </CCard>
            </div>
          </div>

          {/* ✅ Error message */}
          {errors.slot && <div className="text-danger mt-2">{errors.slot}</div>}
        </CCol>

        {/* SECTION: Symptoms */}
        {/* ==================== Symptoms & Attachment Sections ==================== */}
        {visitType !== 'followup' && (
          <>
            {/* SECTION: Symptoms */}
            <h6 className="mb-3 border-bottom pb-2">Symptoms</h6>

            <CRow className="mb-4">
              <CCol md={5}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Patient Complaints
                  {appointmentType?.toLowerCase().trim() !== 'services' && (
                    <span className="text-danger">*</span>
                  )}
                </CFormLabel>

                <CFormTextarea
                  name="problem"
                  value={bookingDetails.problem}
                  onChange={handleBookingChange}
                  minLength={5}
                  maxLength={300}
                  required={appointmentType?.toLowerCase().trim() !== 'services'}
                />
                {errors.problem && <p className="text-danger small">{errors.problem}</p>}
              </CCol>

              <CCol md={4}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Symptoms Duration
                  {appointmentType?.toLowerCase().trim() !== 'services' && (
                    <span className="text-danger">*</span>
                  )}
                </CFormLabel>

                <CFormInput
                  type="text" // change from number to text to fully control input
                  name="symptomsDuration"
                  value={bookingDetails.symptomsDuration}
                  onChange={(e) => {
                    // Allow only digits
                    const value = e.target.value.replace(/\D/g, '')
                    setBookingDetails((prev) => ({ ...prev, symptomsDuration: value }))
                  }}
                  min={1}
                  max={365}
                  required={appointmentType?.toLowerCase().trim() !== 'services'}
                />

                {errors.symptomsDuration && (
                  <p className="text-danger small">{errors.symptomsDuration}</p>
                )}
              </CCol>

              <CCol md={3}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Unit
                  {appointmentType?.toLowerCase().trim() !== 'services' && (
                    <span className="text-danger">*</span>
                  )}
                </CFormLabel>

                <CFormSelect
                  name="unit"
                  value={bookingDetails.unit || ''}
                  onChange={handleBookingChange}
                  required={appointmentType?.toLowerCase().trim() !== 'services'}
                >
                  <option value="">Select Unit</option>
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </CFormSelect>
                {errors.unit && <p className="text-danger small">{errors.unit}</p>}
              </CCol>
            </CRow>

            {/* SECTION: Attachment */}

            <CCol md={6}>
              <CFormLabel style={{ color: 'var(--color-black)' }}>Attachments</CFormLabel>
              <CFormInput
                type="file"
                name="attachments"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={async (e) => {
                  const newFiles = Array.from(e.target.files)

                  // Limit to 6 files total
                  if (newFiles.length + (bookingDetails.attachments?.length || 0) > 6) {
                    showCustomToast('You can upload a maximum of 6 files.', 'error')
                    e.target.value = ''
                    return
                  }

                  try {
                    const processedFiles = await Promise.all(
                      newFiles.map(async (file) => {
                        let processedFile = file

                        // ✅ Compress only image files larger than 250 KB
                        if (file.size > 250 * 1024 && file.type.startsWith('image/')) {
                          try {
                            const options = {
                              maxSizeMB: 0.25, // Target size ~250 KB
                              maxWidthOrHeight: 1920,
                              useWebWorker: true,
                            }
                            processedFile = await imageCompression(file, options)
                            console.log(
                              `Compressed ${file.name}: from ${(file.size / 1024).toFixed(
                                2,
                              )} KB → ${(processedFile.size / 1024).toFixed(2)} KB`,
                            )
                          } catch (compressErr) {
                            console.warn('Compression failed, using original file:', file.name)
                          }
                        }

                        // ✅ Convert to Base64
                        const toBase64 = (f) =>
                          new Promise((resolve, reject) => {
                            const reader = new FileReader()
                            reader.readAsDataURL(f)
                            reader.onload = () => resolve(reader.result)
                            reader.onerror = (err) => reject(err)
                          })

                        const base64 = await toBase64(processedFile)

                        return { name: file.name, base64 }
                      }),
                    )

                    // ✅ Update booking details
                    setBookingDetails((prev) => ({
                      ...prev,
                      attachments: [...(prev.attachments || []), ...processedFiles],
                    }))
                  } catch (error) {
                    console.error('Failed to process attachments:', error)
                    showCustomToast('Failed to process attachments.', 'error')
                  }
                }}
              />

              {/* ✅ Display uploaded file names */}
              {bookingDetails.attachments && bookingDetails.attachments.length > 0 && (
                <div className="mt-2">
                  {bookingDetails.attachments.map((file, index) => (
                    <div key={index} className="d-flex align-items-center mb-1">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        style={{
                          marginLeft: '10px',
                          color: 'red',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setBookingDetails((prev) => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index),
                          }))
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CCol>
          </>
        )}
        {visitType !== 'followup' && (
          <>
            <h6 className="mb-3 border-bottom pb-2 mt-4">Payment Details</h6>

            <CRow className="mb-4 g-3">
              {' '}
              {/* g-3 adds horizontal & vertical gap */}
              {/* Payment Type */}
              <CCol md={5}>
                <CFormLabel style={{ color: 'var(--color-black)' }}>
                  Payment Type <span className="text-danger">*</span>
                </CFormLabel>

                <CFormSelect
                  name="paymentType"
                  value={bookingDetails.paymentType}
                  className="custom-select-placeholder"
                  onChange={(e) => {
                    const value = e.target.value

                    // ✅ Update form value
                    setBookingDetails((prev) => ({
                      ...prev,
                      paymentType: value,
                    }))

                    // ✅ Real-time validation clearing
                    setErrors((prev) => ({
                      ...prev,
                      paymentType: value ? '' : 'Please select a payment type',
                    }))
                  }}
                >
                  <option value="">Select Payment Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                </CFormSelect>

                {/* ✅ Error message below */}
                {errors.paymentType && <div className="text-danger mt-1">{errors.paymentType}</div>}
              </CCol>
              <CCol md={5}>
  <CFormLabel style={{ color: 'var(--color-black)' }}>
    Payment Mode <span className="text-danger">*</span>
  </CFormLabel>

  <CFormSelect
    name="paymentMode"
    value={bookingDetails.paymentMode}
    className="custom-select-placeholder"
    onChange={(e) => {
      const value = e.target.value
      setBookingDetails((prev) => ({
        ...prev,
        paymentMode: value,
      }))
      setErrors((prev) => ({
        ...prev,
        paymentMode: value ? '' : 'Please select a payment mode',
      }))
    }}
  >
    <option value="">Select Payment Mode</option>
    <option value="Full">Full Payment</option>
    <option value="Partial">Part Payment</option>
  </CFormSelect>

  {errors.paymentMode && <div className="text-danger mt-1">{errors.paymentMode}</div>}
</CCol>
              {/* Doctor Referral Code */}
              <CCol md={6}>
                <h6>Referred By</h6>

                <Select
                  name="doctorRefCode"
                  value={
                    referDoctor.find((d) => d.referralId === bookingDetails.doctorRefCode) || null
                  }
                  getOptionLabel={(option) =>
                    ` ${option.fullName}-(${option.address.street},${option.address.city})`
                  }
                  getOptionValue={(option) => option.referralId}
                  onChange={(selected) =>
                    handleBookingChange({
                      target: {
                        name: 'doctorRefCode',
                        value: selected ? selected.referralId : '',
                      },
                    })
                  }
                  options={referDoctor}
                  placeholder="Select or search doctor..."
                  isSearchable
                />
              </CCol>
            </CRow>
          </>
        )}

        {selectedBooking == null && (
          <>
            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="onboardCheckbox"
                checked={onboardToCustomer}
                onChange={(e) => setOnboardToCustomer(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="onboardCheckbox"
                style={{ color: 'var(--color-black)', cursor: 'pointer' }}
              >
                Can we onboard this patient to the hospital’s customer list?
              </label>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="mt-4 text-end d-flex justify-content-end gap-2">
          <CButton
            color="secondary"
            onClick={() => {
              setBookingDetails(initialBookingDetails) // reset form data
              // close the modal
            }}
          >
            Reset
          </CButton>
          <CButton
            color="secondary"
            onClick={() => {
              setBookingDetails(initialBookingDetails) // reset form data
              onClose() // close the modal
            }}
          >
            Cancel
          </CButton>

          {visitType === 'followup' ? (
            <CButton
              onClick={() => handleFollowUpSubmit(selectedBooking)} // ✅ call follow-up function
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            >
              Submit
            </CButton>
          ) : (
            <CButton
              onClick={handleSubmit} // ✅ call normal booking function
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            >
              Submit
            </CButton>
          )}
        </div>

        {/* SECTION: Submit */}
      </COffcanvasBody>
    </COffcanvas>
  )

  // return (
  //   <CModal alignment="center" visible={visible} onClose={onClose} size="xl">
  //     <CModalHeader>
  //       <CModalTitle>Book Appointment</CModalTitle>
  //     </CModalHeader>
  //     <CModalBody>

  //     </CModalBody>
  //   </CModal>
  // )
}

export default BookAppointmentModal
