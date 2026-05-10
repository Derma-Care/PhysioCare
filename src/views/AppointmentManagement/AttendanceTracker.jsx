import React, { useState, useEffect } from "react";
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
import {
  User, Phone, Stethoscope, Activity,
  CheckCircle2, Clock, CalendarDays, ArrowRight,
  ClipboardList, Users, Zap, LogIn, LogOut, ShieldCheck, MapPin, ChevronRight, ListChecks, Eye
} from 'lucide-react';
import { COLORS } from "../../Constant/Themes";


import { useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../baseUrl";
import ConfirmModal from "../../components/ConfirmLogoutModal";
import { showCustomToast } from "../../Utils/Toaster";

const ScrollPicker = ({ items, selected, onChange, label }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px' }}>
      <div style={{ fontSize: 12, color: COLORS.primary, opacity: 0.7, marginBottom: 6 }}>{label}</div>
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
  const [loginLocation, setLoginLocation] = useState("");
  const [logoutLocation, setLogoutLocation] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [showModal, setShowModal] = useState(false);
  const [activity, setActivity] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [address, setAddress] = useState("Fetching...");
  const [coords, setCoords] = useState({ latitude: "", longitude: "" });

  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const location = useLocation();
  const storedData = localStorage.getItem('therapistData');
  const therapistData = location.state || (storedData ? JSON.parse(storedData) : {});

  // Get data from localStorage as per requirements
  const userId = localStorage.getItem('staffId') || therapistData?.therapistId || "0001";
  const clinicId = localStorage.getItem('HospitalId') || therapistData?.clinicId || "C001";
  const branchId = localStorage.getItem('branchId') || therapistData?.branchId || "B001";
  const role = localStorage.getItem('role') || "THERAPIST";

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      const res = await axios.get(`${BASE_URL}/getUserDailyAttendence/${userId}/${dateStr}`);
      const result = res.data;
      if (result.success && result.data) {
        setData(result.data.activities || []);
        if (result.data.login?.time) {
          setLoginTime(result.data.login.time);
          setLoginLocation(result.data.login.location || "");
          setLoggedIn(result.data.status === "LOGGED_IN");
        } else {
          setLoginTime("");
          setLoginLocation("");
          setLoggedIn(false);
        }
        if (result.data.logout?.time) {
          setLogoutTime(result.data.logout.time);
          setLogoutLocation(result.data.logout.location || "");
          setLoggedOut(true);
          setLoggedIn(false);
        } else {
          setLogoutTime("");
          setLogoutLocation("");
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

  const fetchDailyDetails = async (date) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      setDetailsData(null);
      const res = await axios.get(`${BASE_URL}/getUserDailyAttendence/${userId}/${date}`);
      if (res.data.success) {
        setDetailsData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching daily details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setLoadingMonthly(true);
      const monthStr = dateStr.substring(0, 7);
      const res = await axios.get(`${BASE_URL}/getUserMonthlyAttendence/${userId}/${monthStr}`);
      const result = res.data;
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
          const lat = pos.coords.latitude.toString();
          const lon = pos.coords.longitude.toString();
          setCoords({ latitude: lat, longitude: lon });
          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            setAddress(res.data.display_name);
          } catch {
            setAddress("Unable to fetch address");
          }
        },
        () => setAddress("Location unavailable")
      );
  }, []);

  const handleLogin = async () => {
    if (loggedIn || loggedOut) return;
    try {
      setIsUpdatingStatus(true);
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

      // ✅ Always get fresh location at login time (avoids using stale "Fetching..." state)
      let loginAddr = address;
      let loginCoords = coords;
      if (!loginCoords.latitude || loginAddr === "Fetching...") {
        loginCoords = await getCurrentLocation();
        if (loginCoords.latitude) {
          setCoords(loginCoords);
          try {
            const geoRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${loginCoords.latitude}&lon=${loginCoords.longitude}&format=json`
            );
            loginAddr = geoRes.data.display_name;
            setAddress(loginAddr);
          } catch {
            loginAddr = "Location available (address lookup failed)";
            setAddress(loginAddr);
          }
        } else {
          loginAddr = "Location unavailable";
          setAddress(loginAddr);
        }
      }

      const payload = {
        userId,
        date: dateStr,
        loginTime: time,
        loginLocation: loginAddr,
        loginLatitude: loginCoords.latitude,
        loginLongtitude: loginCoords.longitude
      };

      const res = await axios.put(`${BASE_URL}/updateUserAttendence`, payload);
      if (res.data.success) {
        setLoggedIn(true);
        setLoginTime(time);
        setLoginLocation(loginAddr);
        showCustomToast("Logged in successfully", "success");
        await fetchDailyData();
        await fetchMonthlyData();
      } else {
        showCustomToast(res.data.message || "Login failed", "error");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      showCustomToast("Failed to connect to server", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    if (!loggedIn || loggedOut) return;
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      setIsUpdatingStatus(true);
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

      const payload = {
        userId,
        date: dateStr,
        logoutTime: time,
        logoutLocation: address,
        logoutLatitude: coords.latitude,
        logoutLongtitude: coords.longitude
      };

      const res = await axios.put(`${BASE_URL}/updateUserAttendence`, payload);
      if (res.data.success) {
        setLoggedIn(false);
        setLoggedOut(true);
        setLogoutTime(time);
        setLogoutLocation(address);
        setIsLogoutModalVisible(false);
        showCustomToast("Logged out successfully", "success");
        await fetchDailyData();
        await fetchMonthlyData();
      } else {
        showCustomToast(res.data.message || "Logout failed", "error");
      }
    } catch (err) {
      console.error("Error logging out:", err);
      showCustomToast("Failed to connect to server", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
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
      const durationStr = `${durationHours}h ${durationMinutes}m`;

      const payload = {
        userId,
        role,
        clinicId,
        branchId,
        date: dateStr,
        activities: [
          {
            activity,
            duration: durationStr,
            location: address,
            latitude: coords.latitude,
            longtitude: coords.longitude
          }
        ]
      };

      const res = await axios.post(`${BASE_URL}/saveUserAttendence`, payload);
      if (res.data.success) {
        showCustomToast("Activity added successfully", "success");
        await fetchDailyData();
        await fetchMonthlyData();

        // reset
        setActivity("");
        setDurationHours(0);
        setDurationMinutes(0);
        setErrors({});
        setShowModal(false);
      } else {
        showCustomToast(res.data.message || "Failed to add activity", "error");
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
      showCustomToast("Failed to connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const isMobile = window.innerWidth <= 576;
  const isTablet = window.innerWidth > 576 && window.innerWidth <= 992;
  const styles = {
    wrap: {
      padding: isMobile ? "0.75rem" : "1rem",
      width: "100%",
      maxWidth: "100%",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: "1rem",
      padding: "0 4px",
    },
    h2: { fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.primary },
    subtext: { fontSize: 13, color: COLORS.primary, opacity: 0.8, marginTop: 2, margin: 0 },

    // Stat cards
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(160px, 1fr))",
      gap: isMobile ? 12 : 16,
      marginBottom: "1.5rem",
    },
    statCard: {
      background: "#ffffff",
      borderRadius: 12,
      padding: isMobile ? "1rem" : "1.25rem",
      borderLeft: `4px solid ${COLORS.primary}`,
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: isMobile ? 90 : 100,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 600,
      color: COLORS.primary,
    },
    statLabel: {
      fontSize: 11,
      color: COLORS.primary,
      opacity: 0.7,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 6,
    },


    // Tabs
    tabs: {
      display: "flex",
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "1.25rem",
      gap: isMobile ? 0 : "1rem",
    },
    tab: (active) => ({
      flex: isMobile ? 1 : "initial",
      textAlign: "center",
      padding: isMobile ? "12px 0" : "10px 24px",
      fontSize: isMobile ? 14 : 15,
      cursor: "pointer",
      color: active ? COLORS.primary : COLORS.primary,
      opacity: active ? 1 : 0.6,
      fontWeight: active ? 600 : 500,
      borderBottom: active ? `3px solid ${COLORS.primary}` : "3px solid transparent",
      background: "none",
      border: "none",
      transition: "all 0.2s",
      marginBottom: -1,
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
    cardTitle: { fontSize: 18, fontWeight: 500, color: COLORS.primary },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: isMobile ? 11 : 13,
      color: COLORS.primary,
    },
    th: {
      padding: "10px 18px",
      textAlign: "left",
      fontWeight: 500,
      fontSize: 11,
      color: COLORS.primary,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      background: "#f9fafb",
      borderBottom: "0.5px solid #e5e7eb",
    },
    td: {
      padding: "12px 18px",
      borderBottom: "0.5px solid #f3f4f6",
      verticalAlign: "middle",
      color: COLORS.primary,
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
      width: "95%",
      maxWidth: 380,
      overflow: "hidden",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "0.5px solid #e5e7eb",
    },
    modalTitle: { fontSize: 15, fontWeight: 500, color: COLORS.primary },
    modalBody: { padding: 18, color: COLORS.primary },
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
      color: COLORS.primary,
    },
    infoBox: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      fontSize: 12,
      color: COLORS.primary,
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
      color: COLORS.primary,
      maxWidth: isMobile ? 120 : 180,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    // Mobile specific
    mobileCard: {
      background: "#fff",
      borderRadius: 12,
      padding: "1rem",
      marginBottom: "0.85rem",
      border: "0.5px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    },
    mobileCardRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    mobileLabel: {
      fontSize: 11,
      textTransform: "uppercase",
      color: COLORS.primary,
      opacity: 0.6,
      fontWeight: 600,
      letterSpacing: "0.03em",
    },
    mobileValue: {
      fontSize: 13,
      color: COLORS.primary,
      fontWeight: 500,
    }
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
    // ✅ While fetching daily status, show skeleton so we don't flash wrong button
    if (loadingDaily)
      return (
        <div className="at-skel" style={{ width: 90, height: 34, borderRadius: 8 }} />
      );
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
          <h2 style={styles.h2}>Daily Duty Log</h2>
          <p style={styles.subtext}>{dateDisplay}</p>
        </div>
        <ActionButton />
      </div>

      <ConfirmModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout and end your session for today?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
      />

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        {[
          {
            label: "Login",
            icon: <LogIn size={14} />,
            value: loadingDaily ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div className="at-skel" style={{ height: 18, width: '70%', borderRadius: 4 }} />
                <div className="at-skel" style={{ height: 10, width: '90%', borderRadius: 4 }} />
              </div>
            ) : (
              <div>
                <div>{loginTime || "—"}</div>
                {loginTime && (
                  <div style={{ fontSize: 10, color: COLORS.primary, fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center' }}>
                    <MapPin size={10} style={{ marginRight: 4 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', color: COLORS.primary }}>
                      {loginLocation || "Location not recorded"}
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: "Logout",
            icon: <LogOut size={14} />,
            value: loadingDaily ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div className="at-skel" style={{ height: 18, width: '70%', borderRadius: 4 }} />
                <div className="at-skel" style={{ height: 10, width: '90%', borderRadius: 4 }} />
              </div>
            ) : (
              <div>
                <div>{logoutTime || "—"}</div>
                {logoutTime && (
                  <div style={{ fontSize: 10, color: COLORS.primary, fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center' }}>
                    <MapPin size={10} style={{ marginRight: 4, color: COLORS.primary }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', color: COLORS.primary }}>
                      {logoutLocation || "Location not recorded"}
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: "Activities",
            icon: <Activity size={14} />,
            value: loadingDaily
              ? <div className="at-skel" style={{ height: 22, width: 36, borderRadius: 4, marginTop: 4 }} />
              : data.length,
          },
          {
            label: "Status",
            icon: <ShieldCheck size={14} />,
            value: loadingDaily
              ? <div className="at-skel" style={{ height: 22, width: 70, borderRadius: 20, marginTop: 4 }} />
              : <StatusBadge />,
          },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={{ color: COLORS.primary, opacity: 0.6 }}>{s.icon}</div>
            </div>
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
          <div style={{ padding: isMobile ? "0 4px" : 0 }}>
           {loadingDaily ? (
              <div style={{ padding: isMobile ? '1rem' : '0' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: isMobile ? '12px 0' : '14px 18px',
                    borderBottom: '0.5px solid #f3f4f6', alignItems: 'center'
                  }}>
                    <div className="at-skel" style={{ width: 20, height: 14, borderRadius: 4, flexShrink: 0 }} />
                    <div className="at-skel" style={{ flex: 2, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 22, borderRadius: 20 }} />
                    <div className="at-skel" style={{ flex: 2, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ width: 70, height: 14, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : isMobile ? (
              /* Mobile Daily View */
              <div style={{ padding: "1rem" }}>
                {data.map((item, i) => (
                  <div key={item.sessionId || i} style={styles.mobileCard}>
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>Activity</span>
                      <span style={{ ...styles.mobileValue, fontWeight: 700, color: COLORS.primary }}>{item.activity}</span>
                    </div>
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>Duration</span>
                      <span style={styles.badgeAmber}>{item.duration}</span>
                    </div>
                    <div style={{ ...styles.mobileCardRow, marginBottom: 0, paddingTop: 8, borderTop: "0.5px solid #f3f4f6" }}>
                      <span style={styles.mobileLabel}><MapPin size={11} style={{ marginRight: 4 }} /> Location</span>
                      <span style={{ ...styles.mobileValue, fontSize: 11, maxWidth: "60%", textAlign: "right" }}>{item.location}</span>
                    </div>
                  </div>
                ))}
                {data.length === 0 && (
                  <div style={{ textAlign: "center", padding: "2rem", color: COLORS.primary, opacity: 0.6 }}>
                    <ListChecks size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>No activities logged today.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Daily View */
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["#", "Activity", "Duration", "Location", "Date"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
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
                          <div style={styles.addrCell}>{item.location}</div>
                        </td>
                        <td style={styles.td}>{dateStr}</td>
                      </tr>
                    ))}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: COLORS.primary, opacity: 0.6, padding: "20px" }}>
                          No activities logged today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
          <div style={{ padding: isMobile ? "0 4px" : 0 }}>
            {loadingMonthly ? (
              <div style={{ padding: isMobile ? '1rem' : '0' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: isMobile ? '12px 0' : '14px 18px',
                    borderBottom: '0.5px solid #f3f4f6', alignItems: 'center'
                  }}>
                    <div className="at-skel" style={{ flex: 1.2, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ flex: 1, height: 22, borderRadius: 20 }} />
                    <div className="at-skel" style={{ flex: 0.8, height: 14, borderRadius: 4 }} />
                    <div className="at-skel" style={{ width: 56, height: 26, borderRadius: 7 }} />
                  </div>
                ))}
              </div>
            ) : isMobile ? (
              /* Mobile Monthly View */
              <div style={{ padding: "1rem" }}>
                {monthlyData.map((item, i) => (
                  <div key={i} style={styles.mobileCard}>
                    <div style={{ ...styles.mobileCardRow, borderBottom: "1px solid #f3f4f6", pb: 8, mb: 10 }}>
                      <span style={{ ...styles.mobileValue, fontWeight: 700 }}>{item.date}</span>
                      <button
                        style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer' }}
                        onClick={() => fetchDailyDetails(item.date)}
                      >
                        <Eye size={16} color={COLORS.primary} />
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                      <div>
                        <div style={styles.mobileLabel}>Login</div>
                        <div style={styles.mobileValue}>{item.inTime || "—"}</div>
                      </div>
                      <div>
                        <div style={styles.mobileLabel}>Logout</div>
                        <div style={styles.mobileValue}>{item.outTime || "—"}</div>
                      </div>
                      <div>
                        <div style={styles.mobileLabel}>Working</div>
                        <span style={styles.badgeGreen}>{item.workingHours || "—"}</span>
                      </div>
                      <div>
                        <div style={styles.mobileLabel}>Total Log</div>
                        <div style={styles.mobileValue}>{item.logTime || "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {monthlyData.length === 0 && (
                  <div style={{ textAlign: "center", padding: "2rem", color: COLORS.primary, opacity: 0.6 }}>
                    <CalendarDays size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ fontSize: 13 }}>No records found for this month.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Monthly View */
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Date", "Login", "Logout", "Total", "Working", "Idle", "Action"].map((h) => (
                        // {["Date", "Login", "Logout", "Total", "Working", "Idle"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
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
                        <td style={styles.td}>
                          <button
                            style={{ ...styles.btnBlue, padding: '4px 8px' }}
                            onClick={() => fetchDailyDetails(item.date)}
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {monthlyData.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ ...styles.td, textAlign: "center", color: COLORS.primary, opacity: 0.6, padding: "20px" }}>
                          No records found for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                <div style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginTop: 15 }}>:</div>
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
                color: COLORS.primary
              }}
            >
              <div className="mb-4">
                <strong style={{ color: COLORS.primary }}>Date:</strong> {dateStr}
              </div>
              <div style={{ color: COLORS.primary }}>
                <strong style={{ color: COLORS.primary }}>Location:</strong> {address}
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

      {/* Daily Details Modal */}
      <CModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        alignment="center"
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Daily Report - {detailsData?.date}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingDetails ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <CSpinner color="primary" />
            </div>
          ) : detailsData ? (
            <div style={{ color: COLORS.primary }}>
              <div style={{ display: 'grid', gridTemplateColumns: (detailsData.login || detailsData.logout) && !isMobile ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {detailsData.login && (
                  <div style={styles.infoBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.primary, marginBottom: 4 }}>
                      <LogIn size={14} />
                      <strong style={{ fontSize: 13, color: COLORS.primary }}>Login Details</strong>
                    </div>
                    <div style={{ marginBottom: 4, color: COLORS.primary }}>
                      <Clock size={12} style={{ marginRight: 6, display: 'inline', color: COLORS.primary }} />
                      <span style={{ fontWeight: 600, color: COLORS.primary }}>{detailsData.login.time || '—'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.primary, display: 'flex', alignItems: 'flex-start' }}>
                      <MapPin size={12} style={{ marginRight: 6, marginTop: 2, flexShrink: 0, color: COLORS.primary }} />
                      <span style={{ color: COLORS.primary }}>{detailsData.login.location || 'Location not recorded'}</span>
                    </div>
                  </div>
                )}

                {detailsData.logout && (
                  <div style={styles.infoBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.primary, marginBottom: 4 }}>
                      <LogOut size={14} />
                      <strong style={{ fontSize: 13, color: COLORS.primary }}>Logout Details</strong>
                    </div>
                    <div style={{ marginBottom: 4, color: COLORS.primary }}>
                      <Clock size={12} style={{ marginRight: 6, display: 'inline', color: COLORS.primary }} />
                      <span style={{ fontWeight: 600, color: COLORS.primary }}>{detailsData.logout.time || '—'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.primary, display: 'flex', alignItems: 'flex-start' }}>
                      <MapPin size={12} style={{ marginRight: 6, marginTop: 2, flexShrink: 0, color: COLORS.primary }} />
                      <span style={{ color: COLORS.primary }}>{detailsData.logout.location || 'Location not recorded'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem', fontWeight: 600, fontSize: 14, color: COLORS.primary, borderBottom: `2px solid ${COLORS.primary}`, paddingBottom: 4, display: 'inline-block' }}>
                Activity Log
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["#", "Activity", "Duration", "Location"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.activities && detailsData.activities.length > 0 ? (
                      detailsData.activities.map((session, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: COLORS.primary }}>{session.activity}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badgeAmber}>{session.duration}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ ...styles.addrCell, maxWidth: '250px' }}>{session.location}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ ...styles.td, textAlign: "center", color: COLORS.primary, opacity: 0.6, padding: "20px" }}>
                          No sessions found for this day.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: COLORS.primary, opacity: 0.6 }}>
              Failed to load data.
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Skeleton shimmer styles */}
      <style>{`
        @keyframes at-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .at-skel {
          background: linear-gradient(90deg, #f0f4f8 25%, #e2eaf2 50%, #f0f4f8 75%);
          background-size: 800px 100%;
          animation: at-shimmer 1.4s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default AttendanceTracker;