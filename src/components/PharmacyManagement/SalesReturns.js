/* eslint-disable react/jsx-key */
import React, { useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { createReturnBill, getBillByNo } from './OpSalesAPI'
import { showCustomToast } from '../../Utils/Toaster'
import { Spinner } from 'react-bootstrap'
import { http } from '../../Utils/Interceptors'
import SalesReturnBillModal from './SalesReturnBillModal'

const OPSalesReturn = () => {
  const [billNo, setBillNo] = useState('')
  const [returnNo] = useState(`RET-${Date.now()}`)
  const [refundMode, setRefundMode] = useState('Cash')
  const [returnType, setReturnType] = useState('Partial')
  const [medicines, setMedicines] = useState([])
  const [showBill, setShowBill] = useState(false)
  const [patient, setPatient] = useState({})
  const [fetchLoading, setFetchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [billNoError, setBillNoError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [summary, setSummary] = useState({
    totalReturn: 0,
    totalDiscount: 0,
    totalGST: 0,
    netRefund: 0,
  })

  // ================= FETCH BILL =================
  const fetchBillData = async () => {
    if (!billNo) {
      setBillNoError('Bill number required')
      return
    }
    try {
      setFetchLoading(true)
      const res = await getBillByNo(billNo)
      const bill = res.data
      if (!bill) {
        showCustomToast(bill.message || 'Bill not found')
        return
      }
      console.log('bill data:', res)
      if (res.status === 200) {
        // ✅ patient data
        setPatient({
          fileNo: bill.opNo || bill.mobile,
          patientName: bill.patientName,
          mobile: bill.mobile,
        })
        if (bill && bill.medicines) {
          const formatted = bill.medicines.map((m, i) => ({
            id: i + 1,
            medicineId: m.medicineId,
            name: m.medicineName,
            batch: m.batchNo,
            soldQty: m.qty,
            returnQty: 0,
            rate: m.rate,
            discPercent: m.discPercent || 0,
            gstPercent: m.gstPercent || 0,
          }))

          setMedicines(formatted)
        }
      } else {
        showCustomToast(bill.message || 'Bill not found')
        return
      }
    } catch (err) {
      showCustomToast(err.response.data.message || 'Bill not found')
      console.log(err)
    } finally {
      setFetchLoading(false)
    }
  }

  // ================= HANDLE RETURN QTY =================
  const handleReturnQty = (index, value) => {
    const updated = [...medicines]

    if (value > updated[index].soldQty) {
      showCustomToast('Return qty cannot exceed sold qty')
      return
    }

    updated[index].returnQty = Number(value)
    setMedicines(updated)
    calculateSummary(updated)
  }

  // ================= CALCULATIONS =================
 const calculateSummary = (data) => {
  let totalReturn = 0
  let totalDiscount = 0
  let totalGST = 0

  const updatedData = data.map((item) => {
    const gross = item.returnQty * item.rate
    const discount = (gross * item.discPercent) / 100
    const taxable = gross - discount
    const gst = (taxable * item.gstPercent) / 100
    const netAmount = taxable + gst

    totalReturn += gross
    totalDiscount += discount
    totalGST += gst

    return {
      ...item,
      netAmount: Number(netAmount.toFixed(2)), // ✅ store here
    }
  })

  setMedicines(updatedData) // ✅ update medicines with netAmount

  const netRefund = totalReturn - totalDiscount + totalGST

  setSummary({
    totalReturn,
    totalDiscount,
    totalGST,
    netRefund,
  })
}

  // ================= SAVE RETURN =================
const handleSave = async () => {
  const returnedItems = medicines.filter((m) => m.returnQty > 0)

  if (returnedItems.length === 0) {
    showCustomToast('Please enter return quantity')
    return
  }

  const clinicId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')

  const payload = {
    branchId,
    clinicId,
     originalBillNo: billNo,

    patientDetails: {
  fileNo: patient?.fileNo || "",
  patientName: patient?.patientName || "",
  mobileNo: patient?.mobile || ""
},

    returnDetails: {
      // returnNo,
      originalBillNo: billNo,
      returnType,
      refundMode,
      // returnDate: new Date().toISOString(),
    },

    items: returnedItems.map((item) => ({
      medicineId: item.medicineId,
      medicineName: item.name,
      batchNo: item.batch,
      soldQty: item.soldQty,
      returnQty: item.returnQty,
      rate: item.rate,
      discountPercent: item.discPercent,
      gstPercent: item.gstPercent,
      netAmount: Number(item.netAmount || 0),

    })),

    summary: {
      total: summary.totalReturn,
      discount: summary.totalDiscount,
      gst: summary.totalGST,
      netRefund: summary.netRefund,
    },
  }

  console.log('🔥 FINAL PAYLOAD:', JSON.stringify(payload, null, 2))

  try {
    const response = await http.post(
      `sales-return/create-sales-return`,
      payload
    )

    console.log('✅ API Response:', response.data)

    setShowBill(true)
    showCustomToast('Return Saved Successfully')
  } catch (error) {
    console.error('❌ API Error:', error?.response || error)

    showCustomToast(
      error?.response?.data?.message || 'Failed to save return'
    )
  }
}
  // ================= UI =================
  return (
    <>
    <CCard>
      <CCardBody>
        <CRow className="mb-4 g-4">
          {/* ================= LEFT SIDE - AUTO FETCHED DETAILS ================= */}
          <CCol md={6}>
            <CCard className="p-3 shadow-sm" style={{ color: 'var(--color-black)' }}>
              <h6 className="fw-bold mb-3">Patient Details</h6>

              <CRow className="g-3">
                <CCol md={12}>
                  <CFormLabel>File No</CFormLabel>
                  <CFormInput value={patient.fileNo || ''} disabled size="sm" />
                </CCol>

                <CCol md={12}>
                  <CFormLabel>Patient Name</CFormLabel>
                  <CFormInput value={patient.patientName || ''} disabled size="sm" />
                </CCol>

                <CCol md={12}>
                  <CFormLabel>Mobile No</CFormLabel>
                  <CFormInput value={patient.mobile || ''} disabled size="sm" />
                </CCol>
              </CRow>
            </CCard>
          </CCol>
          {/* ================= RIGHT SIDE - BILL & RETURN INFO ================= */}
          <CCol md={6}>
            <CCard className="p-3 shadow-sm">
              <h6 className="fw-bold mb-3">Return Details</h6>

              <CRow className="g-3 align-items-end" style={{ color: 'var(--color-black)' }}>
                {/* Bill No + Fetch Button in Same Row */}
                <CCol md={8}>
                  <CFormLabel>Original Bill No</CFormLabel>

                  <CFormInput
                    value={billNo}
                    size="sm"
                    placeholder="Enter Bill Number"
                    onChange={(e) => {
                      setBillNo(e.target.value)

                      // ✅ hide error when typing
                      if (e.target.value) {
                        setBillNoError('')
                      }
                    }}
                    invalid={!!billNoError}
                  />

                  {billNoError && <div style={{ color: 'red', fontSize: 12 }}>{billNoError}</div>}
                </CCol>

                <CCol md={4} className="d-flex">
                  <CButton
                    size="sm"
                    className="w-100"
                    onClick={fetchBillData}
                    style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                  >
                    {fetchLoading ? <Spinner size="sm" /> : 'Fetch Bill'}
                  </CButton>
                </CCol>

                {/* Return Type */}
                <CCol md={12}>
                  <CFormLabel>Return Type</CFormLabel>
                  <CFormSelect
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    size="sm"
                  >
                    <option value="Partial">Partial</option>
                    <option value="Full">Full</option>
                  </CFormSelect>
                </CCol>

                {/* Refund Mode */}
                <CCol md={12}>
                  <CFormLabel>Refund Mode</CFormLabel>
                  <CFormSelect
                    value={refundMode}
                    onChange={(e) => setRefundMode(e.target.value)}
                    size="sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Adjust">Adjust to Credit</option>
                  </CFormSelect>
                </CCol>
              </CRow>
            </CCard>
          </CCol>
        </CRow>

        {/* TABLE */}
        <CTable bordered responsive className="pink-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Medicine</CTableHeaderCell>
              <CTableHeaderCell>Batch</CTableHeaderCell>
              <CTableHeaderCell>Sold Qty</CTableHeaderCell>
              <CTableHeaderCell>Return Qty</CTableHeaderCell>
              <CTableHeaderCell>Rate</CTableHeaderCell>
              <CTableHeaderCell>Disc%</CTableHeaderCell>
              <CTableHeaderCell>GST%</CTableHeaderCell>
              <CTableHeaderCell>Net</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {medicines.map((item, index) => {
              const gross = item.returnQty * item.rate
              const discount = (gross * item.discPercent) / 100
              const taxable = gross - discount
              const gst = (taxable * item.gstPercent) / 100
              const net = taxable + gst

              return (
                <CTableRow key={item.id}>
                  <CTableDataCell>{item.name}</CTableDataCell>
                  <CTableDataCell>{item.batch}</CTableDataCell>
                  <CTableDataCell>{item.soldQty}</CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      type="number"
                      min="0"
                      value={item.returnQty}
                      onChange={(e) => handleReturnQty(index, e.target.value)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{item.rate}</CTableDataCell>
                  <CTableDataCell>{item.discPercent}</CTableDataCell>
                  <CTableDataCell>{item.gstPercent}</CTableDataCell>
                  <CTableDataCell>₹{item.netAmount}</CTableDataCell>
                </CTableRow>
              )
            })}
          </CTableBody>
        </CTable>

        {/* SUMMARY */}
        <CRow className="mt-4" style={{ color: 'var(--color-black)' }}>
          <CCol md={3}>
            <strong>Total:</strong> ₹{summary.totalReturn.toFixed(2)}
          </CCol>
          <CCol md={3}>
            <strong>Discount:</strong> ₹{summary.totalDiscount.toFixed(2)}
          </CCol>
          <CCol md={3}>
            <strong>GST:</strong> ₹{summary.totalGST.toFixed(2)}
          </CCol>
          <CCol md={3}>
            <strong>Net Refund:</strong> ₹{summary.netRefund.toFixed(2)}
          </CCol>
        </CRow>

        <CRow className="mt-5 d-flex justify-content-between">
          <CCol xs="auto">
            <CButton
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
              onClick={() => setShowModal(true)}
            >
              View Sales Return Bill
            </CButton>
          </CCol>
          <CCol xs="auto">
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
              onClick={handleSave}
            >
              Save & Generate Bill
            </CButton>
          </CCol>
        </CRow>

        {/* RETURN BILL */}
        {showBill && (
          <div id="printableArea" className="mt-5 p-4 border">
            <h4 className="text-center">RETURN BILL / CREDIT NOTE</h4>
            <hr />
            <p>
              <strong>Return No:</strong> {returnNo}
            </p>
            <p>
              <strong>Original Bill No:</strong> {billNo}
            </p>
            <p>
              <strong>Date:</strong> {new Date().toLocaleString()}
            </p>
            <p>
              <strong>Refund Mode:</strong> {refundMode}
            </p>

            <CTable bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Medicine</CTableHeaderCell>
                  <CTableHeaderCell>Qty</CTableHeaderCell>
                  <CTableHeaderCell>Amount</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {medicines
                  .filter((m) => m.returnQty > 0)
                  .map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.returnQty}</CTableDataCell>
                      <CTableDataCell>
                        ₹
                        {(
                          item.returnQty * item.rate -
                          (item.returnQty * item.rate * item.discPercent) / 100 +
                          ((item.returnQty * item.rate -
                            (item.returnQty * item.rate * item.discPercent) / 100) *
                            item.gstPercent) /
                            100
                        ).toFixed(2)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>

            <h5 className="text-end">Net Refund: ₹{summary.netRefund.toFixed(2)}</h5>

            <div className="text-center mt-3">
              <CButton color="dark" onClick={() => window.print()}>
                Print
              </CButton>
            </div>
          </div>
        )}
      </CCardBody>
    </CCard>
    <SalesReturnBillModal visible={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

export default OPSalesReturn
