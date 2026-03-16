import axios from 'axios';

// 🔥 BULLETPROOF TRICK: Check actual browser URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Tumhara Live Render Backend URL
const LIVE_BACKEND_URL = 'https://mednexus-hospital-management.onrender.com';

// Agar local pe ho toh localhost:3000/api chalega, Vercel par ho toh Render chalega.
// (Bina kisi .env variable ke jhanjhat ke!)
const API_BASE_URL = isLocalhost ? 'http://localhost:3000/api' : `${LIVE_BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ INCREASED TO 60 SECONDS (Render ke sone (sleep) ki wajah se ye bohot zaroori hai!)
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request Timeout: Backend so raha tha, time lag gaya.', error.config.url);
      alert("Server is waking up. Please try again in 10 seconds."); // User ko warning
    } else if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========== HOSPITAL APIs ==========
export const hospitalAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/hospitals', { params });
      return response; 
    } catch (error) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      throw error;
    }
  },
  search: (query, city) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (city) params.append('city', city);
    return api.get(`/hospitals/search?${params.toString()}`);
  },
  getNearby: (lat, lng, distance = 5000) => 
    api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&distance=${distance}`),
  getById: (id) => api.get(`/hospitals/${id}`),
  create: (data) => api.post('/hospitals', data),
  update: (id, data) => api.put(`/hospitals/${id}`, data),
  delete: (id) => api.delete(`/hospitals/${id}`)
};

// ========== LABORATORY APIs ==========
export const labAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/labs', { params });
      return response; 
    } catch (error) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      throw error;
    }
  },
  getById: (id) => api.get(`/labs/${id}`),
  create: (data) => api.post('/labs', data),
  update: (id, data) => api.put(`/labs/${id}`, data),
  delete: (id) => api.delete(`/labs/${id}`)
};

// ========== TEST APIs ==========
export const testAPI = {
  getAll: () => api.get('/tests'),
  search: (query) => api.get(`/tests?search=${query}`),
  getByCategory: (category) => api.get(`/tests?category=${category}`),
  getById: (id) => api.get(`/tests/${id}`),
};

// ========== USER APIs ==========
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// ========== REVIEW APIs ==========
export const reviewAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getReviews: (type, id) => api.get(`/reviews/${type}/${id}`),
  checkReview: (type, id) => api.get(`/reviews/check/${type}/${id}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
};

// ========== BOOKING APIs ==========
export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id, reason) => api.delete(`/bookings/${id}`, { data: { reason } }),
};

// ========== FAVORITES APIs ==========
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (type, id) => api.post(`/favorites/${type}/${id}`),
  remove: (type, id) => api.delete(`/favorites/${type}/${id}`)
};

// ========== OWNER APIs ==========
export const ownerAPI = {
  register: (ownerData) => api.post('/owner/register', ownerData),
  getDashboard: () => api.get('/owner/dashboard'),
  getFacility: () => api.get('/owner/facility'),
  updateFacility: (facilityData) => api.put('/owner/facility', facilityData),
  updateTest: (testId, testData) => api.put(`/owner/tests/${testId}`, testData)
};

// ========== APPOINTMENT APIs ==========
export const appointmentAPI = {
  create: (appointmentData) => api.post('/appointments', appointmentData),
  getMyAppointments: () => api.get('/appointments/my-appointments'),
  getFacilityAppointments: () => api.get('/appointments/facility'),
  updateStatus: (id, statusData) => api.put(`/appointments/${id}/status`, statusData),
  cancel: (id) => api.delete(`/appointments/${id}`)
};

// ========== SEARCH HISTORY APIs ==========
export const searchHistoryAPI = {
  save: (searchData) => api.post('/search-history', searchData),
  getAll: () => api.get('/search-history'),
  clear: () => api.delete('/search-history'),
  deleteOne: (id) => api.delete(`/search-history/${id}`)
};

// ========== LOCATION APIs ==========
export const locationAPI = {
  getStates: () => api.get('/locations/states'),
  getDistricts: (state) => api.get(`/locations/districts/${encodeURIComponent(state)}`),
  getCities: (state, district) => api.get(`/locations/cities/${encodeURIComponent(state)}/${encodeURIComponent(district)}`)
};

// ========== SERVICE / PRICE LIST APIs ==========
export const serviceAPI = {
  getServices:   (id) =>             api.get(`/hospitals/${id}/services`),
  addService:    (id, data) =>       api.post(`/hospitals/${id}/services`, data),
  updateService: (id, sid, data) =>  api.put(`/hospitals/${id}/services/${sid}`, data),
  deleteService: (id, sid) =>        api.delete(`/hospitals/${id}/services/${sid}`),
};

export const labServiceAPI = {
  getServices:   (id) =>             api.get(`/labs/${id}/services`),
  addService:    (id, data) =>       api.post(`/labs/${id}/services`, data),
  updateService: (id, sid, data) =>  api.put(`/labs/${id}/services/${sid}`, data),
  deleteService: (id, sid) =>        api.delete(`/labs/${id}/services/${sid}`),
};

export default api;