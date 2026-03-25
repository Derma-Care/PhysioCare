import React, { useState, useEffect } from "react";
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from "@coreui/react";

const SupplierSettlement = () => {
  // ✅ Dummy Suppliers
  const suppliers = [
    { id: "SUP-001", name: "Sri Balaji Pharma" },
    { id: "SUP-002", name: "Medicare Distributors" },
  ];

  // ✅ Dummy Pending Bills
  const dummyBills = {
    "SUP-001": [
      { id: "PB-101", date: "01-02-2026", balance: 20000 },
      { id: "PB-104", date: "05-02-2026", balance: 10000 },
      { id: "PB-109", date: "08-02-2026", balance: 30000 },
    ],
    "SUP-002": [
      { id: "PB-201", date: "03-02-2026", balance: 15000 },
      { id: "PB-205", date: "09-02-2026", balance: 25000 },
    ],
  };

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [bills, setBills] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [adjustedBills, setAdjustedBills] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [showReceipt, setShowReceipt] = useState(false);
const [receiptData, setReceiptData] = useState(null);

  // Load bills when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      setBills(dummyBills[selectedSupplier]);
      setAdjustedBills([]);
      setPaymentAmount(0);
    }
  }, [selectedSupplier]);

  // Auto Allocation Logic
  const allocatePayment = () => {
    let remaining = Number(paymentAmount);
    let updated = [];

    bills.forEach((bill) => {
      if (remaining > 0) {
        if (remaining >= bill.balance) {
          updated.push({
            ...bill,
            adjusted: bill.balance,
            remaining: 0,
          });
          remaining -= bill.balance;
        } else {
          updated.push({
            ...bill,
            adjusted: remaining,
            remaining: bill.balance - remaining,
          });
          remaining = 0;
        }
      } else {
        updated.push({
          ...bill,
          adjusted: 0,
          remaining: bill.balance,
        });
      }
    });

    setAdjustedBills(updated);
  };

  const totalOutstanding = bills.reduce((sum, b) => sum + b.balance, 0);
  const remainingOutstanding =
    totalOutstanding -
    adjustedBills.reduce((sum, b) => sum + (b.adjusted || 0), 0);

  return (
    <>
    <CCard className="mt-4">
      <CCardHeader className="fw-bold text-center">
        SUPPLIER WEEKLY / MONTHLY SETTLEMENT
      </CCardHeader>

      <CCardBody>
        {/* Supplier Selection */}
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormSelect
              label="Select Supplier"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        {/* Pending Bills Table */}
        {bills.length > 0 && (
          <>
            <h6 className="mt-3">Pending Bills</h6>

            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Bill No</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Balance</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {bills.map((bill) => (
                  <CTableRow key={bill.id}>
                    <CTableDataCell>{bill.id}</CTableDataCell>
                    <CTableDataCell>{bill.date}</CTableDataCell>
                    <CTableDataCell>₹ {bill.balance}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            <p className="fw-bold">
              Total Outstanding: ₹ {totalOutstanding}
            </p>

            {/* Payment Section */}
            <CRow className="mt-3">
              <CCol md={4}>
                <CFormInput
                  label="Enter Payment Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </CCol>

              <CCol md={4}>
                <CFormSelect
                  label="Payment Mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </CFormSelect>
              </CCol>

              <CCol md={4} className="d-flex align-items-end">
                <CButton color="primary" onClick={allocatePayment}>
                  Allocate Payment
                </CButton>
              </CCol>
            </CRow>
          </>
        )}

        {/* Allocation Result */}
        {adjustedBills.length > 0 && (
          <>
            <h6 className="mt-4">Settlement Summary</h6>

            <CTable bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Bill No</CTableHeaderCell>
                  <CTableHeaderCell>Original Balance</CTableHeaderCell>
                  <CTableHeaderCell>Adjusted</CTableHeaderCell>
                  <CTableHeaderCell>Remaining</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {adjustedBills.map((bill) => (
                  <CTableRow key={bill.id}>
                    <CTableDataCell>{bill.id}</CTableDataCell>
                    <CTableDataCell>₹ {bill.balance}</CTableDataCell>
                    <CTableDataCell>₹ {bill.adjusted}</CTableDataCell>
                    <CTableDataCell>
                      ₹ {bill.remaining}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            <p className="fw-bold">
              Remaining Outstanding: ₹ {remainingOutstanding}
            </p>

            <CBadge
              color={remainingOutstanding === 0 ? "success" : "warning"}
            >
              {remainingOutstanding === 0
                ? "Fully Settled"
                : "Partially Settled"}
            </CBadge>

          <div className="mt-3">
  <CButton
    color="dark"
    onClick={() => {
      const settlementReceipt = {
        settlementNo: "SET-2026-001",
        supplierName: suppliers.find(s => s.id === selectedSupplier)?.name,
        date: new Date().toLocaleDateString(),
        paymentMode,
        totalPayment: paymentAmount,
        adjustedBills,
        remainingOutstanding
      };

      setReceiptData(settlementReceipt);
      setShowReceipt(true);
    }}
  >
    Generate Settlement Receipt
  </CButton>
</div>
          </>
        )}
      </CCardBody>
    </CCard>
    {showReceipt && receiptData && (
  <div id="printableArea" className="mt-5 p-4 border bg-white">

    <h4 className="text-center fw-bold mb-4">
      SUPPLIER SETTLEMENT RECEIPT
    </h4>

    <CRow className="mb-3">
      <CCol md={6}>
        <p><strong>Settlement No:</strong> {receiptData.settlementNo}</p>
        <p><strong>Supplier:</strong> {receiptData.supplierName}</p>
      </CCol>
      <CCol md={6} className="text-end">
        <p><strong>Date:</strong> {receiptData.date}</p>
        <p><strong>Payment Mode:</strong> {receiptData.paymentMode}</p>
      </CCol>
    </CRow>

    <CTable bordered responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Bill No</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Adjusted Amount</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {receiptData.adjustedBills
          .filter(b => b.adjusted > 0)
          .map((bill) => (
            <CTableRow key={bill.id}>
              <CTableDataCell>{bill.id}</CTableDataCell>
              <CTableDataCell className="text-end">
                ₹ {bill.adjusted}
              </CTableDataCell>
            </CTableRow>
          ))}
      </CTableBody>
    </CTable>

    <CRow className="mt-3">
      <CCol md={6}></CCol>
      <CCol md={6} className="text-end">
        <h5>Total Payment: ₹ {receiptData.totalPayment}</h5>
        <h6>Remaining Outstanding: ₹ {receiptData.remainingOutstanding}</h6>
      </CCol>
    </CRow>

    <CRow className="mt-5 pt-3 border-top">
      <CCol md={6}>Authorized Signature</CCol>
      <CCol md={6} className="text-end">Thank You</CCol>
    </CRow>

    <div className="text-center mt-4 no-print">
      <CButton color="primary" onClick={() => window.print()}>
        Print Receipt
      </CButton>
    </div>

  </div>
)}
    </>
  );
  
};

export default SupplierSettlement;