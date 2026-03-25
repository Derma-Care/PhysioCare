import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../baseUrl'
import FilePreview from '../../Utils/FilePreview'
import { Delete, Edit, Trash } from 'lucide-react'
import { toast } from 'react-toastify'
import ConfirmationModal from '../../components/ConfirmationModal'
import { showCustomToast } from '../../Utils/Toaster'
import { http } from '../../Utils/Interceptors'

const PrivacyPolicyManager = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [policies, setPolicies] = useState([])
  const [policyCache, setPolicyCache] = useState({}) // cache data URLs
  const [previewPolicy, setPreviewPolicy] = useState(null) // currently previewed policy
  const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

  const [showFileInput, setShowFileInput] = useState(true) // new state
  const [editingPolicyId, setEditingPolicyId] = useState(null) // which policy is being edited
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [handleDeleteId, setHandleDeleteId] = useState()
  const [saveloading, setSaveLoading] = useState(false)
  const editFileRef = useRef(null)
  // fetch policies from backend
  const fetchPolicies = async () => {
    const clinicId = localStorage.getItem('HospitalId')
    try {
      const res = await http.get(`${BASE_URL}/getPoliciesByClinicId/${clinicId}`)
      if (res.data?.data) setPolicies(res.data.data)
      else if (Array.isArray(res.data)) setPolicies(res.data)
    } catch (err) {
      console.error('Error fetching policies:', err)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  // file select
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Only allow PDF
    if (file.type !== 'application/pdf') {
      showCustomToast('Only PDF files are allowed!', 'error')
      return
    }

    // Max size 2 MB
    if (file.size > MAX_SIZE) {
      showCustomToast('File is too large! Maximum allowed size is 2 MB.', 'error')
      return
    }

    setSelectedFile(file)
  }

  // upload file to backend
  const handleSubmit = () => {
    if (!selectedFile) return showCustomToast(`Please select a file first.`, 'error')

    const reader = new FileReader()
    reader.readAsDataURL(selectedFile)

    reader.onload = async () => {
      var clinicId = localStorage.getItem('HospitalId')
      // get base64 string only
      const base64File = reader.result.split(',')[1]
      try {
        await http.post(
          `${BASE_URL}/createPolicy`,
          {
            clinicId: clinicId,
            privacyPolicy: base64File,
          },
          { headers: { 'Content-Type': 'application/json' } },
        )
        showCustomToast(`File uploaded successfully!`, 'success')

        setSelectedFile(null)
        setShowFileInput(false)
        fetchPolicies()
      } catch (err) {
        console.error('Upload error:', err.response || err)
        // showCustomToast(`File upload failed. Check console for details.`, 'warning')
      }
    }
  }

  // view file preview
  const handleView = async (policy) => {
    try {
      if (!policyCache[policy.id]) {
        const res = await http.get(`${BASE_URL}/getPolicyById/${policy.id}`)

        // check both structures
        const base64File = res.data?.data?.privacyPolicy || res.data?.privacyPolicy
        if (!base64File) return showCustomToast(`No file data available.`, 'warning')

        const extension = policy.fileName?.split('.').pop().toLowerCase()
        let mimeType = 'application/octet-stream'
        if (extension === 'pdf') mimeType = 'application/pdf'
        else if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg'
        else if (extension === 'png') mimeType = 'image/png'

        const dataUrl = `data:${mimeType};base64,${base64File}`

        setPolicyCache((prev) => ({
          ...prev,
          [policy.id]: { dataUrl, mimeType },
        }))

        setPreviewPolicy({
          id: policy.id,
          fileName: policy.fileName,
          dataUrl,
          mimeType,
        })
      } else {
        const cached = policyCache[policy.id]
        setPreviewPolicy({
          id: policy.id,
          fileName: policy.fileName,
          dataUrl: cached.dataUrl,
          mimeType: cached.mimeType,
        })
      }
    } catch (err) {
      console.error('View error:', err.response || err)
      // showCustomToast(`Unable to fetch file.`, 'warning')
    }
  }

  const handleEdit = (policy) => {
    setEditingPolicyId(policy.id) // show file input for this policy
    setSelectedFile(null) // reset selected file

    // Scroll to edit file input after next render
    setTimeout(() => {
      if (editFileRef.current) {
        editFileRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleUpdate = async () => {
    if (!selectedFile) return showCustomToast(`Please select a file first.`, 'warning')

    const reader = new FileReader()
    reader.readAsDataURL(selectedFile)

    reader.onload = async () => {
      const base64File = reader.result.split(',')[1]
      try {
        setSaveLoading(true)
        await http.put(
          `${BASE_URL}/updatePolicy/${editingPolicyId}`,
          { privacyPolicy: base64File },
          { headers: { 'Content-Type': 'application/json' } },
        )
        showCustomToast(`Policy updated successfully!`, 'success')

        setSelectedFile(null)
        setEditingPolicyId(null) // hide file input after update
        fetchPolicies()
      } catch (err) {
        console.error('Update error:', err.response || err)
        // showCustomToast(`Update failed.`, 'success')
      } finally {
        setSaveLoading(false)
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      await http.delete(`${BASE_URL}/deletePolicyById/${id}`)
      showCustomToast(`Policy deleted successfully!`, 'success')
      fetchPolicies()
    } catch (err) {
      console.error('Delete error:', err.response || err)
      // showCustomToast(`Delete failed.`, 'error')
    } finally {
      setIsModalVisible(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '700px' }}>
      {/* File input for new uploads */}
      {!editingPolicyId && policies >= 0 && (
        // showFileInput controls visibility
        <div style={{ marginBottom: '20px' }}>
          <h4>Existing Policies</h4>
          <label
            htmlFor="fileUpload"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'var(--color-bgcolor)', // gray if disabled
              color: 'var(--color-black)',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {selectedFile ? selectedFile.name : 'Select File'}
          </label>

          <input
            id="fileUpload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {selectedFile && (
            <button
              onClick={handleSubmit}
              style={{
                marginLeft: '15px',
                padding: '10px 20px',
                backgroundColor: 'var(--color-black)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Upload
            </button>
          )}
        </div>
      )}

      {/* File input for editing an existing policy */}
      {editingPolicyId && (
        <div style={{ marginBottom: '20px' }} ref={editFileRef}>
          <label
            htmlFor="editFileUpload"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: selectedFile || policies.length > 0 ? '#f59e0b' : '#d1d5db',
              color: '#fff',
              fontWeight: '500',
              borderRadius: '8px',
              cursor: selectedFile || policies.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedFile ? selectedFile.name : 'Select New File'}
          </label>

          <input
            id="editFileUpload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={policies.length === 0}
          />

          {selectedFile && (
            <button
              onClick={handleUpdate}
              disabled={saveloading}
              style={{
                marginLeft: '15px',
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {saveloading ? (
                <>
                  <span className="spinner-border spinner-border-sm text-white" role="status" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </button>
          )}
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      {policies.length === 0 && <p style={{ textAlign: 'center' }}>No policies found.</p>}

      {policies.map((policy) => (
        <div key={policy.id}>
          <FilePreview
            label="Privacy and Policy"
            type={policy.privacyPolicy}
            data={policy.privacyPolicy}
            showEdit={true}
            showDelete={true}
            handleEdit={() => handleEdit(policy)} // from parent or another file
            handleDelete={() => {
              setHandleDeleteId(policy.id)
              setIsModalVisible(true)
            }}
          />
          {/* <button style={{ marginRight: '5px' }} onClick={() => handleView(policy)}>
              View
            </button> */}

          {/* <button className="actionBtn mx-3" onClick={() => handleEdit(policy)} title="Edit">
              <Edit size={18} />
            </button> */}

          {/* <button
              className="actionBtn  mx-3"
              onClick={() => {
                setHandleDeleteId(policy.id) // store id
                setIsModalVisible(true) // show confirmation modal
              }}
              title="Delete"
            >
              <Trash size={18} />
            </button> */}
        </div>
      ))}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Technician"
        message="Are you sure you want to delete this privacy & Policy? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(handleDeleteId)} // ✅ pass id here
        onCancel={() => setIsModalVisible(false)} // ✅ just close modal
      />

      {previewPolicy && (
        <div style={{ marginTop: '20px' }}>
          <h3>Preview: {previewPolicy.fileName}</h3>

          {previewPolicy.mimeType === 'application/pdf' ? (
            <iframe
              src={previewPolicy.dataUrl}
              title={previewPolicy.fileName}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          ) : (
            <img
              src={previewPolicy.dataUrl}
              alt={previewPolicy.fileName}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default PrivacyPolicyManager
