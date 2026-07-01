import React from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, Users, TrendingUp, Calendar, CreditCard, Activity } from 'lucide-react'

const AnalyticsMenu = () => {
  const navigate = useNavigate()

  const analyticsOptions = [
    {
      title: 'Revenue Analytics',
      description: 'View daily, weekly, and monthly revenue data.',
      icon: <IndianRupee size={28} color="#185fa5" />,
      path: '/analytics/revenue',
      color: '#e6f1fb'
    },
    {
      title: 'Expense Analytics',
      description: 'Track clinic expenses and payouts.',
      icon: <CreditCard size={28} color="#a32d2d" />,
      path: '/expenses',
      color: '#fcebeb'
    },
    {
      title: 'Referral Analytics',
      description: 'Monitor patient referrals and sources.',
      icon: <Users size={28} color="#3b6d11" />,
      path: '/analytics/referrals',
      color: '#eaf3de'
    },
    {
      title: 'Patient Analytics',
      description: 'Analyze patient demographics and trends.',
      icon: <TrendingUp size={28} color="#0c7b93" />,
      path: '/analytics/patients',
      color: '#e0f3f8'
    },
    {
      title: 'Appointment Analytics',
      description: 'Review appointment volumes and status.',
      icon: <Calendar size={28} color="#b45309" />,
      path: '/analytics/appointments',
      color: '#fef3c7'
    },
    {
      title: 'Treatment Analytics',
      description: 'Track popular treatments and success rates.',
      icon: <Activity size={28} color="#6b21a8" />,
      path: '/analytics/treatments',
      color: '#f3e8ff'
    }
  ]

  return (
    <>
      <div className="am-page-header mb-4">
        <h4 className="am-page-title">Analytics Dashboard</h4>
        <p className="am-page-sub text-muted">Select an analytics module to view detailed reports.</p>
      </div>

      <CRow>
        {analyticsOptions.map((option, idx) => (
          <CCol xs={12} sm={6} md={4} lg={4} key={idx} className="mb-4">
            <CCard 
              className="h-100 cursor-pointer am-card" 
              onClick={() => navigate(option.path)}
              style={{ transition: 'all 0.3s', cursor: 'pointer', border: '1px solid #d0dce9', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
            >
              <CCardBody className="d-flex flex-row align-items-center p-3">
                <div 
                  className="icon-wrapper mr-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '52px', height: '52px', borderRadius: '50%', background: option.color, marginRight: '16px' }}
                >
                  {option.icon}
                </div>
                <div>
                  <h6 className="mb-1 font-weight-bold" style={{ color: '#0c447c' }}>{option.title}</h6>
                  <p className="text-muted small mb-0">{option.description}</p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
      <style>{`
        .am-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0,0,0,0.12) !important;
        }
        .am-page-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0c447c;
          margin-bottom: 0.25rem;
        }
        .am-page-header {
          border-bottom: 1px solid #eef2f7;
          padding-bottom: 1rem;
        }
      `}</style>
    </>
  )
}

export default AnalyticsMenu
