import { emailPattern } from '../Constant/Constants'

// validators.js
export const validateField = (field, value, formData = {}, technicians = []) => {
  let error = ''

  const trimmedValue = typeof value === 'string' ? value.trim() : value // ✅ normalize input
  value = trimmedValue

  switch (field) {
    // 🔹 Basic Info
    case 'fullName':
      if (!value) error = 'Full Name is required.'
      else if (value.length < 3 || value.length > 50)
        error = 'Full Name must be between 3 and 50 characters.'
      break

    case 'gender':
      if (!value) error = 'Gender is required.'
      else if (!['male', 'female', 'other'].includes(value.toLowerCase()))
        error = 'Invalid gender selected.'
      break

    case 'dateOfBirth':
      if (!value) error = 'Date of Birth is required.'
      else {
        const dob = new Date(value)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        if (
          today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        )
          age--
        if (age < 18) error = 'Staff must be at least 18 years old.'
      }
      break

    case 'yearsOfExperience':
      if (value === '' || value === null || value === undefined) {
        error = 'Years of Experience is required.'
      } else if (!/^\d+$/.test(value)) {
        error = 'Years of Experience must be a number.'
      } else if (parseInt(value) < 0) {
        error = 'Years of Experience cannot be negative.'
      } else if (parseInt(value) > 50) {
        // optional max limit
        error = 'Years of Experience seems too high.'
      } else {
        error = ''
      }
      break

    case 'contactNumber':
    case 'nurseContactNumber':
    case 'mobileNumber': {
      if (!value) error = 'Contact number is required.'
      else if (!/^[6-9]\d{9}$/.test(value))
        error = 'Contact number must be 10 digits and start with 6-9.'
      else if (
        technicians?.some((t) => {
          const existingContact = t.contactNumber || t.mobileNumber || t.nurseContactNumber
          const existingId =
            t.id ||
            t.technicianId ||
            t.pharmacistId ||
            t.nurseId ||
            t.securityId ||
            t.labTechnicianId

          const currentId =
            formData.id ||
            formData.technicianId ||
            formData.pharmacistId ||
            formData.nurseId ||
            formData.securityId ||
            formData.labTechnicianId

          return existingContact === value && existingId !== currentId
        })
      ) {
        error = 'Mobile number already exists.'
      }
      break
    }

    case 'emailId':
    case 'email': {
      if (!value) error = 'Email is required.'
      else if (!emailPattern.test(value)) error = 'Valid Email is required.'
      else if (
        technicians?.some((t) => {
          const existingEmail = t.emailId || t.email || t.emailID
          const existingId =
            t.id ||
            t.technicianId ||
            t.pharmacistId ||
            t.nurseId ||
            t.securityId ||
            t.labTechnicianId

          const currentId =
            formData.id ||
            formData.technicianId ||
            formData.pharmacistId ||
            formData.nurseId ||
            formData.securityId ||
            formData.labTechnicianId

          return existingEmail === value && existingId !== currentId
        })
      ) {
        error = 'Email already exists.'
      }
      break
    }

    case 'city':
    case 'country':
      if (!value) error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
      else if (!/^[A-Za-z\s]+$/.test(value))
        error = `${field.charAt(0).toUpperCase() + field.slice(1)} must contain only letters.`
      break

    case 'status':
      if (!value || (value !== 'Active' && value !== 'Inactive')) {
        error = 'Status is required.'
      } else {
        error = ''
      }
      break

    case 'governmentId': {
      const trimmed = (value || '').trim()

      if (!trimmed) {
        error = 'Government ID (Aadhaar) is required.'
        break
      }

      // ✅ Basic Aadhaar rule: 12 digits, starts with 2–9
      const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/
      if (!aadhaarRegex.test(trimmed)) {
        error = 'Government ID (Aadhaar) must be 12 digits and cannot start with 0 or 1.'
        break
      }

      // ✅ Block repeated digits (e.g. 111111111111 or 999999999999)
      if (/^(\d)\1{11}$/.test(trimmed)) {
        error = 'Government ID (Aadhaar) cannot have all digits the same.'
        break
      }

      // ✅ valid
      error = ''
      break
    }
    case 'medicalRegistrationNumber':
      if (!value || value.trim() === '') {
        error = 'Medical Registration Number is required.'
      } else if (!/^[A-Za-z0-9\-\/]+$/.test(value)) {
        // Allow letters, digits, hyphens, slashes
        error = 'Medical Registration Number contains invalid characters.'
      } else if (value.length < 3 || value.length > 20) {
        error = 'Medical Registration Number must be between 3 and 20 characters.'
      } else {
        error = ''
      }
      break
case 'specialization':
  if (!value || value.trim() === '') {
    error = 'Specialization is required.'
  } else if (value.trim().length < 2 || value.trim().length > 50) {
    error = 'Specialization must be between 2 and 50 characters.'
  } else if (/\d/.test(value)) {
    error = 'Specialization cannot contain numbers.'
  } else if (!/^[A-Za-z\s&/.-]+$/.test(value)) {
    // Only allow letters, spaces, and allowed special characters
    error = 'Specialization contains invalid characters.'
  } else {
    error = ''
  }
  break




    case 'dateOfJoining':
      if (!value) {
        error = 'Date of Joining is required.'
      } 
      break
    case 'vaccinationStatus':
      if (!value || value.trim() === '') {
        error = 'Vaccination status is required.'
      } else if (!['Not Vaccinated', 'Partially Vaccinated', 'Fully Vaccinated'].includes(value)) {
        error = 'Invalid vaccination status.'
      }
      break

  case 'department':
  if (!value || value.trim() === '') {
    error = 'Department is required.'
  } else if (value.trim().length < 2 || value.trim().length > 50) {
    error = 'Department must be between 2 and 50 characters.'
  } else if (!/[A-Za-z0-9]/.test(value)) {
    // Ensure at least one letter or number
    error = 'Department cannot contain only special characters.'
  } else if (!/^[A-Za-z0-9\s&/.\-()]+$/.test(value)) {
    // Only allow letters, numbers, spaces, and related special characters
    error = 'Department contains invalid characters.'
  } else {
    error = ''
  }
  break




   case 'nursingCouncilRegistration':
  if (!value || value.trim() === '') {
    error = 'Nursing Council Registration cannot be empty.'
  } else if (value.trim().length < 2 || value.trim().length > 20) {
    error = 'Nursing Council Registration must be between 2 and 20 characters.'
  } else if (!/[A-Za-z]/.test(value)) {
    // Ensure at least one letter is present
    error = 'Nursing Council Registration must contain at least one letter.'
  } else if (!/^[A-Za-z0-9/.-]+$/.test(value)) {
    // Only allow letters, numbers, / . -
    error = 'Nursing Council Registration contains invalid characters.'
  } else {
    error = '' // ✅ valid input
  }
  break

    case 'role':
      if (!value || value.trim() === '') error = 'Role is required.'
      else if (value.length < 2 || value.length > 50)
        error = 'Role must be between 2 and 50 characters.'
      break

    case 'clinicId':
      if (!value || value.trim() === '') error = 'Clinic ID is required.'
      break

    case 'shiftTimingOrAvailability':
      if (!value || value.trim() === '') error = 'Shift Timing / Availability is required.'
      else if (value.length < 2 || value.length > 50)
        error = 'Shift Timing / Availability must be between 2 and 50 characters.'
      break
    case 'labLicenseOrRegistration':
  if (!value || value.trim() === '') {
    error = 'Lab License / Registration is required.'
  } else if (value.trim().length < 3 || value.trim().length > 50) {
    error = 'Lab License / Registration must be between 3 and 50 characters.'
  } else if (!/[A-Za-z0-9]/.test(value)) {
    // Ensure at least one letter or number
    error = 'Lab License / Registration cannot contain only special characters.'
  } else if (!/^[A-Za-z0-9\s/.-]+$/.test(value)) {
    // Allow only letters, numbers, spaces, and / . -
    error = 'Lab License / Registration contains invalid characters.'
  } else {
    error = ''
  }
  break


    case 'emergencyContact':
      if (!value || value.trim() === '') {
        error = 'Emergency contact is required.'
      } else if (!/^\d{10}$/.test(value)) {
        error = 'Emergency contact must be exactly 10 digits.'
      } else if (!/^[6-9]/.test(value)) {
        error = 'Emergency contact must start with 6, 7, 8, or 9.'
      } else if (value === formData.contactNumber) {
        error = 'Emergency contact cannot be the same as contact number.'
      } else {
        error = ''
      }
      break
    case 'qualifications':
      if (!/^[A-Za-z\s]+$/.test(value)) {
        error = 'Qualifications must contain letters only.'
      } else if (value.length < 2 || value.length > 50) {
        error = 'Qualifications must be between 2 and 50 characters.'
      } else {
        error = ''
      }
      break

    case 'emergencyContactNumber':
      if (!/^\d{10}$/.test(value)) {
        error = 'Emergency contact must be exactly 10 digits.'
      } else if (!/^[6-9]/.test(value)) {
        error = 'Emergency contact must start with 6, 7, 8, or 9.'
      } else {
        error = ''
      }
      break

    // 🔹 Address
    case 'houseNo':
    case 'street':
      if (!value) error = `Address: ${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
      else if (value.length < 1 || value.length > 50)
        error = `Address: ${field.charAt(0).toUpperCase() + field.slice(1)} must be valid.`
      break
    // 🔹 Add more fields like bank, documents, previous employment, etc. here if needed
    case 'accountNumber':
      if (!value || value.trim() === '') error = 'Account Number is required.'
      else if (!/^\d{9,20}$/.test(value)) error = 'Account Number must be between 9 and 20 digits.'
      break

    case 'accountHolderName':
      if (!value || value.trim() === '') {
        error = 'Account Holder Name is required.'
      }
      // Only letters (both cases) and spaces allowed, no numbers or special characters
      else if (!/^[A-Za-z\s]+$/.test(value)) {
        error = 'Account Holder Name can contain only letters and spaces.'
      }
      // Minimum 3 and maximum 50 characters
      else if (value.trim().length < 3 || value.trim().length > 50) {
        error = 'Account Holder Name must be between 3 and 50 characters.'
      } else {
        error = ''
      }
      break
    case 'departmentOrAssignedLab':
  if (!value || value.trim() === '') {
    error = 'Department / Assigned Lab is required.'
  } else if (value.trim().length < 3 || value.trim().length > 50) {
    error = 'Department / Assigned Lab must be between 3 and 50 characters.'
  } else if (!/[A-Za-z0-9]/.test(value)) {
    // Ensure at least one letter or number
    error = 'Department / Assigned Lab cannot contain only special characters.'
  } else if (!/^[A-Za-z0-9\s/.-]+$/.test(value)) {
    // Allow letters, numbers, spaces, / . -
    error = 'Department / Assigned Lab contains invalid characters.'
  } else {
    error = ''
  }
  break


    case 'ifscCode':
      if (!value || value.trim() === '') error = 'IFSC Code is required.'
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value))
        error = 'Invalid IFSC format (e.g., HDFC0001234).'
      break

    case 'panCardNumber':
      if (!value || value.trim() === '') error = 'PAN Card Number is required.'
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value))
        error = 'Invalid PAN format (e.g., ABCDE1234F).'
      break
  


    case 'profilePicture':
      if (!value || value.trim() === '') {
        error = 'Profile Image is required.'
      } else {
        // ✅ Base64 image size calculation
        const base64Length = value.length - (value.indexOf(',') + 1)
        const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
        const fileSizeInBytes = (base64Length * 3) / 4 - padding

        if (fileSizeInBytes > 250 * 1024) {
          error = 'Profile Image must be less than 250KB.'
        }
      }
      break

    case 'pharmacyLicense':
      if (
        !/^(?=.*[0-9\-\/])[A-Za-z0-9\s\-\/]+$/.test(value) // must contain at least one number or - or /
      ) {
        error = 'Pharmacy License must include at least one number or symbol (hyphen/ slash).'
      } else if (value.length < 3 || value.length > 50) {
        error = 'Pharmacy License must be between 3 and 50 characters.'
      } else {
        error = ''
      }
      break

    case 'medicalFitnessCertificate':
      if (!value || value.trim() === '') {
        error = 'Medical Fitness Certificate is required.'
      } else {
        // ✅ Base64 file size check (250 KB max)
        const base64Length = value.length - (value.indexOf(',') + 1)
        const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
        const fileSizeInBytes = (base64Length * 3) / 4 - padding

        if (fileSizeInBytes > 250 * 1024) {
          error = 'Medical Fitness Certificate must be less than 250KB.'
        }
      }
      break

    case 'qualificationOrCertifications':
      // optional field → validate only if uploaded
      if (formData.qualificationOrCertifications) {
        if (formData.qualificationOrCertifications.trim() === '') {
          error = 'Invalid Training Guard License file.'
        } else {
          // ✅ Size check (250 KB max)
          const base64Length = value.length - (value.indexOf(',') + 1)
          const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
          const fileSizeInBytes = (base64Length * 3) / 4 - padding

          if (fileSizeInBytes > 250 * 1024) {
            error = 'Qualification/Certification file must be less than 250KB.'
          }
        }
      }
      break

    case 'previousEmploymentHistory':
      if (!value || value.trim() === '') error = 'Previous Employment History is required.'
      else if (value.length < 10)
        error = 'Previous Employment History must be at least 10 characters.'
      break

    case 'previousEmployeeHistory':
      if (!value || value.trim() === '') {
        error = 'Previous Employment History is required.'
      } else if (value.length < 5 || value.length > 500) {
        error = 'Previous Employment History must be between 5 and 500 characters.'
      }
      break
    case 'qualificationOrNursingCertificate':
      if (!value || value.trim() === '') {
        error = 'Qualification/Nursing Certificate is required.'
      } else {
        // ✅ Allow only PDF or image files
        const isValidFile = /^data:(application\/pdf|image\/(png|jpeg|jpg));base64,/.test(value)
        if (!isValidFile) {
          error = 'Only PDF or image files (png, jpeg, jpg) are allowed.'
        } else {
          // ✅ File size check (max 250 KB)
          const base64Length = value.length - (value.indexOf(',') + 1)
          const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
          const fileSizeInBytes = (base64Length * 3) / 4 - padding

          if (fileSizeInBytes > 250 * 1024) {
            error = 'Qualification/Nursing Certificate must be less than 250KB.'
          } else {
            error = ''
          }
        }
      }
      break

    case 'policeVerification':
      if (!value || value.trim() === '') error = 'Police Verification is required.'
      else if (value.length < 2 || value.length > 50)
        error = 'Police Verification must be between 2 and 50 characters.'
      break
    default:
      if (!value) error = ''
      break
  }

  return error // returns '' if valid, else error string
}

// Full form validation
export const validateFormData = (formData, technicians) => {
  const fields = [
    'fullName',
    'gender',
    'dateOfBirth',
    'contactNumber',
    'emailId',
    'governmentId',
    'dateOfJoining',
    'department',
    'role',
    'clinicId',
    'shiftTimingOrAvailability',
    'emergencyContact',
    'houseNo',
    'street',
    'city',
    'state',
    'postalCode',
    'country',
    // add more fields as needed
  ]

  const errors = []

  fields.forEach((field) => {
    const error = validateField(field, formData[field], formData, technicians)

    // 🚨 Skip duplicate emergency/contact number validation here
    if (
      error &&
      (error.includes('Contact number cannot be the same as emergency contact') ||
        error.includes('Emergency contact cannot be the same as contact number'))
    ) {
      return // ✅ ignore this, handle only in handleSubmit
    }

    if (error) errors.push(error)
  })

  return errors
}
