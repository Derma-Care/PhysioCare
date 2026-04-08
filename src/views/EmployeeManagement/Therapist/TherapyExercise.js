/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react"

import {
  CButton,
  CCard,
  CCardBody,
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
  CFormInput,
  CRow,
  CCol,
  CFormLabel,
  CImage,
} from "@coreui/react"

import { showCustomToast } from "../../../Utils/Toaster"
import {
  createTherapyExercise,
  updateTherapyExercise,
  deleteTherapyExercise,
  getTherapyExercise,
} from "./TheraphyApi"
import ConfirmationModal from "../../../components/ConfirmationModal"
import { Edit2, Trash2, Eye } from "lucide-react"
import LoadingIndicator from "../../../Utils/loader"

export default function ExerciseTable() {

  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")

  const emptyExercise = {
    name: "",
    video: "",
    session: "1",
    frequency: "",
    notes: "",
    image: "",
    imagePreview: "",


    // ✅ NEW FIELDS
    pricePerSession: "",
    sets: "",
    repetitions: "",
    gst: "",
    otherTax: "",
    discountPercentage: "",
  }

  const [exercises, setExercises] = useState([])
  const [form, setForm] = useState(emptyExercise)
  const [visible, setVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [loading, setLoading] = useState(false)


  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [exerciseIdToDelete, setExerciseIdToDelete] = useState(null)
  const [delloading, setDelLoading] = useState(false)

  // ✅ VIEW STATE
  const [viewVisible, setViewVisible] = useState(false)
  const [viewData, setViewData] = useState(null)

  // ================= GET =================
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

  useEffect(() => {
    loadExercises()
  }, [])

  // ================= VALIDATION =================
  const validateForm = () => {
    // Name
    if (!form.name.trim()) {
      showCustomToast("Name is required", "error")
      return false
    }

    // Session (fixed = 1, so just check existence)
    if (!form.session || Number(form.session) !== 1) {
      showCustomToast("Session must be 1", "error")
      return false
    }

    // Frequency
    if (!form.frequency.trim()) {
      showCustomToast("Frequency is required", "error")
      return false
    }

    // Notes
    if (!form.notes.trim()) {
      showCustomToast("Notes are required", "error")
      return false
    }

    // Image
    // if (!form.image) {
    //   showCustomToast("Image is required", "error")
    //   return false
    // }

    // Price
    if (form.pricePerSession === "" || Number(form.pricePerSession) <= 0) {
      showCustomToast("Enter valid price", "error")
      return false
    }

    // Discount %
    // if (form.discountPercentage === "") {
    //   showCustomToast("Discount is required", "error")
    //   return false
    // }

    if (Number(form.discountPercentage) < 0 || Number(form.discountPercentage) > 100) {
      showCustomToast("Discount must be between 0 and 100", "error")
      return false
    }

    // GST (optional but must be valid if entered)
    if (form.gst !== "" && Number(form.gst) < 0) {
      showCustomToast("GST cannot be negative", "error")
      return false
    }

    // Other Tax
    if (form.otherTax !== "" && Number(form.otherTax) < 0) {
      showCustomToast("Other tax cannot be negative", "error")
      return false
    }

    // Sets
    if (form.sets === "" || Number(form.sets) <= 0) {
      showCustomToast("Enter valid sets", "error")
      return false
    }

    // Repetitions
    if (form.repetitions === "" || Number(form.repetitions) <= 0) {
      showCustomToast("Enter valid repetitions", "error")
      return false
    }

    // Video (optional)
    if (form.video) {
      const url = form.video.trim()

      if (!/^https?:\/\/.+/.test(url)) {
        return showCustomToast("Enter valid video URL (must start with http/https)", "error")
      }
    }

    return true
  }

  // ================= SAVE =================
  const handleSave = async () => {
    if (!validateForm()) return

    const payload = {
      ...form,
      clinicId,
      branchId,
    }

    try {
      setLoading(true)

      if (editIndex !== null) {
        const id = exercises[editIndex].therapyExercisesId
        await updateTherapyExercise(id, payload)
        showCustomToast("Updated", "success")
      } else {
        await createTherapyExercise(payload)
        showCustomToast("Created", "success")
      }

      setVisible(false)
      loadExercises()

    } catch {
      showCustomToast("Error", "error")
    } finally {
      setLoading(false)
    }
  }

  // ================= DELETE =================
  const openDeleteModal = (index) => {
    const id = exercises[index].therapyExercisesId
    setExerciseIdToDelete(id)
    setIsDeleteModalVisible(true)
  }

  const confirmDeleteExercise = async () => {
    try {
      setDelLoading(true)
      await deleteTherapyExercise(exerciseIdToDelete)
      showCustomToast("Deleted", "success")
      loadExercises()
    } catch {
      showCustomToast("Delete failed", "error")
    } finally {
      setDelLoading(false)
      setIsDeleteModalVisible(false)
    }
  }

  // ================= EDIT =================
  const handleEdit = (index) => {
    const ex = exercises[index]
    let videoUrl = ex.video || ""

    // ✅ auto prefix if missing
    if (videoUrl && !videoUrl.startsWith("http")) {
      videoUrl = "https://" + videoUrl
    }
    setForm({ ...ex, imagePreview: ex.image })
    setEditIndex(index)
    setVisible(true)
  }

  // ================= VIEW =================
  const handleView = (ex) => {
    setViewData(ex)
    setViewVisible(true)
  }

  // ================= ADD =================
  const handleAdd = () => {
    setForm(emptyExercise)
    setEditIndex(null)
    setVisible(true)
  }

  // ================= IMAGE =================
  const handleImage = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setForm({
        ...form,
        image: reader.result,
        imagePreview: reader.result,
      })
    }
  }

  return (
    <>
      <CCard>
        <CCardBody>
          {loading ? (
            <LoadingIndicator message="Loading exercises..." />
          ) : (
            <>

              <div className="d-flex justify-content-between mb-3">
                <h5>Exercises</h5>
                <CButton onClick={handleAdd} disabled={loading} style={{ backgroundColor: "var(--color-black)", color: "#fff" }}>
                  + Add Exercise
                </CButton>
              </div>

              <CTable bordered className="pink-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Discount (%)</CTableHeaderCell>
                    <CTableHeaderCell>Discount Amount</CTableHeaderCell>


                    <CTableHeaderCell>Price</CTableHeaderCell>

                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {exercises.map((ex, i) => (
                    <CTableRow key={i}>
                      <CTableDataCell>{i + 1}</CTableDataCell>

                      <CTableDataCell>{ex.name}</CTableDataCell>
                      <CTableDataCell>{ex.discountPercentage || 0}%</CTableDataCell>
                      <CTableDataCell>₹{ex.discountAmount || 0}</CTableDataCell>

                      <CTableDataCell>₹{ex.pricePerSession}</CTableDataCell>

                      <CTableDataCell>
                        {/* VIEW */}
                        <CButton
                          size="sm"
                          className="actionBtn me-2"
                          style={{
                            backgroundColor: "var(--color-bgcolor)",
                            color: "var(--color-black)",
                          }}
                          onClick={() => handleView(ex)}
                        >
                          <Eye size={18} />
                        </CButton>

                        {/* EDIT */}
                        <CButton
                          size="sm"
                          className="actionBtn me-2"
                          style={{
                            backgroundColor: "var(--color-bgcolor)",
                            color: "var(--color-black)",
                          }}
                          onClick={() => handleEdit(i)}
                        >
                          <Edit2 size={18} />
                        </CButton>

                        {/* DELETE */}
                        <CButton
                          size="sm"
                          className="actionBtn"
                          style={{
                            backgroundColor: "var(--color-bgcolor)",
                            color: "var(--color-black)",
                          }}
                          onClick={() => openDeleteModal(i)}
                        >
                          <Trash2 size={18} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </>
          )}

        </CCardBody>
      </CCard>

      {/* ADD / EDIT MODAL (UNCHANGED UI) */}
      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static" className="custom-modal">
        <CModalHeader>
          <CModalTitle>Add Exercise</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow>

            <CCol md={6}>
              <CFormLabel>Name</CFormLabel>
              <CFormInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Video URL</CFormLabel>
              <CFormInput value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Session</CFormLabel>
              <CFormInput value={form.session} disabled />
            </CCol>



            <CCol md={4}>
              <CFormLabel>Price</CFormLabel>
              <CFormInput
                type="number"
                min="0"
                value={form.pricePerSession}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricePerSession: Math.max(0, e.target.value),
                  })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>GST</CFormLabel>
              <CFormInput
                type="number"
                min="0"
                value={form.gst}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gst: Math.max(0, e.target.value),
                  })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Other Tax</CFormLabel>
              <CFormInput
                type="number"
                min="0"
                value={form.otherTax}
                onChange={(e) =>
                  setForm({
                    ...form,
                    otherTax: Math.max(0, e.target.value),
                  })
                }
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Discount (%)</CFormLabel>
              <CFormInput
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountPercentage: Math.max(0, e.target.value),
                  })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Sets</CFormLabel>
              <CFormInput type="number" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })} />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Repetitions</CFormLabel>
              <CFormInput type="number" value={form.repetitions} onChange={(e) => setForm({ ...form, repetitions: e.target.value })} />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Frequency</CFormLabel>
              <CFormInput value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Notes</CFormLabel>
              <CFormInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Image</CFormLabel>
              <CFormInput type="file" onChange={(e) => handleImage(e.target.files[0])} />
              {form.imagePreview && <CImage src={form.imagePreview} width={80} className="mt-2" />}
            </CCol>

          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton onClick={() => setVisible(false)}>Cancel</CButton>
          <CButton onClick={handleSave}>
            {loading ? "Saving..." : "Save"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ✅ VIEW MODAL */}

      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={confirmDeleteExercise}
        onCancel={() => {
          setIsDeleteModalVisible(false)
          setExerciseIdToDelete(null)
        }}
      />
      <CModal
        visible={viewVisible}
        onClose={() => setViewVisible(false)}
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle>Exercise Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {viewData ? (
            <CRow>

              {/* IMAGE */}
              <CCol md={12} className="text-center mb-3">
                {viewData.image && (
                  <CImage src={viewData.image} width={120} />
                )}
              </CCol>

              {/* BASIC */}
              <CCol md={6}><strong>Name:</strong> {viewData.name}</CCol>
              <CCol md={6}><strong>Session:</strong> {viewData.session}</CCol>

              <CCol md={6}><strong>Frequency:</strong> {viewData.frequency}</CCol>

              {/* PRICING */}
              <CCol md={6}><strong>Price:</strong> ₹{viewData.pricePerSession}</CCol>
              <CCol md={6}><strong>GST:</strong> {viewData.gst}%</CCol>
              <CCol md={6}><strong>Discount:</strong> {viewData.discountPercentage}%</CCol>
              <CCol md={6}><strong>Discount Amount:</strong> ₹{viewData.discountAmount?.toFixed(2)}</CCol>

              <CCol md={6}><strong>Other Tax:</strong> {viewData.otherTax}%</CCol>

              <CCol md={6}>
                <strong>Total:</strong> ₹
                {(
                  Number(viewData.pricePerSession || 0) +
                  (Number(viewData.pricePerSession || 0) * Number(viewData.gst || 0)) / 100 +
                  (Number(viewData.pricePerSession || 0) * Number(viewData.otherTax || 0)) / 100
                ).toFixed(2)}
              </CCol>

              {/* EXERCISE */}
              <CCol md={6}><strong>Sets:</strong> {viewData.sets}</CCol>
              <CCol md={6}><strong>Repetitions:</strong> {viewData.repetitions}</CCol>

              {/* NOTES */}
              <CCol md={12}>
                <strong>Notes:</strong> {viewData.notes}
              </CCol>

              {/* VIDEO */}
              <CCol md={12}>
                <strong>Video:</strong>{" "}
                {viewData.video ? (
                  <a href={viewData.video} target="_blank" rel="noreferrer">
                    Watch Video
                  </a>
                ) : (
                  "No Video"
                )}
              </CCol>

            </CRow>
          ) : (
            <div>No data available</div>
          )}
        </CModalBody>

        <CModalFooter>
          <CButton onClick={() => setViewVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}