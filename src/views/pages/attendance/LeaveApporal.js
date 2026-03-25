import React, { useState } from "react";
import {
  getData,
  saveData,
  LEAVE_KEY,
} from "./storage";

export default function LeaveApproval() {

  const [list, setList] = useState(
    getData(LEAVE_KEY, [])
  );

  const changeStatus = (id, value) => {

    let reason = "";

    // ask reason if rejected
    if (value === "Rejected") {
      reason = prompt("Enter reject reason");
      if (!reason) return;
    }

    const newList = list.map((l) => {

      if (l.id === id) {

        return {
          ...l,
          status: value,
          rejectReason:
            value === "Rejected"
              ? reason
              : "",
        };

      }

      return l;
    });

    setList(newList);

    saveData(LEAVE_KEY, newList);
  };

  return (

    <div>

      <h4>Leave Approval</h4>

      <table className="table pink-table">

        <thead>

          <tr>
            <th>Name</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Reject Reason</th>
          </tr>

        </thead>

        <tbody>

          {list.map((l) => (

            <tr key={l.id}>

              <td>{l.name}</td>

              <td>{l.from}</td>

              <td>{l.to}</td>

              <td>{l.reason}</td>

              <td>

                <select
                  value={l.status}
                  onChange={(e) =>
                    changeStatus(
                      l.id,
                      e.target.value
                    )
                  }
                >

                  <option>
                    Pending
                  </option>

                  <option>
                    Approved
                  </option>

                  <option>
                    Rejected
                  </option>

                </select>

              </td>

              <td>

                {l.rejectReason}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}