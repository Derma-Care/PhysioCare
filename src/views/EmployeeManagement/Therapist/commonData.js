export const therapistInfo = {
  name: 'Dr Kumar',
  specialization: 'Physiotherapist',
}

// export const patients = [
//   {
//     patientId: 1,
//     name: 'Ramesh',
//     disease: 'Knee Pain',
//     therapy: 'Physiotherapy',
//     status: "New",
//     planDays: 7,

//     sessions: [
//       {
//         sessionId: 101,
//         date: '2026-03-26',
//         duration: 30,
//         status: 'new',
//         doctorNotes: 'Do knee bending exercise',
//         therapistNotes: '',
//         image: '',
//         video: '',
//       },
//       {
//         sessionId: 102,
//         date: '2026-03-27',
//         duration: 30,
//         status: 'pending',
//         doctorNotes: 'Continue therapy',
//         therapistNotes: '',
//         image: '',
//         video: '',
//       },
//       {
//         sessionId: 103,
//         date: '2026-03-28',
//         duration: 30,
//         status: 'pending',
//         doctorNotes: 'Add stretching',
//         therapistNotes: '',
//         image: '',
//         video: '',
//       },
//     ],
//   },

//   {
//     patientId: 2,
//     name: 'Suresh',
//     disease: 'Back Pain',
//     therapy: 'Exercise Therapy',
//      status:"Active",
//     planDays: 7,

//     sessions: [
//       {
//         sessionId: 201,
//         date: '2026-03-26',
//         duration: 45,
//         status: 'pending',
//         doctorNotes: 'Back exercise',
//         therapistNotes: '',
//         image: '',
//         video: '',
//       },
//       {
//         sessionId: 202,
//         date: '2026-03-27',
//         duration: 45,
//         status: 'pending',
//         doctorNotes: 'Continue',
//         therapistNotes: '',
//         image: '',
//         video: '',
//       },
//     ],
//   },

//   {
//     patientId: 3,
//     name: 'Mahesh',
//     disease: 'Shoulder Pain',
//     therapy: 'Stretch Therapy',
//     planDays: 7,
//      status: "New",

//     sessions: [
//       {
//         sessionId: 301,
//         date: '2026-03-25',
//         duration: 20,
//         status: 'completed',
//         doctorNotes: 'Shoulder rotation',
//         therapistNotes: 'Improved',
//         image: '',
//         video: '',
//       },
//     ],
//   },
// ]
export const physiotherapyFullDummy = {
  // 👤 PATIENT INFO
  patientInfo: {
    patientId: "PAT12345",
    name: "Ravi Kumar",
    mobileNumber: "9876543210",
    age: 35,
    sex: "Male",
  },

  // 🩺 BASIC INFO FOR UI
  therapy: "Physiotherapy",
  disease: "Lumbar strain",
  duration: "2 weeks",

  // 📝 COMPLAINTS
  complaints: {
    complaintDetails: "Severe lower back pain while sitting and bending",
    painAssessmentImage: "https://t4.ftcdn.net/jpg/06/26/99/99/360_F_626999929_TBatnrNz7vlTrVso2RDohJLaF5ETfBYg.jpg",
    reportImages: [
      "https://via.placeholder.com/200",
      "https://via.placeholder.com/200",
    ],
    selectedTherapy: "Physiotherapy",

    theraphyAnswers: {
      face: [
        {
          questionId: 11,
          question: "Do you have facial pain?",
          answer: "Yes",
        },
        {
          questionId: 12,
          question: "Do you feel stiffness?",
          answer: "No",
        },
      ],
      hair: [
        {
          questionId: 13,
          question: "Any scalp discomfort?",
          answer: "Sometimes",
        },
      ],
    },
  },

  // 🔍 ASSESSMENT
  assessment: {
    chiefComplaint: "Lower back pain",
    painScale: "7/10",
    painType: "Sharp and intermittent",
    duration: "2 weeks",
    onset: "Sudden",
    aggravatingFactors: "Prolonged sitting, bending",
    relievingFactors: "Rest, hot pack",
    posture: "Forward head posture, slight lumbar lordosis",
    rangeOfMotion: "Restricted lumbar flexion",
    specialTests: "SLR positive at 60 degrees",
    observations: "Muscle tightness in lower back",
  },

  // 🧾 DIAGNOSIS
  diagnosis: {
    physioDiagnosis: "Lumbar strain",
    affectedArea: "Lower back (L4-L5 region)",
    severity: "Moderate",
    stage: "Subacute",
    notes: "No radiating pain observed",
  },

  // 💊 TREATMENT PLAN
  treatmentPlan: {
    doctorId: "DOC789",
    doctorName: "Dr. Suresh Reddy",
    theraphyId: "THER001",
    theraphyName: "Physiotherapy",
    modalities: ["IFT", "Ultrasound Therapy", "Hot Pack"],
    manualTherapy: "Soft tissue mobilization",
    sessionDuration: "30 min",
    frequency: "3 times/week",
    totalSessions: 12,
    precautions: "Avoid heavy lifting and sudden movements",
  },

  // 📅 SESSIONS (IMPORTANT FOR YOUR SCREEN)
  sessions: [
    {
      sessionId: 1,
      date: new Date().toISOString().split("T")[0],
      duration: "30 min",
      status: "Pending",
      completedTime: "10:30 AM",
      modalities: ["IFT", "Hot Pack"],
      exercises: "Pelvic tilt, knee to chest",
      patientResponse: "Pain reduced slightly",
      therapistNotes: "Patient tolerated session well",
    },
    {
      sessionId: 2,
      date: "2026-03-22",
      duration: "30 min",
      status: "Pending",
      completedTime: "11:00 AM",
      modalities: ["Ultrasound Therapy"],
      exercises: "Bridging exercise",
      patientResponse: "Improved flexibility",
      therapistNotes: "Continue progression",
    },
    {
      sessionId: 3,
      date: "2026-03-25",
      duration: "30 min",
      status: "Pending",
      completedTime: null,
      modalities: [],
      exercises: "",
      patientResponse: "",
      therapistNotes: "",
    },
  ],

  overallStatus: "Pending",

  // 🏋️ EXERCISE PLAN
  exercisePlan: {
    exercises: [
      {
        name: "Pelvic Tilt",
        sets: 3,
        reps: 10,
        duration: "10 mins",
        instructions: "Lie on back and tilt pelvis upward",
        videoUrl: "https://example.com/pelvic-tilt",
        thumbnail: "https://via.placeholder.com/150",
      },
      {
        name: "Bridging",
        sets: 3,
        reps: 12,
        duration: "10 mins",
        instructions: "Lift hips while lying down",
        videoUrl: "https://example.com/bridging",
        thumbnail: "https://via.placeholder.com/150",
      },
    ],
    homeAdvice: "Maintain correct posture and do exercises daily",
  },

  // 🔁 FOLLOW UP
  followUp: {
    nextVisitDate: "2026-03-30",
    reviewNotes: "Reassess pain and mobility",
    continueTreatment: true,
    modifications: "Add strengthening exercises",
  },

  // 📋 TEMPLATE
  treatmentTemplates: [
    {
      condition: "Lumbar strain",
      modalities: ["IFT", "Ultrasound"],
      manualTherapy: "Myofascial release",
      exercises: ["Pelvic tilt", "Bridging"],
      duration: "30 mins",
      frequency: "3/week",
    },
  ],
}
export const patients = [physiotherapyFullDummy]