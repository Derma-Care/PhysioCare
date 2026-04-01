import React, { useState } from "react"
import {
  CCard, CCardBody, CRow, CCol,
  CButton, CFormInput,
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell
} from "@coreui/react"
import RevenueCards from "./RevenueCards"
import { useNavigate } from "react-router-dom"
const RevenueTable = () => {
  const [filter, setFilter] = useState("today")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
const navigate = useNavigate()
  const [data, setData] = useState([
    {
      parentName: "Ramesh",
      date: "2026-04-02",
      time: "10:30 AM",
      doctor: "Dr. Kumar",
      therapist: "Anjali",
      consultation: 500,
      therapy: 1500,
      due: 200,
      paid: 1600
    },
    {
      parentName: "Suresh",
      date: "2026-04-01",
      time: "12:00 PM",
      doctor: "Dr. Rishita",
      therapist: "Rahul",
      consultation: 700,
      therapy: 1000,
      due: 0,
      paid: 1700,
    }
  ])
  const filterData = () => {
  const today = new Date()

  return data.filter((row) => {
    const rowDate = new Date(row.date)

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
  const applyFilter = () => {
    console.log(filter, fromDate, toDate)
    // 🔹 Call API here
  }

  // 🔹 Totals Calculation
const totalConsultation = filteredData.reduce((s, r) => s + r.consultation, 0)
const totalTherapy = filteredData.reduce((s, r) => s + r.therapy, 0)
const totalPaid = filteredData.reduce((s, r) => s + r.paid, 0)
const totalDue = filteredData.reduce((s, r) => s + r.due, 0)
const grandTotal = totalConsultation + totalTherapy

  return (
    <>
    <RevenueCards/>
      {/* Filters */}
      <CCard className="mb-3 mt-3">
        <CCardBody>
          <CRow>
            <CCol>
   <CButton
  color={filter === "today" ? "primary" : "light"}
  onClick={() => setFilter("today")}
>
  Today
</CButton>

<CButton
  color={filter === "week" ? "primary" : "light"}
  onClick={() => setFilter("week")}
>
  Week
</CButton>

<CButton
  color={filter === "month" ? "primary" : "light"}
  onClick={() => setFilter("month")}
>
  Month
</CButton>

<CButton
  color={filter === "custom" ? "primary" : "light"}
  onClick={() => setFilter("custom")}
>
  Custom
</CButton>
            </CCol>
            <CRow className="mt-3">
  <CCol className="text-end">
    <CButton color="danger" onClick={() => navigate("/expenses")}>
      + Add Expense
    </CButton>
  </CCol>
</CRow>
          </CRow>

          {filter === "custom" && (
            <CRow className="mt-3">
              <CCol>
                <CFormInput type="date" onChange={e => setFromDate(e.target.value)} />
              </CCol>
              <CCol>
                <CFormInput type="date" onChange={e => setToDate(e.target.value)} />
              </CCol>
              <CCol>
                <CButton color="primary" onClick={applyFilter}>Apply</CButton>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Table */}
      <CCard>
        <CCardBody>
          <CTable bordered hover responsive className="pink-table" >
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Parent Name</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Time</CTableHeaderCell>
                <CTableHeaderCell>Doctor</CTableHeaderCell>
                <CTableHeaderCell>Therapist</CTableHeaderCell>
                <CTableHeaderCell>Consultation Fee</CTableHeaderCell>
                <CTableHeaderCell>Therapy Fee</CTableHeaderCell>
                <CTableHeaderCell>Final Amt</CTableHeaderCell>
                <CTableHeaderCell>Due Amt</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredData.map((row, i) => (
                <CTableRow key={i}>
                  <CTableDataCell>{i+1}</CTableDataCell>
                  <CTableDataCell>{row.parentName}</CTableDataCell>
                  <CTableDataCell>{row.date}</CTableDataCell>
                  <CTableDataCell>{row.time}</CTableDataCell>
                  <CTableDataCell>{row.doctor}</CTableDataCell>
                  <CTableDataCell>{row.therapist}</CTableDataCell>
                  <CTableDataCell>{row.consultation}</CTableDataCell>
                  <CTableDataCell>{row.therapy}</CTableDataCell>
                  <CTableDataCell>{row.paid}</CTableDataCell>
                  <CTableDataCell>{row.due}</CTableDataCell>
                </CTableRow>
              ))}
              {filteredData.length === 0 && (
  <CTableRow>
    <CTableDataCell colSpan={10} className="text-center">
      No Data Found
    </CTableDataCell>
  </CTableRow>
)}

              {/* Totals Row */}
                <CTableRow style={{ fontWeight: "bold", background: "#f1f3f5" }}>
      <CTableDataCell colSpan={6}>Total</CTableDataCell>
      <CTableDataCell>₹{totalConsultation}</CTableDataCell>
      <CTableDataCell>₹{totalTherapy}</CTableDataCell>
      <CTableDataCell>₹{totalPaid}</CTableDataCell> {/* NEW */}
      <CTableDataCell>₹{totalDue}</CTableDataCell>
    </CTableRow>

             <CTableRow style={{ fontWeight: "bold", background: "#dfe6e9" }}>
      <CTableDataCell colSpan={8}>Grand Total</CTableDataCell>
      <CTableDataCell colSpan={2}>₹{grandTotal}</CTableDataCell>
    </CTableRow>

            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}
export default RevenueTable;