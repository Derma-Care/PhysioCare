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

const STORAGE_KEY = "physiocare_expenses_v1"

/* ── helper: build a YYYY-MM-DD date offset from today, so filter
   pills (today/week/month/year) always have something to show ── */
const daysAgo = (n) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
}

const CATEGORY_META = {
    rent: { label: "Rent", color: "#185fa5", bg: "#e6f1fb" },
    salary: { label: "Salary", color: "#15803d", bg: "#dcfce7" },
    electricity: { label: "Electricity", color: "#b45309", bg: "#fef3c7" },
    medicine: { label: "Medicine", color: "#6b21a8", bg: "#f3e8ff" },
    other: { label: "Other", color: "#64748b", bg: "#f1f5f9" },
}

const MODE_LABEL = { cash: "Cash", upi: "UPI", card: "Card" }

/* ── dummy dataset spanning today / this week / this month / this year ── */
const DUMMY_EXPENSES = [
    { title: "Clinic Rent - April", category: "rent", amount: 25000, offset: 0, paymentMode: "upi", notes: "" },
    { title: "Staff Salary - Reception", category: "salary", amount: 18000, offset: 1, paymentMode: "card", notes: "" },
    { title: "Electricity Bill", category: "electricity", amount: 3200, offset: 2, paymentMode: "upi", notes: "" },
    { title: "Physio Consumables", category: "medicine", amount: 4500, offset: 3, paymentMode: "cash", notes: "" },
    { title: "Water Purifier Service", category: "other", amount: 800, offset: 5, paymentMode: "cash", notes: "" },
    { title: "Staff Salary - Therapist", category: "salary", amount: 22000, offset: 6, paymentMode: "card", notes: "" },
    { title: "TENS Machine Gel", category: "medicine", amount: 1200, offset: 9, paymentMode: "upi", notes: "" },
    { title: "Internet & Phone Bill", category: "other", amount: 1800, offset: 12, paymentMode: "upi", notes: "" },
    { title: "Electricity Bill", category: "electricity", amount: 2950, offset: 18, paymentMode: "upi", notes: "" },
    { title: "Housekeeping Supplies", category: "other", amount: 1400, offset: 22, paymentMode: "cash", notes: "" },
    { title: "Staff Salary - Front Desk", category: "salary", amount: 16000, offset: 28, paymentMode: "card", notes: "" },
    { title: "Clinic Rent - March", category: "rent", amount: 25000, offset: 32, paymentMode: "upi", notes: "" },
    { title: "Ultrasound Gel Restock", category: "medicine", amount: 2100, offset: 40, paymentMode: "cash", notes: "" },
    { title: "Equipment AMC", category: "other", amount: 6000, offset: 55, paymentMode: "card", notes: "" },
    { title: "Electricity Bill", category: "electricity", amount: 3100, offset: 70, paymentMode: "upi", notes: "" },
    { title: "Clinic Rent - Feb", category: "rent", amount: 25000, offset: 90, paymentMode: "upi", notes: "" },
    { title: "Staff Salary - Therapist", category: "salary", amount: 22000, offset: 130, paymentMode: "card", notes: "" },
    { title: "Furniture Repair", category: "other", amount: 2400, offset: 170, paymentMode: "cash", notes: "" },
    { title: "Clinic Rent - Jan", category: "rent", amount: 24000, offset: 210, paymentMode: "upi", notes: "" },
    { title: "Medicine Stock Purchase", category: "medicine", amount: 8600, offset: 260, paymentMode: "card", notes: "" },
].map((r, i) => ({
    id: `dummy-${i}`,
    title: r.title,
    category: r.category,
    amount: r.amount,
    date: daysAgo(r.offset),
    paymentMode: r.paymentMode,
    notes: r.notes,
}))

const loadInitialExpenses = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch (e) {
        console.warn("Could not read saved expenses, falling back to dummy data.", e)
    }
    return DUMMY_EXPENSES
}

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

const EMPTY_FORM = { title: "", category: "", amount: "", date: "", paymentMode: "", notes: "" }

