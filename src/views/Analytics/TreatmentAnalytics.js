import React, { useState, useMemo, useEffect } from "react"
import {
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell,
  CRow, CCol, CCard, CCardBody
} from "@coreui/react"
import { Activity, Star, ThumbsUp, DollarSign, Info, LayoutGrid, Table2, Search, X } from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LabelList
} from "recharts"
import Pagination from "../../Utils/Pagination"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"

import { getTreatmentAnalytics, getTreatmentAnalyticsCustomDate } from './TreatmentAnalyticsAPI'
import LoadingIndicator from "../../Utils/loader"
import { useLocation } from "react-router-dom"
import { useHospital } from '../Usecontext/HospitalContext'

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "activity", label: "Activity" },
  { value: "therapy", label: "Therapy" },
  { value: "program", label: "Program" },
  { value: "package", label: "Package" },
]

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
]
const PAGE_SIZE_OPTIONS = [5, 10, 25]

const TYPE_COLORS = {
  activity: { solid: "#0369a1", bg: "#e0f2fe" },
  therapy: { solid: "#6b21a8", bg: "#f3e8ff" },
  program: { solid: "#15803d", bg: "#dcfce7" },
  package: { solid: "#854d0e", bg: "#fef9c3" },
}

const parseRevenue = (str) => Number(String(str).replace(/[₹,]/g, "")) || 0

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
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

