import React, { useEffect, useState } from 'react'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal ,
  CModalHeader ,
  CModalTitle ,
  CModalBody,
  CModalFooter ,
} from '@coreui/react'
import { Edit2, Eye, Trash2 } from 'lucide-react'

import PhysioForm from './NurseForm'
import { getAllPhysios, addPhysio, updatePhysio, deletePhysio } from './NurseAPI'
// const dummyPhysios = [
//   {
//     id: 1,
//     fullName: 'Dr. Priya Sharma',
//     contactNumber: '9876543210',
//     gender: 'female',
//     dateOfBirth: '1995-06-10',

//     qualification: 'BPT',
//     yearsOfExperience: 2,

//     services: ['home', 'clinic'],

//     specializations: ['orthopedic'],
//     expertiseAreas: ['knee', 'shoulder'],
//     treatmentTypes: ['exercise_therapy', 'manual_therapy'],

//     availability: {
//       startDay: 'monday',
//       endDay: 'friday',
//       startTime: '09:00',
//       endTime: '18:00',
//     },

//     bio: 'Physiotherapist specializing in knee rehabilitation.',

//     documents: {
//       licenseCertificate: '',
//       degreeCertificate: '',
//       profilePhoto: '',
//     },

//     languages: ['english', 'telugu'],
//     role: 'physiotherapist',
//     physioType: 'therapist',
//   },

//   {
//     id: 2,
//     fullName: 'Dr. Rahul Verma',
//     contactNumber: '9123456780',
//     gender: 'male',
//     dateOfBirth: '1990-03-15',

//     qualification: 'MPT',
//     yearsOfExperience: 5,

//     services: ['clinic'],

//     specializations: ['neurological'],
//     expertiseAreas: ['back'],
//     treatmentTypes: ['manual_therapy'],

//     availability: {
//       startDay: 'tuesday',
//       endDay: 'saturday',
//       startTime: '10:00',
//       endTime: '19:00',
//     },

//     bio: 'Expert in neurological physiotherapy.',

//     documents: {
//       licenseCertificate: '',
//       degreeCertificate: '',
//       profilePhoto: '',
//     },

//     languages: ['english', 'hindi'],
//     role: 'physiotherapist',
//     physioType: 'consultant',
//   },

//   {
//     id: 3,
//     fullName: 'Dr. Sneha Reddy',
//     contactNumber: '9988776655',
//     gender: 'female',
//     dateOfBirth: '1993-11-22',

//     qualification: 'BPT',
//     yearsOfExperience: 3,

//     services: ['home'],

//     specializations: ['sports'],
//     expertiseAreas: ['shoulder', 'back'],
//     treatmentTypes: ['exercise_therapy'],

//     availability: {
//       startDay: 'monday',
//       endDay: 'thursday',
//       startTime: '08:00',
//       endTime: '16:00',
//     },

//     bio: 'Sports physiotherapist with focus on recovery.',

//     documents: {
//       licenseCertificate: '',
//       degreeCertificate: '',
//       profilePhoto: '',
//     },

//     languages: ['english', 'telugu'],
//     role: 'physiotherapist',
//     physioType: 'therapist',
//   },

//   {
//     id: 4,
//     fullName: 'Dr. Arjun Kumar',
//     contactNumber: '9001122334',
//     gender: 'male',
//     dateOfBirth: '1988-07-05',

//     qualification: 'MPT',
//     yearsOfExperience: 7,

//     services: ['clinic', 'home'],

//     specializations: ['orthopedic'],
//     expertiseAreas: ['knee', 'back'],
//     treatmentTypes: ['manual_therapy', 'electrotherapy'],

//     availability: {
//       startDay: 'wednesday',
//       endDay: 'sunday',
//       startTime: '11:00',
//       endTime: '20:00',
//     },

//     bio: 'Senior physiotherapist with 7+ years experience.',

//     documents: {
//       licenseCertificate: '',
//       degreeCertificate: '',
//       profilePhoto: '',
//     },

//     languages: ['english', 'hindi'],
//     role: 'physiotherapist',
//     physioType: 'consultant',
//   },

//   {
//     id: 5,
//     fullName: 'Dr. Kavya Nair',
//     contactNumber: '9012345678',
//     gender: 'female',
//     dateOfBirth: '1996-02-18',

//     qualification: 'BPT',
//     yearsOfExperience: 1,

//     services: ['home'],

//     specializations: ['neurological'],
//     expertiseAreas: ['shoulder'],
//     treatmentTypes: ['exercise_therapy'],

//     availability: {
//       startDay: 'monday',
//       endDay: 'friday',
//       startTime: '09:30',
//       endTime: '17:30',
//     },

//     bio: 'Junior physiotherapist passionate about care.',

//     documents: {
//       licenseCertificate: '',
//       degreeCertificate: '',
//       profilePhoto: '',
//     },

//     languages: ['english'],
//     role: 'physiotherapist',
//     physioType: 'therapist',
//   },
// ]

const PhysioManagement = () => {
  const [physios, setPhysios] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPhysio, setSelectedPhysio] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
const [physioToDelete, setPhysioToDelete] = useState(null)

  const hospitalId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')

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
     <div className="d-flex justify-content-end mb-3">
  <CButton onClick={() => setModalVisible(true)}
     style={{
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}>
    Add Therapist
  </CButton>
</div>

      <CTable striped className='pink-table'>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Contact</CTableHeaderCell>
            <CTableHeaderCell>Qualification</CTableHeaderCell>
            <CTableHeaderCell>Experience</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {physios.map((p) => (
            <CTableRow key={p.id}>
              <CTableDataCell>{p.fullName}</CTableDataCell>
              <CTableDataCell>{p.contactNumber}</CTableDataCell>
              <CTableDataCell>{p.qualification}</CTableDataCell>
              <CTableDataCell>{p.yearsOfExperience}</CTableDataCell>

             <CTableDataCell>
  <div className="d-flex gap-2 align-items-center">

    {/* VIEW */}
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

    {/* EDIT */}
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

    {/* DELETE */}
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