import React, { useMemo, useState } from 'react'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormInput,
  CButton,
} from '@coreui/react'
import { Mail, Phone } from 'lucide-react'
import PageLayout from './PageLayout'
import { useHospital } from '../../views/Usecontext/HospitalContext'

function Help() {
  const [searchTerm, setSearchTerm] = useState('')
  const { selectedHospital } = useHospital()

  const helpTopics = [
    {
      title: 'How to Register a New Patient?',
      content: (
        <div>
          <p>
            To register a new customer in the <b>SureCare Dermatology Platform</b>, follow these
            simple steps:
          </p>

          <h6>Go to the Customer Management Section</h6>
          <p>
            From the left sidebar, select <b>“Customer Management.”</b> You can view, search, and
            add new customers here.
          </p>

          <h6>Click on “Add New Customer”</h6>
          <p>
            You’ll be directed to a form where you can enter the customer’s personal and contact
            details.
          </p>

          <h6>Fill in Customer Details</h6>
          <ul>
            <li>Title – Choose Mr., Mrs., Miss, or Dr.</li>
            <li>First & Last Name – Enter the customer’s name.</li>
            <li>
              Mobile Number – Enter a valid 10-digit mobile number (this becomes their password).
            </li>
            <li>Email – Optional, but useful for confirmations.</li>
            <li>Gender & Date of Birth – Select appropriately.</li>
            <li>Referred By – Mention if applicable.</li>
          </ul>

          <h6>Enter Address Information</h6>
          <ul>
            <li>House No, Street, Landmark – Provide full address.</li>
            <li>Postal Code – Auto-fills city, state, and post office.</li>
            <li>Country – Defaults to India.</li>
          </ul>

          <h6>Submit the Details</h6>
          <p>
            Click <b>Save</b> or <b>Register</b> to complete registration.
          </p>

          <h6>Login Credentials</h6>
          <ul>
            <li>Username: Customer ID</li>
            <li>Password: Mobile Number</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'How to Book an Appointment?',
      content: (
        <p>
          Go to <b>Appointments → New Booking</b> → Select patient, doctor, and time slot → Click{' '}
          <b>Confirm</b>.
        </p>
      ),
    },
    {
      title: 'How to Generate Bills or Invoices?',
      content: (
        <p>
          Open <b>Billing</b> → Choose the completed appointment → Click <b>Generate Invoice</b> →
          Download as PDF.
        </p>
      ),
    },
    {
      title: 'How to Upload Consent Forms?',
      content: (
        <p>
          In <b>Appointment Details</b> → Click <b>Upload Consent Form</b> → Select file → Submit.
        </p>
      ),
    },
    {
      title: 'How to Contact Technical Support?',
      content: (
        <p>
          Click the <b>Contact Support</b> button below or email us at{' '}
          <a href="mailto:support@yourclinic.com">support@yourclinic.com</a>.
        </p>
      ),
    },
  ]

  const mainBranch = useMemo(
    () => ({
      name: selectedHospital?.hospitalName || 'Pragna Advanced Skin Care Clinic',
      address:
        selectedHospital?.address ||
        '4-34, Gayatri Nagar, Jubilee Hills, Hyderabad, Telangana, 500070, India',
      phone: selectedHospital?.contact || '+91 9876543210',
      email: selectedHospital?.email || 'info@dermacare.com',
      timings: selectedHospital?.timings || 'Mon–Sat: 9am – 6pm',
    }),
    [selectedHospital],
  )

  // ✅ Filter topics safely
  const filteredHelpTopics = helpTopics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <PageLayout branch={mainBranch} />
      <div className="help-container">
        {/* 🔍 Search Bar */}
        {/* <div className="mb-4 text-center ">
          <CFormInput
            placeholder="Search for help topics (e.g., Appointment, )..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              margin: '0 auto',
            }}
          />
        </div> */}

        {/* 📘 Accordion Section */}
        {/* <div
          className="mx-auto mb-4"
          style={{
            transition: 'all 0.2s ease', // Smooth transition
          }}
        >
          <CAccordion alwaysOpen>
            {filteredHelpTopics.map((topic, index) => (
              <CAccordionItem itemKey={index + 1} key={index}>
                <CAccordionHeader>{topic.title}</CAccordionHeader>
                <CAccordionBody
                  style={{
                    color: 'var(--color-bgcolor)',

                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {topic.content}
                </CAccordionBody>
              </CAccordionItem>
            ))}

            {filteredHelpTopics.length === 0 && (
              <p className="text-center text-muted mt-3">
                No help topics found. Try a different keyword.
              </p>
            )}
          </CAccordion>
        </div> */}

        {/* 📞 Contact Support Section */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-2">Need More Help?</h5>
          <p className="text-muted mb-4">Contact our support team for personalized assistance.</p>

          <CButton

            className="me-3 actionBtn "
            onClick={() => {
              const email = mainBranch.email
              const subject = 'Support Request'
              const body = 'Hello,\n\nI need assistance with...'
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                email, actionBtn
              )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
              window.open(gmailUrl, '_blank')
            }}
          >
            <Mail size={18} className="me-2" /> Email Support
          </CButton>

          <a href={`tel:${mainBranch.phone}`} style={{ textDecoration: 'none' }}>
            <CButton
              className='actionBtn'
            >
              <Phone size={18} className="me-2" /> Call Support
            </CButton>
          </a>
        </div>
      </div>
    </>
  )
}

export default Help
