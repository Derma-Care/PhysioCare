import React, { useMemo, useState } from 'react'
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
    CButton
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../Utils/Pagination'
const data = [
    {
        id: "Kar-Mad-2026-0022",
        patient: "Mr.Banavath Prashanth",
        mobile: "7842259803",
        doctor: "Dr. Kaleeswaran",
        paymentType: "Not Paid",
        visitType: "First Visit",
        date: "2026-04-15",
        time: "4:00 PM",
        status: "Pending",
        followUpStatus: "Pending"
    },
    {
        id: "Kar-Mad-2026-0023",
        patient: "Ramesh Kumar",
        mobile: "9876543210",
        doctor: "Dr. Arun",
        paymentType: "Paid",
        visitType: "First Visit",
        date: "2026-04-16",
        time: "10:30 AM",
        status: "Confirmed",
        followUpStatus: "Pending"
    },
    {
        id: "Kar-Mad-2026-0024",
        patient: "Sita Devi",
        mobile: "9123456780",
        doctor: "Dr. Kaleeswaran",
        paymentType: "Paid",
        visitType: "Follow-up",
        date: "2026-04-17",
        time: "11:00 AM",
        status: "Due for Investigation",
        followUpStatus: "Pending"
    },
    {
        id: "Kar-Mad-2026-0025",
        patient: "Rajesh",
        mobile: "9988776655",
        doctor: "Dr. Meena",
        paymentType: "Paid",
        visitType: "Follow-up",
        date: "2026-04-18",
        time: "2:00 PM",
        status: "Investigation Done",
        followUpStatus: "Pending"
    },
    {
        id: "Kar-Mad-2026-0026",
        patient: "Kumar",
        mobile: "9000011111",
        doctor: "Dr. Arun",
        paymentType: "Package",
        visitType: "Follow-up",
        date: "2026-04-19",
        time: "5:00 PM",
        status: "In Progress",
        followUpStatus: "Pending"
    },
    {
        id: "Kar-Mad-2026-0027",
        patient: "Anjali",
        mobile: "9555512345",
        doctor: "Dr. Kaleeswaran",
        paymentType: "Follow-up",
        visitType: "Follow-up",
        date: "2026-04-20",
        time: "3:30 PM",
        status: "Follow-up",
        followUpStatus: "Pending"
    },
    {
        id: "Kar-Mad-2026-0028",
        patient: "Mahesh",
        mobile: "9666612345",
        doctor: "Dr. Meena",
        paymentType: "Closed",
        visitType: "Follow-up",
        date: "2026-04-21",
        time: "1:00 PM",
        status: "Completed",
        followUpStatus: "Pending"
    }
]

const followUpStatus = [
    'All',
    'Pending',
    'Confirmed',
    // 'Due for Investigation',
    'Investigation Done',
    // 'In Progress',
    'Follow-up Needed',
    'Cancelled',
    'Rescheduled',
    'Drop',
    'No Reply',
    'No Follow-up',
    // 'No Calls',
    'Completed'
]

