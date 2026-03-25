import React, { useState, useEffect } from 'react'
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast } from '@coreui/icons'

// Theme options
const themeOptions = {
  classic: { name: 'Classic', bgcolor: '#a5c4d4ff', black: '#7e3a93' }, // default
 light: { name: 'Light', bgcolor: '#F2E8CF', black: '#2B2B2B' },
  neutral: { name: 'Neutral', bgcolor: '#F6E2E7', black: '#3C0A21' },
  Ocean: { name: 'Ocean', bgcolor: '#6898c9ff', black: '#1b4ca0ff' },
  Midnight: { name: 'Midnight Black', bgcolor: '#E0F7F4', black: '#004D40' },
  Sunset: { name: 'Sunset Orange', bgcolor: '#E8E8E8', black: '#222222' },
  OceanBlue: { name: 'Ocean Blue', bgcolor: '#DCEEFF', black: '#1A2E40' },
  Mint: { name: 'Mint Green', bgcolor: '#DDE5B6', black: '#344E41' },
  Lavender: { name: 'Lavender Purple', bgcolor: '#E8E2F6', black: '#1C1B33' },
}

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState('classic')

  // Load saved theme from localStorage on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme')
    if (savedTheme && themeOptions[savedTheme]) {
      applyTheme(savedTheme)
      setSelectedTheme(savedTheme)
    } else {
      applyTheme('classic') // default theme
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
