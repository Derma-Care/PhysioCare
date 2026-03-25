// src/views/Usecontext/GlobalSearchContext.js
import React, { createContext, useContext, useState } from 'react'

const GlobalSearchContext = createContext()

export const GlobalSearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <GlobalSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export const useGlobalSearch = () => useContext(GlobalSearchContext)
