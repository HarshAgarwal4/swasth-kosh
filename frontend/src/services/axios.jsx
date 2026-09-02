import axios from 'axios';

const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:4000";

export default axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});