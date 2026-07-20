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
import LabTechnicianForm from './LabTechnicianForm'
import { Edit2, Eye, Trash2, FlaskConical, Search, X } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import {
  addLabTechnician,
  deleteLabTechnician,
  getAllLabTechnicians,
  updateLabTechnician,
} from './LabTechnicianAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const LabTechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTech, setSelectedTech] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [pageSize, setPageSize] = useState(5)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // ✅ Load from sessionStorage on mount
  const [modalData, setModalData] = useState(null) // store username & password
  const [modalTVisible, setModalTVisible] = useState(false)
  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = sessionStorage.getItem('HospitalId')
      const branchID = sessionStorage.getItem('branchId')
      if (clinicID) {
        const res = await getAllLabTechnicians(clinicID, branchID) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching Laboratorys:', err)
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

  // const handleSave = async (formData) => {
  //   try {
  //     if (selectedTech) {
  //       await updateLabTechnician(selectedTech.id, formData)
  //       fetchTechs()

  //       // setTechnicians((prev) => [...prev, res.data.data])
  //       toast.success('Technician updated successfully!')
  //     } else {
  //       const res = await addLabTechnician(formData)
  //       await fetchTechs() // refresh from API
  //       console.log(res)
  //       setModalData({
  //         username: res.data.data.userName,
  //         password: res.data.data.password,
  //       })
  //       if (res.status == 200) {
  //         setModalVisible(false)
  //         setModalTVisible(true)
  //         toast.success('Technician added successfully!')
  //       }
  //     }
  //   } catch (err) {
  //     toast.error('❌ Failed to save technician.')
  //     console.error('API error:', err)
  //   }
  // }

  const handleSave = async (formData) => {
    try {
      let res

      if (selectedTech) {
        // ✅ Update Technician
        res = await updateLabTechnician(selectedTech.id, formData)
        showCustomToast('Technician updated successfully!', 'success')
        await fetchTechs()
        setModalVisible(false)
      } else {
        // ✅ Add Technician
        res = await addLabTechnician(formData)
      }

      // ✅ Handle Success (backend must explicitly return success)
      if (res.status === 201 || (res.status === 200 && res.data?.success)) {
        await fetchTechs()

        // ✅ If new technician, show credentials modal
        if (!selectedTech) {
          setModalData({
            username: res.data.data?.userName,
            password: res.data.data?.password,
          })
          setModalTVisible(true)
        }
        showCustomToast('Technician added successfully!', 'success')
        // showToast(res.data?.message || 'Technician saved successfully!')

        setModalVisible(false)
        return res
      }

      // ❌ Backend responded but with an error (e.g. status 409)
      // showCustomToast(res.data?.message || 'Failed to save technician.')
      return res
    } catch (err) {
      // ❌ API or network failure
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error || '❌ Failed to save technician.'
      // showToast(backendMessage)
      console.error('API error:', err)
    }
  }

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
      setDelLoading(true)
      await deleteLabTechnician(id) // ✅ call backend
      setTechnicians((prev) => prev.filter((t) => t.id !== id))
      showCustomToast('Technician deleted successfully!', 'success')
    } catch (err) {
      // showCustomToast('❌ Failed to delete technician.', 'error')
      console.error('Delete error:', err)
    } finally {
      setIsModalVisible(false) // close modal after action
    }
    setDelLoading(false)
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

  //   const paginatedNotifications = sentNotifications.slice(
  //   (currentPage - 1) * pageSize,
  //   currentPage * pageSize,
  // )
  //decode image
  const decodeImage = (data) => {
    try {
      // First decode the outer layer (the backend double-encoded it)
      const decoded = atob(data)

      // Now decoded string itself already includes 'data:image/jpeg;base64,...'
      return decoded
    } catch (e) {
      console.error('Error decoding image:', e)
      return '/assets/images/avatars/Laboratory.png'
    }
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="lt-page-header">
        <div className="lt-title-group">
          <div className="lt-page-icon">
            <FlaskConical size={20} />
          </div>
          <div>
            <h4 className="lt-page-title">Lab Technician Management</h4>
            <p className="lt-page-sub">
              {technicians.length} technician{technicians.length !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        <div className="cm-search-wrapper">
          <Search size={14} className="cm-search-icon-left" />
          <input
            type="text"
            placeholder="Search lab technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cm-search-input"
          />
          {searchQuery && (
            <button className="cm-search-clear" type="button" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {can('Lab Technician', 'create') && (
          <button className="lt-add-btn" onClick={() => setModalVisible(true)}>
            + Add Lab Technician
          </button>
        )}
      </div>
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
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
      </CModal>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Technician"
        message="Are you sure you want to delete this technician? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
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
              <CTableHeaderCell>Photo</CTableHeaderCell> {/* 👈 New Column */}
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Sex</CTableHeaderCell>
              <CTableHeaderCell>Specialization</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((tech, index) => (
                <CTableRow key={tech.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {tech.profilePicture ? (
                      <img
                        src={tech.profilePicture} // ✅ use directly, no decodeImage()
                        alt={tech.fullName}
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

                  <CTableDataCell>{capitalizeWords(tech.fullName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.contactNumber)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.gender)}</CTableDataCell>
                  <CTableDataCell>{tech.specialization || 'NA'}</CTableDataCell>

                  <CTableDataCell>{tech.dateOfJoining}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Lab Technician', 'read') && (
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
                      {can('Lab Technician', 'update') && (
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
                      {can('Lab Technician', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
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
                  No Lab Technician found.
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
      {displayData.length > 0 && (
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

        // <Pagination
        //   currentPage={currentPage}
        //   totalPages={Math.ceil(displayData.length / pageSize)}
        //   pageSize={pageSize}
        //   onPageChange={setCurrentPage}
        //   onPageSizeChange={setRowsPerPage}
        // />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / rowsPerPage)}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}
      <LabTechnicianForm
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
      
      {/* ── STYLES ── */}
      <style>{`
        .lt-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .lt-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lt-page-icon {
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
        .lt-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .lt-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }
        .lt-add-btn {
          background: #185fa5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.15s;
          white-space: nowrap;
        }
        .lt-add-btn:hover { filter: brightness(0.9); }
      `}</style>
    </div>
  )
}

export default LabTechnicianManagement
