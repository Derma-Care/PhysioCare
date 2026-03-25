import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CFormText,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CHeader,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  CategoryData,
  postCategoryData,
  updateCategoryData,
  deleteCategoryData,
} from './CategoryAPI'
import { showCustomToast } from '../../Utils/Toaster'

const CategoryManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewCategory, setViewCategory] = useState(null)
  const [editCategoryMode, setEditCategoryMode] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [errors, setErrors] = useState({
    categoryName: '',
    categoryImage: '',
  })

  const [newCategory, setNewCategory] = useState({
    categoryName: '',
    categoryImage: null,
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null)
  const [updatedCategory, setUpdatedCategory] = useState({
    categoryName: '',
    categoryImage: null,
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await CategoryData()
      setCategory(data.data)
    } catch (error) {
      setError('Failed to fetch category data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()
      if (!trimmedQuery) {
        setFilteredData([])
        return
      }
      const filtered = category.filter((category) => {
        const categoryMatch = category.categoryName?.toString().includes(trimmedQuery)
        return categoryMatch
      })
      setFilteredData(filtered)
    }
    handleSearch()
  }, [searchQuery, category])

  const columns = [
    {
      name: 'Category Name',
      selector: (row) => row.categoryName,
      sortable: true,
      width: '200px',
      cell: (row) => <div style={{ textAlign: 'center' }}>{row.categoryName}</div>,
      headerStyle: { textAlign: 'center' },
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '230px',
          }}
        >
          <CButton
            color="primary"
            onClick={() => setViewCategory(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            View
          </CButton>
          <CButton
            color="primary"
            onClick={() => handleCategoryEdit(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            Edit
          </CButton>
          <CButton
            color="danger"
            onClick={() => handleCategoryDelete(row.categoryId)}
            style={{ width: '80px' }}
          >
            Delete
          </CButton>

          <ConfirmationModal
            isVisible={isModalVisible}
            message="Are you sure you want to delete this category?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      ),
      width: '150px',
      headerStyle: { textAlign: 'center' },
    },
  ]

  const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    return (
      <CModal
        visible={isVisible}
        onClose={onCancel}
        backdrop="static"
        style={{
          maxWidth: '500px',
          height: 'auto',
          marginTop: '10%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: '500px',
          color: 'var(--color-black)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <CHeader style={{ marginBottom: '10px', color: 'var(--color-black)' }}>!Alert</CHeader>
          <CModalBody>{message}</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={onCancel}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={onConfirm}>
              Confirm
            </CButton>
          </CModalFooter>
        </div>
      </CModal>
    )
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }
        setNewCategory((prevCategory) => ({
          ...prevCategory,
          categoryImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCategoryChange = (e) => {
    const { name, value } = e.target
    setNewCategory({
      ...newCategory,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!newCategory.categoryName) {
      newErrors.categoryName = 'Category name is required.'
    }

    if (!newCategory.categoryImage) {
      newErrors.categoryImage = 'Category image is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCategory = async () => {
    if (!validateForm()) return

    try {
      const payload = {
        categoryName: newCategory.categoryName,
        categoryImage: newCategory.categoryImage,
      }

      const response = await postCategoryData(payload)
      showCustomToast('Category added successfully!', { position: 'top-right' },'success')
      fetchData()
      setModalVisible(false)
    } catch (error) {
      console.error('Error adding category:', error)
      // showCustomToast(error.message, { position: 'top-right' },'error')
    }
  }
  const handleCategoryEdit = (category) => {
    setCategoryToEdit(category)
    setUpdatedCategory({
      categoryName: category.categoryName || '',
      categoryImage: category.categoryImage || null,
    })
    setEditCategoryMode(true)
  }

  const handleUpdateCategory = async () => {
    if (!updatedCategory.categoryName.trim()) {
     showCustomToast('Category name is required', { position: 'top-right' },'error')
      return
    }

    try {
      const formData = new FormData()
      formData.append('categoryName', updatedCategory.categoryName)
      if (updatedCategory.categoryImage) {
        formData.append('categoryImage', updatedCategory.categoryImage)
      }

      const response = await updateCategoryData(categoryToEdit.categoryId, formData)

      console.log('Category updated successfully:', response)
      showCustomToast('Category updated successfully!', { position: 'top-right' },'success')
      setEditCategoryMode(false)
      fetchData()
    } catch (error) {
      console.error('Error updating category:', error)
      // showCustomToast(error.message, { position: 'top-right' },'error')
    }
  }

  const handleCancel = () => {
    setUpdatedCategory({
      categoryName: '',
      categoryImage: null,
    })
    setEditCategoryMode(false)
  }

  const handleEditFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        setUpdatedCategory((prevCategory) => ({
          ...prevCategory,
          categoryImage: base64String,
        }))
      }

      reader.readAsDataURL(file)
    }
  }

  const handleCategoryDelete = (categoryId) => {
    setCategoryIdToDelete(categoryId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCategoryData(categoryIdToDelete)
      setIsModalVisible(false)
      showCustomToast('Category deleted successfully!', { position: 'top-right' },'success')
      fetchData()
    } catch (error) {
      alert('Failed to delete category.')
    }
  }

  const handleCancelAdd = () => {
    setNewCategory({
      categoryName: '',
      categoryImage: null,
    })
    setErrors({})
    setModalVisible(false)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />
      <div>
        <CForm className="d-flex justify-content-end mb-3">
          <CInputGroup className="mb-3" style={{ marginRight: '20px', width: '400px' }}>
            <CFormInput
              type="text"
              placeholder="Search by CategoryName, Category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '40px' }}
            />
            <CInputGroupText style={{ height: '40px' }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
          <CButton color="primary" style={{ height: '40px' }} onClick={() => setModalVisible(true)}>
            Add Category
          </CButton>
        </CForm>
      </div>

      {viewCategory && (
        <CModal visible={!!viewCategory} onClose={() => setViewCategory(null)}>
          <CModalHeader>
            <CModalTitle>Category Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>
              <strong>categoryName : </strong> {viewCategory.categoryName}
            </p>
            <p>
              <strong>CategoryImage: </strong>
              {viewCategory.categoryImage ? (
                <img
                  src={`data:image/png;base64,${viewCategory.categoryImage}`}
                  alt="Category"
                  style={{ width: '200px', height: 'auto' }}
                />
              ) : (
                <span>No image available</span>
              )}
            </p>
          </CModalBody>
          <CModalFooter></CModalFooter>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={handleCancelAdd} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>Category Name</h6>
            <CFormInput
              type="text"
              placeholder="Category Name"
              value={newCategory.categoryName || ''}
              name="categoryName"
              onChange={handleCategoryChange}
            />
            {errors.categoryName && (
              <CFormText className="text-danger">{errors.categoryName}</CFormText>
            )}

            <h6>Category Image</h6>
            <CFormInput type="file" onChange={handleFileChange} />
            {errors.categoryImage && (
              <CFormText className="text-danger">{errors.categoryImage}</CFormText>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddCategory}>
            Add
          </CButton>
          <CButton color="secondary" onClick={handleCancelAdd}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={editCategoryMode}
        onClose={() => setEditCategoryMode(false)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Edit Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Category Name Input */}
            <h6>Category Name</h6>
            <CFormInput
              type="text"
              placeholder="Category Name"
              value={updatedCategory?.categoryName || ''}
              onChange={(e) =>
                setUpdatedCategory({ ...updatedCategory, categoryName: e.target.value })
              }
            />
            {/* Category Image Input */}
            <h6>Category Image</h6>
            <CFormInput type="file" onChange={handleEditFileChange} />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateCategory}>
            Update
          </CButton>
          <CButton color="secondary" onClick={handleCancel}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {loading ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px', fontSize: '22px' }}
        >
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div>
          <DataTable
            title="Category List"
            columns={columns}
            data={filteredData.length > 0 ? filteredData : category}
            pagination
          />
        </div>
      )}
    </div>
  )
}

export default CategoryManagement
