import React from 'react'
import { toast } from 'react-toastify'
import { showCustomToast } from '../../Utils/Toaster'
import { COLORS } from '../../Constant/Themes'

const UserPermissionModal = ({
  show,
  onClose,
  features,
  actions,
  permissions,
  toggleFeature,
  toggleAllActions,
  togglePermission,
  toggleGlobalSelectAll,
  onSave,
}) => {
  if (!show) return null // Don't render if modal is hidden

  // List of features that depend on Employee Management
  const employeeRelatedFeatures = [
    'Doctors',
    'Therapist',
    // 'Pharmacist',
    'Lab Technician',
    'Administrator',
    'FrontDesk',
    'Security',
    'OtherStaff',
  ]

  const appointmnetRelatedFeatures = ['Reports']

  const isEmployeeManagementChecked = !!permissions['Employee management']
  const isAppointmnetManagementChecked = !!permissions['Appointments']

  const allFeaturesSelected = features.every((f) => {
    const isChecked = !!permissions[f]
    if (f === 'Dashboard' || f === 'Employee management') return isChecked
    return isChecked && permissions[f]?.length === actions.length
  })

  // Handler to check if we should block interaction
  const handleFeatureToggle = (feature) => {
    // Block Employee Management dependencies
    if (employeeRelatedFeatures.includes(feature) && !isEmployeeManagementChecked) {
      showCustomToast('Please select Employee Management first.', 'warning')
      return
    }

    // Block Appointment-related features (like Reports)
    if (appointmnetRelatedFeatures.includes(feature) && !isAppointmnetManagementChecked) {
      showCustomToast('Please select Appointments first.', 'warning')
      return
    }

    toggleFeature(feature)
  }

  return (
    <>
      <div className="modal fade show d-block custom-modal" tabIndex="-1" >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header d-flex justify-content-between align-items-center">
              <h5 className="modal-title">Set User Permissions</h5>
              <div className="d-flex align-items-center">
                <label className="fw-bold me-4 mb-0 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={allFeaturesSelected}
                    onChange={(e) => toggleGlobalSelectAll(e.target.checked)}
                  />
                  Select All Permissions
                </label>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
            </div>

            <div className="modal-body">
              <div className="row">
                {features.map((feature) => {
                  const isFeatureChecked = !!permissions[feature]
                  const allSelected =
                    isFeatureChecked && permissions[feature]?.length === actions.length

                  const isEmployeeDependent = employeeRelatedFeatures.includes(feature)
                  const isAppointmentDependent = appointmnetRelatedFeatures.includes(feature)

                  // Disable feature if its dependency is not checked
                  const isDisabled =
                    (isEmployeeDependent && !isEmployeeManagementChecked) ||
                    (isAppointmentDependent && !isAppointmnetManagementChecked)

                  return (
                    <div
                      key={feature}
                      className={`col-md-5 mb-3 border p-2 rounded mx-4 ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="fw-bold">
                          <input
                            type="checkbox"
                            disabled={false} // keep clickable for toast
                            checked={isFeatureChecked}
                            onChange={() => handleFeatureToggle(feature)}
                          />{' '}
                          {feature}
                        </label>

                        {/* Select All checkbox */}
                        {feature !== 'Dashboard' && feature !== 'Employee management' && (
                          <label>
                            <input
                              type="checkbox"
                              disabled={isDisabled || !isFeatureChecked}
                              checked={allSelected}
                              onChange={() => toggleAllActions(feature)}
                            />{' '}
                            Select All
                          </label>
                        )}
                      </div>

                      {/* Actions */}
                      {feature !== 'Dashboard' && feature !== 'Employee management' && (
                        <div className="d-flex flex-wrap gap-3 mt-2">
                          {actions.map((action) => (
                            <label key={action} className="d-flex align-items-center gap-1">
                              <input
                                type="checkbox"
                                disabled={isDisabled || !isFeatureChecked}
                                checked={permissions[feature]?.includes(action) || false}
                                onChange={() => togglePermission(feature, action)}
                              />
                              {action}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn" style={{ backgroundColor: COLORS.primary, color: 'white' }} onClick={onSave}>
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  )
}

export default UserPermissionModal
