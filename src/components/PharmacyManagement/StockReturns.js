import React, { useState } from 'react'
import {
  CCard,
  CRow,
  CCol,
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
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import PrintLetterHead from '../../Utils/PrintLetterHead'
import { getPurchaseByBillNo } from './PurchasesAPI'
import { showCustomToast } from '../../Utils/Toaster'
import { Spinner } from 'react-bootstrap'
import ConfirmationModal from '../ConfirmationModal'
import { formatDateTime } from '../../Utils/FormatDate'
import CIcon from '@coreui/icons-react'
import { cilEyedropper, cilPencil, cilPrint, cilTrash } from '@coreui/icons'
import { Edit2, Eye, Printer, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  createReturnBill,
  deleteReturnBill,
  getReturnBillByClinicAndBranch,
  updateSalesReturn,
} from './OpSalesAPI'
import LoadingIndicator from '../../Utils/loader'
import { useMedicines } from '../../Context/MedicineContext'
const StockReturn = () => {
  const [billNo, setBillNo] = useState('')
  const [supplierinfo, setSupplierinfo] = useState({
    supplierName: '',
    supplierId: '',
  })
  const [returnType, setReturnType] = useState('Partial')
  const [refundMode, setRefundMode] = useState('Credit')
  const [items, setItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveClicked, setSaveClicked] = useState(false)
  const isReturnValid = items.some((item) => item.returnQty > 0)
  const [showModal, setShowModal] = useState(false)
  const [returnList, setReturnList] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [delloading, setDelLoading] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const [previewData, setPreviewData] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [getloading, setGetloading] = useState(false)
  const [postLoading, setPostLoading] = useState(false)
  const { fetchInventory } = useMedicines()
  const fetchBill = async () => {
    try {
      setLoading(true)
      const clinicId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')

      if (!billNo) {
        showCustomToast('Enter Bill No')
        return
      }

      const data = await getPurchaseByBillNo(clinicId, branchId, billNo)

      console.log('PURCHASE DATA', data)

      setSupplierinfo({
        supplierName: data.supplierDetails.supplierName,
        supplierId: data.supplierDetails.supplierId,
      })

      const itemList = data.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        batchNo: item.batchNo,
        expDate: item.expDate,
        availableStock: item.availableQty,
        netRate: item.costPrice,
        mrp: item.mrp,
        returnQty: 0,
        returnAmount: 0,
        reason: '',
      }))

      setItems(itemList)
    } catch (err) {
      showCustomToast(`${err.response?.data?.message || 'Bill not found'},'error'`)

      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setBillNo('')
    setSupplierinfo({
      supplierName: '',
      supplierAddress: '',
    })
    setItems([])
    setTotalAmount(0)
    setEditIndex(null)
    setSaveClicked(false)
  }

  // ================= HANDLE RETURN QTY =================
  const handleQty = (index, value) => {
    const updated = [...items]
    const qty = parseFloat(value) || 0

    if (qty > updated[index].availableStock) {
      showCustomToast('Return qty exceeds stock')
      return
    }

    updated[index].returnQty = qty
    updated[index].returnAmount = qty * updated[index].netRate

    setItems(updated)

    const total = updated.reduce((sum, item) => sum + item.returnAmount, 0)

    setTotalAmount(total)
  }

  // ================= SAVE =================
  const handleSave = async () => {
    const returnItems = items.filter((i) => i.returnQty > 0)

    if (returnItems.length === 0) {
      showCustomToast('Enter return quantity')
      return
    }
    // ✅ reason required validation
    const invalidReason = returnItems.find((item) => !item.reason || item.reason.trim() === '')

    // ✅ check reason only on save click
    for (let item of returnItems) {
      if (!item.reason || item.reason.trim() === '') {
        showCustomToast(`Reason required for ${item.productName}`)
        return
      }
    }
    try {
      setPostLoading(true)

      const payload = {
        billNo,
        supplierName: supplierinfo.supplierName,
        supplierId: supplierinfo.supplierId,
        returnType,
        refundMode,
        // totalAmount,
        clinicId: localStorage.getItem('HospitalId'),
        branchId: localStorage.getItem('branchId'),
        // date: new Date().toISOString(),
        createdBy: localStorage.getItem('staffName') || localStorage.getItem('role'),
        items: returnItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          batchNo: item.batchNo,
          returnQty: item.returnQty,
          netRate: item.netRate,
          mrp: item.mrp,
          // returnAmount: item.returnAmount,
          reason: item.reason,
          availableStock: item.availableStock,
        })),
      }

      console.log('STOCK RETURN PAYLOAD', payload)

      // TODO:remove after api get
      // =======================
      const res = await createReturnBill(payload)
      console.log('🔥 RETURN BILL RESPONSE:', res)
      // // ✅ get old
      // const oldData = res || []
      // if (editIndex !== null) {
      //   // ✅ update
      //   oldData[editIndex] = payload
      // } else {
      //   // ✅ new save
      //   oldData.push(payload)
      // }

      // localStorage.setItem('stockReturns', JSON.stringify(oldData))
      if (res.status === 200) {
        setEditIndex(null)
        // ========================
        // 👉 API call here
        // saveStockReturn(payload)
        setReceiptData(res.data)
        setShowReceipt(true)
        showCustomToast(res.message)
        loadReturns()
        clearForm()
        fetchInventory()
      } else {
        showCustomToast(res.message)
      }
    } catch (err) {
      console.error('API error:', err)
      showCustomToast('Failed to save Return Bill.', 'error')
    } finally {
      setPostLoading(false)
    }
  }

  const loadReturns = async () => {
    try {
      setGetloading(true)
      const clinicId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')

      const data = await getReturnBillByClinicAndBranch(clinicId, branchId)

      console.log('Return Bills:', data)

      setReturnList(data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setGetloading(false)
    }
  }
  const openModal = () => {
    loadReturns()
    setShowModal(true)
  }

  const handleDelete = (index) => {
    setDeleteIndex(index)
    setIsDeleteModalVisible(true)
  }
  const confirmDeleteMedicine = async () => {
    try {
      setDelLoading(true)

      const selected = returnList[deleteIndex]

      if (!selected?.receiptNo) {
        showCustomToast('Receipt No not found')

        // ✅ close modal even if error
        setIsDeleteModalVisible(false)
        setDeleteIndex(null)
        return
      }

      // ✅ close modal first
      setIsDeleteModalVisible(false)

      const res = await deleteReturnBill(selected.receiptNo)

      showCustomToast(res.message)

      await loadReturns() // ✅ wait refresh

      setDeleteIndex(null)
    } catch (err) {
      console.log(err)
      showCustomToast('Delete failed')

      setIsDeleteModalVisible(false)
      setDeleteIndex(null)
    } finally {
      setDelLoading(false)
    }
  }
  const handleView = (data) => {
    setPreviewData(data)
    setShowPreviewModal(true)
    setShowModal(false)
  }
  const handleEdit = (data) => {
    setBillNo(data.billNo)

    setSupplierinfo({
      supplierName: data.supplierName,
      supplierId: data.supplierId || '',
    })

    setItems(data.items)

    setTotalAmount(data.totalAmount)

    setEditIndex(data) // must contain returnNo

    setShowModal(false)
  }

  const handleUpdate = async () => {
    try {
      if (!editIndex?.receiptNo) {
        alert('Return No missing')
        return
      }

      const payload = {
        receiptNo: editIndex.receiptNo,
        billNo,
        supplierName: supplierinfo.supplierName,
        supplierId: supplierinfo.supplierId,
        returnType,
        refundMode,
        clinicId: localStorage.getItem('HospitalId'),
        branchId: localStorage.getItem('branchId'),
        // date: new Date().toISOString(),
        createdBy: localStorage.getItem('staffName') || localStorage.getItem('role'),
        items,
        totalAmount,
      }
      //   const payload = {
      //   billNo,
      //   supplierName: supplierinfo.supplierName,
      //   supplierId: supplierinfo.supplierId,
      //   returnType,
      //   refundMode,
      //   // totalAmount,
      //   clinicId: localStorage.getItem('HospitalId'),
      //   branchId: localStorage.getItem('branchId'),
      //   // date: new Date().toISOString(),
      //   createdBy: localStorage.getItem('staffName') || localStorage.getItem('role'),
      //   items: returnItems.map((item) => ({
      //     productId: item.productId,
      //     productName: item.productName,
      //     batchNo: item.batchNo,
      //     returnQty: item.returnQty,
      //     netRate: item.netRate,
      //     mrp: item.mrp,
      //     // returnAmount: item.returnAmount,
      //     reason: item.reason,
      //     availableStock: item.availableStock,
      //   })),
      // }

      console.log(payload)

      const res = await updateSalesReturn(editIndex.receiptNo, payload)

      console.log(res)
      showCustomToast(res.message || 'Updated Successfully')
      clearForm()
      fetchInventory()
    } catch (err) {
      console.log(err)
      showCustomToast(err.response?.data?.message || 'Failed to update Return Bill.', 'error')
    }
  }

  // ================= PRINT =================
  const handlePrint = () => {
    window.print()
  }
  const handlePrintFromList = (data) => {
    setReceiptData(data)

    setShowReceipt(true)

    setShowModal(false)
  }
  const handleReason = (index, value) => {
    const updated = [...items]

    updated[index].reason = value

    setItems(updated)
  }

  const filteredList = returnList.filter((r) => {
    const text = search.toLowerCase()

    return (
      (r.billNo || '').toLowerCase().includes(text) ||
      (r.supplierName || '').toLowerCase().includes(text) ||
      (r.receiptNo || '').toLowerCase().includes(text) ||
      String(r.totalAmount || '').includes(text) ||
      (r.date || '').toLowerCase().includes(text)
    )
  })
  return (
    <>
      {/* ================= MAIN UI ================= */}
      <CCard className="p-4 shadow-sm">
        <h5 className="mb-4">Stock Return</h5>

        <CRow className="mb-4 g-3">
          <CCol md={6}>
            <CFormLabel>Purchase Bill No</CFormLabel>

            <CRow className="g-2">
              <CCol md={8}>
                <CFormInput
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  placeholder="Enter Bill No"
                />
              </CCol>

              <CCol md={4}>
                <CButton
                  className="w-100"
                  style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                  onClick={fetchBill}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Fetch Bill'}
                </CButton>
              </CCol>
            </CRow>
          </CCol>

          <CCol md={2}>
            <CFormLabel>Return Type</CFormLabel>
            <CFormSelect value={returnType} onChange={(e) => setReturnType(e.target.value)}>
              <option>Partial</option>
              <option>Full</option>
            </CFormSelect>
          </CCol>
          {/* <CCol md={3}>
            <CFormLabel>Return reason</CFormLabel>
            <CFormInput value={billNo} onChange={(e) => setBillNo(e.target.value)} />
          </CCol> */}
          <CCol md={4}>
            <CFormLabel>Payment Mode</CFormLabel>
            <CFormSelect value={refundMode} onChange={(e) => setRefundMode(e.target.value)}>
              <option>Cash</option>
              <option>Card</option>
              <option>Credit</option>
            </CFormSelect>
          </CCol>
        </CRow>

        <CTable bordered hover responsive className="pink-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Product</CTableHeaderCell>
              <CTableHeaderCell>Batch</CTableHeaderCell>
              <CTableHeaderCell>Available</CTableHeaderCell>
              <CTableHeaderCell>Return Qty</CTableHeaderCell>
              <CTableHeaderCell>Reason</CTableHeaderCell>
              <CTableHeaderCell>MRP</CTableHeaderCell>
              <CTableHeaderCell>Cost</CTableHeaderCell>
              <CTableHeaderCell>Amount</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {items.map((item, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{item.productName}</CTableDataCell>
                <CTableDataCell>{item.batchNo}</CTableDataCell>
                <CTableDataCell>{item.availableStock}</CTableDataCell>

                <CTableDataCell>
                  <CFormInput
                    type="number"
                    value={item.returnQty}
                    onChange={(e) => handleQty(index, e.target.value)}
                  />
                </CTableDataCell>
                <CTableDataCell>
                  <CFormInput
                    type="text"
                    value={item.reason}
                    invalid={
                      saveClicked &&
                      item.returnQty > 0 &&
                      (!item.reason || item.reason.trim() === '')
                    }
                    onChange={(e) => handleReason(index, e.target.value)}
                  />
                  {saveClicked &&
                    item.returnQty > 0 &&
                    (!item.reason || item.reason.trim() === '') && (
                      <div style={{ color: 'red', fontSize: 12 }}>Reason required</div>
                    )}
                </CTableDataCell>

                <CTableDataCell>₹ {item.mrp}</CTableDataCell>
                <CTableDataCell>₹ {item.netRate}</CTableDataCell>

                <CTableDataCell>₹ {item.returnAmount}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <CRow className="mt-3">
          <CCol className="text-end">
            <h5>Total Return: ₹ {totalAmount.toFixed(2)}</h5>
          </CCol>
        </CRow>

        <CRow className="mt-3">
          <CCol className="d-flex justify-content-between w-100">
            <CButton
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
              className="ms-2"
              onClick={openModal}
              // onClick={() => navigate('/stock-return-list')}
            >
              View Stock Returns
            </CButton>
            {/* <CButton
              onClick={handleSave}
              disabled={!isReturnValid}
              style={{
                backgroundColor: isReturnValid ? 'var(--color-black)' : '#999',
                color: 'white',
                cursor: isReturnValid ? 'pointer' : 'not-allowed',
              }}
            >
              {editIndex !== null ? 'Update & Generate Receipt' : 'Save & Generate Receipt'}
            </CButton> */}

            <CButton
              onClick={editIndex === null ? handleSave : handleUpdate}
              disabled={postLoading}
              style={{
                backgroundColor: 'var(--color-black)',
                color: 'white',
              }}
            >
              {postLoading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  {editIndex !== null ? 'Updating...' : 'Saving...'}
                </>
              ) : editIndex !== null ? (
                'Update & Generate Receipt'
              ) : (
                'Save & Generate Receipt'
              )}
            </CButton>
          </CCol>
        </CRow>
      </CCard>
      {/* ================= RECEIPT BELOW ================= */}
      {showReceipt && (
        <div id="printableArea" className="mt-4">
          <PrintLetterHead>
            {/* ===== PRINT ONLY HEADER ===== */}
            <div
              className="receipt-view mt-2 p-2"
              style={{
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              }}
            >
              {/* ===== TITLE ===== */}
              <h5 className="text-center fw-bold mb-4" style={{ color: '#000' }}>
                STOCK RETURN RECEIPT
              </h5>

              {/* ===== BILL DETAILS ===== */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  color: '#000',
                }}
              >
                <div>
                  <div style={{ color: '#000' }}>
                    <strong>Receipt No:</strong> {receiptData?.receiptNo}
                  </div>
                  <div style={{ color: '#000' }}>
                    <strong>Bill No:</strong> {receiptData?.billNo}
                  </div>

                  <div style={{ color: '#000' }}>
                    <strong>Supplier:</strong> {receiptData?.supplierName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#000' }}>
                    <strong>Date:</strong> {formatDateTime(receiptData?.date)}
                  </div>

                  <div style={{ color: '#000' }}>
                    <strong>Return Type:</strong> {returnType}
                  </div>
                  <div style={{ color: '#000' }}>
                    <strong>Refund Mode:</strong> {refundMode}
                  </div>
                </div>
              </div>

              {/* ===== TABLE ===== */}
              <CTable bordered responsive className="mb-3" style={{ color: '#000' }}>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Qty</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Reason</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">MRP</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cost</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Amount</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {receiptData.items
                    ?.filter((i) => i.returnQty > 0)
                    .map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{item.productName}</CTableDataCell>
                        <CTableDataCell className="text-center">{item.returnQty}</CTableDataCell>
                        <CTableDataCell className="text-center">{item.reason}</CTableDataCell>
                        <CTableDataCell className="text-center">{item.mrp}</CTableDataCell>
                        <CTableDataCell className="text-center">₹ {item.netRate}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          ₹ {item.returnAmount}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                </CTableBody>
                {/* ===== TOTAL ===== */}
                <tfoot
                  style={{
                    pageBreakInside: 'avoid',
                  }}
                >
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      Total Refund
                    </td>

                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
                      ₹ {receiptData?.totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </CTable>
              {/* <CRow style={{ color: '#000' }}>
                <CCol md={6} className="text-end">
                  <h5 className="fw-bold" style={{ color: '#000' }}>
                    Total Refund: ₹ {receiptData?.totalAmount}
                  </h5>
                </CCol>
              </CRow> */}

              {/* ===== FOOTER ===== */}
              {/* <CRow className="mt-5 pt-3 border-top print-only-header" style={{ color: '#000' }}>
                <CCol md={6}>
                  <p>Authorized Signature</p>
                </CCol>
                <CCol md={6} className="text-end">
                  <p>Thank You. Visit Again!</p>
                </CCol>
              </CRow> */}
            </div>
          </PrintLetterHead>
          {/* ===== PRINT BUTTON ===== */}
          <div className="text-center mt-4 no-print">
            <CButton
              onClick={handlePrint}
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            >
              Print Receipt
            </CButton>
            <CButton color="secondary" className="ms-2" onClick={() => setShowReceipt(false)}>
              Close
            </CButton>
          </div>
        </div>
      )}
      <CModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        size="xl"
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader className="fw-bold" style={{ color: 'var(--color-black)' }}>
          Stock Return Preview
        </CModalHeader>

        <CModalBody>
          {previewData && (
            <div>
              <CRow className="mb-3">
                {/* LEFT */}

                <CCol md={6}>
                  <p>
                    <b>Receipt No :</b> {previewData.receiptNo}
                  </p>

                  <p>
                    <b>Bill :</b> {previewData.billNo}
                  </p>

                  <p>
                    <b>Supplier :</b> {previewData.supplierName}
                  </p>

                  <p>
                    <b>Supplier Id :</b> {previewData.supplierId}
                  </p>
                </CCol>

                {/* RIGHT */}

                <CCol md={6} className="text-end">
                  <p>
                    <b>Return Type :</b> {previewData.returnType}
                  </p>

                  <p>
                    <b>Refund Mode :</b> {previewData.refundMode}
                  </p>

                  <p>
                    <b>Date :</b> {formatDateTime(previewData.date)}
                  </p>
                </CCol>
              </CRow>

              <CTable bordered className="pink-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Product</CTableHeaderCell>
                    <CTableHeaderCell>Batch</CTableHeaderCell>
                    <CTableHeaderCell>AvailableStock</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                    <CTableHeaderCell>MRP</CTableHeaderCell>
                    <CTableHeaderCell>Cost</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Reason</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {previewData.items?.map((i, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{i.productName}</CTableDataCell>
                      <CTableDataCell>{i.batchNo}</CTableDataCell>
                      <CTableDataCell>{i.availableStock}</CTableDataCell>
                      <CTableDataCell>{i.returnQty}</CTableDataCell>
                      <CTableDataCell>{i.mrp}</CTableDataCell>
                      <CTableDataCell>{i.netRate}</CTableDataCell>
                      <CTableDataCell>{i.returnAmount}</CTableDataCell>
                      <CTableDataCell>{i.reason}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <CRow className="mt-3">
                <CCol md={12} className="text-end">
                  <h5>Total Amount : ₹ {previewData.totalAmount}</h5>
                </CCol>
              </CRow>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <div className="text-end mt-3">
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
              onClick={() => {
                setReceiptData(previewData)
                setShowReceipt(true)
                setShowPreviewModal(false)
              }}
            >
              Print
            </CButton>

            <CButton color="secondary" className="ms-2" onClick={() => setShowPreviewModal(false)}>
              Close
            </CButton>
          </div>
        </CModalFooter>
      </CModal>
      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        size="xl"
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader>
          <h5>Stock Returns</h5>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            placeholder="Search Bill / Supplier"
            className="mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CTable bordered className="pink-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Receipt No</CTableHeaderCell>
                <CTableHeaderCell>Bill No</CTableHeaderCell>
                <CTableHeaderCell>Supplier</CTableHeaderCell>
                <CTableHeaderCell>Created By</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Total</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {getloading ? (
                <CTableRow>
                  <CTableDataCell colSpan={8} className="text-center">
                    <LoadingIndicator message="Return Stocks..." />
                  </CTableDataCell>
                </CTableRow>
              ) : filteredList.length > 0 ? (
                filteredList.map((r, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell>{i + 1}</CTableDataCell>
                    <CTableDataCell>{r.receiptNo}</CTableDataCell>
                    <CTableDataCell>{r.billNo}</CTableDataCell>
                    <CTableDataCell>{r.supplierName}</CTableDataCell>
                    <CTableDataCell>{r.createdBy}</CTableDataCell>
                    <CTableDataCell>{formatDateTime(r.date)}</CTableDataCell>
                    <CTableDataCell>{r.totalAmount}</CTableDataCell>

                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton
                          size="sm"
                          style={{
                            color: 'var(--color-black)',
                            backgroundColor: 'var(--color-bgcolor)',
                          }}
                          onClick={() => handleView(r)}
                        >
                          <Eye size={16} />
                        </CButton>

                        <CButton
                          size="sm"
                          style={{
                            color: 'var(--color-black)',
                            backgroundColor: 'var(--color-bgcolor)',
                          }}
                          onClick={() => handleEdit(r)}
                        >
                          <Edit2 size={16} />
                        </CButton>

                        <CButton
                          size="sm"
                          style={{
                            color: 'var(--color-black)',
                            backgroundColor: 'var(--color-bgcolor)',
                          }}
                          onClick={() => handleDelete(i)}
                        >
                          <Trash size={16} />
                        </CButton>

                        <CButton
                          size="sm"
                          style={{
                            color: 'var(--color-black)',
                            backgroundColor: 'var(--color-bgcolor)',
                          }}
                          onClick={() => handlePrintFromList(r)}
                        >
                          <Printer size={16} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={8} className="text-center text-danger">
                    No Data Found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CModalBody>
      </CModal>
      {/* if(getloading)
      {
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      } */}
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete Stock Return"
        message="Are you sure you want to delete this stock return?"
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={confirmDeleteMedicine}
        onCancel={() => {
          setIsDeleteModalVisible(false)
          setDeleteIndex(null)
        }}
      />
      {/* ================= PRINT CSS ================= */}
      <style>
        {`
          /* Hide everything when printing */
@media print {
  body * {
    visibility: hidden;
  }

  /* Show only receipt */
  #printableArea,
  #printableArea * {
    visibility: visible;
  }

  /* Position receipt properly */
  #printableArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Hide buttons */
  .no-print {
    display: none !important;
  }

  /* Show clinic header only in print */
  .print-only-header {
    display: flex !important;
    justify-content: space-between;
    margin-bottom: 20px;
  }
}
  .print-header-left {
    width: 30% !important;
  }

  .print-header-right {
    width: 70% !important;
  }
    .print-letter {
  padding-bottom: 120px;
}
.letter-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
@media print {

  table {
    page-break-inside: avoid;
  }

  tr {
    page-break-inside: avoid;
  }

  .receipt-view {
    page-break-inside: avoid;
  }

}  
  
/* Hide print header on screen */
.print-only-header {
  display: none;
}
        `}
      </style>
    </>
  )
}

export default StockReturn
