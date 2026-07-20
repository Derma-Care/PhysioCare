import React, { useEffect, useMemo, useState } from "react"
import {
    CRow, CCol,
    CForm, CFormInput, CFormSelect, CFormTextarea,
    CButton,
    CTable, CTableHead, CTableRow,
    CTableHeaderCell, CTableBody, CTableDataCell,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from "@coreui/react"
import {
    CreditCard, Plus, Search, X, LayoutGrid, Table2, Receipt, Edit2, Trash2
} from "lucide-react"
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend, LabelList
} from "recharts"
import Pagination from "../../Utils/Pagination"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"
import { getExpenses, createExpense, updateExpense, deleteExpense } from "./ExpenseAPI"
import LoadingIndicator from "../../Utils/loader"
import { useLocation } from "react-router-dom"
import { useHospital } from '../Usecontext/HospitalContext'
const CATEGORY_META = {
    rent: { label: "Rent", color: "#185fa5", bg: "#e6f1fb" },
    salary: { label: "Salary", color: "#15803d", bg: "#dcfce7" },
    electricity: { label: "Electricity", color: "#b45309", bg: "#fef3c7" },
    medicine: { label: "Medicine", color: "#6b21a8", bg: "#f3e8ff" },
    other: { label: "Other", color: "#64748b", bg: "#f1f5f9" },
}

const MODE_LABEL = { cash: "Cash", upi: "UPI", card: "Card" }

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null
    return (
        <div style={{
            background: "#fff", border: "1px solid #d0dce9", borderRadius: 8,
            padding: "8px 12px", boxShadow: "0 6px 18px rgba(0,0,0,.08)", fontSize: 12
        }}>
            <div style={{ fontWeight: 700, color: "#0c447c", marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || p.fill, fontWeight: 600 }}>
                    {p.name}: ₹{p.value}
                </div>
            ))}
        </div>
    )
}

const EMPTY_FORM = { title: "", category: "", amount: "", date: "", mode: "", transactionId: "", notes: "" }

