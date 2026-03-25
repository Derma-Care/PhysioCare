import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CModalFooter,
  CFormCheck,
} from '@coreui/react'
import {
  Delete_ReportById,
  Delete_ReportByIdIndex,
  Get_ReportsByBookingIdData,
  SaveReportsData,
} from './reportAPI' // Assuming reportAPI.js is in the same directory
import { FaEye, FaDownload } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import { Delete, Download, Edit, Eye, Trash, Trash2 } from 'lucide-react'
import ConfirmationModal from '../../components/ConfirmationModal'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import Pagination from '../../Utils/Pagination'
// import 'swiper/css/pagination'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Select from 'react-select'
import { TestDataById } from '../TestsManagement/TestsManagementAPI'
import { BASE_URL } from '../../baseUrl'
const ReportDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const appointmentInfo = location.state?.appointmentInfo

  const navigate = useNavigate()
  const [recommendedTests, setRecommendedTests] = useState([])

  // Helper function to format date as YYYY-MM-DD
  const getISODate = (date) => date.toISOString().split('T')[0]
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  // Calculate today's date for minimum date restriction in the form
  const today = new Date()
  const todayISO = getISODate(today)

  const [report, setReport] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // State for previewing both images and PDFs
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)

  // State specific for PDF viewing
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [deleteId, setDeleteId] = useState([])
  const [uploadModal, setUploadModal] = useState(false)
  const [delloading, SetDelloading] = useState(false)
  const [deleteModal, showDeleteModal] = useState(false)
  const [selectedReportFiles, setSelectedReportFiles] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [testNames, setTestNames] = useState([]) // store API data

  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const hospitalId = localStorage.getItem('HospitalId') // assuming hospitalId stored locally
        if (!hospitalId) {
          console.error('Hospital ID missing!')
          return
        }

        const response = await TestDataById(hospitalId)
        console.log('Fetched test data:', response)

        // Assuming response.data contains an array of test objects with "testName" property
        setTestNames(response.data || [])
      } catch (error) {
        console.error('Error loading test names:', error)
      }
    }

    fetchTestNames()
  }, [])

 
   useEffect(() => {
  const fetchRecommendedTests = async () => {
    try {
      if (!appointmentInfo?.bookingId) return

      const response = await http.get(
        `${BASE_URL}/getReportByBookingId/${appointmentInfo.bookingId}`
      )

      console.log("Recommended Tests API =>", response.data)

      const reportsArray = response.data?.data || []

      // flatten all reportsList items
      const extracted =
        reportsArray.flatMap(item => item.reportsList || [])

      setRecommendedTests(extracted)
    } catch (error) {
      console.error("Error fetching recommended tests:", error)
    }
  }

  fetchRecommendedTests()
}, [appointmentInfo?.bookingId])


  const patientId =
    appointmentInfo?.patientId ||
    appointmentInfo?.item?.patientId ||
    appointmentInfo?.selectedAppointment?.patientId ||
    ''

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  console.log(appointmentInfo)
  // Initial state for new report, with reportDate not prefilled
  const [newReport, setNewReport] = useState({
    customerId: appointmentInfo?.item.customerId,
    reportName: '',
    reportDate: '', // No prefill for date
    reportStatus: 'Normal',
    reportType: '',
    reportFile: null,
    bookingId: appointmentInfo?.bookingId || '', // Ensure bookingId is safe to access
    patientId: appointmentInfo?.patientId || '',
    customerMobileNumber: appointmentInfo?.item.patientMobileNumber,
  })
  console.info(appointmentInfo?.item.patientMobileNumber)

  // ✅ This correctly sets the PDF worker for Vite
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).href

  // const base64File = Array.isArray(reportItem.reportFile)
  //   ? reportItem.reportFile[0]
  //   : reportItem.reportFile

  // Display error and go back if appointmentInfo is missing
  if (!appointmentInfo) {
    return (
      <div className="text-center mt-4">
        <h5 className="text-danger">Appointment details not found!</h5>
        <CButton color="primary" onClick={() => navigate(-1)} className="mt-2">
          Go Back
        </CButton>
      </div>
    )
  }

  // Determine MIME type for base64 data for display/download purposes
  const getMimeType = (base64) => {
    if (!base64) return 'application/octet-stream'
    if (base64.startsWith('JVBER')) return 'application/pdf' // PDF magic number
    if (base64.startsWith('/9j/')) return 'image/jpeg' // JPEG magic number
    if (base64.startsWith('iVBOR')) return 'image/png' // PNG magic number
    return 'application/octet-stream'
  }

  // Callback for react-pdf when a document loads successfully
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1) // Reset to page 1 when a new PDF is loaded
  }

  // Handle modal close logic, resetting PDF view state
  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewFileUrl(null)
    setIsPreviewPdf(false)
    setNumPages(null)
    setPageNumber(1)
  }

  // Function to fetch report details from the API
  const fetchReportDetails = async () => {
    try {
      const res = await Get_ReportsByBookingIdData(appointmentInfo.bookingId)
      const rawData = res

      if (Array.isArray(rawData)) {
        const allReports = rawData.flatMap((item) =>
          (item.reportsList || []).map((report) => ({
            ...report,
            parentId: item.id, // 👈 attach parent ID
          })),
        )
        setReport(allReports)
      } else {
        console.warn('Unexpected response format for reports:', rawData)
        setReport([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReport([])
    }
  }
  const handlePreview = (base64File) => {
    if (!base64File) return
    const mimeType = getMimeType(base64File)
    const isPdfFile = mimeType === 'application/pdf'
    const fileUrl = `data:${mimeType};base64,${base64File}`

    setIsPreviewPdf(isPdfFile)
    setPreviewFileUrl(fileUrl)
    setShowModal(true)
  }

  // Effect hook to fetch reports when appointmentInfo.bookingId changes
  useEffect(() => {
    if (appointmentInfo?.bookingId) {
      fetchReportDetails()
    }
  }, [appointmentInfo?.bookingId])

  // Handle file input change and convert to Base64
 const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return

  // validate only pdf
  const pdfFiles = files.filter(file => file.type === "application/pdf")

  if (pdfFiles.length !== files.length) {
    alert("Only PDF files are allowed!")
    e.target.value = "" // reset input
    return
  }

  const readers = pdfFiles.map(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result.split(",")[1]
          resolve(base64String)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
  )

  Promise.all(readers)
    .then((base64Files) => {
      setNewReport((prev) => ({
        ...prev,
        reportFile: base64Files,
      }))
    })
    .catch((error) => {
      console.error("Error reading files:", error)
    })
}

  // Handle report upload submission
  const handleUploadSubmit = async () => {
    // Validate all required fields
    if (
      !newReport.reportName ||
      !newReport.reportDate ||
      !newReport.reportStatus ||
      !newReport.reportType ||
      !newReport.reportFile
    ) {
      showCustomToast('Please fill all required fields and upload a file.', 'error')
      return
    }

    try {
      setLoading(true)
      const payload = {
        customerId: appointmentInfo?.item.customerId,
        reportsList: [
          {
            ...newReport,
            patientId: patientId,

            reportFile: newReport.reportFile, // API expects an array of base64 strings
          },
        ],
      }

      // const payload = {
      //   customerId: newReport.customerId,  // Moved outside reportsList
      //   reportsList: [
      //     {
      //       bookingId: newReport.bookingId,
      //       patientId: newReport.patientId,
      //       reportName: newReport.reportName,
      //       reportDate: newReport.reportDate,
      //       reportStatus: newReport.reportStatus,
      //       reportType: newReport.reportType,
      //       reportFile: [newReport.reportFile], // API expects array
      //     },
      //   ],
      // };

      const response = await SaveReportsData(payload)
      console.log('Report uploaded:', response)

      setUploadModal(false) // Close the upload modal
      showCustomToast('Report uploaded successfully!', 'success')
      fetchReportDetails() // Refresh the report list

      // Reset the form state after successful upload (clears fields)
      setNewReport({
        reportName: '',
        reportDate: '',
        reportStatus: '',
        reportType: '',
        reportFile: null,
        bookingId: appointmentInfo?.bookingId || '',
      })
    } catch (err) {
      console.error('Error uploading report:', err)
      // showCustomToast('Upload failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId) => {
    console.log(reportId.parentId)
    try {
      SetDelloading(true)
      const res = await Delete_ReportById(reportId.parentId)
      if (res?.data?.success) {
        setReport((prev) => prev.filter((r) => r.id !== reportId.parentId))
        fetchReportDetails()
        showDeleteModal(false)
        toast.success('Report deleted successfully')
      } else {
        toast.error('Failed to delete report')
      }
    } catch (error) {
      toast.error('Error deleting report')
    } finally {
      SetDelloading(false)
    }
  }

  const handleDeleteReportFile = async (id, bookingId, fileIndex) => {
    try {
      SetDelloading(true)
      console.log(`🗑️ Deleting file index: ${fileIndex}, reportId: ${id}, bookingId: ${bookingId}`)

      await Delete_ReportByIdIndex(id, bookingId, fileIndex)
      showCustomToast(`File #${fileIndex + 1} deleted successfully.`, 'success')

      fetchReportDetails()
      showDeleteModal(false)
      setShowModal(false)
      setDeleteTarget(null)
    } catch (error) {
      console.error('Error deleting report file:', error)
      // showCustomToast('Failed to delete file.', 'error')
    } finally {
      SetDelloading(false)
    }
  }

  const handleDownloadAllFiles = async (reportItem) => {
    try {
      const zip = new JSZip()
      const files = Array.isArray(reportItem.reportFile)
        ? reportItem.reportFile
        : [reportItem.reportFile]

      if (!files || files.length === 0) {
        showCustomToast('No files to download.', 'info')
        return
      }

      files.forEach((fileBase64, index) => {
        const mimeType = getMimeType(fileBase64)
        const isPdf = mimeType === 'application/pdf'
        const extension = isPdf ? 'pdf' : mimeType.split('/')[1] || 'dat'
        const fileName = `${reportItem.reportName || 'report'}_${index + 1}.${extension}`

        // Convert Base64 to binary and add to ZIP
        zip.file(fileName, fileBase64, { base64: true })
      })

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${reportItem.reportName || 'report'}_all_files.zip`)
      showCustomToast('All files downloaded successfully.', 'success')
    } catch (error) {
      console.error('Error downloading all files:', error)
      // showCustomToast('Failed to download all files.', 'error')
    }
  }

  return (
    <div className="container  ">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Appointment Info Section */}
      <div className="container p-3 bg-light  rounded shadow-sm mb-4">
        <div className="row">
          <div className="col-md-6 border-end">
            <p>
              <strong>Name:</strong> {appointmentInfo.name}
            </p>
            <p>
              <strong>Age:</strong> {appointmentInfo.age}
            </p>
            <p>
              <strong>Gender:</strong> {appointmentInfo.gender}
            </p>
             <p>
           <strong>Problem:</strong> {appointmentInfo.problem || 'N/A'}</p>
          </div>
          <div className="col-md-6 ps-md-4">
            <p>
              <strong>Doctor ID:</strong> {appointmentInfo.item?.doctorId || 'N/A'}
            </p>
            <p>
              <strong>Hospital ID:</strong> {appointmentInfo.item?.clinicId || 'N/A'}
            </p>
            
              <p>
                <strong>Recommended Test:</strong>
              </p>
        {recommendedTests.length > 0 ? (
  <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
    {recommendedTests.map((test, index) => (
      <li key={test.id || index}>
        {test.reportName}
      </li>
    ))}
  </ul>
) : (
  <p>No recommended tests found.</p>
)}


            
          </div>
          
        </div>
      </div>
      
      {/* Header and Upload Button */}
      <div
        className=" text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{ backgroundColor: 'var(--color-bgcolor)' }}
      >
        <h5 className="mb-0">Report Details</h5>
        <div className="d-flex gap-2">
          <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </CButton>
          {can('Reports', 'create') && (
            <CButton
              color="success"
              size="sm"
              onClick={() => setUploadModal(true)}
              style={{ backgroundColor: 'var(--color-black)', color: 'white', border: 'none' }}
            >
              Upload Report
            </CButton>
          )}
        </div>
      </div>
      <ConfirmationModal
        isVisible={deleteModal}
        title={deleteTarget ? `Delete Report File` : `Delete Report`}
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.fileName || 'this file'}? This action cannot be undone.`
            : `Are you sure you want to delete this ${deleteId.reportName}? This action cannot be undone.`
        }
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteReportFile(deleteTarget.id, deleteTarget.bookingId, deleteTarget.index)
          } else {
            handleDeleteReport(deleteId)
          }
        }}
        onCancel={() => {
          showDeleteModal(false)
          setDeleteTarget(null)
        }}
      />

      {/* Reports Table */}
      <div className="mt-4">
        <CTable bordered responsive>
          <CTableHead color="light" className="pink-table">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Booking ID</CTableHeaderCell>
              <CTableHeaderCell>Report Name</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {Array.isArray(report) && report.length > 0 ? (
              report
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .map((reportItem, index) => {
                  const actualIndex = (currentPage - 1) * rowsPerPage + index
                  // Ensure we get the Base64 string correctly (assuming it might be wrapped in an array)
                  const base64File = Array.isArray(reportItem.reportFile)
                    ? reportItem.reportFile[0]
                    : reportItem.reportFile

                  const mimeType = getMimeType(base64File)
                  const isPdf = mimeType === 'application/pdf'
                  const fileExt = isPdf
                    ? 'pdf'
                    : mimeType.includes('image/')
                      ? mimeType.split('/')[1]
                      : 'dat'
                  const fileUrl = `data:${mimeType};base64,${base64File}`

                  return (
                    <CTableRow key={index} className="pink-table">
                      <CTableDataCell>{actualIndex + 1}</CTableDataCell>
                      <CTableDataCell>{reportItem.bookingId}</CTableDataCell>
                      <CTableDataCell>{reportItem.reportName}</CTableDataCell>
                      <CTableDataCell>{reportItem.reportDate}</CTableDataCell>
                      <CTableDataCell>{reportItem.reportStatus}</CTableDataCell>
                      <CTableDataCell>{reportItem.reportType}</CTableDataCell>

                      {/* Actions: Preview + Download */}
                      <CTableDataCell className="d-flex justify-content-end">
                        {base64File ? (
                          <div className="d-flex gap-2">
                            {/* 👁️ Preview Button */}
                            {/* {can('Reports', 'read') && ( */}
                            <CButton
                              className="border-0"
                              style={{
                                backgroundColor: 'var(--color-bgcolor)',
                                color: 'var(--color-black)',
                              }}
                              size="sm"
                              onClick={() => {
                                const filesArray = Array.isArray(reportItem.reportFile)
                                  ? reportItem.reportFile
                                  : [reportItem.reportFile]
                                setSelectedReportFiles(filesArray)
                                setSelectedReport(reportItem)
                                setDeleteId(reportItem)
                                setShowModal(true)
                              }}
                            >
                              <Eye size={20} />
                            </CButton>

                            {/* )} */}
                            {/* ⬇️ Download Button */}
                            <CButton
                              className="btn btn-sm"
                              style={{
                                backgroundColor: 'var(--color-bgcolor)',
                                color: 'var(--color-black)',
                              }}
                              title="Download All"
                              onClick={() => handleDownloadAllFiles(reportItem)}
                            >
                              <Download size={20} />
                            </CButton>

                            <CButton
                              className="  border-0"
                              size="sm"
                              disabled={true}
                              style={{
                                backgroundColor: 'var(--color-bgcolor)',
                                color: 'var(--color-black)',
                              }}
                              onClick={() => {
                                // Set state for modal preview
                                setIsPreviewPdf(isPdf)
                                setPreviewFileUrl(fileUrl)
                                setShowModal(true)
                              }}
                            >
                              <Edit size={20} />
                            </CButton>
                            <CButton
                              className="  border-0"
                              // disabled={true}
                              style={{
                                backgroundColor: 'var(--color-bgcolor)',
                                color: 'var(--color-black)',
                              }}
                              onClick={() => {
                                // Set state for modal preview
                                // setIsPreviewPdf(isPdf)
                                // setPreviewFileUrl(fileUrl)
                                showDeleteModal(true)
                                setDeleteId(reportItem)
                              }}
                            >
                              <Trash size={20} />
                            </CButton>
                          </div>
                        ) : (
                          'No File'
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
            ) : (
              <CTableRow>
                <CTableDataCell
                  colSpan="7"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No Reports Found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>
      <div className="mb-3">
        {report.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(report.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        )}
      </div>

      {/* Image/PDF Preview Modal */}
      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        alignment="center"
        size="xl"
        scrollable
      >
        <CModalHeader className=" text-white">
          <CModalTitle>Preview Report</CModalTitle>
        </CModalHeader>

        <CModalBody className=" text-white text-center custom-modal" backdrop="static">
          {Array.isArray(selectedReportFiles) && selectedReportFiles.length > 0 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              // pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              style={{ height: '90vh' }} // 🔹 Total height
            >
              {selectedReportFiles.map((file, i) => {
                const mimeType = getMimeType(file)
                const isPdf = mimeType === 'application/pdf'
                const fileUrl = `data:${mimeType};base64,${file}`

                return (
                  <SwiperSlide key={i}>
                    <div className="d-flex justify-content-center gap-3 mt-3  ">
                      <a
                        href={fileUrl}
                        download={`report_${i + 1}.${isPdf ? 'pdf' : 'jpg'}`}
                        className="btn btn-light"
                        style={{
                          minWidth: '130px',
                          fontWeight: 500,
                          borderRadius: '8px',
                        }}
                      >
                        <Download size={18} className="me-1" /> Download
                      </a>

                      <CButton
                        color="danger"
                        className="text-white"
                        style={{
                          minWidth: '130px',
                          fontWeight: 500,
                          borderRadius: '8px',
                        }}
                        onClick={() => {
                          setDeleteTarget({
                            id: deleteId.parentId,
                            bookingId: selectedReport?.bookingId,
                            index: i,
                            fileName: `Report File #${i + 1}`, // optional — just for message
                          })
                          showDeleteModal(true)
                        }}
                      >
                        <Trash2 size={18} className="me-1" /> Delete
                      </CButton>
                    </div>
                    <div
                      className="d-flex flex-column align-items-center justify-content-center"
                      style={{
                        height: '90vh',
                        overflow: 'hidden',
                      }}
                    >
                      {isPdf ? (
                        <iframe
                          src={fileUrl}
                          width="100%"
                          height="800vh" // 🔹 Show PDF tall
                          title={`PDF ${i + 1}`}
                          style={{
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                          }}
                        />
                      ) : (
                        <img
                          src={fileUrl}
                          alt={`Report ${i + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '85vh',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                          }}
                        />
                      )}

                      {/* 🔹 Action Buttons (below file) */}
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          ) : (
            <p className="mt-4">No files available for preview.</p>
          )}
        </CModalBody>
      </CModal>

      {/* Upload Report Modal */}
      <CModal
        visible={uploadModal}
        onClose={() => setUploadModal(false)}
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle>Upload Report</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-2">
              {/* <CFormLabel>Report Status</CFormLabel> */}
              <div className="d-flex gap-3">
                <div className="d-flex gap-3">
                  <CFormCheck
                    type="radio"
                    name="reportStatus"
                    id="reportNormal"
                    label="Normal"
                    value="Normal"
                    checked={newReport.reportStatus === 'Normal'}
                    onChange={(e) => setNewReport({ ...newReport, reportStatus: e.target.value })}
                    style={{
                      accentColor: 'var(--color-black)', // ✅ custom checked color using CSS variable
                    }}
                  />
                  <CFormCheck
                    type="radio"
                    name="reportStatus"
                    id="reportAbnormal"
                    label="Abnormal"
                    value="Abnormal"
                    checked={newReport.reportStatus === 'Abnormal'}
                    onChange={(e) => setNewReport({ ...newReport, reportStatus: e.target.value })}
                    style={{
                      accentColor: 'var(--color-black)', // ✅ same color for consistency
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <CFormLabel>File No
                <span style={{ color: 'red' }}>*</span>
              </CFormLabel>
              <CFormInput
                value={patientId}
                onChange={(e) => setNewReport({ ...newReport, patientId: e.target.value })}
                disabled
              />
            </div>
           <div className="mb-2">
              <CFormLabel>Report Name (File Name)<span style={{ color: 'red' }}>*</span>

              </CFormLabel>
              <Select
                options={testNames.map((test) => ({
                  value: test.testName,
                  label: test.testName,
                }))}
                value={
                  newReport.reportName
                    ? { value: newReport.reportName, label: newReport.reportName }
                    : null
                }
                onChange={(selectedOption) =>
                  setNewReport({ ...newReport, reportName: selectedOption?.value || '' })
                }
                placeholder="Select or search report name..."
                isSearchable
              />
            </div>

            <div className="mb-2">
              <CFormLabel>Report Date
                <span style={{ color: 'red' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="date"
                value={newReport.reportDate}
                onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
                // Ensures only today or future dates can be selected
                min={todayISO}
              />
            </div>

            <div className="mb-2">
              <CFormLabel>Report Type
                <span style={{ color: 'red' }}>*</span>
              </CFormLabel>
              <CFormInput
                value={newReport.reportType}
                onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Upload File (PDF)
                <span style={{ color: 'red' }}>*</span>
              </CFormLabel>
              <CFormInput
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setUploadModal(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleUploadSubmit}
            style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2  "
                  role="status"
                  style={{ color: 'var(--color-black)' }}
                />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ReportDetails
