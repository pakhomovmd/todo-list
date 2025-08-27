// src/api/api.js
import axios from "axios";

export const API = axios.create({
  baseURL: "http://127.0.0.1:8000/", // твой FastAPI адрес
});

export const loginApi = async ({ username, password }) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  return API.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

