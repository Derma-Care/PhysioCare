import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CForm,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CInputGroup,
  CButton,
  CListGroup,
  CListGroupItem,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormText, // Added CFormText to fix errors
} from '@coreui/react'
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa'
import {
  CategoryData,
  serviceData, // This API function needs to be updated to accept a categoryId
  subServiceData,
  getSubServiceById,
} from '../ProcedureManagement/ProcedureManagementAPI'
import {
  AddConsentFormData,
  GetGenericFormData,
  GetProcedureFormData,
  updateConsentData,
  deleteConsentData,
} from './ConsentFormsAPI'
import Select from 'react-select'
import { toast } from 'react-toastify'
import capitalizeWords from '../../Utils/capitalizeWords'
import ConfirmationModal from '../../components/ConfirmationModal'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'

const ProcedureConsentForm = () => {
  const [category, setCategory] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [selectedSubService, setSelectedSubService] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [procedureForms, setProcedureForms] = useState([]) // list of accordions
  const [editingAnswerIndex, setEditingAnswerIndex] = useState(null)
  const [missingSubService, setMissingSubService] = useState(false)
  const [isSubServiceComplete, setIsSubServiceComplete] = useState(true)
  const [editFormId, setEditFormId] = useState(null) // NEW: id of the form being edited
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [procedureName, setProcedureName] = useState(null)
  const [saveloading, setSaveLoading] = useState(false)
  // form state
  const [newService, setNewService] = useState({
    categoryId: '',
    serviceId: '',
    subServiceid: '',
    subServiceName: '',
    consentFormQuestions: [],
  })

  const [question, setQuestion] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [answers, setAnswers] = useState([])
  const [qaList, setQaList] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [errors, setErrors] = useState({}) // State for form validation errors
  const hospitalId = localStorage.getItem('HospitalId')
  const consentFormType = '2' // from your Postman example
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const indexOfLast = currentPage * rowsPerPage
  const indexOfFirst = indexOfLast - rowsPerPage
  const currentForms = procedureForms.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(procedureForms.length / rowsPerPage)
  const [delloading, setDelLoading] = useState(false)
  // Refactored API fetching to use the correct IDs
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryData()
        if (Array.isArray(res.data)) setCategory(res.data)
        else if (Array.isArray(res.data?.data)) setCategory(res.data.data)
        else setCategory([])
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProcedureForms = async () => {
      console.log(hospitalId)
      console.log(consentFormType)
      try {
        const res = await GetGenericFormData(hospitalId, consentFormType)
        if (res?.data) {
          setProcedureForms(Array.isArray(res.data) ? res.data : [res.data])
        }
      } catch (e) {
        console.error('Error fetching saved forms', e)
      }
    }

    fetchProcedureForms()
  }, [hospitalId])

  // Fetch services based on categoryId
  useEffect(() => {
    if (!newService.categoryId) {
      setServiceOptions([])
      return
    }
    const fetchServices = async () => {
      try {
        const res = await serviceData(newService.categoryId)
        setServiceOptions(res?.data || [])
      } catch (e) {
        console.error('Error fetching services', e)
        setServiceOptions([])
      }
    }
    fetchServices()
  }, [newService.categoryId])

  // Fetch subServices based on serviceId
  useEffect(() => {
  if (!newService.serviceId) {
    setSubServiceOptions([])
    return
  }

  const fetchSubServices = async () => {
    try {
      const res = await subServiceData(newService.serviceId)
      const subList = res?.data || []

      // 🔹 Flatten all subservices
      let allSubServices = []
      if (Array.isArray(subList)) {
        allSubServices = subList.flatMap((item) => item.subServices || [])
      } else if (subList?.subServices) {
        allSubServices = subList.subServices
      }

      // ✅ SET OPTIONS HERE (THIS WAS MISSING)
      setSubServiceOptions(allSubServices)

      // optional: validate already selected ones
      if (selectedSubService.length > 0) {
        checkSubServiceDetails(selectedSubService)
      }

      console.log('All SubServices:', allSubServices)
    } catch (e) {
      console.error('Error fetching subServices', e)
      setSubServiceOptions([])
    }
  }

  fetchSubServices()
}, [newService.serviceId])


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await GetProcedureFormData(hospitalId, consentFormType)
        console.log('✅ Forms from API:', res.data) // <--- log this
        if (res?.data) {
          const normalized = (Array.isArray(res.data) ? res.data : [res.data]).map((f) => ({
            ...f,
            consentFormQuestions: f.consentFormQuestions || [],
          }))
          setProcedureForms(normalized)
        }
      } catch (e) {
        console.error('Error fetching saved forms', e)
      }
    }
    fetchForms()
  }, [hospitalId, consentFormType])

  // Unified change handler for dropdowns
  const handleDropdownChange = (e) => {
    const { name, value } = e.target

    setNewService((prev) => {
      const updatedState = { ...prev, [name]: value }
      if (name === 'categoryId') {
        updatedState.serviceId = ''
        updatedState.subServiceid = ''
      }
      if (name === 'serviceId') {
        updatedState.subServiceid = ''
      }
      return updatedState
    })
  }
 const checkSubServiceDetails = async (ids) => {
  let incomplete = false

  const detailsArray = await Promise.all(
    ids.map((id) => getSubServiceById(hospitalId, id))
  )

  detailsArray.forEach((data) => {
    const arr = Array.isArray(data) ? data : [data]
    arr.forEach((sub) => {
      if (!sub.price || !sub.finalCost) {
        incomplete = true
      }
    })
  })

  setIsSubServiceComplete(!incomplete)
}


  console.log(subServiceOptions)
  const handleSubServiceChange = (e) => {
    const selectedId = e.target.value
    const selectedObj = subServiceOptions?.find((s) => s.subServiceId === selectedId)

    setSelectedSubService(selectedId)
    setNewService((prev) => ({
      ...prev,
      subServiceid: selectedId,
      subServiceName: selectedObj?.subServiceName || '',
    }))

    // ✅ Check if selected subService is already in ProcedureManagement
    const found = procedureForms.some((form) => form.subServiceid === selectedId)
    setMissingSubService(!found)
  }

  // add single answer
  const addAnswer = () => {
    if (answerInput.trim()) {
      if (editingAnswerIndex !== null) {
        // Update existing answer
        const updatedAnswers = [...answers]
        updatedAnswers[editingAnswerIndex] = answerInput.trim()
        setAnswers(updatedAnswers)
        setEditingAnswerIndex(null) // exit edit mode
      } else if (!answers.includes(answerInput.trim())) {
        // Add new answer
        setAnswers([...answers, answerInput.trim()])
      }
      setAnswerInput('')
    }
  }

  const removeAnswer = (ans) => {
    setAnswers(answers.filter((answers) => answers !== ans))
  }

  // save one Q&A into list
  const saveCurrentQA = () => {
    if (question.trim() && answers.length > 0) {
      if (qaList.some((qa) => qa.question === question.trim())) {
        alert('This question already exists.')
        return
      }
      setQaList([...qaList, { question: question.trim(), answers: [...answers] }])
      setQuestion('')
      setAnswers([])
    }
  }

  const removeQA = (index) => {
    setQaList(qaList.filter((_, i) => i !== index))
  }

  const saveProcedureForm = async () => {
    const newErrors = {}

    if (!selectedSubService || selectedSubService.length === 0) {
      newErrors.subServiceName = 'At least one Procedure must be selected.'
    }
    if (qaList.length === 0) {
      newErrors.qaList = 'At least one question is required.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    // Create formatted forms for each selected subService
    const formattedForms = selectedSubService.map((id) => ({
      subServiceid: id,
      consentFormQuestions: qaList.map((qa) => ({
        heading: qa.question,
        questionsAndAnswers: qa.answers.map((ans) => ({
          question: ans,
          answer: true,
        })),
      })),
    }))

    try {
      setSaveLoading(true)
      if (editIndex !== null) {
        // Update only the one being edited
        await updateConsentData(formattedForms[0], hospitalId, consentFormType)
      } else {
        // Add all selected subservices
        for (const form of formattedForms) {
          const res = await AddConsentFormData(form, hospitalId, consentFormType)
          if (res.status == 200 || res.status == 201) {
            showCustomToast(
              `${res.message || 'Procedure form submitted successfully...!'} `,
              'success',
            )
          } else {
            showCustomToast(`${res.message || 'Procedure already exisit'}  `, 'warning')
          }
        }
      }

      const res = await GetProcedureFormData(hospitalId, consentFormType)
      if (res?.data) {
        setProcedureForms(Array.isArray(res.data) ? res.data : [res.data])
      }

      // Reset form
      setNewService({
        categoryId: '',
        serviceId: '',
        subServiceid: '',
        subServiceName: '',
        consentFormQuestions: [],
      })
      setQaList([])
      setSelectedSubService([]) // ✅ reset multi select
      setShowForm(false)
      setEditIndex(null)
    } catch (error) {
      console.error('Error saving Procedure Form:', error)
      // toast.error('Failed to save procedure form. Please try again.')
    } finally {
      setSaveLoading(false)
    }
  }

  const editProcedureForm = async (index) => {
    try {
      const form = procedureForms[index]
      if (!form) {
        showCustomToast('Selected form not found', 'error')
        return
      }

      // try to get a consistent subService id from different possible keys
      const rawSubId =
        form.subServiceid ?? form.subServiceId ?? form?.subService?.subServiceId ?? form?.id
      if (!rawSubId) {
        console.warn('No subService id found on selected form:', form)
      }

      // fetch detailed subservice info to get category/service/subServiceName (if available)
      let subData = null
      if (rawSubId) {
        try {
          subData = await getSubServiceById(hospitalId, rawSubId) // returns the subservice object (or null)
        } catch (err) {
          console.warn('getSubServiceById failed:', err)
        }
      }

      const subServiceId = rawSubId ?? subData?.subServiceId ?? ''
      const subServiceName = subData?.subServiceName ?? form.subServiceName ?? ''
      const serviceId = subData?.serviceId ?? form.serviceId ?? ''
      const categoryId = subData?.categoryId ?? form.categoryId ?? ''

      // Ensure subServiceOptions contains this subservice so react-select can show label
      if (subData) {
        setSubServiceOptions((prev) => {
          const exists = prev.some((s) => String(s.subServiceId) === String(subData.subServiceId))
          if (!exists) return [...prev, subData]
          return prev
        })
      } else if (
        subServiceId &&
        !subServiceOptions.some((s) => String(s.subServiceId) === String(subServiceId))
      ) {
        // if no detailed data returned but we have id/name from form, add a minimal option
        setSubServiceOptions((prev) => [
          ...prev,
          { subServiceId: subServiceId, subServiceName: subServiceName || 'Unknown' },
        ])
      }

      // Set the newService state (this will trigger service/subservice fetch effects)
      setNewService({
        categoryId: categoryId || '',
        serviceId: serviceId || '',
        subServiceid: subServiceId || '',
        subServiceName: subServiceName || '',
        consentFormQuestions: form.consentFormQuestions || [],
      })

      // For react-select multi, set selectedSubService to an array of ids (strings or numbers consistent with options)
      setSelectedSubService(subServiceId ? [subServiceId] : [])

      // Format QA list to the UI shape
      const qaListFormatted = (form.consentFormQuestions || []).map((section) => ({
        question: section.heading,
        answers: (section.questionsAndAnswers || []).map((qa) => qa.question),
      }))
      setQaList(qaListFormatted)

      // mark edit index and open the form
      setEditIndex(index)
      setShowForm(true)

      // clear any previous validation errors
      setErrors({})

      // ensure missingSubService / completeness flags reflect the selected item
      const existsInManagement = procedureForms.some(
        (f) => String(f.subServiceid ?? f.subServiceId ?? '') === String(subServiceId),
      )
      setMissingSubService(!existsInManagement)

      if (subServiceId) {
        // run your detailed price/finalCost check
        checkSubServiceDetails([subServiceId])
      }
    } catch (err) {
      console.error('Error in editProcedureForm:', err)
      // showCustomToast('Unable to prepare edit form. Check console for details.', 'error')
    }
  }

  const removeProcedureForm = async (index) => {
    const form = procedureForms[index]
    const formId = form?.id || form?.consentFormId || form?.formId
    if (!form?.id) {
      showCustomToast('This form does not have an ID and cannot be deleted.', 'error')
      return
    }

    try {
      setDelLoading(true)
      await deleteConsentData(formId) // call API
      const updated = procedureForms.filter((_, i) => i !== index)
      setProcedureForms(updated)
    } catch (error) {
      console.error('Error deleting Procedure Form:', error)
      // showCustomToast('Failed to delete procedure form.', 'error')
    } finally {
      setDelLoading(false)
    }
  }

  const handleCheckboxChange = (formIndex, sectionIndex, qaIndex) => {
    const updatedForms = [...procedureForms]
    updatedForms[formIndex].consentFormQuestions[sectionIndex].questionsAndAnswers[qaIndex].answer =
      !updatedForms[formIndex].consentFormQuestions[sectionIndex].questionsAndAnswers[qaIndex]
        .answer
    setProcedureForms(updatedForms)
  }
  // Edit an answer inside qaList
  const editAnswer = (qaIndex, ansIndex) => {
    const ansToEdit = qaList[qaIndex].answers[ansIndex]
    setAnswerInput(ansToEdit)

    // remove old one temporarily, re-add after save
    const updatedQAList = [...qaList]
    updatedQAList[qaIndex].answers.splice(ansIndex, 1)
    setQaList(updatedQAList)
  }

  // Edit a question
  const editQuestion = (qaIndex) => {
    const qaToEdit = qaList[qaIndex]
    setQuestion(qaToEdit.question)
    setAnswers(qaToEdit.answers)

    // remove old one temporarily, re-add after save
    const updatedQAList = qaList.filter((_, i) => i !== qaIndex)
    setQaList(updatedQAList)
  }

  return (
    <CCard className="mt-3">
      <CCardBody>
        {!showForm && (
          <div
            className="  w-100"
            style={{
              display: 'flex',
              justifyContent: 'end',
              alignContent: 'end',
              alignItems: 'end',
            }}
          >
            <CButton
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
              onClick={() => {
                setShowForm(true)
                setNewService({
                  categoryId: '',
                  serviceId: '',
                  subServiceid: '',
                  subServiceName: '',
                  consentFormQuestions: [],
                })
                setQaList([])
                setEditIndex(null)
              }}
            >
              + Add Procedure Form
            </CButton>
          </div>
          // <CButton
          //   color="primary"
          //   onClick={() => {
          //     setShowForm(true)
          //     setNewService({
          //       categoryId: '',
          //       serviceId: '',
          //       subServiceid: '',
          //       subServiceName: '',
          //       consentFormQuestions: [],
          //     })
          //     setQaList([])
          //     setEditIndex(null)
          //   }}
          //   className="mb-3"
          // >
          //   + Add Procedure Form
          // </CButton>
        )}
        {showForm && (
          <CForm className="mb-4">
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Category Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  value={newService.categoryId || ''}
                  onChange={handleDropdownChange}
                  name="categoryId"
                  aria-label="Select Category"
                >
                  <option value="">Select a Category</option>
                  {category?.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>
                {errors.categoryId && (
                  <CFormText className="text-danger">{errors.categoryId}</CFormText>
                )}
              </CCol>
              <CCol md={4}>
                <h6>
                  Service Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="serviceId"
                  value={newService.serviceId || ''}
                  onChange={handleDropdownChange}
                >
                  <option value="">Select Service</option>
                  {serviceOptions.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </option>
                  ))}
                </CFormSelect>
                {errors.serviceId && (
                  <CFormText className="text-danger">{errors.serviceId}</CFormText>
                )}
              </CCol>
              <CCol md={4}>
                <h6>
                  Procedure Name <span className="text-danger">*</span>
                </h6>
                {/* <CFormSelect
                  name="subServiceid"
                  value={newService.subServiceid || ''}
                  onChange={handleSubServiceChange}
                >
                  <option value="">Select Procedure</option>
                  {Array.isArray(subServiceOptions) &&
                    subServiceOptions.map((sub) => (
                      <option key={sub.subServiceId} value={sub.subServiceId}>
                        {sub.subServiceName}
                      </option>
                    ))}
                </CFormSelect> */}
                <Select
                  isMulti
                  name="subServiceName"
                  placeholder="Select Sub Services"
                  options={(subServiceOptions || []).map((sub) => ({
                    label: sub.subServiceName, // ✅ correct label
                    value: sub.subServiceId, // ✅ correct value
                  }))}
                  value={(subServiceOptions || [])
                    .filter((opt) => selectedSubService.includes(opt.subServiceId))
                    .map((opt) => ({
                      label: opt.subServiceName,
                      value: opt.subServiceId,
                    }))}
                  onChange={(selected) => {
                    const ids = selected.map((opt) => opt.value)
                    setSelectedSubService(ids)

                    if (selected.length > 0) {
                      setErrors((prev) => ({ ...prev, subServiceName: '' }))
                    }

                    // ✅ check if selected sub-services exist in ProcedureManagement
                    const incomplete = ids.some(
                      (id) =>
                        !procedureForms.some((form) => String(form.subServiceid) === String(id)),
                    )
                    setMissingSubService(incomplete)

                    // ✅ also check details like price/finalCost
                    checkSubServiceDetails(ids)
                  }}
                />

                {!isSubServiceComplete && (
                  <div className="text-danger mt-2">
                    Some selected Procedures are missing details like price or final cost.
                    <br />
                    <a href="/procedure-Management" className="text-primary">
                      Please add Procedure details
                    </a>
                  </div>
                )}
                {errors.subServiceName && (
                  <CFormText className="text-danger">{errors.subServiceName}</CFormText>
                )}
              </CCol>
            </CRow>
            {/* ... (rest of your Q&A form section) ... */}
            <CCol md={12}>
              <h6 className="mb-2">Question</h6>
              <CFormInput
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <h6 className="mt-3 mb-2">Answers</h6>
              <CInputGroup className="mb-2">
                <CFormInput
                  placeholder="Enter answer"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                />
                <CButton
                  onClick={addAnswer}
                  style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                >
                  <FaPlus />
                </CButton>
              </CInputGroup>
              {answers.length > 0 && (
                <CListGroup className="mb-3">
                  {answers.map((ans, idx) => (
                    <CListGroupItem
                      key={idx}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {ans}
                      <div>
                        <FaEdit
                          onClick={() => {
                            setAnswerInput(ans)
                            setEditingAnswerIndex(idx) // track which answer is being edited
                          }}
                          style={{
                            cursor: 'pointer',
                            color: 'var(--color-black)',
                            marginRight: '10px',
                          }}
                        />

                        <FaTrash
                          onClick={() => removeAnswer(ans)}
                          style={{ cursor: 'pointer', color: 'var(--color-black)' }}
                        />
                      </div>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}

              {answerInput.trim() !== '' && (
                <div className="text-warning mb-2">
                  Tip: Click the <FaPlus style={{ verticalAlign: 'middle' }} /> button to add your
                  answer before saving the Q&A.
                </div>
              )}
              <CButton
                color="info"
                className="me-2  "
                onClick={saveCurrentQA}
                style={{
                  backgroundColor: 'var(--color-bgcolor)',
                  color: 'var(--color-black)',
                  border: 'none',
                }}
              >
                Add Question
              </CButton>
            </CCol>
            {qaList.length > 0 && (
              <div className="mt-3">
                <h6>Questions Added</h6>
                {qaList.map((qa, idx) => (
                  <div key={idx} className="mb-2">
                    <strong>{qa.question}</strong>
                    <ul>
                      {qa.answers.map((ans, k) => (
                        <li key={k}>{ans}</li>
                      ))}
                    </ul>
                    <div>
                      <FaEdit
                        onClick={() => editQuestion(idx)}
                        style={{
                          cursor: 'pointer',
                          color: 'var(--color-black)',
                          marginRight: '10px',
                        }}
                      />
                      <FaTrash
                        onClick={() => removeQA(idx)}
                        style={{ cursor: 'pointer', color: 'var(--color-black)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <CButton color="secondary" className="me-2" onClick={() => setShowForm(false)}>
                Cancel
              </CButton>
              <CButton
                style={{
                  backgroundColor: 'var(--color-bgcolor)',
                  color: 'var(--color-black)',
                  border: 'none',
                }}
                onClick={saveProcedureForm}
                disabled={saveloading} // disable button while saving/updating
              >
                {saveloading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2 text-dark"
                      role="status"
                    />
                    {editIndex !== null ? 'Updating...' : 'Saving...'}
                  </>
                ) : editIndex !== null ? (
                  'Update Procedure Form'
                ) : (
                  'Save Procedure Form'
                )}
              </CButton>
            </div>
          </CForm>
        )}
        {procedureForms.length > 0 && (
          <>
            <h6>Saved Procedure Forms</h6>
            <CAccordion>
              {currentForms.map((form, i) => (
                <>
                  <CAccordionItem key={i} itemKey={i}>
                    <CAccordionHeader className="d-flex justify-content-between align-items-center w-100  ">
                      {/* Procedure Name */}
                      <span className="flex-grow-1">
                        {capitalizeWords(form.subServiceName) || 'Unnamed Procedure'}
                      </span>

                      {/* Edit / Delete Buttons */}
                      <div className="d-flex gap-3 ms-3 mx-3">
                        <FaEdit
                          onClick={() => editProcedureForm(i)}
                          style={{ color: 'var(--color-black)', cursor: 'pointer' }}
                        />
                        <FaTrash
                          onClick={() => {
                            setDeleteIndex(i) // store which form to delete
                            setIsModalVisible(true) // open confirmation modal
                            setProcedureName(form.subServiceName)
                          }}
                          style={{ color: 'var(--color-black)', cursor: 'pointer' }}
                        />
                      </div>
                    </CAccordionHeader>

                    <CAccordionBody>
                      {Array.isArray(form.consentFormQuestions) &&
                        form.consentFormQuestions.map((section, j) => (
                          <div key={j}>
                            <h6>{capitalizeWords(section.heading)}</h6>
                            {Array.isArray(section.questionsAndAnswers) &&
                              section.questionsAndAnswers.map((qa, k) => (
                                <div key={k} className="d-flex align-items-center mb-2">
                                  <input
                                    type="checkbox"
                                    checked={qa.answer === undefined ? true : Boolean(qa.answer)}
                                    className="me-2"
                                    disabled // ✅ now they cannot be changed directly
                                  />

                                  <span>{capitalizeWords(qa.question)}</span>
                                </div>
                              ))}
                          </div>
                        ))}

                      {/* <div className="d-flex gap-3 mt-2">
                        <FaEdit
                          onClick={() => editProcedureForm(i)}
                          style={{ color: 'var(--color-black)', cursor: 'pointer' }}
                        />

                        <FaTrash
                          onClick={() => {
                            setDeleteIndex(i) // store which form to delete
                            setIsModalVisible(true) // open confirmation modal
                            setProcedureName(form.subServiceName)
                          }}
                          style={{ color: 'var(--color-black)', cursor: 'pointer' }}
                        />
                      </div> */}
                    </CAccordionBody>
                  </CAccordionItem>
                </>
              ))}
            </CAccordion>
          </>
        )}
      </CCardBody>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Procedure Consent"
        message={`Are you sure you want to delete this "${procedureName}" ? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        isLoading={delloading}
        onConfirm={() => {
          if (deleteIndex !== null) {
            removeProcedureForm(deleteIndex) // delete only after confirm
            setDeleteIndex(null) // reset
          }
          setIsModalVisible(false) // close modal
        }} // ✅ pass id here
        onCancel={() => {
          setDeleteIndex(null) // reset
          setIsModalVisible(false) // close modal
        }} // ✅ just close modal
      />
      <div className="mb-3 mx-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={rowsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setRowsPerPage}
        />
      </div>
    </CCard>
  )
}

export default ProcedureConsentForm
