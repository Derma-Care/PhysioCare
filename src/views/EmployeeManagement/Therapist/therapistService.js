import { patients } from './commonData'

const today = '2026-03-28'

// ✅ ALL SESSIONS
export const getAllSessions = () => {
  let arr = []

  patients.forEach((p) => {
    p.sessions?.forEach((s) => {
      arr.push({
        ...s,
        patientName: p.patientInfo?.name || "Unknown", // ✅ FIX
        therapy: p.therapy || "",
      })
    })
  })

  return arr
}

// ✅ TODAY
export const getTodaySessions = () => {
  const today = new Date().toISOString().split("T")[0]

  return getAllSessions().filter((s) => s.date === today)
}

// ✅ WEEK
export const getWeekSessions = () => {
  return getAllSessions().filter((s) => s.date >= '2026-03-20')
}

// ✅ MONTH
export const getMonthSessions = () => {
  return getAllSessions().filter((s) => s.date.startsWith('2026-03'))
}

// ✅ STATS (FIXED)
export const getStats = () => {
  const todayData = getTodaySessions()
  const week = getWeekSessions()
  const month = getMonthSessions()

  // convert "30 min" → 30
  const getMinutes = (d) => parseInt(d)

  const sum = (arr) =>
    arr.reduce((a, b) => a + getMinutes(b.duration || 0), 0)

  return {
    todayCount: todayData.length,
    weekCount: week.length,
    monthCount: month.length,

    todayTime: sum(todayData),
    weekTime: sum(week),
    monthTime: sum(month),
  }
}

export const getAllPatients = () => {
  return patients.map((p) => {
    const completed =
      p.sessions?.filter((s) => s.status === "Completed").length || 0

    const total = p.sessions?.length || 0

    return {
      // ✅ keep full original data
      ...p,

      // ✅ UI friendly fields
      patientId: p?.patientInfo?.patientId,
      name: p?.patientInfo?.name,
      therapy: p?.therapy,
      duration: p?.duration,
      doctorName: p?.treatmentPlan?.doctorName,
overallStatus:p?.overallStatus ||"Pending",
      status:
        completed === total
          ? "Completed"
          : completed > 0
          ? "Active"
          : "Pending",
    }
  })
}

// ✅ UPDATE SESSION
export const updateSession = (sessionId, data) => {
  patients.forEach((p) => {
    p.sessions.forEach((s) => {
      if (s.sessionId === sessionId) {
        Object.assign(s, data)
      }
    })
  })
}

// ✅ GET PATIENT BY SESSION
export const getPatientBySession = (sessionId) => {
  for (let p of patients) {
    const found = p.sessions.find((s) => s.sessionId === sessionId)

    if (found) {
      return {
        name: p.patientInfo.name,
        therapy: p.therapy,
        disease: p.disease,
        doctorName: p.treatmentPlan.doctorName, // ✅ ADD THIS
        sessions: p.sessions,
      }
    }
  }

  return null
}