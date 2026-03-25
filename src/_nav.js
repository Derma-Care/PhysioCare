import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilSpeedometer,
  cilUser,
  cilWarning,
  cilClipboard,
  cilHealing,
  cilSettings,
  cilDescription,
  cilTablet,
  cilNoteAdd,
  cilNotes,
  cilWallet,
  cilLightbulb,
  cilBell,
  cilPeople,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'
import { NavLink } from 'react-router-dom'

export const getNavigation = (permissions = {}) => {
  const allNav = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      as: NavLink,
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Appointments',
      to: '/Appointment-Management',
      as: NavLink,
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/Employee-management',
      name: 'Employee management',
      as: NavLink,
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Customer Management',
      to: '/customer-management',
      as: NavLink,
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Patient Management',
      to: '/patient-management',
      as: NavLink,
      icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/pharmacy-management',
      name: 'Pharmacy Management',
      as: NavLink,
      icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/report-management',
      name: 'Reports',
      as: NavLink,
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/package-management',
      name: 'Package Management',
      as: NavLink,
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      to: '/Disease',
      name: 'Disease-Management',
      as: NavLink,
      icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/Tests',
      name: 'Tests',
      as: NavLink,
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/Treatments',
      name: 'Treatments',
      as: NavLink,
      icon: <CIcon icon={cilHealing} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/Procedure-Management',
      name: 'Procedure Management',
      as: NavLink,
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      to: '/consent-forms',
      name: 'ConsentForms',
      as: NavLink,
      icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/ref-doctor',
      name: 'Refer Doctor',
      as: NavLink,
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/payouts',
      name: 'Payouts',
      as: NavLink,
      icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/notification',
      name: 'Push Notification',
      as: NavLink,
      icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    },
     {
      component: CNavItem,
      to: '/attendance',
      name: 'Attendance',
      as: NavLink,
      icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/help',
      name: 'Help',
      as: NavLink,
      icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
    },
  ]

  // Only include items if permission exists
  if (!permissions || typeof permissions !== 'object') return []

  // return allNav.filter((item) => permissions[item.name])
  return allNav.filter(
    (item) =>
      permissions[item.name] ||
      item.name === 'Patient Management' ||
      item.name === 'Package Management',
  )
}

// ✅ Optional: filter based on permissions if needed
