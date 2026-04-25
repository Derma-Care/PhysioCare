import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ThemeSelector from '../Constant/ThemeSelector'
import { cilBell, cilMenu } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { useGlobalSearch } from '../views/Usecontext/GlobalSearchContext'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const { notificationCount } = useHospital()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useGlobalSearch()

  const HospitalName = localStorage.getItem('staffName')
    ? localStorage.getItem('staffName')
    : localStorage.getItem('HospitalName')?.split(' ')[0] || 'Hospital'
  const branch = localStorage.getItem('branchName') || 'branchName'

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader
      position="sticky"
      className="mb-4 p-0"
      ref={headerRef}
      style={{ backgroundColor: '#1B4F8A' }}
    >
      <CContainer className="px-4" fluid style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>

        {/* ── Sidebar toggler ─────────────────────────── */}
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px', color: 'white' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

     

        {/* ── Right cluster ───────────────────────────── */}
        <div className="d-flex align-items-center ms-auto gap-3">

          {/* Welcome text */}
          <div className="ah-welcome">
            <span className="ah-welcome-name">Welcome, {HospitalName}</span>
            <span className="ah-welcome-branch">{branch}</span>
          </div>


          {/* Theme selector + user dropdown */}
          <CHeaderNav className="d-flex align-items-center gap-1">
            <ThemeSelector />
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>

      {/* ── Breadcrumb row ──────────────────────────────── */}
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>

      {/* ── Styles ─────────────────────────────────────── */}
      <style>{`
        /* ── Search bar ─────────────────────────── */
        .ah-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 8px;
          padding: 0 12px;
          height: 38px;
          width: 320px;
          margin-left: 16px;
          transition: background 0.15s, border-color 0.15s;
        }
        .ah-search-wrap:focus-within {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.45);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
        }
        .ah-search-icon { color: rgba(255,255,255,0.6); flex-shrink: 0; }
        .ah-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 13px;
        }
        .ah-search-input::placeholder { color: rgba(255,255,255,0.52); }
        .ah-search-clear {
          background: none; border: none;
          color: rgba(255,255,255,0.55);
          cursor: pointer; font-size: 12px;
          padding: 0; line-height: 1;
          transition: color 0.12s;
        }
        .ah-search-clear:hover { color: #fff; }

        /* ── Welcome text ───────────────────────── */
        .ah-welcome {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 1px;
        }
        .ah-welcome-name {
          font-size: 13px; font-weight: 600;
          color: #fff; white-space: nowrap;
        }
        .ah-welcome-branch {
          font-size: 11px; font-weight: 400;
          color: rgba(255,255,255,0.72); white-space: nowrap;
        }

        /* ── Notification bell ──────────────────── */
        .ah-bell {
          position: relative;
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .ah-bell:hover  { background: rgba(255,255,255,0.22); transform: scale(1.06); }
        .ah-bell:active { transform: scale(0.94); }

        .ah-bell-badge {
          position: absolute;
          top: -5px; right: -5px;
          min-width: 17px; height: 17px;
          background: #e53935;
          color: #fff;
          font-size: 10px; font-weight: 700;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          border: 1.5px solid #1B4F8A;
          line-height: 1;
          animation: ah-pop 0.25s ease;
        }
        @keyframes ah-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </CHeader>
  )
}

export default AppHeader