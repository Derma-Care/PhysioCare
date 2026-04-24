// src/views/Usecontext/GlobalSearchContext.js
import React, { createContext, useContext, useState, useCallback } from 'react'

const GlobalSearchContext = createContext()

export const GlobalSearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResultCount, setSearchResultCount] = useState(0)

  // ✅ Call this from any component after filtering
  const updateSearchResults = useCallback((count) => {
    setSearchResultCount(count)
  }, [])

  return (
    <GlobalSearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery,
      searchResultCount,
      updateSearchResults
    }}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export const useGlobalSearch = () => useContext(GlobalSearchContext)