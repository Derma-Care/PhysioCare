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

const TreatmentPackageForm = ({ data, onSave }) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    discount: '',
    gst: '',
    otherTaxes: '',
    paymentType: 'FULL_PAYMENT',
    offerStartDate: '',
    offerEndDate: '',
    description: '',
    therapies: [
      { name: '', sessions: '', sessionDuration: '', validity: '' }
    ]
  })

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
    setForm({
      ...form,
      therapies: [
        ...form.therapies,
        { name: '', sessions: '', sessionDuration: '', validity: '' }
      ]
    })
  }

  const handleSubmit = () => {
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
      therapies: form.therapies.map((t) => ({
        name: t.name,
        sessions: Number(t.sessions),
        sessionDuration: t.sessionDuration,
        validity: Number(t.validity),
      }))
    }

    onSave(payload)
  }

  return (
    <>
      {/* ================= BASIC INFO ================= */}
      <h5 className="mb-3">Basic Information</h5>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Package Name *</CFormLabel>
          <CFormInput name="name" value={form.name} onChange={handleChange} />
        </CCol>
      </CRow>

      <CFormLabel>Description</CFormLabel>
      <CFormTextarea
        name="description"
        value={form.description}
        onChange={handleChange}
        className="mb-3"
      />

      {/* ================= PRICING ================= */}
      <h5 className="mb-3">Pricing</h5>

      <CRow className="mb-3">
        <CCol md={3}>
          <CFormLabel>Price *</CFormLabel>
          <CFormInput type="number" name="price" value={form.price} onChange={handleChange} />
        </CCol>

        <CCol md={3}>
          <CFormLabel>Discount (%)</CFormLabel>
          <CFormInput type="number" name="discount" value={form.discount} onChange={handleChange} />
        </CCol>

        <CCol md={3}>
          <CFormLabel>GST (%)</CFormLabel>
          <CFormInput type="number" name="gst" value={form.gst} onChange={handleChange} />
        </CCol>

        <CCol md={3}>
          <CFormLabel>Other Taxes (%)</CFormLabel>
          <CFormInput type="number" name="otherTaxes" value={form.otherTaxes} onChange={handleChange} />
        </CCol>
      </CRow>

      {/* ================= PAYMENT ================= */}
      <h5 className="mb-3">Payment</h5>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Payment Type *</CFormLabel>
          <CFormSelect name="paymentType" value={form.paymentType} onChange={handleChange}>
            <option value="FULL_PAYMENT">Full Payment</option>
            <option value="PARTIAL_PAYMENT">Partial Payment</option>
          </CFormSelect>
        </CCol>
      </CRow>

      {/* ================= OFFER ================= */}
      <h5 className="mb-3">Offer Period</h5>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Offer Start Date</CFormLabel>
          <CFormInput type="date" name="offerStartDate" value={form.offerStartDate} onChange={handleChange} />
        </CCol>

        <CCol md={6}>
          <CFormLabel>Offer End Date</CFormLabel>
          <CFormInput type="date" name="offerEndDate" value={form.offerEndDate} onChange={handleChange} />
        </CCol>
      </CRow>

      {/* ================= THERAPIES ================= */}
      <h5 className="mb-3">Therapies</h5>

      {form.therapies.map((t, i) => (
        <CRow key={i} className="mb-2">
          <CCol md={3}>
            <CFormLabel>Therapy Name</CFormLabel>
            <CFormInput value={t.name}
              onChange={(e) => handleTherapyChange(i, 'name', e.target.value)} />
          </CCol>

          <CCol md={3}>
            <CFormLabel>Sessions</CFormLabel>
            <CFormInput type="number" value={t.sessions}
              onChange={(e) => handleTherapyChange(i, 'sessions', e.target.value)} />
          </CCol>

          <CCol md={3}>
            <CFormLabel>Duration (mins/hrs)</CFormLabel>
            <CFormInput type="text" value={t.sessionDuration}
              onChange={(e) => handleTherapyChange(i, 'sessionDuration', e.target.value)} />
          </CCol>

          <CCol md={3}>
            <CFormLabel>Validity (days)</CFormLabel>
            <CFormInput type="number" value={t.validity}
              onChange={(e) => handleTherapyChange(i, 'validity', e.target.value)} />
          </CCol>
        </CRow>
      ))}

      <CButton className="mb-3" onClick={addTherapy}>
        + Add Therapy
      </CButton>

      {/* ================= SUBMIT ================= */}
      <div className="text-end">
        <CButton onClick={handleSubmit}>
          {data ? 'Update Package' : 'Save Package'}
        </CButton>
      </div>
    </>
  )
}

export default TreatmentPackageForm