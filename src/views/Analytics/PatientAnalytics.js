import React, { useState, useMemo } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  TrendingUp, Users, UserPlus, UserCheck, Search, Calendar, X, Info
} from "lucide-react"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"

// ---- Static base data -------------------------------------------------

const BASE_DEMOGRAPHICS = [
  { id: 1, ageGroup: "0-18 Years", male: 120, female: 95, trend: 5 },
  { id: 2, ageGroup: "19-35 Years", male: 310, female: 280, trend: 15 },
  { id: 3, ageGroup: "36-50 Years", male: 180, female: 210, trend: 8 },
  { id: 4, ageGroup: "51+ Years", male: 145, female: 160, trend: -2 },
]

// Scale factor + trend series per filter window, so switching tabs visibly
// changes both the stat cards and the chart shapes rather than just labels.
const FILTER_CONFIG = {
  day: {
    label: "Today",
    scale: 0.12,
    trendLabel: "New Patients by Hour",
    series: ["8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"],
    trendData: [3, 6, 9, 7, 11, 8, 4],
  },
  week: {
    label: "Week",
    scale: 0.35,
    trendLabel: "New Patients by Day",
    series: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    trendData: [14, 18, 12, 20, 22, 9, 6],
  },
  month: {
    label: "Month",
    scale: 1,
    trendLabel: "New Patients by Week",
    series: ["Week 1", "Week 2", "Week 3", "Week 4"],
    trendData: [28, 35, 31, 34],
  },
  year: {
    label: "Year",
    scale: 11.5,
    trendLabel: "New Patients by Month",
    series: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    trendData: [88, 95, 102, 110, 118, 124, 131, 128, 135, 142, 139, 128],
  },
  custom: {
    label: "Custom",
    scale: 0.6,
    trendLabel: "New Patients (Selected Range)",
    series: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    trendData: [10, 15, 13, 19, 16, 12, 20],
  },
}

const fmtInt = (n) => Math.max(0, Math.round(n)).toLocaleString()

const InfoTip = ({ text }) => (
  <span className="pa-tip">
    <Info size={13} />
    <span className="pa-tip-bubble">{text}</span>
  </span>
)

const GROWTH_TIP_STAT =
  "Compares this period's total patients to the equivalent previous period (e.g. this month vs. last month). Calculated as ((current − previous) / previous) × 100."
const GROWTH_TIP_ROW =
  "This age group's change vs. the same group in the previous period, using ((current − previous) / previous) × 100."

