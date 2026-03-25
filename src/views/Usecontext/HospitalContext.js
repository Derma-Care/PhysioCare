import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { http } from '../../Utils/Interceptors'
import { GetSubServices_ByClinicId } from '../ProcedureManagement/ProcedureManagementAPI'
import { getDoctorByClinicId } from '../../baseUrl'

const HospitalContext = createContext()

export const HospitalProvider = ({ children }) => {
  // Hydrate from localStorage
  const [selectedHospital, setSelectedHospital] = useState(() => {
    const stored = localStorage.getItem('selectedHospital')
    return stored ? JSON.parse(stored) : null
  })

  const [doctorData, setDoctorData] = useState(null)
  const [subServices, setSubServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notificationCount, setNotificationCount] = useState('')
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospitalUser')
    return saved ? JSON.parse(saved) : null
  })
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('HospitalId'))
  const [hydrated, setHydrated] = useState(false) // Track data readiness

  // Persist user & hospital to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('hospitalUser', JSON.stringify(user))
    else localStorage.removeItem('hospitalUser')
  }, [user])

  useEffect(() => {
    if (selectedHospital) localStorage.setItem('selectedHospital', JSON.stringify(selectedHospital))
    else localStorage.removeItem('selectedHospital')
  }, [selectedHospital])

  // Fetch hospital & doctor data

  // const fetchAllData = useCallback(
  //   async (id = hospitalId) => {
  //     if (!id) return
  //     setLoading(true)
  //     try {
  //       // Fetch hospital
  //       const hospitalRes = await http.get(`/getClinic/${id}`)
  //       if (hospitalRes.status === 200 && hospitalRes.data) setSelectedHospital(hospitalRes.data)
  //       console.log(hospitalRes.data)
  //       // Fetch doctors
  //       const branchId = localStorage.getItem('branchId')
  //       const doctorRes = await http.get(`${getDoctorByClinicId}/${id}/${branchId}`)
  //       if (doctorRes.status === 200 && doctorRes.data) setDoctorData(doctorRes.data)

  //       // Fetch subservices
  //       const subRes = await GetSubServices_ByClinicId(id)
  //       const list = Array.isArray(subRes?.data) ? subRes.data : []
  //       setSubServices(list.filter((s) => s.hospitalId === id))
  //     } catch (err) {
  //       console.error(err)
  //       setErrorMessage('Error fetching hospital data.')
  //     } finally {
  //       setLoading(false)
  //       setHydrated(true)
  //     }
  //   },
  //   [hospitalId],
  // )

  // Fetch hospital details
  const fetchHospital = useCallback(async (id) => {
    if (!id) return
    setLoading(true)
    try {
      const res = await http.get(`/getClinic/${id}`)
      if (res.status === 200 && res.data) {
        setSelectedHospital(res.data)
      }
      return res.data // ✅ return data here
      console.log(res.data)
    } catch (err) {
      console.error(err)
      setErrorMessage('Error fetching hospital data.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch doctors by hospital and branch
  const fetchDoctors = useCallback(async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const branchId = localStorage.getItem('branchId')
      const hospitalId = localStorage.getItem('HospitalId')
      const res = await http.get(`${getDoctorByClinicId}/${hospitalId}/${branchId}`)
      if (res.status === 200 && res.data) setDoctorData(res.data)
    } catch (err) {
      console.error(err)
      setErrorMessage('Error fetching doctors.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch subservices by hospital
  const fetchSubServices = useCallback(async () => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (!hospitalId) return
    setLoading(true)
    try {
      const res = await GetSubServices_ByClinicId(hospitalId)
      const list = Array.isArray(res?.data) ? res.data : []
      setSubServices(list.filter((s) => s.hospitalId === hospitalId))
    } catch (err) {
      console.error(err)
      setErrorMessage('Error fetching subservices.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAllData = useCallback(
    async (id = hospitalId) => {
      if (!id) return
      setHydrated(false)
      await fetchHospital(id)
      await fetchDoctors()
      await fetchSubServices()
      setHydrated(true)
    },
    [hospitalId, fetchHospital, fetchDoctors, fetchSubServices],
  )

  // Auto-fetch on hospitalId change
  useEffect(() => {
    if (hospitalId) fetchAllData()
    else setHydrated(true)
  }, [hospitalId, fetchAllData])

  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        doctorData,
        subServices,
        loading,
        errorMessage,
        hydrated,
        user,
        role,
        notificationCount,
        hospitalId,
        setSelectedHospital,
        setDoctorData,
        setSubServices,
        setUser,
        setRole,
        setHospitalId,
        setNotificationCount,
        fetchAllData,
        fetchDoctors,
        fetchHospital,
        fetchSubServices, // expose for manual calls (like after login)
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
