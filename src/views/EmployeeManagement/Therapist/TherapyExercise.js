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
import { createTherapyExercise ,updateTherapyExercise, deleteTherapyExercise, getTherapyExercise} from "./TheraphyApi"
import ConfirmationModal from "../../../components/ConfirmationModal"
import { Edit2, Trash2 } from "lucide-react"

// import {
//   createTherapyExercise,
//   updateTherapyExercise,
//   deleteTherapyExercise,
//   getTherapyExercise,
// } from "./TheraphyApi"

export default function ExerciseTable() {

  const clinicId = localStorage.getItem("HospitalId")
  const branchId = localStorage.getItem("branchId")
 

  const emptyExercise = {
    name: "",
    video: "",
    session: "",
    duration: "",
    frequency: "",
    notes: "",
    image: "",
    imagePreview: "",
 
  }

  const [exercises, setExercises] = useState([])
  const [form, setForm] = useState(emptyExercise)
  const [visible, setVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
const [loading, setLoading] = useState(false)
const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
const [exerciseIdToDelete, setExerciseIdToDelete] = useState(null)
const [delloading, setDelLoading] = useState(false)
  // ================= GET =================

const loadExercises = async () => {

  try {

    setLoading(true)

    const res = await getTherapyExercise(
      clinicId,
      branchId
    )

    setExercises(res.data || [])

  } catch (err) {

    showCustomToast("Load failed", "error")

  } finally {

    setLoading(false)

  }
}

  useEffect(() => {
    loadExercises()
  }, [])

  const validateForm = () => {

  if (!form.name) {
    showCustomToast("Name required", "error")
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

  // optional video validation

  if (form.video && !form.video.startsWith("http")) {
    showCustomToast("Invalid video link", "error")
    return false
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

        const id =
          exercises[editIndex].therapyExercisesId

        await updateTherapyExercise(id, payload)

        showCustomToast("Updated", "success")

      } else {

        await createTherapyExercise(payload)

        showCustomToast("Created", "success")
      }

      setVisible(false)

      loadExercises()

    } catch (err) {

      showCustomToast("Error", "error")

    }finally{
        setLoading(false)
    }
  }

  // ================= DELETE =================
const openDeleteModal = (index) => {

  const id =
    exercises[index].therapyExercisesId

  setExerciseIdToDelete(id)

  setIsDeleteModalVisible(true)

}
const confirmDeleteExercise = async () => {

  if (!exerciseIdToDelete) return

  try {

    setDelLoading(true)

    await deleteTherapyExercise(
      exerciseIdToDelete
    )

    showCustomToast(
      "Exercise deleted",
      "success"
    )

    setIsDeleteModalVisible(false)

    setExerciseIdToDelete(null)

    loadExercises()

  } catch (err) {

    showCustomToast(
      "Delete failed",
      "error"
    )

  } finally {

    setDelLoading(false)

  }
}
  const handleDelete = async (index) => {

    const id =
      exercises[index].therapyExercisesId

    await deleteTherapyExercise(id)

    loadExercises()
  }

  // ================= EDIT =================

  const handleEdit = (index) => {

    const ex = exercises[index]

    setForm({
      ...ex,
      imagePreview: ex.image,
    })

    setEditIndex(index)

    setVisible(true)
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
{loading && (
  <div className="text-center mb-2">
    Loading...
  </div>
)}

  return (
    <>
 

    <CCard>

      <CCardBody>

        <div className="d-flex justify-content-between mb-3">

          <h5>Exercises</h5>

         <CButton
 style={{backgroundColor:"var(--color-bgcolor)",color:"var(--color-black)"}}
  onClick={handleAdd}
  disabled={loading}
>
  + Add Exercise
</CButton>

        </div>


        <CTable bordered className="pink-table">

          <CTableHead>
            <CTableRow>

              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Image</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Session</CTableHeaderCell>
              <CTableHeaderCell>Duration</CTableHeaderCell>
              <CTableHeaderCell>Frequency</CTableHeaderCell>
              <CTableHeaderCell>Video URL</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>

            </CTableRow>
          </CTableHead>


          <CTableBody>

            {exercises.map((ex, i) => (

              <CTableRow key={i}>

                <CTableDataCell>{i+1}</CTableDataCell>
                <CTableDataCell>
                

                  {ex.image && (
                    <CImage src={ex.image} width={50} />
                  )}

                </CTableDataCell>

                <CTableDataCell>{ex.name}</CTableDataCell>
                <CTableDataCell>{ex.session}</CTableDataCell>
                <CTableDataCell>{ex.duration}</CTableDataCell>
                <CTableDataCell>{ex.frequency}</CTableDataCell>
                <CTableDataCell>

<CTableDataCell>

  {ex.video ? (
    <a
      href={ex.video}
      target="_blank"
      rel="noreferrer"
    >
      Open Video
    </a>
  ) : (
    <span style={{ color: "gray" }}>
      No Video
    </span>
  )}

</CTableDataCell>

</CTableDataCell>

                <CTableDataCell>

                  <button
                    size="sm"
                    className="actionBtn"
                    onClick={() => handleEdit(i)}
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    size="sm"
                    className="ms-2 actionBtn"  
                  onClick={() => openDeleteModal(i)}
                  >
                    <Trash2 size={18} />
                  </button>

                </CTableDataCell>

              </CTableRow>

            ))}

          </CTableBody>

        </CTable>

      </CCardBody>

      {/* MODAL */}

      <CModal
        visible={visible}
        onClose={() => setVisible(false)} className="custom-modal" backdrop="static"
      >

        <CModalHeader>
          <CModalTitle>Exercise</CModalTitle>
        </CModalHeader>

        <CModalBody>

          <CRow>

            <CCol md={6}>
              <CFormLabel>Name</CFormLabel>
              <CFormInput
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Video URL</CFormLabel>
              <CFormInput
                value={form.video}
                onChange={(e) =>
                  setForm({
                    ...form,
                    video: e.target.value,
                  })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Session</CFormLabel>
              <CFormInput
                value={form.session}
                onChange={(e) =>
                  setForm({
                    ...form,
                    session: e.target.value,
                  })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Duration</CFormLabel>
              <CFormInput
                value={form.duration}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: e.target.value,
                  })
                }
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel>Frequency</CFormLabel>
              <CFormInput
                value={form.frequency}
                onChange={(e) =>
                  setForm({
                    ...form,
                    frequency: e.target.value,
                  })
                }
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Notes</CFormLabel>
              <CFormInput
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Image</CFormLabel>
              <CFormInput
                type="file"
                onChange={(e) =>
                  handleImage(
                    e.target.files[0]
                  )
                }
              />
              {form.imagePreview && (
  <CImage src={form.imagePreview} width={80} className="mt-2"/>
)}
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

      <CButton
  color="success"
  onClick={handleSave}
  disabled={loading}
>
  {loading ? "Saving..." : "Save"}
</CButton>

        </CModalFooter>

      </CModal>

    </CCard>
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
    </>
  )
}