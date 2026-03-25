/* eslint-disable react/prop-types */
import React, { useEffect, useState, useCallback } from 'react'
import {
  CCardBody,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
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
} from '@coreui/react'

import CIcon from '@coreui/icons-react'

import { useNavigate } from 'react-router-dom'

import { cilMagnifyingGlass, cilPrint, cilSave } from '@coreui/icons'

import { postPurchaseData, PurchaseData } from '../PharmacyManagement/PurchasesAPI'
import { SupplierData } from './SupplierInfoAPI'
import { showCustomToast } from '../../Utils/Toaster'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import axios from 'axios'
import { CopySlash, Edit2, Trash2 } from 'lucide-react'
import ViewPurchaseBills from './ViewPurchaseBills'
import MoneyReceipts from './SupplierMoneyReceipt'
import { useMedicines } from '../../Context/MedicineContext'
import { dummyOrders } from './Reorder/dummyProductData'
import Select from 'react-select'
import { getAllOrdersAPI } from './Reorder/PharmacyOrderAPI'

const Purchases = ({ goToSupplier }) => {
  const navigate = useNavigate()
  // top-level states
  const [purchaseData, setPurchaseData] = useState([])
  const [search, setSearch] = useState('')
  // const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  // const [showTotals, setShowTotals] = useState(true)
  const [orders, setOrders] = useState([])
  const { medicines, loading, supplier, fetchSuppliers, medicineTypes } = useMedicines()
  const getInitialPayload = () => ({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    purchaseBillNo: '',
    invoiceNo: '',
    supplierName: '',
    invoiceDate: '',
    receivingDate: '',
    taxType: 'GST',
    paymentMode: 'cash',
    billDueDate: '',
    creditDays: '',
    duePaidBillNo: '',
    orderId: '',
    financialYear: '',
    paidAmount: '',
    previousAdjustment: '',
    postDiscount: '',
    selectedMedicineId: '',

    medicineDetails: [
      {
        sno: 1,
        productId: '',
        productName: '',
        batchNo: '',
        expDate: '',
        hsnCode: '',
        quantity: '',
        packSize: '',
        free: '',
        mrp: '',
        costPrice: '',
        discPercent: '',
        gstPercent: '',
        category: '',
      },
    ],
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])
  const resetForm = () => {
    setPayload(getInitialPayload())

    setErrors({
      top: {},
      products: [],
    })

    setTotals({
      totalAmount: 0,
      discountAmountTotal: 0,
      netAmount: 0,
      totalIGST: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalTax: 0,
      finalTotal: 0,
      paidAmount: 0,
      balanceAmount: 0,
      previousAdjustment: 0,
      postDiscount: 0,
      netPayable: 0,
    })
  }

  // totals returned by backend
  const [totals, setTotals] = useState({
    totalAmount: 0,
    discountAmountTotal: 0,
    netAmount: 0,
    totalIGST: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalTax: 0,
    finalTotal: 0,
    paidAmount: 0,
    balanceAmount: 0,
    previousAdjustment: 0,
    postDiscount: 0,
    netPayable: 0,
  })
  // useEffect(() => {
  //   const fetchMedicines = async () => {
  //     try {
  //       const clinicId = localStorage.getItem('HospitalId')

  //       const res = await axios.get(`${BASE_URL}/getPrescriptionsByClinicId/${clinicId}`)

  //       const list = res.data?.data?.[0]?.medicines || []

  //       const medicineList = list.map((m) => ({
  //         id: m.id,
  //         name: m.name,
  //       }))

  //       setMedicines(medicineList)
  //     } catch (err) {
  //       console.error('Error fetching medicines', err)
  //       setMedicines([])
  //     }
  //   }

  //   fetchMedicines()
  // }, [])
  const handleMedicineSelect = (id) => {
    const selected = medicines.find((m) => m.id === id)

    setPayload((prev) => {
      const updated = [...prev.medicineDetails]

      // 🔎 check duplicate
      const duplicate = updated.some((row) => row.productId === id)
      if (duplicate) {
        showCustomToast('Medicine already added', 'warning')
        return prev
      }

      // 🟢 if first row empty → fill it
      if (!updated[0]?.productId) {
        updated[0] = {
          ...updated[0],
          productId: selected?.id || '',
          productName: selected?.productName || '',
          hsnCode: selected?.hsnCode || '',
          packSize: selected?.packSize || '',
          gstPercent: selected?.gstPercent || '',
          category: selected?.category || '',
          mrp: selected?.mrp || '',
        }
      } else {
        // ➕ add new row
        updated.push({
          sno: updated.length + 1,
          productId: selected?.id || '',
          productName: selected?.productName || '',
          batchNo: '',
          expDate: '',
          hsnCode: selected?.hsnCode || '',
          quantity: '',
          packSize: selected?.packSize || '',
          free: '',
          mrp: selected?.mrp || '',
          costPrice: '',
          discPercent: '',
          gstPercent: selected?.gstPercent || '',
          category: selected?.category || '',
        })
      }

      return {
        ...prev,
        selectedMedicineId: '',
        medicineDetails: updated,
      }
    })
    setErrors((prev) => {
      const updatedErrors = [...prev.products]
      updatedErrors[0] = {}
      return { ...prev, products: updatedErrors }
    })
  }
  //fetch by orderid //TODO:after order creation un comment
  // const handleOrderIdChange = async (value) => {
  //   updateTopField('orderId', value)

  //   if (!value) return

  //   try {
  //     const res = await axios.get(`${wifiUrl}/api/orders/${value}`)

  //     const products = res.data?.products || []

  //     const mappedRows = products.map((p, index) => ({
  //       sno: index + 1,
  //       productId: p.productId,
  //       productName: p.productName,
  //       batchNo: '',
  //       expDate: '',
  //       hsnCode: p.hsnCode,
  //       quantity: '',
  //       packSize: p.packSize,
  //       free: '',
  //       mrp: '',
  //       costPrice: '',
  //       discPercent: '',
  //       gstPercent: p.gstPercent,
  //       category: p.category || '',
  //     }))

  //     setPayload((prev) => ({
  //       ...prev,
  //       medicineDetails: mappedRows,
  //     }))
  //   } catch (err) {
  //     console.error('Order fetch error', err)
  //   }
  // }

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

  ////TODO:after order creation comment
  const handleOrderIdChange = (value) => {
    updateTopField('orderId', value)

    const selectedOrder = orders.find((o) => o.orderId === value)

    console.log('selectedOrder', selectedOrder)

    if (!selectedOrder) return

    // ✅ set supplier automatically
    setPayload((prev) => ({
      ...prev,
      supplierId: selectedOrder?.supplier?.supplierId || '',
      supplierName: selectedOrder?.supplier?.supplierName || '',
    }))

    const mappedRows = selectedOrder.products.map((p, index) => {
      // ✅ find medicine to get GST / category / mrp
      const med = medicines.find((m) => m.id === p.productId)

      return {
        sno: index + 1,
        productId: p.productId,
        productName: p.productName,
        batchNo: '',
        mfgDate: '',
        expDate: '',
        hsnCode: p.hsnCode,
        quantity: '',
        packSize: p.packSize,
        free: '',

        // ✅ fetch from medicine master
        gstPercent: med?.gstPercent || '',
        category: med?.category || '',
        mrp: med?.mrp || '',

        costPrice: '',
        discPercent: '',
      }
    })

    setPayload((prev) => ({
      ...prev,
      medicineDetails: mappedRows,
    }))
  }
  // fetch purchases (list)
  const fetchPurchase = useCallback(async () => {
    // setLoading(true)
    setError(null)
    try {
      const response = await PurchaseData()
      console.log('RAW PURCHASE RESPONSE:', response)

      // The correct purchase list exists inside response.data
      const list = Array.isArray(response?.data) ? response.data : []

      setPurchaseData(list)
    } catch (err) {
      console.error('Error fetching purchase:', err)
      setError('Failed to fetch purchase data.')
      setPurchaseData([])
    } finally {
      // setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchase()
  }, [fetchPurchase])

  // payload (UI state)
  const [payload, setPayload] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    purchaseBillNo: '',
    invoiceNo: '',
    supplierName: '',
    supplierId: '',
    invoiceDate: '',
    receivingDate: '',
    taxType: 'GST',
    paymentMode: 'cash',
    billDueDate: '',
    creditDays: '',
    duePaidBillNo: '',
    orderId: '',
    financialYear: '',
    paidAmount: '',

    previousAdjustment: '',
    postDiscount: '',
    medicineDetails: [
      {
        sno: 1,
        productId: '',
        productName: '',
        batchNo: '',
        expDate: '',
        hsnCode: '',
        quantity: '',
        packSize: '',
        free: '',
        mrp: '',
        costPrice: '',
        discPercent: '',
        gstPercent: '',
        category: '',
        mfgDate: '',
      },
    ],
  })

  // errors state: top-level + per-product rows
  const [errors, setErrors] = useState({
    top: {},
    products: [], // index-aligned with medicineDetails
  })

  // ---------- Validation helpers ----------
  const todayStart = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }

  const validateField = (field, value) => {
    switch (field) {
      case 'purchaseBillNo':
        if (!value || value.toString().trim() === '') return 'Purchase Bill No is required'
        return ''

      case 'invoiceNo':
        if (!value || value.toString().trim() === '') return 'Invoice No is required'
        return ''

      case 'supplierName':
        if (!value || value.toString().trim() === '') return 'Supplier is required'
        return ''

      case 'invoiceDate':
        if (!value) return 'Invoice Date is required'
        return ''

      case 'receivingDate':
        if (!value) return 'Receiving Date is required'
        return ''

      case 'billDueDate':
        if (!value) return 'Bill Due Date is required'
        return ''

      case 'taxType':
        if (!value) return 'Tax Type is required'
        return ''

      // case 'orderId':
      //   if (!value) return 'Tax mode is required'
      //   return ''

      case 'paymentMode':
        if (!value) return 'Payment Mode is required'
        return ''
      case 'duePaidBillNo':
        if (!value) return 'DuePaidBillNo is required'
        return ''
      case 'paidAmount':
        if (!value) return 'Paid Amount is required'
        return ''
      case 'previousAdjustment':
        if (!value) return 'Previous Adjustment is required'
        return ''

      case 'financialYear':
        if (!value || value.toString().trim() === '') return 'Financial Year is required'
        return ''

      case 'creditDays':
        if (value === '') return 'Credit days is required'
        if (isNaN(Number(value))) return 'Credit Days must be a number'
        if (Number(value) < 0) return 'Credit Days must be ≥ 0'
        return ''

      case 'paidAmount':
        if (value === '') return ''
        if (isNaN(Number(value))) return 'Paid Amount must be a number'
        if (Number(value) < 0) return 'Paid Amount must be ≥ 0'
        return ''

      case 'previousAdjustment':
        if (value === '') return ''
        if (isNaN(Number(value))) return 'Adjustment must be a number'
        if (Number(value) < 0) return 'Adjustment must be ≥ 0'
        return ''

      case 'postDiscount':
        if (value === '') return ''
        if (isNaN(Number(value))) return 'Discount must be a number'
        if (Number(value) < 0) return 'Discount must be ≥ 0'
        return ''

      default:
        return ''
    }
  }

  const validateProductRow = (item, rowIndex, existingKeys = null) => {
    const rowErrors = {}

    // category

    // free qty >= 0
    if (item.free !== '' && Number(item.free) < 0) {
      rowErrors.free = 'Free qty cannot be negative'
    }

    // MRP >= Cost Price
    if (item.mrp !== '' && item.costPrice !== '' && Number(item.mrp) < Number(item.costPrice)) {
      rowErrors.mrp = 'MRP must be ≥ Cost Price'
    }

    const isRowEmpty =
      (!item.productName || item.productName.toString().trim() === '') &&
      (!item.batchNo || item.batchNo.toString().trim() === '') &&
      (!item.expDate || item.expDate.trim() === '')

    if (isRowEmpty) return {}
    if (!item.category || item.category.trim() === '') {
      rowErrors.category = 'Required'
    }

    if (!item.packSize || item.packSize.trim() === '') {
      rowErrors.packSize = 'Required'
    }
    // mandatory fields first
    if (!item.productName) rowErrors.productName = 'Required'
    if (!item.batchNo) rowErrors.batchNo = 'Required'
    if (!item.expDate) rowErrors.expDate = 'Required'

    // NOW check empty
    if (!item.productName && !item.batchNo && !item.expDate) {
      return {}
    }

    // productId (optional: you can make this required if needed)
    if (item.productId && item.productId.toString().trim().length === 0) {
      rowErrors.productId = 'Product ID is required'
    }
    if (!item.expDate) {
      rowErrors.expDate = 'Required'
    }

    // productName
    if (!item.productName || item.productName.toString().trim() === '') {
      rowErrors.productName = 'Required'
    } else if (item.productName.toString().length < 2) {
      rowErrors.productName = 'Too short'
    }

    // batchNo
    if (!item.batchNo || item.batchNo.toString().trim() === '') {
      rowErrors.batchNo = 'Required'
    }

    // duplicate product+batch
    if (existingKeys) {
      const key = `${(item.productName || '')
        .toString()
        .trim()
        .toLowerCase()}__${(item.batchNo || '').toString().trim().toLowerCase()}`
      if (existingKeys.has(key)) {
        rowErrors.batchNo = 'Duplicate product & batch'
      }
    }

    // mfgDate
    if (!item.mfgDate) {
      rowErrors.mfgDate = 'Required'
    } else {
      const mfg = new Date(item.mfgDate)
      mfg.setHours(0, 0, 0, 0)

      if (mfg > todayStart()) {
        rowErrors.mfgDate = 'Mfg date cannot be future'
      }
    }
    // expDate
    if (!item.expDate) {
      rowErrors.expDate = 'Required'
    } else {
      const exp = new Date(item.expDate)
      exp.setHours(0, 0, 0, 0)

      if (exp <= todayStart()) {
        rowErrors.expDate = 'Expiry must be future date'
      }
    }

    if (item.mfgDate && item.expDate) {
      const mfg = new Date(item.mfgDate)
      const exp = new Date(item.expDate)

      if (exp <= mfg) {
        rowErrors.expDate = 'Expiry must be after Mfg date'
      }
    }

    // hsnCode
    const hsnString = (item.hsnCode || '').toString().trim()
    if (!/^[0-9]{4,8}$/.test(hsnString)) {
      rowErrors.hsnCode = 'HSN should be 4–8 digits'
    }

    // quantity > 0
    if (
      item.quantity === '' ||
      item.quantity === null ||
      isNaN(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      rowErrors.quantity = 'Enter quantity > 0'
    }

    // costPrice > 0
    if (
      item.costPrice === '' ||
      item.costPrice === null ||
      isNaN(Number(item.costPrice)) ||
      Number(item.costPrice) <= 0
    ) {
      rowErrors.costPrice = 'Enter valid cost'
    }

    // mrp > 0
    if (item.mrp === '' || item.mrp === null || isNaN(Number(item.mrp)) || Number(item.mrp) <= 0) {
      rowErrors.mrp = 'Enter valid MRP'
    }

    // gstPercent 0–28
    if (item.gstPercent !== '' && item.gstPercent !== null && !isNaN(Number(item.gstPercent))) {
      const g = Number(item.gstPercent)
      if (g < 0 || g > 28) rowErrors.gstPercent = 'GST% must be 0–28'
    } else {
      rowErrors.gstPercent = 'Enter GST%'
    }

    // discPercent 0–100
    if (item.discPercent !== '' && item.discPercent !== null && !isNaN(Number(item.discPercent))) {
      const d = Number(item.discPercent)
      if (d < 0 || d > 100) rowErrors.discPercent = 'Disc% must be 0–100'
    }
    const numericFields = ['quantity', 'free', 'mrp', 'costPrice', 'discPercent', 'gstPercent']

    numericFields.forEach((f) => {
      if (item[f] !== '' && isNaN(Number(item[f]))) {
        rowErrors[f] = 'Invalid number'
      }
    })

    return rowErrors
  }

  // ---------- update helpers (real-time validation) ----------
  const updateTopField = (field, value) => {
    setPayload((prev) => ({ ...prev, [field]: value }))
    const message = validateField(field, value)
    setErrors((prev) => ({ ...prev, top: { ...(prev.top || {}), [field]: message } }))
  }

  const numericProductFields = ['quantity', 'free', 'mrp', 'costPrice', 'discPercent', 'gstPercent']

  const updateProductField = (index, field, value) => {
    // update payload
    setPayload((prev) => {
      const updated = [...prev.medicineDetails]
      updated[index][field] = numericProductFields.includes(field)
        ? value === ''
          ? ''
          : Number(value)
        : value
      return { ...prev, medicineDetails: updated }
    })

    // validate row
    setErrors((prev) => {
      const prodErrors = Array.isArray(prev.products) ? [...prev.products] : []
      const currentRow = { ...(payload.medicineDetails[index] || {}) }
      currentRow[field] = numericProductFields.includes(field)
        ? value === ''
          ? ''
          : Number(value)
        : value

      const existingKeys = new Set()
      payload.medicineDetails.forEach((r, i) => {
        if (i === index) return
        const key = `${(r.productName || '').toString().trim().toLowerCase()}__${(r.batchNo || '')
          .toString()
          .trim()
          .toLowerCase()}`
        if (r.productName || r.batchNo) existingKeys.add(key)
      })

      const rowValidation = validateProductRow(currentRow, index, existingKeys)
      prodErrors[index] = rowValidation
      return { ...prev, products: prodErrors }
    })
  }

  const handleAddProduct = () => {
    setPayload((prev) => ({
      ...prev,
      medicineDetails: [
        ...prev.medicineDetails,
        {
          sno: prev.medicineDetails.length + 1,
          productId: '',
          productName: '',
          batchNo: '',
          expDate: '',
          hsnCode: '',
          quantity: '',
          packSize: '',
          freeQty: '',
          mrp: '',
          costPrice: '',
          discountPercent: '',
          gstPercent: '',
          category: '',
          isSaved: false,
          mfgDate: '',
        },
      ],
    }))

    setErrors((prev) => {
      const prod = Array.isArray(prev.products) ? [...prev.products] : []
      prod.push({})
      return { ...prev, products: prod }
    })
  }

  const handleRemoveProduct = (index) => {
    setPayload((prev) => {
      const updated = prev.medicineDetails.filter((_, i) => i !== index)
      const renumbered = updated.map((r, idx) => ({ ...r, sno: idx + 1 }))
      return { ...prev, medicineDetails: renumbered }
    })

    setErrors((prev) => {
      const prod = Array.isArray(prev.products) ? [...prev.products] : []
      prod.splice(index, 1)
      return { ...prev, products: prod }
    })
  }

  const handleSupplierSelect = (e) => {
    const supplierId = e.target.value
    const supplierName = e.target.selectedOptions[0]?.text || ''

    setPayload((prev) => ({
      ...prev,
      supplierId,
      supplierName,
    }))

    const message = validateField('supplierName', supplierName)

    setErrors((prev) => ({
      ...prev,
      top: {
        ...(prev.top || {}),
        supplierName: message,
      },
    }))
  }

  // ---------- run full validation ----------
  const runFullValidation = () => {
    const topFields = [
      'purchaseBillNo',
      'invoiceNo',
      'supplierName',
      'invoiceDate',
      'receivingDate',
      'billDueDate',
      'taxType',

      'financialYear',
    ]

    const topErrors = {}
    topFields.forEach((f) => {
      const msg = validateField(f, payload[f])
      if (msg) topErrors[f] = msg
    })

    // invoice vs receiving date
    if (payload.invoiceDate && payload.receivingDate) {
      const inv = new Date(payload.invoiceDate)
      inv.setHours(0, 0, 0, 0)
      const rec = new Date(payload.receivingDate)
      rec.setHours(0, 0, 0, 0)
      if (rec < inv) {
        topErrors.receivingDate = 'Receiving Date cannot be earlier than Invoice Date'
      }
    }
    // Bill Due Date >= Invoice Date
    if (payload.billDueDate && payload.invoiceDate) {
      const billDue = new Date(payload.billDueDate)
      const inv = new Date(payload.invoiceDate)
      billDue.setHours(0, 0, 0, 0)
      inv.setHours(0, 0, 0, 0)

      if (billDue < inv) {
        topErrors.billDueDate = 'Bill Due Date cannot be before Invoice Date'
      }
    }

    // at least one non-empty product row
    const nonEmptyRows = payload.medicineDetails.filter(
      (row) =>
        (row.productName && row.productName.toString().trim() !== '') ||
        (row.batchNo && row.batchNo.toString().trim() !== '') ||
        (row.expDate && row.expDate.toString().trim() !== ''),
    )
    if (nonEmptyRows.length === 0) {
      topErrors.products = 'Add at least one product'
    }

    const productErrorsArr = payload.medicineDetails.map(() => ({}))
    const seen = new Set()

    payload.medicineDetails.forEach((item, idx) => {
      const key = `${(item.productName || '').toString().trim().toLowerCase()}__${(
        item.batchNo || ''
      )
        .toString()
        .trim()
        .toLowerCase()}`

      const otherKeys = new Set()
      payload.medicineDetails.forEach((r, j) => {
        if (j === idx) return
        const k = `${(r.productName || '').toString().trim().toLowerCase()}__${(r.batchNo || '')
          .toString()
          .trim()
          .toLowerCase()}`
        if (r.productName || r.batchNo) otherKeys.add(k)
      })

      const rowErrors = validateProductRow(item, idx, otherKeys)
      productErrorsArr[idx] = rowErrors

      if (key && (item.productName || item.batchNo)) {
        if (seen.has(key)) {
          productErrorsArr[idx] = {
            ...(productErrorsArr[idx] || {}),
            batchNo: 'Duplicate product & batch',
          }
        } else {
          seen.add(key)
        }
      }
    })

    setErrors({ top: topErrors, products: productErrorsArr })

    const hasTopErrors = Object.keys(topErrors).length > 0
    const hasProductErr = productErrorsArr.some((r) => Object.keys(r || {}).length > 0)

    return !(hasTopErrors || hasProductErr)
  }

  // ---------- final save ----------
  const handleFinalSave = async () => {
    const ok = runFullValidation()

    if (!ok || payload.medicineDetails.length === 0) {
      showCustomToast('Add at least one medicine', 'error')
      return
    }

    // filter out entirely empty rows
    const filteredRows = payload.medicineDetails.filter(
      (row) =>
        (row.productName && row.productName.toString().trim() !== '') ||
        (row.batchNo && row.batchNo.toString().trim() !== '') ||
        (row.expDate && row.expDate.toString().trim() !== ''),
    )

    const finalPayload = {
      purchaseBillNo: payload.purchaseBillNo,
      invoiceNo: payload.invoiceNo,
      financialYear: payload.financialYear,
      orderId: payload.orderId,

      dates: {
        invoiceDate: payload.invoiceDate,
        receivingDate: payload.receivingDate,
        billDueDate: payload.billDueDate,
      },

      taxDetails: {
        taxType: payload.taxType,
        taxMode: 'INCLUSIVE', // or EXCLUSIVE
        creditDays: Number(payload.creditDays || 0),
      },

      supplierDetails: {
        supplierId: payload.supplierId || '', // store supplierId when selecting
        supplierName: payload.supplierName || '', // store supplierId when selecting
      },

      paymentDetails: {
        paymentMode: payload.paymentMode,
        paidAmount: Number(payload.paidAmount || 0),
        previousAdjustment: Number(payload.previousAdjustment || 0),
      },

      items: filteredRows.map((item) => ({
        productName: item.productName,
        productId: item.productId,
        batchNo: item.batchNo,
        expiryDate: item.expDate,
        hsnCode: item.hsnCode,
        category: item.category,
        quantity: item.quantity,
        packSize: item.packSize,
        freeQuantity: item.freeQty,
        gstPercent: item.gstPercent,
        costPrice: item.costPrice,
        mfgDate: item.mfgDate,
        freeQuantity: item.free,
        mrp: item.mrp,
        discountPercent: item.discPercent,
      })),
      clinicId: localStorage.getItem('HospitalId'),
      branchId: localStorage.getItem('branchId'),
    }

    console.log('FINAL PAYLOAD READY TO POST >>>>', finalPayload)

    try {
      setSaveLoading(true)
      const response = await postPurchaseData(finalPayload)
      const respData = response?.data?.data || response?.data || {}
      showCustomToast('Purchase saved successfully!', 'success')
      resetForm()
      await fetchPurchase()

      setTotals({
        totalAmount: respData.totalAmount || 0,
        discountAmountTotal: respData.discountAmountTotal || 0,
        netAmount: respData.netAmount || 0,
        totalIGST: respData.totalIGST || 0,
        totalCGST: respData.totalCGST || 0,
        totalSGST: respData.totalSGST || 0,
        totalTax: respData.totalTax || 0,
        finalTotal: respData.finalTotal || 0,
        paidAmount: respData.paidAmount || 0,
        balanceAmount: respData.balanceAmount || 0,
        previousAdjustment: respData.previousAdjustment || 0,
        postDiscount: respData.postDiscount || 0,
        netPayable: respData.netPayable || 0,
      })

      await fetchPurchase()
    } catch (err) {
      setSaveLoading(false)
      console.error('Save Failed:', err)
      const msg = err?.response?.data?.message || 'Failed to save purchase!'
      // showCustomToast(msg, 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  console.log('supplier', supplier)
  const supplierOptions = supplier.map((s) => ({
    value: s.supplierId,
    label: `${s.supplierName}`,
  }))
  const calculateTotal = (item) => {
    const qty = Number(item.quantity || 0)
    const price = Number(item.costPrice || 0)
    const discount = Number(item.discPercent || 0)

    const amount = qty * price

    const discountAmount = (amount * discount) / 100

    return (amount - discountAmount).toFixed(2)
  }
  useEffect(() => {
    let totalAmount = 0
    let discountAmountTotal = 0
    let totalTax = 0

    payload.medicineDetails.forEach((item) => {
      const qty = Number(item.quantity || 0)
      const price = Number(item.costPrice || 0)
      const disc = Number(item.discPercent || 0)
      const gst = Number(item.gstPercent || 0)

      const gross = qty * price

      const discAmount = (gross * disc) / 100

      const net = gross - discAmount

      const tax = (net * gst) / 100

      totalAmount += gross
      discountAmountTotal += discAmount
      totalTax += tax
    })

    const netAmount = totalAmount - discountAmountTotal
    const finalTotal = netAmount

    const paid = Number(payload.paidAmount || 0)
    const previousAdj = Number(payload.previousAdjustment || 0)

    const netPayable = finalTotal - paid - previousAdj

    setTotals({
      totalAmount: totalAmount.toFixed(2),
      discountAmountTotal: discountAmountTotal.toFixed(2),
      netAmount: netAmount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      finalTotal: finalTotal.toFixed(2),
      paidAmount: paid,
      previousAdjustment: previousAdj,
      netPayable: netPayable.toFixed(2),
    })
  }, [payload.medicineDetails, payload.paidAmount, payload.previousAdjustment])

  const medicineOptions = medicines.map((m) => ({
    value: m.id,
    label: `${m.productName} - ${m.composition}`,
  }))

  const medicineTypeOptions = medicineTypes.map((t) => ({
    value: t,
    label: t,
  }))

  // -------------------- Render --------------------
  return (
    <div style={{ border: '1px solid #9b9fa4ff', borderRadius: 6, padding: '12px' }}>
      <div
        className="d-flex flex-wrap justify-content-between align-items-center"
        style={{ color: 'var(--color-black)' }}
      >
        <div className="d-flex align-items-center gap-3 w-100">
          <CRow className="mb-2 mt-1">
            <CCol md={2}>
              <label className="small mb-1">Date</label>
            </CCol>
            <CCol md={8}>
              <CFormInput type="date" size="sm" value={payload.date} disabled />
            </CCol>
          </CRow>

          <CRow className="mb-2 mt-1 w-25">
            <CCol md={2}>
              <label className="small mb-1">Time</label>
            </CCol>
            <CCol md={8}>
              <CFormInput type="time" size="sm" value={payload.time} disabled />
            </CCol>
          </CRow>

          {/* Push button to right corner */}
          {/* TODO: modal for view purchase*/}

          <CButton
            type="button"
            size="sm"
            className="
    ms-md-auto 
    d-flex align-items-center justify-content-center gap-1
    mt-2 mt-md-0"
            style={{
              height: '30px',
              padding: '0 12px',
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
              borderRadius: '4px',
            }}
            onClick={() => navigate('/pharmacy/purchases/bills')}
          >
            View Purchase Bills
          </CButton>
          <CCol xs={12} sm={6} md={2} className="mt-2 mb-2">
            <CButton
              size="sm"
              className="w-100"
              onClick={goToSupplier}
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            >
              New Supplier
            </CButton>
          </CCol>
        </div>
      </div>

      {/* TOP BILLING DETAILS */}
      <div
        style={{
          marginBottom: '15px',
          padding: '10px',
          border: '1px solid #7DC2FF',
          borderRadius: '4px',
          color: 'var(--color-black)',
        }}
      >
        {/* ================= FIRST ROW ================= */}
        <CRow>
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Order Id</CFormLabel>
            <CFormInput
              value={payload.orderId}
              onChange={(e) => handleOrderIdChange(e.target.value)}
            />
            {/* {errors.top.orderId && (
              <div className="text-danger small">{errors.top.orderId}</div>
            )} */}
          </CCol>
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Purchase Bill No</CFormLabel>
            <CFormInput
              value={payload.purchaseBillNo}
              onChange={(e) => updateTopField('purchaseBillNo', e.target.value)}
            />
            {errors.top.purchaseBillNo && (
              <div className="text-danger small">{errors.top.purchaseBillNo}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Invoice Date</CFormLabel>
            <CFormInput
              type="date"
              value={payload.invoiceDate}
              onChange={(e) => updateTopField('invoiceDate', e.target.value)}
            />
            {errors.top.invoiceDate && (
              <div className="text-danger small">{errors.top.invoiceDate}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Receiving Date</CFormLabel>
            <CFormInput
              type="date"
              value={payload.receivingDate}
              onChange={(e) => updateTopField('receivingDate', e.target.value)}
            />
            {errors.top.receivingDate && (
              <div className="text-danger small">{errors.top.receivingDate}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Tax Type</CFormLabel>
            <CFormSelect
              size="sm"
              value={payload.taxType || ''}
              onChange={(e) => updateTopField('taxType', e.target.value)}
            >
              <option value="">Select</option>
              <option value="GST">GST</option>
              <option value="IGST">IGST</option>
            </CFormSelect>
            {errors.top.taxType && <div className="text-danger small">{errors.top.taxType}</div>}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Invoice No</CFormLabel>
            <CFormInput
              value={payload.invoiceNo}
              onChange={(e) => updateTopField('invoiceNo', e.target.value)}
            />
            {errors.top.invoiceNo && (
              <div className="text-danger small">{errors.top.invoiceNo}</div>
            )}
          </CCol>
        </CRow>

        {/* ================= SECOND ROW ================= */}
        <CRow className="gy-2 mt-2">
          <CCol xs={12} sm={6} md={3}>
            <CFormLabel>Financial Year</CFormLabel>
            <CFormInput
              placeholder="2025-2026"
              value={payload.financialYear}
              onChange={(e) => {
                let value = e.target.value

                // allow only numbers and hyphen
                value = value.replace(/[^0-9-]/g, '')

                // allow only ONE hyphen
                const parts = value.split('-')
                if (parts.length > 2) {
                  value = parts[0] + '-' + parts.slice(1).join('')
                }

                // limit length to YYYY-YYYY
                value = value.slice(0, 9)

                updateTopField('financialYear', value)
              }}
            />

            {errors.top.financialYear && (
              <div className="text-danger small">{errors.top.financialYear}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={3}>
            <CFormLabel>Supplier</CFormLabel>
            <Select
              options={supplierOptions}
              placeholder="Search Supplier..."
              value={supplierOptions.find((opt) => opt.value === payload.supplierId) || null}
              onChange={(selected) => {
                const supplierObj = supplier.find((s) => s.supplierId === selected?.value)

                setPayload((prev) => ({
                  ...prev,
                  supplierId: selected?.value || '',
                  supplierName: selected?.label || '',

                  duePaidBillNo: supplierObj?.duePaidBill ? supplierObj.duePaidBill : 'No Due',

                  previousAdjustment: supplierObj?.previousAdjustment ?? 0,
                }))
                setErrors((prev) => ({
                  ...prev,
                  top: {
                    ...prev.top,
                    supplierName: '',
                  },
                }))
              }}
              isClearable
            />
            {errors.top.supplierName && (
              <div className="text-danger small">{errors.top.supplierName}</div>
            )}
          </CCol>
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Bill Due Date</CFormLabel>
            <CFormInput
              type="date"
              value={payload.billDueDate}
              onChange={(e) => updateTopField('billDueDate', e.target.value)}
            />
            {errors.top.billDueDate && (
              <div className="text-danger small">{errors.top.billDueDate}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Credit Days</CFormLabel>
            <CFormInput
              value={payload.creditDays}
              onChange={(e) => updateTopField('creditDays', e.target.value.replace(/\D/g, ''))}
            />
            {errors.top.creditDays && (
              <div className="text-danger small">{errors.top.creditDays}</div>
            )}
          </CCol>
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Due Paid Bill No</CFormLabel>
            {/* <CFormInput
              value={payload.duePaidBillNo}
              onChange={(e) => updateTopField('duePaidBillNo', e.target.value)}
               disabled
            /> */}
            <CFormInput value={payload.duePaidBillNo} disabled />
            {/* {errors.top.duePaidBillNo && (
              <div className="text-danger small">{errors.top.duePaidBillNo}</div>
            )} */}
          </CCol>
        </CRow>

        {/* ================= EXTRA BACKEND FIELDS ================= */}
        <CRow className="gy-2 mt-3">
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Payment Mode</CFormLabel>
            <CFormSelect
              value={payload.paymentMode}
              onChange={(e) => updateTopField('paymentMode', e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </CFormSelect>
            {errors.top.paymentMode && (
              <div className="text-danger small">{errors.top.paymentMode}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Paid Amount</CFormLabel>
            <CFormInput
              //TODO: paid amount should be same as to show in the total calculation paid amount
              type="number"
              value={payload.paidAmount}
              onChange={(e) => updateTopField('paidAmount', e.target.value)}
            />
            {errors.top.paidAmount && (
              <div className="text-danger small">{errors.top.paidAmount}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={4}>
            <CFormLabel>Previous Adjustment</CFormLabel>
            {/* <CFormInput
              type="number"
              value={payload.previousAdjustment}
              onChange={(e) => updateTopField('previousAdjustment', e.target.value)}
            /> */}
            <CFormInput value={payload.previousAdjustment} disabled />
            {/* {errors.top.previousAdjustment && (
              <div className="text-danger small">{errors.top.previousAdjustment}</div>
            )} */}
          </CCol>
          <CCol xs={12} sm={6} md={4}>
            <CFormLabel>Product Name</CFormLabel>

            <Select
              options={medicineOptions}
              placeholder="Search Medicine..."
              value={
                medicineOptions.find((opt) => opt.value === payload.selectedMedicineId) || null
              }
              onChange={(selected) => {
                handleMedicineSelect(selected?.value || '')
              }}
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

            {errors.top.previousAdjustment && (
              <div className="text-danger small">{errors.top.previousAdjustment}</div>
            )}
          </CCol>

          {/* <CCol xs={12} sm={6} md={2} className="mt-2 mb-2">
            <CButton
              size="sm"
              className="w-100"
              onClick={handleAddProduct}
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            >
              New Product
            </CButton>
          </CCol> */}
        </CRow>

        {/* ================= ACTION BUTTONS ================= */}
      </div>

      {/* PURCHASE TABLE */}
      <div style={{ position: 'relative', marginTop: '18px', marginBottom: '10px' }}>
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '20px',
            padding: '0 20px',
            fontSize: '1.05rem',
            color: 'var(--color-black)',
          }}
        >
          Purchase Details
        </div>

        {/* PURCHASE TABLE CARD */}
        <div
          style={{
            borderRadius: 8,
            padding: '30px',
            background: '#fff',
            color: 'var(--color-black)',
          }}
        >
          <div
            style={{
              maxHeight: 250,
              overflowY: 'auto',
              border: '1px solid #d8d8d8',
              borderRadius: 6,
              background: '#fafafa',
            }}
          >
            <CTable bordered hover responsive className="m-0" style={{ fontSize: '0.78rem' }}>
              <CTableHead
                style={{
                  background: 'var(--color-bgcolor)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <CTableRow className="pink-table w-auto">
                  {[
                    'S.No',
                    'Product ID',
                    'Product Name',
                    'Batch No',
                    'Mfg. Date',
                    'Exp. Date',
                    'HSN Code',
                    'Category',
                    'Qty',
                    'Pack Size',
                    'Free',
                    'GST%',
                    'Cost Price',
                    'MRP',
                    'Disc%',
                    'Total Amount',
                    'Actions',
                  ].map((h, index) => (
                    <CTableHeaderCell
                      key={index}
                      className="text-center fw-semibold"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {h}
                    </CTableHeaderCell>
                  ))}
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {payload.medicineDetails.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell className="text-center">{item.sno}</CTableDataCell>

                    {/* Product ID */}
                    <CTableDataCell>
                      <CFormInput size="md" className="py-0" value={item.productId} disabled />
                    </CTableDataCell>

                    {/* Product Name */}
                    <CTableDataCell style={{ minWidth: 200 }}>
                      {(() => {
                        const selectedMedicine = medicines.find((med) => med.id === item.productId)

                        return (
                          <CFormInput
                            size="md"
                            className="py-0"
                            value={
                              item.productName
                                ? `${item.productName}${selectedMedicine?.composition ? ` - ${selectedMedicine.composition}` : ''}`
                                : ''
                            }
                            disabled
                          />
                        )
                      })()}

                      {errors.products[index]?.productName && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].productName}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Batch No */}
                    <CTableDataCell style={{ minWidth: 200 }}>
                      <CFormInput
                        type="text"
                        value={item.batchNo}
                        style={{ height: '26px' }}
                        onChange={(e) => updateProductField(index, 'batchNo', e.target.value)}
                      />
                      {errors.products[index]?.batchNo && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].batchNo}
                        </div>
                      )}
                    </CTableDataCell>
                    {/* exp Date */}
                    <CTableDataCell>
                      <CFormInput
                        type="date"
                        value={item.mfgDate}
                        style={{ height: '26px', padding: '0 6px', fontSize: '12px' }}
                        onChange={(e) => updateProductField(index, 'mfgDate', e.target.value)}
                      />
                      {errors.products[index]?.expDate && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].expDate}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* mfg Date */}
                    <CTableDataCell>
                      <CFormInput
                        type="date"
                        value={item.expDate}
                        style={{ height: '26px', padding: '0 6px', fontSize: '12px' }}
                        onChange={(e) => updateProductField(index, 'expDate', e.target.value)}
                      />
                      {errors.products[index]?.mfgDate && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].mfgDate}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* HSN */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        size="md"
                        className="py-0"
                        placeholder="e.g. 30045010"
                        value={item.hsnCode}
                        style={{ height: '26px' }}
                        onChange={(e) => updateProductField(index, 'hsnCode', e.target.value)}
                      />
                      {errors.products[index]?.hsnCode && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].hsnCode}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Category */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <Select
                        options={medicineTypeOptions}
                        placeholder="Select Category"
                        value={
                          medicineTypeOptions.find((opt) => opt.value === item.category) || null
                        }
                        onChange={(selected) =>
                          updateProductField(index, 'category', selected?.value || '')
                        }
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          container: (base) => ({
                            ...base,
                            width: '100%',
                          }),

                          control: (base) => ({
                            ...base,
                            minHeight: 26,
                            height: 26,
                            fontSize: '12px',
                          }),

                          valueContainer: (base) => ({
                            ...base,
                            height: 26,
                            padding: '0 6px',
                          }),

                          indicatorsContainer: (base) => ({
                            ...base,
                            height: 26,
                          }),

                          dropdownIndicator: (base) => ({
                            ...base,
                            padding: 2,
                          }),

                          clearIndicator: (base) => ({
                            ...base,
                            padding: 2,
                          }),

                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),

                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />

                      {errors.products?.[index]?.category && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].category}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Qty */}
                    <CTableDataCell style={{ minWidth: 100 }}>
                      <CFormInput
                        type="number"
                        size="md"
                        className="text-end py-0"
                        value={item.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', e.target.value)}
                      />
                      {errors.products[index]?.quantity && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].quantity}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Pack Size */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        size="md"
                        className="text-end py-0"
                        value={item.packSize}
                        onChange={(e) => updateProductField(index, 'packSize', e.target.value)}
                      />
                    </CTableDataCell>

                    {/* Free */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        type="number"
                        size="md"
                        className="text-end py-0"
                        value={item.free}
                        onChange={(e) => updateProductField(index, 'free', e.target.value)}
                      />
                    </CTableDataCell>

                    {/* GST */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        type="number"
                        size="md"
                        className="text-end py-0"
                        value={item.gstPercent}
                        onChange={(e) => updateProductField(index, 'gstPercent', e.target.value)}
                      />
                      {errors.products[index]?.gstPercent && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].gstPercent}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Cost Price */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        type="number"
                        size="md"
                        className="text-end py-0"
                        value={item.costPrice}
                        onChange={(e) => updateProductField(index, 'costPrice', e.target.value)}
                      />
                      {errors.products[index]?.costPrice && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].costPrice}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* MRP */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        type="number"
                        size="md"
                        className="text-end py-0"
                        value={item.mrp}
                        onChange={(e) => updateProductField(index, 'mrp', e.target.value)}
                      />
                      {errors.products[index]?.mrp && (
                        <div className="text-danger small mt-1">{errors.products[index].mrp}</div>
                      )}
                    </CTableDataCell>

                    {/* Disc% */}
                    <CTableDataCell style={{ minWidth: 160 }}>
                      <CFormInput
                        type="number"
                        size="md"
                        className="text-end py-0"
                        value={item.discPercent}
                        onChange={(e) => updateProductField(index, 'discPercent', e.target.value)}
                      />
                      {errors.products[index]?.discPercent && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].discPercent}
                        </div>
                      )}
                    </CTableDataCell>
                    <CTableDataCell style={{ minWidth: 140 }}>
                      <CFormInput
                        size="md"
                        className="text-end py-0"
                        value={calculateTotal(item)}
                        disabled
                      />
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="actionBtn"
                          onClick={() => handleRemoveProduct(index)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* TOTALS GRID */}

          <div
            className="mt-3 p-3"
            style={{
              background: '#F6F8FA',
              borderRadius: 6,
              border: '1px solid #DFE3E8',
            }}
          >
            <CRow className="g-3">
              {[
                ['Total Amt', totals.totalAmount],
                ['Disc Amt', totals.discountAmountTotal],
                ['Final Amt', totals.finalTotal],
                // ['Total Tax', totals.totalTax],
                // ['Final Total', totals.finalTotal],
                ['Due Amt', totals.netPayable],
                // ['Credit Days', payload.creditDays],
                // ['Paid Amount', totals.paidAmount],
              ].map(([label, value], i) => (
                <CCol md={3} key={i}>
                  <CFormLabel className="fw-bold small mb-1">{label}</CFormLabel>
                  <CFormInput size="sm" disabled value={value} className="bg-light text-end" />
                </CCol>
              ))}
            </CRow>
          </div>
        </div>
      </div>

      {/* SEARCH / NAV BAR */}
      <div
        className="d-flex align-items-center"
        style={{
          color: 'var(--color-black)',
          background: '#E8F3FF',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #B5D9FF',
          overflowX: 'auto',
        }}
      >
        {/* <CFormLabel className="fw-bold me-2 mb-0">Search</CFormLabel>
        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '160px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">From</CFormLabel>
        <CFormInput
          type="date"
          value={payload.invoiceDate || ''}
          style={{ width: '120px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">To</CFormLabel>
        <CFormInput
          type="date"
          value={payload.receivingDate || ''}
          style={{ width: '120px', height: '25px', padding: '0 5px' }}
          className="me-3"
        /> */}

        {/* <CIcon icon={cilPrint} size="lg" className="mx-1" style={{ cursor: 'pointer' }} /> */}
        {/* <CIcon icon={cilMagnifyingGlass} size="lg" className="mx-3" style={{ cursor: 'pointer' }} /> */}

        <div className="ms-auto d-flex gap-2">
          {/* <CButton
            color="light"
            size="sm"
            style={{ height: '25px', padding: '0 5px', color: 'var(--color-black)' }}
          >
            Close
          </CButton> */}
          {/* product-level top error */}
          {errors.top.products && (
            <div className="text-danger small mt-2">{errors.top.products}</div>
          )}

          {/* <CButton
            size="sm"
            style={{
              backgroundColor: 'var(--color-bgcolor)',
              color: 'var(--color-black)',
              height: '25px',
              padding: '0 10px',
              borderRadius: '4px',
            }}
            onClick={handleShowTotals}
          >
            Purchase Summary
          </CButton> */}
          <CButton
            size="sm"
            className="d-flex align-items-center gap-1"
            style={{
              height: '25px',
              padding: '0 10px',
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
              borderRadius: '4px',
            }}
            onClick={handleFinalSave}
          >
            <CIcon icon={cilSave} size="sm" />
            {saveLoading ? 'Saving...' : 'Save'}{' '}
            {/* TODO: disable until purchase summary is clicked*/}
          </CButton>

          {/* <CButton
            size="sm"
            style={{
              height: '25px',
              padding: '0 5px',
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}
          >
            Print
          </CButton> */}
        </div>
      </div>
      {/* SAVED PURCHASES LIST */}
      {/* <div className="mt-4">
  <h6 className="fw-bold">Saved Purchase Bills</h6>

  {loading ? (
    <p>Loading purchases...</p>
  ) : purchaseData.length === 0 ? (
    <p>No purchases found.</p>
  ) : (
    <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #d8d8d8', borderRadius: 6 }}>
      <CTable bordered hover responsive className="m-0" style={{ fontSize: '0.78rem' }}>
      <CTableHead>
  <CTableRow>
    <CTableHeaderCell>S.No</CTableHeaderCell>
    <CTableHeaderCell>Bill No</CTableHeaderCell>
    <CTableHeaderCell>Supplier</CTableHeaderCell>
    <CTableHeaderCell>Invoice No</CTableHeaderCell>
    <CTableHeaderCell>Invoice Date</CTableHeaderCell>
    <CTableHeaderCell>Final Total</CTableHeaderCell>
    <CTableHeaderCell>Payment Mode</CTableHeaderCell>
    <CTableHeaderCell>Tax Type</CTableHeaderCell>
    <CTableHeaderCell>Action</CTableHeaderCell>
  </CTableRow>
</CTableHead>

  <CTableBody>
  {purchaseData.map((p, idx) => (
    <CTableRow key={p.id || idx}>
      <CTableDataCell>{idx + 1}</CTableDataCell>
      <CTableDataCell>{p.purchaseBillNo}</CTableDataCell>
      <CTableDataCell>{p.supplierName}</CTableDataCell>
      <CTableDataCell>{p.invoiceNo}</CTableDataCell>
      <CTableDataCell>{p.invoiceDate?.slice(0, 10)}</CTableDataCell>
      <CTableDataCell>{p.finalTotal}</CTableDataCell>
      <CTableDataCell>{p.paymentMode}</CTableDataCell>
      <CTableDataCell>{p.taxType}</CTableDataCell>

      <CTableDataCell>
        <CButton size="sm">View</CButton>
      </CTableDataCell>
    </CTableRow>
  ))}
</CTableBody>



      </CTable>
    </div>
  )}
</div> */}
    </div>
  )
}

export default Purchases
