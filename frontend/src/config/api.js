import axios from 'axios';

// 1. Khud detect karega ki app Localhost par chal rahi hai ya Vercel par
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 2. Vercel ke liye Live Backend URL
const LIVE_BACKEND_URL = import.meta.env.VITE_API_URL || 'https://mednexus-hospital-management.onrender.com'; 

// 3. Smart Switcher: Localhost pe local URL, Vercel pe Live URL
const API_URL = isLocalhost ? 'http://localhost:3000' : LIVE_BACKEND_URL;

// ✅ Default settings
axios.defaults.timeout = 10000; // 10 seconds for cron-job optimized backend
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 🔥 THE MAGIC TRICK: AXIOS INTERCEPTOR 🔥
// Ye poore project me jahan bhi 'http://localhost:3000' hardcoded hai, 
// usko background me automatically Live URL se replace kar dega (bina files change kiye!)
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('http://localhost:3000')) {
    config.url = config.url.replace('http://localhost:3000', API_URL);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API_URL;