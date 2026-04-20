import React, { useEffect, useMemo, useState } from 'react'
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardTitle,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge,
    CFormSelect,
    CFormInput,
    CFormLabel,
    CButton, CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormTextarea
} from '@coreui/react'


import { useNavigate } from 'react-router-dom'
import Pagination from '../../Utils/Pagination'
import { getBookingsTodayFollowUps, getUpcomingFollowUps, getDateRangeFollowUps } from '../../APIs/GetFollowUpApi'
import { bookingUpdate } from './appointmentAPI'
import LoadingIndicator from '../../Utils/loader'
import capitalizeWords from '../../Utils/capitalizeWords'
import BookAppointmentModal from './BookAppointmentModal '
import axios from 'axios'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'

import { BASE_URL } from '../../baseUrl'
// const data = [
//     {
//         id: "Kar-Mad-2026-0022",
//         patient: "Mr.Banavath Prashanth",
//         mobile: "7842259803",
//         doctor: "Dr. Kaleeswaran",
//         paymentType: "Not Paid",
//         visitType: "First Visit",
//         date: "2026-04-15",
//         time: "4:00 PM",
//         status: "Pending",
//         followUpStatus: "Pending"
//     },
//     {
//         id: "Kar-Mad-2026-0023",
//         patient: "Ramesh Kumar",
//         mobile: "9876543210",
//         doctor: "Dr. Arun",
//         paymentType: "Paid",
//         visitType: "First Visit",
//         date: "2026-04-16",
//         time: "10:30 AM",
//         status: "Confirmed",
//         followUpStatus: "Pending"
//     },
//     {
//         id: "Kar-Mad-2026-0024",
//         patient: "Sita Devi",
//         mobile: "9123456780",
//         doctor: "Dr. Kaleeswaran",
//         paymentType: "Paid",
//         visitType: "Follow-up",
//         date: "2026-04-17",
//         time: "11:00 AM",
//         status: "Due for Investigation",
//         followUpStatus: "Pending"
//     },
//     {
//         id: "Kar-Mad-2026-0025",
//         patient: "Rajesh",
//         mobile: "9988776655",
//         doctor: "Dr. Meena",
//         paymentType: "Paid",
//         visitType: "Follow-up",
//         date: "2026-04-18",
//         time: "2:00 PM",
//         status: "Investigation Done",
//         followUpStatus: "Pending"
//     },
//     {
//         id: "Kar-Mad-2026-0026",
//         patient: "Kumar",
//         mobile: "9000011111",
//         doctor: "Dr. Arun",
//         paymentType: "Package",
//         visitType: "Follow-up",
//         date: "2026-04-19",
//         time: "5:00 PM",
//         status: "In Progress",
//         followUpStatus: "Pending"
//     },
//     {
//         id: "Kar-Mad-2026-0027",
//         patient: "Anjali",
//         mobile: "9555512345",
//         doctor: "Dr. Kaleeswaran",
//         paymentType: "Follow-up",
//         visitType: "Follow-up",
//         date: "2026-04-20",
//         time: "3:30 PM",
//         status: "Follow-up",
//         followUpStatus: "Pending"
//     },
//     {
//         id: "Kar-Mad-2026-0028",
//         patient: "Mahesh",
//         mobile: "9666612345",
//         doctor: "Dr. Meena",
//         paymentType: "Closed",
//         visitType: "Follow-up",
//         date: "2026-04-21",
//         time: "1:00 PM",
//         status: "Completed",
//         followUpStatus: "Pending"
//     }
// ]

const followUpStatus = [
    'All',
    'Pending',
    'Confirmed',
    'Due for Investigation',
    'Investigation Done',
    // 'In-Progress',
    'Follow-up Needed',
    'Cancelled',
    'Rescheduled',
    'Drop',
    'No Reply',
    // 'No Follow-up',
    // 'No Calls',
    'Completed'
]

