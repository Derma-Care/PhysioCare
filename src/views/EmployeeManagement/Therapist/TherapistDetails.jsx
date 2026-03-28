import React from 'react'
import { useLocation } from 'react-router-dom'
import { CCard, CCardBody } from '@coreui/react'

export default function TherapistDetails() {
  const location = useLocation()
  const data = location.state

  if (!data) return <p>No Data</p>

  return (
    <CCard className="p-4">
      <CCardBody>

        <h3>{data.fullName}</h3>

        <p><b>ID:</b> {data.therapistId}</p>
        <p><b>Contact:</b> {data.contactNumber}</p>
        <p><b>Gender:</b> {data.gender}</p>
        <p><b>DOB:</b> {data.dateOfBirth}</p>

        <p><b>Qualification:</b> {data.qualification}</p>
        <p><b>Experience:</b> {data.yearsOfExperience} years</p>

        <p><b>Services:</b> {data.services?.join(', ')}</p>
        <p><b>Specializations:</b> {data.specializations?.join(', ')}</p>
        <p><b>Expertise:</b> {data.expertiseAreas?.join(', ')}</p>
        <p><b>Treatments:</b> {data.treatmentTypes?.join(', ')}</p>

        <p>
          <b>Availability:</b><br />
          {data.availability?.days?.join(', ')} <br />
          {data.availability?.startTime} - {data.availability?.endTime}
        </p>

        <p><b>Languages:</b> {data.languages?.join(', ')}</p>
        <p><b>Bio:</b> {data.bio}</p>

      </CCardBody>
    </CCard>
  )
}