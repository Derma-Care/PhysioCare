import { Download, Edit, Eye, Trash } from 'lucide-react'
import React from 'react'
import { FaFileDownload } from 'react-icons/fa'

const FilePreview = ({
  label,
  type,
  data,
  showEdit = false, // optional
  showDelete = false, // optional
  handleEdit, // function from parent
  handleDelete,
}) => {
  if (!data) return <p className="text-muted">{label} not provided</p>

  // --- Clean Base64
  const cleanBase64 = (base64String) => {
    if (!base64String) return ''
    if (base64String.includes(',')) return base64String.split(',')[1].replace(/\s/g, '')
    return base64String.replace(/\s/g, '')
  }

  // --- Detect MIME type
  const getMimeTypeFromBase64 = (base64String) => {
    if (base64String.startsWith('JVBERi0')) return 'application/pdf'
    if (base64String.startsWith('/9j/')) return 'image/jpeg'
    if (base64String.startsWith('iVBORw0')) return 'image/png'
    if (base64String.startsWith('R0lGOD')) return 'image/gif'
    return type || 'application/octet-stream'
  }

  // --- Base64 → Blob
  const base64toBlob = (base64, mimeType) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    } catch (e) {
      console.error('Base64 decoding failed:', e)
      alert('Failed to decode file data.')
      return null
    }
  }

  // --- Handle preview (open new tab)
  const handlePreview = (base64String) => {
    const clean = cleanBase64(base64String)
    if (!clean) return alert('Invalid file data')
    const mimeType = getMimeTypeFromBase64(clean)
    const blob = base64toBlob(clean, mimeType)
    if (blob) {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  // --- Handle download
  const handleDownload = (base64String, fileName) => {
    const clean = cleanBase64(base64String)
    if (!clean) return alert('Invalid file data')
    const mimeType = getMimeTypeFromBase64(clean)
    const blob = base64toBlob(clean, mimeType)
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  // --- Prepare Data URL
  const clean = cleanBase64(data)
  const mimeType = getMimeTypeFromBase64(clean)
  const fileUrl = data.startsWith('data:') ? data : `data:${mimeType};base64,${clean}`

  const isImage = mimeType.startsWith('image/')
  const isPDF = mimeType === 'application/pdf'

  return (
    <div className="bg-white p-3 rounded-md shadow-sm my-2 mb-5">
      <strong>{label}</strong>
      <div
        className=" border rounded-md overflow-hidden mt-2"
        style={{ width: '100%', height: '200px' }}
      >
        {/* Thumbnail */}
        {isImage ? (
          <img
            src={fileUrl}
            alt={label}
            className="object-cover relative z-0"
            width={'100%'}
            height={'100%'}
          />
        ) : isPDF ? (
          <embed
            src={fileUrl}
            type="application/pdf"
            className="w-full h-full relative z-0"
            style={{ height: '200px' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-sm relative z-0">
            File
          </div>
        )}

        {/* Action Buttons */}
      </div>
      <div className="mt-4 d-flex justify-content-end">
        {/* Preview */}
        <button
          className="actionBtn mx-1"
          onClick={(e) => {
            e.stopPropagation()
            handlePreview(data)
          }}
          title="Preview"
        >
          <Eye size={18} />
        </button>

        {/* Download */}
        <button
          className="actionBtn mx-1"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload(data, label.replace(/\s+/g, '_'))
          }}
          title="Download"
        >
          <Download size={18} />
        </button>

        {/* Conditionally show Edit */}
        {showEdit && (
          <button
            className="actionBtn mx-1"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(data) // function exists in another file
            }}
            title="Edit"
          >
            <Edit size={18} />
          </button>
        )}

        {/* Conditionally show Delete */}
        {showDelete && (
          <button
            className="actionBtn mx-1"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(data) // function exists in another file
            }}
            title="Delete"
          >
            <Trash size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default FilePreview
