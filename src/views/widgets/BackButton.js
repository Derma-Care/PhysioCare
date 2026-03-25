import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useNavigation } from '../Usecontext/NavigationProvider'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
  const { goBack } = useNavigation()
  const [isHovered, setIsHovered] = useState(false)
  const [isAHovered, setIsAHovered] = useState(false)
  const navigate = useNavigate()
  return (
    <>
    <CButton
      variant="outline"
      onClick={goBack} // go back one step in stack
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: 'var(--color-black)',
        color: isHovered ? 'white' : 'var(--color-black)',
        backgroundColor: isHovered ? 'var(--color-black)' : 'transparent',
        transition: 'all 0.3s ease', marginRight: '10px'
      }}
    >
      Back
    </CButton>
     <CButton variant="outline" style={{
        borderColor: 'var(--color-black)',
        color: isAHovered ? 'white' : 'var(--color-black)',
        backgroundColor: isAHovered ? 'var(--color-black)' : 'transparent',
        transition: 'all 0.3s ease', marginRight: '10px'
      }}  onClick={() => navigate('/attendance')}  onMouseEnter={() => setIsAHovered(true)}
      onMouseLeave={() => setIsAHovered(false)}>
                   Attendance
                 </CButton>
    </>
  )
}

export default BackButton
