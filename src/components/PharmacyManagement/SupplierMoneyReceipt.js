/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

// eslint-disable-next-line react/prop-types
const MoneyReceipts = ({ supplierId, billNo, purchase }) => {
  // ✅ Dummy Data (You can replace with API response)
  // const [receiptData, setReceiptData] = useState({
  //   receiptNo: 'MR-2026-0007',
  //   date: '02/20/2026',
  //   time: '04:57 PM',
  //   financialYear: '2025-2026',

  //   supplierId: 'SUP-001',
  //   supplierName: 'Sri Balaji Pharma Distributors',

  //   purchaseBillNo: 'PB-1045',
  //   invoiceNo: 'INV-7788',
  //   invoiceDate: '02/18/2026',
  //   receivingDate: '02/19/2026',
  //   billDueDate: '03/20/2026',
  //   creditDays: 30,

  //   finalTotal: 52500,
  //   previousAdjustment: 10000,
  //   paidAmount: 15000,
  //   totalPaid: 25000,
  //   balanceAmount: 27500,

  //   paymentMode: 'UPI',
  //   transactionRef: 'UPI87456321',

  //   // ✅ ITEMS DUMMY DATA
  //   items: [
  //     {
  //       productName: 'Paracetamol 500mg',
  //       batchNo: 'B101',
  //       qty: 10,
  //       cost: 25,
  //       total: 250,
  //     },
  //     {
  //       productName: 'Amoxicillin 250mg',
  //       batchNo: 'B102',
  //       qty: 5,
  //       cost: 40,
  //       total: 200,
  //     },
  //     {
  //       productName: 'Vitamin C',
  //       batchNo: 'B103',
  //       qty: 20,
  //       cost: 10,
  //       total: 200,
  //     },
  //     {
  //       productName: 'Cough Syrup',
  //       batchNo: 'B104',
  //       qty: 3,
  //       cost: 90,
  //       total: 270,
  //     },
  //     {
  //       productName: 'Pain Relief Gel',
  //       batchNo: 'B105',
  //       qty: 2,
  //       cost: 120,
  //       total: 240,
  //     },
  //   ],
  // })
  const receiptData = purchase || {}
  console.log('purchase', purchase)
  console.log('supplierId', supplierId)

  const now = new Date()

  const currentDate = now.toLocaleDateString('en-GB') // 13/03/2026
  const currentTime = now.toLocaleTimeString('en-US') // 11:40 AM
  const handlePrint = () => {
    const content = document.getElementById('printableArea').innerHTML

    const printWindow = window.open('', '', 'width=900,height=700')

    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>

        <style>
 

@page {
  size: A4;
  margin: 12mm;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

/* A4 container */

.a4-page {
  width: 100%;
  max-width: 190mm;
  margin: auto;
}

/* Header */

.print-header {
  text-align: center;
  margin-bottom: 10px;
  marin-top: 40px;
  font-weight: bold;
}

.print-title {
  text-align: center;
  font-weight: bold;
  margin: 8px 0;
}

/* rows */

.print-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* table */

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.print-table th,
.print-table td {
  border: 1px solid black;
  padding: 4px;
  text-align: center;
}

.print-table th {
  background: #f2f2f2;
}

/* totals */

.print-total {
  margin-top: 10px;
}

.print-total p {
  margin: 2px 0;
}

/* print */

@media print {

  .no-print {
    display: none !important;
  }

}

 
</style>

      </head>

      <body>

        ${content}

      </body>
    </html>
  `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // ✅ Safe fallback destructuring
  const {
    receiptNo = '',
    date = '',
    time = '',
    financialYear = '',
    supplierName = '',
    purchaseBillNo = '',
    invoiceNo = '',
    invoiceDate = '',
    receivingDate = '',
    billDueDate = '',
    creditDays = 0,
    finalTotal = 0,
    previousAdjustment = 0,
    paidAmount = 0,
    totalPaid = 0,
    balanceAmount = 0,
    paymentMode = '',
    transactionRef = '',
  } = receiptData || {}

  const status = purchase.paymentDetails.dueAmount === 0 ? 'Fully Paid' : 'Partially Paid'

  return (
    <>
      {receiptData && (
        <div>
          <CCard className="mt-4">
            <CCardHeader
              className="text-center fw-bold print-header "
              style={{ color: 'var(--color-black)' }}
            >
              SUPPLIER MONEY RECEIPT
            </CCardHeader>

            <CCardBody style={{ color: 'var(--color-black)' }}>
              {/* Receipt Info */}
              <CRow className="mb-0">
                <CCol md={6} className="print-row">
                  <div>
                    <strong>Receipt No:</strong> {purchase.purchaseId}
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <strong>Date:</strong> {currentDate}
                    </div>

                    <div>
                      <strong>Time:</strong> {currentTime}
                    </div>
                  </div>
                </CCol>
                <CCol md={6} className="text-end print-row">
                  <div>
                    <strong>Financial Year:</strong> {financialYear}
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <CBadge color={balanceAmount === 0 ? 'success' : 'warning'}>{status}</CBadge>
                  </div>
                </CCol>
              </CRow>

              <hr />

              {/* Supplier Info */}
              <CRow className="mb-0 ">
                <CCol md={6} className="print-row">
                  <div>
                    <strong>Supplier:</strong> {purchase.supplierDetails.supplierName}
                  </div>
                  <div>
                    <strong>Purchase Bill No:</strong> {purchase.purchaseBillNo}
                  </div>
                  <div>
                    <strong>Invoice No:</strong> {purchase.invoiceNo}
                  </div>
                </CCol>
                <CCol md={6} className="print-row">
                  <div>
                    <strong>Invoice Date:</strong> {purchase.dates.invoiceDate}
                  </div>
                  <div>
                    <strong>Receiving Date:</strong> {purchase.dates.receivingDate}
                  </div>
                  <div>
                    <strong>Bill Due Date:</strong> {purchase.dates.billDueDate}
                  </div>
                  <div>
                    <strong>Credit Days:</strong> {purchase.taxDetails.creditDays}
                  </div>
                </CCol>
              </CRow>

              <hr />
              <CTable className="pink-table print-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell>Batch</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                    <CTableHeaderCell>Cost</CTableHeaderCell>
                    <CTableHeaderCell>Discount Amt</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {receiptData.items?.map((m, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{i + 1}</CTableDataCell>
                      <CTableDataCell>{m.productName}</CTableDataCell>
                      <CTableDataCell>{m.batchNo}</CTableDataCell>
                      <CTableDataCell>{m.quantity}</CTableDataCell>
                      <CTableDataCell>{m.costPrice}</CTableDataCell>
                      <CTableDataCell>{m.discountAmount}</CTableDataCell>
                      <CTableDataCell>{m.totalLineCostAmount}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <hr />
              {/* Payment Summary */}
              <CRow className="mb-0">
                <CCol md={6} className="print-row">
                  <div>
                    <strong>Total Total:</strong> ₹ {purchase.summary.totalCostPrice}
                  </div>
                  <div>
                    <strong>Previous Adjustment:</strong> ₹{' '}
                    {purchase.paymentDetails.previousAdjustment}
                  </div>
                  <div>
                    <strong>Discount Amount:</strong> ₹ {purchase.summary.totalDiscountedAmount}
                  </div>
                </CCol>
                <CCol md={6} className="print-row">
                  <div>
                    <strong>Paid Amount:</strong> ₹ {purchase.paymentDetails.paidAmount}
                  </div>
                  {/* <div>
                    <strong>Total Paid:</strong> ₹ {purchase.summary.grandTotal} */}
                  {/*TODO: total payment */}
                  {/* </div> */}
                  <div>
                    <strong>Balance Amount:</strong> ₹ {purchase.paymentDetails.dueAmount}
                  </div>
                  <div>
                    <strong>Final Total:</strong> ₹ {purchase.summary.grandTotal}
                  </div>
                </CCol>
              </CRow>

              <hr />

              {/* Payment Mode */}
              <CRow>
                <CCol md={6} className="print-row">
                  <div>
                    <strong>Payment Mode:</strong> {paymentMode}
                  </div>
                  {transactionRef && (
                    <div>
                      <strong>Transaction Ref:</strong> {transactionRef}
                    </div>
                  )}
                </CCol>
              </CRow>

              {/* Print Button */}
              <div className="text-center mt-4 no-print ">
                <CButton
                  style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                  onClick={handlePrint}
                >
                  Print Receipt
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </div>
      )}
    </>
  )
}

export default MoneyReceipts
