import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'

const ConsentFormModal = ({
  visible,
  onClose,
  consentFormData,
  appointment,
  doctor,
  selectedHospital,
}) => {
  return (
    <CModal visible={visible} onClose={onClose} size="lg" scrollable backdrop="static">
      <CModalHeader>
        <CModalTitle>Consent Form Preview</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {consentFormData ? (
          <div className="consent-form-modal p-3">
            {/* 🏥 Hospital Info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex justify-content-center">
                {selectedHospital?.data?.hospitalLogo ? (
                  <img
                    className="profile-image"
                    src={
                      selectedHospital?.data.hospitalLogo.startsWith('data:')
                        ? selectedHospital?.data.hospitalLogo
                        : `data:image/jpeg;base64,${selectedHospital?.data.hospitalLogo}`
                    }
                    alt={selectedHospital?.data.name || 'Hospital Logo'}
                    style={{ width: '80px', height: '80px', marginBottom: '0px' }}
                  />
                ) : (
                  <div className="spinner"></div>
                )}
              </div>
              <div>
                <h4 className="mb-0">{appointment?.clinicName || 'Hospital Name'}</h4>
                <p className="mb-0">{appointment?.branchname || 'Branch Name'}</p>
              </div>
            </div>

            <hr />

            {/* 🧾 Procedure / Service */}
            <h5 className="text-center mb-3">
              Consent for {appointment?.subServiceName || 'Procedure'}
            </h5>

            {/* 👨‍⚕️ Doctor Info */}
            <div style={{ marginBottom: '15px' }}>
              <h4>Doctor Information</h4>
              <div style={{ marginLeft: '10px' }}>
                Name: {doctor?.doctorName || 'N/A'} <br />
                Specialization: {doctor?.specialization || 'N/A'} <br />
                License No: {doctor?.licenseNumber || 'N/A'}
              </div>
            </div>

            {/* 🧍‍♂️ Patient Info */}
            <div style={{ marginBottom: '15px' }}>
              <h4>Patient Information</h4>
              <div style={{ marginLeft: '10px' }}>
                Name: {appointment?.name || 'N/A'} <br />
                Mobile: {appointment?.mobileNumber || 'N/A'} <br />
                Gender: {appointment?.gender || 'N/A'} <br />
                Age: {appointment?.age || 'N/A'} Yrs <br />
                Procedure Date: {appointment?.serviceDate || 'N/A'}
              </div>
            </div>

            <h5 className="text-center mb-3">Consent Points</h5>

            {/* 📋 Consent Questions */}
            {consentFormData?.length > 0 &&
              consentFormData[0]?.consentFormQuestions?.map((section, i) => (
                <div key={i} style={{ marginBottom: '15px' }}>
                  <strong>{section.heading}</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    {section.questionsAndAnswers.map((qa, j) => (
                      <li key={j}>
                        {qa.question}
                        <strong
                          style={{
                            color: qa.answer ? 'green' : 'red',
                            marginLeft: '8px',
                          }}
                        >
                          {/* {qa.answer ? 'Yes' : 'No'} */}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            {/* 🧾 Consent paragraphs */}
            <div style={{ marginBottom: '15px' }}>
              <strong>I consent to the procedure</strong>
              <p>
                I hereby provide my informed consent to undergo the procedure and acknowledge that I
                have understood the associated pre-procedure, procedure, and post-procedure care and
                guidelines and the corresponding possible reactions and risks.
              </p>

              <strong>I consent to the use of my data</strong>
              <p>
                I, {appointment?.name || 'N/A'}, hereby give my voluntary and informed consent for
                the collection, storage, and use of my medical records, personal health information,
                and diagnostic images for purposes including research, education, training, and
                improving medical services. I understand that all information will be handled in
                accordance with applicable privacy laws and regulations, and that my identity will
                be protected unless I provide separate written authorization. I acknowledge that
                participation is voluntary and that I may withdraw my consent at any time, without
                affecting the medical care I receive.
              </p>
            </div>

            {/* ✍️ Signatures */}
            <div style={{ marginBottom: '15px' }}>
              <strong>Doctor Signature</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Patient Signature</strong>
            </div>
            <hr />
            <p style={{ fontSize: '12px' }}>
              This consent form is digitally generated and valid with a physical signature.
            </p>
          </div>
        ) : (
          <p>Loading consent form...</p>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConsentFormModal
