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
} from "@coreui/react";
import axios from "axios";
import { getQuestionsByKey } from "../EmployeeManagement/Therapist/therapistApi";

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
 
const [questionsByPart, setQuestionsByPart] = useState({});
  const handleChange = (key, value) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
useEffect(() => {
  if (partId) {
    fetchQuestions();
  }
}, [partId]);

const fetchQuestions = async () => {
  if (!partId || partId.length === 0) return;
  try {

    const parts = Array.isArray(partId)
      ? partId
      : [partId];

    const res = await getQuestionsByKey(parts);

if (res?.data) {

  setQuestionsByPart(
    res.data   // ✅ correct
  );

}

  } catch (err) {
    console.log(err);
  }
};

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
        answer: answers[key] || "",
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

              {questions.length === 0 && (
                <p>No questions</p>
              )}

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