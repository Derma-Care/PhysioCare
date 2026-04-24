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
  CButton, CRow, CCol,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CBadge, CModalFooter
} from '@coreui/react'
import { CustomerByClinicNdBranchId } from '../customerManagement/CustomerManagementAPI'
import { Eye, Edit2, Trash } from 'lucide-react'
import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import Pagination from '../../Utils/Pagination'
import LoadingIndicator from '../../Utils/loader'
import { http } from '../../Utils/Interceptors'
import { useLocation } from 'react-router-dom'

const PatientManagement = () => {
  const location = useLocation();
  const patientInfo = location.state?.patientInfo;
  console.log(patientInfo);
  const [activeKey, setActiveKey] = useState(1)
  // const [loading, setLoading] = useState(false)
  // const [report, setReport] = useState([]);
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  const [reportLoading, setReportLoading] = useState(false);

  const [visible, setVisible] = useState(false);

  const [error, setError] = useState(null)

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null)

  const [showModal, setShowModal] = useState(false);


  const [responseMessage, setResponseMessage] = useState('')
  const [appointmentTab, setAppointmentTab] = useState('active')


  const [selectedPatient, setSelectedPatient] = useState(patientInfo || null);

  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
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


  // // 🔹 Fetch Patients List
  // useEffect(() => {
  //   const fetchPatients = async () => {
  //     try {
  //       setLoading(true)
  //       setError(null)
  //       const hospitalId = localStorage.getItem('HospitalId')
  //       const branchId = localStorage.getItem('branchId')
  //       const data = await CustomerByClinicNdBranchId(hospitalId, branchId)
  //       setPatients(data || [])
  //     } catch (err) {
  //       console.error('Error fetching patients:', err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   fetchPatients()
  // }, [])




  // 🔹 API call for Appointments
  const fetchAppointments = async (patientId) => {
    try {
      setLoading(true);
      const response = await http.get(`${BASE_URL}/bookings/byPatientId//${patientId}`);
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
 const fetchVisitHistory = async () => {
  const patientId = selectedAppointment?.patientId;
  const bookingId = selectedAppointment?.bookingId;

  if (!patientId || !bookingId) {
    console.warn("Skip API → missing patientId/bookingId", { patientId, bookingId });
    return;
  }

  try {
    const res = await axios.get(
      `${wifiUrl}/api/physiotherapy-doctor/visitHistoryByUsingPatientIdAndBooking/${patientId}/${bookingId}`
    );

    console.log("Visit history:", res.data);
  } catch (err) {
    console.error("Error fetching visit history:", err);
  }
};
  const fetchReportByBookingId = async (bookingId) => {
    try {
      setReportLoading(true);

      const response = await http.get(
        `${BASE_URL}/reports/patientId/${bookingId}`
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
  // useEffect(() => {
  //   if (selectedPatient?.patientId) {
  //     fetchAppointments(selectedPatient.patientId);
  //     fetchVisitHistory(selectedPatient.patientId);
  //   }
  // }, [selectedPatient]);


  useEffect(() => {
    if (activeKey === 2 && selectedPatient?.patientId) {
      console.log('Fetching appointments for:', selectedPatient.patientId)
      fetchAppointments(selectedPatient.patientId)
    }
  }, [activeKey, selectedPatient])
  
  useEffect(() => {
  if (activeKey === 3) {
    const bookingId = selectedAppointment?.bookingId;

    console.log("Reports Trigger:", bookingId);

    if (bookingId) {
      fetchReportByBookingId(bookingId);
    } else {
      console.warn("❌ No bookingId for reports");
    }
  }
}, [activeKey, selectedAppointment]);
  useEffect(() => {
  if (
    activeKey === 4 &&
    selectedAppointment?.bookingId &&
    selectedAppointment?.patientId
  ) {
    fetchVisitHistory();
  }
}, [activeKey, selectedAppointment]);



  useEffect(() => {
    if (selectedPatient?.patientId) {
      fetchAppointments(selectedPatient.patientId);
      fetchVisitHistory(selectedPatient.patientId);
    }
  }, [selectedPatient]);




  return (
    <div className="p-4">
      <CCard className="shadow-sm border-0">
        <CCardBody>
          {/* Tabs */}
          <CNav variant="tabs" className="mb-3">
            <CNavItem>
              <CNavLink
                active={activeKey === 1}
                onClick={() => setActiveKey(1)}
                style={{ cursor: "pointer" }}
              >
                Patient Info
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                active={activeKey === 2}
                onClick={() => setActiveKey(2)}
                style={{ cursor: "pointer" }}
              >
                Appointments
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                active={activeKey === 3}
                onClick={() => setActiveKey(3)}
                style={{ cursor: "pointer" }}
              >
                Reports
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink
                active={activeKey === 4}
                onClick={() => setActiveKey(4)}
                style={{ cursor: "pointer" }}
              >
                History
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="mt-3">
            {/* 🔹 Patient Info Tab */}
            <CTabPane visible={activeKey === 1}>
              {selectedPatient && (
                <CRow className="g-3">
                  <CCol md={6}><strong>Customer ID:</strong> {selectedPatient.customerId}</CCol>
                  <CCol md={6}><strong>Patient ID:</strong> {selectedPatient.patientId}</CCol>
                  <CCol md={6}><strong>Full Name:</strong> {selectedPatient.fullName}</CCol>
                  <CCol md={6}><strong>Gender:</strong> {selectedPatient.gender}</CCol>
                  <CCol md={6}><strong>Age:</strong> {selectedPatient.age}</CCol>
                  <CCol md={6}><strong>DOB:</strong> {selectedPatient.dateOfBirth}</CCol>
                  <CCol md={6}><strong>Mobile:</strong> {selectedPatient.mobileNumber}</CCol>
                  <CCol md={6}><strong>Email:</strong> {selectedPatient.email || 'N/A'}</CCol>
                  <CCol md={12}>
                    <strong>Address:</strong>{" "}
                    {selectedPatient.address?.houseNo},{" "}
                    {selectedPatient.address?.street},{" "}
                    {selectedPatient.address?.city},{" "}
                    {selectedPatient.address?.state},{" "}
                    {selectedPatient.address?.postalCode}
                  </CCol>
                </CRow>
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
                    Appointments for {selectedPatient?.fullName} ({selectedPatient?.customerId})
                  </h5>

                  {/* 🔹 Sub-tabs for Active | Pending | Completed */}
                  <CNav variant="tabs" role="tablist" className="mb-3" style={{ cursor: 'pointer' }} >
                    <CNavItem>
                      <CNavLink style={{ color: 'var(--color-black)' }}
                        active={appointmentTab === 'active'}
                        onClick={() => setAppointmentTab('active')}
                      >
                        Active
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink style={{ color: 'var(--color-black)' }}
                        active={appointmentTab === 'pending'}
                        onClick={() => setAppointmentTab('pending')}
                      >
                        Pending
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink style={{ color: 'var(--color-black)' }}
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
                              <CTableDataCell>{index + 1}</CTableDataCell>

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

  if (a?.bookingId) {
    fetchReportByBookingId(a.bookingId); // ✅ direct call
  } else {
    console.log("❌ bookingId missing");
  }

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
                          <CTableDataCell>{index + 1}</CTableDataCell>

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
          {patientInfo ? (
            <div>
              <p><b>Patient ID:</b> {patientInfo.patientId}</p>
              <p><b>Customer ID:</b> {patientInfo.customerId}</p>
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
        <CModalHeader style={{ color: 'var(--color-black)', fontSize: '20px', fontWeight: 'bold' }} >Visit Details</CModalHeader>
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
                <li key={i} style={{ color: 'var(--color-black)' }}>{test}</li>
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
                        <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Date</CTableHeaderCell>
                        <CTableHeaderCell style={{ color: 'var(--color-black)' }}>Sitting</CTableHeaderCell>
                        <CTableHeaderCell style={{ color: 'var(--color-black)' }}>Status</CTableHeaderCell>
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

                          <CTableDataCell style={{ color: 'var(--color-black)' }} >{d.sitting}</CTableDataCell>
                          <CTableDataCell style={{ color: 'var(--color-black)' }} >{d.status}</CTableDataCell>
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
                  <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Dose</CTableHeaderCell>
                  <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Duration</CTableHeaderCell>
                  <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Food</CTableHeaderCell>
                  <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Type</CTableHeaderCell>
                  <CTableHeaderCell style={{ color: 'var(--color-black)' }} >Times</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {selectedHistory.prescription.medicines.map((m, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell style={{ color: 'var(--color-black)' }} >{m.name}</CTableDataCell>
                    <CTableDataCell style={{ color: 'var(--color-black)' }} >{m.dose}</CTableDataCell>
                    <CTableDataCell style={{ color: 'var(--color-black)' }} >{m.duration} {m.durationUnit}</CTableDataCell>
                    <CTableDataCell style={{ color: 'var(--color-black)' }} >{m.food}</CTableDataCell>
                    <CTableDataCell style={{ color: 'var(--color-black)' }} >{m.medicineType}</CTableDataCell>
                    <CTableDataCell style={{ color: 'var(--color-black)' }} >{m.times?.join(', ')}</CTableDataCell>
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

                            const fileName = `${r.reportName}`;

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
      {/* <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1); // reset to page 1
        }}
      /> */}











    </div>
  )
}

export default PatientManagement

