import React, { useEffect, useState, useMemo } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import {
  Users,
  UserPlus,
  Award,
  Share2,
  Search,
  Calendar,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  ShieldAlert,
  BarChart3,
  PieChart as PieChartIcon,
  LayoutGrid,
  Table2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  getAllReferDoctors,
  GetBookingByClinicIdData,
  getDoctorReferralPatientDetails,
  getDoctorReferralAnalytics,
  getDoctorReferralAnalyticsCustom,
  getReferralChannelsAnalytics,
  getReferralChannelsCustom,
  getReferralChannelPatientDetails,
} from './ReferralAnalyticsAPI'
import capitalizeWords from '../../Utils/capitalizeWords'
import LoadingIndicator from '../../Utils/loader'
import Pagination from '../../Utils/Pagination'
import useAutoHideSidebar from '../widgets/useAutoHideSidebar'
import { useLocation } from 'react-router-dom'
import { useHospital } from '../Usecontext/HospitalContext'
const formatReferredByPerson = (pat) => {
  if (!pat.referredByName) return pat.referredByType || '—'
  if (pat.referredByType && pat.referredByType.startsWith('Family')) {
    const relation = pat.referredByType.replace('Family ', '').replace('(', '').replace(')', '')
    return `${capitalizeWords(pat.referredByName)} (${capitalizeWords(relation)})`
  }
  if (pat.referredByType === 'Friend') {
    return `${capitalizeWords(pat.referredByName)} (Friend)`
  }
  return capitalizeWords(pat.referredByName)
}

const getBookingType = (pat) => {
  if (pat.packageName || pat.packageId) return 'Package'
  if (pat.programName || pat.programId) return 'Program'
  if (pat.therapyName || pat.therapyId) return 'Therapy'
  if (pat.exerciseName || pat.exerciseId) return 'Exercise'
  return 'Consultation'
}

const getBookingServiceName = (pat) => {
  if (pat.packageName) return pat.packageName
  if (pat.programName) return pat.programName
  if (pat.therapyName) return pat.therapyName
  if (pat.exerciseName) return pat.exerciseName
  return pat.serviceName || 'General Consultation'
}

// Color palette for charts (keeps consistency with existing UI colors)
const CHART_COLORS = [
  '#3b6d11',
  '#185fa5',
  '#6b21a8',
  '#b45309',
  '#0c7b93',
  '#be123c',
  '#4338ca',
  '#059669',
  '#c2410c',
  '#7c3aed',
  '#0891b2',
  '#a16207',
]

