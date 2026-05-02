import React, { useState, useEffect } from "react";
import { COLORS } from "../../Constant/Themes";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
  CSpinner,
} from "@coreui/react";

import { useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../baseUrl";

const ScrollPicker = ({ items, selected, onChange, label }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{
        height: '120px',
        overflowY: 'auto',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        width: '100%',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
        className="hide-scrollbar"
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {items.map(item => (
          <div
            key={item}
            onClick={() => onChange(item)}
            style={{
              padding: '8px 0',
              textAlign: 'center',
              cursor: 'pointer',
              background: selected === item ? '#1B4F8A' : 'transparent',
              color: selected === item ? '#fff' : '#374151',
              fontWeight: selected === item ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.2s'
            }}
          >
            {item.toString().padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  )
}

const AttendanceTracker = () => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const dateDisplay = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [loginTime, setLoginTime] = useState("");
  const [logoutTime, setLogoutTime] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [showModal, setShowModal] = useState(false);
  const [activity, setActivity] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [address, setAddress] = useState("Fetching...");

  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const location = useLocation();
  const storedData = localStorage.getItem('therapistData');
  const therapistData = location.state || (storedData ? JSON.parse(storedData) : {});
  const therapistId = therapistData?.therapistId;

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }),
          () => resolve({ latitude: "", longitude: "" })
        );
      } else {
        resolve({ latitude: "", longitude: "" });
      }
    });
  };

  const fetchDailyData = async () => {
    try {
      setLoadingDaily(true);
      // const res = await axios.get(`${BASE_URL}/getDaily/${therapistId}/${dateStr}`);
      // const result = res.data;

      // Dummy data
      const result = {
        success: true,
        data: {
          loginTime: "09:00:00",
          logoutTime: "",
          sessions: [
            { sessionId: 1, activity: "Patient Assessment", duration: "1 Hour 30 Minutes", latitude: "12.9716", longitude: "77.5946" },
            { sessionId: 2, activity: "Therapy Session", duration: "45 Minutes", latitude: "12.9716", longitude: "77.5946" }
          ]
        }
      };

      if (result.success && result.data) {
        setData(result.data.sessions || []);
        if (result.data.loginTime) {
          setLoginTime(result.data.loginTime);
          setLoggedIn(true);
        } else {
          setLoginTime("");
          setLoggedIn(false);
        }
        if (result.data.logoutTime) {
          setLogoutTime(result.data.logoutTime);
          setLoggedOut(true);
          setLoggedIn(false);
        } else {
          setLogoutTime("");
          setLoggedOut(false);
        }
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching daily data:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setLoadingMonthly(true);
      const monthStr = dateStr.substring(0, 7);
      // const res = await axios.get(`${BASE_URL}/getMonthly/${therapistId}/${monthStr}`);
      // const result = res.data;

      // Dummy data
      const result = {
        success: true,
        data: [
          { date: "2026-05-01", inTime: "09:00", outTime: "17:00", logTime: "8h", workingHours: "6h", idleTime: "2h" },
          { date: "2026-05-02", inTime: "09:15", outTime: "17:30", logTime: "8h 15m", workingHours: "7h", idleTime: "1h 15m" }
        ]
      };

      if (result.success && result.data) {
        setMonthlyData(result.data || []);
      } else {
        setMonthlyData([]);
      }
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    } finally {
      setLoadingMonthly(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
    fetchMonthlyData();

    navigator.geolocation &&
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            setAddress(res.data.display_name);
          } catch {
            setAddress("Unable to fetch address");
          }
        },
        () => setAddress("Location unavailable")
      );
  }, []);

  const updateTimes = async (type, timeStr) => {
    try {
      setIsUpdatingStatus(true);
      const loc = await getCurrentLocation();
      const payload = {
        completedDate: dateStr,
        loginTime: type === "login" ? timeStr : loginTime || "",
        logoutTime: type === "logout" ? timeStr : logoutTime || "",
        latitude: loc.latitude,
        longitude: loc.longitude,
        location: address
      };

      // await axios.put(`${BASE_URL}/updateAttendance/${therapistId}`, payload);
      console.log('Dummy updateTimes payload:', payload);
      // await fetchDailyData();
      // await fetchMonthlyData();

      // Simulate network delay
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogin = () => {
    if (loggedIn || loggedOut) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setLoggedIn(true);
    setLoginTime(time);
    updateTimes("login", time);
  };

  const handleLogout = () => {
    if (!loggedIn || loggedOut) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setLoggedIn(false);
    setLoggedOut(true);
    setLogoutTime(time);
    updateTimes("logout", time);
  };

  const handleAdd = async () => {
    let newErrors = {};

    if (!activity.trim()) {
      newErrors.activity = "Activity is required";
    }

    if (durationHours === 0 && durationMinutes === 0) {
      newErrors.duration = "Please select a valid duration";
    }

    setErrors(newErrors);

    // stop if errors exist
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      let durationStr = "";
      if (durationHours > 0) durationStr += `${durationHours} Hour${durationHours > 1 ? 's' : ''} `;
      if (durationMinutes > 0) durationStr += `${durationMinutes} Minute${durationMinutes > 1 ? 's' : ''}`;
      durationStr = durationStr.trim();

      const loc = await getCurrentLocation();
      const payload = {
        completedDate: dateStr,
        activity,
        duration: durationStr,
        location: address
      };

      // const res = await axios.put(`${BASE_URL}/updateAttendance/${therapistId}`, payload);
      // const result = res.data;
      console.log('Dummy handleAdd payload:', payload);
      const result = true;

      if (result) {
        // await fetchDailyData();
        // await fetchMonthlyData();
        setData(prev => [...prev, { sessionId: Date.now(), activity, duration: durationStr, latitude: loc.latitude, longitude: loc.longitude }]);

        // reset
        setActivity("");
        setDurationHours(0);
        setDurationMinutes(0);
        setErrors({});
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const isMobile = window.innerWidth <= 576;
  const isTablet = window.innerWidth > 576 && window.innerWidth <= 992;
  const styles = {
    wrap: {
      padding: isMobile ? "1rem" : "1.5rem",
      width: "100%",
      maxWidth: "100%",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: isMobile ? 10 : 0,
      marginBottom: "1.5rem",
      padding: "12px 16px",
      borderRadius: 10,
      color: "#fff",
    },
    h2: { fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.primary },
    subtext: { fontSize: 13, color: "#cbd5e1", marginTop: 2 },
    subtext: { fontSize: 13, color: "#6b7280", marginTop: 2 },

    // Stat cards
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "repeat(2, 1fr)"
        : isTablet
          ? "repeat(2, 1fr)"
          : "repeat(4, 1fr)",
      gap: 10,
      marginBottom: "1.5rem",
    },
    statCard: {
      background: "#ffffff",
      borderRadius: 10,
      padding: "14px 16px",
      borderLeft: "4px solid #1B4F8A", // ✅ highlight
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    statValue: {
      fontSize: 20,
      fontWeight: 600,
      color: "#1B4F8A",
    },
    statLabel: {
      fontSize: 11,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 6,
    },


    // Tabs
    tabs: {
      display: "flex",
      overflowX: isMobile ? "auto" : "visible",
      borderBottom: "0.5px solid #e5e7eb",
      marginBottom: "1rem",
      color: COLORS.primary
    },
    tab: (active) => ({
      padding: "8px 18px",
      fontSize: 16,
      cursor: "pointer",
      color: active ? `${COLORS.primary}` : "#6b7280",
      fontWeight: active ? 500 : 400,
      borderBottom: active ? "2px solid #111827" : "2px solid transparent",
      background: "none",
      border: "none",
      borderBottom: active ? "2px solid #111827" : "2px solid transparent",
      marginBottom: -1,
      cursor: "pointer",
    }),

    // Card / Table
    card: {
      background: "#fff",
      border: "0.5px solid #e5e7eb",
      borderRadius: 12,
      overflow: "hidden",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid #e5e7eb",
    },
    cardTitle: { fontSize: 18, fontWeight: 500 },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: isMobile ? 11 : 13,
    },
    th: {
      padding: "10px 18px",
      textAlign: "left",
      fontWeight: 500,
      fontSize: 11,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      background: "#f9fafb",
      borderBottom: "0.5px solid #e5e7eb",
    },
    td: {
      padding: "12px 18px",
      borderBottom: "0.5px solid #f3f4f6",
      verticalAlign: "middle",
    },

    // Badges
    badgeAmber: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: "#FAEEDA",
      color: "#854F0B",
    },
    badgeGreen: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: "#EAF3DE",
      color: "#3B6D11",
    },
    badgeBlue: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 500,
      background: "#E6F1FB",
      color: "#185FA5",
    },

    // Buttons
    btn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "7px 16px",
      borderRadius: 8,
      border: "0.5px solid #d1d5db",
      background: "#fff",
      color: "#374151",
      fontSize: 13,
      cursor: "pointer",
    },
    btnGreen: {
      background: "#EAF3DE",
      color: "#3B6D11",
      border: "0.5px solid #639922",
      borderRadius: 8,
      padding: "7px 16px",
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },
    btnRed: {
      background: "#FCEBEB",
      color: "#A32D2D",
      border: "0.5px solid #E24B4A",
      borderRadius: 8,
      padding: "7px 16px",
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },
    btnBlue: {
      background: "#E6F1FB",
      color: "#185FA5",
      border: "0.5px solid #378ADD",
      borderRadius: 8,
      padding: "7px 16px",
      fontSize: 13,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    },

    // Modal
    modalBg: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modal: {
      background: "#fff",
      border: "0.5px solid #e5e7eb",
      borderRadius: 12,
      width: 380,
      overflow: "hidden",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid #e5e7eb",
    },
    modalTitle: { fontSize: 15, fontWeight: 500 },
    modalBody: { padding: 18 },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      padding: "14px 18px",
      borderTop: "0.5px solid #e5e7eb",
    },
    field: { marginBottom: 14 },
    fieldLabel: {
      display: "block",
      fontSize: 12,
      color: COLORS.primary,
      marginBottom: 5,
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      border: "0.5px solid #d1d5db",
      borderRadius: 8,
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box",
    },
    infoBox: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 12,
      color: "#6b7280",
      background: "#f9fafb",
      padding: "10px 12px",
      borderRadius: 8,
    },
    dot: (color) => ({
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: color,
      display: "inline-block",
      marginRight: 5,
    }),
    addrCell: {
      fontSize: 11,

      maxWidth: isMobile ? 120 : 180,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  };
  const [errors, setErrors] = useState({
    activity: "",
    duration: "",
  });
  // ─── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (loggedOut)
      return (
        <span style={styles.badgeAmber}>Signed out</span>
      );
    if (loggedIn)
      return <span style={styles.badgeGreen}>Active</span>;
    return <span style={{ fontSize: 14, color: "#9ca3af" }}>—</span>;
  };

  // ─── Action button ─────────────────────────────────────────────────────────
  const ActionButton = () => {
    if (isUpdatingStatus)
      return (
        <button style={{ ...styles.btn, color: "#9ca3af" }} disabled>
          <CSpinner size="sm" style={{ width: '1rem', height: '1rem', marginRight: '6px' }} />
          Updating...
        </button>
      );
    if (loggedOut)
      return (
        <span style={{ fontSize: 12, color: "#9ca3af", padding: "8px 0" }}>
          Session ended
        </span>
      );
    if (loggedIn)
      return (
        <button style={styles.btnRed} onClick={handleLogout}>
          <span style={styles.dot("#E24B4A")} />
          Logout
        </button>
      );
    return (
      <button style={styles.btnGreen} onClick={handleLogin}>
        <span style={styles.dot("#888780")} />
        Login
      </button>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.h2}>Attendance tracker</h2>
          <p style={styles.subtext}>{dateDisplay}</p>
        </div>
        <ActionButton />
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        {[
          { label: "Login", value: loginTime || "—" },
          { label: "Logout", value: logoutTime || "—" },
          { label: "Activities", value: data.length },
          { label: "Status", value: <StatusBadge /> },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["daily", "monthly"].map((t) => (
          <button
            key={t}
            style={styles.tab(activeTab === t)}
            onClick={() => setActiveTab(t)}
          >
            {t === "daily" ? "Daily log" : "Monthly"}
          </button>
        ))}
      </div>

      {/* Daily tab */}
      {activeTab === "daily" && (
        <div style={styles.card} >
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Today's activities</span>
            {!loggedOut && (
              <button
                style={styles.btnBlue}
                onClick={() => setShowModal(true)}
              >
                + Add activity
              </button>
            )}
          </div>
          <div style={{ overflowX: isMobile ? "auto" : "visible" }}>
            {loadingDaily ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <CSpinner color="primary" />
              </div>
            ) : (
              <table style={styles.table}    >
                <thead>
                  <tr>
                    {["#", "Activity", "Duration", "Location", "Date"].map((h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => (
                    <tr key={item.sessionId || i}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{item.activity}</td>
                      <td style={styles.td}>
                        <span style={styles.badgeAmber}>{item.duration}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.addrCell}>
                          {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : address}
                        </div>
                      </td>
                      <td style={styles.td}>{dateStr}</td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                        No activities logged today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Monthly tab */}
      {activeTab === "monthly" && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Monthly summary</span>
          </div>
          <div style={{ overflowX: isMobile ? "auto" : "visible" }}>
            {loadingMonthly ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <CSpinner color="primary" />
              </div>
            ) : (
              <table style={styles.table}  >
                <thead>
                  <tr>
                    {["Date", "Login", "Logout", "Total", "Working", "Idle"].map(
                      (h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((item, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{item.date}</td>
                      <td style={styles.td}>{item.inTime}</td>
                      <td style={styles.td}>{item.outTime}</td>
                      <td style={styles.td}>{item.logTime}</td>
                      <td style={styles.td}>
                        <span style={styles.badgeGreen}>{item.workingHours}</span>
                      </td>
                      <td style={styles.td}>{item.idleTime}</td>
                    </tr>
                  ))}
                  {monthlyData.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                        No records found for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          alignment="center" backdrop="static"
        >
          <CModalHeader>
            <CModalTitle>Add Activity</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {/* Activity */}
            <div style={{ marginBottom: 12 }}>
              <CFormLabel>Activity Name</CFormLabel>
              <CFormInput
                placeholder="Enter Activity Name"
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);
                  setErrors({ ...errors, activity: "" });
                }}
                invalid={!!errors.activity}
              />
              {errors.activity && (
                <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.activity}
                </div>
              )}
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 12 }}>
              <CFormLabel>Duration</CFormLabel>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <ScrollPicker
                  items={Array.from({ length: 13 }, (_, i) => i)}
                  selected={durationHours}
                  onChange={(val) => { setDurationHours(val); setErrors({ ...errors, duration: "" }); }}
                  label="Hours"
                />
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#6b7280', marginTop: 15 }}>:</div>
                <ScrollPicker
                  items={Array.from({ length: 60 }, (_, i) => i)}
                  selected={durationMinutes}
                  onChange={(val) => { setDurationMinutes(val); setErrors({ ...errors, duration: "" }); }}
                  label="Minutes"
                />
              </div>
              {errors.duration && (
                <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {errors.duration}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div
              style={{
                background: "#f9fafb",
                padding: 10,
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <div className="mb-4">
                <strong>Date:</strong> {dateStr}
              </div>
              <div>
                <strong>Location:</strong> {address}
              </div>
            </div>
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? <CSpinner size="sm" /> : "Save"}
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  );
};

export default AttendanceTracker;