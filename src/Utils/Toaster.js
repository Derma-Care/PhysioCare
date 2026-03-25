// // toastUtil.js
// import { toast } from 'react-toastify'
// export const showToast = (msg, type = 'info') => {
//   const options = { toastId: msg, position: 'top-right', autoClose: 4000 }
//   if (type === 'success') toast.success(msg, options)
//   else if (type === 'error') toast.error(msg, options)
//   else if (type === 'warning') toast.warning(msg, options)
//   else toast.info(msg, options)
// }

// components/CustomToast.jsx
import React from 'react'
import { toast } from 'react-toastify'
import '../views/Style/CustomToast.css' // optional for extra styles
import { useHospital } from '../views/Usecontext/HospitalContext'

const CustomToast = ({ message, type = 'success' }) => {
  const { fetchHospital, selectedHospital } = useHospital()
  return (
    <div className={`custom-toast ${type}`}>
      {selectedHospital?.data.hospitalLogo ? (
        <img
          className="profile-image"
          src={
            selectedHospital?.data.hospitalLogo.startsWith('data:')
              ? selectedHospital?.data.hospitalLogo
              : `data:image/jpeg;base64,${selectedHospital?.data.hospitalLogo}`
          }
          alt={selectedHospital?.data.name || 'Hospital Logo'}
          style={{ width: '20px', height: '20px', marginBottom: '0px' }}
        />
      ) : (
        <div className="spinner"></div>
      )}
      <div className="toast-message">{message}</div>
    </div>
  )
}

export const showCustomToast = (message, type = 'success') => {
  toast(<CustomToast message={message} type={type} />, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
     toastId: `custom-${message}`,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    closeButton: (
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginRight: '10px' }}>
        ×
      </span>
    ),
  })
}
