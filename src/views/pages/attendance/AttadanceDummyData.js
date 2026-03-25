export const empDummy = [
  { id: 1, name: "Ramesh", role: "Nurse", clinic: "0001", shift: "Morning", status: "Present" },
  { id: 2, name: "Ravi", role: "Doctor", clinic: "0001", shift: "Morning", status: "Present" },
  { id: 3, name: "Sita", role: "Reception", clinic: "0001", shift: "Evening", status: "Present" },
  { id: 4, name: "Kiran", role: "Lab", clinic: "0001", shift: "Morning", status: "Present" },
  { id: 5, name: "Raju", role: "Security", clinic: "0001", shift: "Night", status: "Absent" },
  { id: 6, name: "Anu", role: "Pharmacy", clinic: "0001", shift: "Morning", status: "Late" },
  { id: 7, name: "John", role: "Nurse", clinic: "0001", shift: "Evening", status: "Present" },
  { id: 8, name: "Meena", role: "Reception", clinic: "0001", shift: "Morning", status: "Present" },
  { id: 9, name: "Rahul", role: "Doctor", clinic: "0001", shift: "Evening", status: "Present" },
  { id: 10, name: "Priya", role: "Lab", clinic: "0001", shift: "Morning", status: "Present" }
];

export const shiftDummy = [
  { id: 1, name: "Morning", start: "09:00", end: "14:00" },
  { id: 2, name: "Evening", start: "14:00", end: "20:00" },
  { id: 3, name: "Night", start: "20:00", end: "09:00" },
  { id: 4, name: "General", start: "10:00", end: "18:00" },
  { id: 5, name: "Half", start: "09:00", end: "12:00" },
  { id: 6, name: "OPD", start: "11:00", end: "17:00" },
  { id: 7, name: "Ward", start: "08:00", end: "16:00" },
  { id: 8, name: "ICU", start: "07:00", end: "15:00" },
  { id: 9, name: "Lab", start: "09:30", end: "18:30" },
  { id: 10, name: "Custom", start: "12:00", end: "21:00" }
];

export const holidayDummy = [
  { id: 1, date: "2026-01-26", name: "Republic" },
  { id: 2, date: "2026-08-15", name: "Independence" },
  { id: 3, date: "2026-03-29", name: "Ugadi" },
  { id: 4, date: "2026-04-10", name: "Ramzan" },
  { id: 5, date: "2026-05-01", name: "Labour" },
  { id: 6, date: "2026-08-19", name: "Raksha" },
  { id: 7, date: "2026-10-02", name: "Gandhi" },
  { id: 8, date: "2026-10-24", name: "Diwali" },
  { id: 9, date: "2026-12-25", name: "Christmas" },
  { id: 10, date: "2026-01-01", name: "New Year" }
];

 

export const attendanceDummy = [

  {
    id: 1,
    name: "Ramesh",
    date: "2026-03-01",
    in: "09:00",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 2,
    name: "Ramesh",
    date: "2026-03-02",
    in: "09:20",
    out: "18:00",
    status: "Late",
    reason: "Traffic"
  },

  {
    id: 3,
    name: "Ramesh",
    date: "2026-03-03",
    in: "-",
    out: "-",
    status: "Leave",
    reason: "Fever"
  },

  {
    id: 4,
    name: "Ramesh",
    date: "2026-03-04",
    in: "09:00",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 5,
    name: "Ramesh",
    date: "2026-03-05",
    in: "-",
    out: "-",
    status: "Absent",
    reason: "Not informed"
  },

  {
    id: 6,
    name: "Ramesh",
    date: "2026-03-06",
    in: "09:05",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 7,
    name: "Ramesh",
    date: "2026-03-07",
    in: "09:15",
    out: "18:00",
    status: "Late",
    reason: "Bus delay"
  },

  {
    id: 8,
    name: "Ramesh",
    date: "2026-03-08",
    in: "09:00",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 9,
    name: "Ramesh",
    date: "2026-03-09",
    in: "-",
    out: "-",
    status: "Leave",
    reason: "Personal work"
  },

  {
    id: 10,
    name: "Ramesh",
    date: "2026-03-10",
    in: "09:00",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 11,
    name: "Ramesh",
    date: "2026-03-11",
    in: "09:25",
    out: "18:00",
    status: "Late",
    reason: "Traffic"
  },

  {
    id: 12,
    name: "Ramesh",
    date: "2026-03-12",
    in: "09:00",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 13,
    name: "Ramesh",
    date: "2026-03-13",
    in: "-",
    out: "-",
    status: "Absent",
    reason: "No call"
  },

  {
    id: 14,
    name: "Ramesh",
    date: "2026-03-14",
    in: "09:00",
    out: "18:00",
    status: "Present",
    reason: ""
  },

  {
    id: 15,
    name: "Ramesh",
    date: "2026-03-15",
    in: "09:10",
    out: "18:00",
    status: "Late",
    reason: "Rain"
  },

];

export const shift_daily = [
  {
    empId: 1,
    name: "Ramesh",
    shift: "Morning",
    startDate: "2026-03-01"
  }
]

