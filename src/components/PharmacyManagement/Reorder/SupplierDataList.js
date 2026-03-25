/* eslint-disable react/prop-types */
import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CBadge,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash } from 'lucide-react'

const SupplierDataList = ({ suppliers = [], onEdit, onDelete, onView, loading }) => {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <CSpinner size="sm" color="primary" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <CTable bordered striped responsive className="pink-table">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Supplier Name</CTableHeaderCell>
            <CTableHeaderCell>Contact Person</CTableHeaderCell>
            <CTableHeaderCell>Mobile Number</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>GST Number</CTableHeaderCell>
            <CTableHeaderCell>Address</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <CTableRow key={supplier.supplierId}>
                <CTableDataCell>{supplier.supplierId}</CTableDataCell>
                <CTableDataCell>{supplier.supplierName}</CTableDataCell>

                <CTableDataCell>{supplier.contactDetails?.contactPerson || '-'}</CTableDataCell>

                <CTableDataCell>{supplier.contactDetails?.mobileNumber || '-'}</CTableDataCell>

                <CTableDataCell>{supplier.contactDetails?.email || '-'}</CTableDataCell>

                <CTableDataCell>{supplier.gstNumber || '-'}</CTableDataCell>

                <CTableDataCell>
                  {supplier.address}, {supplier.city}
                </CTableDataCell>

                <CTableDataCell>
                  <CBadge color={supplier.active ? 'success' : 'danger'}>
                    {supplier.active ? 'Active' : 'Inactive'}
                  </CBadge>
                </CTableDataCell>

                {/* ✅ ACTION BUTTONS */}
                <CTableDataCell>
                  <div className="d-flex gap-2">
                    {/* View */}
                    <CButton
                      style={{
                        color: 'var(--color-black)',
                        backgroundColor: 'var(--color-bgcolor)',
                      }}
                      size="sm"
                      onClick={() => onView(supplier)}
                    >
                      <Eye size={16} />
                    </CButton>

                    {/* Edit */}
                    <CButton
                      style={{
                        color: 'var(--color-black)',
                        backgroundColor: 'var(--color-bgcolor)',
                      }}
                      size="sm"
                      onClick={() => onEdit(supplier)}
                    >
                      <Edit2 size={16} />
                    </CButton>

                    {/* Delete */}
                    <CButton
                      style={{
                        color: 'var(--color-black)',
                        backgroundColor: 'var(--color-bgcolor)',
                      }}
                      size="sm"
                      onClick={() => onDelete(supplier.supplierId)}
                    >
                      <Trash size={16} />
                    </CButton>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={9} className="text-center">
                No Suppliers Found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default SupplierDataList
