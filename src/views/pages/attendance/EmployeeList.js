import React, { useState } from 'react'
import { getData, EMP_KEY } from './storage'
import { empDummy } from './AttadanceDummyData'
import { useNavigate } from 'react-router-dom'

export default function EmployeeList() {
  const navigate = useNavigate()

 
    const [list, setList] = useState(
    getData(EMP_KEY, empDummy)
  );

  const shifts = [
    "Morning",
    "Evening",
    "Night",
    "Off",
  ];

  const updateShift = (
    id,
    shift
  ) => {

    const newList =
      list.map((e) =>
        e.id === id
          ? {
              ...e,
              shift,
            }
          : e
      );

    setList(newList);

    saveData(
      EMP_KEY,
      newList
    );
  };

  return (
    <div>
      <h4>Employee List</h4>

      <table className="table table-bordered pink-table" >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Clinic</th>
            <th>Shift</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.name}</td>
              <td>{e.role}</td>
              <td>{e.clinic}</td>
              <td>

                <select
                  className="form-select"
                  value={
                    e.shift || ""
                  }
                  onChange={(ev) =>
                    updateShift(
                      e.id,
                      ev.target.value
                    )
                  }
                >

                  <option value="">
                    Select
                  </option>

                  {shifts.map(
                    (s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    )
                  )}

                </select>

              </td>
              <td>{e.status}</td>

              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/attendance/attendance-list', { state: e })}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
