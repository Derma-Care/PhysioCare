import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CTable, CTableBody, CTableDataCell, CTableHead,
  CTableHeaderCell, CTableRow, CModal, CModalHeader,
  CModalBody, CModalTitle, CForm, CFormLabel,
  CFormInput, CModalFooter, CFormCheck,
} from '@coreui/react'
import {
  Delete_ReportById, Delete_ReportByIdIndex,
  Get_ReportsByBookingIdData, SaveReportsData,
} from './reportAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import { Download, Eye, Edit, Trash, Trash2, FileText, ArrowLeft, Upload, User, Stethoscope } from 'lucide-react'
import ConfirmationModal from '../../components/ConfirmationModal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import Pagination from '../../Utils/Pagination'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Select from 'react-select'
import { TestDataById } from '../TestsManagement/TestsManagementAPI'
import { BASE_URL } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

const ReportDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const appointmentInfo = location.state?.appointmentInfo
  const navigate = useNavigate()

  const [recommendedTests, setRecommendedTests] = useState([])
  const getISODate = (date) => date.toISOString().split('T')[0]
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const today = new Date()
  const todayISO = getISODate(today)

  const [report, setReport] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [deleteId, setDeleteId] = useState([])
  const [uploadModal, setUploadModal] = useState(false)
  const [delloading, SetDelloading] = useState(false)
  const [deleteModal, showDeleteModal] = useState(false)
  const [selectedReportFiles, setSelectedReportFiles] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [testNames, setTestNames] = useState([])

  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const hospitalId = localStorage.getItem('HospitalId')
        if (!hospitalId) return
        const response = await TestDataById(hospitalId)
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
        const response = await http.get(`${BASE_URL}/getReportByBookingId/${appointmentInfo.bookingId}`)
        const reportsArray = response.data?.data || []
        setRecommendedTests(reportsArray.flatMap((item) => item.reportsList || []))
      } catch (error) {
        console.error('Error fetching recommended tests:', error)
      }
    }
    fetchRecommendedTests()
  }, [appointmentInfo?.bookingId])

  const patientId =
    appointmentInfo?.patientId ||
    appointmentInfo?.item?.patientId ||
    appointmentInfo?.selectedAppointment?.patientId || ''

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const [newReport, setNewReport] = useState({
    customerId: appointmentInfo?.item.customerId,
    reportName: '',
    reportDate: '',
    reportStatus: 'Normal',
    reportType: '',
    reportFile: null,
    bookingId: appointmentInfo?.bookingId || '',
    patientId: appointmentInfo?.patientId || '',
    customerMobileNumber: appointmentInfo?.item.patientMobileNumber,
  })

  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href

  if (!appointmentInfo) {
    return (
      <div className="rd-empty-state">
        <FileText size={40} className="rd-empty-icon" />
        <h5>Appointment details not found!</h5>
        <button className="rd-btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    )
  }

  const getMimeType = (base64) => {
    if (!base64) return 'application/octet-stream'
    if (base64.startsWith('JVBER')) return 'application/pdf'
    if (base64.startsWith('/9j/')) return 'image/jpeg'
    if (base64.startsWith('iVBOR')) return 'image/png'
    return 'application/octet-stream'
  }

  const onDocumentLoadSuccess = ({ numPages }) => { setNumPages(numPages); setPageNumber(1) }

  const handleCloseModal = () => {
    setShowModal(false); setPreviewFileUrl(null)
    setIsPreviewPdf(false); setNumPages(null); setPageNumber(1)
  }

  const fetchReportDetails = async () => {
    try {
      const res = await Get_ReportsByBookingIdData(appointmentInfo.bookingId)
      const rawData = res
      if (Array.isArray(rawData)) {
        const allReports = rawData.flatMap((item) =>
          (item.reportsList || []).map((report) => ({ ...report, parentId: item.id }))
        )
        setReport(allReports)
      } else { setReport([]) }
    } catch (error) { setReport([]) }
  }

  useEffect(() => {
    if (appointmentInfo?.bookingId) fetchReportDetails()
  }, [appointmentInfo?.bookingId])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const pdfFiles = files.filter((file) => file.type === 'application/pdf')
    if (pdfFiles.length !== files.length) { alert('Only PDF files are allowed!'); e.target.value = ''; return }
    const readers = pdfFiles.map((file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    )
    Promise.all(readers).then((base64Files) => setNewReport((prev) => ({ ...prev, reportFile: base64Files }))).catch(console.error)
  }

  const handleUploadSubmit = async () => {
    if (!newReport.reportName || !newReport.reportDate || !newReport.reportStatus || !newReport.reportType || !newReport.reportFile) {
      showCustomToast('Please fill all required fields and upload a file.', 'error'); return
    }
    try {
      setLoading(true)
      const payload = {
        customerId: appointmentInfo?.item.customerId,
        reportsList: [{ ...newReport, patientId, reportFile: newReport.reportFile }],
      }
      const response = await SaveReportsData(payload)
      setUploadModal(false)
      showCustomToast('Report uploaded successfully!', 'success')
      fetchReportDetails()
      setNewReport({ reportName: '', reportDate: '', reportStatus: '', reportType: '', reportFile: null, bookingId: appointmentInfo?.bookingId || '' })
    } catch (err) { console.error('Error uploading report:', err) }
    finally { setLoading(false) }
  }

  const handleDeleteReport = async (reportId) => {
    try {
      SetDelloading(true)
      const res = await Delete_ReportById(reportId.parentId)
      if (res?.data?.success) {
        setReport((prev) => prev.filter((r) => r.id !== reportId.parentId))
        fetchReportDetails(); showDeleteModal(false); toast.success('Report deleted successfully')
      } else { toast.error('Failed to delete report') }
    } catch (error) { toast.error('Error deleting report') }
    finally { SetDelloading(false) }
  }

  const handleDeleteReportFile = async (id, bookingId, fileIndex) => {
    try {
      SetDelloading(true)
      await Delete_ReportByIdIndex(id, bookingId, fileIndex)
      showCustomToast(`File #${fileIndex + 1} deleted successfully.`, 'success')
      fetchReportDetails(); showDeleteModal(false); setShowModal(false); setDeleteTarget(null)
    } catch (error) { console.error('Error deleting report file:', error) }
    finally { SetDelloading(false) }
  }

  const handleDownloadAllFiles = async (reportItem) => {
    try {
      const zip = new JSZip()
      const files = Array.isArray(reportItem.reportFile) ? reportItem.reportFile : [reportItem.reportFile]
      if (!files || files.length === 0) { showCustomToast('No files to download.', 'info'); return }
      files.forEach((fileBase64, index) => {
        const mimeType = getMimeType(fileBase64)
        const extension = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1] || 'dat'
        zip.file(`${reportItem.reportName || 'report'}_${index + 1}.${extension}`, fileBase64, { base64: true })
      })
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${reportItem.reportName || 'report'}_all_files.zip`)
      showCustomToast('All files downloaded successfully.', 'success')
    } catch (error) { console.error('Error downloading all files:', error) }
  }

  return (
    <div style={{ padding: '16px' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* ── Page Header ── */}
      <div className="rd-page-header">
        <div className="rd-title-group">
          <div className="rd-page-icon"><FileText size={20} /></div>
          <div>
            <h4 className="rd-page-title">Report Details</h4>
            <p className="rd-page-sub">{appointmentInfo.name} · Booking #{appointmentInfo.bookingId}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="rd-btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={13} /> Back
          </button>
          {can('Reports Management', 'create') && (
            <button className="rd-btn-primary" onClick={() => setUploadModal(true)}>
              <Upload size={13} /> Upload Report
            </button>
          )}
        </div>
      </div>

      {/* ── Appointment Info Card ── */}
      <div className="rd-info-card" style={{ marginBottom: 16 }}>
        <div className="rd-info-card-header"><User size={14} className="rd-header-icon" /> Patient & Appointment Info</div>
        <div className="rd-info-card-body">
          <div className="rd-info-grid">
            <div className="rd-info-row"><span className="rd-info-label">Name</span><span className="rd-info-value">{appointmentInfo.name}</span></div>
            <div className="rd-info-row"><span className="rd-info-label">Age</span><span className="rd-info-value">{appointmentInfo.age}</span></div>
            <div className="rd-info-row"><span className="rd-info-label">Gender</span><span className="rd-info-value">{appointmentInfo.gender}</span></div>
            <div className="rd-info-row"><span className="rd-info-label">Problem</span><span className="rd-info-value">{appointmentInfo.problem || 'N/A'}</span></div>
            <div className="rd-info-row"><span className="rd-info-label">Doctor ID</span><span className="rd-info-value">{appointmentInfo.item?.doctorId || 'N/A'}</span></div>
            <div className="rd-info-row"><span className="rd-info-label">Hospital ID</span><span className="rd-info-value">{appointmentInfo.item?.clinicId || 'N/A'}</span></div>
          </div>

          {/* Recommended Tests */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #eef2f7' }}>
            <p className="rd-info-label" style={{ marginBottom: 8 }}>Recommended Tests</p>
            {recommendedTests.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {recommendedTests.map((test, index) => (
                  <span key={test.id || index} className="rd-badge">{test.reportName}</span>
                ))}
              </div>
            ) : (
              <p className="rd-muted">No recommended tests found.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      <ConfirmationModal
        isVisible={deleteModal}
        title={deleteTarget ? 'Delete Report File' : 'Delete Report'}
        message={deleteTarget
          ? `Are you sure you want to delete ${deleteTarget.fileName || 'this file'}? This action cannot be undone.`
          : `Are you sure you want to delete this ${deleteId.reportName}? This action cannot be undone.`}
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => {
          if (deleteTarget) handleDeleteReportFile(deleteTarget.id, deleteTarget.bookingId, deleteTarget.index)
          else handleDeleteReport(deleteId)
        }}
        onCancel={() => { showDeleteModal(false); setDeleteTarget(null) }}
      />

      {/* ── Reports Table ── */}
      <div className="rd-table-wrapper">
        <CTable className="rd-table">
          <CTableHead>
            <CTableRow>
              {['S.No', 'Booking ID', 'Report Name', 'Date', 'Status', 'Type', 'Actions'].map((h) => (
                <CTableHeaderCell key={h} className="rd-th">{h}</CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {Array.isArray(report) && report.length > 0 ? (
              report
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .map((reportItem, index) => {
                  const actualIndex = (currentPage - 1) * rowsPerPage + index
                  const base64File = Array.isArray(reportItem.reportFile) ? reportItem.reportFile[0] : reportItem.reportFile
                  const mimeType = getMimeType(base64File)
                  const isPdf = mimeType === 'application/pdf'
                  const fileUrl = `data:${mimeType};base64,${base64File}`

                  return (
                    <CTableRow key={index} className="rd-tr">
                      <CTableDataCell className="rd-td rd-td-num">{actualIndex + 1}</CTableDataCell>
                      <CTableDataCell className="rd-td rd-muted">{reportItem.bookingId}</CTableDataCell>
                      <CTableDataCell className="rd-td rd-name">{reportItem.reportName}</CTableDataCell>
                      <CTableDataCell className="rd-td rd-muted">{reportItem.reportDate}</CTableDataCell>
                      <CTableDataCell className="rd-td">
                        <span className={`rd-status-badge ${reportItem.reportStatus === 'Abnormal' ? 'rd-status-abnormal' : 'rd-status-normal'}`}>
                          {reportItem.reportStatus}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell className="rd-td rd-muted">{reportItem.reportType}</CTableDataCell>
                      <CTableDataCell className="rd-td">
                        {base64File ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {can('Reports Management', 'read') && (
                              <button className="rd-action-btn rd-view-btn" title="Preview"
                                onClick={() => {
                                  const filesArray = Array.isArray(reportItem.reportFile) ? reportItem.reportFile : [reportItem.reportFile]
                                  setSelectedReportFiles(filesArray)
                                  setSelectedReport(reportItem)
                                  setDeleteId(reportItem)
                                  setShowModal(true)
                                }}>
                                <Eye size={14} />
                              </button>
                            )}
                            <button className="rd-action-btn rd-download-btn" title="Download All" onClick={() => handleDownloadAllFiles(reportItem)}>
                              <Download size={14} />
                            </button>
                            <button className="rd-action-btn rd-edit-btn" title="Edit" disabled>
                              <Edit size={14} />
                            </button>
                            <button className="rd-action-btn rd-delete-btn" title="Delete"
                              onClick={() => { showDeleteModal(true); setDeleteId(reportItem) }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="rd-muted">No File</span>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={7}>
                  <div className="rd-empty">
                    <FileText size={36} className="rd-empty-icon" />
                    <p>No reports found.</p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>

      {report.length > 0 && (
        <div className="mb-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(report.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        </div>
      )}

      {/* ── Preview Modal ── */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} alignment="center" size="xl" scrollable>
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c' }}>Preview Report</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0, background: '#f8fafc' }}>
          {Array.isArray(selectedReportFiles) && selectedReportFiles.length > 0 ? (
            <Swiper modules={[Navigation]} navigation spaceBetween={20} slidesPerView={1} style={{ height: '90vh' }}>
              {selectedReportFiles.map((file, i) => {
                const mimeType = getMimeType(file)
                const isPdf = mimeType === 'application/pdf'
                const fileUrl = `data:${mimeType};base64,${file}`
                return (
                  <SwiperSlide key={i}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '12px 16px' }}>
                      <a href={fileUrl} download={`report_${i + 1}.${isPdf ? 'pdf' : 'jpg'}`} className="rd-btn-secondary" style={{ textDecoration: 'none' }}>
                        <Download size={14} /> Download
                      </a>
                      <button className="rd-btn-danger" onClick={() => {
                        setDeleteTarget({ id: deleteId.parentId, bookingId: selectedReport?.bookingId, index: i, fileName: `Report File #${i + 1}` })
                        showDeleteModal(true)
                      }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                      {isPdf ? (
                        <iframe src={fileUrl} width="100%" height="100%" title={`PDF ${i + 1}`} style={{ border: 'none', borderRadius: 8 }} />
                      ) : (
                        <img src={fileUrl} alt={`Report ${i + 1}`} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }} />
                      )}
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          ) : (
            <div className="rd-empty" style={{ padding: '40px 0' }}>
              <FileText size={36} className="rd-empty-icon" />
              <p>No files available for preview.</p>
            </div>
          )}
        </CModalBody>
      </CModal>

      {/* ── Upload Report Modal ── */}
      <CModal visible={uploadModal} onClose={() => setUploadModal(false)} backdrop="static" alignment="center">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} color="#185fa5" /> Upload Report
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: '20px' }}>
          <CForm>
            {/* Report Status */}
            <div className="rd-upload-field">
              <label className="rd-upload-label">Report Status</label>
              <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                <CFormCheck type="radio" name="reportStatus" id="reportNormal" label="Normal" value="Normal"
                  checked={newReport.reportStatus === 'Normal'}
                  onChange={(e) => setNewReport({ ...newReport, reportStatus: e.target.value })} />
                <CFormCheck type="radio" name="reportStatus" id="reportAbnormal" label="Abnormal" value="Abnormal"
                  checked={newReport.reportStatus === 'Abnormal'}
                  onChange={(e) => setNewReport({ ...newReport, reportStatus: e.target.value })} />
              </div>
            </div>

            <div className="rd-upload-field">
              <label className="rd-upload-label">File No</label>
              <input className="rd-upload-input rd-input-disabled" value={patientId} disabled />
            </div>

            <div className="rd-upload-field">
              <label className="rd-upload-label">Report Name <span className="rd-required">*</span></label>
              <Select
                options={testNames.map((test) => ({ value: test.testName, label: test.testName }))}
                value={newReport.reportName ? { value: newReport.reportName, label: newReport.reportName } : null}
                onChange={(selectedOption) => setNewReport({ ...newReport, reportName: selectedOption?.value || '' })}
                placeholder="Select or search report name..."
                isSearchable
                styles={{
                  control: (base) => ({ ...base, fontSize: 12.5, borderColor: '#d0dce9', borderRadius: 7, minHeight: 36 }),
                  option: (base) => ({ ...base, fontSize: 12.5 }),
                }}
              />
            </div>

            <div className="rd-upload-field">
              <label className="rd-upload-label">Report Date <span className="rd-required">*</span></label>
              <input className="rd-upload-input" type="date" value={newReport.reportDate} min={todayISO}
                onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })} />
            </div>

            <div className="rd-upload-field">
              <label className="rd-upload-label">Report Type <span className="rd-required">*</span></label>
              <input className="rd-upload-input" value={newReport.reportType}
                onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })} />
            </div>

            <div className="rd-upload-field">
              <label className="rd-upload-label">Upload File (PDF only) <span className="rd-required">*</span></label>
              <input className="rd-upload-input" type="file" multiple accept="application/pdf" onChange={handleFileChange} />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter style={{ borderTop: '0.5px solid #d0dce9', padding: '12px 20px', gap: 8 }}>
          <button className="rd-btn-secondary" onClick={() => setUploadModal(false)}>Cancel</button>
          <button className="rd-btn-primary" onClick={handleUploadSubmit} disabled={loading}>
            {loading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" />Uploading...</>) : (<><Upload size={13} /> Upload</>)}
          </button>
        </CModalFooter>
      </CModal>

      {/* ── STYLES ── */}
      <style>{`
        /* Page Header */
        .rd-page-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 16px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .rd-title-group { display: flex; align-items: center; gap: 12px; }
        .rd-page-icon {
          width: 42px; height: 42px; border-radius: 10px;
          background: #e6f1fb; display: flex; align-items: center;
          justify-content: center; color: #185fa5; flex-shrink: 0;
        }
        .rd-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .rd-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        /* Info card */
        .rd-info-card { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; }
        .rd-info-card-header {
          display: flex; align-items: center; gap: 8px;
          background: #185fa5; color: #fff; font-size: 12px; font-weight: 600; padding: 9px 14px;
        }
        .rd-header-icon { color: #b5d4f4; }
        .rd-info-card-body { padding: 14px; background: #fff; }
        .rd-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .rd-info-row  { display: flex; flex-direction: column; gap: 2px; }
        .rd-info-label { font-size: 10.5px; font-weight: 600; color: #185fa5; text-transform: uppercase; letter-spacing: 0.3px; }
        .rd-info-value { font-size: 13px; color: #374151; font-weight: 500; }
        .rd-badge {
          display: inline-block; background: #e6f1fb; color: #185fa5;
          font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
        }
        .rd-muted { color: #6b7280; font-size: 12px; }

        /* Table */
        .rd-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 12px;
        }
        .rd-table { margin-bottom: 0 !important; font-size: 13px; }
        .rd-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap; border: none !important;
        }
        .rd-tr { transition: background 0.12s; }
        .rd-tr:hover { background: #f0f5fb !important; }
        .rd-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .rd-td-num { color: #9ca3af; font-size: 12px; }
        .rd-name    { font-weight: 600; color: #0c447c; }

        /* Status badges */
        .rd-status-badge {
          display: inline-block; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
        }
        .rd-status-normal   { background: #eaf3de; color: #3b6d11; }
        .rd-status-abnormal { background: #fcebeb; color: #a32d2d; }

        /* Action buttons */
        .rd-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border: none; border-radius: 7px;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .rd-action-btn:hover  { filter: brightness(0.88); transform: scale(1.07); }
        .rd-action-btn:active { transform: scale(0.95); }
        .rd-action-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .rd-view-btn     { background: #e6f1fb; color: #185fa5; }
        .rd-download-btn { background: #eaf3de; color: #3b6d11; }
        .rd-edit-btn     { background: #f5f5f5; color: #9ca3af; }
        .rd-delete-btn   { background: #fcebeb; color: #a32d2d; }

        /* Empty state */
        .rd-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .rd-empty-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 80px 0; color: #9ca3af;
        }
        .rd-empty-icon { color: #d0dce9; }

        /* Buttons */
        .rd-btn-primary {
          display: inline-flex; align-items: center; gap: 5px;
          background: #185fa5; color: #fff; border: none;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s; text-decoration: none;
        }
        .rd-btn-primary:hover { filter: brightness(0.9); }
        .rd-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

        .rd-btn-secondary {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: background 0.15s; text-decoration: none;
        }
        .rd-btn-secondary:hover { background: #f3f4f6; }

        .rd-btn-danger {
          display: inline-flex; align-items: center; gap: 5px;
          background: #a32d2d; color: #fff; border: none;
          border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s;
        }
        .rd-btn-danger:hover { filter: brightness(0.9); }

        /* Upload modal fields */
        .rd-upload-field { margin-bottom: 14px; }
        .rd-upload-label { font-size: 11px; font-weight: 600; color: #374151; display: block; margin-bottom: 4px; }
        .rd-required { color: #e24b4a; }
        .rd-upload-input {
          width: 100%; padding: 7px 10px; font-size: 12.5px; color: #374151;
          background: #fff; border: 0.5px solid #d0dce9; border-radius: 7px;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rd-upload-input:focus { border-color: #185fa5; box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12); }
        .rd-input-disabled { background: #f0f5fb !important; color: #9ca3af !important; cursor: not-allowed; }

        @media (max-width: 640px) {
          .rd-info-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 420px) {
          .rd-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default ReportDetails