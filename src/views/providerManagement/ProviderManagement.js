import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CForm, CFormInput, CInputGroup, CInputGroupText, CButton } from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { providerData } from './providerAPIs'

const ProviderManagement = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [providers, setProviders] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetching provider data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await providerData()
        console.log(data)
        setProviders(data)
        setFilteredData(data)
      } catch (error) {
        console.error("Error fetching provider data:", error)
        setError('Failed to fetch provider data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  

  // Handling search functionality
  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()

      if (!trimmedQuery) {
        setFilteredData(providers)
        return
      }

      const filtered = providers.filter((provider) => {
        const fullNameMatch = provider.fullName?.toLowerCase().includes(trimmedQuery)
        const mobileMatch = provider.mobileNumber?.toString().includes(trimmedQuery)
        const emailMatch = provider.emailId?.toLowerCase().includes(trimmedQuery)

        return fullNameMatch || mobileMatch || emailMatch
      })

      setFilteredData(filtered)
    }

    handleSearch()
  }, [searchQuery, providers])

  // Column definitions for the DataTable
  const columns = [
    { name: 'Full Name', selector: (row) => row.fullName, sortable: true },
    { name: 'Mobile Number', selector: (row) => row.mobileNumber, sortable: true },
    { name: 'Email', selector: (row) => row.emailId, sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <CButton color="primary" onClick={() => handleProviderViewDetails(row.mobileNumber)}>
          View
        </CButton>
      ),
    },
  ]

  // Navigation for viewing provider details
  const handleProviderViewDetails = (mobileNumber) => {
    navigate(`/provider-management/${mobileNumber}`)
  }

  // Styling for centered messages
  const centeredMessageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.5rem',
    color: '#808080',
  }

  // Custom styles for DataTable
const customStyles = {
  headCells: {
    style: {
      backgroundColor: '#F4F6F8',
      color: '#333333',
      fontSize: '16px',
      fontWeight: 'bold',
      borderBottom: 'thin solid #DADCE0',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
      color: '#333333',
      '&:nth-of-type(even)': {
        backgroundColor: '#FFFFFF',
      },
      '&:nth-of-type(odd)': {
        backgroundColor: '#FAFAFA',
      },
      '&:hover': {
        backgroundColor: '#E9E9E9',
      },
    },
  },
  cells: {
    style: {
      borderBottom: 'thin solid #DADCE0',
    },
  },
};


  return (
    <>
      <CForm className="d-flex justify-content-end">
        <CInputGroup className="mb-3 w-50">
          <CFormInput
            type="text"
            id="search-input"
            placeholder="Search by full name, mobile, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>
      </CForm>

      {loading ? (
        <div style={centeredMessageStyle}>Loading...</div>
      ) : error ? (
        <div style={centeredMessageStyle}>{error}</div>
      ) : filteredData.length === 0 ? (
        <div style={centeredMessageStyle}>There are no records to display</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          striped
          customStyles={customStyles}
        />
      )}
    </>
  )
}

export default React.memo(ProviderManagement)
