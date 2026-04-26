import React, { useEffect, useState } from "react"
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
} from "@coreui/react"
import Select from "react-select"
import { Edit2, Eye, Trash2, Stethoscope, PlusCircle } from "lucide-react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import {
  addTherapy,
  deleteTherapy,
  getExercises,
  getTherapiesService,
  getTherapiesServicebytherapyId,
  updateTherapy,
} from "./TherapyServiceApi"
import ConfirmationModal from "../../components/ConfirmationModal"
import LoadingIndicator from "../../Utils/loader"
import { showCustomToast } from "../../Utils/Toaster"
import { useHospital } from "../Usecontext/HospitalContext"
import { useGlobalSearch } from "../Usecontext/GlobalSearchContext"

// ─── Safe image renderer ─────────────────────────────────────────────────────
const SafeImage = ({ src, alt, width = 44, height = 44 }) => {
  const [imgSrc, setImgSrc] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) return
    try {
      // If already a data URL or http URL, use directly
      if (src.startsWith("data:") || src.startsWith("http")) {
        setImgSrc(src)
      } else {
        // Try treating as raw base64
        setImgSrc(`data:image/jpeg;base64,${src}`)
      }
    } catch (e) {
      setError(true)
    }
  }, [src])

  if (!src || error) return <span className="tm-no-media">—</span>
  return (
    <img
      src={imgSrc}
      width={width}
      height={height}
      style={{ objectFit: "cover", borderRadius: "6px", border: "0.5px solid #d0dce9" }}
      alt={alt}
      onError={() => setError(true)}
    />
  )
}

// ─── Safe video link renderer ─────────────────────────────────────────────────
const SafeVideoLink = ({ src }) => {
  if (!src) return <span className="tm-no-media">—</span>
  let href = src
  try {
    // If not a URL, try to decode base64 → URL
    if (!src.startsWith("http") && !src.startsWith("data:")) {
      href = atob(src)
    }
  } catch (e) {
    href = src
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="tm-video-link">
      ▶ View
    </a>
  )
}

