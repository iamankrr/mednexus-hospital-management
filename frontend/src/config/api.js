import axios from 'axios';

// 1. Khud detect karega ki app Localhost par chal rahi hai ya Vercel par
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 2. Vercel ke liye Live Backend URL (Tumhara Render ka live link yahan set hai)
const LIVE_BACKEND_URL = import.meta.env.VITE_API_URL || 'https://mednexus-hospital-management.onrender.com'; 

// 3. Smart Switcher: Localhost pe local URL, Vercel pe Live URL
const API_URL = isLocalhost ? 'http://localhost:3000' : LIVE_BACKEND_URL;

// ✅ Add default timeout
axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default API_URL;