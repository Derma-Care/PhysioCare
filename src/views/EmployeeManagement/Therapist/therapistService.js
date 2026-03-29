// import { patients } from './commonData'



// // ✅ ALL SESSIONS
// export const getAllSessions = () => {
//   let arr = []

//   patients.forEach((p) => {
//     p.sessions?.forEach((s) => {
//       arr.push({
//         ...s,
//         patientName: p.patientInfo?.name || "Unknown", // ✅ FIX
//         therapy: p.therapy || "",
//       })
//     })
//   })

//   return arr
// }

// // ✅ TODAY
// export const getTodaySessions = () => {
//   const today = new Date().toISOString().split("T")[0]

//   return getAllSessions().filter((s) => s.date === today)
// }

// // ✅ WEEK
// export const getWeekSessions = () => {
//   return getAllSessions().filter((s) => s.date >= '2026-03-20')
// }

// // ✅ MONTH
// export const getMonthSessions = () => {
//   return getAllSessions().filter((s) => s.date.startsWith('2026-03'))
// }

// // ✅ STATS (FIXED)
// export const getStats = () => {
//   const todayData = getTodaySessions()
//   const week = getWeekSessions()
//   const month = getMonthSessions()

//   // convert "30 min" → 30
//   const getMinutes = (d) => parseInt(d)

//   const sum = (arr) =>
//     arr.reduce((a, b) => a + getMinutes(b.duration || 0), 0)

//   return {
//     todayCount: todayData.length,
//     weekCount: week.length,
//     monthCount: month.length,

//     todayTime: sum(todayData),
//     weekTime: sum(week),
//     monthTime: sum(month),
//   }
// }

// export const getAllPatients = () => {
//   return patients.map((p) => {
//     const completed =
//       p.sessions?.filter((s) => s.status === "Completed").length || 0

//     const total = p.sessions?.length || 0

//     return {
//       // ✅ keep full original data
//       ...p,

//       // ✅ UI friendly fields
//       patientId: p?.patientInfo?.patientId,
//       name: p?.patientInfo?.name,
//       therapy: p?.therapy,
//       duration: p?.duration,
//       doctorName: p?.treatmentPlan?.doctorName,
// overallStatus:p?.overallStatus ||"Pending",
//       status:
//         completed === total
//           ? "Completed"
//           : completed > 0
//           ? "Active"
//           : "Pending",
//     }
//   })
// }

// // ✅ UPDATE SESSION
// export const updateSession = (sessionId, data) => {
//   patients.forEach((p) => {
//     p.sessions.forEach((s) => {
//       if (s.sessionId === sessionId) {
//         Object.assign(s, data)
//       }
//     })
//   })
// }

// // ✅ GET PATIENT BY SESSION
// export const getPatientBySession = (sessionId) => {
//   for (let p of patients) {
//     const found = p.sessions.find((s) => s.sessionId === sessionId)

//     if (found) {
//       return {
//         name: p.patientInfo.name,
//         therapy: p.therapy,
//         disease: p.disease,
//         doctorName: p.treatmentPlan.doctorName, // ✅ ADD THIS
//         sessions: p.sessions,
//       }
//     }
//   }

//   return null
// }


export const getAllSessions = (records = []) => {
  let arr = []

  records.forEach((rec) => {
    rec.therapySessions?.forEach((s) => {
      arr.push({
        ...s,
        patientName: rec?.patientInfo?.name || "Unknown",
        therapy: rec?.complaints?.selectedTherapy || "",
        bookingId: rec?.bookingId,
      })
    })
  })

  return arr
}

export const getTodaySessions = (records = []) => {
  const today = new Date().toISOString().split("T")[0]

  return getAllSessions(records).filter(
    (s) => s.sessionDate === today
  )
}

export const getWeekSessions = (records = []) => {
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  return getAllSessions(records).filter(
    (s) => new Date(s.sessionDate) >= last7Days
  )
}

export const getMonthSessions = (records = []) => {
  const currentMonth = new Date().getMonth()

  return getAllSessions(records).filter(
    (s) => new Date(s.sessionDate).getMonth() === currentMonth
  )
}

export const getStats = (dashboardData) => {
  if (!dashboardData) return {}

  return {
    todayCount: dashboardData.todayPatientCount,
    weekCount: dashboardData.weeklyPatientCount,
    monthCount: dashboardData.monthlyPatientCount,

    todayTime: dashboardData.todayWorkingMinutes,
    weekTime: dashboardData.weeklyWorkingMinutes,
    monthTime: dashboardData.monthlyWorkingMinutes,
  }
}

export const getAllPatients = (records = []) => {
  return records.map((rec) => {
    const sessions = rec.therapySessions || []

    const completed = sessions.filter(
      (s) => s.status === "Completed"
    ).length

    const total = sessions.length

    return {
      ...rec,

      patientId: rec?.patientInfo?.patientId,
      name: rec?.patientInfo?.name,
      therapy: rec?.complaints?.selectedTherapy,
      doctorName: rec?.treatmentPlan?.doctorName,
      overallStatus: rec?.overallStatus || "Pending",

      status:
        completed === total
          ? "Completed"
          : completed > 0
          ? "Active"
          : "Pending",
    }
  })
}

export const updateSessionLocal = (records, sessionId, data) => {
  return records.map((rec) => ({
    ...rec,
    therapySessions: rec.therapySessions.map((s) =>
      s.sessionId === sessionId ? { ...s, ...data } : s
    ),
  }))
}

export const getPatientBySession = (records, sessionId) => {
  for (let rec of records) {
    const found = rec.therapySessions?.find(
      (s) => s.sessionId === sessionId
    )

    if (found) {
      return {
        name: rec.patientInfo.name,
        therapy: rec.complaints.selectedTherapy,
        doctorName: rec.treatmentPlan.doctorName,
        sessions: rec.therapySessions,
      }
    }
  }

  return null
}