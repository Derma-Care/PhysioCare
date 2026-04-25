import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CFormSwitch } from '@coreui/react'
import { Eye } from 'lucide-react'
import { updateDoctorAvailability } from './DoctorAPI'
import capitalizeWords from '../../Utils/capitalizeWords'
import { showCustomToast } from '../../Utils/Toaster'
import { cilArrowRight } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()
  const [availability, setAvailability] = useState(doctor?.doctorAvailabilityStatus || false)

  if (!doctor) return null

  const handleToggle = async (e) => {
    const value = e.target.checked
    setAvailability(value)
    const success = await updateDoctorAvailability(doctor.doctorId, value)
    if (success) {
      showCustomToast(`Availability set to ${value ? 'Available' : 'Not Available'}`, 'success')
    } else {
      showCustomToast('Failed to update availability', 'error')
      setAvailability(!value)
    }
  }

  const initials = doctor.doctorName
    ? doctor.doctorName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'DR'

  return (
    <div className="dc-card">
      {/* Avatar */}
      <div className="dc-avatar">
        {doctor.doctorPicture ? (
          <img
            src={doctor.doctorPicture}
            alt={`Dr. ${doctor.doctorName}`}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="dc-initials"
          style={{ display: doctor.doctorPicture ? 'none' : 'flex' }}
        >
          {initials}
        </div>
      </div>

      {/* Info */}
      <div className="dc-info">
        <div className="dc-name">
          {capitalizeWords(doctor.doctorName)}, {doctor.qualification}
        </div>
        <div className="dc-spec">{capitalizeWords(doctor.specialization)}</div>
        <div className="dc-exp">{doctor.experience} years of experience</div>

        <div className="dc-avail-row">
          <span className="dc-avail-label">Availability</span>
          <CFormSwitch
            id={`availability-${doctor.doctorId}`}
            checked={availability}
            onChange={handleToggle}
            className="dc-toggle"
          />
          <span className={`dc-avail-badge ${availability ? 'available' : 'unavailable'}`}>
            {availability ? 'Available' : 'Not Available'}
          </span>
        </div>
      </div>

      {/* Action panel */}
      <div className="dc-action">
        <button
          className="dc-view-btn"
          onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })}
          aria-label={`View details of Dr. ${doctor.doctorName}`}
        >
          <Eye size={14} />
          View Details
        </button>
        <div className="dc-id">
          <span>ID:</span> {doctor.doctorId}
        </div>
      </div>

      <style>{`
        .dc-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          border: 0.5px solid #d0dce9;
          border-radius: 12px;
          margin-bottom: 12px;
          background: #ffffff;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .dc-card:hover {
          transform: translateY(-2px);
          border-color: #85b7eb;
          box-shadow: 0 4px 16px rgba(24, 95, 165, 0.08);
        }

        /* Avatar */
        .dc-avatar {
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid #b5d4f4;
          overflow: hidden;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dc-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .dc-initials {
          font-size: 22px;
          font-weight: 500;
          color: #0c447c;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        /* Info */
        .dc-info {
          flex-grow: 1;
          min-width: 0;
        }
        .dc-name {
          font-size: 15px;
          font-weight: 500;
          color: #0c447c;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dc-spec {
          font-size: 12px;
          font-weight: 500;
          color: #185fa5;
          margin-bottom: 3px;
        }
        .dc-exp {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 10px;
        }

        /* Availability row */
        .dc-avail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dc-avail-label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          white-space: nowrap;
        }
        .dc-toggle {
          /* override CoreUI switch to use brand blue */
          --cui-form-switch-checked-bg: #185fa5 !important;
          --cui-form-switch-bg: #ccc !important;
          margin-bottom: 0 !important;
          cursor: pointer;
        }
        .dc-avail-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .dc-avail-badge.available {
          background: #eaf3de;
          color: #3b6d11;
        }
        .dc-avail-badge.unavailable {
          background: #fcebeb;
          color: #a32d2d;
        }

        /* Action panel */
        .dc-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border: 0.5px solid #b5d4f4;
          border-radius: 10px;
          background: #e6f1fb;
          min-width: 140px;
          flex-shrink: 0;
        }
        .dc-view-btn {
          background: #185fa5;
          color: #fff;
          border: none;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s ease;
        }
        .dc-view-btn:hover {
          background: #0c447c;
        }
        .dc-id {
          font-size: 11px;
          color: #185fa5;
        }
        .dc-id span {
          font-weight: 500;
        }

        /* Responsive: stack on small screens */
        @media (max-width: 480px) {
          .dc-card {
            flex-wrap: wrap;
          }
          .dc-action {
            width: 100%;
            min-width: unset;
            flex-direction: row;
            justify-content: space-between;
          }
          .dc-view-btn {
            width: auto;
            flex: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default DoctorCard