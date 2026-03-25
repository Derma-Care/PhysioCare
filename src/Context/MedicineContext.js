import React, { createContext, useState, useEffect, useContext } from 'react'
import { fetchMedicinesApi } from '../APIs/medicineApi'
import { SupplierData } from '../components/PharmacyManagement/SupplierInfoAPI'
import { getMedicineTypes } from '../components/PharmacyManagement/PharmacyManagementAPI'
 
import { getInventory } from '../components/PharmacyManagement/InventoryAPI'

export const MedicineContext = createContext()

// eslint-disable-next-line react/prop-types
export const MedicineProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([])
  const [supplier, setSupplier] = useState([])
  const [loading, setLoading] = useState(false)
  const [medicineTypes, setMedicineTypes] = useState([])
  const [inventory, setInventory] = useState([])
  const fetchMedicines = async () => {
    try {
      setLoading(true)
      const data = await fetchMedicinesApi() // 🔥 calling API file
      console.log(data)
      setMedicines(data.data)
    } catch (error) {
      console.error('Context Error:', error)
    } finally {
      setLoading(false)
    }
  }
  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await SupplierData() // 🔥 calling API file
      setSupplier(data.data)
    } catch (error) {
      console.error('Context Error:', error)
    } finally {
      setLoading(false)
    }
  }
  const fetchMedicineTypes = async () => {
    try {
      setLoading(true)
      const data = await getMedicineTypes()
      console.log('Medicine Types:', data)
      setMedicineTypes(data)
    } catch (error) {
      console.error('Context Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async () => {
    try {
      const res = await getInventory()
      setInventory(res.data)
      console.log(res.data) // depends on API structure
    } catch (error) {
      console.error('Inventory fetch error', error)
    }
  }

  useEffect(() => {
    fetchMedicines()
    fetchMedicineTypes()
  }, [])

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        loading,
        fetchMedicines,
        supplier,
        fetchSuppliers,
        fetchMedicineTypes,
        medicineTypes,
        setMedicines,fetchInventory,inventory,setInventory
      }}
    >
      {children}
    </MedicineContext.Provider>
  )
}

export const useMedicines = () => {
  const context = useContext(MedicineContext)

  if (!context) {
    throw new Error('useMedicines must be used inside MedicineProvider')
  }

  return context
}
