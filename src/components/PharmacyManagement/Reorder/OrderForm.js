/* eslint-disable react/prop-types */
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CFormTextarea,
} from '@coreui/react'
// import { suppliers } from './dummyProductData'
import { useMedicines } from '../../../Context/MedicineContext'
import Select from 'react-select'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { showCustomToast } from '../../../Utils/Toaster'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { createOrderAPI } from './PharmacyOrderAPI'

// eslint-disable-next-line react/display-name
const OrderForm = forwardRef(({ onSave }, ref) => {
  const { medicines, loading, supplier } = useMedicines()
  const [formData, setFormData] = useState({
    clinicId: localStorage.getItem('HospitalId'),
    clinicName: localStorage.getItem('HospitalName'),
    branchId: localStorage.getItem('branchId'),
    branchName: localStorage.getItem('branchName'),
    supplierId: '',
    supplierName: '',
    supplierEmail: '',
    expectedDeliveryDays: '',
    expectedDeliveryDate: '',
    // overallStatus: 'PENDING',
    // overallReason: '',
  })

  console.log(medicines)

  const [products, setProducts] = useState([
    {
      productId: '',
      productName: '',
      hsnCode: '',
      packSize: '',
      mrp: '',
      category: '',
      gstPercent: '',
      quantityRequested: '',
      // status: '',
      // rejectionReason: null,
    },
  ])

  const [errors, setErrors] = useState({
    supplierId: '',
    expectedDeliveryDays: '',
  })

  if (loading) return <div>Loading...</div>

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productId: '',
        productName: '',
        hsnCode: '',
        packSize: '',
        mrp: '',
        category: '',
        gstPercent: '',
        quantityRequested: '',
      },
    ])
  }
  const isProductValid = (product) => {
    return (
      product.productName && product.quantityRequested && Number(product.quantityRequested) >= 1
    )
  }
  // Handle Order Level Change
  const handleFormChange = (field, value) => {
    let updatedData = {
      ...formData,
      [field]: value,
    }

    // ✅ Auto calculate date
    if (field === 'expectedDeliveryDays' && value) {
      const today = new Date()
      const futureDate = new Date()

      futureDate.setDate(today.getDate() + Number(value))

      // Format YYYY-MM-DD
      const formattedDate = futureDate.toISOString().split('T')[0]

      updatedData.expectedDeliveryDate = formattedDate
    }
    if (field === 'expectedDeliveryDays' && value < 1) {
      value = 1
    }

    setFormData(updatedData)
    // ✅ Clear error instantly when user types correct value
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle Supplier Selection
  const handleSupplierChange = (selectedOption) => {
    const selected = supplier.find((s) => s.supplierId === selectedOption?.value)

    setFormData({
      ...formData,
      supplierId: selected?.supplierId || '',
      supplierName: selected?.supplierName || '',
      supplierEmail: selected?.contactDetails?.email || '',
    })

    if (errors.supplierId) {
      setErrors((prev) => ({
        ...prev,
        supplierId: '',
      }))
    }
  }

  // Add Product Row

  // Handle Product Change
  // const handleProductChange = (index, field, value) => {
  //   const updated = [...products]
  //   updated[index][field] = value
  //   setProducts(updated)
  // }

  // Calculate Delivery Date
  const calculateDeliveryDate = (days) => {
    const today = new Date()
    today.setDate(today.getDate() + Number(days))
    return today.toISOString().split('T')[0]
  }
  const removeProduct = (index) => {
    const updated = products.filter((_, i) => i !== index)
    setProducts(updated)
  }
  const handleSubmit = async () => {
    let newErrors = {}

    if (!formData.supplierId) {
      newErrors.supplierId = 'Please select supplier'
    }

    if (!formData.expectedDeliveryDays) {
      newErrors.expectedDeliveryDays = 'Please enter delivery days'
    } else if (Number(formData.expectedDeliveryDays) <= 0) {
      newErrors.expectedDeliveryDays = 'Delivery days must be greater than 0'
    }

    const validProducts = products.filter(
      (p) =>
        p.productId && p.productName && p.quantityRequested && Number(p.quantityRequested) >= 1,
    )

    if (validProducts.length === 0) {
      showCustomToast('Please add at least one medicine', 'error')
      return
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    // ✅ Prepare API data in backend format
    const finalData = {
      clinic: {
        clinicId: formData.clinicId, // from state / props / redux
        clinicName: formData.clinicName,
      },

      branch: {
        branchId: formData.branchId,
        branchName: formData.branchName,
      },

      supplier: {
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        supplierEmail: formData.supplierEmail,
      },

      expectedDeliveryDays: Number(formData.expectedDeliveryDays),

      expectedDeliveryDate: calculateDeliveryDate(formData.expectedDeliveryDays),

      products: validProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        hsnCode: p.hsnCode,
        packSize: p.packSize,
        mrp: p.mrp,
        category: p.category,
        gst: p.gstPercent,
        quantityRequested: Number(p.quantityRequested),
      })),

      createdBy: localStorage.getItem('staffName') || localStorage.getItem('role'), // or logged user
    }

    console.log('FINAL ORDER DATA:', finalData)

    try {
      const res = await createOrderAPI(finalData)

      if (res.status !== 201) {
        throw new Error(res.data.message)
      }

      showCustomToast(res.message || 'Order Created Successfully', 'success')

      onSave(finalData)
    } catch (error) {
      console.log(error)

      showCustomToast(error?.response?.data?.message || 'Failed to create order', 'error')
    }
  }

  useImperativeHandle(ref, () => ({
    submitForm() {
      handleSubmit()
    },
  }))
  const options =
    medicines?.map((med) => ({
      value: med.id,
      label: med.productName,
      hsn: med.hsnCode,
      packSize: med.packSize,
      mrp: med.mrp,
      category: med.category,
      gstPercent: med.gstPercent,
    })) || []

  const handleProductChange = (index, fieldOrSelected, value = null) => {
    const updatedProducts = [...products]

    // 🔹 Case 1: Medicine selected from react-select
    if (typeof fieldOrSelected === 'object' && fieldOrSelected !== null) {
      const selected = fieldOrSelected

      updatedProducts[index] = {
        ...updatedProducts[index],
        productId: selected.value,
        productName: selected.label,
        hsnCode: selected.hsn,
        mrp: selected.mrp,
        category: selected.category,
        gstPercent: selected.gstPercent,
        packSize: selected.packSize,
      }
    }

    // 🔹 Case 2: Quantity changed
    else {
      updatedProducts[index][fieldOrSelected] = value
    }

    setProducts(updatedProducts)
  }

  const supplierOptions = supplier.map((s) => ({
    value: s.supplierId,
    label: s.supplierName,
  }))
  const selectedMedicines = products.map((p) => p.productName)
  const filteredOptions = options.map((opt) => ({
    ...opt,
    isDisabled: selectedMedicines.includes(opt.label),
  }))
  return (
    <div style={{ backgroundColor: 'transparent' }}>
      <div style={{ backgroundColor: 'transparent' }}>
        {/* Clinic & Branch */}
        <CRow>
          <CCol md={6}>
            <CFormInput label="Clinic Name" value={formData.clinicName} disabled />
          </CCol>
          <CCol md={6}>
            <CFormInput label="Branch Name" value={capitalizeWords(formData.branchName)} disabled />
          </CCol>
        </CRow>

        {/* Supplier */}
        <CRow className="mt-3">
          <CCol md={6}>
            <label className="form-label">Select Supplier</label>

            <Select
              options={supplierOptions}
              value={supplierOptions.find((option) => option.value === formData.supplierId)}
              onChange={handleSupplierChange}
              placeholder="Search Supplier..."
              isSearchable
            />

            {errors.supplierId && <div className="text-danger">{errors.supplierId}</div>}
          </CCol>

          <CCol md={6}>
            <CFormInput label="Supplier Email" value={formData.supplierEmail} disabled />
          </CCol>
        </CRow>

        {/* Delivery */}
        <CRow className="mt-3">
          <CCol md={6}>
            <CFormInput
              type="number"
              label="Expected Delivery Days"
              min={1}
              value={formData.expectedDeliveryDays}
              onChange={(e) => handleFormChange('expectedDeliveryDays', e.target.value)}
              invalid={!!errors.expectedDeliveryDays}
            />

            {errors.expectedDeliveryDays && (
              <div className="text-danger small mt-1">{errors.expectedDeliveryDays}</div>
            )}
          </CCol>
          <CCol md={6}>
            <CFormInput
              type="date"
              label="Expected Delivery Date"
              value={formData.expectedDeliveryDate}
              readOnly
            />
          </CCol>
        </CRow>

        <hr />

        <h5>Products</h5>

        {products.map((p, index) => (
          <CRow key={index} className="mb-3 align-items-end">
            <CCol md={3}>
              <label className="form-label">Select Medicine</label>
              <Select
                options={filteredOptions}
                placeholder="Select Medicine"
                value={options.find((opt) => opt.label === p.productName)}
                onChange={(selected) => handleProductChange(index, selected)}
                isSearchable
                maxMenuHeight={200}
              />
            </CCol>

            <CCol md={2}>
              <CFormInput label="HSN Code" value={p.hsnCode} readOnly />
            </CCol>

            <CCol md={2}>
              <CFormInput label="Pack Size" value={p.packSize} readOnly />
            </CCol>
            <CCol md={2}>
              <CFormInput label="Category" value={p.category} readOnly />
            </CCol>
            <CCol md={2}>
              <CFormInput label="MRP" value={p.mrp} readOnly />
            </CCol>

            <CCol md={2}>
              <CFormInput
                type="number"
                label="Quantity"
                min={1} // ✅ minimum 1
                required
                value={p.quantityRequested}
                onChange={(e) => handleProductChange(index, 'quantityRequested', e.target.value)}
                invalid={!p.quantityRequested || p.quantityRequested < 1}
              />
            </CCol>

            {/* ✅ Add / Remove Button Column */}
            <CCol md={2}>
              {index === products.length - 1 ? (
                <CButton color="success" disabled={!isProductValid(p)} onClick={addProduct}>
                  <CIcon icon={cilPlus} size="sm" style={{ color: 'white' }} />
                </CButton>
              ) : (
                <CButton color="danger" onClick={() => removeProduct(index)}>
                  <CIcon icon={cilTrash} size="sm" style={{ color: 'white' }} />
                </CButton>
              )}
            </CCol>
          </CRow>
        ))}

        <hr />
        <div className="d-flex justify-content-end w-100"></div>
      </div>
    </div>
  )
})

export default OrderForm
