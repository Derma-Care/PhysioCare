import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  TrendingUp, Users, UserPlus, UserCheck, Search, Calendar, X, Info,
  AlertCircle, RefreshCw
} from "lucide-react"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"
import { getPatientAnalytics, getPatientAnalyticsCustomDate } from "./PatientAnalyticsAPI"
import LoadingIndicator from "../../Utils/loader"
import { useLocation } from "react-router-dom"
import { useHospital } from '../Usecontext/HospitalContext'
// ---- Helpers ---------------------------------------------------------------

const fmtInt = (n) => (n == null ? "—" : Math.max(0, Math.round(n)).toLocaleString())

const InfoTip = ({ text }) => (
  <span className="pa-tip">
    <Info size={13} />
    <span className="pa-tip-bubble">{text}</span>
  </span>
)

const GROWTH_TIP_STAT =
  "Compares this period's total patients to the equivalent previous period. Calculated as ((current − previous) / previous) × 100."
const GROWTH_TIP_ROW =
  "This age group's change vs. the same group in the previous period, using ((current − previous) / previous) × 100."

const FILTER_PERIOD_MAP = {
  day: 1,
  week: 2,
  month: 3,
  year: 4,
}

const FILTER_LABELS = {
  day: "Today",
  week: "Week",
  month: "Month",
  year: "Year",
  custom: "Custom",
}

const TREND_LABELS = {
  day: "New Patients by Hour",
  week: "New Patients by Day",
  month: "New Patients by Week",
  year: "New Patients by Month",
  custom: "New Patients (Selected Range)",
}

// ---- Component -------------------------------------------------------------

