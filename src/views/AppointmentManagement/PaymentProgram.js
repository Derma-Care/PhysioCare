import React, { useState, useEffect } from "react";
import {
  CRow, CCol, CFormInput, CFormLabel, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CCard, CCardHeader, CCardBody,
  CFormSelect
} from "@coreui/react";
import Select from "react-select";
import { BASE_URL, wifiUrl } from "../../baseUrl";
import { useLocation, useNavigate } from "react-router-dom";

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


  // const USE_DUMMY = true;

  // 🔥 STATES
  const [startDate, setStartDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [fullPaymentData, setFullPaymentData] = useState([])
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("");
const [therapistId, setTherapistId] = useState("");
const [therapistName, setTherapistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [therapistRecordId, setTherapistRecordId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
const [selectedTherapy, setSelectedTherapy] = useState(null);
const [selectedExercise, setSelectedExercise] = useState(null);

  const [selectedType, setSelectedType] = useState("");
  const [selectedValue, setSelectedValue] = useState([]);
  const [paymentType, setPaymentType] = useState("full");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentPercent, setPaymentPercent] = useState(100);
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [discountIssuedBy, setDiscountIssuedBy] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");


  const [isFollowUpPayment, setIsFollowUpPayment] = useState(false);
  useEffect(() => {
  if (apiData?.length && !selectedType) {
    const types = getServiceTypes();
    if (types.length) {
      setSelectedType(types[0]); // ✅ auto select first
    }
  }
}, [apiData]);


  // 🔥 DUMMY DATA
  //  const dummyGenerateResponse = {
  //   data: [
  //     {
  //       programs: [
  //         {
  //           programName: "PROGRAM_1",
  //           therapyData: [
  //             {
  //               therapyName: "THERAPY_1",
  //               exercises: [
  //                 {
  //                   exerciseName: "Knee Flexion",
  //                   totalExercisePrice: 100,
  //                   sessions: [
  //                     {
  //                       sessionId: "E1_1",
  //                       sessionNo: 1,
  //                       date: "14/04/2026",
  //                       status: "Pending",
  //                       paymentStatus: "Unpaid",
  //                     },
  //                     {
  //                       sessionId: "E1_2",
  //                       sessionNo: 2,
  //                       date: "15/04/2026",
  //                       status: "Pending",
  //                       paymentStatus: "Paid",
  //                     },
  //                     {
  //                       sessionId: "E1_3",
  //                       sessionNo: 3,
  //                       date: "16/04/2026",
  //                       status: "Pending",
  //                       paymentStatus: "Unpaid",
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //         },

  //         {
  //           programName: "PROGRAM_2",
  //           therapyData: [
  //             {
  //               therapyName: "THERAPY_2",
  //               exercises: [
  //                 {
  //                   exerciseName: "Shoulder Flexion",
  //                   totalExercisePrice: 150,
  //                   sessions: [
  //                     {
  //                       sessionId: "E2_1",
  //                       sessionNo: 1,
  //                       date: "14/04/2026",
  //                       status: "Pending",
  //                       paymentStatus: "Unpaid",
  //                     },
  //                     {
  //                       sessionId: "E2_2",
  //                       sessionNo: 2,
  //                       date: "15/04/2026",
  //                       status: "Pending",
  //                       paymentStatus: "Unpaid",
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // };
  useEffect(() => {
    if (bookingId && patientId && clinicId && branchId) {
      fetchTherapySessions();
    }
  }, [bookingId, patientId, clinicId, branchId]);
  const fetchTherapySessions = async () => {
    try {
      const res = await fetch(
        `${wifiUrl}/api/physiotherapy-doctor/getTherapySessionsByServiceType/${clinicId}/${branchId}/${patientId}/${bookingId}`
      );

      const data = await res.json();
      console.log("API RESPONSE:", data);
      console.log("SERVICE TYPES:", getServiceTypes());
console.log("SELECTED TYPE:", selectedType);

      const apiResponse = data?.data || [];

      setApiData(apiResponse);
      setDoctorName(apiResponse?.[0]?.doctorName || "");
setTherapistId(apiResponse?.[0]?.therapistId || "");
setTherapistName(apiResponse?.[0]?.therapistName || "");

      // ✅ ADD THIS LINE (CRITICAL FIX)
      setTherapistRecordId(apiResponse?.[0]?.therapistRecordId || "");

    } catch (error) {
      console.error("API Error:", error);
    }
  };
  useEffect(() => {
  if (apiData?.length && !selectedType) {
    setSelectedType("package"); // 🔥 MUST
  }
}, [apiData]);
 const getServiceTypes = () => {
  const types = new Set();

  (apiData || []).forEach(item => {
    if (item.therapySessions?.length) types.add("program");

    item.therapySessions?.forEach(program => {
      if (program.therapyData?.length) types.add("therapy");

      program.therapyData?.forEach(therapy => {
        if (therapy.exercises?.length) types.add("exercise");

        therapy.exercises?.forEach(ex => {
          if (ex.noOfSessions) types.add("session");
        });
      });
    });
  });

  // ✅ ALWAYS FIRST
  const orderedTypes = ["package", ...types];

  return [...new Set(orderedTypes)];
};
 const getOptionsByType = () => {
  if (!apiData?.length) return [];

  const item = apiData[0];

  switch (selectedType) {

    // 🔹 PACKAGE → NO VALUES
    case "package":
      return ;

    // 🔹 PROGRAM → SHOW PROGRAM NAMES
    case "program":
      return (item.therapySessions || []).map(p => ({
        label: p.programName,
        value: p.programId,
        price: p.totalPrice,
      }));

    // 🔹 THERAPY → SHOW THERAPIES
    case "therapy":
      return (item.therapySessions || []).flatMap(p =>
        (p.therapyData || []).map(t => ({
          label: t.therapyName,
          value: t.therapyId,
          price: t.totalPrice,
        }))
      );

    // 🔹 EXERCISE → SHOW EXERCISES
    case "exercise":
      return (item.therapySessions || []).flatMap(p =>
        (p.therapyData || []).flatMap(t =>
          (t.exercises || []).map(e => ({
            label: e.exerciseName,
            value: e.exerciseId,
            price: e.totalSessionCost,
          }))
        )
      );

    // 🔹 SESSION → SHOW SESSIONS
    case "session":
      return (item.therapySessions || []).flatMap(p =>
        (p.therapyData || []).flatMap(t =>
          (t.exercises || []).flatMap(e =>
            Array.from(
              { length: e.noOfSessions || 1 },
              (_, i) => ({
                label: `${e.exerciseName} - Session ${i + 1}`,
                value: `${e.exerciseId}_${i + 1}`,
                price: e.pricePerSession,
              })
            )
          )
        )
      );

    default:
      return [];
  }
};
const handleSelectValue = (selected) => {
  const selectedItems = selected || [];
  setSelectedValue(selectedItems);

  const item = selectedItems[0]; // use first item

  // 🔥 CASCADE LOGIC
  if (selectedType === "package") {
    setSelectedProgram(item?.data);
    setSelectedTherapy(null);
    setSelectedExercise(null);
  }

  if (selectedType === "program") {
    setSelectedTherapy(item?.data);
    setSelectedExercise(null);
  }

  if (selectedType === "therapy") {
    setSelectedExercise(item?.data);
  }

  // 🔥 TOTAL CALCULATION
  const total = selectedItems.reduce(
    (sum, i) => sum + Number(i.price || 0),
    0
  );

  setPaymentAmount(total);
  setFinalAmount(total);
};
  // const bookingId = "B001";
  // const patientId = "P001";

  // const doctorId = "D001";
  // const doctorName = "Dr. Test";

  // const therapistId = "T001";
  // const therapistName = "Therapist Test";
  // const therapistRecordId = "TR001";


  // 🔥 FORMAT TABLE
  const formatTherapyTable = (data = []) => {
    const rows = [];

    if (!Array.isArray(data)) return rows;

    data.forEach((item) => {
      console.log("ITEM:", item); // 👈 DEBUG

      (item.therapySessions || []).forEach((program) => {
        console.log("PROGRAM:", program); // 👈 DEBUG

        (program.therapyData || []).forEach((therapy) => {
          (therapy.exercises || []).forEach((exercise) => {
            const count = exercise.noOfSessions || 1;

            for (let i = 1; i <= count; i++) {
              rows.push({
                programName: program.programName,
                therapyName: therapy.therapyName,
                exerciseName: exercise.exerciseName,

                sessionNo: i,
                date: "-",
                status: "Planned",
                paymentStatus: "Unpaid",

                sets: exercise.sets,
                repetitions: exercise.repetitions,
                frequency: exercise.frequancy,
                notes: exercise.notes,
                price: exercise.pricePerSession,
              });
            }
          });
        });
      });
    });

    return rows;
  };

  // 🔥 GENERATE
  const handleGenerate = async () => {
    try {
      setLoading(true);

      const payload = {
        startDate,
        clinicId,
        branchId,
        patientId,
        bookingId,
        therapistRecordId, // ✅ ADD THIS
      };

      console.log("GENERATE PAYLOAD:", payload);

      const res = await fetch(`${BASE_URL}/generate-table`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("GENERATE API RESPONSE:", data);

      const apiResponse = Array.isArray(data?.data) ? data.data : [];

      // setApiData(apiResponse);

      const formatted = formatTherapyTable(apiResponse);
      console.log("TABLE DATA:", formatted);
      setTableData(formatted);
      setShowTable(true);

    } catch (error) {
      console.error("Generate API Error:", error);
    } finally {
      setLoading(false);
    }
  };
  // 🔥 DROPDOWN OPTIONS (STATIC FOR NOW)

  // 🔥 SELECT VALUE
 
const handleTypeChange = (type) => {
  setSelectedType(type);
  setSelectedValue([]);

  setSelectedProgram(null);
  setSelectedTherapy(null);
  setSelectedExercise(null);

  // 🔥 PACKAGE PRICE LOGIC
  if (type === "package") {
    const packagePrice = apiData?.[0]?.total || 0;

    setPaymentAmount(packagePrice);
    setFinalAmount(packagePrice);
  } else {
    setPaymentAmount(0);
    setFinalAmount(0);
  }
};
  const buildTherapyPayload = () => {
  if (!apiData?.length) return [];

  return apiData.map(item => ({
    packageId: item.packageId,
    packageName: item.packageName,

    programs: (item.therapySessions || []).map(program => ({
      programId: program.programId,
      programName: program.programName,

      therapyData: (program.therapyData || []).map(therapy => ({
        therapyId: therapy.therapyId,
        therapyName: therapy.therapyName,

        exercises: (therapy.exercises || []).map(ex => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          pricePerSession: ex.pricePerSession,
          noOfSessions: ex.noOfSessions
        }))
      }))
    }))
  }));
};
  const createPayloadData = {
    clinicId: localStorage.getItem("HospitalId"),
    branchId: localStorage.getItem("branchId"),
    bookingId,
    patientId,

    doctorId: doctorId ,
    doctorName: doctorName,

    therapistId: therapistId,
    therapistName: therapistName,
    therapistRecordId: therapistRecordId,

    serviceType: selectedType?.toUpperCase(),

    amount: Number(finalAmount || 0),
    paymentMode: paymentMode?.toUpperCase(),
    paymentType: paymentType?.toUpperCase(),

    discountAmount: Number(discountAmount || 0),
    discountIssuedBy,

    paymentLevel: selectedType?.toUpperCase(),

    paymentTarget: {
      packageIds:
        selectedType === "package"
          ? selectedValue.map((i) => i.value || i.packageId)
          : [],

      programIds:
        selectedType === "program"
          ? selectedValue.map((i) => i.value || i.programId)
          : [],

      therapyIds:
        selectedType === "therapy"
          ? selectedValue.map((i) => i.value || i.therapyId)
          : [],

      exerciseIds:
        selectedType === "exercise"
          ? selectedValue.map((i) => i.value || i.exerciseId)
          : [],

      sessionIds: [],
    },

    paymentDate: new Date().toISOString().split("T")[0],

    therapyWithSessions: buildTherapyPayload(),
  };

  const updatePayload = {
    clinicId: localStorage.getItem("HospitalId"),
    branchId: localStorage.getItem("branchId"),
    bookingId,
    patientId,

    doctorId,
    doctorName,

    therapistId,
    therapistName,
    therapistRecordId,

    serviceType: selectedType?.toUpperCase(),

    amount: Number(finalAmount || 0),
    paymentMode: paymentMode?.toUpperCase(),
    paymentType: paymentType?.toUpperCase(),

    paymentLevel: selectedType?.toUpperCase(),

    paymentTarget: {
      packageIds:
        selectedType === "package"
          ? selectedValue.map((i) => i.value || i.packageId)
          : [],

      programIds:
        selectedType === "program"
          ? selectedValue.map((i) => i.value || i.programId)
          : [],

      therapyIds:
        selectedType === "therapy"
          ? selectedValue.map((i) => i.value || i.therapyId)
          : [],

      exerciseIds:
        selectedType === "exercise"
          ? selectedValue.map((i) => i.value || i.exerciseId)
          : [],

      sessionIds: [],
    },

    paymentDate: new Date().toISOString().split("T")[0],
  };


  // 🔥 SUBMIT
  const handleSubmit = async () => {
    try {
      let payload;
      let url;
      let method;

      if (!isFollowUpPayment) {
        // ✅ CREATE (FIRST PAYMENT)
        payload = createPayloadData; // your previous full payload
        url = `${wifiUrl}/api/physiotherapy-doctor/payment/create`;
        method = "POST";
      } else {
        // ✅ UPDATE PAYMENT
        payload = updatePayload;
        url = `${wifiUrl}/api/physiotherapy-doctor/payment/update`;
        method = "PUT";
      }

      console.log("FINAL PAYLOAD:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("API RESPONSE:", data);

      setIsFollowUpPayment(true);

      // 👉 print after success
      setPrintData({
        ...payload,
        selectedItems: selectedValue,
        tableData, startDate
      });

      setShowPrint(true);

      setTimeout(() => window.print(), 800);

    } catch (error) {
      console.error("Payment Error:", error);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(
        `${wifiUrl}/api/physiotherapy-doctor/payment/getByBookingId/${bookingId}`
      );
      const data = await res.json();

      if (!data.success) return;

      const result = data.data;
      setFullPaymentData(result)

      // 🔥 BASIC DETAILS
      setPaymentAmount(result.totalAmount || 0);
      setFinalAmount(result.finalAmount || result.totalAmount || 0);
      setDiscountAmount(result.discountAmount || 0);

      setDoctorName(result.doctorName);
      setTherapistName(result.therapistName);
      setTherapistRecordId(result.therapistRecordId);

      // 🔥 PAYMENT STATUS
      setPaymentStatus(result.paymentStatus);

      // 🔥 HISTORY
      setPaymentHistory(result.paymentHistory || []);

      // 🔥 TABLE DATA
      const formatted = formatTherapyTable(result.therapyWithSessions);
      setTableData(formatted);
      setShowTable(true);

      // 🔥 FOLLOW-UP MODE
      if ((result.paymentHistory || []).length > 0) {
        setIsFollowUpPayment(true);
      }

    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (apiData?.length && !selectedType) {
      setSelectedType("package"); // 🔥 default
    }
  }, [apiData]);
  useEffect(() => {
    const total = Number(paymentAmount || 0);
    const discountVal = Number(discountAmount || 0);

    setFinalAmount(total - discountVal);
  }, [paymentAmount, discountAmount]);

  return (
    
    <div className="p-3">
      <CButton onClick={() =>
        navigate("/paymentDetails", {
          state: { paymentData: fullPaymentData },
        })
      } style={{ backgroundColor: "var(--color-black)", color: "#fff" }}>
        Payment Details
      </CButton>
      

      {/* 🔹 STEP 1 */}
      {!showTable && (
        <CRow className="mb-4">
          <CCol md={3}>
            <CFormLabel>Start Date</CFormLabel>
            <CFormInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </CCol>

          <CCol md={3} className="d-flex align-items-end">
            <CButton onClick={handleGenerate} style={{ backgroundColor: "var(--color-black)", color: "#fff" }}>
              Generate Table
            </CButton>
          </CCol>
        </CRow>
      )}

      {/* 🔹 STEP 2 */}
      {showTable && (
        <>
          {/* TABLE */}
          <CTable bordered>

            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Program</CTableHeaderCell>
                <CTableHeaderCell>Therapy</CTableHeaderCell>
                <CTableHeaderCell>Exercise</CTableHeaderCell>
                <CTableHeaderCell>Session</CTableHeaderCell>
                <CTableHeaderCell>Sets</CTableHeaderCell>        {/* ✅ NEW */}
                <CTableHeaderCell>Reps</CTableHeaderCell>        {/* ✅ NEW */}
                <CTableHeaderCell>Frequency</CTableHeaderCell>   {/* ✅ NEW */}
                <CTableHeaderCell>Notes</CTableHeaderCell>       {/* ✅ NEW */}
                <CTableHeaderCell>Price</CTableHeaderCell>       {/* ✅ NEW */}
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Payment</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {(tableData || []).map((row, i) => (
                <CTableRow key={i}>
                  <CTableDataCell>{i + 1}</CTableDataCell>

                  <CTableDataCell>{row?.programName || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.therapyName || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.exerciseName || "-"}</CTableDataCell>

                  <CTableDataCell>{row?.sessionNo || "-"}</CTableDataCell>

                  {/* ✅ NEW DATA */}
                  <CTableDataCell>{row?.sets || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.repetitions || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.frequency || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.notes || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.price || 0}</CTableDataCell>

                  <CTableDataCell>{row?.status || "-"}</CTableDataCell>
                  <CTableDataCell>{row?.paymentStatus || "-"}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>

          </CTable>

          {/* PAYMENT */}
          <CCard className="mt-3">
            <CCardHeader>Payment</CCardHeader>
            <CCardBody>

              <CRow className="g-3 mb-3">

                {/* 🔹 SERVICE TYPE */}
                <CCol md={3}>
                  <CFormLabel>Service Type</CFormLabel>

                 <CFormSelect
  value={selectedType}
  onChange={(e) => handleTypeChange(e.target.value)}
>
  <option value="">Select Type</option>  {/* ✅ IMPORTANT */}

  {getServiceTypes().map((type) => (
    <option key={type} value={type}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </option>
  ))}
</CFormSelect>
                </CCol>

                {/* 🔹 SELECT VALUE */}
                <CCol md={4}>
               {selectedType !== "package" && (
  <CCol md={4}>
    <CFormLabel>Select Value</CFormLabel>
    <Select
      isMulti
      options={getOptionsByType()}
      value={selectedValue || []}
      onChange={handleSelectValue}
    />
  </CCol>
)}
                </CCol>

                {/* 🔹 PAYMENT TYPE */}
                <CCol md={2}>
                  <CFormLabel>Payment Type</CFormLabel>
                  <CFormSelect
                    value={paymentType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setPaymentType(type);

                      if (type === "partial") {
                        setPaymentPercent(50);

                        // ✅ also update payment amount based on %
                        const amount = (paymentAmount * 50) / 100;
                        setPaymentAmount(amount.toFixed(2));
                      } else {
                        setPaymentPercent(100);

                        // ✅ reset to full amount
                        const total = selectedValue.reduce(
                          (sum, item) => sum + (item.price || 0),
                          0
                        );
                        setPaymentAmount(total);
                      }
                    }}
                  >
                    <option value="full">Full</option>
                    <option value="partial">Partial</option>
                  </CFormSelect>
                </CCol>

              </CRow>

              <CRow className="g-3">

                {/* 🔹 TOTAL AMOUNT */}
                <CCol md={2}>
                  <CFormLabel>Total Amount</CFormLabel>
                  <CFormInput value={paymentAmount} readOnly />
                </CCol>

                {/* 🔹 PAYMENT AMOUNT */}
                <CCol md={2}>
                  <CFormLabel>Payment Amount</CFormLabel>
                  <CFormInput
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </CCol>

                {/* 🔹 PAYMENT % */}
                <CCol md={2}>
                  <CFormLabel>Payment %</CFormLabel>
                  <CFormInput
                    value={paymentPercent}
                    onChange={(e) => {
                      const percent = Number(e.target.value || 0);
                      setPaymentPercent(percent);

                      const total = selectedValue.reduce(
                        (sum, item) => sum + (item.price || 0),
                        0
                      );

                      const amount = (total * percent) / 100;
                      setPaymentAmount(amount.toFixed(2));
                    }}
                  />
                </CCol>

                {/* 🔹 DISCOUNT % */}
              {!isFollowUpPayment && (
  <>
    {/* 🔹 DISCOUNT % */}
    <CCol md={2}>
      <CFormLabel>Discount %</CFormLabel>
      <CFormInput
        value={discount}
        onChange={(e) => {
          const percent = Number(e.target.value || 0);
          setDiscount(percent);

          const amount = (paymentAmount * percent) / 100;
          setDiscountAmount(amount.toFixed(2));
        }}
      />
    </CCol>

    {/* 🔹 DISCOUNT AMOUNT */}
    <CCol md={2}>
      <CFormLabel>Discount Amount</CFormLabel>
      <CFormInput
        value={discountAmount}
        onChange={(e) => setDiscountAmount(e.target.value)}
      />
    </CCol>
  </>
)}

                {/* 🔹 FINAL AMOUNT */}
                <CCol md={2}>
                  <CFormLabel>Final Amount</CFormLabel>
                  <CFormInput value={finalAmount} readOnly />
                </CCol>

              </CRow>

              <CRow className="g-3 mt-2">

                {/* 🔹 APPROVED BY */}
               
                    <CCol md={3}>
                      <CFormLabel>Approved By</CFormLabel>
                      <CFormInput
                        value={discountIssuedBy}
                        onChange={(e) => setDiscountIssuedBy(e.target.value)}
                      />
                    </CCol>
                  

                {/* 🔹 PAYMENT MODE */}
                <CCol md={3}>
                  <CFormLabel>Payment Mode</CFormLabel>
                  <CFormSelect
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </CFormSelect>
                </CCol>

              </CRow>

              {/* 🔹 BUTTON */}
              <div className="mt-3 text-end">
                <CButton onClick={handleSubmit} style={{ backgroundColor: "var(--color-black)", color: "#fff" }}>
                  {isFollowUpPayment
                    ? "Update Payment & Print"
                    : "Submit & Print"}
                </CButton>
              </div>

            </CCardBody>
          </CCard>

          {showPrint && printData && (
            <div className="print-container">

              <h2 style={{ textAlign: "center" }}>
                Patient Treatment & Payment Summary
              </h2>

              <hr />

              {/* 🔹 BASIC DETAILS */}
              <p><b>Start Date:</b> {printData.startDate}</p>
              <p><b>Service Type:</b> {printData.serviceType}</p>

              {/* 🔹 SELECTED ITEMS */}
              <h4>Selected Services</h4>
              <ul>
                {printData.selectedItems.map((item, i) => (
                  <li key={i}>
                    {item.label} - ₹{item.price}
                  </li>
                ))}
              </ul>

              {/* 🔹 TABLE */}
              <h4>Session Details</h4>

              <table border="1" width="100%" cellPadding="5">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Program</th>
                    <th>Therapy</th>
                    <th>Exercise</th>
                    <th>Session</th> {/* ✅ ADD THIS */}
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {(printData?.tableData || []).map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{row?.programName || "-"}</td>
                      <td>{row?.therapyName || "-"}</td>
                      <td>{row?.exerciseName || "-"}</td>
                      <td>{row?.sessionNo || "-"}</td> {/* ✅ ADD THIS */}
                      <td>{row?.date || "-"}</td>
                      <td>{row?.status || "-"}</td>
                      <td>{row?.paymentStatus || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 🔹 PAYMENT */}
              <h4 style={{ marginTop: "20px" }}>Payment Details</h4>

              <p><b>Total Amount:</b> ₹{printData.paymentAmount}</p>
              <p><b>Discount:</b> ₹{printData.discountAmount}</p>
              <p><b>Final Amount:</b> ₹{printData.finalAmount}</p>
              <p><b>Payment Mode:</b> {printData.paymentMode}</p>

            </div>
          )}
        </>

      )}

    </div>

  );
}