// export const BASE_URL = 'http://alb-dev-sc-197990416.ap-south-1.elb.amazonaws.com/api'
// export let wifiUrl = 'localhost'
export let wifiUrl = 'http://52.66.144.177:9090'
// export let wifiUrl = 'http://3.6.119.57:9090'
export let splrUrl = 'http:/localhost:8801'
// export let wifiUrl = '192.168.1.5'
// http://3.6.119.57:9090
//https://api.aesthetech.life
export const SBASE_URL = `${wifiUrl}/clinicadminpublicapis`
export const BASE_URL = `${wifiUrl}/clinic-admin`

export const SPLR_URL = `${splrUrl}`
export const MainAdmin_URL = `${wifiUrl}/admin`
export const subService_URL = `${BASE_URL}/api/v1`

export const baseUrlmedicine = `${wifiUrl}/api/doctors`

// END POINTS
export const endPoint = '/clinicLogin'
//reports
export const AllReports = `getallreports`
export const SavingReports = `savereports`
export const Get_ReportsByBookingId = `getReportByBookingId`
//appointments
// export const allBooking_sevices = getAllBookedServices
export const DeleteBookings = `customer/deleteService`
export const GetBookingBy_ClinicId = `customer/getAllBookedServicesByClinicId`
export const GetBookingBy_DoctorId = `customer/getBookingByDoctorId`
//appointments
export const Booking_sevice = `${wifiUrl}/api`

export const allBooking_sevices = `getAllBookedServices`

// Appointment Management
export const getAllBookingDetails = 'admin/getAllBookingDetails'

//Doctors
export const GetBranches_ByClinicId = 'getBranchesByClinicId'
export const PatientConsentForm = 'getpatientConsentForm'
export const UpdateConsentForm = 'updatePatientConsentForm'

export const doctorAvailableUrl = 'doctorId'
export const getDoctorByClinicId = 'getDoctorsByHospitalIdAndBranchId'

export const getAllBookedServices = `customer/getAllBookedServices`
export const Booking_service_Url = `${wifiUrl}/api`
export const deleteBookings = `customer/deleteService`
export const geteBookingBy_ClinicId = `customer/getAllBookedServicesByClinicId`

export const GetBy_DoctorId = 'doctor'
//Doctor Notifications
export const Doctor_Url = `${wifiUrl}/api`
export const getAllDCtrNotifications = 'doctors/notificationToDoctor'
export const getDoctorIdAndNotifications = 'doctors/hospitalById'

//Test
export const AllTest = 'labtest/getAllLabTests'
export const GetTestByHId = 'labtests'
export const AddTest = 'labtest/addLabTest'
export const UpdateTest = 'labtest/updateLabTest'
export const DeleteTest = 'labtest/deleteLabTest'

//Treatments
export const AllTreatment = 'treatment/getAllTreatments'
export const GetTreatmentsByHId = 'treatments'
export const AddTreatment = 'treatment/addTreatment'
export const UpdateTreatment = 'treatment/updateTreatmentById'
export const DeleteTreatment = 'treatment/deleteTreatmentById'

//Diseases
export const AllDiseases = 'get-all-diseases'
export const GetDiseasesByHId = 'diseases'
export const AddDisease = 'addDiseases'
export const UpdateDisease = 'updateDisease'
export const DeleteDisease = 'deleteDisease'

//============= Forms ===============

//To fetch category,service and subservice
export const GetSubServiceByHospitalIdandSubServiceId = 'getSubService'
//Procedure
export const GetProcedureForm_ByHospitalIdAndProcedureId =
  'getProcedureFormByHospitalIdAndProcedureId'
export const Add_ProcedureForm = 'addProcedureForm'
export const update_ProcedureForm = 'update-procedureForm'
export const Delete_ProcedureForm = 'delete-procedureForm'
export const All_ProcedureFormData = 'getAllProcedureForms'

//Pre--Procedure
export const GetPreProcedureForm_ByHospitalIdAndPreProcedureId =
  'getPreProcedureFormByHospitalIdAndPreProcedureId'
