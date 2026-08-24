export const formatWhatsAppMessage = ({
  status = 'booked', // 'booked', 'updated', 'rescheduled', 'cancelled'
  patientName = 'Patient',
  doctorName = 'your doctor',
  serviceDate,
  serviceTime,
  bookingId = '',
  isSession = false,
  sessionNo = '',
  invoiceUrl = '',
  billAmount = '',
  balanceDue = ''
}) => {
  const clinicName = sessionStorage.getItem('HospitalName') || 'Clinic';
  const branchName = sessionStorage.getItem('branchName') || 'Branch';

  const selectedHospital = JSON.parse(sessionStorage.getItem('selectedHospital') || '{}');
  const hospitalData = selectedHospital?.data || {};

  // Extract branch-specific info if available
  const currentBranchId = sessionStorage.getItem('branchId');
  const storedBranches = JSON.parse(sessionStorage.getItem('clinicBranches') || '[]');
  const branches = storedBranches.length ? storedBranches : (hospitalData.branches || selectedHospital.branches || []);
  const activeBranch = branches.find((b) => String(b.branchId) === String(currentBranchId) || String(b.id) === String(currentBranchId) || String(b._id) === String(currentBranchId)) || {};

  const clinicMobile = activeBranch.contactNumber || activeBranch.contact || activeBranch.mobileNumber || activeBranch.phone || hospitalData.contactNumber || hospitalData.contact || hospitalData.contact1 || hospitalData.mobileNumber || '';
  const clinicEmail = activeBranch.email || hospitalData.email || hospitalData.emailAddress || '';
  const clinicLocation = activeBranch.mapLocation || activeBranch.location || activeBranch.address || hospitalData.mapLocation || hospitalData.location || hospitalData.address || '';

  let header = '';
  if (status === 'invoice') {
    header = 'Invoice Details';
  } else if (status === 'cancelled') {
    header = isSession ? 'Session Cancellation' : 'Appointment Cancellation';
  } else if (status === 'rescheduled' || status === 'updated') {
    header = isSession ? 'Session Rescheduled' : 'Appointment Rescheduled';
  } else {
    header = isSession ? 'Session Confirmation' : 'Appointment Confirmation';
  }

  let actionText = '';
  if (status === 'cancelled') {
    actionText = 'has been cancelled.';
  } else if (status === 'rescheduled' || status === 'updated') {
    actionText = 'has been successfully rescheduled.';
  } else {
    actionText = 'has been successfully booked.';
  }

  const parts = [];

  parts.push(header);
  parts.push('');
  parts.push(clinicName);
  parts.push('');
  parts.push(`Hello ${patientName},`);

  if (status === 'invoice') {
    parts.push('Your invoice for the recent visit has been generated.');
    parts.push('');
    if (bookingId) parts.push(`Bill No: ${bookingId}`);
    if (serviceDate) parts.push(`Bill Date: ${serviceDate}`);
    if (billAmount) parts.push(`Total Amount: ${billAmount}`);
    if (balanceDue) parts.push(`Balance Due: ${balanceDue}`);
    parts.push('');
    parts.push('Please find your detailed receipt here:');
    parts.push(invoiceUrl);
  } else {
    parts.push(`Your ${isSession ? `treatment session (Session ${sessionNo})` : 'appointment'} ${actionText}`);
    parts.push('');
    parts.push(`Doctor: ${doctorName}`);
    if (serviceDate) parts.push(`Date: ${serviceDate}`);
    if (serviceTime) parts.push(`Time: ${serviceTime}`);
    if (bookingId) parts.push(`Booking ID: ${bookingId}`);
  }

  parts.push('');
  parts.push('Best Regards,');
  if (branchName) parts.push(`Branch: ${branchName}`);
  if (clinicMobile) parts.push(`Mobile: ${clinicMobile}`);
  if (clinicEmail) parts.push(`Email: ${clinicEmail}`);
  if (clinicLocation) parts.push(`Location: ${clinicLocation}`);
  parts.push('');
  parts.push('Thank you for choosing us.');
  parts.push('For assistance, please contact us.');

  return parts.join('\n');
};
