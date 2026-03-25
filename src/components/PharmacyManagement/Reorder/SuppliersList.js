import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { suppliers } from './dummyProductData'

const SuppliersList = () => {
  return (
    <CCard className="shadow">
      <CCardHeader>Suppliers</CCardHeader>
      <CCardBody>
        <CTable bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Mobile</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {suppliers.map((s, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{s.supplierName}</CTableDataCell>
                <CTableDataCell>{s.email}</CTableDataCell>
                <CTableDataCell>{s.mobile}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default SuppliersList