const ReferralAnalytics = () => {
  useAutoHideSidebar()
  const location = useLocation();
  const { branchId: stateBranchId, clinicId, branchName: stateBranchName } =
    location.state || {};
  const { globalBranchId, globalBranchName } = useHospital() || {}
  // Prefer the live global context; fall back to navigation state
  const branchId = globalBranchId || stateBranchId
  const branchName = globalBranchName || stateBranchName
  const [filter, setFilter] = useState('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [activeTab, setActiveTab] = useState('doctors')
  const [viewMode, setViewMode] = useState('list')
  const [displayMode, setDisplayMode] = useState('charts') // 'table' or 'charts'
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [selectedSubRelation, setSelectedSubRelation] = useState('')
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('All')

  // Data State
  const [referDoctors, setReferDoctors] = useState([])
  const [bookings, setBookings] = useState([])
  const [doctorAnalytics, setDoctorAnalytics] = useState([])
  const [channelsAnalytics, setChannelsAnalytics] = useState([])
  const [backendModalPatients, setBackendModalPatients] = useState([])
  const [backendChannelPatients, setBackendChannelPatients] = useState([])
  const [channelPatientsLoading, setChannelPatientsLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [useSampleData, setUseSampleData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [channelSearchQuery, setChannelSearchQuery] = useState('')
  const [detailsSearchQuery, setDetailsSearchQuery] = useState('')

  // Pagination State
  const [docPage, setDocPage] = useState(1)
  const [docPageSize, setDocPageSize] = useState(10)
  const [chanPage, setChanPage] = useState(1)
  const [chanPageSize, setChanPageSize] = useState(10)
  const [detPage, setDetPage] = useState(1)
  const [detPageSize, setDetPageSize] = useState(10)

  // Modal State
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState(null) // Doctor or Channel object
  const [modalType, setModalType] = useState('doctor') // 'doctor' or 'channel'
  const [modalSearchQuery, setModalSearchQuery] = useState('')
  const [modalPage, setModalPage] = useState(1)
  const [modalPageSize, setModalPageSize] = useState(10)

  const hospitalId = sessionStorage.getItem('HospitalId')

  // Fetch doctors and bookings
  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Referral Doctors
      let docsList = []
      if (hospitalId) {
        const res = await getAllReferDoctors(hospitalId)
        docsList = res.data?.data || []
        setReferDoctors(docsList)
      }

      // 2. Fetch Bookings
      let bookingsList = []
      if (hospitalId) {
        const res = await GetBookingByClinicIdData()
        bookingsList = Array.isArray(res) ? res : res?.data || []
        setBookings(bookingsList)
      }

      // 3. Fetch Doctor Referral Analytics from backend
      // const branchId = sessionStorage.getItem('branchId')
      let analyticsData = []
      if (hospitalId && branchId) {
        try {
          if (filter === 'custom') {
            if (fromDate && toDate) {
              const res = await getDoctorReferralAnalyticsCustom(hospitalId, branchId, fromDate, toDate)
              analyticsData = res?.data || res || []
            }
          } else {
            // Map timeframe string filter to backend filter ID:
            // 1 = today, 2 = week, 3 = month, 4 = year/all
            const filterMap = {
              today: 1,
              week: 2,
              month: 3,
              year: 4,
            }
            const filterId = filterMap[filter] || 3 // default to month (3)
            const res = await getDoctorReferralAnalytics(hospitalId, branchId, filterId)
            analyticsData = res?.data || res || []
          }
          setDoctorAnalytics(Array.isArray(analyticsData) ? analyticsData : [])
        } catch (analyticsErr) {
          console.error('Error fetching doctor referral analytics:', analyticsErr)
          setDoctorAnalytics([])
        }
      }

      // 4. Fetch Referral Channels Analytics from backend
      let chanAnalyticsData = []
      if (hospitalId && branchId) {
        try {
          if (filter === 'custom') {
            if (fromDate && toDate) {
              const res = await getReferralChannelsCustom(hospitalId, branchId, fromDate, toDate)
              chanAnalyticsData = res?.data || res || []
            }
          } else {
            // Map timeframe string filter to backend filter ID:
            // 1 = today, 2 = week, 3 = month, 4 = year/all
            const filterMap = {
              today: 1,
              week: 2,
              month: 3,
              year: 4,
            }
            const filterId = filterMap[filter] || 3 // default to month (3)
            const res = await getReferralChannelsAnalytics(hospitalId, branchId, filterId)
            chanAnalyticsData = res?.data || res || []
          }
          setChannelsAnalytics(Array.isArray(chanAnalyticsData) ? chanAnalyticsData : [])
        } catch (chanAnalyticsErr) {
          console.error('Error fetching referral channels analytics:', chanAnalyticsErr)
          setChannelsAnalytics([])
        }
      }

      // Check if real referral data exists in the database
      const hasRealReferrals =
        bookingsList.some((b) => b.doctorRefCode && b.doctorRefCode !== '') ||
        analyticsData.length > 0 ||
        chanAnalyticsData.length > 0

      // If there are zero refer doctors or zero real referrals, automatically switch to sample data
      if (docsList.length === 0 || !hasRealReferrals) {
        setUseSampleData(true)
      } else {
        setUseSampleData(false)
      }
    } catch (err) {
      console.error('Error fetching referral analytics data:', err)
      setUseSampleData(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filter === 'custom' && (!fromDate || !toDate)) return
    fetchData()
  }, [filter, fromDate, toDate])

  // Fetch detailed referred patients for modal (Doctor referrals)
  useEffect(() => {
    const fetchModalDetails = async () => {
      if (!modalVisible || modalType !== 'doctor' || !selectedEntity || useSampleData) {
        return
      }
      setModalLoading(true)
      try {
        // const branchId = sessionStorage.getItem('branchId')
        const res = await getDoctorReferralPatientDetails(
          hospitalId,
          branchId,
          selectedEntity.referralId || selectedEntity.id
        )
        const patientData = res?.data || res || []
        setBackendModalPatients(Array.isArray(patientData) ? patientData : [])
      } catch (err) {
        console.error('Error fetching doctor referral patient details:', err)
        setBackendModalPatients([])
      } finally {
        setModalLoading(false)
      }
    }
    fetchModalDetails()
  }, [modalVisible, modalType, selectedEntity, useSampleData, hospitalId])

  // Fetch detailed referred patients for sub-page (Channel referrals)
  useEffect(() => {
    const fetchChannelDetails = async () => {
      if (!selectedChannel || useSampleData) {
        return
      }
      setChannelPatientsLoading(true)
      try {
        // const branchId = sessionStorage.getItem('branchId')
        const res = await getReferralChannelPatientDetails(
          hospitalId,
          branchId,
          selectedChannel
        )
        const patientData = res?.data || res || []
        setBackendChannelPatients(Array.isArray(patientData) ? patientData : [])
      } catch (err) {
        console.error('Error fetching referral channel patient details:', err)
        setBackendChannelPatients([])
      } finally {
        setChannelPatientsLoading(false)
      }
    }
    fetchChannelDetails()
  }, [selectedChannel, useSampleData, hospitalId])

  // Sample data generator (fallback for a stunning UI demo)
  const sampleData = useMemo(() => {
    const doctorsList =
      referDoctors.length > 0
        ? referDoctors
        : [
          {
            id: 'd1',
            referralId: 'REF-8371',
            fullName: 'Dr. Rajesh Patel',
            specialization: 'Orthopedics',
            currentHospitalName: 'Patel Ortho Care',
            mobileNumber: '9845210291',
            status: 'Active',
          },
          {
            id: 'd2',
            referralId: 'REF-4921',
            fullName: 'Dr. Shalini Rao',
            specialization: 'Neurology',
            currentHospitalName: 'Apollo Hospitals',
            mobileNumber: '9123849182',
            status: 'Active',
          },
          {
            id: 'd3',
            referralId: 'REF-2894',
            fullName: 'Dr. Vivek Verma',
            specialization: 'Cardiology',
            currentHospitalName: 'Fortis Clinic',
            mobileNumber: '9900881122',
            status: 'Active',
          },
          {
            id: 'd4',
            referralId: 'REF-1038',
            fullName: 'Dr. Neha Sharma',
            specialization: 'Pediatrics',
            currentHospitalName: 'City Children Hospital',
            mobileNumber: '9786453120',
            status: 'Active',
          },
          {
            id: 'd5',
            referralId: 'REF-7742',
            fullName: 'Dr. Amit Mishra',
            specialization: 'General Physician',
            currentHospitalName: 'Mishra Healthcare',
            mobileNumber: '9654123098',
            status: 'Active',
          },
        ]

    const sampleNames = [
      'Arjun Sharma',
      'Priya Patel',
      'Amit Verma',
      'Sunita Rao',
      'Karan Malhotra',
      'Neha Gupta',
      'Rohan Das',
      'Sneha Reddy',
      'Vikram Singh',
      'Ananya Sen',
      'Preeti Joshi',
      'Manish Kulkarni',
      'Deepak Kumar',
      'Ritu Sharma',
      'Suresh Nair',
      'Meera Deshmukh',
      'Aditya Joshi',
      'Kavita Pillai',
      'Sanjay Dutt',
      'Pooja Hegde',
      'Vijay Iyer',
      'Swati Rao',
      'Nikhil Gowda',
      'Harish Chawla',
      'Divya Teja',
      'Abhishek Roy',
      'Shreya Ghoshal',
      'Rajesh Khanna',
      'Asha Bhosle',
      'Siddharth Malhotra',
    ]
    const services = [
      'Physiotherapy Session',
      'Neuro Rehab',
      'Orthopedic Assessment',
      'Spine Care Treatment',
      'Sports Injury Clinic',
      'Cardiovascular Therapy',
    ]
    const statuses = ['Completed', 'Completed', 'Upcoming', 'Completed', 'Cancelled', 'Completed']
    const payTypes = ['UPI', 'Card', 'Cash', 'UPI']

    const mockBookings = []
    const channels = [
      'Friend',
      'Family (Brother)',
      'Family (Sister)',
      'Family (Father)',
      'Family (Mother)',
      'Family (Spouse)',
      'Family (Cousin)',
      'Family (Other)',
      'Facebook',
      'Instagram',
      'Google',
      'Advertisement',
    ]

    // Generate referrals for doctors (5-8 referrals per doctor)
    doctorsList.forEach((doc, idx) => {
      const count = 5 + (idx % 4)
      for (let i = 0; i < count; i++) {
        const pIdx = (idx * 5 + i) % sampleNames.length
        const sIdx = (idx * 2 + i) % services.length
        const stIdx = (idx * 3 + i) % statuses.length
        const payIdx = (idx + i) % payTypes.length

        const date = new Date()
        const currentDay = date.getDate()
        const day = currentDay > 1 ? 1 + ((i * 2 + idx * 3) % currentDay) : 1
        date.setDate(day)

        const typeMod = i % 5
        const mockItem = {
          id: `mock-bk-${doc.id || idx}-${i}`,
          name: sampleNames[pIdx],
          serviceDate: date.toISOString().split('T')[0],
          patientMobileNumber: `98765${idx}${i}12`,
          doctorRefCode: doc.referralId || `REF-${doc.id || idx}`,
          foc: 'Paid',
          paymentType: payTypes[payIdx],
          status: statuses[stIdx],
        }

        if (typeMod === 0) {
          mockItem.packageName = 'Complete Joint Care Package'
          mockItem.totalAmount = 4500
          mockItem.totalPaid = statuses[stIdx] === 'Completed' ? 4500 : 3000
          mockItem.balanceAmount = 1500
        } else if (typeMod === 1) {
          mockItem.programName = 'Post-Stroke Rehab Program'
          mockItem.totalAmount = 6000
          mockItem.totalPaid = statuses[stIdx] === 'Completed' ? 6000 : 4000
          mockItem.balanceAmount = 2000
        } else if (typeMod === 2) {
          mockItem.therapyName = 'Manual Physiotherapy Therapy'
          mockItem.servicecost = 1200
        } else if (typeMod === 3) {
          mockItem.exerciseName = 'Lumbar Stretching Exercise'
          mockItem.servicecost = 800
        } else {
          mockItem.consultationFee = 500
        }

        mockBookings.push(mockItem)
      }
    })

    // Generate referrals for other channels (4-8 referrals per channel)
    channels.forEach((chan, idx) => {
      const count = 4 + (idx % 5)
      for (let i = 0; i < count; i++) {
        const pIdx = (idx * 4 + i) % sampleNames.length
        const sIdx = (idx + i) % services.length
        const stIdx = (idx * 2 + i) % statuses.length

        const date = new Date()
        const currentDay = date.getDate()
        const day = currentDay > 1 ? 1 + ((i * 3 + idx * 2) % currentDay) : 1
        date.setDate(day)

        let refPersonName = `Person ${i + 1}`
        if (chan === 'Friend') {
          const friends = ['Rahul', 'Sneha', 'Karan', 'Pooja', 'Vikram', 'Neha']
          refPersonName = friends[i % friends.length]
        } else if (chan.startsWith('Family')) {
          const familyNames = {
            'Family (Brother)': ['Ramesh', 'Suresh', 'Anil'],
            'Family (Sister)': ['Sita', 'Savita', 'Pooja'],
            'Family (Father)': ['Dinesh', 'Rajesh', 'Gopal'],
            'Family (Mother)': ['Kiran', 'Sonia', 'Radha'],
            'Family (Spouse)': ['Preeti', 'Karan', 'Sunita'],
            'Family (Cousin)': ['Hari', 'Preeti', 'Vijay'],
            'Family (Other)': ['Amit (Uncle)', 'Saritha (Aunt)', 'Mohan (Grandfather)'],
          }
          const namesList = familyNames[chan] || ['Ramesh']
          refPersonName = namesList[i % namesList.length]
        } else {
          refPersonName = `${chan} Ad Campaign`
        }

        const typeMod = i % 5
        const mockItem = {
          id: `mock-chan-${chan}-${i}`,
          name: sampleNames[pIdx],
          serviceDate: date.toISOString().split('T')[0],
          patientMobileNumber: `91234${idx}${i}89`,
          doctorRefCode: 'OTHER',
          referredByType: chan,
          referredByName: refPersonName,
          foc: 'Paid',
          paymentType: 'UPI',
          status: statuses[stIdx],
        }

        if (typeMod === 0) {
          mockItem.packageName = 'Complete Joint Care Package'
          mockItem.totalAmount = 4500
          mockItem.totalPaid = statuses[stIdx] === 'Completed' ? 4500 : 3000
          mockItem.balanceAmount = 1500
        } else if (typeMod === 1) {
          mockItem.programName = 'Post-Stroke Rehab Program'
          mockItem.totalAmount = 6000
          mockItem.totalPaid = statuses[stIdx] === 'Completed' ? 6000 : 4000
          mockItem.balanceAmount = 2000
        } else if (typeMod === 2) {
          mockItem.therapyName = 'Manual Physiotherapy Therapy'
          mockItem.servicecost = 1200
        } else if (typeMod === 3) {
          mockItem.exerciseName = 'Lumbar Stretching Exercise'
          mockItem.servicecost = 800
        } else {
          mockItem.consultationFee = 500
        }

        mockBookings.push(mockItem)
      }
    })

    return { doctorsList, mockBookings }
  }, [referDoctors])

  // Determine active data set
  const activeDoctors = useSampleData ? sampleData.doctorsList : referDoctors
  const activeBookings = useSampleData ? sampleData.mockBookings : bookings

  // Date Filter Logic
  const filteredBookings = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return activeBookings.filter((row) => {
      if (!row.serviceDate) return false
      const rowDate = new Date(row.serviceDate)
      rowDate.setHours(0, 0, 0, 0)

      if (filter === 'today') {
        return rowDate.toDateString() === today.toDateString()
      }
      if (filter === 'week') {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
        return rowDate >= startOfWeek && rowDate <= endOfWeek
      }
      if (filter === 'month') {
        return (
          rowDate.getMonth() === today.getMonth() && rowDate.getFullYear() === today.getFullYear()
        )
      }
      if (filter === 'year') {
        return rowDate.getFullYear() === today.getFullYear()
      }
      if (filter === 'custom' && fromDate && toDate) {
        const start = new Date(fromDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(toDate)
        end.setHours(23, 59, 59, 999)
        return rowDate >= start && rowDate <= end
      }
      return true
    })
  }, [activeBookings, filter, fromDate, toDate])

  // Analytics Computations
  const stats = useMemo(() => {
    let total = 0
    let doctorReferrals = 0
    let otherReferrals = 0
    const doctorCounts = {}
    const channelCounts = {}

    if (!useSampleData && doctorAnalytics.length > 0) {
      // Calculate doctor stats directly from backend analytics
      doctorAnalytics.forEach((item) => {
        const count = item.patientsReferred || 0
        doctorReferrals += count
        const key = item.referralId || item.doctorId
        doctorCounts[key] = (doctorCounts[key] || 0) + count
      })
    } else {
      // Fallback for sample data
      filteredBookings.forEach((b) => {
        const isDocReferral = b.doctorRefCode && b.doctorRefCode !== 'OTHER' && b.doctorRefCode !== ''
        if (isDocReferral) {
          doctorReferrals++
          doctorCounts[b.doctorRefCode] = (doctorCounts[b.doctorRefCode] || 0) + 1
        }
      })
    }

    // Other channels calculations (always from filteredBookings in sample mode, from channelsAnalytics in live mode)
    if (!useSampleData && channelsAnalytics.length > 0) {
      channelsAnalytics.forEach((item) => {
        const count = item.patientsReferred !== undefined ? item.patientsReferred : (item.patientCount || 0)
        otherReferrals += count
        channelCounts[item.channel || 'Other'] = count
      })
    } else {
      filteredBookings.forEach((b) => {
        if (b.doctorRefCode === 'OTHER') {
          otherReferrals++
          const chanName = b.referredByType || 'Other'
          channelCounts[chanName] = (channelCounts[chanName] || 0) + 1
        }
      })
    }

    total = doctorReferrals + otherReferrals

    // Find top doctor
    let topDocRefCode = null
    let maxDocCount = 0
    Object.entries(doctorCounts).forEach(([code, count]) => {
      if (count > maxDocCount) {
        maxDocCount = count
        topDocRefCode = code
      }
    })

    const topDoc = activeDoctors.find(
      (d) => d.referralId === topDocRefCode || String(d.id) === String(topDocRefCode),
    )
    const topDocName = topDoc && topDoc.fullName ? capitalizeWords(topDoc.fullName) : 'None'

    return {
      total,
      doctorReferrals,
      otherReferrals,
      topDocName,
      maxDocCount,
      doctorCounts,
      channelCounts,
    }
  }, [filteredBookings, activeDoctors, useSampleData, doctorAnalytics, channelsAnalytics])

  // Process Referral Doctor Table Data
  const referralDoctorTableData = useMemo(() => {
    if (!useSampleData && doctorAnalytics.length > 0) {
      // Map backend fields to the keys expected by the frontend JSX:
      return doctorAnalytics
        .map((item) => ({
          id: item.doctorId,
          referralId: item.referralId || item.doctorId,
          fullName: item.doctorName,
          currentHospitalName: item.clinicHospitalName,
          specialization: item.specialization,
          mobileNumber: item.contactInfo,
          patientCount: item.patientsReferred || 0,
          revenue: item.revenueGenerated || 0,
        }))
        .sort((a, b) => b.patientCount - a.patientCount)
    }

    return activeDoctors
      .map((doc) => {
        const count = stats.doctorCounts[doc.referralId] || stats.doctorCounts[doc.id] || 0

        // Calculate revenue from completed referrals
        const docBookings = filteredBookings.filter(
          (b) => b.doctorRefCode === doc.referralId || String(b.doctorRefCode) === String(doc.id),
        )

        const revenue = docBookings.reduce((sum, b) => {
          if (b.totalPaid !== undefined) {
            return sum + Number(b.totalPaid || 0)
          }
          if (b.status === 'Completed') {
            const fee = Number(b.servicecost || b.consultationFee || 0)
            return sum + fee
          }
          return sum
        }, 0)

        return {
          ...doc,
          patientCount: count,
          revenue,
        }
      })
      .sort((a, b) => b.patientCount - a.patientCount) // sort by referral volume
  }, [activeDoctors, stats.doctorCounts, filteredBookings, useSampleData, doctorAnalytics])

  // Filtered Referral Doctor Table Data (Search capability)
  const searchedDoctorTableData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return referralDoctorTableData
    return referralDoctorTableData.filter(
      (doc) =>
        (doc.fullName && doc.fullName.toLowerCase().includes(q)) ||
        (doc.currentHospitalName && doc.currentHospitalName.toLowerCase().includes(q)) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(q)),
    )
  }, [referralDoctorTableData, searchQuery])

  const paginatedDoctorData = useMemo(() => {
    const start = (docPage - 1) * docPageSize
    return searchedDoctorTableData.slice(start, start + docPageSize)
  }, [searchedDoctorTableData, docPage, docPageSize])

  // Process Other Channels Table Data
  const otherChannelsTableData = useMemo(() => {
    if (!useSampleData && channelsAnalytics.length > 0) {
      // Map backend fields to the keys expected by the frontend JSX:
      return channelsAnalytics
        .map((item) => ({
          channel: item.channel || item.name || 'Other',
          patientCount: item.patientsReferred !== undefined ? item.patientsReferred : (item.patientCount || 0),
          revenue: item.revenueGenerated !== undefined ? item.revenueGenerated : (item.revenue || 0),
        }))
        .sort((a, b) => b.patientCount - a.patientCount)
    }

    const mainChannels = [
      'Friend',
      'Family',
      'Facebook',
      'Instagram',
      'Google',
      'Advertisement',
      'Other',
    ]

    return mainChannels
      .map((chan) => {
        const chanBookings = filteredBookings.filter((b) => {
          if (b.doctorRefCode !== 'OTHER') return false
          const type = b.referredByType || ''

          if (chan === 'Family') {
            return type.startsWith('Family')
          }
          if (chan === 'Friend') {
            return type === 'Friend'
          }
          return type === chan
        })

        const count = chanBookings.length

        const revenue = chanBookings.reduce((sum, b) => {
          if (b.totalPaid !== undefined) {
            return sum + Number(b.totalPaid || 0)
          }
          if (b.status === 'Completed') {
            const fee = Number(b.servicecost || b.consultationFee || 0)
            return sum + fee
          }
          return sum
        }, 0)

        return {
          channel: chan,
          patientCount: count,
          revenue,
        }
      })
      .sort((a, b) => b.patientCount - a.patientCount)
  }, [filteredBookings, useSampleData, channelsAnalytics])

  // Filtered Channels Table Data (Search capability)
  const searchedChannelsTableData = useMemo(() => {
    const q = channelSearchQuery.toLowerCase().trim()
    if (!q) return otherChannelsTableData
    return otherChannelsTableData.filter((chan) => chan.channel.toLowerCase().includes(q))
  }, [otherChannelsTableData, channelSearchQuery])

  const paginatedChannelsData = useMemo(() => {
    const start = (chanPage - 1) * chanPageSize
    return searchedChannelsTableData.slice(start, start + chanPageSize)
  }, [searchedChannelsTableData, chanPage, chanPageSize])

  // Chart Data: Doctor vs Other Channel referrals
  const referralSourceChartData = useMemo(() => {
    return [
      { name: 'Doctor Referrals', value: stats.doctorReferrals },
      { name: 'Other Channels', value: stats.otherReferrals },
    ]
  }, [stats.doctorReferrals, stats.otherReferrals])

  // Chart Data: Top 6 referring doctors by patient count
  const topDoctorsChartData = useMemo(() => {
    return referralDoctorTableData
      .filter((d) => d.patientCount > 0)
      .slice(0, 6)
      .map((d) => ({
        name: d.fullName?.toLowerCase().startsWith('dr')
          ? capitalizeWords(d.fullName)
          : `Dr. ${capitalizeWords(d.fullName || '')}`,
        patients: d.patientCount,
      }))
  }, [referralDoctorTableData])

  // Chart Data: Channel breakdown (pie)
  const channelPieChartData = useMemo(() => {
    return otherChannelsTableData
      .filter((c) => c.patientCount > 0)
      .map((c) => ({ name: c.channel, value: c.patientCount }))
  }, [otherChannelsTableData])

  // Handle open modal showing patient list
  const handleOpenPatientsModal = (entity, type) => {
    setModalType(type)
    setSelectedEntity(entity)
    setModalSearchQuery('')
    setModalPage(1)
    setModalVisible(true)
  }

  // Get patients list for the selected entity (doctor or other channel) inside the modal
  const baseModalPatientsData = useMemo(() => {
    if (!selectedEntity) return []

    if (modalType === 'doctor') {
      if (!useSampleData) {
        return backendModalPatients.map((pat) => {
          const typeUpper = pat.serviceType?.toUpperCase() || ''
          return {
            ...pat,
            name: pat.patientName || pat.name,
            serviceDate: pat.dateOfVisit || pat.serviceDate,
            patientMobileNumber: pat.contactNumber || pat.patientMobileNumber || pat.mobileNumber || '—',
            status: pat.status || 'Scheduled',
            totalAmount: pat.totalCost || 0,
            totalPaid: pat.paidAmount !== undefined ? pat.paidAmount : (pat.paid || 0),
            balanceAmount: pat.pendingAmount !== undefined ? pat.pendingAmount : (pat.pending || 0),
            packageName: typeUpper === 'PACKAGE' ? (pat.serviceName || pat.packageName) : undefined,
            programName: typeUpper === 'PROGRAM' ? (pat.serviceName || pat.programName) : undefined,
            therapyName: typeUpper === 'THERAPY' ? (pat.serviceName || pat.therapyName) : undefined,
            exerciseName: typeUpper === 'EXERCISE' ? (pat.serviceName || pat.exerciseName) : undefined,
            serviceName: pat.serviceName,
          }
        })
      }
      return filteredBookings.filter(
        (b) =>
          b.doctorRefCode === selectedEntity.referralId ||
          String(b.doctorRefCode) === String(selectedEntity.id),
      )
    } else {
      return filteredBookings.filter((b) => {
        if (b.doctorRefCode !== 'OTHER') return false
        const type = b.referredByType || ''

        if (selectedEntity.channel === 'Family') {
          return type.startsWith('Family')
        }
        if (selectedEntity.channel === 'Friend') {
          return type === 'Friend'
        }
        return type === selectedEntity.channel
      })
    }
  }, [selectedEntity, modalType, filteredBookings, useSampleData, backendModalPatients])

  const modalPatientsData = useMemo(() => {
    const q = modalSearchQuery.toLowerCase().trim()
    if (!q) return baseModalPatientsData
    return baseModalPatientsData.filter((pat) =>
      (pat.name && pat.name.toLowerCase().includes(q)) ||
      (pat.patientMobileNumber && pat.patientMobileNumber.includes(q))
    )
  }, [baseModalPatientsData, modalSearchQuery])

  const paginatedModalData = useMemo(() => {
    const start = (modalPage - 1) * modalPageSize
    return modalPatientsData.slice(start, start + modalPageSize)
  }, [modalPatientsData, modalPage, modalPageSize])

  // Handle open channel details sub-page (Friend/Family)
  const handleOpenChannelDetails = (chanName) => {
    setSelectedChannel(chanName)
    setViewMode('details')

    if (chanName === 'Family') {
      setSelectedSubRelation('All')
      setSelectedFamilyMember('All')
    } else {
      setSelectedSubRelation('')
      setSelectedFamilyMember('')
    }
  }

  // Get unique family members for the dropdown based on selected relation
  const uniqueFamilyMembers = useMemo(() => {
    if (selectedChannel !== 'Family') return []
    const membersMap = new Map()
    filteredBookings.forEach((b) => {
      if (
        b.doctorRefCode === 'OTHER' &&
        b.referredByType &&
        b.referredByType.startsWith('Family') &&
        b.referredByName
      ) {
        // If a relation is selected, only show members of that relation
        if (
          selectedSubRelation &&
          selectedSubRelation !== 'All' &&
          b.referredByType !== selectedSubRelation
        ) {
          return
        }
        const nameKey = b.referredByName.trim().toLowerCase()
        const typeKey = b.referredByType.trim().toLowerCase()
        const key = `${nameKey}|${typeKey}`
        if (!membersMap.has(key)) {
          membersMap.set(key, {
            name: b.referredByName,
            type: b.referredByType,
            displayName: `${capitalizeWords(b.referredByName)} (${b.referredByType.replace('Family ', '').replace('(', '').replace(')', '')})`,
          })
        }
      }
    })
    return Array.from(membersMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    )
  }, [filteredBookings, selectedChannel, selectedSubRelation])

  // Get patients list for details page (Friend/Family)
  const detailsPatientsData = useMemo(() => {
    if (!selectedChannel) return []

    if (!useSampleData) {
      // Map backend fields to the keys expected by the frontend JSX:
      const mappedData = backendChannelPatients.map((pat) => {
        const typeUpper = pat.serviceType?.toUpperCase() || ''
        return {
          ...pat,
          name: pat.patientName || pat.name,
          serviceDate: pat.dateOfVisit || pat.serviceDate,
          patientMobileNumber: pat.contactNumber || pat.patientMobileNumber || pat.mobileNumber || '—',
          status: pat.status || 'Scheduled',
          totalAmount: pat.totalCost || 0,
          totalPaid: pat.paidAmount !== undefined ? pat.paidAmount : (pat.paid || 0),
          balanceAmount: pat.pendingAmount !== undefined ? pat.pendingAmount : (pat.pending || 0),
          packageName: typeUpper === 'PACKAGE' ? (pat.serviceName || pat.packageName) : undefined,
          programName: typeUpper === 'PROGRAM' ? (pat.serviceName || pat.programName) : undefined,
          therapyName: typeUpper === 'THERAPY' ? (pat.serviceName || pat.therapyName) : undefined,
          exerciseName: typeUpper === 'EXERCISE' ? (pat.serviceName || pat.exerciseName) : undefined,
          serviceName: pat.serviceName,
        }
      })

      // Apply sub-filters on the mapped backend data:
      return mappedData.filter((b) => {
        const type = b.referredByType || ''
        if (selectedChannel === 'Family') {
          if (selectedSubRelation && selectedSubRelation !== 'All') {
            if (type !== selectedSubRelation) return false
          }
          if (selectedFamilyMember && selectedFamilyMember !== 'All') {
            const [name, relType] = selectedFamilyMember.split('|')
            return (
              b.referredByName &&
              b.referredByName.toLowerCase() === name.toLowerCase() &&
              b.referredByType &&
              b.referredByType.toLowerCase() === relType.toLowerCase()
            )
          }
        }
        return true
      })
    }

    return filteredBookings.filter((b) => {
      if (b.doctorRefCode !== 'OTHER') return false
      const type = b.referredByType || ''

      if (selectedChannel === 'Family') {
        if (selectedSubRelation && selectedSubRelation !== 'All') {
          if (type !== selectedSubRelation) return false
        }
        if (selectedFamilyMember && selectedFamilyMember !== 'All') {
          const [name, relType] = selectedFamilyMember.split('|')
          return (
            b.referredByName &&
            b.referredByName.toLowerCase() === name.toLowerCase() &&
            b.referredByType &&
            b.referredByType.toLowerCase() === relType.toLowerCase()
          )
        }
        return type.startsWith('Family')
      }
      if (selectedChannel === 'Friend') {
        return type === 'Friend'
      }
      return type === selectedChannel
    })
  }, [selectedChannel, selectedSubRelation, selectedFamilyMember, filteredBookings, useSampleData, backendChannelPatients])

  const searchedDetailsData = useMemo(() => {
    const q = detailsSearchQuery.toLowerCase().trim()
    if (!q) return detailsPatientsData
    return detailsPatientsData.filter((pat) =>
      (pat.name && pat.name.toLowerCase().includes(q)) ||
      (pat.patientMobileNumber && pat.patientMobileNumber.includes(q))
    )
  }, [detailsPatientsData, detailsSearchQuery])

  const paginatedDetailsData = useMemo(() => {
    const start = (detPage - 1) * detPageSize
    return searchedDetailsData.slice(start, start + detPageSize)
  }, [searchedDetailsData, detPage, detPageSize])

  // Reset pagination when dependencies change
  useEffect(() => { setDocPage(1) }, [searchQuery, filter, fromDate, toDate])
  useEffect(() => { setChanPage(1) }, [channelSearchQuery, filter, fromDate, toDate])
  useEffect(() => { setDetPage(1) }, [detailsSearchQuery, selectedChannel, selectedSubRelation, selectedFamilyMember, filter, fromDate, toDate])




  return (
    <>
      {/* ── Page Header & Filters ── */}
      <div className="rf-page-header">
        <div className="rf-title-group">
          <div className="rf-page-icon">
            <Users size={20} />
          </div>
          <div>
            <h4 className="rf-page-title">Referral Analytics ({branchName})</h4>
            <p className="rf-page-sub">
              Track patient acquisitions by referral doctors and channels
            </p>
          </div>
        </div>


      </div>



      {/* 
      {useSampleData && (
        <div className="rf-sample-banner mb-4">
          <ShieldAlert size={16} className="text-warning mr-2" />
          <span>
            Showing <strong>Interactive Sample Data</strong>. Registered doctors are mapped, but
            demo appointments are simulated to showcase full UI capability.
          </span>
        </div>
      )} */}

      {/* ── Summary Cards ── */}
      <div className="rf-stat-grid mb-4">
        {[
          {
            label: "Total Referrals",
            value: stats.total,
            caption: "All patient bookings this period",
            gradient: "linear-gradient(135deg, #1e6fba 0%, #185fa5 100%)",
            glow: "rgba(24,95,165,0.22)",
            icon: <Users size={20} color="#fff" />,
          },
          {
            label: "Doctor Referrals",
            value: stats.doctorReferrals,
            caption: `${stats.total > 0 ? Math.round((stats.doctorReferrals / stats.total) * 100) : 0}% of total`,
            gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
            glow: "rgba(21,128,61,0.22)",
            icon: <Award size={20} color="#fff" />,
          },
          {
            label: "Other Channels",
            value: stats.otherReferrals,
            caption: `${stats.total > 0 ? Math.round((stats.otherReferrals / stats.total) * 100) : 0}% of total`,
            gradient: "linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)",
            glow: "rgba(107,33,168,0.22)",
            icon: <Share2 size={20} color="#fff" />,
          },
          {
            label: "Top Referring Doctor",
            value: stats.topDocName,
            caption: `${stats.maxDocCount} patient${stats.maxDocCount !== 1 ? 's' : ''} referred`,
            gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            glow: "rgba(180,83,9,0.22)",
            icon: <UserPlus size={20} color="#fff" />,
            isName: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rf-stat-pc"
            style={{ "--rp-gradient": card.gradient, "--rp-glow": card.glow }}
          >
            <div className="rf-pc-blob" />
            <div className="rf-pc-top">
              <div className="rf-pc-icon">{card.icon}</div>
            </div>
            <div className={`rf-pc-value${card.isName ? ' rf-pc-value-name' : ''}`} title={card.isName ? card.value : undefined}>
              {card.value}
            </div>
            <div className="rf-pc-label">{card.label}</div>
            <div className="rf-pc-caption">{card.caption}</div>
          </div>
        ))}
      </div>

      {/* ── Loading State ── */}
      {loading ? (
        <LoadingIndicator message="Loading referral analytics..." />
      ) : (
        <>
          {/* ── Unified Toolbar: Search + Date Filters + Charts/Table Toggle ── */}
          {viewMode === 'list' && (
            <div className="rf-toolbar-row mb-4">
              <div className="rf-toolbar-left">
                <div className="rf-search-pill">
                  <Search size={14} className="rf-search-icon" />
                  <input
                    type="text"
                    placeholder="Search name, doctor, therapy..."
                    value={activeTab === 'doctors' ? searchQuery : channelSearchQuery}
                    onChange={(e) => {
                      if (activeTab === 'doctors') setSearchQuery(e.target.value)
                      else setChannelSearchQuery(e.target.value)
                    }}
                    className="rf-search-pill-input"
                  />
                  {(activeTab === 'doctors' ? searchQuery : channelSearchQuery) && (
                    <button
                      className="rf-search-clear"
                      onClick={() =>
                        activeTab === 'doctors' ? setSearchQuery('') : setChannelSearchQuery('')
                      }
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="rf-filter-group d-flex align-items-center gap-2">
                  {['today', 'week', 'month', 'year', 'custom'].map((f) => (
                    <button
                      key={f}
                      className={`rf-filter-pill${filter === f ? ' active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}

                  {filter === 'custom' && (
                    <div className="d-flex align-items-center gap-2 ms-2" style={{ animation: 'fadeIn 0.2s ease' }}>
                      <span className="rf-date-sep text-muted small" style={{ fontSize: '11px', fontWeight: 600 }}>From:</span>
                      <CFormInput
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="rf-date-input"
                        style={{ width: '130px', padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                      <span className="rf-date-sep text-muted small" style={{ fontSize: '11px', fontWeight: 600 }}>To:</span>
                      <CFormInput
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="rf-date-input"
                        style={{ width: '130px', padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                      <button
                        className="rf-apply-btn"
                        onClick={fetchData}
                        style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', background: '#3b6d11', color: '#fff', border: 'none' }}
                      >
                        <RefreshCw size={10} className="mr-1" /> Reload
                      </button>
                      {(fromDate || toDate) && (
                        <button
                          className="rf-custom-clear"
                          onClick={() => { setFromDate(''); setToDate('') }}
                          title="Clear dates"
                          style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          <X size={10} /> Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rf-segmented-toggle">
                <button
                  className={`rf-segment-btn${displayMode === 'charts' ? ' active' : ''}`}
                  onClick={() => setDisplayMode('charts')}
                >
                  <LayoutGrid size={14} />
                  Charts
                </button>
                <button
                  className={`rf-segment-btn${displayMode === 'table' ? ' active' : ''}`}
                  onClick={() => setDisplayMode('table')}
                >
                  <Table2 size={14} />
                  Table
                </button>
              </div>
            </div>
          )}

          {/* ── Charts Row ── */}
          {viewMode === 'list' && displayMode === 'charts' && stats.total > 0 && (
            <CRow className="mb-4">
              <CCol xs={12} lg={4} className="mb-3">
                <CCard className="h-100 rf-chart-card">
                  <CCardBody className="p-3">
                    <div className="rf-chart-header">
                      <PieChartIcon size={16} className="text-success" />
                      <span>Referral Source Split</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={referralSourceChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {referralSourceChartData.map((entry, index) => (
                            <Cell
                              key={`src-cell-${index}`}
                              fill={index === 0 ? '#3b6d11' : '#185fa5'}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} patients`, '']} />
                        <Legend
                          verticalAlign="bottom"
                          height={30}
                          wrapperStyle={{ fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol xs={12} lg={4} className="mb-3">
                <CCard className="h-100 rf-chart-card">
                  <CCardBody className="p-3">
                    <div className="rf-chart-header">
                      <BarChart3 size={16} className="text-success" />
                      <span>Top Referring Doctors</span>
                    </div>
                    {topDoctorsChartData.length === 0 ? (
                      <div className="rf-chart-empty">No doctor referrals in this period</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={topDoctorsChartData}
                          layout="vertical"
                          margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip formatter={(value) => [`${value} patients`, 'Referred']} />
                          <Bar dataKey="patients" fill="#3b6d11" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol xs={12} lg={4} className="mb-3">
                <CCard className="h-100 rf-chart-card">
                  <CCardBody className="p-3">
                    <div className="rf-chart-header">
                      <Share2 size={16} className="text-success" />
                      <span>Channel Breakdown</span>
                    </div>
                    {channelPieChartData.length === 0 ? (
                      <div className="rf-chart-empty">No channel referrals in this period</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={channelPieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {channelPieChartData.map((entry, index) => (
                              <Cell
                                key={`chan-cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} patients`, name]} />
                          <Legend
                            verticalAlign="bottom"
                            height={40}
                            wrapperStyle={{ fontSize: '10.5px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}

          {viewMode === 'list' && displayMode === 'charts' && stats.total === 0 && (
            <div className="rf-empty mb-4">
              <BarChart3 size={32} className="rf-empty-icon" />
              <p className="mb-0 mt-2 font-weight-bold">No data to chart</p>
              <p className="text-muted small">Try a different date filter or switch to Table View.</p>
            </div>
          )}

          {/* ── Tabs Navigation ── */}
          {/* ── Tabs Navigation ── */}
          {viewMode === 'list' && displayMode === 'table' && (
            <CCard className="mb-4 rf-tabs-card">
              <CCardBody className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <LoadingIndicator message="Loading table data..." />
                  </div>
                ) : (
                  <>
                    <CNav variant="tabs" className="rf-nav-tabs">
                      <CNavItem>
                        <CNavLink
                          active={activeTab === 'doctors'}
                          onClick={() => setActiveTab('doctors')}
                          className="rf-nav-link"
                        >
                          Referred by Doctors ({searchedDoctorTableData.length})
                        </CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink
                          active={activeTab === 'channels'}
                          onClick={() => setActiveTab('channels')}
                          className="rf-nav-link"
                        >
                          Other Referral Channels (
                          {searchedChannelsTableData.filter((c) => c.patientCount > 0).length})
                        </CNavLink>
                      </CNavItem>
                    </CNav>

                    <CTabContent className="p-3">
                      {/* 🩺 Tab 1: Doctors */}
                      {activeTab === 'doctors' && (
                        <div>
                          {/* Result count */}
                          <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3">
                            <div className="text-muted small">
                              Showing {searchedDoctorTableData.length} of {activeDoctors.length} doctors
                            </div>
                          </div>

                          {/* Table */}
                          <div className="rf-table-wrapper">
                            <CTable className="rf-table">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell className="rf-th" style={{ width: 60 }}>
                                    S.No
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th">Doctor Name</CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th">
                                    Clinic/Hospital Name
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th">Specialization</CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th">Contact Info</CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th text-center">
                                    Patients Referred
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th text-right">
                                    Revenue Generated
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th text-center" style={{ width: 100 }}>
                                    Actions
                                  </CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>

                              <CTableBody>
                                {searchedDoctorTableData.length === 0 ? (
                                  <CTableRow>
                                    <CTableDataCell colSpan={8}>
                                      <div className="rf-empty">
                                        <Users size={32} className="rf-empty-icon" />
                                        <p className="mb-0 mt-2 font-weight-bold">
                                          No referring doctors found
                                        </p>
                                        <p className="text-muted small">
                                          Try adjusting your search or add refer doctors in Doctor
                                          Management.
                                        </p>
                                      </div>
                                    </CTableDataCell>
                                  </CTableRow>
                                ) : (
                                  paginatedDoctorData.map((doc, idx) => (
                                    <CTableRow key={doc.id || idx} className="rf-tr">
                                      <CTableDataCell className="rf-td rf-td-num">{(docPage - 1) * docPageSize + idx + 1}</CTableDataCell>
                                      <CTableDataCell className="rf-td font-weight-bold color-primary">
                                        {doc.fullName?.toLowerCase().startsWith('dr')
                                          ? capitalizeWords(doc.fullName)
                                          : `Dr. ${capitalizeWords(doc.fullName || '')}`}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-muted">
                                        {doc.currentHospitalName ? (
                                          <span>
                                            {capitalizeWords(doc.currentHospitalName)}
                                            {doc.branchname && (
                                              <span className="rf-clinic-tag ms-2">{doc.branchname}</span>
                                            )}
                                          </span>
                                        ) : (
                                          '—'
                                        )}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-muted">
                                        {doc.specialization || '—'}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-muted">
                                        {doc.mobileNumber || '—'}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-center font-weight-bold text-dark">
                                        <CBadge
                                          color={doc.patientCount > 0 ? 'success' : 'secondary'}
                                          className="rf-badge-count"
                                        >
                                          {doc.patientCount}
                                        </CBadge>
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-right font-weight-bold text-success">
                                        ₹{doc.revenue?.toLocaleString('en-IN') || 0}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-center">
                                        <button
                                          className="rf-action-btn"
                                          title="View patients referred"
                                          disabled={doc.patientCount === 0}
                                          onClick={() => handleOpenPatientsModal(doc, 'doctor')}
                                        >
                                          <Eye size={14} />
                                        </button>
                                      </CTableDataCell>
                                    </CTableRow>
                                  ))
                                )}
                              </CTableBody>
                            </CTable>
                          </div>
                          {searchedDoctorTableData.length > 0 && (
                            <div style={{ padding: '16px', borderTop: '1px solid #d0dce9', background: '#fff' }}>
                              <Pagination
                                currentPage={docPage}
                                totalPages={Math.max(1, Math.ceil(searchedDoctorTableData.length / docPageSize))}
                                pageSize={docPageSize}
                                onPageChange={setDocPage}
                                onPageSizeChange={setDocPageSize}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 📣 Tab 2: Channels */}
                      {activeTab === 'channels' && (
                        <div>
                          {/* Result count */}
                          <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-3">
                            <div className="text-muted small">
                              Showing {searchedChannelsTableData.length} of {otherChannelsTableData.length}{' '}
                              channels
                            </div>
                          </div>

                          <div className="rf-table-wrapper">
                            <CTable className="rf-table">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell className="rf-th" style={{ width: 60 }}>
                                    S.No
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th">Referral Channel</CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th text-center">
                                    Patients Referred
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th text-right">
                                    Revenue Generated
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="rf-th text-center" style={{ width: 100 }}>
                                    Actions
                                  </CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>

                              <CTableBody>
                                {searchedChannelsTableData.length === 0 ? (
                                  <CTableRow>
                                    <CTableDataCell colSpan={5}>
                                      <div className="rf-empty">
                                        <Share2 size={32} className="rf-empty-icon" />
                                        <p className="mb-0 mt-2 font-weight-bold">
                                          No channel referrals found
                                        </p>
                                      </div>
                                    </CTableDataCell>
                                  </CTableRow>
                                ) : (
                                  paginatedChannelsData.map((chan, idx) => (
                                    <CTableRow key={chan.channel} className="rf-tr">
                                      <CTableDataCell className="rf-td rf-td-num">{(chanPage - 1) * chanPageSize + idx + 1}</CTableDataCell>
                                      <CTableDataCell
                                        className={`rf-td font-weight-bold ${chan.patientCount > 0
                                          ? 'rf-clickable-channel'
                                          : 'color-primary'
                                          }`}
                                        onClick={() => {
                                          if (chan.patientCount > 0) {
                                            handleOpenChannelDetails(chan.channel)
                                          }
                                        }}
                                      >
                                        {chan.channel}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-center font-weight-bold text-dark">
                                        <CBadge
                                          color={chan.patientCount > 0 ? 'info' : 'secondary'}
                                          className="rf-badge-count"
                                        >
                                          {chan.patientCount}
                                        </CBadge>
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-right font-weight-bold text-success">
                                        ₹{chan.revenue?.toLocaleString('en-IN') || 0}
                                      </CTableDataCell>
                                      <CTableDataCell className="rf-td text-center">
                                        <button
                                          className="rf-action-btn info-btn"
                                          title="View channel patients"
                                          disabled={chan.patientCount === 0}
                                          onClick={() => handleOpenChannelDetails(chan.channel)}
                                        >
                                          <Eye size={14} />
                                        </button>
                                      </CTableDataCell>
                                    </CTableRow>
                                  ))
                                )}
                              </CTableBody>
                            </CTable>
                          </div>
                          {searchedChannelsTableData.length > 0 && (
                            <div style={{ padding: '16px', borderTop: '1px solid #d0dce9', background: '#fff' }}>
                              <Pagination
                                currentPage={chanPage}
                                totalPages={Math.max(1, Math.ceil(searchedChannelsTableData.length / chanPageSize))}
                                pageSize={chanPageSize}
                                onPageChange={setChanPage}
                                onPageSizeChange={setChanPageSize}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CTabContent>
                  </>
                )}
              </CCardBody>
            </CCard>
          )}

          {/* ── Sub-Page: Detailed Channel Referrals (Friend/Family) ── */}
          {viewMode === 'details' && (
            <CCard
              className="rf-main-card mb-4"
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #cbd5e1',
              }}
            >
              <CCardBody className="p-4">
                {/* Header with Back button and Filter Dropdown */}
                <div
                  className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3"
                  style={{ borderBottom: '1px solid #e2e8f0' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <CButton
                      color="light"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="d-flex align-items-center gap-1 font-weight-bold text-muted"
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px' }}
                    >
                      &larr; Back to Overview
                    </CButton>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0c447c', margin: 0 }}>
                      {selectedChannel} Referral Channels
                    </h4>
                  </div>

                  {selectedChannel === 'Family' && (
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small font-weight-bold">Filter Relation:</span>
                        <CFormSelect
                          value={selectedSubRelation}
                          onChange={(e) => {
                            setSelectedSubRelation(e.target.value)
                            setSelectedFamilyMember('All')
                          }}
                          style={{
                            width: '180px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          <option value="All">All Family Relations</option>
                          <option value="Family (Mother)">Mother</option>
                          <option value="Family (Father)">Father</option>
                          <option value="Family (Brother)">Brother</option>
                          <option value="Family (Sister)">Sister</option>
                          <option value="Family (Spouse)">Spouse</option>
                          <option value="Family (Cousin)">Cousin</option>
                          <option value="Family (Other)">Other</option>
                        </CFormSelect>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small font-weight-bold">Select Family Member:</span>
                        <CFormSelect
                          value={selectedFamilyMember}
                          onChange={(e) => setSelectedFamilyMember(e.target.value)}
                          style={{
                            width: '220px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            border: '1px solid #cbd5e1',
                          }}
                        >
                          <option value="All">All Family Members</option>
                          {uniqueFamilyMembers.map((member) => (
                            <option
                              key={`${member.name}|${member.type}`}
                              value={`${member.name}|${member.type}`}
                            >
                              {member.displayName}
                            </option>
                          ))}
                        </CFormSelect>
                      </div>
                    </div>
                  )}

                  <div className="rf-search-pill" style={{ marginLeft: selectedChannel !== 'Family' ? 'auto' : '0' }}>
                    <Search size={14} className="rf-search-icon" />
                    <input
                      type="text"
                      placeholder="Search patient name, mobile..."
                      value={detailsSearchQuery}
                      onChange={(e) => setDetailsSearchQuery(e.target.value)}
                      className="rf-search-pill-input"
                      style={{ minWidth: '220px' }}
                    />
                    {detailsSearchQuery && (
                      <button
                        className="rf-search-clear"
                        onClick={() => setDetailsSearchQuery('')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Patients List Table */}
                {channelPatientsLoading ? (
                  <div className="text-center py-5">
                    <LoadingIndicator message="Loading referred patients..." />
                  </div>
                ) : detailsPatientsData.length === 0 ? (
                  <div className="text-center py-5">
                    <Users size={48} className="text-muted mb-3" />
                    <h5 className="font-weight-bold text-muted">No referrals recorded</h5>
                    <p className="text-muted small">
                      No patients match the selected relationship filter for this time range.
                    </p>
                  </div>
                ) : (
                  <div className="rf-table-wrapper border-0">
                    <CTable responsive className="rf-table">
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell
                            className="rf-m-th"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            S.No
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Patient Name
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Service Details
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Date of Visit
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Contact Number
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th text-center"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Status
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Referred By Person
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th text-right"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Total Cost
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th text-right"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Paid
                          </CTableHeaderCell>
                          <CTableHeaderCell
                            className="rf-m-th text-right"
                            style={{ background: '#eaf3de !important', color: '#3b6d11 !important' }}
                          >
                            Pending
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {paginatedDetailsData.map((pat, idx) => {
                          const isPackOrProg = pat.totalAmount !== undefined && pat.totalAmount > 0
                          const totalCost = isPackOrProg
                            ? pat.totalAmount
                            : Number(pat.servicecost || pat.consultationFee || 0)
                          const paidAmount = isPackOrProg
                            ? pat.totalPaid || 0
                            : pat.status === 'Completed'
                              ? totalCost
                              : 0
                          const pendingAmount = isPackOrProg
                            ? pat.balanceAmount || 0
                            : pat.status === 'Completed'
                              ? 0
                              : totalCost
                          const typeLabel = getBookingType(pat)

                          // Type badge color mapping
                          const badgeColors = {
                            Package: 'info',
                            Program: 'primary',
                            Therapy: 'success',
                            Exercise: 'warning',
                            Consultation: 'secondary',
                          }
                          const badgeColor = badgeColors[typeLabel] || 'secondary'

                          return (
                            <CTableRow key={pat.id || idx} className="rf-tr">
                              <CTableDataCell className="rf-td rf-td-num">{(detPage - 1) * detPageSize + idx + 1}</CTableDataCell>
                              <CTableDataCell className="rf-td font-weight-bold color-primary">
                                {pat.name}
                              </CTableDataCell>
                              <CTableDataCell className="rf-td">
                                <div className="font-weight-bold text-dark">
                                  {getBookingServiceName(pat)}
                                </div>
                                <CBadge
                                  color={badgeColor}
                                  style={{ fontSize: '10px', padding: '3px 6px', marginTop: '4px' }}
                                >
                                  {typeLabel}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-muted">
                                {pat.serviceDate}
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-muted">
                                {pat.patientMobileNumber || pat.mobileNumber || '—'}
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-center">
                                <CBadge
                                  color={
                                    pat.status === 'Completed'
                                      ? 'success'
                                      : pat.status === 'Cancelled'
                                        ? 'danger'
                                        : 'warning'
                                  }
                                  className="rf-status-badge"
                                >
                                  {pat.status || 'Scheduled'}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-muted">
                                {formatReferredByPerson(pat)}
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-right font-weight-bold text-dark">
                                ₹{totalCost.toLocaleString('en-IN')}
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-right font-weight-bold text-success">
                                ₹{paidAmount.toLocaleString('en-IN')}
                              </CTableDataCell>
                              <CTableDataCell className="rf-td text-right font-weight-bold text-danger">
                                ₹{pendingAmount.toLocaleString('en-IN')}
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
                {searchedDetailsData.length > 0 && (
                  <div style={{ padding: '16px', borderTop: '1px solid #d0dce9', background: '#fff', marginTop: '12px', borderRadius: '8px' }}>
                    <Pagination
                      currentPage={detPage}
                      totalPages={Math.max(1, Math.ceil(searchedDetailsData.length / detPageSize))}
                      pageSize={detPageSize}
                      onPageChange={setDetPage}
                      onPageSizeChange={setDetPageSize}
                    />
                  </div>
                )}
              </CCardBody>
            </CCard>
          )}

          {/* ── Modal: Referred Patients List ── */}
          <CModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            size="lg"
            backdrop="static"
            className="rf-patients-modal"
          >
            <CModalHeader style={{ borderBottom: '1px solid #d0dce9', padding: '16px 20px' }}>
              <CModalTitle
                className="d-flex align-items-center gap-2"
                style={{ fontSize: 16, fontWeight: 600, color: '#0c447c', flex: 1 }}
              >
                <Users size={18} className="text-success" />
                Referred Patients:{' '}
                {modalType === 'doctor'
                  ? selectedEntity?.fullName?.toLowerCase().startsWith('dr')
                    ? capitalizeWords(selectedEntity.fullName)
                    : `Dr. ${capitalizeWords(selectedEntity?.fullName || '')}`
                  : selectedEntity?.channel}
              </CModalTitle>
              <div className="rf-search-pill" style={{ margin: 0, minWidth: '220px' }}>
                <Search size={14} className="rf-search-icon" />
                <input
                  type="text"
                  placeholder="Search patient name, mobile..."
                  value={modalSearchQuery}
                  onChange={(e) => {
                    setModalSearchQuery(e.target.value)
                    setModalPage(1)
                  }}
                  className="rf-search-pill-input"
                />
                {modalSearchQuery && (
                  <button
                    className="rf-search-clear"
                    onClick={() => {
                      setModalSearchQuery('')
                      setModalPage(1)
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </CModalHeader>
            <CModalBody className="p-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {modalLoading ? (
                <div className="text-center py-5">
                  <LoadingIndicator message="Loading referred patients..." />
                </div>
              ) : modalPatientsData.length === 0 ? (
                <div className="text-center py-4">
                  <Users size={32} className="text-muted mb-2" />
                  <p className="mb-0">No patients recorded in this time range.</p>
                </div>
              ) : (
                <div className="rf-table-wrapper border-0 shadow-none">
                  <CTable responsive className="rf-modal-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell className="rf-m-th">S.No</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th">Patient Name</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th">Service Details</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th">Date of Visit</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th">Contact Number</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th text-center">Status</CTableHeaderCell>
                        {modalType === 'channel' && (
                          <CTableHeaderCell className="rf-m-th">Referred By Person</CTableHeaderCell>
                        )}
                        <CTableHeaderCell className="rf-m-th text-right">Total Cost</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th text-right">Paid</CTableHeaderCell>
                        <CTableHeaderCell className="rf-m-th text-right">Pending</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {paginatedModalData.map((pat, idx) => {
                        const isPackOrProg = pat.totalAmount !== undefined && pat.totalAmount > 0
                        const totalCost = isPackOrProg
                          ? pat.totalAmount
                          : Number(pat.servicecost || pat.consultationFee || 0)
                        const paidAmount = isPackOrProg
                          ? pat.totalPaid || 0
                          : pat.status === 'Completed'
                            ? totalCost
                            : 0
                        const pendingAmount = isPackOrProg
                          ? pat.balanceAmount || 0
                          : pat.status === 'Completed'
                            ? 0
                            : totalCost
                        const typeLabel = getBookingType(pat)

                        // Type badge color mapping
                        const badgeColors = {
                          Package: 'info',
                          Program: 'primary',
                          Therapy: 'success',
                          Exercise: 'warning',
                          Consultation: 'secondary',
                        }
                        const badgeColor = badgeColors[typeLabel] || 'secondary'

                        return (
                          <CTableRow key={pat.id || idx} className="rf-tr">
                            <CTableDataCell className="rf-td rf-td-num">{(modalPage - 1) * modalPageSize + idx + 1}</CTableDataCell>
                            <CTableDataCell className="rf-td font-weight-bold color-primary">
                              {pat.name}
                            </CTableDataCell>
                            <CTableDataCell className="rf-td">
                              <div className="font-weight-bold text-dark">
                                {getBookingServiceName(pat)}
                              </div>
                              <CBadge
                                color={badgeColor}
                                style={{ fontSize: '10px', padding: '3px 6px', marginTop: '4px' }}
                              >
                                {typeLabel}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="rf-td text-muted">
                              {pat.serviceDate}
                            </CTableDataCell>
                            <CTableDataCell className="rf-td text-muted">
                              {pat.patientMobileNumber || pat.mobileNumber || '—'}
                            </CTableDataCell>
                            <CTableDataCell className="rf-td text-center">
                              <CBadge
                                color={
                                  pat.status === 'Completed'
                                    ? 'success'
                                    : pat.status === 'Cancelled'
                                      ? 'danger'
                                      : 'warning'
                                }
                                className="rf-status-badge"
                              >
                                {pat.status || 'Scheduled'}
                              </CBadge>
                            </CTableDataCell>
                            {modalType === 'channel' && (
                              <CTableDataCell className="rf-td text-muted">
                                {formatReferredByPerson(pat)}
                              </CTableDataCell>
                            )}
                            <CTableDataCell className="rf-td text-right font-weight-bold text-dark">
                              ₹{totalCost.toLocaleString('en-IN')}
                            </CTableDataCell>
                            <CTableDataCell className="rf-td text-right font-weight-bold text-success">
                              ₹{paidAmount.toLocaleString('en-IN')}
                            </CTableDataCell>
                            <CTableDataCell className="rf-td text-right font-weight-bold text-danger">
                              ₹{pendingAmount.toLocaleString('en-IN')}
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                </div>
              )}
              {modalPatientsData.length > 0 && (
                <div style={{ padding: '16px', borderTop: '1px solid #d0dce9', background: '#fff', marginTop: '12px', borderRadius: '8px' }}>
                  <Pagination
                    currentPage={modalPage}
                    totalPages={Math.max(1, Math.ceil(modalPatientsData.length / modalPageSize))}
                    pageSize={modalPageSize}
                    onPageChange={setModalPage}
                    onPageSizeChange={setModalPageSize}
                  />
                </div>
              )}
            </CModalBody>
            <CModalFooter style={{ borderTop: '1px solid #d0dce9', padding: '12px 16px' }}>
              <CButton color="secondary" onClick={() => setModalVisible(false)} size="sm">
                Close
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}

      {/* ── CUSTOM VANILLA STYLING (always rendered) ── */}
      <style>{`
        /* Page Header */
        .rf-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .rf-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rf-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #eaf3de;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b6d11;
          flex-shrink: 0;
        }
        .rf-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .rf-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .rf-actions-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Live vs Sample Toggle */
        .rf-toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        .rf-toggle-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          user-select: none;
        }
        .rf-toggle-label.active {
          color: #0c447c;
        }
        .rf-toggle-switch {
          position: relative;
          width: 32px;
          height: 18px;
          background-color: #cbd5e1;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
          transition: background-color 0.2s;
        }
        .rf-toggle-switch.checked {
          background-color: #3b6d11;
        }
        .rf-toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #ffffff;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .rf-toggle-switch.checked .rf-toggle-slider {
          transform: translateX(14px);
        }

        /* Filter Pills */
        .rf-filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rf-filter-pill {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .rf-filter-pill:hover { border-color: #0c447c; color: #0c447c; }
        .rf-filter-pill.active {
          background: #0c447c;
          color: #fff;
          border-color: #0c447c;
        }

        /* Custom Date Range Row */
        .rf-custom-row {
          padding: 12px 16px;
          background: #f8fafc;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
        }
        .rf-date-input {
          font-size: 12px !important;
          border: 0.5px solid #d0dce9 !important;
          border-radius: 6px !important;
          width: auto !important;
          display: inline-block !important;
          height: 30px !important;
          padding: 2px 8px !important;
        }
        .rf-date-sep {
          font-size: 12px;
          font-weight: 500;
        }
        .rf-apply-btn {
          background: #3b6d11;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }
        .rf-apply-btn:hover { background: #2e7d32; }

        /* Sample Data Banner */
        .rf-sample-banner {
          display: flex;
          align-items: center;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 8px;
          padding: 10px 14px;
          color: #b45309;
          font-size: 12px;
        }

        /* ─── Stats Cards – premium gradient redesign ─── */
        .rf-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 1100px) { .rf-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px)  { .rf-stat-grid { grid-template-columns: 1fr; } }

        .rf-stat-pc {
          background: var(--rp-gradient);
          border-radius: 16px;
          padding: 18px 18px 14px;
          display: flex; flex-direction: column; gap: 5px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px var(--rp-glow), 0 1px 4px rgba(0,0,0,0.08);
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .rf-stat-pc:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px var(--rp-glow), 0 2px 8px rgba(0,0,0,0.10);
        }
        .rf-pc-blob {
          position: absolute; top: -28px; right: -28px;
          width: 90px; height: 90px;
          background: rgba(255,255,255,0.12); border-radius: 50%;
          pointer-events: none;
        }
        .rf-pc-blob::after {
          content: ''; position: absolute; top: 22px; left: 22px;
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.10); border-radius: 50%;
        }
        .rf-pc-top { margin-bottom: 4px; }
        .rf-pc-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .rf-pc-value {
          font-size: 26px; font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -0.5px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .rf-pc-value-name {
          font-size: 14px; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rf-pc-label {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.78);
          text-transform: uppercase; letter-spacing: 0.7px;
        }
        .rf-pc-caption {
          font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px;
        }

        .rf-custom-clear {
          display: inline-flex; align-items: center; gap: 4px;
          border: none; background: #fef2f2; color: #a32d2d;
          border-radius: 20px; padding: 4px 10px; font-size: 11px;
          font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .rf-custom-clear:hover { background: #fee2e2; }

        /* Stats Cards (legacy, still used elsewhere) */
        .rf-stat-card {
          border: 1px solid #d0dce9 !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .rf-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        }
        .rf-stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          flex-shrink: 0;
        }
        .rf-stat-icon-wrapper.blue { background: #e6f1fb; color: #185fa5; }
        .rf-stat-icon-wrapper.green { background: #eaf3de; color: #3b6d11; }
        .rf-stat-icon-wrapper.purple { background: #f3e8ff; color: #6b21a8; }
        .rf-stat-icon-wrapper.orange { background: #fef3c7; color: #b45309; }

        .rf-stat-value {
          color: #0c447c;
          font-size: 1.4rem;
        }

        /* Unified Toolbar Row */
        .rf-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .rf-toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Search Pill (toolbar) */
        .rf-search-pill {
          position: relative;
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #d0dce9;
          border-radius: 20px;
          padding: 0 12px 0 32px;
          height: 36px;
          width: 240px;
        }
        .rf-search-pill .rf-search-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }
        .rf-search-pill-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          width: 100%;
          height: 100%;
          color: #1e293b;
        }
        .rf-search-pill-input::placeholder {
          color: #94a3b8;
        }
        .rf-search-pill .rf-search-clear {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        /* Segmented Toggle (Charts / Table) */
        .rf-segmented-toggle {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
        }
        .rf-segment-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: #64748b;
          border: none;
          border-radius: 7px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .rf-segment-btn:hover:not(.active) {
          color: #185fa5;
        }
        .rf-segment-btn.active {
          background: #fff;
          color: #185fa5;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* Chart Cards */
        .rf-chart-card {
          border: 1px solid #d0dce9 !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
        }
        .rf-chart-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #0c447c;
          margin-bottom: 8px;
        }
        .rf-chart-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 220px;
          color: #94a3b8;
          font-size: 12.5px;
          text-align: center;
        }

        /* Tabs Card */
        .rf-tabs-card {
          border: 1px solid #d0dce9 !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02) !important;
          overflow: hidden;
        }
        .rf-nav-tabs {
          background: #f8fafc;
          border-bottom: 1px solid #d0dce9 !important;
        }
        .rf-nav-link {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #64748b !important;
          border: none !important;
          border-bottom: 3px solid transparent !important;
          padding: 12px 20px !important;
          border-radius: 0 !important;
          cursor: pointer;
        }
        .rf-nav-link.active {
          color: #3b6d11 !important;
          background: #fff !important;
          border-bottom-color: #3b6d11 !important;
        }

        /* Search input */
        .rf-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 320px;
        }
        .rf-search-icon {
          position: absolute;
          left: 10px;
          color: #94a3b8;
        }
        .rf-search-input {
          width: 100%;
          padding: 6px 30px 6px 30px;
          font-size: 12.5px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s;
        }
        .rf-search-input:focus {
          border-color: #3b6d11;
        }
        .rf-search-clear {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        /* Tables styling */
        .rf-table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .rf-table {
          margin-bottom: 0 !important;
          font-size: 12.5px;
        }
        .rf-th {
          background: var(--color-primary) !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 12px 14px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          white-space: nowrap;
        }
        .rf-tr {
          transition: background 0.12s;
        }
        .rf-tr:hover {
          background: #fdf3f3 !important;
        }
        .rf-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .rf-td-num {
          color: #94a3b8;
        }
        .color-primary {
          color: #0c447c;
        }
        .rf-clinic-tag {
          font-size: 11.5px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 2px 8px;
          border-radius: 12px;
          display: inline-block;
        }
        .rf-badge-count {
          padding: 4px 10px !important;
          font-size: 11.5px !important;
          border-radius: 10px !important;
          font-weight: 600 !important;
        }

        /* Action Buttons */
        .rf-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: #eaf3de;
          color: #3b6d11;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s, background-color 0.12s;
        }
        .rf-action-btn.info-btn {
          background: #e0f3f8;
          color: #0c7b93;
        }
        .rf-action-btn:hover:not(:disabled) {
          transform: scale(1.08);
          filter: brightness(0.95);
        }
        .rf-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .rf-clickable-channel {
          cursor: pointer;
          color: #3b6d11 !important;
          transition: color 0.15s;
        }
        .rf-clickable-channel:hover {
          color: #2e7d32 !important;
          text-decoration: underline;
        }

        /* Modal styling */
        .rf-patients-modal .modal-content {
          border-radius: 12px !important;
          overflow: hidden;
          border: none !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        .rf-m-th {
          background: var(--color-primary) !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 10px 12px !important;
          border-bottom: 1px solid #d0dce9 !important;
        }
        .rf-modal-table {
          font-size: 12px;
          margin-bottom: 0 !important;
        }
        .rf-status-badge {
          font-size: 10.5px !important;
          padding: 3px 8px !important;
          font-weight: 500 !important;
        }

        /* Empty State */
        .rf-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 10px;
          text-align: center;
        }
        .rf-empty-icon {
          color: #cbd5e1;
        }
      `}</style>
    </>
  )
}

export default ReferralAnalytics
