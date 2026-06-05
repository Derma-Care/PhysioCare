import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Pagination from "../../../Utils/Pagination";
import { useGlobalSearch } from "../../Usecontext/GlobalSearchContext";
import { Search, X, Calendar, Clock, Users, CheckCircle2, UserCheck, Filter } from "lucide-react";
import { http } from "../../../Utils/Interceptors";
import { BASE_URL, GetAllUsersDailyByClinicAndBranch, SaveUserAttendence, UpdateUserAttendence } from "../../../baseUrl";
import capitalizeWords from "../../../Utils/capitalizeWords";
import { showCustomToast } from "../../../Utils/Toaster";

const styles = `
  .ar-wrapper {
    padding: 24px;
 
  }

  .ar-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .ar-title-block h4 {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px 0;
    letter-spacing: -0.3px;
  }

  .ar-title-block p {
    font-size: 13px;
    color: #6B7280;
    margin: 0;
  }

  .ar-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .ar-date-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .ar-date-input-wrap svg {
    position: absolute;
    left: 10px;
    color: #9CA3AF;
    pointer-events: none;
    z-index: 1;
  }

  .ar-date-input {
    padding: 0 12px 0 32px;
    height: 38px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    font-size: 13.5px;
    color: #374151;
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
    width: 155px;
    cursor: pointer;
  }

  .ar-date-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .ar-select {
    padding: 0 12px;
    height: 38px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    font-size: 13.5px;
    color: #374151;
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
    min-width: 150px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }

  .ar-select:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .ar-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .ar-search-wrap svg.search-icon {
    position: absolute;
    left: 10px;
    color: #9CA3AF;
    pointer-events: none;
  }

  .ar-search-input {
    padding: 0 32px 0 32px;
    height: 38px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    font-size: 13.5px;
    color: #374151;
    background: #fff;
    outline: none;
    transition: border-color 0.15s;
    width: 220px;
  }

  .ar-search-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }

  .ar-search-clear {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .ar-search-clear:hover {
    color: #374151;
  }

  .ar-card {
    background: #fff;
    border: 1.5px solid #F3F4F6;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }

  .ar-table-scroll {
    overflow-x: auto;
  }

  .ar-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
  }

  .ar-table thead tr {
    background: #F8FAFC;
    border-bottom: 1.5px solid #E5E7EB;
  }

  .ar-table thead th {
    padding: 13px 20px;
    font-size: 11.5px;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    white-space: nowrap;
    background-color: var(--color-bgcolor);
  }

  .ar-table tbody tr {
    border-bottom: 1px solid #F3F4F6;
    transition: background 0.12s;
  }

  .ar-table tbody tr:last-child {
    border-bottom: none;
  }

  .ar-table tbody tr:hover {
    background: #F8FAFC;
  }

  .ar-table td {
    padding: 14px 20px;
    font-size: 14px;
    color: #374151;
    vertical-align: middle;
  }

  .ar-sno {
    color: #9CA3AF;
    font-size: 13px;
    font-weight: 500;
  }

  .ar-name {
    font-weight: 600;
    color: #111827;
    font-size: 14px;
  }

  .ar-role {
    color: #6B7280;
    font-size: 13px;
  }

  .ar-time {
    font-size: 13.5px;
    color: #374151;
    font-variant-numeric: tabular-nums;
    font-weight: 500;
  }

  .ar-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 13px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .ar-btn-login {
    background: #EFF6FF;
    color: #2563EB;
    border-color: #BFDBFE;
  }

  .ar-btn-login:hover {
    background: #DBEAFE;
    border-color: #93C5FD;
  }

  .ar-btn-logout {
    background: #FFF7ED;
    color: #D97706;
    border-color: #FDE68A;
  }

  .ar-btn-logout:hover {
    background: #FEF3C7;
    border-color: #FCD34D;
  }

  .ar-btn-view {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    background: #F3F4F6;
    color: #374151;
    border: 1.5px solid #E5E7EB;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .ar-btn-view:hover {
    background: #E5E7EB;
    color: #111827;
  }

  .ar-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .ar-badge-present {
    background: #DCFCE7;
    color: #166534;
  }

  .ar-badge-inwork {
    background: #DBEAFE;
    color: #1D4ED8;
  }

  .ar-badge-late {
    background: #FEF9C3;
    color: #854D0E;
  }

  .ar-badge-leave {
    background: #E0F2FE;
    color: #075985;
  }

  .ar-badge-absent {
    background: #FEE2E2;
    color: #991B1B;
  }

  .ar-empty {
    text-align: center;
    padding: 60px 24px;
    color: #9CA3AF;
  }

  .ar-empty-icon {
    width: 48px;
    height: 48px;
    background: #F3F4F6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }

  .ar-empty p {
    font-size: 14px;
    margin: 0;
    color: #6B7280;
  }

  .ar-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #E5E7EB;
    border-top-color: #2563EB;
    border-radius: 50%;
    animation: ar-spin 0.7s linear infinite;
    margin: 0 auto 10px;
  }

  @keyframes ar-spin {
    to { transform: rotate(360deg); }
  }

  .ar-footer {
    padding: 12px 16px;
    border-top: 1px solid #F3F4F6;
    background: #FAFAFA;
  }.tm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.tm-modal {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.tm-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.tm-body {
  margin-top: 20px;
}

.tm-time-input {
  width: 100%;
  height: 42px;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 15px;
}

.tm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.tm-cancel {
  border: none;
  background: #E5E7EB;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.tm-save {
  border: none;
  background: #2563EB;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}.tm-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
`;

