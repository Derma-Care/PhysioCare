import React, { useState } from "react"
import {
    CCard, CCardBody, CRow, CCol,
    CForm, CFormInput, CFormSelect, CFormTextarea,
    CButton,
    CTable, CTableHead, CTableRow,
    CTableHeaderCell, CTableBody, CTableDataCell,
    CBadge
} from "@coreui/react"

const ExpenseScreen = () => {
    const [form, setForm] = useState({
        title: "",
        category: "",
        amount: "",
        date: "",
        paymentMode: "",
        notes: ""
    })

    const [expenses, setExpenses] = useState([])
    const [filter, setFilter] = useState("today")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const tabStyle = (type) => {
  const isActive = filter === type;

  return {
    // borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    cursor: "pointer",

    // ✅ ACTIVE
    backgroundColor: isActive ? "var(--color-bgcolor)" : "#fff",
    color: isActive ? "#fff" : "var(--color-bgcolor)",

    // ✅ INACTIVE BORDER
    border: "1px solid var(--color-bgcolor)",

    transition: "all 0.2s ease",
  };
};

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!form.title || !form.amount || !form.date) {
            alert("Please fill required fields")
            return
        }

        setExpenses([...expenses, form])

        setForm({
            title: "",
            category: "",
            amount: "",
            date: "",
            paymentMode: "",
            notes: ""
        })
    }

    // 🔹 Filter Logic
    const filterData = () => {
        const today = new Date()

        return expenses.filter((item) => {
            const rowDate = new Date(item.date)

            if (filter === "today") {
                return rowDate.toDateString() === today.toDateString()
            }

            if (filter === "week") {
                const firstDay = new Date(today)
                firstDay.setDate(today.getDate() - today.getDay())
                const lastDay = new Date(firstDay)
                lastDay.setDate(firstDay.getDate() + 6)
                return rowDate >= firstDay && rowDate <= lastDay
            }

            if (filter === "month") {
                return (
                    rowDate.getMonth() === today.getMonth() &&
                    rowDate.getFullYear() === today.getFullYear()
                )
            }

            if (filter === "custom" && fromDate && toDate) {
                return rowDate >= new Date(fromDate) && rowDate <= new Date(toDate)
            }

            return true
        })
    }

    const filteredData = filterData()

    const totalAmount = filteredData.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    )

    return (
        <>

            {/* FORM */}
            <CCard>
                <CCardBody>
                    <h5 className="textColor mb-4">Add Expense</h5>
                    <CForm onSubmit={handleSubmit}>
                        <CRow> {/* Title */}
                            <CRow className="mb-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Expense Title"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Rent / Salary / Electricity"
                                        required />
                                </CCol>
                                {/* Category */}
                                <CCol md={6}>
                                    <CFormSelect label="Category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange} >
                                        <option value="">Select</option>
                                        <option value="rent">Rent</option>
                                        <option value="salary">Salary</option>
                                        <option value="electricity">Electricity</option>
                                        <option value="medicine">Medicine</option>
                                        <option value="other">Other</option>
                                    </CFormSelect> </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                {/* Amount */}
                                <CCol md={4}>
                                    <CFormInput type="number"
                                        label="Amount (₹)"
                                        name="amount"
                                        value={form.amount}
                                        onChange={handleChange}
                                        required />
                                </CCol>
                                {/* Date */}
                                <CCol md={4}>
                                    <CFormInput type="date"

                                        label="Date" name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required />
                                </CCol>
                                {/* Payment Mode */}
                                <CCol md={4}>
                                    <CFormSelect label="Payment Mode"
                                        name="paymentMode"
                                        value={form.paymentMode}
                                        onChange={handleChange} >
                                        <option value="">Select</option>
                                        <option value="cash">Cash</option>
                                        <option value="upi">UPI</option>
                                        <option value="card">Card</option>
                                    </CFormSelect> </CCol>
                            </CRow>
                            {/* Notes */} <CCol md={12}>
                                <CFormTextarea label="Notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={3} />
                            </CCol> {/* Submit */}
                            <CCol md={12} className="mt-3 text-end">
                                <CButton type="submit" className="actionBtn">
                                    Save Expense
                                </CButton>
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
            </CCard>

            {/* TABLE */}
            <CCol md={12} className="mt-3">
                <CCard>
                    <CCardBody>
                        <h5 className="textColor mb-4">Expense List</h5>

                        {/* Filters */}
                        <div className="mb-3">
                           <CButton className="mx-2" style={tabStyle("today")} onClick={() => setFilter("today")}>
  Today
</CButton>

<CButton className="mx-2" style={tabStyle("week")} onClick={() => setFilter("week")}>
  Week
</CButton>

<CButton className="mx-2" style={tabStyle("month")} onClick={() => setFilter("month")}>
  Month
</CButton>

<CButton className="mx-2" style={tabStyle("custom")} onClick={() => setFilter("custom")}>
  Custom
</CButton>
                        </div>

                        {filter === "custom" && (
                            <CRow className="mb-3">
                                <CCol>
                                    <CFormInput type="date" onChange={e => setFromDate(e.target.value)} />
                                </CCol>
                                <CCol>
                                    <CFormInput type="date" onChange={e => setToDate(e.target.value)} />
                                </CCol>
                            </CRow>
                        )}

                        {/* Table */}
                        <CTable bordered hover responsive className="pink-table">
                            <CTableHead color="light">
                                <CTableRow>
                                    <CTableHeaderCell>#</CTableHeaderCell>
                                    <CTableHeaderCell>Title</CTableHeaderCell>
                                    <CTableHeaderCell>Category</CTableHeaderCell>
                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                    <CTableHeaderCell>Amount</CTableHeaderCell>
                                    <CTableHeaderCell>Mode</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                {filteredData.map((item, i) => (
                                    <CTableRow key={i}>
                                        <CTableDataCell>{i + 1}</CTableDataCell>
                                        <CTableDataCell>{item.title}</CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge color="info">{item.category}</CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>{item.date}</CTableDataCell>
                                        <CTableDataCell>₹{item.amount}</CTableDataCell>
                                        <CTableDataCell>{item.paymentMode}</CTableDataCell>
                                    </CTableRow>
                                ))}

                                {filteredData.length === 0 && (
                                    <CTableRow>
                                        <CTableDataCell colSpan={6} className="text-center">
                                            No Expenses Found
                                        </CTableDataCell>
                                    </CTableRow>
                                )}

                                {/* Total */}
                                <CTableRow style={{ fontWeight: "bold", background: "#f1f3f5" }}>
                                    <CTableDataCell colSpan={4}>Total</CTableDataCell>
                                    <CTableDataCell colSpan={2}>₹{totalAmount}</CTableDataCell>
                                </CTableRow>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>

        </>
    )
}

export default ExpenseScreen