const ExpenseScreen = () => {
    useAutoHideSidebar()
    const location = useLocation();
    const { branchId: stateBranchId, clinicId, branchName: stateBranchName } =
        location.state || {};
    const { globalBranchId, globalBranchName } = useHospital() || {}
    // Prefer the live global context; fall back to navigation state
    const branchId = globalBranchId || stateBranchId
    const branchName = globalBranchName || stateBranchName
    // const clinicId = sessionStorage.getItem('HospitalId')
    // const branchId = sessionStorage.getItem('branchId') || 'all'

    const [form, setForm] = useState(EMPTY_FORM)
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState("month")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [search, setSearch] = useState("")
    const [view, setView] = useState("charts") // 'charts' | 'table'
    const [savedFlash, setSavedFlash] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [formError, setFormError] = useState("")
    const [editId, setEditId] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const fetchExpenses = async () => {
        setLoading(true)
        try {
            const res = await getExpenses(clinicId, branchId)
            if (res.data?.success) {
                setExpenses(res.data.data || [])
            } else if (Array.isArray(res.data)) {
                setExpenses(res.data)
            } else {
                setExpenses([])
            }
        } catch (err) {
            console.error(err)
            setExpenses([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (clinicId) {
            fetchExpenses()
        }
    }, [clinicId, branchId])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (formError) setFormError("")
    }

    const openModal = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setFormError("")
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setFormError("")
        setEditId(null)
    }

    const handleEdit = (item) => {
        setForm({
            title: item.title,
            category: item.category,
            amount: item.amount,
            date: item.date,
            mode: item.mode,
            transactionId: item.transactionId || "",
            notes: item.notes || ""
        })
        setEditId(item._id || item.id)
        setFormError("")
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await deleteExpense(id)
                fetchExpenses()
            } catch (err) {
                console.error(err)
                alert("Failed to delete expense.")
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.title || !form.amount || !form.date) {
            setFormError("Please fill in title, amount and date to continue.")
            return
        }

        const payload = {
            ...form,
            amount: Number(form.amount),
            clinicId,
            branchId
        }

        setSubmitting(true)
        try {
            if (editId) {
                await updateExpense(editId, payload)
            } else {
                await createExpense(payload)
            }

            fetchExpenses()

            setForm(EMPTY_FORM)
            setEditId(null)
            setShowModal(false)

            setSavedFlash(true)
            setTimeout(() => setSavedFlash(false), 2200)
        } catch (err) {
            setFormError("An error occurred while saving the expense.")
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    /* ── filter + search logic ── */
    const filteredData = useMemo(() => {
        const today = new Date()
        let list = expenses.filter((item) => {
            const rowDate = new Date(item.date)
            if (filter === "today") return rowDate.toDateString() === today.toDateString()
            if (filter === "week") {
                const firstDay = new Date(today)
                firstDay.setDate(today.getDate() - today.getDay())
                const lastDay = new Date(firstDay)
                lastDay.setDate(firstDay.getDate() + 6)
                return rowDate >= firstDay && rowDate <= lastDay
            }
            if (filter === "month") return rowDate.getMonth() === today.getMonth() && rowDate.getFullYear() === today.getFullYear()
            if (filter === "year") return rowDate.getFullYear() === today.getFullYear()
            if (filter === "custom" && fromDate && toDate) return rowDate >= new Date(fromDate) && rowDate <= new Date(toDate)
            return true
        })

        const q = search.trim().toLowerCase()
        if (q) {
            list = list.filter(item =>
                item.title.toLowerCase().includes(q) ||
                (CATEGORY_META[item.category]?.label || item.category || "").toLowerCase().includes(q) ||
                (MODE_LABEL[item.mode] || item.mode || "").toLowerCase().includes(q)
            )
        }

        return list.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [expenses, filter, fromDate, toDate, search])

    useEffect(() => {
        setCurrentPage(1)
    }, [filter, fromDate, toDate, search, expenses])

    const totalPages = Math.ceil(filteredData.length / pageSize)
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.amount), 0)

    /* ── period summary cards (computed from ALL expenses, not filtered) ── */
    const periodTotals = useMemo(() => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        let todayTotal = 0, weekTotal = 0, monthTotal = 0, yearTotal = 0, allTotal = 0
        expenses.forEach(item => {
            const d = new Date(item.date)
            const amt = Number(item.amount)
            allTotal += amt
            if (d.getFullYear() === today.getFullYear()) {
                yearTotal += amt
                if (d.getMonth() === today.getMonth()) {
                    monthTotal += amt
                    if (d >= startOfWeek && d <= endOfWeek) {
                        weekTotal += amt
                        if (d.toDateString() === today.toDateString()) todayTotal += amt
                    }
                }
            }
        })
        return { todayTotal, weekTotal, monthTotal, yearTotal, allTotal }
    }, [expenses])

    /* ── chart data ── */
    const byCategory = useMemo(() => {
        const grouped = {}
        filteredData.forEach(item => {
            grouped[item.category] = (grouped[item.category] || 0) + Number(item.amount)
        })
        return Object.entries(grouped).map(([cat, value]) => ({
            name: CATEGORY_META[cat]?.label || cat || "Other",
            value,
            cat,
        }))
    }, [filteredData])

    const trendData = useMemo(() => {
        const grouped = {}
        filteredData.forEach(item => {
            grouped[item.date] = (grouped[item.date] || 0) + Number(item.amount)
        })
        return Object.entries(grouped)
            .map(([date, Amount]) => ({ date, Amount, label: date.slice(5) }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
    }, [filteredData])

    const byMode = useMemo(() => {
        const grouped = {}
        filteredData.forEach(item => {
            const key = MODE_LABEL[item.mode] || item.mode || "Other"
            grouped[key] = (grouped[key] || 0) + Number(item.amount)
        })
        return Object.entries(grouped).map(([name, value]) => ({ name, value }))
    }, [filteredData])

    const MODE_COLORS = { Cash: "#b45309", UPI: "#185fa5", Card: "#15803d", Other: "#94a3b8" }

    return (
        <>
            {/* ── PAGE HEADER with Add Expense trigger ── */}
            <div className="ex-top-header">
                <div className="ex-title-group">
                    <div className="ex-page-icon">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h4 className="ex-page-title">Expenses ({branchName})</h4>
                        <p className="ex-page-sub">Track and review clinic spending</p>
                    </div>
                </div>

                <div className="ex-header-right">
                    {savedFlash && <span className="ex-saved-flash">✓ Expense saved</span>}
                    <CButton className="ex-add-btn" onClick={openModal}>
                        <Plus size={16} style={{ marginRight: 6, marginTop: -2 }} />
                        Add Expense
                    </CButton>
                </div>
            </div>

            {/* ── PERIOD SUMMARY CARDS ── */}
            {loading ? (
                <LoadingIndicator message="Loading expenses..." />
            ) : (
                <div className="ex-period-cards">
                    {[
                        {
                            label: "Today",
                            amount: periodTotals.todayTotal,
                            count: expenses.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length,
                            gradient: "linear-gradient(135deg, #1e6fba 0%, #185fa5 100%)",
                            glow: "rgba(24,95,165,0.22)",
                            icon: (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            ),
                        },
                        {
                            label: "This Week",
                            amount: periodTotals.weekTotal,
                            count: (() => { const t = new Date(), s = new Date(t); s.setDate(t.getDate() - t.getDay()); s.setHours(0, 0, 0, 0); const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23, 59, 59, 999); return expenses.filter(i => { const d = new Date(i.date); return d >= s && d <= e }).length })(),
                            gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            glow: "rgba(21,128,61,0.22)",
                            icon: (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            ),
                        },
                        {
                            label: "This Month",
                            amount: periodTotals.monthTotal,
                            count: (() => { const t = new Date(); return expenses.filter(i => { const d = new Date(i.date); return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear() }).length })(),
                            gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                            glow: "rgba(180,83,9,0.22)",
                            icon: (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            ),
                        },
                        {
                            label: "This Year",
                            amount: periodTotals.yearTotal,
                            count: expenses.filter(i => new Date(i.date).getFullYear() === new Date().getFullYear()).length,
                            gradient: "linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)",
                            glow: "rgba(107,33,168,0.22)",
                            icon: (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
                            ),
                        },
                        {
                            label: "All Time",
                            amount: periodTotals.allTotal,
                            count: expenses.length,
                            gradient: "linear-gradient(135deg, #c0392b 0%, #0c447c 100%)",
                            glow: "rgba(12,68,124,0.22)",
                            icon: (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                            ),
                        },
                    ].map((card) => (
                        <div key={card.label} className="ex-pc" style={{ "--pc-gradient": card.gradient, "--pc-glow": card.glow }}>
                            <div className="ex-pc-glow-blob" />
                            <div className="ex-pc-top">
                                <div className="ex-pc-icon">{card.icon}</div>
                                <div className="ex-pc-count">{card.count} record{card.count !== 1 ? "s" : ""}</div>
                            </div>
                            <div className="ex-pc-amount">₹{card.amount.toLocaleString("en-IN")}</div>
                            <div className="ex-pc-label">{card.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── ADD EXPENSE MODAL ── */}
            <CModal
                visible={showModal}
                onClose={closeModal}
                alignment="center"
                className="ex-modal"
                backdrop="static"
            >
                <CModalHeader className="ex-modal-head" onClose={closeModal}>
                    <div className="ex-modal-head-inner">
                        <div className="ex-form-icon"><Plus size={18} /></div>
                        <div>
                            <CModalTitle className="ex-modal-title">{editId ? "Edit Expense" : "Add Expense"}</CModalTitle>
                            <p className="ex-modal-sub">{editId ? "Update existing clinic expense" : "Log a new clinic expense"}</p>
                        </div>
                    </div>
                </CModalHeader>

                <CForm onSubmit={handleSubmit}>
                    <CModalBody className="ex-modal-body">
                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormInput
                                    label="Expense Title"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Rent / Salary / Electricity"
                                    autoFocus
                                    required
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormSelect label="Category" name="category" value={form.category} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="rent">Rent</option>
                                    <option value="salary">Salary</option>
                                    <option value="electricity">Electricity</option>
                                    <option value="medicine">Medicine</option>
                                    <option value="other">Other</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3">
                            <CCol md={4}>
                                <CFormInput
                                    type="number"
                                    label="Amount (₹)"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </CCol>
                            <CCol md={4}>
                                <CFormInput
                                    type="date"
                                    label="Date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />
                            </CCol>
                            <CCol md={4}>
                                <CFormSelect label="Payment Mode" name="mode" value={form.mode} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        <CRow>
                            <CCol md={12}>
                                {(form.mode === "upi" || form.mode === "card") && (
                                    <div className="mb-3">
                                        <CFormInput
                                            label="Transaction ID (Optional)"
                                            name="transactionId"
                                            value={form.transactionId}
                                            onChange={handleChange}
                                            placeholder="Enter transaction reference number"
                                        />
                                    </div>
                                )}
                                <CFormTextarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Optional details…" />
                            </CCol>
                        </CRow>

                        {formError && <div className="ex-form-error">{formError}</div>}
                    </CModalBody>

                    <CModalFooter className="ex-modal-footer">
                        <CButton className="ex-cancel-btn" onClick={closeModal} type="button" disabled={submitting}>
                            Cancel
                        </CButton>
                        <CButton type="submit" className="ex-save-btn" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="ex-btn-spinner" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Plus size={15} style={{ marginRight: 6, marginTop: -2 }} />
                                    {editId ? "Update Expense" : "Save Expense"}
                                </>
                            )}
                        </CButton>
                    </CModalFooter>
                </CForm>
            </CModal>

            {/* ── LIST ── */}
            <div className="ex-page-header">
                <div className="ex-title-group">
                    <div>
                        <h4 className="ex-page-title" style={{ fontSize: 15 }}>Expense List</h4>
                        <p className="ex-page-sub">
                            {filteredData.length} record{filteredData.length !== 1 ? "s" : ""} · ₹{totalAmount.toLocaleString("en-IN")} total
                        </p>
                    </div>
                </div>

                <div className="ex-filter-group">
                    <div className="ex-search-wrap">
                        <Search size={14} className="ex-search-icon" />
                        <input
                            type="text"
                            className="ex-search-input"
                            placeholder="Search title, category, mode…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="ex-search-clear" onClick={() => setSearch("")} title="Clear search">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {["today", "week", "month", "year", "custom"].map((f) => (
                        <button
                            key={f}
                            className={`ex-filter-pill${filter === f ? " active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}

                    <div className="ex-view-toggle">
                        <button
                            className={`ex-view-btn${view === "charts" ? " active" : ""}`}
                            onClick={() => setView("charts")}
                        >
                            <LayoutGrid size={14} /> Charts
                        </button>
                        <button
                            className={`ex-view-btn${view === "table" ? " active" : ""}`}
                            onClick={() => setView("table")}
                        >
                            <Table2 size={14} /> Table
                        </button>
                    </div>
                </div>
            </div>

            {filter === "custom" && (
                <div className="ex-custom-row">
                    <CFormInput type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="ex-date-input" />
                    <span className="ex-date-sep">to</span>
                    <CFormInput type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="ex-date-input" />
                    {(fromDate || toDate) && (
                        <button
                            className="ex-custom-clear"
                            onClick={() => { setFromDate(""); setToDate("") }}
                            title="Clear dates"
                        >
                            <X size={12} /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* ── Charts view ── */}
            {!loading && view === "charts" && filteredData.length === 0 && (
                <div className="ex-empty-state">
                    <Receipt size={28} color="#94a3b8" />
                    <p>
                        {search
                            ? <>No expenses match "<strong>{search}</strong>".</>
                            : "No expenses found for the selected filters."}
                    </p>
                    <CButton className="ex-add-btn" onClick={openModal} style={{ marginTop: 4 }}>
                        <Plus size={15} style={{ marginRight: 6, marginTop: -2 }} />
                        Add Expense
                    </CButton>
                </div>
            )}

            {!loading && view === "charts" && filteredData.length > 0 && (
                <CRow className="mb-4">
                    <CCol xs={12} lg={7} className="mb-3">
                        <div className="ex-chart-card">
                            <div className="ex-chart-head">
                                <h6>Expense Trend</h6>
                                <span className="ex-chart-sub">Total spend by date</span>
                            </div>
                            <ResponsiveContainer width="100%" height={270}>
                                <BarChart data={trendData} margin={{ top: 6, right: 12, left: -12, bottom: 4 }}>
                                    <CartesianGrid vertical={false} stroke="#eef2f7" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} interval={0} angle={-25} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₹${v}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                                    <Bar dataKey="Amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CCol>

                    <CCol xs={12} lg={5} className="mb-3">
                        <div className="ex-chart-card">
                            <div className="ex-chart-head">
                                <h6>Spend by Category</h6>
                                <span className="ex-chart-sub">Share of total expenses</span>
                            </div>
                            <ResponsiveContainer width="100%" height={270}>
                                <PieChart>
                                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                                        {byCategory.map((entry, i) => (
                                            <Cell key={i} fill={CATEGORY_META[entry.cat]?.color || "#94a3b8"} stroke="#fff" strokeWidth={2} />
                                        ))}
                                        <LabelList dataKey="value" position="inside" fill="#fff" fontSize={10} fontWeight={700} formatter={v => `₹${v}`} />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CCol>

                    <CCol xs={12} className="mb-3">
                        <div className="ex-chart-card">
                            <div className="ex-chart-head">
                                <h6>Spend by Payment Mode</h6>
                                <span className="ex-chart-sub">Cash vs UPI vs Card</span>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={byMode} layout="vertical" margin={{ top: 4, right: 80, left: 8, bottom: 4 }}>
                                    <CartesianGrid horizontal={false} stroke="#eef2f7" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₹${v}`} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} width={60} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                                        {byMode.map((entry, i) => (
                                            <Cell key={i} fill={MODE_COLORS[entry.name] || "#94a3b8"} />
                                        ))}
                                        <LabelList dataKey="value" position="right" formatter={v => `₹${v}`} fontSize={11} fill="#374151" fontWeight={700} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CCol>
                </CRow>
            )}

            {/* ── Table view ── */}
            {!loading && view === "table" && (
                <div className="ex-table-wrapper">
                    <CTable className="ex-table">
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell className="ex-th">#</CTableHeaderCell>
                                <CTableHeaderCell className="ex-th">Title</CTableHeaderCell>
                                <CTableHeaderCell className="ex-th">Category</CTableHeaderCell>
                                <CTableHeaderCell className="ex-th">Date</CTableHeaderCell>
                                <CTableHeaderCell className="ex-th">Amount</CTableHeaderCell>
                                <CTableHeaderCell className="ex-th">Mode</CTableHeaderCell>
                                <CTableHeaderCell className="ex-th text-center">Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            {filteredData.length === 0 ? (
                                <CTableRow>
                                    <CTableDataCell colSpan={7}>
                                        <div className="ex-empty">
                                            <Receipt size={36} className="ex-empty-icon" />
                                            <p>
                                                {search
                                                    ? <>No expenses match "<strong>{search}</strong>".</>
                                                    : "No expenses found."}
                                            </p>
                                        </div>
                                    </CTableDataCell>
                                </CTableRow>
                            ) : (
                                paginatedData.map((item, index) => {
                                    const i = (currentPage - 1) * pageSize + index
                                    const meta = CATEGORY_META[item.category] || CATEGORY_META.other
                                    return (
                                        <CTableRow key={item._id || item.id || i} className="ex-tr">
                                            <CTableDataCell className="ex-td ex-td-num">{i + 1}</CTableDataCell>
                                            <CTableDataCell className="ex-td"><span className="ex-name">{item.title}</span><span className="ex-name">{item.notes}</span></CTableDataCell>
                                            <CTableDataCell className="ex-td">
                                                <span className="ex-badge" style={{ background: meta.bg, color: meta.color }}>
                                                    {meta.label}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell className="ex-td ex-muted">{item.date}</CTableDataCell>
                                            <CTableDataCell className="ex-td">₹{Number(item.amount).toLocaleString("en-IN")}</CTableDataCell>
                                            <CTableDataCell className="ex-td ex-muted">{MODE_LABEL[item.mode] || item.mode || "—"}</CTableDataCell>
                                            <CTableDataCell className="ex-td text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <button className="ex-action-btn edit" onClick={() => handleEdit(item)} title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="ex-action-btn delete" onClick={() => handleDelete(item._id || item.id)} title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    )
                                })
                            )}

                            {/* Total */}
                            <CTableRow className="ex-total-row">
                                <CTableDataCell colSpan={4}>Total</CTableDataCell>
                                <CTableDataCell colSpan={3}>₹{totalAmount.toLocaleString("en-IN")}</CTableDataCell>
                            </CTableRow>
                        </CTableBody>
                    </CTable>
                </div>
            )}

            {view === "table" && filteredData.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            )}

            {/* ── STYLES ── */}
            <style>{`
        /* Top header w/ Add Expense button */
        .ex-top-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 16px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .ex-header-right { display: flex; align-items: center; gap: 14px; }

        /* ─── Period summary cards – premium redesign ─── */
        .ex-period-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        @media (max-width: 1100px) { .ex-period-cards { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 700px)  { .ex-period-cards { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 420px)  { .ex-period-cards { grid-template-columns: 1fr; } }

        .ex-pc {
          background: var(--pc-gradient);
          border-radius: 16px;
          padding: 18px 18px 16px;
          display: flex; flex-direction: column; gap: 6px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px var(--pc-glow), 0 1px 4px rgba(0,0,0,0.08);
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .ex-pc:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px var(--pc-glow), 0 2px 8px rgba(0,0,0,0.1);
        }

        /* glowing decorative blob */
        .ex-pc-glow-blob {
          position: absolute; top: -28px; right: -28px;
          width: 90px; height: 90px;
          background: rgba(255,255,255,0.12);
          border-radius: 50%;
          pointer-events: none;
        }
        .ex-pc-glow-blob::after {
          content: ''; position: absolute; top: 22px; left: 22px;
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.10);
          border-radius: 50%;
        }

        .ex-pc-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .ex-pc-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.25);
        }
        .ex-pc-count {
          font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.15);
          border-radius: 20px; padding: 3px 9px;
          letter-spacing: 0.3px; white-space: nowrap;
        }
        .ex-pc-amount {
          font-size: 22px; font-weight: 800; color: #fff;
          line-height: 1.15; letter-spacing: -0.5px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .ex-pc-label {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.78);
          text-transform: uppercase; letter-spacing: 0.7px;
        }

        /* Spinner for submit button */
        .ex-btn-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff; border-radius: 50%;
          display: inline-block; animation: ex-spin .6s linear infinite;
          margin-right: 7px; flex-shrink: 0;
        }
        @keyframes ex-spin { to { transform: rotate(360deg); } }

        .ex-add-btn {
          background: var(--color-primary) !important; color: #fff !important; border: none !important;
          border-radius: 8px !important; padding: 9px 18px !important; font-size: 13px !important;
          font-weight: 600 !important; display: flex; align-items: center;
           transition: filter .15s, transform .15s;
        }
        .ex-add-btn:hover { filter: brightness(0.93); transform: translateY(-1px); }

        .ex-saved-flash {
          font-size: 12px; font-weight: 700; color: #16a34a;
          animation: ex-fade-in .2s ease;
        }
        @keyframes ex-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        /* Modal - Premium Redesign */
        .ex-modal .modal-content {
          border-radius: 18px !important; border: none !important; overflow: hidden;
          box-shadow: 0 24px 60px rgba(12,68,124,0.18), 0 8px 24px rgba(0,0,0,0.08);
        }
        .ex-modal-head {
          background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
          border-bottom: 1px solid #d0dce9 !important; padding: 20px 24px !important;
        }
        .ex-modal-head-inner { display: flex; align-items: center; gap: 14px; }
        .ex-form-icon {
          width: 46px; height: 46px; border-radius: 12px; background: #fff; color: var(--color-primary);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(12,68,124,0.08); border: 1px solid #eef2f7;
        }
        .ex-modal-title { font-size: 18px; font-weight: 800; color: #0c447c; margin: 0; letter-spacing: -0.3px; }
        .ex-modal-sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; font-weight: 500; }
        .ex-modal-body { padding: 24px !important; background: #fff; }
        
        /* Modal Form Inputs Customization */
        .ex-modal-body .form-control, .ex-modal-body .form-select {
          border-radius: 10px;
          border: 1px solid #d0dce9;
          padding: 10px 14px;
          font-size: 13px;
          color: #1e293b;
          background-color: #f8fafc;
          box-shadow: none;
          transition: all 0.2s ease-in-out;
        }
        .ex-modal-body .form-control:focus, .ex-modal-body .form-select:focus {
          border-color: var(--color-primary);
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(12, 68, 124, 0.1);
        }
        .ex-modal-body .form-control::placeholder { color: #9ca3af; }
        .ex-modal-body .form-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }
        
        .ex-modal-footer {
          background: #f8fafc;
          border-top: 1px solid #eef2f7 !important; padding: 16px 24px !important;
          display: flex; justify-content: flex-end; gap: 12px;
        }

        .ex-form-error {
          background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;
          border-radius: 10px; padding: 10px 14px; font-size: 12.5px; font-weight: 600; margin-top: 8px;
          display: flex; align-items: center; gap: 8px;
        }

        .ex-cancel-btn {
          background: #fff !important; color: #475569 !important; border: 1px solid #cbd5e1 !important;
          border-radius: 10px !important; padding: 9px 18px !important; font-size: 13.5px !important;
          font-weight: 700 !important; transition: all 0.2s !important;
        }
        .ex-cancel-btn:hover { background: #f1f5f9 !important; color: #1e293b !important; border-color: #94a3b8 !important; }

        .ex-save-btn {
          background: linear-gradient(135deg, var(--color-primary) 0%, #0a3560 100%) !important; 
          color: #fff !important; border: none !important; box-shadow: 0 4px 12px rgba(12,68,124,0.2) !important;
          border-radius: 10px !important; padding: 9px 20px !important; font-size: 13.5px !important;
          font-weight: 700 !important; display: flex; align-items: center; transition: all .2s !important;
        }
        .ex-save-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(12,68,124,0.3) !important; }

        /* Page Header (list section) */
        .ex-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .ex-title-group { display: flex; align-items: center; gap: 12px; }
        .ex-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #fcebeb;
          display: flex; align-items: center; justify-content: center; color:var(--color-primary); flex-shrink: 0;
        }
        .ex-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .ex-page-sub { font-size: 12px; color: #6b7280; margin: 0; }

        /* Filter group */
        .ex-filter-group { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .ex-filter-pill {
          background: #fff; color: #374151; border: 0.5px solid #d0dce9; border-radius: 20px;
          padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
        }
        .ex-filter-pill:hover { border-color: var(--color-primary); color:var(--color-primary) }
        .ex-filter-pill.active { background:var(--color-primary); color: #fff; border-color: var(--color-primary); }

        /* Search box */
        .ex-search-wrap { position: relative; display: flex; align-items: center; }
        .ex-search-icon { position: absolute; left: 9px; color: #94a3b8; pointer-events: none; }
        .ex-search-input {
          padding: 6px 28px 6px 30px; border: 0.5px solid #d0dce9; border-radius: 20px;
          font-size: 12px; font-weight: 500; color: #1e293b; background: #fff;
          outline: none; min-width: 210px; transition: border-color .15s;
        }
        .ex-search-input:focus { border-color:var(--color-primary); box-shadow: 0 0 0 2px #a32d2d20; }
        .ex-search-input::placeholder { color: #9ca3af; font-weight: 400; }
        .ex-search-clear {
          position: absolute; right: 6px; border: none; background: #f1f5f9; color: #64748b;
          border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; padding: 0;
        }
        .ex-search-clear:hover { background: #e2e8f0; color: #374151; }

        /* View toggle */
        .ex-view-toggle {
          display: flex; align-items: center; gap: 2px; background: #f1f5f9;
          border-radius: 8px; padding: 3px;
        }
        .ex-view-btn {
          display: flex; align-items: center; gap: 6px; border: none; background: transparent;
          padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
          color: #64748b; cursor: pointer; transition: all .15s;
        }
        .ex-view-btn:hover { color: var(--color-primary); }
        .ex-view-btn.active { background: #fff; color: var(--color-primary); box-shadow: 0 1px 3px rgba(0,0,0,.08); }

        /* Custom date row */
        .ex-custom-row {
          display: flex; gap: 10px; align-items: center; margin-bottom: 16px;
          padding: 14px 16px; background: #f8fafc; border: 0.5px solid #d0dce9; border-radius: 10px;
        }
        .ex-date-input { flex: 1; font-size: 12px !important; border: 0.5px solid #d0dce9 !important; border-radius: 8px !important; }
        .ex-date-input:focus { border-color:var(--color-primary) !important; box-shadow: none !important; }
        .ex-date-sep { font-size: 12px; color: #6b7280; white-space: nowrap; }
        .ex-custom-clear {
          display: inline-flex; align-items: center; gap: 4px;
          border: none; background: #fef2f2; color: #a32d2d;
          border-radius: 20px; padding: 5px 12px; font-size: 11px;
          font-weight: 600; cursor: pointer; flex-shrink: 0;
          transition: background .15s;
        }
        .ex-custom-clear:hover { background: #fee2e2; }

        /* Chart cards */
        .ex-chart-card {
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px;
          padding: 16px 16px 6px; height: 100%; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .ex-chart-head { margin-bottom: 6px; }
        .ex-chart-head h6 { margin: 0; font-size: 14px; font-weight: 700; color: #0c447c; }
        .ex-chart-sub { font-size: 11px; color: #6b7280; }

        .ex-empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; padding: 60px 20px; background: #fff; border: 1px dashed #d0dce9;
          border-radius: 10px; margin-bottom: 24px; color: #6b7280; font-size: 13px; text-align: center;
        }
        .ex-empty-state p { margin: 0; }

        /* Table */
        .ex-table-wrapper { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; overflow-x: auto; margin-bottom: 12px; }
        .ex-table { margin-bottom: 0 !important; font-size: 13px; }
        .ex-th {
          background: var(--color-primary) !important; color: #fff !important; font-size: 12px !important;
          font-weight: 600 !important; padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .ex-tr { transition: background 0.12s; }
        .ex-tr:hover { background: #fdf3f3 !important; }
        .ex-td {
          padding: 11px 14px !important; vertical-align: middle !important; font-size: 13px;
          color: #374151; border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .ex-td-num { color: #9ca3af; font-size: 12px; }
        .ex-muted { color: #6b7280; }
        .ex-name { font-weight: 600; font-size: 13px; color: #0c447c; }
        .ex-badge {
          padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
        }

        .ex-total-row td {
          background: #fdf3f3 !important; font-weight: 600 !important; font-size: 13px;
          color:var(--color-primary) !important; padding: 11px 14px !important;
          border-top: 0.5px solid #f3caca !important; border-bottom: none !important;
        }

        .ex-empty {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .ex-empty-icon { color: #d0dce9; }

        .ex-action-btn {
          background: transparent; border: none; padding: 4px; border-radius: 4px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .ex-action-btn.edit { color: var(--color-primary); }
        .ex-action-btn.edit:hover { background: #e6f1fb; }
        .ex-action-btn.delete { color: #dc2626; }
        .ex-action-btn.delete:hover { background: #fef2f2; }
      `}</style>
        </>
    )
}

export default ExpenseScreen
