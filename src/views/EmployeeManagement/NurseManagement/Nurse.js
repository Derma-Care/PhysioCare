import React, { useEffect, useState } from 'react'
import {
  CButton,
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
} from '@coreui/react'
import { Edit2, Eye, Trash2 } from 'lucide-react'

import PhysioForm from './NurseForm'
import { getAllPhysios, addPhysio, updatePhysio, deletePhysio } from './NurseAPI'
import { useHospital } from '../../Usecontext/HospitalContext'


const PhysioManagement = () => {
  const [physios, setPhysios] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPhysio, setSelectedPhysio] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [physioToDelete, setPhysioToDelete] = useState(null)

  const hospitalId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')


  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const fetchPhysios = async () => {
    try {
      const res = await getAllPhysios(hospitalId, branchId)

      console.log("API Response:", res.data)

      // ensure array
      setPhysios(Array.isArray(res.data?.data) ? res.data.data : [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPhysios()
  }, [])

  const handleSave = async (data) => {
    try {
      if (selectedPhysio) {
        console.log("Updating:", selectedPhysio.therapistId)

        await updatePhysio(selectedPhysio.therapistId, data)

        // 🔥 ALWAYS refetch (correct data from backend)
        await fetchPhysios()
      } else {
        const res = await addPhysio(data)
        fetchPhysios() // refresh list after adding
        setPhysios(prev => [...prev, res.data.data])
      }

      setModalVisible(false)
      setSelectedPhysio(null)
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  const confirmDelete = async () => {
    try {
      await deletePhysio(physioToDelete.therapistId)  // ✅ FIXED

      setDeleteModalVisible(false)
      setPhysioToDelete(null)

      fetchPhysios() // refresh list
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div>
      {can('Therapist', 'create') && (
        <div className="d-flex justify-content-end mb-3">

          <CButton onClick={() => setModalVisible(true)}
            style={{
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}>
            Add Therapist
          </CButton>
        </div>
      )}
      <CTable striped className='pink-table'>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>

            <CTableHeaderCell>Photo</CTableHeaderCell>

            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Contact</CTableHeaderCell>
            <CTableHeaderCell>Qualification</CTableHeaderCell>
            <CTableHeaderCell>Experience</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {physios.map((p, index) => (
            <CTableRow key={p.id}>
              <CTableDataCell>
                {index + 1}
              </CTableDataCell>

              <CTableDataCell>
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={
                      p.documents?.profilePhoto
                        ? `data:image/jpeg;base64,${p.documents.profilePhoto}`
                        : '/assets/images/default-avatar.png'
                    }
                    alt={p.fullName}
                    width="40"
                    height="40"
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
              </CTableDataCell>

              <CTableDataCell>{p.fullName}</CTableDataCell>
              <CTableDataCell>{p.contactNumber}</CTableDataCell>
              <CTableDataCell>{p.qualification}</CTableDataCell>
              <CTableDataCell>{p.yearsOfExperience}</CTableDataCell>

              <CTableDataCell>
                <div className="d-flex gap-2 align-items-center">
                  {/* VIEW */}
                  {can('Therapist', 'read') && (
                    <div
                      className="actionBtn"
                      onClick={() => {
                        setSelectedPhysio(p)
                        setViewMode(true)
                        setModalVisible(true)
                      }}
                      title="View"
                    >
                      <Eye size={16} />
                    </div>
                  )}
                  {/* EDIT */}
                  {can('Therapist', 'update') && (
                    <div
                      className="actionBtn"
                      onClick={() => {
                        setSelectedPhysio(p)
                        setViewMode(false)
                        setModalVisible(true)
                      }}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </div>
                  )}
                  {/* DELETE */}
                  {can('Therapist', 'delete') && (
                    <div
                      className="actionBtn"
                      onClick={() => {
                        setPhysioToDelete(p)
                        setDeleteModalVisible(true)
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </div>
                  )}

                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <PhysioForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedPhysio(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedPhysio}
        viewMode={viewMode}
      />
      <CModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>

        <CModalBody>
          Are you sure you want to delete{' '}
          <strong>{physioToDelete?.fullName}</strong>?
        </CModalBody>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeleteModalVisible(false)}
          >
            Cancel
          </CButton>

          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default PhysioManagement