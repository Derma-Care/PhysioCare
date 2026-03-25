import React from 'react'
import { useLocation } from 'react-router-dom'

import routes from '../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import { COLORS } from '../Constant/Themes'
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

  return (
    <div className="d-flex justify-content-between align-items-center align-content-center  w-100">
      <CBreadcrumb className="my-0 custom-breadcrumb mb-0">
        <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
        {breadcrumbs.map((breadcrumb, index) => (
          <CBreadcrumbItem
            key={index}
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            style={{ color: 'var(--color-black)' }}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        ))}
      </CBreadcrumb>

      {/* 🟢 Back Button aligned at the right end */}
      <div className="ms-auto ">
        <BackButton />
      </div>
    </div>
  )
}

export default React.memo(AppBreadcrumb)
