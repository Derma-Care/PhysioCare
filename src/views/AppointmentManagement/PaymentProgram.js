/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react"
import Select, { components } from "react-select";

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
import { getprogramsfromDoctors } from "../ProcedureManagement/ProgramApi"
import { BASE_URL } from "../../baseUrl";


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


   
    

    const [startDate, setStartDate] = useState("")
    const [paymentType, setPaymentType] = useState("full")
   const [paymentAmount, setPaymentAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [serviceType, setServiceType] = useState("");
    const [showTable, setShowTable] = useState(false)
    const [discountPercent, setDiscountPercent] = useState(0)
    const [printData, setPrintData] = useState(null)
    const [openTherapy, setOpenTherapy] = useState(null)
    const [openExercise, setOpenExercise] = useState(null)
    const [therapistRecordId, setTherapistRecordId] = useState(null);
    
    const [errors, setErrors] = useState({})
    const [viewModal, setViewModal] = useState(false)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [discountIssuedBy, setDiscountIssuedBy] = useState("")
    const [paymentHistory, setPaymentHistory] = useState([])
    const [previousPaid, setPreviousPaid] = useState(0) // from API
    const [balanceAmount, setBalanceAmount] = useState(finalAmount)
    const [isFollowUpPayment, setIsFollowUpPayment] = useState(false)
    const [paymentMode, setPaymentMode] = useState("cash")
    const [isFirstPayment, setIsFirstPayment] = useState(true)
const [paymentDate, setPaymentDate] = useState("")
const [programData, setProgramData] = useState(null)
const [loading, setLoading] = useState(false)
const [selectedType, setSelectedType] = useState("");
const [selectedValue, setSelectedValue] = useState([]);

const [optionsList, setOptionsList] = useState([]);

    const [paymentPercent, setPaymentPercent] = useState(100)
  const handleFinalAmountChange = (value) => {
  setFinalAmount(Number(value))
}
const totalAmount = Number(programData?.programCost || 0);
const formatTherapyTable = (data) => {
  const rows = []

  data.forEach((item) => {
    item.therapyData?.forEach((therapy, tIndex) => {
      therapy.exercises?.forEach((exercise, eIndex) => {
        exercise.sessions?.forEach((session, sIndex) => {
          rows.push({
            therapyId: therapy.therapyId || `therapy_${tIndex}`, // ✅ fallback
            therapyName: therapy.therapyName || "N/A",

            exerciseId: exercise.exerciseId || `exe_${eIndex}`,
            exerciseName: exercise.exerciseName || "N/A",

            date: session.date,
            sessionId: session.sessionId || `session_${sIndex}`,
            status: session.status,

            frequency: exercise.frequency,
            sets: exercise.sets,
            reps: exercise.repetitions,
          })
        })
      })
    })
  })

  return rows
}

const handleTypeChange = (type) => {
  setSelectedType(type);
  setSelectedValue([]);

  let data = [];

  // ✅ STEP 1: Extract therapies properly
  let therapies = [];

  if (serviceType === "package") {
    // 🔥 from therapySessions (optionsList has packages)
    therapies = optionsList
      ?.flatMap(pkg => pkg.programs || [])
      ?.flatMap(program => program.therapyData || []);
  } else {
    // normal flow
    therapies =
      programData?.therapyData ||
      programData?.therophyData ||
      [];
  }

  console.log("✅ Therapies:", therapies);

  // ✅ STEP 2: Switch logic
  switch (type) {
    case "program":
      if (serviceType === "package") {
        data = optionsList.flatMap(pkg => pkg.programs || []);
      } else {
        data = [programData];
      }
      break;

    case "therapy":
      data = therapies;
      break;

    case "exercise":
      data = therapies.flatMap(t => t.exercises || []);
      break;

    case "session":
      data = therapies.flatMap(t =>
        (t.exercises || []).flatMap(e =>
          generateSessionPlan(
            startDate,
            e.noOfSessions || e.session,   // 🔥 handle both keys
            e.frequency
          )
        )
      );
      break;

    case "package":
      data = optionsList || []; // already set from API
      break;

    default:
      data = [];
  }

  console.log("✅ Final optionsList:", data);

  setOptionsList(data);
};
const calculateFinalAmount = (discountAmt) => {
  const total = programData?.programCost

  let final = total - discountAmt

  if (final < 0) final = 0

  setFinalAmount(final)
}

const handleDiscountAmountChange = (value) => {
  let val = Number(value);

  if (isNaN(val) || val < 0) val = 0;
  if (val > totalAmount) val = totalAmount;

  const percent = totalAmount > 0 ? (val / totalAmount) * 100 : 0;

  setDiscountAmount(Number(val.toFixed(2)));
  setDiscount(Number(percent.toFixed(2)));
};

const handleDiscountChange = (value) => {
  let percent = Number(value);

  if (isNaN(percent) || percent < 0) percent = 0;
  if (percent > 100) percent = 100;

  const amount = (totalAmount * percent) / 100;

  setDiscount(percent);
  setDiscountAmount(Number(amount.toFixed(2)));
};
useEffect(() => {
  const final = totalAmount - discountAmount;
  setFinalAmount(final >= 0 ? Number(final.toFixed(2)) : 0);
}, [discountAmount, totalAmount]);


   useEffect(() => {
  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);

  setPreviousPaid(totalPaid);

  const balance = finalAmount - totalPaid;

  setBalanceAmount(balance >= 0 ? Number(balance.toFixed(2)) : 0);

}, [paymentHistory, finalAmount]);
 

  const handlePaymentType = (type) => {
  setPaymentType(type);

  const remaining = balanceAmount > 0 ? balanceAmount : finalAmount;

  if (type === "partial") {
    const half = remaining / 2;

    setPaymentAmount(Number(half.toFixed(2)));

    const percent =
      finalAmount > 0 ? (half / finalAmount) * 100 : 0;

    setPaymentPercent(Number(percent.toFixed(2)));
  } else {
    setPaymentAmount(remaining);

    const percent =
      finalAmount > 0 ? (remaining / finalAmount) * 100 : 0;

    setPaymentPercent(Number(percent.toFixed(2)));
  }
};
useEffect(() => {
  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);

  setPreviousPaid(totalPaid);

  const balance = finalAmount - totalPaid;

  setBalanceAmount(balance >= 0 ? Number(balance.toFixed(2)) : 0);
}, [paymentHistory, finalAmount]);
  
