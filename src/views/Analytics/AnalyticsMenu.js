import React, { useEffect } from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  IndianRupee, Users, TrendingUp, Calendar, CreditCard, Activity,
  ArrowUpRight, ArrowRight, Wallet, CalendarCheck
} from 'lucide-react'

/* ── Illustrative KPI strip data ──
   Wire these to real aggregates when available; kept as static
   placeholders so the dashboard shell can be reviewed visually. */
const KPI_STRIP = [
  {
    label: 'Revenue (This Month)',
    value: '₹4,82,600',
    trend: '+12.4%',
    trendUp: true,
    icon: <Wallet size={18} color="#fff" />,
    accent: '#1B4F8A',
  },
  {
    label: 'Active Patients',
    value: '1,248',
    trend: '+38 new',
    trendUp: true,
    icon: <Users size={18} color="#fff" />,
    accent: '#0c7b93',
  },
  {
    label: "Today's Appointments",
    value: '32',
    trend: '6 pending',
    trendUp: null,
    icon: <CalendarCheck size={18} color="#fff" />,
    accent: '#b45309',
  },
  {
    label: 'Treatment Success Rate',
    value: '91%',
    trend: '+3.1%',
    trendUp: true,
    icon: <Activity size={18} color="#fff" />,
    accent: '#6b21a8',
  },
]

