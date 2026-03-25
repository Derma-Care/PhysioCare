import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import routes from '../routes'

const renderRoutes = (routes) => {
  return routes.map((route, idx) => {
    if (route.children) {
      return (
        <Route key={idx} path={route.path} element={<route.element />}>
          {renderRoutes(route.children)}
        </Route>
      )
    }

    return <Route key={idx} path={route.path} element={<route.element />} />
  })
}

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Routes>
        {renderRoutes(routes)}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </CContainer>
  )
}

export default React.memo(AppContent)
