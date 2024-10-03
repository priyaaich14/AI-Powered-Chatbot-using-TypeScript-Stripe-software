// import axios from 'axios';

// // Base API configuration
// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export default api;


import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to the request header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
