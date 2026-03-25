import React, { useEffect, useState, useCallback } from 'react' // Added useCallback
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormInput,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import {
  DoctorId_NotificationsData,
  DoctorNotifyData,
  postNotifyData,
} from './DoctorNotificationsAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
import DoctorManagement from '../Doctors/DoctorManagement'
import { showCustomToast } from '../../Utils/Toaster'

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  // const [notificationCount, setNotificationCount] = useState(0)
  const { setNotificationCount } = useHospital()
  const navigate = useNavigate()

  const handleResponse = async (status, reason = '') => {
    const payload = {
      hospitalId: selectedNotification?.data?.clinicId,
      doctorId: selectedNotification?.data?.doctorId,
      notificationId: selectedNotification?.notificationId,
      appointmentId: selectedNotification?.data?.bookingId,
      subServiceId: selectedNotification?.data?.subServiceId,
      status: status,
      reasonForCancel: reason,
    }

    try {
      const res = await postNotifyData(payload)

      if (res.status === 200) {
        showCustomToast(`Notification ${status} successfully`,'success')

        // Close modals
        setShowViewModal(false)
        setShowRejectModal(false)
        setRejectReason('')

        // 🟢 Update state directly instead of re-fetching
        setNotifications((prev) =>
          prev.filter((item) => item.notificationId !== selectedNotification.notificationId),
        )

        // Optional: update count
        setNotificationCount((prev) => prev - 1)
      }
    } catch (err) {
      showCustomToast('Something went wrong!','error')
    }
  }

  const fetchNotifications = async (hospitalId, doctorId) => {
    try {
      if (!hospitalId || !doctorId) {
        // toast.error('Missing Hospital or Doctor ID')
        setNotifications([])
        return
      }

      const response = await DoctorNotifyData(hospitalId, doctorId)
      console.log('DoctorNotifyData response:', response)

      if (response.status === 200 && Array.isArray(response.data.data)) {
        setNotificationCount(response.data.data.length)
        setNotifications(response.data.data)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error)
      // showCustomToast('Failed to fetch notifications','error')
      setNotifications([])
    }
  }

  useEffect(() => {
    const fetchDoctorIdAndNotifications = async () => {
      setLoading(true) // start loading
      const hospitalId = localStorage.getItem('HospitalId')
      if (!hospitalId) {
        showCustomToast('Missing Hospital ID in localStorage','error')
        setLoading(false) // stop loading even on early return
        return
      }

      try {
        const response = await DoctorId_NotificationsData(hospitalId)

        if (
          response.status === 200 &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const doctorList = response.data.data

          let allNotifications = []
          for (const doc of doctorList) {
            const doctorId = doc.doctorId
            try {
              const notifyRes = await DoctorNotifyData(hospitalId, doctorId)
              if (notifyRes.status === 200 && Array.isArray(notifyRes.data.data)) {
                allNotifications = [...allNotifications, ...notifyRes.data.data]
              }
            } catch (err) {
              console.error(`Error fetching notifications for doctor ${doctorId}:`, err)
            }
          }

          setNotifications(allNotifications)
          setNotificationCount(allNotifications.length)
        } else {
          setNotifications([])
        }
      } catch (error) {
        // showCustomToast('Error fetching doctor list.','error')
      } finally {
        setLoading(false) // ✅ stop loading after everything
      }
    }

    fetchDoctorIdAndNotifications()
  }, [])

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h5>Doctor Notifications</h5>

      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Doctor Name</CTableHeaderCell>
            <CTableHeaderCell>Patient Name</CTableHeaderCell>
            <CTableHeaderCell>Mobile Number</CTableHeaderCell>
            <CTableHeaderCell>Consultation Type</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Time</CTableHeaderCell>

            <CTableHeaderCell>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {loading ? (
            <CTableRow>
              <CTableDataCell colSpan="8" className="text-center text-primary fw-bold">
                Loading notifications...
              </CTableDataCell>
            </CTableRow>
          ) : notifications.length > 0 ? (
            notifications.map((item, index) => (
              <CTableRow key={item.notificationId || index}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{item.data?.doctorName || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.name || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.mobileNumber || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.consultationType || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.serviceDate || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.servicetime || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedNotification(item)
                      setShowViewModal(true)
                    }}
                  >
                    View
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="8" className="text-center text-secondary fw-bold">
                No notifications available.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
      <CModal visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader>
          <CModalTitle>Appointment Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedNotification && (
            <>
              <p>
                <strong>Doctor:</strong> {selectedNotification.data?.doctorName}
              </p>
              <p>
                <strong>Patient:</strong> {selectedNotification.data?.name}
              </p>
              <p>
                <strong>Age:</strong> {selectedNotification.data?.age}
              </p>
              <p>
                <strong>Gender:</strong> {selectedNotification.data?.gender}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedNotification.data?.mobileNumber}
              </p>
              <p>
                <strong>Problem:</strong> {selectedNotification.data?.problem}
              </p>
              <p>
                <strong>Clinic:</strong> {selectedNotification.data?.clinicName}
              </p>
              <p>
                <strong>Service:</strong> {selectedNotification.data?.subServiceName}
              </p>
              <p>
                <strong>Date:</strong> {selectedNotification.data?.serviceDate}
              </p>
              <p>
                <strong>Time:</strong> {selectedNotification.data?.servicetime}
              </p>
              <p>
                <strong>Type:</strong> {selectedNotification.data?.consultationType}
              </p>
              <p>
                <strong>Fee:</strong> ₹{selectedNotification.data?.consultationFee}
              </p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            size="sm"
            className="px-3"
            // onClick={() => navigate(`/doctor`)}
             onClick={() => {
                // Corrected line: navigate to the specific doctor's details page
                navigate(`/doctor/${selectedNotification.data?.doctorId}`);
            }}      >
            Doctor Details
          </CButton>
          <CButton
            color="success"
            className="text-white"
            onClick={() => handleResponse('Accepted')}
          >
            Accept
          </CButton>
          <CButton
            color="danger"
            className="text-white"
            onClick={() => {
              setShowViewModal(false)
              setShowRejectModal(true)
            }}
          >
            Reject
          </CButton>
          <CButton color="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <CModalHeader>
          <CModalTitle>Reject Appointment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel htmlFor="rejectReason">Reason for Rejection</CFormLabel>
          <CFormInput
            id="rejectReason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason here"
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="danger"
            className="text-white"
            onClick={() => {
              if (!rejectReason.trim()) {
               showCustomToast('Please provide a reason.','warning')
                return
              }
              handleResponse('Rejected', rejectReason)
            }}
          >
            Submit
          </CButton>
          <CButton color="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DoctorNotifications
