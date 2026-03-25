import React, { useState, useEffect } from 'react'
import SupplierLogin from './SupplierLogin'
import SupplierDashboard from './SupplierDashboard'

const SupplierApp = () => {
  const [supplierId, setSupplierId] = useState(null)
  const [data, setData] = useState(null)

  // ✅ Check session on load
  useEffect(() => {
    const savedSupplier = sessionStorage.getItem('supplier')

    if (savedSupplier) {
      const supplierData = JSON.parse(savedSupplier)

      setSupplierId(supplierData.supplierId)
      setData(supplierData)
    }
  }, [])

  const handleLogin = (data) => {
    sessionStorage.setItem('supplier', JSON.stringify(data)) // store full object
    setSupplierId(data.supplierId)
    setData(data)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('supplier')
    setSupplierId(null)
    setData(null)
  }

  return (
    <>
      {!supplierId ? (
        <SupplierLogin onLogin={handleLogin} />
      ) : (
        <SupplierDashboard supplierId={supplierId} onLogout={handleLogout} supplier={data} />
      )}
    </>
  )
}

export default SupplierApp
