import React, { useState, useEffect } from 'react'
import {
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import { GetSubServices_ByClinicId } from '../ProcedureManagement/ProcedureManagementAPI'
import Select from "react-select"
import { showCustomToast } from '../../Utils/Toaster'
import { cilPlus, cilTrash } from "@coreui/icons"
import CIcon from "@coreui/icons-react"

const TreatmentPackageForm = ({ data, onSave,therapyOptions,onCancel  }) => {
  const [therapiesOptions, setTherapyOptions] = useState([])
  const [form, setForm] = useState({
    name: '',
    price: '',
    discount: '',
    gst: '',
    otherTaxes: '',
    paymentType: 'FULL_PAYMENT',
     partialPercentage: '',
    offerStartDate: '',
    offerEndDate: '',
    description: '',
    therapies: [
      { name: '', sessions: '', sessionDuration: '', validity: '' }
    ]
  })

  const validateTherapy = (therapy) => {
  if (!therapy.name) return "Select therapy"
  if (!therapy.sessions) return "Enter sessions"
  if (!therapy.sessionDuration) return "Enter duration"
  if (!therapy.validity) return "Enter validity"
  return null
}
const validateTherapies = () => {
  if (!form.therapies || form.therapies.length === 0) {
    alert("Add at least one therapy")
    return false
  }

  for (let i = 0; i < form.therapies.length; i++) {
    const t = form.therapies[i]

    if (!t.name || !t.sessions || !t.sessionDuration || !t.validity) {
      alert(`Fill all fields in row ${i + 1}`)
      return false
    }
  }

  return true
}

  // ✅ EDIT MODE
  useEffect(() => {
    if (data) {
      setForm({
        name: data.packageName || '',
        price: data.packagePrice || '',
        discount: data.discount || '',
        gst: data.gst || '',
        otherTaxes: data.otherTaxes || '',
        paymentType: data.paymentType || 'FULL_PAYMENT',
        offerStartDate: data.offerStartDate || '',
        offerEndDate: data.offerEndDate || '',
        description: data.description || '',
        therapies: data.therapies || [
          { name: '', sessions: '', sessionDuration: '', validity: '' }
        ]
      })
    }
  }, [data])
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleTherapyChange = (i, field, value) => {
    const updated = [...form.therapies]
    updated[i][field] = value
    setForm({ ...form, therapies: updated })
  }

const addTherapy = () => {
  const lastTherapy = form.therapies[form.therapies.length - 1]

  const error = validateTherapy(lastTherapy)

  if (error) {
    showCustomToast(error) // 👉 you can replace with toast later
    return
  }

  setForm({
    ...form,
    therapies: [
      ...form.therapies,
      { name: "", sessions: "", sessionDuration: "", validity: "" },
    ],
  })
}
const removeTherapy = (index) => {
  const updated = form.therapies.filter((_, i) => i !== index)

  // 👉 Always keep at least one row
  if (updated.length === 0) {
    updated.push({
      name: "",
      sessions: "",
      sessionDuration: "",
      validity: "",
    })
  }

  setForm({ ...form, therapies: updated })
}

const handleSubmit = () => {
  if (!validateTherapies()) return
  if (form.paymentType === "PARTIAL_PAYMENT" && !form.partialPercentage) {
  showCustomToast("Enter partial payment percentage")
  return
}

  const payload = {
    packageName: form.name,
    packagePrice: Number(form.price),
    discount: Number(form.discount),
    gst: Number(form.gst),
    otherTaxes: Number(form.otherTaxes),
    paymentType: form.paymentType,
    offerStartDate: form.offerStartDate,
    offerEndDate: form.offerEndDate,
    description: form.description,
    partialPaymentPercentage: Number(form.partialPercentage),

    therapies: form.therapies.map((t) => ({
      name: t.name,
      sessions: Number(t.sessions),
      sessionDuration: t.sessionDuration,
      validity: Number(t.validity),
    })),
  }

  onSave(payload)
}

const getTherapyOptions = async () => {
  try {
    const hospitalId = localStorage.getItem('HospitalId')

    const res = await GetSubServices_ByClinicId(hospitalId)

    console.log("API Response:", res)

    const subServiceData = res || []   // ✅ CORRECT

    const options = subServiceData.map((service) => ({
      label: service.subServiceName,
      value: service.subServiceId,
    }))

    console.log("OPTIONS:", options)

    setTherapyOptions(options)
  } catch (err) {
    console.error("Error fetching therapies:", err)
    setTherapyOptions([])
  }
}
useEffect(() => {
  getTherapyOptions()
}, [])

  return (
    <>
      {/* ================= BASIC INFO ================= */}
   

    
       
   

    

      {/* ================= PRICING ================= */}
   

      <CRow className="mb-3">
         <CCol md={4}>
          <CFormLabel>Program Name <span className="text-danger">*</span></CFormLabel>
          <CFormInput name="name" value={form.name} onChange={handleChange} />
        </CCol>
        <CCol md={4}>
          <CFormLabel>Price <span className="text-danger">*</span></CFormLabel>
          <CFormInput type="number" name="price" value={form.price} onChange={handleChange} />
        </CCol>

        <CCol md={4}>
          <CFormLabel>Discount (%)</CFormLabel>
          <CFormInput type="number" name="discount" value={form.discount} onChange={handleChange} />
        </CCol>
        </CRow>
 <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel>GST (%)</CFormLabel>
          <CFormInput type="number" name="gst" value={form.gst} onChange={handleChange} />
        </CCol>

        <CCol md={4}>
          <CFormLabel>Other Taxes (%)</CFormLabel>
          <CFormInput type="number" name="otherTaxes" value={form.otherTaxes} onChange={handleChange} />
        </CCol>
        <CCol md={4}>
          <CFormLabel>Payment Type <span className="text-danger">*</span></CFormLabel>
          <CFormSelect name="paymentType" value={form.paymentType} onChange={handleChange}>
            <option value="FULL_PAYMENT">Full Payment</option>
            <option value="PARTIAL_PAYMENT">Partial Payment</option>
          </CFormSelect>
        </CCol>
        {form.paymentType === "PARTIAL_PAYMENT" && (
  <CCol md={4}>
    <CFormLabel>
      Partial Payment (%) <span className="text-danger">*</span>
    </CFormLabel>
    <CFormInput
      type="number"
      name="partialPercentage"
      value={form.partialPercentage}
      onChange={handleChange}
    />
  </CCol>
)}
      </CRow>

    
  
 

      {/* ================= OFFER ================= */}
     

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Offer Start Date</CFormLabel>
          <CFormInput type="date" name="offerStartDate" value={form.offerStartDate} onChange={handleChange} />
        </CCol>

        <CCol md={6}>
          <CFormLabel>Offer End Date</CFormLabel>
          <CFormInput type="date" name="offerEndDate" value={form.offerEndDate} onChange={handleChange} />
        </CCol>
         <CCol className="mt-3">
          <CFormLabel>Description</CFormLabel>
      <CFormTextarea
        name="description"
        value={form.description}
        onChange={handleChange}
        className="mb-3"
      />
         </CCol>
      </CRow>

      {/* ================= THERAPIES ================= */}
      <h5 className="mb-3">Therapies</h5>

{form.therapies.map((t, i) => (
  <div
    key={i}
    style={{
      border: "1px solid #edf2f7",
      borderRadius: "12px",
      padding: "12px",
      marginBottom: "12px",
      background: "#ffffff",
    }}
  >
    <CRow className="align-items-end">

      {/* 🔍 Dropdown */}
      <CCol md={4}>
        <CFormLabel>Therapy Name</CFormLabel>
       <Select
  options={therapiesOptions.map(opt => ({
    ...opt,
    isDisabled: form.therapies.some(
      (t, index) => t.name === opt.label && index !== i
    ),
  }))}
  value={therapiesOptions.find(opt => opt.label === t.name)}
  onChange={(selected) =>
    handleTherapyChange(i, "name", selected?.label || "")
  }
  placeholder="Search Therapy..."
/>
      </CCol>

      {/* Inputs */}
      <CCol md={2}>
        <CFormLabel>Sessions</CFormLabel>
        <CFormInput
          type="number"
          value={t.sessions}
          onChange={(e) =>
            handleTherapyChange(i, "sessions", e.target.value)
          }
        />
      </CCol>

      <CCol md={2}>
        <CFormLabel>Duration</CFormLabel>
        <CFormInput
          value={t.sessionDuration}
          onChange={(e) =>
            handleTherapyChange(i, "sessionDuration", e.target.value)
          }
        />
      </CCol>

      <CCol md={2}>
        <CFormLabel>Validity</CFormLabel>
        <CFormInput
          type="number"
          value={t.validity}
          onChange={(e) =>
            handleTherapyChange(i, "validity", e.target.value)
          }
        />
      </CCol>

      {/* ➕ / ❌ Buttons */}
<CCol md={2} className="d-flex justify-content-end">

  {/* 👉 Show ADD only on last row */}
  {i === form.therapies.length - 1 ? (
    <CButton
      onClick={addTherapy}
      style={{
        backgroundColor: "#0d6efd",
        color: "#fff",
        borderRadius: "8px",
        padding: "6px 10px",
      }}
    >
      <CIcon icon={cilPlus} />
    </CButton>
  ) : (
    <CButton
      onClick={() => removeTherapy(i)}
      style={{
        backgroundColor: "#dc3545",
        color: "#fff",
        borderRadius: "8px",
        padding: "6px 10px",
      }}
    >
      <CIcon icon={cilTrash} />
    </CButton>
  )}

</CCol>

    </CRow>
  </div>
))}

  

      {/* ================= SUBMIT ================= */}
    <div className="text-end d-flex justify-content-end gap-2">
  
  {/* Cancel Button */}
     <CButton color="secondary"  onClick={onCancel}>
              Cancel
            </CButton>

  {/* Save / Update Button */}
  <CButton
    onClick={handleSubmit}
    style={{
      backgroundColor: 'var(--color-bgcolor)',
      color: 'var(--color-black)',
    }}
  >
    {data ? 'Update' : 'Save'}
  </CButton>

</div>
    </>
  )
}

export default TreatmentPackageForm