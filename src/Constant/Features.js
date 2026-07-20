// Dynamic retrieval of features from the backend
const getDynamicFeatures = () => {
  try {
    // Check if permissions are stored in sessionStorage or localStorage
    const storedPermissions = sessionStorage.getItem('permissions') || localStorage.getItem('permissions');
    if (storedPermissions) {
      const parsed = JSON.parse(storedPermissions);
      // The keys of the permissions object are the feature names
      if (typeof parsed === 'object' && parsed !== null) {
        const featureKeys = Object.keys(parsed);
        if (featureKeys.length > 0) return featureKeys;
      }
    }

    // Check if features are stored directly
    const storedFeatures = sessionStorage.getItem('features') || localStorage.getItem('features');
    if (storedFeatures) {
      const parsed = JSON.parse(storedFeatures);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Check inside clinicDetails as a fallback
    const clinicDetailsStr = sessionStorage.getItem('clinicDetails') || localStorage.getItem('clinicDetails');
    if (clinicDetailsStr) {
      const clinicDetails = JSON.parse(clinicDetailsStr);
      const clinicFeatures = clinicDetails.features || clinicDetails.modules || clinicDetails.packageFeatures;
      if (Array.isArray(clinicFeatures) && clinicFeatures.length > 0) {
        return clinicFeatures;
      }
    }
  } catch (error) {
    console.error('Failed to parse dynamic features:', error);
  }
  return null;
}

const staticFeatures = [
  'Dashboard',
  'Employee management',
  'Doctors',
  'Therapist',
  "Activity Library",
  'Lab Technician',
  'Administrator',
  'FrontDesk',
  'Security',
  'OtherStaff',
  'Appointments',
  'LabReport Management',
  'Therapy Management',
  'Program Management',
  'Package Management',
  'Tests',
  'Payouts',
  'Help',
  'Customer Management',
  'ConsentForms',
  'Vendor Management',
  'Push Notification',
  'Support',
  'Billing',
  'Analytics',
  'Tax reports',
  'Refered By Doctor',
  'Patient Management',
  'Recovery Support',
  'Attendance Reports',
];

export const features = getDynamicFeatures() || staticFeatures

export const actions = ['create', 'read', 'update', 'delete']

