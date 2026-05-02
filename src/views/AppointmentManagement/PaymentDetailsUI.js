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
    CProgressBar,
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { FONT_SIZES } from "../../Constant/Themes";
import ExerciseUI from "../AppointmentManagement/ExerciseUI";

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

   const paymentData = location?.state?.paymentData || {};
const [data, setData] = useState(paymentData?.data || paymentData);
   const allSessions =
  (data?.therapyWithSessions || []).flatMap(item => {
    // CASE 1: Package → Program → Therapy
    if (item.programs) {
      return item.programs.flatMap(program =>
        (program.therapyData || []).flatMap(therapy =>
          (therapy.exercises || []).flatMap(ex => ex.sessions || [])
        )
      );
    }

    // CASE 2: Therapy → Exercise
     if (item?.exercises?.length) {
    return item.exercises.flatMap(ex =>
      ex?.sessions || []
    );
  }

    // CASE 3: Exercise directly
    if (item.sessions) {
      return item.sessions;
    }

    return [];
  });

    const paidSessions = allSessions.filter(
        item => item.paymentStatus?.toLowerCase() === "paid"
    ).length;

    const percent =
        allSessions.length > 0
            ? Math.round((paidSessions / allSessions.length) * 100)
            : 0;

    // alert(bookingId);
  return (
  <div style={{ background: "#f4f6f9", minHeight: "100vh", padding: "16px" }}>

    {/* 🔹 TITLE */}
    <h5 className="fw-bold mb-3" style={{ fontSize: "14px" }}>
      Patient Payment
    </h5>

    {/* 🔹 SUMMARY */}
    <CRow className="g-2 mb-3">
      {[
        { label: "Booking ID", value: data.bookingId },
        { label: "Patient", value: data.patientName, sub: data.mobile },
        { label: "Doctor", value: data.doctorName },
        { label: "Status", value: <StatusBadge status={data.paymentStatus} /> },
      ].map((item, i) => (
        <CCol md={3} key={i}>
          <CCard className="border-0 shadow-sm">
            <CCardBody style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: "11px", color: "#777" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600" }}>
                {item.value}
              </div>
              {item.sub && (
                <div style={{ fontSize: "11px", color: "#999" }}>
                  {item.sub}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>

    {/* 🔹 AMOUNT CARDS */}
    <CRow className="g-2 mb-3">
      {[
        { label: "Total", value: data.totalAmount },
        { label: "Discount", value: data.discountAmount },
        { label: "Paid", value: data.totalPaid },
        { label: "Balance", value: data.balanceAmount },
      ].map((item, i) => (
        <CCol md={3} key={i}>
          <CCard className="border-0 shadow-sm">
            <CCardBody style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: "11px", color: "#777" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700" }}>
                ₹{item.value}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>

    {/* 🔹 PROGRESS */}
    <CCard className="mb-3 border-0 shadow-sm">
      <CCardBody style={{ padding: "10px" }}>
        <div className="d-flex justify-content-between">
          <span style={{ fontSize: "12px", fontWeight: "500" }}>
            Progress
          </span>
          <span style={{ fontSize: "12px" }}>
            {paidSessions}/{allSessions.length} ({percent}%)
          </span>
        </div>

   <div
  style={{
    height: "6px",
    width: "100%",
    background: "#e9ecef",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "6px"
  }}
>
  <div
    style={{
      width: `${percent}%`,
      height: "100%",
      transition: "width 0.3s ease",
      background:
        percent === 100
          ? "#198754"
          : percent > 50
          ? "#0dcaf0"
          : percent > 0
          ? "#ffc107"
          : "#dc3545",
    }}
  />
</div>
      </CCardBody>
    </CCard>

    {/* 🔹 SESSIONS */}
    {(data?.therapyWithSessions || []).map((pkg, pi) => {

      // ✅ PACKAGE
      if (pkg.programs) {
        return pkg.programs.map((program, pIndex) => (
          <div key={pIndex} className="mb-2">

            <h6 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              {program.programName}
            </h6>

            {(program.therapyData || []).map((therapy, ti) => (
              <CCard key={ti} className="mb-2 border-0 shadow-sm">
                <CCardBody style={{ padding: "10px" }}>

                  <div
                    className="fw-bold mb-2"
                    style={{ fontSize: "12px", color: "#0d6efd" }}
                  >
                    {therapy.therapyName}
                  </div>

                  {(therapy.exercises || []).map((ex, ei) => (
                    <ExerciseUI key={ei} exercise={ex} />
                  ))}

                </CCardBody>
              </CCard>
            ))}
          </div>
        ));
      }

      // ✅ EXERCISE
      if (pkg.sessions) {
        return (
          <div key={pi} className="mb-2">

            <h6 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              {pkg.exerciseName}
            </h6>

            <CCard className="mb-2 border-0 shadow-sm">
              <CCardBody style={{ padding: "10px" }}>
                <ExerciseUI exercise={pkg} />
              </CCardBody>
            </CCard>

          </div>
        );
      }

      // ✅ THERAPY
      if (pkg.exercises) {
        return (
          <div key={pi} className="mb-2">

            <h6 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              {pkg.therapyName}
            </h6>

            <CCard className="mb-2 border-0 shadow-sm">
              <CCardBody style={{ padding: "10px" }}>
                {(pkg.exercises || []).map((ex, ei) => (
                  <ExerciseUI key={ei} exercise={ex} />
                ))}
              </CCardBody>
            </CCard>

          </div>
        );
      }

      return null;
    })}
  </div>
);

}