import axios from "axios"
import { wifiUrl } from "../../../baseUrl"

const API = "http://localhost:5000/api"

export const getAssignedPatients = (therapistId) =>
  axios.get(`${API}/therapist/assigned/${therapistId}`)

export const getSessions = (therapistId, type) =>
  axios.get(`${API}/therapist/sessions/${therapistId}?type=${type}`)

export const updateSession = (data) =>
  axios.post(`${API}/therapist/session/update`, data)

export const uploadMedia = (formData) =>
  axios.post(`${API}/therapist/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  


// export const getQuestionsByKey = async (parts) => {
//   console.log("parts", parts);

//   try {

//     const res = await axios.get(
//       `${wifiUrl}/api/customer/physiotherapy/questions/getByKey`,
//       {
//         params: {
//           keys: parts,
//         },
//         paramsSerializer: (params) => {
//           const searchParams = new URLSearchParams();

//           params.keys.forEach((k) => {
//             searchParams.append("keys", k);
//           });

//           return searchParams.toString();
//         },
//       }
//     );

//     console.log("res", res.data);

//     return res.data;

//   } catch (err) {
//     console.log("API error", err);
//     throw err;
//   }
// };

export const getQuestionsByKey = async (parts) => {
   console.log("parts", parts);
  try {
    const res = await axios.post(
      `${wifiUrl}/api/customer/physiotherapy/questions/getByKey`,
      {
        keys: parts
      }
    );

    return res.data;
  } catch (err) {
    console.error(err);
  }
};