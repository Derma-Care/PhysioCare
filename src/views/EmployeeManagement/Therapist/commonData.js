export const therapistInfo = {
  name: 'Dr Kumar',
  specialization: 'Physiotherapist',
}

export const patients = [
  {
    patientId: 1,
    name: 'Ramesh',
    disease: 'Knee Pain',
    therapy: 'Physiotherapy',
    status: "New",
    planDays: 7,

    sessions: [
      {
        sessionId: 101,
        date: '2026-03-26',
        duration: 30,
        status: 'new',
        doctorNotes: 'Do knee bending exercise',
        therapistNotes: '',
        image: '',
        video: '',
      },
      {
        sessionId: 102,
        date: '2026-03-27',
        duration: 30,
        status: 'pending',
        doctorNotes: 'Continue therapy',
        therapistNotes: '',
        image: '',
        video: '',
      },
      {
        sessionId: 103,
        date: '2026-03-28',
        duration: 30,
        status: 'pending',
        doctorNotes: 'Add stretching',
        therapistNotes: '',
        image: '',
        video: '',
      },
    ],
  },

  {
    patientId: 2,
    name: 'Suresh',
    disease: 'Back Pain',
    therapy: 'Exercise Therapy',
     status:"Active",
    planDays: 7,

    sessions: [
      {
        sessionId: 201,
        date: '2026-03-26',
        duration: 45,
        status: 'pending',
        doctorNotes: 'Back exercise',
        therapistNotes: '',
        image: '',
        video: '',
      },
      {
        sessionId: 202,
        date: '2026-03-27',
        duration: 45,
        status: 'pending',
        doctorNotes: 'Continue',
        therapistNotes: '',
        image: '',
        video: '',
      },
    ],
  },

  {
    patientId: 3,
    name: 'Mahesh',
    disease: 'Shoulder Pain',
    therapy: 'Stretch Therapy',
    planDays: 7,
     status: "New",

    sessions: [
      {
        sessionId: 301,
        date: '2026-03-25',
        duration: 20,
        status: 'completed',
        doctorNotes: 'Shoulder rotation',
        therapistNotes: 'Improved',
        image: '',
        video: '',
      },
    ],
  },
]
