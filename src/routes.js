import React from 'react'
import NotificationPanel from './views/PushNotification/PushNotificationScreen'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Doctors = React.lazy(() => import('./views/Doctors/DoctorManagement'))
const ConsentForms = React.lazy(() => import('./views/ConsentForms/ConsentForms'))
const Nurse = React.lazy(() => import('./views/EmployeeManagement/NurseManagement/Nurse'))
const Receptionist = React.lazy(() => import('./views/ReceptionistManagement/Receptionist'))
const EmployeeManagement = React.lazy(() => import('./views/EmployeeManagement/EmployeeManagement'))
const Disease = React.lazy(() => import('./views/DiseaseManagement/DiseaseManagement'))
const Tests = React.lazy(() => import('./views/TestsManagement/TestsManagement'))
const Treatments = React.lazy(() => import('./views/TreatmentsManagement/TreatmentsManagement'))
const DoctorNotifications = React.lazy(
  () => import('./views/DoctorNotifications/DoctorNotificationsManagement'),
)
const ConsentFormPage = React.lazy(() => import('./views/AppointmentManagement/ConsentForm'))
const ProcedureManagement = React.lazy(
  () => import('./views/ProcedureManagement/ProcedureManagement'),
)
const Payouts = React.lazy(() => import('./views/Payouts/Payoutmanagement'))
const Help = React.lazy(() => import('./views/Help/Help'))
const Resetpassword = React.lazy(() => import('./views/Resetpassword'))
const DoctorDetailspage = React.lazy(() => import('./views/Doctors/DoctorDetailspage'))
const AppointmentManagement = React.lazy(
  () => import('./views/AppointmentManagement/appointmentManagement'),
)
const AppointmentDetailsPage = React.lazy(
  () => import('./views/AppointmentManagement/AppointmentDeatils'),
)
const Reports = React.lazy(() => import('./views/Reports/reportManagement'))
const ReportsDetails = React.lazy(() => import('./views/Reports/ReportDetails'))
const CustomerViewDetails = React.lazy(
  () => import('./views/customerManagement/CustomerViewDetails'),
)
const CustomerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))
const LabTechnicianManagement = React.lazy(
  () => import('./views/EmployeeManagement/LabTechnicians/LabTechniciansManagement'),
)
const PackageManagement = React.lazy(() => import('./views/Packages/PackageManagement'))
const FrontDeskManagement = React.lazy(
  () => import('./views/EmployeeManagement/FrontDesk/FrontDeskManagement'),
)
const PharmacistManagement = React.lazy(
  () => import('./views/EmployeeManagement/Pharmacist/PharmacistManagement'),
)
const ReferDoctorManagement = React.lazy(
  () => import('./views/EmployeeManagement/ReferDoctor/ReferDoctorManagement'),
)
const SecurityManagement = React.lazy(
  () => import('./views/EmployeeManagement/Security/SecurityManagement'),
)
const AdminManagement = React.lazy(
  () => import('./views/EmployeeManagement/Administrator/AdminManagement'),
)
const OtherStaffManagement = React.lazy(
  () => import('./views/EmployeeManagement/OtherStaff/OtherStaffManagement'),
)
const PharmacyManagement = React.lazy(
  () => import('./components/PharmacyManagement/PharmacyManagement'),
)
const ActiveAppointmentsScreen = React.lazy(
  () => import('./views/AppointmentManagement/In-progressAppointmnets'),
)
const PatientManagement = React.lazy(() => import('./views/Patients/Patientmanagement'))
const ViewPurchaseBills = React.lazy(
  () => import('./components/PharmacyManagement/ViewPurchaseBills'),
)

const EmployeeList = React.lazy(() => import('./views/pages/attendance/EmployeeList'))

const ShiftMaster = React.lazy(() => import('./views/pages/attendance/ShiftMaster'))

const AttendanceEntry = React.lazy(() => import('./views/pages/attendance/AttendanceEntry'))

const AttendanceList = React.lazy(() => import('./views/pages/attendance/AttendanceList'))

const AttendanceReport = React.lazy(() => import('./views/pages/attendance/AttendanceReport'))

