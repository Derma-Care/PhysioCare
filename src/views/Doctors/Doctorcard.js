import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilStar } from '@coreui/icons'
import { CFormSwitch } from '@coreui/react' // <-- import this for the toggle switch
import { toast } from 'react-toastify'
import { updateDoctorAvailability } from './DoctorAPI' // Adjust path accordingly
import { COLORS } from '../../Constant/Themes'
import capitalizeWords from '../../Utils/capitalizeWords'
import { showCustomToast } from '../../Utils/Toaster'

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()
  const [availability, setAvailability] = useState(doctor.doctorAvailabilityStatus || false)

  if (!doctor) return null

  const handleToggle = async (e) => {
    const value = e.target.checked
    setAvailability(value) // Optimistic update

    const success = await updateDoctorAvailability(doctor.doctorId, value)
    if (success) {
     showCustomToast(`Availability set to ${value ? 'Available' : 'Not Available'}`,'success')
    } else {
      showCustomToast('Failed to update availability','error')
      setAvailability(!value) // revert change if failed
    }
  }

  return (
    <div className="doctor-card">
      {/* Left: Avatar */}
      <div className="doctor-avatar">
        <img
          src={doctor.doctorPicture}
          alt={`Photo of Dr. ${doctor.doctorName || 'Doctor'}`}
          onError={(e) => {
            if (e.target.src !== window.location.origin + '/default-avatar.png') {
              e.target.src = '/default-avatar.png'
            }
          }}
        />
      </div>

      {/* Middle: Doctor Info */}
      <div className="doctor-info">
        <h2>
          {capitalizeWords(doctor.doctorName)}, {(doctor.qualification)}
        </h2>
        <p className="speciality">{capitalizeWords(doctor.specialization)}</p>
        <p>{doctor.experience} Years of experience</p>

        {/* ✅ Availability toggle placed right under experience */}
        <div className="availability-toggle d-flex align-items-center gap-2 mt-2">
          <label
            htmlFor={`availability-${doctor.doctorId}`}
            className="fw-bold mb-0  "
            style={{ whiteSpace: 'nowrap' }}
          >
            Doctor Availability
          </label>
          <CFormSwitch
            id={`availability-${doctor.doctorId}`}
            checked={availability}
            onChange={handleToggle}
            style={{
              backgroundColor: 'var(--color-black)',
              marginTop: '-10px',
              borderColor: 'var(--color-bgcolor)',
            }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="doctor-action d-flex flex-column align-items-center gap-2 p-2 border rounded shadow-sm">
        <button
          className="btn btn-info w-100"
          onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })}
          aria-label={`View details of Dr. ${doctor.doctorName}`}
        >
          View Details
        </button>
        <p className="mb-0 " style={{ color: 'var(--color-black)' }}>
          <strong>ID:</strong> {doctor.doctorId}
        </p>
      </div>

      {/* Styles */}
      <style>{`
       .doctor-card {
  display: flex;
  align-items: flex-start;
  padding: 16px ;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  background-color: #fff;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.doctor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.doctor-avatar img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f1f1f1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.doctor-info {
  flex-grow: 1;
  padding: 0 10px;
}

.doctor-info h2 {
  color:${'var(--color-black)'};
  font-size: 18px;
  margin: 0 0 6px;
  font-weight: 700;
}

.speciality {
  margin: 4px 0;
  color:${'var(--color-black)'};
  font-size: 14px;
}

.doctor-info p {
 
  color:${'var(--color-black)'};
  font-size: 14px;
}

.availability-toggle label {
margin-top:-30px;
  font-size: 14px;
  color:${'var(--color-black)'};
}

.doctor-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border: 1px solid ${'var(--color-black)'};
  border-radius: 10px;
  background-color: #fafafa;
  min-width: 160px;
  max-width: 200px;
}

.doctor-action button {
  background-color:${'var(--color-black)'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  transition: background-color 0.2s;
}

.doctor-action button:hover {
  background-color:${'var(--color-black)'};
}

      `}</style>
    </div>
  )
}

export default DoctorCard
