import React, { useState } from 'react'
import { CCard, CCardBody, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'

import GenericConsentForm from './GenericConsentForm'
import ProcedureConsentForm from './ProcedureConsentForm'
import PrivacyPolicyConsentForm from './PrivacyPolicyConsentForm'

const ConsentTabs = () => {
  const [activeKey, setActiveKey] = useState(1)

  return (
    <CCard>
      <CCardBody>
        {/* Tabs */}
        <CNav variant="tabs" style={{ cursor: 'pointer', color: 'var(--color-black)' }}>
          <CNavItem>
            <CNavLink
              active={activeKey === 1}
              onClick={() => setActiveKey(1)}
              style={{ color: 'var(--color-black)' }}
            >
              Generic Consent Form
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 2}
              onClick={() => setActiveKey(2)}
              style={{ color: 'var(--color-black)' }}
            >
              Procedure Consent Form
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 3}
              onClick={() => setActiveKey(3)}
              style={{ color: 'var(--color-black)' }}
            >
              Privacy Policy Consent Form
            </CNavLink>
          </CNavItem>
        </CNav>

        {/* Tab Content */}
        <CTabContent>
          <CTabPane visible={activeKey === 1}>
            <GenericConsentForm />
          </CTabPane>
          <CTabPane visible={activeKey === 2}>
            <ProcedureConsentForm />
          </CTabPane>
          <CTabPane visible={activeKey === 3}>
            {/* <ProcedureConsentForm /> */}
            <PrivacyPolicyConsentForm/>
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default ConsentTabs