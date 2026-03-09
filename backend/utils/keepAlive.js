const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Ping server every 10 minutes to prevent cold start
setInterval(async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Keep-alive ping successful:', response.status);
  } catch (error) {
    console.log('⚠️ Keep-alive ping failed:', error.message);
  }
}, 10 * 60 * 1000); // 10 minutes

console.log('🔄 Keep-alive service started');

module.exports = {};