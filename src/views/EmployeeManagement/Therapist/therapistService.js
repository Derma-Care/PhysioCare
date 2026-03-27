import { patients } from './commonData'

const today = '2026-03-27'

export const getAllSessions = () => {
  let arr = []

  patients.forEach((p) => {
    p.sessions.forEach((s) => {
      arr.push({
        ...s,
        patientName: p.name,
        therapy: p.therapy,
      })
    })
  })

  return arr
}

export const getTodaySessions = () => {
  return getAllSessions().filter((s) => s.date === today)
}

export const getWeekSessions = () => {
  return getAllSessions().filter((s) => s.date >= '2026-03-20')
}

export const getMonthSessions = () => {
  return getAllSessions().filter((s) => s.date.startsWith('2026-03'))
}

export const getStats = () => {
  const today = getTodaySessions()
  const week = getWeekSessions()
  const month = getMonthSessions()

  const sum = (arr) => arr.reduce((a, b) => a + b.duration, 0)

  return {
    todayCount: today.length,
    weekCount: week.length,
    monthCount: month.length,

    todayTime: sum(today),
    weekTime: sum(week),
    monthTime: sum(month),
  }
}

 

export const updateSession = (sessionId, data) => {

  patients.forEach(p => {

    p.sessions.forEach(s => {

      if (s.sessionId === sessionId) {

        Object.assign(s, data)

      }

    })

  })

}

export const getPatientBySession = (sessionId) => {
  for (let p of patients) {
    const found = p.sessions.find((s) => s.sessionId === sessionId)

    if (found) {
      return p
    }
  }

  return null
}
