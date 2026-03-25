import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CBadge ,CModalFooter 
} from '@coreui/react'
import { CustomerByClinicNdBranchId } from '../customerManagement/CustomerManagementAPI'
import { Eye,Edit2 ,Trash  } from 'lucide-react'
import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import Pagination from '../../Utils/Pagination'
import LoadingIndicator from '../../Utils/loader'
import { http } from '../../Utils/Interceptors'

const PatientManagement = () => {
  const [activeKey, setActiveKey] = useState(1)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState([]);
  const [appointmentInfo, setAppointmentInfo] = useState(null);

const [reportLoading, setReportLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);


  const [error, setError] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null);
const [showModal, setShowModal] = useState(false);
const [selectedHistory, setSelectedHistory] = useState(null)
const [viewModal, setViewModal] = useState(false)

  const [visible, setVisible] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [history, setHistory] = useState([]) 
  const [responseMessage, setResponseMessage] = useState('')
  const [appointmentTab, setAppointmentTab] = useState('active')
  const startIndex = (currentPage - 1) * pageSize;
const paginatedPatients = patients.slice(startIndex, startIndex + pageSize);

const totalPages = Math.ceil(patients.length / pageSize);

 const openBase64File = (base64Data, fileType, fileName) => {
  if (!base64Data) return;

  let blob;

  if (fileType === 'application/pdf') {
    // Decode PDF base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    blob = new Blob([byteArray], { type: fileType });
  } else {
    // Decode image base64
    blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: fileType });
  }

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};


  // 🔹 Fetch Patients List
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        setError(null)
        const hospitalId = localStorage.getItem('HospitalId')
        const branchId = localStorage.getItem('branchId')
        const data = await CustomerByClinicNdBranchId(hospitalId, branchId)
        setPatients(data || [])
      } catch (err) {
        console.error('Error fetching patients:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

 


  // 🔹 API call for Appointments
 const fetchAppointments = async (patientId) => {
  try {
    setLoading(true);
    const response = await http.get(`${BASE_URL}/bookings/byPatientId/${patientId}`);
    console.log('Full API response:', response.data);

    const data = response.data?.data || [];
    setAppointments(data);

    if (data.length > 0) {
      const firstAppointment = data[0]; // or sort based on date
      setSelectedAppointment(firstAppointment);
      setAppointmentInfo(firstAppointment);
      fetchReportByBookingId(firstAppointment.bookingId);
    } else {
      setSelectedAppointment(null);
      setAppointmentInfo(null);
      setReport([]); // clear previous reports if no appointments
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    setAppointments([]);
    setReport([]); // clear previous reports on error
  } finally {
    setLoading(false);
  }
};

//API call for reports and history
 const fetchVisitHistory = async (patientId) => {
  try {
  setLoading(true)

    const response = await http.get(`${BASE_URL}/visitHistory/${patientId}`)
    console.log('Visit History Response:', response.data)
    // setResponseMessage(response.data?.message || '')
    const data = response.data?.data.visitHistory
    if (Array.isArray(data)) setHistory(data)
    else if (data && typeof data === 'object') setHistory([data])
    else setHistory([])
  } catch (error) {
    console.error('Error fetching visit history:', error)
    // setResponseMessage('Error fetching visit history')
    setHistory([])
  } finally {
    setLoading(false)
  }
}
const fetchReportByBookingId = async (bookingId) => {
  try {
    setReportLoading(true);

    const response = await http.get(
      `${BASE_URL}/getReportByBookingId/${bookingId}`
    );

    console.log("Report By Booking ID:", response.data);

    // Extract the reportsList safely
      const reportList = response.data?.data?.flatMap(item => item.reportsList || []);

    setReport(reportList);
  } catch (err) {
    console.error("Error fetching report:", err);
    setReport([]);
  } finally {
    setReportLoading(false);
  }
};


 useEffect(() => {
    if (activeKey === 2 && selectedPatient?.patientId) {
      console.log('Fetching appointments for:', selectedPatient.patientId)
      fetchAppointments(selectedPatient.patientId)
    }
  }, [activeKey, selectedPatient])
  useEffect(() => {
  if (activeKey === 4 && selectedPatient?.patientId) {
    fetchVisitHistory(selectedPatient.patientId)
  }
}, [activeKey, selectedPatient])
useEffect(() => {
  if (activeKey === 3 && selectedAppointment?.bookingId) {
    fetchReportByBookingId(selectedAppointment.bookingId);
  }
}, [activeKey, selectedAppointment]);








  return (
    <div className="p-4">
      <CCard className="shadow-sm border-0">
        <CCardBody>
          {/* Tabs */}
          <CNav variant="tabs" role="tablist" style={{cursor: 'pointer'}}>
            <CNavItem>
              <CNavLink
                active={activeKey === 1}
                onClick={() => setActiveKey(1)}
                style={{ color: 'var(--color-black)' }}
              >
                Patient Info
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                active={activeKey === 2}
                onClick={() => selectedPatient && setActiveKey(2)}
                disabled={!selectedPatient}
                style={{ color: 'var(--color-black)' }}
              >
                Appointments
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                active={activeKey === 3}
                onClick={() => selectedPatient && setActiveKey(3)}
                disabled={!selectedPatient}
                style={{ color: 'var(--color-black)' }}
              >
                Reports
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                active={activeKey === 4}
                onClick={() => selectedPatient && setActiveKey(4)}
                disabled={!selectedPatient}
                style={{ color: 'var(--color-black)' }}
              >
                History
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="mt-3">
            {/* 🔹 Patient Info Tab */}
            <CTabPane role="tabpanel" visible={activeKey === 1}>
              {loading ? (
                <LoadingIndicator message='Patient management'/>
                // <div className="text-center py-3">
                //   <CSpinner color="primary" /> Loading...
                // </div>
              ) : error ? (
                <p className="text-danger">{error}</p>
              ) : (
                <CTable >
                  <CTableHead className="pink-table w-auto">
                    <CTableRow>
                      <CTableHeaderCell>S.No</CTableHeaderCell>
                      <CTableHeaderCell>Patient ID</CTableHeaderCell>
                      <CTableHeaderCell>Full Name</CTableHeaderCell>
                      <CTableHeaderCell>Age</CTableHeaderCell>
                      <CTableHeaderCell>Gender</CTableHeaderCell>
                      <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                      <CTableHeaderCell>City</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody className="pink-table">
                    {patients.length > 0 ? (
                     paginatedPatients.map((p, index) => (

                        <CTableRow key={p.patientId || index}>
                         <CTableDataCell>{startIndex + index + 1}</CTableDataCell>


                          {/* Patient ID as clickable link */}
                          <CTableDataCell>
                            <span
                              style={{
                                color: '#007bff',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                setSelectedPatient(p)
                                setActiveKey(2) // Navigate to appointments tab
                              }}
                            >
                              {p.patientId}
                            </span>
                          </CTableDataCell>

                          <CTableDataCell>{p.fullName || '-'}</CTableDataCell>
                          <CTableDataCell>{p.age || '-'}</CTableDataCell>
                          <CTableDataCell>{p.gender || '-'}</CTableDataCell>
                          <CTableDataCell>{p.mobileNumber || '-'}</CTableDataCell>
                          <CTableDataCell>{p.address?.city || '-'}</CTableDataCell>

                          <CTableDataCell className="text-end">
                          <div className="d-flex gap-2">
  {/* View Button */}
  <CButton
    color="info"
    size="sm"
    className="actionBtn"
    style={{ color: 'var(--color-black)' }}
    onClick={() => {
      setSelectedPatient(p)
      setVisible(true)
    }}
  >
    <Eye size={18} />
  </CButton>

  {/* Edit Button */}
  {/* <CButton
    color="info"
    size="sm"
     style={{ color: 'var(--color-black)' }}
    className="actionBtn"
    onClick={() => handleEdit(p)}
  >
    <Edit2 size={18} />
  </CButton> */}

  {/* Delete Button */}
  {/* <CButton
    color="info"
    size="sm"
    className="actionBtn"
     style={{ color: 'var(--color-black)' }}
    onClick={() => handleDelete(p.patientId)}
  >
    <Trash size={18} />
  </CButton> */}
</div>

                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center text-muted">
                          No patient records found.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
                
              )}
            </CTabPane>
          


           
       {/* 🔹 Appointments Tab */}
<CTabPane visible={activeKey === 2}>
  {loading ? (
    <div className="text-center py-4">
      <CSpinner color="primary" />
    </div>
  ) : appointments && appointments.length > 0 ? (
    <>
      <h5 className="mb-3">
        Appointments for {selectedPatient?.fullName} ({selectedPatient?.patientId})
      </h5>

      {/* 🔹 Sub-tabs for Active | Pending | Completed */}
      <CNav variant="tabs" role="tablist" className="mb-3" style={{cursor:'pointer'}} >
        <CNavItem>
          <CNavLink   style={{ color: 'var(--color-black)' }}
            active={appointmentTab === 'active'}
            onClick={() => setAppointmentTab('active')}
          >
            Active
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink   style={{ color: 'var(--color-black)' }}
            active={appointmentTab === 'pending'}
            onClick={() => setAppointmentTab('pending')}
          >
            Pending
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink   style={{ color: 'var(--color-black)' }}
            active={appointmentTab === 'completed'}
            onClick={() => setAppointmentTab('completed')}
          >
            Completed
          </CNavLink>
        </CNavItem>
      </CNav>

      {(() => {
        // 🧩 Filter based on sub-tab selection
        const filteredAppointments = appointments.filter((a) => {
          const status = a.status?.toLowerCase() || '';
          if (appointmentTab === 'active')
            return status === 'active' || status === 'in-progress';
          if (appointmentTab === 'pending') return status === 'pending';
          if (appointmentTab === 'completed') return status === 'completed';
          return true;
        });

        return filteredAppointments.length > 0 ? (
          <CTable >
            <CTableHead className="pink-table w-auto">
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Doctor</CTableHeaderCell>
                <CTableHeaderCell>Department</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Consultation Type</CTableHeaderCell>
                <CTableHeaderCell>Service</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody className="pink-table">
              {filteredAppointments.map((a, index) => (
                <CTableRow key={index}>
                 <CTableDataCell>{startIndex + index + 1}</CTableDataCell>

                  <CTableDataCell>{a.serviceDate || '-'}</CTableDataCell>
                  <CTableDataCell>{a.doctorName || '-'}</CTableDataCell>
                  <CTableDataCell>{a.branchname || '-'}</CTableDataCell>
                  <CTableDataCell>
                  <CBadge
  color="light"
  style={{
    color: 'var(--color-black)', // your text color
  }}
  className="fw-semibold text-uppercase"
>
  {a.status || '-'}
</CBadge>


                  </CTableDataCell>
                  <CTableDataCell>{a.consultationType || '-'}</CTableDataCell>
                  <CTableDataCell>{a.subServiceName || '-'}</CTableDataCell>

                  {/* 🔹 View Icon Button */}
                  <CTableDataCell className="text-end">
                   <CButton
                   color="info"
                              size="sm"
                              className="actionBtn"
                               style={{ color: 'var(--color-black)' }}
  onClick={() => {
  setSelectedAppointment(a);
  setAppointmentInfo(a); // <-- Add this
  setShowModal(true);
  fetchReportByBookingId(a.bookingId);
   setActiveKey(3); 
}}

>
     <Eye size={18} />
</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          <p className="text-center py-3">
            No {appointmentTab} appointments found for{' '}
            {selectedPatient?.fullName}.
          </p>
        );
      })()}
    </>
  ) : (
    <p className="text-center py-3">
      No appointments found for {selectedPatient?.fullName}.
    </p>
  )}
</CTabPane>



<CTabPane visible={activeKey === 4}>
  {loading ? (
    <div className="text-center py-4">
      <CSpinner color="primary" />
    </div>
  ) : history.length > 0 ? (
    <>
      <h5 className="mb-3" style={{ color: 'var(--color-black)' }}>
        Visit History for {selectedPatient?.fullName} ({selectedPatient?.patientId})
      </h5>

      <CTable >
        <CTableHead className="pink-table w-auto">
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Doctor</CTableHeaderCell>
            <CTableHeaderCell>Visit Type</CTableHeaderCell>
            <CTableHeaderCell>Diagnosis</CTableHeaderCell>
            <CTableHeaderCell>Treatment</CTableHeaderCell>
            <CTableHeaderCell>Follow-up Date</CTableHeaderCell>
            <CTableHeaderCell>Action</CTableHeaderCell> {/* 👈 Added column */}
          </CTableRow>
        </CTableHead>

        <CTableBody className="pink-table">
          {history.map((h, index) => (
            <CTableRow key={h.id || index}>
             <CTableDataCell>{startIndex + index + 1}</CTableDataCell>

              <CTableDataCell>
                {h.visitDateTime
                  ? new Date(h.visitDateTime).toLocaleDateString()
                  : '-'}
              </CTableDataCell>
              <CTableDataCell>{h.doctorName || '-'}</CTableDataCell>
              <CTableDataCell>{h.visitType || '-'}</CTableDataCell>
              <CTableDataCell>{h.symptoms?.diagnosis || '-'}</CTableDataCell>
              <CTableDataCell>
                {h.treatments?.generatedData
                  ? Object.keys(h.treatments.generatedData).join(', ')
                  : '-'}
              </CTableDataCell>
              <CTableDataCell>
                {h.followUp?.nextFollowUpDate || '-'}
              </CTableDataCell>

              {/* View Button */}
              <CTableDataCell className="text-center">
                 <CButton
                  color="info"
                  size="sm"
                  className="actionBtn"
                  style={{ color: 'var(--color-black)' }}
                  onClick={() => {
                    setSelectedHistory(h)
                    setViewModal(true)
                  }}
                >
                  <Eye size={18} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </>
  ) : (
    <p className="text-center py-3">
      {responseMessage ||
        `No visit history found for ${selectedPatient?.fullName}`}
    </p>
  )}
</CTabPane>
</CTabContent>
        </CCardBody>
      </CCard>

      {/* 🔹 Modal for Patient Details */}
    <CModal visible={visible} onClose={() => setVisible(false)} >
  <CModalHeader closeButton>
    <CModalTitle>Patient Details</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {selectedPatient ? (
      <div>
        <p><b>Patient ID:</b> {selectedPatient.patientId}</p>
        <p><b>Customer ID:</b> {selectedPatient.customerId}</p>
        <p><b>Full Name:</b> {selectedPatient.fullName}</p>
        <p><b>Gender:</b> {selectedPatient.gender}</p>
        <p><b>Age:</b> {selectedPatient.age}</p>
        <p><b>Date of Birth:</b> {selectedPatient.dateOfBirth}</p>
        <p><b>Mobile:</b> {selectedPatient.mobileNumber}</p>
        <p><b>Email:</b> {selectedPatient.email || 'N/A'}</p>
        <p><b>Branch ID:</b> {selectedPatient.branchId}</p>

        <hr />

        <h6 style={{ color: 'var(--color-black)', fontWeight: 'bold' }}>Address</h6>
        <p>
          {selectedPatient.address?.houseNo}, {selectedPatient.address?.street},
          {selectedPatient.address?.landmark && ` ${selectedPatient.address?.landmark},`}
          {selectedPatient.address?.city}
        </p>
        <p>
          {selectedPatient.address?.state}, {selectedPatient.address?.country} -{' '}
          {selectedPatient.address?.postalCode}
        </p>
      </div>
    ) : (
      <p className="text-muted">No patient details available</p>
    )}
  </CModalBody>
</CModal>

    <CModal visible={showModal} onClose={() => setViewModal(false)}>
  <CModalHeader>
    <h5>Booking Details</h5>
  </CModalHeader>
  <CModalBody>
    {selectedAppointment && (
      <div>
      
        <p><b>Booking ID:</b> {selectedAppointment.bookingId}</p>
        <p><b>Service:</b> {selectedAppointment.subServiceName}</p>
        <p><b>Date:</b> {selectedAppointment.serviceDate}</p>
        <p><b>Time:</b> {selectedAppointment.servicetime}</p>
        <p><b>Status:</b> {selectedAppointment.status}</p>
        <p><b>Consultation Type:</b> {selectedAppointment.consultationType}</p>
        <p><b>Consultation Fee:</b> ₹{selectedAppointment.consultationFee}</p>
        <p><b>Total Fee:</b> ₹{selectedAppointment.totalFee}</p>
        <p><b>Free Follow-Ups Left:</b> {selectedAppointment.freeFollowUpsLeft}</p>

        


      </div>
    )}
  </CModalBody>
  <CModalFooter>
    {/* <CButton color="secondary" onClick={() => setViewModal(false)}>
      Close
    </CButton> */}
  </CModalFooter>
</CModal>
<CModal visible={viewModal} onClose={() => setViewModal(false)}>
  <CModalHeader  style={{color: 'var(--color-black)',fontSize:'20px', fontWeight:'bold'}} >Visit Details</CModalHeader>
  <CModalBody>
    {/* --- Basic Info --- */}
     <h5 className='mb-3'>Basic Info </h5>
    <p><strong>Date:</strong> {selectedHistory?.visitDateTime ? new Date(selectedHistory.visitDateTime).toLocaleDateString() : '-'}</p>
    <p><strong>Doctor:</strong> {selectedHistory?.doctorName || '-'}</p>
    <p><strong>Clinic Name:</strong> {selectedHistory?.clinicName || '-'}</p>
    <p><strong>Booking ID:</strong> {selectedHistory?.bookingId || '-'}</p>

    <hr />

    {/* --- Symptoms Section --- */}
    <h5 className='mb-3'>Symptoms</h5>
    <p><strong>Details:</strong> {selectedHistory?.symptoms?.symptomDetails || '-'}</p>
    <p><strong>Doctor Observation:</strong> {selectedHistory?.symptoms?.doctorObs || '-'}</p>
    <p><strong>Diagnosis:</strong> {selectedHistory?.symptoms?.diagnosis || '-'}</p>
    <p><strong>Duration:</strong> {selectedHistory?.symptoms?.duration || '-'}</p>

    <hr />

    {/* --- Tests Section --- */}
    <h5 className='mb-3'>Tests</h5>
    {selectedHistory?.tests?.selectedTests?.length > 0 ? (
      <ul>
        {selectedHistory.tests.selectedTests.map((test, i) => (
          <li key={i} style={{color: 'var(--color-black)'}}>{test}</li>
        ))}
      </ul>
    ) : (
      <p>No tests found</p>
    )}

    <hr />

    {/* --- Treatment Section --- */}
    <h5 className='mb-3'>Treatments</h5>
    {selectedHistory?.treatments?.generatedData ? (
      Object.entries(selectedHistory.treatments.generatedData).map(([treatmentName, details], i) => (
        <div key={i}>
          <p><strong>Treatment:</strong> {treatmentName}</p>
          <p><strong>Frequency:</strong> {details.frequency || '-'}</p>
          <p><strong>Total Sittings:</strong> {details.totalSittings || '-'}</p>
          <p><strong>Pending Sittings:</strong> {details.pendingSittings || '-'}</p>
          <p><strong>Current Sitting:</strong> {details.currentSitting || '-'}</p>
          <p><strong>Completed Sittings:</strong> {details.takenSittings || '-'}</p>




          {details?.dates?.length > 0 && (
            <CTable bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{color: 'var(--color-black)'}} >Date</CTableHeaderCell>
                  <CTableHeaderCell style={{color: 'var(--color-black)'}}>Sitting</CTableHeaderCell>
                  <CTableHeaderCell style={{color: 'var(--color-black)'}}>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {details.dates.map((d, idx) => (
                  <CTableRow key={idx}>
                 <CTableDataCell style={{ color: 'var(--color-black)' }}>
  {d.date ? new Date(d.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : '-'}
</CTableDataCell>

                    <CTableDataCell  style={{color: 'var(--color-black)'}} >{d.sitting}</CTableDataCell>
                    <CTableDataCell  style={{color: 'var(--color-black)'}} >{d.status}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </div>
      ))
    ) : (
      <p>No treatments found</p>
    )}

    <hr />

    {/* --- Follow-up Section --- */}
    <h5 className='mb-3'>Follow-Up</h5>
    <p><strong>Next Follow-Up:</strong> {selectedHistory?.followUp?.nextFollowUpDate || '-'}</p>
    <p><strong>Duration:</strong> {selectedHistory?.followUp?.durationValue ? `${selectedHistory.followUp.durationValue} ${selectedHistory.followUp.durationUnit}` : '-'}</p>
    <p><strong>Note:</strong> {selectedHistory?.followUp?.followUpNote || '-'}</p>

    <hr />

    {/* --- Prescription Section --- */}
    <h5 className='mb-3'>Prescription</h5>
    {selectedHistory?.prescription?.medicines?.length > 0 ? (
      <CTable bordered>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell  style={{color: 'var(--color-black)'}} >Name</CTableHeaderCell>
            <CTableHeaderCell  style={{color: 'var(--color-black)'}} >Dose</CTableHeaderCell>
            <CTableHeaderCell  style={{color: 'var(--color-black)'}} >Duration</CTableHeaderCell>
            <CTableHeaderCell  style={{color: 'var(--color-black)'}} >Food</CTableHeaderCell>
            <CTableHeaderCell  style={{color: 'var(--color-black)'}} >Type</CTableHeaderCell>
            <CTableHeaderCell  style={{color: 'var(--color-black)'}} >Times</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {selectedHistory.prescription.medicines.map((m, i) => (
            <CTableRow key={i}>
              <CTableDataCell  style={{color: 'var(--color-black)'}} >{m.name}</CTableDataCell>
              <CTableDataCell  style={{color: 'var(--color-black)'}} >{m.dose}</CTableDataCell>
              <CTableDataCell  style={{color: 'var(--color-black)'}} >{m.duration} {m.durationUnit}</CTableDataCell>
              <CTableDataCell style={{color: 'var(--color-black)'}} >{m.food}</CTableDataCell>
              <CTableDataCell style={{color: 'var(--color-black)'}} >{m.medicineType}</CTableDataCell>
              <CTableDataCell style={{color: 'var(--color-black)'}} >{m.times?.join(', ')}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    ) : (
      <p>No prescription details found</p>
    )}

    {/* --- Prescription PDF --- */}
    {selectedHistory?.prescriptionPdf?.length > 0 && (
      <>
        <hr />
        <h6>Prescription PDF</h6>
        {/* <iframe
          title="Prescription PDF"
          src={`data:application/pdf;base64,${selectedHistory.prescriptionPdf[0]}`}
          width="100%"
          height="500px"
          style={{ border: '1px solid #ccc', borderRadius: '6px' }}
        /> */}
        <iframe
  title="Prescription PDF"
  src={`data:application/pdf;base64,${selectedHistory.prescriptionPdf[0]}#toolbar=0&navpanes=0&scrollbar=0`}
  width="100%"
  height="500px"
  style={{ border: '1px solid #ccc', borderRadius: '6px' }}
/>

      </>
    )}
  </CModalBody>
</CModal>
<br></br>

<CTabPane visible={activeKey === 3}>
  {reportLoading ? (
    <div className="text-center py-4">
      <CSpinner color="primary" />
    </div>
  ) : report.length > 0 ? (
    <>
      <h5 className="mb-6" style={{ color: 'var(--color-black)' }}>
          Reports for {selectedPatient?.fullName} ({selectedPatient?.patientId})
      </h5>

      <CTable >
        <CTableHead className="pink-table w-auto">
          <CTableRow style={{ color: 'var(--color-black)' }}>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Report Name</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Type</CTableHeaderCell>
            <CTableHeaderCell>Report File</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {report
            .filter((r) => r.patientId === selectedAppointment?.patientId) // Filter reports
            .map((r, i) => (
              <CTableRow key={i}>
                <CTableDataCell style={{ color: 'var(--color-black)' }}>{startIndex + i + 1}</CTableDataCell>
                <CTableDataCell style={{ color: 'var(--color-black)' }}>{r.reportName || '-'}</CTableDataCell>
                <CTableDataCell style={{ color: 'var(--color-black)' }}>
                  {r.reportDate ? new Date(r.reportDate).toLocaleDateString() : '-'}
                </CTableDataCell>
                <CTableDataCell style={{ color: 'var(--color-black)' }}>{r.reportStatus || '-'}</CTableDataCell>
                <CTableDataCell style={{ color: 'var(--color-black)' }}>{r.reportType || '-'}</CTableDataCell>
                <CTableDataCell>
                  {r.reportFile?.length > 0 ? (
                    r.reportFile.map((file, index) => {
                      let fileType = 'application/pdf';
                      if (file.startsWith('/9j/') || file.startsWith('iVBOR')) fileType = 'image/png';

                      const fileName = `${r.reportName}` ;

                      return (
                        <div key={index} style={{ marginBottom: '5px' }}>
                          <a
                            href="#"
                            style={{ color: '#007bff', textDecoration: 'underline', display: 'inline-block' }}
                            onClick={(e) => {
                              e.preventDefault();
                              openBase64File(
                                file,
                                fileType,
                                `${fileName}${fileType === 'application/pdf' ? '.pdf' : '.png'}`
                              );
                            }}
                          >
                            {fileName}
                          </a>
                        </div>
                      );
                    })
                  ) : (
                    <span>-</span>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
        </CTableBody>
      </CTable>
    </>
  ) : (
    <p className="text-center py-3">No reports available for {selectedPatient?.fullName}</p>
  )}
</CTabPane>
 <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  onPageChange={(page) => setCurrentPage(page)}
  onPageSizeChange={(size) => {
    setPageSize(size);
    setCurrentPage(1); // reset to page 1
  }}
/>











    </div>
  )
}

export default PatientManagement

