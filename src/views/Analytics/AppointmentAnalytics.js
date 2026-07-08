import React, { useState, useMemo } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  Calendar, CheckCircle, XCircle, Clock, CalendarClock, Search, X,
  LayoutGrid, Table2, Info
} from "lucide-react"
import Pagination from "../../Utils/Pagination"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"

// ---- Static base data -------------------------------------------------

const BASE_PRACTITIONERS = [
  { id: 1, doctor: "Dr. Kumar", specialty: "Orthopedics", total: 18, completed: 15, cancelled: 1 },
  { id: 2, doctor: "Dr. Rishita", specialty: "Neurology", total: 12, completed: 8, cancelled: 2 },
  { id: 3, doctor: "Anjali (Therapist)", specialty: "Physiotherapy", total: 8, completed: 5, cancelled: 0 },
  { id: 4, doctor: "Rahul (Therapist)", specialty: "Physiotherapy", total: 4, completed: 0, cancelled: 1 },
]

// Scale factor + volume series per filter window, so switching tabs visibly
// changes stat cards, chart shapes, and the table rather than just labels.
const FILTER_CONFIG = {
  today: {
    label: "Today",
    scale: 1,
    trendLabel: "Appointment Volume by Hour",
    series: ["8am", "10am", "12pm", "2pm", "4pm", "6pm"],
    trendData: [4, 7, 9, 6, 10, 6],
  },
  week: {
    label: "Week",
    scale: 6.2,
    trendLabel: "Appointment Volume by Day",
    series: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    trendData: [32, 38, 29, 41, 44, 20, 8],
  },
  month: {
    label: "Month",
    scale: 24,
    trendLabel: "Appointment Volume by Week",
    series: ["Week 1", "Week 2", "Week 3", "Week 4"],
    trendData: [140, 165, 152, 158],
  },
  year: {
    label: "Year",
    scale: 280,
    trendLabel: "Appointment Volume by Month",
    series: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    trendData: [510, 540, 560, 590, 610, 640, 660, 655, 630, 605, 580, 560],
  },
  custom: {
    label: "Custom",
    scale: 4.5,
    trendLabel: "Appointment Volume (Selected Range)",
    series: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    trendData: [30, 35, 28, 40, 37, 22, 15],
  },
}

const fmtInt = (n) => Math.max(0, Math.round(n)).toLocaleString()

const COMPLETION_RATE_TIP =
  "Share of this practitioner's scheduled appointments that were completed, within the selected period. Calculated as (completed / total scheduled) × 100."

