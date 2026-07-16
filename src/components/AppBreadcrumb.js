import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem, CFormSelect } from '@coreui/react'
import BackButton from '../views/widgets/BackButton'
import { GetClinicBranches } from '../views/Doctors/DoctorAPI'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  // const [branches, setBranches] = useState([]);
  // const [selectedBranch, setSelectedBranch] = useState("");
  // const [selectedBranchName, setSelectedBranchName] = useState("");
  // const role = localStorage.getItem('role');
  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        })
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  const linkStyle = (color) => ({
    color: color,
    textDecoration: 'none',
    fontSize: '0.775rem',
    fontWeight: 400,
  })
  // useEffect(() => {
  //   const initBranches = async () => {
  //     const hId = localStorage.getItem('HospitalId');
  //     const defaultBranchId = localStorage.getItem('branchId');
  //     const defaultBranchName = localStorage.getItem('branchName');
  //     if (!hId) return;

  //     const res = await GetClinicBranches(hId);
  //     setBranches(res.data || []);

  //     if (res.data?.length) {
  //       setSelectedBranch(defaultBranchId);
  //       setSelectedBranchName(defaultBranchName);

  //     }
  //   };
  //   initBranches();


  // }, []);

  // const handleBranchChange = (bId) => {
  //   const branch = branches.find((b) => b.branchId === bId);
  //   setSelectedBranch(bId);
  //   setSelectedBranchName(branch?.branchName || "");
  //   localStorage.setItem("branchId", selectedBranch);
  //   localStorage.setItem("branchName", selectedBranchName);

  // };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '6px 10px',
        background: 'transparent',
      }}
    >
      {/* Left Side */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Back Button First */}
        <BackButton />

        {/* Breadcrumb */}
        <CBreadcrumb
          className="my-0"
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Home */}
          <CBreadcrumbItem>
            <a
              href="/dashboard"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                transition: '0.2s',
              }}
            >
              Home
            </a>
          </CBreadcrumbItem>

          {/* Dynamic Breadcrumbs */}
          {breadcrumbs.map((breadcrumb, index) =>
            breadcrumb.active ? (
              <CBreadcrumbItem key={index} active>
                <span
                  style={{
                    color: '#dbeafe',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {breadcrumb.name}
                </span>
              </CBreadcrumbItem>
            ) : (
              <CBreadcrumbItem key={index}>
                <a
                  href={breadcrumb.pathname}
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {breadcrumb.name}
                </a>
              </CBreadcrumbItem>
            )
          )}
        </CBreadcrumb>
      </div>
      {/* {branches?.length > 1 && role?.toLowerCase() === 'admin' && (
        <div style={{ width: "200px", marginBottom: "1rem" }}>
          <CFormSelect
            value={selectedBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            style={{
              fontSize: '13px',
              borderRadius: '8px',
              border: '0.5px solid #d0dce9',
              color: '#374151',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              padding: '6px 12px'
            }}
          >
            {branches.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </CFormSelect>
        </div>
      )} */}
    </div>
  )
}

export default React.memo(AppBreadcrumb)