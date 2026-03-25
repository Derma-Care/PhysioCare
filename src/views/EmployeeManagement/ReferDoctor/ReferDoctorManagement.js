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
import ReferDoctorForm from './ReferDoctorForm.js'

import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords.js'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext.js'
import ConfirmationModal from '../../../components/ConfirmationModal.js'
import LoadingIndicator from '../../../Utils/loader.js'
import {
  addReferDoctor, // same name
  deleteReferDoctor, // match exactly
  getAllReferDoctors, // match exactly
  updateReferDoctor, // match exactly
} from './ReferDoctorAPI.js'
import { toast, ToastContainer } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext.js'
import { showCustomToast } from '../../../Utils/Toaster.js'
import Pagination from '../../../Utils/Pagination.js'

const ReferDoctorManagement = () => {
  const [technicians, setTechnicians] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTech, setSelectedTech] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // ✅ Load from localStorage on mount
  const [modalData, setModalData] = useState(null) // store username & password
  const [modalTVisible, setModalTVisible] = useState(false)
  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      if (clinicID) {
        const res = await getAllReferDoctors(clinicID) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching lab technicians:', err)
      setTechnicians([])
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTechs()
  }, [])
  // ✅ Save (Add / Edit)

  const handleSave = async (formData) => {
    try {
      if (selectedTech) {
        await updateReferDoctor(selectedTech.id, formData)
        fetchTechs()

        // setTechnicians((prev) => [...prev, res.data.data])
        showCustomToast('ReferDoctor updated successfully!', 'success')
      } else {
        const res = await addReferDoctor(formData)
        await fetchTechs() // refresh from API
        console.log(res)
        // setModalData({
        //   username: res.data.data.userName,
        //   password: res.data.data.password,
        // })
        setModalVisible(false)
        // setModalTVisible(true)
        showCustomToast('ReferDoctor added successfully!', 'success')
      }
    } catch (err) {
      // showCustomToast('❌ Failed to save ReferDoctor.', 'error')
      console.error('API error:', err)
    }
  }

  // ✅ Delete
  const handleDelete = async (id) => {
    console.log(id)
    try {
      setDelLoading(true)
      await deleteReferDoctor(id) // ✅ call backend
      setTechnicians((prev) => prev.filter((t) => t.id !== id))
      showCustomToast('ReferDoctor deleted successfully!', 'success')
    } catch (err) {
      // showCustomToast('❌ Failed to delete ReferDoctor.', 'error')
      console.error('Delete error:', err)
    } finally {
      setIsModalVisible(false) // close modal after action
      setDelLoading(false)
    }
  }
  //permission
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  //search
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return technicians
    return technicians.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, technicians])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  //decode image
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
      <ToastContainer />
      {can('Refer Doctor', 'create') && (
        <div
          className="mb-3 w-100"
          style={{ display: 'flex', justifyContent: 'end', alignContent: 'end', alignItems: 'end' }}
        >
          <CButton
            style={{
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}
            onClick={() => setModalVisible(true)}
          >
            Add Refer Doctor
          </CButton>
        </div>
      )}
      {/* <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Technician Credentials</h5>
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
      </CModal> */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete ReferDoctor"
        message="Are you sure you want to delete this ReferDoctor? This action cannot be undone."
        confirmText="Yes, Delete"
        isLoading={delloading}
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)} // ✅ pass id here
        onCancel={() => setIsModalVisible(false)} // ✅ just close modal
      />
      {/* <CButton color="primary" onClick={() => setModalVisible(true)}>
  
      </CButton> */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading technician..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            height: '50vh', // full screen height

            color: 'var(--color-black)',
          }}
        >
          {error}
        </div>
      ) : (
        <CTable className="mt-3" striped hover responsive>
          <CTableHead>
            <CTableRow className="pink-table  w-auto">
              <CTableHeaderCell>#</CTableHeaderCell>
              {/* <CTableHeaderCell>Photo</CTableHeaderCell> */}
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Adress</CTableHeaderCell>
              <CTableHeaderCell>ClinicName</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((tech, index) => (
                <CTableRow key={tech.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>

                  <CTableDataCell>{capitalizeWords(tech.fullName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.mobileNumber)}</CTableDataCell>
                  <CTableDataCell>
                    {tech.address
                      ? `${tech.address.houseNo || ''}, ${tech.address.street || ''}, ${tech.address.landmark || ''}, ${tech.address.city || ''}, ${tech.address.state || ''}, ${tech.address.country || ''} - ${tech.address.postalCode || ''}`
                      : 'NA'}
                  </CTableDataCell>

                  <CTableDataCell>{tech.currentHospitalName}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Refer Doctor', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(tech)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Refer Doctor', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(tech)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Refer Doctor', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            console.log(tech.id)
                            setDeleteId(tech.id) // store id
                            setIsModalVisible(true) // show confirmation modal
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
                  colSpan="9"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No ReferDoctor found.
                </CTableDataCell>
              </CTableRow>
              //   <CTableRow>
              //     <CTableDataCell colSpan={5} className="text-center text-muted">
              //       🔍 No technician found matching "<b>{searchQuery}</b>"
              //     </CTableDataCell>
              //   </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
      {filteredData.length > 0 && (
        <div className="mb-3  mt-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(displayData.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        </div>
      )}
      <ReferDoctorForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedTech(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        technicians={technicians}
        fetchTechs={fetchTechs}
      />
    </div>
  )
}

export default ReferDoctorManagement
