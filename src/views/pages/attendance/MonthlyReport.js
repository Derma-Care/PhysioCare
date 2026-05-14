import React, { useState } from "react";

import {
  CPopover,
  CButton,
} from "@coreui/react";

import {
  attendanceDummy,
  empDummy,
} from "./AttadanceDummyData";
import { useGlobalSearch } from "../../Usecontext/GlobalSearchContext";
import { Search, X } from "lucide-react";

export default function MonthlyReport() {
  const { searchQuery, setSearchQuery } = useGlobalSearch();

  const [month, setMonth] =
    useState("2026-03");

  const getData = (name, status) => {
    return attendanceDummy.filter(
      (a) => a.name === name && a.status === status && a.date.startsWith(month)
    );
  };

  const getCount = (name, status) => {
    return getData(name, status).length;
  };

  // Filter employees by search query
  const filteredEmployees = empDummy.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
  });

  return (
    <div className="container-fluid p-0">
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white border-bottom pt-4 pb-3 d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
          <div>
            <h4 className="mb-1 fw-bold" style={{ color: "#1B4F8A" }}>Monthly Attendance Summary</h4>
            <small className="text-muted fw-medium">Overview for {month}</small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="cm-search-wrapper" style={{ width: "250px" }}>
              <Search size={14} className="cm-search-icon-left" />
              <input
                type="text"
                className="cm-search-input"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="cm-search-clear" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ width: "180px" }}>
              <input
                type="month"
                className="form-control shadow-sm"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ borderRadius: "8px", border: "1px solid #dee2e6", height: "36px" }}
              />
            </div>
          </div>
        </div>
        <div className="card-body p-0 mt-2">
          <div className="table-responsive wd-table-wrapper">
            <table className="table table-hover align-middle mb-0 pink-table">
              <thead style={{ backgroundColor: "#1B4F8A", color: "#fff" }}>
                <tr>
                  <th className="px-4 py-3 text-uppercase small fw-bold">Name</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-center">Present</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-center">Absent</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-center">Late</th>
                  <th className="px-4 py-3 text-uppercase small fw-bold text-center">Leave</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((e) => (
                    <tr key={e.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <td className="px-4 py-3 fw-bold text-dark">{e.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="badge bg-success-light text-success px-3 py-2 rounded-pill">
                          {getCount(e.name, "Present")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">

              <tr key={e.id}>

                <td>{e.name}</td>

                <td>
                  {getCount(
                    e.name,
                    "Present"
                  )}
                </td>

                        <CPopover
                          trigger="hover"
                          placement="top"
                          content={
                            <table className="table table-sm mb-0">
                              <thead className="table-light">
                                <tr><th>Date</th><th>Reason</th></tr>
                              </thead>
                              <tbody>
                                {getData(e.name, "Absent").map((d, i) => (
                                  <tr key={i}><td>{d.date}</td><td>{d.reason}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          }
                        >
                          <CButton size="sm" color="danger" variant="outline" className="rounded-pill px-3">
                            {getCount(e.name, "Absent")}
                          </CButton>
                        </CPopover>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CPopover
                          trigger="hover"
                          placement="top"
                          content={
                            <table className="table table-sm mb-0">
                              <thead className="table-light">
                                <tr><th>Date</th><th>In</th><th>Reason</th></tr>
                              </thead>
                              <tbody>
                                {getData(e.name, "Late").map((d, i) => (
                                  <tr key={i}><td>{d.date}</td><td>{d.in}</td><td>{d.reason}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          }
                        >
                          <CButton size="sm" color="warning" variant="outline" className="rounded-pill px-3">
                            {getCount(e.name, "Late")}
                          </CButton>
                        </CPopover>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CPopover
                          trigger="hover"
                          placement="top"
                          content={
                            <table className="table table-sm mb-0">
                              <thead className="table-light">
                                <tr><th>Date</th><th>Reason</th></tr>
                              </thead>
                              <tbody>
                                {getData(e.name, "Leave").map((d, i) => (
                                  <tr key={i}><td>{d.date}</td><td>{d.reason}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          }
                        >
                          <CButton size="sm" color="info" variant="outline" className="rounded-pill px-3">
                            {getCount(e.name, "Leave")}
                          </CButton>
                        </CPopover>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No staff found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}