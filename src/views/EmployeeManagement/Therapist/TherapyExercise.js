/* eslint-disable react/prop-types */
import React, { useState } from "react"
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

export default function ExerciseTable() {

  const emptyExercise = {
    name: "",
    video: "",
    session: "",
    duration: "",
    frequency: "",
    notes: "",
    image: null,
    imagePreview: "",
  }

  const [exercises, setExercises] = useState([])
  const [form, setForm] = useState(emptyExercise)
  const [visible, setVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  // ✅ open modal
  const handleAdd = () => {
    setForm(emptyExercise)
    setEditIndex(null)
    setVisible(true)
  }

  // ✅ validation
  const validateForm = () => {

    if (!form.name) {
      showCustomToast("Exercise name required", "error")
      return false
    }

    if (!form.session) {
      showCustomToast("Session required", "error")
      return false
    }

    if (!form.duration) {
      showCustomToast("Duration required", "error")
      return false
    }

    if (!form.frequency) {
      showCustomToast("Frequency required", "error")
      return false
    }

    if (!form.notes) {
      showCustomToast("Notes required", "error")
      return false
    }

    if (!form.image) {
      showCustomToast("Image required", "error")
      return false
    }

    return true
  }

  // ✅ save
  const handleSave = () => {

    if (!validateForm()) return

    if (editIndex !== null) {
      const updated = [...exercises]
      updated[editIndex] = form
      setExercises(updated)

      showCustomToast("Exercise updated", "success")
    } else {
      setExercises([...exercises, form])

      showCustomToast("Exercise added", "success")
    }

    setVisible(false)
  }

  // ✅ edit
  const handleEdit = (index) => {
    setForm(exercises[index])
    setEditIndex(index)
    setVisible(true)
  }

  // ✅ delete
  const handleDelete = (index) => {
    const updated = exercises.filter((_, i) => i !== index)
    setExercises(updated)

    showCustomToast("Exercise deleted", "success")
  }

  // ✅ view
  const handleView = (index) => {
    console.log(exercises[index])
    showCustomToast("Check console", "info")
  }

  // ✅ image
  const handleImage = (file) => {

    const preview = URL.createObjectURL(file)

    setForm({
      ...form,
      image: file,
      imagePreview: preview,
    })
  }

  return (
    <CCard>
      <CCardBody>

        <div className="d-flex justify-content-between mb-3">
          <h5>Exercises</h5>

          <CButton color="primary" onClick={handleAdd}>
            + Add Exercise
          </CButton>
        </div>

        {/* TABLE */}

        <CTable bordered>

          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Image</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Session</CTableHeaderCell>
              <CTableHeaderCell>Duration</CTableHeaderCell>
              <CTableHeaderCell>Frequency</CTableHeaderCell>
              <CTableHeaderCell>YouTube Url</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>

            {exercises.map((ex, index) => (

              <CTableRow key={index}>

                <CTableDataCell>
                  {ex.imagePreview && (
                    <CImage
                      src={ex.imagePreview}
                      width={50}
                      height={50}
                    />
                  )}
                </CTableDataCell>

                <CTableDataCell>{ex.name}</CTableDataCell>
                <CTableDataCell>{ex.session}</CTableDataCell>
                <CTableDataCell>{ex.duration}</CTableDataCell>
                <CTableDataCell>{ex.frequency}</CTableDataCell>
                <CTableDataCell>{ex.video}</CTableDataCell>

                <CTableDataCell>

                  <CButton
                    size="sm"
                    color="info"
                    onClick={() => handleView(index)}
                  >
                    View
                  </CButton>

                  <CButton
                    size="sm"
                    color="warning"
                    className="ms-2"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </CButton>

                  <CButton
                    size="sm"
                    color="danger"
                    className="ms-2"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </CButton>

                </CTableDataCell>

              </CTableRow>

            ))}

          </CTableBody>

        </CTable>

      </CCardBody>

      {/* MODAL */}

      <CModal visible={visible} onClose={() => setVisible(false)}>

        <CModalHeader>
          <CModalTitle>
            {editIndex !== null ? "Edit Exercise" : "Add Exercise"}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>

          <CRow>

            <CCol md={6}>
              <CFormLabel>Name *</CFormLabel>
              <CFormInput
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>YouTube</CFormLabel>
              <CFormInput
                value={form.video}
                onChange={(e) =>
                  setForm({ ...form, video: e.target.value })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Session *</CFormLabel>
              <CFormInput
                value={form.session}
                onChange={(e) =>
                  setForm({ ...form, session: e.target.value })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Duration *</CFormLabel>
              <CFormInput
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: e.target.value })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Frequency *</CFormLabel>
              <CFormInput
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Notes *</CFormLabel>
              <CFormInput
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Image *</CFormLabel>
              <CFormInput
                type="file"
                onChange={(e) =>
                  handleImage(e.target.files[0])
                }
              />
            </CCol>

          </CRow>

        </CModalBody>

        <CModalFooter>

          <CButton
            color="secondary"
            onClick={() => setVisible(false)}
          >
            Cancel
          </CButton>

          <CButton color="success" onClick={handleSave}>
            Save
          </CButton>

        </CModalFooter>

      </CModal>

    </CCard>
  )
}