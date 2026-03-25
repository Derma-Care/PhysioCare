import React, { useState } from "react";

import {
  CPopover,
  CButton,
} from "@coreui/react";

import {
  attendanceDummy,
  empDummy,
} from "./AttadanceDummyData";

export default function MonthlyReport() {

  const [month, setMonth] =
    useState("2026-03");

  const getData = (
    name,
    status
  ) => {

    return attendanceDummy.filter(
      (a) =>
        a.name === name &&
        a.status === status &&
        a.date.startsWith(
          month
        )
    );

  };

  const getCount = (
    name,
    status
  ) => {

    return getData(
      name,
      status
    ).length;

  };

  return (

    <div className="container mt-4">

      <h3>Monthly Report</h3>

      <input
        type="month"
        className="form-control mb-3"
        value={month}
        onChange={(e) =>
          setMonth(
            e.target.value
          )
        }
      />

      <table className="table table-bordered">

        <thead>
          <tr>
            <th>Name</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
            <th>Leave</th>
          </tr>
        </thead>

        <tbody>

          {empDummy.map(
            (e) => (

              <tr key={e.id}>

                <td>{e.name}</td>

                <td>
                  {getCount(
                    e.name,
                    "Present"
                  )}
                </td>


{/* ABSENT */}

<td>

<CPopover
  trigger="hover"
  placement="top"
  content={
    <table className="table table-sm">

      <thead>
        <tr>
          <th>Date</th>
          <th>Reason</th>
        </tr>
      </thead>

      <tbody>

        {getData(
          e.name,
          "Absent"
        ).map(
          (d, i) => (

            <tr key={i}>
              <td>{d.date}</td>
              <td>{d.reason}</td>
            </tr>

          )
        )}

      </tbody>

    </table>
  }
>

<CButton
  size="sm"
  color="danger"
  variant="outline"
>
  {getCount(
    e.name,
    "Absent"
  )}
</CButton>

</CPopover>

</td>


{/* LATE */}

<td>

<CPopover
  trigger="hover"
  placement="top"
  content={
    <table className="table table-sm">

      <thead>
        <tr>
          <th>Date</th>
          <th>In</th>
          <th>Out</th>
          <th>Reason</th>
        </tr>
      </thead>

      <tbody>

        {getData(
          e.name,
          "Late"
        ).map(
          (d, i) => (

            <tr key={i}>
              <td>{d.date}</td>
              <td>{d.in}</td>
              <td>{d.out}</td>
              <td>{d.reason}</td>
            </tr>

          )
        )}

      </tbody>

    </table>
  }
>

<CButton
  size="sm"
  color="warning"
  variant="outline"
>
  {getCount(
    e.name,
    "Late"
  )}
</CButton>

</CPopover>

</td>

{/* LEAVE */}

<td>

<CPopover
  trigger="hover"
  placement="top"
  content={
    <table className="table table-sm">

      <thead>
        <tr>
          <th>Date</th>
          <th>Reason</th>
        </tr>
      </thead>

      <tbody>

        {getData(
          e.name,
          "Leave"
        ).map(
          (d, i) => (

            <tr key={i}>
              <td>{d.date}</td>
              <td>{d.reason}</td>
            </tr>

          )
        )}

      </tbody>

    </table>
  }
>

<CButton
  size="sm"
  color="info"
  variant="outline"
>
  {getCount(
    e.name,
    "Leave"
  )}
</CButton>

</CPopover>

</td>


              </tr>

            )
          )}

        </tbody>

      </table>

    </div>
  );
}