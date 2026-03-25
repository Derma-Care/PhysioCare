import React, { useEffect, useState, useCallback } from 'react'
import {
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
  CModalFooter,
  CRow,
  CCol,
} from '@coreui/react'
import { Eye, Edit2, Printer } from 'lucide-react'

import { PurchaseData } from '../PharmacyManagement/PurchasesAPI'
import { formatDateTime } from '../../Utils/FormatDate'
import MoneyReceipts from './SupplierMoneyReceipt'
import LoadingIndicator from '../../Utils/loader'
import PrintLetterHead from '../../Utils/PrintLetterHead'

const ViewPurchaseBills = () => {
  const [purchaseData, setPurchaseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [printDate, setPrintDate] = useState(null)
  const [paymentVisible, setPaymentVisible] = useState(false)
  const [paymentData, setPaymentData] = useState({
    supplierId: '',
    billNo: '',
    purchase: null,
 
  })
  const fetchPurchaseBills = useCallback(async () => {
    setLoading(true)
    try {
      const res = await PurchaseData()
      setPurchaseData(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchaseBills()
  }, [fetchPurchaseBills])
  const handleMakePayment = (purchase) => {
    const supplierId = purchase?.supplierDetails?.supplierId || ''
    const billNo = purchase?.purchaseBillNo || ''

    setPaymentData({
      supplierId,
      billNo, purchase, 
    })

    // alert(supplierId) // ✅ correct value
    setPrintDate(new Date())
    setPaymentVisible(true)
  }

  return (
    <div className="p-3">
      {loading ? (
        <LoadingIndicator message="Loading Purchase..." />
      ) : (
        <CTable bordered hover responsive style={{ fontSize: '0.78rem' }}>
          <CTableHead className="pink-table w-auto">
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Bill No</CTableHeaderCell>
              <CTableHeaderCell>Supplier</CTableHeaderCell>
              <CTableHeaderCell>Invoice No</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Final Total</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className="pink-table">
            {purchaseData.map((p, i) => (
              <CTableRow key={p.purchaseId}>
                <CTableDataCell>{i + 1}</CTableDataCell>

                <CTableDataCell>{p.purchaseBillNo || '-'}</CTableDataCell>

                <CTableDataCell>{p.supplierDetails?.supplierName || '-'}</CTableDataCell>

                <CTableDataCell>{p.invoiceNo || '-'}</CTableDataCell>

                <CTableDataCell>{p.dates?.invoiceDate || '-'}</CTableDataCell>

                <CTableDataCell>{p.summary?.grandTotal || 0}</CTableDataCell>

                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    className="actionBtn mx-2"
                    onClick={() => {
                      setSelectedPurchase(p)
                      setVisible(true)
                    }}
                  >
                    <Eye size={18} />
                  </CButton>
                  <CButton size="sm" className="actionBtn" onClick={() => handleMakePayment(p)}>
                    <Printer size={18} />
                    {/*TODO: After save button is clicked this button has to be shown modal has to open */}
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      {/* ================= VIEW MODAL ================= */}
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        backdrop="static"
        size="lg"
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle>Purchase Bill</CModalTitle>
        </CModalHeader>

        <CModalBody style={{ color: 'var(--color-black)' }}>
          {!selectedPurchase ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              {/* ===== BASIC INFO ===== */}
              <div className="mb-3 p-3 border rounded">
                <h6 className="fw-bold mb-3 border-bottom pb-1">Basic Information</h6>

                <CRow className="gy-2">
                  <CCol md={4}>
                    <b>Bill No:</b> {selectedPurchase.purchaseBillNo || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Date:</b> {formatDateTime(selectedPurchase.createdAt) || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>supplierId:</b> {selectedPurchase.supplierDetails?.supplierId || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Supplier:</b> {selectedPurchase.supplierDetails?.supplierName || '-'}
                  </CCol>
                  {/* <CCol md={4}>
                    <b>Department:</b> {selectedPurchase.department || '-'}
                  </CCol> */}
                  <CCol md={4}>
                    <b>Financial Year:</b> {selectedPurchase.financialYear || '-'}
                  </CCol>
                </CRow>
              </div>

              {/* ===== INVOICE ===== */}
              <div className="mb-3 p-3 border rounded">
                <h6 className="fw-bold mb-3 border-bottom pb-1">Invoice Details</h6>

                <CRow className="gy-2">
                  <CCol md={4}>
                    <b>Invoice No:</b> {selectedPurchase.invoiceNo || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Invoice Date:</b> {selectedPurchase.dates?.invoiceDate || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Receiving Date:</b> {selectedPurchase.dates?.receivingDate || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Tax Type:</b> {selectedPurchase.taxDetails?.taxType || '-'}
                  </CCol>
                </CRow>
              </div>

              {/* ===== MEDICINES ===== */}
              <div className="mb-3 p-3 border rounded">
                <h6 className="fw-bold mb-3 border-bottom pb-1">Medicine Details</h6>

                <CTable bordered small responsive>
                  <CTableHead>
                    <CTableRow className="pink-table w-auto">
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Product</CTableHeaderCell>
                      <CTableHeaderCell>Batch</CTableHeaderCell>
                      <CTableHeaderCell>Expiry</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">{`Qty\n (a)`} </CTableHeaderCell>
                      <CTableHeaderCell>Free</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">{`Cost\n (b)`}</CTableHeaderCell>
                      <CTableHeaderCell>MRP</CTableHeaderCell>
                      <CTableHeaderCell className="text-center" style={{ width: '15%' }}>
                        Total Amt <br /> (A = a*b)
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center">{`Disc Amt \n (B)`}</CTableHeaderCell>
                      <CTableHeaderCell
                        className="text-center"
                        style={{ width: '20%' }}
                      >{`Line Total \n (A-B)`}</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody className="pink-table">
                    {selectedPurchase.items?.map((m, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>{i + 1}</CTableDataCell>

                        <CTableDataCell>{m.productId}</CTableDataCell>

                        <CTableDataCell>{m.batchNo || '-'}</CTableDataCell>

                        <CTableDataCell>{m.expiryDate || '-'}</CTableDataCell>

                        <CTableDataCell>{m.quantity || 0}</CTableDataCell>

                        <CTableDataCell>{m.freeQuantity || 0}</CTableDataCell>

                        <CTableDataCell>{m.costPrice || 0}</CTableDataCell>

                        <CTableDataCell>{m.mrp || 0}</CTableDataCell>

                        <CTableDataCell>{m.totalLineCostAmount || 0}</CTableDataCell>

                        <CTableDataCell>{m.discountAmount || 0}</CTableDataCell>

                        <CTableDataCell>{m.netAmount || 0}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* ===== TOTALS ===== */}
              <div className="mb-3 p-3 border rounded">
                <h6 className="fw-bold mb-3 border-bottom pb-1">Totals & Taxes</h6>

                <CRow className="gy-2">
                  <CCol md={4}>
                    <b>Total Amount:</b> ₹ {selectedPurchase?.summary.totalCostPrice || 0}
                    <p> (without Discount)</p>
                  </CCol>
                  {/* <CCol md={4}>
                    <b>Discount %:</b> {selectedPurchase.discountPercentage || 0}
                  </CCol> */}
                  <CCol md={4}>
                    <b>Discount Amt:</b> ₹ {selectedPurchase?.summary.totalDiscountedAmount || 0}
                  </CCol>
                  {/* <CCol md={4}>
                    <b>Total GST Amount:</b>₹ {selectedPurchase.summary.totalGSTAmount || 0}
                  </CCol> */}
                  {/* <CCol md={4}>
                    <b>SGST:</b> {selectedPurchase.totalSGST || 0}
                  </CCol>
                  <CCol md={4}>
                    <b>Total Tax:</b> {selectedPurchase.totalTax || 0}
                  </CCol> */}
                </CRow>
              </div>

              {/* ===== PAYMENT ===== */}
              <div className="p-3 border rounded">
                <h6 className="fw-bold mb-3 border-bottom pb-1">Payment Details</h6>

                <CRow className="gy-2">
                  <CCol md={4}>
                    <b>Final Total:</b> ₹ {selectedPurchase.summary?.grandTotal || 0}
                    <p> (with Discount)</p>
                  </CCol>
                  <CCol md={4}>
                    <b>Paid:</b> ₹ {selectedPurchase.paymentDetails?.paidAmount || 0}
                  </CCol>
                  <CCol md={4}>
                    <b>Balance:</b> ₹ {selectedPurchase.paymentDetails.dueAmount || 0}
                  </CCol>
                  <CCol md={4}>
                    <b>Payment Mode:</b> {selectedPurchase.paymentDetails?.paymentMode || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Bill Due Date:</b> {selectedPurchase.dates?.billDueDate || '-'}
                  </CCol>
                  <CCol md={4}>
                    <b>Credit Days:</b> {selectedPurchase.taxDetails?.creditDays || '-'}
                  </CCol>
                  {/* <CCol md={6}>
                    <b>Due Paid Bill No:</b> {selectedPurchase.duePaidBillNo || '-'}
                  </CCol> */}
                </CRow>
              </div>
            </>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        backdrop="static"
        size="lg"
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle>Make Payment</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div id="printableArea">
            <PrintLetterHead printDate={printDate}>
              <MoneyReceipts
                supplierId={paymentData.supplierId}
                billNo={paymentData.billNo}
                purchase={paymentData.purchase}
              />
            </PrintLetterHead>
          </div>
        </CModalBody>

        {/* <CModalFooter>
          <CButton color="secondary" onClick={() => setPaymentVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary">Save Payment</CButton>
        </CModalFooter> */}
      </CModal>
      <style>
        {`

@page {
  size: A4;
  margin: 10mm;
}

@media print {

  html, body {
    height: auto;
  }

  body {
    margin: 0;
  }

  /* DO NOT hide everything */
  /* remove body * visibility hidden */

  .modal,
  .modal-backdrop,
  .modal-dialog,
  .modal-content {
    position: static !important;
    display: block !important;
  }

  #printableArea {
    width: 100%;
  }

  .no-print {
    display: none !important;
  }

}
`}
      </style>
    </div>
  )
}

export default ViewPurchaseBills
