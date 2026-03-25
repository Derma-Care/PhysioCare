import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CForm,
  CCol,
  CFormInput,
  CInputGroup,
  CButton,
  CListGroup,
  CListGroupItem,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa'
import {
  AddConsentFormData,
  GetGenericFormData,
  updateConsentData,
  deleteConsentData,
} from './ConsentFormsAPI'
import { toast } from 'react-toastify'
import capitalizeWords from '../../Utils/capitalizeWords'
import ConfirmationModal from '../../components/ConfirmationModal'
import { showCustomToast } from '../../Utils/Toaster'

const GenericConsentForm = () => {
  const [showForm, setShowForm] = useState(false)
  const [procedureForms, setProcedureForms] = useState([])
  const [qaList, setQaList] = useState([])
  const [question, setQuestion] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [answers, setAnswers] = useState([])
  const [editingAnswerIndex, setEditingAnswerIndex] = useState(null)
  const [editIndex, setEditIndex] = useState(null)
  const [errors, setErrors] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [procedureName, setProcedureName] = useState(null)
  // Add a new state to track if a form is being added
  const [isAdding, setIsAdding] = useState(false)
  const [saveloading, setSaveLoading] = useState(false)
  const [delloading, setDelLoading] = useState(false)

  const hospitalId = localStorage.getItem('HospitalId')
  const consentFormType = '1'

  // Fetch saved generic forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await GetGenericFormData(hospitalId, consentFormType)
        console.log('✅ Forms from API:', res.data) // log to check

        if (res?.data) {
          // Ensure procedureForms is always an array
          const normalized = Array.isArray(res.data) ? res.data : [res.data]

          // Ensure consentFormQuestions exists
          const formatted = normalized.map((f) => ({
            ...f,
            consentFormQuestions: f.consentFormQuestions || [],
          }))

          setProcedureForms(formatted)
        }
      } catch (e) {
        console.error('Error fetching saved forms', e)
      }
    }

    fetchForms()
  }, [hospitalId, consentFormType])

  // Add single answer
  const addAnswer = () => {
    if (answerInput.trim()) {
      if (editingAnswerIndex !== null) {
        const updatedAnswers = [...answers]
        updatedAnswers[editingAnswerIndex] = answerInput.trim()
        setAnswers(updatedAnswers)
        setEditingAnswerIndex(null)
      } else if (!answers.includes(answerInput.trim())) {
        setAnswers([...answers, answerInput.trim()])
      }
      setAnswerInput('')
    }
  }

  const removeAnswer = (ans) => {
    setAnswers(answers.filter((a) => a !== ans))
  }

  const saveCurrentQA = () => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || answers.length === 0) {
      // Only show toast if user actually clicked without proper input
      if (trimmedQuestion === '' && answers.length === 0) return
      showCustomToast('Please add a question and at least one answer.', 'error')
      return
    }

    // Prevent duplicate question
    if (qaList.some((qa) => qa.question === trimmedQuestion)) {
      showCustomToast('This question already exists.', 'error')
      return
    }

    setQaList([...qaList, { question: trimmedQuestion, answers: [...answers] }])
    setQuestion('')
    setAnswers([])
  }
  const removeQA = (index) => {
    setQaList(qaList.filter((_, i) => i !== index))
  }

  // Save form
  const saveProcedureForm = async () => {
    const newErrors = {}
    if (qaList.length === 0) newErrors.qaList = 'At least one question is required.'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    const formattedForm = {
      consentFormQuestions: qaList.map((qa) => ({
        heading: qa.question,
        questionsAndAnswers: qa.answers.map((ans) => ({ question: ans, answer: true })),
      })),
    }

    try {
      setSaveLoading(true)
      if (editIndex !== null) {
        await updateConsentData(formattedForm, hospitalId, consentFormType)
      } else {
        await AddConsentFormData(formattedForm, hospitalId, consentFormType)
      }

      const res = await GetGenericFormData(hospitalId, consentFormType)
      if (res?.data) setProcedureForms(Array.isArray(res.data) ? res.data : [res.data])

      setQaList([])
      setShowForm(false)
      setEditIndex(null)
      setIsAdding(false) // ✅ enable button again
    } catch (error) {
      console.error('Error saving Generic Form:', error)
    } finally {
      setSaveLoading(false)
    }
  }

  const editProcedureForm = (index) => {
    const form = procedureForms[index]
    if (!form) {
      showCustomToast('Selected form not found', 'error')
      return
    }

    const qaListFormatted = (form.consentFormQuestions || []).map((section) => ({
      question: section.heading,
      answers: (section.questionsAndAnswers || []).map((qa) => qa.question),
    }))
    setQaList(qaListFormatted)
    setEditIndex(index)
    setShowForm(true)
    setErrors({})
  }

  const removeProcedureForm = async (index) => {
    const form = procedureForms[index]
    const formId = form?.id || form?.consentFormId || form?.formId
    if (!formId) {
      showCustomToast('This form cannot be deleted.', 'error')
      return
    }
    try {
      setDelLoading(true)
      await deleteConsentData(formId)
      setProcedureForms(procedureForms.filter((_, i) => i !== index))
      setIsAdding(false) // ✅ enable adding after delete
    } catch (error) {
      console.error('Error deleting Generic Form:', error)
      // showCustomToast('Failed to delete form.', 'error')
    } finally {
      setDelLoading(false)
    }
  }

  const editAnswer = (qaIndex, ansIndex) => {
    const ansToEdit = qaList[qaIndex].answers[ansIndex]
    setAnswerInput(ansToEdit)
    const updatedQAList = [...qaList]
    updatedQAList[qaIndex].answers.splice(ansIndex, 1)
    setQaList(updatedQAList)
  }

  const editQuestion = (qaIndex) => {
    const qaToEdit = qaList[qaIndex]
    setQuestion(qaToEdit.question)
    setAnswers(qaToEdit.answers)
    setQaList(qaList.filter((_, i) => i !== qaIndex))
  }

  return (
    <CCard className="mt-3">
      <CCardBody>
        {!showForm && (
          <div className="w-100 d-flex justify-content-end">
            <CButton
              style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
              onClick={() => {
                setShowForm(true)
                setQaList([])
                setEditIndex(null)
                setIsAdding(true)
              }}
              disabled={isAdding || procedureForms.length > 0} // ✅ disable if form exists
            >
              + Add Generic Form
            </CButton>
          </div>
        )}

        {showForm && (
          <CForm className="mb-4">
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
                            setEditingAnswerIndex(idx)
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
                className="me-2"
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
                disabled={saveloading} // disable when saving/updating
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
                  'Update Generic Form'
                ) : (
                  'Save Generic Form'
                )}
              </CButton>
            </div>
          </CForm>
        )}

        {procedureForms.length > 0 && (
          <>
            <h6>Saved Generic Forms</h6>
            <CAccordion>
              {procedureForms.map((form, i) => (
                <CAccordionItem key={i} itemKey={i}>
                  <CAccordionHeader style={{ color: 'var(--color-black)' }}>
                    <span className="flex-grow-1">Generic Consent Form</span>

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
                                  className="me-2"
                                  disabled
                                  // ✅ default to true if answer is undefined
                                  checked={qa.answer === undefined ? true : Boolean(qa.answer)}
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
                          setDeleteIndex(i)
                          setIsModalVisible(true)
                          setProcedureName(form.subServiceName)
                        }}
                        style={{ color: 'var(--color-black)', cursor: 'pointer' }}
                      />
                    </div> */}
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>
          </>
        )}
      </CCardBody>

      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete ProcedureConsentForm"
        message={`Are you sure you want to delete this Generic Consent Form ? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={delloading}
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => {
          if (deleteIndex !== null) {
            removeProcedureForm(deleteIndex)
            setDeleteIndex(null)
          }
          setIsModalVisible(false)
        }}
        onCancel={() => {
          setDeleteIndex(null)
          setIsModalVisible(false)
        }}
      />
    </CCard>
  )
}

export default GenericConsentForm
