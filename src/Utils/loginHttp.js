// utils/loginHttp.js
import axios from "axios";

const loginHttp = axios.create({
  baseURL: process.env.REACT_APP_LOGIN_BASE_URL || "https://auth.example.com",
  headers: { "Content-Type": "application/json" }
});

export default loginHttp;
