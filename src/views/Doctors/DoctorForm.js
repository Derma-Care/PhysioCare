// import React from 'react'
// import { useForm, Controller } from 'react-hook-form'
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CRow,
//   CCol,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CFormTextarea,
//   CButton,
// } from '@coreui/react'
// import Select from 'react-select'

// const DoctorFormModal = ({ modalVisible, setModalVisible, onSubmitHandler, categoryOptions, serviceOptionsFormatted, subServiceOptions }) => {
//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       doctorLicence: '',
//       doctorName: '',
//       doctorMobileNumber: '',
//       gender: 'Female',
//       experience: '',
//       qualification: '',
//       specialization: '',
//       profileDescription: '',
//       inClinicFee: '',
//       vedioConsultationFee: '',
//     },
//   })

//   const onSubmit = (data) => {
//     onSubmitHandler(data)
//     reset()
//     setModalVisible(false)
//   }

//   return (
//     <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
//       <CModalHeader>
//         <CModalTitle>Add Doctor</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <CRow className="g-4 mb-4">
//             <CCol md={6}>
//               <CFormLabel>License Number</CFormLabel>
//               <CFormInput
//                 {...register('doctorLicence', { required: 'License number is required' })}
//                 invalid={!!errors.doctorLicence}
//               />
//               {errors.doctorLicence && <p className="text-danger small">{errors.doctorLicence.message}</p>}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Doctor Name</CFormLabel>
//               <CFormInput
//                 {...register('doctorName', { required: 'Doctor name is required' })}
//                 invalid={!!errors.doctorName}
//               />
//               {errors.doctorName && <p className="text-danger small">{errors.doctorName.message}</p>}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Gender</CFormLabel>
//               <CFormSelect {...register('gender')}>
//                 <option value="Female">Female</option>
//                 <option value="Male">Male</option>
//                 <option value="Other">Other</option>
//               </CFormSelect>
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Mobile Number</CFormLabel>
//               <CFormInput
//                 type="tel"
//                 maxLength={10}
//                 {...register('doctorMobileNumber', {
//                   required: 'Mobile number is required',
//                   pattern: {
//                     value: /^\d{10}$/,
//                     message: 'Enter a valid 10-digit number',
//                   },
//                 })}
//                 invalid={!!errors.doctorMobileNumber}
//               />
//               {errors.doctorMobileNumber && (
//                 <p className="text-danger small">{errors.doctorMobileNumber.message}</p>
//               )}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Experience (years)</CFormLabel>
//               <CFormInput
//                 type="number"
//                 {...register('experience', { required: 'Experience is required' })}
//               />
//               {errors.experience && <p className="text-danger small">{errors.experience.message}</p>}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Qualification</CFormLabel>
//               <CFormInput
//                 {...register('qualification', { required: 'Qualification is required' })}
//               />
//               {errors.qualification && <p className="text-danger small">{errors.qualification.message}</p>}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Specialization</CFormLabel>
//               <CFormInput
//                 {...register('specialization', { required: 'Specialization is required' })}
//               />
//               {errors.specialization && <p className="text-danger small">{errors.specialization.message}</p>}
//             </CCol>

//             <CCol md={6}>
//               <CFormLabel>Profile Description</CFormLabel>
//               <CFormTextarea {...register('profileDescription')} />
//             </CCol>

//             <CCol md={4}>
//               <CFormLabel>In-Clinic Fee</CFormLabel>
//               <CFormInput
//                 type="number"
//                 {...register('inClinicFee', { required: 'Required' })}
//               />
//               {errors.inClinicFee && <p className="text-danger small">{errors.inClinicFee.message}</p>}
//             </CCol>

//             <CCol md={4}>
//               <CFormLabel>Video Consultation Fee</CFormLabel>
//               <CFormInput
//                 type="number"
//                 {...register('vedioConsultationFee', { required: 'Required' })}
//               />
//               {errors.vedioConsultationFee && (
//                 <p className="text-danger small">{errors.vedioConsultationFee.message}</p>
//               )}
//             </CCol>
//           </CRow>

//           <CModalFooter>
//             <CButton color="secondary" onClick={() => setModalVisible(false)}>
//               Cancel
//             </CButton>
//             <CButton color="primary" type="submit">
//               Submit
//             </CButton>
//           </CModalFooter>
//         </form>
//       </CModalBody>
//     </CModal>
//   )
// }

// export default DoctorFormModal