export default function FollowupDashboard() {


    const navigate = useNavigate()


    const [activeCard, setActiveCard] = useState("today")

    const [rows, setRows] = useState([])
    const [filter, setFilter] = useState('All')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [todayCount, setTodayCount] = useState(0)
    const [weekCount, setWeekCount] = useState(0)
    const [confirmedCount, setConfirmedCount] = useState(0)
    const [inProgressCount, setInProgressCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const role = localStorage.getItem('role')
    const [visible, setVisible] = useState(false)
const [showReasonModal, setShowReasonModal] = useState(false);
const [selectedRow, setSelectedRow] = useState(null);
    // Add these states inside component
    const [reasonModal, setReasonModal] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("")
    const [reason, setReason] = useState("")
    const [newDate, setNewDate] = useState("")
    const [newTime, setNewTime] = useState("")
    const { searchQuery } = useGlobalSearch()
    // Replace updatePaymentStatus function with this
    // ADD STATES
    const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
    const [selectedDate, setSelectedDate] = useState("")
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [showAllSlots, setShowAllSlots] = useState(false)


    // FETCH SLOTS WHEN RESCHEDULE CLICK
   const updatePaymentStatus = async (
  bookingId,
  status,
  row,
  reason,
  newDate,
  newTime
) => {
  const payload = {
    bookingId,
    followupStatus: status.toLowerCase(),
    reason
  };

  if (status === "Rescheduled") {
    payload.serviceDate = newDate;
    payload.servicetime = newTime;
  }

  await bookingUpdate(payload);
};


    // CHANGE DROPDOWN CALL



    // FETCH SLOT FUNCTION
    const fetchSlots = async (doctorId, branchId) => {
        try {
            setLoadingSlots(true)

            const hospitalId = localStorage.getItem("HospitalId")

            const response = await axios.get(
                `${BASE_URL}/getDoctorSlots/${hospitalId}/${branchId}/${doctorId}`
            )

            if (response.data.success) {
                setSlotsForSelectedDate(response.data.data || [])
            } else {
                setSlotsForSelectedDate([])
            }
        } catch (error) {
            console.error(error)
            setSlotsForSelectedDate([])
        } finally {
            setLoadingSlots(false)
        }
    }


    // FILTER SLOT LOGIC
    const now = new Date()

    const slotsToShow = (slotsForSelectedDate || [])
        .filter(
            (s) =>
                new Date(s.day || s.date).toDateString() ===
                new Date(newDate).toDateString()
        )
        .flatMap((s) => s.availableSlots || [])
        .filter((slotObj) => {
            const slotDate = new Date(newDate)

            const [time, meridian] = slotObj.slot.split(" ")
            let [hours, minutes] = time.split(":").map(Number)

            if (meridian === "PM" && hours !== 12) hours += 12
            if (meridian === "AM" && hours === 12) hours = 0

            slotDate.setHours(hours, minutes, 0, 0)

            const isToday =
                new Date(newDate).toDateString() === now.toDateString()

            if (isToday) return slotDate > now
            return true
        })

    const sortedSlots = slotsToShow.sort((a, b) => {
        const parseTime = (slot) => {
            const [time, meridian] = slot.slot.split(" ")
            let [hours, minutes] = time.split(":").map(Number)

            if (meridian === "PM" && hours !== 12) hours += 12
            if (meridian === "AM" && hours === 12) hours = 0

            return hours * 60 + minutes
        }

        return parseTime(a) - parseTime(b)
    })

    const visibleSlots = showAllSlots
        ? sortedSlots
        : sortedSlots.slice(0, 12)
    // Add submit function
    const submitReasonUpdate = async () => {
        try {
            const payload = {
                bookingId: selectedBookingId,
                followupStatus: selectedStatus.toLowerCase(),
                reason: reason
            }

            if (selectedStatus === "Rescheduled") {
                payload.serviceDate = newDate
                payload.servicetime = newTime
            }

            await bookingUpdate(payload)

            setReasonModal(false)
            getTodayFollowUps()
        } catch (err) {
            console.error(err)
        }
    }
    // useEffect(() => {
    //     getTodayFollowUps()
    // }, [])
    useEffect(() => {
        getTodayFollowUps()
        // loadWeekCountOnly()
    }, [])

    const getTodayFollowUps = async () => {
        setLoading(true)
        try {
            const res = await getBookingsTodayFollowUps()

            if (res.status === 200) {
                const todayData = Array.isArray(res?.data?.data)
                    ? res.data.data
                    : []

                setRows(todayData)
                setTodayCount(todayData.length)
                setConfirmedCount(
                    todayData.filter(
                        x => (x.status || "").toLowerCase() === "confirmed"
                    ).length
                )

                setInProgressCount(
                    todayData.filter(
                        x => (x.status || "").toLowerCase() === "in progress"
                    ).length
                )
            } else {
                setRows([])
            }
        } catch (err) {
            console.error(err)
            setRows([])
        } finally {
            setLoading(false)
        }
    }
    const getUpcomingAppointments = async () => {
        setLoading(true)
        try {
            const res = await getUpcomingFollowUps()

            if (res.status === 200) {
                const weekData = Array.isArray(res?.data?.data)
                    ? res.data.data
                    : []

                setRows(weekData)

                setWeekCount(weekData.length)

                setConfirmedCount(
                    weekData.filter(
                        x => (x.status || "").toLowerCase() === "confirmed"
                    ).length
                )

                setInProgressCount(
                    weekData.filter(
                        x => (x.status || "").toLowerCase() === "in progress"
                    ).length
                )

            } else {
                setRows([])
            }
        } catch (error) {
            console.error(error)
            setRows([])
        } finally {
            setLoading(false)
        }
    }

    const getDateRangeAppointments = async () => {
        if (!fromDate || !toDate) return;
        console.log(fromDate, toDate)
        setLoading(true);
        try {
            const res = await getDateRangeFollowUps(
                fromDate,
                toDate
            );

            const data = Array.isArray(res?.data?.data)
                ? res.data.data
                : Array.isArray(res?.data)
                    ? res.data
                    : [];

            setRows(data);
            setCurrentPage(1);
        } catch (error) {
            console.error(error);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };
    // const updatePaymentStatus = async (bookingId, status) => {
    //     console.log(`Updating booking ${bookingId} with payment type: ${status}`);
    //     try {
    //         await bookingUpdate({ bookingId, followupStatus: status.toLowerCase() }) // Assuming bookingUpdate accepts an object with these properties

    //         getTodayFollowUps()

    //     } catch (err) {
    //         console.error("Payment update failed", err);
    //     }
    // };

    // const list = useMemo(() => {
    //     return rows.filter((row) => {
    //         const matchStatus =
    //             filter === "All" || row.status === filter

    //         const matchDate =
    //             row.date >= fromDate &&
    //             row.date <= toDate

    //         return matchStatus && matchDate
    //     })
    // }, [rows, filter, fromDate, toDate])
    useEffect(() => {
        if (fromDate && toDate) {
            getDateRangeAppointments();
        }
    }, [fromDate, toDate]);
    const list = useMemo(() => {
        return rows.filter((row) => {
            const matchStatus =
                filter === "All" ||
                (row.followUpStatus || "").toLowerCase() === filter.toLowerCase() ||
                (row.status || "").toLowerCase() === filter.toLowerCase()

            const search = searchQuery.toLowerCase()

            const matchSearch =
                !search ||
                (row.bookingId || "").toLowerCase().includes(search) ||
                (row.name || "").toLowerCase().includes(search) ||
                (row.patientMobileNumber || "").toLowerCase().includes(search) ||
                (row.doctorName || "").toLowerCase().includes(search) ||
                (row.paymentType || "").toLowerCase().includes(search) ||
                (row.visitType || "").toLowerCase().includes(search) ||
                (row.status || "").toLowerCase().includes(search)

            return matchStatus && matchSearch
        })
    }, [rows, filter, searchQuery])
    const updateStatus = (id, value) => {
        setRows(
            rows.map((r) =>
                r.id === id ? { ...r, status: value } : r
            )
        )
    }

    const getColor = (status = '') => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning'

            case 'confirmed':
                return 'info'

            case 'due for investigation':
                return 'danger'

            case 'investigation done':
                return 'primary'

            case 'in-progress':
                return 'success'

            case 'follow-up':
            case 'follow-up needed':
                return 'secondary'

            case 'cancelled':
                return 'danger'

            case 'rescheduled':
            case 'drop':
            case 'no calls':
                return 'dark'

            case 'no reply':
                return 'secondary'

            // case 'no follow-up':
            //     return 'warning'

            case 'completed':
                return 'success'

            default:
                return 'light'
        }
    }
    const updateFollowUpStatus = (id, value) => {
        setRows(
            rows.map((r) => {
                if (r.id !== id) return r

                let newStatus = r.status

                if (
                    value === 'Rescheduled' ||
                    value === 'Cancelled' ||
                    value === 'Drop'
                ) {
                    newStatus = value
                }

                return {
                    ...r,
                    followUpStatus: value,
                    status: newStatus
                }
            })
        )
    }
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    const todayBookings = list.slice(startIndex, endIndex)

    return (
        <>
            {/* <CModalBody>
                <CFormInput
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mb-3"
                />

                {selectedStatus === "Rescheduled" && (
                    <>
                        <h6>Select Date</h6>

                       <div className="d-flex gap-2 flex-wrap mb-3">
  {(slotsForSelectedDate || [])
    .filter((s) => {
      const dateValue = s.day || s.date;
      const formattedDate = new Date(dateValue)
        .toISOString()
        .split("T")[0];

      const today = new Date().toISOString().split("T")[0];

      return formattedDate >= today; // ✅ only today & future
    })
    .map((s, idx) => {
      const dateValue = s.day || s.date;
      const formattedDate = new Date(dateValue)
        .toISOString()
        .split("T")[0];

      return (
        <CButton
          key={idx}
          color={newDate === formattedDate ? "primary" : "light"}
          onClick={() => {
            setNewDate(formattedDate);
            setNewTime("");
          }}
        >
          {formattedDate}
        </CButton>
      );
    })}
</div>

                        <h6>Select Time</h6>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4,1fr)",
                                gap: "8px"
                            }}
                        >
                            {visibleSlots.map((slotObj, i) => (
                                <div
                                    key={i}
                                    onClick={() =>
                                        !slotObj.slotbooked && setNewTime(slotObj.slot)
                                    }
                                    style={{
                                        padding: "8px",
                                        textAlign: "center",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                        cursor: slotObj.slotbooked
                                            ? "not-allowed"
                                            : "pointer",
                                        backgroundColor: slotObj.slotbooked
                                            ? "#f8d7da"
                                            : newTime === slotObj.slot
                                                ? "#0d6efd"
                                                : "#fff",
                                        color:
                                            newTime === slotObj.slot ? "#fff" : "#000"
                                    }}
                                >
                                    {slotObj.slot}
                                </div>
                            ))}
                        </div>

                        {sortedSlots.length > 12 && (
                            <div className="text-center mt-2">
                                <CButton
                                    size="sm"
                                    color="secondary"
                                    onClick={() => setShowAllSlots(!showAllSlots)}
                                >
                                    {showAllSlots ? "Show Less" : "Show More"}
                                </CButton>
                            </div>
                        )}
                    </>
                )}
            </CModalBody> */}

            <CContainer fluid  >


                {/* Cards */}
                <CRow className="mb-4 g-3">

                    {/* Today */}
                    <CCol md={3}>
                        <CCard
                            onClick={() => {
                                setActiveCard("today")
                                getTodayFollowUps()
                                setCurrentPage(1)
                            }}
                            style={{
                                cursor: "pointer",
                                textAlign: "center",
                                height: "85px",
                                borderRadius: "12px",
                                border:
                                    activeCard === "today"
                                        ? "2px solid var(--color-bgcolor)"
                                        : "1px solid #e5e5e5",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h6 className="mb-1 fw-semibold">Today</h6>
                                <h4 className="mb-0 fw-bold">{todayCount}</h4>
                            </div>
                        </CCard>
                    </CCol>

                    {/* 1 Week */}
                    <CCol md={3}>
                        <CCard
                            onClick={() => {
                                setActiveCard("upcoming")
                                getUpcomingAppointments()
                                setCurrentPage(1)
                            }}
                            style={{
                                cursor: "pointer",
                                textAlign: "center",
                                height: "85px",
                                borderRadius: "12px",
                                border:
                                    activeCard === "upcoming"
                                        ? "2px solid var(--color-bgcolor)"
                                        : "1px solid #e5e5e5",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h6 className="mb-1 fw-semibold">1 Week</h6>
                                <h4 className="mb-0 fw-bold">{weekCount}</h4>
                            </div>
                        </CCard>
                    </CCol>

                    {/* Pending */}
                    <CCol md={3}>
                        <CCard
                            style={{
                                textAlign: "center",
                                height: "85px",
                                borderRadius: "12px",
                                border: "1px solid #e5e5e5",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h6 className="mb-1 fw-semibold">Confirmed</h6>
                                <h4 className="mb-0 fw-bold">{confirmedCount}</h4>
                            </div>
                        </CCard>
                    </CCol>

                    {/* In Progress */}
                    <CCol md={3}>
                        <CCard
                            style={{
                                textAlign: "center",
                                height: "85px",
                                borderRadius: "12px",
                                border: "1px solid #e5e5e5",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h6 className="mb-1 fw-semibold">In Progress</h6>
                                <h4 className="mb-0 fw-bold">{inProgressCount}</h4>
                            </div>
                        </CCard>
                    </CCol>

                </CRow>
                {/* Filters */}
                <CRow className="mb-3 d-flex justify-content-center align-items-center align-content-center" style={{ color: 'var(--color-black)' }} >
                    <CCol md={3}>
                        <CFormInput
                            type="date"
                            label="From Date"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </CCol>

                    <CCol md={3}>
                        <CFormInput
                            type="date"
                            label="To Date"
                            value={toDate}

                            onChange={(e) => {
                                setToDate(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </CCol>

                    <CCol md={3}>
                        <div  >
                            <CFormSelect
                                value={filter}
                                label="Fiter By Status"
                                onChange={(e) => {
                                    setFilter(e.target.value)
                                    setCurrentPage(1)
                                }}
                            >
                                {followUpStatus.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </CFormSelect>
                        </div>
                    </CCol>
                    <CCol md={3} className='mt-4'>
                        {(role === 'admin' || role === 'receptionist') && (
                            <CButton
                                style={{
                                    backgroundColor: 'var(--color-black)',
                                    color: 'white',
                                }}
                                onClick={() => setVisible(true)}
                            >
                                Book Appointment
                            </CButton>
                        )}
                    </CCol>
                </CRow>
                <BookAppointmentModal visible={visible} onClose={() => setVisible(false)} />
                {/* Table */}
                <CTable
                    hover
                    responsive
                    bordered
                    className="pink-table"
                >
                    <CTableHead color="light">
                        <CTableRow>
                            <CTableHeaderCell>S.No</CTableHeaderCell>
                            <CTableHeaderCell>Booking Id</CTableHeaderCell>
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Time</CTableHeaderCell>
                            <CTableHeaderCell>Patient</CTableHeaderCell>
                            <CTableHeaderCell>Mobile</CTableHeaderCell>
                            <CTableHeaderCell>Doctor</CTableHeaderCell>
                            <CTableHeaderCell>Payment Type</CTableHeaderCell>
                            <CTableHeaderCell>Visit Type</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Update</CTableHeaderCell>
                            <CTableHeaderCell>Action</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>

                    <CTableBody>

                        {loading ? (
                            <CTableRow>
                                <CTableDataCell colSpan={12} className="text-center py-4">
                                    <LoadingIndicator message='Loading appointments...' />

                                </CTableDataCell>
                            </CTableRow>
                        ) : todayBookings.length === 0 ? (
                            <CTableRow>
                                <CTableDataCell colSpan={12} className="text-center py-4">
                                    No appointments found
                                </CTableDataCell>
                            </CTableRow>
                        ) : (
                            todayBookings.map((row, index) => (
                                <CTableRow key={row.bookingId}>
                                    <CTableDataCell>
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </CTableDataCell>

                                    <CTableDataCell>{row.bookingId}</CTableDataCell>
                                    <CTableDataCell>{row.serviceDate}</CTableDataCell>
                                    <CTableDataCell>{row.servicetime}</CTableDataCell>
                                    <CTableDataCell>{row.name}</CTableDataCell>
                                    <CTableDataCell>{row.patientMobileNumber}</CTableDataCell>
                                    <CTableDataCell>{row.doctorName}</CTableDataCell>
                                    <CTableDataCell>{row.paymentType}</CTableDataCell>
                                    <CTableDataCell>{capitalizeWords(row.visitType)}</CTableDataCell>

                                    <CTableDataCell>
                                        <CBadge color={getColor(row.status)}>
                                            {row.status}
                                        </CBadge>
                                    </CTableDataCell>

                                    <CTableDataCell>
                                       <CFormSelect
  size="sm"
  value={capitalizeWords(row.followUpStatus || row.followupStatus || "")}
 onChange={(e) => {
  const value = e.target.value;

  if (value === "Rescheduled" || value === "Cancelled") {
    setSelectedRow(row);
    setSelectedStatus(value);

    // 🔥 CALL SLOT API HERE
    if (value === "Rescheduled") {
      fetchSlots(row.doctorId, row.branchId);
    }

    setShowReasonModal(true);
  } else {
    updatePaymentStatus(row.bookingId, value, row);
  }
}}
>
  {followUpStatus.slice(1).map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
</CFormSelect>
                                    </CTableDataCell>

                                    <CTableDataCell>
                                        <CButton
                                            size="sm"
                                            style={{ backgroundColor: "var(--color-black)", color: "white" }}
                                            onClick={() =>
                                                navigate(`/appointment-details/${row.bookingId}`, {
                                                    state: { appointment: row }
                                                })
                                            }
                                        >
                                            View
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))
                        )}

                    </CTableBody>
                </CTable>
                {!loading && todayBookings.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(rows.length / pageSize)}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                )}
            </CContainer>
            <CModal
  visible={showReasonModal}
  onClose={() => setShowReasonModal(false)}
>
  <CModalHeader>
    <CModalTitle>Reason</CModalTitle>
  </CModalHeader>

 <CModalBody>

  {/* 🔹 Reason (for both) */}
  <CFormLabel>Reason</CFormLabel>
  <CFormTextarea
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    placeholder="Enter reason..."
    className="mb-3"
  />

  {/* 🔹 SHOW ONLY FOR RESCHEDULE */}
  {selectedStatus === "Rescheduled" && (
    <>
      <h6>Select Date</h6>

      <div className="d-flex gap-2 flex-wrap mb-3">
        {(slotsForSelectedDate || [])
          .filter((s) => {
            const dateValue = s.day || s.date;
            const formattedDate = new Date(dateValue)
              .toISOString()
              .split("T")[0];

            const today = new Date().toISOString().split("T")[0];
            return formattedDate >= today;
          })
          .map((s, idx) => {
            const dateValue = s.day || s.date;
            const formattedDate = new Date(dateValue)
              .toISOString()
              .split("T")[0];

            return (
              <CButton
                key={idx}
                color={newDate === formattedDate ? "primary" : "light"}
                onClick={() => {
                  setNewDate(formattedDate);
                  setNewTime("");
                }}
              >
                {formattedDate}
              </CButton>
            );
          })}
      </div>

      <h6>Select Time</h6>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "8px"
        }}
      >
        {visibleSlots.map((slotObj, i) => (
          <div
            key={i}
            onClick={() =>
              !slotObj.slotbooked && setNewTime(slotObj.slot)
            }
            style={{
              padding: "8px",
              textAlign: "center",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: slotObj.slotbooked ? "not-allowed" : "pointer",
              backgroundColor: slotObj.slotbooked
                ? "#f8d7da"
                : newTime === slotObj.slot
                ? "#0d6efd"
                : "#fff",
              color: newTime === slotObj.slot ? "#fff" : "#000"
            }}
          >
            {slotObj.slot}
          </div>
        ))}
      </div>
    </>
  )}

</CModalBody>

  <CModalFooter>
    {/* Cancel */}
    <CButton
      color="secondary"
      onClick={() => {
        setShowReasonModal(false);
        setReason("");
      }}
    >
      Cancel
    </CButton>

    {/* Save */}
    <CButton
     style={{ backgroundColor: "var(--color-black)", color: "white" }}
      onClick={() => {
        if (!reason.trim()) {
          alert("Reason is required");
          return;
        }

        // ✅ CALL API AFTER REASON ENTERED
        updatePaymentStatus(
          selectedRow.bookingId,
     selectedStatus ,
          selectedRow,
          reason,
          newDate,
  newTime
        );

        setShowReasonModal(false);
        setReason("");
      }}
    >
      Save
    </CButton>
  </CModalFooter>
</CModal>
        </>
    )
}