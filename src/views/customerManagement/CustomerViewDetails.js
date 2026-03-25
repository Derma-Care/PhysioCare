// import React, { useState, useEffect } from 'react'
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CTabs,
//   CNav,
//   CNavItem,
//   CNavLink,
//   CTabContent,
//   CTabPane,
//   CRow,
//   CCol,
//   CSpinner,
// } from '@coreui/react'
// import { useParams } from 'react-router-dom'
// import { CustomerByCustomerId } from './CustomerManagementAPI'

// const CustomerViewDetails = () => {
//   const { customerId } = useParams()
//   const [activeTab, setActiveTab] = useState(0)
//   const [customerData, setCustomerData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     if (!customerId) return

//     const fetchCustomer = async () => {
//       try {
//         setLoading(true)
//         const response = await CustomerByCustomerId(customerId)
//         const data = response?.data || response

//         setCustomerData({
//           ...data,
//           email: data.email || data.emailId || '',
//           appointments: data.appointments || [],
//         })
//       } catch (err) {
//         setError('Failed to load customer details.')
//         console.error(err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCustomer()
//   }, [customerId])

//   const groupAppointments = (status) => {
//     return customerData?.appointments
//       ?.filter((apt) => apt.status === status)
//       ?.sort((a, b) => new Date(b.date) - new Date(a.date))
//   }

//   const renderAppointmentGroup = (status) => {
//     const grouped = groupAppointments(status)
//     if (!grouped?.length) {
//       return <p>No {status.toLowerCase()} appointments available.</p>
//     }
//     return (
//       <ul>
//         {grouped.map((apt, index) => (
//           <li key={apt.id || index}>
//             <strong>{apt.type}</strong> on {apt.date}
//           </li>
//         ))}
//       </ul>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="text-center my-5">
//         <CSpinner color="primary" />
//         <p>Loading customer details...</p>
//       </div>
//     )
//   }

//   if (error || !customerData) {
//     return <p className="text-danger">{error || 'Customer not found.'}</p>
//   }

//   return (
//     <CCard>
//       <CCardHeader>
//         <h5>Customer Details: {customerData.fullName || '-'}</h5>
//       </CCardHeader>
//       <CCardBody>
//         <CTabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
//           <CNav variant="tabs">
//             <CNavItem>
//               <CNavLink active={activeTab === 0}>Basic Details</CNavLink>
//             </CNavItem>
//             <CNavItem>
//               <CNavLink active={activeTab === 1}>Address</CNavLink>
//             </CNavItem>
//             <CNavItem>
//               <CNavLink active={activeTab === 2}>Appointments</CNavLink>
//             </CNavItem>
//           </CNav>

//           <CTabContent>
//             {/* Basic Info */}
//             <CTabPane visible={activeTab === 0}>
//               <CCard className="p-3 shadow-sm rounded-3 border-light">
//                 <CRow className="gy-3">
//                   <CCol sm="6">
//                     <strong>Customer Id:</strong>
//                     <div>{customerData.customerId || '-'}</div>
//                   </CCol>
//                   <CCol sm="6">
//                     <strong>Full Name:</strong>
//                     <div>{customerData.fullName || '-'}</div>
//                   </CCol>
//                   <CCol sm="6">
//                     <strong>Email:</strong>
//                     <div>{customerData.email || '-'}</div>
//                   </CCol>
//                   <CCol sm="6">
//                     <strong>Mobile Number:</strong>
//                     <div>{customerData.mobileNumber || '-'}</div>
//                   </CCol>
//                   <CCol sm="6">
//                     <strong>Gender:</strong>
//                     <div>{customerData.gender || '-'}</div>
//                   </CCol>
//                   <CCol sm="6">
//                     <strong>Date of Birth:</strong>
//                     <div>{customerData.dateOfBirth || '-'}</div>
//                   </CCol>
//                   <CCol sm="6">
//                     <strong>Refer Code:</strong>
//                     <div>{customerData.referCode || '-'}</div>
//                   </CCol>
//                 </CRow>
//               </CCard>
//             </CTabPane>

//             {/* Address */}
//             <CTabPane visible={activeTab === 1}>
//               <CRow className="mt-3 gy-3">
//                 <CCol sm="6">
//                   <strong>House No:</strong> {customerData.address?.houseNo || '-'}
//                 </CCol>
//                 <CCol sm="6">
//                   <strong>Street:</strong> {customerData.address?.street || '-'}
//                 </CCol>
//                 <CCol sm="6">
//                   <strong>Landmark:</strong> {customerData.address?.landmark || '-'}
//                 </CCol>
//                 <CCol sm="6">
//                   <strong>City:</strong> {customerData.address?.city || '-'}
//                 </CCol>
//                 <CCol sm="6">
//                   <strong>State:</strong> {customerData.address?.state || '-'}
//                 </CCol>
//                 <CCol sm="6">
//                   <strong>Postal Code:</strong> {customerData.address?.postalCode || '-'}
//                 </CCol>
//               </CRow>
//             </CTabPane>

//             {/* Appointments */}
//             <CTabPane visible={activeTab === 2}>
//               <div className="mt-3">
//                 <h6>Past Appointments</h6>
//                 {renderAppointmentGroup('Past')}
//                 <h6 className="mt-4">Active Appointments</h6>
//                 {renderAppointmentGroup('Active')}
//                 <h6 className="mt-4">Upcoming Appointments</h6>
//                 {renderAppointmentGroup('Upcoming')}
//               </div>
//             </CTabPane>
//           </CTabContent>
//         </CTabs>
//       </CCardBody>
//     </CCard>
//   )
// }

// export default CustomerViewDetails
