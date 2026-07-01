import React, { useState } from "react"
import {
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell,
  CRow, CCol, CCard, CCardBody
} from "@coreui/react"
import { TrendingUp, Users, UserPlus, UserCheck } from "lucide-react"

const PatientAnalytics = () => {
  const [filter, setFilter] = useState("month")

  const statCards = [
    { title: "Total Patients", value: "1,245", icon: <Users size={24} color="#185fa5" />, bg: "#e6f1fb" },
    { title: "New This Month", value: "128", icon: <UserPlus size={24} color="#3b6d11" />, bg: "#eaf3de" },
    { title: "Active Patients", value: "856", icon: <UserCheck size={24} color="#0c7b93" />, bg: "#e0f3f8" },
    { title: "Growth Rate", value: "+12.5%", icon: <TrendingUp size={24} color="#a32d2d" />, bg: "#fcebeb" }
  ]

  const data = [
    { id: 1, ageGroup: "0-18 Years", male: 120, female: 95, total: 215, trend: "+5%" },
    { id: 2, ageGroup: "19-35 Years", male: 310, female: 280, total: 590, trend: "+15%" },
    { id: 3, ageGroup: "36-50 Years", male: 180, female: 210, total: 390, trend: "+8%" },
    { id: 4, ageGroup: "51+ Years", male: 145, female: 160, total: 305, trend: "-2%" }
  ]

  return (
    <>
      <div className="pa-page-header">
        <div className="pa-title-group">
          <div className="pa-page-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="pa-page-title">Patient Analytics</h4>
            <p className="pa-page-sub">Demographics and growth trends</p>
          </div>
        </div>

        <div className="pa-filter-group">
          {["week", "month", "year"].map((f) => (
            <button
              key={f}
              className={`pa-filter-pill${filter === f ? " active" : ""}`}
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

      <div className="pa-table-wrapper">
        <div style={{ padding: '16px', borderBottom: '1px solid #d0dce9', background: '#fff' }}>
          <h6 style={{ margin: 0, color: '#0c447c', fontWeight: 600 }}>Patient Demographics by Age Group</h6>
        </div>
        <CTable className="pa-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="pa-th">Age Group</CTableHeaderCell>
              <CTableHeaderCell className="pa-th text-center">Male</CTableHeaderCell>
              <CTableHeaderCell className="pa-th text-center">Female</CTableHeaderCell>
              <CTableHeaderCell className="pa-th text-center">Total</CTableHeaderCell>
              <CTableHeaderCell className="pa-th text-center">Growth Trend</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row) => (
              <CTableRow key={row.id} className="pa-tr">
                <CTableDataCell className="pa-td font-weight-bold" style={{ color: '#0c447c' }}>{row.ageGroup}</CTableDataCell>
                <CTableDataCell className="pa-td text-center">{row.male}</CTableDataCell>
                <CTableDataCell className="pa-td text-center">{row.female}</CTableDataCell>
                <CTableDataCell className="pa-td text-center font-weight-bold">{row.total}</CTableDataCell>
                <CTableDataCell className="pa-td text-center">
                  <span style={{ 
                    color: row.trend.startsWith('+') ? '#3b6d11' : '#a32d2d',
                    background: row.trend.startsWith('+') ? '#eaf3de' : '#fcebeb',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600
                  }}>
                    {row.trend}
                  </span>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <style>{`
        .pa-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 1px solid #d0dce9;
        }
        .pa-title-group { display: flex; align-items: center; gap: 12px; }
        .pa-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #e0f3f8;
          display: flex; align-items: center; justify-content: center; color: #0c7b93; flex-shrink: 0;
        }
        .pa-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .pa-page-sub { font-size: 12px; color: #6b7280; margin: 0; }
        
        .pa-filter-group { display: flex; gap: 8px; }
        .pa-filter-pill {
          background: #fff; color: #374151; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .pa-filter-pill.active { background: #0c7b93; color: #fff; border-color: #0c7b93; }
        
        .pa-table-wrapper {
          border: 1px solid #d0dce9; border-radius: 10px; overflow: hidden; background: #fff;
        }
        .pa-table { margin-bottom: 0 !important; font-size: 13px; }
        .pa-th { background: #f8fafc !important; color: #475569 !important; font-weight: 600 !important; padding: 12px 16px !important; border-bottom: 1px solid #d0dce9 !important; }
        .pa-td { padding: 12px 16px !important; vertical-align: middle !important; border-bottom: 1px solid #eef2f7 !important; }
        .pa-tr:hover { background: #f8fafc !important; }
      `}</style>
    </>
  )
}

export default PatientAnalytics
