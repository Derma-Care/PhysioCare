import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
} from "@coreui/react";
import { cilWallet, cilChart, cilCalendar, cilMoney } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

const RevenueCards = () => {
  const [data, setData] = useState({
    today: 0,
    week: 0,
    month: 0,
    expences: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = {
      today: 12000,
      week: 70000,
      month: 250000,
      expences: 2500,
    };
    setData(response);
  };

  const cardStyle = {
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    padding: "8px 12px",
    height: "90px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  };

  const titleStyle = {
    fontSize: "12px",
    color: "#8a8a8a",
    marginBottom: "2px",
  };

  const valueStyle = {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  };

  const iconStyle = {
    fontSize: "18px",
    opacity: 0.6,
  };

  return (
    <CRow className="mb-2">
      {/* Today */}
      <CCol md={3}>
        <CCard style={{ ...cardStyle, borderLeft: "3px solid #9ccf9c" }}>
          <CCardBody style={{ padding: 0, width: "100%" }}>
            <div>
              <div style={titleStyle}>Today</div>
              <div style={valueStyle}>₹{data.today}</div>
            </div>
            <CIcon icon={cilWallet} style={{ ...iconStyle, color: "#9ccf9c" }} />
          </CCardBody>
        </CCard>
      </CCol>

      {/* Week */}
      <CCol md={3}>
        <CCard style={{ ...cardStyle, borderLeft: "3px solid #a8c7e6" }}>
          <CCardBody style={{ padding: 0, width: "100%" }}>
            <div>
              <div style={titleStyle}>Week</div>
              <div style={valueStyle}>₹{data.week}</div>
            </div>
            <CIcon icon={cilChart} style={{ ...iconStyle, color: "#a8c7e6" }} />
          </CCardBody>
        </CCard>
      </CCol>

      {/* Month */}
      <CCol md={3}>
        <CCard style={{ ...cardStyle, borderLeft: "3px solid #f3c89b" }}>
          <CCardBody style={{ padding: 0, width: "100%" }}>
            <div>
              <div style={titleStyle}>Month</div>
              <div style={valueStyle}>₹{data.month}</div>
            </div>
            <CIcon icon={cilCalendar} style={{ ...iconStyle, color: "#f3c89b" }} />
          </CCardBody>
        </CCard>
      </CCol>

      {/* Expenses */}
      <CCol md={3}>
        <CCard style={{ ...cardStyle, borderLeft: "3px solid #e7a1a1" }}>
          <CCardBody style={{ padding: 0, width: "100%" }}>
            <div>
              <div style={titleStyle}>Expenses</div>
              <div style={{ ...valueStyle, color: "#b94a4a" }}>
                - ₹{data.expences}
              </div>
            </div>
            <CIcon icon={cilMoney} style={{ ...iconStyle, color: "#e7a1a1" }} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default RevenueCards;