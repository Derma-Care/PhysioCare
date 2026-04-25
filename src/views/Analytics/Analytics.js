import React, { useState } from "react"
import {
  CCard, CCardBody, CRow, CCol,
  CButton, CFormInput,
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell
} from "@coreui/react"
import RevenueCards from "./RevenueCards"
import { useNavigate } from "react-router-dom"
import { IndianRupee } from "lucide-react"

const RevenueTable = () => {
  const [filter, setFilter] = useState("today")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const navigate = useNavigate()
  const [data] = useState([
    { parentName: "Ramesh", date: "2026-04-02", time: "10:30 AM", doctor: "Dr. Kumar", therapist: "Anjali", consultation: 500, therapy: 1500, due: 200, paid: 1600 },
    { parentName: "Suresh", date: "2026-04-01", time: "12:00 PM", doctor: "Dr. Rishita", therapist: "Rahul", consultation: 700, therapy: 1000, due: 0, paid: 1700 }
  ])

  const filterData = () => {
    const today = new Date()
    return data.filter((row) => {
      const rowDate = new Date(row.date)
      if (filter === "today") return rowDate.toDateString() === today.toDateString()
      if (filter === "week") {
        const firstDay = new Date(today)
        firstDay.setDate(today.getDate() - today.getDay())
        const lastDay = new Date(firstDay)
        lastDay.setDate(firstDay.getDate() + 6)
        return rowDate >= firstDay && rowDate <= lastDay
      }
      if (filter === "month") return rowDate.getMonth() === today.getMonth() && rowDate.getFullYear() === today.getFullYear()
      if (filter === "custom" && fromDate && toDate) return rowDate >= new Date(fromDate) && rowDate <= new Date(toDate)
      return true
    })
  }

  const filteredData = filterData()
  const totalConsultation = filteredData.reduce((s, r) => s + r.consultation, 0)
  const totalTherapy = filteredData.reduce((s, r) => s + r.therapy, 0)
  const totalPaid = filteredData.reduce((s, r) => s + r.paid, 0)
  const totalDue = filteredData.reduce((s, r) => s + r.due, 0)
  const grandTotal = totalConsultation + totalTherapy

  return (
    <>
      <RevenueCards />

      {/* ── Page Header + Filters ── */}
      <div className="rv-page-header">
        <div className="rv-title-group">
          <div className="rv-page-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <h4 className="rv-page-title">Revenue Management</h4>
            <p className="rv-page-sub">
              {filteredData.length} record{filteredData.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="rv-filter-group">
          {["today", "week", "month", "custom"].map((f) => (
            <button
              key={f}
              className={`rv-filter-pill${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button className="rv-add-btn" onClick={() => navigate("/expenses")}>
            + Add Expense
          </button>
        </div>
      </div>

      {filter === "custom" && (
        <div className="rv-custom-row">
          <CFormInput type="date" onChange={(e) => setFromDate(e.target.value)} className="rv-date-input" />
          <span className="rv-date-sep">to</span>
          <CFormInput type="date" onChange={(e) => setToDate(e.target.value)} className="rv-date-input" />
          <button className="rv-add-btn">Apply</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="rv-table-wrapper">
        <CTable className="rv-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="rv-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Parent Name</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Date</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Time</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Doctor</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Therapist</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Consultation Fee</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Therapy Fee</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Final Amt</CTableHeaderCell>
              <CTableHeaderCell className="rv-th">Due Amt</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredData.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={10}>
                  <div className="rv-empty">
                    <IndianRupee size={40} className="rv-empty-icon" />
                    <p>No records found.</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredData.map((row, i) => (
                <CTableRow key={i} className="rv-tr">
                  <CTableDataCell className="rv-td rv-td-num">{i + 1}</CTableDataCell>
                  <CTableDataCell className="rv-td"><span className="rv-name">{row.parentName}</span></CTableDataCell>
                  <CTableDataCell className="rv-td rv-muted">{row.date}</CTableDataCell>
                  <CTableDataCell className="rv-td rv-muted">{row.time}</CTableDataCell>
                  <CTableDataCell className="rv-td rv-muted">{row.doctor}</CTableDataCell>
                  <CTableDataCell className="rv-td rv-muted">{row.therapist}</CTableDataCell>
                  <CTableDataCell className="rv-td">₹{row.consultation}</CTableDataCell>
                  <CTableDataCell className="rv-td">₹{row.therapy}</CTableDataCell>
                  <CTableDataCell className="rv-td">₹{row.paid}</CTableDataCell>
                  <CTableDataCell className="rv-td">₹{row.due}</CTableDataCell>
                </CTableRow>
              ))
            )}

            {/* Total Row */}
            <CTableRow className="rv-total-row">
              <CTableDataCell colSpan={6}>Total</CTableDataCell>
              <CTableDataCell>₹{totalConsultation}</CTableDataCell>
              <CTableDataCell>₹{totalTherapy}</CTableDataCell>
              <CTableDataCell>₹{totalPaid}</CTableDataCell>
              <CTableDataCell>₹{totalDue}</CTableDataCell>
            </CTableRow>

            {/* Grand Total Row */}
            <CTableRow className="rv-grand-row">
              <CTableDataCell colSpan={8}>Grand Total</CTableDataCell>
              <CTableDataCell colSpan={2}>₹{grandTotal}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* Page Header */
        .rv-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .rv-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rv-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .rv-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .rv-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* Filter group */
        .rv-filter-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rv-filter-pill {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .rv-filter-pill:hover { border-color: #185fa5; color: #185fa5; }
        .rv-filter-pill.active {
          background: #185fa5;
          color: #fff;
          border-color: #185fa5;
        }

        /* Add Expense / Apply button */
        .rv-add-btn {
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: filter 0.15s;
          white-space: nowrap;
        }
        .rv-add-btn:hover { filter: brightness(0.9); }

        /* Custom date row */
        .rv-custom-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 16px;
          padding: 14px 16px;
          background: #f8fafc;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
        }
        .rv-date-input {
          flex: 1;
          font-size: 12px !important;
          border: 0.5px solid #d0dce9 !important;
          border-radius: 8px !important;
        }
        .rv-date-input:focus { border-color: #185fa5 !important; box-shadow: none !important; }
        .rv-date-sep { font-size: 12px; color: #6b7280; white-space: nowrap; }

        /* Table wrapper */
        .rv-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .rv-table { margin-bottom: 0 !important; font-size: 13px; }

        /* Table header */
        .rv-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }

        /* Table rows */
        .rv-tr { transition: background 0.12s; }
        .rv-tr:hover { background: #f0f5fb !important; }
        .rv-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .rv-td-num { color: #9ca3af; font-size: 12px; }
        .rv-muted { color: #6b7280; }

        /* Parent name */
        .rv-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }

        /* Total row */
        .rv-total-row td {
          background: #f0f5fb !important;
          font-weight: 600 !important;
          font-size: 13px;
          color: #0c447c !important;
          padding: 11px 14px !important;
          border-top: 0.5px solid #b5d4f4 !important;
          border-bottom: 0.5px solid #b5d4f4 !important;
        }

        /* Grand total row */
        .rv-grand-row td {
          background: #e6f1fb !important;
          font-weight: 600 !important;
          font-size: 13px;
          color: #0c447c !important;
          padding: 11px 14px !important;
          border-top: 0.5px solid #b5d4f4 !important;
          border-bottom: none !important;
        }

        /* Empty state */
        .rv-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .rv-empty-icon { color: #d0dce9; }
      `}</style>
    </>
  )
}

export default RevenueTable