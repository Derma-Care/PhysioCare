import React, { useState, useEffect } from 'react';
import { useHospital } from '../views/Usecontext/HospitalContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const NotificationOverlay = () => {
  const { notifications } = useHospital() || {};
  const [activeNotification, setActiveNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[0];
      // Only show if it's new (less than 5 seconds old)
      if (Date.now() - latest.id < 5000) {
        setActiveNotification(latest);
        setVisible(true);
      }
    }
  }, [notifications]);

  if (!activeNotification || !visible) return null;

  const handleAction = () => {
    setVisible(false);
    if (activeNotification.path && activeNotification.path.includes('session-feedback')) {
      navigate(activeNotification.path);
    } else if (activeNotification.patientId && (activeNotification.type === 'SESSION_FEEDBACK' || String(activeNotification.title).toLowerCase().includes('feedback'))) {
      const bookingParam = activeNotification.bookingId ? `&bookingId=${activeNotification.bookingId}` : '';
      navigate(`/session-feedback?patientId=${activeNotification.patientId}${bookingParam}`);
    }
    // If it's a general notification, just closing (setVisible(false)) is enough!
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div className="notif-overlay-container">
      <div className={`notif-card ${visible ? 'notif-animate-in' : 'notif-animate-out'}`}>
        <div className="notif-header">
          <FontAwesomeIcon icon={faBell} className="notif-bell-icon" />
          <span>{(activeNotification.type === 'SESSION_FEEDBACK' || String(activeNotification.title).toLowerCase().includes('feedback')) ? 'Session Milestone' : 'Clinic Notification'}</span>
          <button className="notif-close" onClick={handleClose} title="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="notif-body">
          <div className="notif-icon-circle">
            <FontAwesomeIcon icon={activeNotification.type?.includes('COMPLETE') ? faCheckCircle : faExclamationCircle} />
          </div>
          <div className="notif-content">
            <h6>{activeNotification.title}</h6>
            <div className="notif-pat-info">
              <span className="notif-pat-name">{activeNotification.patientName}</span>
              <span className="notif-pat-mobile">{activeNotification.mobileNumber}</span>
            </div>
            {activeNotification.bookingId && <span className="notif-booking">ID: #{activeNotification.bookingId}</span>}
            <p className="notif-msg">{activeNotification.message}</p>
          </div>
        </div>
        <div className="notif-footer">
          <button className="notif-action-btn" onClick={handleAction}>
            {(activeNotification.type === 'SESSION_FEEDBACK' || String(activeNotification.title).toLowerCase().includes('feedback')) ? 'View Feedback & Action' : 'Acknowledge & Close'}
          </button>
        </div>
      </div>

      <style>{`
        .notif-overlay-container {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          pointer-events: none;
        }
        .notif-card {
          width: 380px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.25);
          border: 1px solid rgba(24, 95, 165, 0.2);
          pointer-events: auto;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .notif-animate-in {
          animation: notif-slide-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .notif-animate-out {
          animation: notif-fade-out 0.3s ease forwards;
        }
        @keyframes notif-slide-up {
          0% { transform: translateY(100px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes notif-fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }

        .notif-header {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .notif-bell-icon { color: #185fa5; }
        .notif-close {
          margin-left: auto;
          background: none; border: none;
          color: #94a3b8; cursor: pointer;
          font-size: 14px;
        }

        .notif-body {
          padding: 24px;
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .notif-icon-circle {
          width: 54px; height: 54px;
          border-radius: 50%;
          background: #e6f1fb;
          color: #185fa5;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        .notif-content { flex: 1; }
        .notif-content h6 {
          margin: 0 0 8px;
          font-weight: 700;
          color: #0c447c;
        }
        
        .notif-pat-info {
          display: flex;
          flex-direction: column;
          margin-bottom: 4px;
        }
        .notif-pat-name { font-size: 16px; font-weight: 700; color: #1e293b; }
        .notif-pat-mobile { font-size: 12px; color: #64748b; font-weight: 500; }
        .notif-booking { font-size: 11px; color: #185fa5; font-weight: 600; display: block; margin-bottom: 8px; }

        .notif-msg {
          margin: 0;
          font-size: 13px;
          color: #475569;
          line-height: 1.4;
          background: #f8fafc;
          padding: 8px;
          border-radius: 6px;
        }

        .notif-footer {
          padding: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .notif-action-btn {
          width: 100%;
          background: #185fa5;
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .notif-action-btn:hover { background: #0c447c; }
        
        .notif-dismiss-btn {
          width: 100%;
          background: transparent;
          color: #64748b;
          border: none;
          padding: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .notif-dismiss-btn:hover { color: #1e293b; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default NotificationOverlay;
