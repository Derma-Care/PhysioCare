import React, { useState, useRef, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CCollapse,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from '@coreui/react'

import { ordersData } from './dummyProductData'
import OrderForm from './OrderForm'
import { useMedicines } from '../../../Context/MedicineContext'
import { getAllOrdersAPI } from './PharmacyOrderAPI'

const OrderDetails = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [visible, setVisible] = useState(false)
  const formRef = useRef()
  const { supplier, fetchSuppliers } = useMedicines()
  
  const [orders, setOrders] = useState([])
  useEffect(() => {
    fetchSuppliers()
  }, [])
  console.log(supplier)

  const supplierList = Array.isArray(supplier) ? supplier : []
  console.log(supplierList)
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
   
    try {
     
      const clinicId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')

      const data = await getAllOrdersAPI(clinicId, branchId)

      console.log('API orders', data)

      setOrders(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      showCustomToast(err.response.data.message || 'Error fetching orders', 'error')
      console.log(err)
      setOrders([])
    }
  }


  // ✅ Filter Orders by Supplier
  const filteredOrders = selectedSupplier
    ? orders.filter((order) => order?.supplier?.supplierId === selectedSupplier)
    : orders

  // ✅ Group Orders by Supplier
  const supplierMap = filteredOrders.reduce((acc, order) => {
    if (!order?.supplier?.supplierId) return acc

    const supplierId = order.supplier.supplierId

    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplierInfo: order.supplier,
        orders: [],
      }
    }

    acc[supplierId].orders.push(order)

    return acc
  }, {})

   console.log(supplierMap)

  const suppliersOrder = Object.values(supplierMap)

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center f-bold">
          <h4>Reorder Orders</h4>

          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            onClick={() => setVisible(true)}
          >
            + Place Order
          </CButton>
        </CCardHeader>

        <CCardBody>
          {/* ✅ Supplier Filter Dropdown */}
          <CFormSelect
            className="mb-3"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">All Suppliers</option>

            {supplierList.map((s) => (
              <option key={s.supplierId} value={s.supplierId}>
                {s.supplierName}
              </option>
            ))}
          </CFormSelect>

          {/* ✅ Accordion By Supplier */}
          <CAccordion activeItemKey={0}>
            {suppliersOrder.map((supplierGroup, supIndex) => (
              <CAccordionItem key={supIndex} itemKey={supIndex}>
                {/* Supplier Header */}
                <CAccordionHeader>
                  <strong>{supplierGroup.supplierInfo?.supplierName}</strong>
                  &nbsp; ({supplierGroup.orders.length} Orders)
                </CAccordionHeader>

                <CAccordionBody>
                  <CTable bordered hover responsive className="pink-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Order ID</CTableHeaderCell>
                        <CTableHeaderCell>Supplier</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Expected Days</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {supplierGroup.orders.map((order, orderIndex) => (
                        <React.Fragment key={orderIndex}>
                          {/* Order Row */}
                          <CTableRow>
                            <CTableDataCell>{order.orderId}</CTableDataCell>

                            <CTableDataCell>{order.supplier?.supplierName}</CTableDataCell>

                            <CTableDataCell>
                              <CBadge
                                color={
                                  order.overallStatus === 'ACCEPT'
                                    ? 'success'
                                    : order.overallStatus === 'REJECT'
                                      ? 'danger'
                                      : order.overallStatus === 'PARTIAL_ACCEPT'
                                        ? 'info'
                                        : 'warning'
                                }
                              >
                                {order.overallStatus}
                              </CBadge>

                              {/* ✅ Show Overall Reason If Rejected */}
                              {order.overallStatus === 'REJECT' && order.overallReason && (
                                <div className="text-danger mt-2 small">
                                  Reason: {order.overallReason}
                                </div>
                              )}
                            </CTableDataCell>

                            <CTableDataCell>{order.expectedDeliveryDays} Days</CTableDataCell>

                            <CTableDataCell>
                              <CButton
                                size="sm"
                                style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                                onClick={() =>
                                  setExpandedOrder(
                                    expandedOrder === order.orderId ? null : order.orderId,
                                  )
                                }
                              >
                                View Products
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>

                          {/* Product Collapse Row */}
                          <CTableRow>
                            <CTableDataCell colSpan="5">
                              <CCollapse visible={expandedOrder === order.orderId}>
                                <CTable
                                  bordered
                                  striped
                                  hover
                                  responsive
                                  className="mt-2 pink-table"
                                >
                                  <CTableHead color="light">
                                    <CTableRow>
                                      <CTableHeaderCell>Product Name</CTableHeaderCell>
                                      <CTableHeaderCell>Product ID</CTableHeaderCell>
                                      <CTableHeaderCell>HSN</CTableHeaderCell>
                                      <CTableHeaderCell>Pack Size</CTableHeaderCell>
                                      <CTableHeaderCell>Category</CTableHeaderCell>
                                      <CTableHeaderCell>MRP</CTableHeaderCell>
                                      <CTableHeaderCell>GST %</CTableHeaderCell>
                                      <CTableHeaderCell>Quantity</CTableHeaderCell>
                                      <CTableHeaderCell>Status</CTableHeaderCell>
                                      <CTableHeaderCell>Reason</CTableHeaderCell>
                                    </CTableRow>
                                  </CTableHead>

                                  <CTableBody>
                                    {order.products?.map((product, pIndex) => (
                                      <CTableRow key={pIndex}>
                                        <CTableDataCell>{product.productName}</CTableDataCell>
                                        <CTableDataCell>{product.productId}</CTableDataCell>
                                        <CTableDataCell>{product.hsnCode}</CTableDataCell>
                                        <CTableDataCell>{product.packSize}</CTableDataCell>
                                        <CTableDataCell>{product.category}</CTableDataCell>
                                        <CTableDataCell>{product.mrp}</CTableDataCell>
                                        <CTableDataCell>{product.gst}</CTableDataCell>
                                        <CTableDataCell>{product.quantityRequested}</CTableDataCell>

                                        <CTableDataCell>
                                          <CBadge
                                            color={
                                              product.status === 'ACCEPT'
                                                ? 'success'
                                                : product.status === 'REJECT'
                                                  ? 'danger'
                                                  : 'warning'
                                            }
                                          >
                                            {product.status}
                                          </CBadge>
                                        </CTableDataCell>

                                        <CTableDataCell>
                                          {product.rejectionReason ? (
                                            <span className="text-danger">
                                              {product.rejectionReason}
                                            </span>
                                          ) : (
                                            '-'
                                          )}
                                        </CTableDataCell>
                                      </CTableRow>
                                    ))}
                                  </CTableBody>
                                </CTable>
                              </CCollapse>
                            </CTableDataCell>
                          </CTableRow>
                        </React.Fragment>
                      ))}
                    </CTableBody>
                  </CTable>
                </CAccordionBody>
              </CAccordionItem>
            ))}
          </CAccordion>
        </CCardBody>
      </CCard>
      <CModal visible={visible} onClose={() => setVisible(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>Create New Order</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <OrderForm
            ref={formRef}
            onSave={(data) => {
              console.log('Saved:', data)
              setVisible(false) // close modal after submit
              loadOrders() 
            }}
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            onClick={() => formRef.current?.submitForm()}
          >
            Submit Order
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default OrderDetails
