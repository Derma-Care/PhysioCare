import { http } from '../../Utils/Interceptors';
import { BASE_URL } from '../../baseUrl';

export const getAllEquipment = (clinicId, branchId) =>
  http.get(`${BASE_URL}/equipment/getAll/${clinicId}/${branchId}`);

export const addEquipment = (payload) =>
  http.post(`${BASE_URL}/equipment/save`, payload);

export const updateEquipment = (id, payload) =>
  http.put(`${BASE_URL}/equipment/update/${id}`, payload);

export const deleteEquipment = (id) =>
  http.delete(`${BASE_URL}/equipment/delete/${id}`);

export const getAllVendors = (clinicId) =>
  http.get(`${BASE_URL}/equipment/vendors/${clinicId}`);

export const addVendor = (payload) =>
  http.post(`${BASE_URL}/equipment/vendor/add`, payload);

export const getServiceHistory = (equipmentId) =>
  http.get(`${BASE_URL}/equipment/service-history/${equipmentId}`);

export const addServiceRecord = (payload) =>
  http.post(`${BASE_URL}/equipment/service/add`, payload);
