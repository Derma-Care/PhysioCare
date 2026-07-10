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
  cilGroup,
  cilUserFollow,
  cilUserPlus,
  cilContact,
  cilMedicalCross,
  cilRunning,
  cilLayers,
  cilStar,
  cilChatBubble,
  cilBriefcase,
  cilChart,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'
import { NavLink } from 'react-router-dom'
import { CircleHelp, CircleQuestionMark } from 'lucide-react'

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
      // to: '/Appointment-Management',
      to: '/followupDashboard',
      as: NavLink,
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/Employee-management',
      name: 'Employee management',
      as: NavLink,
      icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Patient Management',
      to: '/Patient-Management',
      as: NavLink,
      icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    },
    // {
    //   component: CNavItem,
    //   name: 'Patient Management',
    //   to: '/patient-management',
    //   as: NavLink,
    //   icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    // },
    // {
    //   component: CNavItem,
    //   to: '/pharmacy-management',
    //   name: 'Pharmacy Management',
    //   as: NavLink,
    //   icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
    // },

    {
      component: CNavItem,
      to: '/package-management',
      name: 'Package Management',
      as: NavLink,
      icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/therapy-programs',
      name: 'Program Management', //Program Management
      as: NavLink,
      icon: <CIcon icon={cilLayers} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/therapy-Management',
      name: 'Therapy Management',

      as: NavLink,
      icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      to: '/exercises',
      name: 'Activity Library', //Exercises Management

      as: NavLink,
      icon: <CIcon icon={cilRunning} customClassName="nav-icon" />,
    },

    {
      component: CNavItem,
      to: '/report-management',
      name: 'LabReport Management', //report management
      as: NavLink,
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/feedback',
      name: 'Patient FeedBack',
      as: NavLink,
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/equipment-management',
      name: 'Equipment Management',
      as: NavLink,
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    },

    // {
    //   component: CNavItem,
    //   to: '/Disease',
    //   name: 'Disease-Management',
    //   as: NavLink,
    //   icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
    // },
    {
      component: CNavItem,
      to: '/Tests',
      name: 'Tests',
      as: NavLink,
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
    // {
    //   component: CNavItem,
    //   to: '/Treatments',
    //   name: 'Treatments',
    //   as: NavLink,
    //   icon: <CIcon icon={cilHealing} customClassName="nav-icon" />,
    // },



    // {
    //   component: CNavItem,
    //   to: '/consent-forms',
    //   name: 'ConsentForms',
    //   as: NavLink,
    //   icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
    // },
    {
      component: CNavItem,
      to: '/ref-doctor',
      name: 'Refered By Doctor',  //Referred BY Doctors
      as: NavLink,
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },
    // {
    //   component: CNavItem,
    //   to: '/payouts',
    //   name: 'Payouts',
    //   as: NavLink,
    //   icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
    // },
    {
      component: CNavItem,
      to: '/billing',
      name: 'Billing',
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
      name: 'Attendance Reports',
      as: NavLink,
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/analytics',
      name: 'Analytics',
      as: NavLink,
      icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      to: '/recoverySupport',
      name: 'Recovery Support',
      as: NavLink,
      icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
    },



    {
      component: CNavItem,
      to: '/help',
      name: 'Help',
      as: NavLink,
      icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
    },



  ]


  if (!permissions || typeof permissions !== 'object') return []

  // return allNav.filter((item) => permissions[item.name])
  return allNav.filter(
    (item) =>
      // permissions[item.name] || item.name === 'Attendance Reports' || item.name === 'Recovery Support'
      permissions[item.name]




    // item.name === 'Equipment Management',
  )
}

// ✅ Optional: filter based on permissions if needed
