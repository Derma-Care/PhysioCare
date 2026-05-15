import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GlobalSearchContext = createContext()

export const GlobalSearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResultCount, setSearchResultCount] = useState(0)
  const location = useLocation()

  // Clear search query on route change
  useEffect(() => {
    setSearchQuery('')
  }, [location.pathname])

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