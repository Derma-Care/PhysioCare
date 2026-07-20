import React, { useEffect, useMemo, useState } from "react"
import {
  CCard, CCardBody, CRow, CCol,
  CButton, CFormInput,
  CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell
} from "@coreui/react"
import RevenueCards from "./RevenueCards"
import { useLocation, useNavigate } from "react-router-dom"
import { IndianRupee, Search, X, LayoutGrid, Table2 } from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LabelList
} from "recharts"
import Pagination from "../../Utils/Pagination"
import useAutoHideSidebar from "../widgets/useAutoHideSidebar"
import { wifiUrl } from "../../baseUrl"
import { http } from "../../Utils/Interceptors"
import LoadingIndicator from "../../Utils/loader"
import { useHospital } from '../Usecontext/HospitalContext'




const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: "#fff", border: "1px solid #d0dce9", borderRadius: 8,
      padding: "8px 12px", boxShadow: "0 6px 18px rgba(0,0,0,.08)", fontSize: 12
    }}>
      <div style={{ fontWeight: 700, color: "#0c447c", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, fontWeight: 600 }}>
          {p.name}: ₹{p.value}
        </div>
      ))}
    </div>
  )
}

const DONUT_COLORS = { Paid: "#16a34a", Due: "#dc2626" }

const RevenueTable = () => {
  useAutoHideSidebar()
  const location = useLocation();
  const { branchId: stateBranchId, clinicId, branchName: stateBranchName } =
    location.state || {};
  const { globalBranchId, globalBranchName } = useHospital() || {}
  // Prefer the live global context; fall back to navigation state
  const branchId = globalBranchId || stateBranchId
  const branchName = globalBranchName || stateBranchName
  const [filter, setFilter] = useState("month")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [search, setSearch] = useState("")
  const [view, setView] = useState("charts") // 'charts' | 'table'
  const navigate = useNavigate()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renTotals, setRenTotals] = useState({});
  const [totals, setTotals] = useState({
    consultationTotal: 0,
    therapyFeeTotal: 0,
    totalFinalAmount: 0,
    dueAmountTotal: 0,
    grandTotal: 0,
  });


  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filterData = () => {
    const today = new Date()
    let list = data.filter((row) => {
      const rowDate = new Date(row.date)
      if (filter === "today") return rowDate.toDateString() === today.toDateString()
      if (filter === "week") {
        const firstDay = new Date(today)
        firstDay.setDate(today.getDate() - today.getDay())
        const lastDay = new Date(firstDay)
        lastDay.setDate(firstDay.getDate() + 6)
        return rowDate >= firstDay && rowDate <= lastDay
      }
      if (filter === "month") return rowDate.getMonth() === today.getMonth() && rowDate.getFullYear() === today.getFullYear()
      if (filter === "year") return rowDate.getFullYear() === today.getFullYear()
      if (filter === "custom" && fromDate && toDate) return rowDate >= new Date(fromDate) && rowDate <= new Date(toDate)
      return true
    })

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(r =>
        r.parentName.toLowerCase().includes(q) ||
        r.doctor.toLowerCase().includes(q) ||
        r.therapist.toLowerCase().includes(q)
      )
    }

    return list
  }

  const resetTotals = () => {
    setTotals({
      consultationTotal: 0,
      therapyFeeTotal: 0,
      totalFinalAmount: 0,
      dueAmountTotal: 0,
      grandTotal: 0,
    });
  };

  const updateRevenueState = (result) => {
    if (result?.success) {
      setData(result.data || []);
    } else {
      setData([]);
    }
  };

  useEffect(() => {
    const filterMap = {
      today: 1,
      week: 2,
      month: 3,
      year: 4,
    };

    if (filter !== "custom") {
      getRevenueData(filterMap[filter]);
    }
  }, [filter, branchId]);

  const getCustomRevenueData = async () => {
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date");
      return;
    }
    setLoading(true);

    try {
      const clinicId = sessionStorage.getItem("HospitalId");
      // const branchId = sessionStorage.getItem("branchId");

      const response = await http.get(
        `${wifiUrl}/api/physiotherapy-doctor/revenue-management/date-range/${clinicId}/${branchId}/${fromDate}/${toDate}`
      );

      const result = response.data;

      console.log("Custom Revenue :", result);

      if (result.success) {
        setData(result.data || []);

        setTotals({
          consultationTotal: result.consultationTotal || 0,
          therapyFeeTotal: result.therapyFeeTotal || 0,
          totalFinalAmount: result.totalFinalAmount || 0,
          dueAmountTotal: result.dueAmountTotal || 0,
          grandTotal: result.grandTotal || 0,
        });
      } else {
        setData([]);
      }
    } catch (error) {
      console.log(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const getRevenueData = async (type) => {
    setLoading(true);
    try {
      const clinicId = sessionStorage.getItem("HospitalId");
      // const branchId = sessionStorage.getItem("branchId");

      const response = await http.get(
        `${wifiUrl}/api/physiotherapy-doctor/revenue-management/${clinicId}/${branchId}/${type}`
      );

      const result = response.data;

      console.log("Revenue Response :", result);

      if (result.success) {
        setData(result.data || []);

        setTotals({
          consultationTotal: result.consultationTotal || 0,
          therapyFeeTotal: result.therapyFeeTotal || 0,
          totalFinalAmount: result.totalFinalAmount || 0,
          dueAmountTotal: result.dueAmountTotal || 0,
          grandTotal: result.grandTotal || 0,
        });
      } else {
        setData([]);
      }
    } catch (error) {
      console.log(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const getRevenueSummary = async () => {
    try {
      const clinicId = sessionStorage.getItem("HospitalId");
      // const branchId = sessionStorage.getItem("branchId");

      const response = await http.get(
        `${wifiUrl}/api/physiotherapy-doctor/revenue-summary/${clinicId}/${branchId}`
      );

      const result = response.data;

      console.log("Revenue Summary :", result);

      if (result.success) {
        setRenTotals(result.data || {});
      }
    } catch (error) {
      console.log("Revenue Summary Error :", error);
    }
  };
  console.log("Revenue Summary renTotals:", renTotals);
  useEffect(() => {
    getRevenueSummary();
  }, [branchId])

  const filteredData = useMemo(() => {
    let list = [...data];

    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (r) =>
          (r.patientName || "").toLowerCase().includes(q) ||
          (r.doctorName || "").toLowerCase().includes(q) ||
          (r.therapistName || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, search]);

  React.useEffect(() => {
    setCurrentPage(1)
  }, [filter, fromDate, toDate, search])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalConsultation = totals.consultationTotal;
  const totalTherapy = totals.therapyFeeTotal;
  const totalPaid = totals.totalFinalAmount;
  const totalDue = totals.dueAmountTotal;
  const grandTotal = totals.grandTotal;

  /* ── chart data ── */
  const trendData = useMemo(() => {
    const byDate = {};

    filteredData.forEach((r) => {
      if (!byDate[r.serviceDate]) {
        byDate[r.serviceDate] = {
          date: r.serviceDate,
          Consultation: 0,
          Therapy: 0,
        };
      }

      byDate[r.serviceDate].Consultation += Number(r.consultationFee || 0);
      byDate[r.serviceDate].Therapy += Number(r.therapyFee || 0);
    });

    return Object.values(byDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((d) => ({
        ...d,
        label: d.date.slice(5),
      }));
  }, [filteredData]);
  const paymentStatus = useMemo(() => ([
    { name: "Paid", value: totalPaid },
    { name: "Due", value: totalDue },
  ]), [totalPaid, totalDue])

  const revenueByDoctor = useMemo(() => {
    const grouped = {};

    filteredData.forEach((r) => {
      if (!grouped[r.doctorName]) {
        grouped[r.doctorName] = 0;
      }

      grouped[r.doctorName] +=
        Number(r.consultationFee || 0) +
        Number(r.therapyFee || 0);
    });

    return Object.entries(grouped).map(([doctor, Revenue]) => ({
      doctor,
      Revenue,
    }));
  }, [filteredData]);


  return (
    <>
      <RevenueCards renTotals={renTotals} />

      {/* ── Page Header + Filters ── */}
      <div className="rv-page-header">
        <div className="rv-title-group">
          <div className="rv-page-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <h4 className="rv-page-title">Revenue Management ({branchName})</h4>
            <p className="rv-page-sub">
              {filteredData.length} record{filteredData.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="rv-filter-group">
          <div className="rv-search-wrap">
            <Search size={14} className="rv-search-icon" />
            <input
              type="text"
              className="rv-search-input"
              placeholder="Search name, doctor, therapist…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="rv-search-clear" onClick={() => setSearch("")} title="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          {["today", "week", "month", "year", "custom"].map((f) => (
            <button
              key={f}
              className={`rv-filter-pill${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          <div className="rv-view-toggle">
            <button
              className={`rv-view-btn${view === "charts" ? " active" : ""}`}
              onClick={() => setView("charts")}
            >
              <LayoutGrid size={14} /> Charts
            </button>
            <button
              className={`rv-view-btn${view === "table" ? " active" : ""}`}
              onClick={() => setView("table")}
            >
              <Table2 size={14} /> Table
            </button>
          </div>
        </div>
      </div>

      {filter === "custom" && (
        <div className="rv-custom-row">
          <CFormInput type="date" onChange={(e) => setFromDate(e.target.value)} className="rv-date-input" />
          <span className="rv-date-sep">to</span>
          <CFormInput type="date" onChange={(e) => setToDate(e.target.value)} className="rv-date-input" />
          <button
            className="rv-add-btn"
            onClick={getCustomRevenueData}
          >
            Apply
          </button>
        </div>
      )}

      {/* ── Charts view ── */}
      {loading ? (
        <LoadingIndicator message="Loading revenue data..." />
      ) : view === "charts" && filteredData.length === 0 ? (
        <div className="rv-empty-state">
          <Search size={28} color="#94a3b8" />
          <p>
            {search
              ? <>No records match "<strong>{search}</strong>".</>
              : "No records found for the selected filters."}
          </p>
        </div>
      ) : null}

      {!loading && view === "charts" && filteredData.length > 0 && (
        <CRow className="mb-4">
          {/* Revenue trend */}
          <CCol xs={12} lg={7} className="mb-3">
            <div className="rv-chart-card">
              <div className="rv-chart-head">
                <h6>Revenue Trend</h6>
                <span className="rv-chart-sub">Consultation vs Therapy fees, by date</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendData} margin={{ top: 6, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="#eef2f7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Consultation" stackId="rev" fill="#93c5fd" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Therapy" stackId="rev" fill="#185fa5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CCol>

          {/* Payment status donut */}
          <CCol xs={12} lg={5} className="mb-3">
            <div className="rv-chart-card">
              <div className="rv-chart-head">
                <h6>Payment Status</h6>
                <span className="rv-chart-sub">Paid vs outstanding due amount</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={paymentStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {paymentStatus.map((entry, i) => (
                      <Cell key={i} fill={DONUT_COLORS[entry.name] || "#94a3b8"} stroke="#fff" strokeWidth={2} />
                    ))}
                    <LabelList dataKey="value" position="inside" fill="#fff" fontSize={11} fontWeight={700} formatter={v => `₹${v}`} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CCol>

          {/* Revenue by doctor */}
          <CCol xs={12} className="mb-3">
            <div className="rv-chart-card">
              <div className="rv-chart-head">
                <h6>Revenue by Doctor</h6>
                <span className="rv-chart-sub">Combined consultation + therapy fees</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByDoctor} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="#eef2f7" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={v => `₹${v}`} />
                  <YAxis type="category" dataKey="doctor" tick={{ fontSize: 12, fill: "#374151" }} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="Revenue" fill="#185fa5" radius={[0, 4, 4, 0]} barSize={22}>
                    <LabelList dataKey="Revenue" position="right" formatter={v => `₹${v}`} fontSize={11} fill="#374151" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CCol>
        </CRow>
      )}

      {/* ── Table ── */}
      {!loading && view === "table" && (
        <div className="rv-table-wrapper">
          <CTable className="rv-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="rv-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Patient Name</CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Consultation Date</CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Time</CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Doctor</CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Therapist</CTableHeaderCell>
                <CTableHeaderCell className="rv-th text-center">Consultation Fee </CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Treatment Fee <br />
                  <span style={{ fontSize: "8px", color: "white" }}>(Includes Discount(%))</span></CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Final Amt</CTableHeaderCell>
                <CTableHeaderCell className="rv-th">Due Amt</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={10}>
                    <div className="rv-empty">
                      <IndianRupee size={40} className="rv-empty-icon" />
                      <p>
                        {search
                          ? <>No records match "<strong>{search}</strong>".</>
                          : "No records found."}
                      </p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const i = (currentPage - 1) * pageSize + index
                  return (
                    <CTableRow key={i} className="rv-tr">
                      <CTableDataCell className="rv-td rv-td-num">{i + 1}</CTableDataCell>
                      <CTableDataCell className="rv-td"><span className="rv-name">{row.patientName || "-"}</span></CTableDataCell>
                      <CTableDataCell className="rv-td rv-muted">{row.serviceDate}</CTableDataCell>
                      <CTableDataCell className="rv-td rv-muted">{row.serviceTime}</CTableDataCell>
                      <CTableDataCell className="rv-td rv-muted">{row.doctorName}</CTableDataCell>
                      <CTableDataCell className="rv-td rv-muted">{row.therapistName}</CTableDataCell>
                      <CTableDataCell className="rv-td">₹{row.consultationFee}</CTableDataCell>
                      <CTableDataCell className="rv-td">₹{row.therapyFee}</CTableDataCell>
                      <CTableDataCell className="rv-td">₹{row.finalAmount}</CTableDataCell>
                      <CTableDataCell className="rv-td">₹{row.dueAmount}</CTableDataCell>
                    </CTableRow>
                  )
                })
              )}

              {/* Total Row */}
              <CTableRow className="rv-total-row">
                <CTableDataCell colSpan={6}>Total</CTableDataCell>
                <CTableDataCell>₹{totalConsultation}</CTableDataCell>
                <CTableDataCell>₹{totalTherapy}</CTableDataCell>
                <CTableDataCell>₹{totalPaid}</CTableDataCell>
                <CTableDataCell>₹{totalDue}</CTableDataCell>
              </CTableRow>

              {/* Grand Total Row */}
              <CTableRow className="rv-grand-row">
                <CTableDataCell colSpan={8}>Grand Total</CTableDataCell>
                <CTableDataCell colSpan={2}>₹{grandTotal}</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      )}

      {view === "table" && filteredData.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
          />
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        /* Page Header */
        .rv-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .rv-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rv-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .rv-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .rv-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* Filter group */
        .rv-filter-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rv-filter-pill {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .rv-filter-pill:hover { border-color: #185fa5; color: #185fa5; }
        .rv-filter-pill.active {
          background: #185fa5;
          color: #fff;
          border-color: #185fa5;
        }

        /* Search box */
        .rv-search-wrap {
          position: relative; display: flex; align-items: center;
        }
        .rv-search-icon { position: absolute; left: 9px; color: #94a3b8; pointer-events: none; }
        .rv-search-input {
          padding: 6px 28px 6px 30px; border: 0.5px solid #d0dce9; border-radius: 20px;
          font-size: 12px; font-weight: 500; color: #1e293b; background: #fff;
          outline: none; min-width: 210px; transition: border-color .15s;
        }
        .rv-search-input:focus { border-color: #185fa5; box-shadow: 0 0 0 2px #185fa520; }
        .rv-search-input::placeholder { color: #9ca3af; font-weight: 400; }
        .rv-search-clear {
          position: absolute; right: 6px; border: none; background: #f1f5f9; color: #64748b;
          border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; padding: 0;
        }
        .rv-search-clear:hover { background: #e2e8f0; color: #374151; }

        /* View toggle */
        .rv-view-toggle {
          display: flex; align-items: center; gap: 2px; background: #f1f5f9;
          border-radius: 8px; padding: 3px;
        }
        .rv-view-btn {
          display: flex; align-items: center; gap: 6px; border: none; background: transparent;
          padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
          color: #64748b; cursor: pointer; transition: all .15s;
        }
        .rv-view-btn:hover { color: #185fa5; }
        .rv-view-btn.active { background: #fff; color: #185fa5; box-shadow: 0 1px 3px rgba(0,0,0,.08); }

        /* Add Expense / Apply button */
        .rv-add-btn {
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: filter 0.15s;
          white-space: nowrap;
        }
        .rv-add-btn:hover { filter: brightness(0.9); }

        /* Custom date row */
        .rv-custom-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 16px;
          padding: 14px 16px;
          background: #f8fafc;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
        }
        .rv-date-input {
          flex: 1;
          font-size: 12px !important;
          border: 0.5px solid #d0dce9 !important;
          border-radius: 8px !important;
        }
        .rv-date-input:focus { border-color: #185fa5 !important; box-shadow: none !important; }
        .rv-date-sep { font-size: 12px; color: #6b7280; white-space: nowrap; }

        /* Chart cards */
        .rv-chart-card {
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px;
          padding: 16px 16px 6px; height: 100%; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .rv-chart-head { margin-bottom: 6px; }
        .rv-chart-head h6 { margin: 0; font-size: 14px; font-weight: 700; color: #0c447c; }
        .rv-chart-sub { font-size: 11px; color: #6b7280; }

        .rv-empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; padding: 60px 20px; background: #fff; border: 1px dashed #d0dce9;
          border-radius: 10px; margin-bottom: 24px; color: #6b7280; font-size: 13px; text-align: center;
        }
        .rv-empty-state p { margin: 0; }

        /* Table wrapper */
        .rv-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .rv-table { margin-bottom: 0 !important; font-size: 13px; }

        /* Table header */
        .rv-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }

        /* Table rows */
        .rv-tr { transition: background 0.12s; }
        .rv-tr:hover { background: #f0f5fb !important; }
        .rv-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .rv-td-num { color: #9ca3af; font-size: 12px; }
        .rv-muted { color: #6b7280; }

        /* Parent name */
        .rv-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }

        /* Total row */
        .rv-total-row td {
          background: #f0f5fb !important;
          font-weight: 600 !important;
          font-size: 13px;
          color: #0c447c !important;
          padding: 11px 14px !important;
          border-top: 0.5px solid #b5d4f4 !important;
          border-bottom: 0.5px solid #b5d4f4 !important;
        }

        /* Grand total row */
        .rv-grand-row td {
          background: #e6f1fb !important;
          font-weight: 600 !important;
          font-size: 13px;
          color: #0c447c !important;
          padding: 11px 14px !important;
          border-top: 0.5px solid #b5d4f4 !important;
          border-bottom: none !important;
        }

        /* Empty state */
        .rv-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .rv-empty-icon { color: #d0dce9; }
      `}</style>
    </>
  )
}

export default RevenueTable
