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
import { showCustomToast } from "../../Utils/Toaster";
import { COLORS } from "../../Constant/Themes";

export default function ProgramPayment() {
  const location = useLocation();

  console.log("Received data:", location.state);

  const { bookingId, doctorId, clinicId, branchId, patientId } = location.state || {};

  const [startDate, setStartDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [formattedData, setformattedData] = useState([]);
  const [sessionRows, setSessionRows] = useState([]);
  const [programData, setProgramData] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedfullExercise, setSelectedfullExercise] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [fullPaymentData, setFullPaymentData] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [therapistName, setTherapistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [therapistRecordId, setTherapistRecordId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [tableOpen, setTableOpen] = useState(false); // accordion state for generated table
  const [sessionTableAlreadyCreated, setSessionTableAlreadyCreated] = useState(false); // hide session details when loaded from payment API
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
  const [backendServiceType, setBackendServiceType] = useState("");
  const [allPaid, setAllPaid] = useState(false);
  const [isFollowUpPayment, setIsFollowUpPayment] = useState(false);
  const [noSessionMsg, setNoSessionMsg] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [totalForSelection, setTotalForSelection] = useState(0);
  const [payAfterService, setPayAfterService] = useState(false);

  useEffect(() => {
    if (bookingId && patientId && clinicId && branchId) {
      initializePayment();
    }
  }, [bookingId, patientId, clinicId, branchId]);

  const getValidPaymentHistory = (history) => {
    if (!Array.isArray(history)) return [];
    return history.filter(p => p && p.amount !== null && p.amount !== undefined);
  };

  // Step 1: Check payment API first for sessionTableCreatedStatus
  const initializePayment = async () => {
    setIsInitializing(true);
    try {
      const res = await fetch(`${wifiUrl}/api/physiotherapy-doctor/payment/${bookingId}`);
      const data = await res.json();

      if (data.success && data.data) {
        const result = data.data;
        const sessionTableCreated = result.sessionTableCreatedStatus === true;

        if (sessionTableCreated) {
          // Table already created — load payment data directly, skip generate
          setAllPaid(checkAllSessionsPaid(result));
          setFullPaymentData(result);
          console.log("Payment data loaded (table exists):", result);
          const validHistory = getValidPaymentHistory(result.paymentHistory);
          if (validHistory.length > 0) {
            setTotalForSelection(result.balanceAmount || 0);
            setPaymentAmount(result.balanceAmount || 0);
            setFinalAmount(result.balanceAmount || 0);
          } else {
            setTotalForSelection(result.totalAmount || 0);
            setPaymentAmount(result.totalAmount || 0);
            setFinalAmount(result.balanceAmount || result.totalAmount || 0);
          }
          // For follow-up payments, do NOT carry over the first payment's discount
          if (validHistory.length > 0) {
            setDiscountAmount(0);
            setDiscount(0);
          } else {
            setDiscountAmount(result.discountAmount || 0);
          }
          setDoctorName(result.doctorName);
          setTherapistName(result.therapistName);
          setTherapistRecordId(result.therapistRecordId);
          setPaymentStatus(result.paymentStatus);
          setPaymentHistory(validHistory);
          setTotalPaid(result.totalPaid || 0);
          setBalanceAmount(result.balanceAmount || 0);
          setPayAfterService(result.payAfterService === false);
          const typeRaw = result.serviceType?.toLowerCase() || "";
          setBackendServiceType(typeRaw === "exercise" ? "activity" : typeRaw);
          const formatted = formatTherapyTable(result.therapyWithSessions);
          setTableData(formatted);
          setShowTable(true);
          setSessionTableAlreadyCreated(true); // mark as pre-existing, hide session details
          if (validHistory.length > 0) setIsFollowUpPayment(true);

          // Also fetch therapy sessions for dropdown options
          await fetchTherapySessions();
          return;
        }
      }

      // sessionTableCreatedStatus is false or no payment data — show Generate Table UI
      await fetchTherapySessions();
    } catch (err) {
      console.error("Init payment check error:", err);
      // Fallback: fetch therapy sessions anyway
      await fetchTherapySessions();
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchTherapySessions = async () => {
    try {
      const res = await fetch(
        `${wifiUrl}/api/physiotherapy-doctor/getTherapySessionsByServiceType/${clinicId}/${branchId}/${patientId}/${bookingId}`
      );
      if (res.status === 204) {
        setApiData([]);
        setNoSessionMsg("No session for this booking");
        return;
      }
      const data = await res.json();
      const apiResponse = data?.data || [];
      if (!apiResponse.length) { setApiData([]); return; }
      const type = apiResponse?.[0]?.serviceType?.toLowerCase() || "";
      let normalized = [];
      if (type === "package") {
        normalized = apiResponse.map(pkg => ({
          ...pkg,
          therapySessions: pkg.programs || pkg.therapySessions || []
        }));
      }
      else if (type === "program") {
        normalized = apiResponse.map(item => ({
          ...item,
          totalPrice: item.totalSessionCost || item.total || item.totalPrice,
          therapyData: (item.therapyData || []).map(t => ({
            ...t,
            totalPrice: t.totalSessionCost || t.totalPrice || (t.exercises || []).reduce((sum, ex) => sum + Number(ex.totalSessionCost || 0), 0),
            exercises: (t.exercises || []).map(ex => ({
              ...ex,
              totalPrice: (Number(ex.totalSessionCost || 0) / (Number(ex.noOfSessions) || 1)) || ex.totalPrice || ex.pricePerSession
            }))
          }))
        }));
      }
      else if (type === "therapy") {
        normalized = apiResponse.map((item) => ({
          ...item,
          totalPrice: item.totalSessionCost || item.totalPrice,
          exercises: (item.exercises || []).map(ex => ({
            ...ex,
            unitPrice: Number((Number(ex.totalSessionCost || 0) / (Number(ex.noOfSessions) || 1)) || ex.totalPrice || ex.pricePerSession || 0)
          }))
        }));
      }
      else if (type === "exercise") {
        normalized = apiResponse.map(item => ({
          ...item,
          totalPrice: item.totalSessionCost || item.totalPrice,
          exercises: (item.exercises || []).map(ex => ({
            ...ex,
            totalPrice: (Number(ex.totalSessionCost || 0) / (Number(ex.noOfSessions) || 1)) || ex.totalPrice || ex.pricePerSession
          }))
        }));
      }
      console.log("NORMALIZED:", normalized);
      setApiData(normalized);
      const normalizedType = type === "exercise" ? "activity" : type;
      if (!backendServiceType) setBackendServiceType(normalizedType);
      setPackageId(normalized?.[0]?.packageId || "");
      setDoctorName(prev => prev || normalized?.[0]?.doctorName || "");
      setTherapistId(prev => prev || normalized?.[0]?.therapistId || "");
      setTherapistName(prev => prev || normalized?.[0]?.therapistName || "");
      setTherapistRecordId(prev => prev || normalized?.[0]?.therapistRecordId || "");
    } catch (error) { console.error("API Error:", error); }
  };

  console.log(packageId);



  const getServiceTypes = () => {
    const typeRaw = apiData?.[0]?.serviceType?.toLowerCase() || "";
    const type = typeRaw === "exercise" ? "activity" : typeRaw;
    const typesMap = {
      package: ["package", "program", "therapy", "activity", "session"],
      program: ["program", "therapy", "activity", "session"],
      therapy: ["therapy", "activity", "session"],
      activity: ["activity", "session"],
    };
    return typesMap[type] || [];
  };

  const normalizeToPrograms = (sourceData) => {
    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) return [];

    // Check if any item has direct programs/sessions (containers)
    const hasContainers = sourceData.some(item => item.programs || item.therapySessions);
    if (hasContainers) {
      return sourceData.flatMap(item => item.programs || item.therapySessions || []);
    }

    // If it's already a list of programs (each having therapyData)
    if (sourceData[0]?.therapyData) {
      return sourceData;
    }

    // Fallback for list of therapies (each having exercises)
    if (sourceData[0]?.exercises) {
      return [{
        programId: "DEFAULT_PROG", programName: "-",
        therapyData: sourceData.map(t => ({
          therapyId: t.therapyId || "DEFAULT_THERAPY",
          therapyName: t.therapyName || "-",
          totalPrice: t.totalPrice || 0,
          paymentStatus: t.paymentStatus,
          exercises: t.exercises || []
        }))
      }];
    }

    // Fallback for list of exercises (direct exercises, common for EXERCISE service type)
    if (sourceData[0]?.exerciseId || sourceData[0]?.sessions) {
      return [{
        programId: "DEFAULT_PROG", programName: "-",
        therapyData: [{
          therapyId: "DEFAULT_THERAPY",
          therapyName: "-",
          exercises: sourceData
        }]
      }];
    }

    return [];
  };

  const calculateUnpaidAmount = (node, type) => {
    // Helper to get the most accurate unit price from backend data
    const getUnitPrice = (ex) => {
      const tsc = Number(ex.totalPricePerSession || ex.pricePerSession || 0);
      const nos = Number(ex.noOfSessions || 1);
      if (tsc > 0) return tsc;

      const tp = Number(ex.totalPrice || 0);
      if (tp > 0 && tp < tsc) return tp; // totalPrice is often the adjusted per-session price

      return Number(ex.pricePerSession || ex.price || 0);
    };

    let amount = 0;
    let hasSessions = false;

    console.log(`Calculating Unpaid Amount for ${type}:`, node);
    if (type === "program" || type === "package") {
      (node.therapyData || []).forEach(t => {
        (t.exercises || []).forEach(ex => {
          if (ex.sessions && ex.sessions.length > 0) hasSessions = true;
          (ex.sessions || []).forEach(s => {
            if (s.paymentStatus?.toLowerCase() !== "paid") {
              amount += getUnitPrice(ex);
            }
          });
        });
      });
      if (!hasSessions) {
        amount = Number(node.totalSessionCost || node.total || node.totalPrice || (node.therapyData || []).reduce((sum, t) => sum + (t.exercises || []).reduce((s, ex) => s + Number(ex.totalSessionCost || ex.totalExercisePrice || 0), 0), 0));
      }
    } else if (type === "therapy") {
      (node.exercises || []).forEach(ex => {
        if (ex.sessions && ex.sessions.length > 0) hasSessions = true;
        (ex.sessions || []).forEach(s => {
          if (s.paymentStatus?.toLowerCase() !== "paid") {
            amount += getUnitPrice(ex);
          }
        });
      });
      if (!hasSessions) {
        amount = Number(node.totalPrice || node.totalSessionCost || node.total || (node.exercises || []).reduce((sum, ex) => sum + Number(ex.totalSessionCost || ex.totalExercisePrice || 0), 0));
      }
    } else if (type === "activity") {
      if (node.sessions && node.sessions.length > 0) hasSessions = true;
      (node.sessions || []).forEach(s => {
        if (s.paymentStatus?.toLowerCase() !== "paid") {
          amount += getUnitPrice(node);
        }
      });
      if (!hasSessions) amount = Number(node.totalSessionCost || node.totalPrice || node.totalExercisePrice || 0);
    }

    console.log(`Final Calculated Amount for ${type}:`, amount);
    return amount;
  };

  const getOptionsByType = () => {
    let programs = [];

    if (fullPaymentData && fullPaymentData.therapyWithSessions) {
      programs = normalizeToPrograms(fullPaymentData.therapyWithSessions);
    } else if (sessionRows && sessionRows.length > 0) {
      programs = normalizeToPrograms(sessionRows);
    } else {
      programs = normalizeToPrograms(apiData);
    }

    const type = String(selectedType).toLowerCase();

    switch (type) {
      case "package":
        const packageSource = (fullPaymentData && fullPaymentData.therapyWithSessions && fullPaymentData.therapyWithSessions.length > 0 && fullPaymentData.therapyWithSessions[0].packageId)
          ? fullPaymentData.therapyWithSessions
          : apiData;
        return packageSource.map(p => ({
          label: p.packageName || p.name || p.programName || "Package",
          value: p.packageId,
          price: calculateUnpaidAmount(p, "package")
        }));
      case "program":
        return programs.filter(p => p.paymentStatus?.toLowerCase() !== "paid").map(p => ({
          label: p.programName || p.name || p.packageName || "-",
          value: p.programId,
          price: calculateUnpaidAmount(p, "program")
        }));
      case "therapy":
        return programs.flatMap(p => (p.therapyData || []).filter(t => t.paymentStatus?.toLowerCase() !== "paid").map(t => ({
          label: t.therapyName || t.name || "-",
          value: t.therapyId,
          price: calculateUnpaidAmount(t, "therapy")
        })));
      case "exercise":
      case "activity":
        return programs.flatMap(p => (p.therapyData || []).flatMap(t => (t.exercises || []).filter(ex => ex.paymentStatus?.toLowerCase() !== "paid").map(ex => ({
          label: ex.exerciseName || ex.name || "-",
          value: ex.exerciseId || ex.therapyExercisesId,
          price: calculateUnpaidAmount(ex, "activity")
        }))));
      case "session":
        return programs.flatMap(p =>
          (p.therapyData || []).flatMap(t =>
            (t.exercises || []).flatMap(ex =>
              (ex.sessions || [])
                .filter(
                  s =>
                    s.paymentStatus?.toLowerCase() !== "paid"
                )
                .map(s => ({
                  label: (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        lineHeight: "1.3",
                        padding: "2px 0",
                      }}
                    >
                      {/* Exercise Name */}
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: COLORS.primary,
                        }}
                      >
                        {ex.exerciseName}
                      </span>

                      {/* Session Details */}
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#64748b",
                        }}
                      >
                        {s.sessionId} • {s.date || "-"}
                      </span>
                    </div>
                  ),
                  value: s.sessionId,
                  price: Number(
                    ex.totalPricePerSession ||
                    ex.pricePerSession ||
                    0
                  ),
                }))
            )
          )
        )
      default: return [];
    }
  };

  const handleSelectValue = (selected) => {
    const selectedItems = selected || [];

    console.log("Selected items:", selectedItems);
    setSelectedValue(selectedItems);

    const total = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setTotalForSelection(total);

    let amount = total;
    if (paymentType === "partial") {
      amount = (total * paymentPercent) / 100;
    }

    // For follow-up payments, ensure we don't exceed the balance
    const finalVal = isFollowUpPayment ? Math.min(amount, balanceAmount) : amount;

    setPaymentAmount(finalVal);
    setFinalAmount(finalVal);
  };

  const formatTherapyTable = (data = []) => {
    const rows = [];
    if (!Array.isArray(data)) return rows;

    const programs = normalizeToPrograms(data);

    programs.forEach(program => {
      (program.therapyData || []).forEach(therapy => {
        (therapy.exercises || []).forEach(exercise => {
          const count = Number(exercise.noOfSessions || 0) || 1;
          // Handle sessions array if it exists (from generate-table) or fallback to planned count
          if (exercise.sessions && exercise.sessions.length > 0) {
            exercise.sessions.forEach(session => {
              rows.push({
                programName: program.programName,
                therapyName: therapy.therapyName,
                exerciseName: exercise.exerciseName,
                sessionNo: session.sessionId,
                date: session.date || "-",
                status: session.status || "Planned",
                paymentStatus: session.paymentStatus || "Unpaid",
                sets: exercise.sets,
                repetitions: exercise.repetitions,
                frequency: exercise.frequency || exercise.frequancy,
                notes: exercise.notes,
                price: exercise.totalPrice || (exercise.totalSessionCost / (exercise.noOfSessions || 1)) || exercise.pricePerSession
              });
            });
          } else {
            for (let i = 1; i <= count; i++) {
              rows.push({ programName: program.programName, therapyName: therapy.therapyName, exerciseName: exercise.exerciseName, sessionNo: i, date: "-", status: "Planned", paymentStatus: "Unpaid", sets: exercise.sets, repetitions: exercise.repetitions, frequency: exercise.frequancy, notes: exercise.notes, price: (exercise.totalSessionCost / (exercise.noOfSessions || 1)) || exercise.pricePerSession });
            }
          }
        });
      });
    });
    return rows;
  };

  const handleGenerate = async () => {
    if (!startDate) {
      showCustomToast("Please select a start date before generating the table.", "error");
      return;
    }
    // ── Guard: prevent duplicate runs if already loading ──────────────
    if (loading) return;

    // ── Reset all previously generated data before re-generating ──────
    setTableData([]);
    setformattedData([]);
    setSessionRows([]);
    setShowTable(false);

    try {
      setLoading(true);
      const payload = { startDate, clinicId, branchId, patientId, bookingId, therapistRecordId };
      console.log("GENERATE PAYLOAD:", payload);
      const res = await fetch(`${BASE_URL}/generate-table`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      console.log("GENERATE API RESPONSE:", data);
      const apiResponse = Array.isArray(data?.data) ? data.data : [];
      const apiDataLocal = data?.data || [];
      console.log(apiDataLocal);

      // Mapping rows for the session selection dropdown (including price)
      // Mapping rows for the session selection dropdown (including price)
      const rows = apiDataLocal.flatMap(item => {
        const programs = item.therapySessions || (item.therapyData ? [item] : []);
        return programs.flatMap(program =>
          program?.therapyData?.flatMap(therapy =>
            therapy?.exercises?.flatMap(exercise =>
              exercise?.sessions?.map(session => ({
                exerciseName: exercise.exerciseName,
                sessionId: session.sessionId,
                date: session.date,
                status: session.status,
                paymentStatus: session.paymentStatus,
                price:
                  exercise.totalPrice ||
                  (exercise.totalSessionCost /
                    (exercise.noOfSessions || 1)) ||
                  exercise.pricePerSession ||
                  0,
              })) || []
            ) || []
          ) || []
        ) || [];
      });

      setSessionRows(apiDataLocal);
      setformattedData(rows);
      const formatted = formatTherapyTable(apiDataLocal);
      console.log("TABLE DATA:", formatted);
      setTableData(formatted);
      setShowTable(true);
      setTableOpen(false); // start collapsed so user clicks to expand

      // Only set backendServiceType if it's one of the root types and not already set correctly
      if (apiDataLocal.length > 0) {
        let rootType = apiDataLocal[0].serviceType?.toLowerCase();
        if (rootType === "exercise") rootType = "activity"; // Normalize to activity
        if (rootType && ["package", "program", "therapy", "activity"].includes(rootType)) {
          setBackendServiceType(rootType);
        }
      }
    } catch (error) { console.error("Generate API Error:", error); }
    finally { setLoading(false); }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);

    if (type !== backendServiceType) {
      setPaymentType("full");
      setPaymentPercent(100);
      setSelectedValue([]); // If switching to a more granular level, make them select manually
      setTotalForSelection(0);
      setPaymentAmount(0);
      setFinalAmount(0);
    } else {
      setPaymentType("full");
      setPaymentPercent(100);

      // If switching back to root type, pre-select everything by default
      const programs = normalizeToPrograms(apiData);
      let opts = [];
      if (type === "package") {
        opts = apiData.map(p => ({ label: p.packageName || p.name || p.programName || "Package", value: p.packageId, price: calculateUnpaidAmount(p, "package") }));
      } else if (type === "program") {
        opts = programs.filter(p => p.paymentStatus?.toLowerCase() !== "paid").map(p => ({ label: p.programName || p.name || p.packageName || "-", value: p.programId, price: calculateUnpaidAmount(p, "program") }));
      } else if (type === "therapy") {
        opts = programs.flatMap(p => (p.therapyData || []).filter(t => t.paymentStatus?.toLowerCase() !== "paid").map(t => ({ label: t.therapyName || t.name || "-", value: t.therapyId, price: calculateUnpaidAmount(t, "therapy") })));
      } else if (type === "activity") {
        opts = programs.flatMap(p => (p.therapyData || []).flatMap(t => (t.exercises || []).filter(ex => ex.paymentStatus?.toLowerCase() !== "paid").map(ex => ({ label: ex.exerciseName || ex.name || "-", value: ex.exerciseId || ex.therapyExercisesId, price: calculateUnpaidAmount(ex, "activity") }))));
      }

      setSelectedValue(opts);

      let amount = 0;
      if (isFollowUpPayment) {
        amount = Number(balanceAmount || 0);
      } else {
        if (type === "package") {
          const root = apiData?.[0];
          amount = Number(root?.totalSessionCost || root?.total || root?.totalPrice || 0);
        } else {
          amount = opts.reduce((sum, i) => sum + i.price, 0);
        }
      }
      setTotalForSelection(amount);
      setPaymentAmount(amount);
      setFinalAmount(amount);
    }
  };

  const checkAllSessionsPaid = (data) => {
    const programs = normalizeToPrograms(data?.therapyWithSessions || []);
    const sessions = programs.flatMap(program => (program.therapyData || []).flatMap(therapy => (therapy.exercises || []).flatMap(ex => ex.sessions || [])));
    if (!sessions.length) return false;
    return sessions.every(s => s.paymentStatus?.toLowerCase() === "paid");
  };

  const buildTherapyPayload = () => {
    if (!apiData?.length) return [];
    const item = apiData[0];
    const selectedIds = (selectedValue || []).map(i => i.value);
    const getMatchedSessions = (exerciseId) => {
      const exerciseData = sessionRows.flatMap(prog => prog.therapyData?.flatMap(ther => ther.exercises?.find(ex => ex.exerciseId === exerciseId))).filter(Boolean)[0];
      return exerciseData?.sessions || [];
    };
    const mapExercise = (ex) => ({
      exerciseId: String(ex.exerciseId || ""),
      exerciseName: String(ex.exerciseName || ex.name || "Unknown"),
      pricePerSession: Number(ex.totalPrice || ex.pricePerSession) || 0,
      noOfSessions: Number(ex.noOfSessions) || 0,
      totalExercisePrice: Number(ex.totalSessionCost || ex.totalExercisePrice) || 0,
      paymentStatus: "UNPAID",
      frequency: String(ex.frequency || ex.frequancy || ""),
      sets: Number(ex.sets) || 0,
      repetitions: Number(ex.repetitions) || 0,
      youtubeUrl: String(ex.videoUrl || ex.youtubeUrl || ""),
      notes: String(ex.notes || ""),
      technique: ex.technique || null,
      machine: ex.machine || null,
      intensity: ex.intensity || null,
      assistanceLevel: ex.assistanceLevel || null,
      type: ex.type || null,
      area: ex.area || null,
      metric: ex.metric || null,
      value: ex.value || null,
      unit: ex.unit || null,
      bodyPart: ex.bodyPart || null,
      activityType: ex.activityType || null,
      activityDuration: ex.activityDuration || null
    });
    if (selectedType === "package") { return [{ packageId: item.packageId, packageName: item.packageName, programs: (item.therapySessions || []).map(program => ({ programId: program.programId, programName: program.programName, therapyData: (program.therapyData || []).map(therapy => ({ therapyId: therapy.therapyId, therapyName: therapy.therapyName, totalPrice: therapy.totalPrice, exercises: (therapy.exercises || []).map(ex => mapExercise(ex)) })) })) }]; }
    if (selectedType === "program") { return (item.therapySessions || []).filter(p => !selectedIds.length || selectedIds.includes(p.programId)).map(program => ({ programId: program.programId, programName: program.programName, therapyData: (program.therapyData || []).map(therapy => ({ therapyId: therapy.therapyId, therapyName: therapy.therapyName, totalPrice: therapy.totalPrice, exercises: (therapy.exercises || []).map(ex => mapExercise(ex)) })) })); }
    return [];
  };

  const getTherapyWithSessions = () => {
    if (!apiData?.length) return [];
    const root = apiData[0];
    const selectedIds = selectedValue.map(i => i.value);
    if (selectedType === "package") return root.therapySessions || [];
    if (selectedType === "program") return (root.therapySessions || []).filter(p => selectedIds.includes(p.programId));
    if (selectedType === "therapy") return (root?.therapySessions || []).flatMap(program => program?.therapyData || []).filter(t => selectedIds.includes(t.therapyId));
    if (selectedType === "activity") return (root.therapySessions || []).map(program => ({ ...program, therapyData: (program.therapyData || []).map(therapy => ({ ...therapy, exercises: (therapy.exercises || []).filter(ex => selectedIds.includes(ex.exerciseId)) })).filter(t => t.exercises.length > 0) })).filter(p => p.therapyData.length > 0);
    return [];
  };

  // Initialize selected type and payment data when apiData changes
  useEffect(() => {
    if (!apiData?.length) return;
    const root = apiData[0];
    let type = (root.serviceType || "").toLowerCase();
    if (type === "exercise") type = "activity"; // Normalize to activity

    // Set initial service type selection
    setSelectedType(type);
    setBackendServiceType(type); // Ensure backend service type is synced

    // Default payment settings
    setPaymentType("full");
    setPaymentPercent(100);

    // If it's a follow-up payment, don't overwrite the amounts already set in initializePayment
    if (isFollowUpPayment) return;

    const programs = normalizeToPrograms(apiData);
    let opts = [];
    if (type === "package") {
      opts = apiData.map(p => ({ label: p.packageName || p.name || p.programName || "Package", value: p.packageId, price: calculateUnpaidAmount(p, "package") }));
    } else if (type === "program") {
      opts = programs.filter(p => p.paymentStatus?.toLowerCase() !== "paid").map(p => ({ label: p.programName || p.name || p.packageName || "-", value: p.programId, price: calculateUnpaidAmount(p, "program") }));
    } else if (type === "therapy") {
      opts = programs.flatMap(p => (p.therapyData || []).filter(t => t.paymentStatus?.toLowerCase() !== "paid").map(t => ({ label: t.therapyName || t.name || "-", value: t.therapyId, price: calculateUnpaidAmount(t, "therapy") })));
    } else if (type === "activity") {
      opts = programs.flatMap(p => (p.therapyData || []).flatMap(t => (t.exercises || []).filter(ex => ex.paymentStatus?.toLowerCase() !== "paid").map(ex => ({ label: ex.exerciseName || ex.name || "-", value: ex.exerciseId || ex.therapyExercisesId, price: calculateUnpaidAmount(ex, "activity") }))));
    }

    setSelectedValue(opts);

    let totalAmount = 0;
    if (type === "package") {
      totalAmount = Number(root.totalSessionCost || root.total || root.totalPrice || 0);
    } else {
      totalAmount = opts.reduce((sum, item) => sum + item.price, 0);
    }

    setTotalForSelection(totalAmount);
    setPaymentAmount(totalAmount);
    setFinalAmount(totalAmount);
  }, [apiData]);

  const createPayloadData = {
    clinicId, branchId, bookingId, patientId, sessionStartDate: startDate, doctorId, doctorName, therapistId, therapistName, therapistRecordId,
    serviceType: backendServiceType === "activity" ? "EXERCISE" : backendServiceType.toUpperCase(),
    paymentLevel: selectedType === "activity" ? "EXERCISE" : selectedType.toUpperCase(),
    amount: Number(finalAmount || 0), paymentMode: paymentMode.toUpperCase(), paymentType: paymentType.toUpperCase(),
    totalSessionCount: 2, discountAmount: Number(discountAmount || 0), discountIssuedBy,
    payAfterService: true,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentTarget: {
      packageIds: selectedType === "package" ? [packageId] : [],
      programIds: selectedType === "program" ? selectedValue.map(i => i.value) : [],
      therapyIds: selectedType === "therapy" ? selectedValue.map(i => i.value) : [],
      exerciseIds: selectedType === "activity" ? selectedValue.map(i => i.value) : [],
      sessionIds: selectedType === "session" ? selectedValue.map(i => i.value) : []
    },
    therapyWithSessions: (() => {
      const type = backendServiceType?.toLowerCase();
      if (!apiData?.length) return [];

      const mapEx = (ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        pricePerSession: Number(ex.totalPrice || (ex.totalSessionCost / (ex.noOfSessions || 1)) || ex.pricePerSession || 0),
        totalExercisePrice: Number(ex.totalSessionCost || ex.totalExercisePrice || 0),
        noOfSessions: Number(ex.noOfSessions || 0),
        repetitions: Number(ex.repetitions || 0),
        sets: Number(ex.sets || 0),
        frequency: ex.frequency || "",
        youtubeUrl: ex.youtubeUrl || "",
        notes: ex.notes || "",
        technique: ex.technique || null,
        machine: ex.machine || null,
        intensity: ex.intensity || null,
        assistanceLevel: ex.assistanceLevel || null,
        type: ex.type || null,
        area: ex.area || null,
        metric: ex.metric || null,
        value: ex.value || null,
        unit: ex.unit || null,
        bodyPart: ex.bodyPart || null,
        activityType: ex.activityType || null,
        activityDuration: ex.activityDuration || null
      });

      if (type === "package") {
        return apiData.map(pkg => ({
          packageId: pkg.packageId || "",
          packageName: pkg.packageName || "",
          totalPrice: pkg.totalPrice || 0,
          programs: (pkg.programs || pkg.therapySessions || []).map(prog => ({
            programId: prog.programId,
            programName: prog.programName,
            therapyData: (prog.therapyData || []).map(therapy => ({
              therapyId: therapy.therapyId,
              therapyName: therapy.therapyName,
              exercises: (therapy.exercises || []).map(ex => mapEx(ex))
            }))
          }))
        }));
      }

      if (type === "program") {
        return apiData.map(program => ({
          programId: program.programId,
          programName: program.programName,
          therapyData: (program.therapyData || []).map(therapy => ({
            therapyId: therapy.therapyId,
            therapyName: therapy.therapyName,
            exercises: (therapy.exercises || []).map(ex => mapEx(ex))
          }))
        }));
      }

      if (type === "therapy") {
        return apiData.map(therapy => ({
          therapyId: therapy.therapyId,
          therapyName: therapy.therapyName,
          exercises: (therapy.exercises || []).map(ex => mapEx(ex))
        }));
      }

      if (type === "activity") {
        return [{
          exercises: apiData.flatMap(item => (item.exercises || [])).map(ex => mapEx(ex))
        }];
      }
      return [];
    })(),
  };

  const updatePayload = {
    bookingId, amount: Number(finalAmount || 0), paymentMode: paymentMode?.toUpperCase(),
    paymentType: paymentType?.toUpperCase(),
    paymentLevel: selectedType === "activity" ? "EXERCISE" : selectedType?.toUpperCase(),
    paymentTarget: {
      ...(selectedType === "package" && { packageIds: selectedValue.length ? selectedValue.map(i => i.value) : apiData.map(i => i.packageId) }),
      ...(selectedType === "program" && { programIds: selectedValue.length ? selectedValue.map(i => i.value) : apiData[0]?.therapySessions?.map(p => p.programId) }),
      ...(selectedType === "therapy" && { therapyIds: selectedValue.length ? selectedValue.map(i => i.value) : apiData[0]?.therapySessions?.flatMap(p => p.therapyData?.map(t => t.therapyId)) }),
      ...(selectedType === "activity" && { exerciseIds: selectedValue.length ? selectedValue.map(i => i.value) : apiData[0]?.therapySessions?.flatMap(p => p.therapyData?.flatMap(t => t.exercises?.map(e => e.therapyExercisesId))) }),
      ...(selectedType === "session" && { sessionIds: selectedValue.length ? selectedValue.map(i => i.value) : sessionRows.map(s => s.sessionId) }),
    },
    paymentDate: new Date().toISOString().split("T")[0],
    payAfterService: true,
    discountAmount: Number(discountAmount || 0),
    discountIssuedBy,
  };

  const handleSubmit = async () => {
    const hasPaidOnceSubmit = Number(totalPaid || 0) > 0 || (Array.isArray(paymentHistory) ? paymentHistory.length > 0 : false);
    const isApprovalRequired = !payAfterService && !hasPaidOnceSubmit && (Number(paymentPercent) < 50 || Number(discount || 0) > 0 || Number(discountAmount || 0) > 0);
    if (isApprovalRequired && !discountIssuedBy.trim()) {
      showCustomToast(
        "Approval is required when a discount is applied or payment is below 50%",
        "error"
      )
      setSubmitLoading(false)
      return
    }
    try {
      setSubmitLoading(true);
      let payload, url, method;
      if (!isFollowUpPayment && !sessionTableAlreadyCreated) {
        if (payAfterService) {
          const type = backendServiceType?.toLowerCase();
          const mapEx = (ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            pricePerSession: Number(ex.totalPrice || (ex.totalSessionCost / (ex.noOfSessions || 1)) || ex.pricePerSession || 0),
            totalExercisePrice: Number(ex.totalSessionCost || ex.totalExercisePrice || 0),
            noOfSessions: Number(ex.noOfSessions || 0),
            repetitions: Number(ex.repetitions || 0),
            sets: Number(ex.sets || 0),
            frequency: ex.frequency || "",
            youtubeUrl: ex.youtubeUrl || "",
            notes: ex.notes || "",
            technique: ex.technique || null,
            machine: ex.machine || null,
            intensity: ex.intensity || null,
            assistanceLevel: ex.assistanceLevel || null,
            type: ex.type || null,
            area: ex.area || null,
            metric: ex.metric || null,
            value: ex.value || null,
            unit: ex.unit || null,
            bodyPart: ex.bodyPart || null,
            activityType: ex.activityType || null,
            activityDuration: ex.activityDuration || null
          });

          const therapyWithSessionsData = (() => {
            if (!apiData?.length) return [];
            if (type === "package") {
              return apiData.map(pkg => ({
                packageId: pkg.packageId || "",
                packageName: pkg.packageName || "",
                totalPrice: pkg.totalPrice || 0,
                programs: (pkg.programs || pkg.therapySessions || []).map(prog => ({
                  programId: prog.programId,
                  programName: prog.programName,
                  therapyData: (prog.therapyData || []).map(therapy => ({
                    therapyId: therapy.therapyId,
                    therapyName: therapy.therapyName,
                    exercises: (therapy.exercises || []).map(ex => mapEx(ex))
                  }))
                }))
              }));
            }
            if (type === "program") {
              return apiData.map(program => ({
                programId: program.programId,
                programName: program.programName,
                therapyData: (program.therapyData || []).map(therapy => ({
                  therapyId: therapy.therapyId,
                  therapyName: therapy.therapyName,
                  exercises: (therapy.exercises || []).map(ex => mapEx(ex))
                }))
              }));
            }
            if (type === "therapy") {
              return apiData.map(therapy => ({
                therapyId: therapy.therapyId,
                therapyName: therapy.therapyName,
                exercises: (therapy.exercises || []).map(ex => mapEx(ex))
              }));
            }
            if (type === "activity") {
              return [{
                exercises: apiData.flatMap(item => (item.exercises || [])).map(ex => mapEx(ex))
              }];
            }
            return [];
          })();

          payload = {
            clinicId, branchId, bookingId, patientId, sessionStartDate: startDate, doctorId, doctorName, therapistId, therapistName, therapistRecordId,
            serviceType: backendServiceType === "activity" ? "EXERCISE" : backendServiceType.toUpperCase(),
            payAfterService: false,
            therapyWithSessions: therapyWithSessionsData
          };
        } else {
          payload = createPayloadData;
        }
        url = `${wifiUrl}/api/physiotherapy-doctor/payment/create`;
        method = "POST";
      }
      else {
        if (payAfterService) {
          // Checkbox checked → pay after service, send null payment fields (same as initial backend entry)
          payload = {
            bookingId,
            payAfterService: false,
            amount: null,
            paymentMode: null,
            paymentType: null,
            paymentDate: null,
            paymentLevel: null,
            discountAmount: null,
            discountIssuedBy: null,
          };
        } else {
          // Checkbox unchecked → normal payment with actual values
          payload = { ...updatePayload, payAfterService: true };
        }
        url = `${wifiUrl}/api/physiotherapy-doctor/payment/update`;
        method = "POST";
      }
      console.log("FINAL PAYLOAD:", payload);
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      console.log("API RESPONSE:", data);

      if (data.success || response.ok) {
        setIsFollowUpPayment(true);
        setPrintData({ ...payload, selectedItems: selectedValue, tableData, startDate });
        showCustomToast("Payment processed successfully!", "success");
        navigate(-1);
      } else {
        showCustomToast(data.message || "Payment processing failed.", "error");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      showCustomToast("An error occurred during payment processing.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(`${wifiUrl}/api/physiotherapy-doctor/payment/${bookingId}`);
      const data = await res.json();
      if (!data.success) return;
      const result = data.data;
      setAllPaid(checkAllSessionsPaid(result));
      setFullPaymentData(result);
      console.log(result);
      const validHistory = getValidPaymentHistory(result.paymentHistory);
      if (validHistory.length > 0) { setPaymentAmount(result.balanceAmount || 0); setFinalAmount(result.balanceAmount || 0); }
      else { setPaymentAmount(result.totalAmount || 0); setFinalAmount(result.finalAmount || result.totalAmount || 0); }
      setDiscountAmount(result.discountAmount || 0);
      setDoctorName(result.doctorName);
      setTherapistName(result.therapistName);
      setTherapistRecordId(result.therapistRecordId);
      setPaymentStatus(result.paymentStatus);
      setPaymentHistory(validHistory);
      setPayAfterService(result.payAfterService === false);
      const typeRaw = result.serviceType?.toLowerCase() || "";
      setBackendServiceType(typeRaw === "exercise" ? "activity" : typeRaw); // Sync backend service type
      const formatted = formatTherapyTable(result.therapyWithSessions);
      setTableData(formatted);
      setShowTable(true);
      if (validHistory.length > 0) setIsFollowUpPayment(true);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const total = Number(paymentAmount || 0);
    // For follow-up payments, discount is always 0 — don't deduct it
    const discountVal = isFollowUpPayment ? 0 : Number(discountAmount || 0);
    setFinalAmount(total - discountVal);
  }, [paymentAmount, discountAmount, isFollowUpPayment]);

  // ── react-select styles ──────────────────────────────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "38px",
      fontSize: "13px",
      borderColor: state.isFocused ? COLORS.primary : "#d1d5db",
      borderWidth: "1px",
      borderRadius: "8px",
      boxShadow: state.isFocused ? `0 0 0 2px ${COLORS.primary}25` : "none",
      background: "#fff",
      "&:hover": { borderColor: COLORS.primary },
    }),
    placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "13px" }),
    singleValue: (base) => ({ ...base, color: COLORS.primary, fontWeight: "500" }),
    multiValue: (base) => ({
      ...base,
      background: `${COLORS.primary}10`,
      borderRadius: "6px",
      border: `1px solid ${COLORS.primary}20`,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: COLORS.primary,
      fontSize: "12px",
      fontWeight: "600",
      padding: "2px 8px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: COLORS.primary,
      "&:hover": { background: COLORS.primary, color: "#fff" },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      fontWeight: "500",
      backgroundColor: state.isSelected ? COLORS.primary : state.isFocused ? `${COLORS.primary}15` : "transparent",
      color: state.isSelected ? "#fff" : COLORS.primary,
      cursor: "pointer",
      "&:active": { backgroundColor: COLORS.primary },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
      overflow: "hidden",
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px",
      maxHeight: "220px", // around 5 items
      overflowY: "auto",

      /* scrollbar */
      scrollbarWidth: "thin",
    }),
  };

  const primaryBtn = {
    background: COLORS.primary, color: "#fff", border: "none",
    borderRadius: "8px", padding: "9px 18px",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
  };

  const labelStyle = { fontSize: "11px", fontWeight: 600, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" };
  const inputStyle = { fontSize: "13px", color: COLORS.primary, border: "0.5px solid #d0dce9", borderRadius: "7px", padding: "8px 12px" };

  const hasPaidOnce = Number(totalPaid || 0) > 0 || (Array.isArray(paymentHistory) ? paymentHistory.length > 0 : false);
  const isApprovalRequired = !payAfterService && !hasPaidOnce && (Number(paymentPercent) < 50 || Number(discount || 0) > 0 || Number(discountAmount || 0) > 0);

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh", padding: "20px" }}>

      {/* ── Patient Financial Stats ── */}
      {/* {isFollowUpPayment && (
        <CRow className="g-3 mb-4">
          <CCol md={3}>
            <div style={{ background: "#fff", border: "0.5px solid #d0dce9", borderRadius: "10px", padding: "12px 16px", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.02em" }}>Total Paid</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#15803d" }}>₹{totalPaid}</span>
            </div>
          </CCol>
          <CCol md={3}>
            <div style={{ background: "#fff", border: "0.5px solid #d0dce9", borderRadius: "10px", padding: "12px 16px", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.02em" }}>Balance Amount</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#b45309" }}>₹{balanceAmount}</span>
            </div>
          </CCol>
        </CRow>
      )} */}

      {/* ── Payment Details button ── */}
      {isFollowUpPayment && !allPaid && (
        <button
          onClick={() => navigate("/paymentDetails", { state: { paymentData: fullPaymentData } })}
          style={{
            background: COLORS.primary, color: "#fff", border: "none",
            borderRadius: "8px", padding: "9px 18px",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          Payment Details
        </button>
      )}

      {/* ── STEP 1: Generate Table ── */}
      {isInitializing ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <span
            style={{
              display: "inline-block",
              width: "24px", height: "24px",
              border: "3px solid #ccc",
              borderTopColor: COLORS.primary,
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              marginBottom: "10px"
            }}
          />
          <p style={{ color: "#6b7280", fontWeight: "600", fontSize: "14px" }}>Loading Payment Details...</p>
        </div>
      ) : noSessionMsg ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#dc2626", fontWeight: "600", border: "1px solid #fca5a5", backgroundColor: "#fef2f2", borderRadius: "8px", marginBottom: "16px" }}>
          {noSessionMsg}
        </div>
      ) : !showTable && (
        <div style={{
          background: "#fff", border: "0.5px solid #d0dce9",
          borderRadius: "10px", padding: "16px 20px", marginBottom: "16px",
        }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
            Generate Session Table
          </p>
          <CRow className="mb-4">
            <CCol md={3}>
              <CFormLabel style={labelStyle}>Start Date</CFormLabel>
              <CFormInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </CCol>
            <CCol md={3} className="d-flex align-items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{ ...primaryBtn, opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", gap: "8px", minWidth: "140px", justifyContent: "center" }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Generating...
                  </>
                ) : "Generate Table"}
              </button>

            </CCol>
          </CRow>
        </div>
      )}

      {
        showTable && !allPaid && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px"
            }}
          >
            <input
              type="checkbox"
              checked={payAfterService}
              onChange={(e) => setPayAfterService(e.target.checked)}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer"
              }}
            />

            <label
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: COLORS.primary,
                cursor: "pointer",
                margin: 0
              }}
            >
              Pay After Service
            </label>
          </div>
        )
      }


      {/* ── STEP 2: Session Table (Accordion) ── */}
      {showTable && !allPaid && !sessionTableAlreadyCreated && (
        <div style={{
          background: "#fff", border: "0.5px solid #d0dce9",
          borderRadius: "10px", overflow: "hidden", marginBottom: "16px",
        }}>
          {/* Accordion header – click to toggle */}
          <div
            onClick={() => setTableOpen(prev => !prev)}
            style={{
              background: COLORS.primary, padding: "10px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", userSelect: "none",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
              Session Details
              <span style={{
                marginLeft: "10px", background: "rgba(255,255,255,0.2)",
                borderRadius: "20px", fontSize: "11px", padding: "1px 8px",
              }}>
                {formattedData.length} sessions
              </span>
            </span>
            <span style={{
              color: "#fff", fontSize: "14px",
              transform: tableOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}>▾</span>
          </div>

          {/* Collapsible body */}
          {tableOpen && (
            <div style={{ overflowX: "auto" }}>
              <CTable className="mb-0" style={{ fontSize: "12px" }}>
                <CTableHead>
                  <CTableRow>
                    {["Activity Name", "Session ID", "Date", "Status", "Payment Status"].map(h => (
                      <CTableHeaderCell key={h} style={thStyle}>{h}</CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {formattedData.map((session, i) => (
                    <CTableRow
                      key={session.sessionId || i}
                      style={{ fontSize: "12px" }}
                    >
                      <CTableDataCell style={tdStyle}>
                        {session?.exerciseName || "-"}
                      </CTableDataCell>
                      <CTableDataCell style={tdStyle}>{session?.sessionId}</CTableDataCell>
                      <CTableDataCell style={tdStyle}>{session?.date}</CTableDataCell>
                      <CTableDataCell style={tdStyle}>{session?.status}</CTableDataCell>
                      <CTableDataCell style={tdStyle}>
                        <span style={{
                          display: "inline-block", borderRadius: "20px",
                          fontSize: "11px", fontWeight: 600, padding: "2px 9px",
                          ...(session?.paymentStatus?.toLowerCase() === "paid"
                            ? { background: "#eaf3de", color: "#27500a", border: "0.5px solid #97c459" }
                            : { background: "#fcebeb", color: "#791f1f", border: "0.5px solid #f09595" })
                        }}>
                          {session?.paymentStatus}
                        </span>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </div>
      )}

      {/* ── All Paid State ── */}
      {allPaid && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div style={{
            background: "#fff", border: "0.5px solid #d0dce9",
            borderRadius: "12px", padding: "48px 40px",
            maxWidth: "420px", width: "100%", textAlign: "center",
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "#eaf3de", border: "0.5px solid #97c459",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "28px",
            }}>✓</div>
            <p style={{ fontSize: "17px", fontWeight: 600, color: COLORS.primary, marginBottom: "8px" }}>
              All Sessions Paid
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
              All session payments have been completed successfully.
            </p>
            <button
              onClick={() => navigate("/paymentDetails", { state: { paymentData: fullPaymentData } })}
              style={primaryBtn}
            >
              Payment Details
            </button>
          </div>
        </div>
      )}

      {/* ── Payment Form ── */}
      {showTable && !allPaid && !payAfterService && (
        <div style={{
          background: "#fff", border: "0.5px solid #d0dce9",
          borderRadius: "10px", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: COLORS.primary,
            padding: "8px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Payment</span>
            <div style={{ display: "flex", gap: "10px" }}>
              {totalPaid > 0 && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.3)"
                }}>
                  PAID: ₹{totalPaid}
                </span>
              )}
              {balanceAmount > 0 && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "#fbbf24",
                  color: "#000",
                  padding: "2px 8px",
                  borderRadius: "4px"
                }}>
                  BALANCE: ₹{balanceAmount}
                </span>
              )}
            </div>
          </div>

          <div style={{ padding: "16px 20px" }}>
            <CRow className="g-3 mb-3">

              {/* Service Type */}
              <CCol md={3}>
                <CFormLabel style={labelStyle}>Service Type</CFormLabel>
                <CFormSelect
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Type</option>
                  {getServiceTypes().map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Select Value */}
              <CCol md={4}>
                {selectedType !== "package" && (
                  <>
                    <CFormLabel style={labelStyle}>Select Value</CFormLabel>
                    <Select
                      isMulti
                      options={getOptionsByType()}
                      value={selectedValue || []}
                      onChange={handleSelectValue}
                      styles={selectStyles}
                    />
                  </>
                )}
              </CCol>

              {/* Payment Type */}
              <CCol md={2}>
                <CFormLabel style={labelStyle}>Payment Type</CFormLabel>
                <CFormSelect
                  value={paymentType}
                  disabled={String(selectedType).toLowerCase() !== String(backendServiceType).toLowerCase()}
                  onChange={(e) => {
                    const type = e.target.value;
                    setPaymentType(type);
                    if (type === "partial") {
                      setPaymentPercent(50);
                      const amount = (Number(paymentAmount) * 50) / 100;
                      setPaymentAmount(amount.toFixed(2));
                    } else {
                      setPaymentPercent(100);
                      let total = 0;
                      if (selectedType === "package") {
                        const root = apiData?.[0];
                        total = Number(root?.total || root?.totalPrice || 0);
                      } else {
                        total = selectedValue.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
                      }
                      setPaymentAmount(total);
                    }
                  }}
                  style={inputStyle}
                >
                  <option value="full">Full</option>
                  <option value="partial">Partial</option>
                </CFormSelect>
              </CCol>

            </CRow>

            <CRow className="g-3">
              <CCol md={2}>
                <CFormLabel style={labelStyle}>Total Amount</CFormLabel>
                <CFormInput value={totalForSelection} readOnly style={{ ...inputStyle, background: "#f7fafd", color: COLORS.primary, fontWeight: 600 }} />
              </CCol>

              <CCol md={2}>
                <CFormLabel style={labelStyle}>Payment Amount</CFormLabel>

                <CFormInput
                  value={paymentAmount}
                  onChange={(e) => {
                    const amount = Number(e.target.value || 0)

                    setPaymentAmount(amount)

                    const total = Number(totalForSelection || 0)

                    // auto percentage calculation
                    const percent =
                      total > 0
                        ? ((amount / total) * 100).toFixed(2)
                        : 0

                    setPaymentPercent(percent)

                    // auto payment type
                    if (percent < 100) {
                      setPaymentType("partial")
                    } else {
                      setPaymentType("full")
                    }
                  }}
                  style={{
                    ...inputStyle,
                    // border:
                    //   paymentPercent < 50
                    //     ? "1px solid #ef4444"
                    //     : inputStyle.border,
                  }}
                  disabled={
                    String(selectedType).toLowerCase() !==
                    String(backendServiceType).toLowerCase()
                  }
                />

                {/* Approval Warning */}
                {/* {paymentPercent < 50 && (
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#dc2626",
                      fontWeight: "600",
                    }}
                  >
                    Approval required below 50%
                  </div>
                )} */}
              </CCol>

              <CCol md={2}>
                <CFormLabel style={labelStyle}>Payment %</CFormLabel>

                <CFormInput
                  value={paymentPercent}
                  onChange={(e) => {
                    const percent = Number(e.target.value || 0)

                    setPaymentPercent(percent)

                    const total = Number(totalForSelection || 0)

                    // auto amount calculation
                    const amount = (total * percent) / 100

                    setPaymentAmount(amount.toFixed(2))

                    // auto payment type
                    if (percent < 100) {
                      setPaymentType("partial")
                    } else {
                      setPaymentType("full")
                    }
                  }}
                  style={{
                    ...inputStyle,
                    // border:
                    //   paymentPercent < 50
                    //     ? "1px solid #ef4444"
                    //     : inputStyle.border,
                  }}
                  disabled={
                    String(selectedType).toLowerCase() !==
                    String(backendServiceType).toLowerCase()
                  }
                />

                {/* Approval Warning */}
                {/* {paymentPercent < 50 && (
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#dc2626",
                      fontWeight: "600",
                    }}
                  >
                    Approval required below 50%
                  </div>
                )} */}
              </CCol>

              {!hasPaidOnce && (
                <>
                  <CCol md={2}>
                    <CFormLabel style={labelStyle}>Discount %</CFormLabel>
                    <CFormInput
                      value={discount}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        setDiscount(rawValue);
                        const percent = Number(rawValue || 0);
                        if (percent === 0) {
                          setDiscountAmount(0);
                        } else {
                          const amount = (paymentAmount * percent) / 100;
                          setDiscountAmount(Number(amount.toFixed(2)));
                        }
                      }}
                      style={inputStyle}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel style={labelStyle}>Discount Amount</CFormLabel>
                    <CFormInput
                      value={discountAmount}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        setDiscountAmount(rawValue);
                        const amount = Number(rawValue || 0);
                        if (amount === 0) {
                          setDiscount(0);
                        } else {
                          const percent = paymentAmount > 0 ? (amount / paymentAmount) * 100 : 0;
                          setDiscount(Number(percent.toFixed(2)));
                        }
                      }}
                      style={inputStyle}
                    />
                  </CCol>
                </>
              )}
              {
                !hasPaidOnce && (
                  <CCol md={2}>
                    <CFormLabel style={labelStyle}>Final Amount</CFormLabel>
                    <CFormInput value={finalAmount.toFixed(2)} readOnly style={{ ...inputStyle, background: "#eaf3de", color: "#27500a", fontWeight: 600 }} />
                  </CCol>
                )
              }

            </CRow>

            <CRow className="g-3 mt-2">
              {!hasPaidOnce && (
                <CCol md={3}>
                  <CFormLabel style={labelStyle}>
                    Approved By
                    {isApprovalRequired && (
                      <span style={{ color: "#dc2626" }}> *</span>
                    )}
                  </CFormLabel>

                  <CFormInput
                    value={discountIssuedBy}
                    onChange={(e) => setDiscountIssuedBy(e.target.value)}
                    placeholder={
                      isApprovalRequired
                        ? "Approval is required"
                        : "Enter approved person"
                    }
                    style={{
                      ...inputStyle,
                      border:
                        isApprovalRequired && !discountIssuedBy
                          ? "1px solid #dc2626"
                          : inputStyle.border,
                      background:
                        isApprovalRequired
                          ? "#fef2f2"
                          : "#fff",
                    }}
                  />

                  {isApprovalRequired && !discountIssuedBy && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: "11px",
                        marginTop: "4px",
                        fontWeight: "500",
                      }}
                    >
                      Approval is required
                    </div>
                  )}
                </CCol>
              )}

              <CCol md={3}>
                <CFormLabel style={labelStyle}>Payment Mode</CFormLabel>
                <CFormSelect
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={inputStyle}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "0.5px solid #d0dce9", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                style={{ ...primaryBtn, opacity: submitLoading ? 0.75 : 1, display: "flex", alignItems: "center", gap: "8px", minWidth: "160px", justifyContent: "center" }}
              >
                {submitLoading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Processing...
                  </>
                ) : (
                  isFollowUpPayment ? "Update Payment" : "Submit Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay After Service Submit Button ── */}
      {showTable && !allPaid && payAfterService && (
        <div style={{
          background: "#fff", border: "0.5px solid #d0dce9",
          borderRadius: "10px", overflow: "hidden", marginTop: "16px"
        }}>
          {/* Header */}
          <div style={{
            background: COLORS.primary,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Pay After Service Activation</span>
          </div>

          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: "13px", color: "#475569", marginBottom: "16px", lineHeight: "1.5" }}>
              The session details table has been successfully generated starting from <strong>{startDate}</strong>.
              Checking <strong>Pay After Service</strong> enables you to submit and activate these sessions directly.
              The patient will make payments after their treatment services are completed.
            </p>
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "0.5px solid #d0dce9", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                style={{ ...primaryBtn, opacity: submitLoading ? 0.75 : 1, display: "flex", alignItems: "center", gap: "8px", minWidth: "180px", justifyContent: "center" }}
              >
                {submitLoading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Activating...
                  </>
                ) : (
                  "Activate Pay After Service"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pm-input:focus { border-color: #185fa5 !important; box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important; }
        select.pm-input, input.pm-input { height: 36px; font-size: 13px; border: 0.5px solid #ced4da; border-radius: 7px; padding: 0 10px; }
        select.pm-input:focus, input.pm-input:focus { border-color: #185fa5; outline: none; box-shadow: 0 0 0 2px rgba(24,95,165,0.15); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Style constants ──────────────────────────────────────────────
const labelStyle = {
  fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "4px", display: "block",
};
const inputStyle = {
  height: "36px", fontSize: "13px", border: "0.5px solid #ced4da",
  borderRadius: "7px", transition: "border-color 0.15s, box-shadow 0.15s",
};
const thStyle = {
  background: "#185fa5", color: "#fff", fontSize: "11px", fontWeight: 600,
  padding: "8px 12px", borderColor: "#185fa5", whiteSpace: "nowrap",
};
const tdStyle = {
  fontSize: "12px", padding: "9px 12px", borderColor: "#eef2f7",
  verticalAlign: "middle", color: "#374151",
};
const primaryBtn = {
  background: "#185fa5", color: "#fff", border: "none", borderRadius: "8px",
  padding: "9px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
};