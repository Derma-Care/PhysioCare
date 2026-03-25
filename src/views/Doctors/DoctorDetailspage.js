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
// import { FaTrash } from 'react-icons/fa';
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
import 'react-toastify/dist/ReactToastify.css'
import { COLORS } from '../../Constant/Themes'
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

const DoctorDetailsPage = () => {
  const [categoryOptions, setCategoryOptions] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [delloading, setDelLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedSubServices, setSelectedSubServices] = useState([])
  const [saveloading, setSaveLoading] = useState(false)
  const [enabledTypes, setEnabledTypes] = useState({
      inClinic: false,
      online: false,
      serviceTreatment: false,
    })


  const { state } = useLocation()
  const [doctorData, setDoctorData] = useState(state?.doctor || {})
  const { fetchHospitalDetails, selectedHospital, fetchDoctors } = useHospital()
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState(1)
  const minDate = format(startOfToday(), 'yyyy-MM-dd')
  const maxDate = format(addDays(startOfToday(), 14), 'yyyy-MM-dd')
  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [slotsData, setSlotsData] = useState([])
  const [allSlots, setAllSlots] = useState([]) // Initialize allSlots
  const [loading, setLoading] = useState(false) // Initialize loading
  const [ratingComments, setRatingComments] = useState([])
  // Modal state
  const [visible, setVisible] = useState(false)
  const [visibleSlot, setVisibleSlot] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [timeSlots, setTimeSlots] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(state?.doctor || {})
  const [interval, setInterval] = useState(30) // default 30 min
  const [slots, setSlots] = useState([])
  // const []
  const [customerDetails, setCustomerDetails] = useState({})
  const [days, setDays] = useState([]) // Array of { date, dayLabel, dateLabel }
  const [ratings, setRatings] = useState(null)
  const [branchOptions, setBranchOptions] = useState([])
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const handleDateClick = (dateObj, index) => {
    setSelectedDate(format(dateObj.date, 'yyyy-MM-dd'))
    setSelectedDateIndex(index)
  }
  const [selectedSlots, setSelectedSlots] = useState([])
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deleteMode, setDeleteMode] = useState(null)
  // can be 'selected' or 'all' to know which button triggered
  const [isSubServiceComplete, setIsSubServiceComplete] = useState(true)

  const handleEditToggle = () => setIsEditing(!isEditing)

  const handleDeleteToggleE = async (id) => {
    setDelLoading(true)
    setShowModal(false) // Close modal after confirmation
    const isDeleted = await handleDeleteToggle(id)
    console.log(isDeleted)
    if (isDeleted) {
      navigate('/employee-management/doctor')
      fetchDoctors()
      showCustomToast('Doctor deleted successfully', 'success')
    } else {
      setDelLoading(false)
      // toast.error(`${isDeleted.message}` || 'Failed to delete doctor')
    }
  }
  const buildConsultationPayload = (availableConsultations = []) => ({
  serviceAndTreatments: availableConsultations.includes('Services & Treatments') ? 3 : 0,
  inClinic: availableConsultations.includes('In-Clinic') ? 1 : 0,
  videoOrOnline: availableConsultations.includes('Video/Online') ? 2 : 0,
})


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  // inside useEffect
  useEffect(() => {
    if (!doctorData?.doctorId) {
      fetchDoctor()
    }
  }, [doctorData?.doctorId])
  const fetchDoctor = async () => {
    try {
      const res = await http.get(`/getDoctorById/${doctorId}`)
      setDoctorData(res.data)
      setFormData(res.data)
    } catch (err) {
      console.error('Error fetching doctor', err)
    }
  }

  const [showModal, setShowModal] = useState(false)
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  const generateTimeSlots = (interval = 30, isToday = false) => {
    const slots = []
    const start = new Date()
    const now = new Date()

    start.setHours(7, 0, 0, 0)
    const end = new Date()
    end.setHours(20, 0, 0, 0)

    while (start <= end) {
      const formatted = start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      if (!isToday || start > now) {
        slots.push(formatted)
      }

      start.setMinutes(start.getMinutes() + interval)
    }
    return slots
  }

  // const handleGenerate = () => {
  //   const newSlots = generateTimeSlots(interval, isToday)
  //   setTimeSlots(newSlots) // temporary for modal
  //   setSlots(newSlots) // if you want in main grid
  //   setSelectedSlots([]) // reset selected
  //   toast.success(`Generated ${newSlots.length} slots of ${interval} minutes`)
  // }

  const [availableSlots, setAvailableSlots] = useState(generateTimeSlots())

  const [selectedToDelete, setSelectedToDelete] = useState([])
  const openModal = () => {
    // const generated = generateTimeSlots(isToday)
    // setTimeSlots(generated)
    // setSelectedSlots([])
    setVisibleSlot(true)
  }
  const handleUpdate = async () => {
    try {
      setSaveLoading(true)
      const payload = {
        ...formData,
         consultation: buildConsultationPayload(formData.availableConsultations),
        branches:
          formData.branch?.map((b) => ({
            branchId: b.branchId,
            branchName: b.branchName,
          })) || [],

        category: formData.category || [], // already an array from useEffect

        subCategory: formData.subCategory
          ? {
              subCategoryId: formData.subCategory.subCategoryId,
              subCategoryName: formData.subCategory.subCategoryName,
            }
          : null,
        service:
          formData.services?.map((s) => ({
            serviceId: s.serviceId,
            serviceName: s.serviceName,
          })) || [],
      }

      const res = await http.put(`/updateDoctor/${doctorData.doctorId}`, payload)

      if (res.data.success) {
        setDoctorData(res.data.updatedDoctor)
        setFormData(res.data.updatedDoctor)
        setIsEditing(false)

        navigate(`/employee-management/doctor`)
        await fetchDoctors()
        showCustomToast(res.data.message || 'Doctor updated successfully', 'success')
      } else {
        showCustomToast('Failed to update doctor', 'error')
      }
    } catch (err) {
      console.error('Update error:', err)
      // showCustomToast('Error while updating doctor', 'error')
    } finally {
      setSaveLoading(false)
    }
  }
  const toggleType = (type) => {
    setEnabledTypes((prev) => {
      const updated = { ...prev, [type]: !prev[type] }

      // Build availableConsultations array based on updated enabledTypes
      const consultations = []
      if (updated.serviceTreatment) consultations.push('Services & Treatments')
      if (updated.inClinic) consultations.push('In-Clinic')
      if (updated.online) consultations.push('Video/Online')

      setFormData((prevForm) => ({
        ...prevForm,
        availableConsultations: consultations,
      }))

      console.log('Available Consultations:', consultations)

      return updated
    })
  }

  useEffect(() => {
    if (doctorData && !isEditing) {
      setFormData({
        ...doctorData,
        branch:
          doctorData.branches?.map((b) => ({
            branchId: b.branchId || b.id,
            branchName: b.branchName || b.name,
          })) || [],
      })
    }
  }, [doctorData, isEditing])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    setSelectedDate(today)
    fetchSlots(today) // Fetch available slots for today
  }, [])

  useEffect(() => {
    const generateUpcomingDays = () => {
      const localToday = new Date()
      localToday.setHours(0, 0, 0, 0)

      const fullDayList = []

      for (let i = 0; i < 15; i++) {
        const date = new Date(localToday)
        date.setDate(localToday.getDate() + i)

        fullDayList.push({
          date,
          dayLabel: format(date, 'EEE'),
          dateLabel: format(date, 'dd MMM'),
        })
      }

      setDays(fullDayList)
    }

    generateUpcomingDays()
  }, [])

  const handleAddSlot = async () => {
    const newSlots = selectedSlots.filter(
      (slot) =>
        !slotsData.some(
          (existingSlot) => existingSlot.slot === slot && existingSlot.date === selectedDate,
        ),
    )

    if (newSlots.length === 0) {
      alert('No new slots to add!')
      return
    }

    const payload = {
      doctorId: doctorData?.doctorId,
      date: selectedDate,
      availableSlots: newSlots.map((slot) => ({
        slot,
        slotbooked: false,
      })),
    }

    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      const res = await http.post(
        `/addDoctorSlots/${hospitalId}/${branchId}/${doctorData.doctorId}`,
        payload,
      )

      if (res.data.success) {
        // alert(' Slots added successfully')
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
    (Array.isArray(allSlots) ? allSlots.find((slotData) => slotData.date === selectedDate) : null)
      ?.availableSlots || []

  const newSlots = timeSlots.filter((slot) => {
    return !slotsData.some(
      (existingSlot) => existingSlot.slot === slot && existingSlot.date === selectedDate,
    )
  })

  const fetchSlots = async () => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      const response = await http.get(
        `/getDoctorSlots/${hospitalId}/${branchId}/${doctorData.doctorId}`,
      )

      if (response.data.success) {
        console.log('Fetched Slots Data:', response.data.data)
        setAllSlots(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDoctorRatings = async () => {
      try {
        const hospitalId = localStorage.getItem('HospitalId')
        const response = await http.get(`/getAverageRatingsByDoctorId/${doctorData.doctorId}`)

        if (!response.data.success) {
          setError('Failed to fetch ratings')
          return
        }

        const ratingData = response.data.data
        setRatings(ratingData)

        const mobileNumbers = [
          ...new Set(ratingData.comments?.map((c) => c.customerMobileNumber) || []),
        ]

        console.log('Mobile numbers to fetch:', mobileNumbers)

        const customers = {}
        await Promise.all(
          mobileNumbers.map(async (number) => {
            try {
              const res = await getCustomerByMobile(number)
              console.log('Mobile numbers to fetch:', res)

              customers[number] = res?.data?.fullName || number
            } catch (err) {
              customers[number] = number
            }
          }),
        )
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
    if (selectedSlots.includes(slot)) {
      setSelectedSlots((prev) => prev.filter((s) => s !== slot))
    } else {
      setSelectedSlots((prev) => [...prev, slot])
    }
  }

  console.log(customerDetails)

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  function formatTimeAgo(dateString) {
    // Parse DD-MM-YYYY hh:mm:ss AM/PM manually
    const [datePart, timePart, meridian] = dateString.split(' ')
    const [day, month, year] = datePart.split('-').map(Number)
    let [hours, minutes, seconds] = timePart.split(':').map(Number)

    if (meridian === 'PM' && hours !== 12) hours += 12
    if (meridian === 'AM' && hours === 12) hours = 0

    const date = new Date(year, month - 1, day, hours, minutes, seconds)

    const diff = Math.floor((new Date() - date) / 60000) // minutes
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff} minute${diff > 1 ? 's' : ''} ago`
    const hoursDiff = Math.floor(diff / 60)
    if (hoursDiff < 24) return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`
    const days = Math.floor(hoursDiff / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  useEffect(() => {
    if (doctorData?.doctorId) {
      fetchSlots()
    }
  }, [doctorData?.doctorId]) // <<< Track the real changing value

  if (!doctorData) return <p>No doctor data found.</p>

  console.log(customerDetails)
  const validateForm = () => {
    let newErrors = {}

    // License: alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(formData.doctorLicence.trim())) {
      newErrors.doctorLicence = 'License must be alphanumeric.'
    }

    // Name: only letters and spaces
    if (!/^[A-Za-z\s.]+$/.test(formData.doctorName)) {
      newErrors.doctorName = 'Name should contain only letters, spaces, and dots.'
    }

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.doctorEmail.trim())) {
      newErrors.doctorEmail = 'Enter a valid email address.'
    }

    // Qualification
    if (!/^[A-Za-z\s]+$/.test(formData.qualification.trim())) {
      newErrors.qualification = 'Qualification should contain only letters.'
    }

    // Specialization
    if (!/^[A-Za-z\s]+$/.test(formData.specialization.trim())) {
      newErrors.specialization = 'Specialization should contain only letters.'
    }

    // Experience
    if (!/^\d+$/.test(formData.experience.trim())) {
      newErrors.experience = 'Experience should contain only numbers.'
    }

    // Languages (optional but if provided, allow only letters and commas)
    if (formData.languages && !formData.languages.every((lang) => /^[A-Za-z\s]+$/.test(lang))) {
      newErrors.languages = 'Languages should contain only letters.'
    }

    // Contact Number
    if (!/^[6-9]\d{9}$/.test(formData.doctorMobileNumber.trim())) {
      newErrors.doctorMobileNumber = 'Contact must be a 10-digit number starting with 6-9.'
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = 'Please select gender.'
    }

    // Available Days
    if (!/^[A-Za-z,\s\-]+$/.test(formData.availableDays)) {
      newErrors.availableDays = 'Days should contain only letters, commas, spaces, and hyphens.'
    }

    // Available Times (optional, you can skip or add a custom rule)
    if (formData.availableTimes.trim() === '') {
      newErrors.availableTimes = 'Please enter available timings.'
    }

    // In-clinic Fee
    if (!/^\d+$/.test(formData.doctorFees.inClinicFee)) {
      newErrors.inClinicFee = 'In-Clinic Fee should contain only numbers.'
    }

    // Video Consultation Fee
    if (!/^\d+$/.test(formData.doctorFees.vedioConsultationFee)) {
      newErrors.vedioConsultationFee = 'Video Consultation Fee should contain only numbers.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Handle update with validation
  const handleUpdateWithValidation = async () => {
    if (validateForm()) {
      // run update logic
      const success = await handleUpdate() // make sure handleUpdate returns a success status
      if (success) {
        // ✅ show toast after update is actually done
        showCustomToast('Doctor details updated successfully!', 'success', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    }
  }
 



  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')
        const response = await GetClinicBranches(clinicId)

        const branches = response?.data || [] // API gives array?
        const formatted = branches.map((b) => ({
          value: b.branchId || b.id,
          label: b.branchName || b.name,
        }))

        setBranchOptions(formatted)
      } catch (err) {
        console.error('Error fetching branches:', err)
        setBranchOptions([])
      }
    }

    fetchBranches()
  }, [])
  // Sync category into formData
  // Category → formData
  // useEffect(() => {
  //   if (selectedCategory) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       category: [
  //         {
  //           categoryId: selectedCategory.value,
  //           categoryName: selectedCategory.label,
  //         },
  //       ],
  //     }))
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       category: [],
  //     }))
  //   }
  // }, [selectedCategory])
  // ✅ When Category changes → update formData + fetch services
  // 🔹 Fetch Categories on mount
  // Categories fetched on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryData()
        const categories = res?.data || []
        setCategoryOptions(categories.map((c) => ({ value: c.categoryId, label: c.categoryName })))
      } catch (err) {
        console.error(err)
        setCategoryOptions([])
      }
    }
    fetchCategories()
  }, [])

  // 🔹 Handle category change manually
  const handleCategoryChange = async (selectedCategories) => {
    setSelectedCategory(selectedCategories)

    if (!selectedCategories || selectedCategories.length === 0) {
      setServiceOptions([])
      setSubServiceOptions([])
      setSelectedServices([])
      setSelectedSubServices([])
      setFormData((prev) => ({ ...prev, category: [], services: [], subServices: [] }))
      return
    }

    try {
      const allServicesMap = new Map(serviceOptions.map((s) => [s.value, s])) // keep existing
      for (let cat of selectedCategories) {
        const res = await serviceData(cat.value) // fetch services for category
        const services = res?.data || []

        services.forEach((s) => {
          if (!allServicesMap.has(s.serviceId)) {
            allServicesMap.set(s.serviceId, { value: s.serviceId, label: s.serviceName })
          }
        })
      }

      const formattedServices = Array.from(allServicesMap.values())
      setServiceOptions(formattedServices)

      // Keep previously selected services if still available
      const filteredSelectedServices = selectedServices.filter((s) =>
        formattedServices.some((fs) => fs.value === s.value),
      )
      setSelectedServices(filteredSelectedServices)

      // Keep subservices for still-selected services
      const filteredSubServices = selectedSubServices.filter((ss) =>
        filteredSelectedServices.some((s) => (ss.serviceId ? ss.serviceId === s.value : true)),
      )
      setSelectedSubServices(filteredSubServices)

      setFormData((prev) => ({
        ...prev,
        category: selectedCategories.map((c) => ({ categoryId: c.value, categoryName: c.label })),
        services: filteredSelectedServices.map((s) => ({
          serviceId: s.value,
          serviceName: s.label,
        })),
        subServices: filteredSubServices.map((ss) => ({
          subServiceId: ss.value,
          subServiceName: ss.label,
        })),
      }))
    } catch (err) {
      console.error('❌ Error fetching services:', err)
      setServiceOptions([])
    }
  }

  // Services → formData
  useEffect(() => {
    if (selectedServices.length > 0) {
      setFormData((prev) => ({
        ...prev,
        services: selectedServices.map((s) => ({
          serviceId: s.value,
          serviceName: s.label,
        })),
      }))
    }
  }, [selectedServices])

  // SubServices → formData
  useEffect(() => {
    if (selectedSubServices.length > 0) {
      setFormData((prev) => ({
        ...prev,
        subServices: selectedSubServices.map((ss) => ({
          subServiceId: ss.value,
          subServiceName: ss.label,
        })),
      }))
    }
  }, [selectedSubServices])

  // ✅ Prefill when editing doctor
  useEffect(() => {
    const prefillData = async () => {
      if (!doctorData) return

      // Prefill categories
      const selectedCats = doctorData.category.map((c) => ({
        value: c.categoryId,
        label: c.categoryName,
      }))
      setSelectedCategory(selectedCats)

      // Fetch all services for all categories
      const allServicesMap = new Map()
      for (let cat of doctorData.category) {
        const res = await serviceData(cat.categoryId)
        const services = res?.data || []
        services.forEach((s) => {
          if (!allServicesMap.has(s.serviceId)) {
            allServicesMap.set(s.serviceId, {
              value: s.serviceId,
              label: s.serviceName,
              categoryId: cat.categoryId,
            })
          }
        })
      }
      const allServices = Array.from(allServicesMap.values())
      setServiceOptions(allServices)

      // Prefill selected services
      const selectedSvcs = doctorData.service.map((s) => ({
        value: s.serviceId,
        label: s.serviceName,
      }))
      setSelectedServices(selectedSvcs)

      // Fetch subservices for all selected services
      const subRes = await Promise.all(selectedSvcs.map((s) => subServiceData(s.value)))
      const allSubservices = subRes.flatMap((res) => res?.data?.[0]?.subServices || [])

      // Prefill subservices
      const selectedSubSvc = doctorData.subServices
        .filter((ss) => allSubservices.some((s) => s.subServiceId === ss.subServiceId)) // keep only valid subservices
        .map((ss) => ({
          value: ss.subServiceId,
          label: ss.subServiceName,
          serviceId: allSubservices.find((s) => s.subServiceId === ss.subServiceId)?.serviceId,
        }))

      setSubServiceOptions(
        allSubservices.map((ss) => ({
          value: ss.subServiceId,
          label: ss.subServiceName,
          serviceId: ss.serviceId,
        })),
      )
      setSelectedSubServices(selectedSubSvc)
    }

    prefillData()
  }, [doctorData])

  // When interval changes
  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval)
    setSlots([]) // clear previously generated slots
    setTimeSlots([]) // if using timeSlots for modal
    setSelectedSlots([]) // clear selection
  }

  // 🔹 Fetch subServices when services change
  useEffect(() => {
    if (!selectedServices || selectedServices.length === 0) {
      setSubServiceOptions([])
      setSelectedSubServices([])
      return
    }

    // const fetchSubServices = async () => {
    //   try {
    //     const responses = await Promise.all(selectedServices.map((s) => subServiceData(s.value)))

    //     // API may return array or object with `subServices`
    //     const all = responses.flatMap((res) => {
    //       const subList = res?.data || []
    //       if (Array.isArray(subList)) {
    //         return subList.flatMap((item) => item.subServices || [])
    //       } else if (subList?.subServices) {
    //         return subList.subServices
    //       }
    //       return []
    //     })

    //     // Remove duplicates
    //     const unique = Array.from(new Map(all.map((ss) => [ss.subServiceId, ss])).values())

    //     setSubServiceOptions(
    //       unique.map((ss) => ({
    //         value: ss.subServiceId,
    //         label: ss.subServiceName,
    //       })),
    //     )
    //   } catch (err) {
    //     console.error('Error fetching subservices:', err)
    //     setSubServiceOptions([])
    //   }
    // }

    // fetchSubServices()
  }, [selectedServices])

  // 🔹 Fetch Categories on mount
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const res = await CategoryData()
  //       const categories = res?.data || []
  //       setCategoryOptions(
  //         categories.map((c) => ({
  //           value: c.categoryId,
  //           label: c.categoryName,
  //         })),
  //       )
  //     } catch (err) {
  //       console.error('Error fetching categories:', err)
  //       setCategoryOptions([])
  //     }
  //   }

  //   fetchCategories()
  // }, [])

  // const handleCategoryChange = async (selectedCategory) => {
  //   setSelectedCategory(selectedCategory)
  //   setFormData((prev) => ({
  //     ...prev,
  //     category: selectedCategory
  //       ? { categoryId: selectedCategory.value, categoryName: selectedCategory.label }
  //       : null,
  //     services: [],
  //     subServices: [],
  //   }))

  //   if (!selectedCategory) {
  //     setServiceOptions([])
  //     setSubServiceOptions([])
  //     return
  //   }

  //   try {
  //     const res = await serviceDataH() // fetch all services
  //     const services = res?.data || []

  //     // ✅ filter by category
  //     const filtered = services.filter((s) => s.categoryId === selectedCategory.value)

  //     // ✅ deduplicate services
  //     const uniqueServices = Array.from(new Map(filtered.map((s) => [s.serviceId, s])).values())

  //     setServiceOptions(
  //       uniqueServices.map((s) => ({
  //         value: s.serviceId,
  //         label: s.serviceName,
  //       })),
  //     )
  //     setSubServiceOptions([])
  //   } catch (err) {
  //     console.error('Error fetching services:', err)
  //     setServiceOptions([])
  //   }
  // }

  // const branchOptions = allBranches.map((b) => ({
  //   value: b.branchId,
  //   label: b.branchName,
  // }))

  const handleServiceChange = async (selectedSvc) => {
    // Remove duplicates
    const uniqueServices = Array.from(new Map(selectedSvc.map((s) => [s.value, s])).values())
    setSelectedServices(uniqueServices)

    // Fetch new subservices for newly selected services
    const newServiceIds = uniqueServices.map((s) => s.value)
    const subRes = await Promise.all(newServiceIds.map((id) => subServiceData(id)))
    const newSubservices = subRes
      .flatMap((res) => res?.data?.[0]?.subServices || [])
      .map((ss) => ({ value: ss.subServiceId, label: ss.subServiceName, serviceId: ss.serviceId }))

    // Merge with existing prefilled subservices (keep everything)
    const mergedSubMap = new Map([
      ...subServiceOptions.map((s) => [s.value, s]),
      ...newSubservices.map((s) => [s.value, s]),
    ])
    setSubServiceOptions(Array.from(mergedSubMap.values()))

    // Keep previously selected subservices
    const filteredSubServices = selectedSubServices.filter((ss) => mergedSubMap.has(ss.value))
    setSelectedSubServices(filteredSubServices)

    // Update formData
    setFormData((prev) => ({
      ...prev,
      services: uniqueServices.map((s) => ({ serviceId: s.value, serviceName: s.label })),
      subServices: filteredSubServices.map((ss) => ({
        subServiceId: ss.value,
        subServiceName: ss.label,
      })),
    }))
  }

  console.log(interval)
  const handleGenerate = async () => {
    console.log(selectedHospital.data.openingTime)

    if (
      !selectedHospital ||
      !selectedHospital.data.openingTime ||
      !selectedHospital.data.closingTime
    ) {
      console.warn('Hospital timings not loaded yet:', selectedHospital)
      return
    }

    const doctorId = doctorData?.doctorId
    const branchId = localStorage.getItem('branchId')
    const date = selectedDate // from calendar
    const intervaltime = interval
    // const start = selectedHospital.data.openingTime // ✅ directly from object

    // const end = selectedHospital.data.closingTime // ✅ directly from object
    // ✅ directly from object
    const availableTimes = doctorData?.availableTimes || `${start} - ${end}` // fallback

    const [start, end] = availableTimes.split('-').map((time) => time.trim())

    console.log(start) // "09:00 AM"
    console.log(end) // "04:00 PM"

    const slots = await fetchDoctorSlots(doctorId, branchId, date, intervaltime, start, end)
    console.log(slots)

   if (!slots || slots.length === 0) {
  setSlots([])        // grid
  setTimeSlots([])    // modal
  setSelectedSlots([])

 showCustomToast("Timing not available for this doctor", "error")
  return
}

// If slots exist
setSlots(slots)
setTimeSlots(slots)
setSelectedSlots([])

showCustomToast(`Generated ${slots.length} slots`, "success")
  }

  const checkSubServiceDetails = async (ids) => {
    console.log(ids)
    let incomplete = false
    const hospitalId = localStorage.getItem('HospitalId')
    for (const id of ids) {
      const data = await getSubServiceById(hospitalId, id) // Use actual hospitalId
      if (!data || !data.price || !data.finalCost) {
        incomplete = true
        break
      }
    }

    setIsSubServiceComplete(!incomplete)
  }
 useEffect(() => {
  if (!doctorData) return;

  setEnabledTypes({
    inClinic: Number(doctorData?.doctorFees?.inClinicFee) > 0,
    online: Number(doctorData?.doctorFees?.vedioConsultationFee) > 0,
    serviceTreatment:
      Array.isArray(doctorData?.subServices) && doctorData.subServices.length > 0 ||
      Array.isArray(doctorData?.service) && doctorData.service.length > 0
  });
}, [doctorData, isEditing]);




  return (
    <div className="doctor-details-page" style={{ padding: '1rem' }}>
      <ToastContainer />
      <h3 style={{ color: 'var(--color-black)' }}>Doctor Details & Slots Management</h3>

      <CCard className="mb-3">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center p-3 border rounded">
            {/* Doctor ID and Availability */}
            <div>
              <p className="mb-1">
                <strong
                  style={{ color: 'var(--color-black)', fontWeight: 'bold', fontSize: '24px' }}
                >
                  {' '}
                  {capitalizeWords(doctorData.doctorName)}
                </strong>
              </p>
              <p className="mb-1" style={{ color: 'var(--color-black)' }}>
                ID:
                <strong> {doctorData.doctorId} </strong>
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <img
                src={doctorData.doctorPicture}
                alt="Doctor"
                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                className="ms-auto"
              />
            </div>
          </div>

          <CNav variant="tabs" className="mt-3 navhover" role="tablist">
            <CNavItem>
              <CNavLink
                active={activeKey === 1}
                onClick={() => setActiveKey(1)}
                style={{ color: 'var(--color-black)' }}
              >
                Doctor Profile
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeKey === 2}
                onClick={() => setActiveKey(2)}
                style={{ color: 'var(--color-black)' }}
              >
                Doctor Slots
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeKey === 3}
                onClick={() => setActiveKey(3)}
                style={{ color: 'var(--color-black)' }}
              >
                Rating & Comments
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeKey === 4}
                onClick={() => setActiveKey(4)}
                style={{ color: 'var(--color-black)' }}
              >
                Services
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            <CTabContent>
              <CTabPane visible={activeKey === 1} className="pt-3">
                <CCard className="mb-4 shadow-sm">
                  <CCardBody>
                    <h5 className="mb-3" style={{ color: 'var(--color-black)' }}>
                      👨‍⚕️ Doctor Information
                    </h5>
                    {isEditing && (
                      <>
                        <CRow className="mb-3">
                          {/* Category */}
                          <CCol md={6}>
                            <strong>Category:</strong>
                            <Select
                              isMulti
                              options={categoryOptions}
                              value={selectedCategory}
                              onChange={handleCategoryChange}
                              placeholder="Select Category"
                            />
                          </CCol>

                          {/* Services */}
                          <CCol md={6}>
                            <strong>Services:</strong>
                            <Select
                              isMulti
                              options={serviceOptions}
                              value={selectedServices}
                              onChange={handleServiceChange}
                              placeholder="Select Service(s)"
                            />
                          </CCol>
                        </CRow>

                        <CRow className="mb-3">
                          <CCol md={12}>
                            <strong>Procedures:</strong>
                            <Select
                              isMulti
                              options={subServiceOptions}
                              value={selectedSubServices}
                              onChange={(ss) => {
                                setSelectedSubServices(ss)
                                setFormData((prev) => ({
                                  ...prev,
                                  subServices: ss.map((s) => ({
                                    subServiceId: s.value,
                                    subServiceName: s.label,
                                  })),
                                }))
                                const ids = ss.map((opt) => opt.value)
                                checkSubServiceDetails(ids)
                              }}
                              placeholder="Select Procedures"
                            />
                          </CCol>
                        </CRow>
                        {!isSubServiceComplete && (
                          <div className="text-danger mt-1 mb-2">
                            Some selected Procedures are missing details like price or final cost.
                            <br />
                            <a href="/procedure-Management" className="text-primary">
                              Please add Procedure details
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {isEditing && (
                      <CRow className="mb-4 justify-content-between align-content-center align-items-center">
                        <CCol md={3}>
                          {/* Preview Box */}
                          {formData.doctorPicture ? (
                            <img
                              src={formData.doctorPicture}
                              alt="Doctor"
                              className="w-100 rounded border border-secondary"
                              style={{ maxHeight: '120px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="w-100 d-flex align-items-center justify-content-center border border-dashed border-secondary rounded"
                              style={{ height: '120px', color: '#888' }}
                            >
                              Preview
                            </div>
                          )}
                        </CCol>

                        <CCol md={3}>
                          {/* File Input Button */}
                          <label
                            className="btn mt-3 text-white"
                            style={{ cursor: 'pointer', backgroundColor: 'var(--color-black)' }}
                          >
                            Select Image
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={async (e) => {
                                const file = e.target.files[0]
                                const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

                                if (file) {
                                  if (file.size > MAX_FILE_SIZE) {
                                    showCustomToast('File size exceeds 2 MB!', 'error')
                                    e.target.value = ''
                                    return
                                  }

                                  try {
                                    const base64 = await toBase64(file)
                                    setFormData((prev) => ({
                                      ...prev,
                                      doctorPicture: base64,
                                    }))
                                    e.target.value = '' // reset input
                                  } catch (err) {
                                    console.error(err)
                                    e.target.value = ''
                                  }
                                }
                              }}
                            />
                          </label>
                          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                            JPG/PNG, Max 2 MB
                          </p>
                        </CCol>
                      </CRow>
                    )}

                    <CRow className="mb-4" style={{ color: 'var(--color-black)' }}>
                      <CCol md={6}>
                        <p>
                          <strong>License No:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="doctorLicence"
                              value={formData.doctorLicence}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                setFormData((prev) => ({ ...prev, doctorLicence: cleaned }))
                                setErrors((prev) => ({ ...prev, doctorLicence: '' }))
                              }}
                            />
                            {errors.doctorLicence && (
                              <small className="text-danger">{errors.doctorLicence}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.doctorLicence}</p>
                        )}

                        <p>
                          <strong>Name:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="doctorName"
                              value={formData.doctorName}
                              onChange={(e) => {
                                // allow only letters, spaces, and dots
                                const cleaned = e.target.value.replace(/[^A-Za-z\s.]/g, '')
                                setFormData((prev) => ({
                                  ...prev,
                                  doctorName: cleaned,
                                }))
                                setErrors((prev) => ({ ...prev, doctorName: '' })) // clear error dynamically
                              }}
                            />
                            {errors.doctorName && (
                              <small className="text-danger">{errors.doctorName}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.doctorName}</p>
                        )}

                        <p>
                          <strong>Email:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="doctorEmail"
                              value={formData.doctorEmail}
                              onChange={(e) => {
                                const value = e.target.value
                                setFormData((prev) => ({ ...prev, doctorEmail: value }))

                                // dynamic validation as you type
                                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    doctorEmail:
                                      'Please enter a valid email address (must contain @).',
                                  }))
                                } else {
                                  setErrors((prev) => ({ ...prev, doctorEmail: '' }))
                                }
                              }}
                              onBlur={(e) => {
                                // validate again when leaving field
                                const value = e.target.value
                                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    doctorEmail:
                                      'Please enter a valid email address (must contain @).',
                                  }))
                                }
                              }}
                            />
                            {errors.doctorEmail && (
                              <small className="text-danger">{errors.doctorEmail}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.doctorEmail}</p>
                        )}

                        <p>
                          <strong>Qualification:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="qualification"
                              value={formData.qualification}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, '')
                                setFormData((prev) => ({ ...prev, qualification: cleaned }))
                                setErrors((prev) => ({ ...prev, qualification: '' }))
                              }}
                            />
                            {errors.qualification && (
                              <small className="text-danger">{errors.qualification}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.qualification}</p>
                        )}

                        <p>
                          <strong>Specialization:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="specialization"
                              value={formData.specialization}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, '')
                                setFormData((prev) => ({ ...prev, specialization: cleaned }))
                                setErrors((prev) => ({ ...prev, specialization: '' }))
                              }}
                            />
                            {errors.specialization && (
                              <small className="text-danger">{errors.specialization}</small>
                            )}{' '}
                          </>
                        ) : (
                          <p>{doctorData.specialization}</p>
                        )}

                        <p>
                          <strong>Experience:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="experience"
                              value={formData.experience}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^0-9]/g, '')
                                setFormData((prev) => ({ ...prev, experience: cleaned }))
                                setErrors((prev) => ({ ...prev, experience: '' }))
                              }}
                            />
                            {errors.experience && (
                              <small className="text-danger">{errors.experience}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.experience} Years</p>
                        )}
                      </CCol>

                      <CCol md={6}>
                        <p>
                          <strong>Languages Known:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="languages"
                              value={formData.languages?.join(', ') || ''}
                              onChange={(e) => {
                                // allow only letters, commas, and spaces
                                const cleaned = e.target.value.replace(/[^A-Za-z,\s]/g, '')
                                setFormData((prev) => ({
                                  ...prev,
                                  languages: cleaned.split(',').map((lang) => lang.trim()),
                                }))
                                setErrors((prev) => ({ ...prev, languages: '' }))
                              }}
                            />
                            {errors.languages && (
                              <small className="text-danger">{errors.languages}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.languages?.join(', ')}</p>
                        )}
                        <p>
                          <strong>Contact:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="doctorMobileNumber"
                              value={formData.doctorMobileNumber}
                              onChange={(e) => {
                                // allow only digits
                                const cleaned = e.target.value.replace(/[^0-9]/g, '')
                                setFormData((prev) => ({
                                  ...prev,
                                  doctorMobileNumber: cleaned,
                                }))
                                setErrors((prev) => ({ ...prev, doctorMobileNumber: '' }))
                              }}
                            />
                            {errors.doctorMobileNumber && (
                              <small className="text-danger">{errors.doctorMobileNumber}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.doctorMobileNumber}</p>
                        )}

                        <p>
                          <strong>Gender:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <select
                              className="form-select"
                              value={formData.gender}
                              onChange={(e) => {
                                setFormData((prev) => ({ ...prev, gender: e.target.value }))
                                setErrors((prev) => ({ ...prev, gender: '' }))
                              }}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && (
                              <small className="text-danger">{errors.gender}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.gender}</p>
                        )}

                        <p>
                          <strong>Available Days:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="availableDays"
                              value={formData.availableDays}
                              onChange={(e) => {
                                // allow letters, spaces, commas, and hyphens
                                const cleaned = e.target.value.replace(/[^A-Za-z,\s\-]/g, '')
                                setFormData((prev) => ({ ...prev, availableDays: cleaned }))
                                setErrors((prev) => ({ ...prev, availableDays: '' }))
                              }}
                            />
                            {errors.availableDays && (
                              <small className="text-danger">{errors.availableDays}</small>
                            )}
                          </>
                        ) : (
                          <p>{doctorData.availableDays}</p>
                        )}

                        <p>
                          <strong>Available Timings:</strong>
                        </p>
                        {isEditing ? (
                          <CFormInput
                            name="availableTimes"
                            value={formData.availableTimes}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <p>{doctorData.availableTimes}</p>
                        )}

                        {/* DOCTOR SIGNATURE UPLOAD FIELD */}
                        <p>
                          <strong>Branch:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            {/* Multi-select for editing */}
                            <Select
                              isMulti
                              options={branchOptions}
                              value={branchOptions.filter(
                                (opt) =>
                                  Array.isArray(formData.branch) &&
                                  formData.branch.some(
                                    (b) => b.branchId.toString() === opt.value.toString(),
                                  ),
                              )}
                              onChange={(selected) => {
                                const updatedBranches = selected.map((opt) => ({
                                  branchId: opt.value,
                                  branchName: opt.label,
                                }))
                                setFormData((prev) => ({ ...prev, branch: updatedBranches }))
                                console.log('Updated branches:', updatedBranches) // ✅ Verify length
                              }}
                              placeholder="Select branches..."
                            />

                            {/* Show selected branch list while editing */}
                            {Array.isArray(formData.branch) && formData.branch.length > 0 && (
                              <div className="mt-2">
                                <strong>Selected Branches:</strong>
                                <ul className="mb-0">
                                  {formData.branch.map((b, idx) => (
                                    <li key={idx}>{b.branchName}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          // View-only mode
                          <div>
                            {Array.isArray(doctorData.branches) &&
                            doctorData.branches.length > 0 ? (
                              doctorData.branches.map((b, idx) => <p key={idx}>{b.branchName}</p>)
                            ) : (
                              <p>No branches assigned</p>
                            )}
                          </div>
                        )}
                      </CCol>
                    </CRow>
                    <CRow className="mb-3" style={{ color: 'var(--color-black)' }}>
                      <CCol>
                        <p>
                          <strong>Association/Membership:</strong>
                        </p>
                        {isEditing ? (
                          <CFormInput
                            name="associationsOrMemberships"
                            value={formData.associationsOrMemberships}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, '')
                              setFormData((prev) => ({
                                ...prev,
                                associationsOrMemberships: cleaned,
                              }))
                            }}
                          />
                        ) : (
                          <p>{doctorData.associationsOrMemberships}</p>
                        )}
                      </CCol>
                    </CRow>
                    <CCol style={{ color: 'var(--color-black)' }}>
                      <p>
                        <strong>📝 Profile Description:</strong>
                      </p>
                      {isEditing ? (
                        <CFormInput
                          name="profileDescription"
                          value={formData.profileDescription}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              profileDescription: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p>{doctorData.profileDescription}</p>
                      )}
                    </CCol>

                    <CCol>
                      {' '}
                      <h6 className="mt-4 mb-2">
                        <strong>🔍 Area of Expertise</strong>
                      </h6>
                      {isEditing ? (
                        <>
                          <CFormTextarea
                            name="focusAreas"
                            rows={5}
                            style={{ resize: 'vertical' }}
                            placeholder="• Enter area of focus..."
                            value={formData.focusAreas?.join('\n') || ''}
                            onChange={(e) => {
                              const inputValue = e.target.value
                              setFormData((prev) => ({
                                ...prev,
                                focusAreas: inputValue
                                  .split('\n')
                                  .map((line) =>
                                    line.trimStart().startsWith('•')
                                      ? line.trim()
                                      : `• ${line.trim()}`,
                                  )
                                  .filter((line) => line !== '•'),
                              }))
                            }}
                          />
                          <small>
                            Type each point on a new line. Bullets will be added automatically.
                          </small>
                        </>
                      ) : (
                        <ul style={{ color: 'var(--color-black)' }}>
                          {Array.isArray(formData?.focusAreas) && formData.focusAreas.length > 0 ? (
                            formData.focusAreas.map((area, idx) => (
                              <li key={idx}>{area.replace(/^•\s*/, '')}</li>
                            ))
                          ) : (
                            <p>No focus areas listed</p>
                          )}
                        </ul>
                      )}
                    </CCol>
                 
                    <CCol>
                      <h6 className="mt-4 mb-2">
                        <strong>🏅 Achievements</strong>
                      </h6>
                      {isEditing ? (
                        <>
                          <CFormTextarea
                            name="highlights"
                            rows={5}
                            placeholder="• Enter your first achievement"
                            value={formData.highlights?.join('\n') || ''}
                            style={{ resize: 'vertical' }}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                highlights: e.target.value
                                  .split('\n') // line-by-line
                                  .map((line) =>
                                    line.trimStart().startsWith('•')
                                      ? line.trim()
                                      : `• ${line.trim()}`,
                                  )
                                  .filter(Boolean),
                              }))
                            }
                          />
                          <small>
                            Press <strong>Enter</strong> to add each point on a new line.
                          </small>
                        </>
                      ) : (
                        <ul style={{ color: 'var(--color-black)' }}>
                          {Array.isArray(formData?.highlights) && formData.highlights.length > 0 ? (
                            formData.highlights.map((item, idx) => (
                              <li key={idx}>{item.replace(/^•\s*/, '')}</li>
                            ))
                          ) : (
                            <p>No achievements added</p>
                          )}
                        </ul>
                      )}
                    </CCol>
                       <CCol xs={12}>
              {/* <div className="d-flex align-items-center flex-wrap gap-4">
                <strong>Consultation Type:</strong>

                <CFormCheck
                  type="checkbox"
                  label="Services & Treatments"
                  checked={enabledTypes.serviceTreatment}
                  onChange={() => toggleType('serviceTreatment')}
                />
                <CFormCheck
                  type="checkbox"
                  label="In-Clinic Consultation"
                  checked={enabledTypes.inClinic}
                  onChange={() => toggleType('inClinic')}
                />
                <CFormCheck
                  type="checkbox"
                  label="Online Consultation"
                  checked={enabledTypes.online}
                  onChange={() => toggleType('online')}
                />
              </div> */}
            </CCol>

                    <CRow style={{ color: 'var(--color-black)' }}>
                      <CCol md={6}>
                        <p>
                          <strong>In-Clinic Fee:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="inClinicFee"
                              value={formData?.doctorFees?.inClinicFee || ''}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^0-9]/g, '')
                                setFormData((prev) => ({
                                  ...prev,
                                  doctorFees: { ...prev.doctorFees, inClinicFee: cleaned },
                                }))
                                setErrors((prev) => ({ ...prev, inClinicFee: '' }))
                              }}
                            />
                            {errors.inClinicFee && (
                              <small className="text-danger">{errors.inClinicFee}</small>
                            )}
                          </>
                        ) : (
                          <p>₹{formData?.doctorFees?.inClinicFee || 'N/A'}</p>
                        )}
                      </CCol>

                      <CCol md={6}>
                        <p>
                          <strong>Video Consultation Fee:</strong>
                        </p>
                        {isEditing ? (
                          <>
                            <CFormInput
                              name="vedioConsultationFee"
                              value={formData?.doctorFees?.vedioConsultationFee || ''}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^0-9]/g, '')
                                setFormData((prev) => ({
                                  ...prev,
                                  doctorFees: { ...prev.doctorFees, vedioConsultationFee: cleaned },
                                }))
                                setErrors((prev) => ({ ...prev, vedioConsultationFee: '' }))
                              }}
                            />
                            {errors.vedioConsultationFee && (
                              <small className="text-danger">{errors.vedioConsultationFee}</small>
                            )}
                          </>
                        ) : (
                          <p>₹{formData?.doctorFees?.vedioConsultationFee || 'N/A'}</p>
                        )}
                      </CCol>
                    </CRow>
                    <CRow style={{ color: 'var(--color-black)' }}>
                      <CCol>
                        <p>
                          <strong>Doctor Signature:</strong>
                          <span className="text-danger">*</span>
                        </p>

                        {isEditing ? (
                          <div>
                            {/* File input */}
                            <CFormInput
                              type="file"
                              accept="image/jpeg, image/png"
                              onChange={(e) => {
                                const file = e.target.files[0]
                                if (!file) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    doctorSignature: 'Signature is required',
                                  }))
                                  return
                                }

                                const validTypes = ['image/jpeg', 'image/png']
                                if (!validTypes.includes(file.type)) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    doctorSignature: 'Only JPG and PNG images are allowed',
                                  }))
                                  return
                                }

                                const MAX_SIZE = 200 * 1024 // 200 KB
                                if (file.size > MAX_SIZE) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    doctorSignature: 'File size must be less than 200 KB',
                                  }))
                                  return
                                }

                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    doctorSignature: reader.result,
                                  }))
                                  setErrors((prev) => ({ ...prev, doctorSignature: '' }))
                                }
                                reader.readAsDataURL(file)
                              }}
                              invalid={!!errors.doctorSignature}
                            />

                            {/* Preview */}
                            <div
                              style={{
                                width: '150px',
                                height: '80px',
                                marginTop: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa',
                              }}
                            >
                              {formData.doctorSignature ? (
                                <img
                                  src={formData.doctorSignature}
                                  alt="Doctor Signature"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : doctorData.doctorSignature ? (
                                <img
                                  src={doctorData.doctorSignature}
                                  alt="Doctor Signature"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontSize: '12px', color: '#999' }}>
                                  No signature uploaded
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '150px',
                              height: '80px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              overflow: 'hidden',
                              backgroundColor: '#f8f9fa',
                            }}
                          >
                            {doctorData.doctorSignature ? (
                              <img
                                src={doctorData.doctorSignature}
                                alt="Doctor Signature"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <span style={{ fontSize: '12px', color: '#999' }}>
                                No signature uploaded
                              </span>
                            )}
                          </div>
                        )}

                        {errors.doctorSignature && (
                          <small className="text-danger">{errors.doctorSignature}</small>
                        )}
                      </CCol>
                    </CRow>

                    <div className="text-end mt-4">
                      {isEditing ? (
                        <>
                          {/* Cancel Button */}
                          <CButton className="me-2" color="secondary" onClick={handleEditToggle}>
                            Cancel
                          </CButton>

                          {/* Update Button with loading spinner */}
                          <CButton
                            style={{ backgroundColor: 'var(--color-black)' }}
                            className="text-white"
                            onClick={handleUpdateWithValidation}
                            disabled={saveloading || !isSubServiceComplete}
                          >
                            {saveloading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2 text-white"
                                  role="status"
                                />
                                Updating...
                              </>
                            ) : (
                              'Update'
                            )}
                          </CButton>
                        </>
                      ) : (
                        <div>
                          {/* Edit Button */}

                          {/* Delete Button */}
                          <CButton color="danger " className="text-white" onClick={handleShow}>
                            Delete
                          </CButton>
                          <CButton
                            style={{ backgroundColor: 'var(--color-black)' }}
                            className="text-white ms-2"
                            onClick={handleEditToggle}
                          >
                            Edit
                          </CButton>
                        </div>
                      )}
                    </div>

                    <ConfirmationModal
                      isVisible={showModal}
                      title="Delete Doctor"
                      message="Are you sure you want to delete this doctor? This action cannot be undone."
                      confirmText={
                        delloading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2 text-white"
                              role="status"
                            />
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete'
                        )
                      }
                      cancelText="Cancel"
                      confirmColor="danger"
                      cancelColor="secondary"
                      onConfirm={() => handleDeleteToggleE(doctorData.doctorId)}
                      onCancel={handleClose}
                    />
                  </CCardBody>
                </CCard>
              </CTabPane>
            </CTabContent>

            <CTabPane
              visible={activeKey === 2}
              className="pt-3"
              style={{ color: 'var(--color-black)' }}
            >
              <h5>
                <strong>Slot Management</strong>
              </h5>

              <div className="d-flex gap-2 flex-wrap mb-3">
                {days.map((dayObj, idx) => {
                  const isSelected = selectedDate === format(dayObj.date, 'yyyy-MM-dd')

                  return (
                    <CButton
                      key={idx}
                      onClick={() => handleDateClick(dayObj, idx)}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-black)' : COLORS.white, // ✅ pink when selected
                        color: isSelected ? COLORS.white : 'var(--color-black)', // ✅ text turns white when pink bg
                        border: `1px solid ${'var(--color-black)'}`,
                      }}
                    >
                      <div style={{ fontSize: '14px' }}>{dayObj.dayLabel}</div>
                      <div style={{ fontSize: '12px' }}>{dayObj.dateLabel}</div>
                    </CButton>
                  )
                })}
              </div>

              <div className="slot-grid mt-3">
                <CCard className="mb-4">
                  <CCardBody>
                    {loading ? (
                      <LoadingIndicator message="Loading slots..." />
                    ) : (
                      <div
                        className="slot-container d-grid "
                        style={{
                          display: 'grid',
                          color: 'var(--color-black)',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                          gap: '12px',
                        }}
                      >
                        {slotsForSelectedDate.map((slotObj, i) => {
                          const isSelected = selectedSlots.includes(slotObj.slot)
                          const isBooked = slotObj?.slotbooked
                          const now = new Date()
                          const slotTime = new Date(`${selectedDate} ${slotObj.slot}`)
                          const today = format(now, 'yyyy-MM-dd') === selectedDate

                          // ✅ Only allow future slots for current date, all slots for other days
                          const isPastTime = !today || slotTime > now
                          return (
                            isPastTime && (
                              <div
                                key={i}
                                className={`slot-item text-center border rounded   ${
                                  isBooked
                                    ? 'bg-danger text-white' // booked = red
                                    : isSelected
                                      ? 'text-white'
                                      : 'bg-light'
                                }`}
                                onClick={() => {
                                  if (isBooked) return // ❌ Prevent click for booked slots
                                  if (isSelected) {
                                    setSelectedSlots((prev) =>
                                      prev.filter((s) => s !== slotObj.slot),
                                    )
                                  } else {
                                    setSelectedSlots((prev) => [...prev, slotObj.slot])
                                  }
                                }}
                                style={{
                                  padding: '10px 0',
                                  borderRadius: '8px',
                                  cursor: isBooked ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  opacity: isBooked ? 0.7 : 1,
                                  color: 'var(--color-black)',
                                  backgroundColor: isBooked
                                    ? 'red'
                                    : isSelected
                                      ? 'var(--color-black)'
                                      : undefined,
                                }}
                                title={isBooked ? 'Booked' : 'Not Booked'}
                              >
                                {slotObj?.slot}
                              </div>
                            )
                          )
                        })}
                      </div>
                    )}
                    <div className="w-100">
                      {slotsForSelectedDate.length === 0 && (
                        <p style={{ color: 'var(--color-black)' }}>
                          No available slots for this date
                        </p>
                      )}
                    </div>
                  </CCardBody>
                </CCard>
              </div>

              <div className="mt-3 d-flex gap-2">
                <CButton
                  style={{
                    color: 'var(--color-black)',
                    border: `1px solid ${'var(--color-black)'}`,
                  }}
                  variant="outline"
                  onClick={openModal}
                >
                  Add Slot
                </CButton>

                <CButton
                  style={{
                    color: 'var(--color-black)',
                    border: `1px solid ${'var(--color-black)'}`,
                  }}
                  variant="outline"
                  disabled={selectedSlots.length === 0}
                  onClick={() => {
                    if (selectedSlots.length === 0) {
                      showCustomToast('Please select slot(s) to delete.', 'success')
                      return
                    }
                    setDeleteMode('selected') // mark which action we are confirming
                    setShowDeleteConfirmModal(true) // show modal
                  }}
                >
                  Delete Selected ({selectedSlots.length})
                </CButton>

                <CButton
                  style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
                  variant="outline"
                  onClick={() => {
                    setDeleteMode('all')
                    setShowDeleteConfirmModal(true)
                  }}
                >
                  Delete All for Date
                </CButton>
              </div>
            </CTabPane>

            <CTabPane visible={activeKey === 3} className="pt-3">
              {ratings ? (
                <div className="px-3">
                  <CRow style={{ color: 'var(--color-black)' }}>
                    <CCol md={6}>
                      <h5 className="mb-4">
                        <strong>Doctor Feedback:</strong>
                      </h5>
                    </CCol>

                    <CCol md={6}>
                      <h5 className="mb-4">
                        <i className="fa fa-star text-warning me-1" />
                        Overall Rating: ⭐<strong>{ratings.overallDoctorRating}</strong>
                      </h5>
                    </CCol>
                  </CRow>

                  {ratings.comments.map((comment, index) => {
                    const getInitials = (name) => {
                      if (!name) return 'US'

                      // Remove common prefixes like Mr., Mrs., Ms., Dr.
                      const cleaned = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, '').trim()

                      // Split the remaining name and take first 2 words
                      const parts = cleaned.split(' ')

                      // Take the first letters of up to 2 words
                      const initials = parts
                        .slice(0, 2)
                        .map((word) => word[0]?.toUpperCase() || '')
                        .join('')

                      return initials || 'US'
                    }

                    // Usage:
                    const initials = getInitials(comment.patientName)

                    const timeAgo = formatTimeAgo(comment.dateAndTimeAtRating)

                    return (
                      <div
                        key={index}
                        className="bg-white shadow-sm rounded p-3 mb-4 border"
                        style={{ borderLeft: `4px solid ${'var(--color-black)'}` }}
                      >
                        <div className="d-flex">
                          <div
                            className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3"
                            style={{ width: '50px', height: '50px', fontSize: '18px' }}
                          >
                            {initials}
                          </div>

                          <div className="flex-grow-1" style={{ color: 'var(--color-black)' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0">
                                  {comment.patientName || comment.patientName}
                                </h6>

                                <small style={{ color: 'var(--color-black)' }}>{timeAgo}</small>
                              </div>
                              <div className="fw-bold">
                                ⭐{comment.doctorRating} <i className="fa fa-star" />
                              </div>
                            </div>
                            <p className="mt-2 mb-0">
                              {comment.feedback?.trim() !== ''
                                ? comment.feedback
                                : 'No feedback provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p>No ratings or comments available.</p>
              )}
            </CTabPane>

            <CTabPane visible={activeKey === 4} className="pt-3">
              <div className="d-flex flex-wrap gap-3">
                {/*  All Categories in One Card */}
                {doctorData?.category?.length > 0 && (
                  <div className="card border-info" style={{ width: '100%' }}>
                    <div className="card-body">
                      <h5 className="card-title text-info">All Categories</h5>
                      <ul className="mb-0">
                        {doctorData.category.map((cat, index) => (
                          <li key={index}>{cat.categoryName}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/*  All Services in One Card */}
                {doctorData?.service?.length > 0 && (
                  <div className="card border-success" style={{ width: '100%' }}>
                    <div className="card-body">
                      <h5 className="card-title text-success">All Services</h5>
                      <ul className="mb-0">
                        {doctorData.service.map((srv, index) => (
                          <li key={index}>{srv.serviceName}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/*  All SubServices in One Card */}
                {doctorData?.subServices?.length > 0 && (
                  <div className="card border-warning" style={{ width: '100%' }}>
                    <div className="card-body">
                      <h5 className="card-title text-warning">All Procedures</h5>
                      <ul className="mb-0">
                        {doctorData.subServices.map((sub, index) => (
                          <li key={index}>{sub.subServiceName}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      <CModal
        visible={visibleSlot}
        onClose={() => {
          setVisibleSlot(false) // close modal
          setSlots([]) // reset generated slots
          setTimeSlots([]) // reset modal slots if used
          setSelectedSlots([]) // clear selected slots
        }}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader style={{ color: 'var(--color-black)' }}>
          Select Available Time Slots - ({selectedDate})
        </CModalHeader>
        <CModalBody>
          {/* Slot Buttons */}
          <div>
            {/* Interval Selection */}
            <div className="d-flex gap-3 align-items-center mb-3">
              <label className="d-flex align-items-center gap-1">
                <input
                  type="radio"
                  value={10}
                  checked={interval === 10}
                  onChange={() => handleIntervalChange(10)}
                />
                10 min
              </label>
              <label className="d-flex align-items-center gap-1">
                <input
                  type="radio"
                  value={20}
                  checked={interval === 20}
                  onChange={() => handleIntervalChange(20)}
                />
                20 min
              </label>
              <label className="d-flex align-items-center gap-1">
                <input
                  type="radio"
                  value={30}
                  checked={interval === 30}
                  onChange={() => handleIntervalChange(30)}
                />
                30 min
              </label>

              <CButton
                style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                onClick={handleGenerate}
              >
                Generate Slots
              </CButton>
            </div>

            {slots.length > 0 && (
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  style={{ color: 'var(--color-black)' }}
                  type="checkbox"
                  id="selectAllSlots"
                  checked={
                    // checked if all available slots are selected
                    selectedSlots.length === slots.filter((s) => s.available).length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      // select only available slots
                      const availableSlots = slots.filter((s) => s.available).map((s) => s.slot)
                      setSelectedSlots(availableSlots)
                    } else {
                      setSelectedSlots([])
                    }
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="selectAllSlots"
                  style={{ color: 'var(--color-black)' }}
                >
                  Select All Slots
                </label>
              </div>
            )}

            {/* Slot Grid */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {slots.map((slotObj, i) => {
                const isSelected = selectedSlots.includes(slotObj.slot)

                const handleClick = () => {
                  if (!slotObj.available) {
                    if (slotObj.reason) showCustomToast(`Cannot book: ${slotObj.reason}`, 'warning')
                    else showCustomToast('This slot is unavailable', 'warning')
                    return
                  }
                  toggleSlot(slotObj.slot)
                }

                return (
                  <CButton
                    key={i}
                    size="sm"
                    style={{
                      width: '80px', // ✅ fixed width for all buttons
                      height: '35px', // optional fixed height
                      backgroundColor: !slotObj.available
                        ? 'lightgray'
                        : isSelected
                          ? 'var(--color-black)'
                          : 'gray',
                      color: 'white',
                      border: 'none',
                      cursor: slotObj.available ? 'pointer' : 'not-allowed',
                    }}
                    onClick={handleClick}
                  >
                    {slotObj.slot}
                  </CButton>
                )
              })}
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleSlot(false)}>
            Cancel
          </CButton>
          <CButton
            color="info"
            onClick={handleAddSlot}
            disabled={selectedSlots.length === 0}
            style={{ backgroundColor: 'var(--color-black)', color: 'white', border: 'none' }}
          >
            Save Slots ({selectedSlots.length})
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        alignment="center"
      >
        <CModalHeader closeButton>
          <CModalTitle style={{ color: 'var(--color-black)' }}>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {deleteMode === 'selected' ? (
            <p>
              Are you sure you want to delete <strong>{selectedSlots.length}</strong> selected
              slot(s) for <strong>{selectedDate}</strong>?
            </p>
          ) : (
            <p>
              Are you sure you want to delete <strong>ALL</strong> slots for{' '}
              <strong>{selectedDate}</strong>?
            </p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            style={{ backgroundColor: COLORS.lowgray }}
            onClick={() => setShowDeleteConfirmModal(false)}
          >
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
            onClick={async () => {
              const branchid = localStorage.getItem('branchId')
              try {
                if (deleteMode === 'selected') {
                  // delete selected
                  for (const slot of selectedSlots) {
                    await http.delete(
                      `/doctorId/${doctorData?.doctorId}/branchId/${branchid}/date/${selectedDate}/slot/${slot}`,
                    )
                  }
                  showCustomToast(' Selected slots deleted successfully.', 'success')
                  setSelectedSlots([])
                  fetchSlots()
                } else if (deleteMode === 'all') {
                  // delete all for date
                  await http.delete(
                    `/delete-by-date/${doctorData?.doctorId}/${branchid}/${selectedDate}`,
                  )
                  showCustomToast(` All slots for ${selectedDate} deleted.`, 'success')
                  setSelectedSlots([])
                  fetchSlots()
                }
              } catch (err) {
                console.error('Error deleting slots:', err)
                showCustomToast('❌ Failed to delete slots.', 'error')
              } finally {
                setShowDeleteConfirmModal(false)
              }
            }}
          >
            Confirm Delete
          </CButton>
        </CModalFooter>
      </CModal>

      <style>{`
        .doctor-info {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        .doctor-info > div {
          flex: 1;
          min-width: 250px;
        }
        .slot-btn {
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .doctor-info {
            gap: 20px;
          }
        }
          .navhover{
          cursor:pointer;

          }
          
      `}</style>
    </div>
  )
}

export default DoctorDetailsPage
