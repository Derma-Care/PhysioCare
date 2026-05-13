import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { empDummy, attendanceDummy } from "./AttadanceDummyData";
import Pagination from "../../../Utils/Pagination";

export default function AttendanceReport() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // Filters for Main Page
  const [filterStaff, setFilterStaff] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Base Data preparation
  // Get all available staff
  const availableStaff = empDummy;
  const availableStaffNames = availableStaff.map(emp => emp.name);

  // Main Page: Today's attendance for all available staff
  const allFilteredAttendance = attendanceDummy.filter((att) => {
    if (att.date !== today) return false;
    if (!availableStaffNames.includes(att.name)) return false;
    if (filterStaff !== "all" && att.name !== filterStaff) return false;
    return true;
  });

  const totalPages = Math.ceil(allFilteredAttendance.length / pageSize);
  const todaysAttendance = allFilteredAttendance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewStaff = (staffName) => {
    navigate(`/attendance/staff/${staffName}`);
  };

  return (
    <div className="container-fluid mt-4">
      {/* MAIN VIEW */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white border-bottom pt-4 pb-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
          <div>
            <h4 className="mb-1 fw-bold" style={{ color: "#1B4F8A" }}>Daily Attendance</h4>
            <small className="text-muted fw-medium">Showing records for: {today}</small>
          </div>
          <div style={{ width: "250px" }}>
            <label className="mb-1 wd-date-label">Filter by Staff</label>
            <select
              className="shadow-sm wd-date-input"
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
            >
              <option value="all">All Clinic Staff</option>
              {availableStaff.map((staff) => (
                <option key={staff.id} value={staff.name}>{staff.name} ({staff.role})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body p-0 mt-2">
          <div className="table-responsive wd-table-wrapper">
            <table className="table table-hover align-middle mb-0 pink-table">
              <thead style={{ backgroundColor: "#1B4F8A", color: "#fff" }}>
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold">S.No</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Date</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Name</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Role</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">In Time</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Out Time</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Status</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {todaysAttendance.length > 0 ? (
                  todaysAttendance.map((att, idx) => {
                    const empInfo = availableStaff.find((e) => e.name === att.name);
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f3f5" }}>
                        <td className="px-4 py-3 text-muted">{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td className="px-4 py-3 fw-medium" style={{ color: "#495057" }}>{att.date}</td>
                        <td className="px-4 py-3 fw-bold text-dark">{att.name}</td>
                        <td className="px-4 py-3" style={{ color: "#6c757d" }}>{empInfo ? empInfo.role : "-"}</td>
                        <td className="px-4 py-3" style={{ color: "#495057" }}>{att.in}</td>
                        <td className="px-4 py-3" style={{ color: "#495057" }}>{att.out}</td>
                        <td className="px-4 py-3">
                          <span className={`badge`} style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "500",
                            backgroundColor: att.status === "Present" ? "#d1e7dd" :
                              att.status === "Late" ? "#fff3cd" :
                                att.status === "Leave" ? "#cff4fc" : "#f8d7da",
                            color: att.status === "Present" ? "#0f5132" :
                              att.status === "Late" ? "#856404" :
                                att.status === "Leave" ? "#055160" : "#842029"
                          }}>
                            {att.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className="btn btn-sm btn-light shadow-sm border"
                            style={{ color: "#1B4F8A", borderRadius: "6px" }}
                            onClick={() => handleViewStaff(att.name)}
                          >
                            <i className="cil-eye"></i> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div className="mb-2">No attendance records found for today.</div>
                      <small>Select a different filter or check back later.</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-0 py-3">
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
  );
}