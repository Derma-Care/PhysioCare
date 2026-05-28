import { CButton } from '@coreui/react'
import { Upload } from 'lucide-react'
import React, { useRef } from 'react'

import { useNavigate } from 'react-router-dom'
import { showCustomToast } from '../../Utils/Toaster'
import { bookingUpdate } from '../AppointmentManagement/appointmentAPI'
import { COLORS } from '../../Constant/Themes'
import { uploadFile } from '../widgets/S3UploadService'

function UploadButton({ bookingId }) {
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const handleUpload = () => {
    fileInputRef.current.click() // trigger file input
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 204800) {
        showCustomToast("Consent PDF file exceeds the 200 KB limit.", "error")
        return
      }
      try {
        const fileKey = await uploadFile("consentPdf", file)
        const payload = {
          bookingId: bookingId,
          consentFormPdf: fileKey,
        }

        console.log('Final payload:', payload)

        const res = await bookingUpdate(payload)
        console.log(res)
        if (res) {
          showCustomToast(res.message || 'Consent form uploaded successfully', 'success')
          navigate('/dashboard', { replace: true })
        } else {
          showCustomToast(res.message || 'Consent form not uploaded successfully', 'error')
        }
      } catch (error) {
        console.error('Upload failed:', error)
        showCustomToast("Failed to upload consent form.", "error")
      }
    }
  }

  return (
    <>
      <CButton
        style={{
          backgroundColor: COLORS.primary,
          color: COLORS.white,
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
