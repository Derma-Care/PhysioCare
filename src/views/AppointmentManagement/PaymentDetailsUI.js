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
        <div className="p-4">
            <h2 className="fw-bold mb-4">Patient Payment Dashboard</h2>

            {/* Top Summary */}
            <CRow className="g-3 mb-4">
                <CCol md={3}>
                    <CCard><CCardBody><small>Booking ID</small><h5>{data.bookingId}</h5></CCardBody></CCard>
                </CCol>
                <CCol md={3}>
                    <CCard><CCardBody><small>Patient</small><h5>{data.patientName}</h5><small>{data.mobile}</small></CCardBody></CCard>
                </CCol>
                <CCol md={3}>
                    <CCard><CCardBody><small>Doctor</small><h5>{data.doctorName}</h5></CCardBody></CCard>
                </CCol>
                <CCol md={3}>
                    <CCard><CCardBody><small>Status</small><div className="mt-2"><StatusBadge status={data.paymentStatus} /></div></CCardBody></CCard>
                </CCol>
            </CRow>

            {/* Amount Cards */}
            <CRow className="g-3 mb-4">
                <CCol md={3}><CCard><CCardBody><small>Total</small><h4>₹{data.totalAmount}</h4></CCardBody></CCard></CCol>
                <CCol md={3}><CCard><CCardBody><small>Discount</small><h4>₹{data.discountAmount}</h4></CCardBody></CCard></CCol>
                <CCol md={3}><CCard><CCardBody><small>Paid</small><h4>₹{data.totalPaid}</h4></CCardBody></CCard></CCol>
                <CCol md={3}><CCard><CCardBody><small>Balance</small><h4 className="text-danger">₹{data.balanceAmount}</h4></CCardBody></CCard></CCol>
            </CRow>

            {/* Progress */}
            <CCard className="mb-4">
                <CCardBody>
                    <div className="d-flex justify-content-between">
                        <strong>Payment Progress</strong>
                        <span>
                            {paidSessions}/{allSessions.length} Sessions Paid ({percent}%)
                        </span>
                    </div>

                    <CProgress
                        value={percent}
                        color={percent === 100 ? "success" : "warning"}
                        className="mt-2"
                    />
                </CCardBody>
            </CCard>

            {/* Session Data */}
            {data.therapyWithSessions.map((pkg, pi) => (
                <div key={pi}>
                    <h4 className="mb-3">{pkg.packageName}</h4>

                    {pkg.programs.map((program, gi) => (
                        <CCard className="mb-4" key={gi}>
                            <CCardBody>
                                <h5 className="text-primary mb-4">{program.programName}</h5>

                                {program.therapyData.map((therapy, ti) => (
                                    <CCard className="mb-3 border-start border-4 border-info" key={ti}>
                                        <CCardBody>
                                            <h6 className="fw-bold">{therapy.therapyName}</h6>

                                            {therapy.exercises.map((exercise, ei) => (
                                                <div key={ei} className="border rounded p-3 mt-3 bg-light">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <strong>{exercise.exerciseName}</strong>
                                                        <span>₹{exercise.pricePerSession}/Session</span>
                                                    </div>

                                                    <div className="d-flex flex-wrap gap-3">
                                                        {exercise.sessions.map((session, si) => {
                                                            const isPaid =
                                                                session.paymentStatus?.toLowerCase() === "paid";

                                                            return (
                                                                <div key={si} className="text-center">
                                                                    <CButton
                                                                        size="sm"
                                                                        color={isPaid ? "success" : "danger"}
                                                                        disabled={isPaid}
                                                                        className="fw-bold"
                                                                    >
                                                                        Session {session.sessionNo}{" "}
                                                                        {isPaid ? "✓ Paid" : "Pay Now"}
                                                                    </CButton>

                                                                    <div
                                                                        style={{
                                                                            fontSize: "12px",
                                                                            color: "#666",
                                                                            marginTop: "4px",
                                                                        }}
                                                                    >
                                                                        {session.date}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </CCardBody>
                                    </CCard>
                                ))}
                            </CCardBody>
                        </CCard>
                    ))}
                </div>
            ))}

            {/* Payment History */}
            <CCard className="mt-4">
                <CCardBody>
                    <h5 className="mb-3">Payment History</h5>
                    <CTable striped responsive>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>#</CTableHeaderCell>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                                <CTableHeaderCell>Amount</CTableHeaderCell>
                                <CTableHeaderCell>Mode</CTableHeaderCell>
                                <CTableHeaderCell>Type</CTableHeaderCell>
                                <CTableHeaderCell>Payment Level</CTableHeaderCell>
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
                            color="danger"
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