useEffect(() => {
  if (programData) {
   setPaymentAmount(totalAmount);
setFinalAmount(totalAmount);
  }
}, [programData])
useEffect(() => {
  if (serviceType) {
    handleTypeChange(serviceType);
    setSelectedType(serviceType); // auto select in UI
  }
}, [serviceType, programData]);
  const handleAmountChange = (value) => {
  let amount = Number(value);

  if (value === "") {
    setPaymentAmount("");
    return;
  }

  if (isNaN(amount) || amount < 0) amount = 0;

  // ❗ DON'T BLOCK typing
  if (amount > balanceAmount) {
    setErrors((prev) => ({
      ...prev,
      paymentAmount: "Cannot exceed remaining balance",
    }));
  } else {
    setErrors((prev) => ({
      ...prev,
      paymentAmount: "",
    }));
  }

  setPaymentAmount(amount);

  const percent =
    finalAmount > 0 ? (amount / finalAmount) * 100 : 0;

  setPaymentPercent(Number(percent.toFixed(2)));
};
   

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
  } else if (discountAmount > programData?.programCost) {
    err.discountAmount = "Discount cannot exceed total cost"
  }
  if (discountAmount > (programData?.programCost || 0)) {
  err.discountAmount = "Discount cannot exceed total cost"
}

  const isDiscountApplied = discountAmount > 0
  const isLowPayment = paymentPercent < 50   // ✅ FIXED

  if ((isDiscountApplied || isLowPayment) && !discountIssuedBy) {
    err.discountIssuedBy = "Approval required for discount or <50% payment"
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
  const handlePercentChange = (value) => {
  let percent = Number(value)

  if (percent > 100) {
    percent = 100
  }

  if (percent < 0) {
    percent = 0
  }

  setPaymentPercent(percent)

  // ✅ Optional validation message
  setErrors((prev) => ({
    ...prev,
    paymentPercent:
      percent > 100 ? "Cannot exceed 100%" : ""
  }))
}
    const prepareTherapyDataWithSessions = () => {
        return {
            doctorName: programData?.doctorName,
            doctorId: programData?.doctorId,
            therapistName: programData?.therapistName,
            therapistId: programData?.therapistId,
            therapistRecordId: programData?.therapistRecordId,
            programName: programData?.programName,
            programId: programData?.programId,
            noOfSessionCount: programData?.noOfSessionCount,
            noTherapyCount: programData?.noTherapyCount,

            therophyData: programData?.therapyData?.map((therapy) => ({
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
     useEffect(() => {
  if (clinicId && branchId && patientId && bookingId) {
    fetchProgramDetails()
  }
}, [clinicId, branchId, patientId, bookingId])
const fetchProgramDetails = async () => {
  try {
    setLoading(true);

    const response = await getprogramsfromDoctors(
      clinicId,
      branchId,
      patientId,
      bookingId
    );

    const res = response.data;

    if (!res.success) return;

    // ✅ SET SERVICE TYPE (MAIN PART)
    setServiceType(res.serviceType);
    setTherapistRecordId(res.data?.therapistRecordId);
    const sessions = res.data?.therapySessions || [];

    // ✅ SET DATA
    if (res.serviceType === "package") {
  setOptionsList(sessions); // packages
  setProgramData(null);
} else {
  // flatten programs
  const programs = sessions.flatMap(pkg => pkg.programs || []);
  setProgramData(programs[0]); // or full list if needed
}

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
const Option = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: 8 }}
      />
      {props.label}
    </components.Option>
  );
};
const formattedOptions = optionsList.map((item) => {
  let label = "";

  if (selectedType === "program") {
    label = item.programName;
  } else if (selectedType === "therapy") {
    label = item.therapyName;
  } else if (selectedType === "exercise") {
    label = item.exerciseName;
  } 
  else if (selectedType === "package") {
    label = item.packageName;
  }

  return {
    value: item,   // ✅ full object
    label: label,
  };
});
const handleOpenProgramDetails = async () => {
  console.log("Calling API with:", {
    clinicId,
    branchId,
    patientId,
    bookingId
  })

  await fetchProgramDetails()
  setViewModal(true)
}
    const handleSubmit = () => {

        const therapyWithSessions = prepareTherapyDataWithSessions()

        const payload = {
            clinicId: localStorage.getItem("HospitalId"), //clinicId,
            branchId: localStorage.getItem("branchId"), //branchId,
            bookingId: bookingId,
            patientId: patientId,
            therapistRecordId: programData?.therapistRecordId,
            overallpaymentPercent: programData?.overallpaymentPercent, //backend - GET
            paymentStatus: balanceAmount === 0 ? "Paid" : "Partial", //backend - GET
            totalAmount: Number(programData?.programCost || 0), //backend - GET
            finalAmount: finalAmount,   //backend - GET
            paidAmount: paymentAmount,
            previousPaid: previousPaid, //backend - GET
            totalPaid: previousPaid + paymentAmount, //backend - GET
            discount: discount,
            discountAmount: discountAmount, // for backend - GET
            balanceAmount: finalAmount - (previousPaid + paymentAmount), //backend will calculate this based on payments received - GET
            dueAmount: finalAmount - (previousPaid + paymentAmount), //backend - GET
            sessionStartDate: new Date().toLocaleDateString(),
            noOfSessionCompletedCount: programData?.noOfSessionCompletedCount, //get this from session data which is updated therapist side you will get in session status completed - GET
            noOfSessionCompletedStatus: false, //  default it is false when 50% session completed and there are due amount then only it will be true - GET
            sessionTableCreatedStatus: true, //  default it is false - GET
            totalSessionCount: programData?.totalSessionCount, //backend - GET
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
            therapyWithSessions: therapyWithSessions, 
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
       setPaymentAmount(totalAmount)
setFinalAmount(totalAmount)
    }
    useEffect(() => {
  if (paymentHistory && paymentHistory.length > 0) {
    setIsFirstPayment(false)
    setPaymentDate(paymentHistory[0]?.paymentDate) // or latest
  }
}, [paymentHistory])
useEffect(() => {
  if (paymentPercent < 50 && !discountIssuedBy) {
    setErrors((prev) => ({
      ...prev,
      discountIssuedBy: "Approval required for <50% payment"
    }))
  } else {
    setErrors((prev) => ({
      ...prev,
      discountIssuedBy: ""
    }))
  }
}, [paymentPercent, discountIssuedBy])

   const handleGenerate = async () => {
  console.log("Generate clicked")

  // const isValid = validate()
  // console.log("Validation result:", isValid)

  // if (!isValid) return

  const payload = {
    clinicId: localStorage.getItem("HospitalId"),
    branchId: localStorage.getItem("branchId"),
    bookingId,
    patientId,
    startDate,
    therapistRecordId:programData?.therapistRecordId,
  }

  console.log("Payload:", payload)

  try {
    console.log("Calling API...")

    const response = await fetch(`${BASE_URL}/generate-table`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    console.log("API Response:", data)

    setShowTable(true)

  } catch (error) {
    console.error("API Error:", error)
  }
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
        setPaymentAmount(totalAmount)
        setShowTable(false)
        setPrintData(null)
        setErrors({})
    }
    return (
        <>
            <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">


                  {selectedType !== "package" && (
  <h5 className="mb-0">{programData?.programName}</h5>
)}

                    <CButton
                        size="sm"
                        style={{ backgroundColor: "var(--color-bgcolor)", color: "var(--color-black)" }}
                      onClick={handleOpenProgramDetails} 
                    >
                        Program Details
                    </CButton>
                </CCardHeader>

                <CCardBody>
                    {/* INPUT SECTION */}
                    <CRow className="mb-3">
                     <CCol md={3}>
  <CFormLabel>Start Date</CFormLabel>

  <CFormInput
    type="date"
    value={isFirstPayment ? startDate : paymentDate}
    onChange={(e) => {
      if (isFirstPayment) {
        setStartDate(e.target.value)

        // ✅ clear error
        setErrors((prev) => ({ ...prev, startDate: "" }))
      }
    }}
    disabled={!isFirstPayment} // 🔒 lock after first payment
  />

  {errors.startDate && (
    <small style={{ color: "red" }}>{errors.startDate}</small>
  )}
</CCol>
<CCol md={3}>
  <CFormLabel>Service Type</CFormLabel>

<CFormSelect
  value={selectedType}
  onChange={(e) => handleTypeChange(e.target.value)}
>
  <option value="">Select Type</option>

  {serviceType === "program" && <option value="program">Program</option>}
  {serviceType === "therapy" && <option value="therapy">Therapy</option>}
  {serviceType === "exercise" && <option value="exercise">Exercise</option>}
  {serviceType === "package" && <option value="package">Package</option>}
</CFormSelect>
</CCol>
<CCol md={4}>
  <CFormLabel>Select Value</CFormLabel>

  <Select
    isMulti
    options={formattedOptions}
    components={{ Option }} // ✅ checkbox added
    closeMenuOnSelect={false}
    hideSelectedOptions={false}
 value={selectedValue}
  onChange={(selected) => {
  const selectedItems = selected || [];

  setSelectedValue(selectedItems);

  let total = 0;

  selectedItems.forEach((item) => {
    const val = item.value;

    if (selectedType === "therapy") {
     total += Number(val.totalPrice || 0);
    } else if (selectedType === "exercise") {
      total += Number(val.totalSessionCost || 0);
    } else if (selectedType === "package") {
      total += Number(val.packageCost || 0);
    }
  });

  setFinalAmount(total);
  setPaymentAmount(total);
}}
    placeholder="Select..."
  />
</CCol>

                        <CCol md={3}>
                            <CFormLabel>Payment Type</CFormLabel>
                            <CFormSelect
                                value={paymentType}
                                onChange={(e) => handlePaymentType(e.target.value)}
                            >
                                <option value="full">Full</option>
                                <option value="partial">Partial</option>
                            </CFormSelect>
                        </CCol>

                      <CCol md={3}>
  <CFormLabel>Payment Amount</CFormLabel>

  <CFormInput
    type="number"
    value={paymentAmount ?? ""}
    onChange={(e) => {
      handleAmountChange(e.target.value);

      // ✅ correct error clear
      setErrors((prev) => ({
        ...prev,
        paymentAmount: ""
      }));
    }}
  />

  {errors.paymentAmount && (
    <small style={{ color: "red" }}>
      {errors.paymentAmount}
    </small>
  )}
</CCol>
                        <CCol md={3}>
  <CFormLabel >Payment Percent</CFormLabel>

  <CFormInput
    type="number"
    value={paymentPercent}
    min={0}
    max={100}
    onChange={(e) => handlePercentChange(e.target.value)}
  />

  {errors.paymentPercent && (
    <small style={{ color: "red" }}>{errors.paymentPercent}</small>
  )}
</CCol>
                        <CRow className="mt-3">
                            <CCol md={4}>
  <CFormLabel >Discount %</CFormLabel>

  <CFormInput
    type="number"
    value={discount}
    min={0}
    max={100}
    onChange={(e) => handleDiscountChange(e.target.value)}
  />

  {errors.discount && (
    <small style={{ color: "red" }}>{errors.discount}</small>
  )}
</CCol>
                            <CCol md={4}>
                                <CFormLabel >Discount Amount</CFormLabel>
                                <CFormInput
                                    type="number"
                                    value={discountAmount}
                                    onChange={(e) => handleDiscountAmountChange(e.target.value)}
                                />
                                {errors.discountAmount && (
                                    <small style={{ color: "red" }}>{errors.discountAmount}</small>
                                )}

                            </CCol>
                             <CCol md={4}>
                                <CFormLabel >Final Amount</CFormLabel>
                                <CFormInput
                                    type="number"
                                    value={finalAmount}
                                    onChange={(e) => handleFinalAmountChange(e.target.value)}
                                />
                                {errors.finalAmount && (
                                    <small style={{ color: "red" }}>{errors.finalAmount}</small>
                                )}

                            </CCol>
                            <CCol md={4}>
                                <CFormLabel >Approved By (Discount / Low Payment)</CFormLabel>
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
                                <CFormLabel >Payment Mode</CFormLabel>
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

                               {showTable && (
  <CTable small bordered className="mt-3 pink-table" responsive>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell>S.No</CTableHeaderCell>
        <CTableHeaderCell>Therapy</CTableHeaderCell>
        <CTableHeaderCell>Exercise</CTableHeaderCell>
        <CTableHeaderCell>Date</CTableHeaderCell>
        <CTableHeaderCell>Session ID</CTableHeaderCell>
        <CTableHeaderCell>Status</CTableHeaderCell>
        <CTableHeaderCell>Frequency</CTableHeaderCell>
        <CTableHeaderCell>Sets</CTableHeaderCell>
        <CTableHeaderCell>Reps</CTableHeaderCell>
        <CTableHeaderCell>Payment Status</CTableHeaderCell>

      </CTableRow>
    </CTableHead>

    <CTableBody>
      {tableData.map((row, i) => (
        <CTableRow key={i}>
          <CTableDataCell>{i + 1}</CTableDataCell>
          <CTableDataCell>{row.therapyName}</CTableDataCell>
          <CTableDataCell>{row.exerciseName}</CTableDataCell>
          <CTableDataCell>{row.date}</CTableDataCell>
          <CTableDataCell>{row.sessionId}</CTableDataCell>
          <CTableDataCell>
            <span style={{
              color: row.status === "Pending" ? "orange" : "green",
              fontWeight: "600"
            }}>
              {row.status}
            </span>
          </CTableDataCell>
          <CTableDataCell>{row.frequency}</CTableDataCell>
          <CTableDataCell>{row.sets}</CTableDataCell>
          <CTableDataCell>{row.reps}</CTableDataCell>
          <CTableDataCell>{row.paymentStatus}</CTableDataCell>
        </CTableRow>  
      ))}
    </CTableBody>
  </CTable>
)}
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
                            <h5 className="mt-4 fw-bold">{programData.programName}</h5>

                            {programData?.therapyData .map((therapy, tIndex) => (
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
                                                <td>: {programData?.doctorName}</td>
                                            </tr>
                                            <tr>
                                                <td><b>Program</b></td>
                                                <td>: {programData?.programName}</td>
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
                                                <td>{programData.programCost}</td>
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
                                            <td>: {programData?.programName}</td>
                                            <td><b>Therapist</b></td>
                                            <td>: Dr. John (Physio)</td>
                                            <td><b>Program Cost</b></td>
                                            <td>: {printData.totalAmount}</td>
                                        </tr>
                                    </tbody>
                                </table>




                                <hr />






                                {programData?.therapyData.map((therapy, tIndex) => (
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
                                            <CCol md={3}><b>Total:</b> ₹{programData?.programCost}</CCol>
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
           <CModal
  size="xl"
  visible={viewModal}
  onClose={() => setViewModal(false)}
  className="custom-modal"
>
  <CModalHeader>
    <CModalTitle>Program Details</CModalTitle>
  </CModalHeader>

  <CModalBody>

    {/* 🔹 LOADING STATE */}
    {loading && (
      <div className="text-center my-4">
        <strong>Loading program details...</strong>
      </div>
    )}

    {/* 🔹 NO DATA */}
    {!loading && !programData && (
      <div className="text-center text-danger my-4">
        No Program Data Found
      </div>
    )}

    {/* 🔹 MAIN DATA */}
    {!loading && programData && (
      <>
        {/* 🔹 Program Summary */}
        <CCard className="mb-3 shadow-sm">
          <CCardBody>
            <CRow>
              <CCol md={4}>
                <strong>Program:</strong> {programData?.programName}
              </CCol>
              <CCol md={4}>
                <strong>Total Cost:</strong> ₹{programData?.programCost}
              </CCol>
              <CCol md={4}>
                <strong>Sessions:</strong> {programData?.noOfSessionCount}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* 🔹 Therapy Details */}
        {programData?.therophyData?.length > 0 ? (
          programData.therophyData.map((therapy, tIndex) => (
            <CCard key={tIndex} className="mb-3 border shadow-sm">

              {/* 🔸 Therapy Header */}
              <CCardHeader className="fw-bold bg-light">
                {therapy.therapyName}
              </CCardHeader>

              {/* 🔸 Therapy Body */}
              <CCardBody>

                {therapy.exercises?.length > 0 ? (
                  therapy.exercises.map((exe, eIndex) => (
                    <div
                      key={eIndex}
                      className="mb-3 p-3 border rounded"
                      style={{ background: "#fafafa" }}
                    >

                      {/* Exercise Name */}
                      <strong>▶ {exe.exerciseName}</strong>

                      {/* Exercise Details */}
                      <CRow className="mt-2">
                        <CCol md={3}>
                          <small><b>Sessions:</b> {exe.noOfSessions}</small>
                        </CCol>

                        <CCol md={3}>
                          <small><b>Sets:</b> {exe.sets}</small>
                        </CCol>

                        <CCol md={3}>
                          <small><b>Reps:</b> {exe.repetitions}</small>
                        </CCol>

                        <CCol md={3}>
                          <small><b>Frequency:</b> {exe.frequancy}</small>
                        </CCol>
                      </CRow>

                      {/* Optional Notes */}
                      {exe.notes && (
                        <div className="mt-2">
                          <small><b>Notes:</b> {exe.notes}</small>
                        </div>
                      )}

                      {/* Optional Video */}
                      {exe.videoUrl && exe.videoUrl !== "please keep url" && (
                        <div className="mt-2">
                          <a
                            href={exe.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            ▶ Watch Video
                          </a>
                        </div>
                      )}

                    </div>
                  ))
                ) : (
                  <div className="text-muted">No Exercises Found</div>
                )}

              </CCardBody>
            </CCard>
          ))
        ) : (
          <div className="text-center text-muted">
            No Therapy Data Available
          </div>
        )}
      </>
    )}

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