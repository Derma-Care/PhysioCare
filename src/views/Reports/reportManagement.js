import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import { AppointmentData } from '../AppointmentManagement/appointmentAPI'
import { useNavigate } from 'react-router-dom'
import LoadingIndicator from '../../Utils/loader'
import { useHospital } from '../Usecontext/HospitalContext'
import Pagination from '../../Utils/Pagination'
import { ClipboardList, SlidersHorizontal } from 'lucide-react'

const normalize = (value) => value?.toLowerCase().trim()

const consultationTypeMap = {
  'Service & Treatment': 'services & treatments',
  'Tele Consultation': 'tele consultation',
  'In-clinic': 'in-clinic consultation',
}

const STATUS_OPTIONS = ['All Status', 'Active', 'Completed']

const statusBadge = (status) => {
  const n = normalize(status)
  if (n === 'completed')   return { label: 'Completed', cls: 'rp-badge-green' }
  if (n === 'in-progress' || n === 'active') return { label: 'Active', cls: 'rp-badge-blue' }
  return { label: status, cls: 'rp-badge-gray' }
}

const ReportsManagement = () => {
  const [bookings, setBookings]         = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [filterTypes, setFilterTypes]   = useState([])
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage]   = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [selectedAppointment]           = useState([])

  const navigate = useNavigate()
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ── FETCH ──────────────────────────────────
  const fetchAppointments = async (hospitalId) => {
    try {
      setLoading(true)
      const data = await AppointmentData()
      if (data?.data) {
        const relevant = hospitalId
          ? data.data.filter((b) => normalize(b.clinicId) === normalize(hospitalId))
          : data.data
        setBookings(relevant || [])
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
      setError('Failed to load reports.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    fetchAppointments(hospitalId || null)
  }, [])

  // ── FILTER ─────────────────────────────────
  useEffect(() => {
    let result = bookings.filter((b) =>
      ['completed', 'in-progress', 'active'].includes(normalize(b.status)),
    )

    if (statusFilter === 'Completed')
      result = result.filter((b) => normalize(b.status) === 'completed')
    if (statusFilter === 'Active')
      result = result.filter((b) => ['active', 'in-progress'].includes(normalize(b.status)))

    if (filterTypes.length === 1) {
      const type = filterTypes[0]
      if (type === 'Tele Consultation') {
        result = result.filter(
          (b) =>
            normalize(b.consultationType) === 'tele consultation' ||
            normalize(b.consultationType) === 'online consultation',
        )
      } else {
        const mapped = consultationTypeMap[type]
        if (mapped) result = result.filter((b) => normalize(b.consultationType) === mapped)
      }
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [bookings, filterTypes, statusFilter])

  const toggleFilter = (type) => {
    setFilterTypes((prev) => (prev.includes(type) ? [] : [type]))
  }

  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (loading) return <LoadingIndicator message="Loading reports..." />

  return (
    <>
      {/* ── Page Header ───────────────────────── */}
      <div className="rp-page-header">
        <div className="rp-page-title-group">
          <div className="rp-page-icon">
            <ClipboardList size={20} />
          </div>
          <div>
            <h4 className="rp-page-title">Reports Management</h4>
            <p className="rp-page-sub">
              {filteredData.length} record{filteredData.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* ── Filters ─────────────────────────── */}
        <div className="rp-filter-group">
          {/* Consultation type pills */}
          {['Service & Treatment', 'In-clinic', 'Tele Consultation'].map((label) => (
            <button
              key={label}
              className={`rp-filter-pill${filterTypes.includes(label) ? ' active' : ''}`}
              onClick={() => toggleFilter(label)}
            >
              {label}
            </button>
          ))}

          {/* Status dropdown */}
          <div className="rp-select-wrap">
            <SlidersHorizontal size={13} className="rp-select-icon" />
            <select
              className="rp-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            >
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── TABLE ─────────────────────────────── */}
      {error ? (
        <div className="rp-empty">
          <ClipboardList size={40} className="rp-empty-icon" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="rp-table-wrapper">
          <CTable className="rp-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="rp-th" style={{ width: 56 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="rp-th">Name</CTableHeaderCell>
                <CTableHeaderCell className="rp-th">Consultation Type</CTableHeaderCell>
                <CTableHeaderCell className="rp-th">Date</CTableHeaderCell>
                <CTableHeaderCell className="rp-th">Time</CTableHeaderCell>
                <CTableHeaderCell className="rp-th">Status</CTableHeaderCell>
                <CTableHeaderCell className="rp-th" style={{ width: 90 }}>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {pagedData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={7}>
                    <div className="rp-empty">
                      <ClipboardList size={40} className="rp-empty-icon" />
                      <p>No appointments found.</p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                pagedData.map((item, index) => {
                  const badge = statusBadge(item.status)
                  return (
                    <CTableRow key={`${item.bookingId}-${index}`} className="rp-tr">
                      <CTableDataCell className="rp-td rp-td-num">
                        {(currentPage - 1) * pageSize + index + 1}
                      </CTableDataCell>

                      <CTableDataCell className="rp-td">
                        <span className="rp-name">{item.name}</span>
                      </CTableDataCell>

                      <CTableDataCell className="rp-td rp-muted">
                        {item.consultationType || '—'}
                      </CTableDataCell>

                      <CTableDataCell className="rp-td rp-muted">
                        {item.serviceDate || '—'}
                      </CTableDataCell>

                      <CTableDataCell className="rp-td rp-muted">
                        {item.slot || item.servicetime || '—'}
                      </CTableDataCell>

                      <CTableDataCell className="rp-td">
                        <span className={`rp-status-badge ${badge.cls}`}>{badge.label}</span>
                      </CTableDataCell>

                      <CTableDataCell className="rp-td">
                        {can('Appointments', 'read') && (
                          <button
                            className="rp-view-btn"
                            onClick={() =>
                              navigate(`/report-details/${item.bookingId}`, {
                                state: {
                                  report: item,
                                  appointmentInfo: {
                                    name: item.name,
                                    age: item.age,
                                    gender: item.gender,
                                    problem: item.problem,
                                    bookingId: item.bookingId,
                                    patientId: item.patientId || selectedAppointment?.patientId,
                                    item,
                                    selectedAppointment,
                                  },
                                },
                              })
                            }
                          >
                            View
                          </button>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              )}
            </CTableBody>
          </CTable>
        </div>
      )}

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="mt-3 mb-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / pageSize)}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* ── STYLES ────────────────────────────── */}
      <style>{`
        /* Page Header */
        .rp-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .rp-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rp-page-icon {
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
        .rp-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .rp-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* Filter group */
        .rp-filter-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rp-filter-pill {
          background: #fff;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .rp-filter-pill:hover  { border-color: #185fa5; color: #185fa5; }
        .rp-filter-pill.active {
          background: #185fa5;
          color: #fff;
          border-color: #185fa5;
        }

        /* Status select */
        .rp-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rp-select-icon {
          position: absolute;
          left: 10px;
          color: #6b7280;
          pointer-events: none;
        }
        .rp-select {
          appearance: none;
          padding: 7px 14px 7px 30px;
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s;
          outline: none;
        }
        .rp-select:focus { border-color: #185fa5; }

        /* Table */
        .rp-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .rp-table { margin-bottom: 0 !important; font-size: 13px; }
        .rp-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
        }
        .rp-tr { transition: background 0.12s; }
        .rp-tr:hover { background: #f0f5fb !important; }
        .rp-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .rp-td-num { color: #9ca3af; font-size: 12px; }
        .rp-muted   { color: #6b7280; }

        /* Name */
        .rp-name {
          font-weight: 600;
          font-size: 13px;
          color: #0c447c;
        }

        /* Status badges */
        .rp-status-badge {
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          display: inline-block;
          white-space: nowrap;
        }
        .rp-badge-green { background: #eaf3de; color: #3b6d11; border: 0.5px solid #c0dd97; }
        .rp-badge-blue  { background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4; }
        .rp-badge-gray  { background: #f3f4f6; color: #6b7280; border: 0.5px solid #d1d5db; }

        /* View button */
        .rp-view-btn {
          background: #e6f1fb;
          color: #185fa5;
          border: none;
          border-radius: 7px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          white-space: nowrap;
        }
        .rp-view-btn:hover  { filter: brightness(0.9); transform: scale(1.04); }
        .rp-view-btn:active { transform: scale(0.96); }

        /* Empty state */
        .rp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .rp-empty-icon { color: #d0dce9; }
      `}</style>
    </>
  )
}

export default ReportsManagement