export const Add_PreProcedureForm = 'addPreProcedureForm'
export const update_PreProcedureFormForm = 'update-preprocedure-forms'
export const Delete_PreProcedureFormForm = 'delete-preprocedure-form'
export const All_PreProceudreFormData = 'getAllPreProcedureForms'
//post--Procedure
export const GetPostProcedureForm_ByHospitalIdAndProcedureId =
  'getPostProcedureFormByHospitalIdAndPostProcedureId'
export const Add_PostProcedureForm = 'addPostProcedureForm'
export const update_PostProcedureForm = 'update-postprocedure-forms'
export const Delete_PostProcedureForm = 'delete-postprocedure-form'
export const All_PostProceudreFormData = 'getAllPostProcedureForms'

//notifiction Reponse
export const NoficationResponse = 'doctors/notificationResponse'

//Advertisement
export const addCustomerAdvertisement = 'categoryAdvertisement/add'
export const AllCustomerAdvertisements = 'categoryAdvertisement/getAll'

export const getAllDoctors = `doctors`

// Provider Management

export const ProviderAllData = 'admin/getAllProviderDetails'

export const BasicDetails = 'admin/getCaregiverDetails'

export const updateBasic = 'admin/updateCaregiver'

export const BasicProfile = 'admin/getProviderBasicProfile'

export const UpdateBasicProfile = 'admin/updateBasicProfile'

export const qualification = 'admin/getQualificationDetails'

export const updateQualification = 'admin/updateQualification'

export const Experience = 'admin/getExperienceDetails'

export const updateExperience = 'admin/updateExperienceDetails'

export const AddExperience = 'providers/addExperienceDetails'

export const DeleteExperience = 'admin/deleteExperience'

export const courseCertification = 'admin/getCourseCertificationDetails'

export const updateCourse = 'admin/updateCourseCertification'

export const deleteCourse = 'admin/deleteCourseCertification'

export const Bank = 'admin/getBankAccountDetails'

export const updateBank = 'admin/updateBankAccount'

export const Verification = 'admin/getVerficationDetails'

export const updateVerification = 'admin/verfiyProvider'

export const getAppointments = 'admin/appointments'

//sub Service management
export const service = 'subService/getAllSubServies'
export const getservice = 'getServiceByCategoryId'
export const getService_ByClinicId = 'getSubServiceByHospitalId'

export const Category = 'getAllCategories'
//main
export const AddSubService = 'addSubService'
export const updateService = 'updateSubService'
export const deleteService = 'deleteSubService'

//opt  SUb Service
export const subservice = 'getSubServicesByServiceId'
export const getSubServicesbyserviceId = 'serviceId'
export const getadminSubServicesbyserviceId = `getSubServicesByServiceId`

// Category Management

export const CategoryAllData = 'category/getCategories'

export const AddCategory = 'category/addCategory'

export const UpdateCategory = 'category/updateCategory'

export const deleteCategory = 'category/deleteCategory'

// Reassign Appointment

export const getData = 'admin/NotificationToAdminForProviderReassign'

export const postData = 'admin/providerReassign'

// Clinic Registration

export const ClinicAllData = 'v1/clinic/getAllClinics'

export const clinicPost = 'v1/clinic/addClinic'

//payouts
export const Customer_Url = `${wifiUrl}/api`
export const getAllPayouts = 'payments/getallpayments'
export const addPayouts = 'payments/addpayment'

//** Customer Management- main **
export const AddCustomer = 'customers/onboard'
export const GetAllCustomers = 'customers/hospital'
// export const UpdateCustomer = 'customers'
// export const DeleteCustomer = 'customers'
// export const GetCustomerByCustomerId = 'customers'
export const Customer = 'customers'

export const GetCustomersByHospitalId = 'customers/hospital'
export const GetCustomersByBranchId = 'customers/branch'
export const GetCustomersByHospitalIdAndBranchId = 'customers/hospital'

//ConsentForm
export const AddConsent = '/consent-form'
export const EditConsent = '/consent-form'
export const DeleteConsent = '/deleteConsentFormById'
export const GetGenericConsent = '/consent-form'
export const AddProcedureConsent = '/consent-form'
export const GetProcedureConsent = 'consent-form'

//Vitals
export const GetVitalsByPatientId = '/getVitals'
export const AddVitals = 'addingVitals'
export const UpdateVitals = '/updateVitals'
export const DeleteVitals = '/deleteVitals'
