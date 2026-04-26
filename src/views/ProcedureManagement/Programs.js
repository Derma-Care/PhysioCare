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
import { Edit2, Eye, Trash2, ClipboardList, PlusCircle } from "lucide-react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { getTherapiesService } from "./TherapyServiceApi"
import {
  addProgram,
  deleteProgram,
  getProgramService,
  getProgramServicebyProgramId,
  updateProgram,
} from "./ProgramApi"
import ConfirmationModal from "../../components/ConfirmationModal"
import LoadingIndicator from "../../Utils/loader"
import { showCustomToast } from "../../Utils/Toaster"
import { useHospital } from "../Usecontext/HospitalContext"
import { useGlobalSearch } from "../Usecontext/GlobalSearchContext"

/** Strip null / undefined from any value — always returns a real array */
const safeArray = (val) => (Array.isArray(val) ? val.filter(Boolean) : [])

/**
 * Dig out the therapies list from whatever shape the detail API returns.
 * Handles every spelling variant seen so far + nested data wrappers.
 */
const extractTherapies = (raw) => {
  if (!raw) return []
  // Common field-name variants from the backend
  const keys = [
    "therophyData",   // original code
    "theraphyData",   // typo variant
    "therapyData",    // clean variant
    "therophy",       // list-level key
    "therahy",        // another typo
    "therapies",      // ideal name
    "Therapies",
  ]
  for (const key of keys) {
    const arr = safeArray(raw[key])
    if (arr.length > 0) return arr
  }
  return []
}

