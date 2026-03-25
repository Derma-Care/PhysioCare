// import https from 'https'
import axios from 'axios'
import { https } from '../../Utils/Interceptors'
import { wifiUrl } from '../../baseUrl'

// ======================================================
// GET ALL SUPPLIERS
// ======================================================
export const SupplierData = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/api/pharmacy/supplier/getAll`)
    console.log('Supplier data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching supplier data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
// ======================================================
// POST - ADD SUPPLIER
// ======================================================
// export const postSupplierData = async (supplierData) => {
//   try {
//     const requestData = {
//       supplierName: supplierData.supplierName || "",
//       gstNumber: supplierData.gstNumber || "",
//       registrationNumber: supplierData.registrationNumber || "",
//       cstNumber: supplierData.cstNumber || "",
//       form20B: supplierData.form20B || "",
//       form21B: supplierData.form21B || "",
//       address: supplierData.address || "",
//       city: supplierData.city || "",
//       area: supplierData.area || "",
//       nonLocalSupplier: supplierData.nonLocalSupplier ?? false,
//       active: supplierData.active ?? true,
//       contactDetails: {
//         state: supplierData.contactDetails?.state || "",
//         zipCode: supplierData.contactDetails?.zipCode || "",
//         telephoneNumber: supplierData.contactDetails?.telephoneNumber || "",
//         faxNumber: supplierData.contactDetails?.faxNumber || "",
//         contactPerson: supplierData.contactDetails?.contactPerson || "",
//         mobileNumber1: supplierData.contactDetails?.mobileNumber1 || "",
//         mobileNumber2: supplierData.contactDetails?.mobileNumber2 || "",
//         designation: supplierData.contactDetails?.designation || "",
//         department: supplierData.contactDetails?.department || "",
//         website: supplierData.contactDetails?.website || "",
//         email: supplierData.contactDetails?.email || "",
//       },
//     };

//     const response = await axios.post(
//       `${wifiUrl}/api/pharmacy/supplier/add`,
//       requestData,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     console.log("Add Supplier Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error adding supplier:", error.response?.data || error);
//     throw error;
//   }
// };

export const postSupplierData = async (requestData) => {
  try {
    console.log('Sending data to API')
    const response = await axios.post(`${wifiUrl}/api/pharmacy/supplier/add`, requestData, {
      //TODO:chnage when apigetway call axios to http
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error response:', error.response)
    alert(
      `Error: ${error.response?.status} - ${error.response?.data?.message || error.response?.statusText}`,
    )
    throw error
  }
}

// ======================================================
// PUT - UPDATE SUPPLIER
// ======================================================
export const updateSupplierData = async (updatedSupplier, supplierId) => {
  try {
    const requestData = {
      supplierName: updatedSupplier.supplierName || '',
      gstNumber: updatedSupplier.gstNumber || '',
      registrationNumber: updatedSupplier.registrationNumber || '',
      cstNumber: updatedSupplier.cstNumber || '',
      form20B: updatedSupplier.form20B || '',
      form21B: updatedSupplier.form21B || '',
      address: updatedSupplier.address || '',
      city: updatedSupplier.city || '',
      area: updatedSupplier.area || '',
      nonLocalSupplier: updatedSupplier.nonLocalSupplier ?? false,
      active: updatedSupplier.active ?? true,

      contactDetails: {
        state: updatedSupplier.contactDetails?.state || '',
        zipCode: updatedSupplier.contactDetails?.zipCode || '',
        telephoneNumber: updatedSupplier.contactDetails?.telephoneNumber || '',
        faxNumber: updatedSupplier.contactDetails?.faxNumber || '',
        contactPerson: updatedSupplier.contactDetails?.contactPerson || '',
        mobileNumber1: updatedSupplier.contactDetails?.mobileNumber1 || '',
        mobileNumber2: updatedSupplier.contactDetails?.mobileNumber2 || '',
        designation: updatedSupplier.contactDetails?.designation || '',
        department: updatedSupplier.contactDetails?.department || '',
        website: updatedSupplier.contactDetails?.website || '',
        email: updatedSupplier.contactDetails?.email || '',
      },
    }

    const response = await https.put(`/api/pharmacy/supplier/update/${supplierId}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating supplier:', error.response?.data || error)
    throw error
  }
}
