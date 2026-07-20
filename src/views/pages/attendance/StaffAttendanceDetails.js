import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CSpinner } from "@coreui/react";
import { ArrowLeft, X, Calendar, Activity, Clock, Shield, MapPin } from "lucide-react";
import { empDummy, attendanceDummy } from "./AttadanceDummyData";
import Pagination from "../../../Utils/Pagination";
import { http } from "../../../Utils/Interceptors";
import { BASE_URL, GetUserDailyAttendence, GetUserMonthlyAttendence, GetTherapistPerformanceSummary } from "../../../baseUrl";
import CertificateTablePreview from "./Certificates";
import capitalizeWords from "../../../Utils/capitalizeWords";

const sadStyles = `
  .sad-root {   background: #F0F4F8; min-height: 100vh; }

  /* Top bar */
  .sad-topbar { background: linear-gradient(135deg,#1B4F8A 0%,#1a5fa8 100%); padding: 0 28px; height: 58px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 12px rgba(27,79,138,.18); }
  .sad-topbar-back { background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22); border-radius: 9px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; transition: background .15s; flex-shrink: 0; }
  .sad-topbar-back:hover { background: rgba(255,255,255,.24); }
  .sad-topbar-crumb { display: flex; align-items: center; gap: 8px; flex: 1; }
  .sad-topbar-crumb span { color: rgba(255,255,255,.65); font-size: 13px; }
  .sad-topbar-crumb .active { color: #fff; font-weight: 600; }
  .sad-topbar-crumb .sep { color: rgba(255,255,255,.3); }
  .sad-perf-btn { margin-left: auto; padding: 8px 18px; border-radius: 9px; border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.12); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; white-space: nowrap;   }
  .sad-perf-btn:hover { background: rgba(255,255,255,.22); }

  /* Body */
  .sad-body { padding: 24px 28px 48px; max-width: 1200px; margin: 0 auto; }

  /* Profile card */
  .sad-profile-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 20px 24px; display: flex; align-items: center; gap: 18px; margin-bottom: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .sad-avatar { width: 52px; height: 52px; border-radius: 50%; background: #EFF6FF; border: 2px solid #1B4F8A; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #1B4F8A; flex-shrink: 0; letter-spacing: -.03em; }
  .sad-profile-name { font-size: 17px; font-weight: 700; color: #0F172A; margin: 0 0 5px; letter-spacing: -.02em; }
  .sad-role-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #EFF6FF; color: #1B4F8A; letter-spacing: .01em; }

  /* Filters card */
  .sad-filters-card { background: #fff; border-radius: 14px; border: 1px solid #E2E8F0; padding: 18px 22px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
  .sad-filter-label { font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: #94A3B8; display: block; margin-bottom: 7px; }
  .sad-filter-input { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #0F172A; font-size: 13px; font-weight: 500; outline: none; transition: border-color .15s, box-shadow .15s;  }
  .sad-filter-input:focus { border-color: #1B4F8A; box-shadow: 0 0 0 3px rgba(27,79,138,.08); }
  .sad-clear-btn { width: 26px; height: 26px; border-radius: 50%; border: none; background: #FFF1F0; color: #B91C1C; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; line-height: 1; }

  /* Table card */
  .sad-table-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .sad-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .sad-table thead tr { background: #F8FAFC; }
  .sad-table th { padding: 13px 18px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: #fff; background-color: var(--color-bgcolor); border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
  .sad-table td { padding: 13px 18px; border-bottom: 1px solid #F1F5F9; }
  .sad-table tbody tr:last-child td { border-bottom: none; }
  .sad-table tbody tr { transition: background .12s; }
  .sad-table tbody tr:hover { background: #F8FAFC; }
  .sad-sno { color: #94A3B8; font-weight: 600; }
  .sad-date-cell { color: #0F172A; font-weight: 600; }
  .sad-time-cell { color: #475569; }
  .sad-working-cell { color: #0D6E5A; font-weight: 600; }
  .sad-absent-row { background: #FFF8F8 !important; }
  .sad-absent-row:hover { background: #FFF1F0 !important; }
  .sad-view-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #1B4F8A; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all .15s;  }
  .sad-view-btn:hover { background: #EFF6FF; border-color: rgba(27,79,138,.3); }
  .sad-empty td { padding: 52px 18px; text-align: center; color: #94A3B8; font-size: 14px; }
  .sad-table-footer { padding: 14px 20px; border-top: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between; }
  .sad-record-count { font-size: 12px; color: #94A3B8; }

  /* Status pills */
  .sad-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .sad-pill-present { background: #ECFDF5; color: #065F46; }
  .sad-pill-absent  { background: #FFF1F0; color: #B91C1C; }

  /* Modal overrides */
  .sad-modal .modal-content { border-radius: 18px !important; border: 1px solid #E2E8F0 !important; box-shadow: 0 20px 60px rgba(0,0,0,.15) !important; overflow: hidden; }
  .sad-modal .modal-header { background: #fff; border-bottom: 1px solid #F1F5F9 !important; padding: 20px 24px !important; }
  .sad-modal .modal-body { padding: 22px 24px !important; }
  .sad-modal .modal-footer { border-top: 1px solid #F1F5F9 !important; padding: 14px 24px !important; background: #FAFBFC; }
  .sad-modal-title { font-size: 16px !important; font-weight: 700 !important; color: #1B4F8A !important; letter-spacing: -.01em; }
  .sad-date-sub { font-size: 13px; font-weight: 400; color: #94A3B8; margin-left: 8px; }

  /* Tracker login/logout cards */
  .sad-io-card { padding: 14px 16px; border-radius: 12px; border: 1px solid; }
  .sad-io-card.in  { background: #F0FDF4; border-color: rgba(13,110,90,.2); }
  .sad-io-card.out { background: #FFF1F0; border-color: rgba(185,28,28,.2); }
  .sad-io-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 6px; }
  .sad-io-label.in  { color: #0D6E5A; }
  .sad-io-label.out { color: #B91C1C; }
  .sad-io-time { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .sad-io-time.in  { color: #0D6E5A; }
  .sad-io-time.out { color: #B91C1C; }
  .sad-io-loc { font-size: 11px; margin-top: 4px; line-height: 1.4; opacity: .75; }
  .sad-io-loc.in  { color: #0D6E5A; }
  .sad-io-loc.out { color: #B91C1C; }

  /* Activity table */
  .sad-act-head { background: #F8FAFC; border-radius: 10px 10px 0 0; padding: 11px 16px; border: 1px solid #E2E8F0; border-bottom: none; }
  .sad-act-head h6 { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #1B4F8A; }
  .sad-act-wrap { border: 1px solid #E2E8F0; border-radius: 0 0 10px 10px; overflow: hidden; }
  .sad-act-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .sad-act-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #94A3B8; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
  .sad-act-table td { padding: 11px 14px; border-bottom: 1px solid #F1F5F9; }
  .sad-act-table tbody tr:last-child td { border-bottom: none; }
  .sad-act-num { font-weight: 700; color: #1B4F8A; }
  .sad-act-name { font-weight: 600; color: #0F172A; }
  .sad-act-desc { font-size: 11px; color: #64748B; margin-top: 2px; font-style: italic; }
  .sad-act-loc  { font-size: 10px; color: #94A3B8; margin-top: 3px; }
  .sad-dur-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; background: #EFF6FF; color: #1B4F8A; font-size: 12px; font-weight: 600; white-space: nowrap; }

  /* Performance modal */
  .sad-exp-block { background: #EFF6FF; border: 1px solid rgba(27,79,138,.2); border-radius: 12px; padding: 14px 18px; flex: 1; margin-right: 18px; }
  .sad-exp-lbl { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #1B4F8A; margin-bottom: 6px; }
  .sad-exp-val { font-size: 20px; font-weight: 700; color: #1B4F8A; font-variant-numeric: tabular-nums; }
  .sad-year-sel { width: 100%; padding: 10px 12px; border-radius: 9px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #0F172A; font-size: 13px; font-weight: 600; outline: none; cursor: pointer; }
  .sad-year-sel:focus { border-color: #1B4F8A; }
  .sad-metric-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; text-align: center; }
  .sad-metric-lbl { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94A3B8; margin-bottom: 8px; }
  .sad-metric-val { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .sad-metric-sub { font-size: 11px; color: #94A3B8; margin-top: 3px; }
  .sad-analysis-block { background: #EFF6FF; border: 1px solid rgba(27,79,138,.15); border-radius: 12px; padding: 16px 18px; }
  .sad-analysis-ttl { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #1B4F8A; margin: 0 0 8px; }
  .sad-analysis-txt { margin: 0; font-size: 13px; color: #334155; line-height: 1.65; }
  .sad-cert-toggle { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 9px; border: 1px solid #1B4F8A; background: transparent; color: #1B4F8A; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .18s;   margin-top: 18px; }
  .sad-cert-toggle:hover, .sad-cert-toggle.open { background: #1B4F8A; color: #fff; }
  .sad-close-btn { padding: 8px 20px; border-radius: 9px; border: 1px solid #E2E8F0; background: #F8FAFC; color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;  transition: background .15s; }
  .sad-close-btn:hover { background: #F1F5F9; }
`;

