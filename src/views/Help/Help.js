import React, { useMemo, useState } from 'react'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormInput,
} from '@coreui/react'
import { Mail, Phone, HelpCircle, Search } from 'lucide-react'
import PageLayout from './PageLayout'
import { useHospital } from '../../views/Usecontext/HospitalContext'

function Help() {

  const { selectedHospital } = useHospital()


  const mainBranch = useMemo(
    () => ({
      name: selectedHospital?.hospitalName || 'NA',
      address:
        selectedHospital?.address ||
        'NA',
      phone: selectedHospital?.contact || 'NA',
      email: selectedHospital?.email || 'NA',
      timings: selectedHospital?.timings || 'NA',
      facebook: selectedHospital?.facebookHandle || 'NA',
      instagram: selectedHospital?.instagramHandle || 'NA',
      twitter: selectedHospital?.twitterHandle || 'NA',

    }),
    [selectedHospital],
  )


  return (
    <>
      <PageLayout branch={mainBranch} />



      {/* ── Contact Support ── */}
      <div className="hp-contact-card">
        <div className="hp-contact-text">
          <h5 className="hp-contact-title">Need More Help?</h5>
          <p className="hp-contact-sub">Contact our support team for personalized assistance.</p>
        </div>
        <div className="hp-contact-actions">
          <button
            className="hp-contact-btn hp-email-btn"
            onClick={() => {
              const subject = 'Support Request'
              const body = 'Hello,\n\nI need assistance with...'
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(mainBranch.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              window.open(gmailUrl, '_blank')
            }}
          >
            <Mail size={15} />
            Email Support
          </button>
          <a href={`tel:${mainBranch.phone}`} style={{ textDecoration: 'none' }}>
            <button className="hp-contact-btn hp-call-btn">
              <Phone size={15} />
              Call Support
            </button>
          </a>
        </div>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* Page Header */
        .hp-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .hp-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hp-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .hp-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .hp-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* Search */
        .hp-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .hp-search-icon {
          position: absolute;
          left: 10px;
          color: #6b7280;
          pointer-events: none;
        }
        .hp-search-input {
          appearance: none;
          padding: 7px 14px 7px 30px;
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 8px;
          outline: none;
          width: 220px;
          transition: border-color 0.15s;
        }
        .hp-search-input:focus { border-color: #185fa5; }

        /* Accordion wrapper */
        .hp-accordion-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .hp-accordion-item {
          border-bottom: 0.5px solid #eef2f7 !important;
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
        }
        .hp-accordion-item:last-child {
          border-bottom: none !important;
        }

        /* Accordion header override */
        .hp-accordion-wrapper .accordion-button {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #0c447c !important;
          background: #fff !important;
          padding: 14px 18px !important;
          box-shadow: none !important;
        }
        .hp-accordion-wrapper .accordion-button:not(.collapsed) {
          background: #f0f5fb !important;
          color: #185fa5 !important;
          border-bottom: 0.5px solid #d0dce9 !important;
        }
        .hp-accordion-wrapper .accordion-button::after {
          filter: none !important;
          color: #185fa5 !important;
        }
        .hp-accordion-wrapper .accordion-button:not(.collapsed)::after {
          filter: none !important;
        }

        /* Accordion body */
        .hp-accordion-body {
          font-size: 13px !important;
          color: #374151 !important;
          padding: 16px 18px !important;
          background: #fff !important;
          line-height: 1.7;
        }
        .hp-accordion-body h6 {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #0c447c !important;
          margin-top: 12px !important;
          margin-bottom: 4px !important;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .hp-accordion-body ul {
          padding-left: 18px;
          margin-bottom: 8px;
        }
        .hp-accordion-body li {
          margin-bottom: 4px;
          color: #6b7280;
          font-size: 13px;
        }
        .hp-accordion-body a {
          color: #185fa5;
          text-decoration: none;
        }
        .hp-accordion-body a:hover { text-decoration: underline; }
        .hp-accordion-body b { color: #0c447c; }

        /* Empty state */
        .hp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .hp-empty-icon { color: #d0dce9; }

        /* Contact Card */
        .hp-contact-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: #e6f1fb;
          border: 0.5px solid #b5d4f4;
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 12px;
        }
        .hp-contact-title {
          font-size: 15px;
          font-weight: 600;
          color: #0c447c;
          margin: 0 0 4px;
        }
        .hp-contact-sub {
          font-size: 12px;
          color: #185fa5;
          margin: 0;
        }
        .hp-contact-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hp-contact-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .hp-contact-btn:hover  { filter: brightness(0.9); transform: scale(1.03); }
        .hp-contact-btn:active { transform: scale(0.97); }
        .hp-email-btn {
          background: #185fa5;
          color: #fff;
        }
        .hp-call-btn {
          background: #fff;
          color: #185fa5;
          border: 0.5px solid #b5d4f4 !important;
        }
      `}</style>
    </>
  )
}

export default Help