export default function FollowupDashboard() {


    const navigate = useNavigate()
    const today = '2026-04-15'
    const next7 = '2026-04-21'

    const [rows, setRows] = useState(data)
    const [filter, setFilter] = useState('All')
    const [fromDate, setFromDate] = useState(today)
    const [toDate, setToDate] = useState(today)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const list = useMemo(() => {
        return rows.filter((row) => {
            const matchStatus =
                filter === 'All' || row.status === filter

            const matchDate =
                row.date >= fromDate && row.date <= toDate

            return matchStatus && matchDate
        })
    }, [rows, filter, fromDate, toDate])

    const updateStatus = (id, value) => {
        setRows(
            rows.map((r) =>
                r.id === id ? { ...r, status: value } : r
            )
        )
    }

    const getColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'warning'
            case 'Confirmed':
                return 'info'
            case 'Due for Investigation':
                return 'danger'
            case 'Investigation Done':
                return 'primary'
            case 'In Progress':
                return 'success'
            case 'Follow-up':
                return 'secondary'
            case 'Follow-up Needed':
                return 'secondary'
            case 'Cancelled':
                return 'danger'
            case 'Rescheduled':
                return 'dark'
            case 'Drop':
                return 'dark'
            case 'No Reply':
                return 'secondary'
            case 'No Follow-up':
                return 'warning'
            case 'No Calls':
                return 'dark'
            case 'Completed':
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
        <CContainer fluid className="mt-4">
            <h2
                className="mb-4 fw-bold"
                style={{ color: 'var(--color-black)' }}
            >
                Follow-up Dashboard
            </h2>

            {/* Cards */}
            <CRow className="mb-4" >
                <CCol md={3} >
                    <CCard style={{ color: 'var(--color-black)' }}>
                        <CCardBody>
                            <CCardTitle>Today</CCardTitle>
                            <h3>
                                {
                                    rows.filter(
                                        (x) => x.date === today
                                    ).length
                                }
                            </h3>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md={3}>
                    <CCard style={{ color: 'var(--color-black)' }}>
                        <CCardBody>
                            <CCardTitle>7 Days</CCardTitle>
                            <h3>{list.length}</h3>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md={3}>
                    <CCard style={{ color: 'var(--color-black)' }}>
                        <CCardBody>
                            <CCardTitle>Pending</CCardTitle>
                            <h3>
                                {
                                    list.filter(
                                        (x) => x.status === 'Pending'
                                    ).length
                                }
                            </h3>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol md={3}>
                    <CCard style={{ color: 'var(--color-black)' }} >
                        <CCardBody>
                            <CCardTitle>In Progress</CCardTitle>
                            <h3>
                                {
                                    list.filter(
                                        (x) => x.status === 'In Progress'
                                    ).length
                                }
                            </h3>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            {/* Filters */}
            <CRow className="mb-3" style={{ color: 'var(--color-black)' }}>
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
                        max={next7}
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
            </CRow>

            {/* Table */}
            <CTable
                hover
                responsive
                bordered
                className="pink-table"
            >
                <CTableHead color="light">
                    <CTableRow>
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
                    {todayBookings.map((row) => (
                        <CTableRow key={row.id}>
                            <CTableDataCell>{row.id}</CTableDataCell>
                            <CTableDataCell>{row.date}</CTableDataCell>
                            <CTableDataCell>{row.time}</CTableDataCell>
                            <CTableDataCell>{row.patient}</CTableDataCell>
                            <CTableDataCell>{row.mobile}</CTableDataCell>
                            <CTableDataCell>{row.doctor}</CTableDataCell>
                            <CTableDataCell>{row.paymentType}</CTableDataCell>
                            <CTableDataCell>{row.visitType}</CTableDataCell>

                            <CTableDataCell>
                                <CBadge color={getColor(row.status)}>
                                    {row.status}
                                </CBadge>
                            </CTableDataCell>

                            <CTableDataCell>
                                <CFormSelect
                                    size="sm"
                                    value={row.followUpStatus}
                                    onChange={(e) =>
                                        updateFollowUpStatus(
                                            row.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    {followUpStatus.slice(1).map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </CFormSelect>
                            </CTableDataCell>
                            <CTableDataCell>
                                <CButton
                                    size="sm"
                                    style={{
                                        backgroundColor: "var(--color-bgcolor)",
                                        color: "var(--color-black)"
                                    }}
                                    onClick={() =>
                                        navigate(
                                            row.status === "In Progress"
                                                ? `/program-payment/${row.id}`
                                                : `/appointment-details/${row.id}`
                                        )
                                    }
                                >
                                    View
                                </CButton>
                            </CTableDataCell>

                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>
            {todayBookings.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(todayBookings.length / pageSize)}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                />
            )}
        </CContainer>
    )
}