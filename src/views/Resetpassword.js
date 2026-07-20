import React, { useState } from 'react'
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa'
import { http } from '../Utils/Interceptors'
import { COLORS } from '../Constant/Themes'

const ResetPassword = ({ onClose, role }) => {
  const [form, setForm] = useState({
    username: '',
    role: role,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = form

    if (!currentPassword || !newPassword || !confirmPassword || !form.username) {
      setMessage('All fields are required.')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('New and confirm password do not match.')
      return
    }

    if (!validatePassword(newPassword)) {
      setMessage('Password must be 8–20 characters, with at least one uppercase letter, one number, and one special character.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await http.put(
        `/updatePassword/${form.username}`,
        {
          role: role,
          password: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
      )

      if (response.data.success) {
        setMessage('✅ Password updated successfully!')
        setForm({
          username: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => {
          onClose?.()
        }, 1200)
      } else {
        setMessage(response.data.message || '❌ Failed to update password.')
      }
    } catch (err) {
      console.error('Password update error:', err)
      setMessage('❌ Error updating password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '0.5rem 1rem 1rem' }}>
      <style>{`
        .rp-input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .rp-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          display: block;
        }
        .rp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          background: #f8fafc;
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .rp-input-wrapper:focus-within {
          border-color: ${COLORS.primary};
          box-shadow: 0 0 0 3px rgba(27,79,138,0.12);
          background: #fff;
        }
        .rp-icon-left {
          padding-left: 14px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rp-input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 12px 14px 12px 10px;
          font-size: 14px;
          color: #1e293b;
          outline: none;
        }
        .rp-input::placeholder {
          color: #94a3b8;
          font-size: 13.5px;
        }
        .rp-icon-right {
          padding-right: 14px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .rp-icon-right:hover {
          color: ${COLORS.primary};
        }
        .rp-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, ${COLORS.primary} 0%, #2468b8 100%);
          color: white;
          font-weight: 700;
          font-size: 14.5px;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(27,79,138,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .rp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(27,79,138,0.35);
        }
        .rp-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .rp-btn:disabled {
          background: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }
        .rp-message {
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideDown 0.3s ease;
        }
        .rp-message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .rp-message.success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: 54, height: 54, borderRadius: '16px', background: 'rgba(27,79,138,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          border: '1px solid rgba(27,79,138,0.15)'
        }}>
          <FaLock size={22} color={COLORS.primary} />
        </div>
        <h4 style={{ color: '#1e293b', fontWeight: 800, margin: 0, fontSize: '20px' }}>Secure Reset</h4>
        <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '6px', marginBottom: 0 }}>Update your account password</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {message && (
          <div className={`rp-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="rp-input-group">
          <label className="rp-label">Username</label>
          <div className="rp-input-wrapper">
            <div className="rp-icon-left"><FaUser size={14} /></div>
            <input
              type="text"
              name="username"
              className="rp-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="rp-input-group">
          <label className="rp-label">Current Password</label>
          <div className="rp-input-wrapper">
            <div className="rp-icon-left"><FaLock size={14} /></div>
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              className="rp-input"
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={handleChange}
            />
            <div className="rp-icon-right" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </div>
          </div>
        </div>

        <div className="rp-input-group">
          <label className="rp-label">New Password</label>
          <div className="rp-input-wrapper">
            <div className="rp-icon-left"><FaLock size={14} /></div>
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              className="rp-input"
              placeholder="8+ chars, 1 cap, 1 special, 1 num"
              value={form.newPassword}
              onChange={handleChange}
            />
            <div className="rp-icon-right" onClick={() => setShowNew(!showNew)}>
              {showNew ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </div>
          </div>
        </div>

        <div className="rp-input-group">
          <label className="rp-label">Confirm New Password</label>
          <div className="rp-input-wrapper">
            <div className="rp-icon-left"><FaLock size={14} /></div>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              className="rp-input"
              placeholder="Confirm your new password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <div className="rp-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </div>
          </div>
        </div>

        <button type="submit" className="rp-btn" disabled={loading}>
          {loading ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Updating...
            </>
          ) : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