const AppointmentAnalytics = () => {
  useAutoHideSidebar();
  const [filter, setFilter] = useState("today")
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState({ start: "", end: "" })
  const [query, setQuery] = useState("")
  const [view, setView] = useState("charts") // "charts" | "table"
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const config = FILTER_CONFIG[filter]

  const scaledPractitioners = useMemo(() => {
    return BASE_PRACTITIONERS.map((row) => {
      const total = Math.round(row.total * config.scale)
      const completed = Math.round(row.completed * config.scale)
      const cancelled = Math.round(row.cancelled * config.scale)
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      return { ...row, total, completed, cancelled, completionRate }
    })
  }, [config])

  const filteredPractitioners = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return scaledPractitioners
    return scaledPractitioners.filter(
      (row) =>
        row.doctor.toLowerCase().includes(q) || row.specialty.toLowerCase().includes(q)
    )
  }, [scaledPractitioners, query])

  const totalPages = Math.max(1, Math.ceil(filteredPractitioners.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedPractitioners = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredPractitioners.slice(start, start + pageSize)
  }, [filteredPractitioners, safePage, pageSize])

  const handleSearchChange = (value) => {
    setQuery(value)
    setCurrentPage(1)
  }

  const totalAppointments = scaledPractitioners.reduce((sum, r) => sum + r.total, 0)
  const totalCompleted = scaledPractitioners.reduce((sum, r) => sum + r.completed, 0)
  const totalCancelled = scaledPractitioners.reduce((sum, r) => sum + r.cancelled, 0)
  const totalMissed = Math.max(0, totalAppointments - totalCompleted - totalCancelled)
  const totalBooked = totalAppointments - totalCancelled

  const statCards = [
    { title: "Total Appointments", value: fmtInt(totalAppointments), icon: <Calendar size={17} color="#185fa5" />, bg: "#e6f1fb" },
    { title: "Booked", value: fmtInt(totalBooked), icon: <CheckCircle size={17} color="#3b6d11" />, bg: "#eaf3de" },
    { title: "Cancelled", value: fmtInt(totalCancelled), icon: <XCircle size={17} color="#a32d2d" />, bg: "#fcebeb" },
    { title: "Completed", value: fmtInt(totalCompleted), icon: <Clock size={17} color="#b45309" />, bg: "#fef3c7" },
    { title: "Missed", value: fmtInt(totalMissed), icon: <Clock size={17} color="#b45309" />, bg: "#fef3c7" },
  ]

  const trendChartData = config.series.map((label, i) => ({
    label,
    appointments: config.trendData[i],
  }))

  const handleFilterClick = (f) => {
    setCurrentPage(1)
    if (f === "custom") {
      setShowCustom(true)
      setFilter("custom")
    } else {
      setShowCustom(false)
      setFilter(f)
    }
  }

  const rangeSummary =
    customRange.start && customRange.end
      ? `${customRange.start} → ${customRange.end}`
      : "Select a date range"

  return (
    <div className="aa-root">
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

        <div className="aa-controls">
          <div className="aa-filter-group">
            {["today", "week", "month", "year"].map((f) => (
              <button
                key={f}
                className={`aa-filter-pill${filter === f ? " active" : ""}`}
                onClick={() => handleFilterClick(f)}
              >
                {FILTER_CONFIG[f].label}
              </button>
            ))}
            <button
              className={`aa-filter-pill aa-custom-pill${filter === "custom" ? " active" : ""}`}
              onClick={() => handleFilterClick("custom")}
            >
              <CalendarClock size={13} style={{ marginRight: 5 }} />
              Custom
            </button>
          </div>

          <div className="aa-search">
            <Search size={15} color="#6b7280" />
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {query && (
              <button className="aa-search-clear" onClick={() => handleSearchChange("")}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="aa-toggle">
            <button
              className={`aa-toggle-btn${view === "charts" ? " active" : ""}`}
              onClick={() => setView("charts")}
            >
              <LayoutGrid size={14} />
              Charts
            </button>
            <button
              className={`aa-toggle-btn${view === "table" ? " active" : ""}`}
              onClick={() => setView("table")}
            >
              <Table2 size={14} />
              Table
            </button>
          </div>
        </div>
      </div>

      {showCustom && (
        <div className="aa-custom-bar">
          <CalendarClock size={15} color="#b45309" />
          <span className="aa-custom-label">Custom range:</span>
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
          />
          <span className="aa-custom-arrow">to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
          />
          <span className="aa-custom-summary">{rangeSummary}</span>
        </div>
      )}

      <div className="aa-stat-grid">
        {statCards.map((stat, idx) => (
          <div className="aa-stat-card" key={idx}>
            <div className="aa-stat-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div>
              <p className="aa-stat-title">{stat.title}</p>
              <h4 className="aa-stat-value">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {view === "charts" ? (
        <div className="aa-chart-grid">
          <div className="aa-chart-card">
            <h6 className="aa-chart-title">{config.trendLabel}</h6>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #d0dce9", fontSize: 12 }}
                  labelStyle={{ color: "#0c447c", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  name="Appointments"
                  stroke=" var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="aa-chart-card">
            <h6 className="aa-chart-title">Completed vs Cancelled by Practitioner</h6>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scaledPractitioners} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="doctor" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} interval={0} angle={-12} textAnchor="end" height={54} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #d0dce9", fontSize: 12 }}
                  labelStyle={{ color: "#0c447c", fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" fill="#3b6d11" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#a32d2d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="aa-table-wrapper">
          <div className="aa-table-header">
            <h6 className="aa-table-title">Performance by Practitioner</h6>
            <span className="aa-table-count">
              {filteredPractitioners.length} of {scaledPractitioners.length} practitioners
            </span>
          </div>

          {filteredPractitioners.length === 0 ? (
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
                      <span className="aa-tip aa-tip-down aa-tip-align-end">
                        <Info size={13} />
                        <span className="aa-tip-bubble">{COMPLETION_RATE_TIP}</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPractitioners.map((row) => (
                    <tr key={row.id} className="aa-tr">
                      <td className="aa-td aa-td-strong">{row.doctor}</td>
                      <td className="aa-td aa-td-muted">{row.specialty}</td>
                      <td className="aa-td text-center aa-td-strong">{row.total}</td>
                      <td className="aa-td text-center" style={{ color: "#3b6d11" }}>{row.completed}</td>
                      <td className="aa-td text-center" style={{ color: "#a32d2d" }}>{row.cancelled}</td>
                      <td className="aa-td text-center">
                        <div className="aa-rate">
                          <div className="aa-rate-track">
                            <div className="aa-rate-fill" style={{ width: `${row.completionRate}%` }}></div>
                          </div>
                          <span className="aa-rate-label">{row.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: "16px", borderTop: "1px solid #d0dce9" }}>
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
            </>
          )}
        </div>
      )}


      <style>{`
    
        .aa-page-header {
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 14px; margin-bottom: 18px;
          padding-bottom: 16px; border-bottom: 1px solid #d0dce9;
        }
        .aa-title-group { display: flex; align-items: center; gap: 12px; }
        .aa-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #fef3c7;
          display: flex; align-items: center; justify-content: center; color: var(--color-primary); flex-shrink: 0;
        }
        .aa-page-title { font-size: 18px; font-weight: 700; color: #0c447c; margin: 0; }
        .aa-page-sub { font-size: 12px; color: #6b7280; margin: 2px 0 0; }

        .aa-controls {
          display: flex; flex-direction: row; align-items: center;
          gap: 10px; flex-wrap: nowrap; justify-content: flex-start;
          width: 100%; overflow-x: auto; padding-bottom: 2px;
        }
        @media (max-width: 900px) { .aa-controls { flex-wrap: wrap; overflow-x: visible; } }

        .aa-filter-group { display: flex; gap: 8px; flex-wrap: nowrap; flex-shrink: 0; }
        .aa-filter-pill {
          display: flex; align-items: center;
          background: #fff; color: #374151; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
        }
        .aa-filter-pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .aa-filter-pill.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

        .aa-search {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 7px 14px; width: 220px; flex-shrink: 0;
        }
        .aa-search input {
          border: none; outline: none; font-size: 12px; flex: 1; background: transparent; color: #374151;
        }
        .aa-search-clear {
          border: none; background: #eef2f7; color: #6b7280; border-radius: 50%;
          width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        .aa-toggle {
          display: flex; align-items: center; background: #eef2f7; border-radius: 20px; padding: 3px; gap: 2px;
          flex-shrink: 0;
        }
        .aa-toggle-btn {
          display: flex; align-items: center; gap: 6px;
          background: transparent; border: none; border-radius: 17px;
          padding: 7px 14px; font-size: 12.5px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.15s;
        }
        .aa-toggle-btn.active { background: #fff; color: var(--color-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

        .aa-custom-bar {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px;
          padding: 10px 16px; margin-bottom: 18px;
        }
        .aa-custom-label { font-size: 12px; font-weight: 600; color: #0c447c; }
        .aa-custom-bar input[type="date"] {
          border: 1px solid #d0dce9; border-radius: 6px; padding: 5px 8px; font-size: 12px; color: #374151;
        }
        .aa-custom-arrow { font-size: 12px; color: #6b7280; }
        .aa-custom-summary { font-size: 12px; color: #6b7280; margin-left: auto; }

        .aa-stat-grid {
          display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px;
        }

        .aa-stat-card {
          display: flex; align-items: center; gap: 9px;
          background: #fff; border: 1px solid #d0dce9; border-radius: 9px;
          padding: 10px 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          flex: 1 1 150px;
        }
        .aa-stat-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .aa-stat-title { font-size: 10.5px; color: #6b7280; font-weight: 600; margin: 0 0 2px; white-space: nowrap; }
        .aa-stat-value { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0; white-space: nowrap; }

        .aa-chart-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 900px) { .aa-chart-grid { grid-template-columns: 1fr; } }

        .aa-chart-card {
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px; padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .aa-chart-title { margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #0c447c; }

        .aa-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; background: #fff;
          margin-bottom: 12px;
        }
        .aa-table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid #d0dce9; background: #fff;
        }
        .aa-table-title { margin: 0; color: #0c447c; font-weight: 700; font-size: 13px; }
        .aa-table-count { font-size: 11px; color: #6b7280; font-weight: 600; }

        .aa-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 0 !important; }
        .aa-th {
          background: var(--color-primary) !important; color: #fff !important; font-size: 12px !important;
          font-weight: 600 !important; text-align: left; padding: 11px 14px !important; border: none !important; white-space: nowrap;
        }
        .aa-tr { transition: background 0.12s; }
        .aa-tr:hover { background: #fdf3f3 !important; }
        .aa-td { padding: 11px 14px !important; vertical-align: middle !important; border-bottom: 0.5px solid #eef2f7 !important; color: #374151; }
        .aa-td-strong { font-weight: 700; color: #0c447c; }
        .aa-td-muted { color: #6b7280; }
        .text-center { text-align: center; }

        .aa-rate { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .aa-rate-track { width: 60px; height: 6px; background: #eef2f7; border-radius: 3px; overflow: hidden; }
        .aa-rate-fill { height: 100%; background: var(--color-primary); }
        .aa-rate-label { font-size: 12px; font-weight: 700; color: #0c447c; }

        .aa-empty { padding: 32px 16px; text-align: center; color: #6b7280; font-size: 13px; }

        .aa-tip {
          position: relative; display: inline-flex; align-items: center;
          margin-left: 5px; color: #cbd5e1; cursor: help; vertical-align: middle;
        }
        .aa-tip:hover { color: #fff; }
        .aa-tip-bubble {
          position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
          width: 220px; background: #0c447c; color: #fff; font-size: 11px; font-weight: 500;
          line-height: 1.5; padding: 9px 11px; border-radius: 8px;
          opacity: 0; visibility: hidden; transition: opacity 0.15s ease, visibility 0.15s ease;
          z-index: 20; pointer-events: none; text-align: left;
          box-shadow: 0 4px 12px rgba(12,68,124,0.25);
        }
        .aa-tip-bubble::after {
          content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border: 5px solid transparent; border-top-color: #0c447c;
        }
        .aa-tip:hover .aa-tip-bubble { opacity: 1; visibility: visible; }

        .aa-tip-down .aa-tip-bubble {
          bottom: auto; top: calc(100% + 8px);
        }
        .aa-tip-down .aa-tip-bubble::after {
          top: auto; bottom: 100%; border-top-color: transparent; border-bottom-color: #0c447c;
        }
        .aa-tip-align-end .aa-tip-bubble {
          left: auto; right: -6px; transform: none;
        }
        .aa-tip-align-end .aa-tip-bubble::after {
          left: auto; right: 14px; transform: none;
        }
      `}</style>
    </div>
  )
}

export default AppointmentAnalytics