const PatientAnalytics = () => {
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

  const [filter, setFilter] = useState("month")
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState({ start: "", end: "" })
  const [query, setQuery] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiData, setApiData] = useState(null)

  // ---- Fetch -----------------------------------------------------------------

  const fetchData = useCallback(
    async (currentFilter, range) => {
      setLoading(true)
      setError(null)
      try {
        let res
        if (currentFilter === "custom") {
          if (!range.start || !range.end) {
            setLoading(false)
            return
          }
          res = await getPatientAnalyticsCustomDate(clinicId, branchId, range.start, range.end)
        } else {
          res = await getPatientAnalytics(clinicId, branchId, currentFilter)
        }
        setApiData(res.data?.data || null)
      } catch (err) {
        setError("Failed to load analytics. Please try again.")
        setApiData(null)
      } finally {
        setLoading(false)
      }
    },
    [clinicId, branchId]
  )

  // Fetch on mount + whenever filter changes
  useEffect(() => {
    fetchData(filter, customRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // Fetch for custom only once both dates are chosen
  useEffect(() => {
    if (filter === "custom" && customRange.start && customRange.end) {
      fetchData("custom", customRange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customRange.start, customRange.end])

  // ---- Derived data ----------------------------------------------------------

  const summary = apiData?.summary || {}
  const trendChartData = apiData?.newPatientsTrend || []
  const ageGroupAnalytics = apiData?.ageGroupAnalytics || []

  const filteredDemographics = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ageGroupAnalytics
    return ageGroupAnalytics.filter((row) =>
      row.ageGroup.toLowerCase().includes(q)
    )
  }, [ageGroupAnalytics, query])

  const growthRate = summary.growthRate ?? 0

  const statCards = [
    {
      title: "Total Patients",
      value: fmtInt(summary.totalPatients),
      gradient: "linear-gradient(135deg, #1e6fba 0%, #185fa5 100%)",
      glow: "rgba(24,95,165,0.22)",
      icon: <Users size={22} color="#fff" />,
    },
    {
      title: `New This ${FILTER_LABELS[filter] === "Custom" ? "Range" : FILTER_LABELS[filter]}`,
      value: fmtInt(summary.newPatients),
      gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
      glow: "rgba(21,128,61,0.22)",
      icon: <UserPlus size={22} color="#fff" />,
    },
    {
      title: "Active Patients (Mobile Users)",
      value: fmtInt(summary.activePatients),
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0c7b93 100%)",
      glow: "rgba(12,123,147,0.22)",
      icon: <UserCheck size={22} color="#fff" />,
    },
    {
      title: "Growth Rate",
      value: `${growthRate > 0 ? "+" : ""}${growthRate}%`,
      gradient: "linear-gradient(135deg, #f43f5e 0%, #a32d2d 100%)",
      glow: "rgba(163,45,45,0.22)",
      icon: <TrendingUp size={22} color="#fff" />,
      tip: GROWTH_TIP_STAT,
    },
  ]

  // ---- Handlers --------------------------------------------------------------

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

  // ---- Render ----------------------------------------------------------------

  const renderContent = () => {
    if (loading) {
      return <div  ><LoadingIndicator message="Loading analytics..." /></div>
    }
    if (error) {
      return (
        <div className="pa-state-box pa-state-error">
          <AlertCircle size={32} color="#a32d2d" />
          <p>{error}</p>
          <button
            className="pa-retry-btn"
            onClick={() => fetchData(filter, customRange)}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )
    }
    if (!apiData) {
      return (
        <div className="pa-state-box">
          <p style={{ color: "#6b7280" }}>No data available for this period.</p>
        </div>
      )
    }
    return (
      <>
        {/* Stat cards */}
        <div className="pa-stat-grid">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="pa-stat-card"
              style={{ "--ps-gradient": stat.gradient, "--ps-glow": stat.glow }}
            >
              <div className="pa-sc-blob" />
              <div className="pa-sc-top">
                <div className="pa-sc-icon">{stat.icon}</div>
                {stat.tip && <InfoTip text={stat.tip} />}
              </div>
              <div className="pa-sc-value">{stat.value}</div>
              <div className="pa-stat-title">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="pa-chart-grid">
          <div className="pa-chart-card">
            <h6 className="pa-chart-title">{TREND_LABELS[filter]}</h6>
            {trendChartData.length === 0 ? (
              <div className="pa-chart-empty">No trend data available.</div>
            ) : (
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
                    name="New Patients"
                    stroke="#0c7b93"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#0c7b93" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pa-chart-card">
            <h6 className="pa-chart-title">Patients by Age Group &amp; Gender</h6>
            {ageGroupAnalytics.length === 0 ? (
              <div className="pa-chart-empty">No demographic data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ageGroupAnalytics} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
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
            )}
          </div>
        </div>

        {/* Demographics table */}
        <div className="pa-table-wrapper">
          <div className="pa-table-header">
            <h6 className="pa-table-title">Patient Demographics by Age Group</h6>
            <span className="pa-table-count">
              {filteredDemographics.length} of {ageGroupAnalytics.length} groups
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
                      <span className={`pa-trend-badge ${row.growthTrend >= 0 ? "up" : "down"}`}>
                        {row.growthTrend >= 0 ? "+" : ""}
                        {row.growthTrend}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="pa-root">
      {/* Page header */}
      <div className="pa-page-header">
        <div className="pa-title-group">
          <div className="pa-page-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="pa-page-title">Patient Analytics ({branchName})</h4>
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
                {FILTER_LABELS[f]}
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

      {/* Custom date bar */}
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
          {(customRange.start || customRange.end) && (
            <button
              className="pa-custom-clear"
              onClick={() => setCustomRange({ start: "", end: "" })}
              title="Clear dates"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {renderContent()}

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
        .pa-custom-clear {
          display: inline-flex; align-items: center; gap: 4px;
          border: none; background: #fef2f2; color: #a32d2d;
          border-radius: 20px; padding: 4px 10px; font-size: 11px;
          font-weight: 600; cursor: pointer; margin-left: 4px;
          transition: background .15s;
        }
        .pa-custom-clear:hover { background: #fee2e2; }

        /* State boxes */
        .pa-state-box {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; padding: 60px 20px; text-align: center; color: #6b7280; font-size: 13px;
        }
        .pa-state-error { color: #a32d2d; }
        .pa-retry-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fef2f2; color: #a32d2d; border: 1px solid #fca5a5;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .pa-retry-btn:hover { background: #fee2e2; }
        .pa-spinner {
          width: 36px; height: 36px; border: 3px solid #d0dce9;
          border-top-color: #0c7b93; border-radius: 50%;
          animation: pa-spin 0.8s linear infinite;
        }
        @keyframes pa-spin { to { transform: rotate(360deg); } }

        .pa-stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 900px) { .pa-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .pa-stat-grid { grid-template-columns: 1fr; } }

        .pa-stat-card {
          background: var(--ps-gradient);
          border-radius: 16px;
          padding: 18px 18px 16px;
          display: flex; flex-direction: column; gap: 6px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px var(--ps-glow), 0 1px 4px rgba(0,0,0,0.08);
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .pa-stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px var(--ps-glow), 0 2px 8px rgba(0,0,0,0.1);
        }
        .pa-sc-blob {
          position: absolute; top: -28px; right: -28px;
          width: 90px; height: 90px;
          background: rgba(255,255,255,0.12); border-radius: 50%;
          pointer-events: none;
        }
        .pa-sc-blob::after {
          content: ''; position: absolute; top: 22px; left: 22px;
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.10); border-radius: 50%;
        }
        .pa-sc-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .pa-sc-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.25);
        }
        .pa-sc-value { font-size: 22px; font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.5px; text-shadow: 0 1px 4px rgba(0,0,0,0.12); }
        .pa-stat-title { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.78); text-transform: uppercase; letter-spacing: 0.7px; margin: 0; }

        .pa-chart-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 900px) { .pa-chart-grid { grid-template-columns: 1fr; } }

        .pa-chart-card {
          background: #fff; border: 1px solid #d0dce9; border-radius: 10px; padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .pa-chart-title { margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #0c447c; }
        .pa-chart-empty { padding: 60px 0; text-align: center; color: #6b7280; font-size: 12px; }

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
          background: var(--color-primary, #0c447c); color: #fff; font-weight: 700; font-size: 12px;
          text-align: left; padding: 12px 16px; border: none;
        }
        .pa-td { padding: 12px 16px; vertical-align: middle; border-bottom: 1px solid #eef2f7; color: #374151; }
        .pa-td-strong { font-weight: 700; color: #0c447c; }
        .text-center { text-align: center; }
        .pa-tr:hover { background: #fdf3f3; }

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
