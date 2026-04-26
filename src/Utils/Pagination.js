import React from 'react'

const Pagination = ({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange }) => {
  const handlePrev = () => { if (currentPage > 1) onPageChange(currentPage - 1) }
  const handleNext = () => { if (currentPage < totalPages) onPageChange(currentPage + 1) }

  const getPageNumbers = () => {
    const pageNumbers = []
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1
    const endPage = Math.min(startPage + 4, totalPages)
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)
    return pageNumbers
  }

  return (
    <div className="pgn-wrapper">
      {/* Rows per page */}
      <div className="pgn-rows">
        <span className="pgn-rows-label">Rows per page:</span>
        <select
          className="pgn-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div className="pgn-controls">
        <button className="pgn-btn pgn-nav" onClick={handlePrev} disabled={currentPage === 1}>
          ‹ Prev
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`pgn-btn pgn-page ${currentPage === page ? 'pgn-active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button className="pgn-btn pgn-nav" onClick={handleNext} disabled={currentPage === totalPages}>
          Next ›
        </button>

        <span className="pgn-info">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
      </div>

      <style>{`
        .pgn-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
          padding: 10px 14px;
        
         
          border-radius: 10px;
        }

        .pgn-rows {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pgn-rows-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          white-space: nowrap;
        }
        .pgn-select {
          height: 30px;
          padding: 0 8px;
          font-size: 12px;
          color: #374151;
          background: #fff;
          border: 0.5px solid #d0dce9;
          border-radius: 7px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .pgn-select:focus { border-color: #185fa5; }

        .pgn-controls {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .pgn-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          min-width: 30px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 7px;
          border: 0.5px solid #d0dce9;
          cursor: pointer;
          transition: background 0.12s, filter 0.12s, transform 0.1s;
        }
        .pgn-btn:active:not(:disabled) { transform: scale(0.95); }
        .pgn-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .pgn-nav {
          background: #fff;
          color: #374151;
        }
        .pgn-nav:hover:not(:disabled) { background: #f0f5fb; border-color: #b5d4f4; color: #185fa5; }

        .pgn-page {
          background: #fff;
          color: #374151;
        }
        .pgn-page:hover:not(.pgn-active) { background: #f0f5fb; border-color: #b5d4f4; color: #185fa5; }

        .pgn-active {
          background: #185fa5 !important;
          color: #fff !important;
          border-color: #185fa5 !important;
        }

        .pgn-info {
          font-size: 12px;
          color: #6b7280;
          margin-left: 6px;
          white-space: nowrap;
        }
        .pgn-info strong { color: #0c447c; }
      `}</style>
    </div>
  )
}

export default Pagination