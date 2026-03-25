import React from 'react';
import PropTypes from 'prop-types';
import { CRow, CCol } from '@coreui/react';
import { CChart } from '@coreui/react-chartjs';

const WidgetsBrand = ({ className }) => {
  const chartOptions = {
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hitRadius: 10,
        hoverRadius: 5,
        hoverBorderWidth: 3,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
      },
    },
  };

  return (
    <>
      {/* Top Chart: Hospital Survey */}
      <CRow className={className} xs={{ gutter: 4 }}>
        <CCol sm={12} md={12} lg={12}>
          {/* <h3>Hospital Survey</h3>
          <div style={{ height: '300px', padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <CChart
              type="line"
              data={{
                labels: ['2020-1', '2020-3', '2020-5', '2020-7', '2020-9', '2020'],
                datasets: [
                  {
                    label: 'Patients 2024',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: '#FFC107',
                    pointHoverBackgroundColor: '#FFC107',
                    borderWidth: 2,
                    data: [100, 120, 110, 130, 125, 140],
                    fill: true,
                  },
                  {
                    label: 'Patients 2025',
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: '#2196F3',
                    pointHoverBackgroundColor: '#2196F3',
                    borderWidth: 2,
                    data: [140, 160, 150, 180, 170, 200],
                    fill: true,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div> */}
        </CCol>
      </CRow>

      {/* Bottom Charts: Side by Side Layout */}
      <CRow className={className} xs={{ gutter: 4 }} style={{ marginTop: '20px' }}>
        {/* First Chart: Monthly Income */}
        {/* <CCol sm={12} md={6} lg={6}> */}
          {/* <div style={{ height: '300px', padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h4>1M</h4>
            <p>Income in current month</p>
            <CChart
              type="line"
              data={{
                labels: ['1 July', '8 July', '16 July', '24 July', '31 July'],
                datasets: [
                  {
                    label: 'Monthly Income',
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: '#2196F3',
                    pointHoverBackgroundColor: '#2196F3',
                    borderWidth: 2,
                    data: [40000, 70000, 30000, 60000, 45000],
                    fill: true,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div> */}
        {/* </CCol> */}

        {/* Second Chart: Weekly Income */}
        {/* <CCol sm={12} md={6} lg={6}> */}
          {/* <div style={{ height: '300px', padding: '10px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h4>2,50,000</h4>
            <p>Income in current week</p>
            <CChart
              type="line"
              data={{
                labels: ['25 July', '26 July', '27 July', '28 July', '29 July', '30 July', '31 July'],
                datasets: [
                  {
                    label: 'Weekly Income',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: '#FFC107',
                    pointHoverBackgroundColor: '#FFC107',
                    borderWidth: 2,
                    data: [50000, 40000, 45000, 42000, 80000, 30000, 50000],
                    fill: true,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div> */}
        {/* </CCol> */}
      </CRow>
    </>
  );
};

// WidgetsBrand.propTypes = {
//   className: PropTypes.string,
// };

export default WidgetsBrand;
