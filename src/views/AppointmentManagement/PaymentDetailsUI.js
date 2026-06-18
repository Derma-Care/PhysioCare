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
import PrintLetterHead from "../../Utils/PrintLetterHead";
import { ToWords } from 'to-words';

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

/* ── Print receipt helper components ── */
const PrintRow = ({ label, value }) => (
    <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
        <span style={{ color: "#888", minWidth: "70px", fontSize: "12px" }}>{label}:</span>
        <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "12px" }}>{value || "N/A"}</span>
    </div>
)

const Section = ({ title, children }) => (
    <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#0c447c", textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</span>
            <div style={{ flex: 1, height: "1px", background: "#dce6f0" }} />
        </div>
        {children}
    </div>
)

const TotalRow = ({ label, value, bg, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", background: bg, borderBottom: "1px solid #eef2f7" }}>
        <span style={{ color: "#555", fontSize: "13px" }}>{label}</span>
        <strong style={{ color, fontSize: "13px" }}>{value}</strong>
    </div>
)

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



    const toWords = new ToWords({
        localeCode: 'en-IN',
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
        },
    });

    const amountInWords = (amount) => {
        return toWords.convert(Number(amount || 0));
    };
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
    const latestPayment = data?.paymentHistory?.length
        ? data.paymentHistory[data.paymentHistory.length - 1]
        : null;

    const receiptNumber =
        latestPayment?.receiptNumber ||
        `REC-${data.bookingId}-${data.paymentHistory?.length || 1}`;

    const consentNumber =
        data?.consentNumber ||
        `CONS-${data.bookingId}`;
    const handlePrint = (elementId) => {
        const printContent = document.getElementById(elementId);
        if (printContent) {
            const iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.width = "0px";
            iframe.style.height = "0px";
            iframe.style.border = "none";

            document.body.appendChild(iframe);
            const doc = iframe.contentWindow.document;

            doc.open();
            doc.write("<html><head><title>Print</title>");

            // Copy existing styles to iframe
            const styles = document.querySelectorAll("style, link[rel='stylesheet']");
            styles.forEach((s) => {
                doc.write(s.outerHTML);
            });

            doc.write("</head><body>");
            doc.write(printContent.innerHTML);
            doc.write("</body></html>");
            doc.close();

            iframe.contentWindow.focus();

            // Wait for styles to load before printing
            setTimeout(() => {
                iframe.contentWindow.print();
                document.body.removeChild(iframe);
            }, 500);
        }
    };
    return (
        <div style={{ background: "#f4f6f9", minHeight: "100vh", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: FONT_SIZES.xl, fontWeight: 600, color: "#0c447c", margin: 0 }}>
                    Patient Payment Dashboard
                </h2>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => handlePrint("printable-consent")}
                        style={{
                            background: "#0c447c",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontWeight: 600
                        }}
                    >
                        Consolidated Receipts
                    </button>

                    <button
                        onClick={() => handlePrint("printable-receipt")}
                        style={{
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontWeight: 600
                        }}
                    >
                        Print Receipt
                    </button>
                </div>
            </div>

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
                                {item.value}{item.sub ? <span style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>- {item.sub}</span> : null}
                            </p>
                            {/* {item.sub && (
                                <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>
                                    {item.sub}
                                </p>
                            )} */}
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
                            {["#", "Receipt No.", "Date", "Amount", "Mode", "Type", "Level"].map(h => (
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
                        {(data.paymentHistory || []).filter(item => item?.amount !== null && item?.amount !== undefined).map((item, i) => (
                            <CTableRow key={i}>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7", color: "#9ca3af" }}>{i + 1}</CTableDataCell>
                                <CTableDataCell style={{ padding: "9px 12px", borderColor: "#eef2f7", color: "#0c447c", fontWeight: 600 }}>{item.receiptNumber || `REC-${data.bookingId}-${i + 1}`}</CTableDataCell>
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

            {/* ── Hidden Printable Receipt ── */}
            <div id="printable-receipt" style={{ display: "none" }}>
                <style>{`
                    .letter-header,
                    .letter-footer {
                        padding-left: 40px !important;
                        padding-right: 40px !important;
                        padding-top: 40px !important;
                        
                    }
                `}</style>
                <PrintLetterHead printDate={new Date()}>
                    <div style={{
                        padding: "0 40px",

                        color: "#1a1a2e",
                        fontSize: "13px",
                        lineHeight: 1.6,
                    }}>

                        {/* ── Title ── */}
                        <div style={{
                            textAlign: "center",
                            marginBottom: "28px",
                            paddingBottom: "20px",
                            borderBottom: "2.5px solid #0c447c",
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#0c447c",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                            }}>
                                Payment Receipt
                            </h2>
                            <span style={{ fontWeight: 600, color: "#1a1a2e" }} className="text-muted">Receipt No.: {receiptNumber}</span>
                        </div>

                        {/* ── Patient Info Grid ── */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0",
                            marginBottom: "24px",
                            border: "1px solid #dce6f0",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}>
                            {/* Left block */}
                            <div style={{ padding: "16px 20px", background: "#f7fafd", borderRight: "1px solid #dce6f0" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: "#0c447c", textTransform: "uppercase", letterSpacing: "0.8px" }}>Patient</p>
                                <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>{patientInfo.name}</p>
                                <PrintRow label="Patient ID" value={data.patientId} />
                                <PrintRow label="Mobile" value={patientInfo.mobileNumber} />
                            </div>
                            {/* Right block */}
                            <div style={{ padding: "16px 20px", background: "#f7fafd" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: "#0c447c", textTransform: "uppercase", letterSpacing: "0.8px" }}>Booking</p>
                                <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>#{data.bookingId}</p>
                                <PrintRow label="Doctor" value={data.doctorName} />
                                <PrintRow label="Date" value={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
                            </div>
                        </div>

                        {/* ── Treatments ── */}
                        <Section title="Treatments">
                            <div style={{ padding: "4px 0" }}>
                                {(data?.therapyWithSessions && data.therapyWithSessions.length > 0)
                                    ? data.therapyWithSessions.map((pkg, pi) => {
                                        const therapiesList = []
                                        if (pkg?.programs) {
                                            pkg.programs.forEach(p => (p.therapyData || []).forEach(t => t.therapyName && therapiesList.push(t.therapyName)))
                                        } else if (pkg?.therapyData) {
                                            pkg.therapyData.forEach(t => t.therapyName && therapiesList.push(t.therapyName))
                                        }
                                        const treatmentValue = data?.treatmentName || (therapiesList.length > 0 ? therapiesList.join(", ") : "Therapy Session")
                                        return (
                                            <div key={pi} style={{
                                                display: "flex", alignItems: "flex-start", gap: "10px",
                                                padding: "10px 14px", background: "#f0f6ff",
                                                borderRadius: "6px", marginBottom: pi < data.therapyWithSessions.length - 1 ? "8px" : 0,
                                                borderLeft: "3px solid #0c447c",
                                            }}>
                                                <span style={{ color: "#0c447c", fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✦</span>
                                                <div>
                                                    <span style={{ fontSize: "10px", color: "#888", display: "block", marginBottom: "1px" }}>Treatment Name</span>
                                                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{treatmentValue}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                    : (
                                        <div style={{
                                            display: "flex", alignItems: "flex-start", gap: "10px",
                                            padding: "10px 14px", background: "#f0f6ff",
                                            borderRadius: "6px", borderLeft: "3px solid #0c447c",
                                        }}>
                                            <span style={{ color: "#0c447c", fontSize: "12px", marginTop: "1px" }}>✦</span>
                                            <div>
                                                <span style={{ fontSize: "10px", color: "#888", display: "block", marginBottom: "1px" }}>Treatment Name</span>
                                                <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{data?.treatmentName || "N/A"}</span>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </Section>

                        {/* ── Payment (latest only) ── */}
                        <Section title="Payment">
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                                <thead>
                                    <tr style={{ background: "#0c447c" }}>
                                        {["Date", "Mode", "Type", "Amount"].map((h, i) => (
                                            <th key={h} style={{
                                                padding: "9px 12px",
                                                color: "#fff",
                                                fontWeight: 600,
                                                textAlign: i === 3 ? "right" : "left",
                                                fontSize: "11px",
                                                letterSpacing: "0.4px",
                                                textTransform: "uppercase",
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestPayment && latestPayment.amount !== null && latestPayment.amount !== undefined && (
                                        <tr style={{ background: "#fff" }}>
                                            <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7", color: "#444" }}>{latestPayment.paymentDate}</td>
                                            <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7" }}>
                                                <span style={{
                                                    fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                                                    borderRadius: "10px", background: "#e8f0fb", color: "#0c447c",
                                                }}>{latestPayment.paymentMode}</span>
                                            </td>
                                            <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7", color: "#555" }}>
                                                {latestPayment.paymentType}{latestPayment.paymentLevel ? ` · ${latestPayment.paymentLevel}` : ""}
                                            </td>
                                            <td
                                                style={{
                                                    padding: "9px 12px",
                                                    borderBottom: "1px solid #eef2f7",
                                                    textAlign: "right",
                                                    fontWeight: 600,
                                                    color: "#1a1a2e",
                                                }}
                                            >
                                                ₹{latestPayment.amount}
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        fontWeight: 400,
                                                        color: "#666",
                                                        marginTop: "2px",
                                                    }}
                                                >
                                                    ({amountInWords(latestPayment.amount)})
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Section>


                        {/* ── Totals ── */}
                        <div style={{
                            width: "280px",
                            marginLeft: "auto",
                            marginTop: "4px",
                            border: "1px solid #dce6f0",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}>
                            <TotalRow label="Total Amount" value={`₹${data.totalAmount}`} bg="#f7fafd" color="#333" />
                            <TotalRow label="Discount" value={`₹${data.discountAmount}`} bg="#fff9f0" color="#854f0b" />
                            <TotalRow label="Total Paid" value={`₹${data.totalPaid}`} bg="#f0fbf4" color="#27500a" />
                            <div style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "12px 16px",
                                background: data.balanceAmount > 0 ? "#fff5f5" : "#f0fbf4",
                                borderTop: "2px solid " + (data.balanceAmount > 0 ? "#a32d2d" : "#27500a"),
                            }}>
                                <span style={{ fontWeight: 700, fontSize: "14px", color: data.balanceAmount > 0 ? "#a32d2d" : "#27500a" }}>
                                    Balance Due
                                </span>
                                <strong style={{ fontSize: "15px", color: data.balanceAmount > 0 ? "#a32d2d" : "#27500a" }}>
                                    ₹{data.balanceAmount}
                                </strong>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div style={{
                            marginTop: "40px",
                            paddingTop: "16px",
                            borderTop: "1px dashed #ccd6e4",
                            textAlign: "center",
                            fontSize: "12px",
                            color: "#888",
                        }}>
                            <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#0c447c" }}>Thank you for choosing us!</p>
                            <p style={{ margin: 0 }}>This is a computer-generated receipt and does not require a signature.</p>
                        </div>

                    </div>
                </PrintLetterHead>
            </div>

            {/* ── Hidden Printable Consent (ALL payment history) ── */}
            <div id="printable-consent" style={{ display: "none" }}>
                <style>{`
                    .letter-header,
                    .letter-footer {
                        padding-left: 40px !important;
                        padding-right: 40px !important;
                        padding-top: 40px !important;
                    }
                `}</style>
                <PrintLetterHead printDate={new Date()}>
                    <div style={{
                        padding: "0 40px",
                        color: "#1a1a2e",
                        fontSize: "13px",
                        lineHeight: 1.6,
                    }}>

                        {/* ── Title ── */}
                        <div style={{
                            textAlign: "center",
                            marginBottom: "28px",
                            paddingBottom: "20px",
                            borderBottom: "2.5px solid #0c447c",
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#0c447c",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                            }}>
                                CONSOLIDATED RECEIPTS
                            </h2>
                            <span style={{ fontWeight: 600, color: "#1a1a2e" }} className="text-muted">Overall Receipt No.: {data.overallReceiptNumber || `REC-${data.bookingId}`}</span>
                        </div>

                        {/* ── Patient Info Grid ── */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0",
                            marginBottom: "24px",
                            border: "1px solid #dce6f0",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}>
                            <div style={{ padding: "16px 20px", background: "#f7fafd", borderRight: "1px solid #dce6f0" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: "#0c447c", textTransform: "uppercase", letterSpacing: "0.8px" }}>Patient</p>
                                <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>{patientInfo.name}</p>
                                <PrintRow label="Patient ID" value={data.patientId} />
                                <PrintRow label="Mobile" value={patientInfo.mobileNumber} />
                            </div>
                            <div style={{ padding: "16px 20px", background: "#f7fafd" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: "#0c447c", textTransform: "uppercase", letterSpacing: "0.8px" }}>Booking</p>
                                <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>#{data.bookingId}</p>
                                <PrintRow label="Doctor" value={data.doctorName} />
                                <PrintRow label="Date" value={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
                            </div>
                        </div>

                        {/* ── Treatments ── */}
                        <Section title="Treatments">
                            <div style={{ padding: "4px 0" }}>
                                {(data?.therapyWithSessions && data.therapyWithSessions.length > 0)
                                    ? data.therapyWithSessions.map((pkg, pi) => {
                                        const therapiesList = []
                                        if (pkg?.programs) {
                                            pkg.programs.forEach(p => (p.therapyData || []).forEach(t => t.therapyName && therapiesList.push(t.therapyName)))
                                        } else if (pkg?.therapyData) {
                                            pkg.therapyData.forEach(t => t.therapyName && therapiesList.push(t.therapyName))
                                        }
                                        const treatmentValue = data?.treatmentName || (therapiesList.length > 0 ? therapiesList.join(", ") : "Therapy Session")
                                        return (
                                            <div key={pi} style={{
                                                display: "flex", alignItems: "flex-start", gap: "10px",
                                                padding: "10px 14px", background: "#f0f6ff",
                                                borderRadius: "6px", marginBottom: pi < data.therapyWithSessions.length - 1 ? "8px" : 0,
                                                borderLeft: "3px solid #0c447c",
                                            }}>
                                                <span style={{ color: "#0c447c", fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>✦</span>
                                                <div>
                                                    <span style={{ fontSize: "10px", color: "#888", display: "block", marginBottom: "1px" }}>Treatment Name</span>
                                                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{treatmentValue}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                    : (
                                        <div style={{
                                            display: "flex", alignItems: "flex-start", gap: "10px",
                                            padding: "10px 14px", background: "#f0f6ff",
                                            borderRadius: "6px", borderLeft: "3px solid #0c447c",
                                        }}>
                                            <span style={{ color: "#0c447c", fontSize: "12px", marginTop: "1px" }}>✦</span>
                                            <div>
                                                <span style={{ fontSize: "10px", color: "#888", display: "block", marginBottom: "1px" }}>Treatment Name</span>
                                                <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{data?.treatmentName || "N/A"}</span>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </Section>

                        {/* ── Full Payment History ── */}
                        <Section title="Payment History">
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                                <thead>
                                    <tr style={{ background: "#0c447c" }}>
                                        {["Date", "Mode", "Type", "Amount"].map((h, i) => (
                                            <th key={h} style={{
                                                padding: "9px 12px",
                                                color: "#fff",
                                                fontWeight: 600,
                                                textAlign: i === 3 ? "right" : "left",
                                                fontSize: "11px",
                                                letterSpacing: "0.4px",
                                                textTransform: "uppercase",
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data.paymentHistory || [])
                                        .filter(item => item?.amount !== null && item?.amount !== undefined)
                                        .map((item, i) => (
                                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f7fafd" }}>
                                                <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7", color: "#444" }}>{item.paymentDate}</td>
                                                <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7" }}>
                                                    <span style={{
                                                        fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                                                        borderRadius: "10px", background: "#e8f0fb", color: "#0c447c",
                                                    }}>{item.paymentMode}</span>
                                                </td>
                                                <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7", color: "#555" }}>
                                                    {item.paymentType}{item.paymentLevel ? ` · ${item.paymentLevel}` : ""}
                                                </td>
                                                <td style={{ padding: "9px 12px", borderBottom: "1px solid #eef2f7", textAlign: "right", fontWeight: 600, color: "#1a1a2e" }}>
                                                    ₹{item.amount}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </Section>

                        {/* ── Totals ── */}
                        <div style={{
                            width: "280px",
                            marginLeft: "auto",
                            marginTop: "4px",
                            border: "1px solid #dce6f0",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}>
                            <TotalRow label="Total Amount" value={`₹${data.totalAmount}`} bg="#f7fafd" color="#333" />
                            <TotalRow label="Discount" value={`₹${data.discountAmount}`} bg="#fff9f0" color="#854f0b" />
                            <TotalRow label="Total Paid" value={`₹${data.totalPaid}`} bg="#f0fbf4" color="#27500a" />
                            <TotalRow label="" value={`${amountInWords(data.totalPaid)}`} bg="#f0fbf4" color="#27500a" />
                            <div style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "12px 16px",
                                background: data.balanceAmount > 0 ? "#fff5f5" : "#f0fbf4",
                                borderTop: "2px solid " + (data.balanceAmount > 0 ? "#a32d2d" : "#27500a"),
                            }}>
                                <span style={{ fontWeight: 700, fontSize: "14px", color: data.balanceAmount > 0 ? "#a32d2d" : "#27500a" }}>
                                    Balance Due
                                </span>
                                <strong style={{ fontSize: "15px", color: data.balanceAmount > 0 ? "#a32d2d" : "#27500a" }}>
                                    ₹{data.balanceAmount}
                                </strong>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div style={{
                            marginTop: "40px",
                            paddingTop: "16px",
                            borderTop: "1px dashed #ccd6e4",
                            textAlign: "center",
                            fontSize: "12px",
                            color: "#888",
                        }}>
                            <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#0c447c" }}>Thank you for choosing us!</p>
                            <p style={{ margin: 0 }}>This is a computer-generated statement and does not require a signature.</p>
                        </div>

                    </div>
                </PrintLetterHead>
            </div>

            {/* ── Helpers (define outside or inline as needed) ── */}
            {/* 
  const Row = ({ label, value }) => (
    <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
      <span style={{ color: "#888", minWidth: "70px", fontSize: "12px" }}>{label}:</span>
      <span style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "12px" }}>{value || "N/A"}</span>
    </div>
  )

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#0c447c", textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</span>
        <div style={{ flex: 1, height: "1px", background: "#dce6f0" }} />
      </div>
      {children}
    </div>
  )

  const TotalRow = ({ label, value, bg, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", background: bg, borderBottom: "1px solid #eef2f7" }}>
      <span style={{ color: "#555", fontSize: "13px" }}>{label}</span>
      <strong style={{ color, fontSize: "13px" }}>{value}</strong>
    </div>
  )
*/}
        </div>
    );
}