import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import ReactDOM from "react-dom"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  Calendar, CheckCircle, XCircle, Clock, CalendarClock, Search, X,
  LayoutGrid, Table2, Info, AlertCircle, RefreshCw
} from "lucide-react"
import Pagination from "../../Utils/Pagination"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"
import { getAppointmentAnalytics, getAppointmentAnalyticsCustom } from "./AppointmentAnalyticsAPI"
import LoadingIndicator from "../../Utils/loader"
import { useLocation } from "react-router-dom"
import { useHospital } from '../Usecontext/HospitalContext'
const fmtInt = (n) => (n == null ? "—" : Math.max(0, Math.round(n)).toLocaleString())

const InfoTip = ({ text }) => {
  const [pos, setPos] = useState(null)
  const [visible, setVisible] = useState(false)
  const iconRef = useRef(null)

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect()
      setPos({
        x: rect.left + rect.width / 2,
        y: rect.top
      })
      setVisible(true)
    }
  }
  const handleMouseLeave = () => setVisible(false)

  const tooltip = visible && pos ? ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y - 12,
        transform: 'translate(-50%, -100%)',
        width: 230,
        background: '#1e293b',
        color: '#f1f5f9',
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: 1.6,
        padding: '10px 13px',
        borderRadius: 9,
        zIndex: 999999,
        pointerEvents: 'none',
        textAlign: 'left',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {text}
      <span style={{
        position: 'absolute',
        bottom: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid #1e293b',
      }} />
    </div>,
    document.body
  ) : null

  return (
    <>
      <span
        ref={iconRef}
        className="aa-tip-icon"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Info size={14} />
      </span>
      {tooltip}
    </>
  )
}

const COMPLETION_RATE_TIP =
  "Share of this practitioner's scheduled appointments that were completed. Calculated as (completed / total scheduled) × 100."

const FILTER_LABELS = { today: "Today", week: "Week", month: "Month", year: "Year", custom: "Custom" }

const TREND_LABELS = {
  today: "Appointment Volume by Hour",
  week: "Appointment Volume by Day",
  month: "Appointment Volume by Week",
  year: "Appointment Volume by Month",
  custom: "Appointment Volume (Selected Range)",
}

