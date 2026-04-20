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
  const [packageId, setPackageId] = useState("");
  const [formattedData, setformattedData] = useState([]);
  const [sessionRows, setSessionRows] = useState([]);
  const [programData, setProgramData] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedfullExercise, setSelectedfullExercise] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [fullPaymentData, setFullPaymentData] = useState([])
  const [paymentData, setPaymentData] = useState(null);
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
  const [backendServiceType, setBackendServiceType] = useState("")

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
      setPackageId(data?.data?.[0]?.packageId || "");
      setSelectedfullExercise(data?.data?.therapySessions || []);
      // Set packageId from API response

      const apiResponse = data?.data || [];


      setApiData(apiResponse);
      setBackendServiceType(apiResponse?.[0]?.serviceType || "")

      setDoctorName(apiResponse?.[0]?.doctorName || "");
      setTherapistId(apiResponse?.[0]?.therapistId || "");
      setTherapistName(apiResponse?.[0]?.therapistName || "");

      // ✅ ADD THIS LINE (CRITICAL FIX)
      setTherapistRecordId(apiResponse?.[0]?.therapistRecordId || "");


    } catch (error) {
      console.error("API Error:", error);
    }
  };
  console.log(packageId)
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
    if (!fullPaymentData?.therapyWithSessions?.length) return [];

    const root = fullPaymentData.therapyWithSessions[0];

    switch (selectedType) {
      case "therapy":
        return root.programs.flatMap(program =>
          program.therapyData
            .filter(t => t.paymentStatus?.toLowerCase() !== "paid")
            .map(t => ({
              label: t.therapyName,
              value: t.therapyId
            }))
        );

      case "exercise":
        return root.programs.flatMap(program =>
          program.therapyData.flatMap(t =>
            t.exercises
              .filter(ex => ex.paymentStatus?.toLowerCase() !== "paid")
              .map(ex => ({
                label: ex.exerciseName,
                value: ex.exerciseId
              }))
          )
        );

      case "session":
        return root.programs.flatMap(program =>
          program.therapyData.flatMap(t =>
            t.exercises.flatMap(ex =>
              ex.sessions
                .filter(s => s.paymentStatus?.toLowerCase() !== "paid")
                .map(s => ({
                  label: `${ex.exerciseName} - Session ${s.sessionNo}`,
                  value: s.sessionId,
                  price: ex.pricePerSession
                }))
            )
          )
        );

      default:
        return [];
    }
  };
  const getRemainingAmount = (type, ids = []) => {
    if (!fullPaymentData?.therapyWithSessions?.length) return 0;

    let total = 0;

    fullPaymentData.therapyWithSessions.forEach((pkg) => {
      pkg.programs?.forEach((program) => {
        program.therapyData?.forEach((therapy) => {

          // 🔹 THERAPY
          if (type === "therapy" && ids.includes(therapy.therapyId)) {
            therapy.exercises?.forEach((ex) => {
              ex.sessions?.forEach((s) => {
                if (s.paymentStatus?.toLowerCase() !== "paid") {
                  total += Number(ex.pricePerSession || 0);
                }
              });
            });
          }

          therapy.exercises?.forEach((ex) => {

            // 🔹 EXERCISE
            if (type === "exercise" && ids.includes(ex.exerciseId)) {
              ex.sessions?.forEach((s) => {
                if (s.paymentStatus?.toLowerCase() !== "paid") {
                  total += Number(ex.pricePerSession || 0);
                }
              });
            }

            // 🔹 SESSION
            if (type === "session") {
              ex.sessions?.forEach((s) => {
                if (
                  ids.includes(s.sessionId) &&
                  s.paymentStatus?.toLowerCase() !== "paid"
                ) {
                  total += Number(ex.pricePerSession || 0);
                }
              });
            }

          });
        });
      });
    });

    return total;
  };
  const handleSelectValue = (selected) => {
    const selectedItems = selected || [];
    setSelectedValue(selectedItems);

    const ids = selectedItems.map((item) => item.value);

    let total = 0;

    if (isFollowUpPayment) {
      total = getRemainingAmount(selectedType, ids);
    } else {
      total = selectedItems.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
      );
    }

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
      const apiData = data?.data || [];
      console.log(apiData)
      const rows = apiData.flatMap(item =>
        item?.therapyData?.flatMap(therapy =>
          therapy?.exercises?.flatMap(exercise =>
            exercise?.sessions?.map(session => ({
              sessionId: session.sessionId,
              date: session.date,
              status: session.status,
              paymentStatus: session.paymentStatus
            })) || []
          ) || []
        ) || []
      );

      setSessionRows(apiData);
      setformattedData(rows);

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

    const item = apiData[0];
    const selectedIds = (selectedValue || []).map(i => i.value);

    // 1. Helper to find sessions for a specific exercise
    const getMatchedSessions = (exerciseId) => {
      // We look into the sessionRows (the data returned from /generate-table)
      // and extract the specific sessions for this exercise
      const exerciseData = sessionRows.flatMap(prog =>
        prog.therapyData?.flatMap(ther =>
          ther.exercises?.find(ex => ex.exerciseId === exerciseId)
        )
      ).filter(Boolean)[0];

      return exerciseData?.sessions || [];
    };

    // 2. Helper to map Exercise structure
    const mapExercise = (ex) => ({
      exerciseId: String(ex.exerciseId || ""), // Ensure String
      exerciseName: String(ex.exerciseName || ex.name || "Unknown"),
      pricePerSession: Number(ex.pricePerSession) || 0, // Force Number
      noOfSessions: Number(ex.noOfSessions) || 0,
      totalExercisePrice: Number(ex.totalExercisePrice || ex.totalSessionCost) || 0,
      paymentStatus: "UNPAID",
      frequency: String(ex.frequency || ex.frequancy || ""),
      sets: Number(ex.sets) || 0,
      repetitions: Number(ex.repetitions) || 0,
      youtubeUrl: String(ex.videoUrl || ""),
      notes: String(ex.notes || ""),
      // sessions: getMatchedSessions(ex.exerciseId) || [] // Ensure it's at least an empty array
    });

    // ================= PACKAGE LOGIC =================
    if (selectedType === "package") {
      return [{
        packageId: item.packageId,
        packageName: item.packageName,
        programs: (item.therapySessions || []).map(program => ({
          programId: program.programId,
          programName: program.programName,
          therapyData: (program.therapyData || []).map(therapy => ({
            therapyId: therapy.therapyId,
            therapyName: therapy.therapyName,
            totalPrice: therapy.totalPrice,
            exercises: (therapy.exercises || []).map(ex => mapExercise(ex))
          }))
        }))
      }];
    }

    // ================= PROGRAM LOGIC =================
    if (selectedType === "program") {
      return (item.therapySessions || [])
        .filter(p => !selectedIds.length || selectedIds.includes(p.programId))
        .map(program => ({
          programId: program.programId,
          programName: program.programName,
          therapyData: (program.therapyData || []).map(therapy => ({
            therapyId: therapy.therapyId,
            therapyName: therapy.therapyName,
            totalPrice: therapy.totalPrice,
            exercises: (therapy.exercises || []).map(ex => mapExercise(ex))
          }))
        }));
    }

    return [];
  }
  // console.log(selectedValue);
  const getTherapyWithSessions = () => {
    if (!apiData?.length) return []

    const root = apiData[0]
    const selectedIds = selectedValue.map((i) => i.value)

    // PACKAGE → all programs
    if (selectedType === "package") {
      return root.therapySessions || []
    }

    // PROGRAM → selected programs only
    if (selectedType === "program") {
      return (root.therapySessions || []).filter((p) =>
        selectedIds.includes(p.programId)
      )
    }

    // THERAPY → keep program + selected therapies
    if (selectedType === "therapy") {
      return (root.therapySessions || [])
        .map((program) => ({
          ...program,
          therapyData: (program.therapyData || []).filter((t) =>
            selectedIds.includes(t.therapyId)
          ),
        }))
        .filter((p) => p.therapyData.length > 0)
    }

    // EXERCISE → keep program + therapy + selected exercises
    if (selectedType === "exercise") {
      return (root.therapySessions || [])
        .map((program) => ({
          ...program,
          therapyData: (program.therapyData || [])
            .map((therapy) => ({
              ...therapy,
              exercises: (therapy.exercises || []).filter((ex) =>
                selectedIds.includes(ex.exerciseId)
              ),
            }))
            .filter((t) => t.exercises.length > 0),
        }))
        .filter((p) => p.therapyData.length > 0)
    }

    return []
  }

  const createPayloadData = {
    clinicId,
    branchId,
    bookingId,
    patientId,
    sessionStartDate: startDate,

    doctorId,
    doctorName,
    therapistId,
    therapistName,
    therapistRecordId,

    // ✅ keep current selected service type
    // serviceType: selectedType.toUpperCase(),
    // paymentLevel: selectedType.toUpperCase(),
    serviceType: backendServiceType.toUpperCase(),
    paymentLevel: selectedType.toUpperCase(),

    amount: Number(finalAmount || 0),
    paymentMode: paymentMode.toUpperCase(),
    paymentType: paymentType.toUpperCase(),

    totalSessionCount: 2,
    discountAmount: Number(discountAmount || 0),
    discountIssuedBy,
    paymentDate: new Date().toISOString().split("T")[0],

    // ✅ only selected ids
    paymentTarget: {
      packageIds:
        selectedType === "package"
          ? [packageId]
          : [],

      programIds:
        selectedType === "program"
          ? selectedValue.map((i) => i.value)
          : [],

      therapyIds:
        selectedType === "therapy"
          ? selectedValue.map((i) => i.value)
          : [],

      exerciseIds:
        selectedType === "exercise"
          ? selectedValue.map((i) => i.value)
          : [],

      sessionIds:
        selectedType === "session"
          ? selectedValue.map((i) => i.value)
          : [],
    },

    // ✅ send backend full data unchanged
    therapyWithSessions:
      backendServiceType?.toLowerCase() === "package"
        ? [
          {
            packageId: apiData?.[0]?.packageId || "",
            packageName: apiData?.[0]?.packageName || "",
            totalPrice: apiData?.[0]?.totalPrice || 0,
            programs: apiData?.[0]?.therapySessions || [],
          },
        ]
        : apiData?.[0]?.therapySessions || [],
  }

  const updatePayload = {
    bookingId,

    amount: Number(finalAmount || 0),
    paymentMode: paymentMode?.toUpperCase(),
    paymentType: paymentType?.toUpperCase(),

    paymentLevel: selectedType?.toUpperCase(),

    paymentTarget: {
      ...(selectedType === "package" && {
        packageIds: selectedValue.length
          ? selectedValue.map(i => i.value)
          : apiData.map(i => i.packageId),
      }),

      ...(selectedType === "program" && {
        programIds: selectedValue.length
          ? selectedValue.map(i => i.value)
          : apiData[0]?.therapySessions?.map(p => p.programId),
      }),

      ...(selectedType === "therapy" && {
        therapyIds: selectedValue.length
          ? selectedValue.map(i => i.value)
          : apiData[0]?.therapySessions?.flatMap(p =>
            p.therapyData?.map(t => t.therapyId)
          ),
      }),

      ...(selectedType === "exercise" && {
        exerciseIds: selectedValue.length
          ? selectedValue.map(i => i.value)
          : apiData[0]?.therapySessions?.flatMap(p =>
            p.therapyData?.flatMap(t =>
              t.exercises?.map(e => e.therapyExercisesId)
            )
          ),
      }),

      ...(selectedType === "session" && {
        sessionIds: selectedValue.length
          ? selectedValue.map(i => i.value)
          : sessionRows.map(s => s.sessionId),
      }),
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
        method = "POST";
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

      // setShowPrint(true);
      navigate(-1)

      // setTimeout(() => window.print(), 800);

    } catch (error) {
      console.error("Payment Error:", error);
    }
  };
  useEffect(() => {
    fetchPaymentDetails();
  }, [bookingId]);

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(
        `${wifiUrl}/api/physiotherapy-doctor/payment/${bookingId}`
      );
      const data = await res.json();

      if (!data.success) return;

      const result = data.data;
      setFullPaymentData(result)
      console.log(result)

      // 🔥 BASIC DETAILS
      if ((result.paymentHistory || []).length > 0) {
        setPaymentAmount(result.balanceAmount || 0);
        setFinalAmount(result.balanceAmount || 0);
      } else {
        setPaymentAmount(result.totalAmount || 0);
        setFinalAmount(result.finalAmount || result.totalAmount || 0);
      }
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
      {isFollowUpPayment && (
        <CButton onClick={() =>
          navigate("/paymentDetails", {
            state: { paymentData: fullPaymentData },
          })
        } style={{ backgroundColor: "var(--color-black)", color: "#fff", marginRight: "10px" }}>
          Payment Details
        </CButton>
      )}
      {/* <CButton onClick={() => fetchTherapySessions()
      } style={{ backgroundColor: "var(--color-black)", color: "#fff" }}>
        Program Details
      </CButton> */}


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
      {isFollowUpPayment && (
        <>

          {/* TABLE */}
          <CTable bordered className="pink-table m-3" >
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Session ID</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Payment Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {formattedData.map((session, i) => (
                <CTableRow key={session.sessionId || i}>
                  <CTableDataCell>{session?.sessionId}</CTableDataCell>
                  <CTableDataCell>{session?.date}</CTableDataCell>
                  <CTableDataCell>{session?.status}</CTableDataCell>
                  <CTableDataCell>{session?.paymentStatus}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </>

      )}
      {/* PAYMENT */}
      {isFollowUpPayment && (
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
                <>
                  <CFormLabel>Select Value</CFormLabel>
                  <Select
                    isMulti
                    options={getOptionsByType()}
                    value={selectedValue || []}
                    onChange={handleSelectValue}
                  />
                </>
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
            <CButton
              onClick={handleSubmit}
              // disabled={isFollowUpPayment && paymentStatus !== "UNPAID"}
              style={{ backgroundColor: "var(--color-black)", color: "#fff" }}
            >
              {isFollowUpPayment ? "Update Payment" : "Submit Payment"}
            </CButton>
          </div>

        </CCardBody>
      </CCard>
  )}

      {/*
{showPrint && printData && (
  <div className="print-container">

    <h2 style={{ textAlign: "center" }}>
      Patient Treatment & Payment Summary
    </h2>

    <hr />

    <p><b>Start Date:</b> {printData.startDate}</p>
    <p><b>Service Type:</b> {printData.serviceType}</p>

    <h4>Selected Services</h4>
    <ul>
      {printData.selectedItems.map((item, i) => (
        <li key={i}>
          {item.label} - ₹{item.price}
        </li>
      ))}
    </ul>

    <h4>Session Details</h4>

    <table border="1" width="100%" cellPadding="5">
      <thead>
        <tr>
          <th>#</th>
          <th>Program</th>
          <th>Therapy</th>
          <th>Exercise</th>
          <th>Session</th>
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
            <td>{row?.sessionNo || "-"}</td>
            <td>{row?.date || "-"}</td>
            <td>{row?.status || "-"}</td>
            <td>{row?.paymentStatus || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h4 style={{ marginTop: "20px" }}>Payment Details</h4>

    <p><b>Total Amount:</b> ₹{printData.paymentAmount}</p>
    <p><b>Discount:</b> ₹{printData.discountAmount}</p>
    <p><b>Final Amount:</b> ₹{printData.finalAmount}</p>
    <p><b>Payment Mode:</b> {printData.paymentMode}</p>

  </div>
)}
*/}


    </div>

  );
}