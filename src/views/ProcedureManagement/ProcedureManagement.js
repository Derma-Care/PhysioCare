import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CFormText,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CListGroup,
  CCol,
  CFormSelect,
  CHeader,
  CListGroupItem,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CFormTextarea,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { FaTrash, FaPlus } from 'react-icons/fa'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  serviceData,
  CategoryData,
  postServiceData,
  updateServiceData,
  deleteServiceData,
  subServiceData,
  GetSubServices_ByClinicId,
} from './ProcedureManagementAPI'
import {
  // subService_URL,
  getservice,
  MainAdmin_URL,
  getadminSubServicesbyserviceId,
  BASE_URL,
} from '../../baseUrl'
import ProcedureQA from './QASection'
import { Edit2, Eye, Trash2, View } from 'lucide-react'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import capitalizeWords from '../../Utils/capitalizeWords'
import LoadingIndicator from '../../Utils/loader'
import { http } from '../../Utils/Interceptors'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

const ServiceManagement = () => {
  // const [searchQuery, setSearchQuery] = useState('')
  const [service, setService] = useState([])
  const [category, setCategory] = useState([])
  // const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeInput, setTimeInput] = useState('')
  const [timeSlots, setTimeSlots] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [editServiceMode, setEditServiceMode] = useState(false)
  const [question, setQuestion] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [answers, setAnswers] = useState([])
  const [qaList, setQaList] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [selectedSubService, setSelectedSubService] = useState('')
  const [subServiceId, setSubServiceId] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [saveloading, setSaveLoading] = useState(false)
  const [viewMinTimeValue, viewMinTimeUnit] = viewService?.minTime
  ? viewService.minTime.split(' ')
  : ['', '']


  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const [serviceToEdit, setServiceToEdit] = useState({
    serviceImage: '',
    viewImage: '',
    subServiceName: '',
    serviceName: '',
    serviceImageFile: null,
  })
  const [qaPreProcedure, setQaPreProcedure] = useState([])
  const [qaProcedure, setQaProcedure] = useState([])
  const [qaPostProcedure, setQaPostProcedure] = useState([])

  const addQuestionAnswer = (section, question, answers) => {
    const newQA = { question, answers }

    if (section === 'preProcedure') {
      setQaPreProcedure([...qaPreProcedure, newQA])
    } else if (section === 'procedure') {
      setQaProcedure([...qaProcedure, newQA])
    } else if (section === 'postProcedure') {
      setQaPostProcedure([...qaPostProcedure, newQA])
    }
  }
  // Mapping for display
  const consentFormTypeLabels = {
    1: 'Generic ConsentForm',
    2: 'Procedure ConsentForm',
  }

  let descriptionQA = []
  try {
    if (typeof service.descriptionQA === 'string') {
      descriptionQA = JSON.parse(service.descriptionQA)
    } else {
      descriptionQA = service.descriptionQA || []
    }
  } catch (err) {
    console.error('Invalid descriptionQA format:', err)
  }

  const [newService, setNewService] = useState({
    categoryName: '',
    categoryId: '',
    serviceName: '',
    subServiceName: '',
    description: '',
    price: '',
    gst: 0,
    gstAmount: 0,
    consultationFee: 0,
    // preProcedure: '',
    // postProcedure: '',
    procedureQA: [],
    preProcedureQA: [],
    postProcedureQA: [],
  })
  const [modalMode, setModalMode] = useState('add') // or 'edit'
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  // ✅ Handle Add QA
  const handleAddQA = (type) => {
    if (editingValue.trim() === '') return
    setNewService((prev) => ({
      ...prev,
      [type]: [...prev[type], editingValue],
    }))
    setEditingValue('')
  }

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return service
    return service.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, service])

  // ✅ Handle Remove QA
  const handleRemoveQA = (type, index) => {
    setNewService((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  // ✅ Handle Edit QA (start editing)
  const handleEditQA = (type, index) => {
    setEditingIndex({ type, index })
    setEditingValue(newService[type][index])
  }

  // ✅ Handle Save Edit QA
  const handleSaveQA = () => {
    if (!editingIndex) return
    const { type, index } = editingIndex
    setNewService((prev) => {
      const updated = [...prev[type]]
      updated[index] = editingValue
      return { ...prev, [type]: updated }
    })
    setEditingIndex(null)
    setEditingValue('')
  }

  // ✅ Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  // ✅ Save Service (Add / Update)
  const handleSaveService = () => {
    const price = Number(newService.price || 0)
    const discountPercentage = parseFloat(newService.discountPercentage || 0)
    const taxPercentage = parseFloat(newService.taxPercentage || 0)
    const gst = parseFloat(newService.gst || 0)
    const gstAmount = parseFloat(newService.gstAmount || 0)
    const consultationFee = parseFloat(newService.consultationFee || 0)

    // discount calc
    const discountAmount = (price * discountPercentage) / 100
    const discountedCost = price - discountAmount

    // tax calc
    const taxAmount = (discountedCost * taxPercentage) / 100
    const finalCost = discountedCost + taxAmount + consultationFee

    const payload = {
      hospitalId: newService.hospitalId,

      serviceId: newService.serviceId,
      serviceName: newService.serviceName,
      categoryId: newService.categoryId,
      categoryName: newService.categoryName,
      subServiceId: newService.subServiceId,
      subServiceName: newService.subServiceName,

      viewDescription: newService.viewDescription,
      // consentFormType: newService.consentFormType,
      consentFormType: Number(newService.consentFormType),
      status: 'Active',
      minTime: newService.minTime,

      preProcedureQA: newService.preProcedureQA,
      procedureQA: newService.procedureQA,
      postProcedureQA: newService.postProcedureQA,

      price,
      discountPercentage,
      discountAmount,
      discountedCost,
      taxPercentage,
      taxAmount,
      gst,
      gstAmount,
      consultationFee,
      finalCost,

      subServiceImage: newService.subServiceImage || '',
    }

    console.log('Final Payload:', payload)
    // 👉 call API here
  }

  // Open for adding
  const openAddModal = () => {
    setModalMode('add')
    setQaList([])
    setAnswers([])
    setQuestion('')
    setSelectedSubService('')
    setNewService({
      categoryName: '',
      categoryId: '',
      serviceName: '',
      serviceId: '',
      subServiceId: '',
      subServiceName: '',
      price: '',
      discount: '',
      gst: '',
      gstAmount: 0,
      consultationFee: 0,
      minTime: '',
      taxPercentage: '',
      status: '',
      serviceImage: '',
      serviceImageFile: null,
      viewImage: '',
      viewDescription: '',
      consentFormType: '',
      platformFeePercentage: 0,
      descriptionQA: [],
    })
    setModalVisible(true)
  }

  // Open for editing

  const openEditModal = async (service) => {
    console.log(service.subServiceId)
    setSubServiceId(service.subServiceId)
    setModalMode('edit')
    setModalVisible(true)

    // 1. Set selected category
    const selectedCategory = category.find((cat) => cat.categoryName === service.categoryName)
    const categoryId = selectedCategory?.categoryId || ''

    // 2. Fetch services under this category
    let fetchedServiceOptions = []
    try {
      const res = await http.get(`/${getservice}/${categoryId}`)
      fetchedServiceOptions = res.data?.data || []
      console.log(fetchedServiceOptions)
      setServiceOptions(fetchedServiceOptions)
    } catch (err) {
      console.error('Error fetching service list:', err)
    }

    // Before fetching subservices and other data
    setNewService((prev) => ({
      ...prev,
      serviceImage: service.subServiceImage
        ? service.subServiceImage.startsWith('data:')
          ? service.subServiceImage
          : `data:image/jpeg;base64,${service.subServiceImage}`
        : '',
      serviceImageFile: null, // no new file yet
    }))

    const selectedService = fetchedServiceOptions.find((s) => s.serviceName === service.serviceName)
    const serviceId = selectedService?.serviceId || ''

    // 3. Fetch subservices
    let subServiceList = []
    if (serviceId) {
      try {
        const subRes = await subServiceData(serviceId)
        const subList = subRes.data
        if (Array.isArray(subList)) {
          subServiceList = subList.flatMap((item) => item.subServices || [])
        } else if (subList?.subServices) {
          subServiceList = subList.subServices
        }
      } catch (err) {
        console.error('Error fetching subservices:', err)
      }
    }

    setSubServiceOptions({ subServices: subServiceList })

    // Get valid subServiceId and name
    const selectedSubServiceObj = subServiceList.find(
      (s) => s.subServiceName === service.subServiceName,
    )

    const resolvedSubServiceId = selectedSubServiceObj?.subServiceId || ''
    const resolvedSubServiceName = selectedSubServiceObj?.subServiceName || ''

    setSelectedSubService(resolvedSubServiceId)
    const procedureQA = Array.isArray(service.procedureQA)
      ? service.procedureQA
      : JSON.parse(service.procedureQA || '[]')
    const preProcedureQA = Array.isArray(service.preProcedureQA)
      ? service.preProcedureQA
      : JSON.parse(service.preProcedureQA || '[]')
    const postProcedureQA = Array.isArray(service.postProcedureQA)
      ? service.postProcedureQA
      : JSON.parse(service.postProcedureQA || '[]')

    const rawImage = service.subServiceImage || service.serviceImage || ''
    const fullImage =
      rawImage && rawImage.startsWith('data:')
        ? rawImage
        : rawImage
          ? `data:image/jpeg;base64,${rawImage}`
          : ''
    const [timeValue, timeUnit] = service.minTime
      ? service.minTime.split(' ') // split into ["45","minutes"]
      : ['', '']
    // Prefill all fields
    setNewService({
      subServiceId: resolvedSubServiceId,
      subServiceName: resolvedSubServiceName,
      serviceName: service.serviceName || '',
      serviceId: serviceId,
      categoryName: service.categoryName || '',
      categoryId: categoryId || '',
      price: service.price || '',
      discount: service.discountPercentage || 0,
      gst: service.gst || 0,
      gstAmount: service.gstAmount || 0,
      consultationFee: service.consultationFee || 0,
      taxPercentage: service.taxPercentage || 0,
      // minTime: service.minTime || '',
      minTime: service.minTime || '',
      minTimeValue: timeValue || '',
      minTimeUnit: timeUnit || '',
      serviceImage: fullImage,

      serviceImageFile: null,
      status: service.status || '',
      viewDescription: service.viewDescription || '',
      consentFormType: service.consentFormType ? String(service.consentFormType) : '',

      platformFeePercentage: service.platformFeePercentage || 0,
      // descriptionQA: formattedQA,
      viewImage: service.viewImage || '',
      procedureQA: procedureQA,
      preProcedureQA: preProcedureQA,
      postProcedureQA: postProcedureQA,
    })
    setQaList(formattedQA)
  }

  const addAnswer = () => {
    if (answerInput.trim()) {
      setAnswers([...answers, answerInput.trim()])
      setAnswerInput('')
    }
  }

  const removeAnswer = (answerToRemove) => {
    setAnswers(answers.filter((ans) => ans !== answerToRemove))
  }
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [errors, setErrors] = useState({
    subServiceName: '',
    serviceName: '',
    serviceId: '',
    categoryName: '',
    price: '',
    status: '',
    taxPercentage: '',
    descriptionQA: '',
    answers: '',
    minTime: '',
    discount: '',
    viewDescription: '',
    consentFormType: '',
    serviceImage: '',
    bannerImage: '',
  })

  const [editErrors, setEditErrors] = useState({})

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const categoryResponse = await CategoryData()
      if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
        const categoryDetails = categoryResponse.data.map((category) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
        }))
        setCategory(categoryResponse.data)
      } else {
        throw new Error('Invalid category data format')
      }

      const hospitalId = localStorage.getItem('HospitalId') // ✅ current hospital
      if (hospitalId) {
        const subServiceData = await GetSubServices_ByClinicId(hospitalId)

        if (Array.isArray(subServiceData)) {
          // you might need to flatten if response is nested
          // but usually GetSubServices_ByClinicId should return a clean array
          setService(subServiceData)
          console.log(subServiceData)
        } else {
          setService([])
          console.warn('No subservices found for this hospital.')
        }
      } else {
        console.warn('No hospitalId found in localStorage.')
        setService([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // serviceData()
  }, [])

  useEffect(() => {
    if (
      editServiceMode &&
      serviceToEdit?.descriptionQA &&
      typeof serviceToEdit.descriptionQA === 'string'
    ) {
      try {
        setServiceToEdit((prev) => ({
          ...prev,
          descriptionQA: JSON.parse(prev.descriptionQA),
        }))
      } catch (e) {
        console.error('Invalid QA format')
      }
    }
  }, [editServiceMode])

  const handleEditClick = (serviceItem) => {
    setServiceToEdit(serviceItem)
    setEditServiceMode(true)
  }

  const minTimeValue = parseFloat(newService.minTime)
  // ------------------- VALIDATION -------------------
  const validateForm = () => {
    const newErrors = {}

    // Service Name
    if (!newService.serviceName || newService.serviceName.trim() === '') {
      newErrors.serviceName = 'Service name is required.'
    }

    // Sub Service (Procedure)
    if (!newService.subServiceId || newService.subServiceId.trim() === '') {
      newErrors.subServiceName = 'Procedure is required.'
    }

    // Category Name
    if (!newService.categoryId || newService.categoryId.trim() === '') {
      newErrors.categoryName = 'Category is required.'
    }

    // Procedure Price
    if (!newService.price || !/^\d+(\.\d{1,2})?$/.test(newService.price)) {
      newErrors.price = 'Procedure Price must be a valid number.'
    } else if (Number(newService.price) < 100) {
      newErrors.price = 'Procedure Price must be at least 100.'
    }

    // Status validation
    if (!newService.status) {
      newErrors.status = 'Status is required.'
    }

    // Consultation Fee validation
    // Consultation Fee
    if (!newService.consultationFee || newService.consultationFee.trim() === '') {
      newErrors.consultationFee = 'Consultation Fee is required.'
    } else if (!/^\d+(\.\d{1,2})?$/.test(newService.consultationFee)) {
      newErrors.consultationFee = 'Consultation Fee must be a valid number.'
    } else if (Number(newService.consultationFee) < 0) {
      newErrors.consultationFee = 'Consultation Fee must be greater than or equal to  0.'
    }

    // GST
    // GST validation (optional)
    // if (newService.gst && newService.gst.trim() !== '') {
    //   if (isNaN(Number(newService.gst))) {
    //     newErrors.gst = 'GST must be a valid number.'
    //   } else if (Number(newService.gst) < 0) {
    //     newErrors.gst = 'GST cannot be negative.'
    //   } else if (Number(newService.gst) > 99) {
    //     newErrors.gst = 'GST cannot exceed 99.'
    //   }
    // } else {
    //   // If empty, no error (optional field)
    //   newErrors.gst = ''
    // }

    // // Discount (optional)
    // if (newService.discount && !/^\d+(\.\d{1,2})?$/.test(newService.discount)) {
    //   newErrors.discount = 'Discount must be a valid number.'
    // } else if (Number(newService.discount) < 0 || Number(newService.discount) > 99) {
    //   newErrors.discount = 'Discount must be between 0 and 99.'
    // }

    // Min Time Value
    if (!newService.minTimeValue || newService.minTimeValue.trim() === '') {
      newErrors.minTimeValue = 'Enter minimum time.'
    } else if (!/^\d+$/.test(newService.minTimeValue)) {
      newErrors.minTimeValue = 'Minimum time must be a number.'
    } else if (Number(newService.minTimeValue) <= 0) {
      newErrors.minTimeValue = 'Minimum time must be greater than zero.'
    }

    // Min Time Unit
    if (!newService.minTimeUnit) {
      newErrors.minTimeUnit = 'Please select a time unit.'
    }

    // View Description
    if (!newService.viewDescription || newService.viewDescription.trim() === '') {
      newErrors.viewDescription = 'View description is required.'
    }

    // Consent Form Type
    if (!newService.consentFormType) {
      newErrors.consentFormType = 'Consent form type is required.'
    }

    // Service Image
    if (!newService.serviceImage) {
      newErrors.serviceImage = 'Please upload a service image.'
    }

    // Other Taxes (optional)
    // if (newService.taxPercentage && !/^\d+(\.\d{1,2})?$/.test(newService.taxPercentage)) {
    //   newErrors.taxPercentage = 'Tax Percentage must be a valid number.'
    // } else if (Number(newService.taxPercentage) < 0 || Number(newService.taxPercentage) > 99) {
    //   newErrors.taxPercentage = 'Tax Percentage must be between 0 and 99.'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveCurrentQA = () => {
    if (question.trim() && answers.length > 0) {
      const newQA = { [question.trim()]: [...answers] }

      // Add to local qaList
      const updatedQaList = [...qaList, newQA]
      setQaList(updatedQaList)

      // Also update the newService object
      setNewService((prev) => ({
        ...prev,
        descriptionQA: updatedQaList,
      }))

      // Clear input fields
      setQuestion('')
      setAnswers([])
    }
  }
  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const removeQA = (indexToRemove) => {
    const updatedQAList = qaList.filter((_, index) => index !== indexToRemove)

    // Update both qaList and newService.descriptionQA
    setQaList(updatedQAList)
    setNewService((prev) => ({
      ...prev,
      descriptionQA: updatedQAList,
    }))
  }

  const buildQA = (question, answers, qaList) => {
    const finalQA = [...qaList]

    // Include the latest unsaved input, if any
    if (question.trim() && answers.length > 0) {
      finalQA.push({ [question.trim()]: [...answers] })
    }

    return finalQA
  }
  const buildDescriptionQA = () => {
    return {
      general: buildQA(question, answers, qaList),
      preProcedure: buildQA(preQuestion, preAnswers, preQaList),
      postProcedure: buildQA(postQuestion, postAnswers, postQaList),
    }
  }
  const handleAddService = async () => {
    console.log('--- handleAddService START ---')

    // 1. Validate before processing
    if (!validateForm()) {
      // toast.error('Validation failed', { position: 'top-right' })
      return
    }

    // 2. Calculate derived values
    const discountAmount = (newService.price * newService.discount) / 100
    const gstAmount = (newService.price * newService.gst) / 100
    const discountedCost = newService.price - discountAmount
    const taxAmount = (discountedCost * newService.taxPercentage) / 100
    const gst = newService.gst || 0
    const platformFee = (discountedCost * (newService.platformFeePercentage || 0)) / 100
    const clinicPay = discountedCost + taxAmount - platformFee
    const finalCost = clinicPay + gst + (newService.consultationFee || 0)
    const formattedMinTime = `${newService.minTimeValue} ${newService.minTimeUnit}`

    console.log('Calculated values:', {
      discountAmount,
      discountedCost,
      taxAmount,
      platformFee,
      clinicPay,
      finalCost,
    })

    // 3. Image handling
    // If you stored raw base64 only (without prefix), add prefix when sending
    const base64ImageToSend = newService.serviceImage?.startsWith('data:')
      ? newService.serviceImage.split(',')[1] // strip prefix
      : newService.serviceImage

    // 4. Build payload
    const payload = {
      hospitalId: localStorage.getItem('HospitalId'),
      subServiceName: newService.subServiceName,
      subServiceId: newService.subServiceId,
      serviceId: newService.serviceId,
      serviceName: newService.serviceName,
      categoryName: newService.categoryName,
      categoryId: newService.categoryId,

      price: newService.price,
      discountPercentage: newService.discount,
      discountAmount,
      discountedCost,
      taxPercentage: newService.taxPercentage,
      taxAmount,
      platformFeePercentage: newService.platformFeePercentage,
      platformFee,
      clinicPay,
      finalCost,
      gst: newService.gst,
      gstAmount: newService.gstAmount,
      consultationFee: newService.consultationFee,

      minTime: formattedMinTime,
      status: newService.status,
      subServiceImage: base64ImageToSend, // ✅ final base64 string only
      procedureQA: newService.procedureQA,
      preProcedureQA: newService.preProcedureQA,
      postProcedureQA: newService.postProcedureQA,
      viewDescription: newService.viewDescription,
      consentFormType: Number(newService.consentFormType), // backend receives 1 or 2
    }

    console.log('Payload ready to submit:', payload)

    // 5. API call
    try {
      setSaveLoading(true)
      const response = await postServiceData(payload, newService.subServiceId)
      console.log('Response received:', response)

      if (response.status === 201) {
        showCustomToast(response.data.message, { position: 'top-right' }, 'success')
        setModalVisible(false)
        fetchData()
        // serviceData()
      }
    } catch (error) {
  console.error('Error in handleAddService:', error?.response);


  // showCustomToast(response.data.message, 'success', { position: 'top-right' })

} finally {
      setSaveLoading(false)
    }

    // 6. Reset form
    setNewService({
      categoryName: '',
      categoryId: '',
      serviceName: '',
      serviceId: '',
      subServiceId: '',
      subServiceName: '',
      price: 0,
      discount: 0,
      gst: 0,
      gstAmount: 0,
      consultationFee: 0,
      taxPercentage: 0,
      minTimeValue: '',
      minTimeUnit: '',
      status: '',
      serviceImage: '',
      viewDescription: '',
      consentFormType: '',
      procedureQA: [],
      preProcedureQA: [],
      postProcedureQA: [],
      platformFeePercentage: 0,
      descriptionQA: [],
    })

    setQaList([])
    console.log('--- handleAddService END ---')
  }

  const formatMinutes = (minTime) => {
    const minutes = parseInt(minTime, 10)

    if (isNaN(minutes)) return 'Invalid time'

    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60

    return remainingMins === 0
      ? `${hours} hour${hours > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} min`
  }

  const handleServiceFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result?.split(',')[1] || ''
        setNewService((prev) => ({
          ...prev,
          serviceImage: base64String,
          serviceImageFile: file,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateService = async () => {
    try {
      setSaveLoading(true)

      const hospitalId = localStorage.getItem('HospitalId')

      let base64ImageToSend = ''
      if (newService.serviceImageFile) {
        // convert uploaded file
        const fullBase64String = await toBase64(newService.serviceImageFile)
        base64ImageToSend = fullBase64String.split(',')[1]
      } else if (newService.serviceImage?.startsWith('data:')) {
        base64ImageToSend = newService.serviceImage.split(',')[1]
      } else {
        base64ImageToSend = newService.serviceImage || ''
      }

      // Ensure numeric values are numbers, not empty strings or null
      const price = newService.price > 0 ? Number(newService.price) : 0

      // build only the expected payload (no extra keys)
      const updatedService = {
        hospitalId,
        subServiceName: newService.subServiceName || '',
        viewDescription: newService.viewDescription || '',
        consentFormType: Number(newService.consentFormType),
        status: newService.status || '',
        minTime: newService.minTimeValue
          ? `${newService.minTimeValue} ${newService.minTimeUnit}`
          : '',

        procedureQA: Array.isArray(newService.procedureQA) ? newService.procedureQA : [],
        preProcedureQA: Array.isArray(newService.preProcedureQA) ? newService.preProcedureQA : [],
        postProcedureQA: Array.isArray(newService.postProcedureQA)
          ? newService.postProcedureQA
          : [],
        price: newService.price || 0,
        discountPercentage: newService.discount || 0,
        taxPercentage: newService.taxPercentage || 0,
        platformFeePercentage: newService.platformFeePercentage || 0,
        subServiceImage: base64ImageToSend,
        gst: newService.gst || 0,
        gstAmount: newService.gstAmount || 0,
        consultationFee: newService.consultationFee || 0,
        // ProcedureQA:newService.ProcedureQA
      }

      // Log the payload to verify it before sending
      console.log('Payload for updateSubServiceData:', updatedService)

      // send cleaned payload
      const response = await updateServiceData(subServiceId, hospitalId, updatedService)

      showCustomToast('Procedure updated successfully!', { position: 'top-right' }, 'success')
      setEditServiceMode(false)
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Update failed:', error)
      // showCustomToast('Error updating service.', { position: 'top-right' }, 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  // Convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const handleServiceDelete = async (serviceId) => {
    console.log(serviceId)

    setServiceIdToDelete(serviceId.subServiceId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    console.log(serviceIdToDelete)
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      setDelLoading(true)
      const result = await deleteServiceData(serviceIdToDelete, hospitalId)
      console.log('Service deleted:', result)
      showCustomToast('Procedure deleted successfully!', { position: 'top-right' }, 'success')

      fetchData()
    } catch (error) {
      console.error('Error deleting Procedure:', error)
    } finally {
      setDelLoading(false)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
    console.log('Service deletion canceled')
  }

  const AddCancel = () => {
    setNewService({
      serviceName: '',
      categoryName: '',

      price: '',
      discount: 0,
      taxPercentage: 0,
      minTime: '',
      minTimeValue: '', //reset value
      minTimeUnit: 'minutes', // reset unit
      status: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      consentFormType: '',
      categoryId: '',
    })
    setModalVisible(false)

    setErrors({})
  }

  const handleChanges = async (e) => {
    const { name, value } = e.target

    if (name === 'categoryName') {
      const selectedCategory = category.find((cat) => cat.categoryId === value)

      setNewService((prev) => ({
        ...prev,
        categoryName: selectedCategory?.categoryName || '',
        categoryId: value,
        serviceName: '',
        serviceId: '',
      }))

      try {
        const res = await http.get(`/${getservice}/${value}`)
        const serviceList = res.data?.data || []
        setServiceOptions(serviceList)
      } catch (err) {
        console.error('Failed to fetch services:', err)
        setServiceOptions([])
      }
    } else if (name === 'serviceName') {
      const selectedService = serviceOptions.find((s) => s.serviceName === value)

      const serviceId = selectedService?.serviceId || ''
      setNewService((prev) => ({
        ...prev,
        serviceName: value,
        serviceId,
      }))

      // Fetch subservices now
      if (serviceId) {
        const subRes = await subServiceData(serviceId)
        const subList = subRes.data

        let allSubServices = []
        if (Array.isArray(subList)) {
          allSubServices = subList.flatMap((item) => item.subServices || [])
        } else if (subList && subList.subServices) {
          allSubServices = subList.subServices
        }
        setSubServiceOptions({ subServices: allSubServices })
      }
    } else {
      setNewService((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }
  // ------------------- HANDLERS -------------------
  const handleChange = (e) => {
    const { name, value, files, type } = e.target

    if (type === 'file' && files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewService((prev) => ({
          ...prev,
          [name]: reader.result, // full base64 with prefix
          serviceImageFile: file,
        }))
      }

      reader.readAsDataURL(file)
    } else {
      const numericFields = [
        'consultationFee',
        'minTimeValue',
        'price',
        'discount',
        'gst',
        'taxPercentage',
      ]

      let newValue = value

      if (numericFields.includes(name)) {
        if (name === 'minTimeValue') {
          newValue = newValue.replace(/\D/g, '') // integers only
        } else {
          newValue = newValue.replace(/[^0-9.]/g, '')
          const parts = newValue.split('.')
          if (parts.length > 2) newValue = parts[0] + '.' + parts[1]
        }

        // Inline validation
        let error = ''
        if (newValue === '') {
          error = 'Must be a valid number.'
        } else if (isNaN(Number(newValue))) {
          error = 'Must be a valid number.'
        } else if (Number(newValue) < 0) {
          error = 'Must be greater than or equal to 0.'
        }

        setErrors((prev) => ({ ...prev, [name]: error }))
      } else {
        setErrors((prev) => ({ ...prev, [name]: '' }))
      }

      setNewService((prev) => ({ ...prev, [name]: newValue }))
    }
  }

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value
    const selectedCategory = category.find((cat) => cat.categoryId === categoryId)

    setNewService((prev) => ({
      ...prev,
      categoryName: selectedCategory?.categoryName || '',
      categoryId,
      serviceName: '',
      serviceId: '',
      subServiceId: '',
      subServiceName: '',
    }))

    // Only clear category error, not service/procedure yet
    setErrors((prev) => ({
      ...prev,
      categoryName: '',
    }))

    try {
      const res = await http.get(`/${getservice}/${categoryId}`)
      setServiceOptions(res.data?.data || [])
    } catch (err) {
      console.error(err)
      setServiceOptions([])
    }
  }

  const handleServiceChange = async (e) => {
    const serviceName = e.target.value
    const selectedService = serviceOptions.find((s) => s.serviceName === serviceName)

    setNewService((prev) => ({
      ...prev,
      serviceName,
      serviceId: selectedService?.serviceId || '',
      subServiceId: '',
      subServiceName: '',
      preProcedureQA: selectedService?.preProcedureQA || [],
      procedureQA: selectedService?.procedureQA || [],
      postProcedureQA: selectedService?.postProcedureQA || [],
    }))

    // Clear only service error
    setErrors((prev) => ({ ...prev, serviceName: '' }))

    if (selectedService?.serviceId) {
      const subRes = await subServiceData(selectedService.serviceId)
      const allSubServices = Array.isArray(subRes.data)
        ? subRes.data.flatMap((item) => item.subServices || [])
        : subRes.data?.subServices || []
      setSubServiceOptions({ subServices: allSubServices })
    }
  }

  const handleSubServiceChange = (e) => {
    const selectedId = e.target.value
    const selectedObj = subServiceOptions?.subServices?.find((s) => s.subServiceId === selectedId)

    setNewService((prev) => ({
      ...prev,
      subServiceId: selectedId,
      subServiceName: selectedObj?.subServiceName || '',
    }))

    // Clear procedure error
    setErrors((prev) => ({ ...prev, subServiceName: '' }))
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />

      <div>
        <CForm className="d-flex justify-content-end mb-3">
          {can('Procedure Management', 'create') && (
            <div
              className=" w-100"
              style={{
                display: 'flex',
                justifyContent: 'end',
                alignContent: 'end',
                alignItems: 'end',
              }}
            >
              <CButton
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
                onClick={() => openAddModal()}
              >
                Add Procedure Details
              </CButton>
            </div>
          )}
        </CForm>
      </div>

      {viewService && (
        <CModal
          visible={!!viewService}
          onClose={() => setViewService(null)}
          size="xl"
          backdrop="static"
          className="custom-modal"
        >
          <CModalHeader className=" text-white">
            <CModalTitle className="w-100 text-center fs-5 fw-bold">Procedure Details</CModalTitle>
          </CModalHeader>

          <CModalBody className="bg-light text-dark">
            {/* --- Basic Details --- */}
            <div className="p-3 mb-4 bg-white rounded shadow-sm">
              <h6 className="fw-bold border-bottom pb-2 mb-3">Basic Information</h6>
              <CRow className="gy-2">
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Procedure Name:</p>
                  <span className="text-muted">{viewService.subServiceName || 'N/A'}</span>
                </CCol>
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Procedure ID:</p>
                  <span className="text-muted">{viewService.subServiceId || 'N/A'}</span>
                </CCol>
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Service Name:</p>
                  <span className="text-muted">{viewService.serviceName || 'N/A'}</span>
                </CCol>
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Service ID:</p>
                  <span className="text-muted">{viewService.serviceId || 'N/A'}</span>
                </CCol>
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Category Name:</p>
                  <span className="text-muted">{viewService.categoryName || 'N/A'}</span>
                </CCol>
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Consent Form Type:</p>
                  <span className="text-muted">
                    {consentFormTypeLabels[viewService.consentFormType] || 'N/A'}
                  </span>
                </CCol>
                <CCol sm={6}>
                  <p className="mb-1 fw-semibold">Status:</p>
                  <span
                    className={`badge ${
                      viewService.status === 'Active' ? 'bg-success' : 'bg-secondary'
                    }`}
                  >
                    {viewService.status}
                  </span>
                </CCol>
              </CRow>
            </div>

            {/* --- Pricing Details --- */}
            <div className="p-3 mb-4 bg-white rounded shadow-sm">
              <h6 className="fw-bold border-bottom pb-2 mb-3">Pricing Details</h6>
              <CRow className="gy-2">
                <CCol sm={4}>
                  <strong>Price:</strong> ₹ {Math.round(viewService.price)}
                </CCol>
                <CCol sm={4}>
                  <strong>Discount %:</strong> {Math.round(viewService.discountPercentage)}%
                </CCol>
                <CCol sm={4}>
                  <strong>Discount Amount:</strong> ₹ {Math.round(viewService.discountAmount)}
                </CCol>
                <CCol sm={4}>
                  <strong>Discounted Cost:</strong> ₹ {Math.round(viewService.discountedCost)}
                </CCol>
                <CCol sm={4}>
                  <strong>Tax %:</strong> {Math.round(viewService.taxPercentage)}%
                </CCol>
                <CCol sm={4}>
                  <strong>Tax Amount:</strong> ₹ {Math.round(viewService.taxAmount)}
                </CCol>
                <CCol sm={4}>
                  <strong>Platform Fee %:</strong> {Math.round(viewService.platformFeePercentage)}%
                </CCol>
                <CCol sm={4}>
                  <strong>Platform Fee:</strong> ₹ {Math.round(viewService.platformFee)}
                </CCol>
                <CCol sm={4}>
                  <strong>Clinic Pay:</strong> ₹ {Math.round(viewService.clinicPay)}
                </CCol>
                <CCol sm={4}>
                  <strong>GST:</strong> {Math.round(viewService.gst)}
                </CCol>
                <CCol sm={4}>
                  <strong>Consultation Fee:</strong> ₹ {viewService.consultationFee}
                </CCol>
                <CCol sm={4}>
                  <strong>Final Cost:</strong> ₹ {Math.round(viewService.finalCost)}
                </CCol>
                
                <CCol sm={4}>
  <strong>Service Time:</strong>{' '}
  {viewMinTimeValue && viewMinTimeUnit
    ? `${viewMinTimeValue} ${
        viewMinTimeUnit === 'hours'
          ? viewMinTimeValue > 1
            ? 'hours'
            : 'hour'
          : 'minutes'
      }`
    : 'N/A'}
</CCol>


              </CRow>
            </div>

            {/* --- Q&A Sections --- */}
            <div className="p-3 mb-4 bg-white rounded shadow-sm">
              <h6 className="fw-bold border-bottom pb-2 mb-3">Pre-Procedure QA</h6>
              {Array.isArray(viewService.preProcedureQA) &&
              viewService.preProcedureQA.length > 0 ? (
                viewService.preProcedureQA.map((qa, index) => {
                  const question = Object.keys(qa)[0]
                  const answers = qa[question]
                  return (
                    <div key={index} className="mb-2">
                      <strong>{question}</strong>
                      <ul className="mb-1 text-muted ps-3">
                        {answers.map((ans, i) => (
                          <li key={i}>{ans}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted">No Pre-Procedure Q&A available.</p>
              )}
            </div>

            <div className="p-3 mb-4 bg-white rounded shadow-sm">
              <h6 className="fw-bold  border-bottom pb-2 mb-3">Procedure QA</h6>
              {Array.isArray(viewService.procedureQA) && viewService.procedureQA.length > 0 ? (
                viewService.procedureQA.map((qa, index) => {
                  const question = Object.keys(qa)[0]
                  const answers = qa[question]
                  return (
                    <div key={index} className="mb-2">
                      <strong>{question}</strong>
                      <ul className="mb-1 text-muted ps-3">
                        {answers.map((ans, i) => (
                          <li key={i}>{ans}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted">No Procedure Q&A available.</p>
              )}
            </div>

            <div className="p-3 mb-4 bg-white rounded shadow-sm">
              <h6 className="fw-bold border-bottom pb-2 mb-3">Post-Procedure QA</h6>
              {Array.isArray(viewService.postProcedureQA) &&
              viewService.postProcedureQA.length > 0 ? (
                viewService.postProcedureQA.map((qa, index) => {
                  const question = Object.keys(qa)[0]
                  const answers = qa[question]
                  return (
                    <div key={index} className="mb-2">
                      <strong>{question}</strong>
                      <ul className="mb-1 text-muted ps-3">
                        {answers.map((ans, i) => (
                          <li key={i}>{ans}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted">No Post-Procedure Q&A available.</p>
              )}
            </div>

            {/* --- Image & Description --- */}
            <div className="p-3 bg-white rounded shadow-sm">
              <h6 className="fw-bold  border-bottom pb-2 mb-3">Additional Details</h6>
              <CRow>
                <CCol sm={6}>
                  <p className="fw-semibold">Service Image:</p>
                  {viewService.subServiceImage ? (
                    <img
                      src={`data:image/png;base64,${viewService.subServiceImage}`}
                      alt="Service"
                      style={{
                        width: '100%',
                        maxWidth: '250px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    />
                  ) : (
                    <p className="text-muted">No image available</p>
                  )}
                </CCol>
                <CCol sm={6}>
                  <p className="fw-semibold">Description:</p>
                  <p className="text-muted">{viewService.viewDescription || 'N/A'}</p>
                </CCol>
              </CRow>
            </div>
          </CModalBody>

          <CModalFooter className="bg-light">
            <CButton color="secondary" onClick={() => setViewService(null)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      <CModal
        visible={modalVisible}
        onClose={AddCancel} // reuse the same reset logic
        size="xl"
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
            {modalMode === 'edit' ? 'Edit Procedure Details' : 'Add New Procedure Details'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* ---------------- CATEGORY / SERVICE / SUB-SERVICE ---------------- */}
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Category Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="categoryName"
                  value={newService.categoryId || ''}
                  onChange={handleCategoryChange}
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select a Category</option>
                  {category?.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>
                {errors.categoryName && (
                  <CFormText className="text-danger">{errors.categoryName}</CFormText>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Service Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="serviceName"
                  value={newService.serviceName || ''}
                  onChange={handleServiceChange}
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select Service</option>
                  {serviceOptions.map((service) => (
                    <option key={service.serviceId} value={service.serviceName}>
                      {service.serviceName}
                    </option>
                  ))}
                </CFormSelect>
                {errors.serviceName && (
                  <CFormText className="text-danger">{errors.serviceName}</CFormText>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Procedure Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="subServiceId"
                  value={newService.subServiceId || ''}
                  onChange={handleSubServiceChange}
                >
                  <option value="">Select Procedure</option>
                  {Array.isArray(subServiceOptions?.subServices) &&
                    subServiceOptions.subServices.map((sub) => (
                      <option key={sub.subServiceId} value={sub.subServiceId}>
                        {sub.subServiceName}
                      </option>
                    ))}
                </CFormSelect>
                {errors.subServiceName && (
                  <CFormText className="text-danger">{errors.subServiceName}</CFormText>
                )}
              </CCol>
            </CRow>

            {/* ---------------- IMAGE / DESCRIPTION / STATUS ---------------- */}
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Procedure Image <span className="text-danger">*</span>
                </h6>

                <CFormInput
                  type="file"
                  accept="image/*"
                  name="serviceImage"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        // Store full base64 string including mime type
                        setNewService({
                          ...newService,
                          serviceImage: reader.result, // full data URL
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />

                {newService?.serviceImage && (
                  <img
                    src={
                      newService.serviceImage.startsWith('data:')
                        ? newService.serviceImage
                        : `data:image/jpeg;base64,${newService.serviceImage}`
                    } // handle API base64
                    alt="Preview"
                    style={{ width: 100, height: 100, marginTop: 10, objectFit: 'cover' }}
                  />
                )}

                {errors.serviceImage && (
                  <CFormText className="text-danger">{errors.serviceImage}</CFormText>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  View Description <span className="text-danger">*</span>
                </h6>
                <CFormTextarea
                  type="text"
                  placeholder="View Description"
                  name="viewDescription"
                  value={newService.viewDescription || ''}
                  onChange={handleChange}
                />
                {errors.viewDescription && (
                  <CFormText className="text-danger">{errors.viewDescription}</CFormText>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Status <span className="text-danger">*</span>
                </h6>
                <CFormSelect name="status" value={newService.status || ''} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="InActive">Inactive</option>
                </CFormSelect>
                {errors.status && <CFormText className="text-danger">{errors.status}</CFormText>}
              </CCol>
            </CRow>

            {/* ---------------- CONSENT / FEES / TIME ---------------- */}
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Consent Form Type <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="consentFormType"
                  value={newService.consentFormType || ''}
                  onChange={handleChange}
                >
                  <option value="">Select consentFormType</option>
                  <option value="1">Generic ConsentForm</option>
                  <option value="2">Procedure ConsentForm</option>
                </CFormSelect>
                {errors.consentFormType && (
                  <CFormText className="text-danger">{errors.consentFormType}</CFormText>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Consultation Fee <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="text"
                  name="consultationFee"
                  value={newService.consultationFee || ''}
                  onChange={handleChange}
                  placeholder="Enter Consultation Fee"
                />

                {errors.consultationFee && (
                  <CFormText className="text-danger">{errors.consultationFee}</CFormText>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Min Time <span className="text-danger">*</span>
                </h6>
                <div className="d-flex">
                  <CFormInput
                    type="text"
                    name="minTimeValue"
                    placeholder="Enter time"
                    value={newService.minTimeValue || ''} // will show 45
                    onChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '')
                    }}
                  />
                  <CFormSelect
                    name="minTimeUnit"
                    className="ms-2"
                    value={newService.minTimeUnit || ''} // will show minutes
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Time
                    </option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </CFormSelect>
                </div>

                {/* Separate error messages for value and unit */}
                {errors.minTimeValue && (
                  <CFormText className="text-danger">{errors.minTimeValue}</CFormText>
                )}
                {errors.minTimeUnit && (
                  <CFormText className="text-danger">{errors.minTimeUnit}</CFormText>
                )}
              </CCol>
            </CRow>

            {/* ---------------- PRICE / DISCOUNT / TAX ---------------- */}
            <CRow className="mb-4">
              <CCol md={3}>
                <h6>
                  Procedure Price <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Procedure Price"
                  name="price"
                  value={newService.price || ''}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                  }}
                />
                {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
              </CCol>

              <CCol md={3}>
                <h6>Discount (%)</h6>
                <CFormInput
                  type="text"
                  name="discount"
                  placeholder="Discount"
                  value={newService.discount || ''}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                  }}
                />
                {/* {errors.discount && (
                  <CFormText className="text-danger">{errors.discount}</CFormText>
                )} */}
              </CCol>

              <CCol md={3}>
                <h6>
                  GST (%)<span className="text-danger"></span>
                </h6>
                <CFormInput
                  type="text"
                  name="gst"
                  placeholder="GST (%)"
                  value={newService.gst || ''}
                  onChange={handleChange}
                />
                {/* {errors.gst && <CFormText className="text-danger">{errors.gst}</CFormText>} */}
              </CCol>

              <CCol md={3}>
                <h6>Other Taxes (%)</h6>
                <CFormInput
                  type="text"
                  name="taxPercentage"
                  placeholder="Tax Percentage"
                  value={newService.taxPercentage || ''}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                  }}
                />
                {/* {errors.taxPercentage && (
                  <CFormText className="text-danger">{errors.taxPercentage}</CFormText>
                )} */}
              </CCol>
            </CRow>

            {/* ---------------- PROCEDURE QA ---------------- */}
            <h6 className="m-3">Procedure (Optional)</h6>
            <ProcedureQA
              preQAList={newService.preProcedureQA}
              setPreQAList={(data) => setNewService((prev) => ({ ...prev, preProcedureQA: data }))}
              procedureQAList={newService.procedureQA}
              setProcedureQAList={(data) =>
                setNewService((prev) => ({ ...prev, procedureQA: data }))
              }
              postQAList={newService.postProcedureQA}
              setPostQAList={(data) =>
                setNewService((prev) => ({ ...prev, postProcedureQA: data }))
              }
            />
          </CForm>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={AddCancel}>
            Cancel
          </CButton>
          <CButton
            color="info"
            className="pink-Btn"
            onClick={modalMode === 'edit' ? handleUpdateService : handleAddService}
            disabled={saveloading}
          >
            {saveloading && (
              <span className="spinner-border text-white spinner-border-sm me-2"></span>
            )}
            {saveloading
              ? modalMode === 'edit'
                ? 'Updating...'
                : 'Saving...'
              : modalMode === 'edit'
                ? 'Update'
                : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading Procedure..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            height: '50vh', // full screen height

            color: 'var(--color-black)',
          }}
        >
          {error}
        </div>
      ) : (
        <CTable striped hover responsive>
          <CTableHead className="pink-table w-auto">
            <CTableRow>
              <CTableHeaderCell style={{ paddingLeft: '40px' }}>S.No</CTableHeaderCell>
              <CTableHeaderCell>Procedure Name</CTableHeaderCell>
              <CTableHeaderCell>Servic eName</CTableHeaderCell>
              <CTableHeaderCell>Category Name</CTableHeaderCell>
              <CTableHeaderCell>Price</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((test, index) => (
                <CTableRow key={test.id}>
                  <CTableDataCell style={{ paddingLeft: '40px' }}>
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </CTableDataCell>
                  <CTableDataCell>{capitalizeWords(test.subServiceName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(test.serviceName || 'NA')}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(test.categoryName || 'NA')}</CTableDataCell>
                  <CTableDataCell>₹{test.price || 'NA'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Procedure Management', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => setViewService(test)}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Procedure Management', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => openEditModal(test)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}

                      {can('Procedure Management', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => handleServiceDelete(test)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <ConfirmationModal
                        isVisible={isModalVisible}
                        title="Delete Procedure"
                        message="Are you sure you want to delete this procedure? This action cannot be undone."
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
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                      />
                    </div>
                  </CTableDataCell>
                  {/* <CTableDataCell>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '140px' }}>
                            <div
                              onClick={() => setViewTest(test)}
                              style={{ color: 'green', cursor: 'pointer' }}
                            >
                              View
                            </div>
                            <div
                              onClick={() => {
                                setTestToEdit(test)
                                setEditTestMode(true)
                              }}
                              style={{ color: 'blue', cursor: 'pointer' }}
                            >
                              Edit
                            </div>
                            <div
                              onClick={() => handleTestDelete(test)}
                              style={{ color: 'red', cursor: 'pointer' }}
                            >
                              Delete
                            </div>
                          </div>
                        </CTableDataCell> */}
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={5} className="text-center text-muted">
                  🔍 No procedure found"
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
      {displayData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}
    </div>
  )
}

export default ServiceManagement
