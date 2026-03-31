import React from "react"
import { CButton } from "@coreui/react"

const NoInternet = ({ onRetry }) => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
      }}
    >
      <h3>No Internet Connection</h3>
      <p>Please check your network and try again.</p>

      <CButton color="primary" onClick={onRetry}>
        Refresh
      </CButton>
    </div>
  )
}
export default NoInternet 