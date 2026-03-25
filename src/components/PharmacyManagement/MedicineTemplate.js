import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CRow,
  CCol,
  CFormTextarea,
  CCardBody,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
} from '@coreui/react'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import CreatableSelect from 'react-select/creatable'
import Pagination from '../../Utils/Pagination'
import ConfirmationModal from '../ConfirmationModal'
import {
  getMedicineTypes,
  getPrescriptionsByClinicId,
  saveMedicineTemplate,
  updateMedicine,
  deletePrescriptionById,
  addMedicineType,
} from './PharmacyManagementAPI'
import { showCustomToast } from '../../Utils/Toaster'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useMedicines } from '../../Context/MedicineContext'
import Select from "react-select";

const MedicineTemplate = () => {
  const [medicineType, setMedicineType] = useState([])
const { medicines, fetchMedicines } = useMedicines()
  const [errors, setErrors] = useState({})  

  const [medicinestemplate, setMedicinestemplate] = useState([])
  const medicineOptions = medicines.map((medicine) => ({
  value: medicine.id,
  label: `${medicine.productName} - ${medicine.brandName} - ${medicine.composition} - ${medicine.category}`,
  data: medicine,
}));

  
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [viewData, setViewData] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [medicineList, setMedicineList] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [activeKey, setActiveKey] = useState(0)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [medicineIdToDelete, setMedicineIdToDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const slotOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' },
    { value: 'NA', label: 'NA' },
  ]
//   const medicineLists = [
//   { id: 1, name: "Paracetamol 500mg", brand: "Crocin", type: "Tablet", dose: "500mg" },
//   { id: 2, name: "Amoxicillin 250mg", brand: "Mox", type: "Capsule", dose: "250mg" },
//   { id: 3, name: "Azithromycin 500mg", brand: "Azee", type: "Tablet", dose: "500mg" },
//   { id: 4, name: "Ibuprofen 400mg", brand: "Brufen", type: "Tablet", dose: "400mg" },
//   { id: 5, name: "Cetirizine 10mg", brand: "Zyrtec", type: "Tablet", dose: "10mg" },
//   { id: 6, name: "Metformin 500mg", brand: "Glyciphage", type: "Tablet", dose: "500mg" },
//   { id: 7, name: "Pantoprazole 40mg", brand: "Pan", type: "Tablet", dose: "40mg" },
//   { id: 8, name: "ORS Powder", brand: "Electral", type: "Powder", dose: "1 Sachet" },
//   { id: 9, name: "Cough Syrup", brand: "Benadryl", type: "Syrup", dose: "5ml" },
//   { id: 10, name: "Insulin Injection", brand: "Huminsulin", type: "Injection", dose: "10 IU" },
//   { id: 11, name: "Diclofenac Gel", brand: "Voveran", type: "Ointment", dose: "Pea-sized" },
//   { id: 12, name: "Vitamin C 500mg", brand: "Limcee", type: "Tablet", dose: "500mg" }
// ];
// const medicineTypes = [
//   "Tablet",
//   "Capsule",
//   "Syrup",
//   "Injection",
//   "Ointment",
//   "Powder",
//   "Drops",
//   "Inhaler",
//   "Gel"
// ];

  const initialFormData = {
    id: null,
    serialNumber: '',
    name: '',
    brandName: '',
    manufacturingLicenseNumber: '',
    batchNumber: '',
    dateOfManufacturing: '',
    dateOfExpriy: '',
    nameAndAddressOfTheManufacturer: '',
    stock: '',
    dose: '',
    medicineType: '',
    duration: '',
    durationUnit: '',
    remindWhen: '',
    times: [],
    food: '',
    note: '',
    others: '',
  }

  const [formData, setFormData] = useState(initialFormData)
  const showOthersField = () => {
    return formData.durationUnit === 'Hour' || formData.durationUnit === 'NA'
  }
  // ================================
  // Fetch Medicine Types
  // ================================
//   useEffect(() => {
//     const fetchTypes = async () => {
//       const clinicId = localStorage.getItem('HospitalId')
//       if (!clinicId) return
//       const types = await getMedicineTypes(clinicId)
//       setMedicineType(types || [])
//     }
//     fetchTypes()
//   }, [])
//   const handleChangeMedicine = (selectedName) => {
//   const selectedMedicine = medicineList.find(
//     (med) => med.name === selectedName
//   );

//   if (selectedMedicine) {
//     setFormData({
//       ...formData,
//       name: selectedMedicine.name,
//       dose: selectedMedicine.dose,
//       medicineType: selectedMedicine.type
//     });
//   }
// };

  // ================================
  // Fetch Medicines
  // ================================
 

 const fetchMedicinesTemplate = async () => {
  try {
    const prescriptions = await getPrescriptionsByClinicId();

    console.log("Prescriptions:", prescriptions);

    if (prescriptions && prescriptions.length > 0) {
      const allMeds = prescriptions.flatMap((p) => p.medicines || []);
      setMedicinestemplate(allMeds);
    } else {
      setMedicinestemplate([]);
    }
  } catch (error) {
    console.error("Error fetching medicines:", error);
  }
};
   useEffect(() => {
     fetchMedicines();  
    fetchMedicinesTemplate()
  }, [])

  // ================================
  // Handle Change
  // ================================
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }
  
