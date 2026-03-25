import React from 'react'
import { CButton, CFormSelect } from '@coreui/react'

const Pagination = ({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange }) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  // Calculate page numbers (show max 5 at a time)
  const getPageNumbers = () => {
    const pageNumbers = []
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
    const endPage = Math.min(startPage + 4, totalPages)

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      {/* Rows per page */}
      <div className="d-flex align-items-center gap-2">
        <span>Rows per page:</span>
        <CFormSelect
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ width: '100px' }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </CFormSelect>
      </div>

      {/* Pagination */}
      <div className="d-flex align-items-center gap-2">
        <CButton size="sm" onClick={handlePrev} disabled={currentPage === 1} color="secondary">
          Prev
        </CButton>

        {getPageNumbers().map((page) => (
          <CButton
            key={page}
            size="sm"
            style={{
              backgroundColor: currentPage === page ? 'var(--color-black)' : '#fff',
              color: currentPage === page ? '#fff' : 'var(--color-black)',
              border: '1px solid #ccc',
              borderRadius: '5px',
              minWidth: '35px',
            }}
            onClick={() => onPageChange(page)}
          >
            {page}
          </CButton>
        ))}

        <CButton
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          color="secondary"
        >
          Next
        </CButton>

        <span style={{ marginLeft: '10px' }}>
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  )
}

export default Pagination