const TreatmentAnalytics = () => {
  useAutoHideSidebar()
  const location = useLocation();
  const { branchId: stateBranchId, clinicId, branchName: stateBranchName } =
    location.state || {};
  const { globalBranchId, globalBranchName } = useHospital() || {}
  // Prefer the live global context; fall back to navigation state
  const branchId = globalBranchId || stateBranchId
  const branchName = globalBranchName || stateBranchName
  const [typeFilter, setTypeFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("month")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [showInfo, setShowInfo] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [view, setView] = useState("charts") // 'charts' | 'table'
  const [search, setSearch] = useState("")
  const [apiData, setApiData] = useState([])
  const [apiSummary, setApiSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const hospitalId = sessionStorage.getItem('HospitalId')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let res
        if (periodFilter === 'custom') {
          if (!customFrom || !customTo) {
            setLoading(false)
            return
          }
          res = await getTreatmentAnalyticsCustomDate(hospitalId, branchId, typeFilter, customFrom, customTo)
        } else {
          res = await getTreatmentAnalytics(hospitalId, branchId, typeFilter, periodFilter)
        }

        if (res.data.success) {
          setApiData(res.data.data.treatments || [])
          setApiSummary(res.data.data)
        } else {
          setApiData([])
          setApiSummary(null)
        }
      } catch (err) {
        console.error(err)
        setApiData([])
        setApiSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [hospitalId, branchId, typeFilter, periodFilter, customFrom, customTo])

  /* ── filtered + mapped rows ── */
  const rows = useMemo(() => {
    let list = apiData

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(r =>
        r.treatmentName.toLowerCase().includes(q) ||
        (r.type || "").toLowerCase().includes(q)
      )
    }

    return list.map((r, index) => ({
      ...r,
      id: index + 1,
      treatment: r.treatmentName,
      type: (r.type || "").toLowerCase(),
      scaledCount: r.sessions || 0,
      scaledPatients: r.patients || 0,
      scaledCompleted: r.completed || 0,
      avgRevenue: `₹${r.avgRevenue || 0}`
    }))
  }, [apiData, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, periodFilter, search, customFrom, customTo])

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize)

  /* ── summary stats ── */
  const totalSessions = apiSummary?.totalSessions || 0
  const totalPatients = apiSummary?.totalPatients || 0
  const totalCompleted = rows.reduce((s, r) => s + r.scaledCompleted, 0)
  const avgSuccess = apiSummary?.avgSuccessRate || 0

  const statCards = [
    {
      title: "Total Sessions",
      value: totalSessions,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)",
      glow: "rgba(107,33,168,0.22)",
      icon: <Activity size={18} color="#fff" />,
    },
    {
      title: "Total Patients",
      value: totalPatients,
      gradient: "linear-gradient(135deg, #1e6fba 0%, #185fa5 100%)",
      glow: "rgba(24,95,165,0.22)",
      icon: <ThumbsUp size={18} color="#fff" />,
    },
    {
      title: "Avg Success Rate",
      value: `${avgSuccess}%`,
      gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      glow: "rgba(180,83,9,0.22)",
      icon: <Star size={18} color="#fff" />,
    },
    {
      title: "Treatment Types",
      value: apiSummary?.totalTreatmentTypes || 0,
      gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
      glow: "rgba(21,128,61,0.22)",
      icon: <DollarSign size={18} color="#fff" />,
    },
  ]

  /* ── chart data ── */
  // top treatments by sessions (limit for readability)
  const topBySessions = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.scaledCount - a.scaledCount)
      .slice(0, 7)
      .map(r => ({
        name: r.treatment.length > 16 ? r.treatment.slice(0, 15) + "…" : r.treatment,
        fullName: r.treatment,
        Sessions: r.scaledCount,
        Completed: r.scaledCompleted,
        type: r.type,
      }))
  }, [rows])

  // distribution by type (session share)
  const typeDistribution = useMemo(() => {
    const grouped = {}
    rows.forEach(r => {
      grouped[r.type] = grouped[r.type] || { type: r.type, Sessions: 0, count: 0 }
      grouped[r.type].Sessions += r.scaledCount
      grouped[r.type].count += 1
    })
    return Object.values(grouped).map(g => ({
      name: TYPE_OPTIONS.find(o => o.value === g.type)?.label ?? g.type,
      value: g.Sessions,
      type: g.type,
    }))
  }, [rows])

  // success rate by type (aggregated)
  const successByType = useMemo(() => {
    const grouped = {}
    rows.forEach(r => {
      grouped[r.type] = grouped[r.type] || { count: 0, completed: 0 }
      grouped[r.type].count += r.scaledCount
      grouped[r.type].completed += r.scaledCompleted
    })
    return Object.entries(grouped).map(([type, v]) => ({
      name: TYPE_OPTIONS.find(o => o.value === type)?.label ?? type,
      type,
      "Success Rate": v.count ? Math.round((v.completed / v.count) * 100) : 0,
    }))
  }, [rows])

  // avg revenue by treatment (top by revenue)
  const revenueByTreatment = useMemo(() => {
    return [...rows]
      .map(r => ({ name: r.treatment.length > 16 ? r.treatment.slice(0, 15) + "…" : r.treatment, Revenue: parseRevenue(r.avgRevenue), type: r.type }))
      .sort((a, b) => b.Revenue - a.Revenue)
      .slice(0, 7)
  }, [rows])

  return (
    <>
      {/* ── Header ── */}
      <div className="ta-page-header">
        <div className="ta-header-top">
          <div className="ta-title-group">
            <div className="ta-page-icon">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="ta-page-title">Treatment Analytics ({branchName})</h4>
              <p className="ta-page-sub">Analyze treatment performance and profitability</p>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="ta-mini-stats">
            {statCards.map((stat, idx) => (
              <div
                key={idx}
                className="ta-mini-stat"
                style={{ "--tm-gradient": stat.gradient, "--tm-glow": stat.glow }}
              >
                <div className="ta-ms-blob" />
                <div className="ta-ms-top">
                  <div className="ta-ms-icon">{stat.icon}</div>
                </div>
                <div className="ta-ms-value">{stat.value}</div>
                <div className="ta-ms-title">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dual filter row ── */}
        <div className="ta-filter-row">
          <div className="ta-select-wrap">
            <label className="ta-select-label">Search</label>
            <div className="ta-search-wrap">
              <Search size={14} className="ta-search-icon" />
              <input
                type="text"
                className="ta-search-input"
                placeholder="Search treatments, category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="ta-search-clear" onClick={() => setSearch("")} title="Clear search">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="ta-select-wrap">
            <label className="ta-select-label">Type</label>
            <select
              className="ta-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="ta-select-wrap">
            <label className="ta-select-label"></label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '33px' }}>
              {PERIOD_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`ta-filter-pill ${periodFilter === o.value ? 'active' : ''}`}
                  onClick={() => setPeriodFilter(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {periodFilter === "custom" && (
            <div className="ta-date-range">
              <div className="ta-select-wrap">
                <label className="ta-select-label">From</label>
                <input
                  type="date"
                  className="ta-select"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={e => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="ta-select-wrap">
                <label className="ta-select-label">To</label>
                <input
                  type="date"
                  className="ta-select"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={e => setCustomTo(e.target.value)}
                />
              </div>
              {(customFrom || customTo) && (
                <div className="ta-select-wrap">
                  <label className="ta-select-label"></label>
                  <button
                    className="ta-custom-clear"
                    onClick={() => { setCustomFrom(""); setCustomTo("") }}
                    title="Clear dates"
                  >
                    <X size={12} /> Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* view toggle */}
          <div className="ta-view-toggle">
            <button
              className={`ta-view-btn${view === "charts" ? " active" : ""}`}
              onClick={() => setView("charts")}
            >
              <LayoutGrid size={14} /> Charts
            </button>
            <button
              className={`ta-view-btn${view === "table" ? " active" : ""}`}
              onClick={() => setView("table")}
            >
              <Table2 size={14} /> Table
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div  >

          <LoadingIndicator message="Loading treatment analytics..." />
          {/* <p style={{ marginTop: '16px', fontWeight: 500 }}>Loading treatment analytics...</p> */}
        </div>
      ) : (
        <>
          {/* ── Charts view ── */}
          {view === "charts" && rows.length === 0 && (
            <div className="ta-empty-state">
              <Search size={28} color="#94a3b8" />
              <p>
                {search
                  ? <>No treatments match "<strong>{search}</strong>".</>
                  : "No records found for the selected filters."}
              </p>
            </div>
          )}
          {view === "charts" && rows.length > 0 && (
            <CRow className="mb-4">
              {/* Sessions vs Completed */}
              <CCol xs={12} lg={7} className="mb-3">
                <div className="ta-chart-card">
                  <div className="ta-chart-head">
                    <h6>Sessions vs Completed</h6>
                    <span className="ta-chart-sub">Top {topBySessions.length} treatments by volume</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topBySessions} margin={{ top: 6, right: 12, left: -12, bottom: 4 }}>
                      <CartesianGrid vertical={false} stroke="#eef2f7" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} interval={0} angle={-18} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Sessions" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Completed" fill="#0c447c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CCol>

              {/* Distribution by type */}
              <CCol xs={12} lg={5} className="mb-3">
                <div className="ta-chart-card">
                  <div className="ta-chart-head">
                    <h6>Session Share by Type</h6>
                    <span className="ta-chart-sub">Distribution of total sessions</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={3}
                      >
                        {typeDistribution.map((entry, i) => (
                          <Cell key={i} fill={TYPE_COLORS[entry.type]?.solid || "#94a3b8"} stroke="#fff" strokeWidth={2} />
                        ))}
                        <LabelList dataKey="value" position="inside" fill="#fff" fontSize={11} fontWeight={700} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CCol>

              {/* Success rate by type */}
              <CCol xs={12} lg={6} className="mb-3">
                <div className="ta-chart-card">
                  <div className="ta-chart-head">
                    <h6>Success Rate by Type</h6>
                    <span className="ta-chart-sub">Completed ÷ total sessions, per treatment type</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={successByType} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                      <CartesianGrid horizontal={false} stroke="#eef2f7" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} unit="%" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} width={70} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                      <Bar dataKey="Success Rate" radius={[0, 4, 4, 0]} barSize={22}>
                        {successByType.map((entry, i) => (
                          <Cell key={i} fill={TYPE_COLORS[entry.type]?.solid || "#94a3b8"} />
                        ))}
                        <LabelList dataKey="Success Rate" position="right" formatter={v => `${v}%`} fontSize={11} fill="#374151" fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CCol>

              {/* Revenue by treatment */}
              <CCol xs={12} lg={6} className="mb-3">
                <div className="ta-chart-card">
                  <div className="ta-chart-head">
                    <h6>Avg. Revenue by Treatment</h6>
                    <span className="ta-chart-sub">Top earners, ₹ per session</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={revenueByTreatment} margin={{ top: 6, right: 12, left: -8, bottom: 4 }}>
                      <CartesianGrid vertical={false} stroke="#eef2f7" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} interval={0} angle={-18} textAnchor="end" height={46} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₹${v}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                      <Bar dataKey="Revenue" radius={[4, 4, 0, 0]}>
                        {revenueByTreatment.map((entry, i) => (
                          <Cell key={i} fill={TYPE_COLORS[entry.type]?.solid || "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CCol>
            </CRow>
          )}

          {/* ── Table view ── */}
          {view === "table" && (
            <div className="ta-table-wrapper">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #d0dce9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <h6 style={{ margin: 0, color: '#0c447c', fontWeight: 600 }}>
                  {typeFilter === "all" ? "All Treatment Types" : TYPE_OPTIONS.find(o => o.value === typeFilter)?.label}
                  <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginLeft: 8 }}>
                    · {rows.length} records
                  </span>
                </h6>

                <div style={{ position: 'relative' }}>
                  <button
                    className="ta-info-btn"
                    onClick={() => setShowInfo(v => !v)}
                    title="How is Success Rate calculated?"
                  >
                    <Info size={14} style={{ marginRight: 4 }} />
                    How is Success Rate calculated?
                  </button>
                  {showInfo && (
                    <div className="ta-info-popover">
                      <strong>Success Rate Formula</strong>
                      <p style={{ margin: '6px 0 4px' }}>
                        <code>Success Rate = (Completed Sessions ÷ Total Sessions) × 100</code>
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
                        A session is marked <em>completed</em> when the patient attends
                        all prescribed visits and the therapist closes the session with
                        a positive outcome. Cancelled, missed, or on-hold sessions are
                        <strong> not</strong> counted as completed.
                      </p>
                      <button className="ta-info-close" onClick={() => setShowInfo(false)}>✕ Close</button>
                    </div>
                  )}
                </div>
              </div>

              <CTable className="ta-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell className="ta-th">#</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th">Treatment Name</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th">Type</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th text-center">Patients</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th text-center">Sessions</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th text-center">Completed</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th text-center">Success Rate</CTableHeaderCell>
                    <CTableHeaderCell className="ta-th text-right">Avg. Revenue</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pagedRows.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="ta-td text-center text-muted">
                        {search
                          ? <>No treatments match "<strong>{search}</strong>". Try a different search term.</>
                          : "No records found for the selected filters."}
                      </CTableDataCell>
                    </CTableRow>
                  ) : pagedRows.map((row, i) => {
                    const globalIdx = (safePage - 1) * pageSize + i + 1
                    const rate = row.scaledCount ? Math.round((row.scaledCompleted / row.scaledCount) * 100) : 0
                    const rateColor = rate >= 90 ? '#16a34a' : rate >= 75 ? '#b45309' : '#dc2626'
                    const badge = TYPE_COLORS[row.type] ? { bg: TYPE_COLORS[row.type].bg, color: TYPE_COLORS[row.type].solid } : { bg: '#f1f5f9', color: '#475569' }
                    return (
                      <CTableRow key={row.id} className="ta-tr">
                        <CTableDataCell className="ta-td text-muted">{globalIdx}</CTableDataCell>
                        <CTableDataCell className="ta-td font-weight-bold" style={{ color: '#0c447c' }}>
                          {row.treatment}
                        </CTableDataCell>
                        <CTableDataCell className="ta-td">
                          <span style={{ padding: '3px 9px', background: badge.bg, color: badge.color, borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                            {row.type}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="ta-td text-center font-weight-bold">{row.scaledPatients}</CTableDataCell>
                        <CTableDataCell className="ta-td text-center font-weight-bold">{row.scaledCount}</CTableDataCell>
                        <CTableDataCell className="ta-td text-center" style={{ color: '#374151' }}>{row.scaledCompleted}</CTableDataCell>
                        <CTableDataCell className="ta-td text-center">
                          <span className="ta-rate-bar-wrap">
                            <span className="ta-rate-bar" style={{ width: `${rate}%`, background: rateColor }} />
                            <span style={{ color: rateColor, fontWeight: 700, fontSize: 13 }}>{rate}%</span>
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="ta-td text-right font-weight-bold">{row.avgRevenue}</CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          )}

          {view === "table" && rows.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </>
      )}

      <style>{`
        .ta-page-header {
          display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 1px solid #d0dce9;
        }
        .ta-header-top {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .ta-title-group { display: flex; align-items: center; gap: 12px; }
        .ta-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #f3e8ff;
          display: flex; align-items: center; justify-content: center; color: #6b21a8; flex-shrink: 0;
        }
        .ta-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .ta-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        .ta-mini-stats {
          display: flex; align-items: stretch; gap: 10px; flex-wrap: wrap;
          margin-left: auto;
        }
        .ta-mini-stat {
          background: var(--tm-gradient);
          border-radius: 12px;
          padding: 14px 18px 12px;
          min-width: 150px;
          display: flex; flex-direction: column; gap: 4px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 16px var(--tm-glow), 0 1px 3px rgba(0,0,0,0.07);
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .ta-mini-stat:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 28px var(--tm-glow), 0 2px 6px rgba(0,0,0,0.09);
        }
        .ta-ms-blob {
          position: absolute; top: -20px; right: -20px;
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.13); border-radius: 50%;
          pointer-events: none;
        }
        .ta-ms-top { margin-bottom: 2px; }
        .ta-ms-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .ta-ms-value {
          font-size: 18px; font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -0.3px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .ta-ms-title {
          font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.75);
          text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap;
        }

        .ta-custom-clear {
          display: inline-flex; align-items: center; gap: 4px;
          border: none; background: #fef2f2; color: #a32d2d;
          border-radius: 20px; padding: 5px 12px; font-size: 11px;
          font-weight: 600; cursor: pointer; height: 33px;
          transition: background .15s;
        }
        .ta-custom-clear:hover { background: #fee2e2; }

        @media (max-width: 900px) {
          .ta-mini-stats { margin-left: 0; }
        }

        .ta-filter-row  { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
        .ta-date-range  { display: flex; gap: 10px; flex-wrap: wrap; }
        .ta-select-wrap { display: flex; flex-direction: column; gap: 3px; }
        .ta-select-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; }
        .ta-select {
          padding: 7px 10px; border: 1px solid #d0dce9; border-radius: 7px;
          font-size: 13px; font-weight: 500; color: #1e293b; background: #fff;
          cursor: pointer; outline: none; min-width: 130px; transition: border-color .15s; height: 33px;
        }
        .ta-select:focus { border-color: #6b21a8; box-shadow: 0 0 0 2px #6b21a820; }

        .ta-filter-pill {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .ta-filter-pill:hover { border-color: #0c447c; color: #0c447c; }
        .ta-filter-pill.active {
          background: #0c447c;
          color: #fff;
          border-color: #0c447c;
        }

        .ta-search-wrap {
          position: relative; display: flex; align-items: center;
        }
        .ta-search-icon { position: absolute; left: 9px; color: #94a3b8; pointer-events: none; }
        .ta-search-input {
          padding: 7px 28px 7px 30px; border: 1px solid #d0dce9; border-radius: 7px;
          font-size: 13px; font-weight: 500; color: #1e293b; background: #fff;
          outline: none; min-width: 220px; transition: border-color .15s;
        }
        .ta-search-input:focus { border-color: #6b21a8; box-shadow: 0 0 0 2px #6b21a820; }
        .ta-search-input::placeholder { color: #9ca3af; font-weight: 400; }
        .ta-search-clear {
          position: absolute; right: 6px; border: none; background: #f1f5f9; color: #64748b;
          border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; padding: 0;
        }
        .ta-search-clear:hover { background: #e2e8f0; color: #374151; }

        .ta-empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; padding: 60px 20px; background: #fff; border: 1px dashed #d0dce9;
          border-radius: 10px; margin-bottom: 24px; color: #6b7280; font-size: 13px; text-align: center;
        }
        .ta-empty-state p { margin: 0; }

        .ta-view-toggle {
          display: flex; align-items: center; gap: 2px; background: #f1f5f9;
          border-radius: 8px; padding: 3px; margin-left: auto;
        }
        .ta-view-btn {
          display: flex; align-items: center; gap: 6px; border: none; background: transparent;
          padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
          color: #64748b; cursor: pointer; transition: all .15s;
        }
        .ta-view-btn:hover { color: #0c447c; }
        .ta-view-btn.active { background: #fff; color: #0c447c; box-shadow: 0 1px 3px rgba(0,0,0,.08); }

        .ta-chart-card {
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px;
          padding: 16px 16px 6px; height: 100%; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .ta-chart-head { margin-bottom: 6px; }
        .ta-chart-head h6 { margin: 0; font-size: 14px; font-weight: 700; color: #0c447c; }
        .ta-chart-sub { font-size: 11px; color: #6b7280; }

        .ta-table-wrapper { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; overflow-x: auto; margin-bottom: 12px; }
        .ta-table { margin-bottom: 0 !important; font-size: 13px; }
        .ta-th {
          background: var(--color-primary) !important; color: #fff !important; font-size: 12px !important;
          font-weight: 600 !important; padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .ta-tr { transition: background 0.12s; }
        .ta-tr:hover { background: #fdf3f3 !important; }
        .ta-td {
          padding: 11px 14px !important; vertical-align: middle !important; font-size: 13px;
          color: #374151; border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }

        .ta-rate-bar-wrap {
          display: inline-flex; align-items: center; gap: 7px;
          background: #f1f5f9; border-radius: 20px; padding: 3px 10px; min-width: 90px; justify-content: flex-end;
          position: relative; overflow: hidden;
        }
        .ta-rate-bar {
          position: absolute; left: 0; top: 0; bottom: 0; border-radius: 20px; opacity: .12; transition: width .4s;
        }

        .ta-info-btn {
          display: inline-flex; align-items: center; gap: 4px;
          background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe;
          border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .ta-info-btn:hover { background: #ede9fe; }
        .ta-info-popover {
          position: absolute; right: 0; top: calc(100% + 8px); z-index: 999;
          width: 320px; background: #fff; border: 1px solid #d0dce9; border-radius: 10px;
          padding: 14px 16px; box-shadow: 0 8px 24px rgba(0,0,0,.12); font-size: 13px; color: #1e293b;
        }
        .ta-info-close {
          margin-top: 10px; display: block; background: #f1f5f9; border: none; border-radius: 6px;
          padding: 5px 12px; font-size: 12px; cursor: pointer; color: #475569; font-weight: 600;
        }
        .ta-info-close:hover { background: #e2e8f0; }
      `}</style>
    </>
  )
}

export default TreatmentAnalytics