const MedicineChange = (field, value) => {
  if (field === "medicineId") {
    const selectedMedicine = medicineLists.find(
      (med) => med.id === Number(value)
    );

    if (selectedMedicine) {
      setFormData({
        ...formData,
        medicineId: value,
        medicineType: selectedMedicine.type,
        dose: selectedMedicine.dose,
      });
      return;
    }
  }

  setFormData({
    ...formData,
    [field]: value,
  });
};

  const validateForm = () => {
    const errors = {}
 const medicineRegex = /^[A-Za-z0-9\s.,\-()\/+%]*$/
 const licenseRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d-\/ ]+$/;

    // ✅ Must contain at least one alphabet
    const hasAlphabet = /[A-Za-z]/

    // ----------------------------
    // Medicine Info
    // ----------------------------
    if (!formData.name?.trim()) {
      errors.name = 'Product Name is required'
    } else if (!medicineRegex.test(formData.name.trim())) {
      errors.name = 'Only letters, numbers, and symbols (.,-/+%) are allowed'
    } else if (!hasAlphabet.test(formData.name.trim())) {
      errors.name = 'Product Name must include at least one letter'
    }

    if (!formData.dose?.trim()) {
      errors.dose = 'Dosage is required'
    } else if (!medicineRegex.test(formData.dose.trim())) {
      errors.dose = 'Only letters, numbers, and symbols (.,-/+%) are allowed'
    } else if (!hasAlphabet.test(formData.dose.trim())) {
      errors.dose = 'Dosage must include at least one letter'
    }

    if (!formData.medicineType?.trim()) {
      errors.medicineType = 'Medicine Type is required'
    } else if (!medicineRegex.test(formData.medicineType.trim())) {
      errors.medicineType = 'Only letters, numbers, and symbols (.,-/+%) are allowed'
    } else if (!hasAlphabet.test(formData.medicineType.trim())) {
      errors.medicineType = 'Medicine Type must include at least one letter'
    }

    // Prescription Info
    if (!formData.duration) errors.duration = 'Duration is required'
    if (!formData.durationUnit) errors.durationUnit = 'Unit is required'
    if (!formData.times || formData.times.filter(Boolean).length === 0)
      errors.times = 'At least one Time Slot is required'
    if (!formData.food) errors.food = 'Food Instructions are required'

    // Manufacturer / Inventory Info
  

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  // ================================
  // Save (Add or Update)
  // ================================
  const handleSave = async () => {
    console.log('Clicked Save, formData:', formData)

    // if (!validateForm()) return

    try {
      setLoading(true)
      if (formData.id) {
        // UPDATE FLOW
        console.log('Updating medicine template with ID:', formData.id)
        const updatedMedicine = await updateMedicine(formData.id, formData)
        await fetchMedicinesTemplate()
        showCustomToast('Medicine Template updated successfully!', 'success')
      } else {
        // ADD FLOW
        console.log('Adding new medicine template...')
        const newMedicine = await saveMedicineTemplate(formData)

        if (!newMedicine.id) {
          console.error('❌ API did not return an ID for the new medicine', newMedicine)
          showCustomToast('Failed to add medicine! ID missing.', 'error')
          return
        }

       await fetchMedicinesTemplate()
        showCustomToast('Medicine Template added successfully!', 'success')
      }

      // ✅ Reset modal & state
      setShowModal(false)
      setFormData(initialFormData)
      setFormErrors({})
      fetchMedicinesTemplate()
    } catch (error) {
      console.error('Error saving medicine:', error)
      // showCustomToast('Failed to save medicine!', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ================================
  // Edit Data
  // ================================
 const handleEdit = (medicine) => {
  console.log("Editing medicine:", medicine);

  const selectedMedicine = medicines.find(
    (m) =>
      m.productName === medicine.name &&
      m.brandName === medicine.brandName
  );

  setFormData({
    ...medicine,
    medicineId: selectedMedicine?.id || "",
  });

  setShowModal(true);
};
    const handleView = (medicine) => {
    setViewData(medicine)
    setViewModal(true)
  }

  const handleDelete = (id) => {
    setMedicineIdToDelete(id)
    setIsDeleteModalVisible(true)
  }
 

  const handleCreateMedicineType = async (inputValue) => {
    try {
      const clinicId = localStorage.getItem('HospitalId')
      if (!clinicId) return showCustomToast('Clinic ID missing!', 'error')

      // Call API to add new medicine type
      const updatedTypes = await addMedicineType({ clinicId, typeName: inputValue })

      if (updatedTypes && updatedTypes.length > 0) {
        // Update local state only if new type is not already present
        if (!medicineType.includes(inputValue)) {
          setMedicineType((prev) => [...prev, inputValue])
        }

        // Set the selected type in form
        handleChange('medicineType', inputValue)
        showCustomToast(`New medicine type added: ${inputValue}`, 'success')
      }
    } catch (error) {
      console.error('❌ Error adding medicine type:', error)
      // showCustomToast('Error adding medicine type!', 'error')
    }
  }

 const filteredMedicines = medicinestemplate.filter((med) =>
  `${med.name} ${med.brandName} ${med.dose}`
    .toLowerCase()
    .includes(search.toLowerCase())
)

  const slotCount = () => {
    switch (formData.remindWhen) {
      case 'Once a day':
        return 1
      case 'Twice a day':
        return 2
      case 'Thrice a day':
        return 3
      default:
        return 3
    }
  }
  const showFrequencyAndTimes = () => {
    const unit = formData.durationUnit
    return unit !== 'Hour' && unit !== '' && unit !== 'NA'
  }
  const getFrequencyOptions = (unit) => {
    switch (unit) {
      case 'Day':
        return ['Once a day', 'Twice a day', 'Thrice a day']
      case 'Week':
        return ['Once a week', 'Twice a week', 'Thrice a week']
      case 'Month':
        return ['Once a month', 'Twice a month']
      default:
        return ['Once', 'Twice', 'Thrice'] // For custom/other
    }
  }
  const isFrequencyDisabled = () => {
    const unit = formData.durationUnit
    return unit === 'Hour' || unit === 'NA' || !unit
  }

  const isTimeslotDisabled = () => {
    return isFrequencyDisabled() // same logic
  }
  const confirmDeleteMedicine = async () => {
    if (!medicineIdToDelete) return

    setDelLoading(true)

    try {
      const success = await deletePrescriptionById(medicineIdToDelete)

      if (success) {
        setMedicinestemplate((prev) => prev.filter((med) => med.id !== medicineIdToDelete))
        showCustomToast('Medicine Template deleted successfully!', 'success')
      } else {
        showCustomToast('Failed to delete medicine!', 'error')
      }
    } catch (error) {
      console.error('Error deleting medicine:', error)
      // showCustomToast('An unexpected error occurred!', 'error')
    } finally {
      setIsDeleteModalVisible(false)
      setMedicineIdToDelete(null)
      setDelLoading(false)
    }
  }

  return (
    <div className="w-100">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CFormInput
          placeholder="Search Medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '250px' }}
        />
        <CButton
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
                onClick={() => {
                  setFormData(initialFormData) // Reset form for adding
                  setFormErrors({}) // Clear previous errors
                  setShowModal(true) // Open modal
                }}
              >
                Add Medicine Template
              </CButton>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <CTable striped bordered>
          <CTableHead className="pink-table w-auto">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Product Name</CTableHeaderCell>
              <CTableHeaderCell>Dosage</CTableHeaderCell>
              <CTableHeaderCell>Medicine Type</CTableHeaderCell>
              <CTableHeaderCell>Duration</CTableHeaderCell>
              <CTableHeaderCell>Frequency</CTableHeaderCell>
              <CTableHeaderCell>Time</CTableHeaderCell>
              {/* <CTableHeaderCell>Instructions</CTableHeaderCell>
                    <CTableHeaderCell>Notes</CTableHeaderCell> */}
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className="pink-table">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((med, index) => (
                <CTableRow key={med.id}>
                  <CTableDataCell>{(currentPage - 1) * pageSize + index + 1}</CTableDataCell>
                  <CTableDataCell>{med.name}</CTableDataCell>
                  <CTableDataCell>{med.dose}</CTableDataCell>
                  <CTableDataCell>{med.medicineType}</CTableDataCell>
                  <CTableDataCell>
                    {med.duration}{' '}
                    {med.duration > 1
                      ? med.durationUnit.endsWith('s')
                        ? med.durationUnit
                        : `${med.durationUnit}s`
                      : med.durationUnit}
                  </CTableDataCell>
                  <CTableDataCell>{med.remindWhen}</CTableDataCell>
                  <CTableDataCell>{med.times?.join(', ')}</CTableDataCell>
                  {/* <CTableDataCell>{med.food}</CTableDataCell> */}
                  {/* <CTableDataCell>{med.note}</CTableDataCell> */}
                  <CTableDataCell className="text-center">
                    {' '}
                    {/* Change from text-end to text-center */}
                    <div className="d-flex justify-content-center gap-2">
                      {/* View */}
                      <button className="actionBtn" onClick={() => handleView(med)} title="View">
                        <Eye size={18} />
                      </button>

                      {/* Edit */}
                      <button className="actionBtn" onClick={() => handleEdit(med)} title="Edit">
                        <Edit2 size={18} />
                      </button>

                      {/* Delete */}
                      <button
                        className="actionBtn"
                        onClick={() => handleDelete(med.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
  <CTableDataCell colSpan={8} className="text-center text-muted">
    No Medicine data found
  </CTableDataCell>
</CTableRow>

            )}
          </CTableBody>
        </CTable>

        {/* PAGINATION */}
        {filteredMedicines.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredMedicines.length / pageSize)}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader className="bg-light border-bottom">
          <CModalTitle className="fw-bold">
            {formData.id ? '✏️ Edit Medicine Template' : '➕ Add Medicine Template'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* Medicine Info Section */}
          <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
            Medicine Information
          </h6>
          <CRow className="g-3 mb-3">
 <CCol md={12}>
  <div>
    <label>
      Product Name <span className="text-danger">*</span>
    </label>

    <Select
      placeholder="Search Product..."
      options={medicineOptions}
      isSearchable
      value={medicineOptions.find(
        (option) => String(option.value) === String(formData.medicineId)
      ) || null}
      onChange={(selectedOption) => {
        const selectedMedicine = selectedOption?.data;

        setFormData((prev) => ({
          ...prev,
          medicineId: selectedOption?.value || "",
          name: selectedMedicine?.productName || "",
          brandName: selectedMedicine?.brandName || "",
          nameAndAddressOfTheManufacturer: selectedMedicine?.manufacturer || "",
          dose: selectedMedicine?.composition || "",
          medicineType: selectedMedicine?.category || "",
        }));
      }}
      isClearable
    />
  </div>
</CCol>
            

          {/* <CCol md={6}>
  <CFormInput
    label={
      <>
        Dosage <span className="text-danger">*</span>
      </>
    }
    placeholder="100mg or Pea-sized"
    value={formData.dose || ""}
    onChange={(e) => handleChange("dose", e.target.value)}
  />
   
</CCol>
         <CCol md={6}>
  <CFormSelect
    label={
      <>
        Brand Name <span className="text-danger">*</span>
      </>
    }
    value={formData.brandName || ""}
    onChange={(e) => handleChange("brandName", e.target.value)}
  >
    <option value="">Select Brand Name</option>

    {medicines.map((medicine) => (
      <option key={medicine.id} value={medicine.brandName}>
        {medicine.brandName}
      </option>
    ))}
  </CFormSelect>

  {errors.brandName && (
    <small className="text-danger">{errors.brandName}</small>
  )}
</CCol>
       <CCol md={6}>
  <CFormInput
    label={
      <>
        Medicine Type <span className="text-danger">*</span>
      </>
    }
    value={formData.medicineType || ""}
    readOnly
  />
</CCol> */}
          </CRow>

          {/* Prescription Section */}
          <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
            Prescription Details
          </h6>
          <CRow className="g-3 mb-3">
            <CCol md={4}>
              <CFormInput
                type="number"
                label={
                  <>
                    Duration <span className="text-danger">*</span>
                  </>
                }
                placeholder="e.g., 7"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
              />
              {formErrors.duration && <small className="text-danger">{formErrors.duration}</small>}
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label={
                  <>
                    Duration Unit <span className="text-danger">*</span>
                  </>
                }
                value={formData.durationUnit}
                onChange={(e) => handleChange('durationUnit', e.target.value)}
              >
                <option value="">-- Select Unit --</option>
                <option value="Hour">Hour</option>
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="NA">NA</option>
              </CFormSelect>
              {formErrors.durationUnit && (
                <small className="text-danger">{formErrors.durationUnit}</small>
              )}
            </CCol>

            <CCol md={4}>
              <CFormInput
                label="Others"
                placeholder="Enter details..."
                value={formData.others}
                onChange={(e) => handleChange('others', e.target.value)}
              />
              {/* Optional field, so no validation message */}
            </CCol>

            <CCol md={4}>
              <CFormSelect
                label={
                  <>
                    Frequency <span className="text-danger">*</span>
                  </>
                }
                value={formData.remindWhen}
                onChange={(e) => handleChange('remindWhen', e.target.value)}
                disabled={isFrequencyDisabled()} // disabled when Hour or NA
              >
                <option value="">-- Select Frequency --</option>
                {getFrequencyOptions(formData.durationUnit).map((freq, idx) => (
                  <option key={idx} value={freq}>
                    {freq}
                  </option>
                ))}
              </CFormSelect>
              {formErrors.remindWhen && (
                <small className="text-danger">{formErrors.remindWhen}</small>
              )}
            </CCol>

            <CCol md={4}>
              <CFormSelect
                label={
                  <>
                    Food Instructions <span className="text-danger">*</span>
                  </>
                }
                value={formData.food}
                onChange={(e) => handleChange('food', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Before Food">Before Food</option>
                <option value="After Food">After Food</option>
                <option value="With Food">With Food</option>
                <option value="NA">NA</option>
              </CFormSelect>
              {formErrors.food && <small className="text-danger">{formErrors.food}</small>}
            </CCol>
          </CRow>

          {/* Time Slots */}
          <CRow className="g-3 mb-3">
            {[...Array(3)].map((_, i) => {
              const taken = new Set((formData.times || []).filter(Boolean))
              return (
                <CCol md={4} key={i}>
                  <CFormSelect
                    label={
                      <>
                        Time Slot {i + 1} <span className="text-danger">*</span>
                      </>
                    }
                    value={formData.times?.[i] || ''}
                    onChange={(e) => {
                      const updatedTimes = [...(formData.times || [])]
                      updatedTimes[i] = e.target.value
                      handleChange('times', updatedTimes)
                    }}
                    disabled={i >= slotCount() || isTimeslotDisabled()} // disable when necessary
                  >
                    <option value="">Select Time…</option>
                    {slotOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={formData.times?.[i] !== opt.value && taken.has(opt.value)}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </CFormSelect>
                  {formErrors.times && i === 0 && (
                    <small className="text-danger">{formErrors.times}</small>
                  )}
                </CCol>
              )
            })}
          </CRow>

          {/* Instructions */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormTextarea
                label="Notes / Special Instructions"
                placeholder="Enter details..."
                rows={2}
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
              />
            </CCol>
          </CRow>

          {/* Inventory Section */}
          <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
            Inventory Information
          </h6>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormInput
                label="Serial Number"//TODO: remove this once discuused with backend
                value={formData.serialNumber}
                onChange={(e) => {
                  const onlyNums = e.target.value // keep digits only
                  handleChange('serialNumber', onlyNums)
                }}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Brand Name"//TODO: reflect from backend
                value={formData.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              
              <CFormInput
              //TODO: reflect from backend
                label={
                  <>
                    Manufacturer 
                  </>
                }
                value={formData.nameAndAddressOfTheManufacturer}
                            onChange={(e) =>
  setFormData((prev) => ({
    ...prev,
    nameAndAddressOfTheManufacturer: e.target.value,
  }))
}

              />
           
            </CCol>
          <CCol md={6}>
  <CFormInput
  //TODO: reflect from backend
    type="date"
    label={
      <>
        Manufacturing Date <span className="text-danger">*</span>
      </>
    }
    value={formData.dateOfManufacturing || ''}
    onKeyDown={(e) => e.preventDefault()}
    onPaste={(e) => e.preventDefault()}
    onDrop={(e) => e.preventDefault()}
    style={{ cursor: 'pointer' }}
    onChange={(e) => {
      const selectedMfg = e.target.value
      handleChange('dateOfManufacturing', selectedMfg)

      if (formData.dateOfExpriy && formData.dateOfExpriy <= selectedMfg) {
        handleChange('dateOfExpriy', '')
      }
    }}
  />
  {formErrors.dateOfManufacturing && (
    <small className="text-danger">{formErrors.dateOfManufacturing}</small>
  )}
</CCol>

<CCol md={6}>
  <CFormInput
  //TODO: reflect from backend
    type="date"
    label={
      <>
        Expiry Date <span className="text-danger">*</span>
      </>
    }
    value={formData.dateOfExpriy || ''}
    min={formData.dateOfManufacturing || undefined}
    onKeyDown={(e) => e.preventDefault()}
    onPaste={(e) => e.preventDefault()}
    onDrop={(e) => e.preventDefault()}
    style={{ cursor: 'pointer' }}
    onChange={(e) => {
      const selectedExp = e.target.value
      if (formData.dateOfManufacturing && selectedExp <= formData.dateOfManufacturing) {
        showCustomToast('Expiry date must be after Manufacturing date', 'error')
        return
      }
      handleChange('dateOfExpriy', selectedExp)
    }}
  />
  {formErrors.dateOfExpriy && (
    <small className="text-danger">{formErrors.dateOfExpriy}</small>
  )}
</CCol>


         <CCol md={6}>
  <CFormInput
    label={
      <>
        License Number 
        <span className="text-danger">*</span> 
      </>
    }//TODO: remove this once discused with backend
    value={formData.manufacturingLicenseNumber || ''}
    onChange={(e) => {
      const value = e.target.value

      handleChange('manufacturingLicenseNumber', value)

      const licenseRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d-\/ ]+$/

      if (!value) {
        setFormErrors((prev) => ({
          ...prev,
          manufacturingLicenseNumber: 'License Number is required',
        }))
      } else if (!licenseRegex.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          manufacturingLicenseNumber:
            'License number must contain both letters and numbers',
        }))
      } else {
        setFormErrors((prev) => ({ ...prev, manufacturingLicenseNumber: '' }))
      }
    }}
  />

  {formErrors.manufacturingLicenseNumber && (
    <small className="text-danger">{formErrors.manufacturingLicenseNumber}</small>
  )}
</CCol>


            <CCol md={6}>
              <CFormInput
                type="number"
    //TODO: remove this once discused with backend
                label="Stock"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
              />
              
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="d-flex justify-content-end">
          <CButton color="secondary" onClick={() => setFormData(initialFormData)}>
            Reset
          </CButton>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>

          <CButton
            onClick={handleSave}
            disabled={loading}
            style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2 "
                  style={{ color: 'var(--color-black)' }}
                  role="status"
                />
                Saving...
              </>
            ) : (
              'Save Medicine Template'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* VIEW MODAL */}
      <CModal
        visible={viewModal}
        onClose={() => setViewModal(false)}
        size="lg"
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle>
            <span role="img" aria-label="pill">
              💊
            </span>{' '}
            Medicine Details
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewData && (
            <div className="p-3">
              <CCard className="mb-3 shadow-sm border-0">
                <CCardBody>
                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>📌 ProductName:</strong> <span>{viewData.name}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>💊 Dosage:</strong> <span>{viewData.dose}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>🔖 Medicine Type:</strong> <span>{viewData.medicineType}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>⏳ Duration:</strong>{' '}
                      <span>
                        {viewData.duration} {viewData.durationUnit}
                      </span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>⏰ Frequency:</strong> <span>{viewData.remindWhen}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>🕑 Times:</strong> <span>{viewData.times?.join(', ')}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>🍽 Instructions:</strong> <span>{viewData.food}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>📝 Notes:</strong> <span>{viewData.note}</span>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <h6 className="fw-bold mb-3">📦 Stock & Manufacturer Details</h6>
              <CCard className="shadow-sm border-0">
                <CCardBody>
                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>🔢 Serial No:</strong> <span>{viewData.serialNumber}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>🏷 Brand:</strong> <span>{viewData.brandName}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>📜 License No:</strong>{' '}
                      <span>{viewData.manufacturingLicenseNumber}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>🏭 Manufacturer:</strong>{' '}
                      <span>{viewData.manufacturer}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>📅 MFG Date:</strong> <span>{viewData.dateOfManufacturing}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>⏳ Expiry Date:</strong> <span>{viewData.dateOfExpriy}</span>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol>
                      <strong>📦 Stock:</strong> <span>{viewData.stock}</span>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        isLoading={delloading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={confirmDeleteMedicine}
        onCancel={() => {
          setIsDeleteModalVisible(false)
          setMedicineIdToDelete(null)
        }}
      />
    </div>
  )
}

export default MedicineTemplate
