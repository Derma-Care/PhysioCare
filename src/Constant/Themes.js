// src/styles/constants.ts

export const COLORS = {
  primary: '#1B4F8A',
  secondary: '#0196ee',
  danger: '#ff4d4f',
  success: '#28a745',
  white: '#fff',
  bgcolor: '#1B4F8A',
  black: '#F0F6FF',
  logocolor: '#000',
  sideColor: "#1a3a6b"
}

export const FONT_SIZES = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
}

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
}

export const SIZES = {
  small: '0.75rem',
  medium: '1rem',
  large: '1.25rem',
}

//svg icons
export const compareSvg = [
  '512 512',
  `
    M96 160h224v48H96zM96 304h320v48H96z
    M352 96l64 64-64 64-32-32 32-32-32-32z
  `,
]

export const injectTheme = () => {
  const root = document.documentElement
  Object.entries(COLORS).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
}