export default function StaffAttendanceDetails() {
  const { name: userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Filters
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // API Data
  const [historyData, setHistoryData] = useState([]);
  const [trackerData, setTrackerData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTracker, setLoadingTracker] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [showCertificateTable, setShowCertificateTable] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tracker Modal State
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [performanceYear, setPerformanceYear] = useState(new Date().getFullYear().toString());

  const fetchMonthlyHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const role = location.state?.role || "";
      console.log(role);
      const normalizedRole = role.toLowerCase();
      let apiUrl;

      if (normalizedRole === "physiotherapist" || normalizedRole === "intern") {
        apiUrl = `${BASE_URL}/getMonthly/${userId}/${month}`;
      } else {
        apiUrl = `${BASE_URL}/${GetUserMonthlyAttendence}/${userId}/${month}`;
      }

      const res = await http.get(apiUrl);
      if (res.data.success) {
        setHistoryData(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching monthly history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [userId, month]);

  const fetchTrackerDetails = async (date) => {
    setSelectedDate(date);
    setShowTrackerModal(true);
    setLoadingTracker(true);
    try {
      const role = location.state?.role || "";
      const normalizedRole = role.toLowerCase();
      let apiUrl;

      if (normalizedRole === "physiotherapist" || normalizedRole === "intern") {
        apiUrl = `${BASE_URL}/getDaily/${userId}/${date}`;
      } else {
        apiUrl = `${BASE_URL}/${GetUserDailyAttendence}/${userId}/${date}`;
      }

      const res = await http.get(apiUrl);
      if (res.data.success) {
        setTrackerData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching tracker details:", err);
    } finally {
      setLoadingTracker(false);
    }
  };

  const fetchPerformanceSummary = useCallback(async () => {
    if (!showPerformanceModal) return;
    setLoadingPerformance(true);
    try {
      const clinicId = sessionStorage.getItem("HospitalId");
      const branchId = sessionStorage.getItem("branchId");
      const res = await http.get(`${BASE_URL}/${GetTherapistPerformanceSummary}/${clinicId}/${branchId}/${userId}/${performanceYear}`);
      if (res.data.success) {
        setPerformanceData(res.data.data);
        console.log("Performance Data:", res.data.data);
      }
    } catch (err) {
      console.error("Error fetching performance summary:", err);
    } finally {
      setLoadingPerformance(false);
    }
  }, [userId, performanceYear, showPerformanceModal]);

  useEffect(() => {
    fetchMonthlyHistory();
  }, [fetchMonthlyHistory]);

  useEffect(() => {
    fetchPerformanceSummary();
  }, [fetchPerformanceSummary]);

  useEffect(() => {
    if (location.state?.openTracker && location.state?.initialDate) {
      fetchTrackerDetails(location.state.initialDate);
    }
    if (location.state?.openPerformance) {
      setShowPerformanceModal(true);
    }
  }, [location.state]);

  const staffInfo = historyData.length > 0 ? historyData[0] : null;
  const staffName = staffInfo?.name || userId;
  const staffRole = staffInfo?.role || "Staff";
  const initials = staffName ? staffName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ST";

  const calculateDuration = (startDate) => {
    if (!startDate) return "N/A";
    const start = new Date(startDate);
    const end = new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return `${years}Y ${months}M ${days}D`;
  };

  const experience = calculateDuration(staffInfo?.joiningDate);

  const formatHoursToYMD = (totalHours) => {
    if (!totalHours || totalHours === 0) return "0D 0H";
    let hours = totalHours;
    if (typeof hours === 'string' && hours.includes('h')) { hours = parseInt(hours); }
    let days = Math.floor(hours / 24);
    hours = hours % 24;
    let months = Math.floor(days / 30);
    days = days % 30;
    let years = Math.floor(months / 12);
    months = months % 12;
    let result = "";
    if (years > 0) result += `${years}Y `;
    if (months > 0 || years > 0) result += `${months}M `;
    result += `${days}D ${Math.round(hours)}H`;
    return result;
  };

  // History Data with local filter
  let allStaffHistory = historyData;
  if (fromDate && toDate) {
    allStaffHistory = allStaffHistory.filter((att) => att.date >= fromDate && att.date <= toDate);
  } else if (fromDate) {
    allStaffHistory = allStaffHistory.filter((att) => att.date >= fromDate);
  } else if (toDate) {
    allStaffHistory = allStaffHistory.filter((att) => att.date <= toDate);
  }

  const totalPages = Math.ceil(allStaffHistory.length / pageSize);
  const staffHistory = allStaffHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewTracker = (date) => {
    fetchTrackerDetails(date);
  };

  const selectedAttRecord = historyData.find(att => att.date === selectedDate);
  const role = location.state?.role || "";
  const staffId = location.state?.staffId || "";
  console.log(role);
  const normalizedRole = role.toLowerCase();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear + 1 - index);

  return (
    <div className="sad-root">
      <style>{sadStyles}</style>

      {/* ── Top Bar ── */}
      <div className="sad-topbar">
        {/* <button className="sad-topbar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div className="sad-topbar-crumb">
          <span>Attendance</span>
          <span className="sep">/</span>
          <span className="active">{staffName}</span>
        </div> */}
        {(normalizedRole.toLowerCase().includes("physiotherapist") || normalizedRole.toLowerCase().includes("intern")) && (
          <button className="sad-perf-btn" onClick={() => setShowPerformanceModal(true)}>
            📊 Performance
          </button>
        )}
      </div>

      <div className="sad-body">

        {/* ── Profile Card ── */}
        <div className="sad-profile-card">
          <div className="sad-avatar">{initials}</div>
          <div>
            <h4 className="sad-profile-name">{location.state?.name}</h4>
            <span className="sad-role-badge">Role: {capitalizeWords(location.state?.role)}</span>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="sad-filters-card">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="sad-filter-label">Month Selection</label>
              <input
                type="month"
                className="sad-filter-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="sad-filter-label">From Date</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="sad-filter-input"
                  value={fromDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                {fromDate && (
                  <button className="sad-clear-btn" onClick={() => setFromDate("")} title="Clear">×</button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <label className="sad-filter-label">To Date</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="sad-filter-input"
                  value={toDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setToDate(e.target.value)}
                />
                {toDate && (
                  <button className="sad-clear-btn" onClick={() => setToDate("")} title="Clear">×</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── History Table ── */}
        <div className="sad-table-card">
          <div className="table-responsive">
            <table className="sad-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Login</th>
                  <th>Logout</th>
                  <th>Total</th>
                  <th>Working</th>
                  <th>Idle</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan="8" style={{ padding: "52px 18px", textAlign: "center" }}>
                      <CSpinner color="primary" />
                      <div style={{ marginTop: 10, color: "#94A3B8", fontSize: 13 }}>Loading attendance history...</div>
                    </td>
                  </tr>
                ) : staffHistory.length > 0 ? (
                  staffHistory.map((att, idx) => {
                    const isAbsent = !att.inTime || att.inTime === "-";
                    return (
                      <tr key={idx} className={isAbsent ? "sad-absent-row" : ""}>
                        <td className="sad-sno">{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td className="sad-date-cell">{att.date}</td>
                        <td>
                          {isAbsent
                            ? <span className="sad-pill sad-pill-absent">Absent</span>
                            : <span className="sad-pill sad-pill-present">{att.inTime}</span>
                          }
                        </td>
                        <td className="sad-time-cell">{att.outTime || "—"}</td>
                        <td className="sad-time-cell">{att.logTime || "—"}</td>
                        <td className={isAbsent ? "sad-time-cell" : "sad-working-cell"}>{att.workingHours || "—"}</td>
                        <td className="sad-time-cell">{att.idleTime || "—"}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="sad-view-btn"
                            onClick={() => handleViewTracker(att.date)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="sad-empty">
                    <td colSpan="8">No records found for the selected dates.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="sad-table-footer">
            <span className="sad-record-count">{allStaffHistory.length} record{allStaffHistory.length !== 1 ? "s" : ""}</span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* ── TRACKER MODAL ── */}
      <CModal
        visible={showTrackerModal}
        onClose={() => setShowTrackerModal(false)}
        size="lg"
        alignment="center"
        className="sad-modal custom-modal"
      >
        <CModalHeader closeButton>
          <CModalTitle className="sad-modal-title">
            Attendance Details
            <span className="sad-date-sub">| {selectedDate}</span>
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="sad-io-card in">
                <div className="sad-io-label in">Login Details</div>
                <div className="sad-io-time in">{trackerData?.login?.time || "—"}</div>
                <div className="sad-io-loc in">{trackerData?.login?.location || "Location N/A"}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="sad-io-card out">
                <div className="sad-io-label out">Logout Details</div>
                <div className="sad-io-time out">{trackerData?.logout?.time || "—"}</div>
                <div className="sad-io-loc out">{trackerData?.logout?.location || "Location N/A"}</div>
              </div>
            </div>
          </div>

          <div className="sad-act-head">
            <h6>Daily Activity Log</h6>
          </div>
          <div className="sad-act-wrap">
            {loadingTracker ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <CSpinner size="sm" color="primary" />
                <div style={{ marginTop: 8, fontSize: 12, color: "#94A3B8" }}>Fetching activity logs...</div>
              </div>
            ) : (trackerData?.activities?.length > 0 || trackerData?.sessions?.length > 0) ? (
              <table className="sad-act-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Activity</th>
                    <th style={{ width: 110 }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(trackerData.activities || trackerData.sessions).map((act, idx) => (
                    <tr key={idx}>
                      <td className="sad-act-num">{idx + 1}</td>
                      <td>
                        <div className="sad-act-name">{act.activity}</div>
                        {act.description && <div className="sad-act-desc">{act.description}</div>}
                        {act.location && <div className="sad-act-loc">📍 {act.location}</div>}
                      </td>
                      <td>
                        <span className="sad-dur-badge">{act.duration}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "28px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                No detailed activity logs available for this day.
              </div>
            )}
          </div>
        </CModalBody>

        <CModalFooter>
          <button className="sad-close-btn" onClick={() => setShowTrackerModal(false)}>
            Close Details
          </button>
        </CModalFooter>
      </CModal>

      {/* ── PERFORMANCE MODAL ── */}
      <CModal
        visible={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        size="lg"
        alignment="center"
        className="sad-modal custom-modal"
        backdrop="static"
      >
        <CModalHeader closeButton keyboard={false}>
          <CModalTitle className="sad-modal-title">
            Performance Overview: {staffName}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div className="d-flex align-items-stretch mb-4">
            <div className="sad-exp-block">
              <div className="sad-exp-lbl">Total Experience (since {performanceData?.joiningDate || "N/A"})</div>
              <div className="sad-exp-val">{performanceData?.yearsOfExperience || "N/A"} Years</div>
            </div>
            <div style={{ width: 160, flexShrink: 0 }}>
              <label className="sad-filter-label">Select Year</label>
              <select
                className="sad-year-sel"
                value={performanceYear}
                onChange={(e) => setPerformanceYear(e.target.value)}
              >
                <option value="all">All Time</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingPerformance ? (
            <div style={{ textAlign: "center", padding: "52px 0" }}>
              <CSpinner color="primary" />
              <div style={{ marginTop: 12, color: "#94A3B8", fontSize: 13 }}>Analyzing performance data...</div>
            </div>
          ) : performanceData ? (
            <>
              <div className="row g-3 mb-4">
                {[
                  { label: "Session Time", value: performanceData.totalSessionTime || 0, color: "#1B4F8A" },
                  { label: "Idle Time", value: performanceData.totalIdleTime || 0, color: "#B91C1C" },
                  { label: "Training Time", value: performanceData.totalTrainingHours || 0, color: "#0D6E5A" },
                  { label: "Avg Rating", value: `${performanceData.totalAvgRating || "0"} ★`, sub: `No of Ratings: ${performanceData.totalNoOfRatings || "0"}`, color: "#d97706" },
                  { label: "Total Paid Leaves", value: performanceData.paidLeaveDays || "0", color: "#64748B" },
                  { label: "Unpaid Leave", value: performanceData.lossOfPayDays || "0", color: "#B91C1C" },
                ].map((m) => (
                  <div className="col-md-3" key={m.label}>
                    <div className="sad-metric-card">
                      <div className="sad-metric-lbl">{m.label}</div>
                      <div className="sad-metric-val" style={{ color: m.color }}>{m.value}</div>
                      {m.sub && <div className="sad-metric-sub">{m.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sad-analysis-block mb-3">
                <p className="sad-analysis-ttl">
                  Performance Analysis for {performanceYear === "all" ? "Entire Tenure" : performanceYear}
                </p>
                <p className="sad-analysis-txt">
                  {performanceData.analysisSummary ||
                    `Based on the metrics for ${performanceYear === "all" ? "the entire period" : performanceYear}, ${staffName} is showing consistent dedication to patient care with a high session completion rate.`}
                </p>
              </div>

              <button
                className={`sad-cert-toggle ${showCertificateTable ? "open" : ""}`}
                onClick={() => setShowCertificateTable(!showCertificateTable)}
              >
                📜 {showCertificateTable ? "Hide Certificates" : "Load Certificates"}
              </button>

              {showCertificateTable && (
                <div className="mt-4">
                  <CertificateTablePreview staffId={staffName} role={role} />
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 14 }}>
              No performance data available for the selected year.
            </div>
          )}
        </CModalBody>

        <CModalFooter>
          <button className="sad-close-btn" onClick={() => setShowPerformanceModal(false)}>
            Close
          </button>
        </CModalFooter>
      </CModal>
    </div>
  );
}
