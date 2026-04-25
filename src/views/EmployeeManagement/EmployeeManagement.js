import React from 'react'
import { CContainer, CRow, CCol } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserDoctor,
  faHandsHelping,
  faUserAlt,
  faUserTie,
  faShieldHalved,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { useHospital } from '../Usecontext/HospitalContext'

const EmployeeManagement = () => {
  const navigate = useNavigate()
  const { user } = useHospital()

  const iconMap = {
    doctor:     faUserDoctor,
    nurse:      faHandsHelping,
    admin:      faUserAlt,
    frontDesk:  faUserTie,
    security:   faShieldHalved,
    otherStaff: faUsers,
  }

  // Subtle accent colours per card (icon tint + left-border)
  const accentMap = {
    doctor:     { accent: '#185fa5', bg: '#e6f1fb', border: '#b5d4f4' },
    nurse:      { accent: '#3b6d11', bg: '#eaf3de', border: '#c0dd97' },
    admin:      { accent: '#92680a', bg: '#fff8e1', border: '#f0d080' },
    frontDesk:  { accent: '#5b21b6', bg: '#f3f0ff', border: '#c4b5fd' },
    security:   { accent: '#a32d2d', bg: '#fcebeb', border: '#f4b5b5' },
    otherStaff: { accent: '#0e6b6b', bg: '#e6fafa', border: '#9fd9d9' },
  }

  const employees = [
    { title: 'Doctors',       type: 'doctor',     path: '/employee-management/doctor' },
    { title: 'Therapist',     type: 'nurse',       path: '/employee-management/nurse' },
    { title: 'FrontDesk',     type: 'frontDesk',   path: '/employee-management/frontdesk' },
    { title: 'Security',      type: 'security',    path: '/employee-management/security' },
    { title: 'OtherStaff',    type: 'otherStaff',  path: '/employee-management/otherstaff' },
    { title: 'Administrator', type: 'admin',       path: '/employee-management/admin' },
  ]

  const can = (feature) => (user?.permissions?.[feature] || []).length > 0
  const visibleEmployees = employees.filter((emp) => can(emp.title))

  return (
    <CContainer>
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="em-page-header">
        <div className="em-page-title-group">
          <div className="em-page-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h4 className="em-page-title">Employee Management</h4>
            <p className="em-page-sub">{visibleEmployees.length} role{visibleEmployees.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
      </div>

      {/* ── Cards grid ───────────────────────────────────── */}
      <CRow className="g-3">
        {visibleEmployees.map((emp, index) => {
          const colors = accentMap[emp.type] || accentMap.otherStaff
          return (
            <CCol xs={12} sm={6} md={4} lg={3} key={index}>
              <div
                className="em-card"
                style={{ borderLeft: `3px solid ${colors.border}`, animationDelay: `${index * 60}ms` }}
                onClick={() => navigate(emp.path)}
              >
                {/* Icon */}
                <div className="em-icon-wrap" style={{ background: colors.bg, color: colors.accent }}>
                  <FontAwesomeIcon icon={iconMap[emp.type]} style={{ fontSize: '22px' }} />
                </div>

                {/* Text */}
                <div className="em-card-body">
                  <span className="em-card-title">{emp.title}</span>
                  <span className="em-card-sub">Manage staff</span>
                </div>

                {/* Arrow */}
                <div className="em-arrow" style={{ color: colors.accent }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </CCol>
          )
        })}
      </CRow>

      {/* ── Styles ───────────────────────────────────────── */}
      <style>{`
        /* Page header */
        .em-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .em-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .em-page-icon {
          width: 42px; height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex; align-items: center; justify-content: center;
          color: #185fa5; flex-shrink: 0;
        }
        .em-page-title {
          font-size: 17px; font-weight: 600; color: #0c447c; margin: 0;
        }
        .em-page-sub { font-size: 12px; color: #6b7280; margin: 0; }

        /* Card */
        .em-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          padding: 16px 14px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
          animation: em-fadein 0.3s ease both;
          overflow: hidden;
          position: relative;
        }
        .em-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(24,95,165,0.10);
          border-color: #b5d4f4;
        }
        .em-card:active { transform: scale(0.97); }

        /* Fade-in */
        @keyframes em-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Icon circle */
        .em-icon-wrap {
          width: 48px; height: 48px; flex-shrink: 0;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }

        /* Text block */
        .em-card-body {
          display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0;
        }
        .em-card-title {
          font-size: 14px; font-weight: 600; color: #0c447c;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .em-card-sub { font-size: 11px; color: #6b7280; }

        /* Chevron */
        .em-arrow {
          flex-shrink: 0;
          opacity: 0.5;
          transition: opacity 0.15s, transform 0.15s;
        }
        .em-card:hover .em-arrow {
          opacity: 1; transform: translateX(3px);
        }
      `}</style>
    </CContainer>
  )
}

export default EmployeeManagement