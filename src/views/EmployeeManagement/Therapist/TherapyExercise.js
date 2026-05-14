/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react"
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormText,
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
  CRow,
  CCol,
  CImage,
} from "@coreui/react"
import { Edit2, Eye, Trash2, Dumbbell, PlusCircle, AlertTriangle, Search, X } from "lucide-react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import {
  createTherapyExercise,
  updateTherapyExercise,
  deleteTherapyExercise,
  getTherapyExercise,
} from "./TheraphyApi"
import ConfirmationModal from "../../../components/ConfirmationModal"
import LoadingIndicator from "../../../Utils/loader"
import { showCustomToast } from "../../../Utils/Toaster"
import { useHospital } from "../../Usecontext/HospitalContext"
import { useGlobalSearch } from "../../Usecontext/GlobalSearchContext"
import Pagination from "../../../Utils/Pagination"

// const emptyExercise = {
//   name: "",
//   video: "",
//   session: "1",
//   frequency: "",
//   notes: "",
//   image: "",
//   imagePreview: "",
//   pricePerSession: "",
//   sets: "",
//   repetitions: "",
//   gst: "",
//   otherTax: "",
//   discountPercentage: "",
// }
// ✅ Add this inside your component (above return)

// Activity Options
const activityOptions = [
  "Exercise",
  "Manual",
  "Electrotherapy",
  "Modality",
  "Functional Training",
  "Supportive",
  "Education",
  "Assessment",
]

// update emptyExercise
const emptyExercise = {
  activityType: "Exercise",
  name: "",
  video: "",
  session: "1",
  frequency: "",
  notes: "",
  pricePerSession: "",
  gst: "",
  otherTax: "",
  discountPercentage: "",

  // Exercise only
  sets: "",
  repetitions: "",

  // Manual
  technique: "",
  duration: "",
  durationUnit: "mins",

  // Electrotherapy
  machine: "",
  intensity: "",

  // Functional
  assistanceLevel: "",

  // Supportive
  supportType: "",
  area: "",

  // Assessment
  metric: "",
  value: "",
  unit: "",

  bodyPart: "",
}


/* ─── Decode video URL (handles Base64-encoded URLs from backend) ────── */
const decodeVideoUrl = (url) => {
  if (!url) return ""
  try {
    // If it already starts with http/https, just return it
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    // If it starts with www, prepend https://
    if (url.startsWith("www.")) return "https://" + url
    // Try to decode as Base64
    const decoded = atob(url)
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded
    if (decoded.startsWith("www.")) return "https://" + decoded
    // Fallback: prepend https://
    return "https://" + url
  } catch {
    // atob failed — not Base64, just prepend https://
    return "https://" + url
  }
}

/* ─── Impact Warning Banner ─────────────────────────────────────────── */
const ImpactWarning = ({ message }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      background: "#fffbeb",
      border: "1px solid #fcd34d",
      borderRadius: "8px",
      padding: "10px 14px",
      marginBottom: "18px",
    }}
  >
    <AlertTriangle
      size={16}
      style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }}
    />
    <p
      style={{
        margin: 0,
        fontSize: "12px",
        fontWeight: "500",
        color: "#92400e",
        lineHeight: "1.5",
      }}
    >
      {message}
    </p>
  </div>
)

