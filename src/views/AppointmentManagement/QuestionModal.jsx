/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormCheck,
  CSpinner,
} from "@coreui/react";
import axios from "axios";
import { getQuestionsByKey } from "../EmployeeManagement/Therapist/TheraphyApi";
 
 

// import { questionsByPart } from "./questions";

export default function QuestionModal({
  visible,
  partId,
  onClose,
  onSave,
}) {

  const partIds = Array.isArray(partId) ? partId : [partId];

  const [answers, setAnswers] = useState({});
  console.log(partIds)
 const [loadingQuestions, setLoadingQuestions] = useState(false)
const [questionsByPart, setQuestionsByPart] = useState({});
  const handleChange = (key, value) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };


const fetchQuestions = async () => {
  if (!partIds || partIds.length === 0) return;

  try {
    setLoadingQuestions(true)

    const res = await getQuestionsByKey(partIds)

    if (res?.data) {
      setQuestionsByPart(res.data)
    }
  } catch (err) {
    console.log(err)
  } finally {
    setLoadingQuestions(false)
  }
}

// const handleSave = () => {

//   const therapyQuestion = partIds.map((part) => {

//     const questions = questionsByPart[part] || [];

//     const ans = questions.map((q) => {

//       const key = part + "_" + q.questionId;

//       return {
//         questionId: q.questionId,
//         answer: answers[key] || "",
//       };

//     });

//     return {
//       bodyPart: part,
//       answers: ans,
//     };

//   });

//   onSave({
//     therapyQuestion,
//   });

// };
const handleSave = () => {

  const therapyQuestion = partIds.map((part) => {
    const questions = questionsByPart?.[part] || [];

    const ans = questions.map((q) => {
      const key = part + "_" + q.questionId;

      return {
        questionId: q.questionId,
    answer: Array.isArray(answers[key])
  ? answers[key].join(", ")
  : answers[key] || "",
      };
    });

    return {
      bodyPart: part,
      answers: ans,
    };
  });

  // ✅ convert to backend format
  const formattedAnswers = {};

  therapyQuestion.forEach((item) => {
    formattedAnswers[item.bodyPart] = item.answers;
  });

  // ✅ FINAL CORRECT STRUCTURE
  onSave({
    parts: partIds,               // ✅ FIX (was missing / empty)
    answerData: formattedAnswers, // ✅ NOT array
  });
};
useEffect(() => {
  if (partId) {
    setQuestionsByPart({})   // ✅ clear old data FIRST
    fetchQuestions()         // ✅ then fetch
  }
}, [partId])

const handleMultiSelect = (key, value) => {
  setAnswers((prev) => {
    const existing = prev[key] || [];

    if (existing.includes(value)) {
      // remove
      return {
        ...prev,
        [key]: existing.filter((v) => v !== value),
      };
    } else {
      // add
      return {
        ...prev,
        [key]: [...existing, value],
      };
    }
  });
};
  return (
    <CModal visible={visible} onClose={onClose} size="lg">

      <CModalHeader>
        <CModalTitle>
          Assessment - {partIds.join(", ")}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>

        {partIds.map((part) => {

          const questions = questionsByPart[part] || [];

          return (
            <div key={part} style={{ marginBottom: 20 }}>

              <h5>{part.toUpperCase()}</h5>

           {loadingQuestions ? (
  <p><CSpinner size="sm" />Loading questions...</p>   // 🔄 loading state
) : questions.length === 0 ? (
  <p>No questions</p>          // ❌ only if truly empty
) : null}

              {questions.map((q) => {

                const key = part + "_" + q.questionId;

                return (
                  <div key={q.questionId} className="mb-3">

                    <label>{q.question}</label>

                    {/* YES / NO */}
                    {q.type === "YES/NO" && (
  <>
    <CFormCheck
      type="radio"
      name={key}
      label="Yes"
      value="YES"
      checked={answers[key] === "YES"}
      onChange={(e) =>
        handleChange(key, e.target.value)
      }
    />

    <CFormCheck
      type="radio"
      name={key}
      label="No"
      value="NO"
      checked={answers[key] === "NO"}
      onChange={(e) =>
        handleChange(key, e.target.value)
      }
    />
  </>
)}

                    {/* TEXT */}
                    {q.type === "TEXT" && (
                      <CFormInput
                        type="text"
                        onChange={(e) =>
                          handleChange(key, e.target.value)
                        }
                      />
                    )}

                    {/* NUMBER */}
                    {q.type === "NUMBER" && (
                      <CFormInput
                        type="number"
                        onChange={(e) =>
                          handleChange(key, e.target.value)
                        }
                      />
                    )}
              {q.type === "SELECT" && (
  <div>
    {q.options?.map((opt, index) => (
      <CFormCheck
        key={index}
        type="checkbox"
        label={opt}
        value={opt}
        checked={answers[key]?.includes(opt)}
        onChange={() => handleMultiSelect(key, opt)}
      />
    ))}
  </div>
  
)}
                  </div>
                  
                );
                
              })}



            </div>
          );
        })}

      </CModalBody>

      <CModalFooter>

        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>

        <CButton color="primary" onClick={handleSave}>
          Save
        </CButton>

      </CModalFooter>

    </CModal>
  );
}