const MonthlyReport = React.lazy(() => import('./views/pages/attendance/MonthlyReport'))
const AttendanceMenu = React.lazy(() => import('./views/pages/attendance/AttendanceMenu'))
const AttendanceLayout = React.lazy(() => import('./views/pages/attendance/AttendanceLayout'))
const HolidayMaster = React.lazy(() => import('./views/pages/attendance/HolidayMaster'))
const LeaveRequest = React.lazy(() => import('./views/pages/attendance/LeaveRequest'))
const LeaveList = React.lazy(() => import('./views/pages/attendance/LeaveList'))
const LeaveApproval = React.lazy(() => import('./views/pages/attendance/LeaveApporal'))
const AssignShift = React.lazy(() => import('./views/pages/attendance/ShiftAssign'))


const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/employee-management/doctor', name: 'Doctors', element: Doctors },
  { path: '/consent-forms', name: 'Consent Forms', element: ConsentForms },

  { path: '/employee-management/nurse', name: 'Nurse', element: Nurse },
  { path: '/ref-doctor', name: 'Ref Doctor', element: ReferDoctorManagement },
  { path: '/employee-management/security', name: 'Security', element: SecurityManagement },
  { path: '/employee-management/otherstaff', name: 'Other Staff', element: OtherStaffManagement },
  { path: '/employee-management/frontdesk', name: 'Front Desk', element: FrontDeskManagement },
  { path: '/pharmacy/purchases/bills', name: 'View purchase bills', element: ViewPurchaseBills },
  {
    path: '/employee-management/lab-technician',
    name: 'Lab Technician',
    element: LabTechnicianManagement,
  },

  { path: '/employee-management/pharmacist', name: 'Pharmacist', element: PharmacistManagement },
  { path: '/employee-management', name: 'Employee Management', element: EmployeeManagement },

  { path: '/pharmacy-management', name: 'Pharmacy Management', element: PharmacyManagement },

  {
    path: '/package-management',
    name: 'Package Management',
    element: PackageManagement,
  },
  { path: '/receptionist', name: 'Receptionist', element: Receptionist },

  { path: '/disease', name: 'Disease Management', element: Disease },
  { path: '/tests', name: 'Tests', element: Tests },
  { path: '/treatments', name: 'Treatments', element: Treatments },
  { path: '/procedure-management', name: 'Procedure Management', element: ProcedureManagement },

  { path: '/payouts', name: 'Payouts', element: Payouts },
  { path: '/notification', name: 'Notification', element: NotificationPanel },
  { path: '/help', name: 'Help', element: Help },
  { path: '/reset-password', name: 'Reset Password', element: Resetpassword },

  { path: '/doctor/:id', name: 'Doctor Details', element: DoctorDetailspage },
  { path: '/consent-form', name: 'Consent Form', element: ConsentFormPage },

  { path: '/appointment-management', name: 'Appointments', element: AppointmentManagement },
  {
    path: '/appointment-details/:id',
    name: 'Appointment Details',
    element: AppointmentDetailsPage,
  },
  {
    path: '/employee-management/admin',
    name: 'Administrator',
    element: AdminManagement,
  },

  {
    path: '/in-progress',
    name: 'Active Appointments',
    element: ActiveAppointmentsScreen,
  },
  { path: '/report-management', name: 'Reports', element: Reports },
  { path: '/report-details/:id', name: 'Report Details', element: ReportsDetails },

  {
    path: '/customer-management/:customerId',
    name: 'Customer View Details',
    element: CustomerViewDetails,
  },
  { path: '/customer-management', name: 'Customer Management', element: CustomerManagement },
  { path: '/patient-management', name: 'Patient Management', element: PatientManagement },

  // Attendance
{
  path: "/attendance",
  element: AttendanceLayout,
  children: [
  { index: true, element: AttendanceList },
   { path: "employee-list", element: EmployeeList },
   { path: "shift-list", element: ShiftMaster },
   { path: "holiday", element: HolidayMaster },
   { path: "attendance-entry", element: AttendanceEntry },
   { path: "attendance-list", element: AttendanceList },
   { path: "report", element: AttendanceReport },
   { path: "monthly", element: MonthlyReport },
   { path: "leave", element: LeaveRequest },
   { path: "leave-list", element: LeaveList },
    { path: "leave-approval", element: LeaveApproval },
    { path: "assignShift", element: AssignShift },

    
 ],
}
  // { path: "/attendance", element: AttendanceMenu },
  // { path: '/employee-list', element: EmployeeList },
  // { path: '/shift-list', element: ShiftMaster },
  // { path: '/attendance-entry', element: AttendanceEntry },
  // { path: '/attendance-list', element: AttendanceList },
  // { path: '/report', element: AttendanceReport },
  // { path: '/monthly', element: MonthlyReport },
]

export default routes
