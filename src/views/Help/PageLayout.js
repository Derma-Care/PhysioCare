import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import { MapPin, Phone, Mail, Clock, Building2, Facebook, Instagram, Twitter } from 'lucide-react'
import { GetClinicBranches } from '../Doctors/DoctorAPI'

// Treats null, undefined, empty string, whitespace, and "NA" as "no value".
const hasValue = (val) =>
  typeof val === 'string' && val.trim().length > 0 && val.trim().toUpperCase() !== 'NA'

// Backend may send a full URL or a bare handle/username — normalize to a URL either way.
const toSocialUrl = (platform, handle) => {
  if (!hasValue(handle)) return null
  const trimmed = handle.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const cleanHandle = trimmed.replace(/^@/, '')
  switch (platform) {
    case 'facebook':
      return `https://facebook.com/${cleanHandle}`
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`
    case 'twitter':
      return `https://x.com/${cleanHandle}`
    default:
      return null
  }
}

const openInNewTab = (url) => {
  if (!hasValue(url)) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const PageLayout = ({ title, children, branch }) => {
  const { selectedHospital } = useHospital()
  const hospital = selectedHospital?.data

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBranches = async () => {
      if (!hospital?.hospitalId) return
      try {
        setLoading(true)
        const response = await GetClinicBranches(hospital.hospitalId)
        // Remove 0th index (main branch)
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

  const showAddress = hasValue(hospital?.address)
  const showPhone = hasValue(hospital?.contactNumber)
  const showEmail = hasValue(hospital?.emailAddress)
  const showTimings = hasValue(hospital?.openingTime) && hasValue(hospital?.closingTime)

  // Keep the existing branch.facebook / branch.instagram / branch.twitter fields
  // (built upstream as `selectedHospital?.facebookHandle || 'NA'` etc.) and only
  // surface a social icon when that value is present.
  const socialLinks = [
    {
      key: 'facebook',
      label: 'Facebook',
      Icon: Facebook,
      url: toSocialUrl('facebook', hospital?.facebookHandle),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      Icon: Instagram,
      url: toSocialUrl('instagram', hospital?.instagramHandle),
    },
    {
      key: 'twitter',
      label: 'X / Twitter',
      Icon: Twitter,
      url: toSocialUrl('twitter', hospital?.twitterHandle),
    },
  ].filter((link) => hasValue(link.url))

  return (
    <CContainer fluid className="pl-2">
      {title && <h2 className="pl-page-title">{title}</h2>}

      {branch && hospital && (
        <div className="pl-hospital-card">
          <div className="pl-hospital-header">
            {hasValue(hospital.hospitalLogo) ? (
              <img
                src={
                  hospital.hospitalLogo.startsWith('data:')
                    ? hospital.hospitalLogo
                    : `data:image/jpeg;base64,${hospital.hospitalLogo}`
                }
                alt={hospital.name || 'Hospital logo'}
                className="pl-hospital-logo"
              />
            ) : (
              <div className="pl-hospital-logo pl-hospital-logo-placeholder">
                <Building2 size={26} />
              </div>
            )}

            <div className="pl-hospital-info">
              <h4 className="pl-hospital-name">{hospital.name || 'NA'}</h4>

              {showAddress && (
                <p className="pl-hospital-address">
                  <MapPin size={14} /> {hospital.address}
                </p>
              )}

              {(showPhone || showEmail || showTimings) && (
                <div className="pl-hospital-meta">
                  {showPhone && (
                    <span className="pl-meta-item">
                      <Phone size={14} /> {hospital.contactNumber}
                    </span>
                  )}
                  {showEmail && (
                    <span className="pl-meta-item">
                      <Mail size={14} /> {hospital.emailAddress}
                    </span>
                  )}
                  {showTimings && (
                    <span className="pl-meta-item">
                      <Clock size={14} /> {hospital.openingTime} - {hospital.closingTime}
                    </span>
                  )}
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="pl-social-row">
                  {socialLinks.map(({ key, label, Icon, url }) => (
                    <button
                      key={key}
                      type="button"
                      className="pl-social-btn"
                      aria-label={label}
                      title={label}
                      onClick={() => openInNewTab(url)}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Branch Section */}
          <div className="pl-branch-section">
            <h6 className="pl-branch-heading">Our branches</h6>

            {loading ? (
              <div className="pl-branch-loading">Loading branches...</div>
            ) : branches.length > 0 ? (
              <div className="pl-branch-grid">
                {branches.map((b, index) => {
                  const branchAddress = hasValue(b.address) ? b.address : null
                  const branchPhone = hasValue(b.contactNumber) ? b.contactNumber : null
                  const branchEmail = hasValue(b.email) ? b.email : null

                  return (
                    <div className="pl-branch-card" key={b.branchId || index}>
                      <h6 className="pl-branch-name">{b.branchName || 'NA'}</h6>
                      {branchAddress && (
                        <p className="pl-branch-line">
                          <MapPin size={14} /> {branchAddress}
                        </p>
                      )}
                      {branchPhone && (
                        <p className="pl-branch-line">
                          <Phone size={14} /> {branchPhone}
                        </p>
                      )}
                      {branchEmail && (
                        <p className="pl-branch-line pl-branch-line-muted">
                          <Mail size={14} /> {branchEmail}
                        </p>
                      )}
                      {!branchAddress && !branchPhone && !branchEmail && (
                        <p className="pl-branch-line pl-branch-line-muted">No details available</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="pl-branch-empty">No branches found.</p>
            )}
          </div>
        </div>
      )}

      <div>{children}</div>

      <style>{`
        .pl-2 { padding: 0.5rem; }

        .pl-page-title {
          font-size: 18px;
          font-weight: 600;
          color: #0c447c;
          margin: 0 0 1rem;
          padding-bottom: 8px;
          border-bottom: 0.5px solid #d0dce9;
        }

        .pl-hospital-card {
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 14px;
          padding: 22px 26px;
          margin-bottom: 24px;
        }

        .pl-hospital-header {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          flex-wrap: wrap;
        }

        .pl-hospital-logo {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          object-fit: cover;
          border: 0.5px solid #d0dce9;
          flex-shrink: 0;
        }

        .pl-hospital-logo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e6f1fb;
          color: #185fa5;
        }

        .pl-hospital-info { flex: 1; min-width: 220px; }

        .pl-hospital-name {
          font-size: 16px;
          font-weight: 700;
          color: #0c447c;
          margin: 0 0 6px;
        }

        .pl-hospital-address {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 8px;
        }

        .pl-hospital-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pl-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #6b7280;
        }

        .pl-social-row {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .pl-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 0.5px solid #b5d4f4;
          background: #fff;
          color: #185fa5;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s, color 0.15s, transform 0.1s;
        }

        .pl-social-btn:hover {
          background: #185fa5;
          color: #fff;
          transform: translateY(-2px);
        }

        .pl-social-btn:active { transform: scale(0.93); }

        .pl-branch-section {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 0.5px solid #eef2f7;
        }

        .pl-branch-heading {
          font-size: 13px;
          font-weight: 700;
          color: #0c447c;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin: 0 0 14px;
        }

        .pl-branch-loading,
        .pl-branch-empty {
          font-size: 13px;
          color: #9ca3af;
          padding: 8px 0;
          margin: 0;
        }

        .pl-branch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .pl-branch-card {
          background: #fafcff;
          border: 0.5px solid #ebebeb;
          border-radius: 10px;
          padding: 14px 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .pl-branch-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(12, 68, 124, 0.08);
          border-color: #b5d4f4;
        }

        .pl-branch-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #0c447c;
          margin: 0 0 8px;
        }

        .pl-branch-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #4b5563;
          margin: 0 0 6px;
        }

        .pl-branch-line:last-child { margin-bottom: 0; }
        .pl-branch-line-muted { color: #9ca3af; }
      `}</style>
    </CContainer>
  )
}

export default PageLayout
