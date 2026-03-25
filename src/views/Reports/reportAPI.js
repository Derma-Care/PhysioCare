// reportsAPI.js
import axios from 'axios'
import { BASE_URL, AllReports, SavingReports, Get_ReportsByBookingId } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const ReportsData = async () => {
  try {
    const response = await http.get(`/${AllReports}`)
    const reports = response.data.data
    console.log(reports)
    return reports
  } catch (error) {
    console.error('Error fetching report by ID:', error.message)
    return null
  }
}
export const Get_ReportsByBookingIdData = async (bookingId) => {
  try {
    const response = await http.get(`/${Get_ReportsByBookingId}/${bookingId}`)
    console.log(response)
    return response.data.data
  } catch (error) {
    console.error('Error fetching report by ID:', error.message)
    return null
  }
}

export const SaveReportsData = async (reportData) => {
  try {
    console.log('Sending data to API to add appointment...', reportData)

    const response = await http.post(`/${SavingReports}`, reportData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Appointment booked successfully:', response.data)
    return response.data
  } catch (error) {
    console.error(
      'Error booking appointment:',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
  
  
}
// services/ReportsService.js


export const Delete_ReportById = async (id) => {
  return http.delete(`/deleteReport/${id}`)
}

export const Delete_ReportByIdIndex = async (id,bookingId,index) => {
  return http.delete(`/deleteReportFile/${id}/${bookingId}/${index}`)
}


