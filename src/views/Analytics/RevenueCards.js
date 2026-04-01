import React, { useEffect, useState } from "react"
import { CCard, CCardBody, CRow, CCol } from "@coreui/react"

 const RevenueCards = () => {
  const [data, setData] = useState({
    today: 0,
    week: 0,
    month: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // 🔹 Replace with API call
    const response = {
      today: 12000,
      week: 70000,
      month: 250000,
      expences: 2500
    }

    setData(response)
  }

  return (
    <CRow>
      {/* Today */}
      <CCol md={3}>
        <CCard style={{ borderLeft: "5px solid green" }}>
          <CCardBody>
            <h6>Today Revenue</h6>
            <h4>₹{data.today}</h4>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Week */}
      <CCol md={3}>
        <CCard style={{ borderLeft: "5px solid blue" }}>
          <CCardBody>
            <h6>This Week</h6>
            <h4>₹{data.week}</h4>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Month */}
      <CCol md={3}>
        <CCard style={{ borderLeft: "5px solid orange" }}>
          <CCardBody>
            <h6>This Month</h6>
            <h4>₹{data.month}</h4>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={3}>
        <CCard style={{ borderLeft: "5px solid orange" }}>
          <CCardBody>
            <h6>Expence</h6>
            <h4 style={{color:"red"}}>- {data.expences}</h4>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}
export default RevenueCards;