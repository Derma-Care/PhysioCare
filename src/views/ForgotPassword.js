import React, { useState } from 'react'
import { FaEye, FaEyeSlash, FaMobileAlt, FaEnvelopeOpenText, FaLock } from 'react-icons/fa'
import { http } from '../Utils/Interceptors'
import { COLORS } from '../Constant/Themes'

const STEPS = ['mobile', 'otp', 'password']

const ForgotPassword = ({ onClose, role, initialMobile = '' }) => {
  const [step, setStep] = useState('mobile')
  console.log(role);

  // Step 1: Mobile
  const [mobile, setMobile] = useState(initialMobile)
  const [mobileError, setMobileError] = useState('')
  const [mobileLoading, setMobileLoading] = useState(false)
  const [otpInfo, setOtpInfo] = useState('')

  // Step 2: OTP
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  // Step 3: New Password
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdErrors, setPwdErrors] = useState({})
  const [pwdLoading, setPwdLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const clearAlerts = () => {
    setApiError('')
    setSuccessMsg('')
  }

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(password)
  }

  // --- Handlers ---
  const handleSendOtp = async (e) => {
    e.preventDefault()
    clearAlerts()
    if (!mobile.trim()) { setMobileError('Mobile number is required'); return }
    if (!/^\d{10}$/.test(mobile.trim())) { setMobileError('Enter a valid 10-digit mobile number'); return }
    setMobileError('')
    setMobileLoading(true)

    try {
      const response = await http.get(`/forgot-password/${mobile}/${role.toUpperCase()}`)
      setOtpInfo(response.data?.message || 'OTP has been sent to your registered Email Id.')
      setStep('otp')
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setMobileLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    clearAlerts()
    if (!otp.trim()) { setOtpError('Please enter the OTP'); return }
    if (!/^\d{4,8}$/.test(otp.trim())) { setOtpError('Enter a valid OTP'); return }
    setOtpError('')
    setOtpLoading(true)

    try {
      await http.get(`/verify-otp/${mobile}/${role.toUpperCase()}/${otp}`)
      setStep('password')
    } catch (err) {
      setOtpError(err.message || err?.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    clearAlerts()
    const errs = {}
    if (!newPwd.trim()) {
      errs.newPwd = 'New password is required'
    } else if (!validatePassword(newPwd)) {
      errs.newPwd = 'Password must be 8–20 chars, with 1 uppercase, 1 number, and 1 special char.'
    }
    if (!confirmPwd.trim()) errs.confirmPwd = 'Please confirm the password'
    else if (newPwd !== confirmPwd) errs.confirmPwd = 'Passwords do not match'

    setPwdErrors(errs)
    if (Object.keys(errs).length) return

    setPwdLoading(true)
    try {
      const payload = {
        otp: otp,
        newPassword: newPwd,
        confirmPassword: confirmPwd
      }
      await http.post(`/reset-password/${role.toUpperCase()}/${mobile}`, payload)

      setSuccessMsg('✅ Password reset successfully!')
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setPwdLoading(false)
    }
  }

  const stepMeta = {
    mobile: { icon: <FaMobileAlt size={22} />, title: 'Forgot Password', sub: 'Enter your registered mobile number' },
    otp: { icon: <FaEnvelopeOpenText size={20} />, title: 'Verify OTP', sub: 'Enter the OTP sent to your device' },
    password: { icon: <FaLock size={20} />, title: 'Reset Password', sub: 'Set your new secure password' },
  }
  const { icon, title, sub } = stepMeta[step]
  const stepIndex = STEPS.indexOf(step)

  return (
    <div style={{ padding: '0.5rem 1rem 1rem' }}>
      <style>{`
        .fp-input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .fp-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          display: block;
        }
        .fp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          background: #f8fafc;
          transition: all 0.25s ease;
          overflow: hidden;
        }
        .fp-input-wrapper.error {
          border-color: #fecaca;
          background: #fff5f5;
        }
        .fp-input-wrapper:focus-within {
          border-color: ${COLORS.primary};
          box-shadow: 0 0 0 3px rgba(27,79,138,0.12);
          background: #fff;
        }
        .fp-icon-left {
          padding-left: 14px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fp-input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 12px 14px 12px 10px;
          font-size: 14px;
          color: #1e293b;
          outline: none;
        }
        .fp-input.otp {
          font-size: 22px;
          letter-spacing: 0.4em;
          text-align: center;
          font-weight: 700;
          padding-left: 0;
        }
        .fp-input::placeholder {
          color: #94a3b8;
          font-size: 13.5px;
          letter-spacing: normal;
          font-weight: 400;
        }
        .fp-icon-right {
          padding-right: 14px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .fp-icon-right:hover {
          color: ${COLORS.primary};
        }
        .fp-btn {
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
        .fp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(27,79,138,0.35);
        }
        .fp-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .fp-btn.secondary {
          background: #f1f5f9;
          color: #475569;
          box-shadow: none;
        }
        .fp-btn.secondary:hover:not(:disabled) {
          background: #e2e8f0;
          color: #1e293b;
          box-shadow: none;
        }
        .fp-btn:disabled {
          background: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }
        .fp-message {
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideDown 0.3s ease;
        }
        .fp-message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .fp-message.success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }
        .fp-message.info {
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fp-step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .fp-step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.3s;
        }
        .fp-step-dot.active {
          background: ${COLORS.primary};
          color: white;
          box-shadow: 0 0 0 3px rgba(27,79,138,0.15);
        }
        .fp-step-dot.inactive {
          background: #e2e8f0;
          color: #94a3b8;
        }
        .fp-step-line {
          height: 2px;
          flex: 1;
          max-width: 40px;
          border-radius: 2px;
          transition: background 0.3s;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: 54, height: 54, borderRadius: '16px', background: 'rgba(27,79,138,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          border: '1px solid rgba(27,79,138,0.15)', color: COLORS.primary
        }}>
          {icon}
        </div>
        <h4 style={{ color: '#1e293b', fontWeight: 800, margin: 0, fontSize: '20px' }}>{title}</h4>
        <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '6px', marginBottom: 0 }}>{sub}</p>
      </div>

      {/* Step Indicator */}
      <div className="fp-step-indicator">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`fp-step-dot ${i <= stepIndex ? 'active' : 'inactive'}`}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className="fp-step-line" style={{ background: i < stepIndex ? COLORS.primary : '#e2e8f0' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Alerts */}
      {successMsg && <div className="fp-message success">{successMsg}</div>}
      {apiError && <div className="fp-message error">{apiError}</div>}

      {/* STEP 1: MOBILE */}
      {step === 'mobile' && (
        <form onSubmit={handleSendOtp} noValidate>
          <div className="fp-input-group">
            <label className="fp-label">Registered Mobile Number</label>
            <div className={`fp-input-wrapper ${mobileError ? 'error' : ''}`}>
              <div className="fp-icon-left"><FaMobileAlt size={14} /></div>
              <input
                type="tel"
                maxLength={10}
                className="fp-input"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setMobileError(''); clearAlerts() }}
              />
            </div>
            {mobileError && <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>{mobileError}</div>}
          </div>
          <button type="submit" className="fp-btn" disabled={mobileLoading}>
            {mobileLoading ? (
              <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Sending OTP...</>
            ) : 'Send OTP'}
          </button>
        </form>
      )}

      {/* STEP 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} noValidate>
          {otpInfo && <div className="fp-message info">📬 {otpInfo}</div>}

          <div className="fp-input-group">
            <label className="fp-label" style={{ textAlign: 'center' }}>Enter OTP</label>
            <div className={`fp-input-wrapper ${otpError ? 'error' : ''}`}>
              <input
                type="text"
                maxLength={8}
                className="fp-input otp"
                placeholder="0000"
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); clearAlerts() }}
              />
            </div>
            {otpError && <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4, textAlign: 'center' }}>{otpError}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="fp-btn secondary" onClick={() => { setStep('mobile'); clearAlerts() }} style={{ flex: 1 }}>
              Back
            </button>
            <button type="submit" className="fp-btn" disabled={otpLoading} style={{ flex: 2 }}>
              {otpLoading ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
              ) : 'Verify OTP'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: COLORS.primary, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              Resend OTP
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PASSWORD */}
      {step === 'password' && (
        <form onSubmit={handleResetPassword} noValidate>
          <div style={{ marginBottom: 16, padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaMobileAlt color={COLORS.primary} />
            Mobile: <span style={{ fontWeight: 700, color: '#1e293b' }}>{mobile}</span>
          </div>

          <div className="fp-input-group">
            <label className="fp-label">New Password</label>
            <div className={`fp-input-wrapper ${pwdErrors.newPwd ? 'error' : ''}`}>
              <div className="fp-icon-left"><FaLock size={14} /></div>
              <input
                type={showNew ? 'text' : 'password'}
                className="fp-input"
                placeholder="8+ chars, 1 cap, 1 special, 1 num"
                value={newPwd}
                onChange={e => { setNewPwd(e.target.value); setPwdErrors(p => ({ ...p, newPwd: '' })); clearAlerts() }}
              />
              <div className="fp-icon-right" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </div>
            </div>
            {pwdErrors.newPwd && <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>{pwdErrors.newPwd}</div>}
          </div>

          <div className="fp-input-group">
            <label className="fp-label">Confirm New Password</label>
            <div className={`fp-input-wrapper ${pwdErrors.confirmPwd ? 'error' : ''}`}>
              <div className="fp-icon-left"><FaLock size={14} /></div>
              <input
                type={showConfirm ? 'text' : 'password'}
                className="fp-input"
                placeholder="Confirm your new password"
                value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); setPwdErrors(p => ({ ...p, confirmPwd: '' })); clearAlerts() }}
              />
              <div className="fp-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </div>
            </div>
            {pwdErrors.confirmPwd && <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 4 }}>{pwdErrors.confirmPwd}</div>}
          </div>

          <button type="submit" className="fp-btn" disabled={pwdLoading}>
            {pwdLoading ? (
              <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Updating...</>
            ) : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  )
}

export default ForgotPassword
