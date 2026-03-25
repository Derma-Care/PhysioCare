import React, { useState, useMemo, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import { getInventory } from './InventoryAPI'
import Select from 'react-select'
import { useMedicines } from '../../Context/MedicineContext'
const Inventory = () => {
  // 🟢 Dummy Inventory Data
  // const [inventory, setInventory] = useState([])
  const { supplier, inventory, fetchInventory } = useMedicines()
  const [openRow, setOpenRow] = useState(null)
  // const fetchInventory = async () => {
  //   try {
  //     const res = await getInventory()
  //     setInventory(res.data)
  //     console.log(res.data) // depends on API structure
  //   } catch (error) {
  //     console.error('Inventory fetch error', error)
  //   }
  // }

  useEffect(() => {
    fetchInventory()
  }, [])

  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // 🟢 Calculate Days Left
  const calculateDaysLeft = (expiryDate) => {
    const today = new Date()
    const exp = new Date(expiryDate)
    const diff = exp - today
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // 🟢 Filtered Data
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const searchText = search.toLowerCase()

      const daysLeft = calculateDaysLeft(item.expiryDate)

      const matchSearch =
        item.medicineId?.toLowerCase().includes(searchText) ||
        item.medicineName?.toLowerCase().includes(searchText) ||
        item.brand?.toLowerCase().includes(searchText) ||
        item.productType?.toLowerCase().includes(searchText) ||
        item.packSize?.toString().toLowerCase().includes(searchText) ||
        item.batchNo?.toLowerCase().includes(searchText) ||
        item.mfgDate?.toLowerCase().includes(searchText) ||
        item.expiryDate?.toLowerCase().includes(searchText) ||
        item.supplier?.toLowerCase().includes(searchText) ||
        daysLeft.toString().includes(searchText) ||
        item.mrp?.toString().includes(searchText) ||
        item.purchaseRate?.toString().includes(searchText) ||
        item.availableQty?.toString().includes(searchText) ||
        item.minStock?.toString().includes(searchText) ||
        item.gst?.toString().includes(searchText)

      const matchSupplier = supplierFilter ? item.supplier === supplierFilter : true

      const matchType = typeFilter ? item.productType === typeFilter : true

      return matchSearch && matchSupplier && matchType
    })
  }, [search, supplierFilter, typeFilter, inventory])

  const supplierOptions = supplier.map((supplier) => ({
    value: supplier.supplierId,
    label: supplier.supplierName,
  }))

  return (
    <CCard className="shadow-sm">
      <CCardHeader>
        <h4>Inventory Management</h4>
      </CCardHeader>

      <CCardBody>
        {/* 🔍 Filters */}
        <CRow className="mb-3 justify-content-end">
          <CCol md={4}>
            <Select
              options={supplierOptions}
              placeholder="Filter by Supplier"
              onChange={(selected) => setSupplierFilter(selected ? selected.value : '')}
              isClearable
            />
          </CCol>
          <CCol md={4}>
            <CFormInput
              placeholder="Search by any field..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CCol>
          {/* <CCol md={4}>
            <CFormSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Filter by Product Type</option>
              <option>Cosmetic</option>
              <option>OTC</option>
              <option>Prescription</option>
            </CFormSelect>
          </CCol> */}
        </CRow>

        {/* 📋 Inventory Table */}
        <CTable bordered responsive hover className="pink-table">
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Medicine ID</CTableHeaderCell>

              <CTableHeaderCell>Medicine</CTableHeaderCell>
              <CTableHeaderCell>Brand</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Pack</CTableHeaderCell>
              {/* <CTableHeaderCell>Batch</CTableHeaderCell> */}
              {/* <CTableHeaderCell>MFG</CTableHeaderCell> */}
              {/* <CTableHeaderCell>Expiry</CTableHeaderCell> */}
              {/* <CTableHeaderCell>Days Left</CTableHeaderCell> */}
              <CTableHeaderCell>Available Qty</CTableHeaderCell>
              <CTableHeaderCell>Min Stock</CTableHeaderCell>
              {/* <CTableHeaderCell>Purchase Rate</CTableHeaderCell> */}
              {/* <CTableHeaderCell>MRP</CTableHeaderCell> */}
              <CTableHeaderCell>GST%</CTableHeaderCell>
              {/* <CTableHeaderCell>Supplier</CTableHeaderCell> */}
              {/* <CTableHeaderCell>Status</CTableHeaderCell> */}
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {inventory.map((med, index) => (
              <React.Fragment key={med.medicineId}>
                {/* ✅ MAIN ROW */}
                <CTableRow
                  style={{ cursor: 'pointer', background: '#f9f9f9' }}
                  onClick={() => setOpenRow(openRow === med.medicineId ? null : med.medicineId)}
                >
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{med.medicineId}</CTableDataCell>
                  <CTableDataCell>{med.medicineName}</CTableDataCell>
                  <CTableDataCell>{med.brand}</CTableDataCell>
                  <CTableDataCell>{med.productType}</CTableDataCell>

                  <CTableDataCell>{med.inventory[0]?.pack}</CTableDataCell>

                  <CTableDataCell>{med.availableQty}</CTableDataCell>
                  <CTableDataCell>{med.minStock}</CTableDataCell>
                  <CTableDataCell>{med.gstPercent}</CTableDataCell>

                  <CTableDataCell>
                    <CBadge color="info">{med.inventory.length} Batches</CBadge>
                  </CTableDataCell>
                </CTableRow>

                {/* ✅ SUB TABLE */}
                {openRow === med.medicineId && (
                  <CTableRow>
                    <CTableDataCell colSpan={10}>
                      <CTable bordered small>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Batch</CTableHeaderCell>
                            <CTableHeaderCell>MFG</CTableHeaderCell>
                            <CTableHeaderCell>Expiry</CTableHeaderCell>
                            <CTableHeaderCell>Qty</CTableHeaderCell>
                            <CTableHeaderCell>Purchase</CTableHeaderCell>
                            <CTableHeaderCell>MRP</CTableHeaderCell>
                            <CTableHeaderCell>Supplier</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>

                        <CTableBody>
                          {med.inventory.length > 0 ? (
                            med.inventory.map((item) => {
                              const status = item.status

                              let rowStyle = {}
                              let badgeColor = 'secondary'

                              switch (status) {
                                case 'EXPIRED':
                                  rowStyle = { backgroundColor: '#f8d7da' }
                                  badgeColor = 'danger'
                                  break

                                case 'EXPIRING_SOON':
                                  rowStyle = { backgroundColor: '#fff3cd' }
                                  badgeColor = 'warning'
                                  break

                                case 'LOW_STOCK':
                                  rowStyle = { backgroundColor: '#ffeeba' }
                                  badgeColor = 'warning'
                                  break

                                case 'OUT_OF_STOCK':
                                  rowStyle = { backgroundColor: '#e2e3e5' }
                                  badgeColor = 'dark'
                                  break

                                case 'NORMAL':
                                  badgeColor = 'success'
                                  break

                                default:
                                  badgeColor = 'secondary'
                              }

                              return (
                                <CTableRow key={item.inventoryId} style={rowStyle}>
                                  <CTableDataCell>{item.batchNo}</CTableDataCell>
                                  <CTableDataCell>{item.mfgDate}</CTableDataCell>
                                  <CTableDataCell>{item.expiryDate}</CTableDataCell>
                                  <CTableDataCell>{item.availableQty}</CTableDataCell>
                                  <CTableDataCell>₹{item.purchaseRate}</CTableDataCell>
                                  <CTableDataCell>₹{item.mrp}</CTableDataCell>
                                  <CTableDataCell>{item.supplier}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color={badgeColor}>{status}</CBadge>
                                  </CTableDataCell>
                                </CTableRow>
                              )
                            })
                          ) : (
                            <CTableRow>
                              <CTableDataCell colSpan={8} className="text-center">
                                No batch data
                              </CTableDataCell>
                            </CTableRow>
                          )}
                        </CTableBody>
                      </CTable>
                    </CTableDataCell>
                  </CTableRow>
                )}
              </React.Fragment>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default Inventory
