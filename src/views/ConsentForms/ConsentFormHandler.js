import React, { useEffect, useState } from 'react'
import { CButton, CAccordionItem, CAccordionHeader, CAccordionBody } from '@coreui/react'
import { Eye, Download, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { fetchConsentData } from './consentService'
import { generateConsentPDF } from './generateConsentPDF'
import UploadButton from './UploadButton'
import { showCustomToast } from '../../Utils/Toaster'

const ConsentFormHandler = ({ appointment, doctor, selectedHospital, hospitalId }) => {
  const [pdfBlob, setPdfBlob] = useState(null)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initConsent = async () => {
      try {
        setLoading(true)
        const data = await fetchConsentData(appointment, hospitalId)
        if (data?.data?.length > 0) {
          const doc = await generateConsentPDF(data.data, appointment, doctor, selectedHospital)
          const blob = doc.output('blob')
          setPdfBlob(blob)
        } else {
          showCustomToast('No consent form data found.','error')
        }
      } catch (err) {
        // showCustomToast('Error fetching consent form data.','error')
      } finally {
        setLoading(false)
      }
    }
    initConsent()
  }, [appointment, hospitalId])

  const handlePreview = () => {
    if (!pdfBlob) return showCustomToast('Consent form not ready.','error')
    const url = URL.createObjectURL(pdfBlob)
    window.open(url, '_blank')
  }

  const handleDownload = () => {
    if (!pdfBlob) return showCustomToast('Consent form not ready.','error')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(pdfBlob)
    link.download = `${appointment?.subServiceName || 'Procedure'}_Consent.pdf`
    link.click()
    setIsDownloaded(true)
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      showCustomToast(`File uploaded: ${file.name}`,'success')
    }
  }

  if (loading) return <p>Generating consent form...</p>

  return (
    <CAccordionItem itemKey={10} style={{ color: 'var(--color-black)' }}>
      <CAccordionHeader style={{ color: 'var(--color-black)' }}>Consent Form</CAccordionHeader>
      <CAccordionBody>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div style={{ color: 'var(--color-black)' }}>{appointment?.subServiceName || 'N/A'}</div>

          <div className="d-flex gap-2">
            <CButton
              style={{
                backgroundColor: 'var(--color-bgcolor)',
                color: 'var(--color-black)',
              }}
              onClick={handlePreview}
              className="d-flex align-items-center gap-1"
            >
              <Eye size={16} />
            </CButton>

            <CButton
              style={{
                backgroundColor: 'var(--color-bgcolor)',
                color: 'var(--color-black)',
              }}
              onClick={handleDownload}
              className="d-flex align-items-center gap-1"
            >
              <Download size={16} />
            </CButton>
            <UploadButton bookingId={appointment?.bookingId} />
          </div>
        </div>
      </CAccordionBody>
    </CAccordionItem>
  )
}

export default ConsentFormHandler
