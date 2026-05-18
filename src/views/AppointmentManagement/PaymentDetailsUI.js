import React, { useEffect, useState } from "react";
import {
    CCard,
    CCardBody,
    CBadge,
    CButton,
    CRow,
    CCol,
    CProgress,
    CProgressBar,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { FONT_SIZES } from "../../Constant/Themes";
import { getBookingsByPatientId } from "../../APIs/GetpatinetData";


const StatusBadge = ({ status }) => {
    const styles = {
        PAID: { background: "#eaf3de", color: "#27500a", border: "0.5px solid #97c459" },
        PARTIAL: { background: "#faeeda", color: "#633806", border: "0.5px solid #ef9f27" },
        UNPAID: { background: "#fcebeb", color: "#791f1f", border: "0.5px solid #f09595" },
    }
    const s = styles[status] || styles.UNPAID

    return (
        <span style={{
            ...s,
            display: "inline-block",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 10px",
        }}>
            {status}
        </span>
    )
}

export default function PaymentDetailsUI() {
    const navigate = useNavigate();
    const location = useLocation();

    const paymentData = location.state.paymentData || {};
    const [data, setData] = useState(paymentData);
    const patientId = data?.patientId;
    const [patientInfo, setPatientInfo] = useState({
        name: "",
        mobileNumber: ""
    });
    useEffect(() => {
        const patientId = data?.patientId;

        if (!patientId) return;

        const fetchPatientDetails = async () => {
            try {
                const res = await getBookingsByPatientId(patientId);

                const bookingList = res?.data?.data || [];

                // ✅ Find correct booking OR take first
                const booking = bookingList.find(
                    b => b.patientId === patientId
                ) || bookingList[0];

                setPatientInfo({
                    name: booking?.name || "-",
                    mobileNumber: booking?.mobileNumber || booking?.mobile || "-"
                });

            } catch (err) {
                console.error("Patient fetch error:", err);
            }
        };

        fetchPatientDetails();
    }, [data?.patientId]);

    const normalizeData = (data) => {
        return (data?.therapyWithSessions || []).map((item) => {
            if (item?.programs?.length) {
                return {
                    packageName: item.packageName,
                    programs: item.programs.map(program => ({
                        programName: program.programName,
                        therapies: (program.therapyData || []).map(therapy => ({
                            therapyName: therapy.therapyName,
                            exercises: therapy.exercises || []
                        }))
                    }))
                };
            }
            if (item?.therapyData?.length) {
                return {
                    packageName: null,
                    programs: [{
                        programName: item.programName,
                        therapies: (item.therapyData || []).map(therapy => ({
                            therapyName: therapy.therapyName,
                            exercises: therapy.exercises || []
                        }))
                    }]
                };
            }
            if (item?.exercises?.length) {
                return {
                    packageName: null,
                    programs: [{
                        programName: null,
                        therapies: [{ therapyName: item.therapyName, exercises: item.exercises }]
                    }]
                };
            }
            if (item?.sessions?.length) {
                return {
                    packageName: null,
                    programs: [{
                        programName: null,
                        therapies: [{ therapyName: null, exercises: [item] }]
                    }]
                };
            }
            return null;
        }).filter(Boolean);
    };

    const normalized = normalizeData(data || {});

    const allSessions = (data?.therapyWithSessions || []).flatMap(pkg => {
        // 1. Nested: Package > Programs > Therapies > Exercises
        if (pkg.programs) {
            return pkg.programs.flatMap(p =>
                (p.therapyData || []).flatMap(t =>
                    (t.exercises || []).flatMap(e => e.sessions || [])
                )
            );
        }
        // 2. Mid-level: Program > Therapies > Exercises
        if (pkg.therapyData) {
            return pkg.therapyData.flatMap(t =>
                (t.exercises || []).flatMap(e => e.sessions || [])
            );
        }
        // 3. Flat: Exercise with sessions
        if (pkg.sessions) {
            return pkg.sessions;
        }
        // 4. Very Flat: Exercises array (if root is just exercises)
        if (pkg.exercises) {
            return pkg.exercises.flatMap(e => e.sessions || []);
        }
        return [];
    });

    const paidSessions = allSessions.filter(
        item => item.paymentStatus?.toLowerCase() === "paid"
    ).length;

    const percent = allSessions.length > 0
        ? Math.round((paidSessions / allSessions.length) * 100)
        : 0;

    return (
        <div style={{ background: "#f4f6f9", minHeight: "100vh", padding: "20px" }}>
            <h2 style={{ fontSize: FONT_SIZES.xl, fontWeight: 600, color: "#0c447c", marginBottom: "20px" }}>
                Patient Payment Dashboard
            </h2>

            {/* 🔹 Top Summary */}
            <CRow className="g-3 mb-4">
                {[
                    { label: "Booking ID", value: data.bookingId },
                    { label: "Patient", value: patientInfo.name, sub: patientInfo.mobileNumber },
                    { label: "Doctor", value: data.doctorName },
                    { label: "Status", value: <StatusBadge status={data.paymentStatus} /> },
                ].map((item, i) => (
                    <CCol md={3} key={i}>
                        <div style={{
                            background: "#fff",
                            border: "0.5px solid #d0dce9",
                            borderRadius: "10px",
                            padding: "13px 15px",
                        }}>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 5px" }}>
                                {item.label}
                            </p>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0c447c", margin: 0 }}>
                                {item.value}
                            </p>
                            {item.sub && (
                                <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>
                                    {item.sub}
                                </p>
                            )}
                        </div>
                    </CCol>
                ))}
            </CRow>

            {/* 🔹 Amount Cards */}
            <CRow className="g-3 mb-4">
                {[
                    { label: "Total amount", value: `₹${data.totalAmount}`, bg: "#f7fafd", color: "#0c447c" },
                    { label: "Discount", value: `₹${data.discountAmount}`, bg: "#faeeda", color: "#854f0b" },
                    { label: "Total paid", value: `₹${data.totalPaid}`, bg: "#eaf3de", color: "#27500a" },
                    { label: "Balance due", value: `₹${data.balanceAmount}`, bg: "#fcebeb", color: "#a32d2d" },
                ].map((item, i) => (
                    <CCol md={3} key={i}>
                        <div style={{
                            background: item.bg,
                            border: "0.5px solid #d0dce9",
                            borderRadius: "10px",
                            padding: "13px 15px",
                        }}>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 5px" }}>
                                {item.label}
                            </p>
                            <p style={{ fontSize: "18px", fontWeight: 600, color: item.color, margin: 0 }}>
                                {item.value}
                            </p>
                        </div>
                    </CCol>
                ))}
            </CRow>

            {/* 🔹 Progress */}
            <div style={{
                background: "#fff",
                border: "0.5px solid #d0dce9",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
            }}>
                <div className="d-flex justify-content-between">
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0c447c" }}>
                        Payment Progress
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#185fa5" }}>
                        {paidSessions}/{allSessions.length} ({percent}%)
                    </span>
                </div>
                <div style={{
                    height: "8px",
                    borderRadius: "10px",
                    background: "#e9ecef",
                    marginTop: "16px",
                    overflow: "hidden",
                    position: "relative"
                }}>
                    <div style={{
                        width: `${percent}%`,
                        height: "100%",
                        backgroundColor: percent === 100 ? "#97c459" : "#ef9f27",
                        borderRadius: "10px",
                        transition: "width 0.5s ease-in-out"
                    }} />
                </div>
            </div>

            {/* 🔹 Therapy Sessions */}
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                Therapy Sessions
            </p>

            {(data?.therapyWithSessions || []).map((pkg, pi) => {
                const programs = pkg?.programs
                    ? pkg.programs
                    : pkg?.therapyData
                        ? [pkg]
                        : pkg?.exercises
                            ? [{ programName: null, therapyData: [pkg] }]
                            : pkg?.sessions
                                ? [{ programName: null, therapyData: [{ therapyName: null, exercises: [pkg] }] }]
                                : [];

                return (
                    <div key={pi}>
                        {pkg?.packageName && (
                            <div style={{
                                fontSize: "13px", fontWeight: 600, color: "#0c447c",
                                background: "#e6f1fb", border: "0.5px solid #b5d4f4",
                                borderRadius: "8px", padding: "9px 14px", marginBottom: "10px",
                            }}>
                                {pkg.packageName}
                            </div>
                        )}

                        {programs.map((program, gi) => (
                            <div key={gi} style={{
                                background: "#fff",
                                border: "0.5px solid #d0dce9",
                                borderRadius: "10px",
                                marginBottom: "12px",
                                overflow: "hidden",
                            }}>
                                {program?.programName && (
                                    <div style={{
                                        background: "#e6f1fb",
                                        padding: "10px 14px",
                                        fontSize: "13px", fontWeight: 600, color: "#0c447c",
                                        borderBottom: "0.5px solid #d0dce9",
                                    }}>
                                        {program.programName}
                                    </div>
                                )}

                                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {(program?.therapyData || []).map((therapy, ti) => (
                                        <div key={ti} style={{
                                            border: "0.5px solid #d0dce9",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                        }}>
                                            {therapy?.therapyName && (
                                                <div style={{
                                                    background: "#f0f5fb",
                                                    padding: "9px 12px",
                                                    fontSize: "12px", fontWeight: 600, color: "#185fa5",
                                                    borderBottom: "0.5px solid #d0dce9",
                                                }}>
                                                    {therapy.therapyName}
                                                </div>
                                            )}

                                            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {(therapy?.exercises || []).map((exercise, ei) => {
                                                    const sessions = exercise?.sessions ||
                                                        Array.from({ length: exercise?.noOfSessions || 0 }, (_, i) => ({
                                                            sessionNo: i + 1,
                                                            paymentStatus: "UNPAID",
                                                        }));

                                                    return (
                                                        <div key={ei} style={{
                                                            background: "#f7fafd",
                                                            border: "0.5px solid #eef2f7",
                                                            borderRadius: "8px",
                                                            padding: "10px 12px",
                                                        }}>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#0c447c" }}>
                                                                    {exercise?.exerciseName}
                                                                </span>
                                                                <span style={{
                                                                    fontSize: "11px", fontWeight: 500, color: "#3b6d11",
                                                                    background: "#eaf3de", border: "0.5px solid #c0dd97",
                                                                    borderRadius: "20px", padding: "2px 9px",
                                                                }}>
                                                                    ₹{exercise?.pricePerSession}/session
                                                                </span>
                                                            </div>

                                                            <div className="d-flex flex-wrap gap-2">
                                                                {sessions.map((session, si) => {
                                                                    const isPaid = session?.paymentStatus?.toLowerCase() === "paid";
                                                                    return (
                                                                        <CButton
                                                                            key={si}
                                                                            size="sm"
                                                                            disabled={isPaid}
                                                                            style={{
                                                                                borderRadius: "20px",
                                                                                padding: "3px 10px",
                                                                                fontSize: "11px",
                                                                                fontWeight: 500,
                                                                                border: `0.5px solid ${isPaid ? "#97c459" : "#f09595"}`,
                                                                                background: isPaid ? "#eaf3de" : "#fcebeb",
                                                                                color: isPaid ? "#27500a" : "#a32d2d",
                                                                            }}
                                                                        >
                                                                            {isPaid ? `✓ Paid` : `Session ${session.sessionNo}`}
                                                                            <span className="ms-2">{session.date}</span>
                                                                        </CButton>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* 🔹 Payment History */}
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "20px 0 10px" }}>
                Payment History
            </p>

            <div style={{
                background: "#fff",
                border: "0.5px solid #d0dce9",
                borderRadius: "10px",
                overflow: "hidden",
            }}>
                <div style={{ background: "#185fa5", padding: "10px 14px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                        Transaction Log
                    </span>
                </div>

                <CTable hover responsive className="mb-0" style={{ fontSize: "12px" }}>
                    <CTableHead>
                        <CTableRow>
                            {["#", "Date", "Amount", "Mode", "Type", "Level"].map(h => (
                                <CTableHeaderCell key={h} style={{
                                    background: "#f0f5fb", color: "#6b7280",
                                    fontSize: "11px", fontWeight: 600,
                                    padding: "8px 12px", borderColor: "#d0dce9",
                                }}>
                                    {h}
                                </CTableHeaderCell>
                            ))}
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {data.paymentHistory.map((item, i) => (
                            <CTableRow key={i}>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7", color: "#9ca3af" }}>{i + 1}</CTableDataCell>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7", color: "#374151" }}>{item.paymentDate}</CTableDataCell>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7", fontWeight: 600, color: "#0c447c" }}>₹{item.amount}</CTableDataCell>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7" }}>
                                    <span style={{
                                        background: "#e6f1fb", color: "#0c447c",
                                        border: "0.5px solid #b5d4f4",
                                        borderRadius: "20px", fontSize: "11px",
                                        fontWeight: 500, padding: "2px 8px",
                                    }}>
                                        {item.paymentMode}
                                    </span>
                                </CTableDataCell>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7" }}>
                                    <StatusBadge status={item.paymentType} />
                                </CTableDataCell>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7", color: "#6b7280" }}>{item.paymentLevel}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>

                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "flex-end", borderTop: "0.5px solid #d0dce9" }}>
                    <button
                        style={{
                            background: "#185fa5", color: "#fff", border: "none",
                            borderRadius: "8px", padding: "9px 20px",
                            fontSize: "13px", fontWeight: 600, cursor: "pointer",
                        }}
                        onClick={() => navigate(-1)}
                    >
                        Pay Balance ₹{data.balanceAmount}
                    </button>
                </div>
            </div>
        </div>
    );
}