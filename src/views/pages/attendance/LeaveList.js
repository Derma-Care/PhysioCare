import React, { useState } from "react";
import {
  getData,
  saveData,
  LEAVE_KEY,
} from "./storage";

export default function LeaveList() {

  const [list, setList] = useState(
    getData(LEAVE_KEY, [])
  );

  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    name: "Prashanth", // auto fetch
    from: "",
    to: "",
    reason: "",
  });

  const saveLeave = () => {

    const newList = [
      ...list,
      {
        id: Date.now(),
        ...form,
        status: "Pending",
      },
    ];

    saveData(LEAVE_KEY, newList);

    setList(newList);

    setShow(false);

    setForm({
      name: "Prashanth",
      from: "",
      to: "",
      reason: "",
    });
  };

  return (

    <div>

      <div className="d-flex justify-content-between">

        <h4>Leave List</h4>

        <button
          className="btn btn-primary"
          onClick={() => setShow(true)}
        >
          Add Leave Request
        </button>

      </div>


      {/* table */}

      <table className="table mt-3 pink-table">

        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {list.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.name}</td>
              <td>{l.from}</td>
              <td>{l.to}</td>
              <td>{l.reason}</td>
              <td>{l.status}</td>
            </tr>
          ))}

        </tbody>

      </table>



      {/* MODAL */}

      {show && (

        <div className="modal d-block">

          <div className="modal-dialog">

            <div className="modal-content">

              <div className="modal-header">
                <h5>Add Leave</h5>

                <button
                  className="btn-close"
                  onClick={() => setShow(false)}
                />

              </div>

              <div className="modal-body">


                <input
                  className="form-control"
                  value={form.name}
                  disabled
                />


                <input
                  type="date"
                  className="form-control mt-2"
                  value={form.from}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      from: e.target.value,
                    })
                  }
                />


                <input
                  type="date"
                  className="form-control mt-2"
                  value={form.to}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      to: e.target.value,
                    })
                  }
                />


                <input
                  className="form-control mt-2"
                  placeholder="Reason"
                  value={form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reason: e.target.value,
                    })
                  }
                />


              </div>


              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={saveLeave}
                >
                  Save
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}