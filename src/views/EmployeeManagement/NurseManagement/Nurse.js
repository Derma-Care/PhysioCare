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
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import NurseForm from './NurseForm'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addNurse, deleteNurse, getAllNurses, updateNurse } from './NurseAPI'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const NurseManagement = () => {
  const [nurses, setNurses] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [modalTVisible, setModalTVisible] = useState(false)

  const { searchQuery } = useGlobalSearch()
  const { user } = useHospital()
  const hospitalId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')

  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ---------------- Fetch Nurses ----------------
  const fetchNurses = async () => {
    setLoading(true)
    try {
      if (hospitalId) {
        const res = await getAllNurses(hospitalId, branchId)
        setNurses(res.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching nurses:', err)
      setNurses([])
      setError('Failed to fetch nurses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNurses()
  }, [])

  // const cleanPayload = (data) => {
  //   const payload = { ...data }

  //   // Remove empty strings in top-level fields
  //   Object.keys(payload).forEach((key) => {
  //     if (
  //       payload[key] === '' ||
  //       payload[key] === null ||
  //       (Array.isArray(payload[key]) && payload[key].length === 0)
  //     ) {
  //       delete payload[key]
  //     }
  //   })

  //   // Nested objects (address, bankAccountDetails)
  //   if (payload.address) {
  //     Object.keys(payload.address).forEach((key) => {
  //       if (!payload.address[key]) delete payload.address[key]
  //     })
  //     if (Object.keys(payload.address).length === 0) delete payload.address
  //   }

  //   if (payload.bankAccountDetails) {
  //     Object.keys(payload.bankAccountDetails).forEach((key) => {
  //       if (!payload.bankAccountDetails[key]) delete payload.bankAccountDetails[key]
  //     })
  //     if (Object.keys(payload.bankAccountDetails).length === 0) delete payload.bankAccountDetails
  //   }

  //   return payload
  // }

  // ---------------- Save Nurse (Add / Edit) ----------------
 const handleSave = async (formData) => {
    try {
      let res
      if (selectedNurse) {
        res = await updateNurse(hospitalId, selectedNurse.nurseId, formData)
        showCustomToast('Nurse updated successfully!', 'success')
        await fetchNurses()
        setModalVisible(false)
      } else {
        // Add new nurse
        const res = await addNurse({ ...formData, hospitalId: hospitalId })
        if (res.status === 201 || (res.status === 200 && res.data?.success)) {
          await fetchNurses()

          if (!selectedNurse) {
            setModalData({
              username: res.data.data.userName,
              password: res.data.data.password,
            })
            setModalTVisible(true)
          }
        }
        showCustomToast('Nurse added successfully!', 'success')

       
        setSelectedNurse(null)
        setViewMode(false)
        setModalVisible(false)
        return res
      }
      return res
    } catch (err) {
      console.error('API error:', err)
      // showCustomToast('❌ Failed to save nurse.', 'error')
    }
  }

  // ---------------- Delete Nurse ----------------
  const handleDelete = async (nurseId) => {
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      setDelLoading(true)
      await deleteNurse(hospitalId, nurseId)
      setNurses((prev) => prev.filter((n) => n.nurseId !== nurseId))
      showCustomToast('Nurse deleted successfully!', 'success')
    } catch (err) {
      console.error('Delete error:', err)
      // showCustomToast('Failed to delete nurse.', 'error')
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
      setDeleteId(null)
    }
  }

  // ---------------- Filter & Search ----------------
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return nurses
    return nurses.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, nurses])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const decodeImage = (data) => {
    try {
      // decode base64 string into normal string
      return atob(data)
    } catch {
      return null
    }
  }
  return (
    <div>
      {/* Add Nurse Button */}
      {can('Nurses', 'create') && (
        <div className="mb-3 d-flex justify-content-end">
          <CButton
            style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
            onClick={() => setModalVisible(true)}
          >
            Add Nurse
          </CButton>
        </div>
      )}

      {/* Credentials Modal */}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Nurse Credentials</h5>
        </CModalHeader>
        <CModalBody>
          {modalData ? (
            <div>
              <p>
                <strong>Username:</strong> {modalData.username}
              </p>
              <p>
                <strong>Password:</strong> {modalData.password}
              </p>
              <small className="text-danger">
                ⚠️ Please save these credentials securely. They will not be shown again.
              </small>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            onClick={() => {
              setModalTVisible(false)
              setModalData(null)
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Nurse"
        message="Are you sure you want to delete this nurse? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* Loading / Error / Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading nurses..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '50vh' }}
        >
          {error}
        </div>
      ) : (
        <CTable className="mt-3" striped hover responsive>
          <CTableHead>
            <CTableRow className="pink-table">
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Photo</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Sex</CTableHeaderCell>
              <CTableHeaderCell>Qualification</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody style={{ color: 'var(--color-black)' }}>
            {displayData.length > 0 ? (
              displayData.map((nurse, index) => (
                <CTableRow key={nurse.nurseId} style={{ color: 'var(--color-black)' }}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {nurse.profilePicture ? (
                      <img
                        src={nurse.profilePicture} // ✅ decode first
                        alt={nurse.fullName}
                        width="40"
                        height="40"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/images/default-avatar.png"
                        alt="No profile"
                        width="40"
                        height="40"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                    )}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {capitalizeWords(nurse.fullName)}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {capitalizeWords(nurse.nurseContactNumber)}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {capitalizeWords(nurse.gender)}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {nurse.qualifications || 'NA'}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {nurse.dateOfJoining}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {can('Nurses', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedNurse(nurse)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Nurses', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedNurse(nurse)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Nurses', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(nurse.nurseId)
                            setIsModalVisible(true)
                          }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell
                  colSpan="8"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No nurse found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}

      {/* Pagination */}
      {displayData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
        // <div className="d-flex justify-content-end mt-3" style={{ marginRight: '40px' }}>
        //   {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, index) => (
        //     <CButton
        //       key={index}
        //       style={{
        //         backgroundColor: currentPage === index + 1 ? 'var(--color-black)' : '#fff',
        //         color: currentPage === index + 1 ? '#fff' : 'var(--color-black)',
        //         border: '1px solid #ccc',
        //         borderRadius: '5px',
        //         cursor: 'pointer',
        //       }}
        //       className="ms-2"
        //       onClick={() => setCurrentPage(index + 1)}
        //     >
        //       {index + 1}
        //     </CButton>
        //   ))}
        // </div>
      )}

      {/* Nurse Form Modal */}
      <NurseForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedNurse(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedNurse}
        nurses={nurses}
        fetchNurses={fetchNurses}
        viewMode={viewMode}
      />
    </div>
  )
}

export default NurseManagement
