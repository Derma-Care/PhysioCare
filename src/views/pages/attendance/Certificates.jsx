// CertificateTablePreview.jsx

import React, { useEffect, useState } from "react"
import { BASE_URL } from "../../../baseUrl"

const certStyles = `
  .cert-root { padding: 4px 0;   }

  /* Section header */
  .cert-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .cert-section-accent { width: 3px; height: 20px; border-radius: 2px; background: #1B4F8A; flex-shrink: 0; }
  .cert-section-title { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.01em; }

  /* Table wrapper */
  .cert-table-wrap { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
  .cert-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .cert-table thead tr { background: #F8FAFC; }
  .cert-table th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #94A3B8; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
  .cert-table td { padding: 13px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
  .cert-table tbody tr:last-child td { border-bottom: none; }
  .cert-table tbody tr { transition: background 0.12s; }
  .cert-table tbody tr:hover { background: #F8FAFC; }
  .cert-sno { color: #94A3B8; font-weight: 700; font-size: 12px; }
  .cert-name { color: #0F172A; font-weight: 600; }
  .cert-authority { color: #475569; }
  .cert-date { color: #64748B; font-size: 12px; }
  .cert-empty td { padding: 40px 16px; text-align: center; color: #94A3B8; font-size: 13px; }
  .cert-loading td { padding: 40px 16px; text-align: center; color: #94A3B8; font-size: 13px; }

  /* Preview button */
  .cert-preview-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #1B4F8A; background: transparent; color: #1B4F8A; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;  }
  .cert-preview-btn:hover { background: #1B4F8A; color: #fff; }

  /* Modal overlay */
  .cert-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
  .cert-modal-box { width: min(860px, 92vw); background: #fff; border-radius: 16px; padding: 24px; position: relative; max-height: 90vh; overflow: auto; box-shadow: 0 24px 70px rgba(0,0,0,0.22); }
  .cert-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #F1F5F9; }
  .cert-modal-title { margin: 0; font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.01em; }
  .cert-modal-close { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #E2E8F0; background: #F8FAFC; color: #475569; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; line-height: 1; padding: 0; transition: all 0.15s; }
  .cert-modal-close:hover { background: #FFF1F0; border-color: rgba(185,28,28,0.3); color: #B91C1C; }

  /* Loader */
  .cert-loader-wrap { height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  .cert-spinner { width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top: 3px solid #1B4F8A; border-radius: 50%; animation: certSpin 0.9s linear infinite; }
  @keyframes certSpin { to { transform: rotate(360deg); } }
  .cert-loader-text { font-size: 13px; color: #94A3B8; }

  /* iframe / image */
  .cert-iframe { border: 1px solid #E2E8F0; border-radius: 10px; display: block; }
  .cert-img { width: 100%; max-height: 80vh; object-fit: contain; border-radius: 10px; display: block; }
`;

export default function CertificateTablePreview() {

    const [certifications, setCertifications] = useState([])
    const [previewLoading, setPreviewLoading] = useState(false)

    // PREVIEW MODAL
    const [previewModal, setPreviewModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    const [loading, setLoading] = useState(false)

    // API CALL
    const fetchCertificates = async () => {
        const clinicId = localStorage.getItem("HospitalId")
        const branchId = localStorage.getItem("branchId")
        try {
            setLoading(true)
            const response = await fetch(
                ` ${BASE_URL}/getTherapistCertificatesByClinicIdAndBranchId/${clinicId}/${branchId}`
            )
            const result = await response.json()
            if (result.success) {
                setCertifications(result.data || [])
            }
        } catch (error) {
            console.log("Fetch Error :", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCertificates()
    }, [])

    // PREVIEW MODAL OPEN
    const openPreview = (file) => {
        setPreviewLoading(true)
        setSelectedFile(file)
        setPreviewModal(true)
    }

    // DATE FORMAT
    const formatDate = (date) => {
        if (!date) return "—"
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    return (
        <div className="cert-root">
            <style>{certStyles}</style>

            <div className="cert-section-head">
                <div className="cert-section-accent" />
                <h3 className="cert-section-title">Qualifications &amp; Certificates</h3>
            </div>

            <div className="cert-table-wrap">
                <table className="cert-table">
                    <thead>
                        <tr>
                            <th style={{ width: 48 }}>#</th>
                            <th>Certificate Name</th>
                            <th>Issuing Authority</th>
                            <th style={{ width: 130 }}>Upload Date</th>
                            <th style={{ width: 110 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="cert-loading">
                                <td colSpan="5">
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                        <div className="cert-spinner" />
                                        <span>Loading certificates...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : certifications.length === 0 ? (
                            <tr className="cert-empty">
                                <td colSpan="5">No certificates found.</td>
                            </tr>
                        ) : (
                            certifications.map((item, index) => (
                                <React.Fragment key={index}>
                                    <tr>
                                        <td className="cert-sno">{String(index + 1).padStart(2, "0")}</td>
                                        <td className="cert-name">{item.certificateName}</td>
                                        <td className="cert-authority">{item.issueAuthority}</td>
                                        <td className="cert-date">{formatDate(item.uploadDateTime)}</td>
                                        <td>
                                            <button
                                                className="cert-preview-btn"
                                                onClick={() =>
                                                    openPreview(item.upload || item.certificateUrl)
                                                }
                                            >
                                                Preview
                                            </button>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PREVIEW MODAL */}
            {previewModal && (
                <div className="cert-modal-overlay">
                    <div className="cert-modal-box">

                        <div className="cert-modal-header">
                            <h4 className="cert-modal-title">Certificate Preview</h4>
                            <button
                                className="cert-modal-close"
                                onClick={() => {
                                    setPreviewModal(false)
                                    setPreviewLoading(false)
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* LOADER */}
                        {previewLoading && (
                            <div className="cert-loader-wrap">
                                <div className="cert-spinner" />
                                <p className="cert-loader-text">Loading preview...</p>
                            </div>
                        )}

                        {/* PDF */}
                        {selectedFile?.includes(".pdf") ? (
                            <iframe
                                src={selectedFile}
                                title="Certificate Preview"
                                width="100%"
                                height="600px"
                                className="cert-iframe"
                                style={{ display: previewLoading ? "none" : "block" }}
                                onLoad={() => setPreviewLoading(false)}
                            />
                        ) : (
                            <img
                                src={selectedFile}
                                alt="Certificate Preview"
                                className="cert-img"
                                style={{ display: previewLoading ? "none" : "block" }}
                                onLoad={() => setPreviewLoading(false)}
                            />
                        )}

                    </div>
                </div>
            )}

        </div>
    )
}