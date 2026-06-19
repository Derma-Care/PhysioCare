import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { http } from '../../Utils/Interceptors'
// import { GetSubServices_ByClinicId } from '../ProcedureManagement/ProcedureManagementAPI'
import { getDoctorByClinicId } from '../../baseUrl'
import {
  readPendingNotificationsFromIDB,
  subscribeToBroadcastChannel,
} from '../../firebase'

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
  const [doctorLoading, setDoctorLoading] = useState(false)
  const [notificationCount, setNotificationCount] = useState('')
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospitalUser')
    return saved ? JSON.parse(saved) : null
  })
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('HospitalId'))
  const [hydrated, setHydrated] = useState(false) // Track data readiness
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), read: false }, ...prev])
    setNotificationCount(prev => (parseInt(prev) || 0) + 1)
  }, [])

  // ─── Restore & receive SW notifications in all app states ────────────────────
  useEffect(() => {
    // Helper: drain IDB and merge into state
    const drainIDB = () => {
      readPendingNotificationsFromIDB().then((items) => {
        if (!items || items.length === 0) return
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id))
          const newItems = items.filter((n) => !existingIds.has(n.id))
          if (newItems.length === 0) return prev
          setNotificationCount((c) => (parseInt(c) || 0) + newItems.length)
          return [...newItems, ...prev]
        })
      })
    }

    // Helper: merge a single notification object into state
    const mergeNotif = (notif) => {
      if (!notif) return
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id))
        if (existingIds.has(notif.id)) return prev
        setNotificationCount((c) => (parseInt(c) || 0) + 1)
        return [notif, ...prev]
      })
    }

    // 1. Drain IDB on mount (catches notifications from when app was killed)
    drainIDB()

    // 2. Drain IDB every time the user navigates BACK to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        drainIDB()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 3. Direct postMessage from service worker (most reliable for backgrounded tabs)
    const handleSWMessage = (event) => {
      if (event.data?.type === 'BACKGROUND_NOTIFICATION' && event.data?.notif) {
        mergeNotif(event.data.notif)
      }
    }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage)
    }

    // 4. BroadcastChannel as additional fallback
    const unsubscribeBroadcast = subscribeToBroadcastChannel(mergeNotif)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
      }
      unsubscribeBroadcast()
    }
  }, [])

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
  // const fetchDoctors = useCallback(async () => {
  //   if (!hospitalId) return
  //   setLoading(true)
  //   try {
  //     const branchId = localStorage.getItem('branchId')
  //     const hospitalId = localStorage.getItem('HospitalId')
  //     const res = await http.get(`${getDoctorByClinicId}/${hospitalId}/${branchId}`)
  //     if (res.status === 200 && res.data) setDoctorData(res.data)
  //   } catch (err) {
  //     console.error(err)
  //     setErrorMessage('Error fetching doctors.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [])
  const fetchDoctors = useCallback(async () => {
    try {
      setDoctorLoading(true)

      const branchId = localStorage.getItem('branchId')
      const hospitalId = localStorage.getItem('HospitalId')

      const res = await http.get(
        `${getDoctorByClinicId}/${hospitalId}/${branchId}`
      )

      setDoctorData(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setDoctorLoading(false)
    }
  }, [])

  // Fetch subservices by hospital
  // const fetchSubServices = useCallback(async () => {
  //   const hospitalId = localStorage.getItem('HospitalId')
  //   if (!hospitalId) return
  //   setLoading(true)
  //   try {
  //     const res = await GetSubServices_ByClinicId(hospitalId)
  //     const list = Array.isArray(res?.data) ? res.data : []
  //     setSubServices(list.filter((s) => s.hospitalId === hospitalId))
  //   } catch (err) {
  //     console.error(err)
  //     setErrorMessage('Error fetching subservices.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }, [])

  const fetchAllData = useCallback(
    async (id = hospitalId) => {
      if (!id) return
      setHydrated(false)
      await fetchHospital(id)
      await fetchDoctors()
      // await fetchSubServices()
      setHydrated(true)
    },
    [hospitalId, fetchHospital, fetchDoctors],
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
        // fetchSubServices, // expose for manual calls (like after login)
        notifications,
        setNotifications,
        addNotification,
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
