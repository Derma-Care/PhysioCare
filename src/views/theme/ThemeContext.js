// import React, { createContext, useContext, useState } from 'react'

// // Create Theme Context
// const ThemeContext = createContext()

// // Default Theme (can later fetch from API or DB too)
// const defaultTheme = {
//   fontFamily: 'TimesNewRoman',
//   fontSize: '45px',
//   headingSize: '25px',
//   primaryColor: '#007bff',
//   secondaryColor: '#6c757d',
//   textColor: '#333',
//   backgroundColor: '#fff',
//   fontWeight: 'bold', // neat spacing
// }

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(defaultTheme)

//   return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
// }

// // Custom Hook
// export const useTheme = () => useContext(ThemeContext)
