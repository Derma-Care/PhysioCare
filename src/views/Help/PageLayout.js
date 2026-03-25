import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { GetClinicBranches } from '../Doctors/DoctorAPI'

const PageLayout = ({ title, children, branch }) => {
  const { selectedHospital } = useHospital()
  const hospital = selectedHospital?.data

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)

  // 🔹 Fetch Branch List
  useEffect(() => {
    const fetchBranches = async () => {
      if (!hospital?.hospitalId) return
      try {
        setLoading(true)
        const response = await GetClinicBranches(hospital.hospitalId)
        // ✅ Remove 0th index (main branch)
        const filteredBranches = response?.data?.slice(1) || []
        setBranches(filteredBranches)
      } catch (error) {
        console.error('Error fetching branches:', error)
      } finally {
        setLoading(false)
      }
    }

    if (branch) fetchBranches()
  }, [hospital?.hospitalId, branch])

  return (
    <CContainer fluid className="p-2">
      {/* 🔸 Page Title */}
      {title && (
        <h2
          className="mb-4"
          style={{
            fontWeight: 600,
            color: 'var(--color-black)',
            borderBottom: '2px solid #e6e6e6',
            paddingBottom: '8px',
          }}
        >
          {title}
        </h2>
      )}

      {/* 🔸 Hospital Information Card */}
      {branch && hospital && (
        <div
          className="p-4 rounded shadow-sm mb-5 bg-white"
          style={{ border: '1px solid #f1f1f1' }}
        >
          <div className="d-flex align-items-start" style={{ gap: '16px', flexWrap: 'wrap' }}>
            {/* Hospital Logo */}
            {hospital.hospitalLogo ? (
              <img
                src={
                  hospital.hospitalLogo.startsWith('data:')
                    ? hospital.hospitalLogo
                    : `data:image/jpeg;base64,${hospital.hospitalLogo}`
                }
                alt={hospital.name || 'Hospital Logo'}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'fill',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              />
            ) : (
              <div
                className="bg-light d-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              >
                <span className="text-muted">No Logo</span>
              </div>
            )}

            {/* Hospital Details */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4
                className="fw-bold mb-1"
                style={{ fontSize: '1rem', color: 'var(--color-black)' }}
              >
                {hospital.name}
              </h4>
              <p
                className="text-secondary mb-1 d-flex align-items-center gap-2"
                style={{ fontSize: '0.85rem' }}
              >
                <MapPin size={14} /> {hospital.address}
              </p>
              <div
                className="d-flex flex-wrap gap-3"
                style={{ fontSize: '0.8rem', marginTop: '4px' }}
              >
                <span className="d-flex align-items-center gap-2 text-secondary">
                  <Phone size={14} /> {hospital.contactNumber}
                </span>
                <span className="d-flex align-items-center gap-2 text-secondary">
                  <Mail size={14} /> {hospital.emailAddress}
                </span>
                <span className="d-flex align-items-center gap-2 text-secondary">
                  <Clock size={14} /> {hospital.openingTime} - {hospital.closingTime}
                </span>
              </div>
            </div>
          </div>

          {/* 🔹 Branch Section */}
          <div className="mt-4">
            <h6 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--color-black)' }}>
              🏥 Our Branches
            </h6>

            {loading ? (
              <div className="text-center text-muted py-2">Loading branches...</div>
            ) : branches.length > 0 ? (
              <div className="row g-3">
                {branches.map((b, index) => (
                  <div className="col-md-6 col-lg-4" key={b.branchId || index}>
                    <div
                      className="p-3 rounded h-100 bg-white"
                      style={{
                        border: '1px solid #ebebeb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                      }}
                    >
                      <h6 className="fw-bold mb-2" style={{ color: 'var(--color-black)' }}>
                        {b.branchName}
                      </h6>
                      <p className="mb-1 d-flex align-items-center text-secondary gap-2">
                        <MapPin size={14} /> {b.address || '—'}
                      </p>
                      <p className="mb-0 d-flex align-items-center text-secondary gap-2">
                        <Phone size={14} /> {b.contactNumber || '—'}
                      </p>
                      <p className="mb-0 d-flex align-items-center text-muted gap-2">
                        <Mail size={14} /> {b.email || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No branches found.</p>
            )}
          </div>
        </div>
      )}

      {/* 🔸 Page Main Content */}
      <div>{children}</div>
    </CContainer>
  )
}

export default PageLayout
