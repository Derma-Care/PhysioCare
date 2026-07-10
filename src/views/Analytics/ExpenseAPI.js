import { http } from '../../Utils/Interceptors'

export const getExpenses = async (clinicId, branchId) => {
    return await http.get(`/expenses/clinic/${clinicId}/branch/${branchId}`);
}

export const createExpense = async (data) => {
    return await http.post(`/clinic/expenses/create`, data);
}

export const updateExpense = async (id, data) => {
    return await http.put(`/expenses/update/id/${id}`, data);
}

export const deleteExpense = async (id) => {
    return await http.delete(`/expenses/delete/id/${id}`);
}
