import axios from 'axios'

import { http } from '../../Utils/Interceptors'

export const getTreatmentAnalytics = async (clinicId, branchId, type, period) => {
    let mappedPeriod = period;
    if (period === 'today') mappedPeriod = 1;
    else if (period === 'week') mappedPeriod = 2;
    else if (period === 'month') mappedPeriod = 3;
    else if (period === 'year') mappedPeriod = 4;

    return await http.get(`/analytics/treatments/${clinicId}/${branchId}/${type}/${mappedPeriod}`, {

    })
}

export const getTreatmentAnalyticsCustomDate = async (clinicId, branchId, type, fromDate, toDate) => {
    return await http.get(`/analytics/treatments/${clinicId}/${branchId}/${type}/${fromDate}/${toDate}`, {

    })
}
