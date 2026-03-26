import React, { useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
} from "@coreui/react";

import { questionsByPart } from "./questions";

export default function QuestionModal({
  visible,
  partId,
  onClose,
  onSave,
}) {
  const questions = questionsByPart[partId] || [];

  const [answers, setAnswers] = useState({});

  const handleChange = (q, value) => {
    setAnswers({
      ...answers,
      [q]: value,
    });
  };

  const handleSave = () => {
    onSave({
      partId,
      answers,
    });
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      
      <CModalHeader>
        <CModalTitle>
          Assessment - {partId}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>

        {questions.map((q, i) => (
          <div key={i} className="mb-3">

            <label>{q}</label>

            <CFormInput
              type="text"
              onChange={(e) =>
                handleChange(q, e.target.value)
              }
            />

          </div>
        ))}

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