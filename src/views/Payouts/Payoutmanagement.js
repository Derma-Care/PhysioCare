import React, { useContext, useEffect, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useHospital } from '../Usecontext/HospitalContext'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import LoadingIndicator from '../../Utils/loader'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

// ✅ Dummy API methods
// replace these with your real API methods
const Get_AllPayoutsData = async () => {
  // simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            transactionId: 'TXN2025072801',
            bookingId: 'BKG9011',
            billingName: 'Ankit Sharma',
            amount: '₹2,499.00',
            paymentMethod: 'Credit Card (HDFC)',
            userEmail: 'ankit.sharma@example.com',
            userMobile: '9876543210',
            billingAddress: 'Flat 204, Prestige Towers, Koramangala, Bangalore, India - 560034',
          },
          {
            transactionId: 'TXN2025072802',
            bookingId: 'BKG9012',
            billingName: 'Priya Menon',
            amount: '₹3,200.00',
            paymentMethod: 'UPI (priya@ybl)',
            userEmail: 'priya.menon@example.com',
            userMobile: '9833012345',
            billingAddress: 'C-16, Orchid Residency, Andheri West, Mumbai, India - 400058',
          },
          {
            transactionId: 'TXN2025072803',
            bookingId: 'BKG9013',
            billingName: 'Rahul Verma',
            amount: '₹1,750.00',
            paymentMethod: 'Net Banking (SBI)',
            userEmail: 'rahul.v@example.com',
            userMobile: '9123456789',
            billingAddress: 'A-10, Gaur City, Sector 121, Noida, India - 201301',
          },
        ],
      })
    }, 2000) // 2s delay to simulate loading
  })
}

const postPayoutsData = async (data) => {
  // simulate post
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { ...data, bookingId: 'NEW-BKG' } })
    }, 500)
  })
}

const PayoutManagement = () => {
  // ✅ Sample initial data to show immediately in UI
  const samplePayouts = [
    {
      transactionId: 'TXN-1001',
      bookingId: 'BKG-001',
      billingName: 'Local User1',
      amount: '1200',
      paymentMethod: 'Cash',
      userEmail: 'local1@example.com',
      userMobile: '9876543210',
      billingAddress: 'Hyderabad, India',
    },
    {
      transactionId: 'TXN-1002',
      bookingId: 'BKG-002',
      billingName: 'Local User2',
      amount: '1800',
      paymentMethod: 'Card',
      userEmail: 'local2@example.com',
      userMobile: '9876543211',
      billingAddress: 'Mumbai, India',
    },
    {
      transactionId: 'TXN-1003',
      bookingId: 'BKG-003',
      billingName: 'Local User3',
      amount: '2000',
      paymentMethod: 'UPI',
      userEmail: 'local3@example.com',
      userMobile: '9876543212',
      billingAddress: 'Delhi, India',
    },
  ]

  const [payouts, setPayouts] = useState(samplePayouts) // ✅ start with sample data
  const [search, setSearch] = useState('')
  const [viewData, setViewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    transactionId: '',
    amount: '',
    paymentMethod: '',
    paymentStatus: '',
    userEmail: '',
    userMobile: '',
    billingName: '',
    billingAddress: '',
  })

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  // ✅ Fetch server payouts
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true)
        const result = await Get_AllPayoutsData()
        // Merge or replace sample data with server data:
        // If you want to replace: use setPayouts(result.data)
        // If you want to append: use [...payouts, ...result.data]
        // setPayouts((prev) => [...prev, ...(result?.data ?? [])])
        setPayouts(result?.data ?? [])
      } catch (error) {
        console.error('Failed to fetch payouts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayouts()
  }, [])

  const handleAdd = async () => {
    if (!formData.amount || !formData.paymentMethod || !formData.userEmail) {
      showCustomToast('Fill all required fields', 'error')
      return
    }
    try {
      const res = await postPayoutsData(formData)
      setPayouts([res.data, ...payouts])
      showCustomToast('Added successfully', 'success')
      setFormData({
        transactionId: '',
        amount: '',
        paymentMethod: '',
        paymentStatus: '',
        userEmail: '',
        userMobile: '',
        billingName: '',
        billingAddress: '',
      })
    } catch (err) {
      // showCustomToast(err?.response?.data?.message || 'Add failed', 'error')
    }
  }

  // const filteredData = (payouts || []).filter(
  //   (item) =>
  //     item.billingName?.toLowerCase().includes(search.toLowerCase()) ||
  //     item.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
  //     item.userMobile?.toLowerCase().includes(search.toLowerCase()),
  // )

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return payouts
    return payouts.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, payouts])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <CContainer className="p-4">
      <ToastContainer />

      <CRow className="mb-3 align-items-center">
        <CCol md={6}>
          {' '}
          <strong style={{ color: 'var(--color-black)' }}>Transaction List</strong>
        </CCol>
        <CCol md={6} className="text-end">
          <strong style={{ color: 'var(--color-black)' }}>
            No. of Payouts: {filteredData.length}
          </strong>
        </CCol>
      </CRow>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading payouts..." />
        </div>
      ) : (
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow className="pink-table  w-auto">
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Booking ID</CTableHeaderCell>
              <CTableHeaderCell>Billing Name</CTableHeaderCell>
              <CTableHeaderCell>Amount</CTableHeaderCell>
              <CTableHeaderCell>Payment Method</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((p, index) => (
                <CTableRow key={`${p.bookingId}-${index}`}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>{p.bookingId}</CTableDataCell>
                  <CTableDataCell>{p.billingName}</CTableDataCell>
                  <CTableDataCell>{p.amount}</CTableDataCell>
                  <CTableDataCell>{p.paymentMethod}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {can('Payouts', 'read') && (
                        <button className="actionBtn" onClick={() => setViewData(p)} title="View">
                          <Eye size={18} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center text-danger">
                  No payouts found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}

      {filteredData.length > 0 && (
        <div className="mb-3  mt-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(displayData.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        </div>
      )}

      {/* View Modal */}
      <CModal
        visible={!!viewData}
        onClose={() => setViewData(null)}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Transaction Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            <strong>Transaction ID:</strong> {viewData?.transactionId}
          </p>
          <p>
            <strong>User Email:</strong> {viewData?.userEmail}
          </p>
          <p>
            <strong>Mobile:</strong> {viewData?.userMobile}
          </p>
          <p>
            <strong>Amount:</strong> {viewData?.amount}
          </p>
          <p>
            <strong>Payment Method:</strong> {viewData?.paymentMethod}
          </p>
          <p>
            <strong>Billing Name:</strong> {viewData?.billingName}
          </p>
          <p>
            <strong>Billing Address:</strong> {viewData?.billingAddress}
          </p>
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default PayoutManagement
