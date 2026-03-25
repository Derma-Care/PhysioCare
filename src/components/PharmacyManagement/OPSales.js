/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import {
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCardBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilPrint, cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons'
import { getAllOpSales } from './OpSalesAPI'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { showCustomToast } from '../../Utils/Toaster'
import { useMedicines } from '../../Context/MedicineContext'
import Select from 'react-select'
import { dummyMedicines, dummyPatients } from './Reorder/dummyProductData'
import { http } from '../../Utils/Interceptors'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import { formatDateTime } from '../../Utils/FormatDate'
import { getInventory } from './InventoryAPI'

const handleSearch = () => {
  const searchValue = search.trim().toLowerCase()

  if (!searchValue) {
    setFilteredList(historyList)
    return
  }

  const filtered = historyList.filter((item) => {
    const billNo = item.billNo ? String(item.billNo).toLowerCase() : ''
    const mobile = item.mobile ? String(item.mobile) : ''
    const name = item.patientName ? item.patientName.toLowerCase() : ''

    return (
      billNo.includes(searchValue) || mobile.includes(searchValue) || name.includes(searchValue)
    )
  })

  setFilteredList(filtered)
}
const OPSales = () => {
  const [OpsaleData, setOpSaleData] = useState([])
  const [viewModal, setViewModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const { medicines, loading, inventory, fetchInventory } = useMedicines()
  const [editModal, setEditModal] = useState(false)
  const { doctorData, fetchDoctors } = useHospital()
  const [oploading, setOPLoading] = useState(false)
  const [editSaleId, setEditSaleId] = useState(null)
  const [search, setSearch] = useState('')
  const [printModal, setPrintModal] = useState(false)
  const [billNo, setBillNo] = useState('')
  const [historyModal, setHistoryModal] = useState(false)
  const [patientMode, setPatientMode] = useState('manual')
  const [filteredList, setFilteredList] = useState([])
  const [searchData, setSearchData] = useState({
    billNo: '',
    mobileNo: '',
    fileNo: '',
  })
  const [historyList, setHistoryList] = useState([])
  const [includeReturns, setIncludeReturns] = useState(false)

  const [financialYear, setFinancialYear] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilters, setStatusFilters] = useState('')
  const [patientDetails, setPatientDetails] = useState({})
  const [roomDetails, setRoomDetails] = useState({})
  const [opNo, setOpNo] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [deleteId, setDeleteId] = useState(null) // for API

  const [selectionType, setSelectionType] = useState('')
  const [selectionBy, setSelectionBy] = useState('')
  const [medName, setMedName] = useState('')
  const [editIndex, setEditIndex] = useState(null)
  const [rackNo, setRackNo] = useState('')
  const [vat, setVat] = useState('')
  const [vatAmount, setVatAmount] = useState('')
  const [currentStock, setCurrentStock] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [qty, setQty] = useState('')
  const [mrp, setmrp] = useState('')
  const [paid, setPaid] = useState(0)
  const [paidNow, setPaidNow] = useState(0)

  const [totalPaid, setTotalPaid] = useState(0)
  const doctorList = doctorData?.data || []

  // console.log(doctorData.data)

  const [discPerc, setDiscPerc] = useState('')
  const [discAmt, setDiscAmt] = useState('')
  const [totalAmt, setTotalAmt] = useState('')
  const [expDate, setExpDate] = useState('')
  // const [mrp, setMrp] = useState('')

  const [formRow, setFormRow] = useState({
    medicineName: '',
    batchNo: '',
    qty: '',
    mrp: '',
    disc: '',
    vatPercent: '',
    paidAmt: '',
  })

  // Local derived totals
  const [totals, setTotals] = useState({ totalAmt: 0, totalTax: 0, netAmt: 0 })

  useEffect(() => {
    loadOpSales()
    fetchInventory()
  }, [])
  const handleSave = async () => {
    console.log('opsales calling')

    try {
      const now = new Date()

      const billDate = now.toISOString().slice(0, 10)

      const billTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      const medicinesPayload = OpsaleData.map((m) => ({
        medicineId: m.medicineId,
        medicineName: m.medicineName,
        batchNo: m.batchNo,
        expDate: m.expiryDate,
        qty: m.qty,
        rate: m.mrp,
        totalA: m.total,
        discPercent: m.disc,
        discAmtB: m.discAmount,
        netAmtAB: m.netAmt,
        gstPercent: m.gstPercent,
        gstAmtC: m.gstamt,
        finalAmountABC: m.finalamount,
      }))

      const payload = {
        billNo: billNo,
        billDate: billDate,
        billTime: billTime,
        visitType: patientMode === 'manual' ? 'Out Patient (Manual)' : 'Fetch by OPNO',
        opNo: opNo,
        payCategory: 'SELF PAY',
        patientName: patientDetails.name,
        mobile: patientDetails.mobilenumber,
        age: 5,
        sex: patientDetails.sex,
        consultingDoctor: patientDetails.consultingDoctor,
        includeReturns: includeReturns,
        medicines: medicinesPayload,
        amountPaid: paidNow,
        clinicId: localStorage.getItem('HospitalId'),
        branchId: localStorage.getItem('branchId'),
      }

      console.log('Payload:', payload)

      let response

      // 🔹 EDIT API
      if (editSaleId) {
        response = await http.put(`/op-sales/updateSale`, payload)
      }
      // 🔹 CREATE API
      else {
        response = await http.post('/op-sales/createOpSales', payload)
      }

      if (response.status === 200) {
        showCustomToast(editSaleId ? 'Updated successfully ✅' : 'Saved successfully ✅')

        setEditSaleId(null)

        loadOpSales() // refresh history list
      }
    } catch (error) {
      console.log(error)
      showCustomToast('Failed to save ❌')
    }
  }
  const handleView = (index) => {
    const sale = filteredList[index] // or your table data array
    setSelectedSale(sale)
    setViewModal(true)
  }
  const openDeleteModal = (index, id = null) => {
    setDeleteIndex(index)
    setDeleteId(id) // sale id (for API)
    setDeleteModal(true)
  }

  // const handleSave = () => {
  //   const payload = {
  //     billNo,
  //     patientDetails,
  //     items: OpsaleData,
  //     total: totals.netAmt,
  //     paid,
  //     due: totals.netAmt - paid,
  //   }

  //   console.log(payload)
  // }

  // ---------------- GET ALL PURCHASES ----------------
  const loadOpSales = async () => {
    setOPLoading(true)
    try {
      const data = await getAllOpSales()
      // Expecting data to be an array of rows matching the table shape
      console.log('loadOpSales data', data)
      setHistoryList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadOpSales error', err)
      setHistoryList([])
    } finally {
      setOPLoading(false)
    }
  }

  useEffect(() => {
    const searchValue = search.trim().toLowerCase()

    const filtered = historyList.filter((item) => {
      return (
        item.billNo?.toString().toLowerCase().includes(searchValue) ||
        item.mobile?.toString().includes(searchValue) ||
        item.patientName?.toLowerCase().includes(searchValue)
      )
    })

    setFilteredList(filtered)
  }, [search, historyList])
  // Handle input change for form row
  const handleRowChange = (e) => {
    const { name, value } = e.target
    setFormRow((prev) => ({ ...prev, [name]: value }))
  }

  // Add new row or update existing
  const handleAddOrUpdate = () => {
    // compute numeric fields carefully (digit-by-digit as required by instruction)
    const qty = Number(formRow.qty) || 0
    const mrp = Number(formRow.mrp) || 0
    const discPct = Number(formRow.disc) || 0
    const vatPct = Number(formRow.vatPercent) || 0

    const total = Number((qty * mrp).toFixed(2))
    const discAmount = Number(((discPct / 100) * total).toFixed(2))
    const netBeforeVat = Number((total - discAmount).toFixed(2))
    const vatAmount = Number(((vatPct / 100) * netBeforeVat).toFixed(2))
    const netAmt = Number((netBeforeVat + vatAmount).toFixed(2))

    const newRow = {
      medicineName: formRow.medicineName,
      batchNo: formRow.batchNo,
      qty,
      availableQty: currentStock,
      mrp,
      total,
      disc: discPct,
      discAmount,
      vatPercent: vatPct,
      vatAmount,
      netAmt,
      paidAmt: Number(formRow.paidAmt) || 0,
      // you can extend with additional fields returned by API later
    }

    if (editIndex !== null && editIndex >= 0 && editIndex < OpsaleData.length) {
      const updated = [...OpsaleData]
      updated[editIndex] = { ...updated[editIndex], ...newRow }
      setOpSaleData(updated)
      setEditIndex(null)
    } else {
      // append
      setOpSaleData((prev) => [...prev, newRow])
    }

    // reset form
    setFormRow({
      medicineName: '',
      batchNo: '',
      qty: '',
      mrp: '',
      disc: '',
      vatPercent: '',
      paidAmt: '',
    })
  }

  const handleEdit = async (index) => {
    const sale = filteredList[index]
    if (!sale) return

    setEditSaleId(sale.id)
    setBillNo(sale.billNo)

    setPatientDetails({
      name: sale.patientName,
      mobilenumber: sale.mobile,
      age: sale.age,
      sex: sale.sex,
      consultingDoctor: sale.consultingDoctor,
    })

    const rows = await Promise.all(
      (sale.medicines || []).map(async (med) => {
        const invList = await getInventory(med.medicineId)

        console.log('INV LIST:', invList)

        const invArray = Array.isArray(invList) ? invList : invList?.data || []

        const invData = invArray.find((item) => item.medicineId === med.medicineId)

        const inv = invData?.inventory?.[0] || {}

        return {
          medicineId: med.medicineId,
          medicineName: med.medicineName || 'Unknown',

          batchNo: inv?.batchNo || med.batchNo || '-',

          expiryDate: inv?.expiryDate || med.expiryDate || med.expDate || '-',

          availableQty: inv?.availableQty || inv?.available_quantity || inv?.stock || 0,

          qty: med.qty || 0,
          mrp: med.rate || 0,

          total: med.totalA || 0,
          disc: med.discPercent || 0,
          discAmount: med.discAmtB || 0,
          netAmt: med.netAmtAB || 0,

          gstPercent: med.gstPercent || 0,
          gstamt: med.gstAmtC || 0,
          finalamount: med.finalAmountABC || 0,
        }
      }),
    )

    console.log('FINAL ROWS:', rows)

    setOpSaleData([...rows])
    setPaidNow(sale.amountPaid || 0)

    setHistoryModal(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (index) => {
    const filtered = OpsaleData.filter((_, i) => i !== index)
    setOpSaleData(filtered)
    // if we were editing that row, reset
    if (editIndex === index) {
      setEditIndex(null)
      setFormRow({
        medicineName: '',
        batchNo: '',
        qty: '',
        mrp: '',
        disc: '',
        vatPercent: '',
        paidAmt: '',
      })
    }
  }
  const confirmDelete = async () => {
    try {
      // 🔥 API DELETE (for history)
      if (deleteId) {
        const clinicId = localStorage.getItem('HospitalId')
        const branchId = localStorage.getItem('branchId')

        await http.delete(`/op-sales/${clinicId}/${branchId}/${deleteId}`)

        showCustomToast('Deleted successfully ✅')
        setHistoryList((prev) => prev.filter((item) => item.id !== deleteId))
        // setFilteredList((prev) => prev.filter((item) => item.id !== deleteId))
      }

      // 🔥 LOCAL DELETE (medicine row)
      else if (deleteIndex !== null) {
        const filtered = OpsaleData.filter((_, i) => i !== deleteIndex)
        setOpSaleData(filtered)

        if (editIndex === deleteIndex) {
          setEditIndex(null)
          setFormRow({
            medicineName: '',
            batchNo: '',
            qty: '',
            mrp: '',
            disc: '',
            vatPercent: '',
            paidAmt: '',
          })
        }

        showCustomToast('Row deleted ✅')
      }

      // reset
      setDeleteModal(false)
      setDeleteIndex(null)
      setDeleteId(null)
    } catch (error) {
      console.log(error)
      showCustomToast('Delete failed ❌')
    }
  }
  const genemrpBillNo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  useEffect(() => {
    setBillNo(genemrpBillNo())
  }, [])

  // Recalculate totals whenever OpsaleData changes
  useEffect(() => {
    let totalAmt = 0
    let gstTotal = 0
    let finalTotal = 0
    let discTotal = 0

    OpsaleData.forEach((r) => {
      totalAmt += r.total || 0

      gstTotal += r.gstamt || 0

      finalTotal += r.netAmt || 0

      discTotal += r.discAmount || 0
    })

    setTotals({
      totalAmt: Math.round(totalAmt),
      totalTax: Math.round(gstTotal),
      netAmt: Math.round(finalTotal),
      discTotal: Math.round(discTotal),
    })
  }, [OpsaleData])
  // const fetchPatientByOpNo = async () => {
  //   try {
  //     const response = await fetch(`/api/patient/${opNo}`)
  //     const data = await response.json()

  //     setPatientDetails(data)
  //   } catch (error) {
  //     console.error('Patient fetch error', error)
  //   }
  // }
const fetchPatientByOpNo = () => {
  const patient = dummyPatients[opNo]

  if (!patient) return

  setPatientDetails({
    name: patient.name,
    mobilenumber: patient.mobilenumber,
    age: patient.age,
    sex: patient.sex,
    consultingDoctor: patient.consultingDoctor,
  })

  const rows = patient.medicines.flatMap((id) => {
    const med = inventory?.find(
      (m) => m.medicineId === id
    )

    if (!med) return []

    if (!Array.isArray(med.inventory)) return []

    return med.inventory
      .filter((b) => b) // remove undefined
      .map((batch) => createRowFromMedicine(batch))
      .filter((r) => r) // remove undefined rows
  })

  console.log("rows", rows)

  setOpSaleData(rows)
}
  useEffect(() => {
    if (opNo) fetchPatientByOpNo()
  }, [opNo])

const createRowFromMedicine = (med, qty = 1, disc = 0) => {
  if (!med) return null

  const mrp = Number(med.mrp || 0)
  const gstPercent = Number(med.gstPercent || 0)

  const total = qty * mrp
  const discAmount = (disc / 100) * total
  const net = total - discAmount
  const gstAmount = (net * gstPercent) / (100 + gstPercent)

  return {
    medicineId: med.medicineId,
    medicineName: med.medicineName,
    batchNo: med.batchNo,
    expiryDate: med.expiryDate,
    availableQty: med.availableQty || 0,

    qty,
    mrp,
    disc,

    gstPercent,

    total: Math.round(total),
    discAmount: Math.round(discAmount),
    netAmt: Math.round(net),
    gstamt: Math.round(gstAmount),
    finalamount: Math.round(net),
  }
}
  const handleSave1 = async () => {
    try {
      const payload = {
        billNo,
        patientDetails,
        items: OpsaleData,
        totals,
      }

      // 🔹 Call your API here
      // await saveOpSale(payload)

      console.log('Saved:', payload)

      // ✅ Open print modal after save
      setPrintModal(true)
    } catch (error) {
      console.error('Save failed', error)
    }
  }

  const medicineOptions = medicines.map((med) => ({
    value: med.id,
    label: med.productName,
  }))

  const doctorOptions = (doctorList || []).map((doc) => ({
    value: doc.doctorId,
    label: doc.doctorName,
  }))

  const dummyOpHistory = {
    101: [1, 2],
    102: [3],
  }
  const updateRow = (index, field, value) => {
    const updated = [...OpsaleData]

    updated[index][field] = Number(value)

    const r = updated[index]

    const total = r.qty * r.mrp

    const discAmount = (r.disc / 100) * total

    const net = total - discAmount

    const gstAmount = (net * r.gstPercent) / (100 + r.gstPercent)

    r.total = Math.round(total)

    r.discAmount = Math.round(discAmount)

    r.netAmt = Math.round(net)

    r.gstamt = Math.round(gstAmount)

    r.finalamount = Math.round(net)

    setOpSaleData(updated)
  }
  const netAmount = totals.netAmt || 0

  // const finalTotal = totals.netAmt

  // const dueAmount = 0

  useEffect(() => {
    const paidValue = Number(paidNow) || 0

    setTotalPaid(paidValue)
  }, [paidNow])

  const dueAmount = netAmount - totalPaid

  const amountToBePaid = paidNow

  const finalTotal = netAmount

  return (
    <div
      className="p-3"
      style={{
        color: 'var(--color-black)', // your text color
        fontSize: '13px',
      }}
    >
      {/* TOP HEADER */}
      <CRow className="align-items-center mb-3">
        {/* Bill No - Left Side */}
        <CCol xs={12} sm={4} md={3} className="mb-2 mb-sm-0">
          <div className="d-flex align-items-center">
            <CFormLabel className="fw-bold mb-0 me-2" style={{ minWidth: '75px' }}>
              Bill No:
            </CFormLabel>

            <span className="fw-bold text-primary">{billNo || ''}</span>
          </div>
        </CCol>

        {/* Date & Time - Right Side */}
        <CCol xs={12} sm={8} md={9} className="d-flex justify-content-sm-end gap-2">
          <CFormInput
            type="date"
            size="sm"
            defaultValue={new Date().toISOString().slice(0, 10)}
            style={{ width: 150 }}
          />

          <CFormInput
            type="time"
            size="sm"
            defaultValue={new Date().toTimeString().slice(0, 5)}
            style={{ width: 120 }}
          />
        </CCol>
      </CRow>

      {/* OUT/IN PATIENT + OPNO + PAYCATEGORY + DATETIME */}
      <CRow className="mb-3 g-3">
        {/* Out / In Patient */}
        <CCol xs={12} sm={4} md={4} className="d-flex flex-wrap align-items-center gap-3">
          <div className="form-check d-flex align-items-center">
            <input
              className="form-check-input"
              type="radio"
              name="patientMode"
              id="manualEntry"
              value="manual"
              checked={patientMode === 'manual'}
              onChange={() => setPatientMode('manual')}
            />
            <label className="form-check-label ms-2 fw-bold" htmlFor="manualEntry">
              Out Patient (Manual)
            </label>
          </div>

          <div className="form-check d-flex align-items-center">
            <input
              className="form-check-input"
              type="radio"
              name="patientMode"
              id="fetchOp"
              value="fetch"
              checked={patientMode === 'fetch'}
              onChange={() => setPatientMode('fetch')}
            />
            <label className="form-check-label ms-2 fw-bold" htmlFor="fetchOp">
              Fetch by OPNO
            </label>
          </div>
          <CFormInput
            type="text"
            placeholder="Enter OPNO/Mobile Number"
            disabled={patientMode !== 'fetch'}
            value={opNo}
            onChange={(e) => setOpNo(e.target.value)}
            style={{ height: 30, fontSize: '12px' }}
          />
        </CCol>

        {/* Pay Category */}
        <CCol xs={12} sm={6} md={3} className="d-flex align-items-center">
          <CFormLabel className="mb-0 me-2 fw-bold" style={{ whiteSpace: 'nowrap' }}>
            Pay Category:
          </CFormLabel>
          <CFormSelect
            // disabled
            value="SELF PAY"
            className="bg-light w-100"
            style={{ height: '30px', fontSize: '12px' }}
          >
            <option value="">Select Pay Category</option>
            <option value="SELF PAY">SELF PAY</option>
            <option value="INSURANCE">INSURANCE</option>
            <option value="CORPOmrp">CORPOmrp</option>
            <option value="GOVERNMENT SCHEME">GOVERNMENT SCHEME</option>
            <option value="OTHER">OTHER</option>
          </CFormSelect>
        </CCol>

        {/* Bill Date & Time */}
        <CCol xs={12} md={4}>
          <div className="d-flex flex-wrap align-items-center justify-content-md-end gap-2">
            {/* <CFormLabel className="fw-bold mb-0" style={{ whiteSpace: "nowrap" }}>
      Bill Date & Time:
    </CFormLabel> */}

            {/* <CFormInput
      type="datetime-local"
      defaultValue={new Date().toISOString().slice(0, 19)}
      style={{
        height: 28,
        width: 170,     // reduced width
       fontSize:"12px" ,// smaller text
        padding: "2px 6px",
      }}
    /> */}
          </div>
        </CCol>
      </CRow>

      {/* Patient blocks */}
      <div
        style={{
          border: '2px solid var(--color-black)',
          borderRadius: 6,
          padding: 15,
          background: '#fff',
        }}
      >
        <h6 className="fw-bold mb-3">Patient Details</h6>

        <CRow className="g-2">
          <CCol md={6}>
            <CFormLabel>Name</CFormLabel>
            <CFormInput
              type="text"
              value={patientDetails?.name || ''}
              disabled={patientMode === 'fetch'}
              onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel>Mobile Number</CFormLabel>
            <CFormInput
              type="text"
              value={patientDetails?.mobilenumber || ''}
              disabled={patientMode === 'fetch'}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, mobilenumber: e.target.value })
              }
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel>Age</CFormLabel>
            <CFormInput
              type="number"
              value={patientDetails?.age || ''}
              disabled={patientMode === 'fetch'}
              onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel>Sex</CFormLabel>
            <CFormSelect
              value={patientDetails?.sex || ''}
              disabled={patientMode === 'fetch'}
              onChange={(e) => setPatientDetails({ ...patientDetails, sex: e.target.value })}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </CFormSelect>
          </CCol>

          <CCol md={6}>
            <CFormLabel>Consulting Doctor</CFormLabel>
            <Select
              options={doctorOptions}
              placeholder="Select Doctor"
              value={
                doctorOptions.find((d) => d.label === patientDetails?.consultingDoctor) || null
              }
              onChange={(selected) =>
                setPatientDetails({
                  ...patientDetails,
                  consultingDoctor: selected?.label || '',
                  doctorId: selected?.value || '',
                })
              }
              isClearable
            />
          </CCol>
        </CRow>
      </div>

      {/* Entry controls */}
      <CRow className="mb-3 mt-3 align-items-end g-3">
        {/* Medicine Name */}
        <CCol xs={12} md={6}>
          <CFormLabel className="fw-semibold mb-1">Medicine Name</CFormLabel>

          {/* <Select
            options={medicineOptions}
            value={medicineOptions.find((opt) => opt.value === medName)}
            onChange={(selected) => setMedName(selected?.value)}
            placeholder="Search Medicine"
            isClearable
          /> */}

          <Select
            options={medicineOptions}
            value={medicineOptions.find((opt) => opt.value === medName)}
            onChange={async (selected) => {
              if (!selected) return

              setMedName(selected.value) // ✅ important

              const med = medicines.find((m) => m.id === selected.value)

              if (!med) {
                console.log('Medicine not found ❌', selected.value)
                return
              }

              const invList = await getInventory(med.id)
              const invArray = Array.isArray(invList)
                ? invList
                : Array.isArray(invList?.data)
                  ? invList.data
                  : []

              const invData = invArray.find((item) => item.medicineId === med.id)
              const inv = invData?.inventory?.[0] || {}

              const row = {
                medicineId: med.id,
                medicineName: med.productName || med.medicineName || 'Unknown',

                batchNo: inv?.batchNo || '-',
                expiryDate: inv?.expiryDate || '-',
                availableQty: inv.availableQty || 0,
                qty: qty,
                mrp: inv?.mrp || med.mrp || 0,

                disc: discPerc,
                gstPercent: inv?.gstPercent || 0,

                total: inv?.mrp || med.mrp || 0,
                discAmount: discAmt,
                netAmt: inv?.mrp || med.mrp || 0,
                gstamt: 0,
                finalamount: inv?.mrp || med.mrp || 0,
              }

              setOpSaleData((prev) => [...prev, row])
            }}
            placeholder="Search Medicine"
            isClearable
          />
        </CCol>
        {/* Include Returns */}
        <CCol xs={12} md={6} className="d-flex align-items-center">
          <CFormCheck
            id="returnsCheck"
            label="Include Returns"
            checked={includeReturns}
            onChange={(e) => setIncludeReturns(e.target.checked)}
          />
        </CCol>
      </CRow>

      <div
        className="p-2 mb-2"
        // style={{
        //   border: "2px solid var(--color-black)",
        //   borderRadius: "4px",
        // }}
      ></div>

      {/* TABLE */}
      <div style={{ position: 'relative', marginTop: 8 }}>
        <div
          style={{
            maxHeight: '260px', // adjust height as needed
            overflowY: 'auto',
            overflowX: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <CTable bordered hover responsive="sm">
            {/* TODO:check duplication for medicine*/}

            <CTableHead className="pink-table w-auto">
              <CTableRow style={{ color: 'var(--color-black)' }}>
                <CTableHeaderCell style={{ width: '40px' }}>S.No</CTableHeaderCell>
                <CTableHeaderCell>Medicine Name</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px' }}>BatchNo</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px' }}>Expiry Date</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '70px' }}>Available Qty</CTableHeaderCell>

                <CTableHeaderCell style={{ width: '70px' }}>Qty</CTableHeaderCell>

                <CTableHeaderCell style={{ width: '90px' }}>MRP</CTableHeaderCell>
                <CTableHeaderCell className="text-center" style={{ width: '70px' }}>
                  {`Total \n (A)`}{' '}
                </CTableHeaderCell>
                <CTableHeaderCell style={{ width: '60px' }}>Disc %</CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ width: '70px' }}
                >{`DiscAmt \n(B)`}</CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ width: '100px' }}
                >{`NetAmt \n(A-B)`}</CTableHeaderCell>
                <CTableHeaderCell
                  className="text-center"
                  style={{ width: '100px' }}
                >{`GST %`}</CTableHeaderCell>
                {/*   <CTableHeaderCell
                  className="text-center"
                  style={{ width: '60px' }}
                >{`GST \n(C)`}</CTableHeaderCell> */}
                <CTableHeaderCell
                  className="text-center"
                  style={{ width: '60px' }}
                >{`Final Amount`}</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '80px' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {oploading && (
                <CTableRow>
                  <CTableDataCell colSpan={12} className="text-center">
                    Loading Opsales...
                  </CTableDataCell>
                </CTableRow>
              )}

              {!oploading && OpsaleData.length === 0 && (
                <CTableRow>
                  <CTableDataCell
                    colSpan={12}
                    className="text-center"
                    style={{ color: 'var(--color-black)' }}
                  >
                    No OP Sales records found.
                  </CTableDataCell>
                </CTableRow>
              )}

              {!oploading &&
                OpsaleData.map(
                  (item, index) => (
                    console.log(item),
                    (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{item.medicineName}</CTableDataCell>
                        <CTableDataCell>{item.batchNo}</CTableDataCell>
                        <CTableDataCell>{item.expiryDate}</CTableDataCell>
                        <CTableDataCell>{item.availableQty}</CTableDataCell>

                        <CTableDataCell>
                          <input
                            value={item.qty}
                            onChange={(e) => updateRow(index, 'qty', e.target.value)}
                            style={{ width: 60 }}
                          />
                        </CTableDataCell>
                        <CTableDataCell>{item.mrp}</CTableDataCell>

                        <CTableDataCell>{item.total}</CTableDataCell>
                        <CTableDataCell>
                          <input
                            value={item.disc}
                            onChange={(e) => updateRow(index, 'disc', e.target.value)}
                            style={{ width: 60 }}
                          />
                        </CTableDataCell>
                        <CTableDataCell>{item.discAmount}</CTableDataCell>
                        <CTableDataCell>{item.netAmt}</CTableDataCell>
                        <CTableDataCell>{item.gstPercent}</CTableDataCell>
                        {/* <CTableDataCell>{item.gstamt}</CTableDataCell> */}

                        <CTableDataCell>{item.finalamount}</CTableDataCell>
                        <CTableDataCell>
                          {/* Delete Button */}
                          <CButton
                            color="danger"
                            size="sm"
                            className="actionBtn"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 size={16} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  ),
                )}
            </CTableBody>
          </CTable>
        </div>

        {/* TOTALS */}
        <CCardBody style={{ padding: '10px 0 0 0' }}>
          <CRow className="g-2 border-bottom pb-2 d-flex justify-content-end">
            {/* LEFT TOTALS */}

            <CCol md={3}>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Total Amt</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput disabled value={totals.totalAmt} className="text-end bg-light" />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Total DiscAmt</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput
                    disabled
                    value={totals.discTotal || 0}
                    className="text-end bg-light"
                  />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                {/* <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Total GST</CFormLabel>
                </CCol> */}

                {/* <CCol xs={6}>
                  <CFormInput disabled value={totals.totalTax} className="text-end bg-light" />
                </CCol> */}
              </CRow>
            </CCol>

            {/* RIGHT TOTALS */}

            <CCol md={3}>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Net Amount</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput disabled value={netAmount} />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Current Payment Amount</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput value={paidNow} onChange={(e) => setPaidNow(e.target.value)} />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Amount Paid</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput disabled value={amountToBePaid} />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Due Amount</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput disabled value={dueAmount < 0 ? 0 : dueAmount} />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Final Total</CFormLabel>
                </CCol>

                <CCol xs={6}>
                  <CFormInput disabled value={finalTotal} />
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CCardBody>
      </div>

      {/* <div
  className="d-flex flex-wrap align-items-center mt-3 gap-3 p-2"
  style={{
    // border: '1px solid var(--color-black)',
    borderRadius: 6,
  }}
> */}
      {/* <div className="d-flex align-items-center gap-2">
    <CFormLabel className="fw-bold mb-0">Search</CFormLabel>
    <CFormInput
      type="text"
      placeholder="Search here..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ width: 160, height: 30 ,fontSize:"12px" }}
    />
  </div> */}

      {/* <div className="d-flex align-items-center gap-2">
    <CFormLabel className="fw-bold mb-0">From</CFormLabel>
    <CFormInput
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      style={{ width: 130, height: 30 ,fontSize:"12px",color:'var(--color-black)'}}
    />
  </div> */}

      {/* <div className="d-flex align-items-center gap-2">
    <CFormLabel className="fw-bold mb-0">To</CFormLabel>
    <CFormInput
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      style={{ width: 130, height: 30 ,fontSize:"12px"}}
    />
  </div> */}

      {/* Icons */}
      <div>
        <div className="d-flex align-items-center mt-2">
          <div className="ms-auto d-flex justify-content-between w-100">
            <CButton
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
              onClick={() => setHistoryModal(true)}
            >
              View Patient Medical History
            </CButton>
            {/*  TODO:  open modal with all patients medicine history with search bill no,mobile no and file no  */}

            <CButton
              style={{
                color: 'var(--color-black)',
                // yellow for update
                backgroundColor: 'var(--color-bgcolor)',
              }}
              onClick={handleSave}
            >
              {editSaleId ? 'Update' : 'Save'}
            </CButton>
          </div>
        </div>
        <CModal
          visible={historyModal}
          onClose={() => setHistoryModal(false)}
          size="lg"
          alignment="center"
          scrollable
          backdrop="static"
        >
          <CModalHeader>
            <CModalTitle>Patient Medicine History</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {/* 🔍 Search Section */}
            <CRow className="mb-3">
              <CCol md={9}>
                <CFormInput
                  placeholder="Search by Bill No / Mobile No / OP No"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </CCol>

              <CCol md={3}>
                <CButton
                  className="w-100"
                  onClick={handleSearch}
                  style={{ backgroundColor: 'var(--color-black)', color: '#fff' }}
                >
                  Search
                </CButton>
              </CCol>
            </CRow>

            {/* 📋 History Table */}
            <CTable bordered hover responsive className="pink-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Bill No</CTableHeaderCell>
                  <CTableHeaderCell>Patient Name</CTableHeaderCell>
                  <CTableHeaderCell>Mobile</CTableHeaderCell>
                  <CTableHeaderCell>Total Amount</CTableHeaderCell>
                  <CTableHeaderCell>Due Amount</CTableHeaderCell>
                  <CTableHeaderCell>Last Paid Amount</CTableHeaderCell>
                  <CTableHeaderCell>Last Paid Date</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '120px' }}>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.billNo}</CTableDataCell>
                      <CTableDataCell>{item.patientName}</CTableDataCell>
                      <CTableDataCell>{item.mobile}</CTableDataCell>
                      <CTableDataCell>{item.totalAmt}</CTableDataCell>
                      <CTableDataCell>{item.dueAmount}</CTableDataCell>
                      <CTableDataCell>
                        {item.paymentHistory?.length > 0
                          ? item.paymentHistory[item.paymentHistory.length - 1]?.amountPaid
                          : '-'}
                      </CTableDataCell>

                      <CTableDataCell>
                        {item.paymentHistory?.length > 0 &&
                        item.paymentHistory[item.paymentHistory.length - 1]?.paidAt
                          ? formatDateTime(
                              item.paymentHistory[item.paymentHistory.length - 1].paidAt,
                            )
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {/* View Button */}
                        <CButton
                          className="actionBtn me-1"
                          style={{ color: 'var(--color-black)' }}
                          color="info"
                          size="sm"
                          onClick={() => handleView(index)}
                          title="View"
                        >
                          <Eye size={18} />
                        </CButton>

                        {/* Edit Button */}
                        <CButton
                          className="actionBtn me-1"
                          style={{ color: 'var(--color-black)' }}
                          color="warning"
                          size="sm"
                          onClick={() => handleEdit(index)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </CButton>

                        {/* Delete Button */}
                        <CButton
                          className="actionBtn"
                          color="danger"
                          size="sm"
                          style={{ color: 'var(--color-black)' }}
                          onClick={() => openDeleteModal(index, item.id)} // ✅ FIX
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      No records found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setHistoryModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
        <CModal
          visible={printModal}
          onClose={() => setPrintModal(false)}
          size="lg"
          alignment="center"
        >
          <CModalHeader>
            <CModalTitle>Print Bill Preview</CModalTitle>
          </CModalHeader>

          <CModalBody>
            <div id="print-section">
              <h5>Bill No: {billNo}</h5>
              <p>
                <strong>Patient:</strong> {patientDetails?.name}
              </p>
              <p>
                <strong>Mobile:</strong> {patientDetails?.mobilenumber}
              </p>

              <hr />

              <CTable bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Medicine</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                    <CTableHeaderCell>MRP</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {OpsaleData.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.medicineName}</CTableDataCell>
                      <CTableDataCell>{item.qty}</CTableDataCell>
                      <CTableDataCell>{item.mrp}</CTableDataCell>
                      <CTableDataCell>{item.total}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <hr />

              <h6>Total Amount: ₹ {totals.netAmt}</h6>
            </div>
          </CModalBody>

          <CModalFooter>
            <CButton color="primary" onClick={() => window.print()}>
              Print
            </CButton>

            <CButton color="secondary" onClick={() => setPrintModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
        <CModal
          visible={viewModal}
          onClose={() => setViewModal(false)}
          size="lg"
          alignment="center"
          scrollable
        >
          <CModalHeader>
            <CModalTitle>OP Sales Details</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {selectedSale && (
              <>
                <h6>Patient Details</h6>

                <p>
                  <b>Bill No:</b> {selectedSale.billNo}
                </p>
                <p>
                  <b>Patient Name:</b> {selectedSale.patientName}
                </p>
                <p>
                  <b>Mobile:</b> {selectedSale.mobile}
                </p>
                <p>
                  <b>Doctor:</b> {selectedSale.consultingDoctor}
                </p>
                <p>
                  <b>Visit Type:</b> {selectedSale.visitType}
                </p>

                <hr />

                <h6>Medicines</h6>

                <CTable bordered responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Medicine</CTableHeaderCell>
                      <CTableHeaderCell>Qty</CTableHeaderCell>
                      <CTableHeaderCell>Rate</CTableHeaderCell>
                      <CTableHeaderCell>Total</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {selectedSale.medicines?.map((med, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>{med.medicineName}</CTableDataCell>
                        <CTableDataCell>{med.qty}</CTableDataCell>
                        <CTableDataCell>{med.rate}</CTableDataCell>
                        <CTableDataCell>{med.totalA}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                <hr />

                <h6>Payment Details</h6>

                <p>
                  <b>Total Amount:</b> ₹ {selectedSale.totalAmt}
                </p>
                <p>
                  <b>Amount Paid:</b> ₹ {selectedSale.amountPaid}
                </p>
                <p>
                  <b>Due Amount:</b> ₹ {selectedSale.dueAmount}
                </p>
              </>
            )}
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
        <CModal visible={deleteModal} onClose={() => setDeleteModal(false)} alignment="center">
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {deleteId
              ? 'Are you sure you want to delete this sale permanently?'
              : 'Are you sure you want to remove this medicine?'}
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </CButton>

            <CButton color="danger" onClick={confirmDelete}>
              Delete
            </CButton>
          </CModalFooter>
        </CModal>

        {/* <CIcon icon={cilPrint} size="lg" style={{ cursor: 'pointer' }} /> */}
        {/* <CIcon icon={cilMagnifyingGlass} size="lg" style={{ cursor: 'pointer' }} /> */}
        {/* </div> */}

        {/* Button */}
        {/* <CButton color="light" size="sm" style={{fontSize:"12px"}}>
    {editIndex !== null ? 'Update' : 'PrintTextBill'}
    
  </CButton> */}

        {/* Checkbox (push to right on large screens) */}
        {/* <div className="ms-lg-auto d-flex align-items-center">
    <CFormCheck
      type="checkbox"
      id="displayOpSaleDetails"
      label="Include Returns"
      className="text-dark"
    />
  </div> */}
      </div>
    </div>
  )
}

export default OPSales
