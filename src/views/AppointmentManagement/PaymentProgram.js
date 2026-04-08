/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react"
import {
    CCard,
    CCardBody,
    CCardHeader,
    CRow,
    CCol,
    CFormInput,
    CFormSelect,
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,

    CFormLabel,
} from "@coreui/react"
import PrintLetterHead from "../../Utils/PrintLetterHead"
import { percent } from "framer-motion"
import { Button } from "bootstrap"
import { useLocation } from "react-router-dom"

export default function ProgramPayment() {
    const location = useLocation();

    console.log("Received data:", location.state);

    const {
        bookingId,
        doctorId,
        clinicId,
        branchId,
        patientId
    } = location.state || {};


    // ✅ DUMMY DATA
    const data = {
        doctorName: "Dr. John (Physio)",
        doctorId: "DOC123",
        therapistName: "Therapy_1",
        therapistId: "THER123",
        therapistRecordId: "REC123",
        programName: "Program_1",
        programId: "PROG123",
        programyCost: 600,
        noOfSessionCount: 30,
        noTherapyCount: 2,
        therophyData: [
            {
                therapyName: "Therapy_1",
                therapyId: "THER123",
                therapyCost: 300,
                noOfSessionCount: 30,
                exercises: [
                    {
                        exerciseId: "E1",
                        exerciseName: "Exercise_1",
                        totalSessionCost: 100,
                        pricePerSession: 10,
                        noOfSessions: 10,
                        sets: 3,
                        repetitions: 10,
                        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        frequency: "2/day",
                    },
                    {
                        exerciseId: "E2",
                        exerciseName: "Exercise_2",
                        totalSessionCost: 200,
                        pricePerSession: 20,
                        noOfSessions: 5,
                        sets: 4,
                        repetitions: 12,
                        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        frequency: "3/day",
                    },
                ],
            },
            {
                therapyName: "Therapy_2",
                therapyId: "THER123",
                therapyCost: 300,
                noOfSessionCount: 30,
                exercises: [
                    {
                        exerciseId: "E3",
                        exerciseName: "Exercise_3",
                        totalSessionCost: 150,
                        pricePerSession: 15,
                        noOfSessions: 10,
                        sets: 3,
                        repetitions: 15,
                        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        frequency: "5/week",
                    },
                    {
                        exerciseId: "E4",
                        exerciseName: "Exercise_4",
                        totalSessionCost: 150,
                        pricePerSession: 15,
                        noOfSessions: 10,
                        sets: 2,
                        repetitions: 10,
                        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        frequency: "2/week",
                    },
                ],
            },
        ],
    }

    const [startDate, setStartDate] = useState("")
    const [paymentType, setPaymentType] = useState("full")
    const [paymentAmount, setPaymentAmount] = useState(data.programyCost)
    const [discount, setDiscount] = useState(0)
    const [showTable, setShowTable] = useState(false)
    const [discountPercent, setDiscountPercent] = useState(0)
    const [finalAmount, setFinalAmount] = useState(data.programyCost)
    const [printData, setPrintData] = useState(null)
    const [openTherapy, setOpenTherapy] = useState(null)
    const [openExercise, setOpenExercise] = useState(null)
    const [errors, setErrors] = useState({})
    const [viewModal, setViewModal] = useState(false)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [discountIssuedBy, setDiscountIssuedBy] = useState("")
    const [paymentHistory, setPaymentHistory] = useState([])
    const [previousPaid, setPreviousPaid] = useState(0) // from API
    const [balanceAmount, setBalanceAmount] = useState(finalAmount)
    const [isFollowUpPayment, setIsFollowUpPayment] = useState(false)
    const [paymentMode, setPaymentMode] = useState("cash")

    const [paymentPercent, setPaymentPercent] = useState(100)
    const handleDiscountChange = (value) => {
        const percent = Number(value)

        setDiscountAmount(percent)

        // ✅ convert % → amount
        const discountValue = (data.programyCost * percent) / 100

        const final = data.programyCost - discountValue
        setFinalAmount(final)

        // recalc payment
        if (paymentType === "partial") {
            const half = final / 2
            setPaymentAmount(half)
            setPaymentPercent(50)
        } else {
            setPaymentAmount(final)
            setPaymentPercent(100)
        }
    }

    useEffect(() => {
        const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0)

        setPreviousPaid(totalPaid)

        const balance = finalAmount - totalPaid
        setBalanceAmount(balance)

        // ✅ FIX: set payment amount to balance
        if (isFollowUpPayment) {
            setPaymentAmount(balance)
        }

    }, [paymentHistory, finalAmount, isFollowUpPayment])
    const handlePaymentType = (type) => {
        setPaymentType(type)

        if (type === "partial") {
            const half = finalAmount / 2
            setPaymentAmount(half)
            setPaymentPercent(50)
        } else {
            setPaymentAmount(finalAmount)
            setPaymentPercent(100)
        }
    }
    const handleAmountChange = (value) => {
        const amount = Number(value)

        if (amount > balanceAmount) {
            setErrors((prev) => ({
                ...prev,
                paymentAmount: "Cannot exceed remaining balance",
            }))
            return
        }

        setPaymentAmount(amount)

        const percent = balanceAmount > 0 ? (amount / finalAmount) * 100 : 0
        setPaymentPercent(percent.toFixed(2))
    }

    const validate = () => {
        let err = {}

        if (!isFollowUpPayment && !startDate) {
            err.startDate = "Start date is required"
        }

        if (!paymentAmount || paymentAmount <= 0 || isNaN(paymentAmount)) {
            err.paymentAmount = "Enter valid amount"
        } else if (paymentAmount > finalAmount) {
            err.paymentAmount = "Amount cannot exceed final amount"
        }

        if (paymentPercent <= 0 || paymentPercent > 100) {
            err.paymentPercent = "Percent must be between 1 and 100"
        }

        if (discountAmount < 0) {
            err.discountAmount = "Discount cannot be negative"
        } else if (discountAmount > data.programyCost) {
            err.discountAmount = "Discount cannot exceed total cost"
        }

        const isDiscountApplied = discountAmount > 0
        const isLowPayment = paymentAmount < finalAmount * 0.5

        if ((isDiscountApplied || isLowPayment) && !discountIssuedBy) {
            err.discountIssuedBy = "Issuer name is required for discount or low payment"
        }

        if (paymentType === "partial") {
            if (!paymentAmount || paymentAmount <= 0) {
                err.paymentAmount = "Enter valid amount"
            } else if (paymentAmount >= finalAmount) {
                err.paymentAmount = "Partial payment must be less than final amount"
            }
        }
        if (paymentAmount > balanceAmount) {
            err.paymentAmount = "Cannot pay more than remaining balance"
        }
        setErrors(err)
        return Object.keys(err).length === 0
    }
    const handlePercentChange = (percent) => {
        const p = Number(percent)

        setPaymentPercent(p)

        const amount = (finalAmount * p) / 100
        setPaymentAmount(amount)
    }
    const prepareTherapyDataWithSessions = () => {
        return {
            doctorName: data.doctorName,
            doctorId: data.doctorId,
            therapistName: data.therapistName,
            therapistId: data.therapistId,
            therapistRecordId: data.therapistRecordId,
            programName: data.programName,
            programId: data.programId,
            noOfSessionCount: data.noOfSessionCount,
            noTherapyCount: data.noTherapyCount,

            therophyData: data.therophyData.map((therapy) => ({
                ...therapy,
                exercises: therapy.exercises.map((exe) => {
                    const sessions = generateSessionPlan(
                        startDate,
                        exe.noOfSessions,
                        exe.frequency
                    );

                    return {
                        ...exe,
                        sessions: sessions.map((date, index) => ({
                            date: date.toLocaleDateString(),
                            status: "Pending",
                            sessionsId: `${exe.exerciseId}_${index + 1}`, // ✅ unique id
                        })),
                    };
                }),
            })),
        };
    };

    const handleSubmit = () => {

        const therapyWithSessions = prepareTherapyDataWithSessions()

        const payload = {
            clinicId: "0002",
            branchId: "000201",
            bookingId: "BOOK123",
            patientId: "BOOK123",
            therapistRecordId: "1244",
            overallpaymentPercent: 100, //backend - GET
            paymentStatus: balanceAmount === 0 ? "Paid" : "Partial", //backend - GET
            totalAmount: data.programyCost, //backend - GET
            finalAmount: finalAmount,   //backend - GET
            paidAmount: paymentAmount,
            previousPaid: previousPaid, //backend - GET
            totalPaid: previousPaid + paymentAmount, //backend - GET
            discount: discountAmount,
            discountAmount: discountAmount, // for backend - GET
            balanceAmount: finalAmount - (previousPaid + paymentAmount), //backend will calculate this based on payments received - GET
            dueAmount: finalAmount - (previousPaid + paymentAmount), //backend - GET
            sessionStartDate: new Date().toLocaleDateString(),
            noOfSessionCompletedCount: 5, //get this from session data which is updated therapist side you will get in session status completed - GET
            noOfSessionCompletedStatus: false, //  default it is false when 50% session completed and there are due amount then only it will be true - GET
            sessionTableCreatedStatus: true, //  default it is false - GET
            totalSessionCount: 30, //backend - GET
            paymentHistory: [
                ...paymentHistory,
                {
                    amount: paymentAmount,
                    date: new Date().toLocaleDateString(),
                    paymentMode: paymentMode,
                    discountIssuedBy: discountIssuedBy,
                    paymentType: paymentType,
                    dueAmount: finalAmount - (previousPaid + paymentAmount), //backend - GET
                    paymentPercent: paymentPercent,
                },
            ],
            therapyWithSessions: therapyWithSessions, //[...data.therophyData] // include therapy + sessions in payload and it will update the status when therapist session completed
        }

        if (payload.balanceAmount > 0) {
            setIsFollowUpPayment(true)
        } if (payload.balanceAmount === 0) {
            setIsFollowUpPayment(true) // ✅ full payment completed
        }
        console.log("FINAL PAYLOAD", payload)
        console.log("FINAL discountPercent", discountPercent)
        setPrintData(payload)
        setShowTable(false)
        setPaymentHistory(payload.paymentHistory)
        setPaymentAmount(payload.balanceAmount)
    }
    useEffect(() => {
        if (isFollowUpPayment) {
            setPaymentAmount(balanceAmount)
        }
    }, [balanceAmount, isFollowUpPayment])
    const handleGenerate = () => {
        if (!validate()) return


        setShowTable(true)

    }

    // 🔥 DATE GENERATOR FUNCTION (skip sunday)
    const generateDates = (start, totalSessions) => {

        let dates = []
        let current = new Date(start)

        while (dates.length < totalSessions) {
            const day = current.getDay()

            if (day !== 0) {
                // 0 = Sunday ❌ skip
                dates.push(new Date(current))
            }

            current.setDate(current.getDate() + 1)
        }

        return dates
    }
    // const handleGenerate = () => {
    //     if (!validate()) return

    //     setShowTable(true)
    // }
    // 🔥 GENERATE SESSION DATES BASED ON FREQUENCY
    const generateSessionPlan = (startDate, totalSessions, frequency) => {
        let sessions = []
        let current = new Date(startDate)

        const [count, type] = frequency.split("/")
        const freq = parseInt(count)

        while (sessions.length < totalSessions) {
            const day = current.getDay()

            if (day !== 0) {
                // skip Sunday

                if (type === "day") {
                    // ✅ ONE SESSION PER DAY
                    sessions.push(new Date(current))
                    current.setDate(current.getDate() + 1)
                }

                else if (type === "week") {
                    let weekDates = []
                    let temp = new Date(current)

                    while (weekDates.length < 6) {
                        if (temp.getDay() !== 0) {
                            weekDates.push(new Date(temp))
                        }
                        temp.setDate(temp.getDate() + 1)
                    }

                    const gap = Math.floor(weekDates.length / freq)

                    for (let i = 0; i < freq; i++) {
                        const index = i * gap
                        if (sessions.length < totalSessions && weekDates[index]) {
                            sessions.push(weekDates[index])
                        }
                    }

                    current.setDate(current.getDate() + 7)
                }
            } else {
                current.setDate(current.getDate() + 1)
            }
        }

        return sessions
    }
    // ✅ CANCEL
    const handleCancel = () => {
        setStartDate("")
        setPaymentAmount(data.programyCost)
        setShowTable(false)
        setPrintData(null)
        setErrors({})
    }
    return (
        <>
            <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">


                    <h5 className="mb-0">{data.programName}</h5>

                    <CButton
                        size="sm"
                        style={{ backgroundColor: "var(--color-bgcolor)", color: "var(--color-black)" }}
                        onClick={() => setViewModal(true)}
                    >
                        Program Details
                    </CButton>
                </CCardHeader>

                <CCardBody>
                    {/* INPUT SECTION */}
                    <CRow className="mb-3">
                        <CCol md={3}>
                            <CFormLabel className="fw-bold">Start Date</CFormLabel>
                            <CFormInput
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value)

                                    // ✅ clear error
                                    setErrors((prev) => ({ ...prev, startDate: "" }))
                                }}
                            />

                            {errors.startDate && (
                                <small style={{ color: "red" }}>{errors.startDate}</small>
                            )}
                        </CCol>

                        <CCol md={3}>
                            <CFormLabel className="fw-bold">Payment Type</CFormLabel>
                            <CFormSelect
                                value={paymentType}
                                onChange={(e) => handlePaymentType(e.target.value)}
                            >
                                <option value="full">Full</option>
                                <option value="partial">Partial</option>
                            </CFormSelect>
                        </CCol>

                        <CCol md={3}>
                            <CFormLabel className="fw-bold">Payment Amount</CFormLabel>
                            <CFormInput
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => {
                                    handleAmountChange(e.target.value)

                                    // ✅ clear error
                                    setErrors((prev) => ({ ...prev, startDate: "" }))
                                }}
                            />
                            {errors.paymentAmount && (
                                <small style={{ color: "red" }}>{errors.paymentAmount}</small>
                            )}


                        </CCol>
                        <CCol md={3}>
                            <CFormLabel className="fw-bold">Payment Percent</CFormLabel>
                            <CFormInput
                                type="number"
                                value={paymentPercent}
                                onChange={(e) => handlePercentChange(e.target.value)}
                            />
                        </CCol>
                        <CRow className="mt-3">
                            <CCol md={4}>
                                <CFormLabel className="fw-bold">Discount %</CFormLabel>
                                <CFormInput
                                    type="number"
                                    value={discountAmount}
                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                />
                                {errors.discountAmount && (
                                    <small style={{ color: "red" }}>{errors.discountAmount}</small>
                                )}

                            </CCol>
                            <CCol md={4}>
                                <CFormLabel className="fw-bold">Approved By (Discount / Low Payment)</CFormLabel>
                                <CFormInput
                                    type="Text"
                                    value={discountIssuedBy}
                                    onChange={(e) => {
                                        setDiscountIssuedBy(e.target.value);

                                        setErrors((prev) => ({
                                            ...prev,
                                            discountIssuedBy: ""
                                        }));
                                    }}
                                />
                                {errors.discountIssuedBy && (
                                    <small style={{ color: "red" }}>{errors.discountIssuedBy}</small>
                                )}
                            </CCol>
                            <CCol md={3}>
                                <CFormLabel className="fw-bold">Payment Mode</CFormLabel>
                                <CFormSelect
                                    value={paymentMode}
                                // onChange={(e) => handlePaymentType(e.target.value)}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                </CFormSelect>
                            </CCol>

                        </CRow>

                    </CRow>

                    {/* BUTTONS */}
                    {/* and check status also */}
                    {isFollowUpPayment && (
                        <CCard className="mb-3 shadow-sm">
                            <CCardHeader className="fw-bold d-flex justify-content-between align-items-center">
                                <div>Payment History</div>
                                <div>
                                    <CButton
                                        size="sm"
                                        style={{ backgroundColor: "var(--color-bgcolor)", color: "var(--color-black)" }}
                                        className="mx-2"

                                    >
                                        Due Amount:<strong> ₹{balanceAmount}</strong>
                                    </CButton>
                                    <CButton size="sm" style={{ backgroundColor: "var(--color-black)", color: "white" }} >Status: <strong>Due</strong></CButton>
                                </div>
                            </CCardHeader>
                            <CCardBody>

                                <CTable small bordered className="mt-3 pink-table" responsive>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>S.No</CTableHeaderCell>
                                            <CTableHeaderCell>Date</CTableHeaderCell>
                                            <CTableHeaderCell>Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Due Amount</CTableHeaderCell>
                                            <CTableHeaderCell>Payment Mode</CTableHeaderCell>
                                            <CTableHeaderCell>Payment Type</CTableHeaderCell>
                                            <CTableHeaderCell>Payment Percentage</CTableHeaderCell>
                                            <CTableHeaderCell>Approved By</CTableHeaderCell>





                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {paymentHistory.map((p, i) => (
                                            <CTableRow key={i}>
                                                <CTableDataCell>{i + 1}</CTableDataCell>
                                                <CTableDataCell>{new Date(p.date).toLocaleDateString()}</CTableDataCell>
                                                <CTableDataCell>₹{p.amount}</CTableDataCell>
                                                <CTableDataCell>₹{p.dueAmount}</CTableDataCell>
                                                <CTableDataCell>{p.paymentMode}</CTableDataCell>
                                                <CTableDataCell>{p.paymentType}</CTableDataCell>
                                                <CTableDataCell>{p.paymentPercent} %</CTableDataCell>
                                                <CTableDataCell>{p.discountIssuedBy || "NA"}</CTableDataCell>

                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </CCardBody>
                        </CCard>
                    )

                    }



                    <div className="mt-3 d-flex justify-content-end  ">

                        {/* LEFT SIDE */}
                        <CButton
                            style={{ backgroundColor: "var(--color-bgcolor)", color: "var(--color-black)" }}
                            onClick={isFollowUpPayment ? handleSubmit : handleGenerate}
                        >
                            {isFollowUpPayment ? "Update Payment" : "Generate Table"}
                        </CButton>


                    </div>
                    {/* {isFollowUpPayment && (
                        <CCard className="mb-3 shadow-sm">
                            <CCardHeader className="fw-bold">Payment Update</CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol md={3}><b>Final:</b> ₹{finalAmount}</CCol>
                                    <CCol md={3}><b>Paid:</b> ₹{previousPaid}</CCol>
                                    <CCol md={3}><b>Balance:</b> ₹{balanceAmount}</CCol>
                                    <CCol md={3}><b>Today:</b> {new Date().toLocaleDateString()}</CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    )} */}


                    {/* TABLE */}
                    {showTable && startDate && (
                        <>
                            <h5 className="mt-4 fw-bold">{data.programName}</h5>

                            {data.therophyData.map((therapy, tIndex) => (
                                <CCard key={tIndex} className="mt-3 shadow-sm">

                                    {/* 🔹 THERAPY HEADER */}
                                    <CCardHeader
                                        style={{ cursor: "pointer", background: "#f8f9fa" }}
                                        onClick={() =>
                                            setOpenTherapy(openTherapy === tIndex ? null : tIndex)
                                        }
                                    >
                                        <div className="d-flex justify-content-between">
                                            <strong>{therapy.therapyName}</strong>
                                            <span>{openTherapy === tIndex ? "▲" : "▼"}</span>
                                        </div>
                                    </CCardHeader>

                                    {/* 🔹 THERAPY BODY */}
                                    {openTherapy === tIndex && (
                                        <CCardBody>

                                            {therapy.exercises.map((exe, eIndex) => {
                                                const sessions = generateSessionPlan(
                                                    startDate,
                                                    exe.noOfSessions,
                                                    exe.frequency
                                                )

                                                return (
                                                    <CCard key={eIndex} className="mb-3 border">

                                                        {/* 🔸 EXERCISE HEADER */}
                                                        <CCardHeader
                                                            style={{ cursor: "pointer", background: "#eef5ff" }}
                                                            onClick={() =>
                                                                setOpenExercise(
                                                                    openExercise === `${tIndex}-${eIndex}`
                                                                        ? null
                                                                        : `${tIndex}-${eIndex}`
                                                                )
                                                            }
                                                        >
                                                            <div className="d-flex justify-content-between">
                                                                <span>➤ {exe.exerciseName}</span>
                                                                <span>
                                                                    {openExercise === `${tIndex}-${eIndex}` ? "▲" : "▼"}
                                                                </span>
                                                            </div>
                                                        </CCardHeader>

                                                        {/* 🔸 EXERCISE BODY */}
                                                        {openExercise === `${tIndex}-${eIndex}` && (
                                                            <CCardBody>

                                                                <CTable bordered hover responsive small>
                                                                    <CTableHead color="light">
                                                                        <CTableRow>
                                                                            <CTableHeaderCell>Sessions</CTableHeaderCell>
                                                                            <CTableHeaderCell>Date</CTableHeaderCell>
                                                                            <CTableHeaderCell>Sets</CTableHeaderCell>
                                                                            <CTableHeaderCell>Reps</CTableHeaderCell>
                                                                            <CTableHeaderCell>Freq</CTableHeaderCell>
                                                                        </CTableRow>
                                                                    </CTableHead>

                                                                    <CTableBody>
                                                                        {sessions.map((date, i) => (
                                                                            <CTableRow key={i}>
                                                                                <CTableDataCell>{i + 1}</CTableDataCell>
                                                                                <CTableDataCell>
                                                                                    {date.toLocaleDateString()}
                                                                                </CTableDataCell>
                                                                                <CTableDataCell>{exe.sets}</CTableDataCell>
                                                                                <CTableDataCell>{exe.repetitions}</CTableDataCell>
                                                                                <CTableDataCell>{exe.frequency}</CTableDataCell>
                                                                            </CTableRow>
                                                                        ))}
                                                                    </CTableBody>
                                                                </CTable>

                                                            </CCardBody>
                                                        )}
                                                    </CCard>
                                                )
                                            })}

                                        </CCardBody>
                                    )}
                                </CCard>
                            ))}
                            {!isFollowUpPayment && showTable && (
                                <div className="mt-3 d-flex justify-content-end  ">
                                    <CButton style={{ backgroundColor: "var(--color-bgcolor)", color: "var(--color-black)" }} className="ms-2 mt-2" onClick={handleSubmit}>
                                        Submit & Print
                                    </CButton>
                                </div>

                            )}
                            {isFollowUpPayment && (
                                <div className="mt-3 d-flex justify-content-end">
                                    <CButton
                                        style={{ backgroundColor: "green", color: "white" }}
                                        onClick={handleSubmit}
                                    >
                                        Update Payment & Print
                                    </CButton>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>



            </CCard>
            {printData && (
                <  >

                    <PrintLetterHead>
                        {isFollowUpPayment ? (
                            <>
                                <div style={{ padding: "20px", fontFamily: "Arial" }}>

                                    {/* TITLE */}
                                    <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
                                        Payment Receipt
                                    </h2>

                                    <hr />

                                    {/* 🔹 INVOICE TITLE */}
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>

                                        <div>
                                            <b>Date:</b> {new Date().toLocaleDateString()} <br />
                                            <b>Receipt No:</b> #{bookingId}
                                        </div>
                                    </div>

                                    {/* 🔹 PATIENT DETAILS */}
                                    <table style={{ width: "100%", marginBottom: "10px", fontSize: "13px" }}>
                                        <tbody>
                                            <tr>
                                                <td><b>Patient ID</b></td>
                                                <td>: {patientId}</td>
                                                <td><b>Doctor</b></td>
                                                <td>: {data.doctorName}</td>
                                            </tr>
                                            <tr>
                                                <td><b>Program</b></td>
                                                <td>: {data.programName}</td>
                                                <td><b>Payment Mode</b></td>
                                                <td>: {paymentMode}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* 🔹 PAYMENT SUMMARY TABLE */}
                                    <table
                                        border="1"
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            textAlign: "center",
                                            fontSize: "13px"
                                        }}
                                    >
                                        <thead style={{ background: "#f2f2f2" }}>
                                            <tr>
                                                <th>Description</th>
                                                <th>Amount (₹)</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr>
                                                <td>Total Amount</td>
                                                <td>{data.programyCost}</td>
                                            </tr>
                                            <tr>
                                                <td>Discount</td>
                                                <td>- {discountAmount}</td>
                                            </tr>
                                            <tr>
                                                <td><b>Final Amount</b></td>
                                                <td><b>{finalAmount}</b></td>
                                            </tr>
                                            <tr>
                                                <td>Previously Paid</td>
                                                <td>{previousPaid}</td>
                                            </tr>
                                            <tr>
                                                <td>Paid Now</td>
                                                <td>{paymentAmount}</td>
                                            </tr>
                                            <tr>
                                                <td><b>Total Paid</b></td>
                                                <td><b>{previousPaid + paymentAmount}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Balance</b></td>
                                                <td><b>{balanceAmount}</b></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* 🔹 FOOTER */}
                                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <p style={{ fontSize: "12px" }}>
                                                * This is a computer generated receipt.
                                            </p>
                                        </div>


                                    </div>

                                </div>
                            </>
                        ) : (
                            <>
                                <h4 style={{ color: "black", marginBottom: "10px" }}>
                                    Patient Details
                                </h4>

                                <table style={{ width: "100%", fontSize: "13px", color: "black" }}>
                                    <tbody>
                                        <tr>
                                            <td><b>Name</b></td>
                                            <td>: Prashanth</td>
                                            <td><b>Mobile</b></td>
                                            <td>: 9876543210</td>
                                        </tr>
                                        <tr>
                                            <td><b>Program</b></td>
                                            <td>: {data.programName}</td>
                                            <td><b>Therapist</b></td>
                                            <td>: Dr. John (Physio)</td>
                                            <td><b>Program Cost</b></td>
                                            <td>: {printData.totalAmount}</td>
                                        </tr>
                                    </tbody>
                                </table>




                                <hr />






                                {data.therophyData.map((therapy, tIndex) => (
                                    <div key={tIndex} style={{ marginBottom: "20px" }}>

                                        {/* 🔹 THERAPY */}
                                        <div
                                            style={{
                                                background: "#f2f2f2",
                                                padding: "6px",
                                                fontWeight: "bold",
                                                color: "black",
                                                border: "1px solid black",
                                            }}
                                        >
                                            {therapy.therapyName}
                                        </div>

                                        {therapy.exercises.map((exe, eIndex) => {
                                            const sessions = generateSessionPlan(
                                                startDate,
                                                exe.noOfSessions,
                                                exe.frequency
                                            )

                                            return (
                                                <div key={eIndex} style={{ marginTop: "10px" }}>

                                                    {/* 🔸 EXERCISE */}
                                                    <div
                                                        style={{
                                                            padding: "5px 10px",
                                                            color: "black",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        ▶ {exe.exerciseName}
                                                    </div>

                                                    {/* 🔸 TABLE */}
                                                    <table
                                                        border="1"
                                                        width="100%"
                                                        cellPadding="6"
                                                        style={{
                                                            borderCollapse: "collapse",
                                                            fontSize: "12px",
                                                            color: "black",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <thead style={{ background: "#eaeaea" }}>
                                                            <tr>
                                                                <th>Sessions</th>
                                                                <th>Date</th>
                                                                <th>Sets</th>
                                                                <th>Reps</th>
                                                                <th>Freq</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {sessions.map((date, i) => (
                                                                <tr key={i}>
                                                                    <td>{i + 1}</td>
                                                                    <td>{date.toLocaleDateString()}</td>
                                                                    <td>{exe.sets}</td>
                                                                    <td>{exe.repetitions}</td>
                                                                    <td>{exe.frequency}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>

                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}


                                <br />
                                <CCard className="mb-3 shadow-sm">
                                    <CCardHeader className="fw-bold">Payment Details</CCardHeader>
                                    <CCardBody>
                                        <CRow>
                                            <CCol md={3}><b>Total:</b> ₹{data.programyCost}</CCol>
                                            <CCol md={3}><b>Discount (%):</b> {discountAmount}</CCol>
                                            <CCol md={3}><b>Final:</b> ₹{finalAmount}</CCol>
                                            <CCol md={3}><b>Paid:</b> ₹{previousPaid}</CCol>
                                            <CCol md={3}><b>Balance:</b> ₹{balanceAmount}</CCol>
                                        </CRow>
                                    </CCardBody>
                                </CCard>

                                {/* 🔹 PAYMENT SUMMARY */}
                                {/* <h4 style={{ color: "black", marginBottom: "10px" }}>
                            Payment Summary
                        </h4>

                        <table
                            style={{
                                width: "40%",
                                fontSize: "13px",
                                color: "black",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td><b>Total Amount</b></td>
                                    <td>: ₹{printData.totalAmount}</td>
                                </tr>
                                <tr>
                                    <td><b>Discount</b></td>
                                    <td>: {discountAmount}%</td>
                                </tr>
                                <tr>
                                    <td><b>Final Amount</b></td>
                                    <td>: ₹{printData.finalAmount}</td>
                                </tr>
                                <tr>
                                    <td><b>Paid</b></td>
                                    <td>: ₹{printData.paidAmount}</td>
                                </tr>
                            </tbody>
                        </table> */}
                            </>   // existing full print (sessions + details)
                        )}

                    </PrintLetterHead>

                    {/* 🔹 PRINT BUTTON */}
                    <div className="text-center mt-3 no-print">
                        <CButton
                            color="dark"
                            onClick={() => {
                                window.print()

                                setTimeout(() => {
                                    setPrintData(null)
                                }, 500)
                            }}
                        >
                            Print
                        </CButton>
                        <CButton color="secondary" className="ms-2" onClick={handleCancel}>
                            Cancel
                        </CButton>
                    </div>
                </>
            )}
            <CModal size="xl" visible={viewModal} onClose={() => setViewModal(false)} className="custom-modal">
                <CModalHeader>
                    <CModalTitle>Program Details</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    {/* 🔹 Program Summary */}
                    <CCard className="mb-3 shadow-sm">
                        <CCardBody>
                            <CRow>
                                <CCol md={4}>
                                    <strong>Program:</strong> {data.programName}
                                </CCol>
                                <CCol md={4}>
                                    <strong>Total Cost:</strong> ₹{data.programyCost}
                                </CCol>
                                <CCol md={4}>
                                    <strong>Sessions:</strong> {data.noOfSessionCount}
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>

                    {/* 🔹 Payment Summary */}


                    {/* 🔹 Therapy Details */}
                    {data.therophyData.map((therapy, tIndex) => (
                        <CCard key={tIndex} className="mb-3 border shadow-sm">
                            <CCardHeader className="fw-bold">
                                {therapy.therapyName}
                            </CCardHeader>

                            <CCardBody>
                                {therapy.exercises.map((exe, eIndex) => (
                                    <div key={eIndex} className="mb-3 p-2 border rounded">

                                        <strong>▶ {exe.exerciseName}</strong>

                                        <CTable small bordered className="mt-2">
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell>Sessions</CTableHeaderCell>
                                                    <CTableHeaderCell>Sets</CTableHeaderCell>
                                                    <CTableHeaderCell>Reps</CTableHeaderCell>
                                                    <CTableHeaderCell>Frequency</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>

                                            <CTableBody>
                                                <CTableRow>
                                                    <CTableDataCell>{exe.noOfSessions}</CTableDataCell>
                                                    <CTableDataCell>{exe.sets}</CTableDataCell>
                                                    <CTableDataCell>{exe.repetitions}</CTableDataCell>
                                                    <CTableDataCell>{exe.frequency}</CTableDataCell>
                                                </CTableRow>
                                            </CTableBody>
                                        </CTable>
                                    </div>
                                ))}
                            </CCardBody>
                        </CCard>
                    ))}
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={() => setViewModal(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}