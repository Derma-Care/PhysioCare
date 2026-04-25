import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { CSidebar, CSidebarHeader, CSidebarFooter, CSidebarToggler } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { getNavigation } from '../_nav'
import { useNavigate } from 'react-router-dom'
import { cilHospital } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppSidebar = () => {
  const dispatch    = useDispatch()
  const unfoldable  = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { selectedHospital, hydrated, user } = useHospital()
  const navigate    = useNavigate()

  if (!hydrated) return null

  const hospitalName = selectedHospital?.data.name || 'Hospital Name'
  const hospitalLogo = selectedHospital?.data.hospitalLogo || null
  const navItems     = getNavigation(user?.permissions || {})

  const handleHeaderClick = () => {
    const role = localStorage.getItem('role')
    navigate(role === 'physiotherapist' || role === 'intern' ? '/therapist' : '/dashboard')
  }

  return (
    <>
      <CSidebar
        className="sb-sidebar"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
      >
        {/* ── Header ── */}
        <CSidebarHeader className="sb-header">
          <div className="sb-header-inner">

            {/* Logo / Avatar */}
            {hospitalLogo ? (
              <div className="sb-avatar-ring">
                <img
                  src={
                    hospitalLogo.startsWith('data:')
                      ? hospitalLogo
                      : `data:image/jpeg;base64,${hospitalLogo}`
                  }
                  alt={hospitalName}
                  className="sb-avatar-img"
                />
              </div>
            ) : (
              <div className="sb-avatar-ring sb-avatar-ring--placeholder">
                <CIcon icon={cilHospital} size="xl" style={{ color: '#fff' }} />
              </div>
            )}

            {/* Name */}
            <div
              className="sb-hospital-name"
              onClick={handleHeaderClick}
              title={hospitalName}
            >
              {hospitalName}
            </div>

            {/* Sub role / tagline */}
            <div className="sb-hospital-sub">
              {selectedHospital?.data?.type || 'Healthcare'}
            </div>

          </div>
        </CSidebarHeader>

        {/* ── Nav ── */}
        <div className="sb-nav-wrap">
          <AppSidebarNav items={navItems} />
        </div>

        {/* ── Footer ── */}
        <CSidebarFooter className="sb-footer d-none d-lg-flex">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          />
        </CSidebarFooter>
      </CSidebar>

      <style>{`

        /* ─── Sidebar shell ─────────────────────────── */
        .sb-sidebar {
          background: #1a3a6b !important;
          border-right: none !important;
          display: flex;
          flex-direction: column;
        }

        /* ─── Header ────────────────────────────────── */
        .sb-header {
          background: #1a3a6b !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          padding: 0 !important;
        }
        .sb-header-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 16px 20px;
          gap: 8px;
          width: 100%;
        }

        /* ─── Avatar ring ───────────────────────────── */
        .sb-avatar-ring {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 3px solid #f0b429;
          padding: 3px;
          background: #1a3a6b;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          box-shadow: 0 0 0 1px rgba(240,180,41,0.3);
        }
        .sb-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .sb-avatar-ring--placeholder {
          background: rgba(255,255,255,0.1);
        }

        /* ─── Hospital / User name ──────────────────── */
        .sb-hospital-name {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
          cursor: pointer;
          padding: 0 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: opacity 0.2s;
          animation: sbFadeUp 0.5s ease-out;
        }
        .sb-hospital-name:hover { opacity: 0.85; }

        /* ─── Sub text (type/role) ──────────────────── */
        .sb-hospital-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          text-align: center;
        }

        /* ─── Nav wrapper ───────────────────────────── */
        .sb-nav-wrap {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px 0;
        }
        .sb-nav-wrap::-webkit-scrollbar { width: 3px; }
        .sb-nav-wrap::-webkit-scrollbar-track { background: transparent; }
        .sb-nav-wrap::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }

        /* ─── Nav items ─────────────────────────────── */
        .sb-nav-wrap .nav-link,
        .sb-nav-wrap .nav-group-toggle,
        .sb-nav-wrap a.nav-link {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          margin: 3px 12px !important;
          padding: 10px 16px !important;
          border-radius: 10px !important;
          font-size: 13.5px !important;
          font-weight: 600 !important;
          color: rgba(255,255,255,0.75) !important;
          background: transparent !important;
          transition: background 0.15s, color 0.15s !important;
          text-decoration: none !important;
          border: none !important;
        }

        /* Hover */
        .sb-nav-wrap .nav-link:hover,
        .sb-nav-wrap .nav-group-toggle:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }

        /* Active — gold pill exactly like the reference */
        .sb-nav-wrap .nav-link.active,
        .sb-nav-wrap a.nav-link.active {
          background: #f0b429 !important;
          color: #1a3a6b !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 12px rgba(240,180,41,0.35) !important;
        }

        /* Icons default */
        .sb-nav-wrap .nav-link svg,
        .sb-nav-wrap .nav-link .c-icon {
          color: rgba(255,255,255,0.55) !important;
          flex-shrink: 0;
          width: 18px !important;
          height: 18px !important;
        }
        /* Icons hover */
        .sb-nav-wrap .nav-link:hover svg,
        .sb-nav-wrap .nav-link:hover .c-icon {
          color: #fff !important;
        }
        /* Icons active — dark so they show on gold */
        .sb-nav-wrap .nav-link.active svg,
        .sb-nav-wrap .nav-link.active .c-icon {
          color: #1a3a6b !important;
          fill: #1a3a6b !important;
        }

        /* Section / group titles */
        .sb-nav-wrap .nav-title {
          font-size: 10px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.7px !important;
          color: #f0b429 !important;
          padding: 16px 28px 6px !important;
        }

        /* ─── Footer ────────────────────────────────── */
        .sb-footer {
          background: #152f59 !important;
          border-top: 1px solid rgba(255,255,255,0.08) !important;
        }
        .sb-footer .c-sidebar-toggler,
        .sb-footer button {
          color: rgba(255,255,255,0.5) !important;
        }
        .sb-footer .c-sidebar-toggler:hover,
        .sb-footer button:hover {
          color: #fff !important;
        }

        /* ─── Animation ─────────────────────────────── */
        @keyframes sbFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1;  transform: translateY(0);   }
        }

        /* ─── Responsive ────────────────────────────── */
        @media (max-width: 400px) {
          .sb-avatar-ring   { width: 72px; height: 72px; }
          .sb-hospital-name { font-size: 13px; }
        }
      `}</style>
    </>
  )
}

export default React.memo(AppSidebar)