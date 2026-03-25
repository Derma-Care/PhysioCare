import React, { useState, useEffect,useRef } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react";
import Barcode from "react-barcode";
import Select from "react-select";
import { http,} from "../../Utils/Interceptors";
import { BASE_URL, wifiUrl } from "../../baseUrl";
import { splrUrl } from "../../baseUrl";
import axios from "axios";

import { Edit2, Eye, Trash } from "lucide-react";
import { useMedicines } from "../../Context/MedicineContext";
import { fetchMedicinesApi } from "../../APIs/medicineApi";
import LoadingIndicator from "../../Utils/loader";
import CreatableSelect from "react-select/creatable";
  




const AddMedicine = () => {
const { medicines, setMedicines, loading, fetchMedicines,fetchMedicineTypes,medicineTypes} = useMedicines()
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
//   const barcodeRef = useRef("");
// const lastKeyTime = useRef(0);
  const pageSize = 5;

const [viewModal, setViewModal] = useState(false);
const [selectedMedicine, setSelectedMedicine] = useState(null);
const [deleteModal, setDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const [errors, setErrors] = useState({});

 const categorySelectOptions = (medicineTypes || []).map((cat) => ({
  value: cat,
  label: cat,
}));
  const statusOptions = ["ACTIVE", "INACTIVE"];

  const hsnGstMap = {
  "3002": 5,   // vaccines / sera
  "3003": 5,   // medicaments not packaged
  "3004": 12,  // tablets, capsules, creams
  "3005": 12,  // bandages, surgical dressings
  "3006": 12,  // pharmaceutical goods
  "3304": 18,  // cosmetic creams / sunscreen
  "3305": 18,  // shampoos
  "3401": 18,  // medicated soap
  "3822": 12,  // diagnostic kits
  "9018": 18   // medical instruments
};

  const initialForm = {
  
    productName: "",
    brandName: "",
    category: "",
    composition: "",
    manufacturer: "",
    packSize: "",
    hsnCode: "",
    gstPercent: "",
    mrp: "",
    minStock: "",
    status: "",
    barcode: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const filteredMedicines = medicines.filter((med) => {
  const searchText = search.toLowerCase();

  return (
    (med.productName || "").toLowerCase().includes(searchText) ||
    (med.brandName || "").toLowerCase().includes(searchText) ||
    (med.barcode || "").toLowerCase().includes(searchText)
  );
});

  // Auto GST + Barcode
  const handleHsnChange = (value) => {
    const prefix = value.substring(0, 4);
    const gst = hsnGstMap[prefix] || "";

    setFormData((prev) => ({
      ...prev,
      hsnCode: value,
      gstPercent: gst,
      barcode: value ? `BC${value}${Date.now().toString().slice(-4)}` : "",
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  useEffect(() => {
  fetchMedicines();
  fetchMedicineTypes();
}, []);
const handleScan = async (barcodeValue) => {
  console.log("Scanned barcode:", barcodeValue);

  if (!barcodeValue) return;

  try {
   

    const response = await http.get(
      `${wifiUrl}/api/pharmacy/medicines/getMedicineByBarcode/${barcodeValue}`,
      
    );

    console.log("API response barcode:", response.data);

    const medicine = response?.data?.data;

    if (medicine) {
      setFormData(medicine);
      setEditMode(true);
      setShowModal(true);
    } else {
      console.log("Medicine not found");
    }
  } catch (error) {
    console.error("Barcode scan error:", error);
  }
};
// useEffect(() => {
//   const handleKeyDown = (e) => {
//     const now = Date.now();

//     // Reset barcode if delay is too long (manual typing)
//     if (now - lastKeyTime.current > 50) {
//       barcodeRef.current = "";
//     }

//     lastKeyTime.current = now;

//     if (e.key === "Enter") {
//       if (barcodeRef.current.length >= 6) {
//         console.log("Scanned barcode:", barcodeRef.current);
//         handleScan(barcodeRef.current);
//       }
//       barcodeRef.current = "";
//       return;
//     }

//     barcodeRef.current += e.key;
//   };

//   window.addEventListener("keydown", handleKeyDown);

//   return () => {
//     window.removeEventListener("keydown", handleKeyDown);
//   };
// }, []);

const handleCreateCategory = async (inputValue) => {
  try {
    const clinicId = localStorage.getItem("HospitalId");

    const response = await http.post(`${BASE_URL}/search-or-add`, {
      clinicId,
      medicineTypes: [inputValue],
    });

    console.log("New category added:", response.data);

    // Refresh categories from API
    fetchMedicineTypes();

    // Auto select new category
    setFormData((prev) => ({
      ...prev,
      category: inputValue,
    }));

  } catch (error) {
    console.error("Error adding category:", error);
  }
};


  // CREATE / UPDATE
const handleSave = async () => {
  if (!validateForm()) return;

  try {
      setSaving(true);
    const clinicId = localStorage.getItem("HospitalId");
    const branchId = localStorage.getItem("branchId");

    const payload = {
      ...formData,
      clinicId,
      branchId,
    };

    if (editMode) {
     const response= await http.put(`${wifiUrl}/api/pharmacy/medicines/updateMedicineById/${formData.id}`, payload);
      if(response.status === 200){
      console.log("Medicine successfully");

     fetchMedicines();
      console.log("Medicine updated successfully");
    }
    } else {
      await axios.post(
        `${wifiUrl}/api/pharmacy/medicines/addMedicine`
, payload);
 fetchMedicines();
    }

   
    setShowModal(false);
    setEditMode(false);
    setFormData(initialForm);
    setErrors({}); // clear errors

  } catch (error) {
    console.error("Save error:", error);
    
  }
  finally {
    setSaving(false);
  }
};
  const handleEdit = (med) => {
    setFormData(med);
    setEditMode(true);
    setShowModal(true);
  };

const confirmDelete = async () => {
  try {
     setDeleting(true);
    await http.delete(
      `${wifiUrl}/api/pharmacy/medicines/deleteMedicineByMedicineId/${deleteId}`,
      fetchMedicines()
    );

    // Update UI immediately
    setMedicines((prev) => prev.filter((m) => m.id !== deleteId));

    setDeleteModal(false);
    setDeleteId(null);

  } catch (error) {
    console.error("Delete error:", error);
  }
  finally {

    setDeleting(false);

  }
};

 


  // Pagination
  const paginatedData = filteredMedicines.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

// const fetchMedicines = async (searchText = "") => {
//   try {
//     setLoading(true);

//      const hospitalId = localStorage.getItem('HospitalId')
//     const branchId = localStorage.getItem("branchId");

//     const response = await http.get(BASE_URL, {
//       params: {
//         hospitalId,
//         branchId,
//         search: searchText,
//       },
//     });

//     setMedicines(response?.data?.data || []);
//   } catch (error) {
//     console.error("Fetch error:", error);
//   } finally {
//     setLoading(false);
//   }
// };
const validateForm = () => {
  let newErrors = {};

  // Product Name
  if (!formData.productName.trim()) {
    newErrors.productName = "Product Name is required";
  }

  // Category
  if (!formData.category) {
    newErrors.category = "Category is required";
  }

  // HSN
  if (!formData.hsnCode) {
    newErrors.hsnCode = "HSN Code is required";
  } else if (!/^\d{4,8}$/.test(formData.hsnCode)) {
    newErrors.hsnCode = "HSN must be 4 to 8 digits";
  }

  // MRP
  if (!formData.mrp) {
    newErrors.mrp = "MRP is required";
  } else if (Number(formData.mrp) <= 0) {
    newErrors.mrp = "MRP must be greater than 0";
  }

  // Min Stock
  if (!formData.minStock) {
    newErrors.minStock = "Min Stock is required";
  } else if (Number(formData.minStock) < 0) {
    newErrors.minStock = "Min Stock cannot be negative";
  }

  // Brand Name (optional)
  if (formData.brandName) {
    if (formData.brandName.length < 2) {
      newErrors.brandName = "Brand Name must be at least 2 characters";
    } else if (!/^[a-zA-Z0-9\s.&-]+$/.test(formData.brandName)) {
      newErrors.brandName = "Invalid characters in Brand Name";
    }
  }

  // Composition (optional)
  if (formData.composition) {
    if (!/^[0-9]+(\.?[0-9]+)?\s?(mg|ml|g|%|mcg)?$/i.test(formData.composition)) {
      newErrors.composition =
        "Enter valid composition (e.g., 500mg, 5%, 10ml)";
    }
  }

  // Manufacturer (required)
  if (!formData.manufacturer.trim()) {
    newErrors.manufacturer = "Manufacturer is required";
  } else if (formData.manufacturer.length < 3) {
    newErrors.manufacturer =
      "Manufacturer must be at least 3 characters";
  } else if (!/^[a-zA-Z0-9\s.&-]+$/.test(formData.manufacturer)) {
    newErrors.manufacturer = "Invalid characters in Manufacturer";
  }

  // Pack Size (required)
  if (!formData.packSize.trim()) {
    newErrors.packSize = "Pack Size is required";
  } else if (!/^[0-9]+\s?[a-zA-Z\s]+$/.test(formData.packSize)) {
    newErrors.packSize =
      "Enter valid pack size (e.g., 10 Tablets, 100 ml)";
  }

  // Status
  if (!formData.status) {
    newErrors.status = "Status is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
if (loading) {
    return LoadingIndicator({ message: "Loading medicines..." });
  }
  
  

  return (
    <div className="p-3">
    <CRow className="mb-3 align-items-center">
      <CCol md={4}>
  <CFormInput
    autoFocus
    placeholder="Scan Barcode..."
    value={scannedCode}
    onChange={(e) => setScannedCode(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleScan(scannedCode);
        setScannedCode("");
      }
    }}
  />
</CCol>
  <CCol md={4}>
<CFormInput
  placeholder="Search by Product, Brand, Barcode..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
</CCol>

  <CCol xs="auto">
    <CButton
     style={{ backgroundColor: "var(--color-black)", color: "#fff" }}
      onClick={() => fetchMedicines(search)}
    >
      Search
    </CButton>    
  </CCol>

  <CCol className="text-end">
    <CButton
      style={{ backgroundColor: "var(--color-black)", color: "#fff" }}
      onClick={() => {
        setFormData(initialForm);
        setEditMode(false);
        setShowModal(true);
      }}
    >
      Add Medicine
    </CButton>
  </CCol>
</CRow>

      {/* TABLE */}
      <CTable bordered striped responsive className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Product ID</CTableHeaderCell>
            <CTableHeaderCell>Product Name</CTableHeaderCell>
            <CTableHeaderCell>Brand Name</CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
            <CTableHeaderCell>HSN</CTableHeaderCell>
            <CTableHeaderCell>GST %</CTableHeaderCell>
            <CTableHeaderCell>MRP</CTableHeaderCell>
          <CTableHeaderCell>Bar Code</CTableHeaderCell>

            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((med) => (
              <CTableRow key={med.id}>
                <CTableDataCell>{med.id}</CTableDataCell>
                <CTableDataCell>{med.productName}</CTableDataCell>
                <CTableDataCell>{med.brandName}</CTableDataCell>

                <CTableDataCell>{med.category}</CTableDataCell>
                <CTableDataCell>{med.hsnCode}</CTableDataCell>
                <CTableDataCell>{med.gstPercent}%</CTableDataCell>
                <CTableDataCell>₹{med.mrp}</CTableDataCell>
                 <CTableDataCell>
                <Barcode
                  value={med.barcode}
                  format="CODE128"
                  width={1.5}
                  height={40}
                  displayValue={true}
                />
              </CTableDataCell>

                <CTableDataCell>{med.status}</CTableDataCell>
              <CTableDataCell className="text-end">
                          <div className="d-flex gap-2">
  {/* View Button */}
  <CButton
  // color="info"
  size="sm"
  className="actionBtn"
  
   style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
  onClick={() => {
    setSelectedMedicine(med);   // ✅ pass data
    setViewModal(true);         // ✅ correct state name
  }}
>
  <Eye size={18} />
</CButton>

  {/* Edit Button */}
   <CButton
      // color="warning"
      size="sm"
      className="actionBtn"
       style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
      onClick={() => handleEdit(med)}
    >
      <Edit2 size={18} />
    </CButton>

 {/* DELETE */}
    <CButton
      // color="danger"
      size="sm"
      className="actionBtn"
       style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
    onClick={() => {
  setDeleteId(med.id);     // store id
  setDeleteModal(true);    // open confirmation modal
}}
    >
      <Trash size={18} />
    </CButton>
</div>

                          </CTableDataCell>

 
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={9} className="text-center">
                No Data
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* MODAL */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editMode ? "Edit Medicine" : "Add Medicine"}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow className="g-3">
          
            <CCol md={6}>
             <CFormInput
  label="Product Name *"
  value={formData.productName}
  invalid={!!errors.productName}
  onChange={(e) => handleChange("productName", e.target.value)}
/>
{errors.productName && (
  <div className="text-danger small">{errors.productName}</div>
)}
            </CCol>

            <CCol md={6}>
             <CFormInput
  label="Brand Name"
  value={formData.brandName}
  invalid={!!errors.brandName}
  onChange={(e) => handleChange("brandName", e.target.value)}
/>

{errors.brandName && (
  <div className="text-danger small">
    {errors.brandName}
  </div>
)}
            </CCol>

           
        <CCol md={6}>
  <label className="form-label">
    Category <span className="text-danger">*</span>
  </label>

  <CreatableSelect
    options={categorySelectOptions}
    value={
      categorySelectOptions.find(
        (option) => option.value === formData.category
      ) || null
    }
    onChange={(selectedOption) =>
      setFormData((prev) => ({
        ...prev,
        category: selectedOption?.value || ""
      }))
    }
    onCreateOption={handleCreateCategory}
    placeholder="Select or Search Category"
    isSearchable
    isClearable
    menuPlacement="auto"
  />

  {errors.category && (
    <div className="text-danger small">{errors.category}</div>
  )}
</CCol>
            
           <CCol md={6}>
  <CFormInput
    label="Composition"
    value={formData.composition}
    invalid={!!errors.composition}
    onChange={(e) => handleChange("composition", e.target.value)}
  />
  {errors.composition && (
    <div className="text-danger small">{errors.composition}</div>
  )}
</CCol>

           <CCol md={6}>
  <CFormInput
    label="Manufacturer *"
    value={formData.manufacturer}
    invalid={!!errors.manufacturer}
    onChange={(e) => handleChange("manufacturer", e.target.value)}
  />
  {errors.manufacturer && (
    <div className="text-danger small">{errors.manufacturer}</div>
  )}
</CCol>

          <CCol md={6}>
  <CFormInput
    label="Pack Size *"
    value={formData.packSize}
    invalid={!!errors.packSize}
    onChange={(e) => handleChange("packSize", e.target.value)}
  />
  {errors.packSize && (
    <div className="text-danger small">{errors.packSize}</div>
  )}
</CCol>
            <CCol md={6}>
             <CFormInput
  label="HSN Code *"
  value={formData.hsnCode}
  invalid={!!errors.hsnCode}
  onChange={(e) => handleHsnChange(e.target.value)}
/>
{errors.hsnCode && (
  <div className="text-danger small">{errors.hsnCode}</div>
)}
            </CCol>
            
            

            <CCol md={6}>
              <CFormInput
                label="GST (%)"
                value={formData.gstPercent}
                readOnly
                disabled
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
  label="MRP"
  type="number"
  value={formData.mrp}
  invalid={!!errors.mrp}
  onChange={(e) => handleChange("mrp", e.target.value)}
/>
{errors.mrp && (
  <div className="text-danger small">{errors.mrp}</div>
)}
            </CCol>

            <CCol md={6}>
             <CFormInput
  label="Min Stock"
  type="number"
  value={formData.minStock}
  invalid={!!errors.minStock}
  onChange={(e) => handleChange("minStock", e.target.value)}
/>
{errors.minStock && (
  <div className="text-danger small">{errors.minStock}</div>
)}
            </CCol>

            <CCol md={6}>
              <CFormSelect
  label="Status *"
  value={formData.status}
  invalid={!!errors.status}
  onChange={(e) => handleChange("status", e.target.value)}
>
  <option value="">Select Status</option>
  {statusOptions.map((s, i) => (
    <option key={i} value={s}>
      {s}
    </option>
  ))}
</CFormSelect>

{errors.status && (
  <div className="text-danger small">{errors.status}</div>
)}
            </CCol>
            

           
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: "#fff" }}
            onClick={handleSave}
          >
            {editMode ? "Update" : "Save"}
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
  visible={viewModal}
  onClose={() => setViewModal(false)}
  size="lg"
>
  <CModalHeader>
    <CModalTitle>Medicine Details</CModalTitle>
  </CModalHeader>

  <CModalBody>
    {selectedMedicine && (
      <CRow className="g-3">
        <CCol md={6}>
          <strong>Product Name:</strong> {selectedMedicine.productName}
        </CCol>

        <CCol md={6}>
          <strong>Brand Name:</strong> {selectedMedicine.brandName}
        </CCol>

        <CCol md={6}>
          <strong>Category:</strong> {selectedMedicine.category}
        </CCol>

        <CCol md={6}>
          <strong>Composition:</strong> {selectedMedicine.composition}
        </CCol>

        <CCol md={6}>
          <strong>Manufacturer:</strong> {selectedMedicine.manufacturer}
        </CCol>

        <CCol md={6}>
          <strong>Pack Size:</strong> {selectedMedicine.packSize}
        </CCol>

        <CCol md={6}>
          <strong>HSN Code:</strong> {selectedMedicine.hsnCode}
        </CCol>

        <CCol md={6}>
          <strong>GST:</strong> {selectedMedicine.gstPercent}%
        </CCol>

        <CCol md={6}>
          <strong>MRP:</strong> ₹{selectedMedicine.mrp}
        </CCol>

        <CCol md={6}>
          <strong>Min Stock:</strong> {selectedMedicine.minStock}
        </CCol>

        <CCol md={6}>
          <strong>Status:</strong> {selectedMedicine.status}
        </CCol>

        <CCol md={12}>
          <strong>Barcode:</strong>
          <div className="mt-2">
            <Barcode
              value={selectedMedicine.barcode}
              format="CODE128"
              width={1.5}
              height={50}
              displayValue={true}
            />
          </div>
        </CCol>
      </CRow>
    )}
  </CModalBody>

  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => setViewModal(false)}
    >
      Close
    </CButton>
  </CModalFooter>
</CModal>
<CModal
  visible={deleteModal}
  onClose={() => setDeleteModal(false)}
>
  <CModalHeader>
    <CModalTitle>Confirm Delete</CModalTitle>
  </CModalHeader>

  <CModalBody>
    Are you sure you want to delete this medicine?
  </CModalBody>

  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => setDeleteModal(false)}
    >
      Cancel
    </CButton>

   <CButton
  color="danger"
  onClick={confirmDelete}
  disabled={deleting}
>
  {deleting ? (
    <>
      <CSpinner size="sm" className="me-2" />
      Deleting...
    </>
  ) : (
    "Delete"
  )}
</CButton>
  </CModalFooter>
</CModal>
    </div>
  );
};

export default AddMedicine;