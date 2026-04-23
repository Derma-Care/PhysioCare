import React, { useEffect, useState } from "react";
import {
    CCard,
    CCardBody,
    CBadge,
    CButton,
    CRow,
    CCol,
    CProgress,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { FONT_SIZES } from "../../Constant/Themes";

const data = {
    bookingId: "BOOK1234",
    patientId: "PAT123",
    patientName: "Ramesh Kumar",
    mobile: "9876543210",
    doctorName: "Dr. John (Physio)",
    therapistName: "Therapy_1",
    totalAmount: 5000,
    discountAmount: 200,
    finalAmount: 4800,
    totalPaid: 2500,
    balanceAmount: 2300,
    paymentStatus: "PARTIAL",

    paymentHistory: [
        {
            amount: 1000,
            paymentMode: "CASH",
            paymentType: "PARTIAL",
            paymentDate: "2026-04-14",
            paymentleval: "Session"
        },
        {
            amount: 1500,
            paymentMode: "UPI",
            paymentType: "PARTIAL",
            paymentDate: "2026-04-15",
            paymentleval: "Therapy"
        },
    ],

    therapyWithSessions: [
        {
            packageName: "PACKAGE_1",
            programs: [
                {
                    programName: "PROGRAM_1",
                    therapyData: [
                        {
                            therapyName: "THERAPY_1",
                            exercises: [
                                {
                                    exerciseName: "Knee Flexion",
                                    pricePerSession: 100,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: n <= 2 ? "PAID" : "UNPAID",
                                    })),
                                },
                                {
                                    exerciseName: "Quad Set",
                                    pricePerSession: 120,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: n === 1 ? "PAID" : "UNPAID",
                                    })),
                                },
                            ],
                        },
                        {
                            therapyName: "THERAPY_2",
                            exercises: [
                                {
                                    exerciseName: "Hamstring Stretch",
                                    pricePerSession: 90,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: n <= 3 ? "PAID" : "UNPAID",
                                    })),
                                },
                                {
                                    exerciseName: "Leg Raise",
                                    pricePerSession: 110,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: "UNPAID",
                                    })),
                                },
                            ],
                        },
                    ],
                },

                {
                    programName: "PROGRAM_2",
                    therapyData: [
                        {
                            therapyName: "THERAPY_3",
                            exercises: [
                                {
                                    exerciseName: "Shoulder Rotation",
                                    pricePerSession: 130,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: n <= 2 ? "PAID" : "UNPAID",
                                    })),
                                },
                                {
                                    exerciseName: "Wall Climb",
                                    pricePerSession: 95,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: "UNPAID",
                                    })),
                                },
                            ],
                        },
                        {
                            therapyName: "THERAPY_4",
                            exercises: [
                                {
                                    exerciseName: "Neck Stretch",
                                    pricePerSession: 80,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: n < 5 ? "PAID" : "UNPAID",
                                    })),
                                },
                                {
                                    exerciseName: "Arm Raise",
                                    pricePerSession: 105,
                                    sessions: [1, 2, 3, 4, 5].map((n) => ({
                                        sessionNo: n,
                                        paymentStatus: n === 1 ? "PAID" : "UNPAID",
                                    })),
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

const StatusBadge = ({ status }) => {
    const color =
        status === "PAID"
            ? "success"
            : status === "PARTIAL"
                ? "warning"
                : "danger";

    return <CBadge color={color}>{status}</CBadge>;
};


const percent = Math.round((data.totalPaid / data.finalAmount) * 100);

export default function PaymentDetailsUI() {
    const navigate = useNavigate();
    const location = useLocation();

    const paymentData = location.state.paymentData || {};
    const [data, setData] = useState(paymentData);
    const allSessions =
        data?.therapyWithSessions?.flatMap(pkg =>
            pkg.programs.flatMap(program =>
                program.therapyData.flatMap(therapy =>
                    therapy.exercises.flatMap(exercise => exercise.sessions)
                )
            )
        ) || [];

    const paidSessions = allSessions.filter(
        item => item.paymentStatus?.toLowerCase() === "paid"
    ).length;

    const percent =
        allSessions.length > 0
            ? Math.round((paidSessions / allSessions.length) * 100)
            : 0;

    // alert(bookingId);
  return (
  <div className="p-4" style={{ background: "#f4f6f9", minHeight: "100vh" }}>
    <h2 className="fw-bold mb-4 " style={{fontSize:FONT_SIZES.xl}}>Patient Payment Dashboard</h2>

    {/* 🔹 Top Summary */}
    <CRow className="g-3 mb-4">
      {[ 
        { label: "Booking ID", value: data.bookingId },
        { label: "Patient", value: data.patientName, sub: data.mobile },
        { label: "Doctor", value: data.doctorName },
        { label: "Status", value: <StatusBadge status={data.paymentStatus} /> },
      ].map((item, i) => (
        <CCol md={3} key={i}>
          <CCard className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <CCardBody>
              <small className="text-muted">{item.label}</small>
              <h5 className="fw-bold mt-1">{item.value}</h5>
              {item.sub && <small className="text-muted">{item.sub}</small>}
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>

    {/* 🔹 Amount Cards */}
    <CRow className="g-3 mb-4">
      <CCol md={3}>
        <CCard className="border-0 shadow-sm" style={{ borderRadius: "12px", background: "#fff" }}>
          <CCardBody>
            <small>Total</small>
            <h4 className="fw-bold">₹{data.totalAmount}</h4>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={3}>
        <CCard className="border-0 shadow-sm" style={{ borderRadius: "12px", background: "#fff3cd" }}>
          <CCardBody>
            <small>Discount</small>
            <h4 className="fw-bold text-warning">₹{data.discountAmount}</h4>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={3}>
        <CCard className="border-0 shadow-sm" style={{ borderRadius: "12px", background: "#d1e7dd" }}>
          <CCardBody>
            <small>Paid</small>
            <h4 className="fw-bold text-success">₹{data.totalPaid}</h4>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={3}>
        <CCard className="border-0 shadow-sm" style={{ borderRadius: "12px", background: "#f8d7da" }}>
          <CCardBody>
            <small>Balance</small>
            <h4 className="fw-bold text-danger">₹{data.balanceAmount}</h4>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    {/* 🔹 Progress */}
    <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
      <CCardBody>
        <div className="d-flex justify-content-between">
          <strong>Payment Progress</strong>
          <span className="fw-semibold">
            {paidSessions}/{allSessions.length} ({percent}%)
          </span>
        </div>

        <CProgress
          value={percent}
          className="mt-3"
          style={{ height: "10px", borderRadius: "10px" }}
          color={percent === 100 ? "success" : "warning"}
        />
      </CCardBody>
    </CCard>

    {/* 🔹 Therapy Sessions */}
    {data.therapyWithSessions.map((pkg, pi) => (
      <div key={pi}>
        <h4 className="mb-3" style={{fontSize: FONT_SIZES.lg}}>
          {pkg.packageName}
        </h4>

        {pkg.programs.map((program, gi) => (
          <CCard key={gi} className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
            <CCardBody>
              <h5 className="text-primary fw-bold mb-3" style={{fontSize: FONT_SIZES.md}}>
                {program.programName}
              </h5>

              {program.therapyData.map((therapy, ti) => (
                <div
                  key={ti}
                  style={{
                    borderLeft: "4px solid #0d6efd",
                    padding: "12px",
                    marginBottom: "16px",
                    background: "#fff",
                    borderRadius: "10px",
                  }}
                >
                  <h6 className="fw-bold">{therapy.therapyName}</h6>

                  {therapy.exercises.map((exercise, ei) => (
                    <div
                      key={ei}
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "10px",
                        marginTop: "10px",
                        border: "1px solid #eee",
                      }}
                    >
                      <div className="d-flex justify-content-between mb-2">
                        <strong>{exercise.exerciseName}</strong>
                        <span>₹{exercise.pricePerSession}/Session</span>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {exercise.sessions.map((session, si) => {
                          const isPaid =
                            session.paymentStatus?.toLowerCase() === "paid";

                          return (
                            <CButton
                              key={si}
                              size="sm"
                              disabled={isPaid}
                              style={{
                                borderRadius: "20px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                border: isPaid
                                  ? "none"
                                  : "1px solid #dc3545",
                                backgroundColor: isPaid
                                  ? "#198754"
                                  : "#fff",
                                color: isPaid ? "#fff" : "#dc3545",
                                boxShadow:
                                  "0 2px 6px rgba(0,0,0,0.1)",
                              }}
                            >
                              {isPaid ? "✓ Paid" : `Session ${session.sessionNo}`}
                            </CButton>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CCardBody>
          </CCard>
        ))}
      </div>
    ))}

    {/* 🔹 Payment History */}
    <CCard className="mt-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
      <CCardBody>
        <h5 className="mb-3" style={{fontSize: FONT_SIZES.md}}>
          Payment History
        </h5>

        <CTable striped hover responsive className="align-middle">
          <CTableHead style={{ background: "#f1f3f5" }}>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Amount</CTableHeaderCell>
              <CTableHeaderCell>Mode</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Level</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {data.paymentHistory.map((item, i) => (
              <CTableRow key={i}>
                <CTableDataCell>{i + 1}</CTableDataCell>
                <CTableDataCell>{item.paymentDate}</CTableDataCell>
                <CTableDataCell>₹{item.amount}</CTableDataCell>
                <CTableDataCell>{item.paymentMode}</CTableDataCell>
                <CTableDataCell>{item.paymentType}</CTableDataCell>
                <CTableDataCell>{item.paymentLevel}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <div className="text-end mt-3">
          <CButton
            style={{
              background: "linear-gradient(135deg, #dc3545, #b02a37)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: "600",
              color: "#fff",
            }}
            onClick={() => navigate(-1)}
          >
            Pay Balance ₹{data.balanceAmount}
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  </div>
);
}