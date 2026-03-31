import React from "react"
import { CButton } from "@coreui/react"

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f9fa",
      }}
    >
      <h3>{message || "Something went wrong"}</h3>
      <p>Please try again.</p>

      <CButton color="primary" onClick={onRetry}>
        Retry
      </CButton>
    </div>
  )
}