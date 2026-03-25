import { CButton } from '@coreui/react'
import { Upload } from 'lucide-react'
import React, { useRef } from 'react'
import { updateAppointmentBasedOnBookingId } from './consentService'
import { useNavigate } from 'react-router-dom'
import { showCustomToast } from '../../Utils/Toaster'

function UploadButton({ bookingId }) {
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const handleUpload = () => {
    fileInputRef.current.click() // trigger file input
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()

      reader.onloadend = async () => {
        const pdfBase64 = reader.result.split(',')[1] // remove data prefix

        const payload = {
          bookingId: bookingId,
          consentFormPdf: pdfBase64,
        }

        console.log('Final payload:', payload)

        try {
          const res = await updateAppointmentBasedOnBookingId(payload)
          console.log(res)
          if (res) {
            showCustomToast('Consent form uploaded successfully', 'success')
            navigate('/dashboard')
          } else {
            showCustomToast('Consent form not uploaded successfully', 'error')
          }
          // console.log('Consent form uploaded successfully');
        } catch (error) {
          console.error('Upload failed:', error)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <CButton
        style={{
          backgroundColor: 'var(--color-bgcolor)',
          color: 'var(--color-black)',
        }}
        onClick={handleUpload}
        className="d-flex align-items-center gap-1"
      >
        <Upload size={16} />
        Upload File
      </CButton>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  )
}

export default UploadButton
