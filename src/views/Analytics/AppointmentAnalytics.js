import React, { useState } from "react"
import {
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell,
  CRow, CCol, CCard, CCardBody
} from "@coreui/react"
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

const AppointmentAnalytics = () => {
  const [filter, setFilter] = useState("today")

  const statCards = [
    { title: "Total Appointments", value: "42", icon: <Calendar size={24} color="#185fa5" />, bg: "#e6f1fb" },
    { title: "Completed", value: "28", icon: <CheckCircle size={24} color="#3b6d11" />, bg: "#eaf3de" },
    { title: "Cancelled", value: "4", icon: <XCircle size={24} color="#a32d2d" />, bg: "#fcebeb" },
    { title: "Upcoming", value: "10", icon: <Clock size={24} color="#b45309" />, bg: "#fef3c7" }
  ]

  const data = [
    { id: 1, doctor: "Dr. Kumar", specialty: "Orthopedics", total: 18, completed: 15, cancelled: 1, completionRate: "83%" },
    { id: 2, doctor: "Dr. Rishita", specialty: "Neurology", total: 12, completed: 8, cancelled: 2, completionRate: "66%" },
    { id: 3, doctor: "Anjali (Therapist)", specialty: "Physiotherapy", total: 8, completed: 5, cancelled: 0, completionRate: "62%" },
    { id: 4, doctor: "Rahul (Therapist)", specialty: "Physiotherapy", total: 4, completed: 0, cancelled: 1, completionRate: "0%" }
  ]

  return (
    <>
      <div className="aa-page-header">
        <div className="aa-title-group">
          <div className="aa-page-icon">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="aa-page-title">Appointment Analytics</h4>
            <p className="aa-page-sub">Monitor appointment statuses and volumes</p>
          </div>
        </div>

        <div className="aa-filter-group">
          {["today", "week", "month"].map((f) => (
            <button
              key={f}
              className={`aa-filter-pill${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <CRow className="mb-4">
        {statCards.map((stat, idx) => (
          <CCol xs={12} sm={6} md={3} key={idx} className="mb-3">
            <CCard style={{ border: '1px solid #d0dce9', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <CCardBody className="d-flex align-items-center p-3">
                <div 
                  className="d-flex align-items-center justify-content-center flex-shrink-0 mr-3"
                  style={{ width: '48px', height: '48px', borderRadius: '10px', background: stat.bg, marginRight: '16px' }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-muted small mb-0 font-weight-bold">{stat.title}</p>
                  <h4 className="mb-0 font-weight-bold" style={{ color: '#0c447c' }}>{stat.value}</h4>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <div className="aa-table-wrapper">
        <div style={{ padding: '16px', borderBottom: '1px solid #d0dce9', background: '#fff' }}>
          <h6 style={{ margin: 0, color: '#0c447c', fontWeight: 600 }}>Performance by Practitioner</h6>
        </div>
        <CTable className="aa-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="aa-th">Practitioner Name</CTableHeaderCell>
              <CTableHeaderCell className="aa-th">Specialty</CTableHeaderCell>
              <CTableHeaderCell className="aa-th text-center">Total Scheduled</CTableHeaderCell>
              <CTableHeaderCell className="aa-th text-center">Completed</CTableHeaderCell>
              <CTableHeaderCell className="aa-th text-center">Cancelled</CTableHeaderCell>
              <CTableHeaderCell className="aa-th text-center">Completion Rate</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row) => (
              <CTableRow key={row.id} className="aa-tr">
                <CTableDataCell className="aa-td font-weight-bold" style={{ color: '#0c447c' }}>{row.doctor}</CTableDataCell>
                <CTableDataCell className="aa-td text-muted">{row.specialty}</CTableDataCell>
                <CTableDataCell className="aa-td text-center font-weight-bold">{row.total}</CTableDataCell>
                <CTableDataCell className="aa-td text-center" style={{ color: '#3b6d11' }}>{row.completed}</CTableDataCell>
                <CTableDataCell className="aa-td text-center" style={{ color: '#a32d2d' }}>{row.cancelled}</CTableDataCell>
                <CTableDataCell className="aa-td text-center">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '6px', background: '#eef2f7', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: row.completionRate, height: '100%', background: '#185fa5' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{row.completionRate}</span>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <style>{`
        .aa-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 1px solid #d0dce9;
        }
        .aa-title-group { display: flex; align-items: center; gap: 12px; }
        .aa-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #fef3c7;
          display: flex; align-items: center; justify-content: center; color: #b45309; flex-shrink: 0;
        }
        .aa-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .aa-page-sub { font-size: 12px; color: #6b7280; margin: 0; }
        
        .aa-filter-group { display: flex; gap: 8px; }
        .aa-filter-pill {
          background: #fff; color: #374151; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .aa-filter-pill.active { background: #b45309; color: #fff; border-color: #b45309; }
        
        .aa-table-wrapper {
          border: 1px solid #d0dce9; border-radius: 10px; overflow: hidden; background: #fff;
        }
        .aa-table { margin-bottom: 0 !important; font-size: 13px; }
        .aa-th { background: #f8fafc !important; color: #475569 !important; font-weight: 600 !important; padding: 12px 16px !important; border-bottom: 1px solid #d0dce9 !important; }
        .aa-td { padding: 12px 16px !important; vertical-align: middle !important; border-bottom: 1px solid #eef2f7 !important; }
        .aa-tr:hover { background: #f8fafc !important; }
      `}</style>
    </>
  )
}

export default AppointmentAnalytics