export default function Programs() {
  const [list, setList]                           = useState([])
  const [exerciseOptions, setExerciseOptions]     = useState([])
  const [modal, setModal]                         = useState(false)
  const [editId, setEditId]                       = useState(null)
  const [isModalVisible, setIsModalVisible]       = useState(false)
  const [delloading, setDelLoading]               = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [dropdownOpen, setDropdownOpen]           = useState(false)
  const [loading, setLoading]                     = useState(false)
  const [saveLoading, setSaveLoading]             = useState(false)
  const [viewModal, setViewModal]                 = useState(false)
  const [viewLoading, setViewLoading]             = useState(false)
  const [viewError, setViewError]                 = useState(null)
  const [viewData, setViewData]                   = useState(null)   // { programName, _therapies[] }

  const { searchQuery } = useGlobalSearch()
  const { user }        = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")

  const [form, setForm] = useState({
    therapyName:  "",
    exercises:    [],
    exercisesIds: [],
  })
  const [errors, setErrors] = useState({})

  // ─── FETCH LIST ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData()
    fetchTherapies()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getProgramService(clinicId, branchId)
      setList(safeArray(res?.data?.data))
    } catch (error) {
      console.error("Error fetching programs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTherapies = async () => {
    try {
      const res  = await getTherapiesService(clinicId, branchId)
      const data = safeArray(res?.data?.data)
      setExerciseOptions(
        data.map((item) => ({ value: item.id, label: item.therapyName }))
      )
    } catch (err) {
      console.error("fetchTherapies error", err)
    }
  }

  // ─── VIEW ──────────────────────────────────────────────────────────────────
  const handleView = async (id) => {
    setViewData(null)
    setViewError(null)
    setViewModal(true)
    setViewLoading(true)

    try {
      const res = await getProgramServicebyProgramId(id, clinicId, branchId)

      // ── Unwrap: try every common wrapper shape ──
      const raw =
        res?.data?.data ??
        res?.data ??
        res ??
        null

      if (!raw) throw new Error("No data returned from API")

      // Log the raw response so you can see the real field names in the console
      console.log("VIEW RAW RESPONSE >>>", JSON.stringify(raw, null, 2))

      const therapies = extractTherapies(raw)

      setViewData({
        programName: raw.programName ?? raw.name ?? "—",
        _therapies:  therapies,
      })
    } catch (err) {
      console.error("view error", err)
      setViewError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load program details"
      )
    } finally {
      setViewLoading(false)
    }
  }

  const closeViewModal = () => {
    setViewModal(false)
    setViewData(null)
    setViewError(null)
  }

  // ─── VALIDATION ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.therapyName.trim())       err.therapyName  = "Program name is required"
    if (form.exercisesIds.length === 0) err.exercisesIds = "Select at least one therapy"
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ─── SAVE (ADD / UPDATE) ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaveLoading(true)
      const payload = {
        clinicId,
        branchId,
        programName: form.therapyName,
        therophyIds: form.exercisesIds,
      }
      if (editId) {
        await updateProgram(editId, payload)
        showCustomToast("Program updated successfully!", { position: "top-right" }, "success")
      } else {
        await addProgram(payload)
        showCustomToast("Program added successfully!", { position: "top-right" }, "success")
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

  // ─── EDIT ──────────────────────────────────────────────────────────────────
  const handleEdit = (item) => {
    setEditId(item.id)
    const selectedIds = safeArray(item.therophy).map((t) => t.theraphyId)
    const selected    = exerciseOptions.filter((opt) => selectedIds.includes(opt.value))
    setForm({
      therapyName:  item.programName,
      exercises:    selected,
      exercisesIds: selected.map((s) => String(s.value)),
    })
    setModal(true)
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteProgram(serviceIdToDelete)
      setList((prev) => prev.filter((item) => item.id !== serviceIdToDelete))
      showCustomToast("Program deleted successfully!", { position: "top-right" }, "success")
      fetchData()
    } catch (error) {
      console.error(error)
      showCustomToast("Failed to delete program", { position: "top-right" }, "error")
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  // ─── RESET ─────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ therapyName: "", exercises: [], exercisesIds: [] })
    setEditId(null)
    setModal(false)
    setErrors({})
  }

  // ─── SEARCH FILTER ─────────────────────────────────────────────────────────
  const filteredList = list.filter((item) => {
    if (!item) return false
    const search = (searchQuery || "").toLowerCase()
    if (!search) return true
    return (
      (item.id            || "").toString().toLowerCase().includes(search) ||
      (item.programName   || "").toLowerCase().includes(search)            ||
      (item.theraphyCount || "").toString().includes(search)               ||
      safeArray(item.therophy)
        .map((t) => (t?.therapyName || "").toLowerCase())
        .join(" ")
        .includes(search)
    )
  })

  // ─── react-select styles ───────────────────────────────────────────────────
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

  if (loading) return <LoadingIndicator />

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="pg-page-header">
        <div className="pg-page-title-group">
          <div className="pg-page-icon">
            <ClipboardList size={20} />
          </div>
          <div>
            <h4 className="pg-page-title">Program Management</h4>
            <p className="pg-page-sub">
              {filteredList.length} program{filteredList.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
        {can("Program Management", "create") && (
          <button className="pg-add-btn" onClick={() => setModal(true)}>
            <PlusCircle size={15} />
            Add Program
          </button>
        )}
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <div className="pg-table-wrapper">
        <CTable className="pg-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="pg-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="pg-th">Program Name</CTableHeaderCell>
              <CTableHeaderCell className="pg-th">No. of Therapies</CTableHeaderCell>
              <CTableHeaderCell className="pg-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredList.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={4}>
                  <div className="pg-empty">
                    <ClipboardList size={40} className="pg-empty-icon" />
                    <p>No programs found</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredList.map((item, index) => (
                <CTableRow key={item.id || index} className="pg-tr">
                  <CTableDataCell className="pg-td pg-td-num">{index + 1}</CTableDataCell>

                  <CTableDataCell className="pg-td">
                    <span className="pg-program-name">{item.programName}</span>
                  </CTableDataCell>

                  <CTableDataCell className="pg-td">
                    <span className="pg-count-badge">{item.theraphyCount ?? 0} therapies</span>
                  </CTableDataCell>

                  <CTableDataCell className="pg-td">
                    <div className="pg-actions">
                      {can("Program Management", "read") && (
                        <button
                          className="pg-action-btn view"
                          title="View"
                          onClick={() => handleView(item.id)}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {can("Program Management", "update") && (
                        <button
                          className="pg-action-btn edit"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can("Program Management", "delete") && (
                        <button
                          className="pg-action-btn del"
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

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────────────── */}
      <CModal
        visible={modal}
        onClose={resetForm}
        backdrop="static"
        alignment="center"
        size="lg"
        className="pg-custom-modal"
      >
        <CModalHeader className="pg-modal-header">
          <CModalTitle className="pg-modal-title">
            {editId ? "Edit" : "Add"} Program
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="pg-modal-body">
          <CForm>
            <CRow>
              <CCol md={12}>
                <div className="pg-field">
                  <CFormLabel className="pg-label">
                    Program Name <span className="pg-req">*</span>
                  </CFormLabel>
                  <CFormInput
                    className={`pg-input${errors.therapyName ? " is-invalid" : ""}`}
                    placeholder="e.g. Spine Rehabilitation Program"
                    value={form.therapyName}
                    onChange={(e) => setForm({ ...form, therapyName: e.target.value })}
                  />
                  <CFormText className="pg-err-msg">{errors.therapyName}</CFormText>
                </div>
              </CCol>

              <CCol md={12}>
                <div className="pg-field">
                  <CFormLabel className="pg-label">
                    Select Therapies <span className="pg-req">*</span>
                  </CFormLabel>
                  <Select
                    options={exerciseOptions}
                    isMulti
                    isSearchable
                    isClearable={false}
                    hideSelectedOptions={false}
                    closeMenuOnSelect={false}
                    styles={selectStyles}
                    placeholder="Search and select therapies..."
                    value={form.exercises}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setDropdownOpen(false)}
                    onChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        exercises:    val || [],
                        exercisesIds: val ? val.map((v) => String(v.value)) : [],
                      }))
                    }
                  />
                  <CFormText className="pg-err-msg">{errors.exercisesIds}</CFormText>
                </div>
              </CCol>
            </CRow>

            <div className="pg-modal-footer">
              <button type="button" className="pg-btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button
                type="button"
                className="pg-btn-primary"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {editId ? "Updating..." : "Saving..."}
                  </>
                ) : editId ? (
                  "Update Program"
                ) : (
                  "Save Program"
                )}
              </button>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* ── VIEW MODAL ───────────────────────────────────────────────────── */}
      <CModal
        visible={viewModal}
        onClose={closeViewModal}
        size="lg"
        backdrop="static"
        alignment="center"
        className="pg-custom-modal"
      >
        <CModalHeader className="pg-modal-header">
          <CModalTitle className="pg-modal-title">Program Details</CModalTitle>
        </CModalHeader>

        <CModalBody className="pg-modal-body pg-view-body">

          {/* Loading */}
          {viewLoading && (
            <div className="pg-view-state">
              <div className="pg-spinner" />
              <p>Loading program details...</p>
            </div>
          )}

          {/* Error */}
          {!viewLoading && viewError && (
            <div className="pg-view-state pg-view-error">
              <ClipboardList size={36} />
              <p>{viewError}</p>
              <button className="pg-btn-secondary" onClick={closeViewModal}>Close</button>
            </div>
          )}

          {/* No data */}
          {!viewLoading && !viewError && !viewData && (
            <div className="pg-view-state">
              <ClipboardList size={40} className="pg-empty-icon" />
              <p>No data available</p>
              <button className="pg-btn-secondary" onClick={closeViewModal}>Close</button>
            </div>
          )}

          {/* ── Data ── */}
          {!viewLoading && !viewError && viewData && (() => {
            const therapies = viewData._therapies   // already a safe array
            return (
              <>
                {/* Summary cards */}
                <div className="pg-summary-grid">
                  <div className="pg-summary-card pg-summary-card--wide">
                    <span className="pg-summary-label">Program Name</span>
                    <span className="pg-summary-value">{viewData.programName}</span>
                  </div>
                  <div className="pg-summary-card">
                    <span className="pg-summary-label">Total Therapies</span>
                    <span className="pg-summary-value">{therapies.length}</span>
                  </div>
                </div>

                {/* Therapies section */}
                <div className="pg-section-label">Therapies</div>

                {therapies.length === 0 ? (
                  <div className="pg-empty" style={{ padding: "24px 0" }}>
                    <ClipboardList size={36} className="pg-empty-icon" />
                    <p>No therapies linked to this program</p>
                  </div>
                ) : (
                  <div className="pg-therapy-list">
                    {therapies.map((therapy, index) => {
                      if (!therapy) return null
                      const exercises = safeArray(therapy.exercises)
                      return (
                        <div className="pg-acc-item" key={therapy.id || index}>
                          <details>
                            <summary className="pg-acc-head">
                              <span>
                                {index + 1}. {therapy.therapyName || "Unnamed Therapy"}
                              </span>
                              <span className="pg-acc-meta">
                                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
                                <i className="pg-acc-arrow">▾</i>
                              </span>
                            </summary>

                            <div className="pg-acc-body">
                              {exercises.length === 0 ? (
                                <div className="pg-no-data">
                                  No exercises available for this therapy
                                </div>
                              ) : (
                                <div className="pg-ex-table-wrap">
                                  <CTable bordered responsive className="pg-ex-table">
                                    <CTableHead>
                                      <CTableRow>
                                        <CTableHeaderCell className="pg-ex-th">#</CTableHeaderCell>
                                        <CTableHeaderCell className="pg-ex-th">Exercise</CTableHeaderCell>
                                        <CTableHeaderCell className="pg-ex-th">Session</CTableHeaderCell>
                                        <CTableHeaderCell className="pg-ex-th">Frequency</CTableHeaderCell>
                                        <CTableHeaderCell className="pg-ex-th">Sets</CTableHeaderCell>
                                        <CTableHeaderCell className="pg-ex-th">Reps</CTableHeaderCell>
                                        <CTableHeaderCell className="pg-ex-th">Price</CTableHeaderCell>
                                      </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                      {exercises.map((ex, i) => {
                                        if (!ex) return null
                                        return (
                                          <CTableRow key={ex.id || i} className="pg-ex-tr">
                                            <CTableDataCell className="pg-ex-td pg-td-num">{i + 1}</CTableDataCell>
                                            <CTableDataCell className="pg-ex-td">
                                              <span className="pg-ex-name">{ex.name || "—"}</span>
                                            </CTableDataCell>
                                            <CTableDataCell className="pg-ex-td">{ex.session    || "—"}</CTableDataCell>
                                            <CTableDataCell className="pg-ex-td">{ex.frequency  || "—"}</CTableDataCell>
                                            <CTableDataCell className="pg-ex-td">{ex.sets        || "—"}</CTableDataCell>
                                            <CTableDataCell className="pg-ex-td">{ex.repetitions || "—"}</CTableDataCell>
                                            <CTableDataCell className="pg-ex-td">
                                              <span className="pg-total-price">₹{ex.totalPrice ?? 0}</span>
                                            </CTableDataCell>
                                          </CTableRow>
                                        )
                                      })}
                                    </CTableBody>
                                  </CTable>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                  <button className="pg-btn-secondary" onClick={closeViewModal}>Close</button>
                </div>
              </>
            )
          })()}
        </CModalBody>
      </CModal>

      {/* ── DELETE CONFIRMATION ──────────────────────────────────────────── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Program"
        message="This program is part of one or more packages. Deleting it will affect those records. Do you want to continue?"
        confirmText={
          delloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
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

      {/* ── STYLES ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Page Header */
        .pg-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .pg-page-title-group { display: flex; align-items: center; gap: 12px; }
        .pg-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #e6f1fb;
          display: flex; align-items: center; justify-content: center;
          color: #185fa5; flex-shrink: 0;
        }
        .pg-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .pg-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }
        .pg-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #185fa5; color: #fff; border: none; border-radius: 8px;
          padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .pg-add-btn:hover  { background: #0c447c; }
        .pg-add-btn:active { transform: scale(0.97); }

        /* Table */
        .pg-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; margin-bottom: 12px;
        }
        .pg-table { margin-bottom: 0 !important; font-size: 13px; }
        .pg-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .pg-tr { transition: background 0.12s; }
        .pg-tr:hover { background: #f0f5fb !important; }
        .pg-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .pg-td-num { color: #9ca3af; font-size: 12px; }
        .pg-program-name { font-weight: 600; font-size: 13px; color: #0c447c; }
        .pg-count-badge {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px;
        }
        .pg-actions { display: flex; gap: 6px; align-items: center; }
        .pg-action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .pg-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .pg-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .pg-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .pg-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .pg-action-btn:active { transform: scale(0.94); }

        /* Empty */
        .pg-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .pg-empty-icon { color: #d0dce9; }

        /* View states */
        .pg-view-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; padding: 48px 0; color: #9ca3af; font-size: 14px;
        }
        .pg-view-error { color: #a32d2d; }
        .pg-spinner {
          width: 36px; height: 36px;
          border: 3px solid #e6f1fb; border-top-color: #185fa5;
          border-radius: 50%; animation: pg-spin 0.7s linear infinite;
        }
        @keyframes pg-spin { to { transform: rotate(360deg); } }

        /* Modal shared */
        .pg-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important;
          border-radius: 12px !important; overflow: hidden;
        }
        .pg-modal-header {
          background: #185fa5 !important; border-bottom: none !important;
          padding: 16px 20px !important;
        }
        .pg-modal-title { font-size: 15px !important; font-weight: 700 !important; color: #fff !important; }
        .pg-custom-modal .btn-close { filter: brightness(0) invert(1); opacity: 0.8; }
        .pg-modal-body { background: #f7fafd !important; padding: 20px !important; }
        .pg-view-body  { max-height: 78vh; overflow-y: auto; }

        /* Form fields */
        .pg-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .pg-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .pg-req   { color: #e24b4a; }
        .pg-err-msg { font-size: 11px; color: #a32d2d !important; margin-top: 2px; }
        .pg-input {
          height: 36px; font-size: 13px !important;
          border: 0.5px solid #ced4da !important; border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .pg-input:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }
        .pg-input.is-invalid { border-color: #e24b4a !important; }
        .pg-modal-footer {
          display: flex; justify-content: flex-end; gap: 8px;
          margin-top: 18px; padding-top: 14px; border-top: 0.5px solid #d0dce9;
        }
        .pg-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #185fa5; color: #fff; border: none; border-radius: 8px;
          padding: 9px 22px; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
        }
        .pg-btn-primary:hover:not(:disabled)  { background: #0c447c; }
        .pg-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .pg-btn-primary:disabled              { opacity: 0.65; cursor: not-allowed; }
        .pg-btn-secondary {
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .pg-btn-secondary:hover { background: #f0f5fb; }

        /* Summary cards */
        .pg-summary-grid {
          display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 18px;
        }
        @media (max-width: 520px) { .pg-summary-grid { grid-template-columns: 1fr; } }
        .pg-summary-card {
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 10px;
          padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;
        }
        .pg-summary-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .pg-summary-value { font-size: 15px; font-weight: 700; color: #0c447c; }

        /* Section label */
        .pg-section-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
        }

        /* Therapy accordion */
        .pg-therapy-list { display: flex; flex-direction: column; gap: 8px; }
        .pg-acc-item { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; }
        .pg-acc-item details > summary            { list-style: none; }
        .pg-acc-item details > summary::-webkit-details-marker { display: none; }
        .pg-acc-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 14px; background: #e6f1fb; cursor: pointer;
          font-size: 13px; font-weight: 600; color: #0c447c;
          user-select: none; transition: background 0.15s;
        }
        .pg-acc-head:hover { background: #d0e6f8; }
        .pg-acc-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 500; color: #185fa5;
        }
        .pg-acc-arrow { font-size: 14px; transition: transform 0.2s; display: inline-block; }
        details[open] > summary .pg-acc-arrow { transform: rotate(180deg); }
        .pg-acc-body { padding: 12px 14px; background: #fff; }

        /* Exercise table */
        .pg-ex-table-wrap {
          border: 0.5px solid #d0dce9; border-radius: 8px;
          overflow: hidden; overflow-x: auto;
        }
        .pg-ex-table { margin-bottom: 0 !important; font-size: 12px !important; }
        .pg-ex-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 11px !important; font-weight: 600 !important;
          padding: 8px 12px !important; white-space: nowrap; border: none !important;
        }
        .pg-ex-tr { transition: background 0.1s; }
        .pg-ex-tr:hover { background: #f0f5fb !important; }
        .pg-ex-td {
          font-size: 12px !important; padding: 8px 12px !important;
          vertical-align: middle !important; border-color: #eef2f7 !important; color: #374151;
        }
        .pg-ex-name    { font-weight: 600; color: #0c447c; }
        .pg-total-price { color: #3b6d11; font-weight: 700; }
        .pg-no-data { text-align: center; color: #9ca3af; font-size: 13px; padding: 16px 0; }
      `}</style>
    </>
  )
}