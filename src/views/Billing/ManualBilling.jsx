import React, { useMemo, useState } from 'react'
import { COLORS } from '../../Constant/Themes'

// ---- Design tokens ----
const INK = '#1a1a2e'
const TEAL = COLORS.primary
const TEAL_DEEP = COLORS.sideColor || '#1a3a6b'
const AMBER = '#f57f17'
const MIST = '#f4f7fe'
const CORAL = COLORS.danger
const SAGE = COLORS.success
const SLATE = '#64748b'

const DOCTORS = ['Dr. Ayesha Khan', 'Dr. Rohan Mehta', 'Dr. Priya Nair', 'Dr. Sameer Verma']
const BRANCHES = ['Banjara Hills', 'Kondapur', 'Madhapur', 'Gachibowli']
const VISIT_TYPES = ['New Patient', 'Follow-up', 'Walk-in', 'Referral']
const GENDERS = ['Female', 'Male', 'Other']
const PAYMENT_MODES = ['Cash', 'Card', 'UPI', 'Net Banking', 'Insurance', 'Cheque']
const STATUSES = ['Draft', 'Paid', 'Partially Paid', 'Pending', 'Cancelled', 'Refunded']

const makeBillNo = () => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
const todayStr = () => new Date().toISOString().slice(0, 10)
const currency = (n) =>
    `₹${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const seedRows = [
    { id: 1, name: 'Consultation Fee', qty: 1, price: 500, disc: 0, tax: 0 },
    { id: 2, name: 'Chemical Peel', qty: 1, price: 2200, disc: 10, tax: 18 },
    { id: 3, name: 'Blood Test - CBC', qty: 2, price: 350, disc: 0, tax: 5 },
]

export default function ManualBillingPreview() {
    const [billNo] = useState(makeBillNo)
    const [status, setStatus] = useState('Draft')
    const [billDate, setBillDate] = useState(todayStr())
    const [invoiceDate, setInvoiceDate] = useState(todayStr())

    const [patientSearch, setPatientSearch] = useState('')
    const [patientName, setPatientName] = useState('Ananya Reddy')
    const [mobile, setMobile] = useState('9876543210')
    const [age, setAge] = useState('29')
    const [gender, setGender] = useState('Female')
    const [doctor, setDoctor] = useState(DOCTORS[0])
    const [branch, setBranch] = useState(BRANCHES[0])
    const [visitType, setVisitType] = useState(VISIT_TYPES[0])

    const [rows, setRows] = useState(seedRows)
    const nextId = React.useRef(seedRows.length + 1)

    const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0])
    const [transactionId, setTransactionId] = useState('')
    const [remarks, setRemarks] = useState('')
    const [paidAmount, setPaidAmount] = useState(0)

    const [billingStaff, setBillingStaff] = useState('Front Desk - Kavya')
    const [notes, setNotes] = useState('')
    const [internalComments, setInternalComments] = useState('')

    const [toast, setToast] = useState(null) // { msg, error }

    const showToast = (msg, error) => {
        setToast({ msg, error })
        setTimeout(() => setToast(null), 2200)
    }

    const addRow = () => setRows((r) => [...r, { id: nextId.current++, name: '', qty: 1, price: 0, disc: 0, tax: 0 }])
    const removeRow = (id) => setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r))
    const updateRow = (id, field, value) =>
        setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)))

    const computed = useMemo(
        () =>
            rows.map((r) => {
                const qty = Number(r.qty) || 0
                const price = Number(r.price) || 0
                const disc = Number(r.disc) || 0
                const tax = Number(r.tax) || 0
                const subtotal = qty * price
                const discAmt = subtotal * (disc / 100)
                const taxable = subtotal - discAmt
                const taxAmt = taxable * (tax / 100)
                const total = taxable + taxAmt
                return { ...r, subtotal, discAmt, taxAmt, total }
            }),
        [rows],
    )

    const subTotal = computed.reduce((s, r) => s + r.subtotal, 0)
    const totalDiscount = computed.reduce((s, r) => s + r.discAmt, 0)
    const totalTax = computed.reduce((s, r) => s + r.taxAmt, 0)
    const grandTotal = computed.reduce((s, r) => s + r.total, 0)
    const balance = grandTotal - (Number(paidAmount) || 0)

    const inputStyle = {
        width: '100%',
        fontSize: 13.5,

        padding: '9px 12px',
        border: '1px solid rgba(14,42,50,0.16)',
        borderRadius: 8,
        background: '#fff',
        color: INK,
        outline: 'none',
    }
    const labelStyle = {

        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: INK,
        opacity: 0.55,
        marginBottom: 6,
        display: 'block',
    }
    const cardStyle = {
        background: '#fff',
        border: '1px solid rgba(14,42,50,0.08)',
        borderRadius: 14,
        boxShadow: '0 10px 28px rgba(14,42,50,0.07)',
        marginBottom: 20,
        overflow: 'hidden',
    }
    const cardHeaderStyle = {
        borderBottom: '1px solid rgba(14,42,50,0.08)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
    const cardTitleStyle = {

        fontWeight: 700,
        fontSize: 14.5,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
    }
    const dot = (color) => ({ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 })
    const btnBase = {
        border: 'none',
        borderRadius: 9,
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        whiteSpace: 'nowrap',

    }

    const Field = ({ label, children, span = 4 }) => (
        <div style={{ gridColumn: `span ${span}` }}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    )

    return (
        <div style={{ background: MIST, minHeight: '100vh', color: INK, paddingBottom: 100 }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@600&display=swap');
        * { box-sizing: border-box; }
        .mbp-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
        @media (max-width: 700px) { .mbp-grid > div { grid-column: span 12 !important; } }
        .mbp-table-scroll { overflow-x: auto; }
        .mbp-table { width: 100%; border-collapse: collapse; min-width: 680px; }
        .mbp-table th {
         font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;
          color: ${INK}; opacity: 0.55; background: ${MIST}; text-align: left; padding: 10px 8px;
          border-bottom: 1px solid rgba(14,42,50,0.1); white-space: nowrap;
        }
        .mbp-table td { padding: 8px; vertical-align: middle; border-bottom: 1px solid rgba(14,42,50,0.06); }
        .mbp-input:focus, .mbp-select:focus, .mbp-textarea:focus {
          border-color: ${TEAL} !important; box-shadow: 0 0 0 3px rgba(20,107,94,0.14);
        }
        .mbp-actions-inner { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
        .mbp-btn:hover { transform: translateY(-1px); }
        @media (max-width: 700px) {
          .mbp-actions-inner { justify-content: stretch; }
          .mbp-actions-inner button { flex: 1 1 calc(50% - 8px); justify-content: center; }
        }
      `}</style>

            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${TEAL_DEEP} 0%, ${INK} 100%)`, padding: '22px 20px 26px' }}>
                <div
                    style={{
                        maxWidth: 1180,
                        margin: '0 auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 700, color: '#F3F7F6', fontSize: 22 }}>
                            Manual Billing
                        </div>
                        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'rgba(243,247,246,0.65)' }}>
                            CLINIC ADMIN · NEW BILL
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12.5, color: AMBER, fontWeight: 600 }}>
                            {billNo}
                        </span>
                        <select
                            className="mbp-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{
                                fontSize: 12.5,
                                padding: '6px 10px',
                                borderRadius: 7,
                                border: '1px solid rgba(243,247,246,0.25)',
                                background: 'rgba(243,247,246,0.08)',
                                color: '#F3F7F6',
                            }}
                        >
                            {STATUSES.map((s) => (
                                <option key={s} style={{ color: INK }}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px 0' }}>
                {/* Patient Information */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <span style={cardTitleStyle}>
                            <span style={dot(TEAL)} /> Patient Information
                        </span>
                    </div>
                    <div style={{ padding: 20 }} className="mbp-grid">
                        <Field label="Patient Search" span={4}>
                            <input
                                className="mbp-input"
                                style={inputStyle}
                                placeholder="Search by name or mobile"
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                            />
                        </Field>
                        <Field label="Patient Name" span={4}>
                            <input className="mbp-input" style={inputStyle} value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                        </Field>
                        <Field label="Mobile Number" span={4}>
                            <input className="mbp-input" style={inputStyle} value={mobile} onChange={(e) => setMobile(e.target.value)} />
                        </Field>
                        <Field label="Age" span={6}>
                            <input className="mbp-input" style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)} />
                        </Field>
                        <Field label="Gender" span={6}>
                            <select className="mbp-select" style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
                                {GENDERS.map((g) => (
                                    <option key={g}>{g}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Appointment Details */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <span style={cardTitleStyle}>
                            <span style={dot(TEAL_DEEP)} /> Appointment Details
                        </span>
                    </div>
                    <div style={{ padding: 20 }} className="mbp-grid">
                        <Field label="Doctor" span={4}>
                            <select className="mbp-select" style={inputStyle} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                                {DOCTORS.map((d) => (
                                    <option key={d}>{d}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Branch" span={4}>
                            <select className="mbp-select" style={inputStyle} value={branch} onChange={(e) => setBranch(e.target.value)}>
                                {BRANCHES.map((b) => (
                                    <option key={b}>{b}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Visit Type" span={4}>
                            <select className="mbp-select" style={inputStyle} value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                                {VISIT_TYPES.map((v) => (
                                    <option key={v}>{v}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Bill Information */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <span style={cardTitleStyle}>
                            <span style={dot(AMBER)} /> Bill Information
                        </span>
                    </div>
                    <div style={{ padding: 20 }} className="mbp-grid">
                        <Field label="Bill No." span={4}>
                            <input className="mbp-input" style={{ ...inputStyle, background: MIST, opacity: 0.8 }} value={billNo} disabled />
                        </Field>
                        <Field label="Bill Date" span={4}>
                            <input type="date" className="mbp-input" style={inputStyle} value={billDate} onChange={(e) => setBillDate(e.target.value)} />
                        </Field>
                        <Field label="Invoice Date" span={4}>
                            <input type="date" className="mbp-input" style={inputStyle} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                        </Field>
                    </div>
                </div>

                {/* Service Details */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <span style={cardTitleStyle}>
                            <span style={dot(SLATE)} /> Service Details
                        </span>
                        <span style={{ fontSize: 12, opacity: 0.5 }}>{rows.length} item(s)</span>
                    </div>
                    <div style={{ padding: 20 }}>
                        <div className="mbp-table-scroll">
                            <table className="mbp-table">
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: 200 }}>Service Name</th>
                                        <th style={{ width: 80 }}>Qty</th>
                                        <th style={{ width: 110 }}>Unit Price</th>
                                        <th style={{ width: 100 }}>Discount %</th>
                                        <th style={{ width: 80 }}>Tax %</th>
                                        <th style={{ width: 120 }}>Total</th>
                                        <th style={{ width: 44 }} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {computed.map((row) => (
                                        <tr key={row.id}>
                                            <td>
                                                <input
                                                    className="mbp-input"
                                                    style={inputStyle}
                                                    value={row.name}
                                                    onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="mbp-input"
                                                    style={inputStyle}
                                                    value={row.qty}
                                                    onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="mbp-input"
                                                    style={inputStyle}
                                                    value={row.price}
                                                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    className="mbp-input"
                                                    style={inputStyle}
                                                    value={row.disc}
                                                    onChange={(e) => updateRow(row.id, 'disc', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    className="mbp-input"
                                                    style={inputStyle}
                                                    value={row.tax}
                                                    onChange={(e) => updateRow(row.id, 'tax', e.target.value)}
                                                />
                                            </td>
                                            <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {currency(row.total)}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => removeRow(row.id)}
                                                    disabled={rows.length === 1}
                                                    style={{
                                                        border: '1px solid rgba(193,71,58,0.3)',
                                                        background: 'rgba(193,71,58,0.06)',
                                                        color: CORAL,
                                                        borderRadius: 7,
                                                        width: 30,
                                                        height: 30,
                                                        cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                                                        opacity: rows.length === 1 ? 0.35 : 1,
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={addRow}
                            style={{
                                border: '1.5px dashed rgba(20,107,94,0.4)',
                                background: 'rgba(20,107,94,0.04)',
                                color: TEAL_DEEP,
                                fontWeight: 600,
                                fontSize: 13,
                                borderRadius: 9,
                                padding: '9px 16px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                cursor: 'pointer',
                                marginTop: 14,
                            }}
                        >
                            + Add Row
                        </button>
                    </div>
                </div>

                <div className="mbp-grid">
                    {/* Payment Summary */}
                    <div style={{ gridColumn: 'span 5' }}>
                        <div
                            style={{
                                background: `linear-gradient(160deg, ${INK} 0%, ${TEAL_DEEP} 130%)`,
                                borderRadius: 14,
                                padding: '22px 22px 18px',
                                color: '#F3F7F6',
                                height: '100%',
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                                Payment Summary
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', color: 'rgba(243,247,246,0.78)' }}>
                                <span>Sub Total</span>
                                <span style={{ fontWeight: 600 }}>{currency(subTotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', color: 'rgba(243,247,246,0.78)' }}>
                                <span>Discount</span>
                                <span style={{ fontWeight: 600 }}>− {currency(totalDiscount)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', color: 'rgba(243,247,246,0.78)' }}>
                                <span>Tax</span>
                                <span style={{ fontWeight: 600 }}>+ {currency(totalTax)}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid rgba(243,247,246,0.18)',
                                    marginTop: 6,
                                    paddingTop: 14,

                                    fontSize: 19,
                                    fontWeight: 700,
                                    color: '#fff',
                                }}
                            >
                                <span>Grand Total</span>
                                <span  >{currency(grandTotal)}</span>
                            </div>

                            <div
                                style={{
                                    marginTop: 14,
                                    borderRadius: 10,
                                    padding: '10px 14px',
                                    background: 'rgba(243,247,246,0.08)',
                                    border: '1px solid rgba(243,247,246,0.14)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 11, opacity: 0.7 }}>Paid Amount</div>
                                    <input
                                        type="number"
                                        min={0}
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        style={{
                                            width: 110,
                                            fontSize: 13,

                                            padding: '6px 8px',
                                            borderRadius: 6,
                                            border: '1px solid rgba(243,247,246,0.25)',
                                            background: 'rgba(255,255,255,0.06)',
                                            color: '#fff',
                                        }}
                                    />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, opacity: 0.7 }}>{balance > 0 ? 'Balance Due' : 'Change / Overpaid'}</div>
                                    <div
                                        style={{

                                            fontWeight: 700,
                                            fontSize: 16,
                                            color: balance > 0 ? AMBER : '#8FE3C0',
                                        }}
                                    >
                                        {currency(Math.abs(balance))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div style={{ gridColumn: 'span 7' }}>
                        <div style={{ ...cardStyle, height: '100%', marginBottom: 0 }}>
                            <div style={cardHeaderStyle}>
                                <span style={cardTitleStyle}>
                                    <span style={dot(SAGE)} /> Payment Details
                                </span>
                            </div>
                            <div style={{ padding: 20 }} className="mbp-grid">
                                <Field label="Payment Mode" span={6}>
                                    <select className="mbp-select" style={inputStyle} value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                        {PAYMENT_MODES.map((m) => (
                                            <option key={m}>{m}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Transaction ID" span={6}>
                                    <input
                                        className="mbp-input"
                                        style={inputStyle}
                                        placeholder="Optional"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                </Field>
                                <Field label="Remarks" span={12}>
                                    <textarea
                                        className="mbp-textarea"
                                        rows={2}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        placeholder="Any note for this payment"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div style={{ ...cardStyle, marginTop: 20 }}>
                    <div style={cardHeaderStyle}>
                        <span style={cardTitleStyle}>
                            <span style={dot('#7A5AB8')} /> Additional Details
                        </span>
                    </div>
                    <div style={{ padding: 20 }} className="mbp-grid">
                        <Field label="Billing Staff" span={4}>
                            <input className="mbp-input" style={inputStyle} value={billingStaff} onChange={(e) => setBillingStaff(e.target.value)} />
                        </Field>
                        <Field label="Notes" span={4}>
                            <input className="mbp-input" style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </Field>
                        <Field label="Internal Comments" span={4}>
                            <input className="mbp-input" style={inputStyle} value={internalComments} onChange={(e) => setInternalComments(e.target.value)} />
                        </Field>
                    </div>
                </div>
            </div>

            {/* Sticky actions */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    borderTop: '1px solid rgba(14,42,50,0.1)',
                    boxShadow: '0 -8px 24px rgba(14,42,50,0.08)',
                    padding: '12px 16px',
                    zIndex: 10,
                }}
            >
                <div className="mbp-actions-inner" style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <button className="mbp-btn" onClick={() => showToast('Billing cancelled', true)} style={{ ...btnBase, background: 'rgba(193,71,58,0.08)', color: CORAL, border: '1px solid rgba(193,71,58,0.28)' }}>
                        ✕ Cancel
                    </button>
                    <button className="mbp-btn" onClick={() => showToast('Bill saved as draft')} style={{ ...btnBase, background: MIST, color: INK, border: '1px solid rgba(14,42,50,0.14)' }}>
                        💾 Save Draft
                    </button>
                    <button className="mbp-btn" onClick={() => window.print()} style={{ ...btnBase, background: '#fff', color: TEAL_DEEP, border: '1px solid rgba(20,107,94,0.35)' }}>
                        🖨 Print Invoice
                    </button>
                    <button className="mbp-btn" onClick={() => showToast('Preparing PDF download…')} style={{ ...btnBase, background: '#fff', color: TEAL_DEEP, border: '1px solid rgba(20,107,94,0.35)' }}>
                        ⬇ Download PDF
                    </button>
                    <button className="mbp-btn" onClick={() => showToast('Invoice sent via WhatsApp')} style={{ ...btnBase, background: '#fff', color: TEAL_DEEP, border: '1px solid rgba(20,107,94,0.35)' }}>
                        📱 WhatsApp
                    </button>
                    <button className="mbp-btn" onClick={() => showToast('Invoice sent via email')} style={{ ...btnBase, background: '#fff', color: TEAL_DEEP, border: '1px solid rgba(20,107,94,0.35)' }}>
                        ✉ Email
                    </button>
                    <button className="mbp-btn" onClick={() => showToast('Invoice generated')} style={{ ...btnBase, background: AMBER, color: INK }}>
                        ✓ Generate Invoice
                    </button>
                </div>
            </div>

            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        background: toast.error ? CORAL : INK,
                        color: '#fff',
                        padding: '10px 16px',
                        borderRadius: 9,
                        fontSize: 13,
                        fontWeight: 500,
                        boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
                        zIndex: 50,
                    }}
                >
                    {toast.msg}
                </div>
            )}
        </div>
    )
}