const AppointmentAnalytics = () => {
  useAutoHideSidebar()
  const location = useLocation();
  const { branchId: stateBranchId, clinicId, branchName: stateBranchName } =
    location.state || {};
  const { globalBranchId, globalBranchName } = useHospital() || {}
  // Prefer the live global context; fall back to navigation state
  const branchId = globalBranchId || stateBranchId
  const branchName = globalBranchName || stateBranchName
  // const clinicId = sessionStorage.getItem("HospitalId")
  // const branchId = sessionStorage.getItem("branchId")

  const [filter, setFilter] = useState("today")
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState({ start: "", end: "" })
  const [query, setQuery] = useState("")
  const [view, setView] = useState("charts")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiData, setApiData] = useState(null)

  // ---- Fetch ----------------------------------------------------------------
  const fetchData = useCallback(async (currentFilter, range) => {
    setLoading(true)
    setError(null)
    try {
      let res
      if (currentFilter === "custom") {
        if (!range.start || !range.end) { setLoading(false); return }
        res = await getAppointmentAnalyticsCustom(clinicId, branchId, range.start, range.end)
      } else {
        res = await getAppointmentAnalytics(clinicId, branchId, currentFilter)
      }
      setApiData(res.data?.data || null)
    } catch {
      setError("Failed to load analytics. Please try again.")
      setApiData(null)
    } finally {
      setLoading(false)
    }
  }, [clinicId, branchId])

  useEffect(() => { fetchData(filter, customRange) }, [filter]) // eslint-disable-line

  useEffect(() => {
    if (filter === "custom" && customRange.start && customRange.end) fetchData("custom", customRange)
  }, [customRange.start, customRange.end]) // eslint-disable-line

  // ---- Derived data ---------------------------------------------------------
  const summary = apiData?.summary || {}
  const practitioners = useMemo(() =>
    (apiData?.practitioners || []).map(row => ({
      ...row,
      completionRate: row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0,
    }))
    , [apiData])

  const trendRaw = apiData?.trendData || {}
  const trendLabels = trendRaw.seriesLabels || []
  const trendVols = trendRaw.appointmentVolumes || []
  const trendChartData = trendLabels.map((label, i) => ({ label, appointments: trendVols[i] ?? 0 }))

  const filteredPractitioners = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return practitioners
    return practitioners.filter(r =>
      r.doctor.toLowerCase().includes(q) || r.specialty.toLowerCase().includes(q)
    )
  }, [practitioners, query])

  const totalPages = Math.max(1, Math.ceil(filteredPractitioners.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedPractitioners = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredPractitioners.slice(start, start + pageSize)
  }, [filteredPractitioners, safePage, pageSize])

  const statCards = [
    { title: "Total Appointments", value: fmtInt(summary.totalAppointments), gradient: "linear-gradient(135deg, #1e6fba 0%, #185fa5 100%)", glow: "rgba(24,95,165,0.22)", icon: <Calendar size={18} color="#fff" /> },
    { title: "Booked", value: fmtInt(summary.booked), gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)", glow: "rgba(21,128,61,0.22)", icon: <CheckCircle size={18} color="#fff" /> },
    { title: "Cancelled", value: fmtInt(summary.cancelled), gradient: "linear-gradient(135deg, #f43f5e 0%, #a32d2d 100%)", glow: "rgba(163,45,45,0.22)", icon: <XCircle size={18} color="#fff" /> },
    { title: "Completed", value: fmtInt(summary.completed), gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", glow: "rgba(180,83,9,0.22)", icon: <Clock size={18} color="#fff" /> },
    {
      title: "Incomplete Treatments",
      value: fmtInt(summary.missed),
      gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
      glow: "rgba(71,85,105,0.22)",
      icon: <Clock size={18} color="#fff" />,
      tip: "Patients who started their therapy sessions but stopped treatment before completing the prescribed sessions. The appointment is marked as completed, but some scheduled sessions remain unfinished."
    }
  ]

  // ---- Handlers -------------------------------------------------------------
  const handleFilterClick = (f) => {
    setCurrentPage(1)
    if (f === "custom") { setShowCustom(true); setFilter("custom") }
    else { setShowCustom(false); setFilter(f) }
  }
  const handleSearchChange = (v) => { setQuery(v); setCurrentPage(1) }
  const rangeSummary = customRange.start && customRange.end
    ? `${customRange.start} → ${customRange.end}` : "Select a date range"

  // ---- Content area (loading / error / data) --------------------------------
  const renderContent = () => {
    if (loading) return (
      <div  ><LoadingIndicator message="Loading analytics..." /></div>
    )
    if (error) return (
      <div className="aa-state-box aa-state-error">
        <AlertCircle size={32} color="#a32d2d" />
        <p>{error}</p>
        <button className="aa-retry-btn" onClick={() => fetchData(filter, customRange)}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
    return null // charts/table rendered below
  }

  // ---- Render ---------------------------------------------------------------
  return (
    <div className="aa-root">
      {/* Header */}
      <div className="aa-page-header">
        <div className="aa-title-group">
          <div className="aa-page-icon"><Calendar size={20} /></div>
          <div>
            <h4 className="aa-page-title">Appointment Analytics ({branchName})</h4>
            <p className="aa-page-sub">Monitor appointment statuses and volumes</p>
          </div>
        </div>

        <div className="aa-controls">
          <div className="aa-filter-group">
            {["today", "week", "month", "year"].map(f => (
              <button key={f} className={`aa-filter-pill${filter === f ? " active" : ""}`} onClick={() => handleFilterClick(f)}>
                {FILTER_LABELS[f]}
              </button>
            ))}
            <button className={`aa-filter-pill${filter === "custom" ? " active" : ""}`} onClick={() => handleFilterClick("custom")}>
              <CalendarClock size={13} style={{ marginRight: 5 }} /> Custom
            </button>
          </div>

          <div className="aa-search">
            <Search size={15} color="#6b7280" />
            <input type="text" placeholder="Search doctor or specialty..." value={query} onChange={e => handleSearchChange(e.target.value)} />
            {query && <button className="aa-search-clear" onClick={() => handleSearchChange("")}><X size={13} /></button>}
          </div>

          <div className="aa-toggle">
            <button className={`aa-toggle-btn${view === "charts" ? " active" : ""}`} onClick={() => setView("charts")}><LayoutGrid size={14} /> Charts</button>
            <button className={`aa-toggle-btn${view === "table" ? " active" : ""}`} onClick={() => setView("table")}><Table2 size={14} /> Table</button>
          </div>
        </div>
      </div>

      {/* Custom date bar */}
      {showCustom && (
        <div className="aa-custom-bar">
          <CalendarClock size={15} color="#b45309" />
          <span className="aa-custom-label">Custom range:</span>
          <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))} />
          <span className="aa-custom-arrow">to</span>
          <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))} />
          <span className="aa-custom-summary">{rangeSummary}</span>
          {(customRange.start || customRange.end) && (
            <button className="aa-custom-clear" onClick={() => setCustomRange({ start: "", end: "" })} title="Clear dates">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="aa-stat-grid">
        {statCards.map((stat, idx) => (
          <div key={idx} className="aa-stat-card" style={{ "--as-gradient": stat.gradient, "--as-glow": stat.glow }}>
            <div className="aa-sc-blob" />
            <div className="aa-sc-top">
              <div className="aa-sc-icon">{stat.icon}</div>
              {stat.tip && <InfoTip text={stat.tip} />}
            </div>
            <div className="aa-sc-value">{stat.value}</div>
            <div className="aa-sc-title">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Charts / Table — loading & error scoped here only */}
      {renderContent() || (view === "charts" ? (
        <div className="aa-chart-grid">
          {/* Trend line */}
          <div className="aa-chart-card">
            <h6 className="aa-chart-title">{TREND_LABELS[filter]}</h6>
            {trendChartData.length === 0
              ? <div className="aa-chart-empty">No trend data available.</div>
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d0dce9", fontSize: 12 }} labelStyle={{ color: "#0c447c", fontWeight: 600 }} />
                    <Line type="monotone" dataKey="appointments" name="Appointments" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-primary)" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>

          {/* Practitioner bar */}
          <div className="aa-chart-card">
            <h6 className="aa-chart-title">Completed vs Cancelled by Practitioner</h6>
            {practitioners.length === 0
              ? <div className="aa-chart-empty">No practitioner data available.</div>
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={practitioners} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="doctor" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} interval={0} angle={-12} textAnchor="end" height={54} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d0dce9", fontSize: 12 }} labelStyle={{ color: "#0c447c", fontWeight: 600 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="completed" name="Completed" fill="#3b6d11" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#a32d2d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>
      ) : (
        <div className="aa-table-wrapper">
          <div className="aa-table-header">
            <h6 className="aa-table-title">Performance by Practitioner</h6>
            <span className="aa-table-count">{filteredPractitioners.length} of {practitioners.length} practitioners</span>
          </div>

          {practitioners.length === 0 ? (
            <div className="aa-empty">No practitioner data available for the selected period.</div>
          ) : filteredPractitioners.length === 0 ? (
            <div className="aa-empty">No practitioner matches "{query}".</div>
          ) : (
            <>
              <table className="aa-table">
                <thead>
                  <tr>
                    <th className="aa-th">Practitioner Name</th>
                    <th className="aa-th">Specialty</th>
                    <th className="aa-th text-center">Total Scheduled</th>
                    <th className="aa-th text-center">Completed</th>
                    <th className="aa-th text-center">Cancelled</th>
                    <th className="aa-th text-center">
                      Completion Rate
                      {/* <span className="aa-tip aa-tip-down aa-tip-align-end">
                        <Info size={13} />
                        <span className="aa-tip-bubble">{COMPLETION_RATE_TIP}</span>
                      </span> */}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPractitioners.map(row => (
                    <tr key={row.id} className="aa-tr">
                      <td className="aa-td aa-td-strong">{row.doctor}</td>
                      <td className="aa-td aa-td-muted">{row.specialty}</td>
                      <td className="aa-td text-center aa-td-strong">{row.total}</td>
                      <td className="aa-td text-center" style={{ color: "#3b6d11" }}>{row.completed}</td>
                      <td className="aa-td text-center" style={{ color: "#a32d2d" }}>{row.cancelled}</td>
                      <td className="aa-td text-center">
                        <div className="aa-rate">
                          <div className="aa-rate-track"><div className="aa-rate-fill" style={{ width: `${row.completionRate}%` }} /></div>
                          <span className="aa-rate-label">{row.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "16px", borderTop: "1px solid #d0dce9" }}>
                <Pagination
                  currentPage={safePage} totalPages={totalPages} pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={newSize => { setPageSize(newSize); setCurrentPage(1) }}
                />
              </div>
            </>
          )}
        </div>
      ))}

      {styles}
    </div>
  )
}

const styles = (
  <style>{`
    .aa-page-header { display:flex; flex-direction:column; align-items:flex-start; gap:14px; margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid #d0dce9; }
    .aa-title-group { display:flex; align-items:center; gap:12px; }
    .aa-page-icon { width:42px; height:42px; border-radius:10px; background:#fef3c7; display:flex; align-items:center; justify-content:center; color:var(--color-primary); flex-shrink:0; }
    .aa-page-title { font-size:18px; font-weight:700; color:#0c447c; margin:0; }
    .aa-page-sub { font-size:12px; color:#6b7280; margin:2px 0 0; }
    .aa-controls { display:flex; flex-direction:row; align-items:center; gap:10px; flex-wrap:nowrap; justify-content:flex-start; width:100%; overflow-x:auto; padding-bottom:2px; }
    @media(max-width:900px){ .aa-controls{ flex-wrap:wrap; overflow-x:visible; } }
    .aa-filter-group { display:flex; gap:8px; flex-wrap:nowrap; flex-shrink:0; }
    .aa-filter-pill { display:flex; align-items:center; background:#fff; color:#374151; border:1px solid #d0dce9; border-radius:20px; padding:6px 14px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
    .aa-filter-pill:hover { border-color:var(--color-primary); color:var(--color-primary); }
    .aa-filter-pill.active { background:var(--color-primary); color:#fff; border-color:var(--color-primary); }
    .aa-search { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #d0dce9; border-radius:20px; padding:7px 14px; width:220px; flex-shrink:0; }
    .aa-search input { border:none; outline:none; font-size:12px; flex:1; background:transparent; color:#374151; }
    .aa-search-clear { border:none; background:#eef2f7; color:#6b7280; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .aa-toggle { display:flex; align-items:center; background:#eef2f7; border-radius:20px; padding:3px; gap:2px; flex-shrink:0; }
    .aa-toggle-btn { display:flex; align-items:center; gap:6px; background:transparent; border:none; border-radius:17px; padding:7px 14px; font-size:12.5px; font-weight:600; color:#6b7280; cursor:pointer; transition:all 0.15s; }
    .aa-toggle-btn.active { background:#fff; color:var(--color-primary); box-shadow:0 1px 3px rgba(0,0,0,0.08); }
    .aa-custom-bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:#fff; border:1px solid #d0dce9; border-radius:10px; padding:10px 16px; margin-bottom:18px; }
    .aa-custom-label { font-size:12px; font-weight:600; color:#0c447c; }
    .aa-custom-bar input[type="date"] { border:1px solid #d0dce9; border-radius:6px; padding:5px 8px; font-size:12px; color:#374151; }
    .aa-custom-arrow { font-size:12px; color:#6b7280; }
    .aa-custom-summary { font-size:12px; color:#6b7280; margin-left:auto; }
    .aa-custom-clear { display:inline-flex; align-items:center; gap:4px; border:none; background:#fef2f2; color:#a32d2d; border-radius:20px; padding:4px 10px; font-size:11px; font-weight:600; cursor:pointer; margin-left:4px; transition:background .15s; }
    .aa-custom-clear:hover { background:#fee2e2; }
    .aa-stat-grid { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; }
    .aa-stat-card { background:var(--as-gradient); border-radius:14px; padding:14px 16px 12px; min-width:130px; flex:1 1 130px; display:flex; flex-direction:column; gap:5px; position:relative; overflow:hidden; box-shadow:0 4px 16px var(--as-glow),0 1px 3px rgba(0,0,0,0.07); transition:transform .2s,box-shadow .2s; cursor:default; }
    .aa-stat-card:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 10px 28px var(--as-glow),0 2px 6px rgba(0,0,0,0.09); }
    .aa-sc-blob { position:absolute; top:-22px; right:-22px; width:72px; height:72px; background:rgba(255,255,255,0.13); border-radius:50%; pointer-events:none; }
    .aa-sc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .aa-sc-icon { width:34px; height:34px; border-radius:8px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; border:1px solid rgba(255,255,255,0.25); }
    .aa-sc-value { font-size:20px; font-weight:800; color:#fff; line-height:1.1; letter-spacing:-0.3px; text-shadow:0 1px 3px rgba(0,0,0,0.12); }
    .aa-sc-title { font-size:10px; font-weight:700; color:rgba(255,255,255,0.78); text-transform:uppercase; letter-spacing:0.6px; white-space:nowrap; }
    .aa-chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
    @media(max-width:900px){ .aa-chart-grid{ grid-template-columns:1fr; } }
    .aa-chart-card { background:#fff; border:1px solid #d0dce9; border-radius:10px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,0.02); }
    .aa-chart-title { margin:0 0 8px; font-size:13px; font-weight:700; color:#0c447c; }
    .aa-chart-empty { padding:60px 0; text-align:center; color:#6b7280; font-size:12px; }
    .aa-table-wrapper { border:0.5px solid #d0dce9; border-radius:10px; overflow:hidden; background:#fff; margin-bottom:12px; }
    .aa-table-header { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #d0dce9; background:#fff; }
    .aa-table-title { margin:0; color:#0c447c; font-weight:700; font-size:13px; }
    .aa-table-count { font-size:11px; color:#6b7280; font-weight:600; }
    .aa-table { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:0!important; }
    .aa-th { background:var(--color-primary)!important; color:#fff!important; font-size:12px!important; font-weight:600!important; text-align:left; padding:11px 14px!important; border:none!important; white-space:nowrap; }
    .aa-tr { transition:background 0.12s; }
    .aa-tr:hover { background:#fdf3f3!important; }
    .aa-td { padding:11px 14px!important; vertical-align:middle!important; border-bottom:0.5px solid #eef2f7!important; color:#374151; }
    .aa-td-strong { font-weight:700; color:#0c447c; }
    .aa-td-muted { color:#6b7280; }
    .text-center { text-align:center; }
    .aa-rate { display:flex; align-items:center; justify-content:center; gap:8px; }
    .aa-rate-track { width:60px; height:6px; background:#eef2f7; border-radius:3px; overflow:hidden; }
    .aa-rate-fill { height:100%; background:var(--color-primary); }
    .aa-rate-label { font-size:12px; font-weight:700; color:#0c447c; }
    .aa-empty { padding:32px 16px; text-align:center; color:#6b7280; font-size:13px; }
    .aa-state-box { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:60px 20px; text-align:center; color:#6b7280; font-size:13px; }
    .aa-state-error { color:#a32d2d; }
    .aa-retry-btn { display:inline-flex; align-items:center; gap:6px; background:#fef2f2; color:#a32d2d; border:1px solid #fca5a5; border-radius:8px; padding:7px 16px; font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }
    .aa-retry-btn:hover { background:#fee2e2; }
    .aa-spinner { width:36px; height:36px; border:3px solid #d0dce9; border-top-color:var(--color-primary); border-radius:50%; animation:aa-spin 0.8s linear infinite; }
    @keyframes aa-spin { to{ transform:rotate(360deg); } }
    .aa-tip-icon { display:inline-flex; align-items:center; color:rgba(255,255,255,0.65); cursor:help; transition:color 0.15s; }
    .aa-tip-icon:hover { color:#fff; }
    .aa-tip-fixed {
      position: fixed;
      transform: translate(-50%, -100%);
      margin-top: -8px;
      width: 230px;
      background: #1e293b;
      color: #f1f5f9;
      font-size: 11.5px;
      font-weight: 500;
      line-height: 1.6;
      padding: 10px 13px;
      border-radius: 9px;
      z-index: 99999;
      pointer-events: none;
      text-align: left;
      box-shadow: 0 8px 24px rgba(0,0,0,0.28);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .aa-tip-fixed-arrow {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #1e293b;
    }
    .aa-tip-down .aa-tip-bubble { bottom:auto; top:calc(100% + 8px); }
    .aa-tip-down .aa-tip-bubble::after { top:auto; bottom:100%; border-top-color:transparent; border-bottom-color:#0c447c; }
    .aa-tip-align-end .aa-tip-bubble { left:auto; right:-6px; transform:none; }
    .aa-tip-align-end .aa-tip-bubble::after { left:auto; right:14px; transform:none; }
  `}</style>
)

export default AppointmentAnalytics