export default function ExerciseTable() {
  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")

  const [exercises, setExercises] = useState([])
  const [form, setForm] = useState(emptyExercise)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [viewModal, setViewModal] = useState(false)
  const [viewData, setViewData] = useState(null)

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [exerciseIdToDelete, setExerciseIdToDelete] = useState(null)
  const [delloading, setDelLoading] = useState(false)

  /* ── Save confirmation modal states ── */
  const [saveConfirmVisible, setSaveConfirmVisible] = useState(false)
  const [isSaveConfirming, setIsSaveConfirming] = useState(false)

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  /* ── Pricing change detector ─────────────────────────────────────── */
  const [originalForm, setOriginalForm] = useState(null)
  const hasPricingChanged =
    editId &&
    originalForm &&
    (
      form.pricePerSession !== originalForm.pricePerSession ||
      form.gst !== originalForm.gst ||
      form.otherTax !== originalForm.otherTax ||
      form.discountPercentage !== originalForm.discountPercentage
    )

  // ── LOAD ─────────────────────────────────────────────
  const loadExercises = async () => {
    try {
      setLoading(true)
      const res = await getTherapyExercise(clinicId, branchId)
      setExercises(res.data || [])
      setCurrentPage(1)
    } catch {
      showCustomToast("Load failed", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadExercises() }, [])

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  // ── FILTER + PAGINATION ──────────────────────────────
  const filteredExercises = exercises.filter((item) => {
    const search = searchQuery.toLowerCase()
    if (!search) return true
    return (
      (item.name || "").toLowerCase().includes(search) ||
      (item.therapyExercisesId || "").toString().toLowerCase().includes(search) ||
      (item.frequency || "").toLowerCase().includes(search) ||
      (item.notes || "").toLowerCase().includes(search) ||
      (item.pricePerSession || "").toString().includes(search) ||
      (item.sets || "").toString().includes(search) ||
      (item.repetitions || "").toString().includes(search)
    )
  })

  const totalPages = Math.ceil(filteredExercises.length / rowsPerPage)
  // ✅ SORT BY DATE MODIFIED (DEFAULT)
  // ✅ SORT BY NAME (ASCENDING)
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    return (a.name || "").localeCompare(b.name || "");
  });
  const displayData = sortedExercises.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ── VALIDATION ───────────────────────────────────────
  const validate = () => {
    const err = {}

    // Common Required Fields
    if (!form.activityType?.trim()) {
      err.activityType = "Activity type is required"
    }

    if (!form.name?.trim()) {
      err.name = "Name is required"
    }

    if (!form.frequency?.trim()) {
      err.frequency = "Frequency is required"
    }

    if (!form.pricePerSession || Number(form.pricePerSession) <= 0) {
      err.pricePerSession = "Enter valid price"
    }

    // Optional Fields Validation
    if (
      form.discountPercentage !== "" &&
      (Number(form.discountPercentage) < 0 ||
        Number(form.discountPercentage) > 100)
    ) {
      err.discountPercentage = "0 to 100 only"
    }

    if (
      form.gst !== "" &&
      Number(form.gst) < 0
    ) {
      err.gst = "GST must be 0 or more"
    }

    if (
      form.otherTax !== "" &&
      Number(form.otherTax) < 0
    ) {
      err.otherTax = "Other tax must be 0 or more"
    }

    // Activity Wise Validation
    switch (form.activityType) {
      case "Exercise":
        if (!form.repetitions || Number(form.repetitions) <= 0) {
          err.repetitions = "Repetitions is required"
        }
        if (!form.sets || Number(form.sets) <= 0) {
          err.sets = "Sets is required"
        }
        if (!form.duration?.trim()) {
          err.duration = "Duration is required"
        }
        break

      case "Manual":
        if (!form.technique?.trim()) {
          err.technique = "Technique is required"
        }
        if (!form.duration?.trim()) {
          err.duration = "Duration is required"
        }
        break

      case "Electrotherapy":
        if (!form.machine?.trim()) {
          err.machine = "Machine is required"
        }
        if (!form.intensity?.trim()) {
          err.intensity = "Intensity is required"
        }
        if (!form.duration?.trim()) {
          err.duration = "Duration is required"
        }
        break

      case "Modality":
        if (!form.duration?.trim()) {
          err.duration = "Duration is required"
        }
        break

      case "Functional Training":
        if (!form.duration?.trim()) {
          err.duration = "Duration is required"
        }
        if (!form.assistanceLevel?.trim()) {
          err.assistanceLevel = "Assistance level is required"
        }
        break

      case "Supportive":
        if (!form.supportType?.trim()) {
          err.supportType = "Type is required"
        }
        if (!form.area?.trim()) {
          err.area = "Area is required"
        }
        if (!form.duration?.trim()) {
          err.duration = "Duration is required"
        }
        break



      case "Assessment":
        if (!form.metric?.trim()) {
          err.metric = "Metric is required"
        }
        if (!form.value?.trim()) {
          err.value = "Value is required"
        }
        if (!form.unit?.trim()) {
          err.unit = "Unit is required"
        }
        break

      default:
        break
    }
    if (!form.bodyPart?.trim()) {
      err.bodyPart = "Body Part is required"
    }
    if (!form.notes?.trim()) {
      err.notes = "Notes are required"
    }

    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── SAVE — validate then open confirm modal ───────────
  const handleSave = () => {
    if (!validate()) return
    setSaveConfirmVisible(true)
  }

  // ── CONFIRMED SAVE ────────────────────────────────────
  const handleConfirmedSave = async () => {
    const combinedDuration = form.duration ? `${form.duration} ${form.durationUnit || 'mins'}` : "";
    const payload = { ...form, duration: combinedDuration, activityDuration: combinedDuration, clinicId, branchId }
    console.log(payload)
    try {
      setIsSaveConfirming(true)
      setSaveLoading(true)
      if (editId !== null) {
        await updateTherapyExercise(editId, payload)
        showCustomToast("Exercise updated successfully!", { position: "top-right" }, "success")
      } else {
        await createTherapyExercise(payload)
        showCustomToast("Exercise added successfully!", { position: "top-right" }, "success")
      }
      setSaveConfirmVisible(false)
      resetForm()
      loadExercises()
    } catch {
      showCustomToast("Something went wrong!", { position: "top-right" }, "error")
    } finally {
      setSaveLoading(false)
      setIsSaveConfirming(false)
    }
  }

  // ── EDIT ─────────────────────────────────────────────
  const handleEdit = (item) => {
    const videoUrl = decodeVideoUrl(item.video)
    let dVal = item.duration || item.activityDuration || "";
    let dUnit = "mins";
    if (dVal && dVal.includes(" ")) {
      const parts = dVal.split(" ");
      dVal = parts[0];
      dUnit = parts.slice(1).join(" ") || "mins";
    }
    const prefilled = { ...item, video: videoUrl, imagePreview: item.image, duration: dVal, durationUnit: dUnit }
    setForm(prefilled)
    setOriginalForm(prefilled)
    setEditId(item.therapyExercisesId)
    setModal(true)
    setErrors({})
  }

  // ── VIEW ─────────────────────────────────────────────
  const handleView = (ex) => {
    setViewData({ ...ex, video: decodeVideoUrl(ex.video) })
    setViewModal(true)
  }

  // ── DELETE ───────────────────────────────────────────
  const openDeleteModal = (id) => {
    setExerciseIdToDelete(id)
    setIsDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTherapyExercise(exerciseIdToDelete)
      showCustomToast("Deleted successfully!", { position: "top-right" }, "success")
      loadExercises()
    } catch {
      showCustomToast("Delete failed", "error")
    } finally {
      setDelLoading(false)
      setIsDeleteModalVisible(false)
      setExerciseIdToDelete(null)
    }
  }

  // ── IMAGE ────────────────────────────────────────────
  const handleImage = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () =>
      setForm((prev) => ({ ...prev, image: reader.result, imagePreview: reader.result }))
  }

  // ── RESET ────────────────────────────────────────────
  const resetForm = () => {
    setForm(emptyExercise)
    setOriginalForm(null)
    setEditId(null)
    setModal(false)
    setErrors({})
  }

  // ── PRICE CALC ───────────────────────────────────────
  const calcTotal = (ex) => (
    Number(ex.pricePerSession || 0) +
    (Number(ex.pricePerSession || 0) * Number(ex.gst || 0)) / 100 +
    (Number(ex.pricePerSession || 0) * Number(ex.otherTax || 0)) / 100
  ).toFixed(2)

  if (loading) return <LoadingIndicator message="Loading exercises..." />

  /* ── Confirm modal message ───────────────────────────────────────── */
  const saveConfirmMessage = editId
    ? <>Are you sure you want to update <strong>{form.name}</strong>? Changes may affect therapies and programs using this exercise.</>
    : <>Are you sure you want to save <strong>{form.name}</strong> as a new exercise?</>

  return (
    <>
      {/* <ToastContainer /> */}

      {/* ── Page Header ───────────────────────────────── */}
      <div className="ex-page-header">
        <div className="ex-page-title-group">
          <div className="ex-page-icon">
            <Dumbbell size={20} />
          </div>
          <div>
            <h4 className="ex-page-title">Activity Management</h4>
            <p className="ex-page-sub">
              {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="cm-search-wrapper">
          <Search size={14} className="cm-search-icon-left" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cm-search-input"
          />
          {searchQuery && (
            <button className="cm-search-clear" type="button" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {can("Activity Library", "create") && (
          <button className="ex-add-btn" onClick={() => setModal(true)}>
            <PlusCircle size={15} />
            Add Activity
          </button>
        )}
      </div>

      {/* ── TABLE ────────────────────────────────────── */}
      <div className="ex-table-wrapper">
        <CTable className="ex-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="ex-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Activity Name</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Activity Type</CTableHeaderCell>
              {/* <CTableHeaderCell className="ex-th">Sets</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Reps</CTableHeaderCell> */}
              <CTableHeaderCell className="ex-th">Frequency</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Discount (%)</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Discount Amt</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Price</CTableHeaderCell>
              <CTableHeaderCell className="ex-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredExercises.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={9}>
                  <div className="ex-empty">
                    <Dumbbell size={40} className="ex-empty-icon" />
                    <p>No exercises found</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              displayData.map((ex, i) => (
                <CTableRow key={ex.therapyExercisesId || i} className="ex-tr">
                  <CTableDataCell className="ex-td ex-td-num">
                    {(currentPage - 1) * rowsPerPage + i + 1}
                  </CTableDataCell>
                  <CTableDataCell className="ex-td">
                    <span className="ex-name">{ex.name}</span>
                  </CTableDataCell>
                  <CTableDataCell className="ex-td">
                    <span className="ex-name">{ex.activityType}</span>
                  </CTableDataCell>
                  {/* <CTableDataCell className="ex-td">
                    <span className="ex-badge-blue">{ex.sets || "—"}</span>
                  </CTableDataCell> */}
                  {/* <CTableDataCell className="ex-td">
                    <span className="ex-badge-blue">{ex.repetitions || "—"}</span>
                  </CTableDataCell> */}
                  <CTableDataCell className="ex-td">{ex.frequency || "—"}</CTableDataCell>
                  <CTableDataCell className="ex-td">
                    <span className="ex-count-badge">{ex.discountPercentage || 0}%</span>
                  </CTableDataCell>
                  <CTableDataCell className="ex-td">₹{ex.discountAmount || 0}</CTableDataCell>
                  <CTableDataCell className="ex-td">
                    <span className="ex-price">₹{ex.pricePerSession}</span>
                  </CTableDataCell>
                  <CTableDataCell className="ex-td">
                    <div className="ex-actions">
                      {can("Activity Library", "read") && (
                        <button className="ex-action-btn view" title="View" onClick={() => handleView(ex)}>
                          <Eye size={14} />
                        </button>
                      )}
                      {can("Activity Library", "update") && (
                        <button className="ex-action-btn edit" title="Edit" onClick={() => handleEdit(ex)}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can("Activity Library", "delete") && (
                        <button
                          className="ex-action-btn del"
                          title="Delete"
                          onClick={() => openDeleteModal(ex.therapyExercisesId)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* ── PAGINATION ───────────────────────────────── */}
      {filteredExercises.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setRowsPerPage(size); setCurrentPage(1) }}
        />
      )}

      {/* ── ADD / EDIT MODAL ─────────────────────────── */}
      <CModal
        visible={modal}
        onClose={resetForm}
        backdrop="static"
        alignment="center"
        className="ex-custom-modal "
        size="lg"
      >
        <CModalHeader className="ex-modal-header custom-modal"  >
          <CModalTitle className="ex-modal-title">
            {editId ? "Edit" : "Add"} Activity
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="ex-modal-body">
          <CForm>

            {/* ── Exercise impact warning (always shown in edit mode) ── */}
            {editId && (
              <ImpactWarning message="Changes to this exercise may impact therapies and programs using it. Please review before saving." />
            )}

            {/* ── Pricing impact warning (only when pricing fields changed) ── */}
            {hasPricingChanged && (
              <ImpactWarning message="Changes to pricing may affect existing packages and billing. Please review before saving." />
            )}

            <CRow className="g-3">

              {/* Row 1 */}
              <CCol md={6}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">
                    Activity Type <span className="ex-req">*</span>
                  </CFormLabel>
                  <select
                    className="ex-input"
                    value={form.activityType}
                    onChange={(e) =>
                      setForm({
                        ...emptyExercise,
                        activityType: e.target.value,
                        name: form.name,
                      })
                    }
                  >
                    {activityOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </CCol>

              <CCol md={6}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">
                    Name <span className="ex-req">*</span>
                  </CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.name ? " is-invalid" : ""}`}
                    placeholder="Enter Activity name"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      setErrors({ ...errors, name: "" })
                    }}
                  />
                  <CFormText className="ex-err-msg">{errors.name}</CFormText>
                </div>
              </CCol>

              {/* Row 2 */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">
                    Price <span className="ex-req">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    placeholder="Enter Price"
                    className={`ex-input${errors.pricePerSession ? " is-invalid" : ""}`}
                    value={form.pricePerSession}
                    onChange={(e) => {
                      setForm({ ...form, pricePerSession: e.target.value })
                      setErrors({ ...errors, pricePerSession: "" })
                    }}
                  />
                  <CFormText className="ex-err-msg">{errors.pricePerSession}</CFormText>
                </div>
              </CCol>

              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">
                    Frequency <span className="ex-req">*</span>
                  </CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.frequency ? " is-invalid" : ""}`}
                    placeholder="2/day"
                    value={form.frequency}
                    onChange={(e) => {
                      setForm({ ...form, frequency: e.target.value })
                      setErrors({ ...errors, frequency: "" })
                    }}
                  />
                  <CFormText className="ex-err-msg">{errors.frequency}</CFormText>
                </div>
              </CCol>

              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Session</CFormLabel>
                  <CFormInput className="ex-input" value={form.session} disabled />
                </div>
              </CCol>

              {/* Dynamic Fields */}
              {/* ───────────────── Dynamic Activity Fields ───────────────── */}

              {/* Exercise */}
              {form.activityType === "Exercise" && (
                <>
                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Repetitions <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        placeholder="Enter Repetitions"
                        type="number"
                        className={`ex-input ${errors.repetitions ? "is-invalid" : ""}`}
                        value={form.repetitions}
                        onChange={(e) => {
                          setForm({ ...form, repetitions: e.target.value })
                          setErrors((prev) => ({ ...prev, repetitions: "" }))
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.repetitions}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        No. of Sets <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        type="number"
                        placeholder="Enter No. of Sets"
                        className={`ex-input ${errors.sets ? "is-invalid" : ""}`}
                        value={form.sets}
                        onChange={(e) => {
                          setForm({ ...form, sets: e.target.value })
                          setErrors((prev) => ({ ...prev, sets: "" }))
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.sets}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Duration<span className="ex-req">*</span>
                      </CFormLabel>
                      <div className="d-flex gap-2">
                        <CFormInput
                          className={`ex-input ${errors.duration ? "is-invalid" : ""}`}
                          value={form.duration}
                          placeholder="Enter duration"
                          onChange={(e) => {
                            setForm({ ...form, duration: e.target.value })
                            setErrors((prev) => ({ ...prev, duration: "" }))
                          }}
                        />
                        <select
                          className="ex-input"
                          style={{ width: "100px", padding: "0.375rem 0.75rem" }}
                          value={form.durationUnit || "mins"}
                          onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                        >
                          <option value="mins">mins</option>
                          <option value="hours">hours</option>
                          {/* <option value="days">days</option>
                          <option value="weeks">weeks</option> */}
                        </select>
                      </div>
                      <CFormText className="ex-err-msg">{errors.duration}</CFormText>
                    </div>
                  </CCol>
                </>
              )}

              {/* Manual */}
              {form.activityType === "Manual" && (
                <>
                  <CCol md={6}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Technique <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.technique ? " is-invalid" : ""}`}
                        placeholder="Enter technique"
                        value={form.technique}
                        onChange={(e) => {
                          setForm({ ...form, technique: e.target.value })
                          setErrors({ ...errors, technique: "" })
                        }
                        }
                      />
                      <CFormText className="ex-err-msg">{errors.technique}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={6}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Duration <span className="ex-req">*</span>
                      </CFormLabel>
                      <div className="d-flex gap-2">
                        <CFormInput
                          className={`ex-input${errors.duration ? " is-invalid" : ""}`}
                          placeholder="Enter duration"
                          value={form.duration}
                          onChange={(e) => {
                            setForm({ ...form, duration: e.target.value })
                            setErrors({ ...errors, duration: "" })
                          }}
                        />
                        <select
                          className="ex-input"
                          style={{ width: "100px", padding: "0.375rem 0.75rem" }}
                          value={form.durationUnit || "mins"}
                          onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                        >
                          <option value="mins">mins</option>
                          <option value="hours">hours</option>
                          {/* <option value="days">days</option>
                          <option value="weeks">weeks</option> */}
                        </select>
                      </div>
                      <CFormText className="ex-err-msg">{errors.duration}</CFormText>
                    </div>
                  </CCol>
                </>
              )}

              {/* Electrotherapy */}
              {form.activityType === "Electrotherapy" && (
                <>
                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Machine <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.machine ? " is-invalid" : ""}`}
                        placeholder="Enter machine name"
                        value={form.machine}
                        onChange={(e) => {
                          setForm({ ...form, machine: e.target.value })
                          setErrors({ ...errors, machine: "" })
                        }
                        }
                      />
                      <CFormText className="ex-err-msg">{errors.machine}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Intensity <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.intensity ? " is-invalid" : ""}`}
                        placeholder="Enter intensity"
                        value={form.intensity}
                        onChange={(e) => {
                          setForm({ ...form, intensity: e.target.value })

                          setErrors({ ...errors, intensity: "" })
                        }
                        }
                      />
                      <CFormText className="ex-err-msg">{errors.intensity}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Duration <span className="ex-req">*</span>
                      </CFormLabel>
                      <div className="d-flex gap-2">
                        <CFormInput
                          className={`ex-input${errors.duration ? " is-invalid" : ""}`}
                          placeholder="Enter duration"
                          value={form.duration}
                          onChange={(e) => {
                            setForm({ ...form, duration: e.target.value })
                            setErrors({ ...errors, duration: "" })
                          }}
                        />
                        <select
                          className="ex-input"
                          style={{ width: "100px", padding: "0.375rem 0.75rem" }}
                          value={form.durationUnit || "mins"}
                          onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                        >
                          <option value="mins">mins</option>
                          <option value="hours">hours</option>
                          {/* <option value="days">days</option>
                          <option value="weeks">weeks</option> */}
                        </select>
                      </div>
                      <CFormText className="ex-err-msg">{errors.duration}</CFormText>
                    </div>
                  </CCol>
                </>
              )}

              {/* Modality */}
              {form.activityType === "Modality" && (
                <CCol md={12}>
                  <div className="ex-field">
                    <CFormLabel className="ex-label">
                      Duration <span className="ex-req">*</span>
                    </CFormLabel>
                    <div className="d-flex gap-2">
                      <CFormInput
                        className={`ex-input${errors.duration ? " is-invalid" : ""}`}
                        placeholder="Enter duration"
                        value={form.duration}
                        onChange={(e) => {
                          setForm({ ...form, duration: e.target.value })
                          setErrors({ ...errors, duration: "" })
                        }}
                      />
                      <select
                        className="ex-input"
                        style={{ width: "100px", padding: "0.375rem 0.75rem" }}
                        value={form.durationUnit || "mins"}
                        onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                      >
                        <option value="mins">mins</option>
                        <option value="hours">hours</option>
                        {/* <option value="days">days</option>
                        <option value="weeks">weeks</option> */}
                      </select>
                    </div>
                    <CFormText className="ex-err-msg">{errors.duration}</CFormText>
                  </div>
                </CCol>
              )}

              {/* Functional Training */}
              {form.activityType === "Functional Training" && (
                <>
                  <CCol md={6}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Duration <span className="ex-req">*</span>
                      </CFormLabel>
                      <div className="d-flex gap-2">
                        <CFormInput
                          className={`ex-input${errors.duration ? " is-invalid" : ""}`}
                          placeholder="Enter duration"
                          value={form.duration}
                          onChange={(e) => {
                            setForm({ ...form, duration: e.target.value })
                            setErrors({ ...errors, duration: "" })
                          }}
                        />
                        <select
                          className="ex-input"
                          style={{ width: "100px", padding: "0.375rem 0.75rem" }}
                          value={form.durationUnit || "mins"}
                          onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                        >
                          <option value="mins">mins</option>
                          <option value="hours">hours</option>
                          {/* <option value="days">days</option>
                          <option value="weeks">weeks</option> */}
                        </select>
                      </div>
                      <CFormText className="ex-err-msg">{errors.duration}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={6}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Assistance Level <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.assistanceLevel ? " is-invalid" : ""}`}
                        placeholder="Enter assistance level"
                        value={form.assistanceLevel}
                        onChange={(e) => {
                          setForm({ ...form, assistanceLevel: e.target.value })
                          setErrors({ ...errors, assistanceLevel: "" })
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.assistanceLevel}</CFormText>
                    </div>
                  </CCol>
                </>
              )}

              {/* Supportive */}
              {form.activityType === "Supportive" && (
                <>
                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Type <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.supportType ? " is-invalid" : ""}`}
                        placeholder="Enter support type"
                        value={form.supportType}
                        onChange={(e) => {
                          setForm({ ...form, supportType: e.target.value })
                          setErrors({ ...errors, supportType: "" })
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.supportType}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Area <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.area ? " is-invalid" : ""}`}
                        placeholder="Enter area"
                        value={form.area}
                        onChange={(e) => {
                          setForm({ ...form, area: e.target.value })
                          setErrors({ ...errors, area: "" })
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.area}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Duration <span className="ex-req">*</span>
                      </CFormLabel>
                      <div className="d-flex gap-2">
                        <CFormInput
                          className={`ex-input${errors.duration ? " is-invalid" : ""}`}
                          placeholder="Enter duration"
                          value={form.duration}
                          onChange={(e) => {
                            setForm({ ...form, duration: e.target.value })
                            setErrors({ ...errors, duration: "" })
                          }}
                        />
                        <select
                          className="ex-input"
                          style={{ width: "100px", padding: "0.375rem 0.75rem" }}
                          value={form.durationUnit || "mins"}
                          onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                        >
                          <option value="mins">mins</option>
                          <option value="hours">hours</option>
                          {/* <option value="days">days</option>
                          <option value="weeks">weeks</option> */}
                        </select>
                      </div>
                      <CFormText className="ex-err-msg">{errors.duration}</CFormText>
                    </div>
                  </CCol>
                </>
              )}

              {/* Education */}
              {/* {form.activityType === "Education" && (
                <CCol md={12}>
                  <div className="ex-field">
                    <CFormLabel className="ex-label">
                      Notes <span className="ex-req">*</span>
                    </CFormLabel>
                    <CFormInput
                      className="ex-input"
                      placeholder="Enter notes"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </div>
                </CCol>
              )} */}

              {/* Assessment */}
              {form.activityType === "Assessment" && (
                <>
                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Metric <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.metric ? " is-invalid" : ""}`}
                        placeholder="Enter metric"
                        value={form.metric}
                        onChange={(e) => {
                          setForm({ ...form, metric: e.target.value })
                          setErrors({ ...errors, metric: "" })
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.metric}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Value <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.value ? " is-invalid" : ""}`}
                        placeholder="Enter value"
                        value={form.value}
                        onChange={(e) => {
                          setForm({ ...form, value: e.target.value })
                          setErrors({ ...errors, value: "" })
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.value}</CFormText>
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div className="ex-field">
                      <CFormLabel className="ex-label">
                        Unit <span className="ex-req">*</span>
                      </CFormLabel>
                      <CFormInput
                        className={`ex-input${errors.unit ? " is-invalid" : ""}`}
                        placeholder="Enter unit"
                        value={form.unit}
                        onChange={(e) => {
                          setForm({ ...form, unit: e.target.value })
                          setErrors({ ...errors, unit: "" })
                        }}
                      />
                      <CFormText className="ex-err-msg">{errors.unit}</CFormText>
                    </div>
                  </CCol>
                </>
              )}

              {/* Notes */}
              <CCol md={12}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">
                    Notes <span className="ex-req">*</span>
                  </CFormLabel>

                  <textarea
                    rows={4}
                    className={`form-control ex-input ${errors.notes ? "is-invalid" : ""}`}
                    placeholder="Enter notes"
                    value={form.notes}
                    onChange={(e) => {
                      setForm({ ...form, notes: e.target.value })
                      setErrors({ ...errors, notes: "" })
                    }}
                    style={{
                      height: "auto",
                      resize: "vertical",
                      paddingTop: "10px",
                    }}
                  />

                  <CFormText className="ex-err-msg">{errors.notes}</CFormText>
                </div>
                <CCol md={4}>
                  <div className="ex-field">
                    <CFormLabel className="ex-label">
                      Body Part <span className="ex-req">*</span>
                    </CFormLabel>
                    <CFormInput
                      className={`form-control ex-input ${errors.bodyPart ? "is-invalid" : ""}`}
                      placeholder="Enter Body Part"
                      value={form.bodyPart}
                      onChange={(e) => {
                        setForm({ ...form, bodyPart: e.target.value })
                        setErrors({ ...errors, bodyPart: "" })

                      }
                      }
                    />
                    <CFormText className="ex-err-msg">{errors.bodyPart}</CFormText>
                  </div>
                </CCol>
              </CCol>

              {/* Optional Section */}
              <CCol md={12}>
                <hr />
                <h6 style={{ color: "#6b7280", fontSize: "12px" }}>
                  Optional Details
                </h6>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  className="ex-input"
                  placeholder="GST %"
                  value={form.gst}
                  onChange={(e) => setForm({ ...form, gst: e.target.value })}
                />
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  className="ex-input"
                  placeholder="Other Tax %"
                  value={form.otherTax}
                  onChange={(e) => setForm({ ...form, otherTax: e.target.value })}
                />
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  className="ex-input"
                  placeholder="Discount %"
                  value={form.discountPercentage}
                  onChange={(e) =>
                    setForm({ ...form, discountPercentage: e.target.value })
                  }
                />
              </CCol>

              <CCol md={3}>
                <CFormInput

                  className="ex-input"
                  placeholder="Video/Image URL"
                  value={form.video}
                  onChange={(e) => setForm({ ...form, video: e.target.value })}
                />
              </CCol>

            </CRow>

            <div className="ex-modal-footer">
              <button type="button" className="ex-btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button
                type="button"
                className="ex-btn-primary"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {editId ? "Updating..." : "Saving..."}
                  </>
                ) : editId ? "Update Exercise" : "Save Exercise"}
              </button>
            </div>
          </CForm>
        </CModalBody>
      </CModal >

      {/* ── VIEW MODAL ───────────────────────────────── */}
      < CModal
        visible={viewModal}
        onClose={() => setViewModal(false)
        }
        size="lg"
        backdrop="static"
        alignment="center"
        className="ex-custom-modal"
      >
        <CModalHeader className="ex-modal-header">
          <CModalTitle className="ex-modal-title">Exercise Details</CModalTitle>
        </CModalHeader>

        <CModalBody className="ex-modal-body ex-view-body">
          {viewData ? (
            <>
              {/* ── Basic Info ── */}
              <div className="ex-summary-grid">
                {viewData.name && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Name</span>
                    <span className="ex-summary-value">{viewData.name}</span>
                  </div>
                )}
                {viewData.therapyExercisesId && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Activity ID</span>
                    <span className="ex-summary-value ex-id-pill">{viewData.therapyExercisesId}</span>
                  </div>
                )}
                {viewData.activityType && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Type</span>
                    <span className="ex-summary-value">{viewData.activityType}</span>
                  </div>
                )}
                {viewData.bodyPart && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Body Part</span>
                    <span className="ex-summary-value">{viewData.bodyPart}</span>
                  </div>
                )}
                {viewData.session && viewData.session !== "0" && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Session</span>
                    <span className="ex-summary-value">{viewData.session}</span>
                  </div>
                )}
                {viewData.frequency && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Frequency</span>
                    <span className="ex-summary-value">{viewData.frequency}</span>
                  </div>
                )}
                {viewData.duration && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Duration</span>
                    <span className="ex-summary-value">{viewData.duration}</span>
                  </div>
                )}
                {viewData.sets && viewData.sets !== "0" && viewData.sets !== 0 && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Sets</span>
                    <span className="ex-summary-value">{viewData.sets}</span>
                  </div>
                )}
                {viewData.repetitions && viewData.repetitions !== "0" && viewData.repetitions !== 0 && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Repetitions</span>
                    <span className="ex-summary-value">{viewData.repetitions}</span>
                  </div>
                )}
              </div>

              {/* ── Dynamic Details ── */}
              {(viewData.technique || viewData.machine || viewData.intensity || viewData.assistanceLevel || viewData.supportType || viewData.area || viewData.metric) && (
                <>
                  <div className="ex-section-label">Additional Details</div>
                  <div className="ex-summary-grid">
                    {viewData.technique && (
                      <div className="ex-summary-card" style={{ gridColumn: "span 2" }}>
                        <span className="ex-summary-label">Technique</span>
                        <span className="ex-summary-value">{viewData.technique}</span>
                      </div>
                    )}
                    {viewData.machine && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Machine</span>
                        <span className="ex-summary-value">{viewData.machine}</span>
                      </div>
                    )}
                    {viewData.intensity && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Intensity</span>
                        <span className="ex-summary-value">{viewData.intensity}</span>
                      </div>
                    )}
                    {viewData.assistanceLevel && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Assistance</span>
                        <span className="ex-summary-value">{viewData.assistanceLevel}</span>
                      </div>
                    )}
                    {viewData.supportType && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Support Type</span>
                        <span className="ex-summary-value">{viewData.supportType}</span>
                      </div>
                    )}
                    {viewData.area && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Area</span>
                        <span className="ex-summary-value">{viewData.area}</span>
                      </div>
                    )}
                    {viewData.metric && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Metric</span>
                        <span className="ex-summary-value">{viewData.metric}</span>
                      </div>
                    )}
                    {viewData.value && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Value</span>
                        <span className="ex-summary-value">{viewData.value}</span>
                      </div>
                    )}
                    {viewData.unit && (
                      <div className="ex-summary-card">
                        <span className="ex-summary-label">Unit</span>
                        <span className="ex-summary-value">{viewData.unit}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Pricing ── */}
              <div className="ex-section-label">Pricing & Tax</div>
              <div className="ex-summary-grid">
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Price / Session</span>
                  <span className="ex-summary-value">₹{viewData.pricePerSession || 0}</span>
                </div>
                {viewData.gst && viewData.gst !== "0" && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">GST</span>
                    <span className="ex-summary-value">{viewData.gst}%</span>
                  </div>
                )}
                {viewData.otherTax && viewData.otherTax !== "0" && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Other Tax</span>
                    <span className="ex-summary-value">{viewData.otherTax}%</span>
                  </div>
                )}
                {viewData.discountPercentage && viewData.discountPercentage !== "0" && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Discount</span>
                    <span className="ex-summary-value">{viewData.discountPercentage}%</span>
                  </div>
                )}
                {viewData.discountAmount > 0 && (
                  <div className="ex-summary-card">
                    <span className="ex-summary-label">Discount Amt</span>
                    <span className="ex-summary-value">₹{viewData.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="ex-summary-card" style={{ borderColor: "#b5d4f4", background: "#e6f1fb" }}>
                  <span className="ex-summary-label">Total Cost</span>
                  <span className="ex-summary-value" style={{ color: "#0c447c", fontSize: 16 }}>₹{viewData.totalPrice}</span>
                </div>
              </div>

              {viewData.notes && (
                <>
                  <div className="ex-section-label">Clinical Notes</div>
                  <div className="ex-notes-box">{viewData.notes}</div>
                </>
              )}

              {viewData.video && (
                <>
                  <div className="ex-section-label" style={{ marginTop: 12 }}>Video Reference</div>
                  <div style={{ marginBottom: 16 }}>
                    <a
                      href={viewData.video}
                      target="_blank"
                      rel="noreferrer"
                      className="ex-video-link"
                    >
                      ▶ Watch Exercise Video
                    </a>
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button className="ex-btn-secondary" onClick={() => setViewModal(false)}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="ex-empty">
              <Dumbbell size={40} className="ex-empty-icon" />
              <p>No data available</p>
            </div>
          )}
        </CModalBody>
      </CModal >

      {/* ── SAVE / UPDATE CONFIRMATION ───────────────── */}
      < ConfirmationModal
        isVisible={saveConfirmVisible}
        title={editId ? "Update Exercise" : "Save Exercise"}
        message={saveConfirmMessage}
        confirmText={editId ? "Yes, Update" : "Yes, Save"}
        cancelText="Cancel"
        confirmColor="primary"
        isLoading={isSaveConfirming}
        onConfirm={handleConfirmedSave}
        onCancel={() => {
          if (!isSaveConfirming) setSaveConfirmVisible(false)
        }}
      />

      {/* ── DELETE CONFIRMATION ──────────────────────── */}
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete Exercise"
        message="This exercise is linked to therapies, programs, and packages. Deleting it will affect those records. Do you want to continue?"
        confirmText={delloading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2 text-white" />
            Deleting...
          </>
        ) : "Yes, Delete"}
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        isLoading={delloading}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!delloading) {
            setIsDeleteModalVisible(false)
            setExerciseIdToDelete(null)
          }
        }}
      />

      {/* ── STYLES ───────────────────────────────────── */}
      <style>{`
        .ex-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .ex-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ex-page-icon {
          width: 42px; height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex; align-items: center; justify-content: center;
          color: #185fa5; flex-shrink: 0;
        }
        .ex-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .ex-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }
        .ex-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 9px 18px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .ex-add-btn:hover  { background: #0c447c; }
        .ex-add-btn:active { transform: scale(0.97); }

        .ex-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 12px;
        }
        .ex-table { margin-bottom: 0 !important; font-size: 13px; }
        .ex-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .ex-tr { transition: background 0.12s; }
        .ex-tr:hover { background: #f0f5fb !important; }
        .ex-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .ex-td-num { color: #9ca3af; font-size: 12px; }
        .ex-name   { font-weight: 600; font-size: 13px; color: #0c447c; }
        .ex-count-badge {
          background: #eaf3de; color: #3b6d11; border: 0.5px solid #c0dd97;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px;
        }
        .ex-badge-blue {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px;
        }
        .ex-price { color: #374151; font-weight: 600; }

        .ex-actions { display: flex; gap: 6px; align-items: center; }
        .ex-action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: filter 0.12px, transform 0.1s; flex-shrink: 0;
        }
        .ex-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .ex-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .ex-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .ex-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .ex-action-btn:active { transform: scale(0.94); }

        .ex-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .ex-empty-icon { color: #d0dce9; }

        .ex-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important; border-radius: 12px !important; overflow: hidden;
        }
        .ex-modal-header {
          background: #185fa5 !important; border-bottom: none !important; padding: 16px 20px !important;
        }
        .ex-modal-title { font-size: 15px !important; font-weight: 700 !important; color: #fff !important; }
        .ex-custom-modal .btn-close { filter: brightness(0) invert(1); opacity: 0.8; }
        .ex-modal-body  { background: #f7fafd !important; padding: 20px !important; }
        .ex-view-body   { max-height: 78vh; overflow-y: auto; }

        .ex-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px; }
        .ex-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .ex-req   { color: #e24b4a; }
        .ex-err-msg { font-size: 11px; color: #a32d2d !important; margin-top: 2px; min-height: 16px; }
        .ex-input {
          height: 36px; font-size: 13px !important;
          border: 0.5px solid #ced4da !important; border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .ex-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }
        .ex-input.is-invalid { border-color: #e24b4a !important; }

        .ex-modal-footer {
          display: flex; justify-content: flex-end; gap: 8px;
          margin-top: 18px; padding-top: 14px; border-top: 0.5px solid #d0dce9;
        }
        .ex-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #185fa5; color: #fff; border: none; border-radius: 8px;
          padding: 9px 22px; font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .ex-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .ex-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .ex-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .ex-btn-secondary {
          background: #fff; color: #374151;
          border: 0.5px solid #d0dce9; border-radius: 8px;
          padding: 9px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .ex-btn-secondary:hover { background: #f0f5fb; }

        .ex-summary-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-bottom: 16px;
        }
        @media (max-width: 600px) { .ex-summary-grid { grid-template-columns: 1fr 1fr; } }
        .ex-summary-card {
          background: #fff; border: 0.5px solid #d0dce9;
          border-radius: 10px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .ex-summary-label {
          font-size: 10px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .ex-summary-value { font-size: 14px; font-weight: 700; color: #0c447c; }
        .ex-id-pill {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 600;
          padding: 2px 10px; display: inline-block;
        }
        .ex-section-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
        }
        .ex-notes-box {
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; color: #374151;
          margin-bottom: 4px; min-height: 40px;
        }
        .ex-video-link {
          color: #185fa5; font-weight: 500;
          text-decoration: none; font-size: 13px;
        }
        .ex-video-link:hover { text-decoration: underline; color: #0c447c; }
      `}</style>
    </>
  )
}