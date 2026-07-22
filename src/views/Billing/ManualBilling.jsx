import React, { useMemo, useState, useEffect } from 'react'
import { COLORS } from '../../Constant/Themes'
import { useHospital } from '../Usecontext/HospitalContext'
import { AppointmentData } from '../AppointmentManagement/appointmentAPI'
import PrintLetterHead from '../../Utils/PrintLetterHead'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ToWords } from 'to-words'
import Select from 'react-select'
import { http } from '../../Utils/Interceptors'
import ConfirmationModal from '../../components/ConfirmationModal'
import LoadingIndicator from '../../Utils/loader'
import { CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react'
import { Edit, Printer, Download, Trash } from 'lucide-react'
import Pagination from '../../Utils/Pagination'

// ---- Design tokens ----
const INK = '#1a1a2e'
const TEAL = COLORS.primary || '#1B4F8A'
const TEAL_DEEP = COLORS.sideColor || '#1a3a6b'
const AMBER = '#f57f17'
const MIST = '#f4f7fe'
const CORAL = COLORS.danger || '#ff4d4f'
const SAGE = COLORS.success || '#28a745'
const SLATE = '#64748b'

const DOCTORS = ['Dr. Ayesha Khan', 'Dr. Rohan Mehta', 'Dr. Priya Nair', 'Dr. Sameer Verma']
const BRANCHES = ['Banjara Hills', 'Kondapur', 'Madhapur', 'Gachibowli']
const VISIT_TYPES = ['New Patient', 'Follow-up', 'Walk-in', 'Referral']
const PAYMENT_MODES = ['Cash', 'Card', 'UPI', 'Net Banking', 'Insurance', 'Cheque']
const STATUSES = ['Draft', 'Paid', 'Partially Paid', 'Pending', 'Cancelled', 'Refunded']

// Field wrapper — defined OUTSIDE the component to prevent remount on every render
const labelStyle = {
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#1a1a2e',
    opacity: 0.7,
    marginBottom: 8,
    display: 'block',
}
const Field = ({ label, children, span = 4 }) => (
    <div style={{ gridColumn: `span ${span}` }}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
)

const makeBillingId = () => {
    const chars = '0123456789ABCDEF'
    let result = 'BILL-'
    for (let i = 0; i < 12; i++) {
        result += chars[Math.floor(Math.random() * 16)]
    }
    return result
}
const todayStr = () => new Date().toISOString().slice(0, 10)
const currency = (n) =>
    `₹${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ManualBilling() {
    const { selectedHospital, doctorData, branches } = useHospital() || {}

    // Resolve Dynamic Data with context fallbacks
    const doctorList = useMemo(() => {
        if (doctorData?.data && Array.isArray(doctorData.data)) {
            return doctorData.data.map(d => d.doctorName || d.name).filter(Boolean)
        }
        if (Array.isArray(doctorData)) {
            return doctorData.map(d => d.doctorName || d.name).filter(Boolean)
        }
        return DOCTORS
    }, [doctorData])

    const branchList = useMemo(() => {
        if (branches && Array.isArray(branches)) {
            return branches.map(b => b.branchName || b.name).filter(Boolean)
        }
        return BRANCHES
    }, [branches])

    // Tabs / View State
    const [viewMode, setViewMode] = useState('create') // 'create' | 'list'
    const [isEditMode, setIsEditMode] = useState(false)
    const [editBillingId, setEditBillingId] = useState(null)

    // Form fields
    const [billNo, setBillNo] = useState(makeBillingId)
    const [status, setStatus] = useState('Draft')
    const [billDate, setBillDate] = useState(todayStr())
    const [invoiceDate, setInvoiceDate] = useState(todayStr())

    const [patientName, setPatientName] = useState('')
    const [mobile, setMobile] = useState('')

    // Core billing fields
    const [doctor, setDoctor] = useState(doctorList[0] || '')
    const [branch, setBranch] = useState(branchList[0] || '')
    const [visitType, setVisitType] = useState('')

    // Multiple Services State
    const [services, setServices] = useState([
        { id: Date.now(), serviceName: '', unitPrice: '', discountPercent: '', taxPercent: '' }
    ])

    // Payment Info
    const [paymentMode, setPaymentMode] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [remarks, setRemarks] = useState('')
    const [paidAmount, setPaidAmount] = useState('')

    // Additional info — staffName if staffId present, otherwise role
    const [billingStaff, setBillingStaff] = useState(() => {
        const staffId = sessionStorage.getItem('staffId')
        const staffName = sessionStorage.getItem('staffName')
        const role = sessionStorage.getItem('role')
        if (staffId && staffName) return staffName
        return role || 'Staff'
    })
    const [notes, setNotes] = useState('')
    const [internalComments, setInternalComments] = useState('')

    // Async data states
    const [appointments, setAppointments] = useState([])
    const [selectedAppointmentOption, setSelectedAppointmentOption] = useState(null)
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
    const [billingsList, setBillingsList] = useState([])
    const [isLoadingBillings, setIsLoadingBillings] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const paginatedBillings = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return billingsList.slice(start, end);
    }, [billingsList, currentPage, rowsPerPage]);

    const [toast, setToast] = useState(null) // { msg, error }
    const [isDownloading, setIsDownloading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [billingToDelete, setBillingToDelete] = useState(null)

    // Sync default Doctor & Branch
    useEffect(() => {
        if (doctorList.length > 0 && !doctorList.includes(doctor)) {
            setDoctor(doctorList[0])
        }
    }, [doctorList, doctor])

    useEffect(() => {
        if (branchList.length > 0 && !branchList.includes(branch)) {
            setBranch(branchList[0])
        }
    }, [branchList, branch])

    // Fetch Appointments for autofill dropdown
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setIsLoadingAppointments(true)
                const currentBranchId = sessionStorage.getItem('branchId') || '000101'
                const res = await AppointmentData(currentBranchId)
                const data = res?.data || []

                // Filter for "in-progress" and "completed"
                const filtered = data.filter(b =>
                    ['in-progress', 'completed',].includes((b.status || '').toLowerCase())
                )
                setAppointments(filtered)
            } catch (err) {
                console.error('Error fetching appointments:', err)
            } finally {
                setIsLoadingAppointments(false)
            }
        }
        fetchAppointments()
    }, [branch])

    // Fetch Billings List
    const fetchBillings = async () => {
        try {
            setIsLoadingBillings(true)
            const cId = sessionStorage.getItem('HospitalId') || '0001'
            const bId = sessionStorage.getItem('branchId') || '000101'
            const res = await http.get(`/getAllBillingsByUsingClinicIdAndBranchId/${cId}/${bId}`)
            const list = res?.data?.data || res?.data || []
            setBillingsList(Array.isArray(list) ? list : [])
        } catch (err) {
            console.error('Error fetching all billings:', err)
        } finally {
            setIsLoadingBillings(false)
        }
    }

    useEffect(() => {
        fetchBillings()
    }, [])

    const toWords = new ToWords({
        localeCode: 'en-IN',
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
        },
    })

    const amountInWords = (amountValue) => {
        try {
            return toWords.convert(Number(amountValue || 0))
        } catch {
            return ''
        }
    }

    const showToast = (msg, error) => {
        setToast({ msg, error })
        setTimeout(() => setToast(null), 2500)
    }

    // Calculations
    const { subTotal, totalDiscount, totalTax, grandTotal } = useMemo(() => {
        let st = 0;
        let td = 0;
        let tt = 0;
        services.forEach(s => {
            const price = Number(s.unitPrice) || 0;
            const disc = price * ((Number(s.discountPercent) || 0) / 100);
            const taxable = price - disc;
            const taxAmt = taxable * ((Number(s.taxPercent) || 0) / 100);
            st += price;
            td += disc;
            tt += taxAmt;
        });
        const gt = st - td + tt;
        return { subTotal: st, totalDiscount: td, totalTax: tt, grandTotal: gt };
    }, [services]);

    const balance = grandTotal - (Number(paidAmount) || 0)

    const resetForm = () => {
        setBillNo(makeBillingId())
        setIsEditMode(false)
        setEditBillingId(null)
        setStatus('Draft')
        setBillDate(todayStr())
        setInvoiceDate(todayStr())
        setSelectedAppointmentOption(null)
        setPatientName('')
        setMobile('')
        setServices([{ id: Date.now(), serviceName: '', unitPrice: '', discountPercent: '', taxPercent: '' }])
        setDoctor(doctorList[0] || '')
        setBranch(branchList[0] || '')
        setVisitType('')
        setPaymentMode('')
        setTransactionId('')
        setRemarks('')
        setPaidAmount('')
        setNotes('')
        setInternalComments('')
    }

    // Appointment Selection Handler
    const appointmentOptions = useMemo(() => {
        return appointments.map(b => ({
            label: `${b.name || b.patientName || 'Patient'} (#${b.bookingId}) - ${b.status}`,
            value: b
        }))
    }, [appointments])

    const handleAppointmentSelect = (option) => {
        setSelectedAppointmentOption(option)
        if (!option) return
        const b = option.value
        setPatientName(b.name || b.patientName || '')
        setMobile(b.mobileNumber || b.patientMobileNumber || b.mobile || '')
        if (b.doctorName || b.doctor) setDoctor(b.doctorName || b.doctor)
        if (b.branchName || b.branch) setBranch(b.branchName || b.branch)
        if (b.visitType) setVisitType(b.visitType)
        if (b.serviceName || b.treatmentName || b.amount || b.price || b.totalAmount) {
            const val = Number(b.amount || b.price || b.totalAmount) || 0
            setServices([{
                id: Date.now(),
                serviceName: b.serviceName || b.treatmentName || '',
                unitPrice: val,
                discountPercent: '',
                taxPercent: ''
            }])
            setPaidAmount(val)
        }
        showToast('Form pre-filled from appointment!')
    }

    // CRUD - Create & Update
    const handleSaveBilling = async () => {
        if (!patientName.trim()) {
            showToast('Patient Name is required', true)
            return
        }
        if (!mobile.trim()) {
            showToast('Mobile Number is required', true)
            return
        }
        setIsSaving(true)
        try {
            const cId = sessionStorage.getItem('HospitalId') || '0001'
            const bId = sessionStorage.getItem('branchId') || '000101'

            // Payload matches the API entity structure exactly
            const payload = {
                billingId: isEditMode ? editBillingId : billNo,
                clinicId: cId,
                branchId: bId,
                patient: {
                    patientName,
                    mobileNumber: mobile,
                },
                doctorId: doctor,
                visitType,
                billDate,
                invoiceDate,
                services: services.map(s => ({
                    serviceName: s.serviceName,
                    qty: 1,
                    unitPrice: Number(s.unitPrice) || 0,
                    discountPercent: Number(s.discountPercent) || 0,
                    taxPercent: Number(s.taxPercent) || 0,
                })),
                payment: {
                    paymentMode,
                    transactionId,
                    paidAmount: Number(paidAmount) || 0,
                    dueAmount: Math.max(0, balance),
                    remarks,
                },
                additionalDetails: {
                    billingStaff,
                    notes,
                    internalComments,
                },
                invoiceStatus: status,
            }

            if (isEditMode) {
                await http.put(`/updateBillingByUsingBillingId/${editBillingId}`, payload)
                showToast('Billing updated successfully!')
            } else {
                await http.post(`/createBilling`, payload)
                showToast('Billing created successfully!')
            }

            // After save: trigger print first, then reset state after a delay
            handlePrint('printable-receipt')
            setTimeout(() => {
                resetForm()
                fetchBillings()
            }, 1500)
        } catch (err) {
            console.error('Error saving billing:', err)
            showToast('Failed to save billing', true)
        } finally {
            setIsSaving(false)
        }
    }

    // CRUD - Edit Action — reads from nested API response structure
    const handleEditBilling = async (bId) => {
        try {
            showToast('Loading billing details...')
            const res = await http.get(`/getBillingById/${bId}`)
            const data = res?.data?.data || res?.data
            if (data) {
                setEditBillingId(data.billingId)
                setBillNo(data.billingId)
                setIsEditMode(true)
                setPatientName(data.patient?.patientName || '')
                setMobile(data.patient?.mobileNumber || '')
                if (data.services && data.services.length > 0) {
                    setServices(data.services.map((s, idx) => ({
                        id: Date.now() + idx,
                        serviceName: s.serviceName || '',
                        unitPrice: s.unitPrice || '',
                        discountPercent: s.discountPercent || '',
                        taxPercent: s.taxPercent || ''
                    })))
                } else {
                    setServices([{ id: Date.now(), serviceName: '', unitPrice: '', discountPercent: '', taxPercent: '' }])
                }
                setDoctor(data.doctorId || '')
                setVisitType(data.visitType || '')
                setStatus(data.invoiceStatus || 'Draft')
                setBillDate(data.billDate || todayStr())
                setInvoiceDate(data.invoiceDate || todayStr())
                setPaymentMode(data.payment?.paymentMode || '')
                setTransactionId(data.payment?.transactionId || '')
                setRemarks(data.payment?.remarks || '')
                setPaidAmount(data.payment?.paidAmount || 0)
                setBillingStaff(data.additionalDetails?.billingStaff || '')
                setNotes(data.additionalDetails?.notes || '')
                setInternalComments(data.additionalDetails?.internalComments || '')

                setViewMode('create')
            } else {
                showToast('Failed to retrieve billing details', true)
            }
        } catch (err) {
            console.error('Error fetching billing details:', err)
            showToast('Failed to fetch billing details', true)
        }
    }

    // CRUD - Delete Action
    const handleDeleteBilling = (bId) => {
        setBillingToDelete(bId)
        setShowDeleteConfirm(true)
    }

    const confirmDeleteBilling = async () => {
        try {
            await http.delete(`/deleteBillingByUsingBillingId/${billingToDelete}`)
            showToast('Billing deleted successfully!')
            fetchBillings()
        } catch (err) {
            console.error('Error deleting billing:', err)
            showToast('Failed to delete billing', true)
        } finally {
            setShowDeleteConfirm(false)
            setBillingToDelete(null)
        }
    }

    const handlePrint = (elementId) => {
        const printContent = document.getElementById(elementId)
        if (printContent) {
            const iframe = document.createElement('iframe')
            iframe.style.position = 'absolute'
            iframe.style.width = '0px'
            iframe.style.height = '0px'
            iframe.style.border = 'none'

            document.body.appendChild(iframe)
            const doc = iframe.contentWindow.document

            doc.open()
            doc.write('<html><head><title>Print Invoice</title>')

            const styles = document.querySelectorAll("style, link[rel='stylesheet']")
            styles.forEach((s) => {
                doc.write(s.outerHTML)
            })

            doc.write('</head><body>')
            doc.write(printContent.innerHTML)
            doc.write('</body></html>')
            doc.close()

            iframe.contentWindow.focus()

            setTimeout(() => {
                try {
                    iframe.contentWindow.focus()
                    iframe.contentWindow.print()
                } catch (e) {
                    console.error('Print error:', e)
                }
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe)
                    }
                }, 2000)
            }, 600)
        }
    }

    const handleDownloadPDF = async () => {
        if (isDownloading) return
        setIsDownloading(true)
        showToast('Preparing PDF download…')

        try {
            const printContent = document.getElementById('printable-receipt')
            if (!printContent) {
                showToast('Print element not found', true)
                setIsDownloading(false)
                return
            }

            const originalDisplay = printContent.style.display

            printContent.style.display = 'block'
            printContent.style.position = 'absolute'
            printContent.style.left = '-9999px'
            printContent.style.top = '0'

            await new Promise(resolve => setTimeout(resolve, 400))

            const canvas = await html2canvas(printContent, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
            })

            printContent.style.display = originalDisplay
            printContent.style.position = ''
            printContent.style.left = ''
            printContent.style.top = ''

            const imgData = canvas.toDataURL('image/jpeg', 0.98)
            const pdf = new jsPDF('p', 'mm', 'a4')

            const pdfWidth = 210
            const pdfHeight = 297
            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
            heightLeft -= pdfHeight

            while (heightLeft > 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
            }

            const fileName = `Invoice_${billNo}_${patientName.replace(/\s+/g, '_')}`
            pdf.save(`${fileName}.pdf`)
            showToast('PDF downloaded successfully!')
        } catch (error) {
            console.error('PDF Generation Error:', error)
            showToast('Failed to download PDF', true)
        } finally {
            setIsDownloading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        fontSize: 14.5,
        padding: '10px 14px',
        border: '1px solid rgba(14,42,50,0.16)',
        borderRadius: 8,
        background: '#fff',
        color: INK,
        outline: 'none',
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
        background: '#FAFBFD',
    }

    const cardTitleStyle = {
        fontWeight: 700,
        fontSize: 14.5,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        color: TEAL_DEEP,
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
        transition: 'all 0.2s',
    }

    // Field is defined at module level (outside component) to avoid remount on re-render

    return (
        <div style={{ background: 'transparent', minHeight: '100vh', color: INK, paddingBottom: 100 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
                .mbp-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
                @media (max-width: 700px) { .mbp-grid > div { grid-column: span 12 !important; } }
                .mbp-table-scroll { overflow-x: auto; }
                .mbp-table { width: 100%; border-collapse: collapse; min-width: 680px; }
                .mbp-table th {
                    font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;
                    color: ${INK}; opacity: 0.55; background: ${MIST}; text-align: left; padding: 12px 10px;
                    border-bottom: 1px solid rgba(14,42,50,0.1); white-space: nowrap;
                }
                .mbp-table td { padding: 10px; vertical-align: middle; border-bottom: 1px solid rgba(14,42,50,0.06); }
                .mbp-input:focus, .mbp-select:focus, .mbp-textarea:focus {
                    border-color: ${TEAL} !important; box-shadow: 0 0 0 3px ${TEAL}24;
                }
                .mbp-actions-inner { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
                .mbp-btn:hover { transform: translateY(-1px); }
                @media (max-width: 700px) {
                    .mbp-actions-inner { justify-content: stretch; }
                    .mbp-actions-inner button { flex: 1 1 calc(50% - 8px); justify-content: center; }
                }
                .mbp-tab-btn {
                    border: none;
                    background: transparent;
                    padding: 8px 16px;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    color: ${SLATE};
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .mbp-tab-btn.active {
                    color: ${TEAL};
                    border-bottom-color: ${TEAL};
                }
            `}</style>

            {/* Header */}
            <div style={{ color: COLORS.primary, padding: '22px 20px' }}>
                <div
                    style={{
                        maxWidth: 1180,
                        margin: '0 auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 15,
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 800, color: '#F3F7F6', fontSize: 24, letterSpacing: '-0.3px', color: COLORS.primary, }}>
                            Manual Billing Portal
                        </div>
                        <div style={{ fontSize: 11, letterSpacing: 0.8, color: 'rgba(115, 119, 118, 0.88)' }}>
                            CLINIC ADMIN · BRANDED CLINIC RECEIPT SYSTEM
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: 4, borderRadius: 8, display: 'flex' }}>
                        <button
                            className={`mbp-tab-btn ${viewMode === 'create' ? 'active' : ''}`}
                            onClick={() => { setViewMode('create'); if (!isEditMode) resetForm(); }}
                            style={{ color: viewMode === 'create' ? COLORS.primary : 'rgba(56, 54, 54, 0.7)', borderBottomColor: viewMode === 'create' ? COLORS.primary : 'transparent' }}
                        >
                            {isEditMode ? '✍ Edit Invoice' : '➕ Create Invoice'}
                        </button>
                        <button
                            className={`mbp-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            style={{ color: viewMode === 'list' ? COLORS.primary : 'rgba(56, 54, 54, 0.7)', borderBottomColor: viewMode === 'list' ? COLORS.primary : 'transparent' }}
                        >
                            📋 Billing History
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 0' }}>
                {viewMode === 'create' ? (
                    <>
                        {/* Autofill / Appointment Selector */}
                        <div style={cardStyle}>
                            <div style={{ ...cardHeaderStyle, background: '#F0F4FA' }}>
                                <span style={cardTitleStyle}>
                                    <span style={dot(TEAL)} /> Autofill From Appointment
                                </span>
                                <span style={{ fontSize: 11.5, color: SLATE, fontWeight: 500 }}>
                                    Select in-progress or completed appointment to pre-fill patient details
                                </span>
                            </div>
                            <div style={{ padding: '16px 20px' }}>
                                <Select
                                    options={appointmentOptions}
                                    value={selectedAppointmentOption}
                                    onChange={handleAppointmentSelect}
                                    placeholder="Search patient name, booking ID, or status..."
                                    isClearable
                                    isLoading={isLoadingAppointments}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        control: (base) => ({
                                            ...base,
                                            border: '1px solid rgba(14,42,50,0.16)',
                                            borderRadius: 8,
                                            padding: '2px 4px',
                                            boxShadow: 'none',
                                            '&:hover': { borderColor: TEAL }
                                        }),
                                        option: (base, { isFocused, isSelected }) => ({
                                            ...base,
                                            fontSize: 13,
                                            background: isSelected ? TEAL : isFocused ? `${TEAL}15` : '#fff',
                                            color: isSelected ? '#fff' : INK,
                                            cursor: 'pointer'
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {/* Patient Information */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <span style={cardTitleStyle}>
                                    <span style={dot(TEAL)} /> Patient Information
                                </span>
                            </div>
                            <div style={{ padding: 20 }} className="mbp-grid">
                                <Field label="Patient Name" span={6}>
                                    <input className="mbp-input" style={inputStyle} placeholder="Enter patient full name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                                </Field>
                                <Field label="Mobile Number" span={6}>
                                    <input className="mbp-input" style={inputStyle} placeholder="10-digit mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <span style={cardTitleStyle}>
                                    <span style={dot(TEAL_DEEP)} /> Appointment & Treatment Details
                                </span>
                            </div>
                            <div style={{ padding: 20 }} className="mbp-grid">
                                <Field label="Doctor Name" span={3}>
                                    <select className="mbp-select" style={inputStyle} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                                        <option value="">-- Select Doctor --</option>
                                        {doctorList.map((d) => (
                                            <option key={d}>{d}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Branch" span={3}>
                                    <select className="mbp-select" style={inputStyle} value={branch} onChange={(e) => setBranch(e.target.value)}>
                                        <option value="">-- Select Branch --</option>
                                        {branchList.map((b) => (
                                            <option key={b}>{b}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Visit Type" span={3}>
                                    <select className="mbp-select" style={inputStyle} value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                                        <option value="">-- Select Type --</option>
                                        {VISIT_TYPES.map((v) => (
                                            <option key={v}>{v}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Bill Date" span={3}>
                                    <input type="date" className="mbp-input" style={inputStyle} value={billDate} onChange={(e) => setBillDate(e.target.value)} />
                                </Field>
                                <Field label="Invoice Status" span={4}>
                                    <select className="mbp-select" style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="">-- Select Status --</option>
                                        {STATUSES.map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Service & Pricing Details - Multiple Rows */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <span style={cardTitleStyle}>
                                    <span style={dot(SLATE)} /> Service & Pricing Details
                                </span>
                                <button
                                    className="mbp-btn"
                                    style={{ ...btnBase, background: `${TEAL}22`, color: TEAL_DEEP, padding: '5px 12px', fontSize: 13 }}
                                    onClick={() => setServices([...services, { id: Date.now(), serviceName: '', unitPrice: '', discountPercent: '', taxPercent: '' }])}
                                >
                                    + Add Row
                                </button>
                            </div>
                            <div style={{ padding: 20 }}>
                                <CTable striped responsive>
                                    <CTableHead className="pink-table">
                                        <CTableRow>
                                            <CTableHeaderCell>Service Description</CTableHeaderCell>
                                            <CTableHeaderCell>Amount (₹)</CTableHeaderCell>
                                            <CTableHeaderCell>Discount (%)</CTableHeaderCell>
                                            <CTableHeaderCell>Tax (%)</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {services.map((s, idx) => (
                                            <CTableRow key={s.id} className="align-middle">
                                                <CTableDataCell>
                                                    <input
                                                        className="mbp-input"
                                                        style={inputStyle}
                                                        placeholder="e.g. Spine Rehab"
                                                        value={s.serviceName}
                                                        onChange={(e) => {
                                                            const newS = [...services];
                                                            newS[idx].serviceName = e.target.value;
                                                            setServices(newS);
                                                        }}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="mbp-input"
                                                        style={inputStyle}
                                                        value={s.unitPrice}
                                                        onChange={(e) => {
                                                            const newS = [...services];
                                                            newS[idx].unitPrice = e.target.value;
                                                            setServices(newS);
                                                        }}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <input
                                                        type="number"
                                                        min={0} max={100}
                                                        className="mbp-input"
                                                        style={inputStyle}
                                                        value={s.discountPercent}
                                                        onChange={(e) => {
                                                            const newS = [...services];
                                                            newS[idx].discountPercent = e.target.value;
                                                            setServices(newS);
                                                        }}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <input
                                                        type="number"
                                                        min={0} max={100}
                                                        className="mbp-input"
                                                        style={inputStyle}
                                                        value={s.taxPercent}
                                                        onChange={(e) => {
                                                            const newS = [...services];
                                                            newS[idx].taxPercent = e.target.value;
                                                            setServices(newS);
                                                        }}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <button
                                                        onClick={() => {
                                                            if (services.length > 1) {
                                                                setServices(services.filter((_, i) => i !== idx));
                                                            }
                                                        }}
                                                        style={{ border: 'none', background: 'rgba(193,71,58,0.1)', color: CORAL, padding: '8px', borderRadius: 6, cursor: services.length > 1 ? 'pointer' : 'not-allowed', opacity: services.length > 1 ? 1 : 0.5 }}
                                                        disabled={services.length <= 1}
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </div>

                        <div className="mbp-grid">
                            {/* Payment Summary */}
                            <div style={{ gridColumn: 'span 5' }}>
                                <div
                                    style={{
                                        // background: `linear-gradient(160deg, ${INK} 0%, ${TEAL_DEEP} 130%)`,
                                        borderRadius: 14,
                                        padding: '22px 22px 18px',
                                        color: '#F3F7F6',
                                        height: '100%',
                                        boxShadow: '0 8px 24px rgba(26,26,46,0.15)',
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, borderBottom: '1px solid rgba(243,247,246,0.12)', paddingBottom: 6 }}>
                                        Payment Summary
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', color: 'rgba(243,247,246,0.78)' }}>
                                        <span>Base Price</span>
                                        <span style={{ fontWeight: 600 }}>{currency(subTotal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', color: 'rgba(243,247,246,0.78)' }}>
                                        <span>Discount Amount</span>
                                        <span style={{ fontWeight: 600 }}>− {currency(totalDiscount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', color: 'rgba(243,247,246,0.78)' }}>
                                        <span>Tax Amount</span>
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
                                        <span>{currency(grandTotal)}</span>
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
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    opacity: 0.7,
                                                    color: '#383636',
                                                }}
                                            >
                                                Paid Amount
                                            </div>

                                            <input
                                                type="number"
                                                min={0}
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                                                style={{
                                                    width: 110,
                                                    fontSize: 13,
                                                    padding: '6px 8px',
                                                    borderRadius: 6,
                                                    border: '1px solid #ced4da',
                                                    background: '#fff',
                                                    color: '#212529',
                                                    outline: 'none',
                                                }}
                                            />
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, opacity: 0.7 }}>{balance > 0 ? 'Balance Due' : 'Change Due'}</div>
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
                                                placeholder="Transaction reference number"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                            />
                                        </Field>
                                        <Field label="Remarks" span={12}>
                                            <textarea
                                                className="mbp-textarea"
                                                rows={3}
                                                style={{ ...inputStyle, resize: 'vertical' }}
                                                placeholder="Enter payment logs or remarks"
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
                                <Field label="Billing Staff (Dynamic)" span={4}>
                                    <input className="mbp-input" style={{ ...inputStyle, background: '#f8fafc' }} value={billingStaff} disabled />
                                </Field>
                                <Field label="Public Notes (Prints on Bill)" span={4}>
                                    <input className="mbp-input" style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} />
                                </Field>
                                <Field label="Internal Comments" span={4}>
                                    <input className="mbp-input" style={inputStyle} value={internalComments} onChange={(e) => setInternalComments(e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Create Sticky actions */}
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
                                {isEditMode && (
                                    <button
                                        className="mbp-btn"
                                        onClick={() => {
                                            resetForm();
                                            setViewMode('list');
                                        }}
                                        style={{ ...btnBase, background: '#f8fafc', color: SLATE, border: '1px solid #e2e8f0' }}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <button className="mbp-btn" onClick={resetForm} style={{ ...btnBase, background: 'rgba(193,71,58,0.08)', color: CORAL, border: '1px solid rgba(193,71,58,0.28)' }}>
                                    ✕ Reset Form
                                </button>
                                <button className="mbp-btn" disabled={isSaving} onClick={handleSaveBilling} style={{ ...btnBase, background: TEAL, color: '#fff' }}>
                                    💾 {isSaving ? 'Saving & Printing...' : isEditMode ? 'Update & Print' : 'Save & Print'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Billings History List View */
                    <div style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <span style={cardTitleStyle}>
                                <span style={dot(TEAL)} /> Invoice History
                            </span>
                            <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>{billingsList.length} bill(s) found</span>
                        </div>
                        <div style={{ padding: 20 }}>
                            {isLoadingBillings ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <LoadingIndicator message="Loading Invoice Logs..." />
                                </div>
                            ) : billingsList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: SLATE }}>
                                    No invoices created yet. Go to "Create Invoice" to start.
                                </div>
                            ) : (
                                <div className="mbp-table-scroll">
                                    <CTable striped hover responsive>
                                        <CTableHead className="pink-table w-auto">
                                            <CTableRow>
                                                <CTableHeaderCell>Bill No.</CTableHeaderCell>
                                                <CTableHeaderCell>Patient Name</CTableHeaderCell>
                                                <CTableHeaderCell>Mobile</CTableHeaderCell>
                                                <CTableHeaderCell>Date</CTableHeaderCell>
                                                <CTableHeaderCell>Treatment</CTableHeaderCell>
                                                <CTableHeaderCell>Grand Total</CTableHeaderCell>
                                                <CTableHeaderCell>Paid</CTableHeaderCell>
                                                <CTableHeaderCell>Balance</CTableHeaderCell>
                                                <CTableHeaderCell>Status</CTableHeaderCell>
                                                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {paginatedBillings.map((b) => {
                                                const svc = b.services?.[0] || {}
                                                const st = b.invoiceStatus || b.status || 'Draft'
                                                const stColor = st === 'Paid' ? { bg: '#eefdf4', color: '#16a34a', border: '#bbf7d0' }
                                                    : st === 'Pending' || st === 'Partially Paid' ? { bg: '#fffaf0', color: '#d97706', border: '#fef3c7' }
                                                        : { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }

                                                const fillAndPrint = () => {
                                                    setBillNo(b.billingId)
                                                    setPatientName(b.patient?.patientName || '')
                                                    setMobile(b.patient?.mobileNumber || '')
                                                    if (b.services && b.services.length > 0) {
                                                        setServices(b.services.map((s, i) => ({
                                                            id: Date.now() + i,
                                                            serviceName: s.serviceName || '',
                                                            unitPrice: s.unitPrice || '',
                                                            discountPercent: s.discountPercent || '',
                                                            taxPercent: s.taxPercent || ''
                                                        })))
                                                    } else {
                                                        setServices([{ id: Date.now(), serviceName: '', unitPrice: '', discountPercent: '', taxPercent: '' }])
                                                    }
                                                    setDoctor(b.doctorId || '')
                                                    setVisitType(b.visitType || '')
                                                    setStatus(st)
                                                    setBillDate(b.billDate || todayStr())
                                                    setInvoiceDate(b.invoiceDate || todayStr())
                                                    setPaymentMode(b.payment?.paymentMode || '')
                                                    setTransactionId(b.payment?.transactionId || '')
                                                    setRemarks(b.payment?.remarks || '')
                                                    setPaidAmount(b.payment?.paidAmount || 0)
                                                    setBillingStaff(b.additionalDetails?.billingStaff || '')
                                                    setNotes(b.additionalDetails?.notes || '')
                                                    setInternalComments(b.additionalDetails?.internalComments || '')
                                                }

                                                return (
                                                    <CTableRow key={b.billingId} className="pink-table">
                                                        <CTableDataCell style={{ fontWeight: 700, color: TEAL, whiteSpace: 'nowrap' }}>{b.billingId}</CTableDataCell>
                                                        <CTableDataCell style={{ fontWeight: 600 }}>{b.patient?.patientName || '-'}</CTableDataCell>
                                                        <CTableDataCell>{b.patient?.mobileNumber || '-'}</CTableDataCell>
                                                        <CTableDataCell style={{ whiteSpace: 'nowrap' }}>{b.billDate}</CTableDataCell>
                                                        <CTableDataCell>{svc.serviceName || '-'}</CTableDataCell>
                                                        <CTableDataCell style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{currency(b.payment?.paidAmount + b.payment?.dueAmount)}</CTableDataCell>
                                                        <CTableDataCell style={{ color: SAGE, fontWeight: 600, whiteSpace: 'nowrap' }}>{currency(b.payment?.paidAmount)}</CTableDataCell>
                                                        <CTableDataCell style={{ color: Number(b.payment?.dueAmount) > 0 ? CORAL : INK, fontWeight: 600, whiteSpace: 'nowrap' }}>{currency(b.payment?.dueAmount)}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: 700,
                                                                padding: '3px 9px',
                                                                borderRadius: '12px',
                                                                background: stColor.bg,
                                                                color: stColor.color,
                                                                border: `1px solid ${stColor.border}`,
                                                                whiteSpace: 'nowrap',
                                                                display: 'inline-block',
                                                            }}>
                                                                {st}
                                                            </span>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-center">
                                                            <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'nowrap' }}>
                                                                <button
                                                                    onClick={() => handleEditBilling(b.billingId)}
                                                                    title="Edit"
                                                                    style={{ border: 'none', background: `${TEAL}18`, color: TEAL_DEEP, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <Edit size={14} style={{ marginRight: 4 }} /> Edit
                                                                </button>
                                                                <button
                                                                    title="Print"
                                                                    onClick={() => { fillAndPrint(); setTimeout(() => handlePrint('printable-receipt'), 300) }}
                                                                    style={{ border: 'none', background: '#f1f5f9', color: SLATE, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <Printer size={14} style={{ marginRight: 4 }} /> Print
                                                                </button>
                                                                <button
                                                                    title="Download PDF"
                                                                    onClick={() => { fillAndPrint(); setTimeout(() => handleDownloadPDF(), 300) }}
                                                                    style={{ border: 'none', background: '#f0fdf4', color: SAGE, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <Download size={14} style={{ marginRight: 4 }} /> PDF
                                                                </button>
                                                                <button
                                                                    title="Delete"
                                                                    onClick={() => handleDeleteBilling(b.billingId)}
                                                                    style={{ border: 'none', background: 'rgba(193,71,58,0.07)', color: CORAL, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <Trash size={14} style={{ marginRight: 4 }} /> Del
                                                                </button>
                                                            </div>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                )
                                            })}
                                        </CTableBody>
                                    </CTable>

                                    {billingsList.length > 0 && (
                                        <div style={{ marginTop: 20 }}>
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={Math.ceil(billingsList.length / rowsPerPage)}
                                                pageSize={rowsPerPage}
                                                onPageChange={setCurrentPage}
                                                onPageSizeChange={setRowsPerPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {
                toast && (
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
                            zIndex: 1000,
                        }}
                    >
                        {toast.msg}
                    </div>
                )
            }

            {/* ── Hidden Printable Receipt ── */}
            <div id="printable-receipt" style={{ display: 'none' }}>
                <style>{`
                    @media print {
                        @page { margin: 15mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    .printable-container {
                        padding: 30px 40px;
                        color: #1a1a2e;
                        font-family: 'Inter', sans-serif;
                        font-size: 12.5px;
                        line-height: 1.45;
                    }
                    .invoice-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2.5px solid ${TEAL};
                    }
                    .invoice-title {
                        margin: 0;
                        font-size: 19px;
                        font-weight: 700;
                        color: ${TEAL};
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0;
                        margin-bottom: 20px;
                        border: 1px solid rgba(14,42,50,0.1);
                        border-radius: 8px;
                        background: #f7fafd;
                        overflow: hidden;
                    }
                    .info-block {
                        padding: 12px 16px;
                    }
                    .info-block-left {
                        border-right: 1px solid rgba(14,42,50,0.1);
                    }
                    .info-block-title {
                        margin: 0 0 2px;
                        font-size: 9.5px;
                        font-weight: 700;
                        color: ${TEAL};
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                    }
                    .info-block-value {
                        margin: 0 0 8px;
                        font-size: 13.5px;
                        font-weight: 700;
                        color: ${INK};
                    }
                    .info-row {
                        display: flex;
                        margin-bottom: 2px;
                    }
                    .info-label {
                        color: #64748b;
                        width: 90px;
                        font-size: 11px;
                    }
                    .info-val {
                        font-weight: 600;
                        color: ${INK};
                        font-size: 11px;
                    }
                    .invoice-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 18px;
                    }
                    .invoice-table th {
                        background: ${TEAL};
                        color: #fff;
                        font-weight: 600;
                        font-size: 10.5px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        padding: 7px 9px;
                        text-align: left;
                    }
                    .invoice-table td {
                        padding: 8px 9px;
                        border-bottom: 1px solid rgba(14,42,50,0.06);
                        font-size: 11.5px;
                        color: ${INK};
                    }
                    .invoice-totals {
                        width: 250px;
                        margin-left: auto;
                        border: 1px solid rgba(14,42,50,0.1);
                        border-radius: 8px;
                        overflow: hidden;
                        margin-bottom: 20px;
                    }
                    .totals-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 7px 12px;
                        font-size: 11.5px;
                        border-bottom: 1px solid rgba(14,42,50,0.05);
                    }
                    .totals-row-grand {
                        display: flex;
                        justify-content: space-between;
                        padding: 9px 12px;
                        font-size: 13px;
                        font-weight: 700;
                        background: ${TEAL}10;
                        border-top: 2px solid ${TEAL};
                        color: ${TEAL};
                    }
                `}</style>
                <PrintLetterHead printDate={new Date(billDate)}>
                    <div className="printable-container">
                        <div className="invoice-header">
                            <h2 className="invoice-title">INVOICE RECEIPT</h2>
                            <span style={{ fontWeight: 600, color: '#64748b', fontSize: '12px' }}>Invoice No: {billNo}</span>
                        </div>

                        <div className="info-grid">
                            <div className="info-block info-block-left">
                                <p className="info-block-title">Patient Details</p>
                                <p className="info-block-value">{patientName}</p>
                                <div className="info-row">
                                    <span className="info-label">Mobile</span>
                                    <span className="info-val">: {mobile}</span>
                                </div>
                            </div>
                            <div className="info-block">
                                <p className="info-block-title">Billing & Treatment</p>
                                <p className="info-block-value">{services.map(s => s.serviceName).filter(Boolean).join(', ') || '-'}</p>
                                <div className="info-row">
                                    <span className="info-label">Doctor</span>
                                    <span className="info-val">: {doctor}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Branch</span>
                                    <span className="info-val">: {branch}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Date</span>
                                    <span className="info-val">: {new Date(billDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>S.No</th>
                                    <th>Service/Item Description</th>
                                    <th style={{ width: '120px', textAlign: 'right' }}>Price</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Disc %</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Tax %</th>
                                    <th style={{ width: '120px', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((s, idx) => {
                                    const price = Number(s.unitPrice) || 0;
                                    const disc = price * ((Number(s.discountPercent) || 0) / 100);
                                    const taxAmt = (price - disc) * ((Number(s.taxPercent) || 0) / 100);
                                    const total = price - disc + taxAmt;
                                    return (
                                        <tr key={s.id || idx}>
                                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{s.serviceName || '-'}</td>
                                            <td style={{ textAlign: 'right' }}>{currency(price)}</td>
                                            <td style={{ textAlign: 'center' }}>{s.discountPercent || 0}%</td>
                                            <td style={{ textAlign: 'center' }}>{s.taxPercent || 0}%</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{currency(total)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '10px' }}>
                            <div style={{ maxWidth: '340px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Amount in Words</div>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '11px', fontStyle: 'italic', lineHeight: 1.3 }}>
                                    {amountInWords(grandTotal)}
                                </div>

                                {remarks && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Remarks</div>
                                        <div style={{ color: '#475569', fontSize: '11px' }}>{remarks}</div>
                                    </div>
                                )}

                                <div style={{ marginTop: '12px', display: 'flex', gap: '20px' }}>
                                    <div>
                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Payment Mode</span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{paymentMode}</span>
                                    </div>
                                    {transactionId && (
                                        <div>
                                            <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Transaction ID</span>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{transactionId}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Status</span>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: status === 'Paid' ? '#16a34a' : status === 'Pending' ? '#d97706' : '#2563eb'
                                        }}>{status}</span>
                                    </div>
                                </div>
                                {notes && (
                                    <div style={{ marginTop: '12px' }}>
                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Notes</span>
                                        <span style={{ fontSize: '11.5px', color: '#475569' }}>{notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="invoice-totals">
                                <div className="totals-row">
                                    <span style={{ color: '#64748b' }}>Sub Total</span>
                                    <span style={{ fontWeight: 600 }}>{currency(subTotal)}</span>
                                </div>
                                <div className="totals-row">
                                    <span style={{ color: '#64748b' }}>Discount</span>
                                    <span style={{ fontWeight: 600, color: '#b91c1c' }}>- {currency(totalDiscount)}</span>
                                </div>
                                <div className="totals-row">
                                    <span style={{ color: '#64748b' }}>Tax</span>
                                    <span style={{ fontWeight: 600, color: '#15803d' }}>+ {currency(totalTax)}</span>
                                </div>
                                <div className="totals-row-grand">
                                    <span>Grand Total</span>
                                    <span>{currency(grandTotal)}</span>
                                </div>
                                <div className="totals-row" style={{ background: '#f8fafc' }}>
                                    <span style={{ color: '#64748b' }}>Paid Amount</span>
                                    <span style={{ fontWeight: 600 }}>{currency(paidAmount)}</span>
                                </div>
                                <div className="totals-row" style={{
                                    borderTop: '1px solid rgba(14,42,50,0.1)',
                                    background: balance > 0 ? '#fef2f2' : '#f0fdf4'
                                }}>
                                    <span style={{ fontWeight: 700, color: balance > 0 ? '#b91c1c' : '#15803d' }}>
                                        {balance > 0 ? 'Balance Due' : 'Overpaid / Change'}
                                    </span>
                                    <span style={{ fontWeight: 700, color: balance > 0 ? '#b91c1c' : '#15803d' }}>
                                        {currency(Math.abs(balance))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                Prepared By: {billingStaff || 'Front Desk'}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontStyle: 'italic' }}>
                                This is a computer-generated invoice.
                            </div>
                        </div>
                    </div>
                </PrintLetterHead>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isVisible={showDeleteConfirm}
                title="Confirm Delete"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
                confirmText="Yes, Delete"
                confirmColor="danger"
                onConfirm={confirmDeleteBilling}
                onCancel={() => {
                    setShowDeleteConfirm(false)
                    setBillingToDelete(null)
                }}
            />
        </div >
    )
}
