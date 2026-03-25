// import {
//   BASE_URL,
//   PatientConsentForm,
//   UpdateConsentForm,
//   AddProcedureConsent,
//   GetProcedureConsent,
// } from '../../baseUrl'
// import { http } from '../../Utils/Interceptors'
// import axios from 'axios'

// export const ConsentFormData = async (bookingId, patientId, mobileNumber) => {
//   console.log(
//     'Calling API:',
//     `${BASE_URL}/${PatientConsentForm}/${bookingId}/${patientId}/${mobileNumber}`,
//   )
//   try {
//     const response = await http.get(
//       `/${PatientConsentForm}/${bookingId}/${patientId}/${mobileNumber}`,
//     )
//     return response.data
//   } catch (error) {
//     console.error('Error fetching service data:', error.message)
//     if (error.response) {
//       console.error('Error Response Data:', error.response.data)
//       console.error('Error Response Status:', error.response.status)
//     }
//     throw error
//   }
// }

// export const updateConsentFormData = async (consentFormId, payload) => {
//   try {
//     const response = await http.put(`/${UpdateConsentForm}/${consentFormId}`, payload, {
//       headers: { 'Content-Type': 'application/json' },
//     })
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// // export const AddGenericConsentFormData = async (consentData, hospitalId, consentFormType) => {
// //   try {
// //     const response = await axios.post(
// //       `${BASE_URL}${AddGenericConsent}/${hospitalId}/${consentFormType}`,
// //       consentData, // now sending actual data
// //       {
// //         headers: { 'Content-Type': 'application/json' },
// //       },
// //     )
// //     console.log('Add API response:', response.data)
// //     return response.data
// //   } catch (error) {
// //     console.error('Error response from API:', error.response || error.message)
// //     throw error
// //   }
// // }

// // export const GetGenericFormData = async (hospitalId, consentFormType) => {
// //   try {
// //     const response = await axios.get(
// //       `${BASE_URL}${GetGenericConsent}/${hospitalId}/${consentFormType}`,
// //     )
// //     console.log('Fetched data:', response.data)
// //     return response.data
// //   } catch (error) {
// //     console.error('Error fetching test data:', error.response || error.message)
// //     throw error
// //   }
// // }

// export const AddProcedureConsentFormData = async (ConsentData, hospitalId, consentFormType) => {
//   try {
//     const response = await http.post(
//       `${AddProcedureConsent}/${hospitalId}/${consentFormType}`,
//       ConsentData, // send the full object as backend expects
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     )
//     console.log('Procedure form saved:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Error saving Procedure Consent Form:', error.response || error.message)
//     throw error
//   }
// }

// export const GetProcedureFormData = async (hospitalId, subserviceId) => {
//   try {
//     const response = await http.get(`/${GetProcedureConsent}/${hospitalId}/${subserviceId}`)
//     console.log('ProcedureConsent Fomr  data:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Error fetching test data:', error.message)
//     if (error.response) {
//       console.error('Error Response Data:', error.response.data)
//       console.error('Error Response Status:', error.response.status)
//     }
//     throw error
//   }
// }
