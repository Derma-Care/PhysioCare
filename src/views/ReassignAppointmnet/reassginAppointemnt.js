import React, { useEffect, useState } from 'react'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { getReassign, postReassign } from '../ReassignAppointmnet/reassignAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { showCustomToast } from '../../Utils/Toaster'

const ReassignAppointment = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [appointments, setAppointments] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [viewService, setViewService] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getReassign()
      console.log('Raw API Response:', response)

      if (Array.isArray(response)) {
        setAppointments(response)
      } else {
        setAppointments([])
        console.warn('Unexpected response format:', response)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const transformedData = appointments.flatMap((item) =>
    (item.eligibleProviders || []).map((provider) => ({
      providerName: provider.providerName || 'N/A',
      providerMobileNumber: provider.providerMobileNumber || 'N/A',
      notificationId: item.notificationId || 'N/A',
      message: item.message || 'N/A',
      appointmentId: item.data?.appointmentId || 'N/A',
      patientName: item.data?.patientName || 'N/A',
      relationShip: item.data?.relationShip || 'N/A',
      patientNumber: item.data?.patientNumber || 'N/A',
      gender: item.data?.gender || 'N/A',
      categoryName: item.data?.categoryName || 'N/A',
      age: item.data?.age || 'N/A',
      bookedAt: item.data?.bookedAt || 'N/A',
      payAmount: item.data?.payAmount || 'N/A',
      totalDiscountAmount: item.data?.totalDiscountAmount || 'N/A',
      totalPrice: item.data?.totalPrice || 'N/A',
      totalTax: item.data?.totalTax || 'N/A',
      addressDto: {
        houseNo: item.data?.addressDto?.houseNo || 'N/A',
        street: item.data?.addressDto?.street || 'N/A',
        city: item.data?.addressDto?.city || 'N/A',
        state: item.data?.addressDto?.state || 'N/A',
        postalCode: item.data?.addressDto?.postalCode || 'N/A',
        latitude: item.data?.addressDto?.latitude || 'N/A',
        longitude: item.data?.addressDto?.longitude || 'N/A',
        country: item.data?.addressDto?.country || 'N/A',
        direction: item.data?.addressDto?.direction || 'N/A',
        apartment: item.data?.addressDto?.apartment || 'N/A',
      },
      servicesAdded: item.data?.servicesAdded || [],
    })),
  )

  useEffect(() => {
    setFilteredData(transformedData)
  }, [appointments])

  const handleSearch = () => {
    const trimmedQuery = searchQuery.toLowerCase().trim()

    if (!trimmedQuery) {
      setFilteredData(transformedData)
      return
    }

    const filtered = transformedData.filter((item) => {
      const providerNameMatch = item.providerName.toLowerCase().includes(trimmedQuery)
      const providerMobileMatch = item.providerMobileNumber.toString().includes(trimmedQuery)
      const notificationIdMatch = item.notificationId.toLowerCase().includes(trimmedQuery)

      return providerNameMatch || providerMobileMatch || notificationIdMatch
    })

    setFilteredData(filtered)
  }

  useEffect(() => {
    handleSearch()
  }, [searchQuery])
  
  const assignPost = async (notificationId, providerMobileNumber) => {
    try {
      const payload = {
        providerMobileNumber,
        notificationId,
      }

      console.log('Payload:', payload)

      const response = await postReassign(payload)

      console.log('API Response:', response)

      await fetchData()

      setViewService(null)

      showCustomToast(response?.message || 'Reassignment completed successfully!', 'success',{
        position: 'top-right',
        autoClose: 3000,
      })

      return response
    } catch (error) {
      console.error('Reassign failed:', error?.response?.data || error.message)

      // showCustomToast(error?.response?.data?.message || 'Reassignment failed. Please try again.', 'error',{
      //   position: 'top-right',
      //   autoClose: 3000,
      // })
    }
  }

  const columns = [
    {
      name: 'Provider Name',
      selector: (row) => row.providerName,
    },
    {
      name: 'Provider Mobile Number',
      selector: (row) => row.providerMobileNumber,
    },
    {
      name: 'Service Name',
      selector: (row) =>
        row.servicesAdded && row.servicesAdded.length > 0
          ? row.servicesAdded.map((service) => service.serviceName).join(', ')
          : 'N/A',
    },
    {
      name: 'Notification ID',
      selector: (row) => row.notificationId,
      with: '400px',
    },
    {
      name: 'City',
      selector: (row) => row.addressDto?.city || 'N/A',
    },

    {
      name: 'Actions',
      cell: (row) => (
        <>
          <CButton
            color="primary"
            onClick={() => ViewService(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            View
          </CButton>
        </>
      ),
    },
  ]

  const ViewService = (row) => {
    setViewService(row)
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <CForm className="d-flex justify-content-end mb-3">
        <CInputGroup className="mb-3" style={{ marginRight: '20px', width: '400px' }}>
          <CFormInput
            type="text"
            placeholder="Search by Provider or Notification ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ height: '40px' }}
          />
          <CInputGroupText style={{ height: '40px' }}>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>
      </CForm>
      <ToastContainer />

      {viewService && (
        <CModal visible={!!viewService} onClose={() => setViewService(null)} size="lg">
          <CModalHeader>
            <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
              Appointment Details
            </CModalTitle>
          </CModalHeader>
          <CModalBody style={{ textAlign: 'start', width: '100%' }}>
            <CRow>
              <h5
                style={{
                  textAlign: 'Center',
                  borderBottom: '2px solid black',
                  paddingBottom: '10px',
                  marginRight: '250px',
                }}
              >
                Patient Details
              </h5>
              <CCol sm={4}>
                <strong>Appointment ID :</strong>
              </CCol>
              <CCol sm={8}>{viewService.appointmentId}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Patient Name :</strong>
              </CCol>
              <CCol sm={8}>{viewService.patientName}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Relationship :</strong>
              </CCol>
              <CCol sm={8}>{viewService.relationShip}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Patient Number :</strong>
              </CCol>
              <CCol sm={8}>{viewService.patientNumber}</CCol>
            </CRow>
            {viewService?.addressDto ? (
              <>
                <CRow>
                  <CCol sm={4}>
                    <strong>Apartment :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.apartment || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>House No. :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.houseNo || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>Street :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.street || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>City :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.city || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>State :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.state || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>Postal Code :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.postalCode || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>Country :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.country || 'N/A'}</CCol>
                </CRow>
                <CRow>
                  <CCol sm={4}>
                    <strong>Direction :</strong>
                  </CCol>
                  <CCol sm={8}>{viewService.addressDto.direction || 'N/A'}</CCol>
                </CRow>
              </>
            ) : (
              <p>Address details are not available</p>
            )}

            <div style={{ marginTop: '20px' }}>
              {viewService.servicesAdded && viewService.servicesAdded.length > 0 ? (
                <CRow>
                  <CCol sm={12}>
                    <h5
                      style={{
                        textAlign: 'center',
                        borderBottom: '2px solid black',
                        paddingBottom: '10px',
                        marginLeft: '150px',
                        marginRight: '150px',
                      }}
                    >
                      Added Services
                    </h5>

                    {viewService.servicesAdded.map((service, index) => (
                      <div key={index}>
                        <CRow>
                          <CCol sm={4}>
                            <strong>Service ID:</strong>
                          </CCol>
                          <CCol sm={8}>{service.serviceId || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol sm={4}>
                            <strong>Service Name:</strong>
                          </CCol>
                          <CCol sm={8}>{service.serviceName || 'N/A'}</CCol>
                        </CRow>

                        <CRow>
                          <CCol sm={4}>
                            <strong>Price:</strong>
                          </CCol>
                          <CCol sm={8}>{service.price || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol sm={4}>
                            <strong>Start Date:</strong>
                          </CCol>
                          <CCol sm={8}>{service.startDate || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol sm={4}>
                            <strong>End Date:</strong>
                          </CCol>
                          <CCol sm={8}>{service.endDate || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol sm={4}>
                            <strong>numberOfDays:</strong>
                          </CCol>
                          <CCol sm={8}>{service.numberOfDays || 'N/A'}</CCol>
                        </CRow>

                        <CRow>
                          <CCol sm={4}>
                            <strong>Start Time:</strong>
                          </CCol>
                          <CCol sm={8}>{service.startTime || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol sm={4}>
                            <strong>End time:</strong>
                          </CCol>
                          <CCol sm={8}>{service.endTime || 'N/A'}</CCol>
                        </CRow>
                        <CRow>
                          <CCol sm={4}>
                            <strong>numberOfHours:</strong>
                          </CCol>
                          <CCol sm={8}>{service.numberOfHours || 'N/A'}</CCol>
                        </CRow>

                        {index !== viewService.servicesAdded.length - 1 && (
                          <hr style={{ margin: '10px 0' }} />
                        )}
                      </div>
                    ))}
                  </CCol>
                </CRow>
              ) : (
                <CRow>
                  <CCol sm={12}>
                    <p>No services added</p>
                  </CCol>
                </CRow>
              )}
            </div>
            <hr></hr>
            <CRow>
              <CCol sm={4}>
                <strong>Total Price :</strong>
              </CCol>
              <CCol sm={8}>{viewService.totalPrice || 'N/A'}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Total Discount :</strong>
              </CCol>
              <CCol sm={8}>{viewService.totalDiscountAmount || 'N/A'}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Total Tax:</strong>
              </CCol>
              <CCol sm={8}>{viewService.totalTax || 'N/A'}</CCol>
            </CRow>
            <CRow>
              <CCol sm={4}>
                <strong>Total Cost :</strong>
              </CCol>
              <CCol sm={8}>{viewService.payAmount || 'N/A'}</CCol>
            </CRow>
            <CButton
              color="danger"
              onClick={() =>
                assignPost(viewService.notificationId, viewService.providerMobileNumber)
              }
              style={{ marginRight: '5px', width: '100px', float: 'right' }}
            >
              Reassign
            </CButton>
          </CModalBody>
          <CModalFooter></CModalFooter>
        </CModal>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : filteredData.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          pointerOnHover
        />
      ) : (
        <h6 style={{ textAlign: 'center', margin: '100px' }}>No Pending Notifications Found</h6>
      )}
    </div>
  )
}

export default ReassignAppointment
