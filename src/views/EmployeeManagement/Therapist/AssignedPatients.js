import React, { useState } from "react"
import { getSessions } from "./therapistApi"
 

export default function TherapistDashboard() {

  const [type, setType] = useState("daily")
  const [sessions, setSessions] = useState(getSessions("daily"))

  const changeType = (t) => {
    setType(t)
    setSessions(getSessions(t))
  }

  return (
    <div>

      <h3>Dashboard</h3>

      <button onClick={() => changeType("daily")}>
        Daily
      </button>

      <button onClick={() => changeType("weekly")}>
        Weekly
      </button>

      <button onClick={() => changeType("monthly")}>
        Monthly
      </button>

      {sessions.map((s) => (

        <div key={s.id}>

          <p>{s.patientName}</p>
          <p>{s.therapy}</p>
          <p>{s.time}</p>
          <p>{s.status}</p>

        </div>

      ))}

    </div>
  )
}