const ExpenseScreen = () => {
    useAutoHideSidebar()
    const [form, setForm] = useState(EMPTY_FORM)
    const [expenses, setExpenses] = useState(loadInitialExpenses)
    const [filter, setFilter] = useState("month")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [search, setSearch] = useState("")
    const [view, setView] = useState("charts") // 'charts' | 'table'
    const [savedFlash, setSavedFlash] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [formError, setFormError] = useState("")
    const [editId, setEditId] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    /* ── persist to localStorage whenever expenses change ── */
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
        } catch (e) {
            console.warn("Could not save expenses to localStorage.", e)
        }
    }, [expenses])

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
            paymentMode: item.paymentMode,
            notes: item.notes || ""
        })
        setEditId(item.id)
        setFormError("")
        setShowModal(true)
    }

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            setExpenses(prev => prev.filter(item => item.id !== id))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!form.title || !form.amount || !form.date) {
            setFormError("Please fill in title, amount and date to continue.")
            return
        }

        if (editId) {
            setExpenses(prev => prev.map(item => item.id === editId ? { ...item, ...form, amount: Number(form.amount) } : item))
        } else {
            setExpenses(prev => [{ id: `local-${Date.now()}`, ...form, amount: Number(form.amount) }, ...prev])
        }
        setForm(EMPTY_FORM)
        setEditId(null)
        setShowModal(false)

        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 2200)
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
                (MODE_LABEL[item.paymentMode] || item.paymentMode || "").toLowerCase().includes(q)
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
            const key = MODE_LABEL[item.paymentMode] || item.paymentMode || "Other"
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
                        <h4 className="ex-page-title">Expenses</h4>
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
                                <CFormSelect label="Payment Mode" name="paymentMode" value={form.paymentMode} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        <CRow>
                            <CCol md={12}>
                                <CFormTextarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Optional details…" />
                            </CCol>
                        </CRow>

                        {formError && <div className="ex-form-error">{formError}</div>}
                    </CModalBody>

                    <CModalFooter className="ex-modal-footer">
                        <CButton className="ex-cancel-btn" onClick={closeModal} type="button">
                            Cancel
                        </CButton>
                        <CButton type="submit" className="ex-save-btn">
                            <Plus size={15} style={{ marginRight: 6, marginTop: -2 }} />
                            Save Expense
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
                    <CFormInput type="date" onChange={e => setFromDate(e.target.value)} className="ex-date-input" />
                    <span className="ex-date-sep">to</span>
                    <CFormInput type="date" onChange={e => setToDate(e.target.value)} className="ex-date-input" />
                </div>
            )}

            {/* ── Charts view ── */}
            {view === "charts" && filteredData.length === 0 && (
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

            {view === "charts" && filteredData.length > 0 && (
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
                                <BarChart data={byMode} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
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
            {view === "table" && (
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
                                        <CTableRow key={item.id || i} className="ex-tr">
                                            <CTableDataCell className="ex-td ex-td-num">{i + 1}</CTableDataCell>
                                            <CTableDataCell className="ex-td"><span className="ex-name">{item.title}</span></CTableDataCell>
                                            <CTableDataCell className="ex-td">
                                                <span className="ex-badge" style={{ background: meta.bg, color: meta.color }}>
                                                    {meta.label}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell className="ex-td ex-muted">{item.date}</CTableDataCell>
                                            <CTableDataCell className="ex-td">₹{Number(item.amount).toLocaleString("en-IN")}</CTableDataCell>
                                            <CTableDataCell className="ex-td ex-muted">{MODE_LABEL[item.paymentMode] || item.paymentMode || "—"}</CTableDataCell>
                                            <CTableDataCell className="ex-td text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <button className="ex-action-btn edit" onClick={() => handleEdit(item)} title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="ex-action-btn delete" onClick={() => handleDelete(item.id)} title="Delete">
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

        /* Modal */
        .ex-modal .modal-content {
          border-radius: 14px !important; border: none !important; overflow: hidden;
          box-shadow: 0 20px 50px rgba(12,68,124,0.18);
        }
        .ex-modal-head {
          border-bottom: 0.5px solid #eef2f7 !important; padding: 18px 22px !important;
        }
        .ex-modal-head-inner { display: flex; align-items: center; gap: 12px; }
        .ex-form-icon {
          width: 38px; height: 38px; border-radius: 9px; background: #fcebeb; color:var(--color-primary);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ex-modal-title { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0; }
        .ex-modal-sub { margin: 0; font-size: 12px; color: #6b7280; }
        .ex-modal-body { padding: 22px !important; }
        .ex-modal-footer {
          border-top: 0.5px solid #eef2f7 !important; padding: 14px 22px !important;
          display: flex; justify-content: flex-end; gap: 10px;
        }

        .ex-form-error {
          background: #fef2f2; color:var(--color-primary); border: 0.5px solid #fecaca;
          border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600; margin-top: 4px;
        }

        .ex-cancel-btn {
          background: #fff !important; color: #374151 !important; border: 0.5px solid #d0dce9 !important;
          border-radius: 8px !important; padding: 8px 16px !important; font-size: 13px !important;
          font-weight: 600 !important;
        }
        .ex-cancel-btn:hover { background: #f8fafc !important; }

        .ex-save-btn {
          background:var(--color-primary) !important; color: #fff !important; border: none !important;
          border-radius: 8px !important; padding: 8px 18px !important; font-size: 13px !important;
          font-weight: 600 !important; display: flex; align-items: center; transition: filter .15s;
        }
        .ex-save-btn:hover { filter: brightness(0.92); }

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