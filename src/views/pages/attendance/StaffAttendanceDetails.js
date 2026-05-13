import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from "@coreui/react";
import { ArrowLeft, X } from "lucide-react";
import { empDummy, attendanceDummy, trackerDummyData } from "./AttadanceDummyData";
import Pagination from "../../../Utils/Pagination";

export default function StaffAttendanceDetails() {
  const { name } = useParams();
  const navigate = useNavigate();

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tracker Modal State
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [performanceYear, setPerformanceYear] = useState(new Date().getFullYear().toString());

  const staff = empDummy.find(e => e.name === name);

  const calculateDuration = (startDate) => {
    const start = new Date(startDate);
    const end = new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}Y ${months}M ${days}D`;
  };

  const experience = staff ? calculateDuration(staff.joiningDate) : "";

  const formatHoursToYMD = (totalHours) => {
    if (!totalHours || totalHours === 0) return "0D 0H";
    let hours = totalHours;
    let days = Math.floor(hours / 24);
    hours = hours % 24;
    let months = Math.floor(days / 30);
    days = days % 30;
    let years = Math.floor(months / 12);
    months = months % 12;

    let result = "";
    if (years > 0) result += `${years}Y `;
    if (months > 0 || years > 0) result += `${months}M `;
    result += `${days}D ${hours}H`;
    return result;
  };

  if (!staff) {
    return (
      <div className="container-fluid mt-4 text-center">
        <h4>Staff member not found</h4>
        <button className="btn btn-outline-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // History Data
  let allStaffHistory = attendanceDummy.filter((att) => att.name === name);
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

  // Tracker Data
  let trackerData = [];
  if (selectedDate) {
    if (trackerDummyData[selectedDate] && trackerDummyData[selectedDate][name]) {
      trackerData = trackerDummyData[selectedDate][name];
    } else {
      trackerData = [
        { id: 1, time: "09:00", activity: "Login", duration: "-", location: "Main Clinic" },
        { id: 2, time: "11:00", activity: "Routine Work", duration: "2 hrs", location: "Clinic" },
        { id: 3, time: "13:00", activity: "Lunch Break", duration: "1 hr", location: "Cafeteria" },
        { id: 4, time: "17:00", activity: "Logout", duration: "-", location: "Main Clinic" }
      ];
    }
  }

  const handleViewTracker = (date) => {
    setSelectedDate(date);
    setShowTrackerModal(true);
  };

  const selectedAttRecord = allStaffHistory.find(att => att.date === selectedDate);

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-link text-decoration-none p-0 me-3"
          onClick={() => navigate(-1)}
          style={{ color: "#1B4F8A" }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h4 className="mb-0 fw-bold" style={{ color: "#1B4F8A" }}>
            Attendance History: {staff.name}
          </h4>
          <span className="badge mt-2" style={{ backgroundColor: "#1B4F8A", color: "#fff", padding: "6px 12px", fontSize: "12px", borderRadius: "20px" }}>
            Role: {staff.role}
          </span>
        </div>
        {staff.role === "Physiotherapist" && (
          <CButton
            className=" ms-auto shadow-sm"
            style={{ backgroundColor: "white", borderRadius: "8px", fontWeight: "600", color: "var(--color-bgcolor)", border: "1px solid var(--color-bgcolor)" }}
            onClick={() => setShowPerformanceModal(true)}
          >
            Performance
          </CButton>
        )}
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          {/* Filters */}
          <div className="row g-3 mb-4 ">
            <div className="col-md-4 wd-date-group">
              <label className="wd-date-label">From Date</label>
              <div className="d-flex align-items-center">
                <input
                  type="date"
                  className="wd-date-input w-100"
                  value={fromDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
                />
                {fromDate && (
                  <X
                    size={18}
                    className="ms-2"
                    style={{ cursor: "pointer", color: "#dc3545", flexShrink: 0 }}
                    onClick={() => setFromDate("")}
                    title="Clear"
                  />
                )}
              </div>
            </div>
            <div className="col-md-4 wd-date-group">
              <label className="wd-date-label">To Date</label>
              <div className="d-flex align-items-center">
                <input
                  type="date"
                  className="wd-date-input w-100"
                  value={toDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
                />
                {toDate && (
                  <X
                    size={18}
                    className="ms-2"
                    style={{ cursor: "pointer", color: "#dc3545", flexShrink: 0 }}
                    onClick={() => setToDate("")}
                    title="Clear"
                  />
                )}
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="table-responsive rounded shadow-sm wd-table-wrapper">
            <table className="table table-hover align-middle mb-0 pink-table">
              <thead style={{ backgroundColor: "#1B4F8A", color: "#fff" }}>
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold">S.No</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Date</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Login</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Logout</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Total</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Working</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Idle</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {staffHistory.length > 0 ? (
                  staffHistory.map((att, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <td className="px-4 py-3 text-muted">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-3 fw-medium" style={{ color: "#495057" }}>{att.date}</td>
                      <td className="px-4 py-3" style={{ color: "#6c757d", cursor: "help" }} title={att.loginLocation || "Location not available"}>{att.in}</td>
                      <td className="px-4 py-3" style={{ color: "#6c757d", cursor: "help" }} title={att.logoutLocation || "Location not available"}>{att.out}</td>
                      <td className="px-4 py-3" style={{ color: "#6c757d" }}>{att.total || "-"}</td>
                      <td className="px-4 py-3" style={{ color: "#6c757d" }}>{att.working || "-"}</td>
                      <td className="px-4 py-3" style={{ color: "#6c757d" }}>{att.idle || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="btn btn-sm btn-light shadow-sm border"
                          style={{ color: "#1B4F8A", borderRadius: "6px" }}
                          onClick={() => handleViewTracker(att.date)}
                        >
                          <i className="cil-eye"></i> View Tracker
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div className="mb-2">No records found for the selected dates.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
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

      {/* TRACKER MODAL */}
      <CModal
        visible={showTrackerModal}
        onClose={() => setShowTrackerModal(false)}
        size="lg"
        alignment="center" className="custom-modal"
      >
        <CModalHeader closeButton style={{ borderBottom: "1px solid #f1f3f5", padding: "20px 24px" }}>
          <CModalTitle style={{ color: "#1B4F8A", fontWeight: "bold", fontSize: "1.1rem" }}>
            Daily Tracker <span className="text-muted fw-normal fs-6 ms-2">| {selectedDate}</span>
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "24px" }}>
          {/* Summary Row */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="p-3 rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="text-muted small text-uppercase fw-bold mb-1">Login Details</div>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{ color: "#1B4F8A" }}>{selectedAttRecord?.in || "-"}</span>
                  <span className="text-muted small">{selectedAttRecord?.loginLocation || "Location N/A"}</span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="text-muted small text-uppercase fw-bold mb-1">Logout Details</div>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{ color: "#1B4F8A" }}>{selectedAttRecord?.out || "-"}</span>
                  <span className="text-muted small">{selectedAttRecord?.logoutLocation || "Location N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive rounded wd-table-wrapper">
            <table className="pink-table w-100">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Activity Name</th>
                  {(staff.role === "Physiotherapist" || staff.role === "Intern") && <th>Description</th>}
                  <th>Duration</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {trackerData.length > 0 ? (
                  trackerData.map((task, idx) => (
                    <tr key={idx}>
                      <td className="fw-medium text-dark">{task.time}</td>
                      <td>
                        <span className={`badge`} style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontWeight: "500",
                          backgroundColor: task.activity.includes("Idle") ? "#fff3cd" :
                            task.activity.includes("Therapy") ? "#d1e7dd" :
                              task.activity.includes("Assessment") ? "#cff4fc" : "#e2e3e5",
                          color: task.activity.includes("Idle") ? "#856404" :
                            task.activity.includes("Therapy") ? "#0f5132" :
                              task.activity.includes("Assessment") ? "#055160" : "#383d41"
                        }}>
                          {task.activity}
                        </span>
                      </td>
                      {(staff.role === "Physiotherapist" || staff.role === "Intern") && (
                        <td className="text-muted">{task.description || "Routine check and documentation"}</td>
                      )}
                      <td className="text-muted">{task.duration}</td>
                      <td className="text-muted">{task.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No activity logged for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: "none", padding: "16px 24px" }}>
          <CButton color="secondary" style={{ backgroundColor: "#f8f9fa", color: "#495057", border: "1px solid #dee2e6" }} onClick={() => setShowTrackerModal(false)}>
            Close Tracker
          </CButton>
        </CModalFooter>
      </CModal>

      {/* PERFORMANCE MODAL */}
      <CModal
        visible={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        size="lg"
        alignment="center" className="custom-modal" backdrop="static"
      >
        <CModalHeader closeButton style={{ borderBottom: "1px solid #f1f3f5", padding: "20px 24px" }} keyboard={false}>
          <CModalTitle style={{ color: "#1B4F8A", fontWeight: "bold" }}>
            Performance Overview: {staff.name}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px" }}>
          {/* Top Info & Year Filter */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="p-3 rounded border" style={{ backgroundColor: "#f0f7ff", flex: 1, marginRight: "20px" }}>
              <div className="text-muted small text-uppercase fw-bold mb-1">Total Experience (since {staff.joiningDate})</div>
              <h5 className="mb-0 fw-bold" style={{ color: "#1B4F8A" }}>{experience}</h5>
            </div>
            <div style={{ width: "150px" }}>
              <label className="form-label text-muted small text-uppercase fw-bold mb-1">Select Year</label>
              <select
                className="form-select shadow-sm"
                value={performanceYear}
                onChange={(e) => setPerformanceYear(e.target.value)}
                style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
              >
                <option value="all">All Time</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="p-3 text-center rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="text-muted small text-uppercase fw-bold mb-1">Completed Session Time</div>
                <h4 className="mb-0 fw-bold" style={{ color: "#1B4F8A", fontSize: "1.1rem" }}>
                  {performanceYear === "all" ? formatHoursToYMD(120) : performanceYear === "2026" ? formatHoursToYMD(45) : "0D 0H"}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 text-center rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="text-muted small text-uppercase fw-bold mb-1">Idle Time</div>
                <h4 className="mb-0 fw-bold" style={{ color: "#dc3545", fontSize: "1.1rem" }}>
                  {performanceYear === "all" ? formatHoursToYMD(12) : performanceYear === "2026" ? formatHoursToYMD(4) : "0D 0H"}
                </h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 text-center rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="text-muted small text-uppercase fw-bold mb-1">Avg Rating</div>
                <h4 className="mb-0 fw-bold" style={{ color: "#ffc107", fontSize: "1.1rem" }}>4.8</h4>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 text-center rounded border" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="text-muted small text-uppercase fw-bold mb-1">Training Time</div>
                <h4 className="mb-0 fw-bold" style={{ color: "#198754", fontSize: "1.1rem" }}>
                  {performanceYear === "all" ? formatHoursToYMD(15) : performanceYear === "2026" ? formatHoursToYMD(6) : "0D 0H"}
                </h4>
              </div>
            </div>
          </div>

          <div className="p-4 rounded border" style={{ backgroundColor: "#f0f7ff" }}>
            <h5 className="fw-bold mb-3" style={{ color: "#1B4F8A" }}>Performance Analysis for {performanceYear === "all" ? "Entire Tenure" : performanceYear}</h5>
            <p className="mb-0" style={{ color: "#495057", lineHeight: "1.6" }}>
              {performanceYear === "all" || performanceYear === "2026" ? (
                <>
                  Based on the metrics for {performanceYear === "all" ? "the entire period" : performanceYear}, {staff.name} is performing <strong>Excellent</strong>.
                  The completed session hours show great productivity, and the average rating remains consistently high at 4.8.
                  Idle time is well-managed across the shifts.
                </>
              ) : (
                <>No detailed data available for the year {performanceYear}.</>
              )}
            </p>
          </div>
        </CModalBody>
        <CModalFooter style={{ borderTop: "none", padding: "16px 24px" }}>
          <CButton color="secondary" variant="outline" onClick={() => setShowPerformanceModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
