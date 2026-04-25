import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import { useHospital } from '../Usecontext/HospitalContext'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { Eye, Wallet } from 'lucide-react'
import LoadingIndicator from '../../Utils/loader'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

// ── API (replace with real) ───────────────────────────────
const Get_AllPayoutsData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            transactionId: 'TXN2025072801',
            bookingId: 'BKG9011',
            billingName: 'Ankit Sharma',
            amount: '₹2,499.00',
            paymentMethod: 'Credit Card (HDFC)',
            userEmail: 'ankit.sharma@example.com',
            userMobile: '9876543210',
            billingAddress: 'Flat 204, Prestige Towers, Koramangala, Bangalore, India - 560034',
          },
          {
            transactionId: 'TXN2025072802',
            bookingId: 'BKG9012',
            billingName: 'Priya Menon',
            amount: '₹3,200.00',
            paymentMethod: 'UPI (priya@ybl)',
            userEmail: 'priya.menon@example.com',
            userMobile: '9833012345',
            billingAddress: 'C-16, Orchid Residency, Andheri West, Mumbai, India - 400058',
          },
          {
            transactionId: 'TXN2025072803',
            bookingId: 'BKG9013',
            billingName: 'Rahul Verma',
            amount: '₹1,750.00',
            paymentMethod: 'Net Banking (SBI)',
            userEmail: 'rahul.v@example.com',
            userMobile: '9123456789',
            billingAddress: 'A-10, Gaur City, Sector 121, Noida, India - 201301',
          },
        ],
      })
    }, 2000)
  })
}