const AnalyticsMenu = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  /* ── Hide the sidebar while this dashboard is open, restore on leave ── */
  useEffect(() => {
    const wasOpen = sidebarShow
    dispatch({ type: 'set', sidebarShow: false })
    return () => {
      dispatch({ type: 'set', sidebarShow: wasOpen })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const analyticsOptions = [
    {
      title: 'Revenue Analytics',
      description: 'View daily, weekly, and monthly revenue data.',
      metric: '₹4.82L this month',
      icon: <IndianRupee size={24} color="#185fa5" />,
      path: '/analytics/revenue',
      color: '#e6f1fb',
      accent: '#185fa5',
    },
    {
      title: 'Expense Analytics',
      description: 'Track clinic expenses and payouts.',
      metric: '₹1.16L this month',
      icon: <CreditCard size={24} color="#a32d2d" />,
      path: '/expenses',
      color: '#fcebeb',
      accent: '#a32d2d',
    },
    {
      title: 'Referral Analytics',
      description: 'Monitor patient referrals and sources.',
      metric: '86 referrals · 30d',
      icon: <Users size={24} color="#3b6d11" />,
      path: '/analytics/referrals',
      color: '#eaf3de',
      accent: '#3b6d11',
    },
    {
      title: 'Patient Analytics',
      description: 'Analyze patient demographics and trends.',
      metric: '1,248 active patients',
      icon: <TrendingUp size={24} color="#0c7b93" />,
      path: '/analytics/patients',
      color: '#e0f3f8',
      accent: '#0c7b93',
    },
    {
      title: 'Appointment Analytics',
      description: 'Review appointment volumes and status.',
      metric: '32 scheduled today',
      icon: <Calendar size={24} color="#b45309" />,
      path: '/analytics/appointments',
      color: '#fef3c7',
      accent: '#b45309',
    },
    {
      title: 'Treatment Analytics',
      description: 'Track popular treatments and success rates.',
      metric: '91% success rate',
      icon: <Activity size={24} color="#6b21a8" />,
      path: '/analytics/treatments',
      color: '#f3e8ff',
      accent: '#6b21a8',
    },
  ]

  return (
    <>
      {/* ── Dashboard header ── */}
      <div className="am-page-header mb-4">
        <div>
          <h4 className="am-page-title">Analytics Dashboard</h4>
          <p className="am-page-sub">Your clinic's performance, at a glance.</p>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <CRow className="mb-4">
        {KPI_STRIP.map((kpi, idx) => (
          <CCol xs={12} sm={6} lg={3} key={idx} className="mb-3">
            <div className="am-kpi-card">
              <div className="am-kpi-icon" style={{ background: kpi.accent }}>
                {kpi.icon}
              </div>
              <div className="am-kpi-body">
                <p className="am-kpi-label">{kpi.label}</p>
                <div className="am-kpi-value-row">
                  <h5 className="am-kpi-value">{kpi.value}</h5>
                  {kpi.trendUp !== null && (
                    <span className={`am-kpi-trend${kpi.trendUp ? '' : ' down'}`}>
                      <ArrowUpRight size={12} />
                      {kpi.trend}
                    </span>
                  )}
                  {kpi.trendUp === null && (
                    <span className="am-kpi-trend neutral">{kpi.trend}</span>
                  )}
                </div>
              </div>
            </div>
          </CCol>
        ))}
      </CRow>

      {/* ── Module section ── */}
      <div className="am-section-head">
        <h6>Explore Analytics Modules</h6>
        <span className="am-section-sub">Pick a module for the full breakdown</span>
      </div>

      <CRow>
        {analyticsOptions.map((option, idx) => (
          <CCol xs={12} sm={6} lg={4} key={idx} className="mb-4">
            <CCard
              className="h-100 am-card"
              onClick={() => navigate(option.path)}
              style={{ '--am-accent': option.accent }}
            >
              <CCardBody className="p-3">
                <div className="d-flex align-items-start justify-content-between">
                  <div
                    className="am-icon-wrapper d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ background: option.color }}
                  >
                    {option.icon}
                  </div>
                  <ArrowRight size={16} className="am-card-arrow" />
                </div>

                <h6 className="am-card-title">{option.title}</h6>
                <p className="am-card-desc">{option.description}</p>

                <div className="am-card-footer">
                  <span className="am-card-metric" style={{ color: option.accent }}>
                    {option.metric}
                  </span>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <style>{`
        .am-page-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          border-bottom: 1px solid #eef2f7;
          padding-bottom: 14px;
        }
        .am-page-title {
          font-size: 19px; font-weight: 700; color: #0c447c; margin: 0 0 3px;
        }
        .am-page-sub { font-size: 13px; color: #6b7280; margin: 0; }

        /* ── KPI strip ── */
        .am-kpi-card {
          display: flex; align-items: center; gap: 12px;
          background: #fff; border: 1px solid #d0dce9; border-radius: 12px;
          padding: 14px; height: 100%;
          box-shadow: 0 2px 8px rgba(12,68,124,0.04);
          transition: box-shadow .2s, transform .2s;
        }
        .am-kpi-card:hover { box-shadow: 0 8px 20px rgba(12,68,124,0.10); transform: translateY(-2px); }
        .am-kpi-icon {
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .am-kpi-body { min-width: 0; }
        .am-kpi-label {
          margin: 0 0 3px; font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: .3px; white-space: nowrap;
        }
        .am-kpi-value-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .am-kpi-value { margin: 0; font-size: 19px; font-weight: 700; color: #0c447c; }
        .am-kpi-trend {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 11px; font-weight: 700; color: #16a34a;
        }
        .am-kpi-trend.down { color: #dc2626; }
        .am-kpi-trend.down svg { transform: rotate(90deg); }
        .am-kpi-trend.neutral { color: #b45309; }

        /* ── Section head ── */
        .am-section-head {
          display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px;
        }
        .am-section-head h6 { margin: 0; font-size: 15px; font-weight: 700; color: #0c447c; }
        .am-section-sub { font-size: 12px; color: #9ca3af; }

        /* ── Module cards ── */
        .am-card {
          cursor: pointer;
          border: 1px solid #d0dce9 !important;
          border-left: 3px solid var(--am-accent) !important;
          border-radius: 12px !important;
          box-shadow: 0 2px 8px rgba(12,68,124,0.04);
          transition: transform .22s, box-shadow .22s;
        }
        .am-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(12,68,124,0.12);
        }
        .am-icon-wrapper {
          width: 50px; height: 50px; border-radius: 12px;
        }
        .am-card-arrow {
          color: #cbd5e1; transition: color .2s, transform .2s; margin-top: 4px;
        }
        .am-card:hover .am-card-arrow {
          color: var(--am-accent); transform: translateX(3px);
        }
        .am-card-title {
          margin: 14px 0 4px; font-size: 15px; font-weight: 700; color: #0c447c;
        }
        .am-card-desc {
          margin: 0 0 14px; font-size: 12.5px; color: #6b7280; line-height: 1.5;
        }
        .am-card-footer {
          border-top: 1px dashed #eef2f7; padding-top: 10px;
        }
        .am-card-metric {
          font-size: 12px; font-weight: 700;
        }
      `}</style>
    </>
  )
}

export default AnalyticsMenu