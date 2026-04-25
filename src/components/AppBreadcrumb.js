import React from 'react'
import { useLocation } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import BackButton from '../views/widgets/BackButton'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '0 4px',
      }}
    >
      <CBreadcrumb className="my-0 mb-0" style={{ fontSize: '0.775rem', margin: 0 }}>

        <CBreadcrumbItem>
          {React.createElement(
            'a',
            { href: '/dashboard', style: { ...linkStyle('#ffffff'), fontWeight: 500 } },
            'Home'
          )}
        </CBreadcrumbItem>

        {breadcrumbs.map((breadcrumb, index) =>
          breadcrumb.active ? (
            <CBreadcrumbItem key={index} active>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.775rem', fontWeight: 600 }}>
                {breadcrumb.name}
              </span>
            </CBreadcrumbItem>
          ) : (
            <CBreadcrumbItem key={index}>
              {React.createElement(
                'a',
                { href: breadcrumb.pathname, style: linkStyle('rgba(255,255,255,0.65)') },
                breadcrumb.name
              )}
            </CBreadcrumbItem>
          )
        )}

      </CBreadcrumb>

      <div className="ms-auto">
        <BackButton />
      </div>
    </div>
  )
}

export default React.memo(AppBreadcrumb)