import React, { useEffect, useState } from "react"
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react"
import { getAllSalesReturns } from "./OpSalesAPI"

 

const SalesReturnBillModal = ({ visible, onClose }) => {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchReturns = async () => {
    const clinicId= localStorage.getItem('HospitalId')
    const branchId = localStorage.getItem('branchId')
    try {
      setLoading(true)
      const res = await getAllSalesReturns(clinicId,branchId)
      setData(res.data || [])
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchReturns()
    }
  }, [visible])

  return (
    <CModal visible={visible} size="lg" onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Sales Return Bills</CModalTitle>
      </CModalHeader>

      <CModalBody>

        {loading ? (
          <p>Loading...</p>
        ) : (

          <CTable bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Return No</CTableHeaderCell>
                <CTableHeaderCell>Bill No</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Refund</CTableHeaderCell>
                <CTableHeaderCell>Amount</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>

              {data.map((item, i) => (
                <CTableRow key={i}>
                  <CTableDataCell>{item.returnNo}</CTableDataCell>
                  <CTableDataCell>{item.originalBillNo}</CTableDataCell>
                  <CTableDataCell>{item.returnDate}</CTableDataCell>
                  <CTableDataCell>{item.refundMode}</CTableDataCell>
                  <CTableDataCell>{item.netRefundAmount}</CTableDataCell>
                </CTableRow>
              ))}

            </CTableBody>

          </CTable>

        )}

      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default SalesReturnBillModal