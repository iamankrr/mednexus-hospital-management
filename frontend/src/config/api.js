import axios from 'axios';

// 1. Detect environment automatically
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 2. Direct Hardcoded Live Backend URL (Vercel dashboard ki zaroorat nahi)
const LIVE_BACKEND_URL = 'https://mednexus-hospital-management.onrender.com'; 

// 3. Smart Switcher: Agar local hai toh localhost, warna Render URL
const API_URL = isLocalhost ? 'http://localhost:3000' : LIVE_BACKEND_URL;

// Global Settings
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor (to catch any missed hardcoded localhost strings)
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('http://localhost:3000')) {
    config.url = config.url.replace('http://localhost:3000', API_URL);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API_URL;