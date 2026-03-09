const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ✅ Add default timeout
import axios from 'axios';

axios.defaults.timeout = 10000; // 10 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default API_URL;