export default function TherapyManagement() {
  const [list, setList] = useState([])
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [viewModal, setViewModal] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewTherapy, setViewTherapy] = useState(null)
  const [viewError, setViewError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const { searchQuery } = useGlobalSearch()
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")

  const [form, setForm] = useState({
    therapyName: "",
    exercisesIds: [],
    exercises: [],
  })
  const [errors, setErrors] = useState({})

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchData()
    fetchExercises()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getTherapiesService(clinicId, branchId)
      setList(res?.data?.data || [])
    } catch (error) {
      console.error("fetchData error", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExercises = async () => {
    try {
      const res = await getExercises(clinicId, branchId)
      const data = res?.data?.data || []
      const options = data.map((item) => ({
        value: item.therapyExercisesId,
        label: item.name,
      }))
      setExerciseOptions(options)
    } catch (err) {
      console.error("fetchExercises error", err)
    }
  }

  // ---------------- VIEW ----------------
  const handleView = async (id) => {
    setViewTherapy(null)
    setViewError(null)
    setViewModal(true)
    setViewLoading(true)
    try {
      const res = await getTherapiesServicebytherapyId(id, clinicId, branchId)
      // Support multiple response shapes:
      //   res.data.data   (most common)
      //   res.data        (flat)
      //   res             (raw)
      const data =
        res?.data?.data ||
        res?.data ||
        res ||
        null
      if (!data) throw new Error("No data returned from API")
      setViewTherapy(data)
    } catch (err) {
      console.error("view error", err)
      setViewError(err?.response?.data?.message || err?.message || "Failed to load therapy details")
    } finally {
      setViewLoading(false)
    }
  }

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let err = {}
    if (!form.therapyName.trim()) err.therapyName = "Therapy name is required"
    if (form.exercisesIds.length === 0) err.exercisesIds = "Select at least one exercise"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaveLoading(true)
      const payload = {
        clinicId,
        branchId,
        therapyName: form.therapyName,
        exerciseIds: form.exercisesIds,
      }
      if (editId) {
        await updateTherapy(editId, payload)
        showCustomToast("Therapy updated successfully!", { position: "top-right" }, "success")
      } else {
        await addTherapy(payload)
        showCustomToast("Therapy added successfully!", { position: "top-right" }, "success")
      }
      resetForm()
      fetchData()
    } catch (error) {
      console.error(error)
      showCustomToast("Something went wrong!", { position: "top-right" }, "error")
    } finally {
      setSaveLoading(false)
    }
  }

  // ---------------- EDIT ----------------
  const handleEdit = (item) => {
    setEditId(item.id)
    const selectedExercises = exerciseOptions.filter((opt) =>
      (item.exercises || []).map((e) => e.exerciseId).includes(opt.value)
    )
    setForm({
      therapyName: item.therapyName,
      exercises: selectedExercises,
      exercisesIds: selectedExercises.map((e) => String(e.value)),
    })
    setModal(true)
  }

  // ---------------- DELETE ----------------
  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTherapy(serviceIdToDelete, clinicId)
      showCustomToast("Therapy deleted successfully!", { position: "top-right" }, "success")
      fetchData()
    } catch (error) {
      console.error("Error deleting therapy:", error)
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  // ---------------- RESET ----------------
  const resetForm = () => {
    setForm({ therapyName: "", exercises: [], exercisesIds: [] })
    setEditId(null)
    setModal(false)
    setErrors({})
  }

  const filteredList = list.filter((item) => {
    const search = (searchQuery || "").toLowerCase()
    if (!search) return true
    return (
      (item.id || "").toString().toLowerCase().includes(search) ||
      (item.therapyName || "").toLowerCase().includes(search) ||
      (item.noExerciseIdCount || "").toString().includes(search)
    )
  })

  // ─── Custom react-select styles ────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      fontSize: "13px",
      borderColor: state.isFocused ? "#185fa5" : errors.exercisesIds ? "#e24b4a" : "#ced4da",
      borderWidth: "0.5px",
      borderRadius: "7px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(24,95,165,0.15)" : "none",
      "&:hover": { borderColor: "#185fa5" },
    }),
    multiValue: (base) => ({
      ...base,
      background: "#e6f1fb",
      borderRadius: "20px",
      border: "0.5px solid #b5d4f4",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#0c447c",
      fontSize: "11px",
      fontWeight: "500",
      padding: "1px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#185fa5",
      borderRadius: "0 20px 20px 0",
      "&:hover": { background: "#b5d4f4", color: "#042c53" },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "13px",
      backgroundColor: state.isSelected ? "#185fa5" : state.isFocused ? "#e6f1fb" : "transparent",
      color: state.isSelected ? "#fff" : "#374151",
    }),
    placeholder: (base) => ({ ...base, fontSize: "13px", color: "#9ca3af" }),
    menu: (base) => ({
      ...base,
      borderRadius: "7px",
      border: "0.5px solid #d0dce9",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      zIndex: 9999,
    }),
    menuList: (base) => ({ ...base, maxHeight: 200, overflowY: "auto" }),
  }

  // ─── Exercises from view response (handle both array and map shapes) ─────
  const getExerciseList = (therapy) => {
    if (!therapy) return []
    if (Array.isArray(therapy.exercises)) return therapy.exercises
    if (therapy.exercises && typeof therapy.exercises === "object") {
      return Object.values(therapy.exercises)
    }
    return []
  }

  if (loading) return <LoadingIndicator />

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ─────────────────────────────── */}
      <div className="tm-page-header">
        <div className="tm-page-title-group">
          <div className="tm-page-icon">
            <Stethoscope size={20} />
          </div>
          <div>
            <h4 className="tm-page-title">Therapy Management</h4>
            <p className="tm-page-sub">
              {filteredList.length} therapy{filteredList.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
        {can("Therapy Management", "create") && (
          <button className="tm-add-btn" onClick={() => setModal(true)}>
            <PlusCircle size={15} />
            Add Therapy
          </button>
        )}
      </div>

      {/* ── TABLE ────────────────────────────────────── */}
      <div className="tm-table-wrapper">
        <CTable className="tm-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="tm-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="tm-th">Therapy Name</CTableHeaderCell>
              <CTableHeaderCell className="tm-th">No. of Exercises</CTableHeaderCell>
              <CTableHeaderCell className="tm-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredList.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={4}>
                  <div className="tm-empty">
                    <Stethoscope size={40} className="tm-empty-icon" />
                    <p>No therapies found</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredList.map((item, index) => (
                <CTableRow key={item.id} className="tm-tr">
                  <CTableDataCell className="tm-td tm-td-num">{index + 1}</CTableDataCell>
                  <CTableDataCell className="tm-td">
                    <span className="tm-therapy-name">{item.therapyName}</span>
                  </CTableDataCell>
                  <CTableDataCell className="tm-td">
                    <span className="tm-count-badge">{item.noExerciseIdCount} exercises</span>
                  </CTableDataCell>
                  <CTableDataCell className="tm-td">
                    <div className="tm-actions">
                      {can("Therapy Management", "read") && (
                        <button
                          className="tm-action-btn view"
                          title="View"
                          onClick={() => handleView(item.id)}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {can("Therapy Management", "update") && (
                        <button
                          className="tm-action-btn edit"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can("Therapy Management", "delete") && (
                        <button
                          className="tm-action-btn del"
                          title="Delete"
                          onClick={() => {
                            setServiceIdToDelete(item.id)
                            setIsModalVisible(true)
                          }}
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

      {/* ── ADD / EDIT MODAL ─────────────────────────── */}
      <CModal
        visible={modal}
        onClose={resetForm}
        backdrop="static"
        alignment="center"
        className="tm-custom-modal"
      >
        <CModalHeader className="tm-modal-header">
          <CModalTitle className="tm-modal-title">
            {editId ? "Edit" : "Add"} Therapy
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="tm-modal-body">
          <CForm>
            <CRow>
              <CCol md={12}>
                <div className="tm-field">
                  <CFormLabel className="tm-label">
                    Therapy Name <span className="tm-req">*</span>
                  </CFormLabel>
                  <CFormInput
                    className={`tm-input${errors.therapyName ? " is-invalid" : ""}`}
                    placeholder="e.g. Lumbar Spine Therapy"
                    value={form.therapyName}
                    onChange={(e) => setForm({ ...form, therapyName: e.target.value })}
                  />
                  <CFormText className="tm-err-msg">{errors.therapyName}</CFormText>
                </div>
              </CCol>

              <CCol md={12}>
                <div className="tm-field">
                  <CFormLabel className="tm-label">
                    Select Exercises <span className="tm-req">*</span>
                  </CFormLabel>
                  <Select
                    options={exerciseOptions}
                    isMulti
                    isSearchable
                    styles={selectStyles}
                    placeholder="Search and select exercises..."
                    value={form.exercises}
                    onChange={(val) =>
                      setForm({
                        ...form,
                        exercises: val || [],
                        exercisesIds: val ? val.map((v) => String(v.value)) : [],
                      })
                    }
                  />
                  <CFormText className="tm-err-msg">{errors.exercisesIds}</CFormText>
                </div>
              </CCol>
            </CRow>

            <div className="tm-modal-footer">
              <button type="button" className="tm-btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button
                type="button"
                className="tm-btn-primary"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {editId ? "Updating..." : "Saving..."}
                  </>
                ) : editId ? (
                  "Update Therapy"
                ) : (
                  "Save Therapy"
                )}
              </button>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* ── VIEW MODAL ───────────────────────────────── */}
      <CModal
        visible={viewModal}
        onClose={() => {
          setViewModal(false)
          setViewTherapy(null)
          setViewError(null)
        }}
        size="xl"
        backdrop="static"
        alignment="center"
        className="tm-custom-modal"
      >
        <CModalHeader className="tm-modal-header">
          <CModalTitle className="tm-modal-title">Therapy Details</CModalTitle>
        </CModalHeader>

        <CModalBody className="tm-modal-body tm-view-body">
          {/* ── Loading ── */}
          {viewLoading && (
            <div className="tm-view-state">
              <div className="tm-spinner" />
              <p>Loading therapy details...</p>
            </div>
          )}

          {/* ── Error ── */}
          {!viewLoading && viewError && (
            <div className="tm-view-state tm-view-error">
              <Stethoscope size={36} />
              <p>{viewError}</p>
              <button
                className="tm-btn-secondary"
                onClick={() => setViewModal(false)}
              >
                Close
              </button>
            </div>
          )}

          {/* ── Data ── */}
          {!viewLoading && !viewError && viewTherapy && (
            <>
              {/* Summary cards */}
              <div className="tm-summary-grid">
                <div className="tm-summary-card">
                  <span className="tm-summary-label">Therapy Name</span>
                  <span className="tm-summary-value">{viewTherapy.therapyName || "—"}</span>
                </div>
                <div className="tm-summary-card">
                  <span className="tm-summary-label">Therapy ID</span>
                  <span className="tm-summary-value tm-id-pill">
                    {viewTherapy.id || viewTherapy.therapyId || "—"}
                  </span>
                </div>
                <div className="tm-summary-card">
                  <span className="tm-summary-label">No. of Exercises</span>
                  <span className="tm-summary-value">
                    {viewTherapy.noExerciseIdCount ??
                      getExerciseList(viewTherapy).length ??
                      "—"}
                  </span>
                </div>
              </div>

              {/* Exercise table */}
              <div className="tm-section-label">Exercises</div>

              {getExerciseList(viewTherapy).length === 0 ? (
                <div className="tm-empty">
                  <Stethoscope size={32} className="tm-empty-icon" />
                  <p>No exercises linked to this therapy</p>
                </div>
              ) : (
                <div className="tm-ex-table-wrap">
                  <CTable bordered responsive className="tm-ex-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell className="tm-ex-th">#</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Name</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Image</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Video</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Session</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Frequency</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Sets</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Reps</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Price</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">GST</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Other Tax</CTableHeaderCell>
                        <CTableHeaderCell className="tm-ex-th">Total</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {getExerciseList(viewTherapy).map((ex, i) => (
                        <CTableRow key={ex.id || ex.exerciseId || i} className="tm-ex-tr">
                          <CTableDataCell className="tm-ex-td tm-td-num">{i + 1}</CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            <span className="tm-ex-name">{ex.name || "—"}</span>
                          </CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            <SafeImage src={ex.image} alt={ex.name} />
                          </CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            <SafeVideoLink src={ex.video} />
                          </CTableDataCell>
                          <CTableDataCell className="tm-ex-td">{ex.session || "—"}</CTableDataCell>
                          <CTableDataCell className="tm-ex-td">{ex.frequency || "—"}</CTableDataCell>
                          <CTableDataCell className="tm-ex-td">{ex.sets || "—"}</CTableDataCell>
                          <CTableDataCell className="tm-ex-td">{ex.repetitions || "—"}</CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            <span className="tm-price">
                              {ex.pricePerSession != null ? `₹${ex.pricePerSession}` : "—"}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            {ex.gst != null ? `${ex.gst}%` : "—"}
                          </CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            {ex.otherTax != null ? `${ex.otherTax}%` : "—"}
                          </CTableDataCell>
                          <CTableDataCell className="tm-ex-td">
                            <span className="tm-total-price">
                              {ex.totalPrice != null ? `₹${ex.totalPrice}` : "—"}
                            </span>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  className="tm-btn-secondary"
                  onClick={() => {
                    setViewModal(false)
                    setViewTherapy(null)
                    setViewError(null)
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}

          {/* ── No data (API returned empty) ── */}
          {!viewLoading && !viewError && !viewTherapy && (
            <div className="tm-view-state">
              <Stethoscope size={40} className="tm-empty-icon" />
              <p>No data available</p>
              <button className="tm-btn-secondary" onClick={() => setViewModal(false)}>
                Close
              </button>
            </div>
          )}
        </CModalBody>
      </CModal>

      {/* ── DELETE CONFIRMATION ──────────────────────── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Therapy"
        message="This therapy is linked to programs and packages. Deleting it will affect those records. Do you want to continue?"
        confirmText={
          delloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-white" />
              Deleting...
            </>
          ) : (
            "Yes, Delete"
          )
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* ── STYLES ───────────────────────────────────── */}
      <style>{`
        /* ── Page Header ─────────────────────── */
        .tm-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .tm-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tm-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .tm-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .tm-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .tm-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(24, 95, 165, 0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .tm-add-btn:hover  { background: #0c447c; }
        .tm-add-btn:active { transform: scale(0.97); }

        /* ── Table ──────────────────────────── */
        .tm-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .tm-table { margin-bottom: 0 !important; font-size: 13px; }
        .tm-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }
        .tm-tr { transition: background 0.12s; }
        .tm-tr:hover { background: #f0f5fb !important; }
        .tm-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .tm-td-num { color: #9ca3af; font-size: 12px; }
        .tm-therapy-name { font-weight: 600; font-size: 13px; color: #0c447c; }
        .tm-count-badge {
          background: #eaf3de;
          color: #3b6d11;
          border: 0.5px solid #c0dd97;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
        }
        .tm-actions { display: flex; gap: 6px; align-items: center; }
        .tm-action-btn {
          width: 30px; height: 30px;
          border-radius: 7px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          flex-shrink: 0;
        }
        .tm-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .tm-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .tm-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .tm-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .tm-action-btn:active { transform: scale(0.94); }

        /* ── Empty ── */
        .tm-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .tm-empty-icon { color: #d0dce9; }

        /* ── View state (loading / error / empty) ── */
        .tm-view-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 48px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .tm-view-error { color: #a32d2d; }
        .tm-spinner {
          width: 36px; height: 36px;
          border: 3px solid #e6f1fb;
          border-top-color: #185fa5;
          border-radius: 50%;
          animation: tm-spin 0.7s linear infinite;
        }
        @keyframes tm-spin { to { transform: rotate(360deg); } }

        /* ── Modal shared ─────────────────── */
        .tm-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .tm-modal-header {
          background: #185fa5 !important;
          border-bottom: none !important;
          padding: 16px 20px !important;
        }
        .tm-modal-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #fff !important;
        }
        .tm-custom-modal .btn-close {
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        .tm-modal-body {
          background: #f7fafd !important;
          padding: 20px !important;
        }
        .tm-view-body { max-height: 78vh; overflow-y: auto; }

        /* ── Form fields ──────────────────── */
        .tm-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .tm-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .tm-req { color: #e24b4a; }
        .tm-err-msg { font-size: 11px; color: #a32d2d !important; margin-top: 2px; }
        .tm-input {
          height: 36px;
          font-size: 13px !important;
          border: 0.5px solid #ced4da !important;
          border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .tm-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24, 95, 165, 0.15) !important;
        }
        .tm-input.is-invalid { border-color: #e24b4a !important; }

        /* ── Modal footer ─────────────────── */
        .tm-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 0.5px solid #d0dce9;
        }
        .tm-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 22px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(24, 95, 165, 0.2);
        }
        .tm-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .tm-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .tm-btn-primary:disabled              { opacity: 0.65; cursor: not-allowed; }
        .tm-btn-secondary {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .tm-btn-secondary:hover { background: #f0f5fb; }

        /* ── Summary cards ── */
        .tm-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }
        @media (max-width: 600px) { .tm-summary-grid { grid-template-columns: 1fr; } }
        .tm-summary-card {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tm-summary-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .tm-summary-value { font-size: 14px; font-weight: 700; color: #0c447c; }
        .tm-id-pill {
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          display: inline-block;
        }
        .tm-section-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        /* ── Exercise table ─── */
        .tm-ex-table-wrap {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
        }
        .tm-ex-table { margin-bottom: 0 !important; font-size: 12px !important; }
        .tm-ex-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 9px 12px !important;
          white-space: nowrap;
          border: none !important;
        }
        .tm-ex-tr { transition: background 0.1s; }
        .tm-ex-tr:hover { background: #f0f5fb !important; }
        .tm-ex-td {
          font-size: 12px !important;
          padding: 9px 12px !important;
          vertical-align: middle !important;
          border-color: #eef2f7 !important;
          color: #374151;
        }
        .tm-ex-name    { font-weight: 600; color: #0c447c; }
        .tm-no-media   { color: #9ca3af; }
        .tm-video-link {
          color: #185fa5;
          font-weight: 500;
          text-decoration: none;
          font-size: 12px;
        }
        .tm-video-link:hover { text-decoration: underline; color: #0c447c; }
        .tm-price       { color: #374151; font-weight: 500; }
        .tm-total-price { color: #3b6d11; font-weight: 700; }
      `}</style>
    </>
  )
}