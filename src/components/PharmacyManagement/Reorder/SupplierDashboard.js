/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CRow,
  CCol,
} from '@coreui/react'

import { ordersData } from './dummyProductData'
import { formatDateTime } from '../../../Utils/FormatDate'
import { cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import ConfirmModal from '../../ConfirmLogoutModal'
import { getAllOrdersAPI, getAllOrdersAPIBySupplierId } from './PharmacyOrderAPI'
import { showCustomToast } from '../../../Utils/Toaster'
import LoadingIndicator from '../../../Utils/loader'

// eslint-disable-next-line react/prop-types
const SupplierDashboard = ({ supplierId, onLogout, supplier }) => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [currentOrderIndex, setCurrentOrderIndex] = useState(null)
  const [reason, setReason] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const toggleProducts = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const clinicId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      console.log(supplierId)

      const data = await getAllOrdersAPIBySupplierId(clinicId, branchId, supplierId)

      console.log('API orders', data)

      const apiOrders = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []

      setOrders(apiOrders)
    } catch (err) {
      console.log(err)

      showCustomToast(err?.response?.data?.message || 'Error fetching orders', 'error')

      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!supplierId) return

    setOrders((prev) => prev.filter((o) => o?.supplier?.supplierId === supplierId))
  }, [supplierId])

  const handleProductStatusChange = (orderIndex, productIndex, value) => {
    if (value === 'REJECT') {
      setCurrentProduct(productIndex)
      setCurrentOrderIndex(orderIndex)
      setShowModal(true)
    } else {
      const updated = [...orders]
      updated[orderIndex].products[productIndex].status = value
      updated[orderIndex].products[productIndex].rejectionReason = null
      setOrders(updated)
    }
  }

  const handleRejectConfirm = () => {
    if (!reason.trim()) return

    const updated = [...orders]

    updated[currentOrderIndex].products[currentProduct] = {
      ...updated[currentOrderIndex].products[currentProduct],
      status: 'REJECT',
      rejectionReason: reason,
    }

    setOrders(updated)
    setShowModal(false)
    setReason('')
  }

  const handleFinalSubmit = (orderIndex) => {
    const updated = [...orders]

    const hasReject = updated[orderIndex].products.some((p) => p.status === 'REJECT')

    const allRejected = updated[orderIndex].products.every((p) => p.status === 'REJECT')

    if (allRejected) {
      updated[orderIndex].overallStatus = 'REJECT'
    } else if (hasReject) {
      updated[orderIndex].overallStatus = 'PARTIAL_ACCEPT'
    } else {
      updated[orderIndex].overallStatus = 'ACCEPT'
    }

    updated[orderIndex].isLocked = true

    setOrders(updated)
  }
  const statusList = [
    'PENDING',
    'ACCEPT',
    'PARTIAL_ACCEPT',
    'REJECT',
    'DISPATCHED',
    'PLACED',
    'ALL',
  ]
  const getDisplayStatus = (status) => {
    if (status === 'PENDING') return 'NEW ORDERS'
    return status
  }
  const getStatusCount = (status) => {
    if (status === 'ALL') return orders.length

    return orders.filter((o) => o.overallStatus === status).length
  }
  const handleDispatch = (orderIndex, orderId) => {
    alert(`Order Dispatched ${orderId}`)
    const updated = [...orders]

    updated[orderIndex].overallStatus = 'DISPATCHED'

    setOrders(updated)
  }

  const filteredOrders =
    statusFilter === 'ALL' ? orders : orders.filter((o) => o.overallStatus === statusFilter)
  console.log(supplier)
  return (
    <CContainer fluid className="py-4" style={{ background: '#f4f6f9', minHeight: '100vh' }}>
      {/* ================= HEADER ================= */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#f4f6f9',
          paddingTop: '10px',
        }}
      >
        {/* HEADER */}
        <CCard className="mb-3 shadow-sm border-0">
          <CCardBody className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1 fw-bold">{supplier?.supplierName} Dashboard</h4>
              <div>
                <strong>Prop: </strong>
                {supplier?.contactPerson}
              </div>
              <small className="text-medium-emphasis">Manage and respond to pharmacy orders</small>
            </div>

            <CButton
              color="danger"
              className="text-white d-flex align-items-center gap-2"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
            >
              <CIcon icon={cilAccountLogout} size="sm" />
              Logout
            </CButton>
          </CCardBody>
        </CCard>
        <ConfirmModal
          visible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false)
            onLogout()
          }}
          title="Confirm Logout"
          message="Are you sure you want to logout from the Supplier Portal?"
          confirmText="Yes, Logout"
          cancelText="Cancel"
          confirmColor="danger"
        />

        {/* FILTER */}
        <CCard className="mb-4 shadow-sm border-0">
          <CCardBody>
            <div className="d-flex gap-2 flex-wrap">
              {statusList.map((status) => (
                <CButton
                  key={status}
                  size="sm"
                  color={statusFilter === status ? 'primary' : 'light'}
                  className={`px-3 fw-semibold ${statusFilter !== status ? 'text-dark' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'PENDING' ? 'NEW ORDERS' : status}
                  <CBadge color={statusFilter === status ? 'info' : 'secondary'} className="ms-2">
                    {getStatusCount(status)}
                  </CBadge>
                </CButton>
              ))}
            </div>
          </CCardBody>
        </CCard>
      </div>

      {/* ================= ORDER LIST ================= */}
      {loading ? (
        <div className="text-center py-5">
          {/* <div className="spinner-border text-dark" />
          <div>Loading Orders...</div> */}
          <LoadingIndicator message="Loading Orders..." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <CCard className="text-center shadow-sm border-0 py-5">
          <h5 className="fw-semibold">No Orders Found</h5>
          <p className="text-medium-emphasis mb-0">No orders under "{statusFilter}" status.</p>
        </CCard>
      ) : (
        filteredOrders.map((order, orderIndex) => {
          const firstStatus = order?.statusHistory?.[0]?.status || 'NA'

          const firstTime = order?.statusHistory?.[0]?.timestamp || 'NA'

          console.log(firstStatus, firstTime)
          return (
            <CCard key={orderIndex} className="mb-4 shadow-sm border-0">
              {/* ===== ORDER HEADER ===== */}
              <CCardHeader className="bg-white border-0 py-3">
                <CRow className="align-items-center">
                  {/* LEFT SIDE */}
                  <CCol md={5}>
                    <div className="fw-semibold mb-1">
                      <span className="text-medium-emphasis">Order ID</span>
                      <div className="fs-6">{order.orderId}</div>
                    </div>
                  </CCol>

                  {/* CENTER - DATE INFO */}
                  <CCol md={4}>
                    <div className="text-center">
                      <span className="text-medium-emphasis fw-semibold text-center">
                        Order Status
                      </span>
                      <div>
                        <CBadge
                          className="px-3 py-2 mb-2"
                          color={
                            order.overallStatus === 'ACCEPT'
                              ? 'success'
                              : order.overallStatus === 'REJECT'
                                ? 'danger'
                                : order.overallStatus === 'PARTIAL_ACCEPT'
                                  ? 'warning'
                                  : order.overallStatus === 'PLACED'
                                    ? 'info'
                                    : order.overallStatus === 'DISPATCHED'
                                      ? 'primary'
                                      : 'secondary'
                          }
                        >
                          {getDisplayStatus(order.overallStatus)}
                        </CBadge>
                      </div>
                    </div>
                  </CCol>

                  {/* RIGHT SIDE */}
                  <CCol md={3} className="text-end">
                    <div>
                      <CButton
                        size="sm"
                        style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                        onClick={() => toggleProducts(order.orderId)}
                      >
                        {expandedOrder === order.orderId ? 'Hide Products' : 'View Products'}
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CCardHeader>

              {/* ===== PRODUCT TABLE ===== */}
              {expandedOrder === order.orderId && (
                <CCardBody style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <CRow className="g-3 mb-4">
                    {/* Clinic */}
                    <CCol md={3}>
                      <small className="text-medium-emphasis">Clinic</small>
                      <div className="fw-semibold">{order.clinic?.clinicName}</div>
                    </CCol>

                    {/* Branch */}
                    <CCol md={3}>
                      <small className="text-medium-emphasis">Branch</small>
                      <div className="fw-semibold">{order.branch?.branchName}</div>
                    </CCol>

                    {/* Order Date */}
                    <CCol md={3}>
                      <small className="text-medium-emphasis">Order Date</small>
                      <div className="fw-semibold">{formatDateTime(order.createdAt)}</div>
                    </CCol>

                    {/* Last Status */}
                    <CCol md={3}>
                      <small className="text-medium-emphasis">Last Status Update</small>
                      <div className="fw-semibold">
                        {firstTime ? formatDateTime(firstTime) : 'N/A'}
                      </div>
                    </CCol>
                  </CRow>

                  <CTable bordered hover responsive align="middle" className="pink-table">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Product</CTableHeaderCell>
                        <CTableHeaderCell>HSN</CTableHeaderCell>
                        <CTableHeaderCell>Pack</CTableHeaderCell>
                        <CTableHeaderCell>Category</CTableHeaderCell>
                        <CTableHeaderCell>MRP</CTableHeaderCell>
                        <CTableHeaderCell>Qty</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Reason</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {order.products.map((p, productIndex) => (
                        <CTableRow key={productIndex}>
                          <CTableDataCell>{productIndex + 1}</CTableDataCell>
                          <CTableDataCell>{p.productName}</CTableDataCell>
                          <CTableDataCell>{p.hsnCode}</CTableDataCell>
                          <CTableDataCell>{p.packSize}</CTableDataCell>
                          <CTableDataCell>{p.category}</CTableDataCell>
                          <CTableDataCell>{p.mrp}</CTableDataCell>
                          <CTableDataCell>{p.quantityRequested}</CTableDataCell>

                          <CTableDataCell>
                            <CFormSelect
                              size="sm"
                              value={p.status}
                              disabled={order.overallStatus !== 'PENDING'}
                              onChange={(e) =>
                                handleProductStatusChange(orderIndex, productIndex, e.target.value)
                              }
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="ACCEPT">ACCEPT</option>
                              <option value="REJECT">REJECT</option>
                              {/* <option value="DISPATCHED">DISPATCHED</option> */}
                            </CFormSelect>
                          </CTableDataCell>

                          <CTableDataCell className="text-danger">
                            {p.status === 'REJECT' ? p.rejectionReason : '-'}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  <div className="text-end mt-3">
                    {order.overallStatus === 'PENDING' && (
                      <CButton
                        color="success"
                        style={{ color: 'white' }}
                        onClick={() => handleFinalSubmit(orderIndex)}
                      >
                        Final Submit
                      </CButton>
                    )}

                    {(order.overallStatus === 'ACCEPT' ||
                      order.overallStatus === 'PARTIAL_ACCEPT') && (
                      <CButton
                        color="info"
                        style={{ color: 'white' }}
                        onClick={() => handleDispatch(orderIndex, order.orderId)}
                      >
                        Dispatch Order
                      </CButton>
                    )}
                  </div>
                </CCardBody>
              )}
            </CCard>
          )
        })
      )}

      {/* ================= MODAL ================= */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Enter Rejection Reason</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormTextarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason here..."
          />
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setShowModal(false)
              setReason('')
            }}
          >
            Cancel
          </CButton>

          <CButton
            color="danger"
            style={{ color: 'white' }}
            disabled={!reason.trim()}
            onClick={handleRejectConfirm}
          >
            Confirm Reject
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default SupplierDashboard
