import React, { useEffect, useState } from "react"
import {
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CFormText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormLabel,
} from "@coreui/react"
import Select from "react-select"
import ConfirmationModal from "../../components/ConfirmationModal"
import { useHospital } from "../Usecontext/HospitalContext"
import { Edit2, Eye, Trash2, Package, PackagePlus } from "lucide-react"
import {
  addTherapy,
  deleteTherapy,
  getTherapiesService,
  getTherapiesServicebytherapyId,
  updateTherapy,
} from "./PackagesAPI"
import { getProgramService } from "../ProcedureManagement/ProgramApi"
import { useGlobalSearch } from "../Usecontext/GlobalSearchContext"
import Pagination from "../../Utils/Pagination"

export default function PackagesManagement() {
  const [list, setList]                     = useState([])
  const [exerciseOptions, setExerciseOptions] = useState([])
  const [modal, setModal]                   = useState(false)
  const [editId, setEditId]                 = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [delloading, setDelLoading]         = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [viewModal, setViewModal]           = useState(false)
  const [viewLoading, setViewLoading]       = useState(false)
  const [viewError, setViewError]           = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)

  // ── Pagination state ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { searchQuery } = useGlobalSearch()

  const [form, setForm] = useState({
    packageName: "",
    programIds: [],
    programs: [],
    offerType: "",
    startOfferDate: "",
    endOfferDate: "",
    discountPercentage: "",
  })
  const [errors, setErrors] = useState({})

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  useEffect(() => {
    fetchPrograms()
    fetchData()
  }, [])

  const safeArray = (val) => (Array.isArray(val) ? val.filter(Boolean) : [])

  const handleView = async (item) => {
    setSelectedPackage(null)
    setViewError(null)
    setViewModal(true)
    setViewLoading(true)
    try {
      const clinicId  = localStorage.getItem("HospitalId")
      const branchId  = localStorage.getItem("branchId")
      const res       = await getTherapiesServicebytherapyId(item.packageId, clinicId, branchId)
      const data = res?.data?.data ?? res?.data ?? res ?? null
      if (!data) throw new Error("No data returned")
      setSelectedPackage(data)
    } catch (err) {
      console.error("VIEW ERROR:", err)
      setViewError(err?.response?.data?.message || err?.message || "Failed to load package details")
    } finally {
      setViewLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const hospitalId = localStorage.getItem("HospitalId")
      const branchId   = localStorage.getItem("branchId")
      const res        = await getProgramService(hospitalId, branchId)
      const options    = safeArray(res?.data?.data).map((item) => ({
        value: item.id,
        label: item.programName,
      }))
      setExerciseOptions(options)
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const fetchData = async () => {
    try {
      const clinicId = localStorage.getItem("HospitalId")
      const branchId = localStorage.getItem("branchId")
      const res      = await getTherapiesService(clinicId, branchId)
      setList(safeArray(res?.data?.data))
      setCurrentPage(1) // reset on fresh fetch
    } catch (err) {
      console.error("GET ERROR:", err?.response?.data)
    }
  }

  const validate = () => {
    let err = {}
    if (!form.packageName.trim()) err.packageName = "Package name is required"
    if (form.programIds.length === 0) err.programIds = "Select at least one program"
    if (
      form.startOfferDate &&
      form.endOfferDate &&
      new Date(form.endOfferDate) < new Date(form.startOfferDate)
    ) {
      err.endOfferDate = "End date must be after start date"
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const payload = {
      clinicId:           localStorage.getItem("HospitalId"),
      branchId:           localStorage.getItem("branchId"),
      packageName:        form.packageName,
      programIds:         form.programIds,
      offerType:          form.offerType,
      startOfferDate:     form.startOfferDate,
      endOfferDate:       form.endOfferDate,
      discountPercentage: Number(form.discountPercentage),
    }
    try {
      if (editId) {
        await updateTherapy(editId, payload)
      } else {
        await addTherapy(payload)
      }
      resetForm()
      fetchData()
    } catch (err) {
      console.error("ERROR RESPONSE:", err?.response?.data)
    }
  }

  const handleEdit = (item) => {
    setEditId(item.packageId)
    const selectedPrograms = safeArray(item.programIds)
      .map((id) => exerciseOptions.find((opt) => opt.value === id))
      .filter(Boolean)
    setForm({
      packageName:        item.packageName        || "",
      programs:           selectedPrograms,
      programIds:         item.programIds         || [],
      offerType:          item.offerType          || "",
      startOfferDate:     item.startOfferDate     || "",
      endOfferDate:       item.endOfferDate        || "",
      discountPercentage: item.discountPercentage || "",
    })
    setModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteTherapy(serviceIdToDelete, localStorage.getItem("HospitalId"))
      fetchData()
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  const resetForm = () => {
    setForm({
      packageName: "", programIds: [], programs: [],
      offerType: "", startOfferDate: "", endOfferDate: "", discountPercentage: "",
    })
    setEditId(null)
    setModal(false)
    setErrors({})
  }

  // ── Filtered + paginated data ─────────────────────────────────────────────
  const filteredList = list.filter((item) => {
    if (!item) return false
    const search = (searchQuery || "").toLowerCase()
    if (!search) return true
    return (
      (item.packageName || "").toLowerCase().includes(search) ||
      (item.packageId   || "").toLowerCase().includes(search) ||
      safeArray(item.programs)
        .map((p) => (p?.programName || "").toLowerCase())
        .join(" ")
        .includes(search)
    )
  })

  const totalPages  = Math.ceil(filteredList.length / rowsPerPage)
  const displayData = filteredList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      fontSize: "13px",
      borderColor: state.isFocused ? "#185fa5" : errors.programIds ? "#e24b4a" : "#ced4da",
      borderWidth: "0.5px",
      borderRadius: "7px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(24,95,165,0.15)" : "none",
      "&:hover": { borderColor: "#185fa5" },
    }),
    multiValue: (base) => ({
      ...base, background: "#e6f1fb", borderRadius: "20px", border: "0.5px solid #b5d4f4",
    }),
    multiValueLabel: (base) => ({
      ...base, color: "#0c447c", fontSize: "11px", fontWeight: "500", padding: "1px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base, color: "#185fa5", borderRadius: "0 20px 20px 0",
      "&:hover": { background: "#b5d4f4", color: "#042c53" },
    }),
    option: (base, state) => ({
      ...base, fontSize: "13px",
      backgroundColor: state.isSelected ? "#185fa5" : state.isFocused ? "#e6f1fb" : "transparent",
      color: state.isSelected ? "#fff" : "#374151",
    }),
    placeholder: (base) => ({ ...base, fontSize: "13px", color: "#9ca3af" }),
    menu: (base) => ({
      ...base, borderRadius: "7px", border: "0.5px solid #d0dce9",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 9999,
    }),
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className="pm-page-header">
        <div className="pm-page-title-group">
          <div className="pm-page-icon"><Package size={20} /></div>
          <div>
            <h4 className="pm-page-title">Package Management</h4>
            <p className="pm-page-sub">
              {filteredList.length} package{filteredList.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
        {can("Package Management", "create") && (
          <button className="pm-add-btn" onClick={() => setModal(true)}>
            <PackagePlus size={15} /> Add Package
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="pm-table-wrapper">
        <CTable className="pm-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="pm-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="pm-th">Package Name</CTableHeaderCell>
              <CTableHeaderCell className="pm-th">Programs</CTableHeaderCell>
              <CTableHeaderCell className="pm-th" style={{ width: 120 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {filteredList.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={4}>
                  <div className="pm-empty">
                    <Package size={40} className="pm-empty-icon" />
                    <p>No packages found</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              displayData.map((item, index) => (
                <CTableRow key={item.packageId || index} className="pm-tr">
                  {/* S.No respects pagination offset */}
                  <CTableDataCell className="pm-td pm-td-num">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </CTableDataCell>

                  <CTableDataCell className="pm-td">
                    <span className="pm-pkg-name">{item.packageName}</span>
                    {(item.discountPercentage ?? 0) > 0 && (
                      <span className="pm-discount-badge">{item.discountPercentage}% off</span>
                    )}
                  </CTableDataCell>

                  <CTableDataCell className="pm-td">
                    <div className="pm-prog-tags">
                      {safeArray(item.programs).map((p, i) => (
                        <span key={i} className="pm-prog-tag">{p?.programName || "—"}</span>
                      ))}
                    </div>
                  </CTableDataCell>

                  <CTableDataCell className="pm-td">
                    <div className="pm-actions">
                      {can("Package Management", "read") && (
                        <button className="pm-action-btn view" title="View" onClick={() => handleView(item)}>
                          <Eye size={14} />
                        </button>
                      )}
                      {can("Package Management", "update") && (
                        <button className="pm-action-btn edit" title="Edit" onClick={() => handleEdit(item)}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can("Package Management", "delete") && (
                        <button
                          className="pm-action-btn del" title="Delete"
                          onClick={() => { setServiceIdToDelete(item.packageId); setIsModalVisible(true) }}
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

      {/* ── Pagination ── */}
      {filteredList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setRowsPerPage(size); setCurrentPage(1) }}
        />
      )}

      {/* ── ADD / EDIT MODAL ── */}
      <CModal visible={modal} onClose={resetForm} backdrop="static" alignment="center" className="pm-custom-modal">
        <CModalHeader className="pm-modal-header">
          <CModalTitle className="pm-modal-title">{editId ? "Edit" : "Add"} Package</CModalTitle>
        </CModalHeader>

        <CModalBody className="pm-modal-body">
          <CForm>
            <CRow>
              <CCol md={12}>
                <div className="pm-field">
                  <CFormLabel className="pm-label">Package Name <span className="pm-req">*</span></CFormLabel>
                  <CFormInput
                    className={`pm-input${errors.packageName ? " is-invalid" : ""}`}
                    value={form.packageName}
                    placeholder="e.g. Physiotherapy Starter Pack"
                    onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                  />
                  <CFormText className="pm-err-msg">{errors.packageName}</CFormText>
                </div>
              </CCol>

              <CCol md={12}>
                <div className="pm-field">
                  <CFormLabel className="pm-label">Programs <span className="pm-req">*</span></CFormLabel>
                  <Select
                    options={exerciseOptions}
                    isMulti
                    styles={selectStyles}
                    placeholder="Select programs..."
                    value={form.programs}
                    onChange={(val) =>
                      setForm({ ...form, programs: val || [], programIds: val ? val.map((v) => v.value) : [] })
                    }
                  />
                  <CFormText className="pm-err-msg">{errors.programIds}</CFormText>
                </div>
              </CCol>

              <CCol md={6}>
                <div className="pm-field">
                  <CFormLabel className="pm-label">Offer Type</CFormLabel>
                  <CFormInput
                    className="pm-input"
                    placeholder="e.g. SEASONAL"
                    value={form.offerType}
                    onChange={(e) => setForm({ ...form, offerType: e.target.value.toUpperCase() })}
                  />
                </div>
              </CCol>

              <CCol md={6}>
                <div className="pm-field">
                  <CFormLabel className="pm-label">Discount %</CFormLabel>
                  <CFormInput
                    className="pm-input" type="number" min={0} max={100} placeholder="0"
                    value={form.discountPercentage}
                    onChange={(e) => setForm({ ...form, discountPercentage: Math.max(0, e.target.value) })}
                  />
                </div>
              </CCol>

              <CCol md={6}>
                <div className="pm-field">
                  <CFormLabel className="pm-label">Start Date</CFormLabel>
                  <CFormInput
                    className="pm-input" type="date" value={form.startOfferDate}
                    onChange={(e) => setForm({ ...form, startOfferDate: e.target.value })}
                  />
                </div>
              </CCol>

              <CCol md={6}>
                <div className="pm-field">
                  <CFormLabel className="pm-label">End Date</CFormLabel>
                  <CFormInput
                    className={`pm-input${errors.endOfferDate ? " is-invalid" : ""}`}
                    type="date" value={form.endOfferDate}
                    onChange={(e) => setForm({ ...form, endOfferDate: e.target.value })}
                  />
                  <CFormText className="pm-err-msg">{errors.endOfferDate}</CFormText>
                </div>
              </CCol>
            </CRow>

            <div className="pm-modal-footer">
              <button type="button" className="pm-btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="button" className="pm-btn-primary" onClick={handleSave}>
                {editId ? "Update Package" : "Save Package"}
              </button>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* ── VIEW MODAL ── */}
      <CModal
        visible={viewModal}
        onClose={() => { setViewModal(false); setSelectedPackage(null); setViewError(null) }}
        size="lg" alignment="center" className="pm-custom-modal"
      >
        <CModalHeader className="pm-modal-header">
          <CModalTitle className="pm-modal-title">Package Details</CModalTitle>
        </CModalHeader>

        <CModalBody className="pm-modal-body pm-view-body">
          {viewLoading && (
            <div className="pm-view-state">
              <div className="pm-spinner" />
              <p>Loading package details...</p>
            </div>
          )}

          {!viewLoading && viewError && (
            <div className="pm-view-state pm-view-error">
              <Package size={36} />
              <p>{viewError}</p>
              <button className="pm-btn-secondary" onClick={() => { setViewModal(false); setViewError(null) }}>Close</button>
            </div>
          )}

          {!viewLoading && !viewError && !selectedPackage && (
            <div className="pm-view-state">
              <Package size={36} className="pm-empty-icon" />
              <p>No data available</p>
              <button className="pm-btn-secondary" onClick={() => setViewModal(false)}>Close</button>
            </div>
          )}

          {!viewLoading && !viewError && selectedPackage && (
            <div className="d-flex flex-column gap-3">
              <div className="pm-acc-item">
                <details open>
                  <summary className="pm-acc-head">
                    <span>{selectedPackage.packageName || "—"}</span>
                    <span className="pm-acc-arrow">▾</span>
                  </summary>
                  <div className="pm-acc-body">
                    <div className="pm-info-grid">
                      <div className="pm-info-row">
                        <span className="pm-info-key">No. of Programs</span>
                        <span className="pm-info-val">{selectedPackage.noOfPrograms ?? safeArray(selectedPackage.programs).length}</span>
                      </div>
                      <div className="pm-info-row">
                        <span className="pm-info-key">Discount</span>
                        <span className="pm-info-val">{selectedPackage.discountPercentage ?? 0}%</span>
                      </div>
                      <div className="pm-info-row">
                        <span className="pm-info-key">Offer Type</span>
                        <span className="pm-info-val">{selectedPackage.offerType || "—"}</span>
                      </div>
                      <div className="pm-info-row">
                        <span className="pm-info-key">Start Date</span>
                        <span className="pm-info-val">{selectedPackage.startOfferDate || "—"}</span>
                      </div>
                      <div className="pm-info-row">
                        <span className="pm-info-key">End Date</span>
                        <span className="pm-info-val">{selectedPackage.endOfferDate || "—"}</span>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <div className="pm-section-label">Programs</div>

              {safeArray(selectedPackage.programs).length === 0 ? (
                <div className="pm-no-data">No programs linked to this package</div>
              ) : (
                safeArray(selectedPackage.programs).map((program, pIndex) => {
                  if (!program) return null
                  return (
                    <div className="pm-acc-item" key={pIndex}>
                      <details>
                        <summary className="pm-acc-head">
                          <span>{pIndex + 1}. {program.programName || "Unnamed Program"}</span>
                          <span className="pm-acc-arrow">▾</span>
                        </summary>
                        <div className="pm-acc-body">
                          {safeArray(program.therophyData).length === 0 ? (
                            <div className="pm-no-data">No therapies linked to this program</div>
                          ) : (
                            safeArray(program.therophyData).map((therapy, tIndex) => {
                              if (!therapy) return null
                              return (
                                <div className="pm-therapy-item" key={tIndex}>
                                  <details>
                                    <summary className="pm-therapy-head">
                                      <span>{tIndex + 1}. {therapy.therapyName || "Unnamed Therapy"}</span>
                                      <span className="pm-acc-arrow">▾</span>
                                    </summary>
                                    <div className="pm-therapy-body">
                                      {safeArray(therapy.exercises).length === 0 ? (
                                        <div className="pm-no-data">No exercises available</div>
                                      ) : (
                                        <div className="pm-ex-table-wrap">
                                          <CTable bordered responsive size="sm" className="pm-ex-table">
                                            <CTableHead>
                                              <CTableRow>
                                                <CTableHeaderCell>#</CTableHeaderCell>
                                                <CTableHeaderCell>Name</CTableHeaderCell>
                                                <CTableHeaderCell>Session</CTableHeaderCell>
                                                <CTableHeaderCell>Frequency</CTableHeaderCell>
                                                <CTableHeaderCell>Sets</CTableHeaderCell>
                                                <CTableHeaderCell>Reps</CTableHeaderCell>
                                                <CTableHeaderCell>Price</CTableHeaderCell>
                                              </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                              {safeArray(therapy.exercises).map((ex, i) => {
                                                if (!ex) return null
                                                return (
                                                  <CTableRow key={i}>
                                                    <CTableDataCell>{i + 1}</CTableDataCell>
                                                    <CTableDataCell>
                                                      <strong>{ex.name || "—"}</strong>
                                                      {ex.notes && <><br /><small className="text-muted">{ex.notes}</small></>}
                                                    </CTableDataCell>
                                                    <CTableDataCell>{ex.session     || "—"}</CTableDataCell>
                                                    <CTableDataCell>{ex.frequency   || "—"}</CTableDataCell>
                                                    <CTableDataCell>{ex.sets        || "—"}</CTableDataCell>
                                                    <CTableDataCell>{ex.repetitions || "—"}</CTableDataCell>
                                                    <CTableDataCell>₹{ex.totalPrice ?? 0}</CTableDataCell>
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
                            })
                          )}
                        </div>
                      </details>
                    </div>
                  )
                })
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button className="pm-btn-secondary" onClick={() => { setViewModal(false); setSelectedPackage(null) }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </CModalBody>
      </CModal>

      {/* ── DELETE MODAL ── */}
      <ConfirmationModal
        isVisible={isModalVisible}
        message="Deleting this package may affect patient billing and active subscriptions. Do you want to continue?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalVisible(false)}
        isLoading={delloading}
      />

      {/* ── STYLES ── */}
      <style>{`
        .pm-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .pm-page-title-group { display: flex; align-items: center; gap: 12px; }
        .pm-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #e6f1fb;
          display: flex; align-items: center; justify-content: center;
          color: #185fa5; flex-shrink: 0;
        }
        .pm-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .pm-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }
        .pm-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 9px 18px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
          transition: background 0.15s, transform 0.1s;
        }
        .pm-add-btn:hover  { background: #0c447c; }
        .pm-add-btn:active { transform: scale(0.97); }

        .pm-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; margin-bottom: 12px;
        }
        .pm-table { margin-bottom: 0 !important; font-size: 13px; }
        .pm-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .pm-tr { transition: background 0.12s; }
        .pm-tr:hover { background: #f0f5fb !important; }
        .pm-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .pm-td-num { color: #9ca3af; font-size: 12px; }
        .pm-pkg-name { font-weight: 600; font-size: 13px; color: #0c447c; margin-right: 8px; }
        .pm-discount-badge {
          background: #eaf3de; color: #3b6d11; border: 0.5px solid #c0dd97;
          border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 8px;
        }
        .pm-prog-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .pm-prog-tag {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 500;
          padding: 2px 9px; white-space: nowrap;
        }
        .pm-actions { display: flex; gap: 6px; align-items: center; }
        .pm-action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .pm-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .pm-action-btn.edit { background: #eaf3de; color: #3b6d11; }
        .pm-action-btn.del  { background: #fcebeb; color: #a32d2d; }
        .pm-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .pm-action-btn:active { transform: scale(0.94); }

        .pm-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .pm-empty-icon { color: #d0dce9; }

        .pm-view-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; padding: 48px 0; color: #9ca3af; font-size: 14px;
        }
        .pm-view-error { color: #a32d2d; }
        .pm-spinner {
          width: 36px; height: 36px;
          border: 3px solid #e6f1fb; border-top-color: #185fa5;
          border-radius: 50%; animation: pm-spin 0.7s linear infinite;
        }
        @keyframes pm-spin { to { transform: rotate(360deg); } }

        .pm-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important; border-radius: 12px !important; overflow: hidden;
        }
        .pm-modal-header {
          background: #185fa5 !important; border-bottom: none !important; padding: 16px 20px !important;
        }
        .pm-modal-title { font-size: 15px !important; font-weight: 700 !important; color: #fff !important; }
        .pm-custom-modal .btn-close { filter: brightness(0) invert(1); opacity: 0.8; }
        .pm-modal-body { background: #f7fafd !important; padding: 20px !important; }
        .pm-view-body  { max-height: 72vh; overflow-y: auto; }

        .pm-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .pm-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .pm-req   { color: #e24b4a; }
        .pm-err-msg { font-size: 11px; color: #a32d2d !important; margin-top: 2px; }
        .pm-input {
          height: 36px; font-size: 13px !important;
          border: 0.5px solid #ced4da !important; border-radius: 7px !important;
          transition: border-color 0.15s, box-shadow 0.15s !important;
        }
        .pm-input:focus {
          border-color: #185fa5 !important; box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }
        .pm-input.is-invalid { border-color: #e24b4a !important; }
        .pm-modal-footer {
          display: flex; justify-content: flex-end; gap: 8px;
          margin-top: 18px; padding-top: 14px; border-top: 0.5px solid #d0dce9;
        }
        .pm-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 9px 22px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
        }
        .pm-btn-primary:hover  { background: #0c447c; }
        .pm-btn-primary:active { transform: scale(0.97); }
        .pm-btn-secondary {
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 9px 18px;
          font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.15s;
        }
        .pm-btn-secondary:hover { background: #f0f5fb; }

        .pm-section-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-top: 4px; margin-bottom: 4px;
        }
        .pm-acc-item {
          border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; margin-bottom: 8px;
        }
        .pm-acc-item details > summary { list-style: none; }
        .pm-acc-item details > summary::-webkit-details-marker { display: none; }
        .pm-acc-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 14px; background: #e6f1fb; cursor: pointer;
          font-size: 13px; font-weight: 600; color: #0c447c;
          user-select: none; transition: background 0.15s;
        }
        .pm-acc-head:hover { background: #d0e6f8; }
        .pm-acc-arrow { font-size: 14px; transition: transform 0.2s; color: #185fa5; }
        details[open] > .pm-acc-head .pm-acc-arrow,
        details[open] > summary .pm-acc-arrow { transform: rotate(180deg); }
        .pm-acc-body { padding: 12px 14px; background: #fff; font-size: 13px; }
        .pm-info-grid  { display: flex; flex-direction: column; gap: 0; }
        .pm-info-row   { display: flex; gap: 10px; padding: 6px 0; border-bottom: 0.5px solid #f0f5fb; }
        .pm-info-row:last-child { border-bottom: none; }
        .pm-info-key { color: #6b7280; font-size: 12px; min-width: 130px; flex-shrink: 0; }
        .pm-info-val { color: #0c447c; font-weight: 600; font-size: 13px; }

        .pm-therapy-item {
          border: 0.5px solid #d0dce9; border-radius: 8px; overflow: hidden; margin-bottom: 8px;
        }
        .pm-therapy-item details > summary { list-style: none; }
        .pm-therapy-item details > summary::-webkit-details-marker { display: none; }
        .pm-therapy-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 12px; background: #f0f5fb; cursor: pointer;
          font-size: 12px; font-weight: 600; color: #185fa5; user-select: none;
        }
        .pm-therapy-head:hover { background: #e6f1fb; }
        .pm-therapy-body { padding: 10px 12px; background: #fff; }

        .pm-ex-table-wrap { overflow-x: auto; }
        .pm-ex-table { font-size: 12px !important; margin-bottom: 0 !important; }
        .pm-ex-table thead th {
          background: #f0f5fb !important; color: #6b7280 !important;
          font-size: 11px !important; font-weight: 600 !important;
          border-color: #d0dce9 !important; padding: 7px 10px !important;
        }
        .pm-ex-table tbody td {
          font-size: 12px !important; padding: 7px 10px !important;
          border-color: #eef2f7 !important; vertical-align: middle !important;
        }
        .pm-no-data { text-align: center; color: #9ca3af; font-size: 13px; padding: 16px 0; }
      `}</style>
    </>
  )
}