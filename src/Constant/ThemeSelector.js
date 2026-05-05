import React, { useState, useEffect } from 'react'
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast } from '@coreui/icons'

// Theme options
const themeOptions = {

  default: { name: 'Default', bgcolor: '#1B4F8A', black: '#F0F6FF' }

}

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState('default')

  // Load saved theme from localStorage on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme')
    if (savedTheme && themeOptions[savedTheme]) {
      applyTheme(savedTheme)
      setSelectedTheme(savedTheme)
    } else {
      applyTheme('default') // default theme
    }
  }, [])

  const applyTheme = (themeKey) => {
    const theme = themeOptions[themeKey]
    if (!theme) return
    document.documentElement.style.setProperty('--color-bgcolor', theme.bgcolor)
    document.documentElement.style.setProperty('--color-black', theme.black)
  }

  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey)
    applyTheme(themeKey)
    localStorage.setItem('selectedTheme', themeKey) // ✅ Save to localStorage
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle caret={false}>
        <CIcon icon={cilContrast} size="lg" style={{ color: 'var(--color-black)' }} />
      </CDropdownToggle>
      <CDropdownMenu>
        {Object.keys(themeOptions).map((themeKey) => (
          <CDropdownItem
            key={themeKey}
            as="button"
            type="button"
            active={selectedTheme === themeKey}
            onClick={() => handleThemeChange(themeKey)}
          >
            {themeOptions[themeKey].name}
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default ThemeSelector
