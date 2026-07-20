import React from "react";

const RevenueCards = ({ renTotals }) => {
  const cards = [
    {
      label: "Today",
      value: renTotals.todayRevenue ?? 0,
      gradient: "linear-gradient(135deg, #1e6fba 0%, #185fa5 100%)",
      glow: "rgba(24,95,165,0.22)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: "This Week",
      value: renTotals.lastWeekRevenue ?? 0,
      gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      glow: "rgba(21,128,61,0.22)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: "This Month",
      value: renTotals.lastMonthRevenue ?? 0,
      gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      glow: "rgba(180,83,9,0.22)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "This Year",
      value: renTotals.lastYearRevenue ?? 0,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)",
      glow: "rgba(107,33,168,0.22)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="rc-cards-grid">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rc-card"
            style={{ "--rc-gradient": card.gradient, "--rc-glow": card.glow }}
          >
            <div className="rc-glow-blob" />
            <div className="rc-top">
              <div className="rc-icon">{card.icon}</div>
            </div>
            <div className="rc-amount">₹{Number(card.value).toLocaleString("en-IN")}</div>
            <div className="rc-label">{card.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        .rc-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }
        @media (max-width: 900px) { .rc-cards-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .rc-cards-grid { grid-template-columns: 1fr; } }

        .rc-card {
          background: var(--rc-gradient);
          border-radius: 16px;
          padding: 18px 18px 16px;
          display: flex; flex-direction: column; gap: 6px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px var(--rc-glow), 0 1px 4px rgba(0,0,0,0.08);
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .rc-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px var(--rc-glow), 0 2px 8px rgba(0,0,0,0.1);
        }

        .rc-glow-blob {
          position: absolute; top: -28px; right: -28px;
          width: 90px; height: 90px;
          background: rgba(255,255,255,0.12);
          border-radius: 50%;
          pointer-events: none;
        }
        .rc-glow-blob::after {
          content: ''; position: absolute; top: 22px; left: 22px;
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.10);
          border-radius: 50%;
        }

        .rc-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .rc-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.25);
        }
        .rc-amount {
          font-size: 22px; font-weight: 800; color: #fff;
          line-height: 1.15; letter-spacing: -0.5px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .rc-label {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.78);
          text-transform: uppercase; letter-spacing: 0.7px;
        }
      `}</style>
    </>
  );
};

export default RevenueCards;