const PayoutManagement = () => {
  const [payouts, setPayouts]     = useState([])
  const [viewData, setViewData]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { searchQuery } = useGlobalSearch()
  const { user }        = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ── FETCH ──────────────────────────────────
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true)
        const result = await Get_AllPayoutsData()
        setPayouts(result?.data ?? [])
      } catch (err) {
        console.error('Failed to fetch payouts:', err)
        showCustomToast('Failed to load payouts.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchPayouts()
  }, [])

  // ── FILTER + PAGINATE ─────────────────────
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return payouts
    return payouts.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, payouts])

  const displayData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  )

  if (loading) return <LoadingIndicator message="Loading payouts..." />

  return (
    <>
      <ToastContainer />

      {/* ── Page Header ───────────────────────── */}
      <div className="po-page-header">
        <div className="po-page-title-group">
          <div className="po-page-icon">
            <Wallet size={20} />
          </div>
          <div>
            <h4 className="po-page-title">Payout Management</h4>
            <p className="po-page-sub">
              {filteredData.length} transaction{filteredData.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Total amount summary pill */}
        <div className="po-summary-pill">
          <span className="po-summary-label">Total Records</span>
          <span className="po-summary-count">{filteredData.length}</span>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────── */}
      <div className="po-table-wrapper">
        <CTable className="po-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="po-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
              <CTableHeaderCell className="po-th">Booking ID</CTableHeaderCell>
              <CTableHeaderCell className="po-th">Billing Name</CTableHeaderCell>
              <CTableHeaderCell className="po-th">Amount</CTableHeaderCell>
              <CTableHeaderCell className="po-th">Payment Method</CTableHeaderCell>
              <CTableHeaderCell className="po-th" style={{ width: 90 }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {displayData.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={6}>
                  <div className="po-empty">
                    <Wallet size={40} className="po-empty-icon" />
                    <p>
                      {searchQuery
                        ? `No payouts found matching "${searchQuery}"`
                        : 'No payouts found.'}
                    </p>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : (
              displayData.map((p, index) => (
                <CTableRow key={`${p.bookingId}-${index}`} className="po-tr">
                  <CTableDataCell className="po-td po-td-num">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </CTableDataCell>

                  <CTableDataCell className="po-td">
                    <span className="po-booking-id">{p.bookingId}</span>
                  </CTableDataCell>

                  <CTableDataCell className="po-td">
                    <span className="po-name">{p.billingName}</span>
                  </CTableDataCell>

                  <CTableDataCell className="po-td">
                    <span className="po-amount">{p.amount}</span>
                  </CTableDataCell>

                  <CTableDataCell className="po-td po-muted">
                    {p.paymentMethod || '—'}
                  </CTableDataCell>

                  <CTableDataCell className="po-td">
                    <div className="po-actions">
                      {can('Payouts', 'read') && (
                        <button
                          className="po-action-btn view"
                          title="View"
                          onClick={() => setViewData(p)}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="mt-3 mb-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        </div>
      )}

      {/* ── VIEW MODAL ────────────────────────── */}
      <CModal
        visible={!!viewData}
        onClose={() => setViewData(null)}
        alignment="center"
        backdrop="static"
        className="po-custom-modal"
      >
        <CModalHeader className="po-modal-header">
          <CModalTitle className="po-modal-title">Transaction Details</CModalTitle>
        </CModalHeader>

        <CModalBody className="po-modal-body">
          {viewData && (
            <>
              <div className="po-detail-grid">
                <div className="po-detail-card po-full">
                  <span className="po-detail-label">Billing Name</span>
                  <span className="po-detail-value">{viewData.billingName}</span>
                </div>
                <div className="po-detail-card">
                  <span className="po-detail-label">Transaction ID</span>
                  <span className="po-detail-value po-id-pill">{viewData.transactionId}</span>
                </div>
                <div className="po-detail-card">
                  <span className="po-detail-label">Booking ID</span>
                  <span className="po-detail-value po-id-pill">{viewData.bookingId}</span>
                </div>
                <div className="po-detail-card">
                  <span className="po-detail-label">Amount</span>
                  <span className="po-detail-value po-amount-lg">{viewData.amount}</span>
                </div>
                <div className="po-detail-card">
                  <span className="po-detail-label">Payment Method</span>
                  <span className="po-detail-value">{viewData.paymentMethod}</span>
                </div>
                <div className="po-detail-card">
                  <span className="po-detail-label">Email</span>
                  <span className="po-detail-value">{viewData.userEmail}</span>
                </div>
                <div className="po-detail-card">
                  <span className="po-detail-label">Mobile</span>
                  <span className="po-detail-value">{viewData.userMobile}</span>
                </div>
                <div className="po-detail-card po-full">
                  <span className="po-detail-label">Billing Address</span>
                  <span className="po-detail-value po-address">{viewData.billingAddress}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="po-btn-secondary" onClick={() => setViewData(null)}>
                  Close
                </button>
              </div>
            </>
          )}
        </CModalBody>
      </CModal>

      {/* ── STYLES ──────────────────────────────── */}
      <style>{`
        /* Page Header */
        .po-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .po-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .po-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .po-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .po-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* Summary pill */
        .po-summary-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e6f1fb;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          padding: 6px 16px;
        }
        .po-summary-label {
          font-size: 12px;
          color: #185fa5;
          font-weight: 500;
        }
        .po-summary-count {
          font-size: 13px;
          font-weight: 700;
          color: #0c447c;
        }

        /* Table */
        .po-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .po-table { margin-bottom: 0 !important; font-size: 13px; }
        .po-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }
        .po-tr { transition: background 0.12s; }
        .po-tr:hover { background: #f0f5fb !important; }
        .po-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .po-td-num { color: #9ca3af; font-size: 12px; }
        .po-muted   { color: #6b7280; }

        /* Cell values */
        .po-booking-id {
          font-size: 12px;
          color: #185fa5;
          font-weight: 600;
          background: #e6f1fb;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          padding: 2px 10px;
        }
        .po-name {
          font-weight: 600;
          color: #0c447c;
        }
        .po-amount {
          font-weight: 700;
          color: #3b6d11;
        }

        /* Action buttons */
        .po-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .po-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          flex-shrink: 0;
        }
        .po-action-btn.view { background: #e6f1fb; color: #185fa5; }
        .po-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .po-action-btn:active { transform: scale(0.94); }

        /* Empty state */
        .po-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .po-empty-icon { color: #d0dce9; }

        /* Modal */
        .po-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .po-modal-header {
          background: #185fa5 !important;
          border-bottom: none !important;
          padding: 16px 20px !important;
        }
        .po-modal-title {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #fff !important;
        }
        .po-custom-modal .btn-close {
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        .po-modal-body {
          background: #f7fafd !important;
          padding: 20px !important;
        }

        /* Detail grid */
        .po-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 4px;
        }
        .po-full { grid-column: 1 / -1; }
        .po-detail-card {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .po-detail-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .po-detail-value {
          font-size: 13px;
          font-weight: 600;
          color: #0c447c;
          word-break: break-word;
        }
        .po-id-pill {
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 10px;
          display: inline-block;
        }
        .po-amount-lg {
          font-size: 16px;
          font-weight: 700;
          color: #3b6d11;
        }
        .po-address {
          font-size: 12px;
          font-weight: 400;
          color: #374151;
          line-height: 1.5;
        }

        /* Close button */
        .po-btn-secondary {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .po-btn-secondary:hover { background: #f0f5fb; }
      `}</style>
    </>
  )
}

export default PayoutManagement