function getStatusBadge(status) {
  if (status === "LOGGED_OUT" || status === "Present") {
    return <span className="ar-badge ar-badge-present">Present</span>;
  } else if (status === "LOGGED_IN") {
    return <span className="ar-badge ar-badge-inwork">In Work</span>;
  } else if (status === "Late") {
    return <span className="ar-badge ar-badge-late">Late</span>;
  } else if (status === "Leave") {
    return <span className="ar-badge ar-badge-leave">Leave</span>;
  } else {
    return <span className="ar-badge ar-badge-absent">{status || "Absent"}</span>;
  }
}

export default function AttendanceReport() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [searchQuery, setSearchQuery] = useState("");

  // Filters for Main Page
  const [filterRole, setFilterRole] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeModal, setTimeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceType, setAttendanceType] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [saveLoading, setSaveLoading] = useState(false);
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const hospitalId = localStorage.getItem("HospitalId");
      const branchId = localStorage.getItem("branchId");
      const res = await http.get(`${BASE_URL}/${GetAllUsersDailyByClinicAndBranch}/${hospitalId}/${branchId}/${selectedDate}`);
      if (res.status === 200 && res.data && res.data.success) {
        setAttendanceData(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchQuery]);

  const openTimeModal = (userId, type) => {
    const now = new Date();

    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    setSelectedUser(userId);
    setAttendanceType(type);
    setSelectedTime(currentTime);
    setTimeModal(true);
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error)
      );
    });
  };

  const handleManualLogin = async (userId, manualTime) => {

    try {

      setSaveLoading(true);

      const location = await getCurrentLocation();

      const payload = {
        date: selectedDate,
        clinicId: localStorage.getItem("HospitalId"),
        branchId: localStorage.getItem("branchId"),
        login: {
          // time: manualTime,
          // latitude: "17.433307", //TODO:
          // longitude: "78.408188"

          latitude: String(location.latitude),
          longitude: String(location.longitude)
        },
        // latitude: String(location.latitude),
        // longitude: String(location.longitude),
        // time: manualTime,
        userId: userId
      };

      const res = await http.post(
        `${BASE_URL}/${SaveUserAttendence}`,
        payload
      );

      if (res.status === 200 || res.status === 201) {
        setTimeModal(false);
        showCustomToast(res.data.message || "Logged in successfully", "success");
        fetchAttendance();
      }

    } catch (error) {
      console.error("Error manual login:", error);
      showCustomToast("Something went wrong", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleManualLogout = async (userId, manualTime) => {

    try {

      setSaveLoading(true);

      const location = await getCurrentLocation();

      const payload = {
        date: selectedDate,
        logoutLatitude: String(location.latitude),
        logoutLongtitude: String(location.longitude),
        logoutTime: manualTime,
        userId: userId
      };

      const res = await http.put(
        `${BASE_URL}/${UpdateUserAttendence}`,
        payload
      );

      if (res.status === 200) {
        setTimeModal(false);
        fetchAttendance();
      }

    } catch (error) {
      console.error("Error manual logout:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const allFilteredAttendance = attendanceData.filter((att) => {
    if (filterRole !== "all" && att.role?.toLowerCase() !== filterRole.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = att.name?.toLowerCase().includes(q);
      const matchesRole = att.role?.toLowerCase().includes(q);
      // const matchesStatus = att.status?.toLowerCase().includes(q);
      // const matchesUserId = att.userId?.toLowerCase().includes(q);
      if (!matchesName && !matchesRole) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(allFilteredAttendance.length / pageSize);
  const todaysAttendance = allFilteredAttendance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewStaff = (userId, role, name) => {
    console.log(userId, role, name);
    navigate(`/attendance/staff/${userId}`, { state: { role, name, userId } });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ar-wrapper">
        {/* Header */}
        <div className="ar-header">
          <div className="ar-title-block">
            <h4>Daily Attendance</h4>
            <p>Showing records for {selectedDate}</p>
          </div>
          <div className="ar-controls">
            {/* Date Picker */}
            <div className="ar-date-input-wrap">
              <Calendar size={14} />
              <input
                type="date"
                className="ar-date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              className="ar-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              {[...new Set(attendanceData.map(a => a.role?.trim()).filter(Boolean))].map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Search */}
            <div className="ar-search-wrap">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="ar-search-input"
                placeholder="Search attendance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="ar-search-clear" onClick={() => setSearchQuery("")}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="ar-card">
          <div className="ar-table-scroll">
            <table className="ar-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {todaysAttendance.length > 0 ? (
                  todaysAttendance.map((att, idx) => (
                    <tr key={idx}>
                      <td className="ar-sno">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="ar-name">{att.name}</td>
                      <td className="ar-role">{capitalizeWords(att.role) || "—"}</td>
                      <td>
                        {att.login?.time ? (
                          <span className="ar-time">{att.login.time}</span>
                        ) : selectedDate <= today ? (
                          <button
                            className="ar-action-btn ar-btn-login"
                            onClick={() => openTimeModal(att.userId, "login")}
                          >
                            <CheckCircle2 size={13} /> Login
                          </button>
                        ) : (
                          <span style={{ color: "#D1D5DB" }}>—</span>
                        )}
                      </td>
                      <td>
                        {att.logout?.time ? (
                          <span className="ar-time">{att.logout.time}</span>
                        ) : selectedDate <= today && att.login?.time ? (
                          <button
                            className="ar-action-btn ar-btn-logout"
                            onClick={() => openTimeModal(att.userId, "logout")}
                          >
                            <Clock size={13} /> Logout
                          </button>
                        ) : (
                          <span style={{ color: "#D1D5DB" }}>—</span>
                        )}
                      </td>
                      <td>{getStatusBadge(att.status)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="ar-btn-view"
                          onClick={() => handleViewStaff(att.userId, att.role, att.name)}
                        >
                          <Calendar size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="ar-empty">
                        {loading ? (
                          <>
                            <div className="ar-spinner" />
                            <p>Loading attendance records...</p>
                          </>
                        ) : (
                          <>
                            <div className="ar-empty-icon">
                              <Users size={22} color="#9CA3AF" />
                            </div>
                            <p>No attendance records found for {selectedDate}</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="ar-footer">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>

          {timeModal && (
            <div className="tm-overlay">
              <div className="tm-modal">

                <div className="tm-header">
                  <h4>
                    Select {attendanceType === "login"
                      ? "Login"
                      : "Logout"} Time
                  </h4>
                </div>

                <div className="tm-body">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) =>
                      setSelectedTime(e.target.value)
                    }
                    className="tm-time-input"
                  />
                </div>

                <div className="tm-footer">
                  <button
                    className="tm-cancel"
                    onClick={() => setTimeModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="tm-save"
                    disabled={saveLoading}
                    onClick={() => {

                      if (saveLoading) return;

                      if (attendanceType === "login") {
                        handleManualLogin(
                          selectedUser,
                          selectedTime
                        );
                      } else {
                        handleManualLogout(
                          selectedUser,
                          selectedTime
                        );
                      }
                    }}
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}