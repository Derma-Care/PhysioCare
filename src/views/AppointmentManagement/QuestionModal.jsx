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
import { COLORS } from "../../Constant/Themes";



// import { questionsByPart } from "./questions";

export default function QuestionModal({
  visible,
  partId,
  onClose,
  onSave,
  initialAnswers = {}
}) {

  const partIds = Array.isArray(partId) ? partId : [partId];

  const [answers, setAnswers] = useState({});
  
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      const flatAnswers = {};
      Object.keys(initialAnswers).forEach(part => {
        const arr = initialAnswers[part];
        if (Array.isArray(arr)) {
          arr.forEach(q => {
            // For multi-select, answer might be a string separated by commas.
            // But state expects an array for multi-select. We handle that in mapping if needed,
            // or just split it. Actually the value in Select checkbox is checked with `.includes(opt)`,
            // so if it's a string from backend, we should convert it to an array.
            flatAnswers[`${part}_${q.questionId}`] = q.answer && q.answer.includes(',') ? q.answer.split(', ').map(s=>s.trim()) : q.answer;
          });
        }
      });
      setAnswers(flatAnswers);
    }
  }, [initialAnswers]);

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
      let existing = prev[key];
      if (!existing) existing = [];
      else if (!Array.isArray(existing)) {
        existing = existing.split(',').map(s => s.trim()).filter(Boolean);
      }

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
    <>
      <style>
        {

          `
        .form-check-input:checked {
          background-color: ${COLORS.primary};
          border-color: ${COLORS.primary};
        }
        `
        }

      </style >

      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static" className="custom-modal">

        <CModalHeader>
          <CModalTitle style={{ color: COLORS.primary }}>
            Assessment - {partIds.join(", ")}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>

          {partIds.map((part) => {

            const questions = questionsByPart[part] || [];

            return (
              <div key={part} style={{ marginBottom: 20, color: COLORS.primary }}>

                <h5>{part.toUpperCase()}</h5>

                {loadingQuestions ? (
                  <div style={{ color: COLORS.primary }}><CSpinner size="sm" /> Loading questions...</div>   // 🔄 loading state
                ) : questions.length === 0 ? (
                  <div style={{ color: COLORS.primary }}>No questions</div>          // ❌ only if truly empty
                ) : null}

                {questions.map((q) => {

                  const key = part + "_" + q.questionId;

                  return (
                    <div key={q.questionId} className="mb-3">

                      <label style={{ color: COLORS.primary }}>
                        {q.question}
                      </label>

                      {/* YES / NO */}
                      {q.type === "YES/NO" && (
                        <div>
                          <CFormCheck
                            type="radio"
                            name={key}
                            label="Yes"
                            value="YES"
                            checked={answers[key] === "YES"}
                            onChange={(e) => handleChange(key, e.target.value)}
                            style={{ color: COLORS.primary }}
                          />

                          <CFormCheck
                            type="radio"
                            name={key}
                            label="No"
                            value="NO"
                            checked={answers[key] === "NO"}
                            onChange={(e) => handleChange(key, e.target.value)}
                            style={{ color: COLORS.primary }}
                          />
                        </div>
                      )}

                      {/* TEXT */}
                      {q.type === "TEXT" && (
                        <CFormInput
                          type="text"
                          value={answers[key] !== undefined && answers[key] !== null ? answers[key] : ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          style={{
                            color: COLORS.primary,
                            borderColor: COLORS.primary
                          }}
                        />
                      )}

                      {/* NUMBER */}
                      {q.type === "NUMBER" && (
                        <CFormInput
                          type="number"
                          value={answers[key] !== undefined && answers[key] !== null ? answers[key] : ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          style={{
                            color: COLORS.primary,
                            borderColor: COLORS.primary
                          }}
                        />
                      )}

                      {/* SELECT (Checkbox) */}
                      {q.type === "SELECT" && (
                        <div>
                          {q.options?.map((opt, index) => (
                            <CFormCheck
                              key={index}
                              type="checkbox"
                              label={opt}
                              value={opt}
                              checked={Array.isArray(answers[key]) ? answers[key].includes(opt) : (answers[key] ? answers[key].split(',').map(s=>s.trim()).includes(opt) : false)}
                              onChange={() => handleMultiSelect(key, opt)}
                              style={{ color: COLORS.primary }}
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
    </>
  );
}