const PatientAnalytics = () => {
  useAutoHideSidebar();
  const [filter, setFilter] = useState("month")
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState({ start: "", end: "" })
  const [query, setQuery] = useState("")

  const config = FILTER_CONFIG[filter]

  const scaledDemographics = useMemo(() => {
    return BASE_DEMOGRAPHICS.map((row) => {
      const male = Math.round(row.male * config.scale)
      const female = Math.round(row.female * config.scale)
      return { ...row, male, female, total: male + female }
    })
  }, [config])

  const filteredDemographics = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return scaledDemographics
    return scaledDemographics.filter((row) => row.ageGroup.toLowerCase().includes(q))
  }, [scaledDemographics, query])

  const totalPatients = scaledDemographics.reduce((sum, r) => sum + r.total, 0)
  const newThisPeriod = Math.round(totalPatients * 0.12)
  const activePatients = Math.round(totalPatients * 0.72)
  const avgTrend = (
    scaledDemographics.reduce((sum, r) => sum + r.trend, 0) / scaledDemographics.length
  ).toFixed(1)

  const statCards = [
    { title: "Total Patients", value: fmtInt(totalPatients), icon: <Users size={22} color="#185fa5" />, bg: "#e6f1fb" },
    { title: `New This ${config.label === "Custom" ? "Range" : config.label}`, value: fmtInt(newThisPeriod), icon: <UserPlus size={22} color="#3b6d11" />, bg: "#eaf3de" },
    { title: "Active Patients", value: fmtInt(activePatients), icon: <UserCheck size={22} color="#0c7b93" />, bg: "#e0f3f8" },
    { title: "Avg. Growth Rate", value: `${avgTrend > 0 ? "+" : ""}${avgTrend}%`, icon: <TrendingUp size={22} color="#a32d2d" />, bg: "#fcebeb", tip: GROWTH_TIP_STAT },
  ]

  const trendChartData = config.series.map((label, i) => ({
    label,
    patients: config.trendData[i],
  }))

  const handleFilterClick = (f) => {
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
    <div className="pa-root">
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

        <div className="pa-controls">
          <div className="pa-filter-group">
            {["day", "week", "month", "year"].map((f) => (
              <button
                key={f}
                className={`pa-filter-pill${filter === f ? " active" : ""}`}
                onClick={() => handleFilterClick(f)}
              >
                {FILTER_CONFIG[f].label}
              </button>
            ))}
            <button
              className={`pa-filter-pill pa-custom-pill${filter === "custom" ? " active" : ""}`}
              onClick={() => handleFilterClick("custom")}
            >
              <Calendar size={13} style={{ marginRight: 5 }} />
              Custom
            </button>
          </div>

          <div className="pa-search">
            <Search size={15} color="#6b7280" />
            <input
              type="text"
              placeholder="Search age group..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="pa-search-clear" onClick={() => setQuery("")}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showCustom && (
        <div className="pa-custom-bar">
          <Calendar size={15} color="#0c7b93" />
          <span className="pa-custom-label">Custom range:</span>
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
          />
          <span className="pa-custom-arrow">to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
          />
          <span className="pa-custom-summary">{rangeSummary}</span>
        </div>
      )}

      <div className="pa-stat-grid">
        {statCards.map((stat, idx) => (
          <div className="pa-stat-card" key={idx}>
            <div className="pa-stat-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div>
              <p className="pa-stat-title">
                {stat.title}
                {stat.tip && <InfoTip text={stat.tip} />}
              </p>
              <h4 className="pa-stat-value">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="pa-chart-grid">
        <div className="pa-chart-card">
          <h6 className="pa-chart-title">{config.trendLabel}</h6>
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
                dataKey="patients"
                name="New patients"
                stroke="#0c7b93"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0c7b93" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pa-chart-card">
          <h6 className="pa-chart-title">Patients by Age Group &amp; Gender</h6>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scaledDemographics} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#d0dce9" }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #d0dce9", fontSize: 12 }}
                labelStyle={{ color: "#0c447c", fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="male" name="Male" fill="#185fa5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="female" name="Female" fill="#0c7b93" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pa-table-wrapper">
        <div className="pa-table-header">
          <h6 className="pa-table-title">Patient Demographics by Age Group</h6>
          <span className="pa-table-count">
            {filteredDemographics.length} of {scaledDemographics.length} groups
          </span>
        </div>

        {filteredDemographics.length === 0 ? (
          <div className="pa-empty">No age group matches "{query}".</div>
        ) : (
          <table className="pa-table">
            <thead>
              <tr>
                <th className="pa-th">Age Group</th>
                <th className="pa-th text-center">Male</th>
                <th className="pa-th text-center">Female</th>
                <th className="pa-th text-center">Total</th>
                <th className="pa-th text-center pa-th-tip-cell">
                  Growth Trend
                  <span className="pa-tip pa-tip-down">
                    <Info size={13} />
                    <span className="pa-tip-bubble">{GROWTH_TIP_ROW}</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDemographics.map((row) => (
                <tr key={row.id} className="pa-tr">
                  <td className="pa-td pa-td-strong">{row.ageGroup}</td>
                  <td className="pa-td text-center">{row.male}</td>
                  <td className="pa-td text-center">{row.female}</td>
                  <td className="pa-td text-center pa-td-strong">{row.total}</td>
                  <td className="pa-td text-center">
                    <span className={`pa-trend-badge ${row.trend >= 0 ? "up" : "down"}`}>
                      {row.trend >= 0 ? "+" : ""}
                      {row.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
     
        .pa-page-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 14px; margin-bottom: 18px;
          padding-bottom: 16px; border-bottom: 1px solid #d0dce9;
        }
        .pa-title-group { display: flex; align-items: center; gap: 12px; }
        .pa-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #e0f3f8;
          display: flex; align-items: center; justify-content: center; color: #0c7b93; flex-shrink: 0;
        }
        .pa-page-title { font-size: 18px; font-weight: 700; color: #0c447c; margin: 0; }
        .pa-page-sub { font-size: 12px; color: #6b7280; margin: 2px 0 0; }

        .pa-controls {
          display: flex; flex-direction: row; align-items: center;
          gap: 12px; flex-wrap: wrap; justify-content: flex-end;
        }
        @media (max-width: 640px) { .pa-controls { justify-content: flex-start; } }

        .pa-filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .pa-filter-pill {
          display: flex; align-items: center;
          background: #fff; color: #374151; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .pa-filter-pill:hover { border-color: #0c7b93; color: #0c7b93; }
        .pa-filter-pill.active { background: #0c7b93; color: #fff; border-color: #0c7b93; }

        .pa-search {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #d0dce9; border-radius: 20px;
          padding: 7px 14px; width: 200px; flex-shrink: 0;
        }
        .pa-search input {
          border: none; outline: none; font-size: 12px; flex: 1; background: transparent; color: #374151;
        }
        .pa-search-clear {
          border: none; background: #eef2f7; color: #6b7280; border-radius: 50%;
          width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        .pa-custom-bar {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px;
          padding: 10px 16px; margin-bottom: 18px;
        }
        .pa-custom-label { font-size: 12px; font-weight: 600; color: #0c447c; }
        .pa-custom-bar input[type="date"] {
          border: 1px solid #d0dce9; border-radius: 6px; padding: 5px 8px; font-size: 12px; color: #374151;
        }
        .pa-custom-arrow { font-size: 12px; color: #6b7280; }
        .pa-custom-summary { font-size: 12px; color: #6b7280; margin-left: auto; }

        .pa-stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 900px) { .pa-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .pa-stat-grid { grid-template-columns: 1fr; } }

        .pa-stat-card {
          display: flex; align-items: center; gap: 14px;
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px;
          padding: 14px 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .pa-stat-icon {
          width: 46px; height: 46px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pa-stat-title { font-size: 12px; color: #6b7280; font-weight: 600; margin: 0 0 2px; }
        .pa-stat-value { font-size: 19px; font-weight: 700; color: #0c447c; margin: 0; }

        .pa-chart-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 900px) { .pa-chart-grid { grid-template-columns: 1fr; } }

        .pa-chart-card {
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px; padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .pa-chart-title { margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #0c447c; }

        .pa-table-wrapper {
          border: 1px solid #d0dce9; border-radius: 10px; overflow: hidden; background: #fff;
        }
        .pa-table-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid #d0dce9; background: #fff;
        }
        .pa-table-title { margin: 0; color: #0c447c; font-weight: 700; font-size: 13px; }
        .pa-table-count { font-size: 11px; color: #6b7280; font-weight: 600; }

        .pa-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .pa-th {
          background: #f8fafc; color: #475569; font-weight: 700; text-align: left;
          padding: 12px 16px; border-bottom: 1px solid #d0dce9;
        }
        .pa-td { padding: 12px 16px; vertical-align: middle; border-bottom: 1px solid #eef2f7; color: #374151; }
        .pa-td-strong { font-weight: 700; color: #0c447c; }
        .text-center { text-align: center; }
        .pa-tr:hover { background: #f8fafc; }

        .pa-trend-badge {
          padding: 4px 9px; border-radius: 5px; font-size: 12px; font-weight: 700;
        }
        .pa-trend-badge.up { color: #3b6d11; background: #eaf3de; }
        .pa-trend-badge.down { color: #a32d2d; background: #fcebeb; }

        .pa-empty { padding: 32px 16px; text-align: center; color: #6b7280; font-size: 13px; }

        .pa-tip {
          position: relative; display: inline-flex; align-items: center;
          margin-left: 5px; color: #9aa7b8; cursor: help; vertical-align: middle;
        }
        .pa-tip:hover { color: #0c7b93; }
        .pa-tip-bubble {
          position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
          width: 220px; background: #0c447c; color: #fff; font-size: 11px; font-weight: 500;
          line-height: 1.5; padding: 9px 11px; border-radius: 8px;
          opacity: 0; visibility: hidden; transition: opacity 0.15s ease, visibility 0.15s ease;
          z-index: 20; pointer-events: none; text-align: left;
          box-shadow: 0 4px 12px rgba(12,68,124,0.25);
        }
        .pa-tip-bubble::after {
          content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border: 5px solid transparent; border-top-color: #0c447c;
        }
        .pa-tip:hover .pa-tip-bubble { opacity: 1; visibility: visible; }

        .pa-tip-down .pa-tip-bubble {
          bottom: auto; top: calc(100% + 8px);
        }
        .pa-tip-down .pa-tip-bubble::after {
          top: auto; bottom: 100%; border-top-color: transparent; border-bottom-color: #0c447c;
        }
      `}</style>
    </div>
  )
}

export default PatientAnalytics