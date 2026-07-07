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
} from 'lucide-react'
import { getAllReferDoctors, GetBookingByClinicIdData } from './ReferralAnalyticsAPI'
import capitalizeWords from '../../Utils/capitalizeWords'
import LoadingIndicator from '../../Utils/loader'

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
  return 'General Consultation'
}

const ReferralAnalytics = () => {
  const [filter, setFilter] = useState('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [activeTab, setActiveTab] = useState('doctors')
  const [viewMode, setViewMode] = useState('list')
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [selectedSubRelation, setSelectedSubRelation] = useState('')
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('All')

  // Data State
  const [referDoctors, setReferDoctors] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [useSampleData, setUseSampleData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState(null) // Doctor or Channel object
  const [modalType, setModalType] = useState('doctor') // 'doctor' or 'channel'

  const hospitalId = localStorage.getItem('HospitalId')

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
        const res = await GetBookingByClinicIdData(hospitalId)
        bookingsList = res.data || []
        setBookings(bookingsList)
      }

      // Check if real referral data exists in the database
      const hasRealReferrals = bookingsList.some((b) => b.doctorRefCode && b.doctorRefCode !== '')

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
    fetchData()
  }, [])

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

    filteredBookings.forEach((b) => {
      // Find if matched with a registered doctor
      const isDocReferral = b.doctorRefCode && b.doctorRefCode !== 'OTHER' && b.doctorRefCode !== ''

      if (isDocReferral) {
        doctorReferrals++
        doctorCounts[b.doctorRefCode] = (doctorCounts[b.doctorRefCode] || 0) + 1
        total++
      } else if (b.doctorRefCode === 'OTHER') {
        otherReferrals++
        const chanName = b.referredByType || 'Other'
        channelCounts[chanName] = (channelCounts[chanName] || 0) + 1
        total++
      }
    })

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
    const topDocName = topDoc ? capitalizeWords(topDoc.fullName) : 'None'

    return {
      total,
      doctorReferrals,
      otherReferrals,
      topDocName,
      maxDocCount,
      doctorCounts,
      channelCounts,
    }
  }, [filteredBookings, activeDoctors])

  // Process Referral Doctor Table Data
  const referralDoctorTableData = useMemo(() => {
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
  }, [activeDoctors, stats.doctorCounts, filteredBookings])

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

  // Process Other Channels Table Data
  const otherChannelsTableData = useMemo(() => {
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
  }, [filteredBookings])

  // Handle open modal showing patient list
  const handleOpenPatientsModal = (entity, type) => {
    setModalType(type)
    setSelectedEntity(entity)
    setModalVisible(true)
  }

  // Get patients list for the selected entity (doctor or other channel) inside the modal
  const modalPatientsData = useMemo(() => {
    if (!selectedEntity) return []

    if (modalType === 'doctor') {
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
  }, [selectedEntity, modalType, filteredBookings])

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
  }, [selectedChannel, selectedSubRelation, selectedFamilyMember, filteredBookings])

  if (loading) return <LoadingIndicator message="Loading Referral Analytics..." />

  return (
    <>
      {/* ── Page Header & Filters ── */}
      <div className="rf-page-header">
        <div className="rf-title-group">
          <div className="rf-page-icon">
            <Users size={20} />
          </div>
          <div>
            <h4 className="rf-page-title">Referral Analytics</h4>
            <p className="rf-page-sub">
              Track patient acquisitions by referral doctors and channels
            </p>
          </div>
        </div>

        <div className="rf-actions-group">
          {/* Real vs Sample Data Toggle */}
          <div className="rf-toggle-wrapper mr-2">
            <span className={`rf-toggle-label ${!useSampleData ? 'active' : ''}`}>Live</span>
            <button
              className={`rf-toggle-switch ${useSampleData ? 'checked' : ''}`}
              onClick={() => setUseSampleData(!useSampleData)}
              title="Toggle Live / Sample Data"
            >
              <span className="rf-toggle-slider" />
            </button>
            <span className={`rf-toggle-label ${useSampleData ? 'active' : ''}`}>Sample</span>
          </div>

          <div className="rf-filter-group">
            {['today', 'week', 'month', 'custom'].map((f) => (
              <button
                key={f}
                className={`rf-filter-pill${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filter === 'custom' && (
        <div className="rf-custom-row mb-4">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="rf-date-sep text-muted">From:</span>
            <CFormInput
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rf-date-input"
            />
            <span className="rf-date-sep text-muted">To:</span>
            <CFormInput
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rf-date-input"
            />
            <button className="rf-apply-btn" onClick={fetchData}>
              <RefreshCw size={12} className="mr-1" /> Reload
            </button>
          </div>
        </div>
      )}

      {useSampleData && (
        <div className="rf-sample-banner mb-4">
          <ShieldAlert size={16} className="text-warning mr-2" />
          <span>
            Showing <strong>Interactive Sample Data</strong>. Registered doctors are mapped, but
            demo appointments are simulated to showcase full UI capability.
          </span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} md={3} className="mb-3">
          <CCard className="h-100 rf-stat-card">
            <CCardBody className="d-flex align-items-center p-3">
              <div className="rf-stat-icon-wrapper blue">
                <Users size={22} />
              </div>
              <div>
                <p className="text-muted small mb-0 font-weight-bold">Total Referrals</p>
                <h4 className="mb-0 font-weight-bold rf-stat-value">{stats.total}</h4>
                <span className="text-muted small">All patient bookings</span>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} sm={6} md={3} className="mb-3">
          <CCard className="h-100 rf-stat-card">
            <CCardBody className="d-flex align-items-center p-3">
              <div className="rf-stat-icon-wrapper green">
                <Award size={22} />
              </div>
              <div>
                <p className="text-muted small mb-0 font-weight-bold">Doctor Referrals</p>
                <h4 className="mb-0 font-weight-bold rf-stat-value">{stats.doctorReferrals}</h4>
                <span className="text-success small font-weight-bold">
                  {stats.total > 0 ? Math.round((stats.doctorReferrals / stats.total) * 100) : 0}%
                </span>
                <span className="text-muted small"> of total referrals</span>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} sm={6} md={3} className="mb-3">
          <CCard className="h-100 rf-stat-card">
            <CCardBody className="d-flex align-items-center p-3">
              <div className="rf-stat-icon-wrapper purple">
                <Share2 size={22} />
              </div>
              <div>
                <p className="text-muted small mb-0 font-weight-bold">Other Channels</p>
                <h4 className="mb-0 font-weight-bold rf-stat-value">{stats.otherReferrals}</h4>
                <span className="text-purple small font-weight-bold">
                  {stats.total > 0 ? Math.round((stats.otherReferrals / stats.total) * 100) : 0}%
                </span>
                <span className="text-muted small"> of total referrals</span>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} sm={6} md={3} className="mb-3">
          <CCard className="h-100 rf-stat-card">
            <CCardBody className="d-flex align-items-center p-3">
              <div className="rf-stat-icon-wrapper orange">
                <UserPlus size={22} />
              </div>
              <div>
                <p className="text-muted small mb-0 font-weight-bold">Top Referring Doctor</p>
                <h4
                  className="mb-0 font-weight-bold rf-stat-value text-truncate"
                  style={{ maxWidth: '160px', fontSize: '1.15rem' }}
                >
                  {stats.topDocName}
                </h4>
                <span className="text-warning small font-weight-bold">
                  {stats.maxDocCount} patients
                </span>
                <span className="text-muted small"> referred</span>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ── Tabs Navigation ── */}
      {viewMode === 'list' && (
        <CCard className="mb-4 rf-tabs-card">
          <CCardBody className="p-0">
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
                  {otherChannelsTableData.filter((c) => c.patientCount > 0).length})
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="p-3">
              {/* 🩺 Tab 1: Doctors */}
              {activeTab === 'doctors' && (
                <div>
                  {/* Search doctors */}
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div className="rf-search-wrapper">
                      <Search size={14} className="rf-search-icon" />
                      <input
                        type="text"
                        placeholder="Search doctors by name, clinic, specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rf-search-input"
                      />
                      {searchQuery && (
                        <button className="rf-search-clear" onClick={() => setSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
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
                          searchedDoctorTableData.map((doc, idx) => (
                            <CTableRow key={doc.id || idx} className="rf-tr">
                              <CTableDataCell className="rf-td rf-td-num">{idx + 1}</CTableDataCell>
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
                </div>
              )}

              {/* 📣 Tab 2: Channels */}
              {activeTab === 'channels' && (
                <div>
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
                        {otherChannelsTableData.length === 0 ? (
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
                          otherChannelsTableData.map((chan, idx) => (
                            <CTableRow key={chan.channel} className="rf-tr">
                              <CTableDataCell className="rf-td rf-td-num">{idx + 1}</CTableDataCell>
                              <CTableDataCell
                                className={`rf-td font-weight-bold ${
                                  (chan.channel === 'Family' || chan.channel === 'Friend') &&
                                  chan.patientCount > 0
                                    ? 'rf-clickable-channel'
                                    : 'color-primary'
                                }`}
                                onClick={() => {
                                  if (
                                    (chan.channel === 'Family' || chan.channel === 'Friend') &&
                                    chan.patientCount > 0
                                  ) {
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
                                  onClick={() => {
                                    if (chan.channel === 'Family' || chan.channel === 'Friend') {
                                      handleOpenChannelDetails(chan.channel)
                                    } else {
                                      handleOpenPatientsModal(chan, 'channel')
                                    }
                                  }}
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
                </div>
              )}
            </CTabContent>
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
                      <option value="Family (Mother)">Family (Mother)</option>
                      <option value="Family (Father)">Family (Father)</option>
                      <option value="Family (Brother)">Family (Brother)</option>
                      <option value="Family (Sister)">Family (Sister)</option>
                      <option value="Family (Spouse)">Family (Spouse)</option>
                      <option value="Family (Cousin)">Family (Cousin)</option>
                      <option value="Family (Other)">Family (Other)</option>
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
            </div>

            {/* Patients List Table */}
            {detailsPatientsData.length === 0 ? (
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
                    {detailsPatientsData.map((pat, idx) => {
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
                          <CTableDataCell className="rf-td rf-td-num">{idx + 1}</CTableDataCell>
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
            style={{ fontSize: 16, fontWeight: 600, color: '#0c447c' }}
            className="d-flex align-items-center gap-2"
          >
            <Users size={18} className="text-success" />
            Referred Patients:{' '}
            {modalType === 'doctor'
              ? selectedEntity?.fullName?.toLowerCase().startsWith('dr')
                ? capitalizeWords(selectedEntity.fullName)
                : `Dr. ${capitalizeWords(selectedEntity?.fullName || '')}`
              : selectedEntity?.channel}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-3" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {modalPatientsData.length === 0 ? (
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
                  {modalPatientsData.map((pat, idx) => {
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
                        <CTableDataCell className="rf-td rf-td-num">{idx + 1}</CTableDataCell>
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
        </CModalBody>
        <CModalFooter style={{ borderTop: '1px solid #d0dce9', padding: '12px 16px' }}>
          <CButton color="secondary" onClick={() => setModalVisible(false)} size="sm">
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── CUSTOM VANILLA STYLING ── */}
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
        .rf-filter-pill:hover { border-color: #3b6d11; color: #3b6d11; }
        .rf-filter-pill.active {
          background: #3b6d11;
          color: #fff;
          border-color: #3b6d11;
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

        /* Stats Cards */
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
          background: #f8fafc !important;
          color: #475569 !important;
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
          background: #f8fafc !important;
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
          background: #eaf3de !important;
          color: #3b6d11 !important;
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
