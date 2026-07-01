import React, { useState } from "react"
import {
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell,
  CRow, CCol, CCard, CCardBody
} from "@coreui/react"
import { Activity, Star, ThumbsUp, DollarSign } from "lucide-react"

const TreatmentAnalytics = () => {
  const [filter, setFilter] = useState("month")

  const statCards = [
    { title: "Total Treatments", value: "312", icon: <Activity size={24} color="#6b21a8" />, bg: "#f3e8ff" },
    { title: "Avg Success Rate", value: "92%", icon: <Star size={24} color="#b45309" />, bg: "#fef3c7" },
    { title: "Highly Rated", value: "245", icon: <ThumbsUp size={24} color="#185fa5" />, bg: "#e6f1fb" },
    { title: "Avg Revenue/Treatment", value: "₹1,200", icon: <DollarSign size={24} color="#3b6d11" />, bg: "#eaf3de" }
  ]

  const data = [
    { id: 1, treatment: "Laser Therapy", category: "Advanced", count: 120, successRate: "95%", avgRevenue: "₹1,500" },
    { id: 2, treatment: "Spinal Decompression", category: "Orthopedic", count: 85, successRate: "88%", avgRevenue: "₹2,200" },
    { id: 3, treatment: "Sports Massage", category: "Recovery", count: 65, successRate: "96%", avgRevenue: "₹800" },
    { id: 4, treatment: "Acupuncture", category: "Alternative", count: 42, successRate: "85%", avgRevenue: "₹1,000" }
  ]

  return (
    <>
      <div className="ta-page-header">
        <div className="ta-title-group">
          <div className="ta-page-icon">
            <Activity size={20} />
          </div>
          <div>
            <h4 className="ta-page-title">Treatment Analytics</h4>
            <p className="ta-page-sub">Analyze treatment performance and profitability</p>
          </div>
        </div>

        <div className="ta-filter-group">
          {["month", "quarter", "year"].map((f) => (
            <button
              key={f}
              className={`ta-filter-pill${filter === f ? " active" : ""}`}
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

      <div className="ta-table-wrapper">
        <div style={{ padding: '16px', borderBottom: '1px solid #d0dce9', background: '#fff' }}>
          <h6 style={{ margin: 0, color: '#0c447c', fontWeight: 600 }}>Top Performing Treatments</h6>
        </div>
        <CTable className="ta-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="ta-th">Treatment Name</CTableHeaderCell>
              <CTableHeaderCell className="ta-th">Category</CTableHeaderCell>
              <CTableHeaderCell className="ta-th text-center">Sessions Conducted</CTableHeaderCell>
              <CTableHeaderCell className="ta-th text-center">Success Rate</CTableHeaderCell>
              <CTableHeaderCell className="ta-th text-right">Avg. Revenue</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row) => (
              <CTableRow key={row.id} className="ta-tr">
                <CTableDataCell className="ta-td font-weight-bold" style={{ color: '#0c447c' }}>{row.treatment}</CTableDataCell>
                <CTableDataCell className="ta-td text-muted">
                  <span style={{ padding: '4px 8px', background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: '4px', fontSize: '11px' }}>
                    {row.category}
                  </span>
                </CTableDataCell>
                <CTableDataCell className="ta-td text-center font-weight-bold">{row.count}</CTableDataCell>
                <CTableDataCell className="ta-td text-center">
                  <span style={{ color: '#3b6d11', fontWeight: 600 }}>{row.successRate}</span>
                </CTableDataCell>
                <CTableDataCell className="ta-td text-right font-weight-bold">{row.avgRevenue}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <style>{`
        .ta-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 1px solid #d0dce9;
        }
        .ta-title-group { display: flex; align-items: center; gap: 12px; }
        .ta-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #f3e8ff;
          display: flex; align-items: center; justify-content: center; color: #6b21a8; flex-shrink: 0;
        }
        .ta-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .ta-page-sub { font-size: 12px; color: #6b7280; margin: 0; }
        
        .ta-filter-group { display: flex; gap: 8px; }
        .ta-filter-pill {
          background: #fff; color: #374151; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .ta-filter-pill.active { background: #6b21a8; color: #fff; border-color: #6b21a8; }
        
        .ta-table-wrapper {
          border: 1px solid #d0dce9; border-radius: 10px; overflow: hidden; background: #fff;
        }
        .ta-table { margin-bottom: 0 !important; font-size: 13px; }
        .ta-th { background: #f8fafc !important; color: #475569 !important; font-weight: 600 !important; padding: 12px 16px !important; border-bottom: 1px solid #d0dce9 !important; }
        .ta-td { padding: 12px 16px !important; vertical-align: middle !important; border-bottom: 1px solid #eef2f7 !important; }
        .ta-tr:hover { background: #f8fafc !important; }
      `}</style>
    </>
  )
}

export default TreatmentAnalytics
