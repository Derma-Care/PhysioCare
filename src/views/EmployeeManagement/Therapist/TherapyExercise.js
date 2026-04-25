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
import { Edit2, Eye, Trash2, Dumbbell, PlusCircle } from "lucide-react"
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

const emptyExercise = {
  name: "",
  video: "",
  session: "1",
  frequency: "",
  notes: "",
  image: "",
  imagePreview: "",
  pricePerSession: "",
  sets: "",
  repetitions: "",
  gst: "",
  otherTax: "",
  discountPercentage: "",
}

export default function ExerciseTable() {
  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")

  const [exercises, setExercises] = useState([])
  const [form, setForm] = useState(emptyExercise)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editIndex, setEditIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [viewModal, setViewModal] = useState(false)
  const [viewData, setViewData] = useState(null)

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [exerciseIdToDelete, setExerciseIdToDelete] = useState(null)
  const [delloading, setDelLoading] = useState(false)

  const { searchQuery } = useGlobalSearch()
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ── LOAD ─────────────────────────────────────────────
  const loadExercises = async () => {
    try {
      setLoading(true)
      const res = await getTherapyExercise(clinicId, branchId)
      setExercises(res.data || [])
    } catch {
      showCustomToast("Load failed", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadExercises() }, [])

  // ── FILTER ───────────────────────────────────────────
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

  // ── VALIDATION ───────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.name.trim()) err.name = "Name is required"
    if (!form.frequency.trim()) err.frequency = "Frequency is required"
    if (!form.notes.trim()) err.notes = "Notes are required"
    if (!form.pricePerSession || Number(form.pricePerSession) <= 0)
      err.pricePerSession = "Enter valid price"
    if (!form.sets || Number(form.sets) <= 0) err.sets = "Sets is required"
    if (!form.repetitions || Number(form.repetitions) <= 0)
      err.repetitions = "Repetitions is required"
    if (
      form.discountPercentage !== "" &&
      (Number(form.discountPercentage) < 0 || Number(form.discountPercentage) > 100)
    ) err.discountPercentage = "0 to 100 only"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── SAVE ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    const payload = { ...form, clinicId, branchId }
    try {
      setSaveLoading(true)
      if (editId !== null) {
        await updateTherapyExercise(editId, payload)
        showCustomToast("Exercise updated successfully!", { position: "top-right" }, "success")
      } else {
        await createTherapyExercise(payload)
        showCustomToast("Exercise added successfully!", { position: "top-right" }, "success")
      }
      resetForm()
      loadExercises()
    } catch {
      showCustomToast("Something went wrong!", { position: "top-right" }, "error")
    } finally {
      setSaveLoading(false)
    }
  }

  // ── EDIT ─────────────────────────────────────────────
  const handleEdit = (item) => {
    let videoUrl = item.video || ""
    if (videoUrl && !videoUrl.startsWith("http")) videoUrl = "https://" + videoUrl
    setForm({ ...item, video: videoUrl, imagePreview: item.image })
    setEditId(item.therapyExercisesId)
    setModal(true)
    setErrors({})
  }

  // ── VIEW ─────────────────────────────────────────────
  const handleView = (ex) => {
    setViewData(ex)
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

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ───────────────────────────────── */}
      <div className="ex-page-header">
        <div className="ex-page-title-group">
          <div className="ex-page-icon">
            <Dumbbell size={20} />
          </div>
          <div>
            <h4 className="ex-page-title">Exercise Management</h4>
            <p className="ex-page-sub">
              {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
        {can("Exercise Management", "create") && (
          <button className="ex-add-btn" onClick={() => setModal(true)}>
            <PlusCircle size={15} />
            Add Exercise
          </button>
        )}
      </div>

      {/* ── TABLE ────────────────────────────────────── */}
      <div className="ex-table-wrapper">
        <CTable className="ex-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="ex-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Name</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Sets</CTableHeaderCell>
              <CTableHeaderCell className="ex-th">Reps</CTableHeaderCell>
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
              filteredExercises.map((ex, i) => (
                <CTableRow key={ex.therapyExercisesId || i} className="ex-tr">
                  <CTableDataCell className="ex-td ex-td-num">{i + 1}</CTableDataCell>

                  <CTableDataCell className="ex-td">
                    <span className="ex-name">{ex.name}</span>
                  </CTableDataCell>

                  <CTableDataCell className="ex-td">
                    <span className="ex-badge-blue">{ex.sets || "—"}</span>
                  </CTableDataCell>

                  <CTableDataCell className="ex-td">
                    <span className="ex-badge-blue">{ex.repetitions || "—"}</span>
                  </CTableDataCell>

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
                      {can("Exercise Management", "read") && (
                        <button className="ex-action-btn view" title="View" onClick={() => handleView(ex)}>
                          <Eye size={14} />
                        </button>
                      )}
                      {can("Exercise Management", "update") && (
                        <button className="ex-action-btn edit" title="Edit" onClick={() => handleEdit(ex)}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can("Exercise Management", "delete") && (
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

      {/* ── ADD / EDIT MODAL ─────────────────────────── */}
      <CModal
        visible={modal}
        onClose={resetForm}
        backdrop="static"
        alignment="center"
        className="ex-custom-modal"
        size="lg"
      >
        <CModalHeader className="ex-modal-header">
          <CModalTitle className="ex-modal-title">
            {editId ? "Edit" : "Add"} Exercise
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="ex-modal-body">
          <CForm>
            <CRow className="g-3">
              {/* Name */}
              <CCol md={6}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Name <span className="ex-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.name ? " is-invalid" : ""}`}
                    placeholder="e.g. Knee Extension"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.name}</CFormText>
                </div>
              </CCol>

              {/* Video URL */}
              <CCol md={6}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Video URL</CFormLabel>
                  <CFormInput
                    className="ex-input"
                    placeholder="https://..."
                    value={form.video}
                    onChange={(e) => setForm({ ...form, video: e.target.value })}
                  />
                </div>
              </CCol>

              {/* Session (disabled) */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Session</CFormLabel>
                  <CFormInput className="ex-input" value={form.session} disabled />
                </div>
              </CCol>

              {/* Price */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Price <span className="ex-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.pricePerSession ? " is-invalid" : ""}`}
                    type="number"
                    placeholder="0.00"
                    value={form.pricePerSession}
                    onChange={(e) => { setForm({ ...form, pricePerSession: e.target.value }); setErrors({ ...errors, pricePerSession: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.pricePerSession}</CFormText>
                </div>
              </CCol>

              {/* GST */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">GST (%)</CFormLabel>
                  <CFormInput
                    className="ex-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.gst}
                    onChange={(e) => setForm({ ...form, gst: Math.max(0, e.target.value) })}
                  />
                </div>
              </CCol>

              {/* Other Tax */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Other Tax (%)</CFormLabel>
                  <CFormInput
                    className="ex-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.otherTax}
                    onChange={(e) => setForm({ ...form, otherTax: Math.max(0, e.target.value) })}
                  />
                </div>
              </CCol>

              {/* Discount */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Discount (%)</CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.discountPercentage ? " is-invalid" : ""}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={form.discountPercentage}
                    onChange={(e) => { setForm({ ...form, discountPercentage: Math.max(0, e.target.value) }); setErrors({ ...errors, discountPercentage: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.discountPercentage}</CFormText>
                </div>
              </CCol>

              {/* Sets */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">No. of Sets <span className="ex-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.sets ? " is-invalid" : ""}`}
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={form.sets}
                    onChange={(e) => { setForm({ ...form, sets: e.target.value }); setErrors({ ...errors, sets: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.sets}</CFormText>
                </div>
              </CCol>

              {/* Repetitions */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Repetitions <span className="ex-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.repetitions ? " is-invalid" : ""}`}
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={form.repetitions}
                    onChange={(e) => { setForm({ ...form, repetitions: e.target.value }); setErrors({ ...errors, repetitions: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.repetitions}</CFormText>
                </div>
              </CCol>

              {/* Frequency */}
              <CCol md={4}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Frequency <span className="ex-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.frequency ? " is-invalid" : ""}`}
                    placeholder="e.g. Daily"
                    value={form.frequency}
                    onChange={(e) => { setForm({ ...form, frequency: e.target.value }); setErrors({ ...errors, frequency: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.frequency}</CFormText>
                </div>
              </CCol>

              {/* Notes */}
              <CCol md={12}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Notes <span className="ex-req">*</span></CFormLabel>
                  <CFormInput
                    className={`ex-input${errors.notes ? " is-invalid" : ""}`}
                    placeholder="Special instructions..."
                    value={form.notes}
                    onChange={(e) => { setForm({ ...form, notes: e.target.value }); setErrors({ ...errors, notes: "" }) }}
                  />
                  <CFormText className="ex-err-msg">{errors.notes}</CFormText>
                </div>
              </CCol>

              {/* Image upload */}
              <CCol md={12}>
                <div className="ex-field">
                  <CFormLabel className="ex-label">Image</CFormLabel>
                  <CFormInput
                    className="ex-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImage(e.target.files[0])}
                  />
                  {form.imagePreview && (
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      style={{ marginTop: 8, width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "0.5px solid #d0dce9" }}
                    />
                  )}
                </div>
              </CCol>
            </CRow>

            <div className="ex-modal-footer">
              <button type="button" className="ex-btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="button" className="ex-btn-primary" onClick={handleSave} disabled={saveLoading}>
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
      </CModal>

      {/* ── VIEW MODAL ───────────────────────────────── */}
      <CModal
        visible={viewModal}
        onClose={() => setViewModal(false)}
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
              {/* Image */}
              {viewData.image && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <CImage
                    src={viewData.image}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover", borderRadius: 10, border: "0.5px solid #d0dce9" }}
                  />
                </div>
              )}

              {/* Summary cards */}
              <div className="ex-summary-grid">
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Name</span>
                  <span className="ex-summary-value">{viewData.name}</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Exercise ID</span>
                  <span className="ex-summary-value ex-id-pill">{viewData.therapyExercisesId}</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Session</span>
                  <span className="ex-summary-value">{viewData.session}</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Frequency</span>
                  <span className="ex-summary-value">{viewData.frequency}</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Sets</span>
                  <span className="ex-summary-value">{viewData.sets}</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Repetitions</span>
                  <span className="ex-summary-value">{viewData.repetitions}</span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="ex-section-label">Pricing</div>
              <div className="ex-summary-grid">
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Price / Session</span>
                  <span className="ex-summary-value">₹{viewData.pricePerSession}</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">GST</span>
                  <span className="ex-summary-value">{viewData.gst}%</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Other Tax</span>
                  <span className="ex-summary-value">{viewData.otherTax}%</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Discount</span>
                  <span className="ex-summary-value">{viewData.discountPercentage}%</span>
                </div>
                <div className="ex-summary-card">
                  <span className="ex-summary-label">Discount Amt</span>
                  <span className="ex-summary-value">₹{viewData.discountAmount?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="ex-summary-card" style={{ borderColor: "#b5d4f4", background: "#e6f1fb" }}>
                  <span className="ex-summary-label">Total</span>
                  <span className="ex-summary-value" style={{ color: "#0c447c", fontSize: 16 }}>₹{calcTotal(viewData)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="ex-section-label">Notes</div>
              <div className="ex-notes-box">{viewData.notes || "—"}</div>

              {/* Video */}
              <div className="ex-section-label" style={{ marginTop: 12 }}>Video</div>
              <div style={{ marginBottom: 16 }}>
                {viewData.video ? (
                  <a href={viewData.video} target="_blank" rel="noreferrer" className="ex-video-link">
                    ▶ Watch Video
                  </a>
                ) : (
                  <span style={{ color: "#9ca3af", fontSize: 13 }}>No video attached</span>
                )}
              </div>

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
      </CModal>

      {/* ── DELETE CONFIRMATION ──────────────────────── */}
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise? This action cannot be undone."
        confirmText={
          delloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-white" />
              Deleting...
            </>
          ) : "Yes, Delete"
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={confirmDelete}
        onCancel={() => { setIsDeleteModalVisible(false); setExerciseIdToDelete(null) }}
      />

      {/* ── STYLES ───────────────────────────────────── */}
      <style>{`
        /* ── Page Header ─────────────────────── */
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
        .ex-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .ex-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .ex-add-btn {
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
        .ex-add-btn:hover  { background: #0c447c; }
        .ex-add-btn:active { transform: scale(0.97); }

        /* ── Table ──────────────────────────── */
        .ex-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .ex-table { margin-bottom: 0 !important; font-size: 13px; }
        .ex-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }
        .ex-tr { transition: background 0.12s; }
        .ex-tr:hover { background: #f0f5fb !important; }
        .ex-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .ex-td-num { color: #9ca3af; font-size: 12px; }

        /* ── Name / badges ───────────────── */
        .ex-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }
        .ex-count-badge {
          background: #eaf3de;
          color: #3b6d11;
          border: 0.5px solid #c0dd97;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
        }
        .ex-badge-blue {
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
        }
        .ex-price {
          color: #374151;
          font-weight: 600;
        }

        /* ── Action buttons ─────────────── */
        .ex-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .ex-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          flex-shrink: 0;
        }
        .ex-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .ex-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .ex-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .ex-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .ex-action-btn:active { transform: scale(0.94); }

        /* ── Empty state ─────────────────── */
        .ex-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .ex-empty-icon { color: #d0dce9; }

        /* ── Modal shared ─────────────────── */
        .ex-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .ex-modal-header {
          background: #185fa5 !important;
          border-bottom: none !important;
          padding: 16px 20px !important;
        }
        .ex-modal-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #fff !important;
        }
        .ex-custom-modal .btn-close {
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        .ex-modal-body {
          background: #f7fafd !important;
          padding: 20px !important;
        }
        .ex-view-body {
          max-height: 78vh;
          overflow-y: auto;
        }

        /* ── Form fields ──────────────────── */
        .ex-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 4px;
        }
        .ex-label {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 2px;
        }
        .ex-req { color: #e24b4a; }
        .ex-err-msg {
          font-size: 11px;
          color: #a32d2d !important;
          margin-top: 2px;
          min-height: 16px;
        }
        .ex-input {
          height: 36px;
          font-size: 13px !important;
          border: 0.5px solid #ced4da !important;
          border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .ex-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24, 95, 165, 0.15) !important;
        }
        .ex-input.is-invalid { border-color: #e24b4a !important; }

        /* ── Modal footer ─────────────────── */
        .ex-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 0.5px solid #d0dce9;
        }
        .ex-btn-primary {
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
        .ex-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .ex-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .ex-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .ex-btn-secondary {
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
        .ex-btn-secondary:hover { background: #f0f5fb; }

        /* ── View modal — summary grid ────── */
        .ex-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        @media (max-width: 600px) {
          .ex-summary-grid { grid-template-columns: 1fr 1fr; }
        }
        .ex-summary-card {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ex-summary-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .ex-summary-value {
          font-size: 14px;
          font-weight: 700;
          color: #0c447c;
        }
        .ex-id-pill {
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          display: inline-block;
        }

        /* ── Section label ────────────────── */
        .ex-section-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        /* ── Notes box ───────────────────── */
        .ex-notes-box {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #374151;
          margin-bottom: 4px;
          min-height: 40px;
        }

        /* ── Video link ───────────────────── */
        .ex-video-link {
          color: #185fa5;
          font-weight: 500;
          text-decoration: none;
          font-size: 13px;
        }
        .ex-video-link:hover {
          text-decoration: underline;
          color: #0c447c;
        }
      `}</style>
    </>
  )
}