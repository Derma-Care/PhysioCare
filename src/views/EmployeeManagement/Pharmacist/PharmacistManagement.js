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
import PharmacistForm from './PharmacistForm '
import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
// import {
//   addPharmacist,
//   deletePharmacist,
//   getAllPharmacists,
//   updatePharmacist,
// } from './PharmacistAPI'
import {
  addPharmacist,
  DeletePharmacistById,
  UpdatePharmacistById,
  getPharmacistsById,
} from './PharmacistAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showCustomToast } from '../../../Utils/Toaster'
import Pagination from '../../../Utils/Pagination'

const PharmacistManagement = () => {
  const [pharmacist, setPharmacist] = useState([])
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
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false)
  const [credentials, setCredentials] = useState(null)

  const fetchTechs = async () => {
    setLoading(true)
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      if (hospitalId) {
        const res = await getPharmacistsById(hospitalId, branchId)
        const list = res.data?.data || res.data || []
        setPharmacist(list)
      }
    } catch (err) {
      console.error('❌ Error fetching pharmacists:', err)
      setPharmacist([])
      setError('Failed to fetch pharmacists.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechs()
  }, [])

  // Save (Add / Edit)
  // A hypothetical example of how the data might be structured in your form
  // const formData = {
  //   ...
  //   permissions: {
  //     Pharmacist: {
  //       create: true,
  //       read: true,
  //       update: false,
  //       delete: false
  //     },
  //     viewPatients: false // <-- This is the root of the problem
  //   }
  // }

  const handleSave = async (formData) => {
    try {
      const correctedFormData = {
        ...formData,
        permissions: {
          Pharmacist: Object.entries(formData.permissions.Pharmacist || {})
            .filter(([key, value]) => value)
            .map(([key]) => key),
          viewPatients: formData.permissions.viewPatients ? ['read'] : [],
        },
      }
      let res
      if (selectedTech) {
        res = await UpdatePharmacistById(selectedTech.pharmacistId, formData)
        fetchTechs()
        showCustomToast('Pharmacist updated successfully!', 'success')
        setModalVisible(false)
      } else {
        res = await addPharmacist(formData)
        if (res.status === 201 || (res.status === 200 && res.data?.success)) {
          setCredentials({
            username: res.data.data.userName,
            password: res.data.data.password,
          })
          setCredentialsModalVisible(true)
          setModalTVisible(true)
          showCustomToast('Pharmacist added successfully!', 'success')
          setModalVisible(false)
        }
      }
    } catch (err) {
      console.error('API error:', err)
      // showCustomToast(err.response?.data?.message || '❌ Failed to save pharmacist.', 'error')
    }
  }

  // Delete pharmacist
  const handleDelete = async (pharmacistId) => {
    try {
      setDelLoading(true)
      await DeletePharmacistById(pharmacistId)
      setPharmacist((prev) => prev.filter((p) => p.pharmacistId !== pharmacistId))
      showCustomToast('Pharmacist deleted successfully!', 'success')
    } catch (err) {
      console.error('Delete error:', err)
      // showCustomToast('❌ Failed to delete pharmacist.', 'error')
    } finally {
      setIsModalVisible(false)
      setDelLoading(false)
    }
  }
  //permission
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  //search
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return pharmacist
    return pharmacist.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, pharmacist])

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
      {can('Pharmacist', 'create') && (
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
            Add Pharmacist
          </CButton>
        </div>
      )}
      <CModal visible={credentialsModalVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Pharmacist Credentials</h5>
        </CModalHeader>
        <CModalBody>
          {credentials ? (
            <div>
              {/* <p>
                <strong>Name:</strong> {credentials.pharmacistName || 'New Pharmacist'}
              </p> */}
              <p>
                <strong>Username:</strong> {credentials.username}
              </p>
              <p>
                <strong>Password:</strong> {credentials.password}
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
              setCredentialsModalVisible(false)
              setCredentials(null) // clear after closing
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Pharmacist"
        message="Are you sure you want to delete this pharmacist? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)} // ✅ Use deleteId from state
        onCancel={() => setIsModalVisible(false)}
      />

      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading pharmacists..." />
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
              <CTableHeaderCell>Photo</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Sex</CTableHeaderCell>
              <CTableHeaderCell>Qualification</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length ? (
              displayData.map((pharma, index) => (
                <CTableRow key={pharma.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {pharma.profilePicture ? (
                      <img
                        src={pharma.profilePicture} // ✅ use base64 directly
                        alt={pharma.fullName}
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

                  <CTableDataCell>{capitalizeWords(pharma.fullName)}</CTableDataCell>
                  <CTableDataCell>{pharma.contactNumber || 'NA'}</CTableDataCell>
                  <CTableDataCell>{pharma.gender || 'NA'}</CTableDataCell>
                  <CTableDataCell>{pharma.qualification || 'NA'}</CTableDataCell>
                  <CTableDataCell>{pharma.dateOfJoining || 'NA'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {can('Pharmacist', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(pharma)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Pharmacist', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(pharma)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Pharmacist', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(pharma.pharmacistId)
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
                  colSpan="9"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No pharmacist found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
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
      <PharmacistForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedTech(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        pharmacistList={pharmacist}
        pharmacist={pharmacist}
        fetchTechs={fetchTechs}
      />
    </div>
  )
}

export default PharmacistManagement
