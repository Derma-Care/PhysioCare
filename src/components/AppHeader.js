import React, { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ThemeSelector from '../Constant/ThemeSelector'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { HospitalProvider } from '../views/Usecontext/HospitalContext'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { COLORS } from '../Constant/Themes'
import { useGlobalSearch } from '../views/Usecontext/GlobalSearchContext'
import BackButton from '../views/widgets/BackButton'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const { notificationCount } = useHospital()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const HospitalName = localStorage.getItem('staffName')
    ? localStorage.getItem('staffName')
    : localStorage.getItem('HospitalName')?.split(' ')[0] || 'Hospital'
  const branch = localStorage.getItem('branchName')
    ? localStorage.getItem('branchName')
    : localStorage.getItem('branchName') || 'branchName'

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])
  const { searchQuery, setSearchQuery } = useGlobalSearch()

  return (
    <CHeader
      position="sticky"
      className="mb-4 p-0"
      ref={headerRef}
      style={{ backgroundColor: 'var(--color-bgcolor)' }}
    >
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        {/* Search Bar */}
        <div className="d-none d-md-block me-4" style={{ color: 'var(--color-black)' }}>
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              color: 'var(--color-black)',
              borderRadius: '10px', // Rounded corners
              padding: '10px 15px', // Inner spacing
              border: `1px solid ${'var(--color-black)'}`, // Light gray border
              outline: 'none', // Removes focus border
              width: '350px', // Adjust width as needed
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow
              height: '40px',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      
        {/* Notification Icons */}
        <div className="d-flex align-items-center ms-auto">
          {/* Bell icon with badge */}

          {/* Welcome text */}
          <div
            className="fw-bold mx-5"
            style={{
              color: 'var(--color-black)',
              textAlign: 'center', // center-align both lines
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>Welcome, {HospitalName}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.9 }}>{branch}</div>
          </div>

          <div
            className="position-relative me-3 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/doctor-notifications')
            }}
          >
            <CIcon
              icon={cilBell}
              size="lg"
              className="mx-2"
              style={{ color: 'var(--color-black)' }}
            />
            {notificationCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.7rem' }}
              >
                {notificationCount}
              </span>
            )}
          </div>
          <CHeaderNav>
            {/* <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li> */}
            <ThemeSelector />
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
