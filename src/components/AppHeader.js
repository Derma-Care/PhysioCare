import React, { useEffect, useRef, useState } from 'react'
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
import { cilBell, cilMenu, cilX } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { useGlobalSearch } from '../views/Usecontext/GlobalSearchContext'
import logo from '../assets/images/DermaCare.png'
const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const {
    notificationCount, setNotificationCount,
    notifications, setNotifications
  } = useHospital() || {}
  const data = JSON.parse(sessionStorage.getItem('selectedHospital') || '{}')
  const hospitalData = data.data;
  console.log(hospitalData, 'hospitalData')
  console.log(data, 'data')
  const hospitalName = hospitalData?.name || hospitalData?.clinicName || "PhysioElite"
  const hospitalLogo = hospitalData?.hospitalLogo
    ? `data:image/webp;base64,${hospitalData.hospitalLogo}`
    : logo
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useGlobalSearch()

  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const notifRef = useRef(null)

  const HospitalName = sessionStorage.getItem('staffName')
    ? sessionStorage.getItem('staffName')
    : sessionStorage.getItem('HospitalName')?.split(' ')[0] || 'Hospital'
  const branch = sessionStorage.getItem('branchName') || 'branchName'

  useEffect(() => {
    import('../firebase').then(({ listenNotification }) => {
      listenNotification((payload) => {
        const newNotif = {
          id: Date.now(),
          title: payload.notification?.title || 'New Notification',
          message: payload.notification?.body || '',
          patientName: payload.data?.patientName || '',
          mobileNumber: payload.data?.mobileNumber || '',

          patientId: payload.data?.patientId || '',
          bookingId: payload.data?.bookingId || '',
          type: payload.data?.type || '',
          path: payload.data?.path || '',
        }

        setNotifications((prev) => [newNotif, ...(prev || [])])
        setNotificationCount((prev) => (prev || 0) + 1)

        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: hospitalLogo,
          })
        }
      })
    }).catch(err => console.log('Firebase not initialized yet', err))

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [setNotifications, setNotificationCount])

  const handleNotifClick = (notif) => {
    setShowNotifPanel(false)
    if (notif.path) {
      navigate(notif.path)
    } else if (notif.patientId && (notif.type === 'SESSION_FEEDBACK' || String(notif.title).toLowerCase().includes('feedback'))) {
      const bookingParam = notif.bookingId ? `&bookingId=${notif.bookingId}` : '';
      navigate(`/session-feedback?patientId=${notif.patientId}${bookingParam}`)
    }
  }

  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setNotificationCount(Math.max(0, updated.length));
  }

  return (
    <CHeader
      position="sticky"
      className="mb-4 p-0"
      ref={headerRef}
      style={{ backgroundColor: '#1B4F8A' }}
    >
      <CContainer className="px-4" fluid style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>

        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px', color: 'white' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <div className="d-flex align-items-center ms-auto gap-3">
          {/* Notification Bell */}
          <div className="ah-bell-container" ref={notifRef}>
            <div className="ah-bell" onClick={() => setShowNotifPanel(!showNotifPanel)}>
              <CIcon icon={cilBell} size="lg" style={{ color: 'white' }} />
              {notificationCount > 0 && (
                <span className="ah-bell-badge">{notificationCount}</span>
              )}
            </div>

            {showNotifPanel && (
              <div className="ah-notif-panel">
                <div className="ah-notif-header">
                  <span>Notifications ({notificationCount})</span>
                  {notifications?.length > 0 && (
                    <button onClick={() => { setNotifications([]); setNotificationCount(0); }}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="ah-notif-list">
                  {!notifications || notifications.length === 0 ? (
                    <div className="ah-notif-empty">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="ah-notif-item">
                        <div className="ah-notif-item-body" onClick={() => handleNotifClick(n)}>
                          <div className="ah-notif-icon">
                            <CIcon icon={cilBell} />
                          </div>
                          <div className="ah-notif-content">
                            <h6>{n.title}</h6>
                            <div className="ah-notif-pat-summary">
                              <span className="name">{n.patientName}</span>
                              <span className="mobile">{n.mobileNumber}</span>
                              <span className="mobile">{n.bookingId}</span>
                            </div>
                            <p>{n.message}</p>
                            <span className="ah-notif-time">Just now</span>
                          </div>
                        </div>
                        <button className="ah-notif-remove" onClick={() => removeNotification(n.id)}>
                          <CIcon icon={cilX} size="sm" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="ah-welcome">
            <span className="ah-welcome-name">Welcome, {HospitalName}</span>
            <span className="ah-welcome-branch">{branch}</span>
          </div>

          <CHeaderNav className="d-flex align-items-center gap-1">
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>

      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>

      <style>{`
        .ah-bell-container { position: relative; }
        .ah-notif-panel {
          position: absolute;
          top: 45px; right: 0;
          width: 340px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          overflow: hidden;
          animation: ah-fade-in 0.2s ease;
        }
        @keyframes ah-fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ah-notif-header {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px; font-weight: 700; color: #1e293b;
        }
        .ah-notif-header button {
          background: none; border: none; color: #185fa5; font-size: 11px; cursor: pointer;
          font-weight: 600;
        }
        .ah-notif-header button:hover { text-decoration: underline; }
        
        .ah-notif-list { max-height: 400px; overflow-y: auto; }
        
        .ah-notif-item {
          display: flex;
          border-bottom: 1px solid #f1f5f9;
          position: relative;
          transition: background 0.2s;
        }
        .ah-notif-item:hover { background: #f8fafc; }
        
        .ah-notif-item-body {
          flex: 1;
          padding: 14px 16px;
          display: flex; gap: 12px;
          cursor: pointer;
        }
        
        .ah-notif-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: #e6f1fb; color: #185fa5;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        
        .ah-notif-content { flex: 1; }
        .ah-notif-content h6 { margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0c447c; }
        
        .ah-notif-pat-summary {
          display: flex; flex-direction: column; margin-bottom: 6px;
        }
        .ah-notif-pat-summary .name { font-size: 12px; font-weight: 700; color: #1e293b; }
        .ah-notif-pat-summary .mobile { font-size: 10px; color: #64748b; }
        
        .ah-notif-content p { margin: 0; font-size: 12px; color: #475569; line-height: 1.4; }
        .ah-notif-time { font-size: 10px; color: #94a3b8; margin-top: 6px; display: block; }
        
        .ah-notif-remove {
          background: none; border: none;
          color: #cbd5e1; cursor: pointer;
          padding: 10px;
          display: flex; align-items: flex-start;
          transition: color 0.2s;
        }
        .ah-notif-remove:hover { color: #ef4444; }
        
        .ah-notif-empty { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 13px; }

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
