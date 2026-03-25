// components/AddSlotModal.js
import React, { useState } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
} from '@coreui/react';
import axios from 'axios';
import { http } from '../../Utils/Interceptors';

const AddSlotModal = ({ visible, setVisible, selectedDate, refreshSlots }) => {
  const [timeInput, setTimeInput] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);

  const addTimeSlot = () => {
    if (timeInput && !timeSlots.includes(timeInput)) {
      setTimeSlots([...timeSlots, timeInput]);
      setTimeInput('');
    }
  };

  const removeSlot = (time) => {
    setTimeSlots(timeSlots.filter((slot) => slot !== time));
  };

  const handleSave = async () => {
    try {
      const response = await http.post('https://your-api-endpoint.com/addSlots', {
        date: selectedDate,
        slots: timeSlots,
      });
      if (response.status === 200) {
        refreshSlots(); // Refetch updated slot list
        setTimeSlots([]);
        setVisible(false);
      }
    } catch (error) {
      console.error('Failed to add slots:', error);
    }
  };

  return (
    <CModal visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader onClose={() => setVisible(false)}>
        <CModalTitle>Add Slots</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <label>Select Date</label>
          <CFormInput type="text" value={selectedDate} disabled />
        </div>

        <label>Add Time & Slot</label>
        <div className="d-flex mb-3">
          <CFormInput
            placeholder="Enter Time (e.g. 09:00 AM)"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
          />
          <CButton color="primary" onClick={addTimeSlot} className="ms-2">+</CButton>
        </div>

        <div className="slot-list">
          {timeSlots.map((slot, idx) => (
            <div key={idx} className="d-flex align-items-center justify-content-between border p-2 rounded mb-1">
              <span>{slot}</span>
              <CButton color="danger" size="sm" onClick={() => removeSlot(slot)}>🗑</CButton>
            </div>
          ))}
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="danger" onClick={() => setVisible(false)}>Cancel</CButton>
        <CButton color="success" onClick={handleSave}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AddSlotModal;
